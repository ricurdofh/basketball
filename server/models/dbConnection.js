/*jslint node: true, nomen: true, regexp: true, unparam: true */

'use strict';

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/basketball');

module.exports = mongoose;