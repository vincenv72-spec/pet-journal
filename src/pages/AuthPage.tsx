import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import PhotoBackground from '../components/PhotoBackground'

export default function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const isLogin = mode === 'login'
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/dashboard')
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.session) {
          navigate('/dashboard')
        } else {
          setInfo('注册成功！请到邮箱查收确认邮件，点击链接后回来登录。')
        }
      }
    } catch (err: any) {
      setError(err.message ?? '出错了，再试一次？')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <PhotoBackground photo="login" intensity={0.85} />
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="card-paper card-paper-tape w-full max-w-md !p-10 relative z-10"
      >
        <Link to="/" className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>← 回首页</Link>
        <h1 className="text-4xl mt-3 mb-2">{isLogin ? '欢迎回来 🌿' : '注册账号 ✨'}</h1>
        <p className="mb-8" style={{ color: 'var(--color-ink-soft)' }}>
          {isLogin ? '继续记录你和它的小日子' : '让每一个温柔瞬间都被存下'}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm">邮箱</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="input" placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">密码</label>
            <input
              type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="input" placeholder="至少 6 位"
            />
          </div>

          {error && <p className="text-sm" style={{ color: 'var(--color-rose)' }}>{error}</p>}
          {info && <p className="text-sm" style={{ color: 'var(--color-forest)' }}>{info}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? '处理中...' : isLogin ? '登录' : '创建账号'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--color-ink-soft)' }}>
          {isLogin ? (
            <>还没有账号？<Link to="/signup" className="underline" style={{ color: 'var(--color-forest)' }}>注册一个</Link></>
          ) : (
            <>已经有账号？<Link to="/login" className="underline" style={{ color: 'var(--color-forest)' }}>登录</Link></>
          )}
        </p>
      </motion.div>
    </div>
  )
}
