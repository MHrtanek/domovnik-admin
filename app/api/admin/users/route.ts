import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function DELETE(request: NextRequest) {
  const { userId, onlyManager } = await request.json()

  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, building_id')
      .eq('id', userId)
      .single()

    if (onlyManager) {
      // Len odstrán správcu, budova ostane
      if (profile?.building_id) {
        await supabaseAdmin
          .from('buildings')
          .update({ manager_id: null })
          .eq('id', profile.building_id)
      }
      await supabaseAdmin.from('profiles').delete().eq('id', userId)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json({ ok: true })
    }

    if (profile?.role === 'manager' && profile?.building_id) {
      const buildingId = profile.building_id

      const { data: residents } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('building_id', buildingId)
        .eq('role', 'resident')

      if (residents) {
        for (const resident of residents) {
          await supabaseAdmin.auth.admin.deleteUser(resident.id)
        }
      }

      await supabaseAdmin.from('buildings').update({ manager_id: null }).eq('id', buildingId)
      await supabaseAdmin.from('profiles').delete().eq('id', userId)
      await supabaseAdmin.from('buildings').delete().eq('id', buildingId)
    } else {
      await supabaseAdmin.from('profiles').delete().eq('id', userId)
    }

    await supabaseAdmin.auth.admin.deleteUser(userId)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
