import { useState } from 'react'
import AdminLayout from './AdminLayout'
import AdminButton from './components/AdminButton'
import AdminModal from './components/AdminModal'
import AdminTable from './components/AdminTable'
import { useAdminData } from './AdminDataContext'

type GroupFormState = {
  name: string
  meetingTime: string
  description: string
}

const emptyForm: GroupFormState = {
  name: '',
  meetingTime: '',
  description: '',
}

export default function AdminGroupsPage() {
  const { groups, createGroup, updateGroup, removeGroup } = useAdminData()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<GroupFormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
    setIsModalOpen(true)
  }

  const openEdit = (id: string) => {
    const group = groups.find((item) => item.id === id)
    if (!group) return
    setEditingId(id)
    setForm({
      name: group.name,
      meetingTime: group.meetingTime,
      description: group.description,
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
    if (form.name.trim().length < 3) nextErrors.name = 'Name must be at least 3 characters.'
    if (form.meetingTime.trim().length < 3)
      nextErrors.meetingTime = 'Meeting time is required.'
    if (form.description.trim().length < 10)
      nextErrors.description = 'Description must be at least 10 characters.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    if (editingId) {
      updateGroup(editingId, form)
    } else {
      createGroup(form)
    }
    setIsModalOpen(false)
  }

  const handleDelete = () => {
    if (deleteId) removeGroup(deleteId)
    setIsDeleteOpen(false)
    setDeleteId(null)
  }

  return (
    <AdminLayout
      title="Groups"
      description="Create and manage small groups and their meeting times."
      action={
        <AdminButton variant="primary" onClick={openCreate}>
          + Add new
        </AdminButton>
      }
    >
      <AdminTable>
        <thead>
          <tr>
            <th>Name</th>
            <th>Meeting Time</th>
            <th>Description</th>
            <th className="admin-actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.length === 0 ? (
            <tr>
              <td colSpan={4} className="admin-empty">
                No groups yet. Create your first one!
              </td>
            </tr>
          ) : (
            groups.map((group) => (
              <tr key={group.id}>
                <td>{group.name}</td>
                <td>{group.meetingTime}</td>
                <td className="admin-description">{group.description}</td>
                <td className="admin-actions">
                  <AdminButton variant="ghost" onClick={() => openEdit(group.id)}>
                    Edit
                  </AdminButton>
                  <AdminButton variant="ghost" onClick={() => openDelete(group.id)}>
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
        title={editingId ? 'Edit group' : 'Add group'}
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
            Name
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Young Adults"
            />
            {errors.name ? <span className="admin-field-error">{errors.name}</span> : null}
          </label>
          <label className="admin-label">
            Meeting Time
            <input
              value={form.meetingTime}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, meetingTime: event.target.value }))
              }
              placeholder="Wednesdays, 7:00 PM"
            />
            {errors.meetingTime ? (
              <span className="admin-field-error">{errors.meetingTime}</span>
            ) : null}
          </label>
          <label className="admin-label">
            Description
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              placeholder="A space for young adults to connect and grow."
            />
            {errors.description ? (
              <span className="admin-field-error">{errors.description}</span>
            ) : null}
          </label>
        </div>
      </AdminModal>

      <AdminModal
        isOpen={isDeleteOpen}
        title="Delete group?"
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
