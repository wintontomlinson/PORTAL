import * as XLSX from 'xlsx';
import { VehicleFormData } from '@/types/database';

export function generateExcel(formData: VehicleFormData) {
  const wb = XLSX.utils.book_new();

  // Build the worksheet data matching the original Excel format
  const wsData: (string | number | null)[][] = [];

  // Row 1: Main Title (merged)
  wsData.push(['RADHA SOAMI SATSANG BEAS - LONI CENTRE', null, null, null, null, null, null, null, null, null]);

  // Row 2: Sub Title (merged)
  wsData.push(['BHATI JATHA - VEHICLE ENTRY FORM', null, null, null, null, null, null, null, null, null]);

  // Row 3: Empty
  wsData.push([]);

  // Row 4: Header fields row 1
  wsData.push([
    'Name of Jathedar:', formData.jathedar_name || '', null,
    'Type of Vehicle:', formData.vehicle_type || '', null,
    'Place of Sewa:', formData.place_of_sewa || '', null, null
  ]);

  // Row 5: Header fields row 2
  wsData.push([
    'Name of Driver:', formData.driver_name || '', null,
    'Vehicle Number:', formData.vehicle_number || '', null,
    'From Date:', formData.from_date || '',
    'To Date:', formData.to_date || ''
  ]);

  // Row 6: Empty
  wsData.push([]);

  // Row 7: Table Header
  wsData.push([
    'Sr. No.',
    'Badge ID',
    'SRS ID',
    'Name of Sewadar / Sewadarni',
    "Father's / Husband's Name",
    'M/F',
    'Age',
    'Aadhar No.',
    'R/o Village / Town / Locality / District',
    'Mobile No.'
  ]);

  // Data rows
  const members = formData.members.filter(m => m.name.trim());
  members.forEach((member, index) => {
    wsData.push([
      index + 1,
      member.badge_id || '',
      member.srs_id || '',
      member.name || '',
      member.father_husband_name || '',
      member.gender || '',
      member.age ? parseInt(member.age) : '',
      member.aadhar_no || '',
      member.address || '',
      member.mobile_no || ''
    ]);
  });

  // Add empty rows to make minimum 20 rows in table
  const minRows = 20;
  for (let i = members.length; i < minRows; i++) {
    wsData.push([i + 1, '', '', '', '', '', '', '', '', '']);
  }

  // Footer row
  wsData.push([]);
  wsData.push([`Total Sewadars: ${members.length}`, null, null, null, null, null, null, null, `Generated: ${new Date().toLocaleDateString('en-IN')}`, null]);

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths (matching original Excel format)
  ws['!cols'] = [
    { wch: 6 },   // Sr. No.
    { wch: 12 },  // Badge ID
    { wch: 12 },  // SRS ID
    { wch: 25 },  // Name
    { wch: 25 },  // Father/Husband Name
    { wch: 5 },   // M/F
    { wch: 5 },   // Age
    { wch: 14 },  // Aadhar No.
    { wch: 35 },  // Address
    { wch: 12 },  // Mobile No.
  ];

  // Row heights
  ws['!rows'] = [
    { hpt: 25 },  // Title row
    { hpt: 20 },  // Sub title
    { hpt: 12 },  // Empty
    { hpt: 18 },  // Header row 1
    { hpt: 18 },  // Header row 2
    { hpt: 12 },  // Empty
    { hpt: 20 },  // Table header
  ];

  // Merge cells for title
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },  // Title merge
    { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },  // Sub title merge
    // Header field merges
    { s: { r: 3, c: 1 }, e: { r: 3, c: 2 } },  // Jathedar value
    { s: { r: 3, c: 4 }, e: { r: 3, c: 5 } },  // Vehicle type value
    { s: { r: 3, c: 7 }, e: { r: 3, c: 9 } },  // Place value
    { s: { r: 4, c: 1 }, e: { r: 4, c: 2 } },  // Driver value
    { s: { r: 4, c: 4 }, e: { r: 4, c: 5 } },  // Vehicle number value
  ];

  // Apply styles/formatting
  // Set cell styles for header
  const headerStyle = {
    font: { bold: true, sz: 14 },
    alignment: { horizontal: 'center', vertical: 'center' },
  };

  const subHeaderStyle = {
    font: { bold: true, sz: 11 },
    alignment: { horizontal: 'center', vertical: 'center' },
  };

  const tableHeaderStyle = {
    font: { bold: true, sz: 9 },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    fill: { fgColor: { rgb: 'DCE6FA' } },
    border: {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    },
  };

  const cellBorder = {
    border: {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    },
  };

  // Apply styles to title cells
  if (ws['A1']) ws['A1'].s = headerStyle;
  if (ws['A2']) ws['A2'].s = subHeaderStyle;

  // Apply styles to table header row (row index 6, which is row 7 in 1-based)
  const headerCols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  headerCols.forEach(col => {
    const cellRef = `${col}7`;
    if (ws[cellRef]) {
      ws[cellRef].s = tableHeaderStyle;
    }
  });

  // Apply borders to data cells
  const totalDataRows = Math.max(members.length, minRows);
  for (let r = 7; r < 7 + totalDataRows; r++) {
    headerCols.forEach(col => {
      const cellRef = `${col}${r + 1}`;
      if (ws[cellRef]) {
        ws[cellRef].s = { ...cellBorder, alignment: { vertical: 'center' } };
      }
    });
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Bhati Jatha');

  // Generate filename
  const fileName = `Bhati_Jatha_${formData.vehicle_number || 'Form'}_${formData.from_date || 'date'}.xlsx`;

  // Write file
  XLSX.writeFile(wb, fileName);
}
