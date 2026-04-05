import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function DELETE(request: NextRequest) {
  const { postId } = await request.json()

  try {
    // Cascade zmaže aj replies
    await supabaseAdmin
      .from('forum_posts')
      .delete()
      .eq('id', postId)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
