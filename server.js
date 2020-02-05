// set up server
const express = require('express');
let app = express();
const port = 3001;
const initApp = require('./endpoints');

// multi-threaded performance
const cluster = require('cluster');
const numCPUs  = require('os').cpus().length;

// basic connection security
const helmet = require('helmet');
app.use(helmet);

// compression
const gzip = require('compression');
app.use(gzip());

// json encoding
const bp = require('body-parser');
app.use(bp.json());

// event control
const events = require('events');
events.EventEmitter.defaultMaxListeners(20); // set the default maxListeners to 20 (you may increase or set to 0 for unlimited)

if(cluster.isMaster) {

  console.log(`Starting: MASTER ${process.pid}`);

  // Fork off the workers
  for(let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Kill Message for workers
  cluster.on('exit', (worker) => {
    console.log(`Killed: WORKER ${worker.process.pid}`);
  });

} else {

  // initialize the endpoints
  app = initApp(app);

  // start the app
  app.listen(port, () => {
    console.log(`start: CLUSTER ${process.pid}`);
    console.log(`PORT: ${port}`);
  });

}

