var app = (function ($) {
    var server = 'http://192.168.0.104:3000';

    var loadGames = function () {
        $.ajax({
            type : 'GET',
            url : server,
            dataType : 'json'
        }).done(function (data) {
            var gamesBody = $('#gamesBody-template').html(),
                listLeague = $('#listLeague-template').html(),
                league = Handlebars.compile($('#league-template').html()),
                teams = Handlebars.compile($('#teams-template').html()),
                separador = $('#separador-template').html(),
                ulList,
                anterior = '';

            $('body').append(gamesBody);
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
                    $(actualList).find('table tbody').append(separador);
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
    };

    return {
        // Application Constructor
        initialize: function() {
            $(document).ready(this.startApp);
        },
        startApp: function() {
            loadGames();
        }
    };
}(jQuery));

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});