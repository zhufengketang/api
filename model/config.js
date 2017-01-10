/**
 * Created by weimin on 17-1-9.
 */
var mongoAdapter = require("sails-mongo");
var mysqlAdapter = require("sails-mysql");

var config = {
    adapters:{
        "mysql":mysqlAdapter,
        "mongo":mongoAdapter
    },
    connections:{
        mongoConn:{
            adapter:"mongo",
            url:"mongodb://localhost/zhufengketang"
        }
    },
    defaults:{
        migrate:"safe"
    }
}

module.exports = config;