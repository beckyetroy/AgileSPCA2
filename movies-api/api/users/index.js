import express from 'express';
import User from './userModel';
import mongoose from 'mongoose';
import MovieSchema from '../movies/movieModel';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';

const router = express.Router(); // eslint-disable-line

// Get all users
router.get('/', async (req, res) => {
    const users = await User.find();
    res.status(200).json(users);
});

// Register OR authenticate a user
router.post('/',asyncHandler( async (req, res, next) => {
    if (!req.body.username || !req.body.password) {
      res.status(401).json({success: false, msg: 'Please pass username and password.'});
      return next();
    }
    if (req.query.action === 'register') {
        if (/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/.test(req.body.password)) {
            await User.create(req.body);
            res.status(201).json({code: 201, msg: 'Successfully created new user.'});
        }
        else return res.status(401).json({ code: 401, msg: 'Password invalid.' });
    } else {
      const user = await User.findByUserName(req.body.username);
        if (!user) return res.status(401).json({ code: 401, msg: 'Authentication failed. User not found.' });
        user.comparePassword(req.body.password, (err, isMatch) => {
          if (isMatch && !err) {
            // if user is found and password matches, create a token
            const token = jwt.sign(user.username, process.env.SECRET);
            // return the information including token as JSON
            res.status(200).json({success: true, token: 'BEARER ' + token});
          } else {
            res.status(401).json({code: 401,msg: 'Authentication failed. Wrong password.'});
          }
        });
      }
}));

// Update a user
router.put('/:id', async (req, res) => {
    if (req.body._id) delete req.body._id;
    const result = await User.updateOne({
        _id: req.params.id,
    }, req.body);
    if (result.matchedCount) {
        res.status(200).json({ code:200, msg: 'User Updated Sucessfully' });
    } else {
        res.status(404).json({ code: 404, msg: 'Unable to Update User' });
    }
});

//Add or remove a favourite
router.post('/:userName/favourites', asyncHandler(async (req, res) => {
    const movie = req.body;
    const userName = req.params.userName;
    const user = await User.findByUserName(userName);
    if (req.query.action === 'remove') {
      if (user) {
        user.favourites = await user.favourites.filter(
          (fav) => fav.id !== movie.id
        );
        await user.save();
        res.status(200).json(user.favourites);
      } else {
        res.status(404).json({ code: 404, msg: 'Unable to Remove Favourite' });
      }
    }
    //Else add movie to favourites
    else {
      if (!user.favourites.find(favourite => favourite.id === movie.id)) {
        await user.favourites.push(movie);
        await user.save();
      }
      res.status(201).json(user);
    }
}));

router.get('/:userName/favourites', asyncHandler( async (req, res) => {
    const userName = req.params.userName;
    const user = await User.findByUserName(userName);
    if (user) {
      res.status(200).json(user.favourites);
    } else {
      res.status(404).json({ code: 404, msg: 'Unable to Get User Favourites' });
    }
}));

//Add or remove from must watch
router.post('/:userName/mustwatch', asyncHandler(async (req, res) => {
  const movie = req.body;
  const userName = req.params.userName;
  const user = await User.findByUserName(userName);
  if (req.query.action === 'remove') {
    if (user) {
      user.mustwatch = await user.mustwatch.filter(
        (fav) => fav.id !== movie.id
      );
      await user.save();
      res.status(200).json(user.mustwatch);
    } else {
      res.status(404).json({ code: 404, msg: 'Unable to Remove from Must Watch' });
    }
  }
  //Else add movie to must watch
  else {
    if (!user.mustwatch.find(mustwatch => mustwatch.id === movie.id)) {
      await user.mustwatch.push(movie);
      await user.save();
    }
    res.status(201).json(user);
  }
}));

router.get('/:userName/mustwatch', asyncHandler( async (req, res) => {
  const userName = req.params.userName;
  const user = await User.findByUserName(userName);
  if (user) {
    res.status(200).json(user.mustwatch);
  } else {
    res.status(404).json({ code: 404, msg: 'Unable to Get User Must Watch List' });
  }
}));

export default router;