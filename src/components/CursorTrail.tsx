import { useEffect, useRef } from 'react'
import { useTheme } from '../lib/theme'

/**
 * 主题化的水彩光点拖尾 + 持续飘落的小元素。
 * 每个主题有自己的颜色和符号。
 */
export default function CursorTrail() {
  const { theme } = useTheme()
  // 用 ref 让 effect 内闭包能拿到最新主题（避免每次主题变化都重启监听）
  const themeRef = useRef(theme)
  useEffect(() => { themeRef.current = theme }, [theme])

  useEffect(() => {
    let lastSpawn = 0
    let count = 0

    function spawnDot(x: number, y: number) {
      const t = themeRef.current
      const size = 10 + Math.random() * 14
      const color = t.trailColors[Math.floor(Math.random() * t.trailColors.length)]

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
      const t = themeRef.current
      const el = document.createElement('span')
      el.textContent = t.accents[Math.floor(Math.random() * t.accents.length)]
      const colorIdx = Math.floor(Math.random() * 3)
      el.style.cssText = `
        position: fixed;
        left: ${x - 9}px;
        top: ${y - 9}px;
        font-size: 18px;
        color: ${t.trailColors[colorIdx].replace(/0\.\d+/, '1')};
        pointer-events: none;
        user-select: none;
        z-index: 9999;
        opacity: 1;
        transition: opacity 1s ease-out, transform 1s cubic-bezier(0.2, 0.7, 0.2, 1);
        transform: rotate(${(Math.random() - 0.5) * 60}deg);
        will-change: transform, opacity;
      `
      document.body.appendChild(el)
      requestAnimationFrame(() => {
        el.style.opacity = '0'
        const dx = (Math.random() - 0.5) * 40
        const dy = -24 - Math.random() * 22
        el.style.transform += ` translate(${dx}px, ${dy}px) scale(0.7)`
      })
      setTimeout(() => el.remove(), 1000)
    }

    function onMove(e: MouseEvent) {
      const now = Date.now()
      if (now - lastSpawn < 35) return
      lastSpawn = now
      count++
      if (count % 4 === 0) {
        spawnAccent(e.clientX, e.clientY)
      } else {
        spawnDot(e.clientX, e.clientY)
      }
    }

    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  // 持续飘落
  useEffect(() => {
    function spawnLeaf() {
      const t = themeRef.current
      const leaf = document.createElement('span')
      leaf.textContent = t.fallEmojis[Math.floor(Math.random() * t.fallEmojis.length)]
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
