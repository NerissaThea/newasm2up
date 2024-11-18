import React, { useEffect, useState } from 'react';

export default function TotalInflow() {
    const [totalInflow, setTotalInflow] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('dashboard/api/walletFlowService');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.json();
                setTotalInflow(data.totalInflow);
            } catch (err) {
                console.error('Fetch error:', err); // Log lỗi chi tiết
                setError((err as Error).message); // Ép kiểu an toàn để truy cập `message`
            }
        };

        fetchData();
    }, []);

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (totalInflow === null) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center p-4">
            <div className="bg-white shadow-md rounded-lg p-4 m-2 w-80">
                <h2 className="text-lg font-bold mb-2">Total Inflow</h2>
                <h3 className="text-2xl font-semibold">{totalInflow.toFixed(2).toLocaleString()} ETH</h3>
            </div>
        </div>
    );
}
