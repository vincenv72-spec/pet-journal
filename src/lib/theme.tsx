import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ThemeId = 'morning' | 'sunset' | 'moonlight' | 'spring'

export type Theme = {
  id: ThemeId
  name: string
  emoji: string
  description: string
  // Photo bg treatment
  imageFilter: string                              // CSS filter
  bloomLayer: string                               // Layer 2 background
  tintLayer: string                                // Layer 3 background
  noiseOpacity: number                             // Layer 4 opacity
  // Cursor trail
  trailColors: string[]                            // radial-gradient dot colors
  accents: string[]                                // emoji accents (every 4th)
  fallEmojis: string[]                             // background falling
  // Optional CSS variable overrides
  forestColor?: string                             // primary accent
  honeyColor?: string                              // secondary accent
}

export const THEMES: Record<ThemeId, Theme> = {
  morning: {
    id: 'morning',
    name: '晨光森林',
    emoji: '🌿',
    description: '自然清晨的森林氛围，治愈系',
    imageFilter: 'brightness(1.05) saturate(1.05)',
    bloomLayer:
      'radial-gradient(800px 600px at 75% 10%, rgba(255, 235, 200, 0.40), transparent 60%),' +
      'radial-gradient(700px 500px at 15% 25%, rgba(220, 235, 195, 0.30), transparent 65%),' +
      'radial-gradient(900px 700px at 50% 95%, rgba(252, 246, 230, 0.50), transparent 70%)',
    tintLayer:
      'linear-gradient(180deg, rgba(252, 246, 230, 0.10) 0%, rgba(244, 240, 224, 0.20) 60%, rgba(244, 240, 224, 0.30) 100%)',
    noiseOpacity: 0.28,
    trailColors: [
      'rgba(79, 121, 66, 0.95)',
      'rgba(107, 142, 78, 0.90)',
      'rgba(138, 171, 110, 0.85)',
      'rgba(217, 165, 91, 0.90)',
      'rgba(232, 197, 142, 0.85)',
      'rgba(215, 123, 133, 0.85)',
    ],
    accents: ['🐾', '🐾', '🍃', '🌿', '✿', '🐾'],
    fallEmojis: ['🍃', '🍂', '🌿', '✿'],
  },

  sunset: {
    id: 'sunset',
    name: '黄昏森林',
    emoji: '🌅',
    description: '黄金时刻的暖光晕染',
    imageFilter: 'brightness(1.03) saturate(1.10) sepia(0.20) hue-rotate(-12deg)',
    bloomLayer:
      'radial-gradient(900px 700px at 75% 10%, rgba(255, 180, 120, 0.55), transparent 60%),' +
      'radial-gradient(700px 500px at 15% 30%, rgba(255, 145, 100, 0.35), transparent 65%),' +
      'radial-gradient(800px 600px at 50% 95%, rgba(255, 220, 180, 0.45), transparent 70%)',
    tintLayer:
      'linear-gradient(180deg, rgba(255, 200, 150, 0.20) 0%, rgba(255, 180, 130, 0.20) 60%, rgba(255, 200, 150, 0.30) 100%)',
    noiseOpacity: 0.24,
    trailColors: [
      'rgba(232, 118, 94, 0.95)',
      'rgba(217, 165, 91, 0.90)',
      'rgba(232, 197, 142, 0.90)',
      'rgba(215, 123, 133, 0.90)',
      'rgba(184, 145, 95, 0.90)',
      'rgba(255, 200, 150, 0.85)',
    ],
    accents: ['🐾', '🍂', '🐾', '🌾', '✦', '🐾'],
    fallEmojis: ['🍂', '🍃', '🌾', '✨'],
    honeyColor: '#E8765E',
  },

  moonlight: {
    id: 'moonlight',
    name: '月夜森林',
    emoji: '🌙',
    description: '月光下的森林，安静深邃',
    imageFilter: 'brightness(0.55) saturate(0.65) hue-rotate(180deg) contrast(1.10)',
    bloomLayer:
      'radial-gradient(900px 700px at 75% 10%, rgba(180, 200, 240, 0.40), transparent 60%),' +
      'radial-gradient(700px 500px at 15% 25%, rgba(140, 170, 220, 0.30), transparent 65%),' +
      'radial-gradient(600px 600px at 50% 100%, rgba(255, 255, 220, 0.25), transparent 70%)',
    tintLayer:
      'linear-gradient(180deg, rgba(40, 50, 80, 0.45) 0%, rgba(30, 40, 70, 0.55) 60%, rgba(20, 30, 50, 0.65) 100%)',
    noiseOpacity: 0.22,
    trailColors: [
      'rgba(255, 230, 100, 1)',                 // 萤火虫黄
      'rgba(180, 220, 255, 0.95)',              // 月光蓝
      'rgba(255, 200, 100, 1)',                 // 暖萤
      'rgba(220, 240, 255, 0.85)',              // 星光白
      'rgba(150, 180, 230, 0.90)',
      'rgba(255, 240, 180, 1)',
    ],
    accents: ['✨', '⭐', '🌙', '🌟', '·', '✨'],
    fallEmojis: ['✨', '⭐', '·'],
    forestColor: '#8AB4D0',
    honeyColor: '#FFE894',
  },

  spring: {
    id: 'spring',
    name: '春日花海',
    emoji: '🌸',
    description: '樱花飘落的春天森林',
    imageFilter: 'brightness(1.10) saturate(0.85) hue-rotate(15deg)',
    bloomLayer:
      'radial-gradient(900px 700px at 75% 10%, rgba(255, 200, 220, 0.50), transparent 60%),' +
      'radial-gradient(700px 500px at 15% 25%, rgba(255, 180, 210, 0.40), transparent 65%),' +
      'radial-gradient(800px 600px at 50% 95%, rgba(255, 220, 230, 0.45), transparent 70%)',
    tintLayer:
      'linear-gradient(180deg, rgba(255, 220, 235, 0.25) 0%, rgba(255, 200, 225, 0.20) 60%, rgba(255, 220, 235, 0.30) 100%)',
    noiseOpacity: 0.20,
    trailColors: [
      'rgba(255, 180, 200, 0.95)',
      'rgba(255, 200, 220, 0.90)',
      'rgba(215, 123, 153, 0.90)',
      'rgba(255, 220, 230, 0.85)',
      'rgba(255, 160, 190, 0.95)',
      'rgba(245, 180, 200, 0.85)',
    ],
    accents: ['🌸', '🌸', '🌷', '🐾', '🌺', '🌸'],
    fallEmojis: ['🌸', '🌷', '✿'],
    honeyColor: '#D77B85',
  },
}

const STORAGE_KEY = 'pet-journal:theme'

type ThemeContextType = {
  themeId: ThemeId
  theme: Theme
  setThemeId: (id: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextType>({
  themeId: 'morning',
  theme: THEMES.morning,
  setThemeId: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    return (saved as ThemeId) || 'morning'
  })

  const theme = THEMES[themeId] ?? THEMES.morning

  function setThemeId(id: ThemeId) {
    setThemeIdState(id)
    try { localStorage.setItem(STORAGE_KEY, id) } catch { /* ignore */ }
  }

  // 应用主题颜色覆盖到 :root
  useEffect(() => {
    const root = document.documentElement
    if (theme.forestColor) root.style.setProperty('--theme-forest', theme.forestColor)
    else root.style.removeProperty('--theme-forest')
    if (theme.honeyColor) root.style.setProperty('--theme-honey', theme.honeyColor)
    else root.style.removeProperty('--theme-honey')
  }, [theme])

  return <ThemeContext.Provider value={{ themeId, theme, setThemeId }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
