import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  fetchCompanionPetDetail,
  type CompanionPetDetail,
  type CompanionEntryExcerpt,
  SPECIES_CN,
  getPovStyleMeta,
} from '../lib/supabase'
import SpeciesIcon from './SpeciesIcon'

export default function CompanionPetModal({
  petId,
  onClose,
}: {
  petId: string
  onClose: () => void
}) {
  const [detail, setDetail] = useState<CompanionPetDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchCompanionPetDetail(petId)
      .then((d) => {
        setDetail(d)
        setLoading(false)
      })
      .catch((e) => {
        setError(e?.message ?? String(e))
        setLoading(false)
      })
  }, [petId])

  const grouped = useMemo(() => {
    const acc: Record<number, CompanionEntryExcerpt[]> = {}
    for (const e of detail?.entries ?? []) {
      if (!acc[e.year]) acc[e.year] = []
      acc[e.year].push(e)
    }
    return acc
  }, [detail])

  const years = useMemo(
    () => Object.keys(grouped).map(Number).sort((a, b) => b - a),
    [grouped]
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center px-4 py-8 overflow-y-auto"
      style={{ background: 'rgba(45, 47, 38, 0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="card-paper card-paper-tape w-full max-w-lg !p-8 my-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-2xl leading-none"
          style={{ color: 'var(--color-ink-soft)' }}
          aria-label="关闭"
        >
          ×
        </button>

        {loading && (
          <p className="text-center py-12" style={{ color: 'var(--color-ink-soft)' }}>
            正在翻开他的故事……
          </p>
        )}

        {error && !loading && (
          <p className="text-center py-12" style={{ color: 'var(--color-honey)' }}>
            加载失败：{error}
          </p>
        )}

        {detail && !loading && !error && (
          <>
            {/* 头部档案 */}
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden shrink-0"
                style={{
                  background: 'rgba(255, 232, 200, 0.7)',
                  color: 'var(--color-forest-deep)',
                }}
              >
                {detail.avatar_url ? (
                  <img
                    src={detail.avatar_url}
                    alt={detail.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <SpeciesIcon species={detail.species} size={48} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl mb-1 truncate">{detail.name}</h2>
                <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                  <span className="inline-flex items-center gap-1 align-middle">
                    <SpeciesIcon species={detail.species} size={14} />
                    <span>{detail.breed || SPECIES_CN[detail.species]}</span>
                  </span>
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-ink-soft)' }}>
                  {detail.birth_year && <span>{detail.birth_year} 来到这世界</span>}
                  {detail.has_passed_away && detail.passed_year && (
                    <>
                      {detail.birth_year && <span> · </span>}
                      <span style={{ color: '#5a7c5e' }}>{detail.passed_year} 离开</span>
                    </>
                  )}
                  {detail.entries.length > 0 && (
                    <>
                      {(detail.birth_year || detail.has_passed_away) && <span> · </span>}
                      <span>{detail.entries.length} 篇手帐</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* memorial_note */}
            {detail.memorial_note && (
              <p
                className="handwrite text-lg mb-5 px-3 py-2 rounded-lg"
                style={{
                  background: 'rgba(232, 236, 228, 0.45)',
                  color: 'var(--color-forest-deep)',
                }}
              >
                "{detail.memorial_note}"
              </p>
            )}

            {/* 年份分组的 entries */}
            {detail.entries.length === 0 ? (
              <p className="text-sm py-6 text-center" style={{ color: 'var(--color-ink-soft)' }}>
                还没有写过手帐。
              </p>
            ) : (
              <div className="space-y-5">
                {years.map((year) => (
                  <div key={year}>
                    <p
                      className="text-base mb-2 handwrite tracking-wide"
                      style={{ color: 'var(--color-forest)' }}
                    >
                      {year}
                    </p>
                    <div className="space-y-3">
                      {grouped[year].map((e) => {
                        const povMeta = getPovStyleMeta(e.pet_pov_style)
                        return (
                          <div
                            key={e.id}
                            className="px-4 py-3 rounded-xl"
                            style={{
                              background: 'rgba(255, 252, 243, 0.55)',
                              border: '1px solid rgba(122,106,92,0.12)',
                            }}
                          >
                            <p className="text-base font-bold flex items-center gap-2">
                              {e.mood && <span>{e.mood}</span>}
                              <span>{e.title}</span>
                            </p>
                            <p className="text-sm mt-1" style={{ color: 'var(--color-ink-soft)' }}>
                              {e.content_excerpt}
                              {e.has_more && <span>……</span>}
                            </p>
                            {e.photo_url && (
                              <img
                                src={e.photo_url}
                                alt=""
                                className="mt-2 w-full max-h-48 object-cover rounded-md"
                                loading="lazy"
                              />
                            )}
                            {e.pet_pov_text && povMeta && (
                              <div
                                className="mt-2 text-sm px-3 py-2 rounded-lg"
                                style={{
                                  background: 'rgba(255, 232, 200, 0.45)',
                                  color: 'var(--color-forest-deep)',
                                  borderLeft: '3px solid var(--color-forest)',
                                }}
                              >
                                <span
                                  className="text-xs mr-1.5"
                                  style={{ color: 'var(--color-ink-soft)' }}
                                >
                                  {povMeta.emoji} {povMeta.label}
                                </span>
                                <span>{e.pet_pov_text}</span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p
              className="text-xs mt-6 pt-3 text-center"
              style={{
                color: 'var(--color-ink-soft)',
                borderTop: '1px dashed rgba(122,106,92,0.18)',
              }}
            >
              · 匿名展示 · 不显示具体日期与身份信息 ·
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
