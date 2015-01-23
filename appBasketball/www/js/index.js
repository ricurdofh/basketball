var app = (function ($) {
    'use strict';

    var _server = 'http://192.168.0.111:3000',
        _sam = Sammy('body'),
        _io = io.connect(_server),

        _loadGames = function (data, cal) {
            var gamesBody = $('#gamesBody-template').html(),
                listLeague = $('#listLeague-template').html(),
                league = Handlebars.compile($('#league-template').html()),
                teams = Handlebars.compile($('#teams-template').html()),
                separator = $('#separator-template').html(),
                currentGames,
                ulList,
                anterior = '';

            if (cal === undefined){
                _loadHead('games');
            }

            $('.struct_table_container').empty();
            $('.struct_table_container').append(gamesBody);
            ulList = $('#lista');

            if($.isEmptyObject(data.games)) {
                var li = $('<li>');
                if (cal === false) {
                    $(li).attr('class', 'text_no_live').text('There is no matches in progress at this time');
                } else {
                    $(li).attr('class', 'fondo_li visible last').text('There is no data for this day!');
                }
                ulList.append(li);
            }

            currentGames = data.currentGames;

            $(data.games).each(function (index, game) {
                var team,
                    actualLeague,
                    actualList,
                    i = 0,
                    idLeague = game.league.replace(/ /g, '').replace(/:/g, '');
                if (anterior !== game.league) {
                    actualList = listLeague;
                    actualList = $(actualList).attr('id', idLeague);
                    actualLeague = league(game);
                    $(actualList).find('table tbody').append(actualLeague);
                } else {
                    actualList = $('#' + idLeague);
                    $(actualList).find('table tbody').append(separator);
                }

                game.currentGame = currentGames;

                for (i; i < 2; i += 1) {
                    game.teamType = (i === 0) ? 'A' : 'B';
                    game.currentTeam = game.teams[i];
                    game.currentTeam.id = game.currentTeam.team.replace(/[^\w]/g, '');
                    team = teams(game);
                    $(actualList).find('table tbody').append(team);
                }

                ulList.append(actualList);
                anterior = game.league;
            });

            Search("searchbox", "lista", "search_list", function (element) {
                element.innerHTML += ' - enter';
            });
        },

        _loadFoot = function () {
            var footerTemplate = $('#footer-template').html();

            $('.struct_table_footer').empty();
            $('.struct_table_footer').append(footerTemplate);
        },

        _loadHead = function (header) {
            var headerTemplate = Handlebars.compile($('#header-template').html()),
                data = { header : header };

            headerTemplate = headerTemplate(data);

            $('.struct_table_header').empty();
            $('.struct_table_header').append(headerTemplate);
        },

        _loadStruct = function (header) {
            var appStructure = $('#appStructure-template').html();

            $('#app').empty();
            $('#app').append(appStructure);

            _loadHead(header);
            _loadFoot();

        },

        _loading = function () {
            var divLoading = $('#loading-template').html();

            $('.struct_table_container').empty();
            $('.struct_table_container').append(divLoading);
        },

        _orderTeams = function (a, b) {
            if (a.position < b.position) {
                return -1;
            }
            if (a.position > b.position) {
                return 1;
            }
            return 0;
        },

        _updateGames = function (data) {
            console.log('update');

            if ($('.tableDetails').length) {
                var game = $.grep(data, function(obj){
                    var teamAData = obj.teams[0].team,
                        $teamADetails = $('#nameAPredictions').text(),
                        teamBData = obj.teams[1].team,
                        $teamBDetails = $('#nameBPredictions').text();
                    return teamAData === $teamADetails && teamBData === $teamBDetails;
                }),
                    $reasultadoA = $('#resultadoAPredictions'),
                    $reasultadoB = $('#resultadoBPredictions');

                if (!($.isEmptyObject(game))) {
                    game = game[0];
                    if (game.isLive || $('.fa-fire').length) {
                        if (!($('.fa-fire').length)) {
                            $('#medioPredictions').html('<div><i class="fa fa-fire"></i></div>');
                        } else if (!(game.isLive)) {
                            $('#medioPredictions').html(game.time);
                            $('#estatusPredictions').empty();
                        }
                        $reasultadoA.html(game.teams[0].totalPoints);
                        $reasultadoB.html(game.teams[1].totalPoints);
                        for (var i = 0; i < game.teams.length; i += 1) {
                            var typeTeam = (i === 0) ? 'A' : 'B';
                            for (var j = 0; j < game.teams[i].periodPoints.length; j += 1){
                                $('#team' + typeTeam + 'period' + (j+1)).html(game.teams[i].periodPoints[j]);                                
                            }
                        }
                    }
                }
            } else {
                $(data).each(function (index, game) {
                    var $teamA = $('#' + game.teams[0].team.replace(/[^\w]/g, '')),
                        $teamB = $('#' + game.teams[1].team.replace(/[^\w]/g, ''));

                    if (game.isLive || $teamA.find('.space_time_estatus').hasClass('fondo_live')) {
                        if(!($teamA.find('.space_time_estatus').hasClass('fondo_live'))) {
                            $teamA.find('.space_time_estatus').addClass('fondo_live');
                            $teamA.find('#resultadoA0').addClass('fondo_live');
                            $teamB.find('.space_time_estatus').addClass('fondo_live');
                            $teamB.find('#resultadoA0').addClass('fondo_live');
                            $teamB.find('#estado0').html('<i class="fa fa-fire"></i>');
                        } else if (!(game.isLive)){
                            $teamA.find('.space_time_estatus').removeClass('fondo_live');
                            $teamA.find('#resultadoA0').removeClass('fondo_live');
                            $teamB.find('.space_time_estatus').removeClass('fondo_live');
                            $teamB.find('#resultadoA0').removeClass('fondo_live');
                            $teamB.find('#estado0').replaceWith('<div id="estado17" class="center color_gris list_estatus">F</div>');
                            $teamA.find('#tiempo0').replaceWith('<div id="tiempo19" class="center">--:--</div>');
                            
                        }
                        $teamA.find('#tiempo0').html(game.time);
                        $teamA.find('#resultadoA0 div').html(game.teams[0].totalPoints);
                        $teamB.find('#resultadoA0 div').html(game.teams[1].totalPoints);
                        $teamA.find('#details').attr('onclick', "window.location.href='#/details/" + JSON.stringify(game) + "'");
                    } 
                });
            }
        };

    return {
        // Application Constructor
        initialize: function () {
            var loaded = [],
                self = this,
                $templates = $('script[type="text/x-handlebars-template"]');

            $templates.each(function () {
                var src = $(this).attr("src");
                if (src) {
                    loaded.push(
                        $.ajax(src, {
                            context : this
                        }).done(function (data) {
                            $(this).text(data);
                        })
                    );
                }
            });

            loaded.push($.ready);

            $.when.apply($, loaded).done(function () {
                self.startApp();
            });
        },
        startApp: function () {
            FastClick.attach(document.body);
            _loadStruct('games');
            _sam.run('#/');
            // this.loadGames();
        },
        loadGames : function () {
            $.ajax({
                type : 'GET',
                url : _server,
                dataType : 'json',
                beforeSend : _loading
            }).done(function (data) {
                _io.on('games', _updateGames);
                _loadGames(data);
                
            });
        },
        loadGamesDate : function (date) {
            $.ajax({
                type : 'GET',
                url : _server + '/games/' + date,
                dataType : 'json',
                beforeSend : _loading
            }).done(function (data) {
                _io.removeAllListeners();
                _loadGames(data, true);
                
            });
        },
        showLive : function () {
            $.ajax({
                type : 'GET',
                url : _server + '/isLive',
                dataType : 'json',
                beforeSend : _loading
            }).done(function (data) {
                _io.on('games', _updateGames);
                _loadGames(data, false);
            });
        },
        showClassif : function (league) {
            $.ajax({
                type : 'GET',
                url : _server + '/classifications/' + league,
                dataType : 'json',
                beforeSend : _loading
            }).done(function (data) {
                _io.removeAllListeners();

                if ($.isEmptyObject(data)) {
                    alert('There is no classification table available');
                    _sam.setLocation('#/');
                }

                var i = 0,
                    tableClassif = {},
                    template = $('#classifTable-template').html(),
                    classifTableTemplate = Handlebars.compile(template),
                    tableReady;

                tableClassif.league = data[0].league;
                tableClassif.total = [];
                tableClassif.home = [];
                tableClassif.away = [];

                for (i; i < data.length; i += 1) {
                    if (data[i].type === 'total') {
                        tableClassif.total.push(data[i]);
                    } else if (data[i].type === 'home') {
                        tableClassif.home.push(data[i]);
                    } else {
                        tableClassif.away.push(data[i]);
                    }
                }

                tableClassif.total.sort(_orderTeams);
                tableClassif.home.sort(_orderTeams);
                tableClassif.away.sort(_orderTeams);

                tableReady = classifTableTemplate(tableClassif);

                _loadHead('classif');

                $('.struct_table_container').empty();
                $('.struct_table_container').append(tableReady);
            });
        },
        showDetails : function (game) {
            var template = $('#details-template').html(),
                detailsTemplate = Handlebars.compile(template);

            game = JSON.parse(game);

            _loadHead('classif');

            $('.struct_table_container').empty();
            $('.struct_table_container').append(detailsTemplate(game));
        },
        showCalendar : function (e) {
            if ($('#ds_conclass').length === 0) {
                var calendar = $('#calendar-template').html();
                $('body').append(calendar);
            }

            ds_sh(e);
        },
        activeTab : function (elem) {
            var idShow,
                idHide,
                elemHide,
                i;
            idShow = elem.id.charAt(0).toUpperCase() + elem.id.slice(1);
            $('#content' + idShow).show();
            $(elem).addClass('activetc');
            for (i = 1; i < arguments.length; i += 1) {
                elemHide = arguments[i];
                idHide = elemHide.charAt(0).toUpperCase() + elemHide.slice(1);
                $('#content' + idHide).hide();
                $('#' + elemHide).removeClass('activetc');
            }
        }
    };
}(jQuery));