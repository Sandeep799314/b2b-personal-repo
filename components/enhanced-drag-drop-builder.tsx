"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EventCard } from "@/components/itinerary-builder/event-card"
import { DayMeals } from "@/components/itinerary-builder/day-meals"
import { useLibrary } from "@/hooks/use-library"
import { ItineraryHeader } from "@/components/itinerary-builder/itinerary-header"
import type { IItineraryDay, IItineraryEvent } from "@/models/Itinerary"
import { ArrowLeft, Plus, Sun, Clock, Calendar, GripVertical, Plane, UtensilsCrossed } from "lucide-react"
import { generateUniqueId } from "@/lib/utils"

interface EnhancedDragDropBuilderProps {
  itineraryId?: string
  onBack: () => void
}

const EMPTY_DAY: IItineraryDay = {
  day: 1,
  date: new Date().toISOString().split("T")[0],
  title: "Day 1",
  events: [],
  meals: {
    breakfast: false,
    lunch: false,
    dinner: false,
  },
}

const COMPONENT_TEMPLATES = [
  {
    type: "flight",
    title: "Flight",
    icon: Plane,
    color: "bg-orange-50 border-orange-200",
  },
  {
    type: "transfer",
    title: "Transfer",
    icon: Clock,
    color: "bg-blue-50 border-blue-200",
  },
  {
    type: "hotel",
    title: "Hotel",
    icon: Sun,
    color: "bg-green-50 border-green-200",
  },
  {
    type: "activity",
    title: "Activity",
    icon: Calendar,
    color: "bg-purple-50 border-purple-200",
  },
  {
    type: "meal",
    title: "Meals",
    icon: UtensilsCrossed,
    color: "bg-yellow-50 border-yellow-200",
  },
]

export function EnhancedDragDropBuilder({ itineraryId, onBack }: EnhancedDragDropBuilderProps) {
  const [days, setDays] = useState<IItineraryDay[]>([EMPTY_DAY])
  const [title, setTitle] = useState("South of Thailand - Krabi, Phuket")
  const [description, setDescription] = useState("")
  const [isDetailedView, setIsDetailedView] = useState(true)
  const [additionalSections, setAdditionalSections] = useState<Record<string, string>>({})
  const { items: libraryItems } = useLibrary()
  const [serviceSlots, setServiceSlots] = useState<Array<{ id: string; title: string; events: IItineraryEvent[] }>>([])
  const [version, setVersion] = useState(0)
  const [highlights, setHighlights] = useState<string[]>(["Daily Breakfast", "Hotel", "Sightseeing"])
  const [hasBeenSaved, setHasBeenSaved] = useState(false)
  const [country, setCountry] = useState("Thailand")
  const [daysCount, setDaysCount] = useState(6)
  const [nightsCount, setNightsCount] = useState(5)

  const handleSave = () => {
    // Here you would typically save to your backend
    setVersion((prev) => prev + 1)
    setHasBeenSaved(true)
  }

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<{
    type: "component" | "event" | "libraryItem"
    item: any
    sourceDay?: number
    sourceIndex?: number
    sourceSlot?: number
  } | null>(null)
  const [dropTarget, setDropTarget] = useState<{ dayIndex: number; position: number } | null>(null)

  const handleDragStart = (
    type: "component" | "event" | "libraryItem",
    item: any,
    dayIndex?: number,
    eventIndex?: number,
    slotIndex?: number
  ) => {
    setDraggedItem({ type, item, sourceDay: dayIndex, sourceIndex: eventIndex, sourceSlot: slotIndex })
  }

  const handleLibraryDragStart = (item: any) => {
    setDraggedItem({ type: 'libraryItem', item })
  }

  const addServiceSlot = () => {
    const newSlot = { id: generateUniqueId(), title: `Service Slot ${serviceSlots.length + 1}`, events: [] as IItineraryEvent[] }
    setServiceSlots(prev => [...prev, newSlot])
  }

  const handleDropToService = (slotIndex: number, position: number) => {
    if (!draggedItem) return

    const newSlots = [...serviceSlots]

    // Dropping a component template onto a service slot -> create a new event
    if (draggedItem.type === 'component') {
      const tpl = draggedItem.item
      const newEvent: IItineraryEvent = {
        id: generateUniqueId(),
        category: tpl.type,
        title: 'New ' + tpl.title,
        description: '',
        mainPoint: '',
        highlights: []
      }
      newSlots[slotIndex].events.splice(position, 0, newEvent)
    }

    // Moving an existing event from a day into a slot
    if (draggedItem.type === 'event' && draggedItem.sourceDay !== undefined && draggedItem.sourceIndex !== undefined) {
      const newDays = [...days]
      const [movedEvent] = newDays[draggedItem.sourceDay].events.splice(draggedItem.sourceIndex, 1)
      newSlots[slotIndex].events.splice(position, 0, movedEvent)
      setDays(newDays)
    }

    // Moving an event from another slot into this slot
    if (draggedItem.type === 'event' && draggedItem.sourceSlot !== undefined && draggedItem.sourceIndex !== undefined) {
      const source = [...serviceSlots]
      const [movedEvent] = source[draggedItem.sourceSlot].events.splice(draggedItem.sourceIndex, 1)
      newSlots[slotIndex].events.splice(position, 0, movedEvent)
      // write back source modifications
      newSlots[draggedItem.sourceSlot] = source[draggedItem.sourceSlot]
    }

    // Dropping a library item into a slot
    if (draggedItem.type === 'libraryItem') {
      const lib = draggedItem.item
      const newEvent: IItineraryEvent = {
        id: generateUniqueId(),
        category: lib.category || 'activity',
        title: lib.title || 'Library Item',
        description: lib.notes || '',
        mainPoint: '',
        highlights: [],
        libraryItemId: lib._id,
      }
      newSlots[slotIndex].events.splice(position, 0, newEvent)
    }

    setServiceSlots(newSlots)
    setDraggedItem(null)
    setDropTarget(null)
  }

  const handleDragOver = (dayIndex: number, position: number) => {
    setDropTarget({ dayIndex, position })
  }

  const handleEditEvent = (dayIndex: number, eventIndex: number, updatedEvent: IItineraryEvent) => {
    const newDays = [...days]
    newDays[dayIndex].events[eventIndex] = updatedEvent
    setDays(newDays)
  }

  const handleDeleteEvent = (dayIndex: number, eventIndex: number) => {
    const newDays = [...days]
    newDays[dayIndex].events.splice(eventIndex, 1)
    setDays(newDays)
  }

  const handleDrop = (dayIndex: number, position: number) => {
    if (!draggedItem) return

    const newDays = [...days]

    if (draggedItem.type === "component") {
      // Create new event from template
      const newEvent: IItineraryEvent = {
        id: generateUniqueId(),
        category: draggedItem.item.type,
        title: "New " + draggedItem.item.title,
        description: "",
        mainPoint: "",
        highlights: [],
        ...(draggedItem.item.type === "hotel" && {
          checkIn: "14:00",
          checkOut: "12:00",
          nights: 1,
        }),
        ...(draggedItem.item.type === "flight" && {
          fromCity: "Enter origin",
          toCity: "Enter destination",
          mainPoint: "Enter flight details",
        }),
        ...(draggedItem.item.type === "meal" && {
          meals: {
            breakfast: false,
            lunch: false,
            dinner: false,
          },
        }),
      }

      newDays[dayIndex].events.splice(position, 0, newEvent)
    } else if (
      draggedItem.type === "event" &&
      draggedItem.sourceDay !== undefined &&
      draggedItem.sourceIndex !== undefined
    ) {
      // Move existing event
      const [movedEvent] = newDays[draggedItem.sourceDay].events.splice(draggedItem.sourceIndex, 1)
      newDays[dayIndex].events.splice(position, 0, movedEvent)
    }

    // Dropping a library item into a day
    if (draggedItem.type === 'libraryItem') {
      const lib = draggedItem.item
      const newEvent: IItineraryEvent = {
        id: generateUniqueId(),
        category: lib.category || 'activity',
        title: lib.title || 'Library Item',
        description: lib.notes || '',
        mainPoint: '',
        highlights: [],
        libraryItemId: lib._id,
      }

      newDays[dayIndex].events.splice(position, 0, newEvent)
    }

    setDays(newDays)
    setDraggedItem(null)
    setDropTarget(null)
  }

  const handleMealChange = (dayIndex: number, meal: keyof typeof EMPTY_DAY.meals, value: boolean) => {
    const newDays = [...days]
    newDays[dayIndex].meals[meal] = value
    setDays(newDays)
  }

  const addDay = () => {
    const newDay = {
      ...EMPTY_DAY,
      day: days.length + 1,
      title: "Day " + (days.length + 1),
      date: new Date(Date.now() + days.length * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }
    setDays([...days, newDay])
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 overflow-auto">
        {/* Back Button */}
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Itinerary Header */}
        <ItineraryHeader
          title={title}
          description={description}
          days={daysCount}
          nights={nightsCount}
          country={country}
          highlights={highlights}
          onSave={handleSave}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onHighlightsChange={setHighlights}
          onCountryChange={setCountry}
          onDaysChange={setDaysCount}
          onNightsChange={setNightsCount}
          version={version}
          hasBeenSaved={hasBeenSaved}
          isDetailedView={isDetailedView}
          onViewChange={setIsDetailedView}
          itineraryData={{ days }}
        />

        {/* Days */}
        <div className="space-y-6">
          {days.map((day, dayIndex) => (
            <Card
              key={dayIndex}
              className={
                "border-2 border-dashed " + (dropTarget?.dayIndex === dayIndex ? "border-blue-400" : "border-gray-200")
              }
              onDragOver={(e) => {
                e.preventDefault()
                handleDragOver(dayIndex, day.events.length)
              }}
              onDrop={() => handleDrop(dayIndex, day.events.length)}
            >
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-[#F8B02B] px-4 py-2 rounded-full">
                    <span className="font-semibold">DAY {dayIndex + 1}</span>
                  </div>
                  <Input
                    value={day.title}
                    placeholder="Enter location..."
                    onChange={(e) => {
                      const newDays = [...days]
                      newDays[dayIndex].title = e.target.value
                      setDays(newDays)
                    }}
                    className="max-w-[200px] h-9"
                  />
                  <div className="ml-auto text-right">
                    <div className="text-2xl font-bold">{new Date(day.date).getDate()}</div>
                    <div className="text-xs font-medium">
                      {new Date(day.date).toLocaleString("en-us", { weekday: "short" })}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {day.events.map((event, eventIndex) => (
                    <div
                      key={event.id}
                      onDragOver={(e) => {
                        e.preventDefault()
                        handleDragOver(dayIndex, eventIndex)
                      }}
                      onDrop={() => handleDrop(dayIndex, eventIndex)}
                    >
                      <EventCard
                        event={event}
                        onDragStart={() => handleDragStart("event", event, dayIndex, eventIndex)}
                        onEdit={(updatedEvent) => handleEditEvent(dayIndex, eventIndex, updatedEvent)}
                        onDelete={() => handleDeleteEvent(dayIndex, eventIndex)}
                      />
                    </div>
                  ))}
                </div>
                {/* Manually added DayMeals component */}
                <DayMeals
                  meals={day.meals}
                  onChange={(meal, value) => {
                    const newDays = [...days]
                    newDays[dayIndex].meals[meal] = value
                    setDays(newDays)
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Day Button */}
        <div className="mt-6 text-center">
          <Button onClick={addDay} variant="outline" className="border-dashed border-2 bg-transparent">
            <Plus className="mr-2 h-4 w-4" />
            Add Day
          </Button>
        </div>

        {/* Additional Services (blank service slots) */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Additional Services</h3>
            <div className="space-x-2">
              <Button variant="outline" onClick={addServiceSlot}>Add Service Slot</Button>
            </div>
          </div>

          <div className="space-y-4">
            {serviceSlots.length === 0 && (
              <div className="text-sm text-gray-500">No additional service slots. Add one to enable drag & drop from Library.</div>
            )}

            {serviceSlots.map((slot, slotIndex) => (
              <Card
                key={slot.id}
                className={"border-2 border-dashed " + (dropTarget?.dayIndex === slotIndex ? "border-blue-400" : "border-gray-200")}
                onDragOver={(e) => { e.preventDefault(); setDropTarget({ dayIndex: slotIndex, position: slot.events.length }) }}
                onDrop={() => handleDropToService(slotIndex, slot.events.length)}
              >
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[#9CA3AF] px-3 py-1 rounded-full">
                      <span className="font-semibold">{slot.title}</span>
                    </div>
                    <Input
                      value={slot.title}
                      onChange={(e) => {
                        const newSlots = [...serviceSlots]
                        newSlots[slotIndex].title = e.target.value
                        setServiceSlots(newSlots)
                      }}
                      className="max-w-[200px] h-9"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {slot.events.map((event, eventIndex) => (
                      <div key={event.id}
                        onDragOver={(e) => { e.preventDefault(); setDropTarget({ dayIndex: slotIndex, position: eventIndex }) }}
                        onDrop={() => handleDropToService(slotIndex, eventIndex)}
                      >
                        <EventCard
                          event={event}
                          onDragStart={() => handleDragStart("event", event, undefined, eventIndex, slotIndex)}
                          onEdit={(updatedEvent) => {
                            const newSlots = [...serviceSlots]
                            newSlots[slotIndex].events[eventIndex] = updatedEvent
                            setServiceSlots(newSlots)
                          }}
                          onDelete={() => {
                            const newSlots = [...serviceSlots]
                            newSlots[slotIndex].events.splice(eventIndex, 1)
                            setServiceSlots(newSlots)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Component Sidebar */}
      <div className="w-80 border-l bg-white p-4 overflow-auto">
        <h3 className="font-semibold text-lg mb-4">Components</h3>
        <div className="space-y-3">
          {COMPONENT_TEMPLATES.map((component) => {
            const Icon = component.icon
            return (
              <Card
                key={component.type}
                className={component.color + " cursor-move"}
                draggable
                onDragStart={() => handleDragStart("component", component)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{component.title}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
