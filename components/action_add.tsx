"use client";

import React from "react";
import useSWR, { SWRConfig } from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

// Define the type for Transaction
interface Transaction {
    from: string;
    to: string;
}

// Fetch daily active wallets data from Infura
const fetchDailyActiveWallets = async () => {
    const INFURA_PROJECT_ID = process.env.NEXT_PUBLIC_INFURA_API_KEY;
    const INFURA_URL = `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`;

    // Fetch the current block number from Infura
    const currentBlockResponse = await fetch(INFURA_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_blockNumber",
            params: [],
            id: 1,
        }),
    });

    const currentBlockData = await currentBlockResponse.json();
    const currentBlockNumber = parseInt(currentBlockData.result, 16);

    // Object to store daily active wallets
    const dailyActiveWallets: { [date: string]: Set<string> } = {};

    // Function to fetch transactions from blocks
    const fetchTransactionsByBlockNumber = async (blockNumber: string) => {
        const response = await fetch(INFURA_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_getBlockByNumber",
                params: [blockNumber, true],
                id: 1,
            }),
        });

        const data = await response.json();
        return data.result?.transactions || [];
    };

    // Example of fetching data for the past 7 days (roughly 7 * ~7200 blocks)
    const blocksPerDay = 7200;
    for (let i = 0; i < 7; i++) {
        const blockNumberHex = `0x${(currentBlockNumber - i * blocksPerDay).toString(16)}`;
        const transactions = await fetchTransactionsByBlockNumber(blockNumberHex);

        // Create date from current block number
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        if (!dailyActiveWallets[date]) {
            dailyActiveWallets[date] = new Set();
        }

        transactions.forEach((transaction: Transaction) => {
            dailyActiveWallets[date].add(transaction.from);
            dailyActiveWallets[date].add(transaction.to);
        });
    }

    // Convert data into an array for use in the chart
    const chartData = Object.entries(dailyActiveWallets).map(([date, walletSet]) => ({
        date,
        activeWallets: walletSet.size,
    }));

    console.log(chartData); // Check the returned data
    return chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date
};

// Main component to display the number of active wallets and a bar chart
function ActiveWalletsChart() {
    const { data, error, isLoading } = useSWR('/daily-active-wallets', fetchDailyActiveWallets, {
        refreshInterval: 86400000, // Refresh every 24 hours
        revalidateOnFocus: false, // Prevent refresh when switching tabs
        revalidateOnReconnect: false, // Prevent refresh when reconnecting
        dedupingInterval: 86400000, // Ensure no duplicate calls for the same data within 24 hours
    });

    if (error) return <div className="text-red-500 p-4">Unable to load active wallet data: {error.message}</div>;
    if (isLoading) return <div className="flex items-center justify-center p-8 bg-[#E8E2DB]"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;

    const dailyData = Array.isArray(data) ? data : [];

    // Data for the bar chart
    const labels = dailyData.map(entry => entry.date);
    const activeWalletCounts = dailyData.map(entry => entry.activeWallets);

    const chartData = {
        labels,
        datasets: [{
            label: 'Number of Active Wallets',
            data: activeWalletCounts,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
        }],
    };

    return (
        <Card className="bg-white w-full h-full shadow-xl">
            <CardHeader className="space-y-4">
                <CardTitle className="text-2xl font-bold text-gray-900">Active Wallets Count for the Last 7 Days</CardTitle>
                <CardDescription className="text-gray-500">Track the number of Ethereum sending and receiving wallets daily over the past week.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
                <div className="h-[500px] w-full">
                    <Bar
                        data={chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: 'Number of Active Wallets',
                                    },
                                },
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Date',
                                    },
                                },
                            },
                        }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

// Export component wrapped with SWRConfig
export default function ActiveWalletsChartWithProvider() {
    return (
        <SWRConfig value={{ refreshInterval: 86400000, dedupingInterval: 86400000 }}>
            <ActiveWalletsChart />
        </SWRConfig>
    );
}