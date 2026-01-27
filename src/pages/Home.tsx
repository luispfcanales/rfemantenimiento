import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Panel de Mantenimiento</h1>
      <p className="mt-2 text-gray-700">
        Visualiza y navega las solicitudes de mantenimiento obtenidas desde la API.
      </p>
      <div className="mt-4">
        <Link
          to="/requests"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Ver solicitudes
        </Link>
      </div>
    </div>
  )
}
