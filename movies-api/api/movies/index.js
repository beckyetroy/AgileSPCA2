import express from 'express';
import mongoose from 'mongoose';
import { movieReviews, movies } from './moviesData';
import uniqid from 'uniqid';
import MovieSchema from './movieModel';
import movieDetailsModel from './movieDetailsModel';
import asyncHandler from 'express-async-handler';
import { getMovies, getUpcomingMovies, getMovie, getMovieImages,
    getTrendingMovies} from '../tmdb/tmdb-api';

const router = express.Router(); 

// router.get('/', asyncHandler(async (req, res) => {
//     const movies = await movieModel.find();
//     res.status(200).json(movies);
// }));

// // Get movie details
// router.get('/:id', asyncHandler(async (req, res) => {
//     const id = parseInt(req.params.id);
//     const movie = await movieModel.findByMovieDBId(id);
//     if (movie) {
//         res.status(200).json(movie);
//     } else {
//         res.status(404).json({message: 'The resource you requested could not be found.', status_code: 404});
//     }
// }));

// // Get movie reviews
// router.get('/:id/reviews', (req, res) => {
//     const id = parseInt(req.params.id);
//     // find reviews in list
//     if (movieReviews.id == id) {
//         res.status(200).json(movieReviews);
//     } else {
//         res.status(404).json({
//             message: 'The resource you requested could not be found.',
//             status_code: 404
//         });
//     }
// });

//Post a movie review
router.post('/:id/reviews', (req, res) => {
    const id = parseInt(req.params.id);

    if (movieReviews.id == id) {
        req.body.created_at = new Date();
        req.body.updated_at = new Date();
        req.body.id = uniqid();
        movieReviews.results.push(req.body); //push the new review onto the list
        res.status(201).json(req.body);
    } else {
        res.status(404).json({
            message: 'The resource you requested could not be found.',
            status_code: 404
        });
    }
});

router.get('/upcoming', asyncHandler( async(req, res) => {
    const upcomingMovies = await getUpcomingMovies();
    const movieModel = mongoose.model('UpcomingMovie', MovieSchema);
    if (upcomingMovies) {
        try {
            await movieModel.deleteMany();
            await upcomingMovies.results.forEach(movie => movieModel.create(movie));
            console.info(`upcoming movie list updated`)
            res.status(200).json(upcomingMovies);
            } catch (err) {
                console.error(`failed to handle movie data: ${err}`);
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
            console.info(`movie list updated`)
            res.status(200).json(discoverMovies);
            } catch (err) {
                console.error(`failed to handle movie data: ${err}`);
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
            console.info(`trending movie list (week) updated`)
            res.status(200).json(trendingWeek);
            } catch (err) {
                console.error(`failed to handle movie data: ${err}`);
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
            console.info(`trending movie list (today) updated`)
            res.status(200).json(trendingToday);
            } catch (err) {
                console.error(`failed to handle movie data: ${err}`);
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
                console.info(`movie details already stored.`);
            }
            else {
                movieStored = await movieDetailsModel.create(movie);
                console.info(`movie details successfully stored.`);
            }
            res.status(200).json(movieStored);
          } catch (err) {
            console.error(`failed to handle movie details data: ${err}`);
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
            console.info(`movie images updated.`);
        } catch (err) {
            console.error(`failed to handle movie images data: ${err}`);
        }
        res.status(200).json(images);
    } else {
        res.status(404).json({message: 'The resource you requested could not be found.', status_code: 404});
    }
}));

export default router;