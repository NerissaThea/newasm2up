"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartOptions // Ensure this import is added
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

type WalletFlowData = {
    inflow: number[]
    outflow: number[]
    timestamps: string[]
    totalInflow: number
    totalOutflow: number
    currentBalance: number
}

const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: {
                    size: 12
                }
            }
        },
        title: {
            display: true,
            text: 'Global Wallet Flow Analysis',
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Amount (ETH)',
                font: {
                    size: 12
                }
            },
            ticks: {
                callback: (value: number | string) => `${Number(value).toLocaleString()} ETH`,
            },
        },
        x: {
            title: {
                display: true,
                text: 'Date',
                font: {
                    size: 12
                }
            },
        },
    },
    interaction: {
        intersect: false,
        mode: 'index',
    },
}

export default function WalletFlow() {
    const [flowData, setFlowData] = useState<WalletFlowData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [autoRefresh, setAutoRefresh] = useState(false)

    // const toggleAutoRefresh = () => { // Commented out as it's unused
    //     setAutoRefresh((prev) => !prev)
    // }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/walletflow')
                const data: WalletFlowData = await response.json()
                setFlowData(data)
            } catch (err: unknown) { // Updated `any` to `unknown`
                console.error(err)
                setError('Failed to fetch wallet flow data.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()

        if (autoRefresh) {
            const interval = setInterval(fetchData, 60000)
            return () => clearInterval(interval)
        }
    }, [autoRefresh])

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>Error: {error}</div>
    }

    const chartData = {
        labels: flowData?.timestamps,
        datasets: [
            {
                label: 'Inflow',
                data: flowData?.inflow,
                borderColor: 'rgba(75,192,192,1)',
                fill: false,
            },
            {
                label: 'Outflow',
                data: flowData?.outflow,
                borderColor: 'rgba(255,99,132,1)',
                fill: false,
            },
        ],
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Wallet Flow</CardTitle>
            </CardHeader>
            <CardContent>
                <Line options={options} data={chartData} />
                <Button onClick={() => setAutoRefresh(!autoRefresh)}>
                    {autoRefresh ? 'Stop Auto-Refresh' : 'Start Auto-Refresh'}
                </Button>
            </CardContent>
        </Card>
    )
}
