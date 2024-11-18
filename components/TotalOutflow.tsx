import React, { useEffect, useState } from 'react';

export default function TotalOutflow() {
    const [totalOutflow, setTotalOutflow] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('dashboard/api/walletFlowService');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.json();
                setTotalOutflow(data.outflow);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unexpected error occurred');
                }
            }
        };

        fetchData();
    }, []);

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (totalOutflow === null) {
        return (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        );
    }

    return (
        <div className="flex flex-col items-center p-4">
            <div className="bg-white shadow-md rounded-lg p-4 m-2 w-80 h-[100px]">
                <h2 className="text-lg font-bold mb-2">Total Outflow</h2>
                <h3 className="text-2xl font-semibold">
                    {totalOutflow.toFixed(2).toLocaleString()} ETH
                </h3>
            </div>
        </div>
    );
}
