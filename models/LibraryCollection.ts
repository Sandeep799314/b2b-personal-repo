import mongoose from "mongoose"

export interface ILibraryCollection {
  _id?: string
  userId?: string
  name: string
  description?: string
  createdAt?: Date
  updatedAt?: Date
}

const LibraryCollectionSchema = new mongoose.Schema<ILibraryCollection>(
  {
    userId: { type: String, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.LibraryCollection || mongoose.model<ILibraryCollection>("LibraryCollection", LibraryCollectionSchema)
