import { useState, useEffect } from 'react'
import { useLibrary } from './use-library'

interface LibraryItem {
  _id: string
  title: string
  category: string
  city?: string
  country?: string
  basePrice?: number
  currency: string
  multimedia: string[]
  notes?: string
  createdAt: Date
}

interface UseLibraryIntegrationProps {
  searchQuery?: string
  categoryFilter?: string
}

export function useLibraryIntegration({ searchQuery = '', categoryFilter = 'all' }: UseLibraryIntegrationProps = {}) {
  const { items: allItems, loading } = useLibrary()
  const [filteredItems, setFilteredItems] = useState<LibraryItem[]>([])

  useEffect(() => {
    let filtered = allItems.filter(item => {
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.city?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.country?.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = categoryFilter === 'all' || 
        item.category.toLowerCase() === categoryFilter ||
        (categoryFilter === 'others' && !['flight', 'hotel', 'activity', 'transfer', 'meal'].includes(item.category.toLowerCase()))
      
      return matchesSearch && matchesCategory
    })

    setFilteredItems(filtered)
  }, [allItems, searchQuery, categoryFilter])

  const getLibraryItemById = (id: string) => {
    return allItems.find(item => item._id === id)
  }

  const getLibraryItemsByCategory = (category: string) => {
    return allItems.filter(item => item.category.toLowerCase() === category.toLowerCase())
  }

  const getUsedLibraryItems = (itinerary: any) => {
    if (!itinerary?.days) return []
    
    const usedItems: LibraryItem[] = []
    itinerary.days.forEach((day: any) => {
      day.events?.forEach((event: any) => {
        if (event.libraryItemId) {
          const libraryItem = getLibraryItemById(event.libraryItemId)
          if (libraryItem && !usedItems.find(item => item._id === libraryItem._id)) {
            usedItems.push(libraryItem)
          }
        }
      })
    })
    
    return usedItems
  }

  return {
    allItems,
    filteredItems,
    loading,
    getLibraryItemById,
    getLibraryItemsByCategory,
    getUsedLibraryItems
  }
}
