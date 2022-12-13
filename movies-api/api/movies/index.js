import express from 'express';
import { movieReviews } from './moviesData';
import uniqid from 'uniqid';
import movieModel from './movieModel';
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
    res.status(200).json(upcomingMovies);
  }));

router.get('/discover', asyncHandler( async(req, res) => {
    const discoverMovies = await getMovies();
    res.status(200).json(discoverMovies);
  }));

router.get('/trending/week', asyncHandler( async(req, res) => {
    const trendingWeek = await getTrendingMovies("week");
    res.status(200).json(trendingWeek);
  }));

router.get('/trending/today', asyncHandler( async(req, res) => {
    const trendingToday = await getTrendingMovies("day");
    res.status(200).json(trendingToday);
  }));

router.get('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const movie = await getMovie(id);
    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(404).json({message: 'The resource you requested could not be found.', status_code: 404});
    }
}));

router.get('/:id/images', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const images = await getMovieImages(id);
    if (images) {
        res.status(200).json(images);
    } else {
        res.status(404).json({message: 'The resource you requested could not be found.', status_code: 404});
    }
}));

export default router;