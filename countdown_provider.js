var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
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
	    return collection.find({});
	}, callback);
};

CountdownProvider.prototype.retrieveById = function(idString, callback){
    this.mongoQuery(function (collection) {
	    return collection.find({'_id': new ObjectID(idString)});
	}, callback);
};

CountdownProvider.prototype.day = function (callback) {
    return this.todayPlus(1*24*60*60*1000, callback);
};

CountdownProvider.prototype.week = function (callback) {
    return this.todayPlus(7*24*60*60*1000, callback);
};

CountdownProvider.prototype.month = function (callback) {
    return this.todayPlus(30*24*60*60*1000, callback);
};

CountdownProvider.prototype.year = function (callback) {
    return this.todayPlus(365*24*60*60*1000, callback);
};

CountdownProvider.prototype.todayPlus = function(num, callback) {
    this.mongoQuery(function (collection) {
	    var end = new Date(new Date().getTime() + num);
	    return collection.find({'eventDate': { '$gte' : new Date(), '$lt': end}});
	}, callback);
};

CountdownProvider.prototype.random = function(callback) {
    var getRandom = function(min, max) {
	return Math.floor( Math.random() * (max - min + 1)) + min;
    };
    //a better way might exist ?
    this.retrieveAll(function (data) {
	    var randomIndex = getRandom(0, data.length -1);
	    callback( [ data[ randomIndex ] ] );
     });
};

//untested - need to add tags as well
CountdownProvider.prototype.search = function(name, tags, start, end) {
    this.mongoQuery(function (collection) {
	    stags = tags === undefined? [] : tags.split(",");

	    var query = {'name': '/*'+name + '*/i', 'tags' : { '$all' : stags } };
	    start = start !== undefined ? start : 0;
	    query['eventDate'] =  { '$gte' : start };
	    if(end !== undefined){
		query['eventDate']['$lt'] = end;
	    }

	    return collection.find(query);
	}, callback);
};
	    

CountdownProvider.prototype.mongoQuery = function(query, callback) {
    this.collection(function(error, coll){
	    if(error) callback(error);
	    else {
		query(coll).toArray(function(error, results) {
			if(error){
			    callback(error);
			}
			else {
			    callback(results);
			}
		    });
	    }});
};

exports.CountdownProvider = CountdownProvider;
