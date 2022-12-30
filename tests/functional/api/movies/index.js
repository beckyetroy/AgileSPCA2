import chai from "chai";
import request from "supertest";
const mongoose = require("mongoose");
import MovieSchema from "../../../../api/movies/movieModel";
import movieDetailsModel from "../../../../api/movies/movieDetailsModel";
import api from "../../../../index";
import movies from "../../../../seedData/movies";
import { getMovies, getUpcomingMovies, getTrendingMovies, getMovie, getMovieImages } from "../../../../api/tmdb/tmdb-api";
import loglevel from 'loglevel';

const expect = chai.expect;
let db;
let tmdbMovies;
let tmdbMovie;
let tmdbMovieImages;

describe("Movies endpoint", () => {

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
      loglevel.error(error);
    }
  });

  afterEach(() => {
    api.close(); // Release PORT 8080
  });

  describe("GET /api/movies/discover", () => {

    beforeEach(async () => {
      const movieModel = mongoose.model('Movies', MovieSchema);
      try {
        await movieModel.deleteMany();
      } catch (err) {
        loglevel.error(`failed to delete discover movie data: ${err}`);
      }

      //Store output from the TMDB API call directly
      tmdbMovies = await getMovies();
    });

    it("should return 20 movies and a status 200", (done) => {
      request(api)
        .get("/api/movies/discover")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .end((err, res) => {
          expect(res.body.results).to.be.a("array");
          expect(res.body.results.length).to.equal(20);
          done();
        });
    });

    it("should return the same movies pulled from TMDB API", (done) => {
      request(api)
        .get("/api/movies/discover")
        .set("Accept", "application/json")
        .end((err, res) => {
          expect(res.body.results).to.deep.equal(tmdbMovies.results);
          done();
        });
    });

    it("should update the DB", async () => {
      await request(api)
        .get("/api/movies/discover")
        .set("Accept", "application/json")

      const movieModel = mongoose.model('Movies', MovieSchema);
      //Confirm all movies pulled from the TMDB API are now in the DB        
      for (const movie of tmdbMovies.results) {
        const foundMovie = await movieModel.findByMovieDBId(movie.id);
        expect(foundMovie.title).to.deep.equal(movie.title);
      }
    });
  });

  describe("GET /api/movies/upcoming", () => {

    beforeEach(async () => {
      const upcomingMovieModel = mongoose.model('UpcomingMovie', MovieSchema);
      try {
        await upcomingMovieModel.deleteMany();
      } catch (err) {
        loglevel.error(`failed to delete upcoming movie data: ${err}`);
      }

      //Store output from the TMDB API call directly
      tmdbMovies = await getUpcomingMovies();
    });

    it("should return 20 movies and a status 200", (done) => {
      request(api)
        .get("/api/movies/upcoming")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .end((err, res) => {
          expect(res.body.results).to.be.a("array");
          expect(res.body.results.length).to.equal(20);
          done();
        });
    });

    it("should return the same movies pulled from TMDB API", (done) => {
      request(api)
        .get("/api/movies/upcoming")
        .set("Accept", "application/json")
        .end((err, res) => {
          expect(res.body.results).to.deep.equal(tmdbMovies.results);
          done();
        });
    });

    it("should update the DB", async () => {
      await request(api)
        .get("/api/movies/upcoming")
        .set("Accept", "application/json");

      const upcomingMovieModel = mongoose.model('UpcomingMovie', MovieSchema);
      //Confirm all movies pulled from the TMDB API are now in the DB
      for (const movie of tmdbMovies.results) {
        const foundMovie = await upcomingMovieModel.findByMovieDBId(movie.id);
        expect(foundMovie.title).to.deep.equal(movie.title);
      }
    });
  });

  describe("GET /api/movies/trending/week", () => {

    beforeEach(async () => {
      const trendingWeekMovieModel = mongoose.model('WeeklyTrendingMovie', MovieSchema);
      try {
        await trendingWeekMovieModel.deleteMany();
      } catch (err) {
        loglevel.error(`failed to delete trending (weekly) movie data: ${err}`);
      }

      //Store output from the TMDB API call directly
      tmdbMovies = await getTrendingMovies("week");
    });

    it("should return 20 movies and a status 200", (done) => {
      request(api)
        .get("/api/movies/trending/week")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .end((err, res) => {
          expect(res.body.results).to.be.a("array");
          expect(res.body.results.length).to.equal(20);
          done();
        });
    });

    it("should return the same movies pulled from TMDB API", (done) => {
      request(api)
        .get("/api/movies/trending/week")
        .set("Accept", "application/json")
        .end((err, res) => {
          expect(res.body.results).to.deep.equal(tmdbMovies.results);
          done();
        });
    });

    it("should update the DB", async () => {
      await request(api)
        .get("/api/movies/trending/week")
        .set("Accept", "application/json");

      const trendingWeekMovieModel = mongoose.model('WeeklyTrendingMovie', MovieSchema);
      //Confirm all movies pulled from the TMDB API are now in the DB
      for (const movie of tmdbMovies.results) {
        const foundMovie = await trendingWeekMovieModel.findByMovieDBId(movie.id);
        expect(foundMovie.title).to.deep.equal(movie.title);
      }
    });
  });

  describe("GET /api/movies/trending/today", () => {

    beforeEach(async () => {
      const trendingDayMovieModel = mongoose.model('DailyTrendingMovie', MovieSchema);
      try {
        await trendingDayMovieModel.deleteMany();
      } catch (err) {
        loglevel.error(`failed to delete trending (daily) movie data: ${err}`);
      }

      //Store output from the TMDB API call directly
      tmdbMovies = await getTrendingMovies("day");
    });

    it("should return 20 movies and a status 200", (done) => {
      request(api)
        .get("/api/movies/trending/today")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .end((err, res) => {
          expect(res.body.results).to.be.a("array");
          expect(res.body.results.length).to.equal(20);
          done();
        });
    });

    it("should return the same movies pulled from TMDB API", (done) => {
      request(api)
        .get("/api/movies/trending/today")
        .set("Accept", "application/json")
        .end((err, res) => {
          expect(res.body.results).to.deep.equal(tmdbMovies.results);
          done();
        });
    });

    it("should update the DB", async () => {
      await request(api)
        .get("/api/movies/trending/today")
        .set("Accept", "application/json");

      const trendingDayMovieModel = mongoose.model('DailyTrendingMovie', MovieSchema);
      //Confirm all movies pulled from the TMDB API are now in the DB
      for (const movie of tmdbMovies.results) {
        const foundMovie = await trendingDayMovieModel.findByMovieDBId(movie.id);
        expect(foundMovie.title).to.deep.equal(movie.title);
      }
    });
  });

  describe("GET /api/movies/:id", () => {

    beforeEach(async () => {
      try {
        await movieDetailsModel.deleteMany();
      } catch (err) {
        loglevel.error(`failed to delete movie details data: ${err}`);
      }

      //Store output from the TMDB API call directly
      tmdbMovie = await getMovie(movies[0].id);
    });

    describe("when the id is valid", () => {

      it("should return the matching movie", async () => {
        const res = await request(api)
          .get(`/api/movies/${movies[0].id}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200);
        expect(res.body).to.have.property("title", movies[0].title);
      });

      it("should return the same movie pulled from TMDB API", (done) => {
        request(api)
          .get(`/api/movies/${movies[0].id}`)
          .set("Accept", "application/json")
          .end((err, res) => {
            expect(res.body.title).to.deep.equal(tmdbMovie.title);
            expect(res.body.id).to.deep.equal(tmdbMovie.id);
            done();
          });
      });
  
      it("should update the DB", async () => {
        await request(api)
          .get(`/api/movies/${movies[0].id}`)
          .set("Accept", "application/json");

        //Confirm movie pulled from the TMDB API is now in the DB
        const foundMovie = await movieDetailsModel.findByMovieDBId(tmdbMovie.id);
        expect(foundMovie.title).to.deep.equal(tmdbMovie.title);
      });

      it("should only update the DB once", async () => {
        await request(api)
          .get(`/api/movies/${movies[0].id}`)
          .set("Accept", "application/json");
        
        //Make another request
        await request(api)
          .get(`/api/movies/${movies[0].id}`)
          .set("Accept", "application/json");

        //Confirm there is still only 1 movie details matching the movie ID in the DB
        const detailsCount = await movieDetailsModel.count({ id: movies[0].id });
        expect(detailsCount).to.equal(1);
      });
    });

    describe("when the id is invalid", () => {

      it("should return an error message", () => {
        return request(api)
          .get("/api/movies/1234567899999")
          .set("Accept", "application/json")
          .expect(500)
          .expect((res) => {
            expect(res.text).to.match(/Hey!! You caught the error 👍👍\. Here's the details: /);
          });
      });

      it("should not update the DB", async () => {
        await request(api)
          .get("/api/movies/1234567899999")
          .set("Accept", "application/json");

        //Confirm invalid movie ID has not been added to the DB
        const foundMovie = await movieDetailsModel.findByMovieDBId(1234567899999);
        expect(foundMovie).to.be.null;
      });
    });
  });

  describe("GET /api/movies/:id/images", () => {

    beforeEach(async () => {
      try {
        await movieDetailsModel.deleteMany();
      } catch (err) {
        loglevel.error(`failed to delete movie details data: ${err}`);
      }

      //Store output from the TMDB API call directly
      tmdbMovieImages = await getMovieImages(movies[0].id);
    });

    describe("when the movie hasn't been called previously", () => {

      it("should return an error message", async () => {
        return request(api)
          .get(`/api/movies/${movies[0].id}/images`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            message: 'The resource you requested could not be found.',
            status_code: 404
          });
      });

      it("should not update the DB", async () => {
        await request(api)
          .get(`/api/movies/${movies[0].id}/images`)
          .set("Accept", "application/json");

        const foundMovie = await movieDetailsModel.findByMovieDBId(movies[0].id);
        expect(foundMovie).to.be.null;
      });
    });

    describe("when the movie has been called previously", () => {

      beforeEach(async () => {
        const res = await request(api)
          .get(`/api/movies/${movies[0].id}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200);
        expect(res.body).to.have.property("title", movies[0].title);
      });

      describe("when the id is valid", () => {

        it("should return the matching movie images", async () => {
          const res = await request(api)
            .get(`/api/movies/${movies[0].id}/images`)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
          expect(res.body.backdrops).to.be.a("array");
        });

        it("should return the same movie images pulled from TMDB API", (done) => {
          request(api)
            .get(`/api/movies/${movies[0].id}/images`)
            .set("Accept", "application/json")
            .end((err, res) => {
              expect(res.body).to.deep.equal(tmdbMovieImages);
              done();
            });
        });
    
        it("should update the DB", async () => {
          await request(api)
            .get(`/api/movies/${movies[0].id}/images`)
            .set("Accept", "application/json");
        
          // Confirm movie images pulled from the TMDB API is now in the DB
          const foundMovie = await movieDetailsModel.findByMovieDBId(movies[0].id);
          foundMovie.images.toObject().backdrops.forEach((image, index) => {
            expect(image.poster_path).to.deep.equal(tmdbMovieImages.backdrops[index].poster_path);
          });
        });
      });

      describe("when the id is invalid", () => {

        it("should return an error message", () => {
          return request(api)
            .get("/api/movies/1234567899999/images")
            .set("Accept", "application/json")
            .expect(500)
            .expect((res) => {
              expect(res.text).to.match(/Hey!! You caught the error 👍👍\. Here's the details: /);
            });
        });
      });
    });
  });
});
