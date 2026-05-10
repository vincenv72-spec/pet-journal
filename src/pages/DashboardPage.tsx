import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase, type Entry } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import PhotoBackground from '../components/PhotoBackground'

export default function DashboardPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    supabase
      .from('entries')
      .select('*')
      .order('entry_date', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setEntries(data as Entry[])
        setLoading(false)
      })
  }, [session])

  async function handleDelete(id: string) {
    if (!confirm('确认删除这篇手帐吗？')) return
    const { error } = await supabase.from('entries').delete().eq('id', id)
    if (!error) setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  async function logout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  // 没有手帐时用 empty.jpg（探头小狗），有手帐用 dashboard.jpg
  const bgPhoto = !loading && entries.length === 0 ? 'empty' : 'dashboard'

  return (
    <div className="min-h-screen px-6 md:px-16 py-8 relative">
      <PhotoBackground photo={bgPhoto} intensity={0.75} />
      <header className="flex items-center justify-between mb-10 relative z-10">
        <Link to="/" className="flex items-center gap-2 text-2xl handwrite font-bold">
          🌿 宠物手帐
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span style={{ color: 'var(--color-ink-soft)' }}>{session?.user.email}</span>
          <button onClick={logout} className="underline">退出</button>
        </div>
      </header>

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4 relative z-10">
        <div>
          <h1 className="text-4xl mb-1">我的手帐本</h1>
          <p style={{ color: 'var(--color-ink-soft)' }}>
            {loading ? '...' : `已记录 ${entries.length} 篇小日子`}
          </p>
        </div>
        <Link to="/editor/new" className="btn-primary">＋ 写新一篇</Link>
      </div>

      {loading ? (
        <p className="text-center py-20" style={{ color: 'var(--color-ink-soft)' }}>加载中...</p>
      ) : entries.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-paper hover:-translate-y-1 transition-transform group"
              style={{ transform: `rotate(${(i % 3 - 1) * 0.8}deg)` }}
            >
              {entry.photo_url && (
                <img src={entry.photo_url} alt="" className="w-full h-40 object-cover rounded-lg mb-3" />
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{entry.mood ?? '🐾'}</span>
                <span className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
                  {entry.entry_date}
                </span>
              </div>
              <h3 className="text-2xl mb-2 line-clamp-1">{entry.title}</h3>
              <p className="text-sm line-clamp-3 mb-4" style={{ color: 'var(--color-ink-soft)' }}>
                {entry.content || '（空）'}
              </p>
              <div className="flex gap-3 text-sm">
                <Link to={`/editor/${entry.id}`} className="underline" style={{ color: 'var(--color-forest)' }}>编辑</Link>
                <button onClick={() => handleDelete(entry.id)} style={{ color: 'var(--color-rose)' }}>删除</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-24">
      <div className="text-7xl mb-4">📔</div>
      <h2 className="text-3xl mb-2">手帐本还是空的</h2>
      <p className="mb-6" style={{ color: 'var(--color-ink-soft)' }}>记下今天毛孩子的第一件趣事吧 🐾</p>
      <Link to="/editor/new" className="btn-primary">写下第一篇 →</Link>
    </div>
  )
}
