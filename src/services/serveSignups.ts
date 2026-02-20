import { supabase } from './supabaseClient'

export type CreateServeSignupInput = {
  teamKey: string
  teamName: string
  applicantName: string
  email: string
  phoneNumber?: string
  message?: string
}

export async function createServeSignup(input: CreateServeSignupInput) {
  if (!supabase) {
    throw new Error('Signups are unavailable. Configure Supabase environment variables.')
  }

  const { error } = await supabase.from('serve_signups').insert({
    team_key: input.teamKey.trim(),
    team_name: input.teamName.trim(),
    applicant_name: input.applicantName.trim(),
    email: input.email.trim(),
    phone_number: input.phoneNumber?.trim() || null,
    message: input.message?.trim() || null,
  })

  if (error) {
    throw error
  }
}
