import { getGenres } from "../../../../api/tmdb/tmdb-api";
import chai from "chai";
import request from "supertest";
const mongoose = require("mongoose");
import api from "../../../../index";

const expect = chai.expect;
let tmdbGenres;

describe("Genres endpoint", () => {
  
    afterEach(() => {
      api.close(); // Release PORT 8080
    });

    describe("GET /api/genres", () => {

        beforeEach(async () => {
            //Store output from the TMDB API call directly
            tmdbGenres = await getGenres();
        });

        it("should return an array of genres", (done) => {
            request(api)
              .get("/api/genres")
              .set("Accept", "application/json")
              .expect("Content-Type", /json/)
              .expect(200)
              .end((err, res) => {
                expect(res.body.genres).to.be.a("array");
                done();
              });
          });
      
          it("should return the same genres pulled from TMDB API", (done) => {
            request(api)
              .get("/api/genres")
              .set("Accept", "application/json")
              .end((err, res) => {
                expect(res.body).to.deep.equal(tmdbGenres);
                done();
              });
          });
    });
});