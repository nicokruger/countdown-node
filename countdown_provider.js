// var Db = require('mongodb').Db;
// var Connection = require('mongodb').Connection;
// var Server = require('mongodb').Server;
// var ObjectID = require('mongodb').ObjectID;

var CountdownProvider = function(){
    console.log("hello world");
};
// CountdownProvider = function(host, port) {
//     this.db = new Db('countDownDB', new Server(host, port, {auto_reconnect: true}, {}));
//     this.db.open(function(){});
// };

// CountdownProvider.prototype.collection = function(callback){
//     this.db.collection('countdown', function(error, coll){
// 	if(error) callback(error);
// 	else callback(null, coll);
//     });
// };

// CountdownProvider.prototype.retrieveAll = function (callback) {
//     this.mongoQuery(function (collection){
// 	collection.find({});
//     }, callback);
// };

// CountdownProvider.prototype.retrieveById = function(id, callback){
//     this.mongoQuery(function (collection) {
// 	collection.find({'_id': ObjectID.createFromHexString(id)});
//     }, callback);
// };

// CountdownProvider.prototype.week = function (callback) {
//     this.mongoQuery(function (collection){
// 	var end = new Date(new Date().getTime() + 7*24*60*60*1000); 
// 	collection.find({'eventDate': { '$gte' : new Date(), '$lt': end}});
//     }, callback);
// };

// CountdownProvider.prototype.mongoQuery = function(query, callback) {
//     this.collection(function(error, coll){
// 	if(error) callback(error);
// 	else {
// 	    query(coll).toJson(function(error, results){
// 		if(error) callback(error);
// 		else {
// 		    console.log("GOT SOMETHING FROM DB");
// 		    callback(null, results);
// 		}
// 	    });
// 	}});
// };

exports.CountdownProvider = CountdownProvider;