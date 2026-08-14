'use client';

import { useState, useCallback } from 'react';
import { MemberRow, VehicleFormState } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { generatePDF } from '@/lib/pdfGenerator';
import { generateExcel } from '@/lib/excelGenerator';

const emptyMember = (): MemberRow => ({
  sr_no: 1,
  badge_id: '',
  sewadar_name: '',
  father_husband_name: '',
  gender: '',
  age: '',
  aadhar_number: '',
  address: '',
  mobile_no: '',
});

const initialForm: VehicleFormState = {
  srs_id: 'GZB/UP/175/006/',
  satsang_place: 'LONI CENTRE',
  area: 'GHAZIABAD',
  jathedar_name: '',
  driver_name: '',
  vehicle_type: '',
  vehicle_no: '',
  place_of_sewa: '',
  bhati_type: '',
  from_date: '',
  to_date: '',
  members: [emptyMember()],
};

export default function HomePage() {
  const [form, setForm] = useState<VehicleFormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const updateField = (field: keyof VehicleFormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateMember = (index: number, field: keyof MemberRow, value: string) => {
    setForm(prev => {
      const members = [...prev.members];
      members[index] = { ...members[index], [field]: value };
      return { ...prev, members };
    });
  };

  const addRow = () => {
    setForm(prev => ({
      ...prev,
      members: [...prev.members, { ...emptyMember(), sr_no: prev.members.length + 1 }],
    }));
  };

  const removeRow = (index: number) => {
    if (form.members.length <= 1) return;
    setForm(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index).map((m, i) => ({ ...m, sr_no: i + 1 })),
    }));
  };

  // AUTO-FILL: Badge ID se saari details fetch karo
  const lookupBadge = useCallback(async (index: number) => {
    const badgeId = form.members[index].badge_id.trim();
    if (!badgeId) return;

    // Set loading
    setForm(prev => {
      const members = [...prev.members];
      members[index] = { ...members[index], loading: true };
      return { ...prev, members };
    });

    try {
      const { data, error } = await supabase
        .from('sewadars')
        .select('*')
        .eq('badge_id', badgeId)
        .single();

      if (error || !data) {
        setMessage(`❌ Badge ID "${badgeId}" not found!`);
        setTimeout(() => setMessage(''), 3000);
        setForm(prev => {
          const members = [...prev.members];
          members[index] = { ...members[index], loading: false };
          return { ...prev, members };
        });
        return;
      }

      // Auto-fill all fields
      setForm(prev => {
        const members = [...prev.members];
        members[index] = {
          ...members[index],
          sewadar_name: data.sewadar_name || '',
          father_husband_name: data.father_husband_name || '',
          gender: data.gender || '',
          age: data.age?.toString() || '',
          aadhar_number: data.aadhar_number || '',
          address: data.address || '',
          mobile_no: data.contact_no || '',
          loading: false,
        };
        return { ...prev, members };
      });

      setMessage(`✅ ${data.sewadar_name} auto-filled!`);
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setForm(prev => {
        const members = [...prev.members];
        members[index] = { ...members[index], loading: false };
        return { ...prev, members };
      });
      setMessage('❌ Error fetching data');
      setTimeout(() => setMessage(''), 3000);
    }
  }, [form.members]);

  const handleSave = async () => {
    if (!form.jathedar_name || !form.place_of_sewa || !form.from_date || !form.to_date) {
      setMessage('❌ Please fill Jathedar Name, Place of Sewa, From & To dates');
      setTimeout(() => setMessage(''), 4000);
      return;
    }

    setSaving(true);
    try {
      const { data: entry, error: entryErr } = await supabase
        .from('vehicle_entries')
        .insert({
          srs_id: form.srs_id,
          satsang_place: form.satsang_place,
          area: form.area,
          jathedar_name: form.jathedar_name,
          driver_name: form.driver_name,
          vehicle_type: form.vehicle_type,
          vehicle_no: form.vehicle_no,
          place_of_sewa: form.place_of_sewa,
          bhati_type: form.bhati_type,
          from_date: form.from_date,
          to_date: form.to_date,
        })
        .select()
        .single();

      if (entryErr) throw entryErr;

      const validMembers = form.members.filter(m => m.sewadar_name.trim());
      if (validMembers.length > 0) {
        const { error: memErr } = await supabase
          .from('vehicle_entry_members')
          .insert(validMembers.map((m, i) => ({
            entry_id: entry.id,
            sr_no: i + 1,
            badge_id: m.badge_id || null,
            sewadar_name: m.sewadar_name,
            father_husband_name: m.father_husband_name || null,
            gender: m.gender || null,
            age: m.age ? parseInt(m.age) : null,
            aadhar_number: m.aadhar_number || null,
            address: m.address || null,
            mobile_no: m.mobile_no || null,
          })));
        if (memErr) throw memErr;
      }

      setMessage('✅ Entry saved successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setMessage(`❌ Error: ${msg}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    if (confirm('Clear the entire form?')) {
      setForm(initialForm);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4">
      {/* Message Toast */}
      {message && (
        <div className="fixed top-16 right-4 z-50 bg-white border border-gray-300 shadow-lg rounded-lg px-4 py-3 text-sm font-medium">
          {message}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4 no-print">
        <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Saving...' : '💾 Save Entry'}
        </button>
        <button onClick={() => generatePDF(form)} className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700">
          📄 Download PDF
        </button>
        <button onClick={() => generateExcel(form)} className="bg-yellow-600 text-white px-4 py-2 rounded font-medium hover:bg-yellow-700">
          📊 Download Excel
        </button>
        <button onClick={() => window.print()} className="bg-gray-600 text-white px-4 py-2 rounded font-medium hover:bg-gray-700">
          🖨️ Print
        </button>
        <button onClick={handleClear} className="bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700">
          🗑️ Clear
        </button>
      </div>

      {/* ===== FORM MATCHING MASTERFILE FORMAT ===== */}
      <div className="bg-white border-2 border-black print-area" id="printArea">

        {/* Header */}
        <div className="text-center border-b-2 border-black py-3">
          <p className="text-sm font-bold">SATSANG CENTRES IN INDIA</p>
          <p className="text-lg font-bold">NOMINAL ROLL SEWA JATHA</p>
          <div className="mt-1">
            <input
              type="text"
              value={form.srs_id}
              onChange={e => updateField('srs_id', e.target.value)}
              className="text-center text-sm font-medium border-b border-gray-400 outline-none w-80 py-0.5"
              placeholder="GZB/UP/175/006/2026814/1"
            />
          </div>
        </div>

        {/* Form Fields - matching Excel layout */}
        <div className="p-4 space-y-2 text-sm border-b-2 border-black">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold whitespace-nowrap">Name of Satsang Place:</span>
              <input type="text" value={form.satsang_place} onChange={e => updateField('satsang_place', e.target.value)}
                className="flex-1 border-b border-gray-400 outline-none px-1 py-0.5 font-medium" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold whitespace-nowrap">Area:</span>
              <input type="text" value={form.area} onChange={e => updateField('area', e.target.value)}
                className="flex-1 border-b border-gray-400 outline-none px-1 py-0.5" />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold whitespace-nowrap">Name of Jathedar:</span>
              <input type="text" value={form.jathedar_name} onChange={e => updateField('jathedar_name', e.target.value)}
                className="flex-1 border-b border-gray-400 outline-none px-1 py-0.5 font-medium" placeholder="Enter Jathedar Name" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold whitespace-nowrap">Name of Driver:</span>
              <input type="text" value={form.driver_name} onChange={e => updateField('driver_name', e.target.value)}
                className="flex-1 border-b border-gray-400 outline-none px-1 py-0.5" placeholder="Enter Driver Name" />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold whitespace-nowrap">Type of Vehicle:</span>
              <input type="text" value={form.vehicle_type} onChange={e => updateField('vehicle_type', e.target.value)}
                className="flex-1 border-b border-gray-400 outline-none px-1 py-0.5" placeholder="BUS / TEMPO / CAR" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold whitespace-nowrap">Vehicle No.:</span>
              <input type="text" value={form.vehicle_no} onChange={e => updateField('vehicle_no', e.target.value.toUpperCase())}
                className="flex-1 border-b border-gray-400 outline-none px-1 py-0.5" placeholder="UP14XX1234" />
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold whitespace-nowrap">Place of Sewa:</span>
              <input type="text" value={form.place_of_sewa} onChange={e => updateField('place_of_sewa', e.target.value)}
                className="flex-1 border-b border-gray-400 outline-none px-1 py-0.5 font-medium" placeholder="e.g., MORADABAD" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold whitespace-nowrap">BHATI:</span>
              <input type="text" value={form.bhati_type} onChange={e => updateField('bhati_type', e.target.value)}
                className="flex-1 border-b border-gray-400 outline-none px-1 py-0.5" placeholder="e.g., FABRICATION" />
            </div>
          </div>

          {/* Row 5 - Dates */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold">FROM:</span>
              <input type="text" value={form.from_date} onChange={e => updateField('from_date', e.target.value)}
                className="border-b border-gray-400 outline-none px-1 py-0.5 w-32" placeholder="15.08.2026" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">TO:</span>
              <input type="text" value={form.to_date} onChange={e => updateField('to_date', e.target.value)}
                className="border-b border-gray-400 outline-none px-1 py-0.5 w-32" placeholder="17.08.2026" />
            </div>
          </div>

          {/* Mention line */}
          <p className="text-xs text-gray-600 italic">(Mention Beas Department or Centre As applicable)</p>
        </div>

        {/* ===== SEWADAR TABLE ===== */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black px-1 py-2 w-10 text-center">SR. No.</th>
                <th className="border border-black px-1 py-2 w-28 text-center">
                  BADGE ID
                  <br/><span className="text-[10px] text-blue-600 font-normal">(Enter &amp; press Tab)</span>
                </th>
                <th className="border border-black px-1 py-2 text-center">Name of Sewadar / Sewadarni</th>
                <th className="border border-black px-1 py-2 text-center">Father&apos;s / Husband&apos;s Name</th>
                <th className="border border-black px-1 py-2 w-12 text-center">M / F</th>
                <th className="border border-black px-1 py-2 w-10 text-center">Age</th>
                <th className="border border-black px-1 py-2 w-28 text-center">Aadhar No.</th>
                <th className="border border-black px-1 py-2 text-center">R/o Village / Town / Locality / District</th>
                <th className="border border-black px-1 py-2 w-24 text-center">Mobile No.</th>
                <th className="border border-black px-1 py-2 w-8 text-center no-print">✕</th>
              </tr>
            </thead>
            <tbody>
              {form.members.map((member, idx) => (
                <tr key={idx} className={member.loading ? 'bg-yellow-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-black px-1 py-1 text-center">{idx + 1}</td>
                  <td className="border border-black px-0.5 py-0.5">
                    <input
                      type="text"
                      value={member.badge_id}
                      onChange={e => updateMember(idx, 'badge_id', e.target.value.toUpperCase())}
                      onBlur={() => lookupBadge(idx)}
                      onKeyDown={e => { if (e.key === 'Tab' || e.key === 'Enter') { e.preventDefault(); lookupBadge(idx); } }}
                      className="w-full px-1 py-0.5 text-xs border-0 outline-none bg-transparent font-mono"
                      placeholder="GB5156GA0011"
                    />
                  </td>
                  <td className="border border-black px-0.5 py-0.5">
                    <input type="text" value={member.sewadar_name}
                      onChange={e => updateMember(idx, 'sewadar_name', e.target.value)}
                      className="w-full px-1 py-0.5 text-xs border-0 outline-none bg-transparent" placeholder="Auto-filled" />
                  </td>
                  <td className="border border-black px-0.5 py-0.5">
                    <input type="text" value={member.father_husband_name}
                      onChange={e => updateMember(idx, 'father_husband_name', e.target.value)}
                      className="w-full px-1 py-0.5 text-xs border-0 outline-none bg-transparent" placeholder="Auto-filled" />
                  </td>
                  <td className="border border-black px-0.5 py-0.5 text-center">
                    <input type="text" value={member.gender}
                      onChange={e => updateMember(idx, 'gender', e.target.value)}
                      className="w-full px-0 py-0.5 text-xs border-0 outline-none bg-transparent text-center" placeholder="M/F" />
                  </td>
                  <td className="border border-black px-0.5 py-0.5 text-center">
                    <input type="text" value={member.age}
                      onChange={e => updateMember(idx, 'age', e.target.value)}
                      className="w-full px-0 py-0.5 text-xs border-0 outline-none bg-transparent text-center" placeholder="" />
                  </td>
                  <td className="border border-black px-0.5 py-0.5">
                    <input type="text" value={member.aadhar_number}
                      onChange={e => updateMember(idx, 'aadhar_number', e.target.value)}
                      className="w-full px-1 py-0.5 text-xs border-0 outline-none bg-transparent font-mono" placeholder="Auto-filled" />
                  </td>
                  <td className="border border-black px-0.5 py-0.5">
                    <input type="text" value={member.address}
                      onChange={e => updateMember(idx, 'address', e.target.value)}
                      className="w-full px-1 py-0.5 text-xs border-0 outline-none bg-transparent" placeholder="Auto-filled" />
                  </td>
                  <td className="border border-black px-0.5 py-0.5">
                    <input type="text" value={member.mobile_no}
                      onChange={e => updateMember(idx, 'mobile_no', e.target.value)}
                      className="w-full px-1 py-0.5 text-xs border-0 outline-none bg-transparent font-mono" placeholder="Auto-filled" />
                  </td>
                  <td className="border border-black px-0.5 py-0.5 text-center no-print">
                    <button onClick={() => removeRow(idx)} className="text-red-500 hover:text-red-700 text-xs">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Row Button */}
        <div className="p-2 border-t border-black no-print">
          <button onClick={addRow} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            + Add Row
          </button>
          <span className="text-gray-500 text-xs ml-4">Total: {form.members.filter(m => m.sewadar_name.trim()).length} sewadars</span>
        </div>

        {/* Footer Section - Signatures */}
        <div className="p-4 border-t-2 border-black">
          <div className="grid grid-cols-2 gap-8 mt-8">
            <div className="text-center">
              <div className="border-b border-black w-48 mx-auto mb-1"></div>
              <p className="text-xs font-bold">(Signature of Jathedar)</p>
            </div>
            <div className="text-center">
              <div className="border-b border-black w-48 mx-auto mb-1"></div>
              <p className="text-xs font-bold">(Signature of Functionary)</p>
              <p className="text-xs">(Affix Rubber Stamp)</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 mt-4 text-xs">
            <div>
              <p>Date: _______________</p>
              <p className="mt-1">Contact No.: _______________</p>
            </div>
            <div>
              <p>Date: _______________</p>
              <p className="mt-1">Contact No.: _______________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
