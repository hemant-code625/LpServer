import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({ 
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
    requestTitle: {type: String, required: true},
    requestDescription: {type: String },
    timestamp: { type: Date, required: true },
    status: { type: String, required: true }
   });

const Request = mongoose.model("Request", requestSchema);
export default Request;