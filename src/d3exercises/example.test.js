const {add} = require('./add');

test('add 2 numbers', ()=>{
    expect(add(1,1)).toBe(2);
})

test('add multiple numbers',()=>{
    expect(add(1,2,3,4,5)).toBe(15);
})