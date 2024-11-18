"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';


const Navbar: React.FC = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [walletAddress, setwalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (walletAddress) {
      setIsLoading(true);
      try {
        // Gọi API để lấy và lưu transactions vào Neo4j
        const response = await fetch(`/api/transactions?address=${encodeURIComponent(walletAddress)}`);
        const data = await response.json();

        if (data.success) {
          // Nếu thành công, chuyển hướng đến trang wallet_address
          router.push(`/wallet_address?address=${encodeURIComponent(walletAddress)}`);
          setwalletAddress('');
        } else {
          console.error('Error fetching transactions:', data.message);
          // alert('Error fetching wallet data. Please try again.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error fetching wallet data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    router.push(`/wallet_address?address=${walletAddress}`)

  };

  return (
    <nav className="bg-[#161A20] text-[#FFFFFF] shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/fullogo.svg"
                alt="JBIZ Logo"
                width={60}
                height={80}
                className="mr-2"
              />
            </Link>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex flex-1 justify-evenly items-center font-quantico text-[#FFFFFF]">
            <Link href="/" className="hover:text-[#F5B056]">Home</Link>
            <Link href="/transaction" className="hover:text-[#F5B056]">Transaction</Link>
            <Link href="/aboutus" className="hover:text-[#F5B056]">About us</Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl ml-8">
            <form onSubmit={handleSearch} className="relative font-quantico w-full">
              <input
                type="text"
                placeholder="Search by address / Txn Hash / Block / Token / Domain"
                className="w-full py-2 pl-10 pr-4 text-gray-700 bg-gray-100 rounded-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#F5B056]"
                value={walletAddress}
                onChange={(e) => setwalletAddress(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="absolute inset-y-0 left-0 flex items-center pl-3"
                disabled={isLoading}
                aria-label="Search"
              >
                <Search className={`h-5 w-5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

            </form>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#F5B056] hover:text-[#FFFFFF] focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;