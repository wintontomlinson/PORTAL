import * as XLSX from 'xlsx';
import { VehicleFormState } from '@/types/database';

export function generateExcel(form: VehicleFormState) {
  const wb = XLSX.utils.book_new();
  const data: (string | number | null)[][] = [];

  // Row 1-3: Headers (matching MASTERFILE exactly)
  data.push(['', '', 'SATSANG CENTRES IN INDIA', '', '', '', '', '', '']);
  data.push(['', '', 'NOMINAL ROLL SEWA JATHA', '', '', '', '', '', '']);
  data.push(['', '', form.srs_id || '', '', '', '', '', '', '']);
  data.push([]); // empty row

  // Row 5: Satsang Place & Area
  data.push(['', '', `Name of Satsang Place:`, '', form.satsang_place, '', '', `Area :  ${form.area}`, '']);

  // Row 6: Jathedar & Driver
  data.push(['', '', `Name of Jathedar:`, '', form.jathedar_name, '', '', `Name of Driver: ${form.driver_name}`, '']);

  // Row 7: Vehicle Type & No
  data.push(['', '', `Type of Vehicle:`, '', form.vehicle_type, '', '', `Vehicle No.: ${form.vehicle_no}`, '']);

  // Row 8: Place of Sewa & Dates
  data.push(['', '', `Place of Sewa:`, '', form.place_of_sewa, '', '', `FROM :  ${form.from_date}     TO :  ${form.to_date}`, '']);

  // Row 9: Bhati type
  data.push(['', '', `(Mention Beas Department or Centre As applicable) :`, '', '', '', '', `${form.bhati_type}`, '']);

  data.push([]); // empty

  // Row 11: Table Header
  data.push([
    '', 'SR. No.',
    'Name of Sewadar / Sewadarni',
    "Father's / Husband's Name",
    'M / F',
    'Age',
    'Aadhar No.',
    'R/o Village / Town / Locality / District',
    'Mobile No.',
    'BADGE ID',
  ]);

  // Data rows
  const members = form.members.filter(m => m.sewadar_name.trim());
  members.forEach((m, i) => {
    data.push([
      '',
      i + 1,
      m.sewadar_name,
      m.father_husband_name,
      m.gender,
      m.age ? parseInt(m.age) : '',
      m.aadhar_number,
      m.address,
      m.mobile_no,
      m.badge_id,
    ]);
  });

  // Add empty rows to make it look like the original (min 5 rows)
  for (let i = members.length; i < 5; i++) {
    data.push(['', i + 1, '', '', '', '', '', '', '', '']);
  }

  data.push([]); // empty
  data.push([]); // empty

  // Signature section
  data.push(['', '', '(Signature of Jathedar)', '', '', '', '', '', '(Signature of Functionary)']);
  data.push(['', '', '', '', '', '', '', '', '(Affix Rubber Stamp)']);
  data.push([]); // empty
  data.push(['', '', `Date:            ${form.from_date}           `, '', '', '', '', '', `Date:            ${form.from_date}           `]);
  data.push(['', '', `Contact No.:         `, '', '', '', '', '', `Contact No.:        `]);

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Column widths matching original
  ws['!cols'] = [
    { wch: 3 },   // A (empty)
    { wch: 7 },   // B - SR No
    { wch: 28 },  // C - Name
    { wch: 24 },  // D - Father/Husband
    { wch: 7 },   // E - M/F
    { wch: 5 },   // F - Age
    { wch: 15 },  // G - Aadhar
    { wch: 40 },  // H - Address
    { wch: 13 },  // I - Mobile
    { wch: 16 },  // J - Badge ID
  ];

  // Merge cells for headers
  ws['!merges'] = [
    { s: { r: 0, c: 2 }, e: { r: 0, c: 8 } }, // Title row 1
    { s: { r: 1, c: 2 }, e: { r: 1, c: 8 } }, // Title row 2
    { s: { r: 2, c: 2 }, e: { r: 2, c: 8 } }, // SRS ID
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Nominal Roll');

  const fileName = `Nominal_Roll_${form.place_of_sewa || 'Sewa'}_${form.from_date || ''}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
