import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, require: true },
  googleId: { type: String, require: true, unique: true },
  picture: { type: String, require: true },
  email: { type: String, require: true, unique: true },
  requests: [{ 
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    requestTitle: {
      type: String,
      required: true
    },
    requestDescription: {
      type: String
    },
    timestamp: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      required: true
    }
   }],
});


// Define the geospatial index for requests
userSchema.index({ 'requests.location.coordinates': '2dsphere' });

const User = mongoose.model("User", userSchema);
export default User;