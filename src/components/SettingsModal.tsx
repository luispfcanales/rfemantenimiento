import { useEffect, useState } from 'react'
import { fetchTeams, type Team } from '../lib/api'
import { useFilter } from '../context/FilterContext'
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from './ui/dialog'
import { Settings } from 'lucide-react'

export function SettingsModal() {
    const [open, setOpen] = useState(false)
    const [teams, setTeams] = useState<Team[]>([])
    const { toggleTeam, isTeamSelected, refreshInterval, setRefreshInterval } = useFilter()

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'k') {
                e.preventDefault()
                setOpen((prev) => !prev)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        if (open && teams.length === 0) {
            fetchTeams().then(setTeams).catch(console.error)
        }
    }, [open, teams.length])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[450px] overflow-hidden p-0 rounded-2xl border-none shadow-2xl">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white text-center relative overflow-hidden">
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_70%)] animate-pulse pointer-events-none" />
                    <Settings className="h-12 w-12 mx-auto mb-3 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                    <DialogTitle className="text-2xl font-bold tracking-tight">Configuraciones</DialogTitle>
                    <p className="text-gray-400 text-xs mt-1">Personaliza tu experiencia de monitoreo</p>
                </div>

                <div className="p-6 bg-white space-y-8">
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-6 w-1 bg-blue-500 rounded-full" />
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Filtros de Equipo</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-1.5 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
                            {teams.length === 0 ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2" />
                                    <p className="text-sm text-gray-400 italic">Cargando equipos...</p>
                                </div>
                            ) : (
                                teams.map((team) => {
                                    const selected = isTeamSelected(team.id)
                                    return (
                                        <label
                                            key={team.id}
                                            className={`
                                                flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border
                                                ${selected
                                                    ? 'bg-blue-50 border-blue-100 shadow-sm ring-1 ring-blue-500/20'
                                                    : 'hover:bg-gray-50 border-transparent hover:border-gray-100'}
                                            `}
                                        >
                                            <div className={`
                                                h-5 w-5 rounded-md border flex items-center justify-center transition-colors
                                                ${selected ? 'bg-blue-600 border-blue-600 shadow-sm' : 'bg-white border-gray-300'}
                                            `}>
                                                {selected && <div className="h-2.5 w-2.5 bg-white rounded-full shadow-inner" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selected}
                                                onChange={() => toggleTeam(team.id)}
                                            />
                                            <span className={`text-sm font-semibold ${selected ? 'text-blue-900' : 'text-gray-700'}`}>
                                                {team.name}
                                            </span>
                                        </label>
                                    )
                                })
                            )}
                        </div>
                    </section>

                    <section className="bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-inner">
                        <div className="flex items-center gap-2 mb-4 text-blue-800">
                            <div className="p-1.5 bg-blue-100 rounded-lg">
                                <Settings className="h-4 w-4" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-widest">Auto-Actualización</h3>
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                Intervalo de actualización (minutos)
                            </label>
                            <div className="flex items-center justify-between gap-4">
                                <div className="relative flex-1 group">
                                    <input
                                        type="number"
                                        min="0"
                                        max="60"
                                        value={refreshInterval}
                                        onChange={(e) => setRefreshInterval(Math.max(0, parseInt(e.target.value || '0', 10)))}
                                        className="w-full rounded-xl border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold text-gray-900 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs group-focus-within:text-blue-500 transition-colors">
                                        min
                                    </div>
                                </div>
                                <div className={`text-sm px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm flex-1 text-center whitespace-nowrap
                                    ${refreshInterval === 0
                                        ? 'bg-gray-200 text-gray-600'
                                        : 'bg-green-500 text-white shadow-green-500/20'}
                                `}>
                                    {refreshInterval === 0 ? 'Desactivado' : refreshInterval === 1 ? 'Activo' : 'Activo'}
                                </div>
                            </div>
                            {refreshInterval > 0 && (
                                <p className="text-[10px] text-green-600 font-semibold text-center italic mt-1">
                                    La información se actualizará cada {refreshInterval} {refreshInterval === 1 ? 'minuto' : 'minutos'}
                                </p>
                            )}
                        </div>
                    </section>

                    <div className="pt-2">
                        <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                            <div className="h-1 w-1 bg-green-400 rounded-full animate-pulse" />
                            Guardado automático
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}


