import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase, type Entry } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import PhotoBackground from '../components/PhotoBackground'

const MOODS = ['🐾', '😺', '🐶', '😴', '🥰', '😋', '🥺', '🤔', '🎉', '💖']

export default function EditorPage() {
  const { id } = useParams()
  const isNew = id === 'new'
  const { session } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('🐾')
  const [petName, setPetName] = useState('')
  const [entryDate, setEntryDate] = useState(today())
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [error, setError] = useState<string | null>(null)

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
        setPetName(e.pet_name ?? '')
        setEntryDate(e.entry_date)
        setPhotoUrl(e.photo_url)
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
    try {
      const payload = {
        user_id: session.user.id,
        title: title.trim(),
        content,
        mood,
        pet_name: petName.trim() || null,
        entry_date: entryDate,
        photo_url: photoUrl,
      }
      if (isNew) {
        const { error } = await supabase.from('entries').insert(payload)
        if (error) throw error
      } else {
        const { error } = await supabase.from('entries').update(payload).eq('id', id!)
        if (error) throw error
      }
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message ?? '保存失败')
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

          {/* 日期 + 宠物名 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm">日期</label>
              <input type="date" className="input" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
            </div>
            <div>
              <label className="block mb-1 text-sm">毛孩子名字（可选）</label>
              <input className="input" value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="馒头" />
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

          {/* 正文 */}
          <div>
            <label className="block mb-1 text-sm">正文</label>
            <textarea
              className="input handwrite text-lg" rows={8} value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="今天它把袜子叼到了门口..."
            />
          </div>

          {error && <p className="text-sm" style={{ color: 'var(--color-rose)' }}>{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? '保存中...' : '保存这一页'}
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
