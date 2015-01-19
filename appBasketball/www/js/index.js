var app = (function ($) {
    'use strict';

    var _server = 'http://192.168.0.111:3000',
        _sam = Sammy('body'),

        _orderTeams = function (a, b) {
            if (a.points > b.points) {
                return -1;
            }
            if (a.points < b.points) {
                return 1;
            }
            if (a.points === b.points) {
                if (a.goalsDiff > b.goalsDiff) {
                    return -1;
                }
                if (a.goalsDiff < b.goalsDiff) {
                    return 1;
                }
            }
            return 0;
        },

        _loadHead = function (header) {
            var headerTemplate = Handlebars.compile($('#header-template').html()),
                data = { header : header };

            headerTemplate = headerTemplate(data);

            $('.struct_table_header').empty();
            $('.struct_table_header').append(headerTemplate);
        },

        _loadFoot = function () {
            var footerTemplate = $('#footer-template').html();

            $('.struct_table_footer').empty();
            $('.struct_table_footer').append(footerTemplate);
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
                var gamesBody = $('#gamesBody-template').html(),
                    listLeague = $('#listLeague-template').html(),
                    league = Handlebars.compile($('#league-template').html()),
                    teams = Handlebars.compile($('#teams-template').html()),
                    separator = $('#separator-template').html(),
                    ulList,
                    anterior = '';

                _loadHead('games');

                $('.struct_table_container').empty();
                $('.struct_table_container').append(gamesBody);
                ulList = $('#lista');

                $(data).each(function () {
                    var game = arguments[1],
                        team,
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

                    for (i; i < 2; i += 1) {
                        game.teamType = (i === 0) ? 'A' : 'B';
                        game.currentTeam = game.teams[i];
                        team = teams(game);
                        $(actualList).find('table tbody').append(team);
                    }

                    ulList.append(actualList);
                    anterior = game.league;
                });

                Search("searchbox", "lista", "search_list", function (element) {
                    element.innerHTML += ' - enter';
                });
            });
        },
        showClassif : function (league) {
            $.ajax({
                type : 'GET',
                url : _server + '/classifications/' + league,
                dataType : 'json',
                beforeSend : _loading
            }).done(function (data) {
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