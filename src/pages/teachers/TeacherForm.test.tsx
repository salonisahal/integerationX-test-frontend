import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import TeacherForm from './TeacherForm'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <TeacherForm />
      </MemoryRouter>
    </AuthProvider>,
  )
})
