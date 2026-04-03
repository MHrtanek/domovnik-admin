'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function ActivityTracker() {
  const router = useRouter()

  const refresh = useCallback(async () => {
    const res = await fetch('/api/admin/activity', { method: 'POST' })
    if (!res.ok) {
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    // Obnov session pri každej aktivite
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    
    let timeout: NodeJS.Timeout
    
    const handleActivity = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        refresh()
      }, 500) // debounce
    }

    events.forEach(e => window.addEventListener(e, handleActivity))

    // Každých 45 sekúnd obnov aj bez aktivity (ak je tab otvorený)
    const interval = setInterval(refresh, 45 * 1000)

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity))
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [refresh])

  return null
}
