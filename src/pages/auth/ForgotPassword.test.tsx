import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import ForgotPassword from './ForgotPassword'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    </AuthProvider>,
  )
})
