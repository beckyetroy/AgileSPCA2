import chai from "chai";
import request from "supertest";
const mongoose = require("mongoose");
import User from "../../../../api/users/userModel";
import api from "../../../../index";

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
    } catch (err) {
      console.error(`failed to delete user data: ${err}`);
    }
    try {
      await request(api)
        .post("/api/users?action=register")
        .send({
          username: "testuser1",
          password: "TestPW123!",
        })
        .expect(201)
        .expect({ msg: "Successfully created new user.", code: 201 });
    } catch (err) {
      console.error(`failed to register user data: ${err}`);
    }
    try {
      await request(api)
        .post("/api/users?action=register")
        .send({
          username: "testuser2",
          password: "SecondTestPW456?",
        })
        .expect(201)
        .expect({ msg: "Successfully created new user.", code: 201 });
    } catch (err) {
      console.error(`failed to register user data: ${err}`);
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
  });

  describe("POST /api/users ", () => {

    describe("For registering", () => {

        describe("when credentials are missing", () => {
            //Confirm still only 2 users from before hook are returned
            afterEach(async () => {
              const res = await request(api)
                .get("/api/users")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);
              expect(res.body.length).to.equal(2);
              const result = res.body.map((user) => user.username);
              expect(result).to.have.members(["testuser1", "testuser2"]);
            });

            it("should return a 401 status and error message when all details are missing", async () => {
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

        describe("when password is invalid", () => {
          //Confirm still only 2 users from before hook are returned
          afterEach(async () => {
              const res = await request(api)
                .get("/api/users")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200);
              expect(res.body.length).to.equal(2);
              const result = res.body.map((user) => user.username);
              expect(result).to.have.members(["testuser1", "testuser2"]);
          });

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
      });

      describe("when credentials are valid", () => {
        //Check that created user is now returned
        afterEach(async () => {
          const res = await request(api)
            .get("/api/users")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
          expect(res.body.length).to.equal(3);
          const result = res.body.map((user) => user.username);
          expect(result).to.have.members(["testuser1", "testuser2", "testuser3"]);
        });

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
      });
  
      describe("when username already exists", () => {

        afterEach(async () => {
          //Confirm still only 2 users from before hook are returned
          const res = await request(api)
            .get("/api/users")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);
          expect(res.body.length).to.equal(2);
          const result = res.body.map((user) => user.username);
          expect(result).to.have.members(["testuser1", "testuser2"]);
        });

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
});
