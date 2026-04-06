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
      <main className="flex-1 min-w-0 p-4 md:p-8 overflow-x-hidden">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tikety</h1>
        <p className="text-gray-500 mb-6">Všetky tikety naprieč budovami</p>

        <div className="space-y-3">
          {!tickets || tickets.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 text-gray-300">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="2"/>
              </svg>
              <p>Žiadne tikety</p>
            </div>
          ) : (
            tickets.map((t: any) => (
              <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{t.title}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.status === 'Prijaté' ? 'bg-blue-100 text-blue-700' :
                        t.status === 'V riešení' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>{t.status}</span>
                      {t.category && (
                        <span className="inline-flex items-center bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{t.category}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                      <span>{t.profiles?.full_name ?? '—'}</span>
                      <span>{t.buildings?.name ?? '—'}</span>
                      <span>{new Date(t.created_at).toLocaleDateString('sk-SK')}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <DeleteItemButton itemId={t.id} table="tickets" label={t.title} />
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
