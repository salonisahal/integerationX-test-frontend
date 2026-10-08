import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import NotificationsPage from './NotificationsPage'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    </AuthProvider>,
  )
})
