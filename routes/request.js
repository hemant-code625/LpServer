import express, { request } from 'express';
// import Request from '../modules/request.js';
import User from '../modules/user.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
      const { latitude, longitude, maxDistance = 100, maxTimeDifference = 15 } = req.body;
      const requests = await User.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            distanceField: 'distance',
            maxDistance: maxDistance,
            spherical: true
          }
        },
        {
          $unwind: '$requests'
        },
        {
          $match: {
            'requests.status': 'active',
            'requests.timestamp': {
              $gt: new Date(Date.now() - maxTimeDifference * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: '$_id',
            requests: { $push: '$requests' }
          }
        }
      ]);
  
      console.log("Requests array from db ", requests);
      res.send(requests[0]?.requests || []);
      // const query = {
      //   location: {
      //     $near: {
      //       $geometry: {
      //         type: "Point",
      //         coordinates: [longitude, latitude]
      //       },
      //       // $maxDistance: maxDistance
      //     }
      //   },
      //   // timestamp: {
      //   //   $gt: new Date(Date.now() - maxTimeDifference * 60 * 1000) // Calculate 15 minutes ago
      //   // }

      // };
      
      // const users = await User.find({});
      // console.log("user from database ",users)
      // const requests = users.map(user => user.requests.filter(request => request.status === 'active'));
      // console.log("Requests array from db ",requests)
      // res.send(requests);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch requests' });
    }
  });

router.put('/', async (req, res) => {
  try {
    const { user, latitude, longitude ,title, description } = req.body;
    const existingUser = await User.findById(user._id);
    if(existingUser){
      existingUser.requests.push({
        requestTitle: title,
        requestDescription: description,
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        // latitude: parseFloat(latitude),
        // longitude: parseFloat(longitude),
        
        timestamp: new Date(),
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