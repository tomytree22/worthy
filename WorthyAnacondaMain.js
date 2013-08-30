var chokidar = require('chokidar');
var sleep = require('sleep');
var header = require('./Globals').header();
var config = require('./Globals').config;

var xmlHandler = require('./XMLHandler');


var veo = chokidar.watch(config.xml_deposit(config.msos[0]), {ignored: /^\./, persistent: true});

veo
  .on('add', function(path) {
	console.log('File', path, 'has been added');
	if (path.substr(-3) == "xml" ){
		if (path.indexOf(config.msos[0]) >= 0){
		var msoS = config.msos[0];
		console.log("New File Received ("+new Date()+") : [MSO] "+msoS+" [Path] "+config.xml_deposit(msoS)+" [FileName] "+path.substr(path.lastIndexOf("/")+1) );
		sleep.sleep(5);
		xmlHandler.handleFile(msoS, path.substr(path.lastIndexOf("/")+1));
	}
  })
  .on('change', function(path) {
	console.log('File', path, 'has been changed');
  })
  .on('unlink', function(path) {
	console.log('File', path, 'has been removed');
  })
  .on('error', function(error) {
	 console.error('Error happened', error);
  })

var cablevision = chokidar.watch(config.xml_deposit(config.msos[1]), {ignored: /^\./, persistent: true});

cablevision
  .on('add', function(path) {
	console.log('File', path, 'has been added');
	if (path.substr(-3) == "xml" ){
		if (path.indexOf(config.msos[1]) >= 0){
			var msoS = config.msos[1];
			console.log("New File Received ("+new Date()+") : [MSO] "+msoS+" [Path] "+config.xml_deposit(msoS)+" [FileName] "+path.substr(path.lastIndexOf("/")+1) );
			sleep.sleep(5);
			xmlHandler.handleFile(msoS, path.substr(path.lastIndexOf("/")+1));
		}				
	}
  })
  .on('change', function(path) {
	console.log('File', path, 'has been changed');
  })
  .on('unlink', function(path) {
	console.log('File', path, 'has been removed');
  })
  .on('error', function(error) {
	 console.error('Error happened', error);
  })

var cablemas = chokidar.watch(config.xml_deposit(config.msos[2]), {ignored: /^\./, persistent: true});

cablemas
  .on('add', function(path) {
	console.log('File', path, 'has been added');
	if (path.substr(-3) == "xml" ){
		if (path.indexOf(config.msos[2]) >= 0){
		var msoS = config.msos[2];
		console.log("New File Received ("+new Date()+") : [MSO] "+msoS+" [Path] "+config.xml_deposit(msoS)+" [FileName] "+path.substr(path.lastIndexOf("/")+1) );
		sleep.sleep(5);
		xmlHandler.handleFile(msoS, path.substr(path.lastIndexOf("/")+1));
	}
  })
  .on('change', function(path) {
	console.log('File', path, 'has been changed');
  })
  .on('unlink', function(path) {
	console.log('File', path, 'has been removed');
  })
  .on('error', function(error) {
	 console.error('Error happened', error);
  })

var sky = chokidar.watch(config.xml_deposit(config.msos[3]), {ignored: /^\./, persistent: true});

sky
  .on('add', function(path) {
	console.log('File', path, 'has been added');
	if (path.substr(-3) == "xml" ){
		if (path.indexOf(config.msos[3]) >= 0){
		var msoS = config.msos[3];
		console.log("New File Received ("+new Date()+") : [MSO] "+msoS+" [Path] "+config.xml_deposit(msoS)+" [FileName] "+path.substr(path.lastIndexOf("/")+1) );
		sleep.sleep(5);
		xmlHandler.handleFile(msoS, path.substr(path.lastIndexOf("/")+1));
	}
  })
  .on('change', function(path) {
	console.log('File', path, 'has been changed');
  })
  .on('unlink', function(path) {
	console.log('File', path, 'has been removed');
  })
  .on('error', function(error) {
	 console.error('Error happened', error);
  })
