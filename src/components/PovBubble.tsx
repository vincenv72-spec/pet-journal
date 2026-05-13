import { type Entry, type Pet, getPovStyleMeta } from '../lib/supabase'

type Variant = 'compact' | 'full'

interface Props {
  entry: Pick<Entry, 'pet_pov_text' | 'pet_pov_style'>
  petName: string | null
  pet?: Pet | null
  variant?: Variant
}

// 搭话气泡 —— 左侧：上传了头像就显示真实头像+性格角标；没上传就只显示一个性格 emoji 圈（不用物种 emoji 兜底）
export default function PovBubble({ entry, petName, pet, variant = 'full' }: Props) {
  if (!entry.pet_pov_text) return null
  const meta = getPovStyleMeta(entry.pet_pov_style)
  const styleEmoji = meta?.emoji ?? '✨'
  const speaker = petName || pet?.name || '它'
  const avatarUrl = pet?.avatar_url ?? null

  const bubbleBg = 'rgba(232, 236, 228, 0.55)'
  const bubbleBorder = 'rgba(90, 124, 94, 0.22)'

  return (
    <div className="flex gap-2.5 items-start">
      {/* 左侧：上传头像 → 头像+性格角标；没头像 → 只显性格 emoji 圈 */}
      {avatarUrl ? (
        <div className="relative shrink-0 mt-1">
          <div
            className="w-10 h-10 rounded-full overflow-hidden"
            style={{
              background: 'rgba(255, 232, 200, 0.7)',
              border: '1.5px solid rgba(255,255,255,0.7)',
            }}
          >
            <img src={avatarUrl} className="w-full h-full rounded-full object-cover" alt="" />
          </div>
          <span
            className="absolute -right-1 -bottom-1 w-5 h-5 rounded-full flex items-center justify-center text-[11px]"
            style={{
              background: 'white',
              border: '1px solid rgba(122, 106, 92, 0.22)',
              boxShadow: '0 1px 2px rgba(120, 90, 60, 0.10)',
            }}
            aria-label={meta?.label}
          >
            {styleEmoji}
          </span>
        </div>
      ) : (
        <div
          className="shrink-0 mt-1 w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{
            background: 'rgba(232, 236, 228, 0.65)',
            border: '1.5px solid rgba(90, 124, 94, 0.25)',
          }}
          aria-label={meta?.label}
          title={meta?.label}
        >
          {styleEmoji}
        </div>
      )}

      {/* 右侧：对话气泡（带左侧尾巴指向头像） */}
      <div className="relative flex-1 min-w-0">
        {/* 尾巴 —— 旋转 45° 的小方块，左侧露出一角 */}
        <div
          aria-hidden
          className="absolute -left-1.5 top-3 w-3 h-3 rotate-45"
          style={{
            background: bubbleBg,
            borderLeft: `1px solid ${bubbleBorder}`,
            borderBottom: `1px solid ${bubbleBorder}`,
          }}
        />
        {/* 气泡主体 */}
        <div
          className="rounded-2xl px-3.5 py-2.5 relative"
          style={{
            background: bubbleBg,
            border: `1px solid ${bubbleBorder}`,
          }}
        >
          <p
            className="text-xs mb-1"
            style={{ color: 'var(--color-honey)' }}
          >
            {speaker} 说
          </p>
          <p
            className={
              variant === 'compact'
                ? 'handwrite text-sm leading-snug line-clamp-3'
                : 'handwrite text-base leading-relaxed whitespace-pre-wrap'
            }
            style={{ color: 'var(--color-forest-deep)' }}
          >
            {entry.pet_pov_text}
          </p>
        </div>
      </div>
    </div>
  )
}
