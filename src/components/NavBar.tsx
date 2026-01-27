import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { Button } from './ui/button'

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleRefresh = () => {
    if (location.pathname !== '/requests') {
      navigate('/requests')
    }
    // Small delay to ensure the component is mounted if we just navigated
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('refresh-requests'))
    }, 10)
  }

  return (
    <header className="bg-white border-b">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold text-gray-900">
          Rainforest Mantenimiento
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <NavLink
            to="/"
            className={({ isActive }) =>
              [
                'inline-flex items-center border-b-2',
                isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900',
              ].join(' ')
            }
          >
            Inicio
          </NavLink>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="gap-2 text-gray-600 hover:text-gray-900"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </nav>
      </div>
    </header>
  )
}
