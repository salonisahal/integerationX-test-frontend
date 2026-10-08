import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import UserList from './UserList'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <UserList />
      </MemoryRouter>
    </AuthProvider>,
  )
})
