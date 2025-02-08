const request = require('supertest');
const app = require('../service');
const {DB} = require("../database/database");

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
let testUserAuthToken;

//spin up a temp db

//add franchise
//add store
//delete franchise
//delete store

beforeAll(async () => {
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = registerRes.body.token;

  DB.createFranchise({name:"newFranchise", admins: [{email: testUser.email}]})
  //DB.createStore()
});

test("get all franchises", async() => {
    const resp = await request(app).get("/api/franchise");
    expect(resp.status).toBe(200);
    expect(resp.body).toBeDefined();
})

test("get all franchises for user", async() =>{
    const resp = await request(app).get("/api/franchise/")
})

test("add a franchise", async() => {

})

test("add a store", async() =>{

})

test("delete a franchise", async() => {

})

test("delete a store", async() =>{

})