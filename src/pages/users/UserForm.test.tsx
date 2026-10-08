import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import UserForm from './UserForm'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <UserForm />
      </MemoryRouter>
    </AuthProvider>,
  )
})
