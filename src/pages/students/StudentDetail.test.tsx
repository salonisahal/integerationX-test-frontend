import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import StudentDetail from './StudentDetail'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <StudentDetail />
      </MemoryRouter>
    </AuthProvider>,
  )
})
