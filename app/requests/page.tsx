export const revalidate = 0

import { supabaseAdmin } from '@/lib/supabase-admin'
import Sidebar from '@/components/Sidebar'
import RequestActions from './RequestActions'

export default async function RequestsPage() {
  const { data: requests } = await supabaseAdmin
    .from('registration_requests')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Žiadosti o registráciu</h1>
        <p className="text-gray-500 mb-8">Správcovia čakajúci na schválenie</p>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {!requests || requests.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <div className="text-4xl mb-3">✅</div>
              <p>Žiadne čakajúce žiadosti</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Meno</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">E-mail</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Budova</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Adresa</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Akcia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req: any) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{req.full_name}</td>
                    <td className="px-6 py-4 text-gray-600">{req.email}</td>
                    <td className="px-6 py-4 text-gray-600">{req.building_name}</td>
                    <td className="px-6 py-4 text-gray-600">{req.building_address}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        req.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        req.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {req.status === 'pending' ? 'Čaká' : req.status === 'approved' ? 'Schválené' : 'Zamietnuté'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <RequestActions
                        requestId={req.id}
                        email={req.email}
                        fullName={req.full_name}
                        buildingName={req.building_name}
                        buildingAddress={req.building_address}
                        status={req.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
