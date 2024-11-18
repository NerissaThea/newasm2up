/* eslint-disable */
"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TransactionDashboard: React.FC = () => {
    const [totalTransactions, setTotalTransactions] = useState<number>(0);  // State to store total transactions
    const [loading, setLoading] = useState<boolean>(true);  // State to manage loading status
    const [error, setError] = useState<string | null>(null);  // State to store error message

    const API_URL = `https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${process.env.NEXT_PUBLIC_API_KEY}`;

    const fetchTotalTransactions = async () => {
        setLoading(true);  // Set loading to true before calling the API
        try {
            const response = await axios.get(API_URL);  // Call the API to get the total transactions
            const totalTxCount = response.data.result;  // Assume you have a way to get the transaction count from the API

            setTotalTransactions(Number(totalTxCount));  // Store the total transaction count in the state
        } catch (err) {
            setError('Error fetching data from the API');  // Set error message if there’s an issue
        } finally {
            setLoading(false);  // Set loading to false once the API call is complete
        }
    };

    useEffect(() => {
        fetchTotalTransactions();  // Call the function when the component mounts

        // Set an interval to fetch the total transactions every 10 seconds
        const interval = setInterval(() => {
            fetchTotalTransactions();  // Re-fetch the total transactions every 10 seconds
        }, 60000);  // 10000 ms = 10 seconds

        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(interval);
    }, []);  // The effect runs only once when the component mounts

    if (loading) {
        return <div>Loading data...</div>;  // Show loading message while waiting for data
    }

    if (error) {
        return <div>{error}</div>;  // Show error message if there was an issue fetching data
    }

    // Render total transaction count once the data is successfully fetched
    return (
        <div className="flex flex-col items-center p-4 ">
            <div className="bg-white shadow-md rounded-lg p-4 m-2 w-80">
                <h2 className="text-lg font-bold mb-2">Total Transactions</h2>
                <h3 className="text-2xl font-semibold">{totalTransactions}</h3>
            </div>
        </div>
    );
};

export default TransactionDashboard;
