import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/sewadars/lookup?badge_id=xxx or ?srs_id=xxx
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const badgeId = searchParams.get('badge_id');
  const srsId = searchParams.get('srs_id');

  if (!badgeId && !srsId) {
    return NextResponse.json(
      { error: 'Either badge_id or srs_id is required' },
      { status: 400 }
    );
  }

  try {
    let query = supabase.from('sewadars').select('*');

    if (badgeId) {
      query = query.eq('badge_id', badgeId.trim());
    } else if (srsId) {
      query = query.eq('srs_id', srsId.trim());
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Record Not Found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
