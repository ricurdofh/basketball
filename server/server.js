'use strict';

var express = require('express'),
    app = express();

require('./controllers/app')(app);

app.listen(3000);