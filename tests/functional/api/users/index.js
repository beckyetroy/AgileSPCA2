import chai from "chai";
import request from "supertest";
const mongoose = require("mongoose");
import User from "../../../../api/users/userModel";
import api from "../../../../index";
import movies from "../../../../seedData/movies";

const expect = chai.expect;
let db;

describe("Users endpoint", () => {

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

  beforeEach(async () => {
    try {
      await User.deleteMany();

      //Register 2 users
      await request(api)
        .post("/api/users?action=register")
        .send({
          username: "testuser1",
          password: "TestPW123!",
        })
        .expect(201)
        .expect({ msg: "Successfully created new user.", code: 201 });

      await request(api)
        .post("/api/users?action=register")
        .send({
          username: "testuser2",
          password: "SecondTestPW456?",
        })
        .expect(201)
        .expect({ msg: "Successfully created new user.", code: 201 });
    } catch (err) {
      console.error(`failed to Load user test Data: ${err}`);
    }
  });

  afterEach(() => {
    api.close();
  });

  describe("GET /api/users ", () => {

    it("should return the 2 added users and a status 200", async () => {
      const res = await request(api)
        .get("/api/users")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200);
      expect(res.body).to.be.a("array");
      expect(res.body.length).to.equal(2);
      let result = res.body.map((user) => user.username);
      expect(result).to.have.members(["testuser1", "testuser2"]);
    });

    it("should show the same 2 users in the DB", async () => {
      const res = await request(api)
        .get("/api/users")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200);
      let usernames = res.body.map((user) => user.username);

      //Confirm usernames returned are stored in the DB
      for (const user of usernames) {
        const foundUser = await User.findByUserName(user);
        expect(foundUser.username).to.deep.equal(user);
      }
    });

    it("should not return plaintext passwords in DB or API", async () => {
      //Plaintext passwords (from before hook)
      let passwords = ['TestPW123!', 'SecondTestPW456?'];

      const res = await request(api)
        .get("/api/users")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200);

      //Compare password data returned by API to plaintext
      let passwordsReturnedAPI = res.body.map((user) => user.password);
      expect(passwords).to.not.deep.equal(passwordsReturnedAPI);

      //Compare password data returned by DB to plaintext
      let usernames = res.body.map((user) => user.username);
      let passwordsReturnedDB = [];
      for (const user of usernames) {
        const foundUser = await User.findByUserName(user);
        passwordsReturnedDB.push(foundUser.password);
      }
      expect(passwords).to.not.deep.equal(passwordsReturnedDB);
    });
  });

  describe("POST /api/users ", () => {

    describe("For registering", () => {

        describe("when credentials are missing", () => {

            describe("when all details are missing", () => {

              it("should return a 401 status and error message", async () => {
                await request(api)
                  .post("/api/users?action=register")
                  .send({
                  })
                  .set("Accept", "application/json")
                  .expect("Content-Type", /json/)
                  .expect(401)
                  .expect({
                      msg: 'Please pass username and password.',
                      success: false
                  });
              });
            });

            describe("when password is missing", () => {

              it("should return a 401 status and error message when password is missing", async () => {
                await request(api)
                  .post("/api/users?action=register")
                  .send({
                    username: "testuser3"
                  })
                  .set("Accept", "application/json")
                  .expect("Content-Type", /json/)
                  .expect(401)
                  .expect({
                      msg: 'Please pass username and password.',
                      success: false
                  });
              });

              it("should not update the DB", async () => {
                await request(api)
                  .post("/api/users?action=register")
                  .send({
                    username: "testuser3"
                  })
                  .set("Accept", "application/json")
                  .expect("Content-Type", /json/)
                  .expect(401)
    
                //Confirm testuser3 hasn't been added to the DB
                const foundUser = await User.findByUserName("testuser3");
                expect(foundUser).to.be.null;
              });
            });

            describe("when username is missing", () => {

              it("should return a 401 status and error message when username is missing", async () => {
                await request(api)
                  .post("/api/users?action=register")
                  .send({
                    password: "ThirdTestPW123!"
                  })
                  .set("Accept", "application/json")
                  .expect("Content-Type", /json/)
                  .expect(401)
                  .expect({
                      msg: 'Please pass username and password.',
                      success: false
                  });
              });
            });
        });

        describe("when password is invalid", () => {

          it("should return a 401 status and error message", async () => {
            await request(api)
              .post("/api/users?action=register")
              .send({
                username: "testuser3",
                password: "testpassword",
              })
              .set("Accept", "application/json")
              .expect("Content-Type", /json/)
              .expect(401)
              .expect({
                  msg: 'Sign up failed. Password invalid.',
                  code: 401
              });
          });

          it("should not update the DB", async () => {
            await request(api)
            .post("/api/users?action=register")
            .send({
              username: "testuser3",
              password: "testpassword",
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(401)

            //Confirm testuser3 hasn't been added to the DB
            const foundUser = await User.findByUserName("testuser3");
            expect(foundUser).to.be.null;
          });
      });

      describe("when credentials are valid", () => {

        it("should return a 201 status and the confirmation message", async () => {
          await request(api)
            .post("/api/users?action=register")
            .send({
              username: "testuser3",
              password: "ThirdTestPW123!",
            })
            .expect(201)
            .expect({ msg: "Successfully created new user.", code: 201 });
        });

        it("should update the DB", async () => {
          await request(api)
            .post("/api/users?action=register")
            .send({
              username: "testuser3",
              password: "ThirdTestPW123!",
            })
            .expect(201)

          //Confirm all 3 test users are now stored in the DB
          const usernames = ["testuser1", "testuser2", "testuser3"];

          for (const user of usernames) {
            const foundUser = await User.findByUserName(user);
            expect(foundUser.username).to.deep.equal(user);
          }
        });

        it("should not store plaintext password in DB", async () => {
          await request(api)
            .post("/api/users?action=register")
            .send({
              username: "testuser3",
              password: "ThirdTestPW123!",
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(201)
    
          const foundUser = await User.findByUserName("testuser3");
          expect(foundUser.password).to.not.deep.equal("ThirdTestPW123!");
        });
      });
  
      describe("when username already exists", () => {

        it("should return a 401 status and error message", async () => {
          await request(api)
            .post("/api/users?action=register")
            .send({
              username: "testuser1",
              password: "FaketestPW123!",
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(401)
            .expect({
                msg: 'Sign up failed. Username already taken.',
                success: false
            });
        });

        it("should not update the DB", async () => {
          await request(api)
            .post("/api/users?action=register")
            .send({
              username: "testuser1",
              password: "FaketestPW123!",
            })
            .expect(401)

          //Confirm there is still only 1 user with the username testuser1 in the DB
          const userCount = await User.count({ username: 'testuser1' });
          expect(userCount).to.equal(1);
        });
      });
    });

    describe("For logging in", () => {

        describe("when credentials are missing", () => {

            it("should return a 401 status and error message when all details are missing", async () => {
              await request(api)
                .post("/api/users")
                .send({
                })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401)
                .expect({
                    msg: 'Please pass username and password.',
                    success: false
                });
            });

            it("should return a 401 status and error message when password is missing", async () => {
              await request(api)
                .post("/api/users")
                .send({
                  username: "testuser1"
                })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401)
                .expect({
                    msg: 'Please pass username and password.',
                    success: false
                });
            });

            it("should return a 401 status and error message when username is missing", async () => {
              await request(api)
                .post("/api/users")
                .send({
                  password: "TestPW123!"
                })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401)
                .expect({
                    msg: 'Please pass username and password.',
                    success: false
                });
            });
        });

        describe("when credentials are incorrect", () => {

            it("should return a 401 status and error message when username is incorrect", async () => {
              await request(api)
                .post("/api/users")
                .send({
                  username: "fakeusername",
                  password: "TestPW123!"
                })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401)
                .expect({
                    msg: 'Authentication failed. User not found.',
                    code: 401
                });
            });

            it("should return a 401 status and error message when password is incorrect", async () => {
              await request(api)
                .post("/api/users")
                .send({
                  username: "testuser1",
                  password: "FakePW123!"
                })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401)
                .expect({
                    msg: 'Authentication failed. Wrong password.',
                    code: 401
                });
            });
        });

        describe("when credentials are correct", () => {

            it("should return a 200 status and a generated token", async () => {
              const res = await request(api)
                  .post("/api/users")
                  .send({
                    username: "testuser1",
                    password: "TestPW123!",
                  })
                  .expect(200);
                expect(res.body.success).to.be.true;
                expect(res.body.token).to.not.be.undefined;
            });
        });
    });
  });

  describe("PUT /api/users/:username ", () => {

    describe("when password is missing", () => {

        it("should return a 404 status and error message", async () => {
          await request(api)
            .put("/api/users/testuser1")
            .send({
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(404)
            .expect({
                msg: 'Unable to parse password',
                code: 404
            });
        });
    });

    describe("when password is valid", () => {

        it("should return a 200 status and confirmation message", async () => {
          await request(api)
            .put("/api/users/testuser1")
            .send({
                password: "NewPW456?"
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
            .expect({
                msg: 'User Updated Sucessfully',
                code: 200
            });
        });

        it("should not store plaintext password in DB", async () => {
          await request(api)
            .put("/api/users/testuser1")
            .send({
                password: "NewPW456?"
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
          const foundUser = await User.findByUserName("testuser1");
          expect(foundUser.password).to.not.deep.equal("NewPW456?");
        });

        describe("logging in after update", () => {
          beforeEach(async () => {
            try {
              //Update Password
              await request(api)
                .put("/api/users/testuser1")
                .send({
                    password: "NewPW456?"
                })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200)
                .expect({
                    msg: 'User Updated Sucessfully',
                    code: 200
                });
            } catch (err) {
              console.error(`failed to update user password: ${err}`);
            }
          });

          it("should fail log in with old password", async () => {
            await request(api)
              .post("/api/users")
              .send({
                  username: "testuser1",
                  password: "TestPW123!"
              })
              .set("Accept", "application/json")
              .expect("Content-Type", /json/)
              .expect(401)
              .expect({
                  msg: 'Authentication failed. Wrong password.',
                  code: 401
              });
          });

          it("should log in successfully with new password", async () => {
            const res = await request(api)
              .post("/api/users")
              .send({
                username: "testuser1",
                password: "NewPW456?"
              })
              .expect(200);
            expect(res.body.success).to.be.true;
            expect(res.body.token).to.not.be.undefined;
          });
      });
    });
  });

  describe("GET /api/users/:username/favourites ", () => {

    beforeEach(async () => {
      try {
        //Add a favourite
        await request(api)
          .post("/api/users/testuser1/favourites")
          .send(movies[0])
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(201)
      } catch (err) {
        console.error(`failed to add favourite: ${err}`);
      }
    });

    describe("When username is valid", () => {

      it("should return the user's favourites and a status 200", async () => {
        const res = await request(api)
          .get("/api/users/testuser1/favourites")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200);
        expect(res.body).to.be.a("array");
        const foundMovie = res.body.some((movie) => movie.id === movies[0].id);
        expect(foundMovie).to.be.true;
      });

      it("should show the same user favourites in the DB", async () => {
        const res = await request(api)
          .get("/api/users/testuser1/favourites")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200);

        //Confirm favourite is stored in the DB
        const foundUser = await User.findByUserName("testuser1");
        const foundMovie = foundUser.favourites.some((movie) => movie.id === movies[0].id);
        expect(foundMovie).to.be.true;
      });
    });

    describe("When username is invalid", () => {

      it("should return an error message and status 404", async () => {
        await request(api)
          .get("/api/users/testuser6/favourites")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            msg: 'Unable to Get User Favourites',
            code: 404
          });
      });
    });
  });

  describe("POST /api/users/:username/favourites", () => {

    beforeEach(async () => {
      try {
        //Add a favourite
        await request(api)
          .post("/api/users/testuser1/favourites")
          .send(movies[0])
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(201)
      } catch (err) {
        console.error(`failed to add favourite: ${err}`);
      }
    });

    describe("When movie is not already favourited", () => {

      it("should return the user, including new favourite, and a 201 status", async () => {
        const res = await request(api)
          .post("/api/users/testuser1/favourites")
          .send(movies[1])
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(201)
        expect(res.body.username).to.deep.equal("testuser1");
        const foundMovie1 = res.body.favourites.some((movie) => movie.id === movies[0].id);
        expect(foundMovie1).to.be.true;
        const foundMovie2 = res.body.favourites.some((movie) => movie.id === movies[1].id);
        expect(foundMovie2).to.be.true;
      });

      it("should update the DB", async () => {
        await request(api)
          .post("/api/users/testuser1/favourites")
          .send(movies[1])
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(201)

        //Confirm both favourites are stored in the DB
        const foundUser = await User.findByUserName("testuser1");
        const foundMovie1 = foundUser.favourites.some((movie) => movie.id === movies[0].id);
        expect(foundMovie1).to.be.true;
        const foundMovie2 = foundUser.favourites.some((movie) => movie.id === movies[1].id);
        expect(foundMovie2).to.be.true;
      });
    });

    describe("When movie is already favourited", () => {

      it("should return the user with no duplicate favourites and a 201 status", async () => {
        const res = await request(api)
          .post("/api/users/testuser1/favourites")
          .send(movies[0])
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(201)
        expect(res.body.username).to.deep.equal("testuser1");
        const foundMovies = res.body.favourites.filter((movie) => movie.id === movies[0].id);
        expect(foundMovies.length).to.equal(1);
      });

      it("should not update the DB", async () => {
        await request(api)
          .post("/api/users/testuser1/favourites")
          .send(movies[1])
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(201)

        //Confirm favourite is only stored once in the DB
        const foundUser = await User.findByUserName("testuser1");
        const foundMovies = foundUser.favourites.filter((movie) => movie.id === movies[0].id);
        expect(foundMovies.length).to.equal(1);
      });
    });

  describe("POST /api/users/:username/favourites?action=remove", () => {

    beforeEach(async () => {
      try {
        //Add an additional favourite
        await request(api)
          .post("/api/users/testuser1/favourites")
          .send(movies[2])
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(201)
      } catch (err) {
        console.error(`failed to add favourite: ${err}`);
      }
    });

    describe("When username is invalid", () => {

      it("should return error message and 404 status", async () => {
        await request(api)
          .post("/api/users/testuser6/favourites?action=remove")
          .send(movies[0])
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            msg: 'Unable to Remove Favourite',
            code: 404
          });
      });
    });

    describe("When username is valid", () => {

      describe("When movie is not favourited", () => {

        it("should return the user's favourites, excluding removed, and a 200 status", async () => {
          const res = await request(api)
            .post("/api/users/testuser1/favourites?action=remove")
            .send(movies[1])
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
          
          //Confirm favourite set for removal hasn't been added
          const foundMovies = res.body.filter((movie) => movie.id === movies[1].id);
          expect(foundMovies.length).to.equal(0);

          //Confirm it still shows the expected favourites
          const foundMovies2 = res.body.filter((movie) => movie.id === movies[0].id);
          expect(foundMovies2.length).to.equal(1);
          const foundMovies3 = res.body.filter((movie) => movie.id === movies[2].id);
          expect(foundMovies3.length).to.equal(1);
        });

        it("should not update the DB", async () => {
          await request(api)
            .post("/api/users/testuser1/favourites?action=remove")
            .send(movies[1])
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)

          //Confirm favourite set for removal hasn't been added
          const foundUser = await User.findByUserName("testuser1");
          const foundMovies = foundUser.favourites.filter((movie) => movie.id === movies[1].id);
          expect(foundMovies.length).to.equal(0);

          //Confirm it still shows the expected favourites
          const foundMovies2 = foundUser.favourites.filter((movie) => movie.id === movies[0].id);
          expect(foundMovies2.length).to.equal(1);
          const foundMovies3 = foundUser.favourites.filter((movie) => movie.id === movies[2].id);
          expect(foundMovies3.length).to.equal(1);
        });
      });

      describe("When movie is favourited", () => {

        it("should return the user favourites without the posted favourite and a 200 status", async () => {
          const res = await request(api)
            .post("/api/users/testuser1/favourites?action=remove")
            .send(movies[0])
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
          //Confirm removed favourite isn't returned
          const foundMovies = res.body.filter((movie) => movie.id === movies[0].id);
          expect(foundMovies.length).to.equal(0);

          //Confirm it still shows the expected favourite
          const foundMovies2 = res.body.filter((movie) => movie.id === movies[2].id);
          expect(foundMovies2.length).to.equal(1);
        });

        it("should update the DB", async () => {
          await request(api)
            .post("/api/users/testuser1/favourites?action=remove")
            .send(movies[0])
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)

          const foundUser = await User.findByUserName("testuser1");
          //Confirm removed favourite isn't stored in the DB
          const foundMovies = foundUser.favourites.filter((movie) => movie.id === movies[0].id);
          expect(foundMovies.length).to.equal(0);

          //Confirm expected favourite is still stored in the DB
          const foundMovies2 = foundUser.favourites.filter((movie) => movie.id === movies[2].id);
          expect(foundMovies2.length).to.equal(1);
        });
      });
    });
  });
  });

  describe("GET /api/users/:username/mustwatch ", () => {

    beforeEach(async () => {
      try {
        //Add a must watch
        await request(api)
          .post("/api/users/testuser1/mustwatch")
          .send(movies[0])
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(201)
      } catch (err) {
        console.error(`failed to add must watch: ${err}`);
      }
    });

    describe("When username is valid", () => {

      it("should return the user's must watch movies and a status 200", async () => {
        const res = await request(api)
          .get("/api/users/testuser1/mustwatch")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200);
        expect(res.body).to.be.a("array");
        const foundMovie = res.body.some((movie) => movie.id === movies[0].id);
        expect(foundMovie).to.be.true;
      });

      it("should show the same user must watch movies in the DB", async () => {
        const res = await request(api)
          .get("/api/users/testuser1/mustwatch")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200);

        //Confirm must watch is stored in the DB
        const foundUser = await User.findByUserName("testuser1");
        const foundMovie = foundUser.mustwatch.some((movie) => movie.id === movies[0].id);
        expect(foundMovie).to.be.true;
      });
    });

    describe("When username is invalid", () => {

      it("should return an error message and status 404", async () => {
        await request(api)
          .get("/api/users/testuser6/mustwatch")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            msg: 'Unable to Get User Must Watch List',
            code: 404
          });
      });
    });
  });

  describe("POST /api/users/:username/mustwatch", () => {

    beforeEach(async () => {
      try {
        //Add a must watch movie
        await request(api)
          .post("/api/users/testuser1/mustwatch")
          .send(movies[0])
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(201)
      } catch (err) {
        console.error(`failed to add must watch movie: ${err}`);
      }
    });

    describe("When movie is not already added to must watch", () => {

      it("should return the user, including new must watch movie, and a 201 status", async () => {
        const res = await request(api)
          .post("/api/users/testuser1/mustwatch")
          .send(movies[1])
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(201)
        expect(res.body.username).to.deep.equal("testuser1");
        const foundMovie1 = res.body.mustwatch.some((movie) => movie.id === movies[0].id);
        expect(foundMovie1).to.be.true;
        const foundMovie2 = res.body.mustwatch.some((movie) => movie.id === movies[1].id);
        expect(foundMovie2).to.be.true;
      });

      it("should update the DB", async () => {
        await request(api)
          .post("/api/users/testuser1/mustwatch")
          .send(movies[1])
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(201)

        //Confirm both must watch movies are stored in the DB
        const foundUser = await User.findByUserName("testuser1");
        const foundMovie1 = foundUser.mustwatch.some((movie) => movie.id === movies[0].id);
        expect(foundMovie1).to.be.true;
        const foundMovie2 = foundUser.mustwatch.some((movie) => movie.id === movies[1].id);
        expect(foundMovie2).to.be.true;
      });
    });

    describe("When movie is already a must watch movie", () => {

      it("should return the user with no duplicate must watch movies and a 201 status", async () => {
        const res = await request(api)
          .post("/api/users/testuser1/mustwatch")
          .send(movies[0])
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(201)
        expect(res.body.username).to.deep.equal("testuser1");
        const foundMovies = res.body.mustwatch.filter((movie) => movie.id === movies[0].id);
        expect(foundMovies.length).to.equal(1);
      });

      it("should not update the DB", async () => {
        await request(api)
          .post("/api/users/testuser1/mustwatch")
          .send(movies[1])
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(201)

        //Confirm must watch movie is only stored once in the DB
        const foundUser = await User.findByUserName("testuser1");
        const foundMovies = foundUser.mustwatch.filter((movie) => movie.id === movies[0].id);
        expect(foundMovies.length).to.equal(1);
      });
    });
  });

  describe("POST /api/users/:username/mustwatch?action=remove", () => {

    beforeEach(async () => {
      try {
        //Add a must watch movie
        await request(api)
          .post("/api/users/testuser1/mustwatch")
          .send(movies[0])
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(201)
      } catch (err) {
        console.error(`failed to add must watch movie: ${err}`);
      }
    });

    beforeEach(async () => {
      try {
        //Add an additional must watch movie
        await request(api)
          .post("/api/users/testuser1/mustwatch")
          .send(movies[2])
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(201)
      } catch (err) {
        console.error(`failed to add must watch movie: ${err}`);
      }
    });

    describe("When username is invalid", () => {

      it("should return error message and 404 status", async () => {
        await request(api)
          .post("/api/users/testuser6/mustwatch?action=remove")
          .send(movies[0])
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            msg: 'Unable to Remove from Must Watch',
            code: 404
          });
      });
    });

    describe("When username is valid", () => {

      describe("When movie is not a must watch movie", () => {

        it("should return the user's must watch movies, excluding removed, and a 200 status", async () => {
          const res = await request(api)
            .post("/api/users/testuser1/mustwatch?action=remove")
            .send(movies[1])
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
          
          //Confirm must watch movie set for removal hasn't been added
          const foundMovies = res.body.filter((movie) => movie.id === movies[1].id);
          expect(foundMovies.length).to.equal(0);

          //Confirm it still shows the expected must watch movies
          const foundMovies2 = res.body.filter((movie) => movie.id === movies[0].id);
          expect(foundMovies2.length).to.equal(1);
          const foundMovies3 = res.body.filter((movie) => movie.id === movies[2].id);
          expect(foundMovies3.length).to.equal(1);
        });

        it("should not update the DB", async () => {
          await request(api)
            .post("/api/users/testuser1/mustwatch?action=remove")
            .send(movies[1])
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)

          //Confirm must watch movie set for removal hasn't been added
          const foundUser = await User.findByUserName("testuser1");
          const foundMovies = foundUser.mustwatch.filter((movie) => movie.id === movies[1].id);
          expect(foundMovies.length).to.equal(0);

          //Confirm it still shows the expected must watch movies
          const foundMovies2 = foundUser.mustwatch.filter((movie) => movie.id === movies[0].id);
          expect(foundMovies2.length).to.equal(1);
          const foundMovies3 = foundUser.mustwatch.filter((movie) => movie.id === movies[2].id);
          expect(foundMovies3.length).to.equal(1);
        });
      });

      describe("When movie is a must watch movie", () => {

        it("should return the user must watch movies without the posted must watch movie and a 200 status", async () => {
          const res = await request(api)
            .post("/api/users/testuser1/mustwatch?action=remove")
            .send(movies[0])
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
          //Confirm removed must watch movie isn't returned
          const foundMovies = res.body.filter((movie) => movie.id === movies[0].id);
          expect(foundMovies.length).to.equal(0);

          //Confirm it still shows the expected must watch movie
          const foundMovies2 = res.body.filter((movie) => movie.id === movies[2].id);
          expect(foundMovies2.length).to.equal(1);
        });

        it("should update the DB", async () => {
          await request(api)
            .post("/api/users/testuser1/mustwatch?action=remove")
            .send(movies[0])
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)

          const foundUser = await User.findByUserName("testuser1");
          //Confirm removed must watch movie isn't stored in the DB
          const foundMovies = foundUser.mustwatch.filter((movie) => movie.id === movies[0].id);
          expect(foundMovies.length).to.equal(0);

          //Confirm expected must watch movie is still stored in the DB
          const foundMovies2 = foundUser.mustwatch.filter((movie) => movie.id === movies[2].id);
          expect(foundMovies2.length).to.equal(1);
        });
      });
    });
  });
});
