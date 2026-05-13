import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Entry } from '../lib/supabase'
import { TAG_PRESETS } from '../lib/supabase'

// 5 套分享卡视觉主题，每次打开 ShareCard 随机抽一套（策略 B），让分享出的图更有惊喜感
type DecorationItem = {
  emoji: string
  x: string  // CSS left, percentage or px
  y: string  // CSS top
  size: number
  rotate: number
  opacity: number
}

type ShareCardTheme = {
  id: string
  background: string
  tapeBg: string
  topDecorations: DecorationItem[]  // 无照片时显示在卡片顶部区域
  cornerTopRight: string
  cornerBottomLeft: string
  accentColor: string  // 给装饰底色 / 投影使用
}

const SHARE_CARD_THEMES: ShareCardTheme[] = [
  {
    id: 'spring',
    background: `
      radial-gradient(circle at 20% 15%, rgba(255, 220, 175, 0.55), transparent 55%),
      radial-gradient(circle at 80% 85%, rgba(255, 200, 200, 0.40), transparent 55%),
      linear-gradient(180deg, #FCF6E6 0%, #FFE8E8 100%)
    `,
    tapeBg: 'linear-gradient(180deg, rgba(245, 181, 181, 0.85), rgba(217, 121, 121, 0.75))',
    topDecorations: [
      { emoji: '🌸', x: '14%', y: '20px', size: 40, rotate: -15, opacity: 0.9 },
      { emoji: '🌷', x: '68%', y: '40px', size: 30, rotate: 12, opacity: 0.8 },
      { emoji: '🌼', x: '40%', y: '70px', size: 34, rotate: -8, opacity: 0.75 },
      { emoji: '🦋', x: '82%', y: '110px', size: 26, rotate: 20, opacity: 0.7 },
      { emoji: '🌿', x: '8%', y: '120px', size: 24, rotate: -30, opacity: 0.6 },
    ],
    cornerTopRight: '🌸',
    cornerBottomLeft: '🌷',
    accentColor: '#E89B9B',
  },
  {
    id: 'moonlit',
    background: `
      radial-gradient(circle at 75% 25%, rgba(255, 240, 200, 0.50), transparent 55%),
      radial-gradient(circle at 25% 80%, rgba(180, 195, 220, 0.40), transparent 55%),
      linear-gradient(180deg, #F4F4EC 0%, #D8DDE6 100%)
    `,
    tapeBg: 'linear-gradient(180deg, rgba(160, 175, 195, 0.85), rgba(115, 130, 150, 0.75))',
    topDecorations: [
      { emoji: '🌙', x: '70%', y: '30px', size: 48, rotate: -10, opacity: 0.85 },
      { emoji: '⭐', x: '20%', y: '40px', size: 22, rotate: 0, opacity: 0.8 },
      { emoji: '✨', x: '50%', y: '15px', size: 26, rotate: 15, opacity: 0.7 },
      { emoji: '⭐', x: '88%', y: '90px', size: 16, rotate: 0, opacity: 0.7 },
      { emoji: '✨', x: '10%', y: '105px', size: 20, rotate: -20, opacity: 0.65 },
    ],
    cornerTopRight: '🌙',
    cornerBottomLeft: '⭐',
    accentColor: '#8A99AA',
  },
  {
    id: 'forest',
    background: `
      radial-gradient(circle at 20% 15%, rgba(255, 232, 190, 0.55), transparent 55%),
      radial-gradient(circle at 80% 85%, rgba(180, 210, 165, 0.45), transparent 55%),
      linear-gradient(180deg, #FCF6E6 0%, #DDE8D2 100%)
    `,
    tapeBg: 'linear-gradient(180deg, rgba(120, 150, 100, 0.85), rgba(90, 124, 90, 0.75))',
    topDecorations: [
      { emoji: '🍃', x: '15%', y: '25px', size: 36, rotate: -20, opacity: 0.85 },
      { emoji: '🌿', x: '75%', y: '35px', size: 32, rotate: 15, opacity: 0.85 },
      { emoji: '🌳', x: '45%', y: '70px', size: 38, rotate: -5, opacity: 0.7 },
      { emoji: '🦋', x: '85%', y: '110px', size: 24, rotate: 25, opacity: 0.7 },
      { emoji: '🍂', x: '8%', y: '115px', size: 22, rotate: -30, opacity: 0.65 },
    ],
    cornerTopRight: '🍃',
    cornerBottomLeft: '🌿',
    accentColor: '#5A7C5A',
  },
  {
    id: 'honey',
    background: `
      radial-gradient(circle at 25% 20%, rgba(255, 220, 160, 0.60), transparent 55%),
      radial-gradient(circle at 80% 80%, rgba(255, 210, 140, 0.45), transparent 55%),
      linear-gradient(180deg, #FCF6E6 0%, #FFE5B4 100%)
    `,
    tapeBg: 'linear-gradient(180deg, rgba(232, 197, 142, 0.85), rgba(217, 165, 91, 0.75))',
    topDecorations: [
      { emoji: '🍯', x: '40%', y: '30px', size: 44, rotate: -8, opacity: 0.9 },
      { emoji: '🌻', x: '15%', y: '50px', size: 32, rotate: 12, opacity: 0.85 },
      { emoji: '🐝', x: '75%', y: '35px', size: 28, rotate: -15, opacity: 0.8 },
      { emoji: '✨', x: '60%', y: '105px', size: 20, rotate: 0, opacity: 0.65 },
      { emoji: '🌼', x: '85%', y: '100px', size: 24, rotate: 20, opacity: 0.7 },
    ],
    cornerTopRight: '🍯',
    cornerBottomLeft: '🌻',
    accentColor: '#D9A55B',
  },
  {
    id: 'feather',
    background: `
      radial-gradient(circle at 20% 15%, rgba(255, 220, 200, 0.55), transparent 55%),
      radial-gradient(circle at 80% 85%, rgba(225, 195, 195, 0.40), transparent 55%),
      linear-gradient(180deg, #FCF6E6 0%, #E8DDDD 100%)
    `,
    tapeBg: 'linear-gradient(180deg, rgba(201, 123, 123, 0.85), rgba(170, 100, 100, 0.75))',
    topDecorations: [
      { emoji: '🪶', x: '20%', y: '20px', size: 42, rotate: -25, opacity: 0.85 },
      { emoji: '🪶', x: '70%', y: '50px', size: 36, rotate: 20, opacity: 0.75 },
      { emoji: '🦋', x: '45%', y: '90px', size: 28, rotate: -10, opacity: 0.7 },
      { emoji: '🌸', x: '85%', y: '100px', size: 22, rotate: 15, opacity: 0.65 },
      { emoji: '✨', x: '10%', y: '110px', size: 18, rotate: 0, opacity: 0.6 },
    ],
    cornerTopRight: '🪶',
    cornerBottomLeft: '🦋',
    accentColor: '#C97B7B',
  },
]

/** 单篇手帐的可分享卡片（生成 1080x1440 PNG） */
export default function ShareCard({ entry, petName, onClose }: { entry: Entry; petName: string | null; onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  // 每次打开 ShareCard 抽一套随机主题（策略 B —— 每次惊喜）
  const [theme] = useState<ShareCardTheme>(() => SHARE_CARD_THEMES[Math.floor(Math.random() * SHARE_CARD_THEMES.length)])

  async function saveImage() {
    if (!cardRef.current) return
    setSaving(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3, // 1080x1440 输出
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `${entry.title}-${entry.entry_date}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error(err)
      alert('保存失败，可尝试浏览器右键保存')
    } finally {
      setSaving(false)
    }
  }

  async function copyToClipboard() {
    if (!cardRef.current) return
    setSaving(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        logging: false,
      })
      canvas.toBlob(async (blob) => {
        if (!blob) return
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ])
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          alert('该浏览器不支持复制图片，请用「保存图片」')
        } finally {
          setSaving(false)
        }
      })
    } catch (err) {
      console.error(err)
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto"
      style={{ background: 'rgba(45, 47, 38, 0.65)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <p className="text-white text-sm mb-3 opacity-80">长按 / 右键保存图片，或用下面按钮</p>

      {/* 实际渲染的卡片（按 9:12 比例 360x480 在屏上，保存时 scale 3 → 1080x1440）*/}
      <motion.div
        initial={{ scale: 0.9 }} animate={{ scale: 1 }}
        ref={cardRef}
        className="relative shadow-2xl"
        style={{
          width: 360, height: 480,
          background: theme.background,
          borderRadius: 16,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部胶带（主题色） */}
        <div
          style={{
            position: 'absolute', top: -4, left: 30, width: 70, height: 18,
            background: theme.tapeBg,
            transform: 'rotate(-3deg)',
            borderRadius: 2,
          }}
        />

        {/* 照片（如果有）*/}
        {entry.photo_url ? (
          <div style={{ padding: '40px 24px 0' }}>
            <img
              src={entry.photo_url}
              crossOrigin="anonymous"
              style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8 }}
              alt=""
            />
          </div>
        ) : (
          // 无照片：用主题装饰 emoji 散布替代之前的"大脚印"占位
          <div style={{ position: 'relative', height: 200, padding: '20px 24px 0' }}>
            {/* 散布的装饰 emoji（主题决定） */}
            {theme.topDecorations.map((d, i) => (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  left: d.x,
                  top: d.y,
                  fontSize: d.size,
                  transform: `rotate(${d.rotate}deg)`,
                  opacity: d.opacity,
                  filter: 'drop-shadow(0 2px 3px rgba(120, 90, 60, 0.10))',
                  pointerEvents: 'none',
                }}
              >
                {d.emoji}
              </span>
            ))}
            {/* 中心 mood emoji 较小，保持次重点 */}
            <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center' }}>
              <span style={{ fontSize: 42, opacity: 0.95 }}>{entry.mood ?? '🐾'}</span>
            </div>
          </div>
        )}

        {/* 内容 */}
        <div style={{ padding: '20px 24px' }}>
          {/* 心情 + 日期 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>{entry.mood ?? '🐾'}</span>
            <span style={{ fontSize: 12, color: '#7A6A5C' }}>{entry.entry_date}</span>
          </div>

          {/* 标题 */}
          <h3
            style={{
              fontSize: 22, lineHeight: 1.25, marginBottom: 6,
              fontFamily: '"Ma Shan Zheng", "Caveat", cursive',
              color: '#3A2F26',
              fontWeight: 'normal',
            }}
          >
            {entry.title}
          </h3>

          {/* 宠物名 */}
          {petName && (
            <p style={{ fontSize: 12, color: '#4F7942', marginBottom: 8 }}>· {petName} ·</p>
          )}

          {/* 正文 */}
          <p
            style={{
              fontSize: 13, lineHeight: 1.6, color: '#5A6B58',
              fontFamily: '"Patrick Hand", "Ma Shan Zheng", sans-serif',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {entry.content}
          </p>

          {/* 标签 */}
          {entry.tags && entry.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
              {entry.tags.slice(0, 3).map((t) => {
                const preset = TAG_PRESETS.find((p) => p.value === t)
                return (
                  <span
                    key={t}
                    style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 999,
                      background: 'rgba(255,232,200,0.7)',
                      color: '#5A6B58',
                    }}
                  >
                    {preset?.emoji ?? '🏷'} {t}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* 水印 */}
        <div
          style={{
            position: 'absolute', bottom: 12, left: 0, right: 0,
            textAlign: 'center', fontSize: 10, color: '#7A6A5C', opacity: 0.7,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <svg viewBox="0 0 32 32" width="14" height="14">
            <circle cx="10" cy="10" r="3" fill="#4F7942" />
            <circle cx="22" cy="10" r="3" fill="#4F7942" />
            <circle cx="6" cy="18" r="2.5" fill="#4F7942" />
            <circle cx="26" cy="18" r="2.5" fill="#4F7942" />
            <ellipse cx="16" cy="22" rx="7" ry="6" fill="#4F7942" />
          </svg>
          来自 宠物手帐 · pet journal
        </div>

        {/* 角装饰（主题决定） */}
        <span style={{ position: 'absolute', top: 60, right: 16, fontSize: 18, opacity: 0.65 }}>{theme.cornerTopRight}</span>
        <span style={{ position: 'absolute', bottom: 50, left: 16, fontSize: 14, opacity: 0.55 }}>{theme.cornerBottomLeft}</span>
      </motion.div>

      {/* 操作按钮 */}
      <div className="flex gap-3 mt-6 flex-wrap justify-center" onClick={(e) => e.stopPropagation()}>
        <button onClick={saveImage} disabled={saving} className="btn-primary">
          {saving ? '生成中...' : '📥 保存图片'}
        </button>
        <button onClick={copyToClipboard} disabled={saving} className="btn-ghost" style={{ background: 'rgba(255,255,255,0.85)' }}>
          {copied ? '✓ 已复制' : saving ? '...' : '📋 复制图片'}
        </button>
        <button onClick={onClose} className="btn-ghost" style={{ background: 'rgba(255,255,255,0.85)' }}>
          关闭
        </button>
      </div>
    </motion.div>
  )
}
