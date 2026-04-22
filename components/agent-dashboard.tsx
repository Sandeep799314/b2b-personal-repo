"use client"

import { Search, MapPin, Calendar, Users, TrendingUp, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AgentDashboardProps {
  onViewItinerary: (id: string) => void
}

export function AgentDashboard({ onViewItinerary }: AgentDashboardProps) {
  const upcomingRFQs = [
    {
      id: "1",
      title: "Singapore Family Adventure",
      dates: "Dec 15-22, 2024",
      location: "Singapore",
      travelers: "2 Adults, 2 Children",
      status: "pending",
      priority: "high",
      budget: "$5,000",
    },
    {
      id: "2",
      title: "Tokyo Business Trip",
      dates: "Jan 10-15, 2025",
      location: "Tokyo, Japan",
      travelers: "1 Adult",
      status: "urgent",
      priority: "urgent",
      budget: "$3,200",
    },
  ]

  const recommendedTrips = [
    {
      id: "1",
      title: "Bali Paradise Getaway",
      destination: "Bali, Indonesia",
      price: "$1,299",
      originalPrice: "$1,599",
      discount: "20% OFF",
      rating: 4.8,
      reviews: 124,
      image: "/placeholder.svg?height=200&width=300",
      trending: true,
    },
    {
      id: "2",
      title: "European Grand Tour",
      destination: "Europe",
      price: "$2,899",
      rating: 4.9,
      reviews: 89,
      image: "/placeholder.svg?height=200&width=300",
      trending: false,
    },
    {
      id: "3",
      title: "Thailand Explorer",
      destination: "Thailand",
      price: "$899",
      originalPrice: "$1,099",
      discount: "15% OFF",
      rating: 4.7,
      reviews: 156,
      image: "/placeholder.svg?height=200&width=300",
      trending: true,
    },
  ]

  const getStatusBadge = (status: string, priority: string) => {
    if (priority === "urgent") return <Badge className="badge-error">Urgent</Badge>
    if (status === "pending") return <Badge className="badge-warning">Pending</Badge>
    return <Badge className="badge-info">Active</Badge>
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">
          Welcome back, <span className="text-brand-primary-600">John</span>
        </h1>
        <p className="text-body-lg text-neutral-600 max-w-2xl mx-auto">
          Discover amazing travel experiences and create unforgettable journeys for your clients
        </p>
      </div>

      {/* Main Search */}
      <div className="card-elevated p-8">
        <h2 className="text-xl font-semibold mb-6 text-center">Find the Perfect Trip</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-primary-400 h-5 w-5" />
            <Input placeholder="Destination" className="pl-10 input-field h-12" />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-primary-400 h-5 w-5" />
            <Input placeholder="Check-in Date" className="pl-10 input-field h-12" />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-primary-400 h-5 w-5" />
            <Input placeholder="Check-out Date" className="pl-10 input-field h-12" />
          </div>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-primary-400 h-5 w-5" />
            <Input placeholder="Travelers" className="pl-10 input-field h-12" />
          </div>
        </div>
        <Button className="mt-6 w-full md:w-auto btn-primary h-12 px-8">
          <Search className="mr-2 h-5 w-5" />
          Search Trips
        </Button>
      </div>

      {/* Upcoming RFQs */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Upcoming RFQs</h2>
          <Button variant="outline" className="btn-outline bg-transparent">
            View All
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingRFQs.map((rfq) => (
            <Card
              key={rfq.id}
              className="card-elevated cursor-pointer hover:shadow-brand-lg transition-all duration-200"
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold text-neutral-900">{rfq.title}</CardTitle>
                    <CardDescription className="text-body-sm text-neutral-600 mt-1">{rfq.dates}</CardDescription>
                  </div>
                  {getStatusBadge(rfq.status, rfq.priority)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-body-sm text-neutral-600">
                    <MapPin className="mr-2 h-4 w-4 text-brand-primary-400" />
                    {rfq.location}
                  </div>
                  <div className="flex items-center text-body-sm text-neutral-600">
                    <Users className="mr-2 h-4 w-4 text-brand-primary-400" />
                    {rfq.travelers}
                  </div>
                  <div className="flex items-center text-body-sm text-neutral-600">
                    <TrendingUp className="mr-2 h-4 w-4 text-brand-secondary-400" />
                    Budget: {rfq.budget}
                  </div>
                </div>
                <Button className="mt-4 w-full btn-primary" onClick={() => onViewItinerary(rfq.id)}>
                  <Clock className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recommended Trips */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Trips Recommended for You</h2>
          <Button variant="outline" className="btn-outline bg-transparent">
            View All
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedTrips.map((trip) => (
            <Card
              key={trip.id}
              className="card-elevated overflow-hidden cursor-pointer hover:shadow-brand-lg transition-all duration-200 group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={trip.image || "/placeholder.svg"}
                  alt={trip.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  {trip.discount && (
                    <Badge className="bg-brand-secondary-500 text-white font-semibold">{trip.discount}</Badge>
                  )}
                  {trip.trending && (
                    <Badge className="bg-success-500 text-white font-semibold">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
                  <Star className="h-3 w-3 fill-warning-400 text-warning-400 mr-1" />
                  <span className="text-xs font-medium text-neutral-900">{trip.rating}</span>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{trip.title}</h3>
                <p className="text-body-sm text-neutral-600 mb-4 flex items-center">
                  <MapPin className="mr-1 h-3 w-3" />
                  {trip.destination}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {trip.originalPrice && (
                      <span className="text-body-sm text-neutral-400 line-through">{trip.originalPrice}</span>
                    )}
                    <span className="text-heading-lg text-brand-primary-600 font-bold">{trip.price}</span>
                  </div>
                  <div className="text-body-xs text-neutral-500">{trip.reviews} reviews</div>
                </div>
                <Button className="w-full btn-primary" onClick={() => onViewItinerary(trip.id)}>
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
