import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import {RequestRouter} from './routes/request.js';
import User from './modules/user.js';
import {server, app} from './socket.js';

dotenv.config();

// Connect to MongoDB
async function main(){
    await mongoose.connect(`mongodb+srv://leasepe:${process.env.DB_PASS}@cluster0.5kdb9xr.mongodb.net/leasepe`)
    console.log('database connected')
}
main().catch(err=> console.log(err));


// Session middleware configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});   

app.use(passport.authenticate('session'));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: `${process.env.CLIENT_URL}`,  // Replace with the origin of your React app
  credentials: true,
};

app.use(cors(corsOptions)); 

// Google OAuth configuration (replace with your client ID and secret)

passport.use(new GoogleStrategy({
    clientID: `${process.env.GOOGLE_CLIENT_ID}`,
    clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
    callbackURL: `${process.env.GOOGLE_CALLBACK_URL}`,
    scope: [ 'profile' ],
    state: true
  },
   async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOne({ googleId: profile.id });
        if (user) {
          // const modifiedUser = {
          //   name: user.name,
          //   picture: user.picture,
          //   email: user.email,
          //   googleId: user.googleId,

          // };
          return done(null, user);
        } else {
          // Create a new user in the database if not found
          const newUser = new User({
            googleId: profile.id,
            name: profile.displayName,
            picture: profile.photos[0].value,
            email: profile.emails[0].value
          });
  
          await newUser.save();
          return done(null, newUser);
        }
      } catch (error) {
        return done(error);
      }
    
    }
  ));
  

// Authentication routes
app.get('/auth/google', passport.authenticate('google',{ scope: [ 'email', 'profile' ] }) );
app.get('/auth/google/callback', passport.authenticate('google',{
  successRedirect: `${process.env.CLIENT_URL}/zone`,
  failureRedirect:`${process.env.CLIENT_URL}/failedLogin`
}));

app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.send('You are logged in as ' + req.user.name);
  } else {
    res.redirect('/failedLogin');
  }
});
app.get('/failedLogin', (req, res) => {
  res.status(401).send('Login failed. Please try again.'); 
});
// sending user after login
app.get('/getUser', (req, res) => {
  if (req.user) {
    res.json({user : req.user });
  } else {
    res.json({ user: null });
  }
});
app.get('/', (req, res) => {
  res.send('Hello from server!');
})

app.use('/zone', RequestRouter)

app.get('/check',(req,res)=>{
  res.send({user: req.user});
})

server.listen(8080, () => {
  console.log('Server listening on port 8080');
});
