'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
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
          <div className="flex justify-between items-start gap-2 pb-4 border-b border-gray-200">
            <span className="text-gray-600">Transaction Hash:</span>
            <span className="text-blue-600 break-all">{transaction["Transaction Hash"]}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <span className="text-gray-600">Status:</span>
            <span className="flex items-center text-green-600">
              {transaction.Status === 'Success' ? (
                <CheckCircle className="mr-1" size={16} />
              ) : (
                <X className="mr-1" size={16} />
              )}
              {transaction.Status}
            </span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <span className="text-gray-600">Block:</span>
            <span>{transaction.Block}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <span className="text-gray-600">Timestamp:</span>
            <span>{transaction.Timestamp}</span>
          </div>
          <div className="flex justify-between items-start gap-2 pb-4 border-b border-gray-200">
            <span className="text-gray-600">From:</span>
            <Link href={`/address/${transaction.From}`} className="text-blue-600 break-all">
              {transaction.From}
            </Link>
          </div>
          <div className="flex justify-between items-start gap-2 pb-4 border-b border-gray-200">
            <span className="text-gray-600">Interacted With (To):</span>
            <Link href={`/address/${transaction["Interacted With (To)"]}`} className="text-blue-600 break-all">
              {transaction["Interacted With (To)"]}
            </Link>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <span className="text-gray-600">Value:</span>
            <span>{transaction.Value}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <span className="text-gray-600">Transaction Fee:</span>
            <span>{transaction["Transaction Fee"]}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <span className="text-gray-600">Gas Used:</span>
            <span>{transaction["Gas Used"]}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <span className="text-gray-600">Gas Price:</span>
            <span>{transaction["Gas Price"]}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <span className="text-gray-600">Gas Risk:</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge
                    variant="outline"
                    className={`
                      ${gasRisk === 'Low' ? 'bg-green-100 text-green-800' : ''}
                      ${gasRisk === 'Medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${gasRisk === 'High' ? 'bg-red-100 text-red-800' : ''}
                    `}
                  >
                    {gasRisk}
                    {gasRisk !== 'Low' && <AlertTriangle className="ml-1 inline-block" size={14} />}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Gas risk indicates the likelihood of transaction failure due to insufficient gas.</p>
                  {transaction.Gas_Metrics && (
                    <div className="mt-2 text-sm">
                      <div>Efficiency: {transaction.Gas_Metrics.gasEfficiency}</div>
                      <div>Price Difference: {transaction.Gas_Metrics.priceDifference}</div>
                      <div>Risk Score: {transaction.Gas_Metrics.riskScore}</div>
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <span className="text-gray-600">Private Note:</span>
            <span className="text-gray-500 italic">To access the Private Note feature, you must be Logged in.</span>
          </div>
        </div>
      </Card>
    )
  }


  const renderStateChanges = () => (
    <Card className="bg-[#F0F0F0] text-gray-800 rounded-lg overflow-hidden border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-2">
          <div className="text-sm text-gray-600 mb-4">
            A set of information that represents the current <span className="font-semibold">state</span> is updated when a transaction takes place on the network. Below is a summary of those changes:
          </div>
          {stateLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : stateError ? (
            <div className="py-8 text-center text-red-500">{stateError}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left border-b border-gray-300">
                    <th className="pb-2">Address</th>
                    <th className="pb-2">Before</th>
                    <th className="pb-2">After</th>
                    <th className="pb-2">State Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {stateChanges.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-3 text-center text-gray-500">No state changes found</td>
                    </tr>
                  ) : (
                    stateChanges.map((change, index) => (
                      <tr key={index} className="border-b border-gray-300">
                        <td className="py-2 break-all">
                          <Link href={`/address/${change.address}`} className="text-blue-600 hover:underline">
                            {change.address}
                          </Link>
                        </td>
                        <td className="py-2">{change.before}</td>
                        <td className="py-2">{change.after}</td>
                        <td className="py-2">{change.difference}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="bg-[#1C2128] min-h-screen text-white">
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Transaction details</h1>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 uppercase">
              ETH
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              <span className="text-[#00FF00]">JCO: </span>
              <span className="text-white">
                ${ethereumData.jcoPrice.toFixed(2)} ({ethereumData.jcoChange > 0 ? '+' : ''}{ethereumData.jcoChange.toFixed(2)}%)
              </span>
            </span>
            <span className="text-sm">
              <span className="text-gray-400">Gas: </span>
              <span className="text-white">{ethereumData.gasPrice.toFixed(3)} Gwei</span>
            </span>
            
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          <Button
            onClick={() => setActiveView('overview')}
            className={`${activeView === 'overview' ? 'bg-orange-800 text-white hover:bg-orange-600' : 'bg-orange-500 text-white hover:bg-orange-800'}`}
          >
            Overview
          </Button>
          <Button
            onClick={() => setActiveView('state')}
            className={`${activeView === 'state' ? 'bg-yellow-800 text-white hover:bg-yellow-600' : 'bg-yellow-500 text-white hover:bg-yellow-800'}`}
          >
            State
          </Button>
        </div>

        {activeView === 'overview' ? renderOverview() : renderStateChanges()}
      </main>
    </div>
  );
}
