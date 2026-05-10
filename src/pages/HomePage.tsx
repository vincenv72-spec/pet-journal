import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth'

export default function HomePage() {
  const { session } = useAuth()

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 装饰胶带 */}
      <div className="absolute -top-2 -left-10 w-56 h-9 bg-tape rotate-[-12deg] opacity-80"
           style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 8px, rgba(255,255,255,0.3) 8px 10px)' }} />
      <div className="absolute top-8 -right-12 w-44 h-7 rotate-[15deg] opacity-70"
           style={{ background: 'var(--color-sprout)', backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 8px, rgba(255,255,255,0.3) 8px 10px)' }} />

      {/* 导航 */}
      <nav className="flex items-center justify-between px-8 md:px-14 py-5">
        <Link to="/" className="flex items-center gap-2 text-2xl handwrite font-bold">
          <PawLogo /> 宠物手帐
        </Link>
        <div className="flex items-center gap-6 text-base">
          {session ? (
            <Link to="/dashboard" className="btn-primary !py-2 !px-5 !text-sm">进入手帐本 →</Link>
          ) : (
            <>
              <Link to="/login" className="hover:underline">登录</Link>
              <Link to="/signup" className="btn-primary !py-2 !px-5 !text-sm">免费注册</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="grid md:grid-cols-2 gap-12 items-center px-8 md:px-20 py-12 md:py-24">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-forest tracking-widest text-sm md:text-base mb-3"
            style={{ color: 'var(--color-forest)' }}
          >
            — 给毛孩子的专属记忆本 —
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl leading-tight mb-6"
          >
            把每一个 <span style={{ background: 'linear-gradient(180deg, transparent 60%, #D9A55B 60%)', padding: '0 6px' }}>温柔瞬间</span><br />
            做成手帐<span style={{ color: 'var(--color-forest)' }}>.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            className="text-lg max-w-md mb-8" style={{ color: 'var(--color-ink-soft)' }}
          >
            记录吃饭、散步、犯傻和睡相，<br />
            用文字、心情和照片，拼出属于你和它的小日子。
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
            className="flex gap-4 items-center flex-wrap"
          >
            <Link to={session ? '/dashboard' : '/signup'} className="btn-primary text-lg">
              {session ? '继续记录 →' : '开始我的手帐 →'}
            </Link>
            <span className="px-3 py-1 border-2 rounded text-sm" style={{ borderColor: 'var(--color-sprout)', color: 'var(--color-sprout)', transform: 'rotate(-2deg)', display: 'inline-block' }}>
              ★ 12,438 位铲屎官在用
            </span>
          </motion.div>
        </div>

        {/* 主视觉宠物 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          className="relative h-[420px]"
        >
          <PetIllustration />
        </motion.div>
      </section>

      {/* 三个功能 */}
      <section className="px-8 md:px-20 py-20" style={{ background: 'linear-gradient(180deg, transparent, var(--color-bg-deep) 50%, transparent)' }}>
        <h2 className="text-center text-3xl md:text-4xl mb-3">三件事，慢慢做就好</h2>
        <p className="text-center text-base mb-14" style={{ color: 'var(--color-ink-soft)' }}>不需要会画画，也能拥有最可爱的手帐本</p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.12 }}
              className="card-paper card-paper-tape hover:-translate-y-2 transition-transform"
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="text-2xl mb-2">{f.title}</h3>
              <p style={{ color: 'var(--color-ink-soft)' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 md:px-20 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="card-paper max-w-2xl mx-auto text-center !py-16 !px-10 relative overflow-hidden"
        >
          <h2 className="text-4xl md:text-5xl mb-4 leading-tight">开始你和它的<br />第一页</h2>
          <p className="mb-8" style={{ color: 'var(--color-ink-soft)' }}>注册即送 50 张限定贴纸 · 永久免费基础版</p>
          <Link to={session ? '/dashboard' : '/signup'} className="btn-primary text-lg">
            {session ? '回到手帐本 →' : '立刻领取 →'}
          </Link>
          <p className="mt-6 tracking-widest opacity-50">🐾 🐾 🐾 🐾 🐾</p>
        </motion.div>
      </section>

      <footer className="text-center py-8 text-sm" style={{ color: 'var(--color-ink-soft)' }}>
        © 2026 宠物手帐 · made with <span style={{ color: 'var(--color-rose)' }}>♡</span> for every furry friend
      </footer>
    </div>
  )
}

const features = [
  { icon: '📸', title: '拍下来', desc: '导入相册，自动按宠物分册整理。' },
  { icon: '✍️', title: '写下来', desc: '心情 emoji + 手写质感字体，三行也能成手帐。' },
  { icon: '📖', title: '留下来', desc: '每年生成回忆相册，可印成实体书。' },
]

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

function PetIllustration() {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-full" aria-hidden="true">
      <ellipse cx="200" cy="360" rx="150" ry="16" fill="#4F7942" opacity="0.12" />
      {/* 灌木 */}
      <g opacity="0.55">
        <ellipse cx="60" cy="340" rx="40" ry="20" fill="#8AAB6E" />
        <ellipse cx="340" cy="340" rx="50" ry="22" fill="#8AAB6E" />
      </g>
      {/* 蘑菇 */}
      <g transform="translate(50,300)">
        <ellipse cx="0" cy="0" rx="14" ry="9" fill="#D77B85" />
        <rect x="-4" y="-2" width="8" height="14" rx="2" fill="#FBF8EC" />
      </g>
      <g transform="translate(355,310)">
        <ellipse cx="0" cy="0" rx="11" ry="7" fill="#D9A55B" />
        <rect x="-3" y="-1" width="6" height="11" rx="2" fill="#FBF8EC" />
      </g>
      {/* 狗 */}
      <g style={{ transformOrigin: '140px 260px', animation: 'wiggleL 3s ease-in-out infinite' }}>
        <ellipse cx="140" cy="310" rx="48" ry="32" fill="#E8C9A0" />
        <ellipse cx="115" cy="335" rx="14" ry="12" fill="#D4AB7E" />
        <ellipse cx="165" cy="335" rx="14" ry="12" fill="#D4AB7E" />
        <path d="M180 305 Q200 290 198 270" stroke="#D4AB7E" strokeWidth="14" fill="none" strokeLinecap="round" />
        <circle cx="140" cy="240" r="68" fill="#F0D5A8" />
        <ellipse cx="80" cy="225" rx="22" ry="38" fill="#B8915F" transform="rotate(-15 80 225)" />
        <ellipse cx="200" cy="225" rx="22" ry="38" fill="#B8915F" transform="rotate(15 200 225)" />
        <ellipse cx="118" cy="240" rx="11" ry="13" fill="#2D3A2E" />
        <ellipse cx="162" cy="240" rx="11" ry="13" fill="#2D3A2E" />
        <circle cx="121" cy="235" r="4" fill="#fff" />
        <circle cx="165" cy="235" r="4" fill="#fff" />
        <ellipse cx="140" cy="265" rx="8" ry="6" fill="#2D3A2E" />
        <path d="M140 271 L140 280 M132 286 Q140 292 148 286" stroke="#2D3A2E" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="100" cy="265" rx="12" ry="7" fill="#E8919C" opacity="0.55" />
        <ellipse cx="180" cy="265" rx="12" ry="7" fill="#E8919C" opacity="0.55" />
      </g>
      {/* 猫 */}
      <g style={{ transformOrigin: '290px 290px', animation: 'wiggleR 4s ease-in-out infinite' }}>
        <ellipse cx="290" cy="320" rx="42" ry="28" fill="#FFE8C8" />
        <path d="M328 318 Q360 310 358 280 Q352 268 345 275" stroke="#F5D5A8" strokeWidth="14" fill="none" strokeLinecap="round" />
        <circle cx="290" cy="255" r="60" fill="#FFE8C8" />
        <path d="M242 240 L248 195 L268 232 Z" fill="#FFE8C8" />
        <path d="M338 240 L332 195 L312 232 Z" fill="#FFE8C8" />
        <path d="M250 230 L252 210 L262 228 Z" fill="#D77B85" opacity="0.65" />
        <path d="M330 230 L328 210 L318 228 Z" fill="#D77B85" opacity="0.65" />
        <ellipse cx="270" cy="255" rx="10" ry="13" fill="#2D3A2E" />
        <ellipse cx="310" cy="255" rx="10" ry="13" fill="#2D3A2E" />
        <circle cx="273" cy="250" r="4" fill="#fff" />
        <circle cx="313" cy="250" r="4" fill="#fff" />
        <path d="M286 274 L294 274 L290 280 Z" fill="#D77B85" />
        <path d="M290 280 L290 286 M283 290 Q287 293 290 290 Q293 293 297 290" stroke="#2D3A2E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <ellipse cx="255" cy="278" rx="11" ry="6" fill="#E8919C" opacity="0.55" />
        <ellipse cx="325" cy="278" rx="11" ry="6" fill="#E8919C" opacity="0.55" />
      </g>
      <text x="200" y="170" fontFamily="Caveat" fontSize="36" fill="#D77B85" textAnchor="middle">♡</text>
      <style>{`
        @keyframes wiggleL { 0%,100%{transform:rotate(0)} 50%{transform:rotate(-3deg)} }
        @keyframes wiggleR { 0%,100%{transform:rotate(0)} 50%{transform:rotate(3deg)} }
      `}</style>
    </svg>
  )
}
