import { Link } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { Button } from './ui/button'

export default function NavBar() {

  const handleRefresh = () => {
    window.dispatchEvent(new CustomEvent('refresh-requests'))
  }

  return (
    <header className="bg-white border-b">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold text-gray-900">
          Rainforest Mantenimiento
        </Link>
        <nav className="flex items-center gap-6 text-sm">

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="gap-2 text-gray-600 hover:text-gray-900"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        </nav>
      </div>
    </header>
  )
}
