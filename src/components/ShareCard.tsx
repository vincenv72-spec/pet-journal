import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Entry } from '../lib/supabase'
import { TAG_PRESETS } from '../lib/supabase'

/** 单篇手帐的可分享卡片（生成 1080x1440 PNG） */
export default function ShareCard({ entry, petName, onClose }: { entry: Entry; petName: string | null; onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

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
          background: `
            radial-gradient(circle at 20% 15%, rgba(255, 220, 175, 0.55), transparent 55%),
            radial-gradient(circle at 80% 85%, rgba(200, 220, 175, 0.45), transparent 55%),
            linear-gradient(180deg, #FCF6E6 0%, #F4EBD6 100%)
          `,
          borderRadius: 16,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部胶带 */}
        <div
          style={{
            position: 'absolute', top: -4, left: 30, width: 70, height: 18,
            background: 'linear-gradient(180deg, rgba(232,197,142,0.85), rgba(217,165,91,0.75))',
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
          <div style={{ padding: '60px 24px 0', textAlign: 'center' }}>
            <span style={{ fontSize: 80 }}>{entry.mood ?? '🐾'}</span>
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

        {/* 角装饰 */}
        <span style={{ position: 'absolute', top: 60, right: 16, fontSize: 18, opacity: 0.6 }}>🌿</span>
        <span style={{ position: 'absolute', bottom: 50, left: 16, fontSize: 14, opacity: 0.5 }}>✿</span>
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
