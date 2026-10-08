import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import StudentDashboard from './StudentDashboard'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <StudentDashboard />
      </MemoryRouter>
    </AuthProvider>,
  )
})
