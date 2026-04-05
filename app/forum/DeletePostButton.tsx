'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  postId: string
  title: string
}

export default function DeletePostButton({ postId, title }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Naozaj chcete vymazať príspevok "${title}"?`)) return
    setLoading(true)
    await fetch('/api/admin/forum', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 disabled:opacity-50 transition"
    >
      {loading ? '...' : 'Vymazať'}
    </button>
  )
}
