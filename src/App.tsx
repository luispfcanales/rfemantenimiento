import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import RequestsList from './pages/RequestsList'
import RequestDetail from './pages/RequestDetail'
import { FilterProvider } from './context/FilterContext'
import { SettingsModal } from './components/SettingsModal'
import './App.css'

export default function App() {
  return (
    <FilterProvider>
      <div className="min-h-screen flex flex-col bg-gray-50/50">
        <main className="mx-auto w-full flex-1 px-0 md:px-12 pt-0 md:pt-0 pb-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/requests" element={<RequestsList />} />
            <Route path="/requests/:id" element={<RequestDetail item={null as any} />} />
          </Routes>
        </main>
        <footer className="mt-8 border-t bg-white">
          <div className="mx-auto w-full px-0 md:px-12 py-3 text-xs text-gray-500 text-center">
            Rainforest • Mantenimiento • Presiona <kbd className="font-sans px-1 py-0.5 rounded border bg-gray-50 ml-1">Ctrl+Shift+K</kbd> para configuraciones
          </div>
        </footer>
        <SettingsModal />
      </div>
    </FilterProvider>
  )
}


