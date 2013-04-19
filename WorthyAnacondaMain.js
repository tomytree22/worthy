var header = require('./Globals').header();
var config = require('./Globals').config;

var fileName = "20130418_veo.xml";

var xmlHandler = require('./XMLHandler');
xmlHandler.handleFile(config.msos[0], fileName);