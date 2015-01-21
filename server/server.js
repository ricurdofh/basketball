'use strict';

var express = require('express.io'),
    botGames = require('./bots/botGames'),
    botClassifications = require('./bots/botClassifications'),
    gamesSocket = require('./controllers/gamesSocketController'),
    CronJob = require('cron').CronJob,
    app = express();

app.http().io();

require('./controllers/app')(app);

app.listen(3000, function () {
    // var gameJob = new CronJob('10 * * * * *', function () {
    //     console.log('Games');
    //     botGames();
    // }, function () {
    //     gamesSocket(app);
    // }, true);
    // var classifJob = new CronJob('30 * * * * *', botClassifications, true);
    // gameJob.start();
    // classifJob.start();

    //para que ejecute los bots y un aviso por socket a los clientes 
    //cada cierto tiempo desde que se corre el server
    //Aún en pruebas.......
    var gameJob = new CronJob('50 * * * * *', function() { 
        botGames();
        gamesSocket(app)
    }, null, true);
    gameJob.start();

});