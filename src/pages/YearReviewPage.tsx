import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase, type Pet, type Entry } from '../lib/supabase'
import PhotoBackground from '../components/PhotoBackground'
import SpeciesIcon from '../components/SpeciesIcon'

export default function YearReviewPage() {
  const { id } = useParams()
  const year = new Date().getFullYear()
  const [pet, setPet] = useState<Pet | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('pets').select('*').eq('id', id).single(),
      supabase.from('entries').select('*').eq('pet_id', id)
        .gte('entry_date', `${year}-01-01`)
        .lte('entry_date', `${year}-12-31`)
        .order('entry_date'),
    ]).then(([petRes, entriesRes]) => {
      setPet(petRes.data as Pet)
      setEntries((entriesRes.data ?? []) as Entry[])
      setLoading(false)
    })
  }, [id, year])

  const stats = useMemo(() => {
    if (entries.length === 0) return null
    // Count moods
    const moodMap = new Map<string, number>()
    entries.forEach((e) => {
      const m = e.mood ?? '🐾'
      moodMap.set(m, (moodMap.get(m) ?? 0) + 1)
    })
    const sortedMoods = Array.from(moodMap.entries()).sort((a, b) => b[1] - a[1])

    // Photos
    const photos = entries.filter((e) => e.photo_url)

    // Days recorded
    const days = new Set(entries.map((e) => e.entry_date)).size

    // Most active month
    const monthMap = new Map<number, number>()
    entries.forEach((e) => {
      const m = parseInt(e.entry_date.slice(5, 7), 10)
      monthMap.set(m, (monthMap.get(m) ?? 0) + 1)
    })
    const topMonth = Array.from(monthMap.entries()).sort((a, b) => b[1] - a[1])[0]

    return {
      total: entries.length,
      days,
      topMood: sortedMoods[0],
      sortedMoods,
      photos,
      topMonth,
      monthMap,
    }
  }, [entries])

  async function saveAsImage() {
    if (!cardsRef.current) return
    setSaving(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardsRef.current, {
        backgroundColor: '#F4EBD6',
        scale: 2,
      })
      const link = document.createElement('a')
      link.download = `${pet?.name ?? 'pet'}-${year}-yearly.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error(err)
      alert('保存失败，请尝试浏览器右键保存')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-center py-20">加载中...</p>
  if (!pet) return <p className="text-center py-20">找不到这只毛孩子</p>

  return (
    <div className="min-h-screen px-6 md:px-16 py-8 relative">
      <PhotoBackground photo="dashboard" intensity={0.5} />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <Link to={`/pets/${pet.id}`} className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
          ← 回到 {pet.name} 的档案
        </Link>
        <button
          onClick={saveAsImage}
          disabled={saving || !stats}
          className="btn-primary !py-2 !px-4 text-sm"
        >
          {saving ? '生成中...' : '📥 保存为图片'}
        </button>
      </div>

      <div ref={cardsRef} className="max-w-2xl mx-auto space-y-5 relative z-10 pb-12">
        {!stats ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📔</div>
              <h2 className="text-3xl mb-2">{year} 年还没开始记录</h2>
              <p style={{ color: 'var(--color-ink-soft)' }}>等到积累几篇手帐，再回来看 {pet.name} 的年度回顾 🌿</p>
              <Link to={`/editor/new?pet=${pet.id}`} className="btn-primary mt-6 inline-flex">写第一篇 →</Link>
            </div>
          </Card>
        ) : (
          <>
            {/* Card 1: 封面 */}
            <Card>
              <p className="text-sm mb-2" style={{ color: 'var(--color-honey)' }}>— Year in Review —</p>
              <h1 className="text-5xl md:text-6xl mb-3 leading-tight">
                {pet.name} 的<br />{year}
              </h1>
              <div className="flex items-center gap-4 mt-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255, 232, 200, 0.7)', color: 'var(--color-forest-deep)' }}
                >
                  {pet.avatar_url
                    ? <img src={pet.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                    : <SpeciesIcon species={pet.species} size={36} />
                  }
                </div>
                <p className="handwrite text-xl" style={{ color: 'var(--color-ink-soft)' }}>
                  和你一起的小日子
                </p>
              </div>
            </Card>

            {/* Card 2: 总篇数 */}
            <Card>
              <p className="text-sm" style={{ color: 'var(--color-honey)' }}>这一年</p>
              <p className="text-2xl mb-2">你陪它度过了</p>
              <p className="text-7xl md:text-8xl mb-2" style={{ fontFamily: 'Caveat, cursive' }}>
                <span style={{ color: 'var(--color-forest)' }}>{stats.days}</span> 天
              </p>
              <p className="text-2xl mb-1">写了 <span style={{ color: 'var(--color-forest)', fontWeight: 600 }}>{stats.total}</span> 篇手帐</p>
              <p className="text-2xl">拍了 <span style={{ color: 'var(--color-forest)', fontWeight: 600 }}>{stats.photos.length}</span> 张照片 📸</p>
            </Card>

            {/* Card 3: 最常见心情 */}
            <Card>
              <p className="text-sm mb-2" style={{ color: 'var(--color-honey)' }}>最常出现的心情</p>
              <div className="text-center py-4">
                <motion.div
                  animate={{ rotate: [0, -5, 5, -5, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  className="text-9xl mb-3"
                >
                  {stats.topMood[0]}
                </motion.div>
                <p className="text-2xl">{stats.topMood[1]} 次出现</p>
                <p className="text-sm mt-2" style={{ color: 'var(--color-ink-soft)' }}>
                  占全部心情的 {Math.round((stats.topMood[1] / stats.total) * 100)}%
                </p>
              </div>
            </Card>

            {/* Card 4: 月度活跃 */}
            <Card>
              <p className="text-sm mb-3" style={{ color: 'var(--color-honey)' }}>每月留下的小日子</p>
              <h2 className="text-2xl mb-4">月度回顾</h2>
              <div className="grid grid-cols-12 gap-1.5 items-end h-32">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                  const c = stats.monthMap.get(m) ?? 0
                  const max = Math.max(...Array.from(stats.monthMap.values()), 1)
                  const isTop = stats.topMonth?.[0] === m && c > 0
                  return (
                    <div key={m} className="flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t transition-all"
                        style={{
                          height: `${Math.max((c / max) * 100, c > 0 ? 8 : 2)}%`,
                          background: isTop
                            ? 'linear-gradient(180deg, #D9A55B, #4F7942)'
                            : c > 0
                              ? 'rgba(138, 171, 110, 0.7)'
                              : 'rgba(122, 106, 92, 0.15)',
                        }}
                        title={`${m} 月：${c} 篇`}
                      />
                      <span className="text-[10px]" style={{ color: 'var(--color-ink-soft)' }}>{m}</span>
                    </div>
                  )
                })}
              </div>
              {stats.topMonth && stats.topMonth[1] > 0 && (
                <p className="text-sm mt-3 text-center handwrite text-base">
                  ✨ 最活跃的月份是 <strong>{stats.topMonth[0]} 月</strong>（{stats.topMonth[1]} 篇）
                </p>
              )}
            </Card>

            {/* Card 5: 心情盘 */}
            <Card>
              <p className="text-sm mb-3" style={{ color: 'var(--color-honey)' }}>这一年的情绪光谱</p>
              <div className="flex flex-wrap gap-3 justify-center py-4">
                {stats.sortedMoods.slice(0, 8).map(([m, c], i) => {
                  const size = 40 + (c / stats.total) * 80
                  return (
                    <motion.div
                      key={m}
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1, type: 'spring' }}
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{
                        width: size, height: size,
                        background: `radial-gradient(circle, rgba(255, 232, 200, 0.8), rgba(232, 197, 142, 0.4))`,
                        fontSize: size * 0.5,
                      }}
                      title={`${m} × ${c}`}
                    >
                      {m}
                    </motion.div>
                  )
                })}
              </div>
            </Card>

            {/* Card 6: 高光时刻 */}
            {stats.photos.length > 0 && (
              <Card>
                <p className="text-sm mb-3" style={{ color: 'var(--color-honey)' }}>高光时刻</p>
                <h2 className="text-2xl mb-4">3 张精选</h2>
                <div className="grid grid-cols-3 gap-3">
                  {stats.photos.slice(0, 3).map((e, i) => (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, rotate: 0, y: 20 }}
                      animate={{ opacity: 1, rotate: (i - 1) * 3, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="card-paper !p-2"
                    >
                      <img src={e.photo_url!} className="w-full aspect-square object-cover rounded-md" alt="" />
                      <p className="text-xs mt-2 text-center" style={{ color: 'var(--color-ink-soft)' }}>
                        {e.entry_date.slice(5)} {e.mood}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}

            {/* Card 7: 收尾 */}
            <Card>
              <div className="text-center py-4">
                <p className="text-sm mb-3" style={{ color: 'var(--color-honey)' }}>明年继续</p>
                <h2 className="text-3xl md:text-4xl mb-3 leading-tight">
                  谢谢你<br />做毛孩子的<br />小日子守护者
                </h2>
                <p className="tracking-[0.4em] opacity-50 text-lg mt-6">🐾 🌿 ✿ 🍃 🐾</p>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      className="card-paper card-paper-tape !p-8 md:!p-10"
    >
      {children}
    </motion.div>
  )
}
