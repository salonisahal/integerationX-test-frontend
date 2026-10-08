import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import TeacherDetail from './TeacherDetail'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <TeacherDetail />
      </MemoryRouter>
    </AuthProvider>,
  )
})
