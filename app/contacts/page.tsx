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
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Kontakty</h1>
        <p className="text-gray-500 mb-8">Všetky kontakty naprieč budovami</p>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {!items || items.length === 0 ? (
            <div className="p-12 text-center text-gray-400"><p>Žiadne kontakty</p></div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Meno</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Rola</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Telefón</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Budova</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Akcia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{item.role ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{item.phone ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{item.email ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{item.buildings?.name ?? '—'}</td>
                    <td className="px-6 py-4">
                      <DeleteItemButton itemId={item.id} table="contacts" label={item.name} />
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
