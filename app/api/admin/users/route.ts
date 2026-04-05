import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function DELETE(request: NextRequest) {
  const { userId } = await request.json()

  // 1. Zisti či je správca — zmaž jeho budovu
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role, building_id')
    .eq('id', userId)
    .single()

  if (profile?.role === 'manager' && profile?.building_id) {
    // Najprv vymaž všetkých obyvateľov budovy
    const { data: residents } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('building_id', profile.building_id)
      .eq('role', 'resident')

    if (residents) {
      for (const resident of residents) {
        await supabaseAdmin.auth.admin.deleteUser(resident.id)
      }
    }

    // Vymaž budovu (cascade zmaže všetko ostatné)
    await supabaseAdmin
      .from('buildings')
      .delete()
      .eq('id', profile.building_id)
  }

  // 2. Vymaž Auth používateľa (cascade zmaže profil)
  await supabaseAdmin.auth.admin.deleteUser(userId)

  return NextResponse.json({ ok: true })
}
