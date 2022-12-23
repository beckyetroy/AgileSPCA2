import express from 'express';
import asyncHandler from 'express-async-handler';
import { exchangeAuthCodeForTokens } from './authenticate';
import { start } from './authenticate';
import { grantOfflineAccess } from './authenticate';

const router = express.Router();

router.get('/', asyncHandler( async(req, res) => {
    try {
     await start();
    } catch (err) {
        return res.json;
    }
}));

router.post('/authenticate', asyncHandler( async(req, res) => {
    try {
     await exchangeAuthCodeForTokens(req.body);
    } catch (err) {
        return res.json;
    }
}));

router.get('/signin', asyncHandler( async(req, res) => {
    try {
     await grantOfflineAccess;
    } catch (err) {
        return res.json;
    }
}));

export default router;