import express from 'express';
import mongoose from 'mongoose';
import MovieSchema from './movieModel';
import movieDetailsModel from './movieDetailsModel';
import asyncHandler from 'express-async-handler';
import { getMovies, getUpcomingMovies, getMovie, getMovieImages,
    getTrendingMovies} from '../tmdb/tmdb-api';
import loglevel from 'loglevel';

const router = express.Router(); 

router.get('/upcoming', asyncHandler( async(req, res) => {
    const upcomingMovies = await getUpcomingMovies();
    const movieModel = mongoose.model('UpcomingMovie', MovieSchema);
    if (upcomingMovies) {
        try {
            await movieModel.deleteMany();
            await upcomingMovies.results.forEach(movie => movieModel.create(movie));
            loglevel.info(`upcoming movie list updated`)
            res.status(200).json(upcomingMovies);
            } catch (err) {
                loglevel.error(`failed to handle movie data: ${err}`);
            }
    } else {
        res.status(404).json({message: 'The resource you requested could not be found.', status_code: 404});
    }
  }));

router.get('/discover', asyncHandler( async(req, res) => {
    const discoverMovies = await getMovies();
    const movieModel = mongoose.model('Movies', MovieSchema);
    if (discoverMovies) {
        try {
            await movieModel.deleteMany();
            await discoverMovies.results.forEach(movie => movieModel.create(movie));
            loglevel.info(`movie list updated`)
            res.status(200).json(discoverMovies);
            } catch (err) {
                loglevel.error(`failed to handle movie data: ${err}`);
            }
    } else {
        res.status(404).json({message: 'The resource you requested could not be found.', status_code: 404});
    }
  }));

router.get('/trending/week', asyncHandler( async(req, res) => {
    const trendingWeek = await getTrendingMovies("week");
    const movieModel = mongoose.model('WeeklyTrendingMovie', MovieSchema);
    if (trendingWeek) {
        try {
            await movieModel.deleteMany();
            await trendingWeek.results.forEach(movie => movieModel.create(movie));
            loglevel.info(`trending movie list (week) updated`)
            res.status(200).json(trendingWeek);
            } catch (err) {
                loglevel.error(`failed to handle movie data: ${err}`);
            }
    } else {
        res.status(404).json({message: 'The resource you requested could not be found.', status_code: 404});
    }
  }));

router.get('/trending/today', asyncHandler( async(req, res) => {
    const trendingToday = await getTrendingMovies("day");
    const movieModel = mongoose.model('DailyTrendingMovie', MovieSchema);
    if (trendingToday) {
        try {
            await movieModel.deleteMany();
            await trendingToday.results.forEach(movie => movieModel.create(movie));
            loglevel.info(`trending movie list (today) updated`)
            res.status(200).json(trendingToday);
            } catch (err) {
                loglevel.error(`failed to handle movie data: ${err}`);
            }
    } else {
        res.status(404).json({message: 'The resource you requested could not be found.', status_code: 404});
    }
  }));

router.get('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const movie = await getMovie(id);
    if (movie) {
        try {
            let movieStored = await movieDetailsModel.findByMovieDBId(id);
            if (movieStored) {
                loglevel.info(`movie details already stored.`);
            }
            else {
                movieStored = await movieDetailsModel.create(movie);
                loglevel.info(`movie details successfully stored.`);
            }
            res.status(200).json(movieStored);
          } catch (err) {
            loglevel.error(`failed to handle movie details data: ${err}`);
          }
    } else {
        res.status(404).json({message: 'The resource you requested could not be found.', status_code: 404});
    }
}));

router.get('/:id/images', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const images = await getMovieImages(id);
    const movie = await movieDetailsModel.findByMovieDBId(id);
    if (images && movie) {
        try {
            movie.images = images;
            movie.save();
            loglevel.info(`movie images updated.`);
        } catch (err) {
            loglevel.error(`failed to handle movie images data: ${err}`);
        }
        res.status(200).json(images);
    } else {
        res.status(404).json({message: 'The resource you requested could not be found.', status_code: 404});
    }
}));

export default router;