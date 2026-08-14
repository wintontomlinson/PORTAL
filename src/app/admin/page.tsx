'use client';

import Link from 'next/link';
import { Users, FileText, Upload, Download, Database, Search } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-1">Manage sewadars, vehicle entries, and system data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sewadar Management */}
        <Link href="/admin/sewadars" className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow group">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Users className="text-green-600" size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sewadar Management</h3>
              <p className="text-sm text-gray-500">CRUD operations</p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 ml-4">
            <li>• Add new sewadar</li>
            <li>• Edit sewadar details</li>
            <li>• Delete sewadar</li>
            <li>• Search by Badge ID / SRS ID</li>
          </ul>
        </Link>

        {/* Vehicle Entries */}
        <Link href="/admin/entries" className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow group">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <FileText className="text-blue-600" size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Vehicle Entries</h3>
              <p className="text-sm text-gray-500">Form management</p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 ml-4">
            <li>• View all submitted forms</li>
            <li>• Edit entries</li>
            <li>• Delete entries</li>
            <li>• Download PDF/Excel</li>
          </ul>
        </Link>

        {/* Bulk Import */}
        <Link href="/admin/sewadars?tab=import" className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow group">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-14 h-14 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
              <Upload className="text-yellow-600" size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Bulk Import</h3>
              <p className="text-sm text-gray-500">Excel upload</p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 ml-4">
            <li>• Upload Excel file</li>
            <li>• Auto-map columns</li>
            <li>• Create/update records</li>
            <li>• View import results</li>
          </ul>
        </Link>

        {/* Bulk Export */}
        <Link href="/admin/sewadars?tab=export" className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow group">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Download className="text-purple-600" size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Bulk Export</h3>
              <p className="text-sm text-gray-500">Excel download</p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 ml-4">
            <li>• Export all sewadars to Excel</li>
            <li>• Formatted columns</li>
            <li>• Ready for offline use</li>
          </ul>
        </Link>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center">
              <Search className="text-red-600" size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Search</h3>
              <p className="text-sm text-gray-500">Find sewadars</p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 ml-4">
            <li>• Search by Badge ID</li>
            <li>• Search by SRS ID</li>
            <li>• Search by name</li>
            <li>• Search by mobile</li>
          </ul>
        </div>

        {/* Database Stats */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Database className="text-indigo-600" size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Database</h3>
              <p className="text-sm text-gray-500">PostgreSQL (Supabase)</p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 ml-4">
            <li>• Sewadars table</li>
            <li>• Vehicle entries table</li>
            <li>• Entry members table</li>
            <li>• Auto-sync enabled</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
