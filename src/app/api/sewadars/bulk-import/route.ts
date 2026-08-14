import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

// POST /api/sewadars/bulk-import - Bulk import from Excel
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

    if (jsonData.length === 0) {
      return NextResponse.json({ error: 'Excel file is empty' }, { status: 400 });
    }

    // Map Excel columns to database fields
    const columnMapping: Record<string, string> = {
      'badge_id': 'badge_id',
      'Badge ID': 'badge_id',
      'BADGE ID': 'badge_id',
      'Badge Id': 'badge_id',
      'srs_id': 'srs_id',
      'SRS ID': 'srs_id',
      'SRS Id': 'srs_id',
      'Srs Id': 'srs_id',
      'name': 'name',
      'Name': 'name',
      'NAME': 'name',
      'Name of Sewadar': 'name',
      'Name of Sewadar / Sewadarni': 'name',
      'father_husband_name': 'father_husband_name',
      'Father/Husband Name': 'father_husband_name',
      "Father's / Husband's Name": 'father_husband_name',
      "Father's Name": 'father_husband_name',
      'Father Name': 'father_husband_name',
      'gender': 'gender',
      'Gender': 'gender',
      'M/F': 'gender',
      'Sex': 'gender',
      'age': 'age',
      'Age': 'age',
      'AGE': 'age',
      'aadhar_no': 'aadhar_no',
      'Aadhar No': 'aadhar_no',
      'Aadhar No.': 'aadhar_no',
      'Aadhaar': 'aadhar_no',
      'Aadhaar No': 'aadhar_no',
      'AADHAR NO': 'aadhar_no',
      'address': 'address',
      'Address': 'address',
      'ADDRESS': 'address',
      'R/o Village / Town / Locality / District': 'address',
      'Village': 'address',
      'mobile_no': 'mobile_no',
      'Mobile No': 'mobile_no',
      'Mobile No.': 'mobile_no',
      'Mobile': 'mobile_no',
      'MOBILE NO': 'mobile_no',
      'Phone': 'mobile_no',
    };

    const sewadars = jsonData.map(row => {
      const mapped: Record<string, string | number | null> = {};

      Object.entries(row).forEach(([key, value]) => {
        const dbField = columnMapping[key.trim()];
        if (dbField) {
          mapped[dbField] = value !== undefined && value !== null ? String(value).trim() : null;
        }
      });

      // Ensure required fields
      if (!mapped.badge_id || !mapped.name) return null;

      return {
        badge_id: String(mapped.badge_id),
        srs_id: mapped.srs_id ? String(mapped.srs_id) : null,
        name: String(mapped.name),
        father_husband_name: mapped.father_husband_name ? String(mapped.father_husband_name) : null,
        gender: mapped.gender ? String(mapped.gender).charAt(0).toUpperCase() : null,
        age: mapped.age ? parseInt(String(mapped.age)) : null,
        aadhar_no: mapped.aadhar_no ? String(mapped.aadhar_no).replace(/\D/g, '') : null,
        address: mapped.address ? String(mapped.address) : null,
        mobile_no: mapped.mobile_no ? String(mapped.mobile_no).replace(/\D/g, '') : null,
      };
    }).filter(Boolean);

    if (sewadars.length === 0) {
      return NextResponse.json(
        { error: 'No valid records found. Ensure the Excel has columns: Badge ID, Name (at minimum)' },
        { status: 400 }
      );
    }

    // Upsert records (update existing, insert new)
    let inserted = 0;
    let updated = 0;
    let errors: string[] = [];

    for (const sewadar of sewadars) {
      if (!sewadar) continue;

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
          errors.push(`Error updating ${sewadar.badge_id}: ${error.message}`);
        } else {
          updated++;
        }
      } else {
        const { error } = await supabase
          .from('sewadars')
          .insert(sewadar);

        if (error) {
          errors.push(`Error inserting ${sewadar.badge_id}: ${error.message}`);
        } else {
          inserted++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      total: sewadars.length,
      inserted,
      updated,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
