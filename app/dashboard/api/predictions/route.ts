import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/'
        const response = await fetch(`${baseUrl}/dashboard/api/predictions`);

        if (!response.ok) {
            throw new Error('Failed to fetch predictions from backend')
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch gas predictions' },
            { status: 500 }
        )
    }
}