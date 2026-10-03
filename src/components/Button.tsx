import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--clay)] text-[var(--surface-strong)] hover:bg-[var(--clay-deep)] shadow-[var(--shadow)]',
  secondary:
    'bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--surface-strong)]',
  ghost: 'bg-transparent text-[var(--ink)] hover:bg-[var(--bg-accent)]',
  danger: 'bg-transparent text-[#9b3d2d] hover:bg-[#9b3d2d]/10 border border-[#9b3d2d]/30',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
