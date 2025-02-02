const CatFact = require('./catFact')

test('Proper initialization', ()=>{
    let cat = new CatFact();
    expect(cat.facts).toEqual([]);
    expect(cat.history()).toEqual([]);
})

test('Add', async () =>{
    let cat = new CatFact();
    let fact = await cat.add();
    expect(cat.history().length).toEqual(1);
    expect(cat.history()[0]).toBeDefined();
    expect(fact).toEqual(cat.history()[0]);
})

test('Call', async() => {

    let cat = new CatFact();
    jest.useFakeTimers();
    const mockCallBack = jest.fn();
    const addSpy = jest.spyOn(cat,"add").mockResolvedValue("hooray");
    cat.call(500, mockCallBack);

    expect(addSpy).toBeCalledTimes(0);
    expect(mockCallBack).toBeCalledTimes(0);

    jest.advanceTimersByTime(500);
    await Promise.resolve();

    expect(addSpy).toBeCalledTimes(1);
    expect(mockCallBack).toBeCalledTimes(1);

    jest.useRealTimers();
})