'use strict';

var jsdom = require('jsdom'),
    Classifications = require('./db/dbClassifications'),
    leagues = require('./classifLeagues');

var makeTable = function (url, league) {
    jsdom.env({
        url : url,
        scripts : ['https://code.jquery.com/jquery-2.1.1.min.js'],
        done : function (err, window) {
            var $ = window.jQuery,
                classification;
            $('.league-wc.table.mtn.bbn').find('tr').each(function () {
                if($(this).attr('class') === ' ' || $(this).attr('class') === 'even ') {
                    var data = $(this).find('td');
                    classification = new Classifications({
                        team : $(data[2]).text().trim(),
                        league : league,
                        played : $(data[3]).text().trim(),
                        wins : $(data[4]).text().trim(),
                        losts : $(data[5]).text().trim(),
                        goalsFor : $(data[6]).text().trim(),
                        goalsAgainst : $(data[7]).text().trim(),
                        goalsDiff : $(data[8]).text().trim(),
                        points : $(data[9]).text().trim()
                    });
                    classification.save();
                }
            });
        }
    });
}

leagues.forEach(function (league) {
    makeTable(league.url, league.league);
});