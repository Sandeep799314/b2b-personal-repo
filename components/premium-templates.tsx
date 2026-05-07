"use client"

import { 
  PlaneTakeoff, Hotel, Car, Camera, Utensils, MapPin,
  Clock, Users, Star, Calendar, Coffee, Mountain
} from "lucide-react"

export const premiumTemplates = [
  {
    id: 'singapore-day',
    name: 'Singapore Day Template',
    preview: '/placeholder.svg?height=200&width=300',
    elements: [
      {
        id: 'brand-header',
        type: 'brand-header',
        content: {},
        position: { x: 0, y: 0 },
        size: { width: 640, height: 80 },
        style: {
          backgroundColor: '#ffffff',
          padding: 20,
          borderBottom: '1px solid #e2e8f0'
        }
      },
      {
        id: 'day-header',
        type: 'heading',
        content: { text: 'Day 1 - Arrival & Marina Bay' },
        position: { x: 20, y: 20 },
        size: { width: 600, height: 40 },
        style: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#1e40af',
          backgroundColor: '#dbeafe',
          padding: 12,
          borderRadius: 8,
          textAlign: 'left'
        }
      },
      {
        id: 'flight-event',
        type: 'event',
        content: {
          category: 'Flight',
          title: 'Arrival at Changi Airport',
          description: 'Singapore Airlines SQ123 from New York',
          time: '10:00 AM',
          duration: '2 hours',
          price: 2400,
          location: 'Changi Airport',
          includes: ['2 Adults, 2 Children', 'Baggage Included']
        },
        position: { x: 20, y: 80 },
        size: { width: 600, height: 120 },
        style: {
          backgroundColor: '#dbeafe',
          borderRadius: 8,
          border: '2px solid #3b82f6',
          padding: 16
        }
      },
      {
        id: 'transfer-event',
        type: 'event',
        content: {
          category: 'Transport',
          title: 'Private Airport Transfer',
          description: 'Luxury sedan to Marina Bay Sands',
          time: '12:00 PM',
          duration: '45 minutes',
          price: 45,
          location: 'Airport to Hotel',
          includes: ['Private Transfer', 'Meet & Greet']
        },
        position: { x: 20, y: 220 },
        size: { width: 600, height: 120 },
        style: {
          backgroundColor: '#dcfce7',
          borderRadius: 8,
          border: '2px solid #22c55e',
          padding: 16
        }
      },
      {
        id: 'hotel-event',
        type: 'event',
        content: {
          category: 'Hotel',
          title: 'Marina Bay Sands - Check In',
          description: 'Deluxe City View Room',
          time: '3:00 PM',
          duration: 'Overnight',
          price: 450,
          location: 'Marina Bay Sands',
          includes: ['Breakfast Included', 'Pool Access', '2 Adults, 2 Children']
        },
        position: { x: 20, y: 360 },
        size: { width: 600, height: 120 },
        style: {
          backgroundColor: '#ede9fe',
          borderRadius: 8,
          border: '2px solid #8b5cf6',
          padding: 16
        }
      },
      {
        id: 'activity-event',
        type: 'event',
        content: {
          category: 'Activity',
          title: 'Marina Bay Light Show',
          description: 'Spectacular light and water show at Marina Bay',
          time: '7:00 PM',
          duration: '1 hour',
          price: 0,
          location: 'Marina Bay',
          includes: ['Family Activity', 'Prime Viewing Spot']
        },
        position: { x: 20, y: 500 },
        size: { width: 600, height: 120 },
        style: {
          backgroundColor: '#fed7aa',
          borderRadius: 8,
          border: '2px solid #f97316',
          padding: 16
        }
      }
    ]
  },
  {
    id: 'tokyo-business',
    name: 'Tokyo Business Day',
    preview: '/placeholder.svg?height=200&width=300',
    elements: [
      {
        id: 'day-header',
        type: 'heading',
        content: { text: 'Day 1 - Arrival & Business District' },
        position: { x: 20, y: 20 },
        size: { width: 600, height: 40 },
        style: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#dc2626',
          backgroundColor: '#fee2e2',
          padding: 12,
          borderRadius: 8,
          textAlign: 'left'
        }
      },
      {
        id: 'flight-event',
        type: 'event',
        content: {
          category: 'Flight',
          title: 'Arrival at Narita Airport',
          description: 'JAL flight from Los Angeles',
          time: '8:00 AM',
          duration: '3 hours',
          price: 1800,
          location: 'Narita Airport',
          includes: ['Business Class', 'Baggage Included']
        },
        position: { x: 20, y: 80 },
        size: { width: 600, height: 120 },
        style: {
          backgroundColor: '#dbeafe',
          borderRadius: 8,
          border: '2px solid #3b82f6',
          padding: 16
        }
      },
      {
        id: 'transport-event',
        type: 'event',
        content: {
          category: 'Transport',
          title: 'Airport Express to Tokyo',
          description: 'High-speed train to city center',
          time: '11:00 AM',
          duration: '1 hour',
          price: 35,
          location: 'Narita to Tokyo Station',
          includes: ['Reserved Seat', 'WiFi']
        },
        position: { x: 20, y: 220 },
        size: { width: 600, height: 120 },
        style: {
          backgroundColor: '#dcfce7',
          borderRadius: 8,
          border: '2px solid #22c55e',
          padding: 16
        }
      }
    ]
  },
  {
    id: 'bali-wellness',
    name: 'Bali Wellness Day',
    preview: '/placeholder.svg?height=200&width=300',
    elements: [
      {
        id: 'day-header',
        type: 'heading',
        content: { text: 'Day 1 - Arrival & Spa Welcome' },
        position: { x: 20, y: 20 },
        size: { width: 600, height: 40 },
        style: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#059669',
          backgroundColor: '#d1fae5',
          padding: 12,
          borderRadius: 8,
          textAlign: 'left'
        }
      },
      {
        id: 'flight-event',
        type: 'event',
        content: {
          category: 'Flight',
          title: 'Arrival at Ngurah Rai Airport',
          description: 'Garuda Indonesia from Sydney',
          time: '2:00 PM',
          duration: '2 hours',
          price: 650,
          location: 'Ngurah Rai Airport',
          includes: ['Economy Class', 'Meal Included']
        },
        position: { x: 20, y: 80 },
        size: { width: 600, height: 120 },
        style: {
          backgroundColor: '#dbeafe',
          borderRadius: 8,
          border: '2px solid #3b82f6',
          padding: 16
        }
      },
      {
        id: 'spa-event',
        type: 'event',
        content: {
          category: 'Wellness',
          title: 'Welcome Spa Treatment',
          description: 'Traditional Balinese massage',
          time: '5:00 PM',
          duration: '90 minutes',
          price: 80,
          location: 'Resort Spa',
          includes: ['60-minute session', 'Herbal tea']
        },
        position: { x: 20, y: 220 },
        size: { width: 600, height: 120 },
        style: {
          backgroundColor: '#ffe4e6',
          borderRadius: 8,
          border: '2px solid #f43f5e',
          padding: 16
        }
      }
    ]
  },
  {
    id: 'adventure-day',
    name: 'Adventure Day Template',
    preview: '/placeholder.svg?height=200&width=300',
    elements: [
      {
        id: 'day-header',
        type: 'heading',
        content: { text: 'Day 2 - Adventure & Exploration' },
        position: { x: 20, y: 20 },
        size: { width: 600, height: 40 },
        style: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#ea580c',
          backgroundColor: '#fed7aa',
          padding: 12,
          borderRadius: 8,
          textAlign: 'left'
        }
      },
      {
        id: 'breakfast-event',
        type: 'event',
        content: {
          category: 'Dining',
          title: 'Hotel Breakfast',
          description: 'International buffet breakfast',
          time: '7:00 AM',
          duration: '1 hour',
          price: 0,
          location: 'Hotel Restaurant',
          includes: ['Buffet Style', 'Fresh Juice', 'Coffee/Tea']
        },
        position: { x: 20, y: 80 },
        size: { width: 600, height: 120 },
        style: {
          backgroundColor: '#fee2e2',
          borderRadius: 8,
          border: '2px solid #ef4444',
          padding: 16
        }
      },
      {
        id: 'adventure-event',
        type: 'event',
        content: {
          category: 'Activity',
          title: 'Mountain Hiking Adventure',
          description: 'Guided trek through scenic mountain trails',
          time: '9:00 AM',
          duration: '6 hours',
          price: 120,
          location: 'Mountain Trail',
          includes: ['Professional Guide', 'Safety Equipment', 'Packed Lunch']
        },
        position: { x: 20, y: 220 },
        size: { width: 600, height: 120 },
        style: {
          backgroundColor: '#fed7aa',
          borderRadius: 8,
          border: '2px solid #f97316',
          padding: 16
        }
      }
    ]
  },
  {
    id: 'cultural-day',
    name: 'Cultural Experience Day',
    preview: '/placeholder.svg?height=200&width=300',
    elements: [
      {
        id: 'day-header',
        type: 'heading',
        content: { text: 'Day 3 - Cultural Immersion' },
        position: { x: 20, y: 20 },
        size: { width: 600, height: 40 },
        style: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#7c3aed',
          backgroundColor: '#e0e7ff',
          padding: 12,
          borderRadius: 8,
          textAlign: 'left'
        }
      },
      {
        id: 'temple-event',
        type: 'event',
        content: {
          category: 'Culture',
          title: 'Ancient Temple Tour',
          description: 'Explore historic temples with local guide',
          time: '9:00 AM',
          duration: '3 hours',
          price: 85,
          location: 'Temple Complex',
          includes: ['Expert Guide', 'Entry Tickets', 'Cultural Insights']
        },
        position: { x: 20, y: 80 },
        size: { width: 600, height: 120 },
        style: {
          backgroundColor: '#e0e7ff',
          borderRadius: 8,
          border: '2px solid #6366f1',
          padding: 16
        }
      },
      {
        id: 'lunch-event',
        type: 'event',
        content: {
          category: 'Dining',
          title: 'Traditional Local Cuisine',
          description: 'Authentic local restaurant experience',
          time: '1:00 PM',
          duration: '2 hours',
          price: 45,
          location: 'Local Restaurant',
          includes: ['3-Course Meal', 'Local Specialties', 'Cultural Explanation']
        },
        position: { x: 20, y: 220 },
        size: { width: 600, height: 120 },
        style: {
          backgroundColor: '#fee2e2',
          borderRadius: 8,
          border: '2px solid #ef4444',
          padding: 16
        }
      }
    ]
  },
  {
    id: 'luxury-resort-stay',
    name: 'Luxury Resort Stay',
    preview: '/placeholder.svg?height=200&width=300',
    elements: [
      {
        id: 'day-header',
        type: 'heading',
        content: { text: 'Day 4 - Relaxation & Luxury' },
        position: { x: 20, y: 20 },
        size: { width: 600, height: 40 },
        style: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#be123c',
          backgroundColor: '#fff1f2',
          padding: 12,
          borderRadius: 8,
          textAlign: 'left'
        }
      },
      {
        id: 'resort-event',
        type: 'event',
        content: {
          category: 'Hotel',
          title: 'Premium Villa Check-in',
          description: 'Private infinity pool villa with ocean view',
          time: '2:00 PM',
          duration: 'Overnight',
          price: 1200,
          location: 'Ocean Whisper Resort',
          includes: ['Butler Service', 'Welcome Champagne', 'Private Pool']
        },
        position: { x: 20, y: 80 },
        size: { width: 600, height: 120 },
        style: {
          backgroundColor: '#fff1f2',
          borderRadius: 8,
          border: '2px solid #fb7185',
          padding: 16
        }
      },
      {
        id: 'dinner-event',
        type: 'event',
        content: {
          category: 'Dining',
          title: 'Candlelight Beach Dinner',
          description: '5-course gourmet seafood dinner on the sand',
          time: '7:30 PM',
          duration: '3 hours',
          price: 250,
          location: 'Resort Private Beach',
          includes: ['Wine Pairing', 'Live Acoustic Music', 'Private Chef']
        },
        position: { x: 20, y: 220 },
        size: { width: 600, height: 120 },
        style: {
          backgroundColor: '#fafaf9',
          borderRadius: 8,
          border: '2px solid #a8a29e',
          padding: 16
        }
      }
    ]
  },
  {
    id: 'mountain-expedition',
    name: 'Mountain Expedition',
    preview: '/placeholder.svg?height=200&width=300',
    elements: [
      {
        id: 'day-header',
        type: 'heading',
        content: { text: 'Day 5 - Peak Challenge' },
        position: { x: 20, y: 20 },
        size: { width: 600, height: 40 },
        style: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#15803d',
          backgroundColor: '#f0fdf4',
          padding: 12,
          borderRadius: 8,
          textAlign: 'left'
        }
      },
      {
        id: 'hiking-event',
        type: 'event',
        content: {
          category: 'Activity',
          title: 'Summit Sunrise Hike',
          description: 'Challenging pre-dawn trek to the highest peak',
          time: '4:00 AM',
          duration: '5 hours',
          price: 150,
          location: 'Evergreen Peak',
          includes: ['Expert Mountaineer Guide', 'Headlamps Provided', 'Summit Breakfast']
        },
        position: { x: 20, y: 80 },
        size: { width: 600, height: 120 },
        style: {
          backgroundColor: '#f0fdf4',
          borderRadius: 8,
          border: '2px solid #4ade80',
          padding: 16
        }
      },
      {
        id: 'lodge-event',
        type: 'event',
        content: {
          category: 'Hotel',
          title: 'Alpine Eco-Lodge',
          description: 'Sustainable lodging with panoramic mountain views',
          time: '3:00 PM',
          duration: 'Overnight',
          price: 350,
          location: 'Peak Vista Lodge',
          includes: ['Eco-friendly Amenities', 'Fireplace', 'Heated Blankets']
        },
        position: { x: 20, y: 220 },
        size: { width: 600, height: 120 },
        style: {
          backgroundColor: '#eff6ff',
          borderRadius: 8,
          border: '2px solid #60a5fa',
          padding: 16
        }
      }
    ]
  }
]

export const quickElements = [
  {
    id: 'time-header',
    name: 'Time Header',
    icon: Clock,
    template: {
      type: 'heading',
      content: { text: '9:00 AM - Activity Time' },
      style: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e40af',
        backgroundColor: '#dbeafe',
        padding: 8,
        borderRadius: 6,
        textAlign: 'left'
      }
    }
  },
  {
    id: 'location-badge',
    name: 'Location Badge',
    icon: MapPin,
    template: {
      type: 'text',
      content: { text: '📍 Marina Bay Sands, Singapore' },
      style: {
        fontSize: 14,
        color: '#059669',
        backgroundColor: '#d1fae5',
        padding: 8,
        borderRadius: 20,
        textAlign: 'center',
        fontWeight: '500'
      }
    }
  },
  {
    id: 'price-tag',
    name: 'Price Tag',
    icon: Users,
    template: {
      type: 'text',
      content: { text: '$450 per person' },
      style: {
        fontSize: 16,
        color: '#dc2626',
        backgroundColor: '#fee2e2',
        padding: 8,
        borderRadius: 6,
        textAlign: 'center',
        fontWeight: 'bold'
      }
    }
  },
  {
    id: 'highlight-box',
    name: 'Highlight Box',
    icon: Star,
    template: {
      type: 'text',
      content: { text: '⭐ Must-see attraction with stunning city views' },
      style: {
        fontSize: 14,
        color: '#ea580c',
        backgroundColor: '#fed7aa',
        padding: 12,
        borderRadius: 8,
        textAlign: 'left',
        border: '2px solid #f97316'
      }
    }
  }
]
