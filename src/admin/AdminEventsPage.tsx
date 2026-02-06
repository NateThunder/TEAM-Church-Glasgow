import { useEffect, useMemo, useState } from 'react'
import AdminLayout from './AdminLayout'
import AdminButton from './components/AdminButton'
import AdminModal from './components/AdminModal'
import AdminTable from './components/AdminTable'
import { supabase } from '../services/supabaseClient'
import type { EventCategory } from '../services/events'

type EventFormState = {
  title: string
  description: string
  category: Exclude<EventCategory, 'All'>
  location: string
  start: string
  end: string
  imageUrl: string
}

const emptyForm: EventFormState = {
  title: '',
  description: '',
  category: 'Worship',
  location: '',
  start: '',
  end: '',
  imageUrl: '',
}

type EventRow = {
  id: string
  title: string
  description: string | null
  category: Exclude<EventCategory, 'All'>
  location: string | null
  start: string
  end: string
  image_url: string | null
}

type EventItem = {
  id: string
  title: string
  description?: string
  category: Exclude<EventCategory, 'All'>
  location?: string
  start: string
  end: string
  imageUrl?: string
}

const categories: Array<Exclude<EventCategory, 'All'>> = [
  'Worship',
  'Community',
  'Youth',
  'Kids',
]

const toInputValue = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offsetMs = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

const toIso = (value: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString()
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<EventFormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadEvents = async () => {
    setStatus('loading')
    setError(null)
    const { data, error: loadError } = await supabase
      .from('events')
      .select('id,title,description,category,location,start,end,image_url')
      .order('start', { ascending: true })

    if (loadError) {
      setStatus('error')
      setError(loadError.message)
      return
    }

    const mapped: EventItem[] = (data ?? []).map((row: EventRow) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      category: row.category,
      location: row.location ?? undefined,
      start: row.start,
      end: row.end,
      imageUrl: row.image_url ?? undefined,
    }))
    setEvents(mapped)
    setStatus('idle')
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
    setIsModalOpen(true)
  }

  const openEdit = (id: string) => {
    const event = events.find((item) => item.id === id)
    if (!event) return
    setEditingId(id)
    setForm({
      title: event.title,
      description: event.description ?? '',
      category: event.category,
      location: event.location ?? '',
      start: toInputValue(event.start),
      end: toInputValue(event.end),
      imageUrl: event.imageUrl ?? '',
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
    if (!form.start.trim()) nextErrors.start = 'Start date/time is required.'
    if (!form.end.trim()) nextErrors.end = 'End date/time is required.'
    if (form.location.trim().length < 3) nextErrors.location = 'Location must be at least 3 characters.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category,
      location: form.location.trim() || null,
      start: toIso(form.start),
      end: toIso(form.end),
      image_url: form.imageUrl.trim() || null,
    }

    if (editingId) {
      const { error: updateError } = await supabase
        .from('events')
        .update(payload)
        .eq('id', editingId)
      if (updateError) {
        setError(updateError.message)
        return
      }
    } else {
      const { error: insertError } = await supabase.from('events').insert(payload)
      if (insertError) {
        setError(insertError.message)
        return
      }
    }

    setIsModalOpen(false)
    await loadEvents()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const { error: deleteError } = await supabase.from('events').delete().eq('id', deleteId)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setIsDeleteOpen(false)
    setDeleteId(null)
    await loadEvents()
  }

  const tableRows = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        startLabel: event.start ? new Date(event.start).toLocaleString() : 'TBD',
      })),
    [events]
  )

  return (
    <AdminLayout
      title="Events"
      description="Add and update upcoming events for the church."
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
            <th>Title</th>
            <th>Date</th>
            <th>Category</th>
            <th>Location</th>
            <th className="admin-actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {status === 'loading' ? (
            <tr>
              <td colSpan={5} className="admin-empty">
                Loading events...
              </td>
            </tr>
          ) : events.length === 0 ? (
            <tr>
              <td colSpan={5} className="admin-empty">
                No events yet. Create your first one!
              </td>
            </tr>
          ) : (
            tableRows.map((event) => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>{event.startLabel}</td>
                <td>{event.category}</td>
                <td>{event.location}</td>
                <td className="admin-actions">
                  <AdminButton variant="ghost" onClick={() => openEdit(event.id)}>
                    Edit
                  </AdminButton>
                  <AdminButton variant="ghost" onClick={() => openDelete(event.id)}>
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
        title={editingId ? 'Edit event' : 'Add event'}
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
              placeholder="Sunday Gathering"
            />
            {errors.title ? <span className="admin-field-error">{errors.title}</span> : null}
          </label>
          <label className="admin-label">
            Description
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              placeholder="Service, worship, and a shared meal."
            />
          </label>
          <label className="admin-label">
            Category
            <select
              value={form.category}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  category: event.target.value as EventFormState['category'],
                }))
              }
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-label">
            Start
            <input
              type="datetime-local"
              value={form.start}
              onChange={(event) => setForm((prev) => ({ ...prev, start: event.target.value }))}
            />
            {errors.start ? <span className="admin-field-error">{errors.start}</span> : null}
          </label>
          <label className="admin-label">
            End
            <input
              type="datetime-local"
              value={form.end}
              onChange={(event) => setForm((prev) => ({ ...prev, end: event.target.value }))}
            />
            {errors.end ? <span className="admin-field-error">{errors.end}</span> : null}
          </label>
          <label className="admin-label">
            Location
            <input
              value={form.location}
              onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              placeholder="12 Whitehill Street"
            />
            {errors.location ? <span className="admin-field-error">{errors.location}</span> : null}
          </label>
          <label className="admin-label">
            Image URL
            <input
              value={form.imageUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
              placeholder="https://..."
            />
          </label>
        </div>
      </AdminModal>

      <AdminModal
        isOpen={isDeleteOpen}
        title="Delete event?"
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
