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
      <main className="flex-1 min-w-0 p-4 md:p-8 overflow-x-hidden">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Hlasovanie</h1>
        <p className="text-gray-500 mb-6">Všetky hlasovania naprieč budovami</p>

        <div className="space-y-3">
          {!items || items.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              <p>Žiadne hlasovania</p>
            </div>
          ) : (
            items.map((item: any) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">{item.question}</div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                      <span>{item.profiles?.full_name ?? '—'}</span>
                      <span>{item.buildings?.name ?? '—'}</span>
                      <span>Platnosť: {item.expires_at ? new Date(item.expires_at).toLocaleDateString('sk-SK') : 'Bez obmedzenia'}</span>
                      <span>{new Date(item.created_at).toLocaleDateString('sk-SK')}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <DeleteItemButton itemId={item.id} table="polls" label={item.question} />
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
