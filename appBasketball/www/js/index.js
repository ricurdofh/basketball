var app = (function ($) {
    var server = 'http://192.168.0.104:3000';

    var orderTeams = function (a, b) {
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
    };
    
    return {
        // Application Constructor
        initialize: function() {
            var loaded = [],
                self = this,
                $templates = $('script[type="text/x-handlebars-template"]');
            
            $templates.each(function () {
                var src = $(this).attr("src");
                if (src) {
                    loaded.push(
                        $.ajax(src, {
                            context : this
                        })
                        .done(function (data) {
                            $(this).html(data);
                        })
                    );
                }
            });
 
             loaded.push($.ready);

            $.when.apply($,loaded).done(function () {
                self.startApp();
            });
        },
        startApp: function() {
            this.loadGames();
        },
        loadGames : function () {
            $.ajax({
                type : 'GET',
                url : server,
                dataType : 'json'
            })
            .done(function (data) {
                var gamesBody = $('#gamesBody-template').html(),
                    listLeague = $('#listLeague-template').html(),
                    league = Handlebars.compile($('#league-template').html()),
                    teams = Handlebars.compile($('#teams-template').html()),
                    separator = $('#separator-template').html(),
                    ulList,
                    anterior = '';

                $('#app').empty();
                $('#app').append(gamesBody);
                ulList = $('#lista');

                $(data).each(function () {
                    var game = arguments[1],
                        team,
                        teamData,
                        actualLeague,
                        actualList,
                        i = 0,
                        idLeague = game.league.replace(/ /g, '').replace(/:/g,'');
                    if (anterior !== game.league) {
                        actualList = listLeague;
                        actualList = $(actualList).attr('id', idLeague);
                        actualLeague = league(game);
                        $(actualList).find('table tbody').append(actualLeague);
                    } else {
                        actualList = $('#' + idLeague);
                        $(actualList).find('table tbody').append(separator);
                    }
                    
                    game.teams[0].time = game.time;
                    game.teams[0].teamType = 'A';
                    game.teams[1].teamType = 'B';
                    
                    for (i; i < 2; i+=1) {
                        team = teams(game.teams[i]);
                        $(actualList).find('table tbody').append(team);
                    }

                    ulList.append(actualList);
                    anterior = game.league;
                });
            });
        },
        showClassif : function (league) {
            $.ajax({
                type : 'GET',
                url : server + '/classifications/' + league,
                dataType : 'json'
            })
            .done(function (data) {
                var i = 0,
                    tableClassif = {},
                    template = $('#classifTable-template').html(),
                    classifTableTemplate = Handlebars.compile(template),
                    tableReady;

                tableClassif.league = data[0].league;
                tableClassif.total = [];
                tableClassif.home = [];
                tableClassif.away = [];

                for (i; i < data.length; i+=1) {
                    if (data[i].type === 'total') {
                        tableClassif.total.push(data[i]);
                    } else if (data[i].type === 'home') {
                        tableClassif.home.push(data[i]);
                    } else {
                        tableClassif.away.push(data[i]);
                    }
                }

                tableClassif.total.sort(orderTeams);
                tableClassif.home.sort(orderTeams);
                tableClassif.away.sort(orderTeams);

                tableReady = classifTableTemplate(tableClassif);

                $('#app').empty();
                $('#app').append(tableReady);
            });
        },
        activeTab : function (elem) {
            var idShow,
                idHide,
                elemHide;
            idShow = elem.id.charAt(0).toUpperCase() + elem.id.slice(1);
            $('#content'+idShow).show();
            $(elem).addClass('activetc');
            for (var i = 1; i < arguments.length; i+=1) {
                elemHide = arguments[i];
                idHide = elemHide.charAt(0).toUpperCase() + elemHide.slice(1);
                $('#content'+idHide).hide();
                $('#'+elemHide).removeClass('activetc');
            }
        }
    };
}(jQuery));

Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('inc', function (val) {
    return val + 1;
})