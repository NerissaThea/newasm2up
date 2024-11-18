"use client";

import React from "react";
import useSWR, { SWRConfig } from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Define type for data returned from Infura
interface TransactionData {
    time: string;
    count: number;
}

// Fetch daily transaction volume data from Infura
const fetchDailyTransactionVolume = async () => {
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

    // Object to store daily transaction counts
    const dailyTransactionCounts: { [date: string]: number } = {};

    // Function to fetch transactions by block number
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

    // Example: Fetch data from the past 7 days (about 7 * ~7200 blocks)
    const blocksPerDay = 7200;
    for (let i = 0; i < 7; i++) {
        const blockNumberHex = `0x${(currentBlockNumber - i * blocksPerDay).toString(16)}`;
        const transactions = await fetchTransactionsByBlockNumber(blockNumberHex);

        // Create date from current block number
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        if (!dailyTransactionCounts[date]) {
            dailyTransactionCounts[date] = 0;
        }

        // Update daily transaction count
        dailyTransactionCounts[date] += transactions.length;
    }

    // Convert data to array for the chart
    const chartData = Object.entries(dailyTransactionCounts).map(([date, count]) => ({
        time: date,
        count,
    }));

    console.log(chartData); // Check the returned data
    return chartData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()); // Sort by date
};

// Main component to display the chart
function ETHTransactionVolumeCard() {
    const { data, error, isLoading } = useSWR('/eth-transaction-volume', fetchDailyTransactionVolume, {
        refreshInterval: 86400000, // Refresh every 24 hours
    });

    if (error) return <div className="text-red-500 p-4">Unable to load transaction volume data: {error.message}</div>;
    if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
    if (!data || data.length === 0) return <div className="text-gray-500 p-4">No data to display</div>;

    // Prepare data for the chart
    const chartData = {
        labels: data.map((point: TransactionData) => point.time),
        datasets: [
            {
                label: "Ethereum Transaction Volume",
                data: data.map((point: TransactionData) => point.count),
                borderColor: "#3B82F6",
                backgroundColor: "rgba(59, 130, 246, 0.5)",
                fill: false,
                pointRadius: 2, // Point size when not hovering
                pointHoverRadius: 5, // Point size when hovering
                pointBackgroundColor: "rgba(59, 130, 246, 0.5)", // Point color when not hovering
                pointHoverBackgroundColor: "#FFFFFF", // Point color when hovering
                pointBorderColor: "rgba(59, 130, 246, 0.5)", // Point border color when not hovering
                pointHoverBorderColor: "#3B82F6", // Point border color when hovering
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: "Ethereum Transaction Volume by Day",
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Date",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Transaction Volume",
                },
            },
        },
    };

    return (
        <Card className="w-full bg-white shadow-xl">
            <CardHeader className="space-y-4">
                <CardTitle className="text-2xl font-bold text-gray-900">Ethereum Transaction Volume Analysis</CardTitle>
                <CardDescription className="text-gray-500">Daily transaction volume statistics</CardDescription>
            </CardHeader>
            <CardContent className="h-[600px]">
                <div className="w-full h-full">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </CardContent>
        </Card>
    );
}

// Export the component wrapped in SWRConfig
export default function ETHTransactionVolumeCardWithProvider() {
    return (
        <SWRConfig value={{ refreshInterval: 86400000 }}> {/* Refresh every 24 hours */}
            <ETHTransactionVolumeCard />
        </SWRConfig>
    );
}
