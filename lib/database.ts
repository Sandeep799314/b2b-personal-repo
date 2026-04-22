// TODO: Replace with MongoDB implementation
interface LibraryItem {
  id: string
  title: string
  description?: string
  category?: string
  sub_category?: string
  price?: number
  currency?: string
  provider?: string
  confirmation_number?: string
  available_from?: string
  available_to?: string
  availability_status?: string
  max_capacity?: number
  current_bookings?: number
  tags?: string[]
  media_urls?: string[]
  extra_fields?: Record<string, any>
  [key: string]: any
}

class LibraryServiceTemp {
  private items: Map<string, LibraryItem> = new Map()

  async getById(id: string): Promise<LibraryItem | null> {
    return this.items.get(id) || null
  }

  async create(data: Omit<LibraryItem, 'id'>): Promise<LibraryItem> {
    const id = Math.random().toString(36).substring(7)
    const item = { id, title: data.title, ...data } as LibraryItem
    this.items.set(id, item)
    return item
  }

  async update(id: string, data: Partial<LibraryItem>): Promise<LibraryItem | null> {
    const existing = this.items.get(id)
    if (!existing) return null
    const updated = { ...existing, ...data }
    this.items.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    return this.items.delete(id)
  }

  async list(options: { 
    category?: string 
    search?: string
  } = {}): Promise<LibraryItem[]> {
    let items = Array.from(this.items.values())
    
    if (options.category) {
      items = items.filter(item => item.category === options.category)
    }
    
    if (options.search) {
      const search = options.search.toLowerCase()
      items = items.filter(item => 
        item.title?.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search)
      )
    }

    return items
  }

  async getStats(): Promise<{ [key: string]: number }> {
    const stats: { [key: string]: number } = {}
    this.items.forEach(item => {
      if (item.category) {
        stats[item.category] = (stats[item.category] || 0) + 1
      }
    })
    return stats
  }
}

// Export a singleton instance
export const LibraryService = new LibraryServiceTemp()
