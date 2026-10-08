import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import EnrollmentList from './EnrollmentList'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <EnrollmentList />
      </MemoryRouter>
    </AuthProvider>,
  )
})
