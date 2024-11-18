"use client";

import React from "react";
import useSWR, { SWRConfig } from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Define the data type for each ETH transaction volume data point
interface EthVolumeData {
    time: string;
    volume: number;
}

// Function to fetch ETH transaction volume data from the API
const fetchETHVolumeData = async (): Promise<EthVolumeData[]> => {
    // Fetch historical data for the past week, including volume
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=7`);
    const data = await response.json();

    // Convert volume data into EthVolumeData format
    const volumePoints: EthVolumeData[] = data.total_volumes.map((entry: [number, number]) => ({
        time: new Date(entry[0]).toLocaleDateString("en-GB"), // Date format dd/mm
        volume: entry[1],
    }));

    return volumePoints;
};

// Main component to display the transaction volume chart
function ETHVolumeAnalysisCard() {
    const { data, error, isLoading } = useSWR('/eth-volume', fetchETHVolumeData, {
        refreshInterval: 86400000 // Update every 24 hours
    });

    if (error) return <div className="text-red-500 p-4">Failed to load ETH transaction volume data</div>;
    if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
    if (!data || data.length === 0) return <div className="text-gray-500 p-4">No data available to display</div>;

    // Prepare data for the chart
    const chartData = {
        labels: data.map((point: EthVolumeData) => point.time),
        datasets: [
            {
                label: "ETH Transaction Volume (USD)",
                data: data.map((point: EthVolumeData) => point.volume),
                borderColor: "#3B82F6",
                backgroundColor: "rgba(59, 130, 246, 0.5)",
                fill: false,
                pointRadius: 2,
                pointHoverRadius: 5,
                pointBackgroundColor: "rgba(59, 130, 246, 0.5)",
                pointHoverBackgroundColor: "#FFFFF",
                pointBorderColor: "rgba(59, 130, 246, 0.5)",
                pointHoverBorderColor: "#3B82F6",
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
                text: "Ethereum (ETH) Transaction Volume Chart by Day",
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
                    text: "ETH Transaction Volume (USD)",
                },
            },
        },
    };

    return (
        <Card className="w-full bg-white shadow-xl overflow-hidden">
            <CardHeader className="space-y-4">
                <CardTitle className="text-2xl font-bold text-gray-900">Ethereum (ETH) Transaction Volume Analysis</CardTitle>
                <CardDescription className="text-gray-500">ETH transaction volume statistics by day</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-20">
                <div className="h-[500px] w-full">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </CardContent>
        </Card>
    );
}

// Export component wrapped in SWRConfig
export default function ETHVolumeAnalysisCardWithProvider() {
    return (
        <SWRConfig value={{ refreshInterval: 86400000 }}>
            <ETHVolumeAnalysisCard />
        </SWRConfig>
    );
}