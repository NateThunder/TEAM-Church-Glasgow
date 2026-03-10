import { supabase } from './supabaseClient'

type FormType = 'plan_visit' | 'prayer_request' | 'contact_us'

export type CreateGetInTouchSubmissionInput = {
  formType: FormType
  name?: string
  email?: string
  phoneNumber?: string
  subject?: string
  message?: string
  additionalInfo?: string
  prayerRequest?: string
  confidential?: boolean
}

export async function createGetInTouchSubmission(input: CreateGetInTouchSubmissionInput) {
  if (!supabase) {
    throw new Error('Contact forms are unavailable. Configure Supabase environment variables.')
  }

  const { error } = await supabase.from('get_in_touch_submissions').insert({
    form_type: input.formType,
    name: input.name?.trim() || null,
    email: input.email?.trim() || null,
    phone_number: input.phoneNumber?.trim() || null,
    subject: input.subject?.trim() || null,
    message: input.message?.trim() || null,
    additional_info: input.additionalInfo?.trim() || null,
    prayer_request: input.prayerRequest?.trim() || null,
    confidential: Boolean(input.confidential),
  })

  if (error) {
    if (error.code === '42P01') {
      throw new Error(
        'Database table "get_in_touch_submissions" was not found. Run sql/get_in_touch.sql in Supabase SQL Editor.',
      )
    }

    if (error.code === '42501') {
      throw new Error(
        'Insert permission denied. Check grants and RLS policies for get_in_touch_submissions.',
      )
    }

    throw new Error(error.message || 'Unable to submit right now.')
  }
}
