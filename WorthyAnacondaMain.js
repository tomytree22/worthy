var chokidar = require('chokidar');
var sleep = require('sleep');
var header = require('./Globals').header();
var config = require('./Globals').config;

//var fileName = "20130418_veo.xml";

var xmlHandler = require('./XMLHandler');


var watcher = chokidar.watch(config.xml_deposit(config.msos[0]), {ignored: /^\./, persistent: true});

watcher
  .on('add', function(path) {
	console.log('File', path, 'has been added');
	if (path.substr(-3) == "xml" ){
		var posI =  path.lastIndexOf("_")+1;
		var posF =  path.lastIndexOf(".");
		console.log("New File Received ("+new Date()+") : [MSO] "+path.substr(posI, posF-posI)+" [Path] "+config.xml_deposit(path.substr(posI, posF-posI))+" [FileName] "+path.substr(path.lastIndexOf("/")+1) );
		sleep.sleep(5);
		xmlHandler.handleFile(path.substr(posI, posF-posI), path.substr(path.lastIndexOf("/")+1));
	}
  })
  .on('change', function(path) {
	console.log('File', path, 'has been changed');
	if (path.substr(-3) == "xml" ){
			var posI =  path.lastIndexOf("_")+1;
			var posF =  path.lastIndexOf(".");
			console.log("New File Received ("+new Date()+") : [MSO] "+path.substr(posI, posF-posI)+" [Path] "+config.xml_deposit(path.substr(posI, posF-posI))+" [FileName] "+path.substr(path.lastIndexOf("/")+1) );
			sleep.sleep(5);			
			xmlHandler.handleFile(path.substr(posI, posF-posI), path.substr(path.lastIndexOf("/")+1));
	}
  })
  .on('unlink', function(path) {
	console.log('File', path, 'has been removed');
  })
  .on('error', function(error) {
	 console.error('Error happened', error);
  })
