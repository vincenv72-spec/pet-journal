import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, type Pet, type Species, type PetPovStyle, SPECIES_LABEL, SPECIES_EMOJI, BREED_PRESETS, PET_POV_STYLES } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import PhotoBackground from '../components/PhotoBackground'
import SpeciesIcon from '../components/SpeciesIcon'

// 用于种类选择按钮显示（不含 emoji，emoji 用 SpeciesIcon SVG）
const SPECIES_NAME_PLAIN: Record<Species, string> = {
  cat: '猫', dog: '狗', rabbit: '兔', bird: '鸟', hamster: '仓鼠', fish: '鱼', other: '其他',
}

export default function PetsPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Pet | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    loadPets()
  }, [session])

  async function loadPets() {
    setLoading(true)
    const { data } = await supabase
      .from('pets')
      .select('*')
      .order('created_at', { ascending: true })
    if (data) setPets(data as Pet[])
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(pet: Pet) {
    setEditing(pet)
    setShowForm(true)
  }

  async function handleDelete(pet: Pet) {
    if (!confirm(`确认删除 ${pet.name}？所有相关手帐会保留但不再关联宠物。`)) return
    const { error } = await supabase.from('pets').delete().eq('id', pet.id)
    if (!error) setPets((p) => p.filter((x) => x.id !== pet.id))
  }

  async function logout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen px-6 md:px-16 py-8 relative">
      <PhotoBackground photo="dashboard" intensity={0.65} />

      <header className="flex items-center justify-between mb-10 relative z-10">
        <Link to="/" className="flex items-center gap-2 text-2xl handwrite font-bold">
          🌿 宠物手帐
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link to="/dashboard" className="hidden md:inline hover:opacity-70">手帐本</Link>
          <Link to="/pets" className="hidden md:inline font-bold" style={{ color: 'var(--color-forest)' }}>毛孩子</Link>
          <span className="hidden sm:inline text-xs md:text-sm" style={{ color: 'var(--color-ink-soft)' }}>{session?.user.email}</span>
          <button onClick={logout} className="underline text-sm">退出</button>
        </nav>
      </header>

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4 relative z-10">
        <div>
          <h1 className="text-4xl mb-1">我的毛孩子</h1>
          <p style={{ color: 'var(--color-ink-soft)' }}>
            {loading ? '...' : `已登记 ${pets.length} 只`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowJoin(true)} className="btn-ghost">用邀请码加入</button>
          <button onClick={openNew} className="btn-primary">＋ 添加新成员</button>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-20" style={{ color: 'var(--color-ink-soft)' }}>加载中...</p>
      ) : pets.length === 0 ? (
        <EmptyState onAdd={openNew} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {pets.map((p, i) => (
            <PetCard key={p.id} pet={p} index={i} onEdit={() => openEdit(p)} onDelete={() => handleDelete(p)} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <PetFormModal
            pet={editing}
            ownerId={session!.user.id}
            onClose={() => setShowForm(false)}
            onSaved={() => { setShowForm(false); loadPets() }}
          />
        )}
        {showJoin && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(45, 47, 38, 0.45)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowJoin(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="card-paper card-paper-tape w-full max-w-md !p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl mb-3">用邀请码加入</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--color-ink-soft)' }}>
                输入家人发给你的邀请码，一起记录这只毛孩子
              </p>
              <input
                className="input mb-4 text-center text-xl tracking-[0.2em] font-mono"
                placeholder="ABC-DEF-GHI"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={11}
              />
              {joinError && <p className="text-sm mb-3" style={{ color: 'var(--color-rose)' }}>{joinError}</p>}
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    if (!joinCode.trim() || !session) return
                    setJoining(true); setJoinError(null)
                    try {
                      const { data: invite } = await supabase
                        .from('pet_invites')
                        .select('*')
                        .eq('code', joinCode.trim())
                        .is('used_at', null)
                        .gt('expires_at', new Date().toISOString())
                        .single()
                      if (!invite) throw new Error('邀请码无效或已过期')
                      const { error: addErr } = await supabase.from('pet_members').insert({
                        pet_id: invite.pet_id,
                        user_id: session.user.id,
                        role: 'member',
                      })
                      if (addErr && !addErr.message.includes('duplicate')) throw addErr
                      await supabase.from('pet_invites').update({
                        used_at: new Date().toISOString(),
                        used_by: session.user.id,
                      }).eq('code', joinCode.trim())
                      setShowJoin(false); setJoinCode(''); loadPets()
                    } catch (err: any) {
                      setJoinError(err.message ?? '加入失败')
                    } finally {
                      setJoining(false)
                    }
                  }}
                  disabled={joining || !joinCode.trim()}
                  className="btn-primary flex-1 justify-center"
                >
                  {joining ? '加入中...' : '加入'}
                </button>
                <button onClick={() => setShowJoin(false)} className="btn-ghost">取消</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PetCard({ pet, index, onEdit, onDelete }: { pet: Pet; index: number; onEdit: () => void; onDelete: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="card-paper hover:-translate-y-1 transition-transform"
      style={{ transform: `rotate(${(index % 3 - 1) * 0.6}deg)` }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shrink-0"
          style={{ background: 'rgba(255, 232, 200, 0.6)', border: '1px solid rgba(255,255,255,0.5)' }}
        >
          {pet.avatar_url ? (
            <img src={pet.avatar_url} className="w-full h-full rounded-full object-cover" alt={pet.name} />
          ) : (
            <span>{SPECIES_EMOJI[pet.species]}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link to={`/pets/${pet.id}`} className="block">
            <h3 className="text-2xl mb-0.5 truncate">{pet.name}</h3>
            <p className="text-sm truncate" style={{ color: 'var(--color-ink-soft)' }}>
              {pet.breed ? <>{SPECIES_EMOJI[pet.species]} {pet.breed}</> : SPECIES_LABEL[pet.species]}
              {pet.birth_date && <span> · {age(pet.birth_date)}</span>}
            </p>
          </Link>
        </div>
      </div>

      {pet.note && (
        <p className="text-sm line-clamp-2 mb-4 handwrite" style={{ color: 'var(--color-ink-soft)' }}>
          "{pet.note}"
        </p>
      )}

      <div className="flex gap-3 text-sm">
        <Link to={`/pets/${pet.id}`} className="underline" style={{ color: 'var(--color-forest)' }}>查看档案 →</Link>
        <button onClick={onEdit} className="underline opacity-70">编辑</button>
        <button onClick={onDelete} className="underline opacity-70" style={{ color: 'var(--color-rose)' }}>删除</button>
      </div>
    </motion.div>
  )
}

function PetFormModal({ pet, ownerId, onClose, onSaved }: { pet: Pet | null; ownerId: string; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(pet?.name ?? '')
  const [species, setSpecies] = useState<Species>(pet?.species ?? 'cat')
  const [breed, setBreed] = useState(pet?.breed ?? '')
  const [birthDate, setBirthDate] = useState(pet?.birth_date ?? '')
  const [note, setNote] = useState(pet?.note ?? '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(pet?.avatar_url ?? null)
  const [povStyles, setPovStyles] = useState<PetPovStyle[]>(pet?.pov_styles ?? [])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function togglePovStyle(s: PetPovStyle) {
    if (povStyles.includes(s)) {
      setPovStyles(povStyles.filter((x) => x !== s))
    } else if (povStyles.length < 3) {
      setPovStyles([...povStyles, s])
    }
  }

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${ownerId}/avatars/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('photos').upload(path, file)
      if (upErr) throw upErr
      const { data } = supabase.storage.from('photos').getPublicUrl(path)
      setAvatarUrl(data.publicUrl)
    } catch (err: any) {
      setError(err.message ?? '上传失败')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('给毛孩子起个名字吧')
      return
    }
    if (povStyles.length === 0) {
      setError(`选 1-3 种性格，让 ${name.trim() || '它'} 拥有自己的说话方式`)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload = {
        owner_id: ownerId,
        name: name.trim(),
        species,
        breed: breed.trim() || null,
        birth_date: birthDate || null,
        note: note.trim() || null,
        avatar_url: avatarUrl,
        pov_styles: povStyles,
      }
      if (pet) {
        const { error } = await supabase.from('pets').update(payload).eq('id', pet.id)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('pets').insert(payload).select().single()
        if (error) throw error
        // 自动加入 pet_members 作为 owner
        if (data) {
          await supabase.from('pet_members').insert({
            pet_id: data.id,
            user_id: ownerId,
            role: 'owner',
          })
        }
      }
      onSaved()
    } catch (err: any) {
      setError(err.message ?? '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      style={{ background: 'rgba(45, 47, 38, 0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="card-paper card-paper-tape w-full max-w-md !p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl mb-6">{pet ? '编辑档案' : '新成员登记'}</h2>

        <div className="space-y-4">
          {/* 头像 */}
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shrink-0 cursor-pointer"
              style={{ background: 'rgba(255, 232, 200, 0.7)', border: '2px dashed rgba(122,106,92,0.3)' }}
              onClick={() => document.getElementById('avatar-input')?.click()}
            >
              {avatarUrl ? (
                <img src={avatarUrl} className="w-full h-full rounded-full object-cover" alt="" />
              ) : (
                <span>{SPECIES_EMOJI[species]}</span>
              )}
            </div>
            <div className="flex-1">
              <input id="avatar-input" type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
              <button
                type="button"
                onClick={() => document.getElementById('avatar-input')?.click()}
                className="text-sm underline" style={{ color: 'var(--color-forest)' }}
              >
                {avatarUrl ? '换个头像' : '+ 上传头像（可选）'}
              </button>
              {uploading && <p className="text-xs mt-1">上传中...</p>}
            </div>
          </div>

          {/* 名字 */}
          <div>
            <label className="block mb-1 text-sm">名字 *</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="馒头" maxLength={20} />
          </div>

          {/* 种类 */}
          <div>
            <label className="block mb-2 text-sm">种类</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SPECIES_LABEL) as Species[]).map((s) => {
                const active = species === s
                return (
                  <button
                    key={s} type="button"
                    onClick={() => { setSpecies(s); setBreed('') }}
                    className="px-3 py-2 rounded-xl text-sm transition flex items-center gap-1.5"
                    style={{
                      background: active ? 'var(--color-tape)' : 'rgba(255,255,255,0.4)',
                      border: '1px solid ' + (active ? 'var(--color-forest)' : 'rgba(122,106,92,0.18)'),
                      color: active ? 'var(--color-forest-deep)' : 'var(--color-ink-soft)',
                    }}
                  >
                    <SpeciesIcon species={s} size={20} />
                    <span>{SPECIES_NAME_PLAIN[s]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 品种细分 */}
          <div>
            <label className="block mb-2 text-sm">品种（可选）</label>
            {BREED_PRESETS[species] && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {BREED_PRESETS[species]!.map((b) => (
                  <button
                    key={b} type="button"
                    onClick={() => setBreed(b)}
                    className="px-2.5 py-1 rounded-full text-xs transition"
                    style={{
                      background: breed === b ? 'var(--color-forest)' : 'rgba(255,255,255,0.4)',
                      color: breed === b ? 'white' : 'var(--color-ink-soft)',
                      border: '1px solid ' + (breed === b ? 'var(--color-forest)' : 'rgba(122,106,92,0.15)'),
                    }}
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}
            <input
              className="input"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder={BREED_PRESETS[species] ? '点选上方或自由输入' : '比如 安哥拉 / 蓝色 / 山雀'}
              maxLength={20}
            />
          </div>

          {/* 生日 */}
          <div>
            <label className="block mb-1 text-sm">生日（可选）</label>
            <input type="date" className="input" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </div>

          {/* 一句话介绍 */}
          <div>
            <label className="block mb-1 text-sm">一句话介绍（可选）</label>
            <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="爱睡懒觉的小机灵" maxLength={50} />
          </div>

          {/* 性格池 —— 决定 POV 的说话方式 */}
          <div className="pt-2">
            <label className="block mb-1 text-sm">
              {name.trim() || '它'} 是怎样的小家伙？*
              <span className="text-xs ml-2 opacity-60">选 1-3 种性格</span>
            </label>
            <p className="text-xs mb-3" style={{ color: 'var(--color-ink-soft)' }}>
              之后{name.trim() || '它'}会用这些语气在手帐里和你搭话
            </p>
            <div className="flex flex-wrap gap-2">
              {PET_POV_STYLES.map((s) => {
                const active = povStyles.includes(s.id)
                const limitReached = povStyles.length >= 3 && !active
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => togglePovStyle(s.id)}
                    disabled={limitReached}
                    title={s.description}
                    className="px-3 py-1.5 rounded-full text-sm transition flex items-center gap-1.5"
                    style={{
                      background: active ? 'var(--color-forest)' : 'rgba(255,255,255,0.4)',
                      color: active ? 'white' : 'var(--color-ink-soft)',
                      border: '1px solid ' + (active ? 'var(--color-forest)' : 'rgba(122,106,92,0.18)'),
                      opacity: limitReached ? 0.4 : 1,
                      cursor: limitReached ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {s.emoji} {s.label}
                  </button>
                )
              })}
            </div>
            {povStyles.length > 0 && (
              <p className="text-xs mt-2" style={{ color: 'var(--color-ink-soft)' }}>
                已选 {povStyles.length}/3 · 每篇手帐会随机抽一种语气
              </p>
            )}
          </div>

          {error && <p className="text-sm" style={{ color: 'var(--color-rose)' }}>{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? '保存中...' : pet ? '保存修改' : '登记入册'}
            </button>
            <button onClick={onClose} className="btn-ghost">取消</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-24 relative z-10">
      <div className="text-7xl mb-4">🐾</div>
      <h2 className="text-3xl mb-2">还没有毛孩子档案</h2>
      <p className="mb-6" style={{ color: 'var(--color-ink-soft)' }}>添加第一只，让手帐有归属</p>
      <button onClick={onAdd} className="btn-primary">+ 登记新成员</button>
    </div>
  )
}

function age(birthDate: string): string {
  const birth = new Date(birthDate)
  const now = new Date()
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (months < 12) return `${months} 个月`
  return `${(months / 12).toFixed(1)} 岁`
}
