import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { type Pet } from '../lib/supabase'
import SpeciesIcon from './SpeciesIcon'

interface Props {
  pet: Pet
  yearsSince: number
  onClose: () => void
}

// 周年纪念卡片 —— memorial 宠物离开周年当天，dashboard 顶部 banner-style 展示
export default function MemorialAnniversaryCard({ pet, yearsSince, onClose }: Props) {
  // mount 时把 localStorage 计数 +1（用 ref guard 防 React Strict Mode 双调）
  const incrementedRef = useRef(false)
  useEffect(() => {
    if (incrementedRef.current) return
    incrementedRef.current = true
    const today = new Date()
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const key = `mem-anniv-shown-${pet.id}-${todayKey}`
    const count = parseInt(localStorage.getItem(key) || '0', 10)
    localStorage.setItem(key, String(count + 1))
  }, [pet.id])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative rounded-2xl p-5 md:p-6 mb-6 z-10"
      style={{
        background: 'rgba(232, 236, 228, 0.72)',
        border: '1px solid rgba(90, 124, 94, 0.30)',
        backdropFilter: 'blur(10px)',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.4) inset, 0 4px 16px -6px rgba(80, 95, 75, 0.14)',
      }}
    >
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        aria-label="关闭"
        className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-sm transition hover:bg-white/50"
        style={{
          color: 'var(--color-ink-soft)',
          background: 'rgba(255,255,255,0.35)',
        }}
      >
        ✕
      </button>

      <div className="flex gap-4 items-start pr-6">
        {/* 头像（真实图 or SpeciesIcon） */}
        <div
          className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center overflow-hidden shrink-0"
          style={{
            background: 'rgba(255, 232, 200, 0.7)',
            border: '1.5px solid rgba(255,255,255,0.7)',
            color: 'var(--color-forest-deep)',
          }}
        >
          {pet.avatar_url ? (
            <img src={pet.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
          ) : (
            <SpeciesIcon species={pet.species} size={30} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* 三图标行 + 副标 */}
          <div
            className="flex items-center gap-1.5 mb-2"
            style={{ color: '#5a7c5e' }}
            aria-hidden
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96c.34 4.39.74 6.66 1.07 8.33 1.32 6.61-2.34 11.61-8.46 11.61"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6"/>
            </svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
              <line x1="16" y1="8" x2="2" y2="22"/>
              <line x1="17.5" y1="15" x2="9" y2="15"/>
            </svg>
            <span className="text-xs ml-1 tracking-wider" style={{ color: 'var(--color-honey)' }}>
              周年
            </span>
          </div>

          {/* 主标题 */}
          <p className="text-lg md:text-xl mb-1.5 leading-snug">
            今天是 <strong style={{ color: 'var(--color-forest-deep)' }}>{pet.name}</strong> 离开的第{' '}
            <strong style={{ color: 'var(--color-forest)' }}>{yearsSince}</strong> 周年
          </p>

          {/* memorial_note 引用（如果有） */}
          {pet.memorial_note && (
            <p
              className="handwrite text-base md:text-lg mb-2 leading-relaxed"
              style={{ color: 'var(--color-forest-deep)' }}
            >
              "{pet.memorial_note}"
            </p>
          )}

          {/* 日期 + 跳长卷 CTA */}
          <div className="flex items-center gap-4 flex-wrap mt-1.5">
            <span className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
              {pet.passed_away_at}
            </span>
            <Link
              to={`/pets/${pet.id}/lifelong`}
              className="text-sm underline"
              style={{ color: 'var(--color-forest)' }}
            >
              翻开 {pet.name} 的一生 →
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// 计算今天要显示哪些 memorial 周年卡片（pure，无 side effect）
// 触发条件：pet 有 passed_away_at + 今天月-日匹配 + 至少 1 周年 + localStorage 计数 < 2
export function getMemorialAnniversariesToShow(pets: Pet[]): { pet: Pet; yearsSince: number }[] {
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return pets
    .map((p) => {
      if (!p.passed_away_at) return null
      const passed = new Date(p.passed_away_at)
      if (
        passed.getMonth() !== today.getMonth() ||
        passed.getDate() !== today.getDate()
      ) return null
      const yearsSince = today.getFullYear() - passed.getFullYear()
      if (yearsSince < 1) return null
      const count = parseInt(localStorage.getItem(`mem-anniv-shown-${p.id}-${todayKey}`) || '0', 10)
      if (count >= 2) return null
      return { pet: p, yearsSince }
    })
    .filter((x): x is { pet: Pet; yearsSince: number } => x !== null)
}
