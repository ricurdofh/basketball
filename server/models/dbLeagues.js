'use strict';

var db = require('./dbConnection');

var leaguesSchema = db.Schema({
    league : String,
    hasConf : Boolean,
    hasDiv : Boolean
});

module.exports = db.model('leagues', leaguesSchema);
