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
  const router = useRouter()

  async function handleAction(action: 'approve' | 'reject' | 'delete') {
    if (action === 'delete') {
      if (!confirm(`Naozaj chcete vymazať žiadosť od ${fullName}?`)) return
    }
    setLoading(true)
    await fetch('/api/admin/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, action, email, fullName, buildingName, buildingAddress }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex gap-2">
      {status === 'pending' && (
        <>
          <button
            onClick={() => handleAction('approve')}
            disabled={loading}
            className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
          >
            ✓ Schváliť
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
        🗑 Vymazať
      </button>
    </div>
  )
}
