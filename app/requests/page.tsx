export const revalidate = 0

import { supabaseAdmin } from '@/lib/supabase-admin'
import PageLayout from '@/components/PageLayout'
import RequestActions from './RequestActions'

export default async function RequestsPage() {
  const { data: requests } = await supabaseAdmin
    .from('registration_requests')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <PageLayout>
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Žiadosti o registráciu</h1>
      <p className="text-gray-500 text-sm mb-6">Správcovia čakajúci na schválenie</p>

      {!requests || requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 text-gray-300">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p>Žiadne čakajúce žiadosti</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req: any) => (
            <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-gray-900">{req.full_name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      req.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      req.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {req.status === 'pending' ? 'Čaká' : req.status === 'approved' ? 'Schválené' : 'Zamietnuté'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">{req.email}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">{req.building_name}</span>
                    {req.building_address && <span className="text-gray-400"> · {req.building_address}</span>}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <RequestActions
                    requestId={req.id}
                    email={req.email}
                    fullName={req.full_name}
                    buildingName={req.building_name}
                    buildingAddress={req.building_address}
                    status={req.status}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  )
}
