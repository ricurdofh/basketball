'use strict';

var Games = require('../models/dbGames'),
    Classifications = require('../models/dbClassifications'),
    Leagues = require('../models/dbLeagues');

var monthsNames = [
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

var appController = function (app) {
    app.get('/', function (req, res) {
        var date = new Date(),
            dateSearch = monthsNames[date.getMonth()] + ' ' + date.getDate();
        Games.find({
            date : dateSearch
        }).sort({
            league : 1
        }).exec(function (err, games) {
            if (!err) {
                res.json(games);
            }
        });
    });

    app.get('/classifications/:league', function (req, res) {
        Classifications.find({
            league : req.params.league
        }).populate(
            'league_id',
            'hasConf hasDiv'
        ).exec(function (err, classif) {
            res.json(classif);
        });
    });
};

module.exports = appController;