'use strict';

var botGames = require('./botGames'),
    botClassifications = require('./botClassifications'),
    gamesSocket = require('../controllers/gamesSocketController'),
    cluster = require('cluster'),
    numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
        var worker = cluster.fork();
        if (i % 2 === 0) {
            worker.on('message', function(message) {
                if (message === 'games') {
                    botGames();
                }
            });
        } else {
            worker.on('message', function(message) {
                if (message === 'classif') {
                    botClassifications();
                }
            });            
        }
    }

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
  });

} else {

    setInterval(function () {
        process.send('games');
    }, 60000);
    setInterval(function () {
        process.send('classif');
    }, 150000);

}