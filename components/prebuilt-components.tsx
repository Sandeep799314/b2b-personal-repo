"use client"

import { Car, Hotel, Camera, Utensils, PlaneTakeoff, MapPin, Clock, Users } from "lucide-react"

export const prebuiltComponents = [
  {
    id: 'transfer-block',
    name: 'Transfer',
    icon: Car,
    category: 'transport',
    template: {
      type: 'transfer-block',
      content: {
        title: 'Transfer',
        subtitle: 'Krabi Airport To Krabi Hotel',
        details: 'Private Transfer',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        icon: 'car'
      },
      style: {
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16
      }
    }
  },
  {
    id: 'hotel-block',
    name: 'Hotel',
    icon: Hotel,
    category: 'accommodation',
    template: {
      type: 'hotel-block',
      content: {
        title: 'Hotel',
        subtitle: 'Deevana Plaza Krabi Aonang',
        details: '- Premium Suite',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        checkIn: '2:00 PM',
        checkOut: '11:00 AM',
        meals: {
          breakfast: 'Not Included',
          lunch: 'Not Included', 
          dinner: 'Not Included'
        },
        icon: 'hotel'
      },
      style: {
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16
      }
    }
  },
  {
    id: 'activity-block',
    name: 'Activity',
    icon: Camera,
    category: 'activity',
    template: {
      type: 'activity-block',
      content: {
        title: 'Activity',
        subtitle: 'Krabi Jungle Tour with Emerald Pool & Hot Spring',
        details: 'Lorem Ipsum',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        icon: 'activity'
      },
      style: {
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16
      }
    }
  },
  {
    id: 'flight-block',
    name: 'Flight',
    icon: PlaneTakeoff,
    category: 'transport',
    template: {
      type: 'flight-block',
      content: {
        title: 'Flight',
        subtitle: 'Bangkok to Krabi',
        details: 'Thai Airways TG123',
        description: 'Economy class with baggage included',
        departure: '10:30 AM',
        arrival: '12:15 PM',
        icon: 'flight'
      },
      style: {
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16
      }
    }
  },
  {
    id: 'dining-block',
    name: 'Dining',
    icon: Utensils,
    category: 'dining',
    template: {
      type: 'dining-block',
      content: {
        title: 'Dining',
        subtitle: 'Local Thai Restaurant',
        details: 'Authentic Thai Cuisine',
        description: 'Traditional Thai dishes with fresh ingredients',
        time: '7:00 PM',
        duration: '2 hours',
        icon: 'dining'
      },
      style: {
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16
      }
    }
  },
  {
    id: 'day-header',
    name: 'Day Header',
    icon: MapPin,
    category: 'layout',
    template: {
      type: 'day-header',
      content: {
        day: 'DAY 1',
        title: 'Welcome to Krabi',
        date: '21'
      },
      style: {
        backgroundColor: '#fbbf24',
        color: '#ffffff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontWeight: 'bold'
      }
    }
  }
]
