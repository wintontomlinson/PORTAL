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
  srs_id: 'GZB/UP/175/006/2026814/1',
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

  const lookupBadge = useCallback(async (index: number) => {
    const badgeId = form.members[index].badge_id.trim();
    if (!badgeId) return;
    setForm(prev => { const m = [...prev.members]; m[index] = { ...m[index], loading: true }; return { ...prev, members: m }; });

    try {
      const { data, error } = await supabase.from('sewadars').select('*').eq('badge_id', badgeId).single();
      if (error || !data) {
        setMessage(`❌ Badge ID "${badgeId}" NOT FOUND!`);
        setTimeout(() => setMessage(''), 3000);
        setForm(prev => { const m = [...prev.members]; m[index] = { ...m[index], loading: false }; return { ...prev, members: m }; });
        return;
      }
      setForm(prev => {
        const m = [...prev.members];
        m[index] = { ...m[index], sewadar_name: data.sewadar_name || '', father_husband_name: data.father_husband_name || '', gender: data.gender || '', age: data.age?.toString() || '', aadhar_number: data.aadhar_number || '', address: data.address || '', mobile_no: data.contact_no || '', loading: false };
        return { ...prev, members: m };
      });
      setMessage(`✅ ${data.sewadar_name} - Auto Filled!`);
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setForm(prev => { const m = [...prev.members]; m[index] = { ...m[index], loading: false }; return { ...prev, members: m }; });
    }
  }, [form.members]);

  const handleSave = async () => {
    if (!form.jathedar_name || !form.place_of_sewa) { setMessage('❌ Jathedar Name aur Place of Sewa required hai'); setTimeout(() => setMessage(''), 4000); return; }
    setSaving(true);
    try {
      const { data: entry, error: entryErr } = await supabase.from('vehicle_entries').insert({ srs_id: form.srs_id, satsang_place: form.satsang_place, area: form.area, jathedar_name: form.jathedar_name, driver_name: form.driver_name, vehicle_type: form.vehicle_type, vehicle_no: form.vehicle_no, place_of_sewa: form.place_of_sewa, bhati_type: form.bhati_type, from_date: form.from_date, to_date: form.to_date }).select().single();
      if (entryErr) throw entryErr;
      const valid = form.members.filter(m => m.sewadar_name.trim());
      if (valid.length > 0) { await supabase.from('vehicle_entry_members').insert(valid.map((m, i) => ({ entry_id: entry.id, sr_no: i + 1, badge_id: m.badge_id || null, sewadar_name: m.sewadar_name, father_husband_name: m.father_husband_name || null, gender: m.gender || null, age: m.age ? parseInt(m.age) : null, aadhar_number: m.aadhar_number || null, address: m.address || null, mobile_no: m.mobile_no || null }))); }
      setMessage('✅ SAVED!'); setTimeout(() => setMessage(''), 4000);
    } catch (err: unknown) { setMessage(`❌ ${err instanceof Error ? err.message : 'Error'}`); setTimeout(() => setMessage(''), 5000); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-[1050px] mx-auto py-3 px-2">
      {message && <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white border-2 border-gray-800 shadow-xl rounded px-6 py-3 text-sm font-bold">{message}</div>}

      {/* Buttons */}
      <div className="flex flex-wrap gap-2 mb-3 no-print">
        <button onClick={handleSave} disabled={saving} className="bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-800 disabled:opacity-50">💾 SAVE</button>
        <button onClick={() => generatePDF(form)} className="bg-green-700 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-800">📄 PDF</button>
        <button onClick={() => generateExcel(form)} className="bg-yellow-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-yellow-700">📊 EXCEL</button>
        <button onClick={() => window.print()} className="bg-gray-700 text-white px-4 py-2 rounded text-sm font-bold hover:bg-gray-800">🖨️ PRINT</button>
        <button onClick={() => { if(confirm('Clear?')) setForm(initialForm); }} className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-700">🗑️ CLEAR</button>
        <button onClick={addRow} className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-purple-700">+ ROW</button>
      </div>

      {/* ===== EXACT EXCEL REPLICA ===== */}
      <div className="bg-white print-area" style={{ fontFamily: 'Calibri, Arial, sans-serif', fontSize: '11px' }}>

        {/* === ROW 1: Logo + Header === */}
        <div className="border-2 border-black">
          <div className="flex">
            {/* Logo cell */}
            <div className="border-r border-black w-[70px] flex items-center justify-center p-1">
              <img src="/rssb-logo.svg" alt="RSSB" className="w-[50px] h-[50px]" />
            </div>
            {/* Title cell */}
            <div className="flex-1 text-center py-2">
              <p className="font-bold text-[12px]">SATSANG CENTRES IN INDIA</p>
              <p className="font-bold text-[13px]">NOMINAL ROLL SEWA JATHA</p>
              <input type="text" value={form.srs_id} onChange={e => updateField('srs_id', e.target.value)}
                className="text-center text-[11px] font-bold border-0 outline-none bg-transparent w-[280px]" placeholder="GZB/UP/175/006/2026814/1" />
            </div>
          </div>
        </div>

        {/* === FORM FIELDS GRID (exact Excel cells) === */}
        <table className="w-full border-collapse" style={{ fontSize: '11px' }}>
          <tbody>
            {/* Row: Name of Satsang Place | value | Area | value */}
            <tr>
              <td className="border border-black px-2 py-[4px] font-bold w-[200px]">Name of Satsang Place:</td>
              <td className="border border-black px-2 py-[4px] w-[250px]">
                <input type="text" value={form.satsang_place} onChange={e => updateField('satsang_place', e.target.value)}
                  className="w-full border-0 outline-none bg-transparent font-bold" />
              </td>
              <td className="border border-black px-2 py-[4px] font-bold w-[100px]">Area :</td>
              <td className="border border-black px-2 py-[4px]">
                <input type="text" value={form.area} onChange={e => updateField('area', e.target.value)}
                  className="w-full border-0 outline-none bg-transparent font-bold" />
              </td>
            </tr>
            {/* Row: Name of Jathedar | value | Name of Driver | value */}
            <tr>
              <td className="border border-black px-2 py-[4px] font-bold">Name of Jathedar:</td>
              <td className="border border-black px-2 py-[4px]">
                <input type="text" value={form.jathedar_name} onChange={e => updateField('jathedar_name', e.target.value)}
                  className="w-full border-0 outline-none bg-transparent font-bold" placeholder="DEEPAK KUMAR" />
              </td>
              <td className="border border-black px-2 py-[4px] font-bold">Name of Driver:</td>
              <td className="border border-black px-2 py-[4px]">
                <input type="text" value={form.driver_name} onChange={e => updateField('driver_name', e.target.value)}
                  className="w-full border-0 outline-none bg-transparent" />
              </td>
            </tr>
            {/* Row: Type of Vehicle | value | Vehicle No. | value */}
            <tr>
              <td className="border border-black px-2 py-[4px] font-bold">Type of Vehicle:</td>
              <td className="border border-black px-2 py-[4px]">
                <input type="text" value={form.vehicle_type} onChange={e => updateField('vehicle_type', e.target.value)}
                  className="w-full border-0 outline-none bg-transparent" />
              </td>
              <td className="border border-black px-2 py-[4px] font-bold">Vehicle No.:</td>
              <td className="border border-black px-2 py-[4px]">
                <input type="text" value={form.vehicle_no} onChange={e => updateField('vehicle_no', e.target.value.toUpperCase())}
                  className="w-full border-0 outline-none bg-transparent" />
              </td>
            </tr>
            {/* Row: Place of Sewa | value | FROM: date TO: date */}
            <tr>
              <td className="border border-black px-2 py-[4px] font-bold">Place of Sewa:</td>
              <td className="border border-black px-2 py-[4px]">
                <input type="text" value={form.place_of_sewa} onChange={e => updateField('place_of_sewa', e.target.value)}
                  className="w-full border-0 outline-none bg-transparent font-bold" placeholder="MORADABAD" />
              </td>
              <td colSpan={2} className="border border-black px-2 py-[4px]">
                <span className="font-bold">FROM : </span>
                <input type="text" value={form.from_date} onChange={e => updateField('from_date', e.target.value)}
                  className="border-0 outline-none bg-transparent w-[80px] font-bold" placeholder="15.08.2026" />
                <span className="font-bold ml-4">TO : </span>
                <input type="text" value={form.to_date} onChange={e => updateField('to_date', e.target.value)}
                  className="border-0 outline-none bg-transparent w-[80px] font-bold" placeholder="17.08.2026" />
              </td>
            </tr>
            {/* Row: Mention line | BHATI type */}
            <tr>
              <td className="border border-black px-2 py-[4px]" style={{ fontSize: '10px' }}>(Mention Beas Department or Centre As applicable) :</td>
              <td className="border border-black px-2 py-[4px]" colSpan={3}>
                <input type="text" value={form.bhati_type} onChange={e => updateField('bhati_type', e.target.value)}
                  className="w-full border-0 outline-none bg-transparent font-bold" placeholder="MORADABAD: FABRICATION" />
              </td>
            </tr>
          </tbody>
        </table>

        {/* === EMPTY ROW (spacing) === */}
        <div className="border-l-2 border-r-2 border-black h-[8px]"></div>

        {/* === SEWADAR TABLE === */}
        <table className="w-full border-collapse" style={{ fontSize: '10px' }}>
          <thead>
            <tr>
              <th className="border-2 border-black px-1 py-[5px] text-center font-bold w-[45px]">SR. No.</th>
              <th className="border-2 border-black px-1 py-[5px] text-center font-bold" style={{ minWidth: '140px' }}>Name of Sewadar / Sewadarni</th>
              <th className="border-2 border-black px-1 py-[5px] text-center font-bold" style={{ minWidth: '130px' }}>Father&apos;s / Husband&apos;s Name</th>
              <th className="border-2 border-black px-1 py-[5px] text-center font-bold w-[45px]">M / F</th>
              <th className="border-2 border-black px-1 py-[5px] text-center font-bold w-[35px]">Age</th>
              <th className="border-2 border-black px-1 py-[5px] text-center font-bold w-[95px]">Aadhar No.</th>
              <th className="border-2 border-black px-1 py-[5px] text-center font-bold" style={{ minWidth: '180px' }}>R/o Village / Town / Locality / District</th>
              <th className="border-2 border-black px-1 py-[5px] text-center font-bold w-[85px]">Mobile No.</th>
              <th className="border-2 border-black px-1 py-[5px] text-center font-bold w-[100px]">BADGE ID</th>
              <th className="border-2 border-black w-[25px] no-print"></th>
            </tr>
          </thead>
          <tbody>
            {form.members.map((member, idx) => (
              <tr key={idx} className={member.loading ? 'bg-yellow-50' : ''}>
                <td className="border border-black px-1 py-[3px] text-center font-bold">{idx + 1}</td>
                <td className="border border-black p-0">
                  <input type="text" value={member.sewadar_name} onChange={e => updateMember(idx, 'sewadar_name', e.target.value)}
                    className="w-full px-2 py-[3px] text-[10px] border-0 outline-none bg-transparent font-bold text-center" />
                </td>
                <td className="border border-black p-0">
                  <input type="text" value={member.father_husband_name} onChange={e => updateMember(idx, 'father_husband_name', e.target.value)}
                    className="w-full px-2 py-[3px] text-[10px] border-0 outline-none bg-transparent text-center" />
                </td>
                <td className="border border-black p-0">
                  <input type="text" value={member.gender} onChange={e => updateMember(idx, 'gender', e.target.value)}
                    className="w-full px-0 py-[3px] text-[10px] border-0 outline-none bg-transparent text-center" />
                </td>
                <td className="border border-black p-0">
                  <input type="text" value={member.age} onChange={e => updateMember(idx, 'age', e.target.value)}
                    className="w-full px-0 py-[3px] text-[10px] border-0 outline-none bg-transparent text-center" />
                </td>
                <td className="border border-black p-0">
                  <input type="text" value={member.aadhar_number} onChange={e => updateMember(idx, 'aadhar_number', e.target.value)}
                    className="w-full px-1 py-[3px] text-[10px] border-0 outline-none bg-transparent text-center" />
                </td>
                <td className="border border-black p-0">
                  <input type="text" value={member.address} onChange={e => updateMember(idx, 'address', e.target.value)}
                    className="w-full px-1 py-[3px] text-[10px] border-0 outline-none bg-transparent" />
                </td>
                <td className="border border-black p-0">
                  <input type="text" value={member.mobile_no} onChange={e => updateMember(idx, 'mobile_no', e.target.value)}
                    className="w-full px-1 py-[3px] text-[10px] border-0 outline-none bg-transparent text-center" />
                </td>
                <td className="border border-black p-0">
                  <input type="text" value={member.badge_id}
                    onChange={e => updateMember(idx, 'badge_id', e.target.value.toUpperCase())}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); lookupBadge(idx); } }}
                    onBlur={() => { if (member.badge_id.trim()) lookupBadge(idx); }}
                    className="w-full px-1 py-[3px] text-[10px] border-0 outline-none bg-transparent text-center font-bold text-blue-800"
                    placeholder="GB5156GA..."
                  />
                </td>
                <td className="border border-black p-0 text-center no-print">
                  <button onClick={() => removeRow(idx)} className="text-red-500 text-[9px]">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* === SIGNATURE SECTION (exact Excel) === */}
        <div className="border-l-2 border-r-2 border-b-2 border-black">
          {/* Empty space */}
          <div className="h-[80px]"></div>

          {/* Signature row */}
          <table className="w-full border-collapse" style={{ fontSize: '10px' }}>
            <tbody>
              <tr>
                <td className="border-t border-black px-4 py-[4px] font-bold">(Signature of Jathedar)</td>
                <td className="border-t border-black px-4 py-[4px]"></td>
                <td className="border-t border-black px-4 py-[4px]"></td>
              </tr>
              <tr>
                <td className="px-4 py-[4px]"></td>
                <td className="px-4 py-[4px] text-center font-bold">(Affixx Rubber Stamp)</td>
                <td className="px-4 py-[4px]"></td>
              </tr>
            </tbody>
          </table>

          {/* Date & Contact row */}
          <div className="h-[20px]"></div>
          <table className="w-full border-collapse" style={{ fontSize: '10px' }}>
            <tbody>
              <tr>
                <td className="border-t border-black px-4 py-[4px] w-1/2">
                  <div className="flex gap-4">
                    <span className="font-bold">Date:</span>
                    <span>{form.from_date || '_______________'}</span>
                  </div>
                </td>
                <td className="border-t border-black px-4 py-[4px] w-1/2">
                  <div className="flex gap-4">
                    <span className="font-bold">Date:</span>
                    <span>{form.from_date || '_______________'}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border-t border-black px-4 py-[4px]">
                  <div className="flex gap-4">
                    <span className="font-bold">Contact No.:</span>
                    <span>_______________</span>
                  </div>
                </td>
                <td className="border-t border-black px-4 py-[4px]">
                  <div className="flex gap-4">
                    <span className="font-bold">Contact No.:</span>
                    <span>_______________</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
