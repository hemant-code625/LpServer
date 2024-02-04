import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
    userId: {type: String, required: true, ref: 'User'},
    requestTitle: {type: String, required: true},
    requestDescription: {type: String},
    latitude: {type: String, required: true},
    longitude: {type: String, required: true},
    timestamp: {type: Date, required: true},
    status: {type: String, required: true}
});

const Request = mongoose.model("Request", requestSchema);
export default Request;