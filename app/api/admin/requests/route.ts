import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  const { requestId, action, email, fullName, buildingName, buildingAddress } = await request.json()

  if (action === 'reject') {
    await supabaseAdmin
      .from('registration_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId)
    return NextResponse.json({ ok: true })
  }

  if (action === 'approve') {
    // 1. Vytvor Auth používateľa
    const tempPassword = Math.random().toString(36).slice(-10) + 'Aa1!'
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message }, { status: 500 })
    }

    const userId = authData.user.id

    // 2. Vytvor budovu
    const { data: building, error: buildingError } = await supabaseAdmin
      .from('buildings')
      .insert({ name: buildingName, address: buildingAddress })
      .select()
      .single()

    if (buildingError || !building) {
      return NextResponse.json({ error: buildingError?.message }, { status: 500 })
    }

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

    // TODO: Poslať email správcovi s dočasným heslom: tempPassword
    console.log(`Schválený správca: ${email}, dočasné heslo: ${tempPassword}`)

    return NextResponse.json({ ok: true, tempPassword })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
