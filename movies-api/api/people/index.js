import express from 'express';
import { getMovieCredits, getPersonDetails } from '../tmdb/tmdb-api';
import asyncHandler from 'express-async-handler';

const router = express.Router();

router.get('/movie/:id/credits', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const credits = await getMovieCredits(id);
    if (credits) {
        res.status(200).json(credits);
    } else {
        res.status(404).json({message: 'The resource you requested could not be found.', status_code: 404});
    }
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const person = await getPersonDetails(id);
    if (person) {
        res.status(200).json(person);
    } else {
        res.status(404).json({message: 'The resource you requested could not be found.', status_code: 404});
    }
}));

export default router;