import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import DepartmentList from './DepartmentList'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <DepartmentList />
      </MemoryRouter>
    </AuthProvider>,
  )
})
