'use strict';

var express = require('express.io'),
    gamesSocket = require('./controllers/gamesSocketController'),
    app = express();

app.http().io();

require('./controllers/app')(app);

app.listen(3000, function () {
    setInterval(gamesSocket.bind(null, app), 20000);
});