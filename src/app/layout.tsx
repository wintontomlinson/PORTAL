import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RSSB Loni Centre - Bhati Jatha Management',
  description: 'Bhati Jatha Vehicle Entry & Sewadar Management System - Radha Soami Satsang Beas, Loni Centre',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toast />
      </body>
    </html>
  );
}
