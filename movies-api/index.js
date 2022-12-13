import dotenv from 'dotenv';
import express from 'express';
import passport from './authenticate';
//... other imports
import usersRouter from './api/users';
import moviesRouter from './api/movies';
import genresRouter from './api/genres';
import peopleRouter from './api/people';
import reviewsRouter from './api/reviews';
import './db';
import './seedData';

dotenv.config();

const errHandler = (err, req, res, next) => {
  /* if the error in development then send stack trace to display whole error,
  if it's in production then just send error message  */

  return res.status(500).send(`Hey!! You caught the error 👍👍. Here's the details: ${err.stack} `);
};

const app = express();

const port = process.env.PORT;

app.use(express.json());
app.use(passport.initialize());

// app.use('/api/movies', passport.authenticate('jwt', {session: false}), moviesRouter);
app.use('/api/movies', moviesRouter);
app.use('/api/genres', genresRouter);
app.use('/api/people', peopleRouter);
app.use('/api/reviews', reviewsRouter);
//Users router
app.use('/api/users', usersRouter);
app.use(errHandler);

let server = app.listen(port, () => {
  console.info(`Server running at ${port}`);
});
module.exports = server