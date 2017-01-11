/**
 * Created by weimin on 17-1-9.
 */
var mongoAdapter = require("sails-mongo");
var mysqlAdapter = require("sails-mysql");
var Waterline = require("waterline");
var loadedCollection = require("./model");
var config = {
    adapters:{
        "mysql":mysqlAdapter,
        "mongo":mongoAdapter
    },
    connections:{
        mongoConn:{
            adapter:"mongo",
            url:"mongodb://localhost:27017/zhufengketang"
        }
    }
}

var orm = new Waterline();
orm.loadCollection(loadedCollection.courseCollection);
orm.loadCollection(loadedCollection.imgcodeCollection);
orm.loadCollection(loadedCollection.orderCollection);
orm.loadCollection(loadedCollection.tokenCollection);
orm.loadCollection(loadedCollection.userCollection);
orm.loadCollection(loadedCollection.vcodeCollection);

exports.config = config;
exports.orm = orm;