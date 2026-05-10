import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, type Pet, type Entry, SPECIES_LABEL, SPECIES_EMOJI } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import PhotoBackground from '../components/PhotoBackground'
import InviteModal from '../components/InviteModal'

type Tab = 'journal' | 'album' | 'mood'

export default function PetDetailPage() {
  const { id } = useParams()
  const { session } = useAuth()
  const navigate = useNavigate()
  const [pet, setPet] = useState<Pet | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('journal')
  const [showInvite, setShowInvite] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('pets').select('*').eq('id', id).single(),
      supabase.from('entries').select('*').eq('pet_id', id).order('entry_date', { ascending: false }),
    ]).then(([petRes, entriesRes]) => {
      setPet(petRes.data as Pet)
      setEntries((entriesRes.data ?? []) as Entry[])
      setLoading(false)
    })
  }, [id])

  async function logout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) return <p className="text-center py-20">加载中...</p>
  if (!pet) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p>找不到这只毛孩子</p>
        <Link to="/pets" className="btn-primary mt-4 inline-flex">回到毛孩子列表</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen px-6 md:px-16 py-8 relative">
      <PhotoBackground photo="dashboard" intensity={0.55} />

      <header className="flex items-center justify-between mb-8 relative z-10">
        <Link to="/" className="flex items-center gap-2 text-2xl handwrite font-bold">
          🌿 宠物手帐
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link to="/dashboard" className="hover:opacity-70">手帐本</Link>
          <Link to="/pets" className="font-bold" style={{ color: 'var(--color-forest)' }}>毛孩子</Link>
          <span style={{ color: 'var(--color-ink-soft)' }}>{session?.user.email}</span>
          <button onClick={logout} className="underline">退出</button>
        </nav>
      </header>

      <div className="max-w-5xl mx-auto relative z-10">
        <Link to="/pets" className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>← 回到列表</Link>

        {/* 头部档案卡 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card-paper card-paper-tape !p-8 md:!p-10 mt-4 mb-6 flex items-center gap-6 flex-wrap"
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shrink-0"
            style={{ background: 'rgba(255, 232, 200, 0.7)', border: '2px solid rgba(255,255,255,0.6)' }}
          >
            {pet.avatar_url ? (
              <img src={pet.avatar_url} className="w-full h-full rounded-full object-cover" alt={pet.name} />
            ) : (
              <span>{SPECIES_EMOJI[pet.species]}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl mb-1">{pet.name}</h1>
            <p style={{ color: 'var(--color-ink-soft)' }}>
              {pet.breed ? <>{SPECIES_EMOJI[pet.species]} {pet.breed}</> : SPECIES_LABEL[pet.species]}
              {pet.birth_date && <span> · 生日 {pet.birth_date} · {ageString(pet.birth_date)}</span>}
            </p>
            {pet.note && <p className="mt-2 handwrite text-lg">"{pet.note}"</p>}
            <div className="flex gap-3 mt-3 text-sm flex-wrap">
              <span className="pill">📝 {entries.length} 篇手帐</span>
              <span className="pill">📸 {entries.filter((e) => e.photo_url).length} 张照片</span>
              <Link to={`/pets/${pet.id}/year`} className="pill" style={{ color: 'var(--color-forest)' }}>
                📅 年度回顾 →
              </Link>
              <button onClick={() => setShowInvite(true)} className="pill" style={{ color: 'var(--color-honey)' }}>
                👨‍👩‍👧 邀请家人
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <TabButton active={tab === 'journal'} onClick={() => setTab('journal')}>📝 手帐</TabButton>
          <TabButton active={tab === 'album'} onClick={() => setTab('album')}>📸 相册</TabButton>
          <TabButton active={tab === 'mood'} onClick={() => setTab('mood')}>📊 心情</TabButton>
          <Link to={`/editor/new?pet=${pet.id}`} className="ml-auto btn-primary !py-2 !px-4 text-sm">＋ 新一篇</Link>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {tab === 'journal' && (
            <motion.div key="j" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <JournalTab entries={entries} />
            </motion.div>
          )}
          {tab === 'album' && (
            <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AlbumTab entries={entries} />
            </motion.div>
          )}
          {tab === 'mood' && (
            <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MoodTab entries={entries} pet={pet} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showInvite && <InviteModal pet={pet} onClose={() => setShowInvite(false)} />}
      </AnimatePresence>
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full text-sm transition"
      style={{
        background: active ? 'var(--color-forest)' : 'rgba(255,255,255,0.4)',
        color: active ? 'white' : 'var(--color-ink-soft)',
        border: '1px solid ' + (active ? 'var(--color-forest)' : 'rgba(122,106,92,0.18)'),
        backdropFilter: 'blur(8px)',
      }}
    >
      {children}
    </button>
  )
}

// ========================================
// Tab 1: 手帐
// ========================================
function JournalTab({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) return <Empty msg="还没有手帐 · 写一篇吧" />
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {entries.map((e, i) => (
        <motion.div
          key={e.id}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="card-paper hover:-translate-y-1 transition-transform"
          style={{ transform: `rotate(${(i % 3 - 1) * 0.6}deg)` }}
        >
          {e.photo_url && <img src={e.photo_url} className="w-full h-40 object-cover rounded-lg mb-3" alt="" />}
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{e.mood ?? '🐾'}</span>
            <span className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>{e.entry_date}</span>
          </div>
          <h3 className="text-2xl mb-2 line-clamp-1">{e.title}</h3>
          <p className="text-sm line-clamp-3 mb-3" style={{ color: 'var(--color-ink-soft)' }}>{e.content || '（空）'}</p>
          <Link to={`/editor/${e.id}`} className="text-sm underline" style={{ color: 'var(--color-forest)' }}>编辑</Link>
        </motion.div>
      ))}
    </div>
  )
}

// ========================================
// Tab 2: 相册（Pinterest 瀑布流 + 月份分组）
// ========================================
function AlbumTab({ entries }: { entries: Entry[] }) {
  const photos = entries.filter((e) => e.photo_url)
  const [lightbox, setLightbox] = useState<Entry | null>(null)

  // 按月份分组
  const grouped = useMemo(() => {
    const map = new Map<string, Entry[]>()
    photos.forEach((e) => {
      const m = e.entry_date.slice(0, 7) // YYYY-MM
      if (!map.has(m)) map.set(m, [])
      map.get(m)!.push(e)
    })
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a))
  }, [photos])

  if (photos.length === 0) return <Empty msg="还没有照片 · 写手帐时上传一张" />

  return (
    <>
      <div className="mb-6 card-paper inline-block !py-3 !px-5">
        <p className="text-sm">📸 你给它拍了 <strong>{photos.length}</strong> 张照片</p>
      </div>

      {grouped.map(([month, list]) => (
        <div key={month} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xl handwrite">— {formatMonth(month)} —</h3>
            <span className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>{list.length} 张</span>
          </div>
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {list.map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="break-inside-avoid card-paper !p-2 cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => setLightbox(e)}
              >
                <img src={e.photo_url!} className="w-full rounded-md" alt={e.title} loading="lazy" />
                <div className="px-1 pt-2 pb-1 flex items-center justify-between">
                  <span>{e.mood ?? '🐾'}</span>
                  <span className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>{e.entry_date.slice(5)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
            style={{ background: 'rgba(45, 47, 38, 0.65)', backdropFilter: 'blur(8px)' }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className="card-paper max-w-3xl w-full !p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={lightbox.photo_url!} className="w-full max-h-[60vh] object-contain rounded-lg mb-4" alt="" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{lightbox.mood}</span>
                <span className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>{lightbox.entry_date}</span>
              </div>
              <h3 className="text-2xl mb-2">{lightbox.title}</h3>
              <p style={{ color: 'var(--color-ink-soft)' }}>{lightbox.content}</p>
              <div className="flex gap-3 mt-4">
                <Link to={`/editor/${lightbox.id}`} className="btn-ghost text-sm">编辑这一篇</Link>
                <button onClick={() => setLightbox(null)} className="btn-ghost text-sm">关闭</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ========================================
// Tab 3: 心情（折线 + heatmap + 洞察）
// ========================================

// 心情 → 数值（用于绘图）
const MOOD_VALUE: Record<string, { v: number; label: string; color: string }> = {
  '🥺': { v: 1, label: '难过', color: '#9CA3AF' },
  '🤔': { v: 2, label: '思考', color: '#A8C09A' },
  '😴': { v: 2, label: '困', color: '#A8B8C8' },
  '🐾': { v: 3, label: '日常', color: '#8AAB6E' },
  '😋': { v: 4, label: '美味', color: '#D9A55B' },
  '😺': { v: 4, label: '开心', color: '#E8C58E' },
  '🐶': { v: 4, label: '开心', color: '#E8C58E' },
  '🥰': { v: 5, label: '撒娇', color: '#D77B85' },
  '🎉': { v: 5, label: '庆祝', color: '#E8765E' },
  '💖': { v: 5, label: '甜蜜', color: '#D77B85' },
}

function MoodTab({ entries, pet }: { entries: Entry[]; pet: Pet }) {
  const [range, setRange] = useState<7 | 30 | 365>(30)

  const recent = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - range)
    return entries
      .filter((e) => new Date(e.entry_date) >= cutoff)
      .sort((a, b) => a.entry_date.localeCompare(b.entry_date))
  }, [entries, range])

  // 统计
  const moodCounts = useMemo(() => {
    const map = new Map<string, number>()
    entries.forEach((e) => {
      const m = e.mood ?? '🐾'
      map.set(m, (map.get(m) ?? 0) + 1)
    })
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [entries])

  if (entries.length === 0) return <Empty msg="多写几篇手帐就能看心情曲线啦" />

  const topMood = moodCounts[0]

  return (
    <div className="space-y-6">
      {/* 时间范围切换 */}
      <div className="flex gap-2">
        <RangeBtn active={range === 7} onClick={() => setRange(7)}>近 7 天</RangeBtn>
        <RangeBtn active={range === 30} onClick={() => setRange(30)}>近 30 天</RangeBtn>
        <RangeBtn active={range === 365} onClick={() => setRange(365)}>近 1 年</RangeBtn>
      </div>

      {/* 心情折线图 */}
      <div className="card-paper">
        <h3 className="text-xl mb-4">{pet.name} 的心情曲线</h3>
        <MoodChart entries={recent} />
      </div>

      {/* 心情分布 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-paper">
          <h3 className="text-xl mb-4">心情分布（全期）</h3>
          <div className="space-y-2">
            {moodCounts.slice(0, 6).map(([m, c]) => (
              <div key={m} className="flex items-center gap-3">
                <span className="text-2xl w-10">{m}</span>
                <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.4)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(c / entries.length) * 100}%`,
                      background: MOOD_VALUE[m]?.color ?? 'var(--color-forest)',
                    }}
                  />
                </div>
                <span className="text-sm w-8 text-right" style={{ color: 'var(--color-ink-soft)' }}>{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 自动洞察 */}
        <div className="card-paper">
          <h3 className="text-xl mb-4">🌟 小发现</h3>
          <div className="space-y-3 text-sm">
            {topMood && (
              <Insight icon="🎯">
                {pet.name} 最常出现的心情是 <strong>{topMood[0]}</strong>（{topMood[1]} 次）
              </Insight>
            )}
            {recent.length > 0 && (
              <Insight icon="📅">
                最近 {range} 天有 <strong>{recent.length}</strong> 篇手帐，
                平均 {(range / Math.max(recent.length, 1)).toFixed(1)} 天一篇
              </Insight>
            )}
            <Insight icon="✨">
              一共陪伴了 <strong>{entries.length}</strong> 个小日子
              {pet.birth_date && entries.length > 0 && <> · 比它长大了 {ageString(pet.birth_date)}</>}
            </Insight>
          </div>
        </div>
      </div>

      {/* Heatmap 月度日历 */}
      <div className="card-paper">
        <h3 className="text-xl mb-4">📅 30 天心情格</h3>
        <Heatmap entries={entries} days={30} />
      </div>
    </div>
  )
}

function RangeBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs transition"
      style={{
        background: active ? 'var(--color-forest)' : 'rgba(255,255,255,0.4)',
        color: active ? 'white' : 'var(--color-ink-soft)',
        border: '1px solid ' + (active ? 'var(--color-forest)' : 'rgba(122,106,92,0.18)'),
      }}
    >{children}</button>
  )
}

function Insight({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="text-xl shrink-0">{icon}</span>
      <p>{children}</p>
    </div>
  )
}

// 自定义 SVG 折线图
function MoodChart({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) return <p className="text-center py-8" style={{ color: 'var(--color-ink-soft)' }}>这段时间没有记录</p>

  const W = 720, H = 200, PAD_L = 30, PAD_R = 20, PAD_T = 30, PAD_B = 30
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B
  const n = entries.length
  const points = entries.map((e, i) => {
    const x = PAD_L + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW)
    const v = MOOD_VALUE[e.mood ?? '🐾']?.v ?? 3
    const y = PAD_T + innerH - ((v - 1) / 4) * innerH
    return { x, y, mood: e.mood ?? '🐾', date: e.entry_date, color: MOOD_VALUE[e.mood ?? '🐾']?.color ?? '#8AAB6E' }
  })
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[200px] min-w-[600px]">
        {/* 横线 */}
        {[1, 2, 3, 4, 5].map((v) => {
          const y = PAD_T + innerH - ((v - 1) / 4) * innerH
          return (
            <line key={v} x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="rgba(122,106,92,0.12)" strokeDasharray="2 4" />
          )
        })}
        {/* Y 轴标签（5 档） */}
        {[
          { v: 5, label: '🥰' },
          { v: 4, label: '😋' },
          { v: 3, label: '🐾' },
          { v: 2, label: '😴' },
          { v: 1, label: '🥺' },
        ].map((d) => (
          <text key={d.v} x={6} y={PAD_T + innerH - ((d.v - 1) / 4) * innerH + 5} fontSize="14">
            {d.label}
          </text>
        ))}
        {/* 折线 */}
        <path d={path} fill="none" stroke="rgba(79,121,66,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* 点 + emoji */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="10" fill={p.color} opacity="0.25" />
            <circle cx={p.x} cy={p.y} r="5" fill={p.color} />
            <title>{p.date} {p.mood}</title>
          </g>
        ))}
        {/* 第一个/最后一个日期 */}
        {entries[0] && (
          <text x={PAD_L} y={H - 8} fontSize="11" fill="rgba(122,106,92,0.7)">{entries[0].entry_date.slice(5)}</text>
        )}
        {entries[entries.length - 1] && entries.length > 1 && (
          <text x={W - PAD_R} y={H - 8} fontSize="11" fill="rgba(122,106,92,0.7)" textAnchor="end">
            {entries[entries.length - 1].entry_date.slice(5)}
          </text>
        )}
      </svg>
    </div>
  )
}

// Heatmap 月度日历
function Heatmap({ entries, days }: { entries: Entry[]; days: number }) {
  const dateMap = new Map<string, Entry>()
  entries.forEach((e) => dateMap.set(e.entry_date, e))

  // 生成日期数组（往前推 N 天）
  const cells: { date: string; entry?: Entry }[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    cells.push({ date: key, entry: dateMap.get(key) })
  }

  return (
    <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5" style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}>
      {cells.map(({ date, entry }) => (
        <div
          key={date}
          className="aspect-square rounded-md flex items-center justify-center text-base"
          style={{
            background: entry ? 'rgba(255,232,200,0.5)' : 'rgba(255,255,255,0.25)',
            border: '1px solid rgba(122,106,92,0.10)',
          }}
          title={`${date}${entry ? ` · ${entry.title}` : ''}`}
        >
          {entry ? (entry.mood ?? '🐾') : <span style={{ color: 'rgba(122,106,92,0.25)', fontSize: '8px' }}>·</span>}
        </div>
      ))}
    </div>
  )
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="card-paper text-center !py-16">
      <div className="text-5xl mb-3 opacity-50">🌿</div>
      <p style={{ color: 'var(--color-ink-soft)' }}>{msg}</p>
    </div>
  )
}

// ========================================
// 辅助函数
// ========================================
function ageString(birthDate: string): string {
  const birth = new Date(birthDate)
  const now = new Date()
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (months < 12) return `${months} 个月`
  return `${(months / 12).toFixed(1)} 岁`
}

function formatMonth(yyyymm: string): string {
  const [y, m] = yyyymm.split('-')
  return `${y} 年 ${parseInt(m, 10)} 月`
}
