'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

type Transaction = {
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  hash?: string;
  block?: string;
  fee?: string;
  method?: string;
};

interface HistoryTableProps {
  address: string;
}

export default function HistoryTable({ address }: HistoryTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch transactions from API
  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://nhiapi.vercel.app/api/transactions?address=${address}`);
      const data = await response.json();

      if (response.ok && data.transactions) {
        setTransactions(data.transactions);
        setTotalPages(Math.ceil(data.transactions.length / 50)); // 50 items per page
      } else {
        toast({
          title: "Error fetching transactions",
          description: data.message || "Failed to fetch data from API.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions from API.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // Fetch data when component mounts
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const truncateAddress = (address: string) =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Invalid Address";

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp * 1000;

    if (diff < 0) return "Just now";

    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds} secs ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hrs ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        <h1 className="text-xl mb-4">Transaction History</h1>

        {isLoading ? (
          <p className="text-center">Loading transactions...</p>
        ) : transactions.length > 0 ? (
          <>
            <Table className="w-full border rounded-lg">
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction Hash</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Link href={`/transaction/${tx.hash}`}>
                        <span className="text-blue-500 cursor-pointer hover:underline">
                          {truncateAddress(tx.hash || "")}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>{truncateAddress(tx.from)}</TableCell>
                    <TableCell>{truncateAddress(tx.to)}</TableCell>
                    <TableCell>{tx.amount.toFixed(6)} ETH</TableCell>
                    <TableCell>{getRelativeTime(tx.timestamp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft /> Previous
              </Button>
              <p>
                Page {currentPage} of {totalPages}
              </p>
              <Button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight />
              </Button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-400">No transactions found</p>
        )}
      </div>
    </div>
  );
}
