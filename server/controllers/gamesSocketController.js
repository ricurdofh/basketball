'use strict';

var Games = require('../models/dbGames'),
    monthsNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'Nobember',
    'December'
];

var gamesSocketController = function (app) {
    var date = new Date(),
        dateSearch = monthsNames[date.getMonth()] + ' ' + date.getDate();
    Games.find({
        date : dateSearch
    }).sort({
        league : 1
    }).exec(function (err, games) {
        if (!err) {
            app.io.broadcast('games', games);
        }
    });
};

module.exports = gamesSocketController;