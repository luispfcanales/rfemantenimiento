import React, { createContext, useContext, useState, useEffect } from 'react'

type FilterContextType = {
    selectedTeamIds: Set<number>
    toggleTeam: (id: number) => void
    isTeamSelected: (id: number) => boolean
    refreshInterval: number // in minutes, 0 means off
    setRefreshInterval: (minutes: number) => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedTeamIds, setSelectedTeamIds] = useState<Set<number>>(new Set())
    const [refreshInterval, setRefreshInterval] = useState<number>(0)

    // Load from localStorage on mount
    useEffect(() => {
        const savedIds = localStorage.getItem('selectedTeamIds')
        if (savedIds) {
            try {
                const ids = JSON.parse(savedIds)
                if (Array.isArray(ids)) {
                    setSelectedTeamIds(new Set(ids))
                }
            } catch (e) {
                console.error('Error loading filters from localStorage', e)
            }
        }

        const savedInterval = localStorage.getItem('refreshInterval')
        if (savedInterval) {
            const interval = parseInt(savedInterval, 10)
            if (!isNaN(interval)) {
                setRefreshInterval(interval)
            }
        }
    }, [])

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('selectedTeamIds', JSON.stringify(Array.from(selectedTeamIds)))
    }, [selectedTeamIds])

    useEffect(() => {
        localStorage.setItem('refreshInterval', refreshInterval.toString())
    }, [refreshInterval])

    const toggleTeam = (id: number) => {
        setSelectedTeamIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const isTeamSelected = (id: number) => selectedTeamIds.has(id)

    return (
        <FilterContext.Provider value={{ selectedTeamIds, toggleTeam, isTeamSelected, refreshInterval, setRefreshInterval }}>
            {children}
        </FilterContext.Provider>
    )
}


export const useFilter = () => {
    const context = useContext(FilterContext)
    if (context === undefined) {
        throw new Error('useFilter must be used within a FilterProvider')
    }
    return context
}
