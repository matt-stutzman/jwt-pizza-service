const request = require('supertest');
const app = require('../service');
const {DB} = require("../database/database");

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' , roles: ['admin'] };
let testUserAuthToken;
let testUserID;
let tempName;
let franchiseID;
//spin up a temp db
//add franchise
//add store
//delete franchise
//delete store

function nameGenerator(){
    const letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","1","2","3","4","5"];
    let newName = "";
    for (let i = 0; i < 12; i++){
        newName += letters[Math.floor(Math.random() * letters.length)];
    }
    return newName;
}

beforeAll(async () => {
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = registerRes.body.token;
  testUserID = registerRes.body.user.id;
  tempName = nameGenerator();
  franchiseID = DB.createFranchise({name:tempName, admins: [{email: testUser.email}]}).id;
});

afterAll(async () =>{
    //delete all temp data
    DB.deleteFranchise(franchiseID)
})

test("get all franchises", async() => {
    //franchiseID = await DB.createFranchise({name:tempName,admins: [{email: testUser.email}]}).id;
    const resp = await request(app).get("/api/franchise").set("Authorization", "Bearer " + testUserAuthToken);
    expect(resp.status).toBe(200);
    expect(resp.body).toBeDefined();
    let franchises = "";
    resp.body.forEach((entry) => {
        franchises += entry.name + " ";
    })

    expect(franchises.indexOf(tempName)).not.toBe(-1);
})

test("get all franchises for user", async() =>{
    const resp = await request(app).get("/api/franchise/" + testUserID.toString()).set("Authorization", "Bearer " + testUserAuthToken);
    expect(resp.status).toBe(200);
    expect(resp.body).toBeDefined();
})

test("add a franchise", async() => {

})

test("add a store", async() =>{

})

test("delete a franchise", async() => {

})

test("delete a store", async() =>{

})