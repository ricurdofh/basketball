'use strict';

var db = require('./dbConnection');

var classificationsSchema = db.Schema({
    team : String,
    league : String,
    type : String,
    conference : String,
    division: String,
    played : Number,
    wins : Number,
    losts : Number,
    goalsFor : Number,
    goalsAgainst : Number,
    goalsDiff : Number,
    points : Number,
});

module.exports = db.model('classifications', classificationsSchema);