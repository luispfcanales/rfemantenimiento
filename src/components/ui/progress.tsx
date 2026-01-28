import type { HTMLAttributes } from 'react'

type Props = {
  value: number
} & HTMLAttributes<HTMLDivElement>

export function Progress({ value, className, ...props }: Props) {
  const v = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0))
  // Color logic: Green (<=85), Amber (>85 and <=95), Red (>95)
  const barColor = v > 95 ? 'bg-red-500' : v > 85 ? 'bg-amber-500' : 'bg-green-500'

  return (
    <div
      className={['h-2 w-full rounded-full bg-slate-100', className].filter(Boolean).join(' ')}
      {...props}
    >
      <div
        className={['h-full rounded-full transition-all duration-500 shadow-sm', barColor, className?.includes('[&>div]:') ? '' : ''].join(' ')}
        style={{ width: `${v}%` }}
      />
    </div>
  )
}

