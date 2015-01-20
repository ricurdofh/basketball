'use strict';

var request = require('request'),
    cheerio = require('cheerio'),
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
    // var curl = new Curl();

    request(url, function (error, resp, html) {

        if (!error && resp.statusCode === 200) {

            console.log('200 url: ' + url);

            var $ = cheerio.load(html),
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
                            if (!exist) {
                                exist = createLeague(league, false, false);
                            }
                            Classifications.findOne({
                                team : $(data[2]).text().trim(),
                                league_id : exist._id,
                                type : type
                            }, function (err, classif) {
                                // console.log('class findone ' + url);
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
                        // makeTable(urlLocal, league, type, 'conference');
                        setTimeout(makeTable.bind(null, urlLocal, league, type, 'conference'), 2000);
                        Leagues.findOne({
                            league : league
                        }, function (err, exist) {
                            if (exist) {
                                exist.hasConf = true;
                            } else {
                                exist = createLeague(league, true, false);
                            }
                            exist.save();
                        });
                    }
                    if ($('.content').find('.cal-wrap.cal-wrap3').find('a').text().search('Division') !== -1) {
                        urlLocal = url.replace('lt=1', 'lt=21');
                        // makeTable(urlLocal, league, type, 'division');
                        setTimeout(makeTable.bind(null, urlLocal, league, type, 'division'), 2000);
                        Leagues.findOne({
                            league : league
                        }, function (err, exist) {
                            if (exist) {
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
                                    if (!exist) {
                                        exist = createLeague(league, attLocal === 'conference', attLocal === 'division');
                                    }
                                    Classifications.findOne({
                                        team : $(data[2]).text().trim(),
                                        league_id : exist._id,
                                        type : type
                                    }, function (err, classif) {
                                        // console.log('classif findone ' + url);
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
            logError("Error " + url, error);
            // makeTable(url, league, type, lt);
            setTimeout(makeTable.bind(null, url, league, type, lt), 2000);
        }
    });
};

var find_classifications = function () {
    var url = 'http://www.livescore.com',
        urlBasketball = url + '/basketball/';
    request(urlBasketball, function (error, resp, html) {
        if (!error && resp.statusCode === 200) {
            var $ = cheerio.load(html),
                urlTotal,
                urlHome,
                urlAway,
                league;
            $('.content').find('.league-multi').find('span').each(function () {
                if ($(this).attr('class') === undefined) {
                    league = $(this).parent().find('strong').text() + ' ' + $(this).find('a').text();
                    league = league.trim();
                    urlTotal = url + $(this).find('a').attr('href') + '?lt=1';
                    // makeTable(urlTotal, league, 'total', 'league');
                    setTimeout(makeTable.bind(null, urlTotal, league, 'total', 'league'), 2000);
                    urlHome = url + $(this).find('a').attr('href') + 'table-home/?lt=1';
                    // makeTable(urlHome, league, 'home', 'league');
                    setTimeout(makeTable.bind(null, urlHome, league, 'home', 'league'), 2000);
                    urlAway = url + $(this).find('a').attr('href') + 'table-away/?lt=1';
                    // makeTable(urlAway, league, 'away', 'league');
                    setTimeout(makeTable.bind(null, urlAway, league, 'away', 'league'), 2000);
                }
            });
        } else {
            logError('Error: ', error);
            // find_classifications();
            setTimeout(find_classifications, 2000);
        }
    });
};

// find_classifications();

module.exports = find_classifications;