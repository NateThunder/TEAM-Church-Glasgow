import { useState } from 'react'
import AdminLayout from './AdminLayout'
import AdminButton from './components/AdminButton'
import AdminModal from './components/AdminModal'
import AdminTable from './components/AdminTable'
import { useAdminData } from './AdminDataContext'

type TeamFormState = {
  name: string
  leader: string
  description: string
}

const emptyForm: TeamFormState = {
  name: '',
  leader: '',
  description: '',
}

export default function AdminTeamsPage() {
  const { teams, createTeam, updateTeam, removeTeam } = useAdminData()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<TeamFormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
    setIsModalOpen(true)
  }

  const openEdit = (id: string) => {
    const team = teams.find((item) => item.id === id)
    if (!team) return
    setEditingId(id)
    setForm({ name: team.name, leader: team.leader, description: team.description })
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
    if (form.leader.trim().length < 2) nextErrors.leader = 'Leader name is required.'
    if (form.description.trim().length < 10)
      nextErrors.description = 'Description must be at least 10 characters.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    if (editingId) {
      updateTeam(editingId, form)
    } else {
      createTeam(form)
    }
    setIsModalOpen(false)
  }

  const handleDelete = () => {
    if (deleteId) removeTeam(deleteId)
    setIsDeleteOpen(false)
    setDeleteId(null)
  }

  return (
    <AdminLayout
      title="Teams"
      description="Manage serving teams and leadership details."
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
            <th>Leader</th>
            <th>Description</th>
            <th className="admin-actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.length === 0 ? (
            <tr>
              <td colSpan={4} className="admin-empty">
                No teams yet. Create your first one!
              </td>
            </tr>
          ) : (
            teams.map((team) => (
              <tr key={team.id}>
                <td>{team.name}</td>
                <td>{team.leader}</td>
                <td className="admin-description">{team.description}</td>
                <td className="admin-actions">
                  <AdminButton variant="ghost" onClick={() => openEdit(team.id)}>
                    Edit
                  </AdminButton>
                  <AdminButton variant="ghost" onClick={() => openDelete(team.id)}>
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
        title={editingId ? 'Edit team' : 'Add team'}
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
              placeholder="Worship Team"
            />
            {errors.name ? <span className="admin-field-error">{errors.name}</span> : null}
          </label>
          <label className="admin-label">
            Leader
            <input
              value={form.leader}
              onChange={(event) => setForm((prev) => ({ ...prev, leader: event.target.value }))}
              placeholder="Jane Doe"
            />
            {errors.leader ? <span className="admin-field-error">{errors.leader}</span> : null}
          </label>
          <label className="admin-label">
            Description
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              placeholder="Lead the church family into worship."
            />
            {errors.description ? (
              <span className="admin-field-error">{errors.description}</span>
            ) : null}
          </label>
        </div>
      </AdminModal>

      <AdminModal
        isOpen={isDeleteOpen}
        title="Delete team?"
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
