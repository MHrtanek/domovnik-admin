import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  const { requestId, action, email, fullName, buildingName, buildingAddress } = await request.json()

  if (action === 'delete') {
    await supabaseAdmin.from('registration_requests').delete().eq('id', requestId)
    return NextResponse.json({ ok: true })
  }

  if (action === 'reject') {
    await supabaseAdmin.from('registration_requests').update({ status: 'rejected' }).eq('id', requestId)
    return NextResponse.json({ ok: true })
  }

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

    // 2. Vygeneruj dočasné heslo
    const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!'

    // 3. Vytvor Auth používateľa
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      await supabaseAdmin.from('buildings').delete().eq('id', building.id)
      return NextResponse.json({ error: authData ? 'User creation failed' : authError?.message }, { status: 500 })
    }

    const userId = authData.user.id

    // 4. Vytvor profil správcu
    await supabaseAdmin.from('profiles').insert({
      id: userId,
      email,
      full_name: fullName,
      role: 'manager',
      building_id: building.id,
    })

    // 5. Napoj správcu na budovu
    await supabaseAdmin.from('buildings').update({ manager_id: userId }).eq('id', building.id)

    // 6. Označ žiadosť ako schválenú
    await supabaseAdmin.from('registration_requests').update({ status: 'approved' }).eq('id', requestId)

    // 7. Vráť dočasné heslo - zobrazí sa v admin paneli
    return NextResponse.json({ ok: true, tempPassword, email })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
