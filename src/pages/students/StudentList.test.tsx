import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import StudentList from './StudentList'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <StudentList />
      </MemoryRouter>
    </AuthProvider>,
  )
})
