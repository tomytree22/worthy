/** Logging System **/
var winston = require('winston');
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ json: true, timestamp: true }),
    new winston.transports.File({ filename: __dirname + '/logs/backup.log', json: false })
  ],
  exceptionHandlers: [
    new (winston.transports.Console)({ json: true, timestamp: true }),
    new winston.transports.File({ filename: __dirname + '/logs/exceptions.log', json: false })
  ],
  exitOnError: false
});


/**
 *	@file Globals.js
 *	\brief Configuration values
 **/
var config = {};

// MySQL configuration
config.mysql = {};

/**
 * Configuration values for MySQL Client
 */
config.mysql.client_prod = {
        user:'veo',
        password:'',
        host:''
};

config.mysql.client_qa = {
        user:'root',
        password:'',
        host:''
};

/**
 * MySQL Database names
 */
config.mysql.database = 'msodb';

config.msos = [ "veo", "cablevision", "cablemas", "sky" ];

//ENVIRONMENTS
config.xml_deposit 	= function (mso){ return "/home/"+mso+"/XML/"; };
config.xml_error 	= function (mso){ return "/home/"+mso+"/ERROR_XML/"; };
config.xml_backup 	= function (){ return "/root/WorthyAnaconda/backups/"; };

/*DEV LOCALHOST
config.xml_deposit 	= function (mso){ return "DEV/"+mso+"/XML/"; };
config.xml_error 	= function (mso){ return "DEV/"+mso+"/ERROR_XML/"; };
config.xml_backup 	= function (){ return "DEV/WorthyAnaconda/backups/"; };
*/



/** print header **/
function header(){
	//Description of the system when running.
	console.log("**")
	console.log("* Worthy Anaconda System");
	console.log("* The system main focus is in receiveing all MSOs XMLs (specific ");
	console.log("* layout files) parsing this files and create a specific behaivior (see ");
	console.log("* workflow).");
	console.log("**")
}

exports.header = header;
exports.config = config;
exports.logger = logger;
