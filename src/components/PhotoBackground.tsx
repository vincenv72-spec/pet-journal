/**
 * 全页氛围底层（Apple 式 6 层堆叠）。
 * 通过 photo prop 切换不同页面的背景插画。
 */
type Props = {
  photo?: 'hero' | 'login' | 'dashboard' | 'editor' | 'empty'
  /** 0-1，主图整体强度。默认 1（满），调小让画面更"远" */
  intensity?: number
}

export default function PhotoBackground({ photo = 'hero', intensity = 1 }: Props) {
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
          filter: 'brightness(1.05) saturate(1.05)',
          opacity: intensity,
        }}
      />

      {/* Layer 2 — 光斑 bloom（调淡，让插画更亮） */}
      <div
        aria-hidden
        className="fixed inset-0 -z-40 pointer-events-none"
        style={{
          background:
            'radial-gradient(800px 600px at 75% 10%, rgba(255, 235, 200, 0.22), transparent 60%),' +
            'radial-gradient(700px 500px at 15% 25%, rgba(220, 235, 195, 0.18), transparent 65%),' +
            'radial-gradient(900px 700px at 50% 95%, rgba(252, 246, 230, 0.32), transparent 70%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Layer 3 — 奶油暖色 tint（更薄） */}
      <div
        aria-hidden
        className="fixed inset-0 -z-30 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(252, 246, 230, 0.05) 0%, rgba(244, 240, 224, 0.10) 60%, rgba(244, 240, 224, 0.20) 100%)',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Layer 4 — 噪点纹理（调淡） */}
      <div
        aria-hidden
        className="fixed inset-0 -z-20 pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'240\' height=\'240\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'2\' stitchTiles=\'stitch\'/><feColorMatrix values=\'0 0 0 0 0.55  0 0 0 0 0.50  0 0 0 0 0.40  0 0 0 0.18 0\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\'/></svg>")',
          opacity: 0.28,
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
