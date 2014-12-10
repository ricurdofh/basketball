'use strict';

var jsdom = require('jsdom'),
    Games = require('./db/dbGames');

var addData = function (game, teamData, $) {
    var pos = teamData.pos,
        periodPoints = teamData.periodPoints;

    if (teamData.time !== undefined) {
        game.time = teamData.time;
        game.isLive = teamData.isLive;
    }
    game['team' + pos] = teamData.name;
    game['totalPoints' + pos] = teamData.totalPoints;
    game['firstPeriodPoints' + pos] = $(periodPoints[0]).text().trim();
    game['secondPeriodPoints' + pos] = $(periodPoints[1]).text().trim();
    game['thirdPeriodPoints' + pos] = $(periodPoints[2]).text().trim();
    game['fourthPeriodPoints' + pos] = $(periodPoints[3]).text().trim();
    game['fifthPeriodPoints' + pos] = $(periodPoints[4]).text().trim();

    return game;
};

jsdom.env({
    url : 'http://www.livescore.com/basketball/',
    scripts : ['https://code.jquery.com/jquery-2.1.1.min.js'],
    done : function (err, window) {
        var $ = window.jQuery,
            league;
        $('.league-multi').each(function () {
            var cont = 0,
                teamsArray = [],
                dateCont = -1,
                date = [];
            league = $(this).find('.league').text().trim();
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
                        periodPoints1 = $(this).find('.fp');

                    // Se guardan en un arreglo para poder acceder a los datos luego en el
                    // closure de la función callback del query a la bd
                    teamsArray[cont] = {};
                    teamsArray[cont].league = league;
                    teamsArray[cont].date = date[dateCont];
                    teamsArray[cont].time = time;
                    teamsArray[cont].isLive = isLive;
                    teamsArray[cont].team1 = team1;
                    teamsArray[cont].totalPoints1 = totalPoints1;
                    teamsArray[cont].periodPoints1 = periodPoints1;

                } else if ($(this).attr('class') === 'awy ' || $(this).attr('class') === 'awy even') {

                    // Se obtienen datos locales del segundo de los equipos del juego
                    var team2 = $(this).find('.ft').text().trim(),
                        totalPoints2 = $(this).find('.fs').text().trim(),
                        periodPoints2 = $(this).find('.fp'),
                        localCont = cont;
                        // Esta última es una variable contadora local que identifica
                        // la posición actual en el closure de la función callback

                    // Se guardan los datos del segundo equipo en el arreglo anterior
                    // para completar los datos del juego que se está procesando
                    teamsArray[cont].team2 = team2;
                    teamsArray[cont].totalPoints2 = totalPoints2;
                    teamsArray[cont].periodPoints2 = periodPoints2;

                    Games.findOne({
                        league : teamsArray[cont].league,
                        date : teamsArray[cont].date,
                        team1 : teamsArray[cont].team1
                    }, function (err, game) {
                        var data = teamsArray[localCont],
                            team1Data,
                            team2Data;

                        if (!game) {
                            game = new Games({
                                league : data.league,
                                date : data.date
                            });
                        }

                        team1Data = {
                            name : data.team1,
                            totalPoints : data.totalPoints1,
                            periodPoints : data.periodPoints1,
                            pos : 1,
                            isLive : data.isLive,
                            time : data.time
                        };

                        game = addData(game, team1Data, $);

                        team2Data = {
                            name : data.team2,
                            totalPoints : data.totalPoints2,
                            periodPoints : data.periodPoints2,
                            pos : 2
                        };

                        game = addData(game, team2Data, $);

                        game.save();
                    });
                    cont += 1;
                }
            });
        });
    }
});