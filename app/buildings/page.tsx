export const revalidate = 0

import { supabaseAdmin } from '@/lib/supabase-admin'
import Sidebar from '@/components/Sidebar'
import BuildingActions from './BuildingActions'

export default async function BuildingsPage() {
  const { data: buildings } = await supabaseAdmin
    .from('buildings')
    .select('*, profiles!buildings_manager_id_fkey(id, full_name, email), profiles!profiles_building_id_fkey(id, role)')
    .order('created_at', { ascending: false })

  const buildingsWithCount = (buildings || []).map((b: any) => {
    const allProfiles = Array.isArray(b['profiles!profiles_building_id_fkey']) 
      ? b['profiles!profiles_building_id_fkey'] 
      : []
    const residentCount = allProfiles.filter((p: any) => p.role === 'resident').length
    return { ...b, residentCount }
  })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Správa budov</h1>
        <p className="text-gray-500 mb-6">Budovy, správcovia a obyvatelia</p>

        <div className="space-y-4">
          {!buildingsWithCount.length ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 text-gray-300">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <p>Žiadne budovy</p>
            </div>
          ) : (
            buildingsWithCount.map((b: any) => (
              <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a3a6b" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      <h2 className="font-bold text-gray-900 text-lg">{b.name}</h2>
                    </div>
                    <p className="text-gray-500 text-sm mb-3">{b.address}</p>
                    
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        {b.residentCount} obyvateľov
                      </span>
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                        {new Date(b.created_at).toLocaleDateString('sk-SK')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:items-end">
                    {b.profiles ? (
                      <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                          <span className="text-green-700 font-medium">Správca</span>
                        </div>
                        <div className="font-semibold text-gray-800">{b.profiles.full_name ?? '—'}</div>
                        <div className="text-gray-400 text-xs">{b.profiles.email}</div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-sm text-yellow-700">
                        Bez správcu
                      </div>
                    )}
                    
                    <BuildingActions 
                      buildingId={b.id}
                      buildingName={b.name}
                      managerId={b.profiles?.id ?? null}
                      managerName={b.profiles?.full_name ?? null}
                    />
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
