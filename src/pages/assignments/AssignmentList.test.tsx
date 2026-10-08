import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import AssignmentList from './AssignmentList'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <AssignmentList />
      </MemoryRouter>
    </AuthProvider>,
  )
})
