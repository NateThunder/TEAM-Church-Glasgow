import AdminButton from './AdminButton'

type AdminModalActionsProps = {
  onCancel: () => void
  onConfirm: () => void
  confirmLabel?: string
  confirmClassName?: string
}

export default function AdminModalActions({
  onCancel,
  onConfirm,
  confirmLabel = 'Save',
  confirmClassName,
}: AdminModalActionsProps) {
  return (
    <div className="admin-modal-actions">
      <AdminButton variant="secondary" onClick={onCancel}>
        Cancel
      </AdminButton>
      <AdminButton variant="primary" className={confirmClassName} onClick={onConfirm}>
        {confirmLabel}
      </AdminButton>
    </div>
  )
}
