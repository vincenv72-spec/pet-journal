import { useEffect } from 'react'

// 森林系水彩调色板：苔绿、嫩芽、蜂蜜、奶油、玫瑰
const dotColors = [
  'rgba(107, 142, 78, 0.55)',   // 森林苔绿
  'rgba(138, 171, 110, 0.55)',  // 嫩芽
  'rgba(217, 165, 91, 0.55)',   // 蜂蜜金
  'rgba(232, 197, 142, 0.55)',  // 浅蜂蜜
  'rgba(215, 123, 133, 0.45)',  // 玫瑰
  'rgba(255, 251, 235, 0.65)',  // 奶油白
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
      const size = 6 + Math.random() * 10
      const color = dotColors[Math.floor(Math.random() * dotColors.length)]

      const dot = document.createElement('div')
      dot.style.cssText = `
        position: fixed;
        left: ${x - size / 2}px;
        top: ${y - size / 2}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: radial-gradient(circle, ${color} 0%, transparent 75%);
        pointer-events: none;
        z-index: 9999;
        opacity: 0.85;
        transition: opacity 1.4s ease-out, transform 1.4s cubic-bezier(0.2, 0.7, 0.2, 1);
        will-change: transform, opacity;
      `
      document.body.appendChild(dot)

      requestAnimationFrame(() => {
        dot.style.opacity = '0'
        const dx = (Math.random() - 0.5) * 50
        const dy = -28 - Math.random() * 32
        dot.style.transform = `translate(${dx}px, ${dy}px) scale(0.4)`
      })

      setTimeout(() => dot.remove(), 1400)
    }

    function spawnAccent(x: number, y: number) {
      const el = document.createElement('span')
      el.textContent = accents[Math.floor(Math.random() * accents.length)]
      const colorIdx = Math.floor(Math.random() * 3) // 只取前 3 种深色
      el.style.cssText = `
        position: fixed;
        left: ${x - 8}px;
        top: ${y - 8}px;
        font-size: 12px;
        color: ${dotColors[colorIdx].replace('0.55', '0.7').replace('0.45', '0.65')};
        pointer-events: none;
        user-select: none;
        z-index: 9999;
        opacity: 0.85;
        transition: opacity 1.6s ease-out, transform 1.6s cubic-bezier(0.2, 0.7, 0.2, 1);
        transform: rotate(${(Math.random() - 0.5) * 30}deg);
        will-change: transform, opacity;
      `
      document.body.appendChild(el)

      requestAnimationFrame(() => {
        el.style.opacity = '0'
        const dx = (Math.random() - 0.5) * 60
        const dy = -36 - Math.random() * 28
        el.style.transform += ` translate(${dx}px, ${dy}px) scale(0.6)`
      })

      setTimeout(() => el.remove(), 1600)
    }

    function onMove(e: MouseEvent) {
      const now = Date.now()
      if (now - lastSpawn < 60) return
      lastSpawn = now
      count++

      if (count % 7 === 0) {
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
