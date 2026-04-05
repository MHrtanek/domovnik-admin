import { NextRequest, NextResponse } from 'next/server'
import * as OTPAuth from 'otpauth'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Krok 1: overenie hesla
  if (body.step === 'password') {
    if (body.password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Skontroluj či má zariadenie trusted token
    const trustedToken = request.cookies.get('admin_trusted_device')
    const expectedToken = crypto
      .createHmac('sha256', process.env.ADMIN_PASSWORD!)
      .update('trusted_device')
      .digest('hex')

    if (trustedToken && trustedToken.value === expectedToken) {
      // Zariadenie je dôveryhodné — preskočí TOTP, nastav session
      const res = NextResponse.json({ ok: true, skipTotp: true })
      res.cookies.set('admin_session', process.env.ADMIN_PASSWORD!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 8, // 8 hodín
      })
      return res
    }

    // Heslo OK — nastav dočasnú cookie
    const res = NextResponse.json({ ok: true, skipTotp: false })
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

    const res = NextResponse.json({ ok: true })
    res.cookies.delete('admin_password_ok')

    // Nastav session
    res.cookies.set('admin_session', process.env.ADMIN_PASSWORD!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
    })

    // Ak si zaškrtol "zapamätaj zariadenie" — nastav trusted token na 30 dní
    if (body.trustDevice) {
      const trustedToken = crypto
        .createHmac('sha256', process.env.ADMIN_PASSWORD!)
        .update('trusted_device')
        .digest('hex')

      res.cookies.set('admin_trusted_device', trustedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 dní
      })
    }

    return res
  }

  return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
}
