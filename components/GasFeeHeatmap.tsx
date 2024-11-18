"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { Loader2 } from "lucide-react";

// Define the type for the HeatMap data
type HeatMapData = {
    fee: number;
    hour?: number;
    day?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const HeatMap = ({ data }: { data: HeatMapData[] }) => {
    if (!data || !Array.isArray(data)) {
        return null;
    }

    const maxFee = Math.max(...data.map((d) => d.fee));
    const minFee = Math.min(...data.map((d) => d.fee));

    const yAxisValues = [
        maxFee,
        Math.ceil((maxFee + minFee) / 2),
        minFee,
    ];

    return (
        <div className="relative h-[500px] w-full pl-32 pr-4 pt-4">
            {/* Grid lines */}
            <div className="absolute inset-0 bottom-20 left-28 flex flex-col justify-between pointer-events-none">
                {yAxisValues.map((value, index) => (
                    <div key={index} className="relative w-full">
                        <div
                            className="absolute left-0 right-0 h-[1px]"
                            style={{
                                backgroundColor: "rgb(229, 231, 235)",
                                top: index === 0 ? "0" : index === 1 ? "50%" : "100%",
                            }}
                        ></div>
                    </div>
                ))}
            </div>

            {/* Y-axis */}
            <div className="absolute left-0 top-0 bottom-20 flex flex-col justify-between text-sm">
                {yAxisValues.map((value, index) => (
                    <div key={index} className="flex items-center">
                        <span className="text-gray-600 min-w-[90px] text-right pr-4">
                            {value.toFixed(1)} Gwei
                        </span>
                    </div>
                ))}
            </div>

            {/* X-axis */}
            <div className="absolute bottom-0 left-28 right-4 flex justify-between text-sm">
                {data.map((item, index) => (
                    <div key={index} className="flex flex-col items-center w-full">
                        <div className="h-4 w-[1px] bg-gray-200"></div>
                        <div className="mt-4 text-gray-500">
                            {item.hour !== undefined
                                ? item.hour % 3 === 0 || item.hour === 23
                                    ? `${String(item.hour).padStart(2, "0")}:00`
                                    : ""
                                : item.day}
                        </div>
                    </div>
                ))}
            </div>

            {/* Columns */}
            <div className="absolute inset-0 bottom-20 left-28 flex items-end">
                {data.map((item, index) => {
                    const normalizedFee = (item.fee - minFee) / (maxFee - minFee);
                    const height = Math.max(5, normalizedFee * 100);

                    return (
                        <div
                            key={index}
                            className="flex-1 h-full flex items-end px-[2px] group"
                        >
                            <div
                                className="w-full transition-all duration-300 hover:opacity-80 relative"
                                style={{
                                    height: `${height}%`,
                                    backgroundColor: "rgb(239, 246, 255)",
                                    border: "1px solid rgb(96, 165, 250)",
                                    borderRadius: "0px",
                                }}
                            >
                                {/* Tooltip */}
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-16 left-1/2 -translate-x-1/2 bg-white text-gray-800 px-3 py-2 rounded-md text-sm whitespace-nowrap z-10 shadow-sm border border-gray-200">
                                    <div className="text-gray-600">
                                        {item.hour !== undefined
                                            ? `${item.hour}:00`
                                            : item.day}
                                    </div>
                                    <div className="font-medium">{item.fee} Gwei</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default function GasFeeHeatmap() {
    const [isHourly, setIsHourly] = useState(true);
    const { data, error, isLoading } = useSWR(
        "dashboard/api/gas-fees/heatmap",
        fetcher,
        {
            refreshInterval: 60000,
        }
    );

    if (error)
        return (
            <Card className="w-full ">
                <CardContent className="p-6">
                    <div className="text-red-500 flex items-center justify-center">
                        Failed to load gas fee data
                    </div>
                </CardContent>
            </Card>
        );

    if (isLoading || !data)
        return (
            <Card className="w-full max-w-5xl">
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                </CardContent>
            </Card>
        );

    const chartData = isHourly ? data.hourlyData : data.weeklyData;

    return (
        <Card className="w-full bg-white">
            <CardHeader>
                <CardTitle className="text-black">Gas Fee Heatmap</CardTitle>
                <CardDescription>
                    {isHourly
                        ? "Gas fee statistics by hour"
                        : "Gas fee statistics by day"}
                </CardDescription>
                <div className="flex items-center justify-between mt-4">
                    <Toggle
                        className="text-black"
                        pressed={isHourly}
                        onPressedChange={setIsHourly}
                    >
                        {isHourly ? "View by day" : "View by hour"}
                    </Toggle>
                    <div className="text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
                        Current Gas Price:{" "}
                        <span className="font-bold">{data.currentGasPrice} Gwei</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <HeatMap data={chartData} />
            </CardContent>
        </Card>
    );
}
