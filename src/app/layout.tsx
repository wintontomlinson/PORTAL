import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RSSB Loni Centre - Bhati Jatha Portal',
  description: 'Satsang Centres in India - Nominal Roll Sewa Jatha',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        {/* Top Nav */}
        <nav className="bg-blue-900 text-white shadow-lg no-print">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-900 font-bold text-sm">RS</span>
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">RSSB - Loni Centre</h1>
                <p className="text-blue-200 text-xs">Bhati Jatha Portal</p>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <a href="/" className="hover:text-blue-200 transition-colors">New Entry</a>
              <a href="/admin" className="hover:text-blue-200 transition-colors">Admin</a>
              <a href="/admin/sewadars" className="hover:text-blue-200 transition-colors">Sewadars</a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
