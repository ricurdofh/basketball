'use strict';

var jsdom = require('jsdom'),
    Classifications = require('./db/dbClassifications');
    // leagues = require('./classifLeagues');

var makeTable = function (url, league, type, lt) {
    jsdom.env({
        url : url,
        scripts : ['https://code.jquery.com/jquery-2.1.1.min.js'],
        done : function (err, window) {
            if(!err) {
                var $ = window.jQuery,
                    classification, att, val, urlLocal;

                if(lt === 'league') {
                    $('.league-wc.table.mtn.bbn').find('tr').each(function () {
                        if($(this).attr('class') === ' ' || $(this).attr('class') === 'even ') {
                            var data = $(this).find('td');
                            Classifications.findOne({
                                team : $(data[2]).text().trim(),
                                league : league,
                                type : type
                            }, function (err, classif) {                                
                                if (!classif) {
                                    classif = new Classifications({
                                        team : $(data[2]).text().trim(),
                                        league : league,
                                        type : type
                                    });
                                }
                                classif.played = $(data[3]).text().trim();
                                classif.wins = $(data[4]).text().trim();
                                classif.losts = $(data[5]).text().trim();
                                classif.goalsFor = $(data[6]).text().trim();
                                classif.goalsAgainst = $(data[7]).text().trim();
                                classif.goalsDiff = $(data[8]).text().trim();
                                classif.points = $(data[9]).text().trim();
                                classif.save();
                            });
                        }
                    });
                    if ($('.content').find('.cal-wrap.cal-wrap3').length > 1) {
                        if ($('.content').find('.cal-wrap.cal-wrap3').find('a').text().search('Conference') !== -1) {
                            urlLocal = url.replace('lt=1', 'lt=11');
                            makeTable(urlLocal, league, type, 'conference');
                        } 
                        if ($('.content').find('.cal-wrap.cal-wrap3').find('a').text().search('Division') !== -1) {
                            urlLocal = url.replace('lt=1', 'lt=21');
                            makeTable(urlLocal, league, type, 'division');
                        }
                    }
                } else if(lt === 'conference' || lt === 'division') {
                    $('.content').find('table').each(function () {
                        if ($(this).attr('class') === 'league-wc'){
                            val = /-.*/.exec($(this).find('span').text())[0].replace('-', '').trim();
                            att = lt;
                        } else if ($(this).attr('class') === 'league-wc table mtn bbn') {
                            $(this).find('tr').each(function () {
                                if($(this).attr('class') === ' ' || $(this).attr('class') === 'even ') {
                                    var data = $(this).find('td'),
                                        attLocal = att,
                                        valLocal = val;
                                    Classifications.findOne({
                                        team : $(data[2]).text().trim(),
                                        league : league,
                                        type : type
                                    }, function (err, classif) {
                                        if(!err) {
                                            classif[attLocal] = valLocal; 
                                            classif.save();
                                        }
                                    });
                                }
                            });
                        }
                    })
                }
            } else {
                console.log('Error: ' + err);
            }
        }
    });
}

jsdom.env({
    url : 'http://www.livescore.com/basketball/',
    scripts : ['https://code.jquery.com/jquery-2.1.1.min.js'],
    done : function (err, window) {
        console.log('test');
        if(!err) {
            var $ = window.jQuery,
                urlTotal, urlHome, urlAway, league;
            $('.content').find('.league-multi').find('span').each(function () {
                if ($(this).attr('class') === undefined) {
                    league = $(this).parent().find('strong').text() + ' ' + $(this).find('a').text();
                    urlTotal = 'http://www.livescore.com' + $(this).find('a').attr('href') + '?lt=1';
                    makeTable(urlTotal, league, 'total', 'league');
                    urlHome = 'http://www.livescore.com' + $(this).find('a').attr('href') + 'table-home/?lt=1';
                    makeTable(urlHome, league, 'home', 'league');
                    urlAway = 'http://www.livescore.com' + $(this).find('a').attr('href') + 'table-away/?lt=1';
                    makeTable(urlAway, league, 'away', 'league');
                }
            });
        } else {
            console.log('Error: ' + err);
        }
    }
});

// leagues.forEach(function (league) {
//     makeTable(league.urlTotal, league.league, 'total');
//     makeTable(league.urlHome, league.league, 'home');
//     makeTable(league.urlAway, league.league, 'away');
// });