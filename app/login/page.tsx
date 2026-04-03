'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [step, setStep] = useState<'password' | 'totp'>('password')
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'password', password }),
    })
    if (res.ok) {
      setStep('totp')
    } else {
      setError('Nesprávne heslo')
    }
    setLoading(false)
  }

  async function handleTotp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'totp', code: totpCode }),
    })
    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError('Nesprávny kód. Skúste znova.')
      setTotpCode('')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏢</div>
          <h1 className="text-2xl font-bold text-gray-900">Domovník Admin</h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === 'password' ? 'Správa systému' : 'Dvojfaktorové overenie'}
          </p>
        </div>

        {step === 'password' ? (
          <form onSubmit={handlePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heslo</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Admin heslo"
                required
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white rounded-lg py-2.5 font-medium hover:bg-blue-800 transition disabled:opacity-50"
            >
              {loading ? 'Overujem...' : 'Pokračovať →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleTotp} className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-700">
                Otvorte <strong>Google Authenticator</strong> a zadajte kód pre <strong>Domovník Admin</strong>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">6-ciferný kód</label>
              <input
                type="text"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                maxLength={6}
                required
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || totpCode.length !== 6}
              className="w-full bg-blue-900 text-white rounded-lg py-2.5 font-medium hover:bg-blue-800 transition disabled:opacity-50"
            >
              {loading ? 'Overujem...' : 'Prihlásiť sa'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('password'); setError('') }}
              className="w-full text-gray-500 text-sm hover:text-gray-700 transition"
            >
              ← Späť
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
