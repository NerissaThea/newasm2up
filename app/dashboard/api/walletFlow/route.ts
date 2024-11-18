import { NextResponse } from 'next/server'

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

        const data = await response.json();

        if (data.status !== '1') {
            throw new Error(data.message || 'Failed to fetch data from Etherscan');
        }

        // Generate sample data for the last 30 days
        const totalSupply = parseInt(data.result) / 1e18;
        const days = 30;
        const mockData = Array.from({ length: days }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - i - 1));
            const baseValue = totalSupply * 0.001;
            return {
                timestamp: date.toISOString().split('T')[0],
                inflow: baseValue + (Math.random() * baseValue * 0.5),
                outflow: baseValue * 0.8 + (Math.random() * baseValue * 0.3),
            };
        });

        // Calculate cumulative values
        const responseData = {
            inflow: mockData.map((d) => Number(d.inflow.toFixed(2))),
            outflow: mockData.map((d) => Number(d.outflow.toFixed(2))),
            timestamps: mockData.map((d) => d.timestamp),
            totalInflow: Number(
                mockData.reduce((sum, d) => sum + d.inflow, 0).toFixed(2)
            ),
            totalOutflow: Number(
                mockData.reduce((sum, d) => sum + d.outflow, 0).toFixed(2)
            ),
            currentBalance: Number(totalSupply.toFixed(2)),
        };

        return NextResponse.json(responseData);
    } catch (error: unknown) {
        // Xử lý lỗi với kiểu `unknown`
        let errorMessage = 'Failed to fetch wallet flow data';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error('Error fetching wallet flow data:', error);

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
