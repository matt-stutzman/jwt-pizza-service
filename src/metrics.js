const os = require('os');
const config = require('./config');

const requests = {};
//track the authtokens?
const users = {};
const successfulAuth = {};
const failureAuth = {};

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

    Os = 0;
    memory = 0;

    successfulAuth = 0;
    failedAuth = 0;

    soldPizzas = 0;
    revenue = 0;

    serviceLatencyStart;
    serviceLatencyEnd;

    pizzaCreateStart;
    pizzaCreateEnd;

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

function getCpuUsagePercentage() {
  const cpuUsage = os.loadavg()[0] / os.cpus().length;
  return cpuUsage.toFixed(2) * 100;
}

function getMemoryUsagePercentage() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsage = (usedMemory / totalMemory) * 100;
  return memoryUsage.toFixed(2);
}

function sendMetricToGrafana(metricName, metricValue, type, unit) {
    const metric = {
      resourceMetrics: [
        {
          scopeMetrics: [
            {
              metrics: [
                {
                  name: metricName,
                  unit: unit,
                  [type]: {
                    dataPoints: [
                      {
                        asDouble: metricValue,
                        timeUnixNano: Date.now() * 1000000,
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
    };
  
    if (type === 'sum') {
      metric.resourceMetrics[0].scopeMetrics[0].metrics[0][type].aggregationTemporality = 'AGGREGATION_TEMPORALITY_CUMULATIVE';
      metric.resourceMetrics[0].scopeMetrics[0].metrics[0][type].isMonotonic = true;
    }
  
    const body = JSON.stringify(metric);
    fetch(`${config.url}`, {
      method: 'POST',
      body: body,
      headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (!response.ok) {
          response.text().then((text) => {
            console.error(`Failed to push metrics data to Grafana: ${text}\n${body}`);
          });
        } else {
          console.log(`Pushed ${metricName}`);
        }
      })
      .catch((error) => {
        console.error('Error pushing metrics:', error);
      });
  }

const metrics = new Metrics();

module.exports = { metrics };
//export instance of the class