import type { Metadata } from "next";
import "./globals.css";
import {  Poppins } from '@next/font/google';
import Navbar from './navbar';
import Footer from './footer';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});





export const metadata: Metadata = {
  title: "JBiz - Cryto's Guiding Light",
  description: "A blockchain transaction visualization system",
  keywords: ["blockchain", "transaction", "visualization", "crypto"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/notextlogo.ico" />
      </head>
      <body
        className={` ${poppins.variable} antialiased`}
      >
        <Navbar /> {/* Thêm Navbar */}
        <main>{children}</main> {/* Nội dung chính */}
        <Footer /> {/* Thêm Footer */}
      </body>
    </html>
  );
}

