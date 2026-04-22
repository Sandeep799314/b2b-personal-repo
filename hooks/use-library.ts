import { useState, useEffect, useCallback } from 'react'

interface LibraryItem {
  _id: string
  title: string
  category: string
  subCategory: string
  city: string
  country: string
  startDate: string
  endDate: string
  labels: string
  notes: string
  transferOptions: string[]
  basePrice?: number
  currency: string
  availableFrom?: Date
  availableUntil?: Date
  variants: string
  multimedia: string[]
  createdAt: Date
  updatedAt: Date
  libraryCollection?: {
    _id: string
    name: string
    description?: string
  } | null
}

interface LibraryCollection {
  _id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export function useLibrary() {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [libraries, setLibraries] = useState<LibraryCollection[]>([])
  const [loading, setLoading] = useState(false)
  const [librariesLoading, setLibrariesLoading] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/library')
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error?.error || 'Failed to fetch items')
      }
      const data = await response.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch items:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLibraries = useCallback(async () => {
    setLibrariesLoading(true)
    try {
      const response = await fetch('/api/library-collections')
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error?.error || 'Failed to fetch library collections')
      }
      const data = await response.json()
      setLibraries(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch library collections:', error)
      setLibraries([])
    } finally {
      setLibrariesLoading(false)
    }
  }, [])

  const createLibrary = async (libraryData: { name: string; description?: string }) => {
    const response = await fetch('/api/library-collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(libraryData),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error?.error || 'Failed to create library')
    }

    await fetchLibraries()
    return await response.json()
  }

  const updateLibrary = async (id: string, libraryData: { name: string; description?: string }) => {
    const response = await fetch(`/api/library-collections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(libraryData),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error?.error || 'Failed to update library')
    }

    await fetchLibraries()
    return await response.json()
  }

  const deleteLibrary = async (id: string) => {
    const response = await fetch(`/api/library-collections/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error?.error || 'Failed to delete library')
    }

    await fetchLibraries()
    return await response.json()
  }

  const createItem = async (itemData: any) => {
    const response = await fetch('/api/library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error?.error || 'Failed to create item')
    }

    await fetchItems()
    return await response.json()
  }

  const deleteItem = async (id: string) => {
    const response = await fetch(`/api/library/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error?.error || 'Failed to delete item')
    }

    await fetchItems()
    return await response.json()
  }

  const updateItem = async (id: string, itemData: any) => {
    const response = await fetch(`/api/library/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error?.error || 'Failed to update item')
    }

    await fetchItems()
    return await response.json()
  }

  useEffect(() => {
    fetchItems()
    fetchLibraries()
  }, [fetchItems, fetchLibraries])

  return {
    items,
    libraries,
    loading,
    librariesLoading,
    createItem,
    updateItem,
    deleteItem,
    createLibrary,
    updateLibrary,
    deleteLibrary,
    fetchItems,
    fetchLibraries,
  }
}
