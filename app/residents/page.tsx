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
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Obyvatelia</h1>
        <p className="text-gray-500 mb-8">Všetci obyvatelia bytových domov</p>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {!residents || residents.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <div className="text-4xl mb-3">👥</div>
              <p>Žiadni obyvatelia</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Meno</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">E-mail</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Byt</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Budova</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Registrovaný</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Akcia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {residents.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{r.full_name ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{r.email}</td>
                    <td className="px-6 py-4 text-gray-500">{r.flat_number ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {r.buildings ? (
                        <div>
                          <div className="font-medium text-gray-800">{r.buildings.name}</div>
                          <div className="text-xs text-gray-400">{r.buildings.address}</div>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(r.created_at).toLocaleDateString('sk-SK')}
                    </td>
                    <td className="px-6 py-4">
                      <DeleteUserButton userId={r.id} name={r.full_name ?? r.email} />
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
