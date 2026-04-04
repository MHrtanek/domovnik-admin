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
    <div style={{ backgroundColor: '#f0f2f5' }} className="min-h-screen flex flex-col items-center justify-center">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <rect width="56" height="56" rx="12" fill="#1a3a6b"/>
            <rect x="10" y="20" width="36" height="26" rx="2" fill="white" fillOpacity="0.9"/>
            <rect x="14" y="24" width="6" height="6" rx="1" fill="#1a3a6b"/>
            <rect x="24" y="24" width="6" height="6" rx="1" fill="#1a3a6b"/>
            <rect x="34" y="24" width="6" height="6" rx="1" fill="#1a3a6b"/>
            <rect x="14" y="34" width="6" height="6" rx="1" fill="#1a3a6b"/>
            <rect x="24" y="34" width="6" height="6" rx="1" fill="#1a3a6b"/>
            <rect x="34" y="34" width="6" height="6" rx="1" fill="#1a3a6b"/>
            <rect x="20" y="8" width="16" height="14" rx="2" fill="white" fillOpacity="0.7"/>
          </svg>
        </div>
        <h1 style={{ color: '#1a3a6b' }} className="text-3xl font-bold">Domovník</h1>
        <p className="text-gray-500 text-sm mt-1">
          {step === 'password' ? 'Admin panel' : 'Dvojfaktorové overenie'}
        </p>
      </div>

      {/* Karta */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          {step === 'password' ? 'Prihlásenie' : 'Overenie identity'}
        </h2>

        {step === 'password' ? (
          <form onSubmit={handlePassword} className="space-y-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                placeholder="Admin heslo"
                required
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: '#1a3a6b' }}
              className="w-full text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Overujem...' : 'Pokračovať'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleTotp} className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-700">
                Otvorte <strong>Google Authenticator</strong> a zadajte kód pre <strong>Domovník Admin</strong>
              </p>
            </div>
            <div>
              <input
                type="text"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl tracking-widest font-mono focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                placeholder="000000"
                maxLength={6}
                required
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || totpCode.length !== 6}
              style={{ backgroundColor: '#1a3a6b' }}
              className="w-full text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Overujem...' : 'Prihlásiť sa'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('password'); setError('') }}
              className="w-full text-gray-400 text-sm hover:text-gray-600 transition"
            >
              ← Späť
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
