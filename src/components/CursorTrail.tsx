import { useEffect } from 'react'

const trailEmojis = ['🐾', '🍃', '🌿', '🐾', '🍂']
const trailColors = ['#4F7942', '#8AAB6E', '#D9A55B', '#D77B85']
const fallEmojis = ['🍃', '🍂', '🌿']

/**
 * 鼠标拖尾 + 持续飘落的树叶。
 * 用 vanilla DOM 操作，避免每帧重渲染 React 树。
 */
export default function CursorTrail() {
  useEffect(() => {
    let lastSpawn = 0

    function onMove(e: MouseEvent) {
      const now = Date.now()
      if (now - lastSpawn < 130) return
      lastSpawn = now

      const el = document.createElement('span')
      el.textContent = trailEmojis[Math.floor(Math.random() * trailEmojis.length)]
      el.style.cssText = `
        position: fixed;
        left: ${e.clientX - 10}px;
        top: ${e.clientY - 10}px;
        font-size: 18px;
        pointer-events: none;
        user-select: none;
        z-index: 9999;
        opacity: 0.75;
        transition: opacity 1.2s ease, transform 1.2s ease;
        color: ${trailColors[Math.floor(Math.random() * trailColors.length)]};
        transform: rotate(${(Math.random() - 0.5) * 80}deg);
      `
      document.body.appendChild(el)
      requestAnimationFrame(() => {
        el.style.opacity = '0'
        el.style.transform += ' translateY(-24px)'
      })
      setTimeout(() => el.remove(), 1200)
    }

    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    function spawnLeaf() {
      const leaf = document.createElement('span')
      leaf.textContent = fallEmojis[Math.floor(Math.random() * fallEmojis.length)]
      leaf.style.cssText = `
        position: fixed;
        top: -40px;
        left: ${Math.random() * 100}vw;
        font-size: ${16 + Math.random() * 14}px;
        pointer-events: none;
        user-select: none;
        z-index: 4;
        opacity: ${(0.4 + Math.random() * 0.4).toFixed(2)};
        animation: leaf-down ${(8 + Math.random() * 8).toFixed(1)}s linear forwards;
      `
      document.body.appendChild(leaf)
      setTimeout(() => leaf.remove(), 16000)
    }

    // 注入 keyframes（只注入一次）
    if (!document.getElementById('leaf-fall-keyframes')) {
      const style = document.createElement('style')
      style.id = 'leaf-fall-keyframes'
      style.textContent = `
        @keyframes leaf-down {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.7; }
          100% { transform: translateY(110vh) rotate(720deg) translateX(120px); opacity: 0; }
        }
      `
      document.head.appendChild(style)
    }

    // 初始放几片，然后每 2.5 秒一片
    for (let i = 0; i < 3; i++) setTimeout(spawnLeaf, i * 800)
    const interval = setInterval(spawnLeaf, 2500)
    return () => clearInterval(interval)
  }, [])

  return null
}
