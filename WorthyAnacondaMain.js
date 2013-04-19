var watchr = require('watchr');

var header = require('./Globals').header();
var config = require('./Globals').config;

//var fileName = "20130418_veo.xml";

console.log('Watch our paths');
var xmlHandler = require('./XMLHandler');

/*
xmlHandler.handleFile(config.msos[0], fileName);
*/

watchr.watch({
    paths: [config.xml_deposit(config.msos[0]),config.xml_deposit(config.msos[1]),config.xml_deposit(config.msos[2])],
    listeners: {
        log: function(logLevel){
        },
        error: function(err){           
        },
        watching: function(err,watcherInstance,isWatching){
            if (err) {
            } else {
            }
        },
        change: function(changeType,filePath,fileCurrentStat,filePreviousStat){
			//console.log("message: ", arguments );
			if (arguments[0] == 'update'){
				if (arguments[1].substr(-3) == "xml" ){
					var posI =  arguments[1].lastIndexOf("_")+1;
					var posF =  arguments[1].lastIndexOf(".");
					console.log("New File Received ("+new Date()+") : [MSO] "+arguments[1].substr(posI, posF-posI)+" [Path] "+arguments[1].substr(0, arguments[1].lastIndexOf("/")+1)+" [FileName] "+arguments[1].substr(arguments[1].lastIndexOf("/")+1) );
					xmlHandler.handleFile(arguments[1].substr(posI, posF-posI), arguments[1].substr(arguments[1].lastIndexOf("/")+1));
				}
			}
        }
    },
    next: function(err,watchers){
        if (err) {
            return err;
        } else {
        }

        // Close watchers after 60 seconds
        setTimeout(function(){
            var i;
            for ( i=0;  i<watchers.length; i++ ) {
                watchers[i].close();
            }
        },60*1000);
    }
});