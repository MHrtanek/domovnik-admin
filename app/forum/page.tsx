export const revalidate = 0

import { supabaseAdmin } from '@/lib/supabase-admin'
import Sidebar from '@/components/Sidebar'
import DeletePostButton from './DeletePostButton'

export default async function ForumPage() {
  const { data: posts } = await supabaseAdmin
    .from('forum_posts')
    .select(`
      *,
      profiles(full_name, email),
      buildings(name),
      forum_replies(count)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Fórum</h1>
        <p className="text-gray-500 mb-8">Všetky príspevky naprieč budovami</p>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {!posts || posts.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 text-gray-300">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p>Žiadne príspevky</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nadpis</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Autor</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Budova</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Odpovede</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Dátum</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Akcia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post: any) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{post.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{post.content}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="font-medium text-gray-800">{post.profiles?.full_name ?? '—'}</div>
                      <div className="text-xs text-gray-400">{post.profiles?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{post.buildings?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {post.forum_replies?.[0]?.count ?? 0}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(post.created_at).toLocaleDateString('sk-SK')}
                    </td>
                    <td className="px-6 py-4">
                      <DeletePostButton postId={post.id} title={post.title} />
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
