import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './styles/globals.css'
import { Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import NavigationTracker from './components/NavigationTracker'
import ScrollToTop from './components/ScrollToTop'
import AboutPage from './pages/AboutPage'
import HomePage from './pages/HomePage'
import WatchPage from './pages/WatchPage'
import ConnectPage from './pages/ConnectPage'
import GroupsPage from './pages/GroupsPage'
import ServePage from './pages/ServePage'
import EventsPage from './pages/EventsPage'
import GivePage from './pages/GivePage'
import AdminPage from './pages/AdminPage'
import { AdminDataProvider } from './admin/AdminDataContext'
import AdminDashboardPage from './admin/AdminDashboardPage'
import AdminEventsPage from './admin/AdminEventsPage'
import AdminTeamsPage from './admin/AdminTeamsPage'
import AdminGroupsPage from './admin/AdminGroupsPage'
import AdminAnnouncementsPage from './admin/AdminAnnouncementsPage'
import AdminBelieversClassPage from './admin/AdminBelieversClassPage'
import RequireAdminAuth from './admin/RequireAdminAuth'

// Route table for the site. Add or remove pages here.
// NOTE: We keep paths lowercase to avoid URL inconsistencies.
const routes = [
  { path: '/', label: 'Home', element: <HomePage /> },
  { path: '/watch', label: 'Watch', element: <WatchPage /> },
  { path: '/about', label: 'About', element: <AboutPage /> },
  { path: '/connect', label: 'Connect', element: <ConnectPage /> },
  { path: '/groups', label: 'Groups', element: <GroupsPage /> },
  { path: '/serve', label: 'Serve', element: <ServePage /> },
  { path: '/events', label: 'Events', element: <EventsPage /> },
  { path: '/give', label: 'Give', element: <GivePage /> },
]

export default function App() {
  return (
    <BrowserRouter>
      {/* Track navigation for analytics later */}
      <NavigationTracker />
      <ScrollToTop />

      {/* Layout wraps all pages */}
      <AdminDataProvider>
        <Layout navItems={routes.map(({ path, label }) => ({ path, label }))}>
          <Routes>
            {routes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
            <Route path="/teams" element={<Navigate to="/serve" replace />} />
            <Route path="/admin/login" element={<AdminPage />} />
            <Route element={<RequireAdminAuth />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/events" element={<AdminEventsPage />} />
              <Route path="/admin/teams" element={<AdminTeamsPage />} />
              <Route path="/admin/groups" element={<AdminGroupsPage />} />
              <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
              <Route path="/admin/believers-class" element={<AdminBelieversClassPage />} />
            </Route>
          </Routes>
        </Layout>
      </AdminDataProvider>
    </BrowserRouter>
  )
}
