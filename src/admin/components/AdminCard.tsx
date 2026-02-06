import type { ReactNode } from 'react'

type AdminCardProps = {
  className?: string
  children: ReactNode
  as?: 'div' | 'button' | 'a'
}

export default function AdminCard({ className = '', children, as: Tag = 'div' }: AdminCardProps) {
  return <Tag className={`admin-surface ${className}`.trim()}>{children}</Tag>
}
