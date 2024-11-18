import { NextResponse } from 'next/server'

const ETHERSCAN_API_URL = 'https://api.etherscan.io/api'

// Định nghĩa kiểu Transaction để thay thế any[]
interface Transaction {
    from: string;
    to: string;
    value: string;
}

function calculateTotalEther(
    transactions: Transaction[], // Thay any[] bằng kiểu Transaction[]
    direction: 'from' | 'to',
    targetAddress: string
): string {
    const total = transactions.reduce((sum, tx) => {
        if (direction === 'from' && tx.from.toLowerCase() === targetAddress.toLowerCase()) {
            return sum + parseFloat(tx.value);
        }
        if (direction === 'to' && tx.to.toLowerCase() === targetAddress.toLowerCase()) {
            return sum + parseFloat(tx.value);
        }
        return sum;
    }, 0);

    return (total / 1e18).toFixed(4); // Convert từ wei sang ether và định dạng
}

export async function POST(request: Request) {
    try {
        const { address } = await request.json();

        // Kiểm tra định dạng địa chỉ Ethereum
        if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
            return NextResponse.json(
                { error: 'Invalid Ethereum address format' },
                { status: 400 }
            );
        }

        // Lấy dữ liệu giao dịch từ Etherscan
        const response = await fetch(
            `${ETHERSCAN_API_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.GAS_API_KEY}`
        );

        const data = await response.json();

        if (data.status === '0') {
            return NextResponse.json(
                { error: data.message || 'Failed to fetch address data' },
                { status: 400 }
            );
        }

        // Xử lý và định dạng phản hồi
        const formattedAddress = {
            formatted_address: address,
            components: [
                {
                    long_name: `Transaction Count: ${data.result.length}`,
                    short_name: data.result.length.toString(),
                    types: ['transaction_count']
                },
                {
                    long_name: `First Transaction Block: ${data.result[data.result.length - 1]?.blockNumber || 'N/A'}`,
                    short_name: data.result[data.result.length - 1]?.blockNumber || 'N/A',
                    types: ['first_transaction']
                },
                {
                    long_name: `Latest Transaction Block: ${data.result[0]?.blockNumber || 'N/A'}`,
                    short_name: data.result[0]?.blockNumber || 'N/A',
                    types: ['latest_transaction']
                },
                {
                    long_name: `Total Ether Sent: ${calculateTotalEther(data.result, 'from', address)} ETH`,
                    short_name: `${calculateTotalEther(data.result, 'from', address)} ETH`,
                    types: ['total_sent']
                },
                {
                    long_name: `Total Ether Received: ${calculateTotalEther(data.result, 'to', address)} ETH`,
                    short_name: `${calculateTotalEther(data.result, 'to', address)} ETH`,
                    types: ['total_received']
                }
            ]
        };

        return NextResponse.json(formattedAddress);
    } catch (error) {
        console.error('Error processing address:', error);
        return NextResponse.json(
            { error: 'Failed to process address' },
            { status: 500 }
        );
    }
}
