'use strict';

var request = require('request'),
    cheerio = require('cheerio'),
    Games = require('../models/dbGames'),
    Leagues = require('../models/dbLeagues'),
    todayDate = require('../controllers/globals').getTodayDate();

var find_games = function (date) {
    console.log('Entra find_games');
    date = date || todayDate;
    var url = 'http://www.livescore.com/basketball/' + date;
    request(url, function (err, resp, html) {
        if (!err && resp.statusCode === 200) {
            console.log('Games 200 url: ' + url);
            var $ = cheerio.load(html),
                teamsObj = {};
            $('.content>div').each(function () {
                var cont = 0,
                    league = '';

                if ($(this).attr('class') === 'row row-tall mt4') {
                    $(this).find('.left a').each(function () {
                        if ($(this).find('strong').text()) {
                            league += $(this).find('strong').text();
                        } else {
                            league += ' ' + $(this).text();
                        }
                    });
                    // league = $(this).find('.left strong').text() + ' ' + $(this).find('.league span a').text();
                    league = league.trim();
                    teamsObj.league = league;
                    Leagues.findOne({
                        league : league
                    }, function (err, exist) {
                        if (!err) {
                            if (!exist) {
                                exist = new Leagues({
                                    league : league,
                                    hasConf : false,
                                    hasDiv : false
                                });
                                exist.save();
                            }
                        }
                    });
                    teamsObj.date = date;
                    // $(this).find('.right.fs11').each(function () {
                    //     date = $(this).text().trim() || todayDate;
                    //     teamsObj.date = date;
                    // });
                } else if ($(this).attr('class') === 'row-group') {

                    $(this).find('.row-gray').each(function () {
                        var teams = {};

                        if (cont === 0) {

                            // Se obtienen datos locales del primero de los equipos del juego
                            var time = $($(this).find('.min')[0]).text().trim(),
                                isLive = $($(this).find('.min')[0]).find('img').attr('alt') === 'live',
                                team1 = $(this).find('.bas-ply').text().trim(),
                                totalPoints1 = $(this).find('.col-2.tright').text().trim(),
                                periodPoints1 = [];

                            $(this).find('.clear.scores').find('.col-2').each(function (index, value) {
                                periodPoints1.push($(value).text().trim());
                            });

                            // for (i = 0; i < $(this).find('.clear.scores').find('.col-2').length; i += 1) {
                            //     periodPoints1.push($($(this).find('.fp')[i]).text().trim());
                            // }

                            teams = {
                                team : team1,
                                totalPoints : totalPoints1,
                                periodPoints : periodPoints1
                            };

                            // Se guardan en un arreglo para poder acceder a los datos luego en el
                            // closure de la función callback del query a la bd
                            teamsObj.time = time;
                            teamsObj.isLive = isLive;
                            teamsObj.teams = [teams];

                            cont += 1;

                        } else {

                            // Se obtienen datos locales del segundo de los equipos del juego
                            var team2 = $(this).find('.bas-ply').text().trim(),
                                totalPoints2 = $(this).find('.col-2.tright').text().trim(),
                                periodPoints2 = [],
                                data;
                                // Esta última es una variable contadora local que identifica
                                // la posición actual en el closure de la función callback

                            $(this).find('.clear.scores').find('.col-2').each(function (index, value) {
                                periodPoints2.push($(value).text().trim());
                            });

                            // for (i = 0; i < $(this).find('.fp').length; i += 1) {
                            //     periodPoints2.push($($(this).find('.fp')[i]).text().trim());
                            // }

                            teams = {
                                team : team2,
                                totalPoints : totalPoints2,
                                periodPoints : periodPoints2
                            };

                            // Se guardan los datos del segundo equipo en el arreglo anterior
                            // para completar los datos del juego que se está procesando
                            teamsObj.teams.push(teams);

                            // console.log('teams ' + teamsArray[cont].teams);
                            // console.log('team1 ' + teamsArray[cont].teams[0].team);
                            data = JSON.stringify(teamsObj);
                            data = JSON.parse(data);

                            Games.findOne({
                                league : data.league,
                                date : data.date
                            }).where(
                                'teams'
                            ).elemMatch({
                                team : data.teams[0].team
                            }).where(
                                'teams'
                            ).elemMatch({
                                team : data.teams[1].team
                            }).exec(function (err, game) {

                                if (!err) {

                                    if (!game) {
                                        game = new Games({
                                            league : data.league,
                                            date : data.date
                                        });
                                    }

                                    game.time = data.time;
                                    game.teams = data.teams;
                                    game.isLive = data.isLive;

                                    game.save(function (err) {
                                        if (err) {
                                            // console.error('Error ' + err);
                                        } else {
                                            // console.log('Guarda ' + JSON.stringify(data));
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        } else {
            console.error('Error: ' + err);
            find_games();
        }
    });
};

// find_games();

module.exports = find_games;