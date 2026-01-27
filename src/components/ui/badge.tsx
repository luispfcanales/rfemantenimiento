import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        destructive: 'bg-red-100 text-red-700',
        outline: 'border border-slate-300 text-slate-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      className={[badgeVariants({ variant }), className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}
