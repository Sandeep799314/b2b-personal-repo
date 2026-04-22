const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

const sampleItineraries = [
  {
    title: "Singapore Family Adventure",
    description: "A perfect family trip with customized activities and premium accommodations",
    destination: "Singapore",
    duration: "5 Days, 4 Nights",
    totalPrice: 2299,
    currency: "USD",
    status: "published",
    createdBy: "agent-1",
    days: [
      {
        day: 1,
        date: "2024-12-15",
        title: "Arrival & Marina Bay",
        events: [
          {
            id: "1",
            time: "10:00 AM",
            category: "flight",
            title: "Arrival at Changi Airport",
            description: "Singapore Airlines SQ123 from New York",
            inclusions: ["2 Adults, 2 Children", "Baggage Included"],
            price: 2400,
          },
          {
            id: "2",
            time: "12:00 PM",
            category: "transfer",
            title: "Private Airport Transfer",
            description: "Luxury sedan to Marina Bay Sands",
            inclusions: ["Private Transfer", "Meet & Greet"],
            price: 45,
          },
          {
            id: "3",
            time: "3:00 PM",
            category: "hotel",
            title: "Marina Bay Sands - Check In",
            description: "Deluxe City View Room",
            inclusions: ["Breakfast Included", "Pool Access", "2 Adults, 2 Children"],
            price: 450,
          }
        ]
      },
      {
        day: 2,
        date: "2024-12-16",
        title: "Universal Studios Adventure",
        events: [
          {
            id: "4",
            time: "9:00 AM",
            category: "activity",
            title: "Universal Studios Singapore",
            description: "Full day at Universal Studios with express passes",
            inclusions: ["Express Pass", "2 Adults, 2 Children", "Lunch Voucher"],
            price: 320,
          }
        ]
      }
    ],
    highlights: ["Marina Bay Sands", "Universal Studios", "Singapore Zoo", "Gardens by the Bay"],
    images: ["/placeholder.svg?height=200&width=300"],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    title: "Tokyo Business & Leisure",
    description: "Custom itinerary combining business meetings with cultural experiences",
    destination: "Tokyo",
    duration: "7 Days, 6 Nights",
    totalPrice: 3199,
    currency: "USD",
    status: "draft",
    createdBy: "agent-1",
    days: [
      {
        day: 1,
        date: "2024-12-20",
        title: "Arrival & Business District",
        events: [
          {
            id: "5",
            time: "8:00 AM",
            category: "flight",
            title: "Arrival at Narita Airport",
            description: "JAL flight from Los Angeles",
            inclusions: ["Business Class", "Baggage Included"],
            price: 1800,
          }
        ]
      }
    ],
    highlights: ["Shibuya Crossing", "Mount Fuji", "Traditional Ryokan", "Business District"],
    images: ["/placeholder.svg?height=200&width=300"],
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10")
  }
]

async function seedItineraries() {
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db()
    const collection = db.collection('itineraries')
    
    // Clear existing data
    await collection.deleteMany({})
    console.log('Cleared existing itineraries')
    
    // Insert sample data
    const result = await collection.insertMany(sampleItineraries)
    console.log(`Inserted ${result.insertedCount} sample itineraries`)
    
  } catch (error) {
    console.error('Error seeding itineraries:', error)
  } finally {
    await client.close()
    console.log('Disconnected from MongoDB')
  }
}

seedItineraries()
