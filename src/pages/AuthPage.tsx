import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import PhotoBackground from '../components/PhotoBackground'

export default function AuthPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  async function sendCode() {
    if (!email.trim()) {
      setError('请填写邮箱')
      return
    }
    setLoading(true)
    setError(null)
    setInfo(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: true },
      })
      if (error) throw error
      setStep('otp')
      setInfo('验证码已发送到你的邮箱（也可以直接点邮件里的登录链接）')
      // Cooldown
      setResendCooldown(60)
      const timer = setInterval(() => {
        setResendCooldown((s) => {
          if (s <= 1) { clearInterval(timer); return 0 }
          return s - 1
        })
      }, 1000)
    } catch (err: any) {
      setError(err.message ?? '发送失败')
    } finally {
      setLoading(false)
    }
  }

  async function verifyCode() {
    if (!otp.trim() || otp.length < 6) {
      setError('请输入 6 位验证码')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp.trim(),
        type: 'email',
      })
      if (error) throw error
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message ?? '验证失败，可能验证码不对或过期')
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

        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.div key="email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h1 className="text-4xl mt-3 mb-2">欢迎回来 🌿</h1>
              <p className="mb-8" style={{ color: 'var(--color-ink-soft)' }}>
                输入邮箱，我们会发个验证码给你
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm">邮箱</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="input" placeholder="you@example.com"
                    onKeyDown={(e) => e.key === 'Enter' && sendCode()}
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm" style={{ color: 'var(--color-rose)' }}>{error}</p>}
                <button onClick={sendCode} disabled={loading} className="btn-primary w-full justify-center">
                  {loading ? '发送中...' : '发送验证码'}
                </button>
                <p className="text-xs text-center" style={{ color: 'var(--color-ink-soft)' }}>
                  没有账号也没关系，我们会自动给你创建一个
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="text-4xl mt-3 mb-2">查收邮件 ✉️</h1>
              <p className="mb-2" style={{ color: 'var(--color-ink-soft)' }}>
                我们发了 6 位验证码到
              </p>
              <p className="mb-8 font-mono text-sm" style={{ color: 'var(--color-forest)' }}>
                {email}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm">验证码</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => e.key === 'Enter' && verifyCode()}
                    className="input text-center text-3xl tracking-[0.5em] font-mono"
                    placeholder="······"
                    autoFocus
                  />
                </div>
                {info && <p className="text-sm" style={{ color: 'var(--color-forest)' }}>{info}</p>}
                {error && <p className="text-sm" style={{ color: 'var(--color-rose)' }}>{error}</p>}

                <button onClick={verifyCode} disabled={loading || otp.length < 6} className="btn-primary w-full justify-center">
                  {loading ? '验证中...' : '登 录'}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button onClick={() => { setStep('email'); setOtp(''); setError(null); setInfo(null) }} className="underline" style={{ color: 'var(--color-ink-soft)' }}>
                    ← 换个邮箱
                  </button>
                  <button
                    onClick={sendCode}
                    disabled={resendCooldown > 0 || loading}
                    className="underline"
                    style={{ color: resendCooldown > 0 ? 'var(--color-ink-soft)' : 'var(--color-forest)' }}
                  >
                    {resendCooldown > 0 ? `${resendCooldown}s 后可重发` : '重发验证码'}
                  </button>
                </div>

                <p className="text-xs text-center mt-4" style={{ color: 'var(--color-ink-soft)' }}>
                  💡 也可以直接点邮件里的"一键登录"链接
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
