'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2, Upload, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Sewadar } from '@/types/database';
import Modal from '@/components/Modal';
import LoadingSpinner from '@/components/LoadingSpinner';
import * as XLSX from 'xlsx';

const btnPrimary = 'bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const btnSecondary = 'bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const btnSuccess = 'bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const inputField = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm';

function SewadarsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'list';

  const [sewadars, setSewadars] = useState<Sewadar[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState(initialTab);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSewadar, setEditingSewadar] = useState<Sewadar | null>(null);
  const [formData, setFormData] = useState({
    badge_id: '',
    srs_id: '',
    name: '',
    father_husband_name: '',
    gender: '',
    age: '',
    aadhar_no: '',
    address: '',
    mobile_no: '',
  });

  // Import states
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    total: number;
    inserted: number;
    updated: number;
    errors?: string[];
  } | null>(null);

  const fetchSewadars = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('sewadars')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.or(
          `badge_id.ilike.%${search}%,srs_id.ilike.%${search}%,name.ilike.%${search}%,mobile_no.ilike.%${search}%`
        );
      }

      const limit = 20;
      const offset = (page - 1) * limit;

      const { data, error, count } = await query
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      setSewadars(data || []);
      setTotal(count || 0);
      setTotalPages(Math.ceil((count || 0) / limit));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error loading sewadars: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchSewadars();
  }, [fetchSewadars]);

  const resetForm = () => {
    setFormData({
      badge_id: '',
      srs_id: '',
      name: '',
      father_husband_name: '',
      gender: '',
      age: '',
      aadhar_no: '',
      address: '',
      mobile_no: '',
    });
  };

  const handleAdd = async () => {
    if (!formData.badge_id || !formData.name) {
      toast.error('Badge ID and Name are required');
      return;
    }

    try {
      const { error } = await supabase.from('sewadars').insert({
        badge_id: formData.badge_id,
        srs_id: formData.srs_id || null,
        name: formData.name,
        father_husband_name: formData.father_husband_name || null,
        gender: formData.gender || null,
        age: formData.age ? parseInt(formData.age) : null,
        aadhar_no: formData.aadhar_no || null,
        address: formData.address || null,
        mobile_no: formData.mobile_no || null,
      });

      if (error) {
        if (error.code === '23505') {
          toast.error('A sewadar with this Badge ID or SRS ID already exists');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Sewadar added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchSewadars();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error adding sewadar: ${message}`);
    }
  };

  const handleEdit = async () => {
    if (!editingSewadar) return;

    try {
      const { error } = await supabase
        .from('sewadars')
        .update({
          badge_id: formData.badge_id,
          srs_id: formData.srs_id || null,
          name: formData.name,
          father_husband_name: formData.father_husband_name || null,
          gender: formData.gender || null,
          age: formData.age ? parseInt(formData.age) : null,
          aadhar_no: formData.aadhar_no || null,
          address: formData.address || null,
          mobile_no: formData.mobile_no || null,
        })
        .eq('id', editingSewadar.id);

      if (error) throw error;

      toast.success('Sewadar updated successfully!');
      setShowEditModal(false);
      setEditingSewadar(null);
      resetForm();
      fetchSewadars();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error updating sewadar: ${message}`);
    }
  };

  const handleDelete = async (sewadar: Sewadar) => {
    if (!confirm(`Are you sure you want to delete "${sewadar.name}" (Badge: ${sewadar.badge_id})?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sewadars')
        .delete()
        .eq('id', sewadar.id);

      if (error) throw error;

      toast.success('Sewadar deleted successfully!');
      fetchSewadars();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error deleting sewadar: ${message}`);
    }
  };

  const openEditModal = (sewadar: Sewadar) => {
    setEditingSewadar(sewadar);
    setFormData({
      badge_id: sewadar.badge_id,
      srs_id: sewadar.srs_id || '',
      name: sewadar.name,
      father_husband_name: sewadar.father_husband_name || '',
      gender: sewadar.gender || '',
      age: sewadar.age?.toString() || '',
      aadhar_no: sewadar.aadhar_no || '',
      address: sewadar.address || '',
      mobile_no: sewadar.mobile_no || '',
    });
    setShowEditModal(true);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

      if (jsonData.length === 0) {
        toast.error('Excel file is empty');
        return;
      }

      // Column mapping
      const columnMapping: Record<string, string> = {
        'badge_id': 'badge_id', 'Badge ID': 'badge_id', 'BADGE ID': 'badge_id', 'Badge Id': 'badge_id',
        'srs_id': 'srs_id', 'SRS ID': 'srs_id', 'SRS Id': 'srs_id', 'Srs Id': 'srs_id',
        'name': 'name', 'Name': 'name', 'NAME': 'name', 'Name of Sewadar': 'name', 'Name of Sewadar / Sewadarni': 'name',
        'father_husband_name': 'father_husband_name', 'Father/Husband Name': 'father_husband_name',
        "Father's / Husband's Name": 'father_husband_name', "Father's Name": 'father_husband_name', 'Father Name': 'father_husband_name',
        'gender': 'gender', 'Gender': 'gender', 'M/F': 'gender', 'Sex': 'gender',
        'age': 'age', 'Age': 'age', 'AGE': 'age',
        'aadhar_no': 'aadhar_no', 'Aadhar No': 'aadhar_no', 'Aadhar No.': 'aadhar_no', 'Aadhaar': 'aadhar_no', 'Aadhaar No': 'aadhar_no',
        'address': 'address', 'Address': 'address', 'ADDRESS': 'address', 'R/o Village / Town / Locality / District': 'address', 'Village': 'address',
        'mobile_no': 'mobile_no', 'Mobile No': 'mobile_no', 'Mobile No.': 'mobile_no', 'Mobile': 'mobile_no', 'Phone': 'mobile_no',
      };

      let inserted = 0;
      let updated = 0;
      const errors: string[] = [];

      for (const row of jsonData) {
        const mapped: Record<string, string | null> = {};
        Object.entries(row).forEach(([key, value]) => {
          const dbField = columnMapping[key.trim()];
          if (dbField) {
            mapped[dbField] = value !== undefined && value !== null ? String(value).trim() : null;
          }
        });

        if (!mapped.badge_id || !mapped.name) continue;

        const sewadar = {
          badge_id: mapped.badge_id,
          srs_id: mapped.srs_id || null,
          name: mapped.name,
          father_husband_name: mapped.father_husband_name || null,
          gender: mapped.gender ? mapped.gender.charAt(0).toUpperCase() : null,
          age: mapped.age ? parseInt(mapped.age) : null,
          aadhar_no: mapped.aadhar_no ? mapped.aadhar_no.replace(/\D/g, '') : null,
          address: mapped.address || null,
          mobile_no: mapped.mobile_no ? mapped.mobile_no.replace(/\D/g, '') : null,
        };

        const { data: existing } = await supabase
          .from('sewadars')
          .select('id')
          .eq('badge_id', sewadar.badge_id)
          .single();

        if (existing) {
          const { error } = await supabase
            .from('sewadars')
            .update(sewadar)
            .eq('badge_id', sewadar.badge_id);

          if (error) {
            errors.push(`Update ${sewadar.badge_id}: ${error.message}`);
          } else {
            updated++;
          }
        } else {
          const { error } = await supabase
            .from('sewadars')
            .insert(sewadar);

          if (error) {
            errors.push(`Insert ${sewadar.badge_id}: ${error.message}`);
          } else {
            inserted++;
          }
        }
      }

      setImportResult({ total: jsonData.length, inserted, updated, errors: errors.length > 0 ? errors : undefined });
      toast.success(`Import complete! ${inserted} added, ${updated} updated.`);
      fetchSewadars();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Import failed: ${message}`);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleExport = async () => {
    try {
      const { data, error } = await supabase
        .from('sewadars')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      const exportData = (data || []).map(s => ({
        'Badge ID': s.badge_id,
        'SRS ID': s.srs_id || '',
        'Name': s.name,
        "Father's / Husband's Name": s.father_husband_name || '',
        'M/F': s.gender || '',
        'Age': s.age || '',
        'Aadhar No.': s.aadhar_no || '',
        'Address': s.address || '',
        'Mobile No.': s.mobile_no || '',
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      ws['!cols'] = [
        { wch: 12 }, { wch: 12 }, { wch: 25 }, { wch: 25 },
        { wch: 5 }, { wch: 5 }, { wch: 14 }, { wch: 35 }, { wch: 12 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sewadars');
      XLSX.writeFile(wb, `Sewadars_Export_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast.success('Export complete!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Export failed: ${message}`);
    }
  };

  const SewadarForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Badge ID <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.badge_id}
            onChange={e => setFormData({ ...formData, badge_id: e.target.value })}
            className={inputField}
            placeholder="Badge ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SRS ID</label>
          <input
            type="text"
            value={formData.srs_id}
            onChange={e => setFormData({ ...formData, srs_id: e.target.value })}
            className={inputField}
            placeholder="SRS ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className={inputField}
            placeholder="Full Name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Father&apos;s / Husband&apos;s Name</label>
          <input
            type="text"
            value={formData.father_husband_name}
            onChange={e => setFormData({ ...formData, father_husband_name: e.target.value })}
            className={inputField}
            placeholder="Father/Husband Name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            value={formData.gender}
            onChange={e => setFormData({ ...formData, gender: e.target.value })}
            className={inputField}
          >
            <option value="">Select</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <input
            type="number"
            value={formData.age}
            onChange={e => setFormData({ ...formData, age: e.target.value })}
            className={inputField}
            placeholder="Age"
            min="1"
            max="150"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
          <input
            type="text"
            value={formData.aadhar_no}
            onChange={e => setFormData({ ...formData, aadhar_no: e.target.value })}
            className={inputField}
            placeholder="12-digit Aadhaar"
            maxLength={12}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
          <input
            type="text"
            value={formData.mobile_no}
            onChange={e => setFormData({ ...formData, mobile_no: e.target.value })}
            className={inputField}
            placeholder="10-digit mobile"
            maxLength={10}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <textarea
          value={formData.address}
          onChange={e => setFormData({ ...formData, address: e.target.value })}
          className={inputField}
          rows={2}
          placeholder="Village / Town / Locality / District"
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button
          onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}
          className={btnSecondary}
        >
          Cancel
        </button>
        <button onClick={onSubmit} className={btnPrimary}>
          {submitLabel}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sewadar Management</h1>
          <p className="text-gray-600">Total: {total} sewadars</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button onClick={() => { resetForm(); setShowAddModal(true); }} className={`${btnPrimary} flex items-center gap-1`}>
            <Plus size={16} /> Add Sewadar
          </button>
          <button onClick={handleExport} className={`${btnSuccess} flex items-center gap-1`}>
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'list' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Sewadar List
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'import' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Bulk Import
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'export' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Bulk Export
        </button>
      </div>

      {activeTab === 'list' && (
        <>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className={`${inputField} pl-10`}
                placeholder="Search by Badge ID, SRS ID, name, or mobile..."
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <LoadingSpinner text="Loading sewadars..." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left">Badge ID</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">SRS ID</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Name</th>
                      <th className="border border-gray-300 px-3 py-2 text-left hidden md:table-cell">Father/Husband</th>
                      <th className="border border-gray-300 px-3 py-2 text-center hidden sm:table-cell">M/F</th>
                      <th className="border border-gray-300 px-3 py-2 text-center hidden sm:table-cell">Age</th>
                      <th className="border border-gray-300 px-3 py-2 text-left hidden lg:table-cell">Mobile</th>
                      <th className="border border-gray-300 px-3 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sewadars.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="border border-gray-300 px-3 py-8 text-center text-gray-500">
                          No sewadars found. {search ? 'Try a different search.' : 'Add your first sewadar.'}
                        </td>
                      </tr>
                    ) : (
                      sewadars.map(sewadar => (
                        <tr key={sewadar.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 font-mono">{sewadar.badge_id}</td>
                          <td className="border border-gray-300 px-3 py-2 font-mono">{sewadar.srs_id || '-'}</td>
                          <td className="border border-gray-300 px-3 py-2 font-medium">{sewadar.name}</td>
                          <td className="border border-gray-300 px-3 py-2 hidden md:table-cell">{sewadar.father_husband_name || '-'}</td>
                          <td className="border border-gray-300 px-3 py-2 text-center hidden sm:table-cell">{sewadar.gender || '-'}</td>
                          <td className="border border-gray-300 px-3 py-2 text-center hidden sm:table-cell">{sewadar.age || '-'}</td>
                          <td className="border border-gray-300 px-3 py-2 hidden lg:table-cell">{sewadar.mobile_no || '-'}</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => openEditModal(sewadar)}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(sewadar)}
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
        </>
      )}

      {activeTab === 'import' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Bulk Import Sewadars from Excel</h3>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="font-medium text-blue-800 mb-2">Expected Excel Columns:</h4>
              <p className="text-sm text-blue-700">
                Badge ID (required), SRS ID, Name (required), Father/Husband Name, M/F, Age, Aadhar No., Address, Mobile No.
              </p>
              <p className="text-xs text-blue-600 mt-2">
                The system will try to match common column name variations automatically.
                Existing records (by Badge ID) will be updated; new records will be created.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <label className={`${btnPrimary} flex items-center gap-2 cursor-pointer`}>
                <Upload size={16} />
                {importing ? 'Importing...' : 'Choose Excel File'}
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImport}
                  disabled={importing}
                  className="hidden"
                />
              </label>
              {importing && <LoadingSpinner size="sm" text="Processing..." />}
            </div>

            {importResult && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h4 className="font-medium text-green-800 mb-2">Import Results:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>Total records processed: {importResult.total}</li>
                  <li>New records inserted: {importResult.inserted}</li>
                  <li>Existing records updated: {importResult.updated}</li>
                </ul>
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-700">Errors:</p>
                    <ul className="text-xs text-red-600 space-y-0.5">
                      {importResult.errors.map((err, i) => (
                        <li key={i}>• {err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Bulk Export Sewadars to Excel</h3>
          <div className="space-y-4">
            <p className="text-gray-600">
              Export all sewadar records to a formatted Excel file. The file will include:
              Badge ID, SRS ID, Name, Father/Husband Name, Gender, Age, Aadhaar No., Address, Mobile No.
            </p>
            <button onClick={handleExport} className={`${btnSuccess} flex items-center gap-2`}>
              <Download size={16} /> Download Excel Export
            </button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); resetForm(); }} title="Add New Sewadar" size="lg">
        <SewadarForm onSubmit={handleAdd} submitLabel="Add Sewadar" />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingSewadar(null); resetForm(); }} title="Edit Sewadar" size="lg">
        <SewadarForm onSubmit={handleEdit} submitLabel="Update Sewadar" />
      </Modal>
    </div>
  );
}


export default function SewadarsPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading..." />}>
      <SewadarsContent />
    </Suspense>
  );
}
