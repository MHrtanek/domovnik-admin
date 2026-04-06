import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function DELETE(request: NextRequest) {
  const { buildingId } = await request.json()

  try {
    // 1. Načítaj všetkých používateľov budovy
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('building_id', buildingId)

    // 2. Vymaž každého z Auth
    if (profiles) {
      for (const p of profiles) {
        await supabaseAdmin.auth.admin.deleteUser(p.id)
      }
    }

    // 3. Vymaž budovu (cascade zmaže profily a obsah)
    await supabaseAdmin.from('buildings').delete().eq('id', buildingId)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
