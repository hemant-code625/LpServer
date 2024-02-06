import express, { request } from 'express';
// import Request from '../modules/request.js';
import User from '../modules/user.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { latitude, longitude, proximity } = req.query;
    const userRequests = await User.find({
      'requests.location.coordinates': {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseFloat(proximity) * 1000, // Convert proximity to meters
        },
      },
    });

    res.json(userRequests);
    
      // const users = await User.find({});  // to get requests from all users
      // const requests = users.map(user => user.requests.filter(request => request.status === 'active'));
      // console.log("Requests array from db ", requests);
      // res.json(requests);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch requests' });
    }
  });

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