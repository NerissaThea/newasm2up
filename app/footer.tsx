import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Twitter, Instagram, Send, MessageCircle, Youtube } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#161A20] text-[#FFFFFF] py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4"> {/* Đã thay đổi đây */}
        {/* Logo and JBiz text aligned to the left */}
        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center">
            <Image
              src="/fullogo.svg"
              alt="JBIZ Logo"
              width={80}
              height={80}
              className="mr-2"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Us column */}
          <div>
            <h3 className="text-[#F5B056] font-bold text-lg md:text-xl mb-4 font-quantico">About us</h3>
            <ul className="space-y-2 font-exo2">
              <li><Link href="/aboutus" className="hover:text-[#F5B056]">About JBiz</Link></li>
              <li><Link href="#" className="hover:text-[#F5B056]">Terms of service</Link></li>
              <li><Link href="#" className="hover:text-[#F5B056]">Privacy notice</Link></li>
              <li><Link href="#" className="hover:text-[#F5B056]">Terms of service</Link></li>
              <li><Link href="#" className="hover:text-[#F5B056]">Contact us</Link></li>
            </ul>
          </div>

          {/* Products column */}
          <div>
            <h3 className="text-[#F5B056] font-bold text-lg md:text-xl mb-4 font-quantico">Products</h3>
            <ul className="space-y-2 font-exo2">
              <li><Link href="#" className="hover:text-[#F5B056]">Buy Crypto</Link></li>
              <li><Link href="#" className="hover:text-[#F5B056]">P2P trading</Link></li>
              <li><Link href="#" className="hover:text-[#F5B056]">Trade</Link></li>
              <li><Link href="#" className="hover:text-[#F5B056]">Convert</Link></li>
              <li><Link href="#" className="hover:text-[#F5B056]">JBiz wallet</Link></li>
              <li><Link href="#" className="hover:text-[#F5B056]">Web3 marketplace</Link></li>
              <li><Link href="#" className="hover:text-[#F5B056]">All cryptocurrencies</Link></li>
              <li><Link href="#" className="hover:text-[#F5B056]">Trading view</Link></li>
            </ul>
          </div>

          {/* Crypto calculation and Trade column */}
          <div>
            <h3 className="text-[#F5B056] font-bold text-lg md:text-xl mb-4 font-quantico">Crypto calculation</h3>
            <ul className="space-y-2 font-exo2">
              <li><Link href="#" className="hover:text-[#F5B056]">USDT to USD</Link></li>
              <li><Link href="#" className="hover:text-[#F5B056]">BTC to USD</Link></li>
              <li><Link href="#" className="hover:text-[#F5B056]">ETH to USD</Link></li>
            </ul>
            <h3 className="text-[#F5B056] font-bold text-lg md:text-xl mt-6 mb-4 font-quantico">Trade</h3>
            <ul className="space-y-2 font-exo2">
              <li><Link href="#" className="hover:text-[#F5B056]">Trading crypto</Link></li>
              <li><Link href="#" className="hover:text-[#F5B056]">Search transaction</Link></li>
              <li><Link href="#" className="hover:text-[#F5B056]">Transaction history</Link></li>
            </ul>
          </div>

          {/* Support and Community column */}
          <div>
            <h3 className="text-[#F5B056] font-bold text-lg md:text-xl mb-4 font-quantico">Support</h3>
            <ul className="space-y-2 font-exo2 mb-6">
              <li><Link href="#" className="hover:text-[#F5B056]">Support center</Link></li>
              <li><Link href="#" className="hover:text-[#F5B056]">Announcements</Link></li>
              <li><Link href="#" className="hover:text-[#F5B056]">Connect with JBiz</Link></li>
            </ul>
            <h3 className="text-[#F5B056] font-bold text-lg md:text-xl mb-4 font-quantico">Community</h3>
            <div className="flex flex-wrap gap-4">
              <Link href="#" className="text-gray-400 hover:text-white">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Send size={20} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <MessageCircle size={20} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Youtube size={20} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width white line */}
      <div className="border-t border-gray-700 my-6 md:my-8"></div>

      {/* Copyright */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-xs md:text-sm text-left font-exo2">
          <p>&copy; 2024 JBiz. All rights reserved</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
