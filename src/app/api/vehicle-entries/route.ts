import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/vehicle-entries - List all vehicle entries
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  try {
    let query = supabase
      .from('vehicle_entries')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(
        `jathedar_name.ilike.%${search}%,vehicle_number.ilike.%${search}%,place_of_sewa.ilike.%${search}%,driver_name.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/vehicle-entries - Create a new vehicle entry with members
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { members, ...entryData } = body;

    // Create vehicle entry
    const { data: entry, error: entryError } = await supabase
      .from('vehicle_entries')
      .insert(entryData)
      .select()
      .single();

    if (entryError) throw entryError;

    // Create members
    if (members && members.length > 0) {
      const membersToInsert = members
        .filter((m: Record<string, string>) => m.name && m.name.trim())
        .map((m: Record<string, string>, i: number) => ({
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
    }

    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
