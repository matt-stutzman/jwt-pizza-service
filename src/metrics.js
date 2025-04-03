const os = require('os');
const config = require('./config');

// const requests = {};
// //track the authtokens?
// const users = {};
// const successfulAuth = {};
// const failureAuth = {};

/*

1. http requests by method/minute
    a. total requests
    b. GET, PUT, POST, DELETE requests
2. Active Users
3. Authentication attempts/minute
    a. successful
    b. failed

Intercept all the authentication attempts and see which are successful/failed?

4.CPU and Memory usage percentage
5.Pizzas
    a. sold/minute
    b. creation failures
    c. revenue/minute

Intercept all the pizza making requests?

6.Latency
    a. service endpoint
    b. Pizza creation



*/


class Metrics{
    getRequests = 0;
    postRequests = 0;
    putRequests = 0;
    deleteRequests = 0;

    pizzasOrdered = 0;
    creationFailures = 0;
    //Os = 0;
    memory = 0;

    successfulAuth = 0;
    failedAuth = 0;
    revenue = 0;

    requestLatency = 0;
    pizzaLatency = 0;
    // soldPizzas = 0;
    // revenue = 0;
    //
    // serviceLatencyStart;
    // serviceLatencyEnd;
    //
    // pizzaCreateStart;
    // pizzaCreateEnd;

    users = {};

    incrementGetRequests(){
        this.getRequests += 1;
    }
    incrementPutRequests(){
        this.putRequests += 1;
    }
    incrementPostRequests(){
        this.postRequests += 1;
    }
    incrementDeleteRequests(){
        this.deleteRequests += 1;
    }
    incrementFailAuth(){
        this.failedAuth += 1;
    }
    incrementSuccessAuth(){
        this.successfulAuth += 1;
    }

    incrementPizzasOrdered(numPizzas){
        this.pizzasOrdered += numPizzas;
    }

    incrementCreationFailures(){
        this.creationFailures += 1;
    }

    incrementRevenue(revenue){
        this.revenue += revenue;
    }

    addUser(authtoken){
        this.users[authtoken] = Date.now();
    }

    deleteUser(authtoken){
        delete this.users[authtoken];
    }

    setPizzaLatency(latency){
        this.pizzaLatency = latency;
    }

    setRequestLatency(latency){
        this.requestLatency = latency;
    }

    getCpuUsagePercentage() {
        const cpuUsage = os.loadavg()[0] / os.cpus().length;
        return cpuUsage.toFixed(2) * 100;
    }

    makeMetric(metricName, metricValue, unit, type){
        let singleMetric;
        if(type === "sum" || type === "histogram"){
            singleMetric = {
                name: metricName,
                unit: unit,
                [type]: {
                    dataPoints:[
                        {
                            asDouble: metricValue,
                            timeUnixNano: Date.now() * 1000000,
                            attributes: [
                                {
                                    key: "source",
                                    value: {"stringValue": config.metrics.source}
                                }
                            ]
                        }
                    ],
                aggregationTemporality: 'AGGREGATION_TEMPORALITY_CUMULATIVE',
                isMonotonic: true,
                }
            }             
        }
        else{
            singleMetric = {
                name: metricName,
                unit: unit,
                [type]: {
                    dataPoints:[
                        {
                            asDouble: metricValue,
                            timeUnixNano: Date.now() * 1000000,
                            attributes: [
                                {
                                    key: "source",
                                    value: {"stringValue": config.metrics.source}
                                }
                            ],
                        }
                    ]
                },
            }
        }
        // if(type === "sum"){
        //     type.aggregationTemporality = 'AGGREGATION_TEMPORALITY_CUMULATIVE'
        //     type.isMonotonic = true;
        // }
        return singleMetric;
    }

    getMemoryUsagePercentage() {
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;
        const memoryUsage = (usedMemory / totalMemory) * 100;
        return memoryUsage.toFixed(2);
    }

    getActiveUsers(){
        //delete inactive authtokens;
        Object.keys(this.users).forEach(user => {
            if(Date.now() - this.users[user] > 300000){
                delete this.users[user]
            }
        });
        return Object.keys(this.users).length;
    }

    startSendingMetrics(pd){
        setInterval(() => {
            let metrics2Send = [];
            let mem = this.getMemoryUsagePercentage();
            metrics2Send.push(this.makeMetric("memory", mem, "%", "gauge"));

            let cpu = this.getCpuUsagePercentage();
            metrics2Send.push(this.makeMetric("cpu", cpu, "%", "gauge"));

            let numUsers = this.getActiveUsers();

            // console.log("get requests = " + this.getRequests);
            // console.log("post requests = " + this.postRequests);
            // console.log("delete requests = " + this.deleteRequests);
            // console.log("put requests = " + this.putRequests);
            // console.log("total requests = " + (this.getRequests + this.deleteRequests + this.postRequests + this.putRequests));
            // console.log("cpu = " + cpu);
            // console.log("mem = " + mem);
            // console.log("failed auth = " + this.failedAuth);
            // console.log("successful auth = " + this.successfulAuth);
            // console.log("total auth = " + (this.successfulAuth + this.failedAuth)); 
            // console.log("total pizzas = " + this.pizzasOrdered);
            // console.log("total revenue = " + this.revenue);
            // console.log("creation failures = " + this.creationFailures);
            // console.log("num users = " + numUsers);
            // console.log("pizza latency = " + this.pizzaLatency);
            // console.log("request latency = " + this.requestLatency);

            metrics2Send.push(this.makeMetric("getRequests", this.getRequests, "1", "sum"));
            metrics2Send.push(this.makeMetric("postRequests", this.postRequests, "1", "sum"));
            metrics2Send.push(this.makeMetric("putRequests", this.putRequests, "1", "sum"));
            metrics2Send.push(this.makeMetric("deleteRequests", this.deleteRequests, "1", "sum"));
            metrics2Send.push(this.makeMetric("successfulAuth", this.successfulAuth, "1", "sum"));
            metrics2Send.push(this.makeMetric("failedAuth", this.failedAuth, "1", "sum"));
            metrics2Send.push(this.makeMetric("totalRequests", (this.getRequests + this.deleteRequests + this.postRequests + this.putRequests), "1", "sum"));
            metrics2Send.push(this.makeMetric("totalAuthAttemps", (this.successfulAuth + this.failedAuth), "1", "sum"));
            metrics2Send.push(this.makeMetric("totalPizzas", this.pizzasOrdered, "1", "sum"));
            metrics2Send.push(this.makeMetric("totalRevenue", this.revenue, "1","sum"));
            metrics2Send.push(this.makeMetric("creationFailures", this.creationFailures, "1","sum"));
            metrics2Send.push(this.makeMetric("numUsers", numUsers, "1","sum"));
            metrics2Send.push(this.makeMetric("requestLatency",this.requestLatency, "ms", "sum"));
            metrics2Send.push(this.makeMetric("pizzaLatency",this.pizzaLatency, "ms", "sum"));
            
            this.sendMetricToGrafana(metrics2Send);
            
        }, pd)
    }

    sendMetricToGrafana(metrics){
        let body = {
            resourceMetrics: [
                {
                    scopeMetrics: [
                        {
                            metrics: metrics
                        }
                    ]
                }
            ]
        };

        const reqBody = JSON.stringify(body);
        //console.log(reqBody);
        //console.log(reqBody);
        fetch(`${config.metrics.url}`, {
            method: 'POST',
            body: reqBody,
            headers: { Authorization: `Bearer ${config.metrics.apiKey}`, 'Content-Type': 'application/json' },
        })
            .then((response) => {
                if (!response.ok) {
                    response.text().then((text) => {
                        console.error(`Failed to push metrics data to Grafana: ${text}\n${reqBody}`);
                    });
                } else {
                    console.log(`Pushed to grafana`);
                }
            })
            .catch((error) => {
                console.error('Error pushing metrics:', error);
            });

    }
    //list out all metric attributes
    //num getRequests
    //num postRequests
    //Os, memory

    //methods to change these attributes
    //increment getRequests
    //update Os/ Memory

    //set timeOut (wrapped in a method)
    //method to send metric to grafana
}

const metrics = new Metrics();

module.exports = {metrics};
//export instance of the class