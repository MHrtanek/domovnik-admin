import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function DELETE(request: NextRequest) {
  const { userId } = await request.json()

  try {
    // 1. Zisti rolu a building_id
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, building_id')
      .eq('id', userId)
      .single()

    if (profile?.role === 'manager' && profile?.building_id) {
      const buildingId = profile.building_id

      // 2. Načítaj všetkých obyvateľov budovy
      const { data: residents } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('building_id', buildingId)
        .eq('role', 'resident')

      // 3. Vymaž každého obyvateľa z Auth
      if (residents) {
        for (const resident of residents) {
          await supabaseAdmin.auth.admin.deleteUser(resident.id)
        }
      }

      // 4. Odpoč manager_id z budovy
      await supabaseAdmin
        .from('buildings')
        .update({ manager_id: null })
        .eq('id', buildingId)

      // 5. Vymaž profil správcu
      await supabaseAdmin.from('profiles').delete().eq('id', userId)

      // 6. Vymaž budovu (cascade zmaže zvyšok)
      await supabaseAdmin.from('buildings').delete().eq('id', buildingId)

    } else if (profile?.role === 'resident') {
      // Jednoduchý resident — len vymaž profil
      await supabaseAdmin.from('profiles').delete().eq('id', userId)
    }

    // 7. Vymaž Auth používateľa
    await supabaseAdmin.auth.admin.deleteUser(userId)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
