import { supabaseAdmin } from '@/lib/supabase-admin'
import Sidebar from '@/components/Sidebar'

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
    { label: 'Budovy', value: buildingsCount ?? 0, icon: '🏢', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700' },
    { label: 'Správcovia', value: managersCount ?? 0, icon: '👔', color: 'bg-green-50 border-green-200', textColor: 'text-green-700' },
    { label: 'Obyvatelia', value: residentsCount ?? 0, icon: '👥', color: 'bg-purple-50 border-purple-200', textColor: 'text-purple-700' },
    { label: 'Čakajúce žiadosti', value: requestsCount ?? 0, icon: '📋', color: 'bg-orange-50 border-orange-200', textColor: 'text-orange-700' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500 mb-8">Prehľad systému Domovník</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className={`border rounded-xl p-6 ${stat.color}`}>
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</div>
              <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {(requestsCount ?? 0) > 0 && (
          <div className="mt-8 bg-orange-50 border border-orange-200 rounded-xl p-6">
            <h2 className="font-semibold text-orange-800 mb-1">⚠️ Čakajúce žiadosti</h2>
            <p className="text-orange-700 text-sm">
              Máte {requestsCount} čakajúcich žiadostí o registráciu správcu.{' '}
              <a href="/requests" className="underline font-medium">Zobraziť žiadosti →</a>
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
