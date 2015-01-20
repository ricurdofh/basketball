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
}());