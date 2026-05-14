import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { fetchCompanionWall, type CompanionWallEntry, SPECIES_CN } from '../lib/supabase'
import SpeciesIcon from '../components/SpeciesIcon'
import CompanionPetModal from '../components/CompanionPetModal'

export default function CompanionWallPage() {
  const [pets, setPets] = useState<CompanionWallEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)

  useEffect(() => {
    fetchCompanionWall()
      .then(setPets)
      .catch((e) => setError(e?.message ?? String(e)))
  }, [])

  const alive = pets?.filter((p) => !p.has_passed_away).length ?? 0
  const passed = pets?.filter((p) => p.has_passed_away).length ?? 0

  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      <header className="mb-8 relative z-10">
        <Link
          to="/dashboard"
          className="text-sm inline-block mb-3"
          style={{ color: 'var(--color-forest)' }}
        >
          ← 回到日记
        </Link>
        <h1 className="text-4xl mb-2">同伴墙</h1>
        <p style={{ color: 'var(--color-ink-soft)' }}>
          看看其他毛孩子的故事 — 你不孤单。
        </p>
        {pets && pets.length > 0 && (
          <p className="text-sm mt-2" style={{ color: 'var(--color-ink-soft)' }}>
            一共 {pets.length} 只在这里
            {passed > 0 && <span> · 其中 {passed} 只已经先走一步</span>}
            {' · '}
            <span>{alive} 只仍在被记录</span>
          </p>
        )}
      </header>

      {error && (
        <p className="my-8" style={{ color: 'var(--color-honey)' }}>
          加载失败：{error}
        </p>
      )}

      {!error && pets === null && (
        <p className="my-8" style={{ color: 'var(--color-ink-soft)' }}>
          正在加载……
        </p>
      )}

      {!error && pets && pets.length === 0 && (
        <p className="my-8" style={{ color: 'var(--color-ink-soft)' }}>
          墙上还没有毛孩子 ✿
        </p>
      )}

      {!error && pets && pets.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
          {pets.map((p) => (
            <CompanionCard key={p.id} pet={p} onOpen={() => setSelectedPetId(p.id)} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedPetId && (
          <CompanionPetModal
            petId={selectedPetId}
            onClose={() => setSelectedPetId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function CompanionCard({ pet, onOpen }: { pet: CompanionWallEntry; onOpen: () => void }) {
  const memorial = pet.has_passed_away
  return (
    <button
      type="button"
      onClick={onOpen}
      className="rounded-2xl p-5 relative text-left transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{
        background: memorial ? 'rgba(247,244,232,0.42)' : 'rgba(255,252,243,0.7)',
        boxShadow: memorial
          ? '0 1px 3px rgba(0,0,0,0.04)'
          : '0 2px 8px rgba(0,0,0,0.06)',
        border: memorial ? '1px solid rgba(140,130,115,0.18)' : '1px solid rgba(255,255,255,0.5)',
      }}
    >
      {memorial && (
        <span
          className="absolute top-3 right-3"
          aria-hidden
          style={{ color: '#5a7c5e' }}
          title="已经先走一步"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3c-4 4-7 7-7 11 0 4 3 6 7 7 4-1 7-3 7-7 0-4-3-7-7-11z" />
            <path d="M12 10v11" />
          </svg>
        </span>
      )}

      <div
        className="w-16 h-16 rounded-full mb-3 flex items-center justify-center overflow-hidden"
        style={{
          background: 'rgba(255, 252, 243, 0.5)',
          color: 'var(--color-forest-deep)',
        }}
      >
        {pet.avatar_url ? (
          <img src={pet.avatar_url} alt={pet.name} className="w-full h-full object-cover" />
        ) : (
          <SpeciesIcon species={pet.species} size={36} />
        )}
      </div>

      <h3 className="text-xl mb-1 handwrite truncate">{pet.name}</h3>

      <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
        <span className="inline-flex items-center gap-1 align-middle">
          <SpeciesIcon species={pet.species} size={12} />
          <span className="truncate">{pet.breed || SPECIES_CN[pet.species]}</span>
        </span>
      </p>

      <p className="text-xs mt-2" style={{ color: 'var(--color-ink-soft)' }}>
        {pet.entries_count} 篇手帐
      </p>

      {memorial && pet.passed_year && (
        <p className="text-xs mt-1" style={{ color: '#5a7c5e' }}>
          {pet.passed_year} 离开
        </p>
      )}
    </button>
  )
}
