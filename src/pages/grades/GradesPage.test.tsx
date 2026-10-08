import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import GradesPage from './GradesPage'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <GradesPage />
      </MemoryRouter>
    </AuthProvider>,
  )
})
