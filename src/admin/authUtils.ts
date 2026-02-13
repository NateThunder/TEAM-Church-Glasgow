import type { User } from '@supabase/supabase-js'

export const requiresPasswordChange = (user: Pick<User, 'user_metadata'> | null | undefined) => {
  const flag = (user?.user_metadata as Record<string, unknown> | undefined)?.must_change_password
  return flag === true || flag === 'true' || flag === 1 || flag === '1'
}

export const isMissingJwtUserError = (error: unknown) => {
  if (!error) return false
  const message =
    typeof error === 'string'
      ? error
      : error instanceof Error
      ? error.message
      : String(error)
  return message.includes('User from sub claim in JWT does not exist')
}
