'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  buildingId: string
  buildingName: string
  managerId: string | null
  managerName: string | null
}

export default function BuildingActions({ buildingId, buildingName, managerId, managerName }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDeleteBuilding() {
    if (!confirm(`Vymazať budovu "${buildingName}" aj so všetkými obyvateľmi a dátami?`)) return
    setLoading(true)
    try {
      await fetch('/api/admin/buildings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildingId }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteManager() {
    if (!managerId) return
    if (!confirm(`Odstrániť správcu "${managerName}"? Budova ostane bez správcu.`)) return
    setLoading(true)
    try {
      await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: managerId, onlyManager: true }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {managerId && (
        <button
          onClick={handleDeleteManager}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-50 transition disabled:opacity-50"
        >
          Vymeniť správcu
        </button>
      )}
      <button
        onClick={handleDeleteBuilding}
        disabled={loading}
        className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
      >
        {loading ? '...' : 'Vymazať budovu'}
      </button>
    </div>
  )
}
