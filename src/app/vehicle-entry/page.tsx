'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Save, Printer, FileDown, FileSpreadsheet, Trash2, Plus, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MemberFormData, VehicleFormData } from '@/types/database';
import { validateVehicleForm, validateAadhaar, checkDuplicateBadgeIds } from '@/lib/validation';
import { generatePDF } from '@/lib/pdfGenerator';
import { generateExcel } from '@/lib/excelGenerator';

const emptyMember: MemberFormData = {
  sr_no: 1,
  badge_id: '',
  srs_id: '',
  name: '',
  father_husband_name: '',
  gender: '',
  age: '',
  aadhar_no: '',
  address: '',
  mobile_no: '',
};

const btnPrimary = 'bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const btnSecondary = 'bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const btnSuccess = 'bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const btnDanger = 'bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const btnWarning = 'bg-yellow-500 text-white px-4 py-2 rounded-md font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const inputField = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm';

export default function VehicleEntryPage() {
  const [formData, setFormData] = useState<VehicleFormData>({
    jathedar_name: '',
    vehicle_type: '',
    place_of_sewa: '',
    driver_name: '',
    vehicle_number: '',
    from_date: '',
    to_date: '',
    members: [{ ...emptyMember }],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState<number | null>(null);

  const updateHeaderField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const updateMember = (index: number, field: keyof MemberFormData, value: string) => {
    setFormData(prev => {
      const members = [...prev.members];
      members[index] = { ...members[index], [field]: value };
      return { ...prev, members };
    });
  };

  const addMember = () => {
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, { ...emptyMember, sr_no: prev.members.length + 1 }],
    }));
  };

  const removeMember = (index: number) => {
    if (formData.members.length === 1) {
      toast.error('At least one member is required');
      return;
    }
    setFormData(prev => ({
      ...prev,
      members: prev.members
        .filter((_, i) => i !== index)
        .map((m, i) => ({ ...m, sr_no: i + 1 })),
    }));
  };

  const lookupSewadar = useCallback(async (index: number, field: 'badge_id' | 'srs_id') => {
    const value = formData.members[index][field];
    if (!value.trim()) {
      toast.error(`Please enter a ${field === 'badge_id' ? 'Badge ID' : 'SRS ID'} first`);
      return;
    }

    setLookupLoading(index);
    try {
      const { data, error } = await supabase
        .from('sewadars')
        .select('*')
        .eq(field, value.trim())
        .single();

      if (error || !data) {
        toast.error('Record Not Found! Please check the ID and try again.');
        return;
      }

      setFormData(prev => {
        const members = [...prev.members];
        members[index] = {
          ...members[index],
          badge_id: data.badge_id || members[index].badge_id,
          srs_id: data.srs_id || members[index].srs_id,
          name: data.name || '',
          father_husband_name: data.father_husband_name || '',
          gender: data.gender || '',
          age: data.age?.toString() || '',
          aadhar_no: data.aadhar_no || '',
          address: data.address || '',
          mobile_no: data.mobile_no || '',
        };
        return { ...prev, members };
      });

      toast.success(`Sewadar "${data.name}" found and auto-filled!`);
    } catch {
      toast.error('Error looking up sewadar. Please try again.');
    } finally {
      setLookupLoading(null);
    }
  }, [formData.members]);

  const handleSave = async () => {
    const { valid, errors: formErrors } = validateVehicleForm(formData);
    if (!valid) {
      setErrors(formErrors);
      toast.error('Please fix the errors in the form');
      return;
    }

    const badgeIds = formData.members.map(m => m.badge_id);
    const duplicates = checkDuplicateBadgeIds(badgeIds);
    if (duplicates.length > 0) {
      toast.error(`Duplicate Badge IDs found: ${duplicates.join(', ')}`);
      return;
    }

    for (const member of formData.members) {
      if (member.aadhar_no) {
        const aadhaarResult = validateAadhaar(member.aadhar_no);
        if (!aadhaarResult.valid) {
          toast.error(`${member.name || 'Member'}: ${aadhaarResult.message}`);
          return;
        }
      }
    }

    const hasValidMember = formData.members.some(m => m.name.trim());
    if (!hasValidMember) {
      toast.error('At least one member with a name is required');
      return;
    }

    setLoading(true);
    try {
      const { data: entry, error: entryError } = await supabase
        .from('vehicle_entries')
        .insert({
          jathedar_name: formData.jathedar_name.trim(),
          vehicle_type: formData.vehicle_type.trim(),
          place_of_sewa: formData.place_of_sewa.trim(),
          driver_name: formData.driver_name.trim(),
          vehicle_number: formData.vehicle_number.trim().toUpperCase(),
          from_date: formData.from_date,
          to_date: formData.to_date,
        })
        .select()
        .single();

      if (entryError) throw entryError;

      const membersToInsert = formData.members
        .filter(m => m.name.trim())
        .map((m, i) => ({
          entry_id: entry.id,
          sr_no: i + 1,
          badge_id: m.badge_id || null,
          srs_id: m.srs_id || null,
          name: m.name.trim(),
          father_husband_name: m.father_husband_name || null,
          gender: m.gender || null,
          age: m.age ? parseInt(m.age) : null,
          aadhar_no: m.aadhar_no || null,
          address: m.address || null,
          mobile_no: m.mobile_no || null,
        }));

      const { error: membersError } = await supabase
        .from('vehicle_entry_members')
        .insert(membersToInsert);

      if (membersError) throw membersError;

      toast.success('Vehicle entry saved successfully!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Error saving entry: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generatePDF(formData);
  };

  const handleDownloadExcel = () => {
    generateExcel(formData);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the form?')) {
      setFormData({
        jathedar_name: '',
        vehicle_type: '',
        place_of_sewa: '',
        driver_name: '',
        vehicle_number: '',
        from_date: '',
        to_date: '',
        members: [{ ...emptyMember }],
      });
      setErrors({});
      toast.success('Form cleared');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vehicle Entry Form</h1>
        <p className="text-gray-600">Bhati Jatha – Radha Soami Satsang Beas, Loni Centre</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-6 no-print">
        <button onClick={handleSave} disabled={loading} className={`${btnPrimary} flex items-center gap-2`}>
          <Save size={16} /> {loading ? 'Saving...' : 'Save Entry'}
        </button>
        <button onClick={handlePrint} className={`${btnSecondary} flex items-center gap-2`}>
          <Printer size={16} /> Print
        </button>
        <button onClick={handleDownloadPDF} className={`${btnSuccess} flex items-center gap-2`}>
          <FileDown size={16} /> Download PDF
        </button>
        <button onClick={handleDownloadExcel} className={`${btnWarning} flex items-center gap-2`}>
          <FileSpreadsheet size={16} /> Download Excel
        </button>
        <button onClick={handleClear} className={`${btnDanger} flex items-center gap-2`}>
          <Trash2 size={16} /> Clear Form
        </button>
      </div>

      {/* Print Area */}
      <div className="print-area" id="printArea">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-center text-lg font-bold text-gray-900">
              RADHA SOAMI SATSANG BEAS – LONI CENTRE
            </h2>
            <h3 className="text-center text-md font-semibold text-blue-700">
              BHATI JATHA – VEHICLE ENTRY FORM
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name of Jathedar <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.jathedar_name}
                onChange={e => updateHeaderField('jathedar_name', e.target.value)}
                className={`${inputField} ${errors.jathedar_name ? 'border-red-500' : ''}`}
                placeholder="Enter Jathedar name"
              />
              {errors.jathedar_name && <p className="text-red-500 text-xs mt-1">{errors.jathedar_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type of Vehicle <span className="text-red-500">*</span></label>
              <select
                value={formData.vehicle_type}
                onChange={e => updateHeaderField('vehicle_type', e.target.value)}
                className={`${inputField} ${errors.vehicle_type ? 'border-red-500' : ''}`}
              >
                <option value="">Select vehicle type</option>
                <option value="Bus">Bus</option>
                <option value="Mini Bus">Mini Bus</option>
                <option value="Tempo Traveller">Tempo Traveller</option>
                <option value="Car">Car</option>
                <option value="Van">Van</option>
                <option value="Auto">Auto</option>
                <option value="Other">Other</option>
              </select>
              {errors.vehicle_type && <p className="text-red-500 text-xs mt-1">{errors.vehicle_type}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Place of Sewa <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.place_of_sewa}
                onChange={e => updateHeaderField('place_of_sewa', e.target.value)}
                className={`${inputField} ${errors.place_of_sewa ? 'border-red-500' : ''}`}
                placeholder="Enter place of sewa"
              />
              {errors.place_of_sewa && <p className="text-red-500 text-xs mt-1">{errors.place_of_sewa}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name of Driver <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.driver_name}
                onChange={e => updateHeaderField('driver_name', e.target.value)}
                className={`${inputField} ${errors.driver_name ? 'border-red-500' : ''}`}
                placeholder="Enter driver name"
              />
              {errors.driver_name && <p className="text-red-500 text-xs mt-1">{errors.driver_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.vehicle_number}
                onChange={e => updateHeaderField('vehicle_number', e.target.value.toUpperCase())}
                className={`${inputField} ${errors.vehicle_number ? 'border-red-500' : ''}`}
                placeholder="e.g., DL01AB1234"
              />
              {errors.vehicle_number && <p className="text-red-500 text-xs mt-1">{errors.vehicle_number}</p>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={formData.from_date}
                  onChange={e => updateHeaderField('from_date', e.target.value)}
                  className={`${inputField} ${errors.from_date ? 'border-red-500' : ''}`}
                />
                {errors.from_date && <p className="text-red-500 text-xs mt-1">{errors.from_date}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={formData.to_date}
                  onChange={e => updateHeaderField('to_date', e.target.value)}
                  className={`${inputField} ${errors.to_date ? 'border-red-500' : ''}`}
                />
                {errors.to_date && <p className="text-red-500 text-xs mt-1">{errors.to_date}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Sewadar Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">BHATI Sewadar List</h3>
            <button onClick={addMember} className={`${btnPrimary} flex items-center gap-1 text-sm no-print`}>
              <Plus size={16} /> Add Row
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-400 text-xs">
              <thead>
                <tr className="bg-blue-50">
                  <th className="border border-gray-400 px-2 py-2 text-center w-10">Sr.</th>
                  <th className="border border-gray-400 px-2 py-2 text-center w-24">Badge ID</th>
                  <th className="border border-gray-400 px-2 py-2 text-center w-24">SRS ID</th>
                  <th className="border border-gray-400 px-2 py-2 text-center min-w-[140px]">Name of Sewadar / Sewadarni</th>
                  <th className="border border-gray-400 px-2 py-2 text-center min-w-[140px]">Father&apos;s / Husband&apos;s Name</th>
                  <th className="border border-gray-400 px-2 py-2 text-center w-12">M/F</th>
                  <th className="border border-gray-400 px-2 py-2 text-center w-12">Age</th>
                  <th className="border border-gray-400 px-2 py-2 text-center w-28">Aadhar No.</th>
                  <th className="border border-gray-400 px-2 py-2 text-center min-w-[180px]">R/o Village / Town / Locality / District</th>
                  <th className="border border-gray-400 px-2 py-2 text-center w-24">Mobile No.</th>
                  <th className="border border-gray-400 px-2 py-2 text-center w-16 no-print">Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.members.map((member, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-400 px-1 py-1 text-center">{index + 1}</td>
                    <td className="border border-gray-400 px-1 py-1">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={member.badge_id}
                          onChange={e => updateMember(index, 'badge_id', e.target.value)}
                          className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                          placeholder="Badge ID"
                        />
                        <button
                          onClick={() => lookupSewadar(index, 'badge_id')}
                          disabled={lookupLoading === index}
                          className="p-0.5 text-blue-600 hover:text-blue-800 no-print flex-shrink-0"
                          title="Search by Badge ID"
                        >
                          <Search size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="border border-gray-400 px-1 py-1">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={member.srs_id}
                          onChange={e => updateMember(index, 'srs_id', e.target.value)}
                          className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                          placeholder="SRS ID"
                        />
                        <button
                          onClick={() => lookupSewadar(index, 'srs_id')}
                          disabled={lookupLoading === index}
                          className="p-0.5 text-blue-600 hover:text-blue-800 no-print flex-shrink-0"
                          title="Search by SRS ID"
                        >
                          <Search size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="border border-gray-400 px-1 py-1">
                      <input
                        type="text"
                        value={member.name}
                        onChange={e => updateMember(index, 'name', e.target.value)}
                        className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="Name"
                      />
                    </td>
                    <td className="border border-gray-400 px-1 py-1">
                      <input
                        type="text"
                        value={member.father_husband_name}
                        onChange={e => updateMember(index, 'father_husband_name', e.target.value)}
                        className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="Father/Husband"
                      />
                    </td>
                    <td className="border border-gray-400 px-1 py-1">
                      <select
                        value={member.gender}
                        onChange={e => updateMember(index, 'gender', e.target.value)}
                        className="w-full px-0 py-0.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                      >
                        <option value="">-</option>
                        <option value="M">M</option>
                        <option value="F">F</option>
                      </select>
                    </td>
                    <td className="border border-gray-400 px-1 py-1">
                      <input
                        type="number"
                        value={member.age}
                        onChange={e => updateMember(index, 'age', e.target.value)}
                        className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="Age"
                        min="1"
                        max="150"
                      />
                    </td>
                    <td className="border border-gray-400 px-1 py-1">
                      <input
                        type="text"
                        value={member.aadhar_no}
                        onChange={e => updateMember(index, 'aadhar_no', e.target.value)}
                        className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="Aadhar No"
                        maxLength={12}
                      />
                    </td>
                    <td className="border border-gray-400 px-1 py-1">
                      <input
                        type="text"
                        value={member.address}
                        onChange={e => updateMember(index, 'address', e.target.value)}
                        className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="Village/Town/District"
                      />
                    </td>
                    <td className="border border-gray-400 px-1 py-1">
                      <input
                        type="text"
                        value={member.mobile_no}
                        onChange={e => updateMember(index, 'mobile_no', e.target.value)}
                        className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="Mobile"
                        maxLength={10}
                      />
                    </td>
                    <td className="border border-gray-400 px-1 py-1 text-center no-print">
                      <button
                        onClick={() => removeMember(index)}
                        className="p-1 text-red-500 hover:text-red-700"
                        title="Remove row"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600 no-print">
            <span>Total Members: {formData.members.filter(m => m.name.trim()).length}</span>
            <button onClick={addMember} className="text-blue-600 hover:text-blue-800 font-medium">
              + Add Another Row
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
