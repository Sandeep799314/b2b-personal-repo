import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  email: { type: String },
  displayName: { type: String },
  subdomain: { type: String, unique: true, sparse: true },
  credits: { type: Number, default: 20 }, // 20 free credits for new users
  lastLogin: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
