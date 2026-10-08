import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import StudentForm from './StudentForm'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <StudentForm />
      </MemoryRouter>
    </AuthProvider>,
  )
})
