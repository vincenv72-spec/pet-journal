import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase, type Entry, type Pet, SPECIES_EMOJI } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import PhotoBackground from '../components/PhotoBackground'

export default function DashboardPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [entries, setEntries] = useState<Entry[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPetId, setFilterPetId] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    Promise.all([
      supabase.from('entries').select('*').order('entry_date', { ascending: false }),
      supabase.from('pets').select('*').order('created_at'),
    ]).then(([entriesRes, petsRes]) => {
      if (entriesRes.data) setEntries(entriesRes.data as Entry[])
      if (petsRes.data) setPets(petsRes.data as Pet[])
      setLoading(false)
    })
  }, [session])

  const filtered = useMemo(() => {
    if (filterPetId === null) return entries
    if (filterPetId === '__none__') return entries.filter((e) => !e.pet_id)
    return entries.filter((e) => e.pet_id === filterPetId)
  }, [entries, filterPetId])

  async function handleDelete(id: string) {
    if (!confirm('确认删除这篇手帐吗？')) return
    const { error } = await supabase.from('entries').delete().eq('id', id)
    if (!error) setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  async function logout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  const bgPhoto = !loading && entries.length === 0 ? 'empty' : 'dashboard'

  return (
    <div className="min-h-screen px-6 md:px-16 py-8 relative">
      <PhotoBackground photo={bgPhoto} intensity={0.75} />

      <header className="flex items-center justify-between mb-10 relative z-10">
        <Link to="/" className="flex items-center gap-2 text-2xl handwrite font-bold">
          🌿 宠物手帐
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link to="/dashboard" className="font-bold" style={{ color: 'var(--color-forest)' }}>手帐本</Link>
          <Link to="/pets" className="hover:opacity-70">毛孩子</Link>
          <span style={{ color: 'var(--color-ink-soft)' }}>{session?.user.email}</span>
          <button onClick={logout} className="underline">退出</button>
        </nav>
      </header>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4 relative z-10">
        <div>
          <h1 className="text-4xl mb-1">我的手帐本</h1>
          <p style={{ color: 'var(--color-ink-soft)' }}>
            {loading ? '...' : `已记录 ${entries.length} 篇小日子`}
          </p>
        </div>
        <Link to="/editor/new" className="btn-primary">＋ 写新一篇</Link>
      </div>

      {/* 宠物筛选 Tab 条 */}
      {pets.length > 0 && !loading && (
        <div className="flex flex-wrap gap-2 mb-8 relative z-10">
          <FilterPill active={filterPetId === null} onClick={() => setFilterPetId(null)} count={entries.length}>
            全部
          </FilterPill>
          {pets.map((p) => {
            const count = entries.filter((e) => e.pet_id === p.id).length
            return (
              <FilterPill key={p.id} active={filterPetId === p.id} onClick={() => setFilterPetId(p.id)} count={count}>
                {SPECIES_EMOJI[p.species]} {p.name}
              </FilterPill>
            )
          })}
          <FilterPill
            active={filterPetId === '__none__'}
            onClick={() => setFilterPetId('__none__')}
            count={entries.filter((e) => !e.pet_id).length}
          >
            未指定
          </FilterPill>
        </div>
      )}

      {loading ? (
        <p className="text-center py-20" style={{ color: 'var(--color-ink-soft)' }}>加载中...</p>
      ) : filtered.length === 0 ? (
        entries.length === 0 ? <EmptyState /> : <FilteredEmpty />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {filtered.map((entry, i) => (
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
              {entry.pet_name && (
                <p className="text-xs mb-2" style={{ color: 'var(--color-forest)' }}>
                  · {entry.pet_name} ·
                </p>
              )}
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

function FilterPill({ active, onClick, children, count }: { active: boolean; onClick: () => void; children: React.ReactNode; count: number }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm transition"
      style={{
        background: active ? 'var(--color-forest)' : 'rgba(255,255,255,0.4)',
        color: active ? 'white' : 'var(--color-ink-soft)',
        border: '1px solid ' + (active ? 'var(--color-forest)' : 'rgba(122,106,92,0.18)'),
        backdropFilter: 'blur(8px)',
      }}
    >
      {children}
      <span className="text-xs opacity-70">({count})</span>
    </button>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-24 relative z-10">
      <div className="text-7xl mb-4">📔</div>
      <h2 className="text-3xl mb-2">手帐本还是空的</h2>
      <p className="mb-6" style={{ color: 'var(--color-ink-soft)' }}>记下今天毛孩子的第一件趣事吧 🐾</p>
      <Link to="/editor/new" className="btn-primary">写下第一篇 →</Link>
    </div>
  )
}

function FilteredEmpty() {
  return (
    <div className="text-center py-16 relative z-10">
      <div className="text-5xl mb-3">🌿</div>
      <p style={{ color: 'var(--color-ink-soft)' }}>这位毛孩子还没有手帐，写一篇？</p>
      <Link to="/editor/new" className="btn-primary mt-4 inline-flex">＋ 新一篇</Link>
    </div>
  )
}
