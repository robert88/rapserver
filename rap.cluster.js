
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

global.rap  = global.rap || {};

if (cluster.isMaster) {

    console.log(`Master ${process.pid} is running`);

    // start one worker
    cluster.fork().send('start');

    cluster.on('exit', (worker, code, signal) => {
    	//restart code process.exit(200)
        if(code==200){
             console.log(`worker ${worker.process.pid} died`);
             cluster.fork().send('restart');
        }
    });


} else {
    // Workers can share any TCP connection
    console.log(`Worker ${process.pid} started`);

    process.on('message', (msg) => {
        console.log("master msg",msg,`${process.pid} `);
        //start or restart
        rap.masterStatus = msg;
        require("@/rap.server.js");
    });



}
