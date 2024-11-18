"use client"

import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
//import { Input } from "@/components/ui/input"
import Image from "next/image"
import { Shield, BarChart2, FileText, Layout, ArrowRight, ChevronDown } from "lucide-react"
import { motion, AnimatePresence, useMotionValue, useTransform, useScroll } from 'framer-motion'
//import { useInView } from 'react-intersection-observer'
//import { ArrowRightIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from 'next/link';


interface ImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}

const FloatingImage: React.FC<ImageProps> = ({ src, alt, width, height, className }) => {
  const y = useMotionValue(0)
  const rotate = useTransform(y, [-20, 20], [-5, 5])

  return (
    <motion.div
      style={{ y, rotate }}
      animate={{ y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      className={className}
    >
      <Image src={src} alt={alt} width={width} height={height} />
    </motion.div>
  )
}

const MouseInteractiveImage: React.FC<ImageProps> = ({ src, alt, width, height, className }) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((event.clientX - centerX) / 10)
    y.set((event.clientY - centerY) / 10)
  }

  return (
    <motion.div
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
      className={className}
    >
      <Image src={src} alt={alt} width={width} height={height} />
    </motion.div>
  )
}

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  className: string
  gradient: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, className, gradient }) => (
  <div className={`rounded-2xl p-6 flex flex-col justify-between overflow-hidden relative ${className}`}>
    <div className="absolute inset-0" style={{ background: gradient, opacity: 0.8 }} />
    <div className="relative z-10 flex flex-col h-full">
      <div>
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
        <p className="text-gray-200 text-xs leading-relaxed">{description}</p>
      </div>
      <div className="mt-auto text-white opacity-90">
        {icon}
      </div>
    </div>
  </div>
)

interface InfoCardProps {
  icon: React.ReactNode
  title: string
  description: string
  cta: React.ReactNode
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, description, cta }) => (
  <div className="bg-gradient-to-br from-[#1E1E1E] to-[#2D2D2D] rounded-3xl p-8 flex flex-col items-center text-center">
    <div className="relative w-20 h-20 mb-6">
      <div className="absolute inset-0 bg-[#2A2A2A] rounded-full"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#FAB95B33] to-[#F1682133] rounded-full opacity-50 blur-[2px]"></div>
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FAB95B33] to-[#F1682133] opacity-30 backdrop-blur-md"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#FAB95B11] to-[#F1682111] backdrop-blur-sm"></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">{icon}</div>
    </div>
    <h2 className="text-white text-2xl font-bold mb-4">{title}</h2>
    <p className="text-gray-400 text-sm mb-6">{description}</p>
    <a href="#" className="text-transparent bg-clip-text bg-gradient-to-r from-[#FAB95B] to-[#F16821] hover:from-[#F16821] hover:to-[#FAB95B] transition-all duration-300 flex items-center text-sm font-medium">
      {cta} <ArrowRight className="ml-2 h-4 w-4" />
    </a>
  </div>
)

const CreateIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 8V32M8 20H32M14 14L26 26M26 14L14 26" stroke="url(#create-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="create-gradient" x1="8" y1="20" x2="32" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FAB95B" />
        <stop offset="1" stopColor="#F16821" />
      </linearGradient>
    </defs>
  </svg>
)

const LoginIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="12" width="24" height="16" rx="2" stroke="url(#login-gradient)" strokeWidth="2" />
    <path d="M12 20H28M12 16H28M12 24H28" stroke="url(#login-gradient)" strokeWidth="2" strokeLinecap="round" />
    <defs>
      <linearGradient id="login-gradient" x1="8" y1="20" x2="32" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FAB95B" />
        <stop offset="1" stopColor="#F16821" />
      </linearGradient>
    </defs>
  </svg>
)

const ManageIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 14C8 11.7909 9.79086 10 12 10H28C30.2091 10 32 11.7909 32 14V26C32 28.2091 30.2091 30 28 30H12C9.79086 30 8 28.2091 8 26V14Z" stroke="url(#manage-gradient)" strokeWidth="2" />
    <path d="M8 16H32" stroke="url(#manage-gradient)" strokeWidth="2" />
    <path d="M13 22H19" stroke="url(#manage-gradient)" strokeWidth="2" strokeLinecap="round" />
    <defs>
      <linearGradient id="manage-gradient" x1="8" y1="20" x2="32" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FAB95B" />
        <stop offset="1" stopColor="#F16821" />
      </linearGradient>
    </defs>
  </svg>
)

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "What is a transaction on the blockchain defined as?",
    answer: "A blockchain transaction is a digital record of value exchanged between parties, including sender and receiver addresses, the amount, a timestamp, a digital signature, and a unique ID. It is validated by network nodes and added to a block, ensuring transparency and security."
  },
  {
    question: "When is a transaction considered confirmed or failed?",
    answer: "A blockchain transaction is confirmed when it's included in a block and receives additional confirmations, ensuring it's secure and irreversible. It can fail due to low fees, rule violations, or smart contract errors, with status trackable via blockchain explorers."
  },
  {
    question: "What is a blockchain wallet, and how does it work?",
    answer: "A blockchain wallet is a digital tool for storing and managing cryptocurrencies. It generates a public key for receiving funds and a private key for signing transactions, ensuring security. Wallets can be software-based or hardware devices, each with varying security levels."
  },
  {
    question: "Can one wallet be used for multiple types of cryptocurrencies?",
    answer: "Yes, one wallet can be used for multiple types of cryptocurrencies, especially if it supports various blockchain protocols. Many multi-currency wallets allow users to manage different cryptocurrencies in a single interface, simplifying the process of storage and transactions.",
  }
]

export default function Component() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  //const [isHovered, setIsHovered] = useState(false)
  const [email, setEmail] = useState('')
  const { scrollY } = useScroll()
  //const controls = useAnimation()


  const trustedCompaniesRef = useRef<HTMLElement>(null)
  const exploreMoreRef = useRef<HTMLDivElement>(null);
  const receiveTransmissionsRef = useRef<HTMLElement>(null)

  const handleGetStartedClick = () => {
    trustedCompaniesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleExploreMoreClick = () => {
    exploreMoreRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Submitted email:', email)
    setEmail('')
  }

  const [, setIsTransmissionHovered] = useState(false)

  const handleRegisterNowClick = () => {
    receiveTransmissionsRef.current?.scrollIntoView({ behavior: 'smooth' })
    setIsTransmissionHovered(true)
    setTimeout(() => setIsTransmissionHovered(false), 2000) // Remove hover effect after 2 seconds
  }

  const floatAnimation = {
    x: [0, 20, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const companies = [
    { name: 'Binance', logo: '/brands/binance.svg' },
    { name: 'Solana', logo: '/brands/solana.svg' },
    { name: 'Polygon', logo: '/brands/polygon.svg' },
    { name: 'Polkadot', logo: '/brands/polkadot-logo.svg' },
    { name: 'Algorand', logo: '/brands/Igorand.svg' },
  ]

  const cryptoData = [
    { name: "Bitcoin", symbol: "BTC", price: "$56,290.30", change: "+1.68%", chart: "chart-up" },
    { name: "Ethereum", symbol: "ETH", price: "$4,284.81", change: "+4.36%", chart: "chart-up" },
    { name: "Cardano", symbol: "ADA", price: "$1.88", change: "+3.43%", chart: "chart-up" },
    { name: "Wax", symbol: "WAXP", price: "$0.97", change: "-2.62%", chart: "chart-down" },
    { name: "Polkadot", symbol: "DOT", price: "$42.22", change: "+7.56%", chart: "chart-up" },
  ]

  return (
    <div className="min-h-screen bg-[#0D0E12] text-white font-exo2">
      <main className="space-y-12 md:space-y-24 bg-[#1D222C]">
        <section className="relative min-h-screen flex flex-col items-center justify-center py-12 md:py-24 px-4 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
            style={{
              backgroundImage: "url('/homepage/bg.png')",
              opacity: 0.7,
            }}
          />
          <div className="relative z-10 text-center space-y-6 max-w-4xl px-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight font-exo2">
              We make crypto <br className="hidden sm:inline" />clear and simple
            </h1>
            <Button
              size="lg"
              className="get-started-button w-full sm:w-auto text-base sm:text-lg"
              onClick={handleGetStartedClick}
            >
              Get Started
            </Button>
          </div>
        </section>

        <section ref={trustedCompaniesRef} className="text-white py-10 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-center text-sm font-semibold uppercase tracking-wider mb-4">
              Trusted by Leading Companies Worldwide
            </h2>
            <h3 className="text-center text-2xl md:text-3xl font-bold mb-8 md:mb-12">
              USED BY THE WORLD&apos;S MOST AVERAGE COMPANIES
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
              {companies.map((company) => (
                <div key={company.name} className="w-24 md:w-32 lg:w-40">
                  <Image
                    src={company.logo}
                    alt={`${company.name} logo`}
                    width={160}
                    height={40}
                    className="max-w-full h-auto"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <InfoCard icon={<CreateIcon />} title="Discover" description="Discover detailed insights into wallet addresses, track transaction histories, and follow the movement of assets across the blockchain." cta="Get Started" />
              <InfoCard icon={<LoginIcon />} title="Track" description="Monitor real-time blockchain transactions, track the flow of assets, and verify the status of any transaction." cta={<Link href="/transaction">Find a Transaction</Link>} />
              <InfoCard icon={<ManageIcon />} title="Wallet" description="Keep track of wallet activities, view detailed transaction histories, and gain an overview of any wallet's activity." cta={<Link href="/wallet_address">Wallet Check</Link>} />
            </div>
          </div>
        </div>

        <section className="relative min-h-screen flex flex-col md:flex-row items-center bg-[#1D222C] overflow-hidden px-4 py-12 md:py-0">
          <motion.div
            animate={floatAnimation}
            className="absolute inset-y-0 left-0 w-full md:w-1/2 z-10"
          >
            <div className="relative w-full h-full">
              <Image
                src="/block security/img.svg"
                alt="Block Security"
                layout="fill"
                objectFit="contain"
                className="bg-center bg-no-repeat"
              />
            </div>
          </motion.div>
          <div className="absolute inset-0 bg-[#1D222C] z-0" />
          <div
            className="absolute inset-0 md:inset-y-0 md:left-0 md:w-1/2 z-20"
            style={{
              background: `
            radial-gradient(
              circle at 30% 50%,
              rgba(255, 107, 0, 0.4) 0%,
              rgba(255, 107, 0, 0.3) 10%,
              rgba(255, 107, 0, 0.2) 20%,
              rgba(255, 107, 0, 0.1) 30%,
              rgba(29, 34, 44, 0.1) 50%,
              rgba(29, 34, 44, 0.2) 70%,
              rgba(29, 34, 44, 0.4) 80%,
              rgba(29, 34, 44, 0.6) 90%,
              rgba(29, 34, 44, 0.9) 100%
            )
          `
            }}
          />
          <div
            className="absolute inset-0 md:inset-y-0 md:left-0 md:w-1/4 opacity-75 z-30"
            style={{
              background: `
            radial-gradient(
              circle at 25% 45%,
              rgba(255, 107, 0, 0.6) 0%,
              rgba(255, 107, 0, 0.4) 15%,
              rgba(255, 107, 0, 0.2) 30%,
              rgba(255, 107, 0, 0.1) 45%,
              rgba(29, 34, 44, 0) 60%
            )
          `
            }}
          />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-40">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <motion.div
                className="w-full aspect-square md:aspect-auto md:h-full max-h-[500px] relative"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
              </motion.div>
              <motion.div
                className="flex flex-col md:items-start justify-center py-4 md:py-6 text-left space-y-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                  24/7 access to full service customer support
                </h1>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
                  Experience round-the-clock assistance from our dedicated team. We&apos;re here to ensure your success and provide the support you need, whenever you need it.
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className="bg-white text-primary hover:bg-white/90 font-medium py-2 px-6 rounded-md transition duration-300 text-sm sm:text-base flex items-center space-x-2"
                    onClick={handleExploreMoreClick}
                  >
                    <span>Explore more</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        <div ref={exploreMoreRef} className="min-h-screen bg-[#1D222C] text-white font-exo2">
          <div className="p-4 md:p-6 space-y-32"> {/* Increased space-y value */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/path-to-your-background-image.jpg')] opacity-5 mix-blend-overlay"></div>
              <div className="max-w-4xl mx-auto relative z-10">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-center mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                  Buy and sell with the lowest<br />fees in the industry
                </h1>
                <p className="text-gray-400 text-center mb-6 text-xs sm:text-sm max-w-xl mx-auto">
                  Experience hassle-free transactions with unbeatable rates, tailored to enhance your trading success.
                </p>
                <div className="flex justify-center mb-10"> {/* Increased bottom margin */}
                  <a href="#" className="text-yellow-400 hover:text-yellow-300 transition-colors duration-300 flex items-center text-base md:text-lg font-semibold group">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </a>
                </div>
                <div className="bg-black-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm bg-opacity-75">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="py-3 px-2 md:py-4 md:px-4 text-left text-gray-400 font-semibold text-xs md:text-sm">Asset</th>
                          <th className="py-3 px-2 md:py-4 md:px-4 text-left text-gray-400 font-semibold text-xs md:text-sm">Symbol</th>
                          <th className="py-3 px-2 md:py-4 md:px-4 text-right text-gray-400 font-semibold text-xs md:text-sm">Price</th>
                          <th className="py-3 px-2 md:py-4 md:px-4 text-right text-gray-400 font-semibold text-xs md:text-sm">Change</th>
                          <th className="py-3 px-2 md:py-4 md:px-4 text-gray-400 font-semibold text-xs md:text-sm">Chart</th>
                          <th className="py-3 px-2 md:py-4 md:px-4 text-right text-gray-400 font-semibold text-xs md:text-sm">Trade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cryptoData.map((coin, index) => (
                          <tr key={coin.symbol} className={`${index !== cryptoData.length - 1 ? "border-b border-gray-700" : ""} transition-colors duration-300 hover:bg-gray-700/50`}>
                            <td className="py-3 px-2 md:py-4 md:px-4">
                              <div className="font-bold text-xs md:text-base">{coin.name}</div>
                            </td>
                            <td className="py-3 px-2 md:py-4 md:px-4">
                              <div className="text-yellow-400 font-semibold text-xs md:text-sm">{coin.symbol}</div>
                            </td>
                            <td className="py-3 px-2 md:py-4 md:px-4 text-right font-bold text-xs md:text-base">{coin.price}</td>
                            <td className={`py-3 px-2 md:py-4 md:px-4 text-right font-bold text-xs md:text-sm ${coin.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
                              {coin.change}
                            </td>
                            <td className="py-3 px-2 md:py-4 md:px-4">
                              <div className="w-full h-6 md:h-8">
                                <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
                                  <defs>
                                    <linearGradient id={`gradient-${coin.symbol}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                      <stop offset="0%" stopColor="#F16821" />
                                      <stop offset="100%" stopColor="#FAB95B" />
                                    </linearGradient>
                                  </defs>
                                  <path
                                    d={coin.chart === "chart-up" ? "M0 30 L20 15 L40 20 L60 5 L80 15 L100 0" : "M0 0 L20 15 L40 10 L60 25 L80 15 L100 30"}
                                    stroke={`url(#gradient-${coin.symbol})`}
                                    strokeWidth="2"
                                    fill="none"
                                  />
                                </svg>
                              </div>
                            </td>
                            <td className="py-3 px-2 md:py-4 md:px-4 text-right">
                              <a href="#" className="text-white hover:text-yellow-300 transition-colors duration-300 flex items-center justify-end font-semibold text-xs md:text-sm group">
                                Trade Now
                                <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4 group-hover:translate-x-1 transition-transform duration-300" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto pt-8"> {/* Added top padding */}
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">FEATURES AND BENEFITS</h2>
              <p className="text-center text-gray-400 mb-10 md:mb-12 max-w-2xl mx-auto text-sm md:text-base">
                Our platform offers a comprehensive suite of tools and features designed to empower both novice and experienced traders in the cryptocurrency market.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 max-w-6xl mx-auto">
                <FeatureCard
                  title="User-Friendly Interface"
                  description="Navigate our intuitive platform with ease, whether you're a seasoned trader or a newcomer"
                  icon={<Layout className="w-5 h-5 md:w-6 md:h-6" />}
                  className="col-span-12 md:col-span-6 min-h-[200px] md:min-h-[240px]"
                  gradient="linear-gradient(135deg, rgba(210, 105, 30, 0.5) 0%, rgba(65, 105, 225, 0.5) 100%)"
                />
                <FeatureCard
                  title="Advanced Security"
                  description="Your assets are protected with top-tier security protocols, including multi-factor authentication and cold storage"
                  icon={<Shield className="w-5 h-5 md:w-6 md:h-6" />}
                  className="col-span-12 md:col-span-6 min-h-[200px] md:min-h-[240px]"
                  gradient="linear-gradient(135deg, rgba(95, 158, 160, 0.5) 0%, rgba(65, 105, 225, 0.5) 100%)"
                />
                <FeatureCard
                  title="Real-Time Market Data"
                  description="Stay ahead with real-time updates and in-depth market analysis"
                  icon={<BarChart2 className="w-5 h-5 md:w-6 md:h-6" />}
                  className="col-span-12 md:col-span-8 min-h-[200px] md:min-h-[240px]"
                  gradient="linear-gradient(135deg, rgba(210, 105, 30, 0.5) 0%, rgba(65, 105, 225, 0.5) 100%)"
                />
                <FeatureCard
                  title="Smart Contract Integration"
                  description="Leverage the power of smart contracts for secure and transparent transactions."
                  icon={<FileText className="w-5 h-5 md:w-6 md:h-6" />}
                  className="col-span-12 md:col-span-4 min-h-[200px] md:min-h-[240px]"
                  gradient="linear-gradient(135deg, rgba(65, 105, 225, 0.4) 0%, rgba(65, 105, 225, 0.5) 100%)"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1D222C] text-white">
          <div className="py-12 md:py-16 px-4 md:px-8">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Frequently Asked Questions</h1>
              <p className="text-gray-400 text-center mb-6 md:mb-8 text-sm md:text-base">
                While sometimes overlooked, FAQ pages are an important component of most
                customer support strategies for both the customer and employee.
              </p>
              <div className="space-y-2">
                {faqData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={false}
                    animate={{ backgroundColor: openIndex === index ? "#2a2b30" : "#25262b" }}
                    className="rounded-xl overflow-hidden border border-[#2e2f34] transition-colors duration-200 relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FFA420] to-[#0048DA] opacity-15"></div>
                    <motion.div
                      className="px-4 md:px-6 py-3 md:py-4 flex justify-between items-center cursor-pointer relative z-10"
                      onClick={() => toggleQuestion(index)}
                      whileHover={{ backgroundColor: "rgba(42, 43, 48, 0.8)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className="text-base md:text-lg font-medium">{item.question}</h3>
                      <motion.div
                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-lg"
                      >
                        <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                      </motion.div>
                    </motion.div>
                    <AnimatePresence initial={false}>
                      {openIndex === index && (
                        <motion.div
                          initial="collapsed"
                          animate="open"
                          exit="collapsed"
                          variants={{
                            open: { opacity: 1, height: "auto" },
                            collapsed: { opacity: 0, height: 0 }
                          }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="relative z-10"
                        >
                          <div className="px-4 md:px-6 pb-3 md:pb-4">
                            <p className="text-gray-400 text-sm md:text-base">{item.answer}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="min-h-screen bg-[#1D222C] text-white font-exo2 overflow-hidden relative">
            <motion.div
              className="absolute inset-0 z-0"
              style={{
                y: useTransform(scrollY, [0, 1000], [0, 300]),
              }}
            >
              <MouseInteractiveImage
                src="/homepage/circles.svg"
                alt="Background Circles"
                width={1920}
                height={1080}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#1D222C] opacity-50"></div>
            </motion.div>

            <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <section className="flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0 md:space-x-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="md:w-1/2"
                  >
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
                      Take your first step into safe, secure crypto investing
                    </h1>
                    <p className="text-gray-400 mb-4 text-sm md:text-base lg:text-lg max-w-md">
                      Explore cryptocurrency safely with transparent, effective investment solutions that help you build a strong financial future.
                    </p>
                    <Button
                      className="get-started-button bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 rounded-full px-4 md:px-6 py-2 text-sm md:text-base lg:text-lg font-semibold w-full md:w-auto"
                      onClick={handleRegisterNowClick}
                    >
                      Register now
                    </Button>
                  </motion.div>

                  <FloatingImage
                    src="/img.png"
                    alt="Crypto investing concept"
                    width={600}
                    height={600}
                    className="md:w-1/2 relative h-[200px] sm:h-[250px] md:h-[300px] lg:h-[400px]"
                  />
                </section>

                <div className="mt-10 md:mt-12 max-w-md mx-auto">
                  <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight"
                  >
                    Receive transmissions
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-gray-400 mb-4 text-sm md:text-base"
                  >
                    Unsubscribe at any time.{' '}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-white hover:underline focus:outline-none">
                          Privacy policy
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 bg-[#1D222C] text-white border-gray-700">
                        <div className="space-y-2">
                          <h3 className="font-medium">Privacy Policy</h3>
                          <p className="text-sm text-gray-400">
                            We respect your privacy and are committed to protecting your personal data.
                            This policy outlines how we collect, use, and safeguard your information.
                          </p>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="text-sm text-blue-400 hover:underline">
                                Read full policy
                              </button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#2a2d31] text-white border-gray-700 max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Privacy Policy</DialogTitle>
                              </DialogHeader>
                              <ScrollArea className="max-h-[60vh] overflow-auto pr-4">
                                <div className="space-y-2">
                                  <h3 className="font-medium">Privacy Policy</h3>
                                  <p className="text-sm text-gray-400">
                                    We respect your privacy and are committed to protecting your personal data.
                                    This policy outlines how we collect, use, and safeguard your information.
                                  </p>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <button className="text-sm text-blue-400 hover:underline">
                                        Read full policy
                                      </button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-[#2a2d31] text-white border-gray-700 max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Privacy Policy</DialogTitle>
                                      </DialogHeader>
                                      <ScrollArea className="max-h-[60vh] overflow-auto pr-4">
                                        <div className="space-y-4 text-sm">
                                          <p>Last updated: October 5, 2024</p>
                                          <h3 className="text-lg font-semibold">1. Introduction</h3>
                                          <p>
                                            Welcome to CryptoInvest. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                                          </p>
                                          <h3 className="text-lg font-semibold">2. The data we collect about you</h3>
                                          <p>
                                            Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                                          </p>
                                          <ul className="list-disc pl-5 space-y-2">
                                            <li>Identity Data includes first name, last name, username or similar identifier.</li>
                                            <li>Contact Data includes email address and telephone numbers.</li>
                                            <li>Technical Data includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
                                            <li>Usage Data includes information about how you use our website, products and services.</li>
                                          </ul>
                                          <h3 className="text-lg font-semibold">3. How we use your personal data</h3>
                                          <p>
                                            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                                          </p>
                                          <ul className="list-disc pl-5 space-y-2">
                                            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                                            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                                            <li>Where we need to comply with a legal obligation.</li>
                                          </ul>
                                          <h3 className="text-lg font-semibold">4. Data security</h3>
                                          <p>
                                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                                          </p>
                                          <h3 className="text-lg font-semibold">5. Your legal rights</h3>
                                          <p>
                                            Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.
                                          </p>
                                          <h3 className="text-lg font-semibold">6. Contact us</h3>
                                          <p>
                                            If you have any questions about this privacy policy or our privacy practices, please contact us at privacy@cryptoinvest.com.
                                          </p>
                                        </div>
                                      </ScrollArea>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </motion.p>

                  <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    onSubmit={handleSubmit}
                    className="relative"
                  >
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FAB95B] to-[#F16821] rounded-lg blur opacity-100 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                      <div className="relative">
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#1a1d21] text-white placeholder-gray-500 border-0 rounded-lg focus:ring-2 focus:ring-[#F16821] py-2 md:py-3 px-3 md:px-4 transition-all duration-300 text-sm md:text-base"
                          required
                        />
                        <button
                          type="submit"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white focus:outline-none"
                          aria-label="Subscribe"
                        >
                          <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                      </div>
                    </div>
                  </motion.form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main >
    </div >
  )
}