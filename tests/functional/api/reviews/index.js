import chai from "chai";
import request from "supertest";
const mongoose = require("mongoose");
import movieDetailsModel from "../../../../api/movies/movieDetailsModel";
import api from "../../../../index";
import movies from "../../../../seedData/movies";
import { getMovieReviews } from "../../../../api/tmdb/tmdb-api";

const expect = chai.expect;
let db;
let tmdbReviews;

describe("Reviews endpoint", () => {

    before(async () => {
      mongoose.connect(process.env.MONGO_DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      db = mongoose.connection;
    });

    after(async () => {
      try {
        await db.dropDatabase();
      } catch (error) {
        console.log(error);
      }
    });

    afterEach(() => {
      api.close(); // Release PORT 8080
    });
});