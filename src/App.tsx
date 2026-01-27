import { Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import RequestsList from './pages/RequestsList'
import RequestDetail from './pages/RequestDetail'
import './App.css'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/requests" element={<RequestsList />} />
          <Route path="/requests/:id" element={<RequestDetail />} />
        </Routes>
      </main>
      <footer className="mt-8 border-t bg-white">
        <div className="mx-auto max-w-5xl px-4 py-3 text-xs text-gray-500">
          Rainforest • Mantenimiento
        </div>
      </footer>
    </div>
  )
}
