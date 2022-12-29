import chai from "chai";
import request from "supertest";
const mongoose = require("mongoose");
import personModel from "../../../../api/people/personModel";
import creditsModel from "../../../../api/people/creditsModel";
import api from "../../../../index";
import movies from "../../../../seedData/movies";
import people from "../../../../seedData/people";
import { getPersonDetails, getMovieCredits } from "../../../../api/tmdb/tmdb-api";

const expect = chai.expect;
let db;
let tmdbCredits;
let tmdbPerson;

describe("People endpoint", () => {

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

    describe("GET /api/people/movie/:id/credits", () => {

        beforeEach(async () => {
          try {
            await creditsModel.deleteMany();
          } catch (err) {
            console.error(`failed to delete movie credits data: ${err}`);
          }
    
          //Store output from the TMDB API call directly
          tmdbCredits = await getMovieCredits(movies[0].id);
        });
    
        it("should return an array of cast, an array of crew and a status 200", (done) => {
          request(api)
            .get(`/api/people/movie/${movies[0].id}/credits`)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
            .end((err, res) => {
              expect(res.body.cast).to.be.a("array");
              expect(res.body.crew).to.be.a("array");
              done();
            });
        });
    
        it("should return the same credits pulled from TMDB API", (done) => {
          request(api)
            .get(`/api/people/movie/${movies[0].id}/credits`)
            .set("Accept", "application/json")
            .end((err, res) => {
              expect(res.body).to.deep.equal(tmdbCredits);
              done();
            });
        });
    
        it("should update the DB", async () => {
          await request(api)
            .get(`/api/people/movie/${movies[0].id}/credits`)
            .set("Accept", "application/json")

            //Confirm credits pulled from the TMDB API are now in the DB
            const foundMovieCredits = await creditsModel.findByMovieDBId(movies[0].id);
            expect(foundMovieCredits.id).to.deep.equal(tmdbCredits.id);
            for (const cast of tmdbCredits.cast) {
                expect(foundMovieCredits.cast.map((c) => c.name)).to.include(cast.name);
            }
            for (const crew of tmdbCredits.crew) {
                expect(foundMovieCredits.crew.map((c) => c.name)).to.include(crew.name);
            }
        });

        it("should only update the DB once", async () => {
            await request(api)
              .get(`/api/people/movie/${movies[0].id}/credits`)
              .set("Accept", "application/json")
            
            //Make another request
            await request(api)
              .get(`/api/people/movie/${movies[0].id}/credits`)
              .set("Accept", "application/json")
  
            //Confirm there is still only 1 credit with the movie ID in the DB
            const creditCount = await creditsModel.count({ id: movies[0].id });
            expect(creditCount).to.equal(1);
        });
    });

    describe("GET /api/people/:id", () => {

        beforeEach(async () => {
          try {
            await personModel.deleteMany();
          } catch (err) {
            console.error(`failed to delete person data: ${err}`);
          }
    
          //Store output from the TMDB API call directly
          tmdbPerson = await getPersonDetails(people[0].id);
        });
    
        describe("when the id is valid", () => {
    
          it("should return the matching person", async () => {
            const res = await request(api)
              .get(`/api/people/${people[0].id}`)
              .set("Accept", "application/json")
              .expect("Content-Type", /json/)
              .expect(200);
            expect(res.body).to.have.property("name", people[0].name);
          });
    
          it("should return the same movie pulled from TMDB API", (done) => {
            request(api)
              .get(`/api/people/${people[0].id}`)
              .set("Accept", "application/json")
              .end((err, res) => {
                expect(res.body.name).to.deep.equal(tmdbPerson.name);
                expect(res.body.id).to.deep.equal(tmdbPerson.id);
                done();
              });
          });
      
          it("should update the DB", async () => {
            await request(api)
              .get(`/api/people/${people[0].id}`)
              .set("Accept", "application/json");
    
            //Confirm person pulled from the TMDB API is now in the DB
            const foundPerson = await personModel.findByPersonDBId(tmdbPerson.id);
            expect(foundPerson.name).to.deep.equal(tmdbPerson.name);
          });
        });
    
        describe("when the id is invalid", () => {
    
          it("should return an error message", () => {
            return request(api)
              .get("/api/people/1234567899999")
              .set("Accept", "application/json")
              .expect(404)
              .expect({
                message: "The resource you requested could not be found.",
                status_code: 404,
              });
          });
    
          it("should not update the DB", async () => {
            await request(api)
              .get("/api/people/1234567899999")
              .set("Accept", "application/json");
    
            //Confirm invalid movie ID has not been added to the DB
            const foundPerson = await personModel.findByPersonDBId(1234567899999);
            expect(foundPerson).to.be.null;
          });
        });
    });
});