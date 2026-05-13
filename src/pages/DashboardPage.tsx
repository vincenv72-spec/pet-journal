import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, type Entry, type Pet, SPECIES_EMOJI, TAG_PRESETS, isMemorial } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import PhotoBackground from '../components/PhotoBackground'
import ShareCard from '../components/ShareCard'
import ThemePicker from '../components/ThemePicker'
import PovBubble from '../components/PovBubble'
import MemorialAnniversaryCard, { getMemorialAnniversariesToShow } from '../components/MemorialAnniversaryCard'

export default function DashboardPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [entries, setEntries] = useState<Entry[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPetId, setFilterPetId] = useState<string | null>(null)
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [sharingEntry, setSharingEntry] = useState<Entry | null>(null)
  const [anniversaries, setAnniversaries] = useState<{ pet: Pet; yearsSince: number }[]>([])
  const anniversariesComputedRef = useRef(false)

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

  // 计算今天要显示的 memorial 周年卡片（仅 pets 加载后算一次，避免 strict mode 双调）
  useEffect(() => {
    if (anniversariesComputedRef.current || pets.length === 0) return
    anniversariesComputedRef.current = true
    setAnniversaries(getMemorialAnniversariesToShow(pets))
  }, [pets])

  const filtered = useMemo(() => {
    let list = entries
    if (filterPetId !== null) {
      list = filterPetId === '__none__'
        ? list.filter((e) => !e.pet_id)
        : list.filter((e) => e.pet_id === filterPetId)
    }
    if (filterTag) {
      list = list.filter((e) => e.tags?.includes(filterTag))
    }
    return list
  }, [entries, filterPetId, filterTag])

  // 收集所有用过的标签
  const usedTags = useMemo(() => {
    const set = new Set<string>()
    entries.forEach((e) => e.tags?.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [entries])

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

      <header className="flex items-center justify-between mb-10 relative z-10 flex-wrap gap-3">
        <Link to="/" className="flex items-center gap-2 text-2xl handwrite font-bold">
          🌿 宠物手帐
        </Link>
        <nav className="flex items-center gap-3 md:gap-5 text-sm">
          <ThemePicker />
          <Link to="/dashboard" className="hidden md:inline font-bold" style={{ color: 'var(--color-forest)' }}>手帐本</Link>
          <Link to="/pets" className="hidden md:inline hover:opacity-70">毛孩子</Link>
          <span className="hidden sm:inline text-xs md:text-sm" style={{ color: 'var(--color-ink-soft)' }}>{session?.user.email}</span>
          <button onClick={logout} className="underline text-sm">退出</button>
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

      {/* 周年纪念卡片（仅 memorial 宠物离开周年当天 + 当天前 2 次访问） */}
      {anniversaries.length > 0 && !loading && (
        <AnimatePresence>
          {anniversaries.map(({ pet, yearsSince }) => (
            <MemorialAnniversaryCard
              key={pet.id}
              pet={pet}
              yearsSince={yearsSince}
              onClose={() => setAnniversaries((prev) => prev.filter((a) => a.pet.id !== pet.id))}
            />
          ))}
        </AnimatePresence>
      )}

      {/* 永久长卷入口：横向卡片，每只宠物一张 */}
      {pets.length > 0 && !loading && (
        <section className="mb-6 relative z-10">
          <p className="text-xs mb-2.5 tracking-wide" style={{ color: 'var(--color-ink-soft)' }}>
            📖 翻看他们的一生
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {pets.map((p) => {
              const memorial = isMemorial(p)
              return (
                <Link
                  key={p.id}
                  to={`/pets/${p.id}/lifelong`}
                  className="shrink-0 rounded-2xl px-4 py-3 flex items-center gap-3 transition hover:-translate-y-0.5 group"
                  style={{
                    minWidth: '210px',
                    background: memorial
                      ? 'rgba(232, 236, 228, 0.62)'
                      : 'rgba(255, 248, 232, 0.55)',
                    border: memorial
                      ? '1px solid rgba(90, 124, 94, 0.30)'
                      : '1px solid rgba(122, 106, 92, 0.18)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-2xl shrink-0"
                    style={{ background: 'rgba(255, 232, 200, 0.7)' }}
                  >
                    {p.avatar_url ? (
                      <img src={p.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                    ) : (
                      <span>{SPECIES_EMOJI[p.species]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold truncate">{p.name}</p>
                      {memorial && (
                        <svg
                          width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="#5a7c5e" strokeWidth="1.5"
                          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                        >
                          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96c.34 4.39.74 6.66 1.07 8.33 1.32 6.61-2.34 11.61-8.46 11.61"/>
                          <path d="M2 21c0-3 1.85-5.36 5.08-6"/>
                        </svg>
                      )}
                    </div>
                    <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--color-ink-soft)' }}>
                      翻开一生
                      <span className="group-hover:translate-x-0.5 transition-transform" style={{ color: 'var(--color-forest)' }}>→</span>
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* 宠物筛选 Tab 条 */}
      {pets.length > 0 && !loading && (
        <div className="flex flex-wrap gap-2 mb-3 relative z-10">
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

      {/* 标签筛选条 */}
      {usedTags.length > 0 && !loading && (
        <div className="flex flex-wrap gap-1.5 mb-8 relative z-10">
          <button
            onClick={() => setFilterTag(null)}
            className="px-2.5 py-0.5 rounded-full text-xs transition"
            style={{
              background: filterTag === null ? 'var(--color-honey)' : 'rgba(255,255,255,0.4)',
              color: filterTag === null ? 'white' : 'var(--color-ink-soft)',
              border: '1px solid ' + (filterTag === null ? 'var(--color-honey)' : 'rgba(122,106,92,0.15)'),
            }}
          >全部标签</button>
          {usedTags.map((t) => {
            const preset = TAG_PRESETS.find((p) => p.value === t)
            return (
              <button
                key={t}
                onClick={() => setFilterTag(filterTag === t ? null : t)}
                className="px-2.5 py-0.5 rounded-full text-xs transition"
                style={{
                  background: filterTag === t ? 'var(--color-honey)' : 'rgba(255,255,255,0.4)',
                  color: filterTag === t ? 'white' : 'var(--color-ink-soft)',
                  border: '1px solid ' + (filterTag === t ? 'var(--color-honey)' : 'rgba(122,106,92,0.15)'),
                }}
              >
                {preset?.emoji ?? '🏷'} {t}
              </button>
            )
          })}
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
              <p className="text-sm line-clamp-3 mb-3" style={{ color: 'var(--color-ink-soft)' }}>
                {entry.content || '（空）'}
              </p>
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {entry.tags.slice(0, 4).map((t) => {
                    const preset = TAG_PRESETS.find((p) => p.value === t)
                    return (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(255,232,200,0.6)', color: 'var(--color-ink-soft)' }}>
                        {preset?.emoji ?? '🏷'} {t}
                      </span>
                    )
                  })}
                </div>
              )}
              {entry.pet_pov_text && (
                <div className="mb-3">
                  <PovBubble
                    entry={entry}
                    petName={entry.pet_name}
                    pet={pets.find((p) => p.id === entry.pet_id) ?? null}
                    variant="compact"
                  />
                </div>
              )}
              <div className="flex gap-3 text-sm">
                <Link to={`/editor/${entry.id}`} className="underline" style={{ color: 'var(--color-forest)' }}>编辑</Link>
                <button onClick={() => setSharingEntry(entry)} className="underline" style={{ color: 'var(--color-honey)' }}>分享</button>
                <button onClick={() => handleDelete(entry.id)} style={{ color: 'var(--color-rose)' }}>删除</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {sharingEntry && (
          <ShareCard
            entry={sharingEntry}
            petName={sharingEntry.pet_name}
            onClose={() => setSharingEntry(null)}
          />
        )}
      </AnimatePresence>
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
