import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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
      return NextResponse.json({ error: authError?.message }, { status: 500 })
    }

    const userId = authData.user.id

    // 4. Vymaž profil vytvorený triggerom
    await supabaseAdmin.from('profiles').delete().eq('id', userId)

    // 5. Vytvor profil správcu
    await supabaseAdmin.from('profiles').insert({
      id: userId,
      email,
      full_name: fullName,
      role: 'manager',
      building_id: building.id,
    })

    // 6. Napoj správcu na budovu
    await supabaseAdmin.from('buildings').update({ manager_id: userId }).eq('id', building.id)

    // 7. Označ žiadosť ako schválenú
    await supabaseAdmin.from('registration_requests').update({ status: 'approved' }).eq('id', requestId)

    // 8. Pošli email cez Resend
    await resend.emails.send({
      from: 'Domovník <domovnik.app@gmail.com>',
      to: email,
      subject: 'Váš účet správcu bol schválený – Domovník',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f0f2f5;padding:40px 20px;">
          <div style="background:white;border-radius:16px;padding:40px;text-align:center;">
            <h1 style="color:#1a3a6b;font-size:24px;margin-bottom:8px;">Vitajte v Domovníku!</h1>
            <p style="color:#666;font-size:15px;margin-bottom:24px;">Váša žiadosť o registráciu správcu bola schválená.</p>
            
            <div style="background:#f0f2f5;border-radius:12px;padding:20px;margin-bottom:24px;text-align:left;">
              <p style="color:#444;margin:0 0 12px 0;font-size:14px;"><strong>Prihlasovacie údaje:</strong></p>
              <p style="color:#444;margin:0 0 8px 0;font-size:14px;">E-mail: <strong>${email}</strong></p>
              <p style="color:#444;margin:0;font-size:14px;">Heslo: <strong style="font-family:monospace;background:#e8e8e8;padding:2px 6px;border-radius:4px;">${tempPassword}</strong></p>
            </div>
            
            <a href="https://domovnik-app.vercel.app" style="background-color:#1a3a6b;color:white;padding:14px 32px;text-decoration:none;border-radius:10px;display:inline-block;font-size:16px;font-weight:bold;">Prihlásiť sa →</a>
            
            <p style="color:#999;font-size:12px;margin-top:24px;">Po prihlásení si prosím zmeňte heslo v nastaveniach profilu.</p>
            <p style="color:#999;font-size:12px;margin-top:8px;">S pozdravom,<br><strong style="color:#1a3a6b;">Tím Domovník</strong></p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ ok: true, tempPassword, email })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
