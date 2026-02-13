import { useEffect, useMemo, useState } from 'react'
import AdminLayout from './AdminLayout'
import AdminButton from './components/AdminButton'
import AdminModal from './components/AdminModal'
import AdminTable from './components/AdminTable'
import { supabase } from '../services/supabaseClient'

type TeamFormState = {
  groupName: string
  name: string
  leader: string
  description: string
}

const emptyForm: TeamFormState = {
  groupName: 'Support',
  name: '',
  leader: '',
  description: '',
}

type TeamRow = {
  id: string
  team_key: string
  group_name: string
  group_sort: number | null
  team_sort: number | null
  name: string
  leader: string | null
  description: string | null
  is_active: boolean
}

type TeamRowWithoutLeader = Omit<TeamRow, 'leader'> & {
  leader?: undefined
}

type TeamItem = {
  id: string
  teamKey: string
  groupName: string
  groupSort: number
  teamSort: number
  name: string
  leader: string
  description: string
}

const GROUP_SORT_ORDER: Record<string, number> = {
  'Frontline Teams': 10,
  'Creative & Technical': 20,
  'Next Generation': 30,
  Support: 40,
}

const resolveGroupSort = (groupName: string) => GROUP_SORT_ORDER[groupName] ?? 90

const createTeamKey = (name: string) => {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)

  const safeBase = base || 'team'
  return `${safeBase}-${Math.random().toString(36).slice(2, 8)}`
}

const mapTeamRows = (rows: Array<TeamRow | TeamRowWithoutLeader>): TeamItem[] =>
  rows.map((row) => ({
    id: row.id,
    teamKey: row.team_key,
    groupName: row.group_name,
    groupSort: row.group_sort ?? resolveGroupSort(row.group_name),
    teamSort: row.team_sort ?? 100,
    name: row.name,
    leader: 'leader' in row ? row.leader ?? '' : '',
    description: row.description ?? '',
  }))

const isMissingLeaderColumnError = (error: { code?: string; message?: string } | null) => {
  if (!error) return false
  if (error.code === '42703') return true
  return error.message?.toLowerCase().includes('leader') ?? false
}

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<TeamItem[]>([])
  const [hasLeaderColumn, setHasLeaderColumn] = useState(true)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<TeamFormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadTeams = async () => {
    if (!supabase) {
      setStatus('error')
      setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      return
    }

    setStatus('loading')
    setError(null)

    const { data, error: loadError } = await supabase
      .from('serving_teams')
      .select('id,team_key,group_name,group_sort,team_sort,name,leader,description,is_active')
      .eq('is_active', true)
      .order('group_sort', { ascending: true })
      .order('team_sort', { ascending: true })
      .order('name', { ascending: true })

    if (loadError) {
      if (isMissingLeaderColumnError(loadError)) {
        setHasLeaderColumn(false)

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('serving_teams')
          .select('id,team_key,group_name,group_sort,team_sort,name,description,is_active')
          .eq('is_active', true)
          .order('group_sort', { ascending: true })
          .order('team_sort', { ascending: true })
          .order('name', { ascending: true })

        if (fallbackError) {
          setStatus('error')
          setError(fallbackError.message)
          return
        }

        setTeams(mapTeamRows((fallbackData ?? []) as TeamRowWithoutLeader[]))
        setStatus('idle')
        return
      }

      setStatus('error')
      setError(loadError.message)
      return
    }
    setHasLeaderColumn(true)
    setTeams(mapTeamRows((data ?? []) as TeamRow[]))
    setStatus('idle')
  }

  useEffect(() => {
    loadTeams()
  }, [])

  const groupOptions = useMemo(() => {
    const fromData = teams.map((team) => team.groupName)
    const combined = new Set([...Object.keys(GROUP_SORT_ORDER), ...fromData])
    return Array.from(combined).sort((a, b) => resolveGroupSort(a) - resolveGroupSort(b))
  }, [teams])

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
    setForm({
      groupName: team.groupName,
      name: team.name,
      leader: team.leader,
      description: team.description,
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
    if (form.groupName.trim().length < 2) nextErrors.groupName = 'Group is required.'
    if (form.name.trim().length < 3) nextErrors.name = 'Name must be at least 3 characters.'
    if (hasLeaderColumn && form.leader.trim().length < 2) {
      nextErrors.leader = 'Leader name is required.'
    }
    if (form.description.trim().length < 10)
      nextErrors.description = 'Description must be at least 10 characters.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    if (!supabase) {
      setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      return
    }

    const groupName = form.groupName.trim()
    const basePayload: Record<string, string | number | boolean | null> = {
      group_name: groupName,
      group_sort: resolveGroupSort(groupName),
      name: form.name.trim(),
      description: form.description.trim() || null,
      is_active: true,
    }
    if (hasLeaderColumn) {
      basePayload.leader = form.leader.trim() || null
    }

    if (editingId) {
      const { error: updateError } = await supabase
        .from('serving_teams')
        .update(basePayload)
        .eq('id', editingId)

      if (updateError) {
        setError(updateError.message)
        return
      }
    } else {
      const nextTeamSort =
        teams
          .filter((team) => team.groupName === groupName)
          .reduce((max, team) => Math.max(max, team.teamSort), 0) + 10

      const { error: insertError } = await supabase.from('serving_teams').insert({
        ...basePayload,
        team_key: createTeamKey(form.name),
        team_sort: nextTeamSort,
      })

      if (insertError) {
        setError(insertError.message)
        return
      }
    }

    setIsModalOpen(false)
    await loadTeams()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    if (!supabase) {
      setError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      return
    }

    const { error: deleteError } = await supabase
      .from('serving_teams')
      .delete()
      .eq('id', deleteId)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    setIsDeleteOpen(false)
    setDeleteId(null)
    await loadTeams()
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
      {status === 'error' ? <p className="admin-error">{error ?? 'Unable to load.'}</p> : null}
      {!hasLeaderColumn ? (
        <p className="admin-error">
          Database column `serving_teams.leader` is missing. Team edits still work, but leader values
          are disabled until you run the SQL migration.
        </p>
      ) : null}

      <AdminTable>
        <thead>
          <tr>
            <th>Group</th>
            <th>Name</th>
            {hasLeaderColumn ? <th>Leader</th> : null}
            <th>Description</th>
            <th className="admin-actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {status === 'loading' ? (
            <tr>
              <td colSpan={hasLeaderColumn ? 5 : 4} className="admin-empty">
                Loading teams...
              </td>
            </tr>
          ) : teams.length === 0 ? (
            <tr>
              <td colSpan={hasLeaderColumn ? 5 : 4} className="admin-empty">
                No teams yet. Create your first one!
              </td>
            </tr>
          ) : (
            teams.map((team) => (
              <tr key={team.id}>
                <td>{team.groupName}</td>
                <td>{team.name}</td>
                {hasLeaderColumn ? <td>{team.leader}</td> : null}
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
            Group
            <select
              value={form.groupName}
              onChange={(event) => setForm((prev) => ({ ...prev, groupName: event.target.value }))}
            >
              {groupOptions.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
            {errors.groupName ? <span className="admin-field-error">{errors.groupName}</span> : null}
          </label>
          <label className="admin-label">
            Name
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Worship Team"
            />
            {errors.name ? <span className="admin-field-error">{errors.name}</span> : null}
          </label>
          {hasLeaderColumn ? (
            <label className="admin-label">
              Leader
              <input
                value={form.leader}
                onChange={(event) => setForm((prev) => ({ ...prev, leader: event.target.value }))}
                placeholder="Jane Doe"
              />
              {errors.leader ? <span className="admin-field-error">{errors.leader}</span> : null}
            </label>
          ) : (
            <p className="admin-modal-text">
              Leader field unavailable until the `serving_teams.leader` migration is applied.
            </p>
          )}
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
