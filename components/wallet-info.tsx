/* eslint-disable */
"use client"

import { useState, useEffect } from "react"
import { Copy } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface AddressInfo {
  address: string
  gas: string
  balance: string
  totalSent: string
  totalReceived: string
  value: string
  firstSeen: string
  lastSeen: string
  fundedBy: string[]
  privateNameTag: string
  multichainInfo: string
  tokenHoldings: { token_symbol: string; amount: string }[]
}

interface TokenHolding {
  token_name: string
  token_symbol: string
  amount: string
  value: string
}

export default function WalletInfo() {
  const [address, setAddress] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [tokenHoldings, setTokenHoldings] = useState<TokenHolding[]>([])

  const [addressInfo, setAddressInfo] = useState<AddressInfo>({
    address: "",
    gas: "",
    balance: "",
    totalSent: "",
    totalReceived: "",
    value: "",
    firstSeen: "",
    lastSeen: "",
    fundedBy: [],
    privateNameTag: "",
    multichainInfo: "",
    tokenHoldings: []
  })

  useEffect(() => {
    const fetchAddressInfo = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/address/${address}`)
        const data = await response.json()
        if (data.success) {
          setAddressInfo(data.data)
          setTokenHoldings(data.data.tokenHoldings || [])
        }
      } catch (error) {
        console.error("Error fetching address info:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (address) {
      fetchAddressInfo()
    }
  }, [address])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>
  }

  if (!addressInfo) {
    return <div>Error loading address information</div>
  }

  return (
    <div className="rounded-lg bg-gray-900 p-6">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-700" />
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">Address</h2>
            <div className="flex items-center gap-2">
              <code className="rounded bg-gray-800 px-2 py-1 text-sm text-gray-300">
                {addressInfo.address}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyToClipboard(addressInfo.address)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-400">
                public name tag
              </span>
              <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-400">
                {addressInfo.privateNameTag}
              </span>
              <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-400">
                name
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="bg-orange-500 hover:bg-orange-600">Buy</Button>
          <Button variant="outline">Exchange</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Balance:</span>
                <span className="text-white">{addressInfo.balance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Sent:</span>
                <span className="text-white">{addressInfo.totalSent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Value:</span>
                <span className="text-white">{addressInfo.value}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Received:</span>
                <span className="text-white">{addressInfo.totalReceived}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">More information</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">First seen:</span>
                <span className="text-white">{addressInfo.firstSeen}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last seen:</span>
                <span className="text-white">{addressInfo.lastSeen}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Funded by:</span>
                <span className="text-white">{addressInfo.fundedBy[0]}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Multichain info:</span>
                <span className="rounded-full bg-orange-500/20 px-3 py-1 text-sm text-orange-500">
                  <span className="ml-2 bg-orange-600/20 text-orange-400 px-3 py-1 rounded">
                    {addressInfo.multichainInfo}
                  </span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Token Holdings</h3>
          <div className="space-y-4">
            {tokenHoldings.map((token, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-400">{token.token_symbol}:</span>
                <span className="text-white">{token.amount} ({token.value})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
