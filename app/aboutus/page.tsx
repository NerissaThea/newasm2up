import React from 'react'
import Image from 'next/image'

const AboutUs: React.FC = () => {
  const teamMembers = [
    { name: 'BAO', image: '/bao.jpg' },
    { name: 'NHI', image: '/nhi.jpg' },
    { name: 'AN', image: '/an.jpg' },
    { name: 'KHOA', image: '/akhoa.jpg' },
    { name: 'HUYEN', image: '/huyen.jpg' },
    { name: 'HAN', image: '/han.jpg' },
  ]
  const testimonials = [
    { name: 'Trinh Tran Phuong Tuan, Vietnam', image: '/tuan.jpg', text: '"Jbiz has made it easy for me to access and manage my crypto assets efficiently. The user-friendly interface and advanced trading tools have truly provided a great experience."' },
    { name: 'Jack, USA', image: '/jack.jpg', text: '"I\'m really impressed by Jbiz\'s level of security and transparency. Staking and participating in DeFi on this platform is incredibly easy and offers attractive returns."' },
    { name: 'J97, Italy', image: '/j97.jpg', text: '"The support team at Jbiz is truly outstanding. Anytime I encounter an issue, they resolve it quickly and professionally. Jbiz is not just an exchange but a friendly community."' },
  ]

  return (
    <div className="bg-[#1C2128] text-[#FFFFFF] min-h-screen p-4 sm:p-6 md:p-8 font-exo2">
      <div className="max-w-6xl mx-auto">
        {/* Introduction */}
        <section className="mb-8 md:mb-12 relative">
          <p className="text-base md:text-lg leading-relaxed text-justify p-2 md:p-4">
            <span className="text-[#F5B056] font-bold">Jbiz</span> is redefining the future of cryptocurrency with unparalleled innovation and a user-centric approach. Powered by blockchain technology, <span className="text-[#F5B056] font-bold">Jbiz</span> offers you a seamless platform to trade, invest, and grow your crypto assets with confidence. Explore an expansive selection of tokens and trading pairs, and take advantage of our state-of-the-art financial tools. From spot and margin trading to DeFi solutions, lending, and staking - <span className="text-[#F5B056] font-bold">Jbiz</span> puts the power of decentralized finance in your hands. Join millions of users across the globe and experience the future of finance with <span className="text-[#F5B056] font-bold">Jbiz</span>, where security, transparency, and opportunity converge.
          </p>
        </section>

        {/* Mission and Aims */}
        <section className="mb-8 lg:mb-12 flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
          <div className="w-full lg:w-1/2 bg-[#161A20] rounded-full p-4 sm:p-6 lg:p-8 flex items-center justify-center aspect-square" style={{ height: '300px', borderRadius: '50%' }}>
            <div className="max-w-xs">
              <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-justify text-white">
                <span className="text-[#F5B056] font-bold">Jbiz</span> aims to become a pioneering platform in the decentralized finance space, driving the widespread adoption and application of blockchain technology to billions of people worldwide, creating a transparent, fair, and borderless financial ecosystem.
              </p>
            </div>
          </div>
          <div className="w-full lg:w-1/2 bg-[#F5B056] rounded-full p-4 sm:p-6 lg:p-8 flex items-center justify-center aspect-square" style={{ height: '300px', borderRadius: '50%' }}>
            <div className="max-w-xs">
              <p className="text-sm sm:text-base lg:text-lg font-semibold text-justify text-[#161A20]">
                The mission of <span className="font-bold">Jbiz</span> is to provide users with the most advanced tools and services to trade, invest, and manage crypto assets safely and efficiently. We are committed to building a trusted platform that makes it easy for everyone to access and thrive in the world of cryptocurrency.
              </p>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-[#F5B056] mb-4 md:mb-6 font-quantico">Our Team</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-8">
            {teamMembers.map((member) => (
              <div key={member.name} className="flex flex-col items-center mb-4 md:mb-8">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-2 md:mb-4">
                  <Image
                    src={member.image}
                    alt={`${member.name}'s profile`}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </div>
                <span className="font-semibold text-center text-sm md:text-base">{member.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Notable Achievements */}
        <section className="mb-8 md:mb-12 leading-loose text-base md:text-lg">
          <h2 className="text-3xl md:text-5xl font-bold text-[#F5B056] mb-4 md:mb-6 font-quantico text-right"> Notable Achievements of JBiz</h2>
          <p className="mb-4">Since its launch, <span className="text-[#F5B056] font-bold">Jbiz</span> has achieved significant milestones, solidifying its position in the cryptocurrency and decentralized finance (DeFi) space:</p>
          <ul className="list-disc list-inside space-y-2 pl-4 md:pl-8">
            <li>Over 1 million users globally, with a presence in more than 100 countries.</li>
            <li>Ranked among the Top 10 crypto exchanges by trading volume, recognized for transparency and security.</li>
            <li>Strategic partnerships with major tech corporations and renowned blockchain projects such as Ethereum, Binance Smart Chain, and Polkadot.</li>
            <li>Recognized by media and the community with multiple awards for innovation in technology and DeFi development.</li>
            <li>Successfully launched a comprehensive DeFi ecosystem, including spot trading, margin trading, staking, and lending, helping thousands of users maximize returns on their digital assets.</li>
            <li>Sustainable growth with a clear roadmap, committed to delivering groundbreaking and innovative services in the future.</li>
          </ul>
        </section>

        {/* Testimonials */}
        <section className="mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-[#F5B056] mb-4 md:mb-6 font-quantico">Testimonials</h2>
          <div className="space-y-4 md:space-y-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4 md:p-6 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={testimonial.image}
                    alt={`${testimonial.name}'s profile`}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <p className="italic mb-2 text-sm md:text-base">{testimonial.text}</p>
                  <p className="font-semibold text-sm md:text-base">{testimonial.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Join Us */}
        <section className="text-left text-base md:text-lg">
          <h2 className="text-3xl md:text-5xl font-bold text-[#F5B056] mb-4 md:mb-6 font-quantico text-right">Join Us</h2>
          <p className="mb-4">Become a part of <span className="text-[#F5B056] font-bold">Jbiz</span> and help us redefine the future of decentralized finance. Whether you are an investor, developer, or a cryptocurrency enthusiast, you can join us and grow together.</p>
          <p className="mb-4 md:mb-8">Join us today and lead the way in the world of crypto with <span className="text-[#F5B056] font-bold">Jbiz</span>!</p>
          <h3 className="text-2xl md:text-4xl font-bold mb-4 font-quantico text-[#F5B056]">Shape the Future of Crypto Together!</h3>
          <button className="bg-[#F5B056] text-[#161A20] font-bold py-2 px-6 md:py-3 md:px-8 rounded-full hover:bg-[#161A20] hover:text-[#F5B056] transition duration-300 text-sm md:text-base">
            Get Started
          </button>
        </section>
      </div>
    </div>
  )
}

export default AboutUs