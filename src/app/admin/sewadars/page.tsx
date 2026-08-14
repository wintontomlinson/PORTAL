'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Sewadar } from '@/types/database';
import * as XLSX from 'xlsx';

export default function SewadarsPage() {
  const [sewadars, setSewadars] = useState<Sewadar[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [importing, setImporting] = useState(false);

  // Add form
  const [addForm, setAddForm] = useState({
    badge_id: '', sewadar_name: '', father_husband_name: '', gender: 'MALE',
    age: '', blood_group: '', badge_status: 'OPEN', aadhar_number: '',
    department: '', address: '', contact_no: '', emergency_contact: '', dob: '',
  });

  const fetchSewadars = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('sewadars').select('*').order('sewadar_name');
      if (search) {
        query = query.or(`badge_id.ilike.%${search}%,sewadar_name.ilike.%${search}%,contact_no.ilike.%${search}%`);
      }
      const { data, error } = await query.limit(100);
      if (error) throw error;
      setSewadars(data || []);
    } catch {
      setMessage('❌ Error loading sewadars');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchSewadars(); }, [fetchSewadars]);

  const handleAdd = async () => {
    if (!addForm.badge_id || !addForm.sewadar_name) {
      setMessage('❌ Badge ID and Name are required');
      return;
    }
    try {
      const { error } = await supabase.from('sewadars').insert({
        ...addForm,
        age: addForm.age ? parseInt(addForm.age) : null,
      });
      if (error) throw error;
      setMessage('✅ Sewadar added!');
      setShowAdd(false);
      setAddForm({ badge_id: '', sewadar_name: '', father_husband_name: '', gender: 'MALE', age: '', blood_group: '', badge_status: 'OPEN', aadhar_number: '', department: '', address: '', contact_no: '', emergency_contact: '', dob: '' });
      fetchSewadars();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      setMessage(`❌ ${msg}`);
    }
    setTimeout(() => setMessage(''), 4000);
  };

  const handleDelete = async (s: Sewadar) => {
    if (!confirm(`Delete ${s.sewadar_name} (${s.badge_id})?`)) return;
    try {
      const { error } = await supabase.from('sewadars').delete().eq('id', s.id);
      if (error) throw error;
      setMessage('✅ Deleted');
      fetchSewadars();
    } catch {
      setMessage('❌ Error deleting');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  // BULK IMPORT from Excel (LONI DATA format)
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

      const colMap: Record<string, string> = {
        'Badge_Number': 'badge_id', 'Badge ID': 'badge_id', 'BADGE ID': 'badge_id', 'badge_id': 'badge_id',
        'Sewadar_Name': 'sewadar_name', 'Name': 'sewadar_name', 'name': 'sewadar_name',
        'Father_Husband_Name': 'father_husband_name', "Father's / Husband's Name": 'father_husband_name',
        'DOB': 'dob', 'Gender': 'gender', 'Blood Group': 'blood_group', 'Blood_Group': 'blood_group',
        'Badge_Status': 'badge_status', 'Badge Status': 'badge_status',
        'Aadhar Number': 'aadhar_number', 'Aadhar_Number': 'aadhar_number', 'Aadhar No.': 'aadhar_number',
        'Department': 'department', 'Address': 'address',
        'Contact_No': 'contact_no', 'Mobile No.': 'contact_no', 'Mobile': 'contact_no',
        'Emergency_Contact': 'emergency_contact', 'Age': 'age',
      };

      let inserted = 0, updated = 0;

      for (const row of rows) {
        const mapped: Record<string, string | number | null> = {};
        Object.entries(row).forEach(([key, val]) => {
          const field = colMap[key.trim()];
          if (field && val !== undefined && val !== null) {
            mapped[field] = String(val).trim();
          }
        });

        if (!mapped.badge_id || !mapped.sewadar_name) return;

        // Parse age
        if (mapped.age) mapped.age = parseInt(String(mapped.age)) || null;

        const { data: existing } = await supabase
          .from('sewadars').select('id').eq('badge_id', mapped.badge_id).single();

        if (existing) {
          await supabase.from('sewadars').update(mapped).eq('badge_id', mapped.badge_id);
          updated++;
        } else {
          await supabase.from('sewadars').insert(mapped);
          inserted++;
        }
      }

      setMessage(`✅ Import done! ${inserted} added, ${updated} updated`);
      fetchSewadars();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      setMessage(`❌ Import failed: ${msg}`);
    } finally {
      setImporting(false);
      e.target.value = '';
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // EXPORT
  const handleExport = async () => {
    const { data } = await supabase.from('sewadars').select('*').order('sewadar_name');
    if (!data) return;

    const exportData = data.map((s, i) => ({
      'S.No': i + 1,
      'Badge_Number': s.badge_id,
      'Sewadar_Name': s.sewadar_name,
      'Father_Husband_Name': s.father_husband_name || '',
      'DOB': s.dob || '',
      'Gender': s.gender || '',
      'Blood Group': s.blood_group || '',
      'Badge_Status': s.badge_status || '',
      'Aadhar Number': s.aadhar_number || '',
      'Department': s.department || '',
      'Address': s.address || '',
      'Contact_No': s.contact_no || '',
      'Emergency_Contact': s.emergency_contact || '',
      'Age': s.age || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wbb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wbb, ws, 'LONI DATA');
    XLSX.writeFile(wbb, `LONI_DATA_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {message && <div className="fixed top-16 right-4 z-50 bg-white border shadow-lg rounded px-4 py-3 text-sm font-medium">{message}</div>}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-xl font-bold">Sewadar Database (LONI DATA)</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd(!showAdd)} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium">
            ➕ Add Sewadar
          </button>
          <button onClick={handleExport} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium">
            📥 Export Excel
          </button>
          <label className="bg-yellow-600 text-white px-3 py-1.5 rounded text-sm font-medium cursor-pointer">
            📤 {importing ? 'Importing...' : 'Import Excel'}
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" disabled={importing} />
          </label>
        </div>
      </div>

      {/* Search */}
      <input
        type="text" value={search} onChange={e => setSearch(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-4 text-sm" placeholder="🔍 Search by Badge ID, Name, or Mobile..."
      />

      {/* Add Form */}
      {showAdd && (
        <div className="bg-blue-50 border rounded p-4 mb-4">
          <h3 className="font-bold mb-3">Add New Sewadar</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <input placeholder="Badge ID *" value={addForm.badge_id} onChange={e => setAddForm({...addForm, badge_id: e.target.value})} className="border rounded px-2 py-1.5" />
            <input placeholder="Name *" value={addForm.sewadar_name} onChange={e => setAddForm({...addForm, sewadar_name: e.target.value})} className="border rounded px-2 py-1.5" />
            <input placeholder="Father/Husband Name" value={addForm.father_husband_name} onChange={e => setAddForm({...addForm, father_husband_name: e.target.value})} className="border rounded px-2 py-1.5" />
            <select value={addForm.gender} onChange={e => setAddForm({...addForm, gender: e.target.value})} className="border rounded px-2 py-1.5">
              <option value="MALE">MALE</option><option value="FEMALE">FEMALE</option>
            </select>
            <input placeholder="Age" value={addForm.age} onChange={e => setAddForm({...addForm, age: e.target.value})} className="border rounded px-2 py-1.5" type="number" />
            <input placeholder="Blood Group" value={addForm.blood_group} onChange={e => setAddForm({...addForm, blood_group: e.target.value})} className="border rounded px-2 py-1.5" />
            <input placeholder="Aadhar No." value={addForm.aadhar_number} onChange={e => setAddForm({...addForm, aadhar_number: e.target.value})} className="border rounded px-2 py-1.5" />
            <input placeholder="Department" value={addForm.department} onChange={e => setAddForm({...addForm, department: e.target.value})} className="border rounded px-2 py-1.5" />
            <input placeholder="Contact No." value={addForm.contact_no} onChange={e => setAddForm({...addForm, contact_no: e.target.value})} className="border rounded px-2 py-1.5" />
            <input placeholder="Emergency Contact" value={addForm.emergency_contact} onChange={e => setAddForm({...addForm, emergency_contact: e.target.value})} className="border rounded px-2 py-1.5" />
            <input placeholder="Address" value={addForm.address} onChange={e => setAddForm({...addForm, address: e.target.value})} className="border rounded px-2 py-1.5 col-span-2" />
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm">Save</button>
            <button onClick={() => setShowAdd(false)} className="bg-gray-400 text-white px-4 py-1.5 rounded text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-center py-8 text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2 py-1.5">S.No</th>
                <th className="border px-2 py-1.5">Badge ID</th>
                <th className="border px-2 py-1.5">Name</th>
                <th className="border px-2 py-1.5">Father/Husband</th>
                <th className="border px-2 py-1.5">Gender</th>
                <th className="border px-2 py-1.5">Age</th>
                <th className="border px-2 py-1.5">Department</th>
                <th className="border px-2 py-1.5">Mobile</th>
                <th className="border px-2 py-1.5">Status</th>
                <th className="border px-2 py-1.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {sewadars.length === 0 ? (
                <tr><td colSpan={10} className="border px-2 py-6 text-center text-gray-500">No sewadars found. Import your LONI DATA Excel.</td></tr>
              ) : sewadars.map((s, i) => (
                <tr key={s.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border px-2 py-1 text-center">{i + 1}</td>
                  <td className="border px-2 py-1 font-mono text-blue-700">{s.badge_id}</td>
                  <td className="border px-2 py-1 font-medium">{s.sewadar_name}</td>
                  <td className="border px-2 py-1">{s.father_husband_name}</td>
                  <td className="border px-2 py-1 text-center">{s.gender}</td>
                  <td className="border px-2 py-1 text-center">{s.age}</td>
                  <td className="border px-2 py-1">{s.department}</td>
                  <td className="border px-2 py-1 font-mono">{s.contact_no}</td>
                  <td className="border px-2 py-1 text-center">
                    <span className={`text-[10px] px-1 rounded ${s.badge_status === 'PERMANENT' ? 'bg-green-100 text-green-700' : s.badge_status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {s.badge_status}
                    </span>
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <button onClick={() => handleDelete(s)} className="text-red-500 hover:text-red-700 text-xs">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-2">Showing {sewadars.length} records</p>
        </div>
      )}
    </div>
  );
}
