import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import CourseForm from './CourseForm'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <CourseForm />
      </MemoryRouter>
    </AuthProvider>,
  )
})
