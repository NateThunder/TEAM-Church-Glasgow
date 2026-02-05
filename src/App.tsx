import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
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
      <Layout navItems={routes.map(({ path, label }) => ({ path, label }))}>
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
