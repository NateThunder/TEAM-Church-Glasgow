import type { ReactNode } from 'react'

type AdminTableProps = {
  children: ReactNode
}

export default function AdminTable({ children }: AdminTableProps) {
  return (
    <div className="admin-table-card">
      <table className="admin-table">{children}</table>
    </div>
  )
}
