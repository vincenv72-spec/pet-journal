import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme, THEMES, type ThemeId } from '../lib/theme'

/** 主题切换按钮 + 弹出面板 */
export default function ThemePicker() {
  const { themeId, theme, setThemeId } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="pill"
        style={{ fontSize: '12px' }}
        title="切换主题"
      >
        {theme.emoji} {theme.name}
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
              style={{ background: 'rgba(45, 47, 38, 0.45)', backdropFilter: 'blur(4px)' }}
              onClick={() => setOpen(false)}
            >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="card-paper card-paper-tape w-full max-w-md !p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl mb-2">换个氛围 🎨</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--color-ink-soft)' }}>
                选一个主题，整站背景 / 光斑 / 鼠标拖尾全部跟着变
              </p>

              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(THEMES) as ThemeId[]).map((id) => {
                  const t = THEMES[id]
                  const active = id === themeId
                  return (
                    <button
                      key={id}
                      onClick={() => { setThemeId(id); setTimeout(() => setOpen(false), 300) }}
                      className="text-left p-4 rounded-2xl transition"
                      style={{
                        background: active ? 'var(--color-tape)' : 'rgba(255,255,255,0.4)',
                        border: '2px solid ' + (active ? 'var(--color-forest)' : 'rgba(122,106,92,0.18)'),
                        transform: active ? 'scale(1.02)' : 'none',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{t.emoji}</span>
                        <span className="font-bold">{t.name}</span>
                        {active && <span className="text-xs ml-auto" style={{ color: 'var(--color-forest)' }}>✓</span>}
                      </div>
                      <p className="text-xs leading-snug" style={{ color: 'var(--color-ink-soft)' }}>
                        {t.description}
                      </p>
                      {/* 主题色预览条 */}
                      <div className="flex gap-1 mt-2">
                        {t.trailColors.slice(0, 5).map((c, i) => (
                          <span
                            key={i}
                            className="w-4 h-4 rounded-full"
                            style={{ background: c }}
                          />
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>

              <p className="text-xs text-center mt-6" style={{ color: 'var(--color-ink-soft)' }}>
                偏好会保存在本设备上
              </p>

              <div className="flex justify-end mt-4">
                <button onClick={() => setOpen(false)} className="btn-ghost text-sm">关闭</button>
              </div>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
