import express, { request } from 'express';
// import Request from '../modules/request.js';
import User from '../modules/user.js';
const router = express.Router();

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(Math.PI * lat1 / 180) * Math.cos(Math.PI * lat2 / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
} 
router.get('/', async (req, res) => {
  try {
    const { latitude, longitude, proximity } = req.query;
 
      var reqLat ;
      var reqLong ;
      var distance;
      var acceptedRequests = [];
      const users = await User.find({});
      const requests = users.map(user => user.requests.filter(request => request.status === 'active' ));
      requests[0].forEach(element => {
         if(element.location){
          reqLat = element.location.coordinates[1];
          reqLong = element.location.coordinates[0];
          distance = calculateDistance(latitude, longitude, reqLat, reqLong);
          console.log("distance of ",element.requestTitle," is ",distance);
          if(distance <= proximity){
            acceptedRequests.push(element);
          }
         }else{
            console.log("No location found");
         }
      });
      res.json(acceptedRequests);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch requests' });
    }
  });
  // user : 19.880311569672998, 75.35650208836454
router.put('/', async (req, res) => {
  try {
    const { user, latitude, longitude ,title, description } = req.body;
    const existingUser = await User.findOne( { googleId: user.googleId});
    if(existingUser){
      existingUser.requests.push({
        location: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },        
        timestamp: new Date(),
        requestTitle: title,
        requestDescription: description,
        status: 'active'
      });
      const result = await existingUser.save();
      res.json(result);
    }else{
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create request' });
  }
})

export {router as RequestRouter};