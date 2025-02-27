class CatFact {
    constructor() {
      this.facts = [];
    }
  
    // Add a step to the pipeline. Each step is called in the order it was added.
    async add() {
      try {
        const response = await fetch('https://meowfacts.herokuapp.com/');
        const payload = await response.json();
        const fact = payload.data[0];
        this.facts.push(fact);
        return fact;
      } catch (error) {
        console.log(error);
        return null;
      }
    }
  
    // Get the history of cat facts
    history() {
      return this.facts;
    }
  
    // Call the given callback with a new cat fact every `time` milliseconds
    call(time, callback) {
      setInterval(async () => {
        const fact = await this.add();
        callback(fact);
      }, time);
    }
  }
  
  module.exports = CatFact;