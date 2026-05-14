import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth'
import PhotoBackground from '../components/PhotoBackground'

export default function HomePage() {
  const { session } = useAuth()

  return (
    <div className="min-h-screen relative">
      {/* 全页氛围底层（手绘森林插画 + 光斑 + 噪点 + 渐隐） */}
      <PhotoBackground />

      {/* 导航 */}
      <nav className="flex items-center justify-between px-6 md:px-14 py-5 relative z-20">
        <Link to="/" className="flex items-center gap-2 text-2xl handwrite font-bold">
          <PawLogo /> 宠物手帐
        </Link>
        <div className="flex items-center gap-5 text-base">
          {session ? (
            <Link to="/dashboard" className="btn-primary !py-2 !px-5 !text-sm">进入手帐本 →</Link>
          ) : (
            <Link to="/login" className="btn-primary !py-2 !px-5 !text-sm">登录 / 注册</Link>
          )}
        </div>
      </nav>

      {/* Hero —— 文字居左，右侧让插画呼吸 */}
      <section className="px-6 md:px-20 pt-12 md:pt-24 pb-40 md:pb-64 relative z-10">
        <div className="max-w-xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-sm md:text-base mb-4"
            style={{ color: 'var(--color-forest)' }}
          >
            — 给毛孩子的专属记忆本 —
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl leading-[1.15] mb-6"
            style={{ textShadow: '0 1px 0 rgba(255,255,255,0.6)' }}
          >
            把每一个 <span style={{ background: 'linear-gradient(180deg, transparent 62%, rgba(217, 165, 91, 0.55) 62%)', padding: '0 6px' }}>温柔瞬间</span><br />
            做成手帐<span style={{ color: 'var(--color-forest)' }}>.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            className="text-lg max-w-md mb-8" style={{ color: 'var(--color-ink)' }}
          >
            记录吃饭、散步、犯傻和睡相。<br />
            用文字、心情和照片，拼出属于你和它的小日子。
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
            className="flex gap-3 items-center flex-wrap"
          >
            <Link to={session ? '/dashboard' : '/login'} className="btn-primary text-base">
              {session ? '继续记录 →' : '开始我的手帐 →'}
            </Link>
            <span className="pill">★ 12,438 位铲屎官在用</span>
          </motion.div>
        </div>
      </section>

      <footer className="text-center py-8 text-sm relative z-10" style={{ color: 'var(--color-ink-soft)' }}>
        © 2026 宠物手帐 · made with <span style={{ color: 'var(--color-rose)' }}>♡</span> for every furry friend
      </footer>
    </div>
  )
}

function PawLogo() {
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
      <circle cx="10" cy="10" r="3" fill="var(--color-forest)" />
      <circle cx="22" cy="10" r="3" fill="var(--color-forest)" />
      <circle cx="6" cy="18" r="2.5" fill="var(--color-forest)" />
      <circle cx="26" cy="18" r="2.5" fill="var(--color-forest)" />
      <ellipse cx="16" cy="22" rx="7" ry="6" fill="var(--color-forest)" />
    </svg>
  )
}
