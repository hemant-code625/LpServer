import express from 'express';
import Request from '../modules/request.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
      const { latitude, longitude, maxDistance = 100, maxTimeDifference = 15 } = req.query;
  
      const query = {
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude]
            },
            $maxDistance: maxDistance
          }
        },
        timestamp: {
          $gt: new Date(Date.now() - maxTimeDifference * 60 * 1000) // Calculate 15 minutes ago
        }
      };
  
      const requests = await Request.find(query);
  
      res.json(requests);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch requests' });
    }
  });
  

router.post('/', async (req, res) => {
    try {
      const { user, latitude, longitude ,title, description } = req.body;
      const request = new Request({
        userId: user._id,
        requestTitle: title,
        requestDescription: description,
        latitude,
        longitude,
        timestamp: new Date(),
        status: 'active'
      });
      const result = await request.save();
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create request' });
    }
})

export {router as RequestRouter};