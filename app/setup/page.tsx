import { supabaseAdmin } from '@/lib/supabase-admin'
import * as OTPAuth from 'otpauth'
import QRCode from 'qrcode'

export default async function SetupPage() {
  const totp = new OTPAuth.TOTP({
    issuer: 'Domovník Admin',
    label: 'Admin',
    secret: OTPAuth.Secret.fromBase32(process.env.TOTP_SECRET!),
    digits: 6,
    period: 30,
    algorithm: 'SHA1',
  })

  const uri = totp.toString()
  const qrDataUrl = await QRCode.toDataURL(uri)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md text-center">
        <div className="text-4xl mb-3">📱</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Nastavenie Google Authenticator</h1>
        <p className="text-gray-500 text-sm mb-6">
          Naskenujte QR kód v aplikácii Google Authenticator
        </p>
        
        <div className="flex justify-center mb-6">
          <img src={qrDataUrl} alt="QR kód" className="w-48 h-48" />
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-xs text-gray-500 mb-1">Alebo zadajte kód manuálne:</p>
          <p className="font-mono text-sm font-bold text-gray-800 break-all">{process.env.TOTP_SECRET}</p>
        </div>

        <a
          href="/login"
          className="inline-block bg-blue-900 text-white rounded-lg px-6 py-2.5 font-medium hover:bg-blue-800 transition"
        >
          Hotovo — Prihlásiť sa
        </a>

        <p className="text-red-500 text-xs mt-4">
          ⚠️ Táto stránka je dostupná len pri prvom nastavení. Zmažte ju po naskenovaní!
        </p>
      </div>
    </div>
  )
}
