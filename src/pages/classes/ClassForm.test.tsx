import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import ClassForm from './ClassForm'

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <ClassForm />
      </MemoryRouter>
    </AuthProvider>,
  )
})
