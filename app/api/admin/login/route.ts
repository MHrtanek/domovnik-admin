import { NextRequest, NextResponse } from 'next/server'
import * as OTPAuth from 'otpauth'

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Krok 1: overenie hesla
  if (body.step === 'password') {
    if (body.password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Heslo OK — nastav dočasnú cookie že heslo prešlo
    const res = NextResponse.json({ ok: true })
    res.cookies.set('admin_password_ok', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 5, // 5 minút na zadanie TOTP
    })
    return res
  }

  // Krok 2: overenie TOTP
  if (body.step === 'totp') {
    const passwordOk = request.cookies.get('admin_password_ok')
    if (!passwordOk) {
      return NextResponse.json({ error: 'Password step required' }, { status: 401 })
    }

    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(process.env.TOTP_SECRET!),
      digits: 6,
      period: 30,
      algorithm: 'SHA1',
    })

    const delta = totp.validate({ token: body.code, window: 1 })
    if (delta === null) {
      return NextResponse.json({ error: 'Invalid TOTP' }, { status: 401 })
    }

    // TOTP OK — nastav hlavnú session s 1 minútou
    const res = NextResponse.json({ ok: true })
    res.cookies.delete('admin_password_ok')
    res.cookies.set('admin_session', process.env.ADMIN_PASSWORD!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 1 minúta
    })
    return res
  }

  return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
}
