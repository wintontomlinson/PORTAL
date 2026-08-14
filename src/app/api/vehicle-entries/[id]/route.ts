import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/vehicle-entries/[id] - Get a specific vehicle entry with members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: entry, error: entryError } = await supabase
      .from('vehicle_entries')
      .select('*')
      .eq('id', id)
      .single();

    if (entryError) throw entryError;

    const { data: members, error: membersError } = await supabase
      .from('vehicle_entry_members')
      .select('*')
      .eq('entry_id', id)
      .order('sr_no', { ascending: true });

    if (membersError) throw membersError;

    return NextResponse.json({ data: { ...entry, members } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/vehicle-entries/[id] - Update a vehicle entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { members, ...entryData } = body;

    // Update entry
    const { data: entry, error: entryError } = await supabase
      .from('vehicle_entries')
      .update(entryData)
      .eq('id', id)
      .select()
      .single();

    if (entryError) throw entryError;

    // Update members - delete old and insert new
    if (members) {
      await supabase
        .from('vehicle_entry_members')
        .delete()
        .eq('entry_id', id);

      const membersToInsert = members
        .filter((m: Record<string, string>) => m.name && m.name.trim())
        .map((m: Record<string, string>, i: number) => ({
          entry_id: id,
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

      if (membersToInsert.length > 0) {
        const { error: membersError } = await supabase
          .from('vehicle_entry_members')
          .insert(membersToInsert);

        if (membersError) throw membersError;
      }
    }

    return NextResponse.json({ data: entry });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/vehicle-entries/[id] - Delete a vehicle entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Members will be deleted automatically due to CASCADE
    const { error } = await supabase
      .from('vehicle_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
