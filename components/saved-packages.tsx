"use client"
import { MapPin, Calendar, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SavedPackagesProps {
  onViewItinerary: (id: string) => void
}

export function SavedPackages({ onViewItinerary }: SavedPackagesProps) {
  const packages = [
    {
      id: "1",
      status: "Modified",
      destination: "Singapore",
      title: "Singapore Family Adventure - Customized",
      description: "A perfect family trip with customized activities and premium accommodations",
      duration: "5 Days",
      price: "$2,299",
      originalPrice: "$2,499",
      rating: 4.8,
      image: "/placeholder.svg?height=200&width=300",
      type: "modified",
    },
    {
      id: "2",
      status: "Created",
      destination: "Tokyo",
      title: "Tokyo Business & Leisure Combo",
      description: "Custom itinerary combining business meetings with cultural experiences",
      duration: "7 Days",
      price: "$3,199",
      rating: 4.9,
      image: "/placeholder.svg?height=200&width=300",
      type: "created",
    },
    {
      id: "3",
      status: "Modified",
      destination: "Bali",
      title: "Bali Wellness Retreat - Enhanced",
      description: "Luxury wellness experience with additional spa treatments and activities",
      duration: "6 Days",
      price: "$1,899",
      originalPrice: "$1,699",
      rating: 4.7,
      image: "/placeholder.svg?height=200&width=300",
      type: "modified",
    },
  ]

  const filterPackages = (type: string) => {
    if (type === "all") return packages
    return packages.filter((pkg) => pkg.type === type)
  }

  const PackageCard = ({ pkg }: { pkg: any }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img src={pkg.image || "/placeholder.svg"} alt={pkg.title} className="w-full h-48 object-cover" />
        <Badge className={`absolute top-3 left-3 ${pkg.status === "Modified" ? "bg-blue-500" : "bg-green-500"}`}>
          {pkg.status}
        </Badge>
        {pkg.originalPrice && <Badge className="absolute top-3 right-3 bg-red-500">CUSTOMIZED</Badge>}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{pkg.title}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin className="mr-1 h-3 w-3" />
              {pkg.destination}
            </CardDescription>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">{pkg.rating}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="mr-1 h-4 w-4" />
            {pkg.duration}
          </div>
          <div className="text-right">
            {pkg.originalPrice && <span className="text-sm text-gray-400 line-through mr-2">{pkg.originalPrice}</span>}
            <span className="text-xl font-bold text-blue-600">{pkg.price}</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button className="flex-1" onClick={() => onViewItinerary(pkg.id)}>
            View Details
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Saved Packages</h1>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="modified">Modified</TabsTrigger>
          <TabsTrigger value="created">Created</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterPackages("all").map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="modified" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterPackages("modified").map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="created" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterPackages("created").map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
