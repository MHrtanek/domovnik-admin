'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/requests', label: 'Žiadosti', icon: '📋' },
  { href: '/buildings', label: 'Budovy', icon: '🏢' },
  { href: '/managers', label: 'Správcovia', icon: '👔' },
  { href: '/residents', label: 'Obyvatelia', icon: '👥' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className="w-64 bg-blue-900 min-h-screen flex flex-col">
      <div className="p-6 border-b border-blue-800">
        <div className="text-2xl mb-1">🏢</div>
        <h1 className="text-white font-bold text-lg">Domovník</h1>
        <p className="text-blue-300 text-xs">Admin panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-white text-blue-900'
                  : 'text-blue-100 hover:bg-blue-800'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-blue-800">
        <button
          onClick={handleLogout}
          className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-blue-200 hover:bg-blue-800 transition"
        >
          <span>🚪</span>
          Odhlásiť sa
        </button>
      </div>
    </aside>
  )
}
