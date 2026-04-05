export const revalidate = 0

import { supabaseAdmin } from '@/lib/supabase-admin'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

export default async function DashboardPage() {
  const [
    { count: buildingsCount },
    { count: managersCount },
    { count: residentsCount },
    { count: requestsCount },
  ] = await Promise.all([
    supabaseAdmin.from('buildings').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'manager'),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'resident'),
    supabaseAdmin.from('registration_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const stats = [
    {
      label: 'Budovy',
      value: buildingsCount ?? 0,
      href: '/buildings',
      color: 'border-blue-200 bg-blue-50',
      textColor: 'text-blue-700',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-500">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      label: 'Správcovia',
      value: managersCount ?? 0,
      href: '/managers',
      color: 'border-green-200 bg-green-50',
      textColor: 'text-green-700',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-500">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
    {
      label: 'Obyvatelia',
      value: residentsCount ?? 0,
      href: '/residents',
      color: 'border-purple-200 bg-purple-50',
      textColor: 'text-purple-700',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-500">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      label: 'Čakajúce žiadosti',
      value: requestsCount ?? 0,
      href: '/requests',
      color: 'border-orange-200 bg-orange-50',
      textColor: 'text-orange-700',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-orange-500">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="9" y1="13" x2="15" y2="13"/>
          <line x1="9" y1="17" x2="15" y2="17"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500 mb-8">Prehľad systému Domovník</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <div className={`border rounded-xl p-6 hover:shadow-md transition cursor-pointer ${stat.color}`}>
                <div className="flex items-center justify-between mb-4">
                  {stat.icon}
                </div>
                <div className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {(requestsCount ?? 0) > 0 && (
          <div className="mt-8 bg-orange-50 border border-orange-200 rounded-xl p-6">
            <h2 className="font-semibold text-orange-800 mb-1">Čakajúce žiadosti</h2>
            <p className="text-orange-700 text-sm">
              Máte {requestsCount} čakajúcich žiadostí o registráciu správcu.{' '}
              <Link href="/requests" className="underline font-medium">Zobraziť žiadosti →</Link>
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
