import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase, type Entry, type Pet, type PetPovStyle, type EntryPovStyle, SPECIES_EMOJI, SPECIES_CN, TAG_PRESETS, POV_FALLBACK_TEXT } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import PhotoBackground from '../components/PhotoBackground'

const MOODS = ['🐾', '😺', '🐶', '😴', '🥰', '😋', '🥺', '🤔', '🎉', '💖']

export default function EditorPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isNew = id === 'new'
  const { session } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('🐾')
  const [petId, setPetId] = useState<string | null>(searchParams.get('pet') || null)
  const [entryDate, setEntryDate] = useState(today())
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [pets, setPets] = useState<Pet[]>([])
  const [saving, setSaving] = useState(false)
  const [saveStage, setSaveStage] = useState<'idle' | 'saving' | 'thinking'>('idle')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [error, setError] = useState<string | null>(null)

  // 加载用户的宠物列表
  useEffect(() => {
    if (!session) return
    supabase.from('pets').select('*').order('created_at').then(({ data }) => {
      if (data) setPets(data as Pet[])
    })
  }, [session])

  useEffect(() => {
    if (isNew || !session) return
    supabase.from('entries').select('*').eq('id', id!).single().then(({ data, error }) => {
      if (error || !data) {
        setError('找不到这篇手帐')
      } else {
        const e = data as Entry
        setTitle(e.title)
        setContent(e.content)
        setMood(e.mood ?? '🐾')
        setPetId(e.pet_id)
        setEntryDate(e.entry_date)
        setPhotoUrl(e.photo_url)
        setTags(e.tags ?? [])
      }
      setLoading(false)
    })
  }, [id, isNew, session])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !session) return
    setUploading(true)
    setError(null)
    try {
      const ext = file.name.split('.').pop()
      const path = `${session.user.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('photos').upload(path, file)
      if (upErr) throw upErr
      const { data } = supabase.storage.from('photos').getPublicUrl(path)
      setPhotoUrl(data.publicUrl)
    } catch (err: any) {
      setError(err.message ?? '上传失败')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      setError('标题不能为空')
      return
    }
    if (!session) return
    setSaving(true)
    setError(null)
    setSaveStage('saving')
    try {
      // 主动从 DB 拿 pet —— 避免 pets state 还在异步加载时的 race condition
      // (从 PetDetailPage 点"+新一篇"进入时，URL 带 ?pet=xxx，petId 立刻有值，但 pets state 可能没回来)
      let petForPov: Pet | null = pets.find((p) => p.id === petId) ?? null
      if (!petForPov && petId) {
        const { data } = await supabase.from('pets').select('*').eq('id', petId).single()
        if (data) petForPov = data as Pet
      }

      const basePayload = {
        user_id: session.user.id,
        title: title.trim(),
        content,
        mood,
        pet_id: petId,
        pet_name: petForPov?.name ?? null,
        entry_date: entryDate,
        photo_url: photoUrl,
        tags,
      }

      let savedEntryId: string | undefined = id
      if (isNew) {
        const { data, error } = await supabase
          .from('entries')
          .insert(basePayload)
          .select('id')
          .single()
        if (error) throw error
        savedEntryId = data?.id
      } else {
        const { error } = await supabase.from('entries').update(basePayload).eq('id', id!)
        if (error) throw error
      }

      // 异步生成 POV：仅新 entry + 选了带性格池的宠物 + 正文≥5 字
      if (
        isNew &&
        savedEntryId &&
        petForPov?.pov_styles &&
        petForPov.pov_styles.length > 0 &&
        content.trim().length >= 5
      ) {
        setSaveStage('thinking')
        const pool = petForPov.pov_styles

        // 决定本次是抽单 style 还是融合：
        // - URL 带 ?_fuse=1 → 强制融合（debug 用）
        // - 否则 pool.length >= 2 时 20% 概率融合，制造"今天它情绪复杂"的偶发惊喜
        const FUSION_PROBABILITY = 0.2
        const forceFuse = searchParams.get('_fuse') === '1'
        const canFuse = pool.length >= 2
        const shouldFuse = forceFuse || (canFuse && Math.random() < FUSION_PROBABILITY)

        let stylesToSend: PetPovStyle[]
        let usedStyle: EntryPovStyle
        if (shouldFuse) {
          stylesToSend = pool
          usedStyle = 'fused'
        } else {
          const chosenStyle = pool[Math.floor(Math.random() * pool.length)]
          stylesToSend = [chosenStyle]
          usedStyle = chosenStyle
        }

        let povText: string | null = null
        try {
          const { data, error: invokeErr } = await supabase.functions.invoke('pet-pov', {
            body: {
              content: content.trim(),
              styles: stylesToSend,
              pet_name: petForPov.name,
              pet_species: SPECIES_CN[petForPov.species],
            },
          })
          if (invokeErr) throw new Error(invokeErr.message)
          const returned: string | undefined = data?.pov_text
          if (!returned || returned.trim().length === 0) {
            throw new Error(`empty pov: ${JSON.stringify(data)}`)
          }
          povText = returned
        } catch (povErr) {
          console.warn('[pet-pov] 生成失败，回落到撒娇文案:', povErr)
          povText = POV_FALLBACK_TEXT
          usedStyle = 'cute' // fallback 文案是撒娇语气，emoji 也走 🍯 保持调性一致
        }

        // 写回 entry —— 不管真 POV 还是 fallback，都要让用户看到回应
        try {
          await supabase
            .from('entries')
            .update({
              pet_pov_text: povText,
              pet_pov_style: usedStyle,
              pet_pov_generated_at: new Date().toISOString(),
            })
            .eq('id', savedEntryId)
        } catch (writeErr) {
          console.error('[pet-pov] 写入 entry 失败:', writeErr)
          // 不重新抛出 —— 不能因为 POV 写入失败就阻断用户保存流程
        }
      }

      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message ?? '保存失败')
      setSaveStage('idle')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-center py-20">加载中...</p>

  return (
    <div className="min-h-screen px-6 md:px-16 py-8 relative">
      <PhotoBackground photo="editor" intensity={0.7} />
      <div className="max-w-3xl mx-auto relative z-10">
      <Link to="/dashboard" className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>← 回到手帐本</Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="card-paper card-paper-tape mt-4 !p-8 md:!p-12"
      >
        <h1 className="text-3xl mb-6">{isNew ? '✨ 新的一篇' : '🖋 编辑手帐'}</h1>

        <div className="space-y-5">
          {/* 心情 */}
          <div>
            <label className="block mb-2 text-sm">今天的心情</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m} type="button" onClick={() => setMood(m)}
                  className="text-2xl w-12 h-12 rounded-xl transition"
                  style={{
                    background: mood === m ? 'var(--color-tape)' : 'transparent',
                    border: '2px solid ' + (mood === m ? 'var(--color-forest)' : 'transparent'),
                  }}
                >{m}</button>
              ))}
            </div>
          </div>

          {/* 标题 */}
          <div>
            <label className="block mb-1 text-sm">标题</label>
            <input
              className="input" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="今天它学会了击掌"
              maxLength={80}
            />
          </div>

          {/* 日期 + 宠物选 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm">日期</label>
              <input type="date" className="input" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
            </div>
            <div>
              <label className="block mb-1 text-sm">毛孩子</label>
              {pets.length === 0 ? (
                <Link to="/pets" className="input flex items-center" style={{ color: 'var(--color-forest)' }}>
                  + 先添加一只毛孩子
                </Link>
              ) : (
                <select className="input" value={petId ?? ''} onChange={(e) => setPetId(e.target.value || null)}>
                  <option value="">— 不指定 —</option>
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {SPECIES_EMOJI[p.species]} {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* 照片 */}
          <div>
            <label className="block mb-2 text-sm">照片（可选）</label>
            {photoUrl && (
              <div className="mb-2 relative inline-block">
                <img src={photoUrl} className="max-h-48 rounded-lg" alt="" />
                <button
                  type="button" onClick={() => setPhotoUrl(null)}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full text-white text-sm"
                  style={{ background: 'var(--color-rose)' }}
                >×</button>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading}
              className="block text-sm" />
            {uploading && <p className="text-sm mt-1">上传中...</p>}
          </div>

          {/* 标签 */}
          <div>
            <label className="block mb-2 text-sm">标签（可选）</label>
            {/* 已选标签 */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((t) => {
                  const preset = TAG_PRESETS.find((p) => p.value === t)
                  return (
                    <button
                      key={t} type="button"
                      onClick={() => setTags(tags.filter((x) => x !== t))}
                      className="px-3 py-1 rounded-full text-sm transition flex items-center gap-1.5"
                      style={{
                        background: 'var(--color-forest)',
                        color: 'white',
                        border: '1px solid var(--color-forest)',
                      }}
                    >
                      {preset?.emoji ?? '🏷'} {t}
                      <span className="opacity-60 ml-0.5">×</span>
                    </button>
                  )
                })}
              </div>
            )}
            {/* 预设快选 */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {TAG_PRESETS.filter((p) => !tags.includes(p.value)).map((p) => (
                <button
                  key={p.value} type="button"
                  onClick={() => setTags([...tags, p.value])}
                  className="px-2.5 py-1 rounded-full text-xs transition"
                  style={{
                    background: 'rgba(255,255,255,0.4)',
                    color: 'var(--color-ink-soft)',
                    border: '1px solid rgba(122,106,92,0.15)',
                  }}
                >
                  {p.emoji} {p.value}
                </button>
              ))}
            </div>
            {/* 自由输入 */}
            <div className="flex gap-2">
              <input
                className="input flex-1"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault()
                    const v = tagInput.trim()
                    if (v && !tags.includes(v) && tags.length < 10) {
                      setTags([...tags, v])
                      setTagInput('')
                    }
                  }
                }}
                placeholder="自由输入按 Enter / 逗号添加"
                maxLength={12}
              />
              <button
                type="button"
                onClick={() => {
                  const v = tagInput.trim()
                  if (v && !tags.includes(v) && tags.length < 10) {
                    setTags([...tags, v])
                    setTagInput('')
                  }
                }}
                className="btn-ghost text-sm"
              >＋</button>
            </div>
          </div>

          {/* 正文 */}
          <div>
            <label className="block mb-1 text-sm">正文</label>
            <textarea
              className="input handwrite text-lg" rows={8} value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="今天它把袜子叼到了门口..."
            />
          </div>

          {/* POV 提示（3 态：让用户保存前就知道这一篇会不会有 POV） */}
          {(() => {
            const selectedPet = pets.find((p) => p.id === petId)

            // 态 A：选了宠物 + 已有性格池 → 会生成 POV
            if (selectedPet?.pov_styles && selectedPet.pov_styles.length > 0) {
              return (
                <div
                  className="rounded-xl px-4 py-3 mt-2"
                  style={{
                    background: 'rgba(232, 236, 228, 0.55)',
                    border: '1px dashed rgba(90, 124, 94, 0.30)',
                  }}
                >
                  <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
                    ✨ 保存后，{selectedPet.name} 会用它自己的语气也写一段
                  </p>
                </div>
              )
            }

            // 态 B：选了宠物但宠物没设性格池 → 引导去毛孩子页设置
            if (selectedPet) {
              return (
                <div
                  className="rounded-xl px-4 py-3 mt-2"
                  style={{
                    background: 'rgba(255, 232, 200, 0.45)',
                    border: '1px dashed rgba(217, 165, 91, 0.45)',
                  }}
                >
                  <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
                    ℹ️ {selectedPet.name} 还没设性格，
                    <Link to="/pets" className="underline mx-0.5" style={{ color: 'var(--color-honey)' }}>
                      去给它选 1-3 个
                    </Link>
                    之后就能听到它说话啦
                  </p>
                </div>
              )
            }

            // 态 C：未选宠物 → 明确告知"这一篇不会有 POV"
            return (
              <div
                className="rounded-xl px-4 py-3 mt-2"
                style={{
                  background: 'rgba(245, 240, 220, 0.4)',
                  border: '1px dashed rgba(122, 106, 92, 0.22)',
                }}
              >
                <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
                  ℹ️ 没指定毛孩子，这一篇不会有 POV —— 在上方「毛孩子」下拉框选一只就行
                </p>
              </div>
            )
          })()}

          {error && <p className="text-sm" style={{ color: 'var(--color-rose)' }}>{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saveStage === 'thinking'
                ? `${pets.find((p) => p.id === petId)?.name ?? '它'} 正在想…`
                : saveStage === 'saving'
                ? '保存中…'
                : '保存这一页'}
            </button>
            <Link to="/dashboard" className="btn-ghost">取消</Link>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  )
}

function today() {
  return new Date().toISOString().slice(0, 10)
}
