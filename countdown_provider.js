var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

CountdownProvider = function(host, port) {
    this.db = new Db('countDownDB', new Server(host, port, {auto_reconnect: true}, {}));
    this.db.open(function(){});
};

CountdownProvider.prototype.collection = function(callback){
    this.db.collection('countdown', function(error, coll){
	if(error) callback(error);
	else callback(null, coll);
    });
};

CountdownProvider.prototype.retrieveAll = function (callback) {
    this.mongoQuery(function (collection){
	collection.find();
    }, callback);
};

CountdownProvider.prototype.week = function (callback) {
    
};

CountdownProvider.prototype.mongoQuery = function(query, callback) {
    this.collection(function(error, coll){
	if(error) callback(error);
	else {
	    query(coll).toArray(function(error, results){
		if(error) callback(error);
		else callback(null, results);
	    });
	}});
};