import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function deleteUserByEmail(email: string) {
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  const existing = users.find(u => u.email === email)
  if (existing) {
    const { data: profile } = await supabaseAdmin.from('profiles').select('building_id').eq('id', existing.id).single()
    if (profile?.building_id) {
      await supabaseAdmin.from('poll_votes').delete().eq('building_id', profile.building_id)
      const { data: polls } = await supabaseAdmin.from('polls').select('id').eq('building_id', profile.building_id)
      if (polls) {
        for (const p of polls) {
          await supabaseAdmin.from('poll_options').delete().eq('poll_id', p.id)
        }
      }
      await supabaseAdmin.from('polls').delete().eq('building_id', profile.building_id)
      await supabaseAdmin.from('forum_replies').delete().eq('building_id', profile.building_id)
      await supabaseAdmin.from('forum_posts').delete().eq('building_id', profile.building_id)
      await supabaseAdmin.from('tickets').delete().eq('building_id', profile.building_id)
      await supabaseAdmin.from('announcements').delete().eq('building_id', profile.building_id)
      await supabaseAdmin.from('reservations').delete().eq('building_id', profile.building_id)
      await supabaseAdmin.from('documents').delete().eq('building_id', profile.building_id)
      await supabaseAdmin.from('contacts').delete().eq('building_id', profile.building_id)
      await supabaseAdmin.from('invite_codes').delete().eq('building_id', profile.building_id)
    }
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

  // ── ZAMIETNUTIE ─────────────────────────────────────────────────────────────
  if (action === 'reject') {
    await supabaseAdmin.from('registration_requests').update({ status: 'rejected' }).eq('id', requestId)

    // Odošli email o zamietnutí
    try {
      await resend.emails.send({
        from: 'Domovník <noreply@domovnik.online>',
        to: email,
        subject: 'Vaša žiadosť o registráciu bola zamietnutá – Domovník',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f0f2f5;padding:40px 20px;">
            <div style="background:white;border-radius:16px;padding:40px;text-align:center;">
              <div style="width:60px;height:60px;background:#1a3a6b;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
                <span style="color:white;font-size:36px;font-weight:900;font-family:Georgia,serif;">D</span>
              </div>
              <h1 style="color:#1a3a6b;font-size:24px;margin-bottom:8px;">Žiadosť zamietnutá</h1>
              <p style="color:#666;font-size:15px;margin-bottom:24px;">
                Dobrý deň, ${fullName ? `<strong>${fullName}</strong>` : ''},
              </p>
              <p style="color:#666;font-size:15px;margin-bottom:24px;">
                Vaša žiadosť o registráciu správcu bytového domu
                ${buildingName ? `<strong>${buildingName}</strong>` : ''}
                bola po posúdení <strong style="color:#e53935;">zamietnutá</strong>.
              </p>
              <div style="background:#fff3f3;border:1px solid #ffcdd2;border-radius:12px;padding:20px;margin-bottom:24px;text-align:left;">
                <p style="color:#b71c1c;margin:0;font-size:14px;">
                  Ak si myslíte, že došlo k chybe, alebo máte ďalšie otázky,
                  kontaktujte nás na
                  <a href="mailto:support@domovnik.online" style="color:#1a3a6b;">support@domovnik.online</a>.
                </p>
              </div>
              <p style="color:#999;font-size:12px;margin-top:24px;">
                S pozdravom,<br>
                <strong style="color:#1a3a6b;">Tím Domovník</strong>
              </p>
            </div>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('Reject email error:', emailErr)
      // Neblokujeme odpoveď – zamietnutie prebehlo, email je best-effort
    }

    return NextResponse.json({ ok: true })
  }

  // ── SCHVÁLENIE ───────────────────────────────────────────────────────────────
  if (action === 'approve') {
    try {
      await deleteUserByEmail(email)

      const { data: building, error: buildingError } = await supabaseAdmin
        .from('buildings')
        .insert({ name: buildingName, address: buildingAddress })
        .select()
        .single()

      if (buildingError || !building) {
        return NextResponse.json({ error: 'Chyba pri vytváraní budovy: ' + buildingError?.message }, { status: 500 })
      }

      const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!'

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
      await new Promise(r => setTimeout(r, 500))
      await supabaseAdmin.from('profiles').delete().eq('id', userId)

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

      await supabaseAdmin.from('buildings').update({ manager_id: userId }).eq('id', building.id)
      await supabaseAdmin.from('registration_requests').update({ status: 'approved' }).eq('id', requestId)

      try {
        await resend.emails.send({
          from: 'Domovník <noreply@domovnik.online>',
          to: email,
          subject: 'Váš účet správcu bol schválený – Domovník',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f0f2f5;padding:40px 20px;">
              <div style="background:white;border-radius:16px;padding:40px;text-align:center;">
                <div style="width:60px;height:60px;background:#1a3a6b;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
                  <span style="color:white;font-size:36px;font-weight:900;font-family:Georgia,serif;">D</span>
                </div>
                <h1 style="color:#1a3a6b;font-size:24px;margin-bottom:8px;">Vitajte v Domovníku!</h1>
                <p style="color:#666;font-size:15px;margin-bottom:24px;">Váša žiadosť o registráciu správcu bola schválená.</p>
                <div style="background:#f0f2f5;border-radius:12px;padding:20px;margin-bottom:24px;text-align:left;">
                  <p style="color:#444;margin:0 0 12px 0;font-size:14px;"><strong>Prihlasovacie údaje:</strong></p>
                  <p style="color:#444;margin:0 0 8px 0;font-size:14px;">E-mail: <strong>${email}</strong></p>
                  <p style="color:#444;margin:0;font-size:14px;">Heslo: <strong style="font-family:monospace;background:#e8e8e8;padding:2px 6px;border-radius:4px;">${tempPassword}</strong></p>
                </div>
                <a href="https://domovnik.online" style="background-color:#1a3a6b;color:white;padding:14px 32px;text-decoration:none;border-radius:10px;display:inline-block;font-size:16px;font-weight:bold;">Prihlásiť sa →</a>
                <p style="color:#999;font-size:12px;margin-top:24px;">Po prihlásení si prosím zmeňte heslo v nastaveniach profilu.</p>
                <p style="color:#999;font-size:12px;margin-top:8px;">S pozdravom,<br><strong style="color:#1a3a6b;">Tím Domovník</strong></p>
              </div>
            </div>
          `,
        })
      } catch (emailErr) {
        console.error('Approve email error:', emailErr)
      }

      return NextResponse.json({ ok: true, tempPassword, email })
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
