var fs 		= require('fs');
var xml2js 	= require('xml2js');
var mysql = require('mysql');

var header = require('./Globals').header();
var config = require('./Globals').config;
var logger = require('./Globals').logger;

var parser = new xml2js.Parser();

var fileName = "20130418_veo.xml";
var filePath = "/home/"+config.msos[0]+"/XML/"+fileName;

var mysql_config = config.mysql;
var client = mysql.createConnection(mysql_config.client_qa);
client.query('USE ' + mysql_config.database);
var movimientos = 0;

fs.readFile(filePath, function(err, data) {
    parser.parseString(data, function (err, result) {
		var proveedor = result.root.encabezado[0].proveedor[0];
		var inicial = result.root.encabezado[0].periodo[0].$.inicial;
		var final = result.root.encabezado[0].periodo[0].$.final;
		movimientos = result.root.encabezado[0].numero_movimientos[0];
		
		var queryStr = "INSERT INTO  `msodb`.`xml` (`id` ,`proveedor` ,`inicial` ,`final` ,`movimientos`) VALUES (NULL ,  '"+proveedor+"',  '"+inicial+"',  '"+final+"',  "+movimientos+");";
		client.query(queryStr, 
			function(err, results, fields){
				if (err) {
					//un error ocurrió que no permitió crear los inserts
					logger.info(queryStr);
				} else {
					if (results.affectedRows == 1){
						//En este punto puedes garantizar que se hizo el insert 
						//del registro XML.
						insertaMovimientos(results.insertId, proveedor, result);
					} else {
						//En este punto algo malo pasó y no permitió crear el insert.
						logger.info(queryStr);
					}	
				}	
			}
		);
    });
});


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
		
		var queryStr = "INSERT INTO `msodb`.`movimiento` (`id_xml`, `mso`, `idmso`, `nombre`, `calle`, `ciudad`, `colonia`, `municipio`, `delegacion`, `numero_exterior`, `numero_interior`, `estado`, `pais`, `cp`, `email`, `fase`, `tipo`, `monto`) VALUES ("+xml+", '"+mso+"', '"+idmso+"', '"+nombre+"', '"+calle+"', '"+ciudad+"', '"+colonia+"', '"+municipio+"', '"+delegacion+"', '"+numero_exterior+"', '"+numero_interior+"', '"+estado+"', '"+pais+"', '"+cp+"', '"+email+"', '"+fase+"', '"+tipo+"', "+monto+");";
		
		client.query(queryStr, 
			function(err, results, fields){
				if (err) {
					//un error ocurrió que no permitió crear los inserts
					logger.info(queryStr);
				} else {
					if (results.affectedRows == 1){
						//En este punto puedes garantizar que se hizo el insert 
						//del registro XML.
					} else {
						//En este punto algo malo pasó y no permitió crear el insert.
						logger.info(queryStr);
					}	
				}	
			}
		);		
	}
}