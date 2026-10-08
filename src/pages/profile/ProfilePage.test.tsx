import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import ProfilePage from './ProfilePage'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    </AuthProvider>,
  )
})
