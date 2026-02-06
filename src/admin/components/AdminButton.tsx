import type { ButtonHTMLAttributes } from 'react'

type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export default function AdminButton({
  variant = 'primary',
  className = '',
  ...props
}: AdminButtonProps) {
  return (
    <button
      type="button"
      className={`admin-btn admin-btn--${variant} ${className}`.trim()}
      {...props}
    />
  )
}
