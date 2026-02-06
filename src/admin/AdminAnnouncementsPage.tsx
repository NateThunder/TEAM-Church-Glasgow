import { useState } from 'react'
import AdminLayout from './AdminLayout'
import AdminButton from './components/AdminButton'
import AdminModal from './components/AdminModal'
import AdminTable from './components/AdminTable'
import { useAdminData } from './AdminDataContext'

type AnnouncementFormState = {
  title: string
  content: string
  status: 'Draft' | 'Published'
}

const emptyForm: AnnouncementFormState = {
  title: '',
  content: '',
  status: 'Draft',
}

export default function AdminAnnouncementsPage() {
  const { announcements, createAnnouncement, updateAnnouncement, removeAnnouncement } = useAdminData()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<AnnouncementFormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
    setIsModalOpen(true)
  }

  const openEdit = (id: string) => {
    const announcement = announcements.find((item) => item.id === id)
    if (!announcement) return
    setEditingId(id)
    setForm({
      title: announcement.title,
      content: announcement.content,
      status: announcement.status,
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const openDelete = (id: string) => {
    setDeleteId(id)
    setIsDeleteOpen(true)
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (form.title.trim().length < 3) nextErrors.title = 'Title must be at least 3 characters.'
    if (form.content.trim().length < 10)
      nextErrors.content = 'Content must be at least 10 characters.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    if (editingId) {
      updateAnnouncement(editingId, form)
    } else {
      createAnnouncement(form)
    }
    setIsModalOpen(false)
  }

  const handleDelete = () => {
    if (deleteId) removeAnnouncement(deleteId)
    setIsDeleteOpen(false)
    setDeleteId(null)
  }

  return (
    <AdminLayout
      title="Announcements"
      description="Post updates for the church and manage visibility."
      action={
        <AdminButton variant="primary" onClick={openCreate}>
          + Add new
        </AdminButton>
      }
    >
      <AdminTable>
        <thead>
          <tr>
            <th>Title</th>
            <th>Content</th>
            <th>Status</th>
            <th className="admin-actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {announcements.length === 0 ? (
            <tr>
              <td colSpan={4} className="admin-empty">
                No announcements yet. Create your first one!
              </td>
            </tr>
          ) : (
            announcements.map((announcement) => (
              <tr key={announcement.id}>
                <td>{announcement.title}</td>
                <td className="admin-description">{announcement.content}</td>
                <td>
                  <span
                    className={`admin-status ${
                      announcement.status === 'Published' ? 'is-live' : ''
                    }`}
                  >
                    {announcement.status}
                  </span>
                </td>
                <td className="admin-actions">
                  <AdminButton variant="ghost" onClick={() => openEdit(announcement.id)}>
                    Edit
                  </AdminButton>
                  <AdminButton variant="ghost" onClick={() => openDelete(announcement.id)}>
                    Delete
                  </AdminButton>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </AdminTable>

      <AdminModal
        isOpen={isModalOpen}
        title={editingId ? 'Edit announcement' : 'Add announcement'}
        onClose={() => setIsModalOpen(false)}
        footer={
          <div className="admin-modal-actions">
            <AdminButton variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton variant="primary" onClick={handleSave}>
              Save
            </AdminButton>
          </div>
        }
      >
        <div className="admin-form-grid">
          <label className="admin-label">
            Title
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Service time update"
            />
            {errors.title ? <span className="admin-field-error">{errors.title}</span> : null}
          </label>
          <label className="admin-label">
            Content
            <textarea
              rows={3}
              value={form.content}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, content: event.target.value }))
              }
              placeholder="Sunday service begins at 11:00 AM."
            />
            {errors.content ? (
              <span className="admin-field-error">{errors.content}</span>
            ) : null}
          </label>
          <label className="admin-label">
            Status
            <select
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  status: event.target.value as AnnouncementFormState['status'],
                }))
              }
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </label>
        </div>
      </AdminModal>

      <AdminModal
        isOpen={isDeleteOpen}
        title="Delete announcement?"
        onClose={() => setIsDeleteOpen(false)}
        footer={
          <div className="admin-modal-actions">
            <AdminButton variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton variant="primary" onClick={handleDelete}>
              Delete
            </AdminButton>
          </div>
        }
      >
        <p className="admin-modal-text">This action cannot be undone.</p>
      </AdminModal>
    </AdminLayout>
  )
}
