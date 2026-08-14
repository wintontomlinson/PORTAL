import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { VehicleFormData } from '@/types/database';

// Extend jsPDF type for autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

export function generatePDF(formData: VehicleFormData) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;

  // Title Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RADHA SOAMI SATSANG BEAS - LONI CENTRE', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(11);
  doc.text('BHATI JATHA - VEHICLE ENTRY FORM', pageWidth / 2, 22, { align: 'center' });

  // Horizontal line
  doc.setLineWidth(0.5);
  doc.line(margin, 25, pageWidth - margin, 25);

  // Header Fields
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const headerY = 30;
  const colWidth = (pageWidth - 2 * margin) / 3;

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.text('Name of Jathedar:', margin, headerY);
  doc.setFont('helvetica', 'normal');
  doc.text(formData.jathedar_name || '', margin + 35, headerY);

  doc.setFont('helvetica', 'bold');
  doc.text('Type of Vehicle:', margin + colWidth, headerY);
  doc.setFont('helvetica', 'normal');
  doc.text(formData.vehicle_type || '', margin + colWidth + 32, headerY);

  doc.setFont('helvetica', 'bold');
  doc.text('Place of Sewa:', margin + colWidth * 2, headerY);
  doc.setFont('helvetica', 'normal');
  doc.text(formData.place_of_sewa || '', margin + colWidth * 2 + 30, headerY);

  // Row 2
  const headerY2 = headerY + 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Name of Driver:', margin, headerY2);
  doc.setFont('helvetica', 'normal');
  doc.text(formData.driver_name || '', margin + 30, headerY2);

  doc.setFont('helvetica', 'bold');
  doc.text('Vehicle Number:', margin + colWidth, headerY2);
  doc.setFont('helvetica', 'normal');
  doc.text(formData.vehicle_number || '', margin + colWidth + 32, headerY2);

  doc.setFont('helvetica', 'bold');
  doc.text('From:', margin + colWidth * 2, headerY2);
  doc.setFont('helvetica', 'normal');
  doc.text(formData.from_date || '', margin + colWidth * 2 + 12, headerY2);

  doc.setFont('helvetica', 'bold');
  doc.text('To:', margin + colWidth * 2 + 40, headerY2);
  doc.setFont('helvetica', 'normal');
  doc.text(formData.to_date || '', margin + colWidth * 2 + 48, headerY2);

  // Line separator
  doc.setLineWidth(0.3);
  doc.line(margin, headerY2 + 3, pageWidth - margin, headerY2 + 3);

  // Table
  const tableColumns = [
    { header: 'Sr.\nNo.', dataKey: 'sr_no' },
    { header: 'Badge\nID', dataKey: 'badge_id' },
    { header: 'SRS\nID', dataKey: 'srs_id' },
    { header: 'Name of Sewadar /\nSewadarni', dataKey: 'name' },
    { header: "Father's / Husband's\nName", dataKey: 'father_husband_name' },
    { header: 'M/F', dataKey: 'gender' },
    { header: 'Age', dataKey: 'age' },
    { header: 'Aadhar No.', dataKey: 'aadhar_no' },
    { header: 'R/o Village / Town /\nLocality / District', dataKey: 'address' },
    { header: 'Mobile No.', dataKey: 'mobile_no' },
  ];

  const tableRows = formData.members
    .filter(m => m.name.trim())
    .map((m, i) => ({
      sr_no: (i + 1).toString(),
      badge_id: m.badge_id || '',
      srs_id: m.srs_id || '',
      name: m.name || '',
      father_husband_name: m.father_husband_name || '',
      gender: m.gender || '',
      age: m.age || '',
      aadhar_no: m.aadhar_no || '',
      address: m.address || '',
      mobile_no: m.mobile_no || '',
    }));

  doc.autoTable({
    startY: headerY2 + 6,
    head: [tableColumns.map(c => c.header)],
    body: tableRows.map(row => tableColumns.map(c => row[c.dataKey as keyof typeof row])),
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      textColor: [0, 0, 0],
      valign: 'middle',
    },
    headStyles: {
      fillColor: [220, 230, 250],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 7,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 40 },
      4: { cellWidth: 40 },
      5: { cellWidth: 10, halign: 'center' },
      6: { cellWidth: 10, halign: 'center' },
      7: { cellWidth: 28, halign: 'center' },
      8: { cellWidth: 55 },
      9: { cellWidth: 25, halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    theme: 'grid',
  });

  // Footer
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(`Total Sewadars: ${tableRows.length}`, margin, finalY);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin - 50, finalY);

  // Save
  const fileName = `Bhati_Jatha_${formData.vehicle_number || 'Form'}_${formData.from_date || 'date'}.pdf`;
  doc.save(fileName);
}
