import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import TeacherList from './TeacherList'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <TeacherList />
      </MemoryRouter>
    </AuthProvider>,
  )
})
