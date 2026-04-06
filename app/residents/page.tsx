export const revalidate = 0

import { supabaseAdmin } from '@/lib/supabase-admin'
import Sidebar from '@/components/Sidebar'
import DeleteUserButton from '@/components/DeleteUserButton'

export default async function ResidentsPage() {
  const { data: residents } = await supabaseAdmin
    .from('profiles')
    .select('*, buildings(name, address)')
    .eq('role', 'resident')
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 min-w-0 p-4 md:p-8 overflow-x-hidden">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Obyvatelia</h1>
        <p className="text-gray-500 mb-6">Všetci obyvatelia bytových domov</p>

        <div className="space-y-3">
          {!residents || residents.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 text-gray-300">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <p>Žiadni obyvatelia</p>
            </div>
          ) : (
            residents.map((r: any) => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{r.full_name ?? '—'}</div>
                    <div className="text-sm text-gray-500 truncate">{r.email}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {r.flat_number && (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                          Byt {r.flat_number}
                        </span>
                      )}
                      {r.buildings && (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs truncate max-w-[180px]">
                          {r.buildings.name}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full text-xs">
                        {new Date(r.created_at).toLocaleDateString('sk-SK')}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <DeleteUserButton userId={r.id} name={r.full_name ?? r.email} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
