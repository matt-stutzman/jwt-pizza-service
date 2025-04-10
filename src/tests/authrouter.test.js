const request = require('supertest');
const app = require('../service');

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
let testUserAuthToken;

beforeAll(async () => {
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = registerRes.body.token;
});

test('login', async () => {
  const loginRes = await request(app).put('/api/auth').send(testUser);
  expect(loginRes.status).toBe(200);
  expect(loginRes.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);

  const { password, ...user } = { ...testUser, roles: [{ role: 'diner' }] };
  expect(loginRes.body.user).toMatchObject(user);
  expect(password).toBeTruthy();
});

test('register', async () => {
    const registerResponse = await request(app).post('/api/auth').send(testUser);
    expect(registerResponse.status).toBe(200);
    expect(registerResponse.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
    const { password, ...user } = { ...testUser, roles: [{ role: 'diner' }] };
    expect(registerResponse.body.user).toMatchObject(user);
    expect(password).toBeTruthy();
})

test('logout', async() => {
    const logoutResponse = await request(app).delete('/api/auth').set("Authorization", "Bearer " + testUserAuthToken);
    expect(logoutResponse.status).toBe(200);
})

test('bad logout', async() =>{
    const badLogoutResponse = await request(app).delete('/api/auth');
    expect(badLogoutResponse).not.toBe(200);
})

test('bad register', async() => {
    const badRegisterResponse = await request(app).post('/api/auth').send({name:"bob", email: "bob@gmail.com"});
    expect(badRegisterResponse).not.toBe(200);
})