'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  requestId: string
  email: string
  fullName: string
  buildingName: string
  buildingAddress: string
  status: string
}

export default function RequestActions({ requestId, email, fullName, buildingName, buildingAddress, status }: Props) {
  const [loading, setLoading] = useState(false)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleAction(action: 'approve' | 'reject' | 'delete') {
    if (action === 'delete') {
      if (!confirm(`Naozaj chcete vymazať žiadosť od ${fullName}?`)) return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action, email, fullName, buildingName, buildingAddress }),
      })
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || 'Chyba servera')
        setLoading(false)
        return
      }

      if (action === 'approve' && data.tempPassword) {
        setTempPassword(data.tempPassword)
      }
      
      router.refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (tempPassword) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-w-xs">
        <p className="text-xs text-green-700 font-medium mb-1">✅ Účet vytvorený! Dočasné heslo:</p>
        <p className="font-mono text-sm font-bold text-green-800 bg-white px-2 py-1 rounded border border-green-200">{tempPassword}</p>
        <p className="text-xs text-green-600 mt-1">Pošlite toto heslo správcovi: {email}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">{error}</p>
      )}
      <div className="flex gap-2">
        {status === 'pending' && (
          <>
            <button
              onClick={() => handleAction('approve')}
              disabled={loading}
              className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
            >
              {loading ? 'Spracúva sa...' : '✓ Schváliť'}
            </button>
            <button
              onClick={() => handleAction('reject')}
              disabled={loading}
              className="px-3 py-1.5 bg-orange-100 text-orange-700 text-xs rounded-lg hover:bg-orange-200 disabled:opacity-50 transition"
            >
              ✗ Zamietnuť
            </button>
          </>
        )}
        <button
          onClick={() => handleAction('delete')}
          disabled={loading}
          className="px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 disabled:opacity-50 transition"
        >
          Vymazať
        </button>
      </div>
    </div>
  )
}
