export const revalidate = 0

import { supabaseAdmin } from '@/lib/supabase-admin'
import Sidebar from '@/components/Sidebar'
import DeleteItemButton from '@/components/DeleteItemButton'

export default async function TicketsPage() {
  const { data: tickets } = await supabaseAdmin
    .from('tickets')
    .select('*, profiles(full_name, email), buildings(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tikety</h1>
        <p className="text-gray-500 mb-8">Všetky tikety naprieč budovami</p>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {!tickets || tickets.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 text-gray-300"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg>
              <p>Žiadne tikety</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nadpis</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Kategória</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Autor</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Budova</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Dátum</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Akcia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">{t.title}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{t.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        t.status === 'Prijaté' ? 'bg-blue-100 text-blue-700' :
                        t.status === 'V riešení' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>{t.status}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{t.profiles?.full_name ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{t.buildings?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{new Date(t.created_at).toLocaleDateString('sk-SK')}</td>
                    <td className="px-6 py-4">
                      <DeleteItemButton itemId={t.id} table="tickets" label={t.title} />
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
