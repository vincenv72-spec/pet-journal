import { Link, useLocation } from 'react-router-dom'

/** 手机端底部导航 — md 断点以下显示 */
export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40"
      style={{
        background: 'rgba(251, 246, 232, 0.85)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 -8px 24px -8px rgba(120, 90, 60, 0.10)',
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }}
    >
      <div className="grid grid-cols-3 items-end h-16 relative">
        <NavItem to="/dashboard" icon="📝" label="手帐" active={pathname === '/dashboard'} />

        {/* 中央悬浮 + 按钮 */}
        <div className="flex justify-center relative">
          <Link
            to="/editor/new"
            className="absolute -top-7 w-14 h-14 rounded-full flex items-center justify-center text-2xl text-white"
            style={{
              background: 'linear-gradient(180deg, #5A8A4D 0%, #4F7942 100%)',
              boxShadow: '0 6px 16px rgba(47, 82, 51, 0.35), 0 1px 0 rgba(255,255,255,0.3) inset',
              border: '2px solid rgba(255,255,255,0.6)',
            }}
            aria-label="写新一篇"
          >
            ＋
          </Link>
        </div>

        <NavItem to="/pets" icon="🐾" label="毛孩子" active={pathname.startsWith('/pets')} />
      </div>
    </nav>
  )
}

function NavItem({ to, icon, label, active }: { to: string; icon: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center h-full transition"
      style={{
        color: active ? 'var(--color-forest)' : 'var(--color-ink-soft)',
      }}
    >
      <span className="text-xl mb-0.5">{icon}</span>
      <span className="text-[10px] font-bold">{label}</span>
    </Link>
  )
}
