import mongoose from 'mongoose'

const libraryCollectionField = {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'LibraryCollection',
  default: null,
  set: (value: unknown) => {
    if (!value) {
      return null
    }

    if (typeof value === 'string') {
      return mongoose.Types.ObjectId.isValid(value)
        ? new mongoose.Types.ObjectId(value)
        : null
    }

    if (value && (value instanceof mongoose.Types.ObjectId || (typeof value === 'object' && value.toString && mongoose.Types.ObjectId.isValid(value.toString())))) {
      return new mongoose.Types.ObjectId(value.toString())
    }

    return null
  },
}

const baseSchemaDefinition = {
  title: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: String,
  city: String,
  country: String,
  dates: [String],
  labels: String,
  notes: String,
  transferOptions: [String],
  basePrice: Number,
  currency: { type: String, default: 'USD' },
  availableFrom: Date,
  availableUntil: Date,
  variants: String,
  multimedia: [String], // Array of file URLs
  startDate: String,
  endDate: String,
  // Advanced pricing for Activity & Experiences
  advancedPricing: {
    enabled: { type: Boolean, default: false },
    paxPricing: [
      {
        paxCount: Number, // Number of pax (0-20)
        price: Number // Price for this pax count
      },
    ],
  },
  // Flexible field for any additional data
  extraFields: { type: mongoose.Schema.Types.Mixed, default: {} },
  libraryCollection: libraryCollectionField,
}

let LibraryItem: mongoose.Model<any>

if (mongoose.models.LibraryItem) {
  LibraryItem = mongoose.models.LibraryItem
  if (!LibraryItem.schema.path('libraryCollection')) {
    LibraryItem.schema.add({ libraryCollection: libraryCollectionField })
  }
} else {
  const LibraryItemSchema = new mongoose.Schema(baseSchemaDefinition, {
    timestamps: true,
    strict: false, // Allows additional fields not defined in schema
  })

  LibraryItem = mongoose.model('LibraryItem', LibraryItemSchema)
}

export default LibraryItem
