'use client';

import { useState, useCallback } from 'react';
import { MemberRow, VehicleFormState } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { generatePDF } from '@/lib/pdfGenerator';
import { generateExcel } from '@/lib/excelGenerator';

const emptyMember = (): MemberRow => ({
  sr_no: 1, badge_id: '', sewadar_name: '', father_husband_name: '',
  gender: '', age: '', aadhar_number: '', address: '', mobile_no: '',
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
  members: [emptyMember(), emptyMember(), emptyMember(), emptyMember(), emptyMember()],
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

  // AUTO-FILL by Badge ID
  const lookupBadge = useCallback(async (index: number) => {
    const badgeId = form.members[index].badge_id.trim();
    if (!badgeId) return;

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
        setMessage(`❌ Badge ID "${badgeId}" NOT FOUND!`);
        setTimeout(() => setMessage(''), 3000);
        setForm(prev => {
          const members = [...prev.members];
          members[index] = { ...members[index], loading: false };
          return { ...prev, members };
        });
        return;
      }

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

      setMessage(`✅ ${data.sewadar_name} - Auto Filled!`);
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setForm(prev => {
        const members = [...prev.members];
        members[index] = { ...members[index], loading: false };
        return { ...prev, members };
      });
    }
  }, [form.members]);

  const handleSave = async () => {
    if (!form.jathedar_name || !form.place_of_sewa) {
      setMessage('❌ Jathedar Name aur Place of Sewa required hai');
      setTimeout(() => setMessage(''), 4000);
      return;
    }
    setSaving(true);
    try {
      const { data: entry, error: entryErr } = await supabase
        .from('vehicle_entries')
        .insert({
          srs_id: form.srs_id, satsang_place: form.satsang_place, area: form.area,
          jathedar_name: form.jathedar_name, driver_name: form.driver_name,
          vehicle_type: form.vehicle_type, vehicle_no: form.vehicle_no,
          place_of_sewa: form.place_of_sewa, bhati_type: form.bhati_type,
          from_date: form.from_date, to_date: form.to_date,
        })
        .select().single();
      if (entryErr) throw entryErr;

      const validMembers = form.members.filter(m => m.sewadar_name.trim());
      if (validMembers.length > 0) {
        await supabase.from('vehicle_entry_members').insert(
          validMembers.map((m, i) => ({
            entry_id: entry.id, sr_no: i + 1, badge_id: m.badge_id || null,
            sewadar_name: m.sewadar_name, father_husband_name: m.father_husband_name || null,
            gender: m.gender || null, age: m.age ? parseInt(m.age) : null,
            aadhar_number: m.aadhar_number || null, address: m.address || null, mobile_no: m.mobile_no || null,
          }))
        );
      }
      setMessage('✅ SAVED!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err: unknown) {
      setMessage(`❌ ${err instanceof Error ? err.message : 'Error'}`);
      setTimeout(() => setMessage(''), 5000);
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-[1100px] mx-auto py-4 px-2">
      {/* Toast */}
      {message && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white border-2 border-gray-800 shadow-xl rounded px-6 py-3 text-sm font-bold">
          {message}
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-wrap gap-2 mb-3 no-print">
        <button onClick={handleSave} disabled={saving} className="bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-800 disabled:opacity-50">
          💾 SAVE
        </button>
        <button onClick={() => generatePDF(form)} className="bg-green-700 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-800">
          📄 PDF
        </button>
        <button onClick={() => generateExcel(form)} className="bg-yellow-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-yellow-700">
          📊 EXCEL
        </button>
        <button onClick={() => window.print()} className="bg-gray-700 text-white px-4 py-2 rounded text-sm font-bold hover:bg-gray-800">
          🖨️ PRINT
        </button>
        <button onClick={() => { if(confirm('Clear form?')) setForm(initialForm); }} className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-700">
          🗑️ CLEAR
        </button>
      </div>

      {/* ========== EXACT EXCEL FORMAT ========== */}
      <div className="bg-white border-2 border-black font-['Calibri',_sans-serif] text-[11px] print-area" id="printArea">

        {/* === TOP HEADER === */}
        <div className="text-center pt-6 pb-2 px-8">
          <p className="text-[12px] font-bold tracking-wide">SATSANG CENTRES IN INDIA</p>
          <p className="text-[14px] font-bold tracking-wide mt-0.5">NOMINAL ROLL SEWA JATHA</p>
          <div className="mt-1">
            <input
              type="text" value={form.srs_id} onChange={e => updateField('srs_id', e.target.value)}
              className="text-center text-[11px] font-bold border-0 border-b border-dashed border-gray-400 outline-none bg-transparent w-[300px]"
              placeholder="GZB/UP/175/006/2026814/1"
            />
          </div>
        </div>

        {/* === FORM FIELDS (exact Excel spacing) === */}
        <div className="px-8 py-3 space-y-[6px] text-[11px]">

          {/* Row: Name of Satsang Place + Area */}
          <div className="flex">
            <span className="font-bold w-[180px]">Name of Satsang Place:</span>
            <input type="text" value={form.satsang_place} onChange={e => updateField('satsang_place', e.target.value)}
              className="font-bold border-0 border-b border-dashed border-gray-400 outline-none bg-transparent w-[180px] px-1" />
            <span className="ml-auto font-bold">Area : </span>
            <input type="text" value={form.area} onChange={e => updateField('area', e.target.value)}
              className="border-0 border-b border-dashed border-gray-400 outline-none bg-transparent w-[120px] px-1" />
          </div>

          {/* Row: Name of Jathedar + Name of Driver */}
          <div className="flex">
            <span className="font-bold w-[180px]">Name of Jathedar:</span>
            <input type="text" value={form.jathedar_name} onChange={e => updateField('jathedar_name', e.target.value)}
              className="font-bold border-0 border-b border-dashed border-gray-400 outline-none bg-transparent w-[180px] px-1" placeholder="DEEPAK KUMAR" />
            <span className="ml-auto font-bold">Name of Driver: </span>
            <input type="text" value={form.driver_name} onChange={e => updateField('driver_name', e.target.value)}
              className="border-0 border-b border-dashed border-gray-400 outline-none bg-transparent w-[120px] px-1" />
          </div>

          {/* Row: Type of Vehicle + Vehicle No. */}
          <div className="flex">
            <span className="font-bold w-[180px]">Type of Vehicle:</span>
            <input type="text" value={form.vehicle_type} onChange={e => updateField('vehicle_type', e.target.value)}
              className="border-0 border-b border-dashed border-gray-400 outline-none bg-transparent w-[180px] px-1" placeholder="BUS" />
            <span className="ml-auto font-bold">Vehicle No.: </span>
            <input type="text" value={form.vehicle_no} onChange={e => updateField('vehicle_no', e.target.value.toUpperCase())}
              className="border-0 border-b border-dashed border-gray-400 outline-none bg-transparent w-[120px] px-1" />
          </div>

          {/* Row: Place of Sewa + FROM / TO */}
          <div className="flex">
            <span className="font-bold w-[180px]">Place of Sewa:</span>
            <input type="text" value={form.place_of_sewa} onChange={e => updateField('place_of_sewa', e.target.value)}
              className="font-bold border-0 border-b border-dashed border-gray-400 outline-none bg-transparent w-[180px] px-1" placeholder="MORADABAD" />
            <span className="ml-auto font-bold">FROM : </span>
            <input type="text" value={form.from_date} onChange={e => updateField('from_date', e.target.value)}
              className="border-0 border-b border-dashed border-gray-400 outline-none bg-transparent w-[90px] px-1 text-center" placeholder="15.08.2026" />
            <span className="font-bold ml-4">TO : </span>
            <input type="text" value={form.to_date} onChange={e => updateField('to_date', e.target.value)}
              className="border-0 border-b border-dashed border-gray-400 outline-none bg-transparent w-[90px] px-1 text-center" placeholder="17.08.2026" />
          </div>

          {/* Row: Mention line + BHATI type */}
          <div className="flex">
            <span className="text-[10px]">(Mention Beas Department or Centre As applicable) :</span>
            <input type="text" value={form.bhati_type} onChange={e => updateField('bhati_type', e.target.value)}
              className="ml-4 border-0 border-b border-dashed border-gray-400 outline-none bg-transparent w-[200px] px-1 font-bold" placeholder="MORADABAD: FABRICATION" />
          </div>
        </div>

        {/* === SEWADAR TABLE (exact Excel columns) === */}
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr className="bg-[#d9e2f3]">
              <th className="border border-black px-1 py-[6px] text-center w-[40px]">SR. No.</th>
              <th className="border border-black px-1 py-[6px] text-center min-w-[150px]">Name of Sewadar / Sewadarni</th>
              <th className="border border-black px-1 py-[6px] text-center min-w-[140px]">Father&apos;s / Husband&apos;s Name</th>
              <th className="border border-black px-1 py-[6px] text-center w-[40px]">M / F</th>
              <th className="border border-black px-1 py-[6px] text-center w-[35px]">Age</th>
              <th className="border border-black px-1 py-[6px] text-center w-[100px]">Aadhar No.</th>
              <th className="border border-black px-1 py-[6px] text-center min-w-[200px]">R/o Village / Town / Locality / District</th>
              <th className="border border-black px-1 py-[6px] text-center w-[90px]">Mobile No.</th>
              <th className="border border-black px-1 py-[6px] text-center w-[110px]">
                BADGE ID
                <br/><span className="text-[8px] text-blue-700 font-normal no-print">(Type &amp; press Enter)</span>
              </th>
              <th className="border border-black px-1 py-[6px] w-[20px] no-print"></th>
            </tr>
          </thead>
          <tbody>
            {form.members.map((member, idx) => (
              <tr key={idx} className={member.loading ? 'bg-yellow-100' : ''}>
                <td className="border border-black px-1 py-[3px] text-center">{idx + 1}</td>
                <td className="border border-black p-0">
                  <input type="text" value={member.sewadar_name} onChange={e => updateMember(idx, 'sewadar_name', e.target.value)}
                    className="w-full h-full px-1 py-[3px] text-[10px] border-0 outline-none bg-transparent" />
                </td>
                <td className="border border-black p-0">
                  <input type="text" value={member.father_husband_name} onChange={e => updateMember(idx, 'father_husband_name', e.target.value)}
                    className="w-full h-full px-1 py-[3px] text-[10px] border-0 outline-none bg-transparent" />
                </td>
                <td className="border border-black p-0">
                  <input type="text" value={member.gender} onChange={e => updateMember(idx, 'gender', e.target.value)}
                    className="w-full h-full px-0 py-[3px] text-[10px] border-0 outline-none bg-transparent text-center" />
                </td>
                <td className="border border-black p-0">
                  <input type="text" value={member.age} onChange={e => updateMember(idx, 'age', e.target.value)}
                    className="w-full h-full px-0 py-[3px] text-[10px] border-0 outline-none bg-transparent text-center" />
                </td>
                <td className="border border-black p-0">
                  <input type="text" value={member.aadhar_number} onChange={e => updateMember(idx, 'aadhar_number', e.target.value)}
                    className="w-full h-full px-1 py-[3px] text-[10px] border-0 outline-none bg-transparent font-mono" />
                </td>
                <td className="border border-black p-0">
                  <input type="text" value={member.address} onChange={e => updateMember(idx, 'address', e.target.value)}
                    className="w-full h-full px-1 py-[3px] text-[10px] border-0 outline-none bg-transparent" />
                </td>
                <td className="border border-black p-0">
                  <input type="text" value={member.mobile_no} onChange={e => updateMember(idx, 'mobile_no', e.target.value)}
                    className="w-full h-full px-1 py-[3px] text-[10px] border-0 outline-none bg-transparent font-mono" />
                </td>
                <td className="border border-black p-0">
                  <input type="text" value={member.badge_id}
                    onChange={e => updateMember(idx, 'badge_id', e.target.value.toUpperCase())}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); lookupBadge(idx); } }}
                    onBlur={() => { if (member.badge_id.trim()) lookupBadge(idx); }}
                    className="w-full h-full px-1 py-[3px] text-[10px] border-0 outline-none bg-transparent font-mono text-blue-800 font-bold"
                    placeholder="GB5156GA0011"
                  />
                </td>
                <td className="border border-black p-0 text-center no-print">
                  <button onClick={() => removeRow(idx)} className="text-red-500 text-[10px] px-1">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add Row */}
        <div className="px-4 py-2 no-print flex items-center gap-4">
          <button onClick={addRow} className="text-blue-700 font-bold text-[11px] hover:underline">+ Add Row</button>
          <span className="text-gray-500 text-[10px]">Total Sewadars: {form.members.filter(m => m.sewadar_name.trim()).length}</span>
        </div>

        {/* === SIGNATURE SECTION (exact Excel format) === */}
        <div className="px-8 pt-10 pb-6">
          <div className="flex justify-between">
            <div className="text-center">
              <div className="w-[200px] border-b border-black mb-1"></div>
              <p className="text-[10px] font-bold">(Signature of Jathedar)</p>
            </div>
            <div className="text-center">
              <div className="w-[200px] border-b border-black mb-1"></div>
              <p className="text-[10px] font-bold">(Signature of Functionary)</p>
              <p className="text-[9px]">(Affix Rubber Stamp)</p>
            </div>
          </div>
          <div className="flex justify-between mt-4 text-[10px]">
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
