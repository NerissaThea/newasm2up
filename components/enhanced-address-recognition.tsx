/* eslint-disable */
'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ReactElement, ChangeEvent } from 'react'

interface AddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

interface RecognizedAddress {
  formatted_address: string
  components: AddressComponent[]
}

interface EthereumAddress {
  address: string
  label: string
}

export default function Component(): ReactElement {
  const [address, setAddress] = useState('')
  const [open, setOpen] = useState(false)
  const [recognizedAddress, setRecognizedAddress] = useState<RecognizedAddress | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRecentSearches()
  }, [])

  const loadRecentSearches = () => {
    try {
      const savedSearches = localStorage.getItem('recentAddressSearches')
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches))
      }
    } catch (err) {
      console.error('Error loading recent searches:', err)
      setRecentSearches([])
    }
  }

  const saveSearch = (newAddress: string) => {
    try {
      const updatedSearches = [
        newAddress,
        ...recentSearches.filter(a => a !== newAddress).slice(0, 4)
      ]
      setRecentSearches(updatedSearches)
      localStorage.setItem('recentAddressSearches', JSON.stringify(updatedSearches))
    } catch (err) {
      console.error('Error saving search:', err)
    }
  }

  const validateEthereumAddress = (addr: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr)
  }

  const handleAddressSelect = (selectedAddress: string) => {
    setAddress(selectedAddress)
    setOpen(false)
    setError(null)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!address) {
      setError('Please enter an Ethereum address')
      return
    }

    if (!validateEthereumAddress(address)) {
      setError('Please enter a valid Ethereum address')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('dashboard/api/address/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to analyze address')
      }

      const data = await response.json()
      setRecognizedAddress(data)
      saveSearch(address)
    } catch (err) {
      console.error('Error analyzing address:', err)
      setError(err instanceof Error ? err.message : 'Error analyzing address')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white">
      <CardHeader>
        <CardTitle className='text-black'>Smart Address Recognition</CardTitle>
        <CardDescription className='text-black'>Enter an Ethereum address to see its transaction details</CardDescription>
      </CardHeader>
      <CardContent className='text-black'>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="address"
              value={address}
              onChange={handleInputChange}
              placeholder="Enter Ethereum address (0x...)"
              className="w-full"
            />
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Analyzing..." : "Analyze Address"}
          </Button>
        </form>
      </CardContent >
      {recognizedAddress && (
        <CardFooter>
          <Tabs defaultValue="components" className="w-full text-black">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="components">Address Details</TabsTrigger>
              <TabsTrigger value="recent">Recent Searches</TabsTrigger>
            </TabsList>
            <TabsContent value="components" className="space-y-4">
              <h3 className="font-semibold text-lg">Transaction Details:</h3>
              {recognizedAddress.components.map((component, index) => (
                <div key={index} className="space-y-1">
                  <div className="font-medium">
                    {component.types[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{component.long_name}</span>
                    <span>{component.short_name}</span>
                  </div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="recent">
              <h3 className="font-semibold text-lg mb-2">Recent Searches:</h3>
              {recentSearches.length > 0 ? (
                <ul className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <li
                      key={index}
                      className="text-sm hover:bg-muted p-2 rounded-md cursor-pointer"
                      onClick={() => handleAddressSelect(search)}
                    >
                      {search}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No recent searches</p>
              )}
            </TabsContent>
          </Tabs>
        </CardFooter>
      )}
    </Card>
  )
}
