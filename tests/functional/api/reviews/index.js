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

    describe("GET /api/reviews/:id", () => {

        beforeEach(async () => {
          try {
            await movieDetailsModel.deleteMany();
          } catch (err) {
            console.error(`failed to delete movie details data: ${err}`);
          }
    
          //Store output from the TMDB API call directly
          //Using the 3rd seed data movie as reviews are not empty
          tmdbReviews = await getMovieReviews(movies[2].id);
        });
    
        describe("when the movie hasn't been called previously", () => {

            it("should return an error message", async () => {
              return request(api)
                .get(`/api/reviews/${movies[2].id}`)
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
                .get(`/api/reviews/${movies[2].id}`)
                .set("Accept", "application/json");
            
              const foundMovie = await movieDetailsModel.findByMovieDBId(movies[2].id);
              expect(foundMovie).to.be.null;
            });
          });
      
        describe("when the movie has been called previously", () => {
      
            beforeEach(async () => {
              const res = await request(api)
                .get(`/api/movies/${movies[2].id}`)
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);
              expect(res.body).to.have.property("title", movies[2].title);
            });
      
            describe("when the id is valid", () => {
      
              it("should return the matching movie reviews", async () => {
                const res = await request(api)
                  .get(`/api/reviews/${movies[2].id}`)
                  .set("Accept", "application/json")
                  .expect("Content-Type", /json/)
                  .expect(200);
                expect(res.body).to.be.a("array");
              });
      
              it("should return the same movie reviews pulled from TMDB API", (done) => {
                request(api)
                  .get(`/api/reviews/${movies[2].id}`)
                  .set("Accept", "application/json")
                  .end((err, res) => {
                    expect(res.body).to.deep.equal(tmdbReviews);
                    done();
                  });
              });
          
              it("should update the DB", async () => {
                await request(api)
                  .get(`/api/reviews/${movies[2].id}`)
                  .set("Accept", "application/json");
              
                // Confirm movie reviews pulled from the TMDB API is now in the DB
                const foundMovie = await movieDetailsModel.findByMovieDBId(movies[2].id);
                foundMovie.reviews.toObject().forEach((review, index) => {
                  expect(review.id).to.deep.equal(tmdbReviews[index].id);
                  expect(review.author).to.deep.equal(tmdbReviews[index].author);
                  expect(review.content).to.deep.equal(tmdbReviews[index].content);
                });
              });
            });
      
            describe("when the id is invalid", () => {
      
              it("should return an error message", () => {
                return request(api)
                  .get("/api/reviews/1234567899999")
                  .set("Accept", "application/json")
                  .expect(404)
                  .expect({
                    message: 'The resource you requested could not be found.',
                    status_code: 404
                  });
              });
            });
        });
    });
});