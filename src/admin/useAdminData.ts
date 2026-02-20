import { useContext } from 'react'
import { adminDataContext } from './adminDataStore'

export function useAdminData() {
  const context = useContext(adminDataContext)
  if (!context) {
    throw new Error('useAdminData must be used within AdminDataProvider')
  }
  return context
}
