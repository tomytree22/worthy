var mysql = require('mysql');
var fs 		= require('fs');
var xml2js 	= require('xml2js');

var config = require('./Globals').config;
var logger = require('./Globals').logger;

var parser = new xml2js.Parser();

var system = require('child_process');

var filename = "";
var mso		 = "";
var error	 = false;

var mysql_config;
var client;

function handleFile(m, fn){
	filename = fn;
	mso = m;
	fs.readFile(config.xml_deposit(mso)+filename, handleXML);

}

function handleXML(err, data) {
	if (err){
		system.spawn('cp', ['-r', config.xml_deposit(mso)+filename, config.xml_error(mso)+filename]);
		system.spawn('cp', ['-r', config.xml_deposit(mso)+filename, config.xml_backup()+filename]);
		system.spawn('rm', [config.xml_deposit(mso)+filename]);
		throw new Error('['+mso+'][file_error] - Error en archivo '+filename+' marca tener un error de lectura de archivo eviando archivo a '+config.xml_error(mso)+filename+" e ignorando flujo");
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
			mysql_config = config.mysql;
			client = mysql.createPool(mysql_config.client_qa);
			insertaXML(proveedor, inicial, final, movimientos, objectXML);
		}				
	}		
}

function insertaXML (proveedor, inicial, final, movimientos, objectXML) {
	var queryStr = "INSERT INTO  `msodb`.`xml` (`id` ,`proveedor` ,`inicial` ,`final` ,`movimientos`) VALUES (NULL ,  '"+proveedor+"',  '"+inicial+"',  '"+final+"',  "+movimientos+");";
	client.getConnection(function (err0, connection) {
		if (err0){
			system.spawn('cp', ['-r', config.xml_deposit(mso)+filename, config.xml_backup()+filename]);
			system.spawn('rm', [config.xml_deposit(mso)+filename]);
			throw new Error('['+mso+']['+filename+'] - Error en MySQL no hay conexión, se requiere ingestar nuevamente el archivo.');
		} else {
			connection.query('USE ' + mysql_config.database);
			connection.query(queryStr, function (err, results, fields) {
					if (err) {
						logger.info(queryStr);
						console.log(err);
					} else {
						if (results.affectedRows == 1){						//Step 2: Insert the movements in the MySQL DB
						insertaMovimientos(results.insertId, proveedor, objectXML, connection);
					} else {
						logger.info(queryStr);
					}	
				}	
			});
		}
	});		
}

function insertaMovimientos(xml, mso, objeto, connection){
	error = false;	
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
		var monto_facturado		= objeto.root.movimiento[x].monto_facturado;
		var fecha		= objeto.root.movimiento[x].fecha;		
		var sc			= "0";
		
		var queryStr = "INSERT INTO `msodb`.`movimiento` (`id_xml`, `sc`, `mso`, `idmso`, `nombre`, `calle`, `ciudad`, `colonia`, `municipio`, `delegacion`, `numero_exterior`, `numero_interior`, `estado`, `pais`, `cp`, `email`, `fase`, `tipo`, `monto`, `concepto`, `fecha`) VALUES ("+xml+", '"+sc+"', '"+mso+"', '"+idmso+"', '"+nombre+"', '"+calle+"', '"+ciudad+"', '"+colonia+"', '"+municipio+"', '"+delegacion+"', '"+numero_exterior+"', '"+numero_interior+"', '"+estado+"', '"+pais+"', '"+cp+"', '"+email+"', '"+fase+"', '"+tipo+"', "+monto_facturado+", 'Suscripción Mensual SVOD', '"+fecha+"');";
				
		queryStr = queryStr.split("[object Object]").join("n/a");
				
		connection.query(queryStr, function (err, results, fields) {
				if (err) {
						if (err.code == "ER_DUP_ENTRY"){
							var queryUpdate = queryStr.substr(queryStr.indexOf("VALUES (")+8);
							queryUpdate = queryUpdate.substr(0,queryUpdate.length-2);
							var items = queryUpdate.split(',');
							
							
							var queryUpdate = "id_xml="+items[0]+",sc="+items[1]+",mso="+items[2]+",idmso="+items[3]+",nombre="+items[4]+",calle="+items[5]+",ciudad="+items[6]+",colonia="+items[7]+",municipio="+items[8]+",delegacion="+items[9]+",numero_exterior="+items[10]+",numero_interior="+items[11]+",estado="+items[12]+",pais="+items[13]+",cp="+items[14]+",email="+items[15]+",fase="+items[16]+",tipo="+items[17]+",monto="+items[18]+",concepto="+items[19]+",fecha="+items[20];
							queryUpdate = "UPDATE movimiento SET "+queryUpdate+" WHERE mso = '"+mso+"' AND idmso = "+items[3]+";";
							
							actualizaMovimientos(queryUpdate, connection, objeto.root.movimiento.length, x, error);
						} else {
							logger.info(queryStr);
							console.log(err);
							error = true;	
							finalStep( objeto.root.movimiento.length, x, error, connection);
						}
				} else {
						if (results.affectedRows == 1){							error = false;
							finalStep( objeto.root.movimiento.length, x, error, connection);
						} else {
							error = true;
							logger.info(queryStr);
							finalStep( objeto.root.movimiento.length, x, error, connection);
						}	
				}	
		});
	}
}


function actualizaMovimientos(queryStr, connection, original, count, error){
	connection.query(queryStr, function (err, results, fields) {
		if (err) {
			logger.info(queryStr);
			console.log(err);
			error = true;	
			finalStep( original, count, error, connection);
		} else {
			if (results.affectedRows == 1){
				error = false;
				finalStep(  original, count, error, connection);
			} else {
				error = true;
				logger.info(queryStr);
				finalStep( original, count, error, connection);
			}
		}
	});
}

function finalStep(original, count, error, connection){
	if (original == count){
		if (error){
			system.spawn('cp', ['-r', config.xml_deposit(mso)+filename, config.xml_error(mso)+filename]);
			system.spawn('cp', ['-r', config.xml_deposit(mso)+filename, config.xml_backup()+filename]);
			system.spawn('rm', [config.xml_deposit(mso)+filename]);
		} else {
			system.spawn('cp', ['-r', config.xml_deposit(mso)+filename, config.xml_backup()+"/ok/"+filename]);
			system.spawn('rm', [config.xml_deposit(mso)+filename]);
		}	
		connection.end();	
	}
}

exports.handleFile = handleFile;