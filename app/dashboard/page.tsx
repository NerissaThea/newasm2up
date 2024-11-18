"use client"

import { useState, useEffect } from 'react'
import GasFeeHeatmap from '@/components/GasFeeHeatmap'
import EnhancedAddressRecognition from '@/components/enhanced-address-recognition'
import WalletFlow from '@/components/walletflow'
import ETH_price from '@/components/ETH_price'
import ETH_volume from '@/components/ETH_volume'
import Num_trans from '@/components/number_transactions'
import Num_ETH from '@/components/number_ETH_price'
import Action_add from '@/components/action_add'
import Transaction from '@/components/transaction'
import Top_transaction from '@/components/top_transaction'
import CurrentBalance from '@/components/CurrentBalance'
import TotalInflow from '@/components/TotalInflow'
import TotalOutflow from '@/components/TotalOutflow'
import { ArrowUp } from 'lucide-react'

export default function Home() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="bg-[#1C2128] min-h-screen p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10 space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-4">
        <Num_ETH />
        <Num_trans />
        <CurrentBalance />
        <TotalInflow />
        <TotalOutflow />
      </div>

      <div className="w-full">
        <EnhancedAddressRecognition />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="w-full">
          <ETH_price />
        </div>
        <div className="w-full">
          <ETH_volume />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="w-full">
          <Transaction />
        </div>
        <div className="w-full">
          <Top_transaction />
        </div>
      </div>

      <div className="w-full">
        <Action_add />
      </div>

      <div className="w-full">
        <WalletFlow />
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="w-full">
          <GasFeeHeatmap />
        </div>
        {/* Uncomment if you want to include GasPrediction
        <div className="w-full">
          <GasPrediction />
        </div>
        */}
      </div>

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 bg-primary text-primary-foreground p-2 rounded-full shadow-lg transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </main>
  )
}