import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import AdminButton from './components/AdminButton'
import AdminModal from './components/AdminModal'
import AdminTable from './components/AdminTable'
import { supabase } from '../services/supabaseClient'

type BelieversClassFormState = {
  startsLabel: string
  durationLabel: string
  isActive: boolean
}

const emptyForm: BelieversClassFormState = {
  startsLabel: 'Sunday, 16 March 2026',
  durationLabel: '6 weeks',
  isActive: true,
}

type BelieversClassRow = {
  id: string
  class_key: string
  starts_label: string | null
  duration_label: string | null
  is_active: boolean
}

type BelieversClassItem = {
  id: string
  classKey: string
  startsLabel: string
  durationLabel: string
  isActive: boolean
}

const toDateInputValue = (label: string) => {
  const trimmed = label.trim()
  if (!trimmed) return ''

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed

  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, '0')
    const month = slashMatch[2].padStart(2, '0')
    const year = slashMatch[3]
    return `${year}-${month}-${day}`
  }

  const commaIndex = trimmed.indexOf(',')
  const candidate = commaIndex >= 0 ? trimmed.slice(commaIndex + 1).trim() : trimmed
  const parsed = new Date(candidate)
  if (Number.isNaN(parsed.getTime())) return ''

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const fromDateInputValue = (value: string) => {
  if (!value) return ''
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return ''
  return `${day}/${month}/${year}`
}

const createClassKey = (startsLabel: string) => {
  const base = startsLabel
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)

  const safeBase = base || 'believers-class'
  return `${safeBase}-${Math.random().toString(36).slice(2, 8)}`
}

const toItem = (row: BelieversClassRow): BelieversClassItem => ({
  id: row.id,
  classKey: row.class_key,
  startsLabel: row.starts_label ?? '',
  durationLabel: row.duration_label ?? '',
  isActive: row.is_active,
})

export default function AdminBelieversClassPage() {
  const [items, setItems] = useState<BelieversClassItem[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<BelieversClassFormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadBelieversClasses = async () => {
    if (!supabase) {
      setStatus('error')
      setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      return
    }

    setStatus('loading')
    setError(null)

    const { data, error: loadError } = await supabase
      .from('believers_classes')
      .select('id,class_key,starts_label,duration_label,is_active')
      .order('updated_at', { ascending: false })

    if (loadError) {
      setStatus('error')
      setError(loadError.message)
      return
    }

    setItems(((data ?? []) as BelieversClassRow[]).map(toItem))
    setStatus('idle')
  }

  useEffect(() => {
    loadBelieversClasses()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
    setIsModalOpen(true)
  }

  const openEdit = (id: string) => {
    const item = items.find((entry) => entry.id === id)
    if (!item) return
    setEditingId(id)
    setForm({
      startsLabel: item.startsLabel,
      durationLabel: item.durationLabel,
      isActive: item.isActive,
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
    if (form.startsLabel.trim().length < 3) nextErrors.startsLabel = 'Start date is required.'
    if (form.durationLabel.trim().length < 2) nextErrors.durationLabel = 'Duration is required.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    if (!supabase) {
      setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      return
    }

    const payload = {
      starts_label: form.startsLabel.trim(),
      duration_label: form.durationLabel.trim(),
      is_active: form.isActive,
    }

    if (editingId) {
      const { error: updateError } = await supabase
        .from('believers_classes')
        .update(payload)
        .eq('id', editingId)

      if (updateError) {
        setError(updateError.message)
        return
      }
    } else {
      const { error: insertError } = await supabase.from('believers_classes').insert({
        class_key: createClassKey(form.startsLabel),
        title: 'Believers Class',
        summary: '',
        time_label: '',
        location: '',
        register_url: '/connect',
        learn_point_1: '',
        learn_point_2: '',
        learn_point_3: '',
        ...payload,
      })

      if (insertError) {
        setError(insertError.message)
        return
      }
    }

    setIsModalOpen(false)
    await loadBelieversClasses()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    if (!supabase) {
      setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      return
    }

    const { error: deleteError } = await supabase
      .from('believers_classes')
      .delete()
      .eq('id', deleteId)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    setIsDeleteOpen(false)
    setDeleteId(null)
    await loadBelieversClasses()
  }

  return (
    <AdminLayout
      title="Believers Class"
      description="Manage only start date and duration for the Serve page."
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
            <th>Start Date</th>
            <th>Duration</th>
            <th>Status</th>
            <th className="admin-actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {status === 'loading' ? (
            <tr>
              <td colSpan={4} className="admin-empty">
                Loading Believers Class entries...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={4} className="admin-empty">
                No entries yet. Create your first one!
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td>{item.startsLabel}</td>
                <td>{item.durationLabel}</td>
                <td>{item.isActive ? 'Active' : 'Inactive'}</td>
                <td className="admin-actions">
                  <AdminButton variant="ghost" onClick={() => openEdit(item.id)}>
                    Edit
                  </AdminButton>
                  <AdminButton variant="ghost" onClick={() => openDelete(item.id)}>
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
        title={editingId ? 'Edit Believers Class' : 'Add Believers Class'}
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
            Start Date
            <input
              type="date"
              value={toDateInputValue(form.startsLabel)}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  startsLabel: fromDateInputValue(event.target.value),
                }))
              }
            />
            {errors.startsLabel ? (
              <span className="admin-field-error">{errors.startsLabel}</span>
            ) : null}
          </label>
          <label className="admin-label">
            Duration
            <input
              value={form.durationLabel}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, durationLabel: event.target.value }))
              }
              placeholder="6 weeks"
            />
            {errors.durationLabel ? (
              <span className="admin-field-error">{errors.durationLabel}</span>
            ) : null}
          </label>
          <label className="admin-label admin-checkbox-row">
            <span>Active</span>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, isActive: event.target.checked }))
              }
            />
          </label>
        </div>
      </AdminModal>

      <AdminModal
        isOpen={isDeleteOpen}
        title="Delete Believers Class entry?"
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
