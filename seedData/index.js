import userModel from '../api/users/userModel';
import genreModel from '../api/genres/genreModel';
import movieModel from '../api/movies/movieModel';
import movies from './movies.js';
import users from './users';
import genres from './genres';
import dotenv from 'dotenv';
import loglevel from 'loglevel';

dotenv.config();

// deletes all user documents in collection and inserts test data
async function loadUsers() {
    loglevel.info('load user Data');
    try {
      await userModel.deleteMany();
      await users.forEach(user => userModel.create(user));
      loglevel.info(`${users.length} users were successfully stored.`);
    } catch (err) {
      loglevel.error(`failed to Load user Data: ${err}`);
    }
}

// deletes all genre documents in collection and inserts test data
async function loadGenres() {
    loglevel.info('load genre Data');
    try {
      await genreModel.deleteMany();
      await genreModel.collection.insertMany(genres);
      loglevel.info(`${genres.length} genres were successfully stored.`);
    } catch (err) {
      loglevel.error(`failed to Load genre Data: ${err}`);
    }
  }

// deletes all movies documents in collection and inserts test data
export async function loadMovies() {
    loglevel.info('load seed data');
    loglevel.info(movies.length);
    try {
      await movieModel.deleteMany();
      await movieModel.collection.insertMany(movies);
      loglevel.info(`${movies.length} Movies were successfully stored.`);
    } catch (err) {
      loglevel.error(`failed to Load movie Data: ${err}`);
    }
  }

if (process.env.SEED_DB == 'True') {
  loadUsers();
  loadGenres();
  loadMovies();
}