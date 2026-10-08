import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import ClassList from './ClassList'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <ClassList />
      </MemoryRouter>
    </AuthProvider>,
  )
})
