'use strict';

var Games = require('../models/dbGames'),
    Classifications = require('../models/dbClassifications'),
    Leagues = require('../models/dbLeagues'),
    todayDate = require('./globals').getTodayDate();

var appController = function (app) {
    app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
    app.get('/', function (req, res) {
        Games.find({
            date : todayDate
        }).sort({
            league : 1
        }).exec(function (err, games) {
            if (!err) {
                var dataResponse = {
                    currentGames : true,
                    games : games                    
                };
                res.json(dataResponse);
            }
        });
    });

    app.get('/games/:date', function (req, res) {
        Games.find({
            date : req.params.date
        }).sort({
            league : 1
        }).exec(function (err, games) {
            if (!err) {
                var dataResponse = {
                    currentGames : req.params.date === todayDate,
                    games : games                    
                };
                res.json(dataResponse);
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

    app.get('/isLive', function (req, res) {
        Games.find({
            isLive : true,
            date : todayDate
        }).sort({
            league : 1
        }).exec(function (err, games) {
            if (!err) {
                var dataResponse = {
                    currentGames : true,
                    games : games                    
                };
                res.json(dataResponse);
            }
        });
    });

};

module.exports = appController;