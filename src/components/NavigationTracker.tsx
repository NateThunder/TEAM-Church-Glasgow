import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function NavigationTracker() {
  const location = useLocation()

  useEffect(() => {
    // Hook analytics or page view tracking here.
    // Example: analytics.page(location.pathname)
    // eslint-disable-next-line no-console
    console.log('Route change:', location.pathname)
  }, [location.pathname])

  return null
}
