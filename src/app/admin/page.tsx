'use client';

import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Panel - RSSB Loni Centre</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/" className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h3 className="font-bold text-lg text-blue-700">📝 New Vehicle Entry</h3>
          <p className="text-gray-600 text-sm mt-1">Create new Nominal Roll Sewa Jatha form</p>
        </Link>

        <Link href="/admin/sewadars" className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h3 className="font-bold text-lg text-green-700">👥 Manage Sewadars</h3>
          <p className="text-gray-600 text-sm mt-1">Add, edit, search LONI DATA sewadars</p>
        </Link>

        <Link href="/admin/sewadars#import" className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h3 className="font-bold text-lg text-yellow-700">📤 Bulk Import</h3>
          <p className="text-gray-600 text-sm mt-1">Upload Excel to import sewadar records</p>
        </Link>

        <Link href="/admin/sewadars#export" className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h3 className="font-bold text-lg text-purple-700">📥 Bulk Export</h3>
          <p className="text-gray-600 text-sm mt-1">Download all sewadars as Excel</p>
        </Link>
      </div>
    </div>
  );
}
