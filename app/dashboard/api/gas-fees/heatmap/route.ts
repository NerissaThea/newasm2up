import { NextResponse } from 'next/server'

const API_KEY = process.env.GAS_API_KEY

async function fetchCurrentGas() {
    const response = await fetch(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${API_KEY}`)
    const data = await response.json()
    return parseInt(data.result.SafeGasPrice)
}

export async function GET() {
    try {
        const currentGasPrice = await fetchCurrentGas()

        // Tạo dữ liệu theo giờ (24 giờ)
        const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
            hour,
            fee: Math.floor(Math.random() * (currentGasPrice * 2)) + currentGasPrice,
        }))

        // Tạo dữ liệu theo ngày trong tuần
        const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const weeklyData = weekDays.map(day => ({
            day,
            fee: Math.floor(Math.random() * (currentGasPrice * 2)) + currentGasPrice,
        }))

        return NextResponse.json({
            hourlyData,
            weeklyData,
            currentGasPrice
        })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to fetch gas fees' }, { status: 500 })
    }
}