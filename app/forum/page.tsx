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
      <main className="flex-1 min-w-0 p-4 md:p-8 overflow-x-hidden">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Fórum</h1>
        <p className="text-gray-500 mb-6">Všetky príspevky naprieč budovami</p>

        <div className="space-y-3">
          {!posts || posts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 text-gray-300">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p>Žiadne príspevky</p>
            </div>
          ) : (
            posts.map((post: any) => (
              <div key={post.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">{post.title}</div>
                    {post.content && (
                      <div className="text-xs text-gray-400 mt-0.5 truncate">{post.content}</div>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                      <span>{post.profiles?.full_name ?? '—'}</span>
                      <span>{post.buildings?.name ?? '—'}</span>
                      <span className="inline-flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        {post.forum_replies?.[0]?.count ?? 0}
                      </span>
                      <span>{new Date(post.created_at).toLocaleDateString('sk-SK')}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <DeletePostButton postId={post.id} title={post.title} />
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
