import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { VehicleFormState } from '@/types/database';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

export function generatePDF(form: VehicleFormState) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const m = 10; // margin

  // === HEADER ===
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SATSANG CENTRES IN INDIA', pageW / 2, 12, { align: 'center' });
  doc.setFontSize(13);
  doc.text('NOMINAL ROLL SEWA JATHA', pageW / 2, 18, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(form.srs_id || '', pageW / 2, 23, { align: 'center' });

  // === FORM FIELDS ===
  const y0 = 28;
  doc.setFontSize(9);

  const field = (label: string, value: string, x: number, y: number) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, x, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, x + doc.getTextWidth(label) + 2, y);
  };

  field('Name of Satsang Place:', form.satsang_place, m, y0);
  field('Area:', form.area, 160, y0);

  field('Name of Jathedar:', form.jathedar_name, m, y0 + 5);
  field('Name of Driver:', form.driver_name, 160, y0 + 5);

  field('Type of Vehicle:', form.vehicle_type, m, y0 + 10);
  field('Vehicle No.:', form.vehicle_no, 160, y0 + 10);

  field('Place of Sewa:', form.place_of_sewa, m, y0 + 15);
  field('BHATI:', form.bhati_type, 160, y0 + 15);

  field('FROM:', form.from_date, m, y0 + 20);
  field('TO:', form.to_date, 80, y0 + 20);

  doc.setFontSize(7);
  doc.text('(Mention Beas Department or Centre As applicable)', m, y0 + 24);

  // Line
  doc.setLineWidth(0.3);
  doc.line(m, y0 + 26, pageW - m, y0 + 26);

  // === TABLE ===
  const members = form.members.filter(m => m.sewadar_name.trim());

  const tableHead = [['SR. No.', 'Name of Sewadar / Sewadarni', "Father's / Husband's Name", 'M / F', 'Age', 'Aadhar No.', 'R/o Village / Town / Locality / District', 'Mobile No.', 'BADGE ID']];

  const tableBody = members.map((m, i) => [
    (i + 1).toString(),
    m.sewadar_name,
    m.father_husband_name,
    m.gender,
    m.age,
    m.aadhar_number,
    m.address,
    m.mobile_no,
    m.badge_id,
  ]);

  doc.autoTable({
    startY: y0 + 28,
    head: tableHead,
    body: tableBody,
    margin: { left: m, right: m },
    styles: { fontSize: 7, cellPadding: 1.5, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0] },
    headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 40 },
      2: { cellWidth: 40 },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 10, halign: 'center' },
      5: { cellWidth: 28 },
      6: { cellWidth: 60 },
      7: { cellWidth: 25 },
      8: { cellWidth: 30 },
    },
    theme: 'grid',
  });

  // === FOOTER - Signatures ===
  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(8);

  doc.text('(Signature of Jathedar)', m + 30, finalY);
  doc.text('(Signature of Functionary)', pageW - m - 60, finalY);
  doc.text('(Affix Rubber Stamp)', pageW - m - 55, finalY + 4);

  doc.text(`Date: ${form.from_date || '___________'}`, m, finalY + 12);
  doc.text(`Contact No.: _______________`, m, finalY + 16);
  doc.text(`Date: ${form.from_date || '___________'}`, pageW - m - 60, finalY + 12);
  doc.text(`Contact No.: _______________`, pageW - m - 60, finalY + 16);

  // Save
  const fileName = `Nominal_Roll_${form.place_of_sewa || 'Sewa'}_${form.from_date || ''}.pdf`;
  doc.save(fileName);
}
