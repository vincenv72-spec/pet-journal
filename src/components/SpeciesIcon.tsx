import { type Species } from '../lib/supabase'

interface Props {
  species: Species
  size?: number
  className?: string
}

// 手绘卡通风种类图标 —— 线性 stroke 1.5 + 关键点小圆点（眼/鼻），跟落叶/月亮/羽毛同一语言
// 默认主题色 currentColor（继承父级 color）
export default function SpeciesIcon({ species, size = 24, className = '' }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    className,
  }

  switch (species) {
    case 'cat':
      return (
        <svg {...common}>
          {/* 头部 + 两个三角耳朵 */}
          <path d="M9 8l2 3c1.2-1 3-1.5 5-1.5s3.8 0.5 5 1.5l2-3v8.5c0 4.5-3.5 7.5-7 7.5s-7-3-7-7.5z" />
          {/* 眼睛 */}
          <circle cx="13" cy="16" r="0.9" fill="currentColor" />
          <circle cx="19" cy="16" r="0.9" fill="currentColor" />
          {/* 小鼻嘴 */}
          <path d="M15.3 19l0.7 0.7 0.7-0.7" />
          {/* 胡须 */}
          <path d="M7 18.5h2.5" />
          <path d="M22.5 18.5h2.5" />
        </svg>
      )
    case 'dog':
      return (
        <svg {...common}>
          {/* 长垂耳 */}
          <path d="M9 11c-1.5 0-2.5 2-2.5 4.5s1 4.5 2.5 4.5" />
          <path d="M23 11c1.5 0 2.5 2 2.5 4.5s-1 4.5-2.5 4.5" />
          {/* 头部圆形 */}
          <path d="M9 11c0-3 2.5-5 7-5s7 2 7 5v8c0 2.5-3 4.5-7 4.5s-7-2-7-4.5z" />
          {/* 眼睛 */}
          <circle cx="13" cy="15" r="0.9" fill="currentColor" />
          <circle cx="19" cy="15" r="0.9" fill="currentColor" />
          {/* 鼻子 */}
          <ellipse cx="16" cy="18.5" rx="1.4" ry="1" fill="currentColor" />
          {/* 嘴 */}
          <path d="M16 19.5v1.5" />
        </svg>
      )
    case 'rabbit':
      return (
        <svg {...common}>
          {/* 长耳朵 */}
          <ellipse cx="12.5" cy="8.5" rx="1.5" ry="5" />
          <ellipse cx="19.5" cy="8.5" rx="1.5" ry="5" />
          {/* 头部圆形 */}
          <circle cx="16" cy="19" r="6.5" />
          {/* 眼睛 */}
          <circle cx="13.5" cy="18" r="0.8" fill="currentColor" />
          <circle cx="18.5" cy="18" r="0.8" fill="currentColor" />
          {/* 鼻子 */}
          <path d="M15.3 20.5l0.7 0.5 0.7-0.5" />
        </svg>
      )
    case 'bird':
      return (
        <svg {...common}>
          {/* 圆身 */}
          <circle cx="13" cy="16" r="6.5" />
          {/* 喙 */}
          <path d="M19 15.5l4 1-4 1z" fill="currentColor" />
          {/* 眼睛 */}
          <circle cx="11" cy="14" r="0.9" fill="currentColor" />
          {/* 翅膀曲线 */}
          <path d="M10 19c2 1 4 1 6-1" />
          {/* 小冠羽 */}
          <path d="M12 9l-1-2M14 9l0.5-2" />
        </svg>
      )
    case 'hamster':
      return (
        <svg {...common}>
          {/* 圆胖身体 */}
          <ellipse cx="16" cy="18" rx="8" ry="6.5" />
          {/* 两个小圆耳 */}
          <circle cx="10.5" cy="12.5" r="2" />
          <circle cx="21.5" cy="12.5" r="2" />
          {/* 眼睛 */}
          <circle cx="13" cy="17" r="0.9" fill="currentColor" />
          <circle cx="19" cy="17" r="0.9" fill="currentColor" />
          {/* 鼻 */}
          <circle cx="16" cy="19.5" r="0.7" fill="currentColor" />
          {/* 嘴 */}
          <path d="M16 20.2l-1 1M16 20.2l1 1" />
        </svg>
      )
    case 'fish':
      return (
        <svg {...common}>
          {/* 鱼身 */}
          <path d="M5 16c0-4 4-7 9-7s9 3 9 7-4 7-9 7-9-3-9-7z" />
          {/* 鱼尾 */}
          <path d="M23 16l5-4v8z" />
          {/* 眼睛 */}
          <circle cx="10" cy="14.5" r="0.9" fill="currentColor" />
          {/* 鳃 */}
          <path d="M18 13c-0.6 1.5-0.6 4.5 0 6" />
          {/* 嘴 */}
          <path d="M5 16l-2 1l2 1" />
        </svg>
      )
    case 'other':
    default:
      return (
        <svg {...common}>
          {/* 4 个脚趾 + 1 个脚掌 */}
          <ellipse cx="9" cy="11" rx="1.6" ry="2.2" />
          <ellipse cx="14" cy="8" rx="1.6" ry="2.2" />
          <ellipse cx="20" cy="8" rx="1.6" ry="2.2" />
          <ellipse cx="25" cy="11" rx="1.6" ry="2.2" />
          <ellipse cx="17" cy="20" rx="6" ry="5" />
        </svg>
      )
  }
}
