'use strict';

var db = require('./dbConnection');

var gamesSchema = db.Schema({
    league : String,
    date : String,
    time : String,
    teams : Array,
    isLive : Boolean
});

module.exports = db.model('games', gamesSchema);
