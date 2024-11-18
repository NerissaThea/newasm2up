"use client"
import { useMemo, useEffect, useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Loader2 } from "lucide-react"

interface GasPrediction {
    timestamp: number;
    predictedFee: number;
    formattedTime?: string;
}

interface APIResponse {
    predictions: GasPrediction[];
    currentGas: number;
    bestTimeSlot?: {
        timestamp: number;
        predictedFee: number;
    }
}
const fetcher = async (url: string) => {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const fullUrl = `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;

        console.log('Fetching from:', fullUrl); // Log full URL

        const res = await fetch(fullUrl);
        if (!res.ok) {
            // Nếu không thành công, log thêm thông tin phản hồi
            const errorText = await res.text();
            throw new Error(`Failed to fetch data. Status: ${res.status}, Response: ${errorText}`);
        }
        return res.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}




const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export default function GasPrediction() {
    const [formattedData, setFormattedData] = useState<GasPrediction[]>([]);

    const { data, error, isLoading } = useSWR<APIResponse>(
        'dashboard/api/predictions/route',
        fetcher,
        {
            refreshInterval: 30000,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 30000
        }
    )

    const formattedDataMemo = useMemo(() => {
        if (!data?.predictions) return []

        return data.predictions.map((p: GasPrediction) => ({
            timestamp: p.timestamp,
            formattedTime: formatTime(p.timestamp),
            predictedFee: Number(p.predictedFee.toFixed(2))
        }))
    }, [data?.predictions])

    useEffect(() => {
        setFormattedData(formattedDataMemo);
    }, [formattedDataMemo]);

    useEffect(() => {
        if (error) {
            console.error('API Error:', error);
        }
    }, [error]);

    useEffect(() => {
        if (data?.currentGas) {
            const currentTime = new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(2, '0');
            const updatedPredictions = formattedDataMemo.map(p => {
                if (p.formattedTime === currentTime) {
                    return {
                        ...p,
                        predictedFee: data.currentGas
                    };
                }
                return p;
            });
            setFormattedData(updatedPredictions);
        }
    }, [data?.currentGas, formattedDataMemo]);

    const renderChartData = () => {
        if (!formattedData.length) return null;

        return (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">
                    Forecast details: </h3>
                <div className="space-y-2">
                    {formattedData.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{item.formattedTime}</span>
                            <span className="font-medium text-blue-600">{item.predictedFee.toFixed(2)} Gwei</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (error) {
        return (
            <Card className="w-full h-full">
                <CardContent className="flex items-center justify-center h-full">
                    <div className="text-red-500 flex items-center justify-center">
                        Unable to load gas fee forecast
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isLoading || !data) {
        return (
            <Card className="w-full h-full">
                <CardContent className="lex items-center justify-center h-full">
                    <div className="flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full h-full bg-white">
            <CardHeader>
                <CardTitle className='text-black'>Gas Prediction</CardTitle>
                <CardDescription className='text-black'>Gas Prediction in the next 6 hours</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col h-full p-4 overflow-auto">

                {renderChartData()}

                <div className="mt-6 p-4 bg-blue-50 rounded-lg ">
                    <div className="flex items-center gap-2 text-blue-700">
                        <Clock className="h-5 w-5" />
                        <span className="font-medium">
                            Recommended publishing best trading times:
                        </span>
                    </div>
                    <div className="mt-2">
                        <span className="text-gray-600">
                            {data.bestTimeSlot?.timestamp ?
                                `${formatTime(data.bestTimeSlot.timestamp)} (${data.bestTimeSlot.predictedFee.toFixed(2)} Gwei)` :
                                'Updating...'
                            }
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
