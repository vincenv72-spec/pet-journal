import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase, type Pet, isMemorial, daysBetween } from '../lib/supabase'

interface Props {
  pet: Pet
  onUpdate: (updates: Partial<Pet>) => void
}

export default function MemorialMark({ pet, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [markDate, setMarkDate] = useState<string>(pet.passed_away_at || today())
  const [markNote, setMarkNote] = useState<string>(pet.memorial_note || '')
  const [confirming, setConfirming] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [confirmingRevert, setConfirmingRevert] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const memorial = isMemorial(pet)
  const lifespan =
    pet.birth_date && pet.passed_away_at ? daysBetween(pet.birth_date, pet.passed_away_at) : null

  useEffect(() => {
    if (!confirming || countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [confirming, countdown])

  function startMark() {
    if (!markDate) {
      setError('请选择一个日期')
      return
    }
    setError(null)
    setConfirming(true)
    setCountdown(5)
  }

  function cancelConfirm() {
    setConfirming(false)
    setCountdown(0)
  }

  async function commitMark() {
    setSaving(true)
    setError(null)
    try {
      const updates: Partial<Pet> = {
        passed_away_at: markDate,
        memorial_note: markNote.trim() || null,
      }
      const { error } = await supabase.from('pets').update(updates).eq('id', pet.id)
      if (error) throw error
      onUpdate(updates)
      setConfirming(false)
      setCountdown(0)
      setExpanded(false)
    } catch (e: any) {
      setError(e?.message || '保存失败，稍后再试')
    } finally {
      setSaving(false)
    }
  }

  async function commitRevert() {
    setSaving(true)
    setError(null)
    try {
      const updates: Partial<Pet> = {
        passed_away_at: null,
        memorial_note: null,
      }
      const { error } = await supabase.from('pets').update(updates).eq('id', pet.id)
      if (error) throw error
      onUpdate(updates)
      setConfirmingRevert(false)
      setExpanded(false)
    } catch (e: any) {
      setError(e?.message || '撤销失败，稍后再试')
    } finally {
      setSaving(false)
    }
  }

  if (!expanded) {
    return (
      <div className="text-center pt-12 pb-6">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-xs underline transition"
          style={{ color: 'var(--color-ink-soft)', opacity: 0.55 }}
        >
          关于 {pet.name} 的最后篇章 ›
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-paper !p-6 md:!p-8 mt-10 mb-6"
      style={{ background: 'rgba(251, 246, 232, 0.55)' }}
    >
      <div className="flex justify-between items-start mb-5">
        <h3 className="text-2xl">{pet.name} 的最后篇章</h3>
        <button
          onClick={() => {
            setExpanded(false)
            cancelConfirm()
            setConfirmingRevert(false)
          }}
          className="text-xs underline mt-1"
          style={{ color: 'var(--color-ink-soft)' }}
        >
          收起
        </button>
      </div>

      {memorial ? (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
            {pet.name} 在 <strong style={{ color: 'var(--color-ink)' }}>{pet.passed_away_at}</strong> 离开了
            {lifespan != null && (
              <>
                ，陪伴了 <strong style={{ color: 'var(--color-ink)' }}>{lifespan.toLocaleString()}</strong> 天
              </>
            )}
            。
          </p>
          {pet.memorial_note && (
            <p
              className="handwrite text-lg leading-relaxed"
              style={{ color: 'var(--color-forest-deep)' }}
            >
              "{pet.memorial_note}"
            </p>
          )}

          <div className="pt-3 border-t" style={{ borderColor: 'rgba(122,106,92,0.12)' }}>
            {!confirmingRevert ? (
              <button
                onClick={() => setConfirmingRevert(true)}
                className="text-xs underline"
                style={{ color: 'var(--color-ink-soft)', opacity: 0.7 }}
              >
                想撤销这个标记
              </button>
            ) : (
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <span style={{ color: 'var(--color-ink-soft)' }}>确定要撤销吗？</span>
                <button
                  onClick={commitRevert}
                  disabled={saving}
                  className="underline"
                  style={{ color: 'var(--color-rose)' }}
                >
                  {saving ? '撤销中…' : '是的，撤销'}
                </button>
                <button
                  onClick={() => setConfirmingRevert(false)}
                  className="underline"
                  style={{ color: 'var(--color-ink-soft)' }}
                >
                  再想想
                </button>
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs" style={{ color: 'var(--color-rose)' }}>
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
            如果 {pet.name} 已经离开了，可以在这里温柔地记下来。
            标记之后，关于 {pet.name} 的页面会进入纪念馆模式，背景会安静下来，
            你也能随时翻看你们的一生。这个标记之后可以撤销。
          </p>

          <div>
            <label className="text-sm block mb-1">{pet.name} 离开的那一天</label>
            <input
              type="date"
              className="input"
              value={markDate}
              max={today()}
              onChange={(e) => setMarkDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm block mb-1">
              想为 {pet.name} 写一句话（可选）
            </label>
            <input
              type="text"
              className="input"
              value={markNote}
              onChange={(e) => setMarkNote(e.target.value)}
              maxLength={60}
              placeholder="一只在阳光里长大的橘猫"
            />
          </div>

          {error && (
            <p className="text-xs" style={{ color: 'var(--color-rose)' }}>
              {error}
            </p>
          )}

          {!confirming ? (
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setExpanded(false)}
                className="btn-ghost text-sm"
              >
                再想想
              </button>
              <button onClick={startMark} className="btn-primary text-sm">
                标记 {pet.name} 离开
              </button>
            </div>
          ) : (
            <div
              className="space-y-3 pt-3 border-t"
              style={{ borderColor: 'rgba(122,106,92,0.15)' }}
            >
              <p className="text-sm text-center" style={{ color: 'var(--color-ink-soft)' }}>
                这个动作会让 {pet.name} 进入纪念馆模式。<br />
                如果不确定，可以再想想，之后也能改。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelConfirm}
                  className="btn-ghost text-sm flex-1"
                >
                  再想想
                </button>
                <button
                  onClick={commitMark}
                  disabled={countdown > 0 || saving}
                  className="btn-primary text-sm flex-1"
                  style={{ opacity: countdown > 0 ? 0.55 : 1 }}
                >
                  {saving
                    ? '保存中…'
                    : countdown > 0
                    ? `是的，标记（${countdown}）`
                    : '是的，标记'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

function today() {
  return new Date().toISOString().slice(0, 10)
}
