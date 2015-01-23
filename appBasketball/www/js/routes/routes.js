(function () {
    'use strict';

    var sam = Sammy.apps.body;

    sam.get('#/', function () {
        app.loadGames();
    });

    sam.get('#/leagues/:league', function () {
        app.showClassif(this.params.league);
    });

    sam.get('#/details/:game', function () {
        app.showDetails(this.params.game);
    });

    sam.get('#/isLive', function () {
        app.showLive();
    });

    sam.get('#/games/:date', function () {
        ds_onclick(this.params.date);
        app.loadGamesDate(this.params.date);
    });
}());