import { useEffect, useMemo, useState } from 'react'
import AdminLayout from './AdminLayout'
import AdminButton from './components/AdminButton'
import AdminModal from './components/AdminModal'
import AdminTable from './components/AdminTable'
import { supabase } from '../services/supabaseClient'
import { SUPABASE_CONFIG_ERROR } from '../constants/messages'

type ServeSignupRow = {
  id: string
  team_key: string
  team_name: string
  applicant_name: string
  email: string
  phone_number: string | null
  message: string | null
  contacted: boolean
  created_at: string
}

type ServeSignupItem = {
  id: string
  teamKey: string
  teamName: string
  applicantName: string
  email: string
  phoneNumber: string
  message: string
  contacted: boolean
  createdAt: string
}

type ServeSignupFormState = {
  teamKey: string
  teamName: string
  applicantName: string
  email: string
  phoneNumber: string
  message: string
  contacted: boolean
}

const emptyForm: ServeSignupFormState = {
  teamKey: '',
  teamName: '',
  applicantName: '',
  email: '',
  phoneNumber: '',
  message: '',
  contacted: false,
}

const createTeamKey = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export default function AdminServeSignupsPage() {
  const [signups, setSignups] = useState<ServeSignupItem[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>(supabase ? 'loading' : 'error')
  const [error, setError] = useState<string | null>(supabase ? null : SUPABASE_CONFIG_ERROR)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<ServeSignupFormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const isReadOnlyDetails = editingId !== null

  const fetchSignups = async () => {
    if (!supabase) {
      return { data: [] as ServeSignupItem[], error: SUPABASE_CONFIG_ERROR }
    }

    const { data, error: loadError } = await supabase
      .from('serve_signups')
      .select('id,team_key,team_name,applicant_name,email,phone_number,message,contacted,created_at')
      .order('created_at', { ascending: false })

    if (loadError) {
      return { data: [] as ServeSignupItem[], error: loadError.message }
    }

    const mapped = (data ?? []).map((row: ServeSignupRow) => ({
      id: row.id,
      teamKey: row.team_key,
      teamName: row.team_name,
      applicantName: row.applicant_name,
      email: row.email,
      phoneNumber: row.phone_number ?? '',
      message: row.message ?? '',
      contacted: row.contacted ?? false,
      createdAt: row.created_at,
    }))

    return { data: mapped, error: null as string | null }
  }

  const loadSignups = async () => {
    setStatus('loading')
    setError(null)

    const result = await fetchSignups()
    if (result.error) {
      setStatus('error')
      setError(result.error)
      return
    }

    setSignups(result.data)
    setStatus('idle')
  }

  useEffect(() => {
    let active = true

    const loadInitialSignups = async () => {
      const result = await fetchSignups()
      if (!active) return

      if (result.error) {
        setStatus('error')
        setError(result.error)
        return
      }

      setSignups(result.data)
      setStatus('idle')
      setError(null)
    }

    void loadInitialSignups()
    return () => {
      active = false
    }
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
    setIsModalOpen(true)
  }

  const openEdit = (id: string) => {
    const signup = signups.find((item) => item.id === id)
    if (!signup) return
    setEditingId(id)
    setForm({
      teamKey: signup.teamKey,
      teamName: signup.teamName,
      applicantName: signup.applicantName,
      email: signup.email,
      phoneNumber: signup.phoneNumber,
      message: signup.message,
      contacted: signup.contacted,
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
    if (form.teamName.trim().length < 2) nextErrors.teamName = 'Team name is required.'
    if (form.applicantName.trim().length < 2) {
      nextErrors.applicantName = 'Applicant name is required.'
    }
    if (!isValidEmail(form.email.trim())) nextErrors.email = 'Valid email is required.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    if (!supabase) {
      setError(SUPABASE_CONFIG_ERROR)
      return
    }

    const teamName = form.teamName.trim()
    const teamKey = form.teamKey.trim() || createTeamKey(teamName) || 'team'
    const payload = {
      team_key: teamKey,
      team_name: teamName,
      applicant_name: form.applicantName.trim(),
      email: form.email.trim(),
      phone_number: form.phoneNumber.trim() || null,
      message: form.message.trim() || null,
      contacted: form.contacted,
    }

    if (editingId) {
      const { error: updateError } = await supabase
        .from('serve_signups')
        .update(payload)
        .eq('id', editingId)
      if (updateError) {
        setError(updateError.message)
        return
      }
    } else {
      const { error: insertError } = await supabase.from('serve_signups').insert(payload)
      if (insertError) {
        setError(insertError.message)
        return
      }
    }

    setIsModalOpen(false)
    await loadSignups()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    if (!supabase) {
      setError(SUPABASE_CONFIG_ERROR)
      return
    }
    const { error: deleteError } = await supabase
      .from('serve_signups')
      .delete()
      .eq('id', deleteId)
    if (deleteError) {
      setError(deleteError.message)
      return
    }

    setIsDeleteOpen(false)
    setDeleteId(null)
    await loadSignups()
  }

  const handleToggleContacted = async (id: string, contacted: boolean) => {
    if (!supabase) {
      setError(SUPABASE_CONFIG_ERROR)
      return
    }

    const previous = signups
    setSignups((prev) =>
      prev.map((item) => (item.id === id ? { ...item, contacted } : item))
    )

    const { error: updateError } = await supabase
      .from('serve_signups')
      .update({ contacted })
      .eq('id', id)

    if (updateError) {
      setSignups(previous)
      setError(updateError.message)
    }
  }

  const tableRows = useMemo(
    () =>
      signups.map((item) => ({
        ...item,
        createdAtLabel: item.createdAt ? new Date(item.createdAt).toLocaleString() : '-',
      })),
    [signups]
  )

  return (
    <AdminLayout
      title="Serve Signups"
      description="View and manage signup submissions from the Serve page."
      action={
        <AdminButton variant="primary" onClick={openCreate}>
          + Add new
        </AdminButton>
      }
    >
      {status === 'error' ? <p className="admin-error">{error ?? 'Unable to load.'}</p> : null}
      <AdminTable>
        <thead>
          <tr>
            <th>Team</th>
            <th>Applicant</th>
            <th className="admin-email-col">Email</th>
            <th>Phone</th>
            <th>Message</th>
            <th>Submitted</th>
            <th className="admin-actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {status === 'loading' ? (
            <tr>
              <td colSpan={7} className="admin-empty">
                Loading signups...
              </td>
            </tr>
          ) : signups.length === 0 ? (
            <tr>
              <td colSpan={7} className="admin-empty">
                No signups yet.
              </td>
            </tr>
          ) : (
            tableRows.map((signup) => (
              <tr key={signup.id}>
                <td>{signup.teamName}</td>
                <td>{signup.applicantName}</td>
                <td className="admin-email-col">
                  <span className="admin-email-clamp" title={signup.email}>
                    {signup.email}
                  </span>
                </td>
                <td>{signup.phoneNumber || '-'}</td>
                <td className="admin-description admin-message-clamp" title={signup.message || ''}>
                  {signup.message || '-'}
                </td>
                <td>{signup.createdAtLabel}</td>
                <td className="admin-actions">
                  <AdminButton variant="ghost" onClick={() => openEdit(signup.id)}>
                    Show more
                  </AdminButton>
                  <AdminButton
                    variant="ghost"
                    className={signup.contacted ? 'admin-btn--contacted' : 'admin-btn--not-contacted'}
                    onClick={() => void handleToggleContacted(signup.id, !signup.contacted)}
                  >
                    {signup.contacted ? 'Contacted' : 'Not contacted'}
                  </AdminButton>
                  <AdminButton
                    variant="ghost"
                    className="admin-btn--danger"
                    onClick={() => openDelete(signup.id)}
                  >
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
        title={editingId ? 'Signup details' : 'Add signup'}
        onClose={() => setIsModalOpen(false)}
        footer={
          <div className="admin-modal-actions">
            <AdminButton variant="secondary" onClick={() => setIsModalOpen(false)}>
              {isReadOnlyDetails ? 'Close' : 'Cancel'}
            </AdminButton>
            {isReadOnlyDetails ? null : (
              <AdminButton variant="primary" onClick={handleSave}>
                Save
              </AdminButton>
            )}
          </div>
        }
      >
        <div className="admin-form-grid">
          <label className="admin-label">
            Team Name
            <input
              value={form.teamName}
              readOnly={isReadOnlyDetails}
              onChange={(event) => {
                if (isReadOnlyDetails) return
                const nextTeamName = event.target.value
                setForm((prev) => ({
                  ...prev,
                  teamName: nextTeamName,
                  teamKey: prev.teamKey ? prev.teamKey : createTeamKey(nextTeamName),
                }))
              }}
              placeholder="Ushering Team"
            />
            {errors.teamName ? <span className="admin-field-error">{errors.teamName}</span> : null}
          </label>
          <label className="admin-label">
            Applicant Name
            <input
              value={form.applicantName}
              readOnly={isReadOnlyDetails}
              onChange={(event) => setForm((prev) => ({ ...prev, applicantName: event.target.value }))}
              placeholder="Jane Doe"
            />
            {errors.applicantName ? (
              <span className="admin-field-error">{errors.applicantName}</span>
            ) : null}
          </label>
          <label className="admin-label">
            Email
            <input
              type="email"
              value={form.email}
              readOnly={isReadOnlyDetails}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="jane@email.com"
            />
            {errors.email ? <span className="admin-field-error">{errors.email}</span> : null}
          </label>
          <label className="admin-label">
            Phone Number
            <input
              value={form.phoneNumber}
              readOnly={isReadOnlyDetails}
              onChange={(event) => setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
              placeholder="+44 7123 456789"
            />
          </label>
          <label className="admin-label">
            Message
            <textarea
              rows={3}
              value={form.message}
              readOnly={isReadOnlyDetails}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              placeholder="Interested in joining this team."
            />
          </label>
          <label className="admin-label admin-checkbox-row">
            <input
              type="checkbox"
              checked={form.contacted}
              disabled={isReadOnlyDetails}
              onChange={(event) => setForm((prev) => ({ ...prev, contacted: event.target.checked }))}
            />
            Contacted
          </label>
        </div>
      </AdminModal>

      <AdminModal
        isOpen={isDeleteOpen}
        title="Delete signup?"
        onClose={() => setIsDeleteOpen(false)}
        footer={
          <div className="admin-modal-actions">
            <AdminButton variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton variant="primary" className="admin-btn--danger" onClick={handleDelete}>
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
