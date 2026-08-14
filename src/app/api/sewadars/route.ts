import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/sewadars - List all sewadars with optional search
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  try {
    let query = supabase
      .from('sewadars')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(
        `badge_id.ilike.%${search}%,srs_id.ilike.%${search}%,name.ilike.%${search}%,mobile_no.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query
      .order('name', { ascending: true })
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

// POST /api/sewadars - Create a new sewadar
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('sewadars')
      .insert({
        badge_id: body.badge_id,
        srs_id: body.srs_id || null,
        name: body.name,
        father_husband_name: body.father_husband_name || null,
        gender: body.gender || null,
        age: body.age ? parseInt(body.age) : null,
        aadhar_no: body.aadhar_no || null,
        address: body.address || null,
        mobile_no: body.mobile_no || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A sewadar with this Badge ID or SRS ID already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/sewadars - Update a sewadar
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Sewadar ID is required' }, { status: 400 });
    }

    if (updateData.age) {
      updateData.age = parseInt(updateData.age);
    }

    const { data, error } = await supabase
      .from('sewadars')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/sewadars - Delete a sewadar
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Sewadar ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('sewadars')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
