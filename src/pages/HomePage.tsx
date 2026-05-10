import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth'

export default function HomePage() {
  const { session } = useAuth()

  return (
    <div className="min-h-screen relative">
      {/* 顶部柔光暖区（晨光照在 hero 上的感觉） */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[720px] -z-10"
        style={{
          background:
            'radial-gradient(700px 420px at 50% -10%, rgba(255, 210, 165, 0.55), transparent 70%),' +
            'radial-gradient(500px 320px at 20% 10%, rgba(232, 197, 142, 0.40), transparent 70%),' +
            'radial-gradient(550px 340px at 80% 12%, rgba(220, 235, 195, 0.35), transparent 70%)',
        }}
      />

      {/* 导航 */}
      <nav className="flex items-center justify-between px-6 md:px-14 py-5 relative z-20">
        <Link to="/" className="flex items-center gap-2 text-2xl handwrite font-bold">
          <PawLogo /> 宠物手帐
        </Link>
        <div className="flex items-center gap-5 text-base">
          {session ? (
            <Link to="/dashboard" className="btn-primary !py-2 !px-5 !text-sm">进入手帐本 →</Link>
          ) : (
            <>
              <Link to="/login" className="hover:opacity-70 transition-opacity">登录</Link>
              <Link to="/signup" className="btn-primary !py-2 !px-5 !text-sm">免费注册</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero —— 文字 + 主视觉宠物 */}
      <section className="grid md:grid-cols-2 gap-10 items-center px-6 md:px-20 pt-8 md:pt-14 pb-32 md:pb-40 relative z-10">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="tracking-widest text-sm md:text-base mb-4 uppercase"
            style={{ color: 'var(--color-honey)', letterSpacing: '0.2em' }}
          >
            Daily Care · Pet Notes
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl leading-[1.15] mb-6"
          >
            把每一个 <span style={{ background: 'linear-gradient(180deg, transparent 62%, rgba(232, 197, 142, 0.7) 62%)', padding: '0 6px' }}>温柔瞬间</span><br />
            做成手帐<span style={{ color: 'var(--color-honey)' }}>.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            className="text-lg max-w-md mb-8" style={{ color: 'var(--color-ink-soft)' }}
          >
            记录吃饭、散步、犯傻和睡相。<br />
            用文字、心情和照片，拼出属于你和它的小日子。
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
            className="flex gap-3 items-center flex-wrap"
          >
            <Link to={session ? '/dashboard' : '/signup'} className="btn-primary text-base">
              {session ? '继续记录 →' : '开始我的手帐 →'}
            </Link>
            <span className="pill">★ 12,438 位铲屎官在用</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          className="relative h-[380px] md:h-[440px]"
        >
          <PetIllustration />
        </motion.div>
      </section>

      {/* 三个功能 —— 卡片向上叠在 Hero 之下，制造层次 */}
      <section className="px-6 md:px-20 -mt-24 md:-mt-32 pb-24 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl mb-3">三件事，慢慢做就好</h2>
          <p className="text-base" style={{ color: 'var(--color-ink-soft)' }}>不需要会画画，也能拥有最可爱的手帐本</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.10 }}
              className="card-paper hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-2xl mb-2">{f.title}</h3>
              <p style={{ color: 'var(--color-ink-soft)' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-20 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="card-paper max-w-2xl mx-auto text-center !py-14 !px-10"
        >
          <p className="text-sm mb-3 uppercase tracking-widest" style={{ color: 'var(--color-honey)', letterSpacing: '0.2em' }}>Start Today</p>
          <h2 className="text-4xl md:text-5xl mb-4 leading-tight">开始你和它的<br />第一页</h2>
          <p className="mb-8" style={{ color: 'var(--color-ink-soft)' }}>注册即送 50 张限定贴纸 · 永久免费基础版</p>
          <Link to={session ? '/dashboard' : '/signup'} className="btn-primary text-base">
            {session ? '回到手帐本 →' : '立刻领取 →'}
          </Link>
          <p className="mt-6 tracking-[0.4em] opacity-40 text-sm">🐾 🐾 🐾 🐾 🐾</p>
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
