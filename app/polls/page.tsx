export const revalidate = 0

import { supabaseAdmin } from '@/lib/supabase-admin'
import Sidebar from '@/components/Sidebar'
import DeleteItemButton from '@/components/DeleteItemButton'

export default async function PollsPage() {
  const { data: items } = await supabaseAdmin
    .from('polls')
    .select('*, profiles(full_name), buildings(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Hlasovanie</h1>
        <p className="text-gray-500 mb-8">Všetky hlasovania naprieč budovami</p>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {!items || items.length === 0 ? (
            <div className="p-12 text-center text-gray-400"><p>Žiadne hlasovania</p></div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Otázka</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Autor</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Budova</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Platnosť</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Dátum</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Akcia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.question}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{item.profiles?.full_name ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{item.buildings?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {item.expires_at ? new Date(item.expires_at).toLocaleDateString('sk-SK') : 'Bez obmedzenia'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{new Date(item.created_at).toLocaleDateString('sk-SK')}</td>
                    <td className="px-6 py-4">
                      <DeleteItemButton itemId={item.id} table="polls" label={item.question} />
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
