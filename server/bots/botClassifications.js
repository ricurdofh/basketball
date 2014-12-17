'use strict';

var jsdom = require('jsdom'),
    Curl = require('node-libcurl').Curl,
    Classifications = require('../models/dbClassifications'),
    Leagues = require('../models/dbLeagues');

var logError = function (msg, err) {
    console.error(msg);
    console.error(err);
};

var createLeague = function (league, conference, division) {
    return new Leagues({
        league : league,
        hasConf : conference,
        hasDiv : division
    });
};

var makeTable = function (url, league, type, lt) {
    console.log('maketable ' + url);
    var curl = new Curl();

    curl.setOpt('URL', url);
    curl.setOpt('FOLLOWLOCATION', true);
    curl.on('end', function (statusCode, body, headers) {

        if (statusCode === 200) {

            console.log('200 url: ' + url);

            jsdom.env({
                html : body,
                scripts : ['https://code.jquery.com/jquery-2.1.1.min.js'],
                done : function (err, window) {
                    if (!err) {
                        console.log('no err done ' + url);
                        var $ = window.jQuery,
                            att,
                            val,
                            urlLocal;

                        if (lt === 'league') {
                            console.log('league ' + url);
                            $('.league-wc.table.mtn.bbn').find('tr').each(function () {
                                if (/^ (.*)/.test($(this).attr('class')) || /^even (.*)/.test($(this).attr('class'))) {
                                    var data = $(this).find('td');
                                    Leagues.findOne({
                                        league : league
                                    }, function (err, exist) {
                                        if(!exist) {
                                            exist = createLeague(league, false, false);
                                        }
                                        Classifications.findOne({
                                            team : $(data[2]).text().trim(),
                                            league_id : exist._id,
                                            type : type
                                        }, function (err, classif) {
                                            console.log('class findone ' + url);
                                            if (!classif) {
                                                classif = new Classifications({
                                                    team : $(data[2]).text().trim(),
                                                    league_id : exist._id,
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
                                    });
                                }
                            });
                            if ($('.content').find('.cal-wrap.cal-wrap3').length > 1) {
                                if ($('.content').find('.cal-wrap.cal-wrap3').find('a').text().search('Conference') !== -1) {
                                    urlLocal = url.replace('lt=1', 'lt=11');
                                    makeTable(urlLocal, league, type, 'conference');
                                    Leagues.findOne({
                                        league : league
                                    }, function (err, exist) {
                                        if(exist) {
                                            exist.hasConf = true;
                                        } else {
                                            exist = createLeague(league, true, false);
                                        }
                                        exist.save();
                                    });
                                }
                                if ($('.content').find('.cal-wrap.cal-wrap3').find('a').text().search('Division') !== -1) {
                                    urlLocal = url.replace('lt=1', 'lt=21');
                                    makeTable(urlLocal, league, type, 'division');
                                    Leagues.findOne({
                                        league : league
                                    }, function (err, exist) {
                                        if(exist) {
                                            exist.hasDiv = true;
                                        } else {
                                            exist = createLeague(league, false, true);
                                        }
                                        exist.save();
                                    });
                                }
                            }
                        } else if (lt === 'conference' || lt === 'division') {
                            console.log('else ' + lt + ' ' + url);
                            $('.content').find('table').each(function () {
                                if ($(this).attr('class') === 'league-wc') {
                                    val = /-.*/.exec($(this).find('span').text())[0].replace('-', '').trim();
                                    att = lt;
                                } else if ($(this).attr('class') === 'league-wc table mtn bbn') {
                                    $(this).find('tr').each(function () {
                                        if (/^ (.*)/.test($(this).attr('class')) || /^even (.*)/.test($(this).attr('class'))) {
                                            var data = $(this).find('td'),
                                                attLocal = att,
                                                valLocal = val;
                                            Leagues.findOne({
                                                league : league
                                            }, function (err, exist) {
                                                if (!exist){
                                                    exist = createLeague(league, attLocal === 'conference', attLocal === 'division');
                                                }
                                                Classifications.findOne({
                                                    team : $(data[2]).text().trim(),
                                                    league_id : exist._id,
                                                    type : type
                                                }, function (err, classif) {
                                                    console.log('classif findone ' + url);
                                                    if (!err) {
                                                        classif[attLocal] = valLocal;
                                                        classif.save();
                                                    }
                                                });
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    } else {
                        logError("Error done " + url, err);
                    }
                }
            });
        } else {
            logError("Error statuscode " + url, statusCode);
        }
        this.close();
    });
    curl.on('error', function (err) {
        logError('Error on curl ' + url, err);
        makeTable(url, league, type, lt);
        this.close();
    });
    curl.perform();
};

jsdom.env({
    url : 'http://www.livescore.com/basketball/',
    scripts : ['https://code.jquery.com/jquery-2.1.1.min.js'],
    done : function (err, window) {
        console.log('Basketball principal');
        if (!err) {
            var $ = window.jQuery,
                urlTotal,
                urlHome,
                urlAway,
                league;
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
            logError('Error: ', err);
        }
    }
});