// 占位 — Phase 3 会扩展为完整的详情页（含 手帐/相册/心情 三 Tab）
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase, type Pet, SPECIES_LABEL, SPECIES_EMOJI } from '../lib/supabase'
import PhotoBackground from '../components/PhotoBackground'

export default function PetDetailPage() {
  const { id } = useParams()
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    supabase.from('pets').select('*').eq('id', id).single().then(({ data }) => {
      setPet(data as Pet)
      setLoading(false)
    })
  }, [id])

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
      <PhotoBackground photo="dashboard" intensity={0.6} />
      <Link to="/pets" className="text-sm relative z-10" style={{ color: 'var(--color-ink-soft)' }}>← 回到毛孩子列表</Link>

      <div className="max-w-4xl mx-auto mt-6 relative z-10">
        <div className="card-paper card-paper-tape !p-10 mb-6 flex items-center gap-6">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shrink-0"
            style={{ background: 'rgba(255, 232, 200, 0.7)' }}
          >
            {pet.avatar_url ? (
              <img src={pet.avatar_url} className="w-full h-full rounded-full object-cover" alt={pet.name} />
            ) : (
              <span>{SPECIES_EMOJI[pet.species]}</span>
            )}
          </div>
          <div>
            <h1 className="text-4xl mb-1">{pet.name}</h1>
            <p style={{ color: 'var(--color-ink-soft)' }}>
              {SPECIES_LABEL[pet.species]}
              {pet.birth_date && <span> · 生日 {pet.birth_date}</span>}
            </p>
            {pet.note && <p className="mt-2 handwrite text-lg">"{pet.note}"</p>}
          </div>
        </div>

        <div className="card-paper text-center !py-12">
          <p style={{ color: 'var(--color-ink-soft)' }}>详情页正在打造中（手帐墙 / 相册 / 心情曲线）</p>
        </div>
      </div>
    </div>
  )
}
