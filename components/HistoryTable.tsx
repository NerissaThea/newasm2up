'use client'

import { useState, useEffect, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Eye, ChevronLeft, ChevronRight, Download, Copy } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"

type Transaction = {
from: string
to: string
amount: number
timestamp: number
hash?: string
block?: string
fee?: string
method?: string
}

interface HistoryTableProps {
address: string
}

export default function HistoryTable({ address }: HistoryTableProps) {
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [currentPage, setCurrentPage] = useState(1);
const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
const [totalPages, setTotalPages] = useState(1);
const [isMobile, setIsMobile] = useState(false);
const [isLoading, setIsLoading] = useState(false);

const fetchTransactions = useCallback(async () => {
try {
setIsLoading(true);
const response = await fetch(`/api/transactions?address=${address}`);
const data = await response.json();
if (data.success) {
setTransactions(data.transactions);
setTotalPages(Math.ceil(data.transactions.length / 50));
} else {
toast({
title: "Error fetching transactions",
description: data.message,
variant: "destructive",
});
}
} catch (error) {
console.error('Error fetching transactions:', error);
toast({
title: "Error fetching transactions",
description: "Failed to fetch transactions.",
variant: "destructive",
});
} finally {
setIsLoading(false);
}
}, [address]);

useEffect(() => {
fetchTransactions();
}, [fetchTransactions]);

useEffect(() => {
const handleResize = () => {
setIsMobile(window.innerWidth < 768);
};
handleResize();
window.addEventListener('resize', handleResize);
return () => window.removeEventListener('resize', handleResize);
}, []);

const getRelativeTime = (timestamp: number) => {
const now = Date.now();
const diff = now - timestamp * 1000;

if (diff < 0) return "Just now";

const seconds = Math.floor(diff / 1000);

if (seconds < 60) return `${seconds} secs ago`;
const minutes = Math.floor(seconds / 60);
if (minutes < 60) return `${minutes} mins ago`;
const hours = Math.floor(minutes / 60);
if (hours < 24) return `${hours} hrs ago`;
const days = Math.floor(hours / 24);
return `${days} days ago`;
};

const truncateAddress = (address: string) => {
  if (!address || address.length < 10) {
    return "Invalid Address"; // Hoặc giá trị mặc định
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};


const copyToClipboard = async (text: string) => {
try {
await navigator.clipboard.writeText(text);
toast({
title: "Copied to clipboard",
description: "The text has been copied to your clipboard.",
});
} catch (err) {
console.error('Failed to copy: ', err);
toast({
title: "Failed to copy",
description: "An error occurred while copying the text.",
variant: "destructive",
});
}
};

const handleDownload = () => {
const headers = ['Transaction Hash', 'Method', 'Block', 'Age', 'From', 'To', 'Amount', 'Txn Fee'];
const csvContent = [
headers.join(','),
...transactions.map(tx =>
[
tx.hash,
tx.method,
tx.block,
formatTimestamp(tx.timestamp),
tx.from,
tx.to,
formatAmount(tx.amount.toString()),
tx.fee,
].join(',')
)
].join('\n');

const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
const link = document.createElement('a');
if (link.download !== undefined) {
const url = URL.createObjectURL(blob);
link.setAttribute('href', url);
link.setAttribute('download', `${address}_transactions.csv`);
link.style.visibility = 'hidden';
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
}
};

const formatTimestamp = (timestamp: number): string => {
const date = new Date(timestamp * 1000);
const options: Intl.DateTimeFormatOptions = {
timeZone: 'Asia/Bangkok',
year: 'numeric',
month: '2-digit',
day: '2-digit',
hour: '2-digit',
minute: '2-digit',
second: '2-digit',
hour12: false
};
return date.toLocaleString('en-GB', options).replace(',', '');
};

const handleMethodClick = (method: string) => {
setSelectedMethod(method === selectedMethod ? null : method);
};

const scrollToTop = useCallback(() => {
window.scrollTo({ top: 0, behavior: 'smooth' });
}, []);

const simplifyMethodName = (method: string) => {
const match = method.match(/^([^(]+)/);
return match ? match[1] : method;
};

return (
<div className="min-h-screen bg-[#1C2128] text-white font-exo2">
<div className="container mx-auto p-4">
<div className="flex flex-col md:flex-row justify-between items-center mb-4">
<div className="mb-4 md:mb-0">
<p className="text-white">Latest {transactions.length} transactions for {truncateAddress(address)}</p>
<p className="text-gray-400 text-sm">(Auto-updating)</p>
</div>

<div className="flex flex-wrap items-center justify-center gap-2">
<Button
variant="outline"
size="sm"
className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md hover:bg-[#F5B069]"
onClick={handleDownload}
>
<Download size={16} />
{!isMobile && "Download Data"}
</Button>
<Button
variant="outline"
size="sm"
className="px-4 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-[#F5B069]"
onClick={() => setCurrentPage(1)}
disabled={currentPage === 1}
>
First
</Button>
<Button
variant="outline"
size="icon"
className="w-9 h-9 bg-white text-black border border-gray-300 rounded-md hover:bg-[#F5B069]"
onClick={() => setCurrentPage(currentPage - 1)}
disabled={currentPage === 1}
>
<ChevronLeft size={16} />
</Button>
<div className="flex items-center justify-center min-w-[120px] h-9 px-3 bg-white text-gray-900 border border-gray-300 rounded-md">
Page {currentPage} of {totalPages}
</div>
<Button
variant="outline"
size="icon"
className="w-9 h-9 bg-white text-black border border-gray-300 rounded-md hover:bg-[#F5B069]"
onClick={() => setCurrentPage(currentPage + 1)}
disabled={currentPage === totalPages}
>
<ChevronRight size={16} />
</Button>
<Button
variant="outline"
size="sm"
className="px-4 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-[#F5B069]"
onClick={() => setCurrentPage(totalPages)}
disabled={currentPage === totalPages}
>
Last
</Button>
</div>
</div>

<div className="overflow-x-auto">
<Table className="w-full border rounded-2xl">
<TableHeader>
<TableRow className="bg-white">
<TableHead className="w-[50px]"></TableHead>
<TableHead className="text-black">Transaction Hash</TableHead>
<TableHead className="text-black">Method</TableHead>
<TableHead className="text-black">Block</TableHead>
<TableHead className="text-black">Age</TableHead>
<TableHead className="text-black">From</TableHead>
<TableHead className="text-black">To</TableHead>
<TableHead className="text-black">Amount</TableHead>
<TableHead className="text-black">Txn Fee</TableHead>
</TableRow>
</TableHeader>
<TableBody>
{isLoading ? (
<TableRow>
<TableCell colSpan={9} className="text-center py-4 bg-white text-black">
Loading transactions...
</TableCell>
</TableRow>
) : (
transactions.map((tx, index) => (
<TableRow key={index} className="bg-white text-black">
<TableCell className="p-0">
<div className="flex items-center justify-center h-full">
<Eye size={16} className="text-gray-400" />
</div>
</TableCell>
<TableCell className="font-medium text-blue-600">
<div className="flex items-center space-x-2">
<Link href={`/transaction/${tx.hash}`}>
<span className="cursor-pointer hover:underline">
{truncateAddress(tx.hash || '')}
</span>
</Link>
<Button
variant="ghost"
size="icon"
onClick={() => copyToClipboard(tx.hash || '')}
className="h-5 w-5 p-0"
>
<Copy size={12} />
</Button>
</div>
</TableCell>
<TableCell>
<button
onClick={() => handleMethodClick(tx.method || 'transfer')}
className={`px-3 py-1 rounded-full text-base font-medium w-25 h-10 flex items-center justify-center ${
selectedMethod === tx.method
? 'bg-purple-100 text-[#F5B069] border-2 border-[#F5B069]'
: 'bg-gray-100 text-gray-800 border border-gray-300'
}`}
title={tx.method || 'transfer'}
>
{simplifyMethodName(tx.method || 'transfer')}
</button>
</TableCell>
<TableCell>{tx.block}</TableCell>
<TableCell>{getRelativeTime(tx.timestamp)}</TableCell>
<TableCell className="text-blue-600">
<div className="flex items-center space-x-2">
<Link href={`/address/${tx.from}`}>
<span className="cursor-pointer hover:underline">
{truncateAddress(tx.from)}
</span>
</Link>
<Button
variant="ghost"
size="icon"
onClick={() => copyToClipboard(tx.from)}
className="h-5 w-5 p-0"
>
<Copy size={12} />
</Button>
</div>
</TableCell>
<TableCell className="text-blue-600">
<div className="flex items-center space-x-2">
<Link href={`/address/${tx.to}`}>
<span className="cursor-pointer hover:underline">
{truncateAddress(tx.to)}
</span>
</Link>
<Button
variant="ghost"
size="icon"
onClick={() => copyToClipboard(tx.to)}
className="h-5 w-5 p-0"
>
<Copy size={12} />
</Button>
</div>
</TableCell>
<TableCell>{formatAmount(tx.amount.toString())}</TableCell>
<TableCell>{formatFee(tx.fee || '0')}</TableCell>
</TableRow>
))
)}
</TableBody>
</Table>
</div>

<div className="flex justify-center md:justify-between items-center mt-4 flex-wrap gap-2">
<br />
<div className="flex items-center space-x-2">
<Button
variant="outline"
size="sm"
className="px-4 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-[#F5B069]"
onClick={() => setCurrentPage(1)}
disabled={currentPage === 1}
>
First
</Button>
<Button
variant="outline"
size="icon"
className="w-9 h-9 bg-white text-black border border-gray-300 rounded-md hover:bg-[#F5B069]"
onClick={() => setCurrentPage(currentPage - 1)}
disabled={currentPage === 1}
>
<ChevronLeft size={16} />
</Button>
<div className="flex items-center justify-center min-w-[120px] h-9 px-3 bg-white text-gray-900 border border-gray-300 rounded-md">
Page {currentPage} of {totalPages}
</div>
<Button
variant="outline"
size="icon"
className="w-9 h-9 bg-white text-black border border-gray-300 rounded-md hover:bg-[#F5B069]"
onClick={() => setCurrentPage(currentPage + 1)}
disabled={currentPage === totalPages}
>
<ChevronRight size={16} />
</Button>
<Button
variant="outline"
size="sm"
className="px-4 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-[#F5B069]"
onClick={() => setCurrentPage(totalPages)}
disabled={currentPage === totalPages}
>
Last
</Button>
</div>
</div>

<p className="mt-4 text-sm text-gray-400">
A transaction is a cryptographically signed instruction that changes the blockchain state.
Block explorers track the details of all transactions in the network.
</p>

<Button
id="back-to-top"
variant="link"
className="mt-4 text-blue-500 hover:text-[#F5B069]"
onClick={scrollToTop}
>
Back to Top
</Button>
</div>
</div>
);
}

const formatAmount = (amount: string) => {
if (!amount) return '0 ETH';
const value = parseFloat(amount);
return `${value.toFixed(6)} ETH`;
};

const formatFee = (fee: string) => {
if (!fee) return '0';
const value = parseFloat(fee);
return value.toFixed(6);
};
