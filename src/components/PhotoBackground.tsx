/**
 * 全页氛围底层（Apple 式 6 层堆叠）
 *  Layer 1 主图（手绘水彩插画）
 *  Layer 2 光斑 bloom（mix-blend-mode: screen）
 *  Layer 3 暖色 tint（mix-blend-mode: overlay）
 *  Layer 4 噪点纹理（高级感关键）
 *  Layer 5 滚动渐隐 mask
 *  内容由父组件渲染在 children 区域
 */
export default function PhotoBackground() {
  return (
    <>
      {/* Layer 1 — 主图 */}
      <div
        aria-hidden
        className="fixed inset-0 -z-50 pointer-events-none"
        style={{
          backgroundImage: 'url("/bg/hero.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          backgroundRepeat: 'no-repeat',
          // 插画本身已经是手绘风，几乎不调整，只稍微提亮一点
          filter: 'brightness(1.04) saturate(1.02)',
        }}
      />

      {/* Layer 2 — 光斑 bloom */}
      <div
        aria-hidden
        className="fixed inset-0 -z-40 pointer-events-none"
        style={{
          background:
            'radial-gradient(800px 600px at 75% 10%, rgba(255, 235, 200, 0.40), transparent 60%),' +
            'radial-gradient(700px 500px at 15% 25%, rgba(220, 235, 195, 0.30), transparent 65%),' +
            'radial-gradient(900px 700px at 50% 95%, rgba(252, 246, 230, 0.50), transparent 70%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Layer 3 — 奶油暖色 tint */}
      <div
        aria-hidden
        className="fixed inset-0 -z-30 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(252, 246, 230, 0.10) 0%, rgba(244, 240, 224, 0.18) 60%, rgba(244, 240, 224, 0.30) 100%)',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Layer 4 — 噪点纹理（SVG turbulence） */}
      <div
        aria-hidden
        className="fixed inset-0 -z-20 pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'240\' height=\'240\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'2\' stitchTiles=\'stitch\'/><feColorMatrix values=\'0 0 0 0 0.55  0 0 0 0 0.50  0 0 0 0 0.40  0 0 0 0.20 0\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\'/></svg>")',
          opacity: 0.45,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Layer 5 — 滚动渐隐：滚到第二屏底图开始变浅 */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 pointer-events-none"
        style={{
          height: '220vh',
          background:
            'linear-gradient(180deg, transparent 0%, transparent 60vh, rgba(244, 240, 224, 0.55) 130vh, rgba(244, 240, 224, 0.92) 220vh)',
        }}
      />
    </>
  )
}
