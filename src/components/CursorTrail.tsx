import { useEffect } from 'react'

// 森林系水彩调色板：苔绿、嫩芽、蜂蜜、奶油、玫瑰（提高 alpha 让一划而过更显眼）
const dotColors = [
  'rgba(79, 121, 66, 0.95)',    // 森林深绿
  'rgba(107, 142, 78, 0.90)',   // 苔绿
  'rgba(138, 171, 110, 0.85)',  // 嫩芽
  'rgba(217, 165, 91, 0.90)',   // 蜂蜜金
  'rgba(232, 197, 142, 0.85)',  // 浅蜂蜜
  'rgba(215, 123, 133, 0.85)',  // 玫瑰
]

// 每 7 个粒子穿插一个小元素当点缀
const accents = ['🍃', '✿', '🌿', '·']

/**
 * 水彩光点拖尾 + 偶尔飘落的小叶。
 * 设计原则：
 * - 用径向渐变的圆点而非 emoji，更像水彩晕染
 * - 颜色从森林系调色板抽取
 * - 上飘 + 微小水平漂移，模拟空气中的尘埃光
 * - 每 7 个粒子穿插一个小叶/星号，避免单调
 */
export default function CursorTrail() {
  useEffect(() => {
    let lastSpawn = 0
    let count = 0

    function spawnDot(x: number, y: number) {
      const size = 10 + Math.random() * 14   // 更大：10-24px
      const color = dotColors[Math.floor(Math.random() * dotColors.length)]

      const dot = document.createElement('div')
      dot.style.cssText = `
        position: fixed;
        left: ${x - size / 2}px;
        top: ${y - size / 2}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: radial-gradient(circle, ${color} 0%, transparent 65%);
        pointer-events: none;
        z-index: 9999;
        opacity: 1;
        transition: opacity 0.7s ease-out, transform 0.7s cubic-bezier(0.2, 0.7, 0.2, 1);
        will-change: transform, opacity;
      `
      document.body.appendChild(dot)

      requestAnimationFrame(() => {
        dot.style.opacity = '0'
        const dx = (Math.random() - 0.5) * 30
        const dy = -16 - Math.random() * 18
        dot.style.transform = `translate(${dx}px, ${dy}px) scale(0.5)`
      })

      setTimeout(() => dot.remove(), 700)
    }

    function spawnAccent(x: number, y: number) {
      const el = document.createElement('span')
      el.textContent = accents[Math.floor(Math.random() * accents.length)]
      const colorIdx = Math.floor(Math.random() * 3)
      el.style.cssText = `
        position: fixed;
        left: ${x - 8}px;
        top: ${y - 8}px;
        font-size: 16px;
        color: ${dotColors[colorIdx].replace(/0\.\d+/, '1')};
        pointer-events: none;
        user-select: none;
        z-index: 9999;
        opacity: 1;
        transition: opacity 0.9s ease-out, transform 0.9s cubic-bezier(0.2, 0.7, 0.2, 1);
        transform: rotate(${(Math.random() - 0.5) * 30}deg);
        will-change: transform, opacity;
      `
      document.body.appendChild(el)

      requestAnimationFrame(() => {
        el.style.opacity = '0'
        const dx = (Math.random() - 0.5) * 30
        const dy = -22 - Math.random() * 18
        el.style.transform += ` translate(${dx}px, ${dy}px) scale(0.7)`
      })

      setTimeout(() => el.remove(), 900)
    }

    function onMove(e: MouseEvent) {
      const now = Date.now()
      if (now - lastSpawn < 35) return  // 更密：35ms 一个
      lastSpawn = now
      count++

      if (count % 9 === 0) {
        spawnAccent(e.clientX, e.clientY)
      } else {
        spawnDot(e.clientX, e.clientY)
      }
    }

    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  // —— 持续飘落的小叶（背景氛围） ——
  useEffect(() => {
    const fallEmojis = ['🍃', '🍂', '🌿', '✿']

    function spawnLeaf() {
      const leaf = document.createElement('span')
      leaf.textContent = fallEmojis[Math.floor(Math.random() * fallEmojis.length)]
      leaf.style.cssText = `
        position: fixed;
        top: -40px;
        left: ${Math.random() * 100}vw;
        font-size: ${14 + Math.random() * 12}px;
        pointer-events: none;
        user-select: none;
        z-index: 4;
        opacity: ${(0.30 + Math.random() * 0.30).toFixed(2)};
        animation: leaf-down ${(10 + Math.random() * 10).toFixed(1)}s linear forwards;
      `
      document.body.appendChild(leaf)
      setTimeout(() => leaf.remove(), 22000)
    }

    if (!document.getElementById('leaf-fall-keyframes')) {
      const style = document.createElement('style')
      style.id = 'leaf-fall-keyframes'
      style.textContent = `
        @keyframes leaf-down {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.55; }
          100% { transform: translateY(110vh) rotate(720deg) translateX(120px); opacity: 0; }
        }
      `
      document.head.appendChild(style)
    }

    for (let i = 0; i < 2; i++) setTimeout(spawnLeaf, i * 1200)
    const interval = setInterval(spawnLeaf, 3500)
    return () => clearInterval(interval)
  }, [])

  return null
}
