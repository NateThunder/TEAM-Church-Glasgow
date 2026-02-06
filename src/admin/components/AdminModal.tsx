import type { ReactNode } from 'react'

type AdminModalProps = {
  isOpen: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export default function AdminModal({ isOpen, title, onClose, children, footer }: AdminModalProps) {
  if (!isOpen) return null

  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
      <button className="admin-modal-backdrop" type="button" aria-label="Close modal" onClick={onClose} />
      <div className="admin-modal-panel">
        <div className="admin-modal-header">
          <h3 id="admin-modal-title">{title}</h3>
          <button type="button" className="admin-icon-btn" onClick={onClose} aria-label="Close">
            X
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
        {footer ? <div className="admin-modal-footer">{footer}</div> : null}
      </div>
    </div>
  )
}
