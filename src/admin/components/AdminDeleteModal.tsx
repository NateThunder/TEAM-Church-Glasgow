import AdminModal from './AdminModal'
import AdminModalActions from './AdminModalActions'

type AdminDeleteModalProps = {
  isOpen: boolean
  title: string
  onCancel: () => void
  onConfirm: () => void
  description?: string
}

export default function AdminDeleteModal({
  isOpen,
  title,
  onCancel,
  onConfirm,
  description = 'This action cannot be undone.',
}: AdminDeleteModalProps) {
  return (
    <AdminModal
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      footer={
        <AdminModalActions
          onCancel={onCancel}
          onConfirm={onConfirm}
          confirmLabel="Delete"
          confirmClassName="admin-btn--danger"
        />
      }
    >
      <p className="admin-modal-text">{description}</p>
    </AdminModal>
  )
}
