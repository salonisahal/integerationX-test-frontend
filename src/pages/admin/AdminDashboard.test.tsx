import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import AdminDashboard from './AdminDashboard'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    </AuthProvider>,
  )
})
