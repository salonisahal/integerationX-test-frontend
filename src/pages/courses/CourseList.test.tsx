import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import CourseList from './CourseList'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <CourseList />
      </MemoryRouter>
    </AuthProvider>,
  )
})
