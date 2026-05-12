import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, PET_POV_STYLES, type PetPovStyle } from '../lib/supabase'

interface Props {
  content: string
  petName: string | null
  petSpecies: string | null
  povText: string | null
  povStyle: PetPovStyle | null
  onGenerated: (text: string, style: PetPovStyle) => void
  onClear: () => void
}

export default function PetPovGenerator({
  content,
  petName,
  petSpecies,
  povText,
  povStyle,
  onGenerated,
  onClear,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(!!povText)

  const displayName = petName || '它'
  const canGenerate = content.trim().length >= 5

  async function generate(style: PetPovStyle) {
    if (!canGenerate) {
      setError(`先写几句话，再让 ${displayName} 也说说看`)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: invokeErr } = await supabase.functions.invoke('pet-pov', {
        body: {
          content: content.trim(),
          style,
          pet_name: displayName,
          pet_species: petSpecies || '宠物',
        },
      })
      if (invokeErr) throw new Error(invokeErr.message)
      const text: string | undefined = data?.pov_text
      if (!text) throw new Error(data?.error || '返回为空，再试一次')
      onGenerated(text, style)
    } catch (err: any) {
      setError(err?.message ?? '生成失败')
    } finally {
      setLoading(false)
    }
  }

  if (!expanded) {
    return (
      <div className="pt-4 border-t" style={{ borderColor: 'rgba(122,106,92,0.15)' }}>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          disabled={!canGenerate}
          className="text-sm flex items-center gap-2 transition"
          style={{
            color: canGenerate ? 'var(--color-forest)' : 'var(--color-ink-soft)',
            opacity: canGenerate ? 1 : 0.5,
          }}
        >
          ✨ 让 {displayName} 也说一句
          {!canGenerate && <span className="text-xs opacity-70">（先写几句话再试）</span>}
        </button>
      </div>
    )
  }

  const activeStyle = PET_POV_STYLES.find((s) => s.id === povStyle)

  return (
    <div className="pt-4 border-t space-y-3" style={{ borderColor: 'rgba(122,106,92,0.15)' }}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold flex items-center gap-1.5">
          🐾 {displayName} 的视角
        </p>
        <button
          type="button"
          onClick={() => {
            setExpanded(false)
            setError(null)
          }}
          className="text-xs underline"
          style={{ color: 'var(--color-ink-soft)' }}
        >
          收起
        </button>
      </div>

      <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
        选一种性格，{displayName} 会用这个语气重写一遍你的日记
      </p>

      <div className="flex flex-wrap gap-2">
        {PET_POV_STYLES.map((s) => {
          const active = povStyle === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => generate(s.id)}
              disabled={loading}
              title={s.description}
              className="px-3 py-1.5 rounded-full text-sm transition flex items-center gap-1.5"
              style={{
                background: active ? 'var(--color-forest)' : 'rgba(255,255,255,0.4)',
                color: active ? 'white' : 'var(--color-ink-soft)',
                border: '1px solid ' + (active ? 'var(--color-forest)' : 'rgba(122,106,92,0.18)'),
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'wait' : 'pointer',
              }}
            >
              {s.emoji} {s.label}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.p
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm italic"
            style={{ color: 'var(--color-ink-soft)' }}
          >
            {displayName} 正在思考中…
          </motion.p>
        )}
        {!loading && error && (
          <motion.p
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm"
            style={{ color: 'var(--color-rose)' }}
          >
            {error}
          </motion.p>
        )}
        {!loading && !error && povText && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(255,255,255,0.45)',
              border: '1px solid rgba(122,106,92,0.12)',
            }}
          >
            <p
              className="handwrite text-base leading-relaxed whitespace-pre-wrap"
              style={{ color: 'var(--color-ink)' }}
            >
              {povText}
            </p>
            <div className="flex justify-end gap-3 mt-3 text-xs">
              <button
                type="button"
                onClick={() => povStyle && generate(povStyle)}
                disabled={loading || !povStyle}
                className="underline"
                style={{ color: 'var(--color-forest)' }}
              >
                换一段{activeStyle ? `（${activeStyle.label}）` : ''}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClear()
                  setExpanded(false)
                }}
                className="underline"
                style={{ color: 'var(--color-ink-soft)' }}
              >
                删除
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
