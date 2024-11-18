import { NextResponse } from 'next/server';

export async function GET() {
    const apiKey = process.env.GAS_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: 'API key not configured' },
            { status: 500 }
        );
    }

    try {
        // Fetch total ETH supply
        const response = await fetch(
            `https://api.etherscan.io/api?module=stats&action=ethsupply&apikey=${apiKey}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch data from Etherscan');
        }

        const data: { status: string; result: string; message?: string } = await response.json();

        if (data.status !== '1') {
            throw new Error(data.message || 'Failed to fetch data from Etherscan');
        }

        // Generate sample data
        const totalSupply = parseInt(data.result) / 1e18;
        const days = 30;
        const mockData = Array.from({ length: days }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - i - 1));
            const baseValue = totalSupply * 0.001;
            return {
                timestamp: date.toISOString().split('T')[0],
                inflow: baseValue + Math.random() * baseValue * 0.5,
                outflow: baseValue * 0.8 + Math.random() * baseValue * 0.3,
            };
        });

        return NextResponse.json({
            inflow: mockData.map((d) => Number(d.inflow.toFixed(2))),
            outflow: mockData.map((d) => Number(d.outflow.toFixed(2))),
            timestamps: mockData.map((d) => d.timestamp),
            totalInflow: Number(mockData.reduce((sum, d) => sum + d.inflow, 0).toFixed(2)),
            totalOutflow: Number(mockData.reduce((sum, d) => sum + d.outflow, 0).toFixed(2)),
            currentBalance: Number(totalSupply.toFixed(2)),
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error fetching wallet flow data:', errorMessage);
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
