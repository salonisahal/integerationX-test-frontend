import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import AttendancePage from './AttendancePage'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <AttendancePage />
      </MemoryRouter>
    </AuthProvider>,
  )
})
