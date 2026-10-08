import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import SettingsPage from './SettingsPage'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    </AuthProvider>,
  )
})
