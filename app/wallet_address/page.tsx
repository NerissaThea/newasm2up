/* eslint-disable */
'use client'
import axios from 'axios'
import React, { useCallback, useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  Controls,
  Node,
  Edge,
  NodeProps,
  EdgeProps,
  NodeChange,
  EdgeChange,
  OnNodesChange,
  OnEdgesChange,
  Handle,
  Position,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MarkerType,
  Connection,
} from "reactflow";
import "reactflow/dist/style.css";

import { Button } from "@/components/ui/button";
import { useSearchParams } from 'next/navigation';
import HistoryTable from "@/components/HistoryTable";
const ReactFlow = dynamic(() => import("reactflow").then((mod) => mod.default), { ssr: false });

interface ApiTransaction {
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  hash?: string;
  block?: string;
  fee?: string;
}

interface TokenHolding {
  name: string;
  symbol: string;
  amount: number;
}

interface AddressInfo {
  address: string;
  gas: string;
  balance: string;
  totalSent: string;
  value: string;
  firstSeen: string;
  lastSeen: string;
  fundedBy: string;
  privateNameTag: string; // User-defined tag
  multichainInfo: string;
  tokenHoldings: TokenHolding[]; // Token holdings
  
}

const CircleNode = ({ data }: NodeProps) => (
  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-orange-400 text-white border-2 border-orange-500 shadow-lg">
    <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />
    <div className="text-xs font-mono">{data.label}</div>
    <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
  </div>
);

const CircleNodePro = ({ data }: NodeProps) => (
  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-orange-400 text-white border-2 border-orange-500 shadow-lg">
    <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />
    <div className="text-xs font-mono">{data.label}</div>
    <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
  </div>
);


const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, style = {}, markerEnd, data }: EdgeProps) => {
  const edgePath = `M${sourceX},${sourceY} C${sourceX + (targetX - sourceX) / 2},${sourceY} ${sourceX + (targetX - sourceX) / 2},${targetY} ${targetX},${targetY}`;
  return (
    <>
      <path id={id} style={style} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />
      <text>
        <textPath href={`#${id}`} style={{ fontSize: 12, fill: "white" }} startOffset="50%" textAnchor="middle">
          {data.label}
        </textPath>
      </text>
    </>
  );
};

const nodeTypes = { circle: CircleNode, star: CircleNodePro };
const edgeTypes = { custom: CustomEdge };

const processTransactions = (transactions: ApiTransaction[], centralAddress: string) => {
  const newNodes: Node[] = [];
  const newEdges: Edge[] = [];
  const addedNodes = new Set<string>();
  const edgeAmounts = new Map<string, number>();

  const radius = 500;
  let angle = 0;
  const angleStep = (2 * Math.PI) / transactions.length;

  const addNode = (address: string, isCentral: boolean) => {
    if (!addedNodes.has(address)) {
      let x, y;
      if (isCentral) {
        x = 0;
        y = 0;
      } else {
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
        angle += angleStep;
      }
    // Bảo vệ để tránh tạo node với nhãn không hợp lệ
    if (!address || address.length < 6) {
      console.warn("Invalid address passed to addNode:", address);
      return; // Dừng nếu địa chỉ không hợp lệ
    }

      newNodes.push({
        id: address,
        type: isCentral ? "star" : "circle",
        position: { x, y },
        data: { label: `${address.slice(0, 6)}...${address.slice(-4)}` }
      });
      addedNodes.add(address);
    }
  };

  addNode(centralAddress.toLowerCase(), true);

  transactions.forEach((tx: ApiTransaction) => {
    const txFrom = tx.from.toLowerCase();
    const txTo = tx.to.toLowerCase();
    const edgeId = `${txFrom}-${txTo}`;

    addNode(txFrom, txFrom === centralAddress.toLowerCase());
    addNode(txTo, txTo === centralAddress.toLowerCase());

    edgeAmounts.set(edgeId, (edgeAmounts.get(edgeId) || 0) + tx.amount);
  });

  edgeAmounts.forEach((amount, edgeId) => {
    const [source, target] = edgeId.split('-');
    newEdges.push({
      id: `e${edgeId}`,
      source,
      target,
      type: "custom",
      data: { label: `${amount.toFixed(4)} ETH` },
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#60a5fa", strokeWidth: 3 }
    });
  });

  return { nodes: newNodes, edges: newEdges };
};

const forceSimulation = (nodes: Node[], edges: Edge[]) => {
  const REPULSION = 20000;
  const ATTRACTION = 0.05;
  const ITERATIONS = 200;
  const MAX_VELOCITY = 10;

  for (let iteration = 0; iteration < ITERATIONS; iteration++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].position.x - nodes[i].position.x;
        const dy = nodes[j].position.y - nodes[i].position.y;
        const distanceSq = dx * dx + dy * dy;
        if (distanceSq === 0) continue;
        
        const force = REPULSION / Math.sqrt(distanceSq);
        const forceX = force * dx / distanceSq;
        const forceY = force * dy / distanceSq;

        nodes[i].position.x -= forceX;
        nodes[i].position.y -= forceY;
        nodes[j].position.x += forceX;
        nodes[j].position.y += forceY;
      }
    }

    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (source && target) {
        const dx = target.position.x - source.position.x;
        const dy = target.position.y - source.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const force = ATTRACTION * Math.log(distance + 1);
        const forceX = force * dx / distance;
        const forceY = force * dy / distance;

        source.position.x += forceX;
        source.position.y += forceY;
        target.position.x -= forceX;
        target.position.y -= forceY;
      }
    });

    nodes.forEach(node => {
      const velocity = Math.sqrt(node.position.x * node.position.x + node.position.y * node.position.y);
      if (velocity > MAX_VELOCITY) {
        const scale = MAX_VELOCITY / velocity;
        node.position.x *= scale;
        node.position.y *= scale;
      }
    });
  }

  return { nodes, edges };
};

export default function TransactionExplorer() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [apiTransactions] = useState<ApiTransaction[]>([]);
  const [addressInfo, setAddressInfo] = useState<AddressInfo>({
    address: "",           // Initialized as an empty string
    gas: "",               // Initialized as an empty string
    balance: "",           // Initialized as an empty string
    totalSent: "",         // Initialized as an empty string
    value: "",             // Initialized as an empty string
    firstSeen: "",         // Initialized as an empty string
    lastSeen: "",          // Initialized as an empty string
    fundedBy: "",          // Initialized as an empty string
    privateNameTag: "",    // Initialized as an empty string
    multichainInfo: "",    // Initialized as an empty string
    tokenHoldings: [] 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentAddress] = useState<string>("");
  const [searchedAddress] = useState<string>("");
  const [activeView, setActiveView] = useState<"transaction" | "graph">("graph");
  const [selectedEdge, setSelectedEdge] = useState<{ transactions: ApiTransaction[] } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const totalPages = selectedEdge ? Math.ceil(selectedEdge.transactions.length / itemsPerPage) : 1;
  const searchParams = useSearchParams();
  const [address, setAddress] = useState<string | null>(null);
  const [isTokenHoldingsExpanded, setIsTokenHoldingsExpanded] = useState(false);
  const [walletAddress] = useState<string>(''); // State for wallet address
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]); // State for storing token data
  const [tokenAddress, setTokenAddress] = useState<string>('');

  const [filterType] = useState("all");
  const [addressType] = useState("all");
  const [minAmount] = useState("");
  const [maxAmount] = useState("");
  const [startDate] = useState("");
  const [endDate] = useState("");
  const [searchAddress] = useState("");
  const [analysisResults, setAnalysisResults] = useState<{ address: string; txCount: number; totalEth: number }[]>([]);
  const [processedAddresses, setProcessedAddresses] = useState<Set<string>>(new Set())
  const [tokenHoldings, setTokenHoldings] = useState<TokenHolding[]>([]); // Correctly define the state

const ETHERSCAN_API_KEY = "RQ1E2Y5VTM4EKCNZTDHD58UCIXMPD34N1J"; 

  useEffect(() => {
    const newAddress = searchParams?.get('address');
    if (newAddress) {
      setAddress(newAddress);
      fetchAddressInfo(newAddress);
      fetchTransactionData(newAddress);
    }
  }, [searchParams]);

  const fetchTokenHoldings = async (address: string, token: string) => {
    setLoading(true);
    setError(null);
    try {
        const response = await axios.get(`https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${token}&address=${address}&tag=latest&apikey=5IE2SF8P8J318KF81WMA1XKWC1XI4IQGU6`);
        
        const balance = response.data.result;
        const tokenHoldingsData: TokenHolding[] = [{
            name: "Token Name", // Placeholder for token name
            symbol: "Token Symbol", // Placeholder for token symbol
            amount: parseFloat(balance) / 1e18 // Adjust the divisor based on the token's decimals
        }];

        setTokenHoldings(tokenHoldingsData);
    } catch (err) {
        console.error('Error fetching token holdings:', err);
        setError('Error fetching data');
    } finally {
        setLoading(false);
    }
};
const fetchMultichainData = async () => {
    setLoading(true);
    setError(null);
    try {
        const response = await axios.get(`https://deep-index.moralis.io/api/v2/${walletAddress}/erc20/${tokenAddress}`, {
            headers: {
                'X-API-Key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjdlYWZlZGFlLWQxYzktNGZiNS05OWJkLTRiNmU0ODMzMGM3YiIsIm9yZ0lkIjoiNDE2NTM4IiwidXNlcklkIjoiNDI4MTQ4IiwidHlwZSI6IlBST0pFQ1QiLCJ0eXBlSWQiOiI5MWE1M2YyZS00OGYxLTRiOTEtOTAyYy1kMTM3ZGFiOWQ0YTYiLCJpYXQiOjE3MzE4NzMzMDUsImV4cCI6NDg4NzYzMzMwNX0.eO0Dk38ZaLy-HgaUAYU-tou4ObTfdWQU9JBLMTQ_Dmo', 
            },
        });
        setTokenHoldings(prev => [...prev, ...response.data]); // Combine with existing token holdings
    } catch (err) {
        console.error('Error fetching multichain data:', err);
        setError('Error fetching data');
    } finally {
        setLoading(false);
    }
};
const fetchAddressInfo = async (address: string) => {
  setLoading(true);
  setError(null);
  try {
      // Fetch balance
      const balanceResponse = await fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`);
      const balanceData = await balanceResponse.json();
      const balance = balanceData.result;

      // Fetch transactions
      const transactionResponse = await fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${ETHERSCAN_API_KEY}`);
      const transactionData = await transactionResponse.json();
      const transactions = transactionData.result;

      // Fetch token transactions
      const tokenResponse = await fetch(`https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999 99999&sort=asc&apikey=${ETHERSCAN_API_KEY}`);
      const tokenData = await tokenResponse.json();
      const tokenTransactions = tokenData.result;

      const totalSent = 0;
      const fundedBy = 'N/A'; // Default value for funded by

    

      // Convert timestamps to human-readable format
      const formatDate = (timestamp: string): string => {
          const date = new Date(parseInt(timestamp) * 1000); // Convert seconds to milliseconds
          return date.toLocaleString(); // Format date as string
      };

      const firstSeen = transactions.length > 0 ? formatDate(transactions[0].timeStamp) : 'N/A';
      const lastSeen = transactions.length > 0 ? formatDate(transactions[transactions.length - 1].timeStamp) : 'N/A';

      // Calculate token holdings
      const tokenHoldings: { [key: string]: { name: string; symbol: string; amount: number } } = {};

      if (Array.isArray(tokenTransactions)) {
        tokenTransactions.forEach((tokenTx) => {
            const tokenSymbol = tokenTx.tokenSymbol;
            const tokenName = tokenTx.tokenName;
            const value = parseFloat(tokenTx.value);
    
            if (tokenTx.to.toLowerCase() === address.toLowerCase()) {
                // Received tokens
                if (!tokenHoldings[tokenSymbol]) {
                    tokenHoldings[tokenSymbol] = { name: tokenName, symbol: tokenSymbol, amount: 0 };
                }
                tokenHoldings[tokenSymbol].amount += value;
            } else if (tokenTx.from.toLowerCase() === address.toLowerCase()) {
                // Sent tokens
                if (!tokenHoldings[tokenSymbol]) {
                    tokenHoldings[tokenSymbol] = { name: tokenName, symbol: tokenSymbol, amount: 0 };
                }
                tokenHoldings[tokenSymbol].amount -= value;
            }
        });
    } else {
        console.error('tokenTransactions is not an array:', tokenTransactions);
    }

      const tokenHoldingsArray: TokenHolding[] = Object.values(tokenHoldings);
      setTokenHoldings(tokenHoldingsArray); 

      setAddressInfo({
          address,
          gas: '0', // Placeholder
          balance: (parseFloat(balance) / 1e18).toString(), // Convert Wei to Ether
          totalSent: totalSent.toString(),
          value: '0', // Placeholder for value in USD
          firstSeen,
          lastSeen,
          fundedBy, // Set the fundedBy address
          privateNameTag: 'N/A', // Use user-defined tag
          multichainInfo: 'N/A', // Placeholder for multichain info
          tokenHoldings: tokenHoldingsArray // Set the token holdings
      });
  } catch (error: unknown) {
      if (error instanceof Error) {
          console.error(`Error fetching address info for ${address}:`, error);
          setError(error.message);
      } else {
          console.error(`Unexpected error fetching address info for ${address}:`, error);
          setError("An unexpected error occurred.");
      }
  } finally {
      setLoading(false);
  }
};

  const fetchTransactionData = async (address: string, updateSearched: boolean = false, parentPosition: { x: number, y: number } = { x: 0, y: 0 }) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/transactions?address=${address}`)
      const data = await response.json()

      if (data.success) {
        if (processedAddresses.has(address.toLowerCase())) {
          return
        }

        const newFromNodes: Node[] = []
        const newToNodes: Node[] = []
        const newEdges: Edge[] = []
        const addedFromNodes = new Set(nodes.map((node) => node.id))
        const addedToNodes = new Set(nodes.map((node) => node.id))
        const edgeMap = new Map()

        // Add the center node if it's a new search
        if (!processedAddresses.size) {
          newFromNodes.push({
            id: address.toLowerCase(),
            type: 'star',
            position: parentPosition,
            data: { label: `${address.slice(0, 6)}...${address.slice(-4)}` }
          })
          addedFromNodes.add(address.toLowerCase())
          addedToNodes.add(address.toLowerCase())
        }

        data.transactions.forEach((tx: any) => {
          const txFrom = tx.from.toLowerCase()
          const txTo = tx.to.toLowerCase()
          const edgeId = `${txFrom}-${txTo}`

          if (!addedFromNodes.has(txFrom) && txFrom !== txTo) {
            newFromNodes.push({
              id: txFrom,
              type: txFrom === address.toLowerCase() ? "star" : "circle",
              position: txFrom === address.toLowerCase() ? parentPosition : { x: parentPosition.x - 200, y: parentPosition.y + Math.random() * 500 },
              data: { label: `${txFrom.slice(0, 6)}...${txFrom.slice(-4)}` }
            })
            addedFromNodes.add(txFrom)
          }

          if (!addedToNodes.has(txTo) && txFrom !== txTo) {
            newToNodes.push({
              id: txTo,
              type: txTo === address.toLowerCase() ? "star" : "circle",
              position: txTo === address.toLowerCase() ? parentPosition : { x: parentPosition.x + 200, y: parentPosition.y + Math.random() * 500 },
              data: { label: `${txTo.slice(0, 6)}...${txTo.slice(-4)}` }
            })
            addedToNodes.add(txTo)
          }


          if (edgeMap.has(edgeId)) {
            edgeMap.get(edgeId).totalAmount += tx.amount
            edgeMap.get(edgeId).transactions.push(tx)
          } else {
            edgeMap.set(edgeId, {
              source: txFrom,
              target: txTo,
              totalAmount: tx.amount,
              transactions: [tx]
            })
          }
        })

        // Create edges from the map
        edgeMap.forEach((edgeData, edgeId) => {
          newEdges.push({
            id: `e${edgeId}`,
            source: edgeData.source,
            target: edgeData.target,
            type: 'smoothstep', // Change to 'smoothstep' for curved edges
            data: { 
              label: `${edgeData.totalAmount.toFixed(4)} ETH`,
              transactions: edgeData.transactions
            },
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#60a5fa', strokeWidth: 3 } // Remove the 'curvature' property
          });
        })

        // Update processed addresses
        setProcessedAddresses(prev => new Set([...prev, address.toLowerCase()]))

        // Update nodes and edges
        setNodes(prevNodes => [...prevNodes, ...newFromNodes, ...newToNodes])
        setEdges(prevEdges => [...prevEdges, ...newEdges])
      } else {
        setError("Failed to fetch transaction data")
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to fetch transaction data')
    } finally {
      setIsLoading(false)
    }
  }

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (!processedAddresses.has(node.id)) {
      fetchTransactionData(node.id, false, node.position)
    }
  }, [processedAddresses])

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    const edgeTransactions = edge.data?.transactions || [];
    if (edgeTransactions.length > 0) {
      setSelectedEdge({ transactions: edgeTransactions });
    }
  }, []);

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  // const handleViewChange = (view: "transaction" | "graph") => {
  //   setActiveView(view);
  //   setShowRightPanel(view === "graph");
  // };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log("Copied to clipboard");
    }).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  };

  const handleDownload = () => {
    if (!apiTransactions.length) return;

    const headers = ['Transaction Hash', 'Method', 'Block', 'Age', 'From', 'To', 'Amount', 'Fee'];
    const csvContent = [
      headers.join(','),
      ...apiTransactions.map(tx => [
        tx.hash || '',
        'Transfer',
        tx.block || '',
        new Date(tx.timestamp * 1000).toLocaleString(),
        tx.from,
        tx.to,
        `${tx.amount} ETH`,
        tx.fee || '0'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${searchedAddress}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    // Kiểm tra `currentTransactions` để đảm bảo nó có dữ liệu
    if (currentTransactions && currentTransactions.length > 0) {
      // Đặt tiêu đề cho CSV
      const headers = ['Time (UTC)', 'Hash', 'From', 'To', 'Amount', 'Fee'];

      // Chuyển đổi mỗi giao dịch trong `currentTransactions` thành một hàng CSV
      const rows = currentTransactions.map((transaction) => [
        transaction.timestamp ? new Date(transaction.timestamp * 1000).toLocaleString() : 'N/A',
        transaction.hash ? transaction.hash : 'Không có dữ liệu',
        transaction.from ? transaction.from : 'Không có dữ liệu',
        transaction.to ? transaction.to : 'Không có dữ liệu',
        transaction.amount ? transaction.amount : 'N/A',
        transaction.fee ? transaction.fee : 'N/A',
      ]);

      // Kết hợp headers và rows thành một chuỗi CSV
      const csvContent = [headers, ...rows]
        .map((row) => row.join(',')) // Nối mỗi hàng bằng dấu phẩy
        .join('\n'); // Nối các hàng bằng dấu xuống dòng

      // Tạo Blob từ nội dung CSV để tải xuống
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      // Tạo một link tạm để tải xuống
      const link = document.createElement('a');
      link.href = url;
      link.download = `transaction_history.csv`;

      // Thêm link vào document, kích hoạt click để tải xuống, và sau đó xóa link
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Giải phóng bộ nhớ
    } else {
      alert('Không có dữ liệu để tải xuống.');
    }
  };

  const applyFilters = useCallback(() => {
    let filteredTransactions = apiTransactions;

    if (filterType !== "all") {
      filteredTransactions = filteredTransactions.filter(tx => 
        filterType === "in" ? tx.to === currentAddress : tx.from === currentAddress
      );
    }

    if (addressType !== "all") {
      // Implement logic for known/unknown addresses if needed
    }

    if (minAmount) {
      filteredTransactions = filteredTransactions.filter(tx => tx.amount >= parseFloat(minAmount));
    }
    if (maxAmount) {
      filteredTransactions = filteredTransactions.filter(tx => tx.amount <= parseFloat(maxAmount));
    }

    if (startDate) {
      const startTimestamp = new Date(startDate).getTime() / 1000;
      filteredTransactions = filteredTransactions.filter(tx => tx.timestamp >= startTimestamp);
    }
    if (endDate) {
      const endTimestamp = new Date(endDate).getTime() / 1000;
      filteredTransactions = filteredTransactions.filter(tx => tx.timestamp <= endTimestamp);
    }

    
    const { nodes, edges } = processTransactions(filteredTransactions, currentAddress);
    const simulatedLayout = forceSimulation(nodes, edges);
    setNodes(simulatedLayout.nodes);
    setEdges(simulatedLayout.edges);
  }, [apiTransactions, filterType, addressType, minAmount, maxAmount, startDate, endDate, currentAddress]);

  const updateAnalysis = useCallback(() => {
    const analysis = apiTransactions.reduce((acc, tx) => {
      const address = tx.from === currentAddress ? tx.to : tx.from;
      if (!acc[address]) {
        acc[address] = { txCount: 0, totalEth: 0 };
      }
      acc[address].txCount += 1;
      acc[address].totalEth += tx.amount;
      return acc;
    }, {} as Record<string, { txCount: number; totalEth: number }>);

    const analysisArray = Object.entries(analysis)
      .map(([address, data]) => ({ address, ...data }))
      .filter(item => item.address.toLowerCase().includes(searchAddress.toLowerCase()))
      .sort((a, b) => b.totalEth - a.totalEth)
      .slice(0, 10);  // Top 10 addresses

    setAnalysisResults(analysisArray);
  }, [apiTransactions, currentAddress, searchAddress]);

  useEffect(() => {
    applyFilters();
    updateAnalysis();
  }, [applyFilters, updateAnalysis]);

  // Calculate transactions to display
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = selectedEdge ? selectedEdge.transactions.slice(startIndex, endIndex) : [];

  return (
    <Suspense fallback={<div>Loading...</div>}>
          {/* Header section with wallet address information */}
          <div className="bg-primaryGray p-4 sm:p-6 text-white sm:px-8 lg:px-20 font-exo2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl font-semibold font-quantico">Address Information</h1>
        </div>

        {/* Wallet overview section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center mt-4 space-y-4 sm:space-y-0">
          <img
            src="https://static.vecteezy.com/system/resources/previews/030/750/807/original/user-icon-in-trendy-outline-style-isolated-on-white-background-user-silhouette-symbol-for-your-website-design-logo-app-ui-illustration-eps10-free-vector.jpg"
            alt="User"
            className="rounded-full h-10 w-10 mr-4"
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 flex-grow font-exo2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <p className="text-lg sm:text-xl font-semibold">Address</p>
              <p className="text-xs break-all">{addressInfo.address}</p>
            </div>
            <div className="flex space-x-2">
              {['copy', 'qrcode', 'comment'].map((icon, index) => (
                <button
                  key={index}
                  className="text-white p-1 rounded-lg transition duration-200 ease-in-out hover:bg-gray-700"
                >
                </button>
              ))}
            </div>
          </div>
          {/* Main content area with transaction graph and table */}
        </div>
        {/* Main content area */}
       
      </div>
      <div className={` bg-[#1C2128] text-white font-exo2`}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
            <div className="bg-white text-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 font-bold">Balance:</p>
                  <p>{addressInfo.balance} ETH</p>
                </div>
                <div>
                  <p className="text-gray-600 font-bold">Total Sent:</p>
                  <p>{addressInfo.totalSent} ETH</p>
                </div>
                <div>
                  <p className="text-gray-600 font-bold">Value:</p>
                  <p>${addressInfo.value} USD</p>
                </div>
                <div>
                <p className="text-muted-foreground mb-2 font-semibold">TOKEN HOLDINGS:</p>
                <Button
                  variant="outline"
                  onClick={() => setIsTokenHoldingsExpanded(!isTokenHoldingsExpanded)}
                  className="w-full justify-between"
                >
                  <span>
                    {tokenHoldings.length
                      ? `$${tokenHoldings.length * 1000} ( ${tokenHoldings.length} tokens )`
                      : "No tokens found"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isTokenHoldingsExpanded ? "rotate-180" : ""
                    }`}
                  />
                </Button>

                {isTokenHoldingsExpanded && (
                  <div className="mt-2 p-2 bg-muted rounded-md">
                    {tokenHoldings.length ? (
                      <ul className="space-y-2">
                        {tokenHoldings.map((token, index) => (
                          <li key={index}>
                            <p className="font-semibold">
                              {token.name} ({token.symbol})
                            </p>
                            <p>{token.amount}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No token holdings available.</p>
                    )}
                  </div>
                )}
              </div>
              </div>
            </div>

            <div className="bg-white text-gray-900 rounded-lg p-6">
              <h3 className="text-xl mb-4 font-bold">
                More information
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-bold">
                    Private name tag:
                  </span>
                  <span className="bg-[#F5B056] text-gray-800 px-3 py-1 rounded-md">
                  {addressInfo.privateNameTag || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">First seen:</span>
                  <span>{addressInfo.firstSeen || "N/A"}</span>
                  </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-bold">Last seen:</span>
                  <span>{addressInfo.lastSeen || "N/A"}</span>
                  </div>
                  <div>
      <p className="text-gray-600 mb-1 font-bold">Funded by:</p>
      <a href="#" className="text-blue-500 hover:underline">
        {addressInfo.fundedBy || "N/A"}
      </a>
    </div>
                <div>
                  <p className="text-gray-600 mb-1 font-bold">
                    Multichain info:
                  </p>
                  <span className="bg-[#F5B056] text-gray-800 px-3 py-1 rounded-md inline-block">
                  {addressInfo.multichainInfo || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      
      {/* Transaction graph and history buttons */}
      <div className="flex justify-between items-center w-full bg-[#1a2b4b] p-4 border-b border-blue-700">
        <div className="flex space-x-2">
          <Button 
            onClick={() => setActiveView("transaction")}
            className={`font-bold py-2 px-4 rounded-t-lg transition duration-200 ease-in-out ${
              activeView === "transaction" 
                ? "bg-white text-[#1a2b4b]" 
                : "bg-transparent text-white hover:bg-blue-600"
            }`}
          >
            Transaction history
          </Button>
          <Button 
            onClick={() => setActiveView("graph")}
            className={`font-bold py-2 px-4 rounded-t-lg transition duration-200 ease-in-out ${
              activeView === "graph" 
                ? "bg-white text-[#1a2b4b]" 
                : "bg-transparent text-white hover:bg-blue-600"
            }`}
          >
            Transaction Graph
          </Button>
        </div>
      </div>
 
      {/* Main content area with transaction graph and table */}
      <div className="w-full h-full flex flex-col relative z-10 font-exo2 mb-8">
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        
        <div className="flex bg-[#1C2128] px-2 py-4 border-b border-b-white">
          {/* Add header content if needed */}
        </div>
        <div className="flex-grow">
          {activeView === "transaction" ? (
            <HistoryTable address={address || ""} />
          ) : (
          <div className="flex-grow flex">
              {activeView === "graph" && (
                <div className="w-full h-[600px] border border-gray-300">
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeDoubleClick={onNodeDoubleClick}
                    onEdgeClick={onEdgeClick}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                  >
                    <Controls />
                  </ReactFlow>
                </div>
              )}
              
            </div>
          )}
        </div>

        {selectedEdge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-[#1a2b4b] px-4 sm:px-6 pb-6 rounded-lg w-full max-w-4xl mx-auto overflow-hidden">
              <div className="flex justify-between items-center mt-6 mb-4">
                <h2 className="text-white text-xl sm:text-2xl font-semibold">
                  Transaction details
                </h2>
                <button
                  onClick={() => setSelectedEdge(null)}
                  className="text-white hover:text-gray-300"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-white rounded-lg overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 w-1/2 text-gray-950 text-left whitespace-nowrap">Time (UTC)</th>
                      <th className="p-3 text-gray-950 text-left whitespace-nowrap">Hash</th>
                      <th className="p-3 text-gray-950 text-left whitespace-nowrap">From</th>
                      <th className="p-3 text-gray-950 text-left whitespace-nowrap">To</th>
                      <th className="p-3 text-gray-950 text-left whitespace-nowrap">Amount</th>
                      <th className="p-3 text-gray-950 text-left whitespace-nowrap">Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTransactions.map((transaction, index) => (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="px-3 sm:px-4 py-4 flex items-center">
                          <div className="text-gray-950 w-1/2 text-sm sm:text-base">
                            {new Date(transaction.timestamp * 1000).toLocaleString()}
                          </div>
                        </td>
                        <td className="text-gray-950 px-3 py-4 text-sm sm:text-base">
                          {transaction && transaction.hash ? (
                            <>
                              {transaction.hash.slice(0, 12)}...{transaction.hash.slice(-8)}
                            </>
                          ) : (
                            "No data"
                          )}
                        </td>
                        <td className="text-gray-950 px-3 py-4 text-sm sm:text-base">
                          {transaction && transaction.from ? (
                            <>
                              {transaction.from.slice(0, 6)}...{transaction.from.slice(-4)}
                            </>
                          ) : (
                            "No data"
                          )}
                        </td>
                        <td className="text-gray-950 px-3 py-4 text-sm sm:text-base">
                          {transaction && transaction.to ? (
                            <>
                              {transaction.to.slice(0, 6)}...{transaction.to.slice(-4)}
                            </>
                          ) : (
                            "No data"
                          )}
                        </td>
                        <td className="text-gray-950 px-3 py-4 text-sm sm:text-base">{transaction.amount}</td>
                        <td className="text-gray-950 px-3 py-4 text-sm sm:text-base">{transaction.fee || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="bg-[#2a3b5b] text-gray-300 p-2 rounded hover:bg-[#3a4b6b]"
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-white">{currentPage} / {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="bg-[#2a3b5b] text-gray-300 p-2 rounded hover:bg-[#3a4b6b]"
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={handleExport}
                  className="bg-transparent border border-red-500 text-red-500 px-4 py-2 rounded flex items-center hover:bg-red-500 hover:text-white transition-colors"
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  )
}
