import type { Metadata } from "next";
import "./globals.css";
import { Quantico, Poppins } from '@next/font/google';
import { Exo_2 } from '@next/font/google';
import Navbar from './navbar';
import Footer from './footer';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const exo2 = Exo_2({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-exo-2',
});

const quantico = Quantico({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-quantico',
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
        className={`${quantico.variable} ${exo2.variable} ${poppins.variable} antialiased`}
      >
        <Navbar /> {/* Thêm Navbar */}
        <main>{children}</main> {/* Nội dung chính */}
        <Footer /> {/* Thêm Footer */}
      </body>
    </html>
  );
}
