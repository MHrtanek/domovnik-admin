export const revalidate = 0

import { supabaseAdmin } from '@/lib/supabase-admin'
import Sidebar from '@/components/Sidebar'
import DeleteItemButton from '@/components/DeleteItemButton'

export default async function ContactsPage() {
  const { data: items } = await supabaseAdmin
    .from('contacts')
    .select('*, buildings(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 min-w-0 p-4 md:p-8 overflow-x-hidden">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Kontakty</h1>
        <p className="text-gray-500 mb-6">Všetky kontakty naprieč budovami</p>

        <div className="space-y-3">
          {!items || items.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              <p>Žiadne kontakty</p>
            </div>
          ) : (
            items.map((item: any) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{item.name}</span>
                      {item.role && (
                        <span className="inline-flex items-center bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{item.role}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                      {item.phone && (
                        <a href={`tel:${item.phone}`} className="text-blue-600 hover:underline">{item.phone}</a>
                      )}
                      {item.email && (
                        <a href={`mailto:${item.email}`} className="text-blue-600 hover:underline truncate">{item.email}</a>
                      )}
                      <span>{item.buildings?.name ?? '—'}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <DeleteItemButton itemId={item.id} table="contacts" label={item.name} />
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
