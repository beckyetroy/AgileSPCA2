import dotenv from 'dotenv';
import mongoose from 'mongoose';
import loglevel from 'loglevel';

dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGO_DB);
const db = mongoose.connection;

db.on('error', (err) => {
    loglevel.error(`database connection error: ${err}`);
});
db.on('disconnected', () => {
    loglevel.info('database disconnected');
});
db.once('open', () => {
    loglevel.info(`database connected to ${db.name} on ${db.host}`);
});