"use client"

import { Search, MapPin, Calendar, Users, TrendingUp, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getDefaultImageByIndex } from "@/lib/constants"
import { UserWallet } from "./user-wallet"

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
      image: getDefaultImageByIndex(0),
      trending: true,
    },
    {
      id: "2",
      title: "European Grand Tour",
      destination: "Europe",
      price: "$2,899",
      rating: 4.9,
      reviews: 89,
      image: getDefaultImageByIndex(1),
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
      image: getDefaultImageByIndex(2),
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recommendedTrips.map((trip) => (
            <Card
              key={trip.id}
              className="group overflow-hidden border-neutral-200 hover:border-brand-primary-200 hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={trip.image || "/placeholder.svg"}
                  alt={trip.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {trip.discount && (
                    <Badge className="bg-brand-secondary-500 text-white font-bold px-2 py-1 border-none shadow-sm">
                      {trip.discount}
                    </Badge>
                  )}
                  {trip.trending && (
                    <Badge className="bg-emerald-500 text-white font-bold px-2 py-1 border-none shadow-sm">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      Trending
                    </Badge>
                  )}
                </div>
                
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md rounded-full px-2.5 py-1.5 flex items-center shadow-sm border border-white/20">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 mr-1.5" />
                  <span className="text-xs font-bold text-neutral-900">{trip.rating}</span>
                </div>
              </div>
              
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex items-center text-[11px] font-bold text-brand-primary-600 uppercase tracking-widest mb-2">
                  <MapPin className="mr-1.5 h-3.5 w-3.5" />
                  {trip.destination}
                </div>
                
                <h3 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-brand-primary-700 transition-colors line-clamp-1">
                  {trip.title}
                </h3>
                
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-neutral-100">
                  <div className="flex flex-col">
                    {trip.originalPrice && (
                      <span className="text-[10px] text-neutral-400 line-through font-medium mb-0.5">
                        {trip.originalPrice}
                      </span>
                    )}
                    <div className="flex items-baseline">
                      <span className="text-2xl font-black text-brand-primary-600">{trip.price}</span>
                      <span className="text-[10px] text-neutral-400 font-medium ml-1">/ person</span>
                    </div>
                  </div>
                  
                  <div className="text-[11px] text-neutral-500 font-medium bg-neutral-50 px-2 py-1 rounded">
                    {trip.reviews} reviews
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-6 bg-brand-primary-600 hover:bg-brand-primary-700 text-white font-bold shadow-md transition-all active:scale-[0.98] h-11"
                  onClick={() => onViewItinerary(trip.id)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
