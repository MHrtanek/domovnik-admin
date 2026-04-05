import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  const { requestId, action, email, fullName, buildingName, buildingAddress } = await request.json()

  // Vymazať žiadosť úplne
  if (action === 'delete') {
    await supabaseAdmin
      .from('registration_requests')
      .delete()
      .eq('id', requestId)
    return NextResponse.json({ ok: true })
  }

  // Zamietnuť žiadosť
  if (action === 'reject') {
    await supabaseAdmin
      .from('registration_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId)
    return NextResponse.json({ ok: true })
  }

  // Schváliť žiadosť
  if (action === 'approve') {
    // 1. Vytvor budovu
    const { data: building, error: buildingError } = await supabaseAdmin
      .from('buildings')
      .insert({ name: buildingName, address: buildingAddress })
      .select()
      .single()

    if (buildingError || !building) {
      return NextResponse.json({ error: buildingError?.message }, { status: 500 })
    }

    // 2. Pošli invite email cez Supabase (správca si nastaví heslo sám)
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: fullName,
        role: 'manager',
        building_id: building.id,
      },
      redirectTo: 'https://domovnik-app.vercel.app',
    })

    if (inviteError || !inviteData.user) {
      // Vymaž budovu ak invite zlyhalo
      await supabaseAdmin.from('buildings').delete().eq('id', building.id)
      return NextResponse.json({ error: inviteError?.message }, { status: 500 })
    }

    const userId = inviteData.user.id

    // 3. Vytvor profil správcu
    await supabaseAdmin.from('profiles').insert({
      id: userId,
      email,
      full_name: fullName,
      role: 'manager',
      building_id: building.id,
    })

    // 4. Napoj správcu na budovu
    await supabaseAdmin
      .from('buildings')
      .update({ manager_id: userId })
      .eq('id', building.id)

    // 5. Označ žiadosť ako schválenú
    await supabaseAdmin
      .from('registration_requests')
      .update({ status: 'approved' })
      .eq('id', requestId)

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
