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

CountdownProvider.prototype.search = function(params, callback) {
    this.mongoQuery(function (collection) {
	    var nameRegex = '.*' + params.name.split(' ').join('.*') + '.*';
	    var query = {'name': { '$regex' : nameRegex, '$options' : 'i' } };
	    if (params.tags.length > 0){
		query['tags'] = { '$all' : params.tags };
	    }
	    query['eventDate'] =  { '$gte' : params.start };
	    if(params.end !== undefined){
		query['eventDate']['$lt'] = params.end;
	    }
	    return collection.find(query);
	}, callback);
};

CountdownProvider.prototype.upsert = function(countdown, callback) {
   this.collection(function (error, coll) {
	   coll.update({name : countdown.name}, countdown, {upsert: true}, function(error, docs) {
		   callback(docs);
	    });
    }); 
};

CountdownProvider.prototype.insert = function(countdown, callback) {
    this.collection(function (error, coll) {
	    coll.insert(countdown, function(error, docs) {
		    callback(docs);
	    });
    });
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
			    var i;
			    for (i = 0; i < results.length; i++){
				// Convert all results to millis
				if(results[i].eventDate !== undefined){
				    results[i].eventDate = results[i].eventDate.getTime();
				}
			    }
			    callback(results);
			}
		    });
	    }});
};

exports.CountdownProvider = CountdownProvider;
