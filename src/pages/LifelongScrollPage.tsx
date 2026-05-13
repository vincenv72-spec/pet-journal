import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  supabase,
  type Pet,
  type Entry,
  SPECIES_EMOJI,
  SPECIES_LABEL,
  isMemorial,
  daysBetween,
} from '../lib/supabase'
import PhotoBackground from '../components/PhotoBackground'
import PovBubble from '../components/PovBubble'
import SpeciesIcon from '../components/SpeciesIcon'

type EntryGroup = { month: string; entries: Entry[] }

export default function LifelongScrollPage() {
  const { id } = useParams()
  const [pet, setPet] = useState<Pet | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<Entry | null>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('pets').select('*').eq('id', id).single(),
      // 升序：从最早到最近（一生长卷的语义就是按时间顺序流淌）
      supabase.from('entries').select('*').eq('pet_id', id).order('entry_date', { ascending: true }),
    ]).then(([petRes, entriesRes]) => {
      setPet(petRes.data as Pet)
      setEntries((entriesRes.data ?? []) as Entry[])
      setLoading(false)
    })
  }, [id])

  // 按月份分组
  const grouped = useMemo<EntryGroup[]>(() => {
    const map = new Map<string, Entry[]>()
    entries.forEach((e) => {
      const m = e.entry_date.slice(0, 7) // YYYY-MM
      if (!map.has(m)) map.set(m, [])
      map.get(m)!.push(e)
    })
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, list]) => ({ month, entries: list }))
  }, [entries])

  const stats = useMemo(() => {
    if (!pet) return null
    const memorial = isMemorial(pet)
    const total = entries.length
    const photos = entries.filter((e) => e.photo_url).length

    // 陪伴天数：优先 birth_date，回退到第一篇手帐日期
    const startDate = pet.birth_date || (entries[0]?.entry_date ?? null)
    const endDate = memorial
      ? pet.passed_away_at
      : new Date().toISOString().slice(0, 10)
    const companion = daysBetween(startDate, endDate)

    return { total, photos, memorial, companion, startDate }
  }, [pet, entries])

  if (loading) return <p className="text-center py-20">加载中...</p>
  if (!pet) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p>找不到这只毛孩子</p>
        <Link to="/pets" className="btn-primary mt-4 inline-flex">回到毛孩子列表</Link>
      </div>
    </div>
  )

  const memorial = isMemorial(pet)

  return (
    <div
      className="min-h-screen px-6 md:px-16 py-8 relative"
      data-memorial={memorial ? 'true' : undefined}
    >
      <PhotoBackground photo="dashboard" intensity={0.45} memorial={memorial} />

      <header className="flex items-center justify-between mb-8 relative z-10">
        <Link to="/" className="flex items-center gap-2 text-2xl handwrite font-bold">
          🌿 宠物手帐
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link to="/dashboard" className="hidden md:inline hover:opacity-70">手帐本</Link>
          <Link to="/pets" className="hidden md:inline hover:opacity-70">毛孩子</Link>
          <Link to={`/pets/${pet.id}`} className="underline">← 回到 {pet.name} 的档案</Link>
        </nav>
      </header>

      <div className="max-w-3xl mx-auto relative z-10 pb-16">
        {/* 开场封面 */}
        <OpeningCard pet={pet} memorial={memorial} stats={stats} />

        {/* 时间线主体（按月份分组，杂志连续滚动） */}
        {grouped.length === 0 ? (
          <EmptyLifelong pet={pet} />
        ) : (
          <div className="space-y-14 mt-16">
            {grouped.map((g) => (
              <MonthGroup
                key={g.month}
                group={g}
                onPick={setLightbox}
                memorial={memorial}
                pet={pet}
              />
            ))}
          </div>
        )}

        {/* 结尾卡片 */}
        {entries.length > 0 && (
          <ClosingCard pet={pet} memorial={memorial} stats={stats} />
        )}
      </div>

      <AnimatePresence>
        {lightbox && (
          <EntryLightbox
            entry={lightbox}
            pet={pet}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ========================================
// 开场封面
// ========================================
function OpeningCard({
  pet,
  memorial,
  stats,
}: {
  pet: Pet
  memorial: boolean
  stats: { total: number; photos: number; companion: number | null } | null
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      className="card-paper card-paper-tape !p-10 md:!p-14 text-center"
      style={
        memorial
          ? {
              background: 'rgba(247, 244, 232, 0.42)',
              transition: 'background 800ms ease-out',
            }
          : { transition: 'background 800ms ease-out' }
      }
    >
      <p className="text-sm mb-3 tracking-[0.3em]" style={{ color: 'var(--color-honey)' }}>
        — A LIFE IN JOURNAL —
      </p>
      <h1
        className="text-5xl md:text-6xl mb-6 leading-tight"
        style={{
          letterSpacing: memorial ? '1px' : '0',
          transition: 'letter-spacing 800ms ease-out',
        }}
      >
        {pet.name} 的<br />一生
      </h1>

      <div className="flex items-center justify-center gap-5 mb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: 'rgba(255, 232, 200, 0.7)',
            border: '2px solid rgba(255,255,255,0.6)',
            color: 'var(--color-forest-deep)',
          }}
        >
          {pet.avatar_url ? (
            <img src={pet.avatar_url} className="w-full h-full rounded-full object-cover" alt={pet.name} />
          ) : (
            <SpeciesIcon species={pet.species} size={44} />
          )}
        </div>
        <div className="text-left">
          <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
            {pet.breed ? `${SPECIES_EMOJI[pet.species]} ${pet.breed}` : SPECIES_LABEL[pet.species]}
          </p>
          {pet.birth_date && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-soft)' }}>
              {pet.birth_date} 来到这世界
            </p>
          )}
          {memorial && pet.passed_away_at && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-forest-deep)' }}>
              {pet.passed_away_at} 离开
            </p>
          )}
        </div>
      </div>

      <p
        className="handwrite text-xl md:text-2xl leading-relaxed"
        style={{ color: 'var(--color-ink-soft)' }}
      >
        {memorial ? (
          <>这里记着你们一起<br />度过的所有小日子</>
        ) : (
          <>慢慢翻吧 ——<br />这里记着你们的每一天</>
        )}
      </p>

      {stats && stats.total > 0 && (
        <div className="flex items-center justify-center gap-6 mt-8 text-sm flex-wrap" style={{ color: 'var(--color-ink-soft)' }}>
          <span>📝 {stats.total} 篇</span>
          {stats.photos > 0 && <span>📸 {stats.photos} 张照片</span>}
          {stats.companion != null && (
            <span>
              {memorial ? '陪伴了' : '至今'} <strong style={{ color: 'var(--color-forest)' }}>{stats.companion.toLocaleString()}</strong> 天
            </span>
          )}
        </div>
      )}
    </motion.div>
  )
}

// ========================================
// 月份分组（手写大字标题 + 该月 entries 全展）
// ========================================
function MonthGroup({
  group,
  onPick,
  memorial,
  pet,
}: {
  group: EntryGroup
  onPick: (e: Entry) => void
  memorial: boolean
  pet: Pet
}) {
  const [y, m] = group.month.split('-')
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      className="space-y-5"
    >
      {/* 月份标题（手写大字，居中，分割年月） */}
      <div className="flex items-center gap-4 my-8 select-none">
        <span
          className="flex-1 h-px"
          style={{ background: 'rgba(122, 106, 92, 0.18)' }}
          aria-hidden
        />
        <h2 className="handwrite text-3xl md:text-4xl text-center" style={{ color: 'var(--color-forest)' }}>
          {y} 年 {parseInt(m, 10)} 月
        </h2>
        <span
          className="flex-1 h-px"
          style={{ background: 'rgba(122, 106, 92, 0.18)' }}
          aria-hidden
        />
      </div>
      <p className="text-center text-xs -mt-3 mb-2" style={{ color: 'var(--color-ink-soft)' }}>
        这个月 {group.entries.length} 篇小日子
      </p>

      {/* 该月所有 entries（单列流） */}
      <div className="space-y-4">
        {group.entries.map((e) => (
          <EntryRow key={e.id} entry={e} onPick={onPick} memorial={memorial} pet={pet} />
        ))}
      </div>
    </motion.section>
  )
}

// ========================================
// 单条 entry 卡片
// ========================================
function EntryRow({
  entry,
  onPick,
  memorial,
  pet,
}: {
  entry: Entry
  onPick: (e: Entry) => void
  memorial: boolean
  pet: Pet
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(entry)}
      className="card-paper hover:-translate-y-1 transition-transform w-full text-left block"
      style={{
        transition: 'box-shadow 800ms ease-out, border-top-color 800ms ease-out, transform 0.25s ease',
        ...(memorial
          ? {
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.4) inset, 0 4px 12px -6px rgba(80, 95, 75, 0.08)',
              borderTop: '1px solid rgba(140, 130, 115, 0.25)',
            }
          : {}),
      }}
    >
      <div className="flex gap-4 items-start">
        {entry.photo_url && (
          <img
            src={entry.photo_url}
            alt=""
            className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-lg shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <span className="text-2xl">{entry.mood ?? '🐾'}</span>
            <span
              className="text-xs"
              style={{
                color: memorial ? 'rgba(80, 70, 60, 0.85)' : 'var(--color-ink-soft)',
                transition: 'color 800ms ease-out',
              }}
            >
              {entry.entry_date}
            </span>
          </div>
          <h3 className="text-xl md:text-2xl mb-1 line-clamp-1">{entry.title}</h3>
          <p
            className="text-sm leading-relaxed line-clamp-2"
            style={{ color: 'var(--color-ink-soft)' }}
          >
            {entry.content || '（空）'}
          </p>
          {entry.pet_pov_text && (
            <div className="mt-2.5">
              <PovBubble entry={entry} petName={pet.name} pet={pet} variant="compact" />
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

// ========================================
// 结尾卡片（在世 / memorial 双形态）
// ========================================
function ClosingCard({
  pet,
  memorial,
  stats,
}: {
  pet: Pet
  memorial: boolean
  stats: { total: number; photos: number; companion: number | null } | null
}) {
  if (!stats) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      className="card-paper card-paper-tape !p-10 md:!p-14 text-center mt-16"
      style={
        memorial
          ? {
              background: 'rgba(247, 244, 232, 0.42)',
              transition: 'background 800ms ease-out',
            }
          : { transition: 'background 800ms ease-out' }
      }
    >
      {memorial ? (
        <>
          {/* 三图标——落叶 / 月亮 / 羽毛 */}
          <div
            className="flex items-center justify-center gap-3 mb-6"
            style={{ color: '#5a7c5e' }}
            aria-hidden
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96c.34 4.39.74 6.66 1.07 8.33 1.32 6.61-2.34 11.61-8.46 11.61"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6"/>
            </svg>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
              <line x1="16" y1="8" x2="2" y2="22"/>
              <line x1="17.5" y1="15" x2="9" y2="15"/>
            </svg>
          </div>

          <p className="text-sm mb-2" style={{ color: 'var(--color-honey)' }}>这一生</p>
          {stats.companion != null && (
            <p className="text-7xl md:text-8xl mb-3" style={{ fontFamily: 'Caveat, cursive' }}>
              <span style={{ color: 'var(--color-forest-deep)' }}>{stats.companion.toLocaleString()}</span>
              <span className="text-3xl md:text-4xl ml-2" style={{ color: 'var(--color-ink)' }}>天</span>
            </p>
          )}
          <p className="text-lg mb-6" style={{ color: 'var(--color-ink-soft)' }}>
            和你一起的所有小日子
          </p>

          {pet.memorial_note && (
            <p
              className="handwrite text-xl md:text-2xl leading-relaxed mt-6 mb-2"
              style={{ color: 'var(--color-forest-deep)' }}
            >
              "{pet.memorial_note}"
            </p>
          )}
          {pet.passed_away_at && (
            <p className="text-xs mt-4" style={{ color: 'var(--color-ink-soft)' }}>
              {pet.passed_away_at}
            </p>
          )}
        </>
      ) : (
        <>
          <p className="text-sm mb-2 tracking-[0.3em]" style={{ color: 'var(--color-honey)' }}>
            — TO BE CONTINUED —
          </p>
          <h2 className="text-3xl md:text-4xl mb-4 leading-tight">
            至今陪了 {stats.companion != null ? <strong style={{ color: 'var(--color-forest)' }}>{stats.companion.toLocaleString()}</strong> : '了你'} 天<br />
            还有很多日子要写
          </h2>
          <p className="handwrite text-xl mb-6" style={{ color: 'var(--color-ink-soft)' }}>
            慢慢来 · 一篇也好，一张照片也好
          </p>
          <Link to={`/editor/new?pet=${pet.id}`} className="btn-primary inline-flex">
            ＋ 写新一篇
          </Link>
        </>
      )}
    </motion.div>
  )
}

// ========================================
// 空态
// ========================================
function EmptyLifelong({ pet }: { pet: Pet }) {
  return (
    <div className="card-paper text-center !py-16 mt-12">
      <div className="text-6xl mb-4 opacity-60">📔</div>
      <h2 className="text-2xl mb-2">{pet.name} 的卷轴还是空白的</h2>
      <p className="mb-6" style={{ color: 'var(--color-ink-soft)' }}>
        写下第一篇手帐，这条长卷就开始了
      </p>
      <Link to={`/editor/new?pet=${pet.id}`} className="btn-primary inline-flex">
        写第一篇 →
      </Link>
    </div>
  )
}

// ========================================
// Entry Lightbox（只读放大查看）
// 入场顺序设计：照片/心情 即时 → POV 0.3s（宠物先开口的仪式感）→ 标题 0.8s → 正文 1.0s → 操作 1.2s
// ========================================
function EntryLightbox({
  entry,
  pet,
  onClose,
}: {
  entry: Entry
  pet: Pet
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto"
      style={{ background: 'rgba(45, 47, 38, 0.65)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }} animate={{ scale: 1 }}
        className="card-paper max-w-2xl w-full !p-6 md:!p-8 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {entry.photo_url && (
          <img
            src={entry.photo_url}
            className="w-full max-h-[50vh] object-contain rounded-lg mb-4"
            alt=""
          />
        )}
        <div className="flex items-center justify-between mb-2">
          <span className="text-3xl">{entry.mood ?? '🐾'}</span>
          <span className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>{entry.entry_date}</span>
        </div>

        {/* POV 优先 fade-in —— 宠物先开口（核心仪式感） */}
        {entry.pet_pov_text && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
            className="mb-5"
          >
            <PovBubble entry={entry} petName={pet.name} pet={pet} variant="full" />
          </motion.div>
        )}

        {/* 标题 —— 等 POV 上完台再上 */}
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: entry.pet_pov_text ? 0.8 : 0.1, duration: 0.5 }}
          className="text-3xl mb-3"
        >
          {entry.title}
        </motion.h3>

        {/* 正文 —— 在 POV 和标题之后慢慢显现 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: entry.pet_pov_text ? 1.0 : 0.3, duration: 0.5 }}
          className="whitespace-pre-wrap leading-relaxed"
          style={{ color: 'var(--color-ink)' }}
        >
          {entry.content || '（空）'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: entry.pet_pov_text ? 1.2 : 0.5, duration: 0.4 }}
          className="flex gap-3 mt-6 flex-wrap"
        >
          <Link to={`/editor/${entry.id}`} className="btn-ghost text-sm">编辑这一篇</Link>
          <button onClick={onClose} className="btn-ghost text-sm">关闭</button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
