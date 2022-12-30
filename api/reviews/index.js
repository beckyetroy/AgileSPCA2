import express from 'express';
import { getMovieReviews } from '../tmdb/tmdb-api';
import movieDetailsModel from '../movies/movieDetailsModel';
import asyncHandler from 'express-async-handler';
import loglevel from 'loglevel';

const router = express.Router();

router.get('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const reviews = await getMovieReviews(id);
    const movie = await movieDetailsModel.findByMovieDBId(id);
    if (reviews && movie && !movie.reviews.length) {
        try {
            movie.reviews = reviews;
            movie.save();
            loglevel.info(`movie reviews successfully stored.`);
        } catch (err) {
            loglevel.error(`failed to handle movie reviews data: ${err}`);
        }
        res.status(200).json(reviews);
    } else if (movie && movie.reviews.length) {
        res.status(200).json(movie.reviews);
    }
    else {
        res.status(404).json({message: 'The resource you requested could not be found.', status_code: 404});
    }
}));

router.post('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const review = req.body;
    const tmdbReviews = await getMovieReviews(id);
    const movie = await movieDetailsModel.findByMovieDBId(id);
    if (movie && !movie.reviews.length) {
        tmdbReviews.push(review);
        try {
            movie.reviews = tmdbReviews;
            await movie.save();
            loglevel.info(`movie review successfully added.`);
        } catch (err) {
            loglevel.error(`failed to handle movie review data: ${err}`);
        }
        res.status(200).json(tmdbReviews);
    }
    else if (movie && movie.reviews.length) {
        try {
            const allReviews = movie.reviews;
            allReviews.push(review);
            movie.reviews = allReviews;
            await movie.save();
            loglevel.info(`movie review successfully added.`);
        } catch (err) {
            loglevel.error(`failed to handle movie review data: ${err}`);
        }
        res.status(200).json(movie.reviews);
    } else {
        res.status(404).json({message: 'The resource you requested could not be found.', status_code: 404});
    }
}));

export default router;