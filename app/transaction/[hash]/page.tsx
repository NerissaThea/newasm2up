import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation' // Correct use of useParams in Next.js
import Link from 'next/link'
import { CheckCircle, AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

interface Transaction {
  'Transaction Hash': string
  'Status': string
  'Block': number
  'Timestamp': string
  'From': string
  'Interacted With (To)': string
  'Value': string
  'Transaction Fee': string
  'Gas Used': string
  'Gas Price': string
  'Gas_Metrics': {
    gasUsed: number
    gasLimit: number
    gasPrice: string
    avgGasPrice: number
    gasEfficiency: string
    priceDifference: string
    riskScore: string
  }
}

interface EthereumData {
  jcoPrice: number
  jcoChange: number
  gasPrice: number
}

interface StateChange {
  address: string
  before: string
  after: string
  difference: string
}

export default function TransactionPage() {
  const params = useParams();
  const hash = params?.hash as string | undefined;
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ethereumData, setEthereumData] = useState<EthereumData>({
    jcoPrice: 0,
    jcoChange: 0,
    gasPrice: 0
  })
  const [activeView, setActiveView] = useState<'overview' | 'state'>('overview')
  const [stateChanges, setStateChanges] = useState<StateChange[]>([])
  const [stateLoading, setStateLoading] = useState(false)
  const [stateError, setStateError] = useState<string | null>(null)

  // Fetch transaction details
  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!hash) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transaction_detail/${hash}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Transaction not found');
          }
          throw new Error('Failed to fetch transaction details');
        }
        
        const data = await response.json();
        if (!data) {
          throw new Error('No transaction data received');
        }
        
        setTransaction(data);
      } catch (err) {
        console.error('Error fetching transaction:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [hash]);

  // Fetch Ethereum data
  useEffect(() => {
    const fetchEthereumData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ethereum_data`);
        if (!response.ok) throw new Error('Failed to fetch Ethereum data');
        const data = await response.json();
        setEthereumData({
          jcoPrice: parseFloat(data.jcoPrice) || 0,
          jcoChange: parseFloat(data.jcoChange) || 0,
          gasPrice: parseFloat(data.gasPrice) || 0,
        });
      } catch (error) {
        console.error('Error fetching Ethereum data:', error);
      }
    };

    fetchEthereumData();
    const interval = setInterval(fetchEthereumData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch state changes based on the active view
  useEffect(() => {
    const fetchStateChanges = async () => {
      if (activeView !== 'state' || !hash) return;
      
      setStateLoading(true);
      setStateError(null);
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transaction/${hash}/state`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch state changes');
        }
        const data = await response.json();
        setStateChanges(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching state changes:', error);
        setStateError(error instanceof Error ? error.message : 'Failed to fetch state changes. Please try again later.');
      } finally {
        setStateLoading(false);
      }
    };

    fetchStateChanges();
  }, [hash, activeView]);

  // Handling loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1C2128] p-8">
        <div className="container mx-auto">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Handling error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#1C2128] flex items-center justify-center">
        <Card className="w-full max-w-lg p-6">
          <div className="text-center space-y-4">
            <X className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="text-xl font-semibold">Transaction Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button asChild>
              <Link href="/transaction">Back to Transactions</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // If no transaction found
  if (!transaction) {
    return (
      <div className="min-h-screen bg-[#1C2128] flex items-center justify-center">
        <Card className="w-full max-w-lg p-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
            <h2 className="text-xl font-semibold">Transaction Not Found</h2>
            <p className="text-muted-foreground">The requested transaction could not be found.</p>
            <Button asChild>
              <Link href="/transaction">Back to Transactions</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Render transaction overview
  const renderOverview = () => {
    if (!transaction) return null;
    
    function getGasRiskLevel(riskScore: string): string {
        // Convert the riskScore to a numeric value (if it's a string)
        const score = parseFloat(riskScore);
      
        // Define risk levels based on score
        if (score >= 80) {
          return 'High';
        } else if (score >= 50) {
          return 'Medium';
        } else {
          return 'Low';
        }
      }

    const gasRisk = transaction.Gas_Metrics ? 
      getGasRiskLevel(transaction.Gas_Metrics.riskScore) : 'Low';

    return (
      <Card className="bg-white text-gray-800 rounded-lg p-6">
        <div className="space-y-4">
          {/* Your transaction details rendering code here */}
        </div>
      </Card>
    )
  }

  return (
    <div className="bg-[#1C2128] min-h-screen text-white">
      <main className="container mx-auto px-4 py-8">
        {/* Your page rendering and components go here */}
      </main>
    </div>
  );
}
