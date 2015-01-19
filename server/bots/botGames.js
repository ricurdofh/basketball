'use strict';

var request = require('request'),
    cheerio = require('cheerio'),
    Games = require('../models/dbGames'),
    Leagues = require('../models/dbLeagues');

var find_games = function () {
    var url = 'http://www.livescore.com/basketball/';
    request(url, function (err, resp, html) {
        if (!err && resp.statusCode === 200) {
            var $ = cheerio.load(html);
            $('.league-multi').each(function () {
                var cont = 0,
                    teamsArray = [],
                    dateCont = -1,
                    date = [],
                    teams = {},
                    league,
                    i;
                league = $(this).find('.league strong').text() + ' ' + $(this).find('.league span a').text();
                Leagues.findOne({
                    league : league
                }, function (err, exist) {
                    if (!exist) {
                        exist = new Leagues({
                            league : league,
                            hasConf : false,
                            hasDiv : false
                        });
                        exist.save();
                    }
                });
                $(this).find('.date').each(function () {
                    date.push($(this).text().trim());
                });

                $(this).find('tr').each(function () {
                    if ($(this).attr('class') === undefined) {
                        dateCont += 1;
                    } else if ($(this).attr('class') === 'even' || $(this).attr('class') === '') {

                        // Se obtienen datos locales del primero de los equipos del juego
                        var time = $(this).find('.fd').text().trim(),
                            isLive = $(this).find('.fd').find('img').attr('alt') === 'live',
                            team1 = $(this).find('.ft').text().trim(),
                            totalPoints1 = $(this).find('.fs').text().trim(),
                            periodPoints1 = [];

                        for (i = 0; i < $(this).find('.fp').length; i += 1) {
                            periodPoints1.push($($(this).find('.fp')[i]).text().trim());
                        }

                        teams = {
                            team : team1,
                            totalPoints : totalPoints1,
                            periodPoints : periodPoints1
                        };

                        // Se guardan en un arreglo para poder acceder a los datos luego en el
                        // closure de la función callback del query a la bd
                        teamsArray[cont] = {};
                        teamsArray[cont].league = league;
                        teamsArray[cont].date = date[dateCont];
                        teamsArray[cont].time = time;
                        teamsArray[cont].isLive = isLive;
                        teamsArray[cont].teams = [teams];

                    } else if ($(this).attr('class') === 'awy ' || $(this).attr('class') === 'awy even') {

                        // Se obtienen datos locales del segundo de los equipos del juego
                        var team2 = $(this).find('.ft').text().trim(),
                            totalPoints2 = $(this).find('.fs').text().trim(),
                            periodPoints2 = [],
                            localCont = cont;
                            // Esta última es una variable contadora local que identifica
                            // la posición actual en el closure de la función callback

                        for (i = 0; i < $(this).find('.fp').length; i += 1) {
                            periodPoints2.push($($(this).find('.fp')[i]).text().trim());
                        }

                        teams = {
                            team : team2,
                            totalPoints : totalPoints2,
                            periodPoints : periodPoints2
                        };

                        // Se guardan los datos del segundo equipo en el arreglo anterior
                        // para completar los datos del juego que se está procesando
                        teamsArray[cont].teams.push(teams);

                        // console.log('teams ' + teamsArray[cont].teams);
                        // console.log('team1 ' + teamsArray[cont].teams[0].team);

                        Games.findOne({
                            league : teamsArray[cont].league,
                            date : teamsArray[cont].date
                        }).where(
                            'teams'
                        ).elemMatch({
                            team : teamsArray[cont].teams[0].team
                        }).where(
                            'teams'
                        ).elemMatch({
                            team : teamsArray[cont].teams[1].team
                        }).exec(function (err, game) {
                            var data = teamsArray[localCont];

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
                                    console.error('Error ' + err);
                                }
                            });
                        });
                        cont += 1;
                    }
                });
            });
        } else {
            console.error('Error: ' + err);
            find_games();
        }
    });
};

find_games();