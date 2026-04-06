import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function deleteUserByEmail(email: string) {
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  const existing = users.find(u => u.email === email)
  if (existing) {
    await supabaseAdmin.from('profiles').delete().eq('id', existing.id)
    await supabaseAdmin.auth.admin.deleteUser(existing.id)
  }
}

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
    try {
      // 0. Vymaž existujúceho používateľa s týmto emailom
      await deleteUserByEmail(email)

      // 1. Vytvor budovu
      const { data: building, error: buildingError } = await supabaseAdmin
        .from('buildings')
        .insert({ name: buildingName, address: buildingAddress })
        .select()
        .single()

      if (buildingError || !building) {
        return NextResponse.json({ error: 'Chyba pri vytváraní budovy: ' + buildingError?.message }, { status: 500 })
      }

      // 2. Heslo
      const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!'

      // 3. Vytvor Auth používateľa
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
      })

      if (authError || !authData.user) {
        await supabaseAdmin.from('buildings').delete().eq('id', building.id)
        return NextResponse.json({ error: 'Chyba pri vytváraní Auth: ' + authError?.message }, { status: 500 })
      }

      const userId = authData.user.id

      // 4. Počkaj 500ms aby trigger stihol vytvoriť profil
      await new Promise(r => setTimeout(r, 500))

      // 5. Vymaž profil vytvorený triggerom
      await supabaseAdmin.from('profiles').delete().eq('id', userId)

      // 6. Vytvor správny profil
      const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: userId,
        email,
        full_name: fullName,
        role: 'manager',
        building_id: building.id,
      })

      if (profileError) {
        return NextResponse.json({ error: 'Chyba pri vytváraní profilu: ' + profileError.message }, { status: 500 })
      }

      // 7. Napoj správcu na budovu
      await supabaseAdmin.from('buildings').update({ manager_id: userId }).eq('id', building.id)

      // 8. Schváľ žiadosť
      await supabaseAdmin.from('registration_requests').update({ status: 'approved' }).eq('id', requestId)

      // 9. Email
      try {
        await resend.emails.send({
          from: 'Domovník <onboarding@resend.dev>',
          to: email,
          subject: 'Váš účet správcu bol schválený – Domovník',
          html: `<p>Heslo: <strong>${tempPassword}</strong></p><p><a href="https://domovnik-app.vercel.app">Prihlásiť sa</a></p>`,
        })
      } catch (emailErr) {
        console.error('Email error:', emailErr)
      }

      return NextResponse.json({ ok: true, tempPassword, email })
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
