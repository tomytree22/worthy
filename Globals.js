/** Logging System **/
var winston = require('winston');
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: __dirname + '/logs/backup.log', json: false })
  ],
  exceptionHandlers: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
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
        password:'V30Pa55w0rd55',
        host:'veoinstance.cqjzo7qtmihl.us-east-1.rds.amazonaws.com'
};

config.mysql.client_qa = {
        user:'root',
        password:'Pr0d1gy2',
        host:'127.0.0.1'
};

/**
 * MySQL Database names
 */
config.mysql.database = 'msodb';

config.msos = [ "veo", "cablevision", "cablemas", "sky" ];



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