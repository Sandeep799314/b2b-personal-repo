"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useLibrary } from "@/hooks/use-library"
import { Search, Edit, PlaneLanding, Hotel, MapPin, Car, Trash2, Package } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SelectCategoryModal } from "@/components/select-category-modal"
import { toast } from "sonner"
// (no additional types required here)

interface ILibraryItem {
  id: string
  title: string
  type: string
  date: string
  location?: string
  multimedia?: string[]
  libraryId?: string | null
  libraryName?: string
}

export function LibraryView() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showSelectCategoryModal, setShowSelectCategoryModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [activeLibraryTab, setActiveLibraryTab] = useState<'personal' | 'public'>('personal')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activeLibraryGroupId, setActiveLibraryGroupId] = useState<string>('')
  const [showCreateLibraryModal, setShowCreateLibraryModal] = useState(false)
  const [newLibraryName, setNewLibraryName] = useState('')
  const [newLibraryDescription, setNewLibraryDescription] = useState('')
  const [creatingLibrary, setCreatingLibrary] = useState(false)
  const [showEditLibraryModal, setShowEditLibraryModal] = useState(false)
  const [editLibraryId, setEditLibraryId] = useState<string | null>(null)
  const [editLibraryName, setEditLibraryName] = useState('')
  const [editLibraryDescription, setEditLibraryDescription] = useState('')
  const [editingLibrary, setEditingLibrary] = useState(false)
  const [showManageLibraryModal, setShowManageLibraryModal] = useState(false)
  const [manageAction, setManageAction] = useState<'edit' | 'delete' | null>(null)
  const [selectedManageLibraryId, setSelectedManageLibraryId] = useState<string | null>(null)
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null)

  const { items: dbItems, libraries, loading, librariesLoading, deleteItem, createLibrary, updateLibrary, deleteLibrary, fetchLibraries } = useLibrary()

  // Transform DB items to component format
  const items: ILibraryItem[] = dbItems.map(item => {
    const createdDate = item.createdAt ? new Date(item.createdAt) : new Date()
    const isValidDate = createdDate instanceof Date && !isNaN(createdDate.getTime())
    const normalizedCategory = (item.category || 'activity').toLowerCase()

    return {
      id: item._id,
      title: item.title,
      type: normalizedCategory,
      date: isValidDate ? createdDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      location: item.city || item.country,
      multimedia: item.multimedia || [],
      libraryId: item.libraryCollection?._id ?? null,
      libraryName: item.libraryCollection?.name || undefined,
    }
  })

  const getIcon = (type: ILibraryItem['type']) => {
    switch (type) {
      case 'arrival':
        return <PlaneLanding className="h-4 w-4" />
      case 'transport':
        return <Car className="h-4 w-4" />
      case 'activity':
        return <MapPin className="h-4 w-4" />
      case 'hotel':
        return <Hotel className="h-4 w-4" />
    }
  }

  useEffect(() => {
    const hasUngroupedItems = dbItems.some((item) => !item.libraryCollection)

    // No libraries at all
    if (libraries.length === 0) {
      setActiveLibraryGroupId((current) => {
        if (hasUngroupedItems) {
          return current === 'ungrouped' ? current : 'ungrouped'
        }
        return ''
      })
      return
    }

    // If 'ungrouped' was selected but there are no ungrouped items anymore, switch to 'all'
    if (activeLibraryGroupId === 'ungrouped') {
      if (hasUngroupedItems) {
        return
      }
      setActiveLibraryGroupId('all')
      return
    }

    // If nothing selected, default to 'all' so users see everything
    if (!activeLibraryGroupId) {
      setActiveLibraryGroupId('all')
      return
    }

    // Validate current selection: allow 'all', 'ungrouped', or a real library id
    const isActiveValid =
      activeLibraryGroupId === 'all' ||
      activeLibraryGroupId === 'ungrouped' ||
      libraries.some((library) => library._id === activeLibraryGroupId)

    if (!isActiveValid) {
      setActiveLibraryGroupId('all')
    }
  }, [libraries, dbItems, activeLibraryGroupId])

  const categories = ['all', 'flight', 'hotel', 'activity', 'transfer', 'ancillaries', 'others', 'meal', 'note']

  const ungroupedExists = items.some(item => !item.libraryId)

  const libraryOptions = useMemo(() => {
    const base: Array<{ id: string, name: string, description?: string, isVirtual: boolean }> = []

    // Add an "All Items" option to show items across all libraries
    base.push({
      id: 'all',
      name: 'All Items',
      description: 'Items from all libraries',
      isVirtual: true,
    })

    // Then add actual libraries
    base.push(...libraries.map((library) => ({
      id: library._id,
      name: library.name,
      description: library.description,
      isVirtual: false,
    })))

    // Keep a separate entry for items without a library (ungrouped)
    if (ungroupedExists) {
      base.push({
        id: 'ungrouped',
        name: 'Without Library',
        description: 'Items without a library',
        isVirtual: true,
      })
    }

    return base
  }, [libraries, ungroupedExists])

  const filteredItems = items
    .filter(item => {
      const matchesLibrary = activeLibraryGroupId
        ? activeLibraryGroupId === 'ungrouped'
          ? !item.libraryId
          : activeLibraryGroupId === 'all'
            ? true
            : item.libraryId === activeLibraryGroupId
        : true
      const normalizedCategory = item.type.toLowerCase()
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = (
        selectedCategory === 'all' ||
        normalizedCategory === selectedCategory ||
        (selectedCategory === 'others' && !['flight', 'hotel', 'activity', 'transfer', 'meal', 'ancillaries', 'package'].includes(normalizedCategory))
      )
      return matchesLibrary && matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

  const handleSelectItem = (id: string) => {
    if (isEditMode) {
      setSelectedItems(prev =>
        prev.includes(id)
          ? prev.filter(itemId => itemId !== id)
          : [...prev, id]
      )
    }
  }

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(items.map(item => item.id))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedItems.length > 0) {
      if (confirm(`Are you sure you want to delete ${selectedItems.length} selected items?`)) {
        try {
          await Promise.all(selectedItems.map(id => deleteItem(id)))
          setSelectedItems([])
          setIsEditMode(false)
          toast.success(`${selectedItems.length} items deleted`)
        } catch (error) {
          toast.error('Failed to delete items')
        }
      }
    }
  }

  const handleEditItem = (item: any) => {
    setEditingItem(item)
    setShowAddModal(true)
  }

  const handleOpenCreateItem = () => {
    // Always open the Add Item modal so users can create or select a library there.
    // Previously we blocked opening when no real library was selected which made the
    // button appear unresponsive. Open the modal and let the user pick or create a library.
    setShowSelectCategoryModal(true)
  }

  const handleCreateLibrarySubmit = async () => {
    const name = newLibraryName.trim()
    if (!name) {
      toast.error('Library name is required')
      return
    }

    setCreatingLibrary(true)
    try {
      const created = await createLibrary({ name, description: newLibraryDescription.trim() || undefined })
      if (created?._id) {
        setActiveLibraryGroupId(created._id)
      }
      toast.success('Library created successfully')
      setShowCreateLibraryModal(false)
      setNewLibraryName('')
      setNewLibraryDescription('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create library'
      toast.error(message)
    } finally {
      setCreatingLibrary(false)
    }
  }

  // Edit Library
  const openEditLibrary = (lib: { id: string; name: string; description?: string }) => {
    setEditLibraryId(lib.id)
    setEditLibraryName(lib.name)
    setEditLibraryDescription(lib.description || '')
    setShowEditLibraryModal(true)
  }

  const handleEditLibrarySubmit = async () => {
    if (!editLibraryId) return
    const name = editLibraryName.trim()
    if (!name) {
      toast.error('Library name is required')
      return
    }

    setEditingLibrary(true)
    try {
      await updateLibrary(editLibraryId, { name, description: editLibraryDescription.trim() || undefined })
      toast.success('Library updated')
      setShowEditLibraryModal(false)
      setEditLibraryId(null)
      await fetchLibraries()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update library'
      toast.error(message)
    } finally {
      setEditingLibrary(false)
    }
  }

  const handleDeleteLibrary = async (id: string) => {
    if (!confirm('Are you sure you want to delete this library? Items inside will become ungrouped.')) return
    try {
      await deleteLibrary(id)
      toast.success('Library deleted')
      if (activeLibraryGroupId === id) {
        setActiveLibraryGroupId('all')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete library'
      toast.error(message)
    }
  }

  useEffect(() => {
    if (!showCreateLibraryModal) {
      setNewLibraryName('')
      setNewLibraryDescription('')
    }
  }, [showCreateLibraryModal])

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden">

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Library Type Tabs (Products view) */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex space-x-1">
            {[
              { id: 'personal', label: 'My Library' },
              { id: 'public', label: 'Global Library' }
            ].map((library) => (
              <Button
                key={library.id}
                onClick={() => setActiveLibraryTab(library.id as any)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeLibraryTab === library.id
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {library.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Top-level Tabs: Products / Itineraries */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  // Products shows the existing library tabs
                  setActiveLibraryTab((prev) => prev || 'personal')
                  // keep users on the same page
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  /* products is default view inside LibraryView */
                  'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
              >
                Products
              </Button>

              <Button
                onClick={() => {
                  // navigate to the itineraries page and indicate origin so itinerary page can show a back button
                  router.push('/itinerary?from=library')
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Itineraries
              </Button>
            </div>
          </div>
        </div>

        {/* Library Content */}
        <div className="flex-1 p-6 overflow-auto">
          {activeLibraryTab === 'personal' ? (
            <div>
              {/* Personal Library Header */}
              <div className="mb-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">My Library</h2>
                    <p className="text-sm text-gray-600">Manage your personal travel library items</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => router.push('/itinerary?from=library')}
                      className="border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Package className="h-4 w-4" />
                      <span>Itineraries</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewLibraryName('')
                        setNewLibraryDescription('')
                        setShowCreateLibraryModal(true)
                      }}
                      className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      New Playlist
                    </Button>
                    <Button
                      onClick={handleOpenCreateItem}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      + Add Item
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mb-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {librariesLoading ? (
                      <p className="text-sm text-gray-500">Loading libraries...</p>
                    ) : libraryOptions.length === 0 ? (
                      <p className="text-sm text-gray-500">Create a library to start adding items.</p>
                    ) : (
                      libraryOptions.map((library) => {
                        const isActive = library.id === activeLibraryGroupId
                        const btnClass = isActive ? 'bg-black text-white hover:bg-black/90' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'

                        // Render only the library selector button here. The edit/delete controls
                        // are shown once for the currently selected (real) library below.
                        return (
                          <Button
                            key={library.id}
                            variant={isActive ? 'default' : 'outline'}
                            onClick={() => setActiveLibraryGroupId(library.id)}
                            className={btnClass}
                          >
                            {library.name}
                          </Button>
                        )
                      })
                    )}
                  </div>

                  {/* Single edit/delete controls for the selected real library */}
                  <div className="flex items-center gap-2">
                    {libraries.length > 0 ? (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => {
                          setManageAction('edit')
                          // default selection to currently active real library if present
                          const defaultLib = libraries.some(l => l._id === activeLibraryGroupId) ? activeLibraryGroupId : (libraries[0]?._id ?? null)
                          setSelectedManageLibraryId(defaultLib)
                          setShowManageLibraryModal(true)
                        }} className="p-1">
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button size="sm" variant="ghost" onClick={() => {
                          setManageAction('delete')
                          const defaultLib = libraries.some(l => l._id === activeLibraryGroupId) ? activeLibraryGroupId : (libraries[0]?._id ?? null)
                          setSelectedManageLibraryId(defaultLib)
                          setShowManageLibraryModal(true)
                        }} className="p-1 text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Category Filter */}
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Category:</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sort Filter */}
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Sort:</label>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                      </select>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search library items..."
                      className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Library Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-sm text-gray-500">Loading library items...</p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-sm text-gray-500">No library items found</p>
                    <p className="text-xs text-gray-400 mt-1">Create your first library item to get started</p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <Card key={item.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="relative mb-3">
                          {item.multimedia && item.multimedia.length > 0 ? (
                            <img
                              src={item.multimedia[0]}
                              alt={item.title}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                              {getIcon(item.type)}
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <Button
                              onClick={() => handleEditItem(dbItems.find(dbItem => dbItem._id === item.id))}
                              className="bg-white/80 hover:bg-white text-gray-700 p-1 rounded"
                              size="sm"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => setDeleteConfirmationId(item.id)}
                              className="bg-white/80 hover:bg-white text-red-600 p-1 rounded hover:bg-red-50"
                              size="sm"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">{item.title}</h3>
                          {item.location && (
                            <p className="text-xs text-gray-500 mb-2">{item.location}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {format(new Date(item.date), 'MMM dd, yyyy')}
                            </span>
                            {item.multimedia && item.multimedia.length > 1 && (
                              <span className="text-xs text-gray-400">+{item.multimedia.length - 1} more</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Global Library</h2>
              <p className="text-sm text-gray-500">Coming Soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Select Category Modal */}
      <SelectCategoryModal
        isOpen={showSelectCategoryModal}
        onClose={() => setShowSelectCategoryModal(false)}
        onItemCreated={() => {
          setShowSelectCategoryModal(false)
          toast.success('Library item created successfully')
        }}
        defaultLibraryId={libraries.some(lib => lib._id === activeLibraryGroupId) ? activeLibraryGroupId : undefined}
      />

      {/* Add/Edit Modal */}
      {editingItem && (
        <SelectCategoryModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false)
            setEditingItem(null)
          }}
          onItemCreated={() => {
            setShowAddModal(false)
            setEditingItem(null)
            toast.success('Library item updated successfully')
          }}
          editingItem={editingItem}
          defaultLibraryId={editingItem?.libraryCollection?._id}
        />
      )}

      <Dialog open={showCreateLibraryModal} onOpenChange={setShowCreateLibraryModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Library</DialogTitle>
            <DialogDescription>Organize your items by creating a dedicated library folder.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="libraryName" className="text-sm font-medium text-gray-700">Library Name</Label>
              <Input
                id="libraryName"
                value={newLibraryName}
                onChange={(e) => setNewLibraryName(e.target.value)}
                placeholder="E.g. Bali Activities"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="libraryDescription" className="text-sm font-medium text-gray-700">Description (optional)</Label>
              <Textarea
                id="libraryDescription"
                value={newLibraryDescription}
                onChange={(e) => setNewLibraryDescription(e.target.value)}
                placeholder="Tell your team what belongs in this library"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateLibraryModal(false)}>Cancel</Button>
            <Button
              onClick={handleCreateLibrarySubmit}
              disabled={creatingLibrary || !newLibraryName.trim()}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {creatingLibrary ? 'Creating...' : 'Create Library'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Library Modal: choose a library to edit or delete */}
      <Dialog open={showManageLibraryModal} onOpenChange={setShowManageLibraryModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{manageAction === 'delete' ? 'Delete Library' : 'Edit Library'}</DialogTitle>
            <DialogDescription>
              {manageAction === 'delete'
                ? 'Choose a library to delete. Items inside will become ungrouped.'
                : 'Choose a library to edit.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            {libraries.length === 0 ? (
              <p className="text-sm text-gray-500">No libraries available.</p>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Library</label>
                <select
                  value={selectedManageLibraryId ?? ''}
                  onChange={(e) => setSelectedManageLibraryId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {libraries.map(lib => (
                    <option key={lib._id} value={lib._id}>{lib.name}</option>
                  ))}
                </select>
                {manageAction === 'delete' && (
                  <p className="text-xs text-gray-500">This action will remove the selected library. Items will not be deleted but become ungrouped.</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManageLibraryModal(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!selectedManageLibraryId) return
                if (manageAction === 'edit') {
                  const lib = libraries.find(l => l._id === selectedManageLibraryId)
                  if (lib) openEditLibrary({ id: lib._id, name: lib.name, description: lib.description })
                  setShowManageLibraryModal(false)
                } else if (manageAction === 'delete') {
                  // handleDeleteLibrary will prompt a confirmation
                  handleDeleteLibrary(selectedManageLibraryId)
                  setShowManageLibraryModal(false)
                }
              }}
              className={manageAction === 'delete' ? 'text-white bg-red-600 hover:bg-red-700' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}
            >
              {manageAction === 'delete' ? 'Delete' : 'Edit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showEditLibraryModal} onOpenChange={(v) => { if (!v) { setShowEditLibraryModal(false); setEditLibraryId(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Library</DialogTitle>
            <DialogDescription>Update library name and description.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="editLibraryName" className="text-sm font-medium text-gray-700">Library Name</Label>
              <Input
                id="editLibraryName"
                value={editLibraryName}
                onChange={(e) => setEditLibraryName(e.target.value)}
                placeholder="E.g. Bali Activities"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="editLibraryDescription" className="text-sm font-medium text-gray-700">Description (optional)</Label>
              <Textarea
                id="editLibraryDescription"
                value={editLibraryDescription}
                onChange={(e) => setEditLibraryDescription(e.target.value)}
                placeholder="Tell your team what belongs in this library"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditLibraryModal(false); setEditLibraryId(null); }}>Cancel</Button>
            <Button
              onClick={handleEditLibrarySubmit}
              disabled={editingLibrary || !editLibraryName.trim()}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {editingLibrary ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Item Confirmation Dialog */}
      <Dialog open={!!deleteConfirmationId} onOpenChange={(open) => !open && setDeleteConfirmationId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <Trash2 className="h-5 w-5" />
              <DialogTitle className="text-xl">Caution: Delete Item?</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              This action cannot be undone. Are you sure you want to permanently delete this item from your library?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmationId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (deleteConfirmationId) {
                  await deleteItem(deleteConfirmationId)
                  setDeleteConfirmationId(null)
                  toast.success('Item deleted successfully')
                }
              }}
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

