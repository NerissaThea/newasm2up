"use client";

import React from "react";
import useSWR, { SWRConfig } from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table1";
import { Loader2 } from "lucide-react";

// Define the type for the Transaction object
interface Transaction {
    rank: number;
    address: string;
    totalEth: number;
}

// Define the type for API response transactions
interface APITx {
    from: string;
    value: string;
}

// Define the API response structure
interface APIResponse {
    status: string;
    message: string;
    result: APITx[];
}

// Function to fetch transaction data from the API
const fetchTransactions = async (): Promise<Transaction[]> => {
    const address = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"; // Ethereum address with many transactions
    const response = await fetch(
        `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.NEXT_PUBLIC_API_KEY}`
    );
    const data: APIResponse = await response.json();

    // Check the status and error message
    if (data.status === "0") {
        console.error("Error fetching transactions:", data.message);
        return [];
    }

    // Convert data into an array of intermediate objects
    const transactions = data.result.map((tx: APITx) => ({
        address: tx.from, // Get the 'from' address
        totalEth: tx.value ? parseFloat(tx.value) / 1e18 : 0, // Convert value from Wei to ETH
    }));

    // Sort and get the top 10 largest transactions, then add rank
    const sortedTransactions: Transaction[] = transactions
        .sort((a, b) => b.totalEth - a.totalEth)
        .slice(0, 10)
        .map((tx, index) => ({
            ...tx,
            rank: index + 1, // Add rank for each transaction
        }));

    return sortedTransactions;
};

function TopTransactionsCard() {
    const { data, error, isLoading } = useSWR('/top-transactions', fetchTransactions, {
        refreshInterval: 86400000, // Update every 24 hours
    });

    // Handle error and loading states
    if (error) return <div className="text-red-500 p-4">Unable to load transaction data</div>;
    if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
    if (!data || data.length === 0) return <div className="text-gray-500 p-4">No data to display</div>;

    return (
        <Card className="w-full bg-white shadow-xl h-[650px]">
            <CardHeader className="space-y-4">
                <CardTitle className="text-2xl font-bold text-gray-900">Largest Transactions</CardTitle>
                <CardDescription className="text-gray-500">List of the largest transactions by value</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-20 overflow-y-auto overflow-x-auto h-[600px]">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Rank</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Total ETH</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody className="text-black">
                        {data.map((transaction: Transaction) => (
                            <TableRow key={transaction.address}>
                                <TableCell>{transaction.rank}</TableCell>
                                <TableCell>{transaction.address}</TableCell>
                                <TableCell>{transaction.totalEth !== undefined ? transaction.totalEth.toFixed(6) : 'N/A'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

// Export component wrapped with SWRConfig
export default function TopTransactionsCardWithProvider() {
    return (
        <SWRConfig value={{ refreshInterval: 86400000 }}> {/* Update every 24 hours */}
            <TopTransactionsCard />
        </SWRConfig>
    );
}
