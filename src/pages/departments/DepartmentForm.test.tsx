import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import DepartmentForm from './DepartmentForm'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <DepartmentForm />
      </MemoryRouter>
    </AuthProvider>,
  )
})
