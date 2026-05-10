import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase, type Pet } from '../lib/supabase'
import { useAuth } from '../lib/auth'

type Member = {
  user_id: string
  role: string
  email?: string
}

export default function InviteModal({ pet, onClose }: { pet: Pet; onClose: () => void }) {
  const { session } = useAuth()
  const [code, setCode] = useState<string | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadMembers()
  }, [pet.id])

  async function loadMembers() {
    const { data } = await supabase.from('pet_members').select('user_id, role').eq('pet_id', pet.id)
    if (data) setMembers(data as Member[])
  }

  async function generateCode() {
    if (!session) return
    setGenerating(true)
    try {
      const newCode = randomCode()
      const { error } = await supabase.from('pet_invites').insert({
        code: newCode,
        pet_id: pet.id,
        invited_by: session.user.id,
      })
      if (error) throw error
      setCode(newCode)
    } catch (err: any) {
      alert('生成失败：' + (err.message ?? '未知错误'))
    } finally {
      setGenerating(false)
    }
  }

  function copyCode() {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function removeMember(userId: string) {
    if (userId === pet.owner_id) {
      alert('不能移除主人哦')
      return
    }
    if (!confirm('确认移除这位成员？')) return
    const { error } = await supabase.from('pet_members').delete().eq('pet_id', pet.id).eq('user_id', userId)
    if (!error) loadMembers()
  }

  const isOwner = session?.user.id === pet.owner_id

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      style={{ background: 'rgba(45, 47, 38, 0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="card-paper card-paper-tape w-full max-w-md !p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl mb-1">把 {pet.name} 一起带回家 🌿</h2>
            <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
              邀请家人共同记录手帐
            </p>
          </div>
          <button onClick={onClose} className="text-2xl opacity-50 hover:opacity-100">×</button>
        </div>

        {/* 邀请码区 */}
        {isOwner ? (
          <div className="mb-6">
            <p className="text-sm mb-2">邀请码（7 天有效）</p>
            {code ? (
              <div className="flex items-center gap-3 p-4 rounded-xl"
                   style={{ background: 'rgba(255,232,200,0.5)', border: '1px solid rgba(122,106,92,0.18)' }}>
                <code className="text-2xl flex-1 font-mono tracking-[0.2em]">{code}</code>
                <button onClick={copyCode} className="btn-primary !py-2 !px-4 text-sm">
                  {copied ? '✓ 已复制' : '复制'}
                </button>
              </div>
            ) : (
              <button
                onClick={generateCode}
                disabled={generating}
                className="btn-primary w-full justify-center"
              >
                {generating ? '生成中...' : '+ 生成邀请码'}
              </button>
            )}
            {code && (
              <p className="text-xs mt-3" style={{ color: 'var(--color-ink-soft)' }}>
                把邀请码发给对方 → 对方在「我的毛孩子」页点「+ 用邀请码加入」即可
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm mb-6 p-3 rounded-lg" style={{ background: 'rgba(255,232,200,0.4)' }}>
            只有主人可以邀请新成员
          </p>
        )}

        {/* 成员列表 */}
        <div>
          <p className="text-sm mb-3">现有成员（{members.length}）</p>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.user_id} className="flex items-center justify-between p-3 rounded-xl"
                   style={{ background: 'rgba(255,255,255,0.4)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{m.role === 'owner' ? '👑' : '👥'}</span>
                  <div>
                    <p className="text-sm font-medium">
                      {m.user_id === session?.user.id ? '我' : `成员 ${m.user_id.slice(0, 8)}`}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>
                      {m.role === 'owner' ? '主人' : '成员'}
                    </p>
                  </div>
                </div>
                {isOwner && m.user_id !== session?.user.id && (
                  <button
                    onClick={() => removeMember(m.user_id)}
                    className="text-xs underline"
                    style={{ color: 'var(--color-rose)' }}
                  >移除</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function randomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'  // 去掉易混淆字符
  const part = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${part(3)}-${part(3)}-${part(3)}`
}
