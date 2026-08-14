import Link from 'next/link';
import { FileText, Users, Settings, Download, Printer, Database } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-blue-800 font-bold text-2xl">RS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Radha Soami Satsang Beas
        </h1>
        <h2 className="text-xl sm:text-2xl text-blue-700 font-semibold mb-2">
          Loni Centre
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Bhati Jatha Vehicle Entry & Sewadar Management System
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Link href="/vehicle-entry" className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">New Vehicle Entry</h3>
              <p className="text-sm text-gray-500">Create new Bhati Jatha form</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/sewadars" className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Users className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Sewadars</h3>
              <p className="text-sm text-gray-500">Add, edit, search sewadars</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/entries" className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Database className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Entries</h3>
              <p className="text-sm text-gray-500">Manage submitted forms</p>
            </div>
          </div>
        </Link>

        <Link href="/admin" className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
              <Settings className="text-yellow-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Admin Panel</h3>
              <p className="text-sm text-gray-500">Full administration dashboard</p>
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Download className="text-red-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Download Reports</h3>
              <p className="text-sm text-gray-500">PDF & Excel exports</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Printer className="text-indigo-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Print Forms</h3>
              <p className="text-sm text-gray-500">Print-ready A4 format</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Auto-fill sewadar details by Badge ID / SRS ID</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Generate PDF matching original Excel format</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Generate Excel with same layout & formatting</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Print-ready A4 forms</span>
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Bulk import sewadars from Excel</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Aadhaar & vehicle number validation</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Search sewadars by Badge ID or SRS ID</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Complete admin dashboard</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
