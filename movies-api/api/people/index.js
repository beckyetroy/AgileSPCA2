import express from 'express';
import personModel from './personModel';
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
        try {
            let personStored = await personModel.findByPersonDBId(id);
            if (personStored) {
                console.info(`person already stored.`);
            }
            else {
                personStored = await personModel.create(person);
                console.info(`person successfully stored.`);
            }
            res.status(200).json(personStored);
          } catch (err) {
            console.error(`failed to handle person data: ${err}`);
          }
    } else {
        res.status(404).json({message: 'The resource you requested could not be found.', status_code: 404});
    }
}));

export default router;