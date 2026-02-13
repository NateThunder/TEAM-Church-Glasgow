import { Link } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import AdminCard from './components/AdminCard'

const cards = [
  {
    title: 'Events',
    description: 'Add and update upcoming events.',
    to: '/admin/events',
  },
  {
    title: 'Teams',
    description: 'Manage serving teams and details.',
    to: '/admin/teams',
  },
  {
    title: 'Believers Class',
    description: 'Edit the class content shown on the Serve page.',
    to: '/admin/believers-class',
  },
  {
    title: 'Groups',
    description: 'Publish and edit small groups.',
    to: '/admin/groups',
  },
  {
    title: 'Announcements',
    description: 'Post updates for the church.',
    to: '/admin/announcements',
  },
]

export default function AdminDashboardPage() {
  return (
    <AdminLayout title="Dashboard" description="Quick access to the areas you manage most.">
      <div className="admin-grid">
        {cards.map((card) => (
          <Link key={card.title} to={card.to} className="admin-link-reset">
            <AdminCard className="admin-card-link">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </AdminCard>
          </Link>
        ))}
      </div>
    </AdminLayout>
  )
}
