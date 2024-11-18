'use client'
import NetworkStats from '@/components/ui/NetworkStats';

export default function TransactionExplorer() {
  return (
    <div className="min-h-screen bg-[#1C2128] text-white font-exo2">
      <div className="container mx-auto p-4">
        {/* Statistics cards */}
        <NetworkStats/>
      </div>

      {/* Transaction table & Pagination */}
      
    </div>
  );
}         


           