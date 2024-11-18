"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TransactionDashboard: React.FC = () => {
    const [ethPrice, setEthPrice] = useState<number | null>(null); // State to store Ethereum price
    const [loading, setLoading] = useState<boolean>(true); // State to manage loading status
    const [error, setError] = useState<string | null>(null); // State to store error message

    // CoinGecko API to fetch ETH price
    const API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';

    const fetchEthPrice = async () => {
        setLoading(true); // Set loading to true before calling the API
        try {
            const response = await axios.get(API_URL); // Call the API to get ETH price
            const price = response.data.ethereum.usd; // Extract USD price from the response
            setEthPrice(price); // Store the ETH price in state
        } catch {
            setError('Error fetching data from the API'); // Set error message if there's an issue
        } finally {
            setLoading(false); // Set loading to false once the API call is complete
        }
    };

    useEffect(() => {
        fetchEthPrice(); // Call the fetchEthPrice function when the component mounts

        // Update ETH price every 24 hours (24h = 86400000 ms)
        const interval = setInterval(() => {
            fetchEthPrice(); // Re-fetch the ETH price every 24 hours
        }, 86400000);

        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(interval);
    }, []); // The effect runs only once when the component mounts

    if (loading) {
        return <div>Loading data...</div>; // Show loading message while waiting for data
    }

    if (error) {
        return <div>{error}</div>; // Show error message if there was an issue fetching data
    }

    // Render ETH price once the data is successfully fetched
    return (
        <div className="flex flex-col items-center p-4">
            <div className="bg-white shadow-md rounded-lg p-4 m-2 w-80">
                <h2 className="text-lg font-bold mb-2">Ethereum Price (USD)</h2>
                <h3 className="text-2xl font-semibold">${ethPrice?.toFixed(2)}</h3>
            </div>
        </div>
    );
};

export default TransactionDashboard;
