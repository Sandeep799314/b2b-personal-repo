const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

const sampleLibraryItems = [
  {
    title: "Singapore Airlines Business Class",
    category: "flight",
    subCategory: "International",
    city: "Singapore",
    country: "Singapore", 
    startDate: "2024-12-15",
    endDate: "2024-12-15",
    labels: "premium,business-class,skytrax-5-star",
    notes: "Premium business class service with lie-flat seats and gourmet dining",
    transferOptions: ["airport-transfer", "lounge-access"],
    basePrice: 2400,
    currency: "USD",
    variants: "SQ321, SQ323, SQ325",
    multimedia: ["/placeholder-flight.jpg"],
    extraFields: {
      departure: "New York JFK",
      arrival: "Singapore Changi",
      aircraft: "Airbus A350-900",
      duration: "18 hours 30 minutes",
      airline: "Singapore Airlines"
    }
  },
  {
    title: "Marina Bay Sands Hotel",
    category: "hotel",
    subCategory: "Luxury Resort",
    city: "Singapore",
    country: "Singapore",
    labels: "5-star,iconic,infinity-pool",
    notes: "Iconic luxury hotel with world-famous infinity pool and premium amenities",
    basePrice: 450,
    currency: "USD",
    variants: "Deluxe City View, Premier Room, Club Room",
    multimedia: ["/placeholder-hotel.jpg"],
    extraFields: {
      checkin: "15:00",
      checkout: "12:00",
      nights: 3,
      breakfast: true,
      lunch: false,
      dinner: false,
      amenities: "Pool, Spa, Casino, Shopping Mall"
    }
  },
  {
    title: "Universal Studios Singapore",
    category: "activity",
    subCategory: "Theme Park",
    city: "Singapore",
    country: "Singapore",
    labels: "family-friendly,theme-park,full-day",
    notes: "Southeast Asia's first and only Universal Studios theme park with exciting rides and attractions",
    basePrice: 85,
    currency: "USD",
    variants: "1-Day Pass, Express Pass, Premium Experience",
    multimedia: ["/placeholder-activity.jpg"],
    extraFields: {
      duration: "8 hours",
      ageGroup: "All ages",
      includesMeals: true,
      lunch: true,
      highlights: "Transformers Ride, Jurassic Park, Shrek 4-D Adventure"
    }
  },
  {
    title: "Private Airport Transfer - Luxury",
    category: "transfer",
    subCategory: "Private Transfer",
    city: "Singapore",
    country: "Singapore",
    labels: "private,luxury,door-to-door",
    notes: "Premium private transfer service with luxury sedan and professional driver",
    basePrice: 45,
    currency: "USD",
    multimedia: ["/placeholder-transfer.jpg"],
    extraFields: {
      fromLocation: "Changi Airport",
      toLocation: "Marina Bay Area",
      vehicleType: "Mercedes E-Class",
      duration: "30 minutes",
      capacity: "3 passengers"
    }
  },
  {
    title: "Singapore Street Food Tour",
    category: "activity",
    subCategory: "Food Tour",
    city: "Singapore",
    country: "Singapore",
    labels: "food-tour,local-experience,evening",
    notes: "Authentic street food experience visiting famous hawker centers and local favorites",
    basePrice: 65,
    currency: "USD",
    multimedia: ["/placeholder-food-tour.jpg"],
    extraFields: {
      duration: "4 hours",
      startTime: "18:00",
      includesMeals: true,
      dinner: true,
      meetingPoint: "Chinatown MRT Station",
      groupSize: "8-12 people"
    }
  },
  {
    title: "Gardens by the Bay - Flower Dome",
    category: "activity",
    subCategory: "Attraction",
    city: "Singapore", 
    country: "Singapore",
    labels: "nature,botanical,iconic",
    notes: "World's largest glass greenhouse featuring plants from Mediterranean and cool-dry climates",
    basePrice: 28,
    currency: "USD",
    multimedia: ["/placeholder-gardens.jpg"],
    extraFields: {
      duration: "2 hours",
      bestTime: "Morning or Evening",
      accessibility: "Wheelchair accessible",
      photography: "Allowed"
    }
  },
  {
    title: "Tokyo Haneda Flight",
    category: "flight",
    subCategory: "International",
    city: "Tokyo",
    country: "Japan",
    labels: "economy,convenient-airport",
    notes: "Flight to Tokyo Haneda - closer to city center than Narita",
    basePrice: 850,
    currency: "USD",
    multimedia: ["/placeholder-tokyo-flight.jpg"],
    extraFields: {
      departure: "Singapore Changi",
      arrival: "Tokyo Haneda",
      duration: "7 hours 15 minutes",
      airline: "ANA"
    }
  },
  {
    title: "Shibuya Crossing Walking Tour",
    category: "activity",
    subCategory: "Walking Tour",
    city: "Tokyo",
    country: "Japan",
    labels: "urban,iconic,cultural",
    notes: "Explore the world's busiest pedestrian crossing and surrounding Shibuya district",
    basePrice: 35,
    currency: "USD",
    multimedia: ["/placeholder-shibuya.jpg"],
    extraFields: {
      duration: "3 hours",
      difficulty: "Easy",
      language: "English",
      groupSize: "15 people max"
    }
  }
]

async function seedLibraryItems() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/b2b-travel-platform'
  console.log('Using MongoDB URI:', uri)
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db()
    const collection = db.collection('libraryitems')
    
    // Clear existing library items (optional)
    // await collection.deleteMany({})
    
    // Insert sample library items
    const result = await collection.insertMany(sampleLibraryItems)
    console.log(`✅ Inserted ${result.insertedCount} library items`)
    
    // Display inserted items
    sampleLibraryItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title} (${item.category}) - ${item.currency} ${item.basePrice}`)
    })
    
  } catch (error) {
    console.error('❌ Error seeding library items:', error)
  } finally {
    await client.close()
  }
}

// Run if called directly
if (require.main === module) {
  seedLibraryItems()
}

module.exports = { sampleLibraryItems, seedLibraryItems }
