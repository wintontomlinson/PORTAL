'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search, Eye, Trash2, FileDown, FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { VehicleEntry, VehicleEntryMember } from '@/types/database';
import Modal from '@/components/Modal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { generatePDF } from '@/lib/pdfGenerator';
import { generateExcel } from '@/lib/excelGenerator';
import { VehicleFormData } from '@/types/database';

const btnSecondary = 'bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const btnSuccess = 'bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const btnWarning = 'bg-yellow-500 text-white px-4 py-2 rounded-md font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const inputField = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm';

export default function EntriesPage() {
  const [entries, setEntries] = useState<VehicleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // View modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewEntry, setViewEntry] = useState<(VehicleEntry & { members: VehicleEntryMember[] }) | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('vehicle_entries')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.or(
          `jathedar_name.ilike.%${search}%,vehicle_number.ilike.%${search}%,place_of_sewa.ilike.%${search}%,driver_name.ilike.%${search}%`
        );
      }

      const limit = 15;
      const offset = (page - 1) * limit;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      setEntries(data || []);
      setTotal(count || 0);
      setTotalPages(Math.ceil((count || 0) / limit));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error loading entries: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const viewEntryDetails = async (entry: VehicleEntry) => {
    setViewLoading(true);
    setShowViewModal(true);

    try {
      const { data: members, error } = await supabase
        .from('vehicle_entry_members')
        .select('*')
        .eq('entry_id', entry.id)
        .order('sr_no', { ascending: true });

      if (error) throw error;

      setViewEntry({ ...entry, members: members || [] });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error loading entry: ${message}`);
      setShowViewModal(false);
    } finally {
      setViewLoading(false);
    }
  };

  const handleDelete = async (entry: VehicleEntry) => {
    if (!confirm(`Delete entry for "${entry.jathedar_name}" (${entry.vehicle_number})?\nThis will also delete all associated members.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('vehicle_entries')
        .delete()
        .eq('id', entry.id);

      if (error) throw error;

      toast.success('Entry deleted successfully!');
      fetchEntries();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error deleting entry: ${message}`);
    }
  };

  const entryToFormData = (entry: VehicleEntry & { members: VehicleEntryMember[] }): VehicleFormData => ({
    jathedar_name: entry.jathedar_name,
    vehicle_type: entry.vehicle_type,
    place_of_sewa: entry.place_of_sewa,
    driver_name: entry.driver_name,
    vehicle_number: entry.vehicle_number,
    from_date: entry.from_date,
    to_date: entry.to_date,
    members: entry.members.map(m => ({
      sr_no: m.sr_no,
      badge_id: m.badge_id || '',
      srs_id: m.srs_id || '',
      name: m.name,
      father_husband_name: m.father_husband_name || '',
      gender: m.gender || '',
      age: m.age?.toString() || '',
      aadhar_no: m.aadhar_no || '',
      address: m.address || '',
      mobile_no: m.mobile_no || '',
    })),
  });

  const handleDownloadPDF = async (entry: VehicleEntry) => {
    try {
      const { data: members } = await supabase
        .from('vehicle_entry_members')
        .select('*')
        .eq('entry_id', entry.id)
        .order('sr_no', { ascending: true });

      const formData = entryToFormData({ ...entry, members: members || [] });
      generatePDF(formData);
      toast.success('PDF generated!');
    } catch {
      toast.error('Error generating PDF');
    }
  };

  const handleDownloadExcel = async (entry: VehicleEntry) => {
    try {
      const { data: members } = await supabase
        .from('vehicle_entry_members')
        .select('*')
        .eq('entry_id', entry.id)
        .order('sr_no', { ascending: true });

      const formData = entryToFormData({ ...entry, members: members || [] });
      generateExcel(formData);
      toast.success('Excel generated!');
    } catch {
      toast.error('Error generating Excel');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Entries</h1>
          <p className="text-gray-600">Total: {total} entries</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className={`${inputField} pl-10`}
            placeholder="Search by Jathedar name, vehicle number, place, or driver..."
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading entries..." />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left">Jathedar</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Vehicle</th>
                  <th className="border border-gray-300 px-3 py-2 text-left hidden md:table-cell">Place of Sewa</th>
                  <th className="border border-gray-300 px-3 py-2 text-left hidden lg:table-cell">Driver</th>
                  <th className="border border-gray-300 px-3 py-2 text-center hidden sm:table-cell">Dates</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="border border-gray-300 px-3 py-8 text-center text-gray-500">
                      No entries found. {search ? 'Try a different search.' : 'Create your first vehicle entry.'}
                    </td>
                  </tr>
                ) : (
                  entries.map(entry => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 font-medium">{entry.jathedar_name}</td>
                      <td className="border border-gray-300 px-3 py-2">
                        <div>
                          <span className="font-mono text-xs">{entry.vehicle_number}</span>
                          <br />
                          <span className="text-gray-500 text-xs">{entry.vehicle_type}</span>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 hidden md:table-cell">{entry.place_of_sewa}</td>
                      <td className="border border-gray-300 px-3 py-2 hidden lg:table-cell">{entry.driver_name}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center text-xs hidden sm:table-cell">
                        {entry.from_date} → {entry.to_date}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => viewEntryDetails(entry)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(entry)}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Download PDF"
                          >
                            <FileDown size={16} />
                          </button>
                          <button
                            onClick={() => handleDownloadExcel(entry)}
                            className="p-1 text-yellow-600 hover:text-yellow-800"
                            title="Download Excel"
                          >
                            <FileSpreadsheet size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(entry)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages} ({total} records)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`${btnSecondary} flex items-center gap-1 text-sm`}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`${btnSecondary} flex items-center gap-1 text-sm`}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* View Entry Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => { setShowViewModal(false); setViewEntry(null); }}
        title="Vehicle Entry Details"
        size="xl"
      >
        {viewLoading ? (
          <LoadingSpinner text="Loading details..." />
        ) : viewEntry ? (
          <div className="space-y-4">
            {/* Entry Header */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Jathedar:</span>
                <p>{viewEntry.jathedar_name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Vehicle Type:</span>
                <p>{viewEntry.vehicle_type}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Place of Sewa:</span>
                <p>{viewEntry.place_of_sewa}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Driver:</span>
                <p>{viewEntry.driver_name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Vehicle No:</span>
                <p className="font-mono">{viewEntry.vehicle_number}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Dates:</span>
                <p>{viewEntry.from_date} → {viewEntry.to_date}</p>
              </div>
            </div>

            {/* Members Table */}
            <div className="overflow-x-auto">
              <h4 className="font-medium text-gray-900 mb-2">Members ({viewEntry.members.length})</h4>
              <table className="w-full border-collapse border border-gray-300 text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-1">Sr.</th>
                    <th className="border border-gray-300 px-2 py-1">Badge ID</th>
                    <th className="border border-gray-300 px-2 py-1">Name</th>
                    <th className="border border-gray-300 px-2 py-1">Father/Husband</th>
                    <th className="border border-gray-300 px-2 py-1">M/F</th>
                    <th className="border border-gray-300 px-2 py-1">Age</th>
                    <th className="border border-gray-300 px-2 py-1">Mobile</th>
                  </tr>
                </thead>
                <tbody>
                  {viewEntry.members.map(member => (
                    <tr key={member.id}>
                      <td className="border border-gray-300 px-2 py-1 text-center">{member.sr_no}</td>
                      <td className="border border-gray-300 px-2 py-1 font-mono">{member.badge_id || '-'}</td>
                      <td className="border border-gray-300 px-2 py-1">{member.name}</td>
                      <td className="border border-gray-300 px-2 py-1">{member.father_husband_name || '-'}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{member.gender || '-'}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{member.age || '-'}</td>
                      <td className="border border-gray-300 px-2 py-1">{member.mobile_no || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => {
                  if (viewEntry) {
                    generatePDF(entryToFormData(viewEntry));
                    toast.success('PDF generated!');
                  }
                }}
                className={`${btnSuccess} flex items-center gap-1 text-sm`}
              >
                <FileDown size={14} /> Download PDF
              </button>
              <button
                onClick={() => {
                  if (viewEntry) {
                    generateExcel(entryToFormData(viewEntry));
                    toast.success('Excel generated!');
                  }
                }}
                className={`${btnWarning} flex items-center gap-1 text-sm`}
              >
                <FileSpreadsheet size={14} /> Download Excel
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
