import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import CourseDetail from './CourseDetail'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <CourseDetail />
      </MemoryRouter>
    </AuthProvider>,
  )
})
