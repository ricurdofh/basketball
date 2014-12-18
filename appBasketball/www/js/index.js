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
                
                teamData = {
                    time : game.time,
                    team : game.team1,
                    teamType : 'A',
                    result : game.totalPoints1 || '-'
                };
                team = teams(teamData);
                $(actualList).find('table tbody').append(team);

                teamData = {
                    team : game.team2,
                    teamType : 'B',
                    result : game.totalPoints2 || '-'
                };
                team = teams(teamData);
                $(actualList).find('table tbody').append(team);

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