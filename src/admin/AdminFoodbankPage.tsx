import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import AdminButton from './components/AdminButton'
import AdminCard from './components/AdminCard'
import { supabase } from '../services/supabaseClient'
import { SUPABASE_CONFIG_ERROR } from '../constants/messages'
import {
  DEFAULT_FOODBANK_PROFILE,
  FOODBANK_PROFILE_SELECT,
  toFoodbankProfile,
  toFoodbankProfilePayload,
  type FoodbankProfile,
  type FoodbankProfileRow,
} from '../services/foodbankProfile'

const requiredFields: Array<keyof FoodbankProfile> = [
  'heroTitle',
  'heroSummary',
  'missionBody',
  'address',
  'phone',
  'email',
  'donateUrl',
  'contactUrl',
]

export default function AdminFoodbankPage() {
  const [profile, setProfile] = useState<FoodbankProfile>(DEFAULT_FOODBANK_PROFILE)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>(supabase ? 'loading' : 'error')
  const [error, setError] = useState<string | null>(supabase ? null : SUPABASE_CONFIG_ERROR)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const fetchProfile = async () => {
    if (!supabase) {
      return { data: null as FoodbankProfile | null, error: SUPABASE_CONFIG_ERROR }
    }

    const { data, error: loadError } = await supabase
      .from('foodbank_profile')
      .select(FOODBANK_PROFILE_SELECT)
      .eq('profile_key', DEFAULT_FOODBANK_PROFILE.profileKey)
      .limit(1)

    if (loadError) {
      return { data: null as FoodbankProfile | null, error: loadError.message }
    }

    const row = ((data ?? []) as unknown as FoodbankProfileRow[])[0]
    return {
      data: row ? toFoodbankProfile(row) : DEFAULT_FOODBANK_PROFILE,
      error: null as string | null,
    }
  }

  useEffect(() => {
    let active = true

    const loadInitialProfile = async () => {
      const result = await fetchProfile()
      if (!active) return

      if (result.error) {
        setStatus('error')
        setError(result.error)
        return
      }

      setProfile(result.data ?? DEFAULT_FOODBANK_PROFILE)
      setStatus('idle')
      setError(null)
    }

    void loadInitialProfile()
    return () => {
      active = false
    }
  }, [])

  const updateField = <K extends keyof FoodbankProfile>(key: K, value: FoodbankProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
    setSuccessMessage(null)
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    requiredFields.forEach((field) => {
      const value = profile[field]
      if (typeof value === 'string' && !value.trim()) {
        nextErrors[field] = 'This field is required.'
      }
    })
    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    if (!supabase) {
      setError(SUPABASE_CONFIG_ERROR)
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    const { error: saveError } = await supabase
      .from('foodbank_profile')
      .upsert(toFoodbankProfilePayload(profile), { onConflict: 'profile_key' })

    setIsSaving(false)

    if (saveError) {
      setStatus('error')
      setError(saveError.message)
      return
    }

    const result = await fetchProfile()
    if (result.data) {
      setProfile(result.data)
    }
    setStatus('idle')
    setSuccessMessage('Foodbank profile saved.')
  }

  const renderInput = (
    label: string,
    key: keyof FoodbankProfile,
    placeholder?: string,
    type = 'text',
  ) => (
    <label className="admin-label">
      {label}
      <input
        type={type}
        value={String(profile[key] ?? '')}
        onChange={(event) => updateField(key, event.target.value)}
        placeholder={placeholder}
      />
      {fieldErrors[key] ? <span className="admin-field-error">{fieldErrors[key]}</span> : null}
    </label>
  )

  const renderTextarea = (
    label: string,
    key: keyof FoodbankProfile,
    rows = 4,
    placeholder?: string,
  ) => (
    <label className="admin-label">
      {label}
      <textarea
        rows={rows}
        value={String(profile[key] ?? '')}
        onChange={(event) => updateField(key, event.target.value)}
        placeholder={placeholder}
      />
      {fieldErrors[key] ? <span className="admin-field-error">{fieldErrors[key]}</span> : null}
    </label>
  )

  return (
    <AdminLayout
      title="Foodbank"
      description="Edit the public Everlasting Foodbank page content and contact details."
      action={
        <AdminButton variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save changes'}
        </AdminButton>
      }
    >
      {status === 'loading' ? <p className="admin-description">Loading Foodbank profile...</p> : null}
      {status === 'error' ? <p className="admin-error">{error ?? 'Unable to load.'}</p> : null}
      {successMessage ? <p className="admin-success">{successMessage}</p> : null}

      <AdminCard className="admin-foodbank-editor">
        <div className="admin-foodbank-section">
          <h2>Hero</h2>
          <div className="admin-form-grid admin-foodbank-grid">
            {renderInput('Hero image URL', 'heroImageUrl', '/optimized/home-welcome.jpg')}
            {renderInput('Kicker', 'heroKicker', 'OUR FOODBANK')}
            {renderInput('Title', 'heroTitle', 'Everlasting Foodbank')}
            {renderTextarea('Summary', 'heroSummary', 3)}
          </div>
        </div>

        <div className="admin-foodbank-section">
          <h2>Mission</h2>
          <div className="admin-form-grid">
            {renderInput('Mission title', 'missionTitle', 'Mission and history')}
            {renderTextarea('Mission body', 'missionBody', 6)}
          </div>
        </div>

        <div className="admin-foodbank-section">
          <h2>Committee</h2>
          <div className="admin-form-grid">
            {renderInput('Committee title', 'committeeTitle', 'Meet the committee')}
            {renderTextarea('Committee summary', 'committeeSummary', 3)}
            {renderTextarea(
              'Committee members',
              'committeeMembers',
              6,
              'One member per line: Name | Role | /foodbank/photo.png',
            )}
            {renderInput('Committee URL', 'committeeUrl', 'https://www.everlastingfoodbank.org/blank')}
          </div>
        </div>

        <div className="admin-foodbank-section">
          <h2>Support us</h2>
          <div className="admin-form-grid">
            {renderInput('Support title', 'supportTitle', 'Volunteer and support')}
            {renderTextarea('Support intro', 'supportIntro', 3)}
            {renderTextarea('Current roles text', 'supportRoleStatus', 3)}
            {renderTextarea('How to join text', 'supportJoinDetails', 3)}
            {renderTextarea('Location text', 'supportLocationDetails', 3)}
            {renderTextarea('Opening text', 'supportOpeningDetails', 3)}
          </div>
        </div>

        <div className="admin-foodbank-section">
          <h2>Help details</h2>
          <div className="admin-form-grid admin-foodbank-grid">
            {renderTextarea('Help summary', 'helpSummary', 3)}
            {renderInput('First hours label', 'hoursPrimaryLabel', 'First and third Saturdays')}
            {renderInput('First hours value', 'hoursPrimaryValue', '1:00 PM - 3:00 PM')}
            {renderInput('Second hours label', 'hoursSecondaryLabel', 'Other Saturdays')}
            {renderInput('Second hours value', 'hoursSecondaryValue', '1:00 PM - 2:00 PM')}
            {renderInput('Address', 'address', '12 Whitehill Street, Glasgow G31 2LH')}
            {renderInput('Directions URL', 'directionsUrl', 'https://www.google.com/maps/...')}
            {renderInput('Phone', 'phone', '07983021283')}
            {renderInput('Email', 'email', 'contact@everlastingfoodbank.org', 'email')}
          </div>
        </div>

        <div className="admin-foodbank-section">
          <h2>Support and charity details</h2>
          <div className="admin-form-grid admin-foodbank-grid">
            {renderTextarea('Donation summary', 'donationSummary', 3)}
            {renderTextarea('Item donation details', 'itemDonationDetails', 3)}
            {renderInput('Charity name', 'charityName', 'The Everlasting Foodbank SCIO')}
            {renderInput('Charity number', 'charityNumber', 'SC047458')}
          </div>
        </div>

        <div className="admin-foodbank-section">
          <h2>Links</h2>
          <div className="admin-form-grid admin-foodbank-grid">
            {renderInput('Website URL', 'websiteUrl', 'https://www.everlastingfoodbank.org/')}
            {renderInput('Support URL', 'supportUrl', 'https://www.everlastingfoodbank.org/support-us')}
            {renderInput('Donate URL', 'donateUrl', 'https://www.everlastingfoodbank.org/donate')}
            {renderInput('Contact URL', 'contactUrl', 'https://www.everlastingfoodbank.org/contact-us')}
            {renderInput('About URL', 'aboutUrl', 'https://www.everlastingfoodbank.org/about')}
            {renderInput('Facebook URL', 'facebookUrl', 'https://www.facebook.com/everlastingfoodbank')}
          </div>
        </div>

        <label className="admin-label admin-checkbox-row admin-foodbank-active">
          <span>Active profile</span>
          <input
            type="checkbox"
            checked={profile.isActive}
            onChange={(event) => updateField('isActive', event.target.checked)}
          />
        </label>
      </AdminCard>
    </AdminLayout>
  )
}
