/* eslint-disable */
"use client";

import React, { useState } from "react";
import useSWR, { SWRConfig } from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface EthPriceData {
    time: string;
    price: number;
}

let ethPriceHistory: EthPriceData[] = [];

const fetchETHData = async () => {
    const historyResponse = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=7`);
    const historyData = await historyResponse.json();

    const response = await fetch(`https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${process.env.GAS_API_KEY}`);
    const currentData = await response.json();

    const historicalPoints = historyData.prices.map((entry: [number, number]) => ({
        time: new Date(entry[0]).toLocaleDateString("en-GB"),
        price: entry[1],
    }));

    if (currentData && currentData.result) {
        const newDataPoint: EthPriceData = {
            time: new Date(currentData.result.ethusd_timestamp * 1000).toLocaleDateString("en-GB"),
            price: parseFloat(currentData.result.ethusd),
        };
        ethPriceHistory = [...historicalPoints, newDataPoint];
    }

    return ethPriceHistory;
};

function ETHMarketAnalysisCard() {
    const [interval, setInterval] = useState("daily");
    const { data, error, isLoading } = useSWR('/eth-market', fetchETHData, {
        refreshInterval: 86400000
    });

    if (error) return <div className="text-red-500 p-4">Unable to load ETH price data</div>;
    if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
    if (!data || data.length === 0) return <div className="text-gray-500 p-4">No data available to display</div>;

    const chartData = {
        labels: data.map((point) => point.time),
        datasets: [
            {
                label: "ETH Price (USD)",
                data: data.map((point) => point.price),
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
                text: "Ethereum (ETH) Value Chart by Day",
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
                    text: "ETH Price (USD)",
                },
            },
        },
    };

    return (
        <Card className="w-full bg-white shadow-xl overflow-hidden h-full">
            <CardHeader className="space-y-4">
                <CardTitle className="text-2xl font-bold text-gray-900">Ethereum (ETH) Market Analysis</CardTitle>
                <CardDescription className="text-gray-500">ETH price statistics by day</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-6 overflow-x-auto">
                <div className="h-[500px] w-full min-w-[600px]">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </CardContent>
        </Card>
    );
}

export default function ETHMarketAnalysisCardWithProvider() {
    return (
        <SWRConfig value={{ refreshInterval: 86400000 }}>
            <ETHMarketAnalysisCard />
        </SWRConfig>
    );
}
