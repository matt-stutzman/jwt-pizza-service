const request = require('supertest');
const app = require('../service');
const {DB} = require("../database/database");

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
let testUserAuthToken;

beforeAll(async () => {
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = registerRes.body.token;
});

test("get all franchises", async() => {
    const resp = await request(app).get("/api/franchise");
    expect(resp.status).toBe(200);
    expect(resp.body).toBeDefined();
})