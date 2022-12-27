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

    try {
        await User.deleteMany();
    } catch (err) {
    console.error(`failed to delete user data: ${err}`);
    }
  });

  after(async () => {
    try {
      await db.dropDatabase();
    } catch (error) {
      console.log(error);
    }
  });

  afterEach(() => {
    api.close();
  });

  describe("POST /api/users ", () => {
    describe("For registering", () => {
        describe("when credentials are missing", () => {
            before(() => {
                return request(api)
                .get("/api/users")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200)
                .then((res) => {
                    expect(res.body.length).to.equal(0);
                });
            });
            after(() => {
                return request(api)
                .get("/api/users")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200)
                .then((res) => {
                    expect(res.body.length).to.equal(0);
                });
            });
            it("should return a 401 status and error message when all details are missing", () => {
                return request(api)
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
            it("should return a 401 status and error message when password is missing", () => {
              return request(api)
                .post("/api/users?action=register")
                .send({
                  username: "testuser"
                })
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(401)
                .expect({
                    msg: 'Please pass username and password.',
                    success: false
                });
            });
            it("should return a 401 status and error message when username is missing", () => {
                return request(api)
                  .post("/api/users?action=register")
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
      describe("when password is invalid", () => {
        before(() => {
            return request(api)
            .get("/api/users")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
            .then((res) => {
                expect(res.body.length).to.equal(0);
            });
        });
        after(() => {
            return request(api)
            .get("/api/users")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
            .then((res) => {
                expect(res.body.length).to.equal(0);
            });
        });
        it("should return a 401 status and error message", () => {
          return request(api)
            .post("/api/users?action=register")
            .send({
              username: "testuser",
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
        after(() => {
            return request(api)
              .get("/api/users")
              .set("Accept", "application/json")
              .expect("Content-Type", /json/)
              .expect(200)
              .then((res) => {
                expect(res.body.length).to.equal(1);
                const result = res.body.map((user) => user.username);
                expect(result).to.have.members(["testuser1"]);
              });
        });
        it("should return a 201 status and the confirmation message", () => {
          return request(api)
            .post("/api/users?action=register")
            .send({
              username: "testuser1",
              password: "TestPW123!",
            })
            .expect(201)
            .expect({ msg: "Successfully created new user.", code: 201 });
        });
      });
      describe("when username already exists", () => {
        before(() => {
            return request(api)
            .get("/api/users")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
            .then((res) => {
              expect(res.body.length).to.equal(1);
              const result = res.body.map((user) => user.username);
              expect(result).to.have.members(["testuser1"]);
            });
        });
        after(() => {
            return request(api)
            .get("/api/users")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
            .then((res) => {
              expect(res.body.length).to.equal(1);
              const result = res.body.map((user) => user.username);
              expect(result).to.have.members(["testuser1"]);
            });
        });
        it("should return a 401 status and error message", () => {
          return request(api)
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
            it("should return a 401 status and error message when all details are missing", () => {
                return request(api)
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
            it("should return a 401 status and error message when password is missing", () => {
              return request(api)
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
            it("should return a 401 status and error message when username is missing", () => {
                return request(api)
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
            it("should return a 401 status and error message when username is incorrect", () => {
                return request(api)
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
            it("should return a 401 status and error message when password is incorrect", () => {
                return request(api)
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
            it("should return a 200 status and a generated token", () => {
            return request(api)
                .post("/api/users")
                .send({
                    username: "testuser1",
                    password: "TestPW123!",
                })
                .expect(200)
                .then((res) => {
                expect(res.body.success).to.be.true;
                expect(res.body.token).to.not.be.undefined;
                });
            });
        });
    });
  });

  describe("GET /api/users ", () => {
    before(async () => {
        return request(api)
            .post("/api/users?action=register")
            .send({
                username: "testuser2",
                password: "SecondTestPW123!"
              })
              .expect(201)
              .expect({ msg: "Successfully created new user.", code: 201 });
    });
    it("should return the 2 added users and a status 200", (done) => {
        request(api)
        .get("/api/users")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.be.a("array");
          expect(res.body.length).to.equal(2);
          let result = res.body.map((user) => user.username);
          expect(result).to.have.members(["testuser1", "testuser2"]);
          done();
        });
    });
  });

  describe("PUT /api/users/:username ", () => {
    before(async () => {
        return request(api)
            .get("/api/users")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
            .then((res) => {
              const result = res.body.map((user) => user.username);
              expect(result).includes("testuser1");
            });
    });
    describe("when password is missing", () => {
        it("should return a 404 status and error message", () => {
          return request(api)
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
        it("should return a 200 status and confirmation message", () => {
          return request(api)
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
        it("should fail log in with old password", () => {
            return request(api)
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
        it("should log in successfully with new password", () => {
            return request(api)
                .post("/api/users")
                .send({
                    username: "testuser1",
                    password: "NewPW456?"
                })
                .expect(200)
                .then((res) => {
                expect(res.body.success).to.be.true;
                expect(res.body.token).to.not.be.undefined;
                });
        });
    });
  });
});
