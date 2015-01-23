/*jslint node: true, nomen: true, regexp: true, unparam: true */

'use strict';

var db = require('./dbConnection');

var classificationsSchema = db.Schema({
    league_id : {
        type : db.Schema.Types.ObjectId,
        ref : 'leagues'
    },
    league : String,
    team : String,
    type : String,
    conference : String,
    division: String,
    position : Number,
    played : Number,
    wins : Number,
    losts : Number,
    goalsFor : Number,
    goalsAgainst : Number,
    goalsDiff : Number,
    points : Number
});

module.exports = db.model('classifications', classificationsSchema);