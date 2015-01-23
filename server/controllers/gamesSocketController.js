'use strict';

var Games = require('../models/dbGames'),
    todayDate = require('./globals').getTodayDate();

var gamesSocketController = function (app) {
    Games.find({
        date : todayDate
    }).sort({
        league : 1
    }).exec(function (err, games) {
        if (!err) {
            app.io.broadcast('games', games);
        }
    });
};

module.exports = gamesSocketController;