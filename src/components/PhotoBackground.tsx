import { useTheme } from '../lib/theme'

type Props = {
  photo?: 'hero' | 'login' | 'dashboard' | 'editor' | 'empty'
  intensity?: number
}

export default function PhotoBackground({ photo = 'hero', intensity = 1 }: Props) {
  const { theme } = useTheme()

  return (
    <>
      {/* Layer 1 — 主图 */}
      <div
        aria-hidden
        className="fixed inset-0 -z-50 pointer-events-none"
        style={{
          backgroundImage: `url("/bg/${photo}.jpg")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 25%',
          backgroundRepeat: 'no-repeat',
          filter: theme.imageFilter,
          opacity: intensity,
          transition: 'filter 0.6s ease',
        }}
      />

      {/* Layer 2 — 光斑（主题化） */}
      <div
        aria-hidden
        className="fixed inset-0 -z-40 pointer-events-none"
        style={{
          background: theme.bloomLayer,
          mixBlendMode: 'screen',
          transition: 'background 0.6s ease',
        }}
      />

      {/* Layer 3 — 色温叠层（主题化） */}
      <div
        aria-hidden
        className="fixed inset-0 -z-30 pointer-events-none"
        style={{
          background: theme.tintLayer,
          mixBlendMode: 'overlay',
          transition: 'background 0.6s ease',
        }}
      />

      {/* Layer 4 — 噪点纹理 */}
      <div
        aria-hidden
        className="fixed inset-0 -z-20 pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'240\' height=\'240\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'2\' stitchTiles=\'stitch\'/><feColorMatrix values=\'0 0 0 0 0.55  0 0 0 0 0.50  0 0 0 0 0.40  0 0 0 0.18 0\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\'/></svg>")',
          opacity: theme.noiseOpacity,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Layer 5 — 滚动渐隐 */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 pointer-events-none"
        style={{
          height: '220vh',
          background:
            'linear-gradient(180deg, transparent 0%, transparent 70vh, rgba(244, 240, 224, 0.50) 130vh, rgba(244, 240, 224, 0.92) 220vh)',
        }}
      />
    </>
  )
}
