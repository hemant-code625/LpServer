import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
    userId : {type: String, require: true, unique: true},
    requestTitle : {type: String, require: true},
    requestDescription : {type: String, require: true},
    latitude: {type: Number, require: true},
    longitude: {type: Number, require: true},
    timestamp: {type: Date, require: true},
    status: {type: String, require: true},
    
});

const Request = mongoose.model("Request", requestSchema);
export default Request;