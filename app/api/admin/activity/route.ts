import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const session = request.cookies.get('admin_session')
  if (!session || session.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Obnov session na ďalšiu minútu
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_session', process.env.ADMIN_PASSWORD!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 1 minúta
  })
  return res
}
