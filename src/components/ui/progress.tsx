import { HTMLAttributes } from 'react'

type Props = {
  value: number
} & HTMLAttributes<HTMLDivElement>

export function Progress({ value, className, ...props }: Props) {
  const v = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0))
  const barColor =
    v >= 95 ? 'bg-red-600' : v > 70 ? 'bg-amber-500' : 'bg-green-600'
  return (
    <div
      className={['h-2 w-full rounded-full bg-slate-200', className].filter(Boolean).join(' ')}
      {...props}
    >
      <div
        className={['h-2 rounded-full', barColor].join(' ')}
        style={{ width: `${v}%` }}
      />
    </div>
  )
}
