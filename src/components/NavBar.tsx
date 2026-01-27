import { Link, NavLink } from 'react-router-dom'

export default function NavBar() {
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
          <NavLink
            to="/requests"
            className={({ isActive }) =>
              [
                'inline-flex items-center border-b-2',
                isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900',
              ].join(' ')
            }
          >
            Solicitudes
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
