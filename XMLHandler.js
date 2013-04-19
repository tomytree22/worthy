var mysql = require('mysql');
var fs 		= require('fs');
var xml2js 	= require('xml2js');

var config = require('./Globals').config;
var logger = require('./Globals').logger;

var parser = new xml2js.Parser();

var system = require('child_process');

var mysql_config = config.mysql;
var client = mysql.createConnection(mysql_config.client_qa);
client.query('USE ' + mysql_config.database);

var filename = "";
var mso		 = "";

function handleFile(m, fn){
	filename = fn;
	mso = m;
	fs.readFile(config.xml_deposit(mso)+filename, handleXML);

}

function handleXML(err, data) {
	if (err){
		throw err;
	} else {
		parser.parseString(data, handleParsedData);
	}
}

function handleParsedData(err, objectXML){
	if (err){
		system.spawn('cp', ['-r', config.xml_deposit(mso)+filename, config.xml_error(mso)+filename]);
		system.spawn('cp', ['-r', config.xml_deposit(mso)+filename, config.xml_backup()+filename]);
		system.spawn('rm', [config.xml_deposit(mso)+filename]);
		throw new Error('['+mso+'][sintaxis] - Error en archivo '+filename+' marca tener un error de sintaxis XML enviando archivo a '+config.xml_error(mso)+filename+" e ignorando flujo");
	} else {
		var proveedor = objectXML.root.encabezado[0].proveedor[0];
		var inicial = objectXML.root.encabezado[0].periodo[0].$.inicial;
		var final = objectXML.root.encabezado[0].periodo[0].$.final;
		var movimientos = objectXML.root.encabezado[0].numero_movimientos[0];
		
		//Step 0: Validate that the number of "movimientos" reported on the XML is actually the number that exist in it.
		if (movimientos != objectXML.root.movimiento.length){
			system.spawn('cp', ['-r', config.xml_deposit(mso)+filename, config.xml_error(mso)+filename]);
			system.spawn('cp', ['-r', config.xml_deposit(mso)+filename, config.xml_backup()+filename]);
			system.spawn('rm', [config.xml_deposit(mso)+filename]);
			throw new Error('['+mso+']['+movimientos+']['+objectXML.root.movimiento.length+'] - Error en archivo '+filename+' marca tener '+movimientos+' movimiento(s) cuando en realidad hay '+objectXML.root.movimiento.length+' movimiento(s) enviando archivo a '+config.xml_error(mso)+filename+" e ignorando flujo");
		} else {
			//Step 1: Insert the XML header in MySQL DB
			insertaXML(proveedor, inicial, final, movimientos, objectXML);
		}				
	}		
}

function insertaXML (proveedor, inicial, final, movimientos, objectXML) {
	var queryStr = "INSERT INTO  `msodb`.`xml` (`id` ,`proveedor` ,`inicial` ,`final` ,`movimientos`) VALUES (NULL ,  '"+proveedor+"',  '"+inicial+"',  '"+final+"',  "+movimientos+");";
	client.query(queryStr, function (err, results, fields) {
		if (err) {
			logger.info(queryStr);
			throw err;
		} else {
			if (results.affectedRows == 1){		
				//Step 2: Insert the movements in the MySQL DB
				insertaMovimientos(results.insertId, proveedor, objectXML);
			} else {
				logger.info(queryStr);
			}	
		}	
	});
}

function insertaMovimientos(xml, mso, objeto){
	for (var x = 0; x < objeto.root.movimiento.length; x++ ){
		var idmso 		= objeto.root.movimiento[x].id;
		var nombre		= objeto.root.movimiento[x].usuario[0].nombre;
		var calle		= objeto.root.movimiento[x].usuario[0].direccion[0].calle;
		var ciudad		= objeto.root.movimiento[x].usuario[0].direccion[0].ciudad;
		var colonia		= objeto.root.movimiento[x].usuario[0].direccion[0].colonia;
		var municipio	= objeto.root.movimiento[x].usuario[0].direccion[0].municipio;
		var delegacion	= objeto.root.movimiento[x].usuario[0].direccion[0].delegacion;
		var numero_exterior	= objeto.root.movimiento[x].usuario[0].direccion[0].numero_exterior;
		var numero_interior	= objeto.root.movimiento[x].usuario[0].direccion[0].numero_interior;
		var estado		= objeto.root.movimiento[x].usuario[0].direccion[0].estado
		var pais		= objeto.root.movimiento[x].usuario[0].direccion[0].pais
		var cp			= objeto.root.movimiento[x].usuario[0].direccion[0].cp;
		var email		= objeto.root.movimiento[x].usuario[0].email;
		var fase		= objeto.root.movimiento[x].fase;
		var tipo		= objeto.root.movimiento[x].tipo;
		var monto		= objeto.root.movimiento[x].monto;
		var sc			= "0";
		
		var queryStr = "INSERT INTO `msodb`.`movimiento` (`id_xml`, `sc`, `mso`, `idmso`, `nombre`, `calle`, `ciudad`, `colonia`, `municipio`, `delegacion`, `numero_exterior`, `numero_interior`, `estado`, `pais`, `cp`, `email`, `fase`, `tipo`, `monto`) VALUES ("+xml+", '"+sc+"', '"+mso+"', '"+idmso+"', '"+nombre+"', '"+calle+"', '"+ciudad+"', '"+colonia+"', '"+municipio+"', '"+delegacion+"', '"+numero_exterior+"', '"+numero_interior+"', '"+estado+"', '"+pais+"', '"+cp+"', '"+email+"', '"+fase+"', '"+tipo+"', "+monto+");";
		
		client.query(queryStr, function (err, results, fields) {
			if (err) {
				logger.info(queryStr);
				throw err;
			} else {
				if (results.affectedRows == 1){
					system.spawn('cp', ['-r', config.xml_deposit(mso)+filename, config.xml_backup()+"/ok/"+filename]);
					system.spawn('rm', [config.xml_deposit(mso)+filename]);
				} else {
					logger.info(queryStr);
				}	
			}	
		});		
	}
}

exports.handleFile = handleFile;