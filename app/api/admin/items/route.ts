import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const ALLOWED_TABLES = ['tickets', 'announcements', 'polls', 'documents', 'contacts', 'forum_posts']

export async function DELETE(request: NextRequest) {
  const { itemId, table } = await request.json()

  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
  }

  try {
    await supabaseAdmin.from(table).delete().eq('id', itemId)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
