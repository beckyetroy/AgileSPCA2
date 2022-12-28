import chai from "chai";
import request from "supertest";
const mongoose = require("mongoose");
import MovieSchema from "../../../../api/movies/movieModel";
import movieDetailsModel from "../../../../api/movies/movieDetailsModel";
import api from "../../../../index";
import movies from "../../../../seedData/movies";

const expect = chai.expect;
let db;

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
      console.log(error);
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
        console.error(`failed to delete discover movie data: ${err}`);
      }
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
  });

  describe("GET /api/movies/upcoming", () => {

    beforeEach(async () => {
      const upcomingMovieModel = mongoose.model('UpcomingMovie', MovieSchema);
      try {
        await upcomingMovieModel.deleteMany();
      } catch (err) {
        console.error(`failed to delete upcoming movie data: ${err}`);
      }
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
  });

  describe("GET /api/movies/trending/week", () => {

    beforeEach(async () => {
      const trendingWeekMovieModel = mongoose.model('WeeklyTrendingMovie', MovieSchema);
      try {
        await trendingWeekMovieModel.deleteMany();
      } catch (err) {
        console.error(`failed to delete trending (weekly) movie data: ${err}`);
      }
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
  });

  describe("GET /api/movies/trending/today", () => {

    beforeEach(async () => {
      const trendingDayMovieModel = mongoose.model('DailyTrendingMovie', MovieSchema);
      try {
        await trendingDayMovieModel.deleteMany();
      } catch (err) {
        console.error(`failed to delete trending (daily) movie data: ${err}`);
      }
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
  });

  describe("GET /api/movies/:id", () => {

    beforeEach(async () => {
      try {
        await movieDetailsModel.deleteMany();
      } catch (err) {
        console.error(`failed to delete movie details data: ${err}`);
      }
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
    });
  });

  describe("GET /api/movies/:id/images", () => {

    beforeEach(async () => {
      try {
        await movieDetailsModel.deleteMany();
      } catch (err) {
        console.error(`failed to delete movie details data: ${err}`);
      }
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
    });

    describe("when the movie has been called previously", () => {

      beforeEach(() => {
        return request(api)
        .get(`/api/movies/${movies[0].id}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .then((res) => {
            expect(res.body).to.have.property("title", movies[0].title);
          });
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