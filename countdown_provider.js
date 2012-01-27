var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;

var CountdownProvider = function(host, port) {
    this.db = new Db('countDownDB', new Server(host, port, {auto_reconnect: true}, {}), {
        reaperTimeout: 15000, reaperInterval: 5000,
        numberOfRetries: 2, retryMilliseconds:2000});

    var that = this;
    this.db.open(function(error, p_client){
        if (error) {
            throw error;
        }
    });
};

CountdownProvider.prototype.collection = function(callback, failure){
    this.db.collection('countdown', function(error, coll){
        if(error) {
            console.log("error: " + error);
            callback(error);
        }
        else {
            callback(null, coll);
        }
    });
};

CountdownProvider.prototype.retrieveAll = function (callback, failure) {
    try {
        this.mongoQuery(function (collection){
            return collection.find({});
        }, callback, failure);
    }
    catch(err) {
        failure(err);
    }
};

CountdownProvider.prototype.retrieveById = function(idString, callback, failure){
    try{
        this.mongoQuery(function (collection) {
            var objId = new ObjectID(idString);
            return collection.find({'_id': new ObjectID(idString)});
        }, callback, failure);
    } catch(err) {
        failure(err);
    }
};

CountdownProvider.prototype.future = function(pagination, callback, failure) {
    this.paginatedQuery( {'eventDate' : { '$gte' : new Date() }, 'isPrivate': {'$ne' : 'true'} }, this.sortBy, pagination, callback, failure );
};

CountdownProvider.prototype.random = function(callback, failure) {
    var getRandom = function(min, max) {
        return Math.floor( Math.random() * (max - min + 1)) + min;
    };
    //a better way might exist ?
    this.retrieveAll(function (data) {
        var randomIndex = getRandom(0, data.length -1);
        callback( [ data[ randomIndex ] ] );
     }, failure);
};

CountdownProvider.prototype.search = function(params, pagination, callback, failure) {
    var nameRegex = '.*' + params.name.split(' ').join('.*') + '.*';
    var query = {'name': { '$regex' : nameRegex, '$options' : 'i' } };
    if (params.tags.length > 0){
        query['tags'] = { '$all' : params.tags };
    }
    query['eventDate'] =  { '$gte' : params.start };
    if(params.end !== undefined){
        query['eventDate']['$lt'] = params.end;
    }
    query['isPrivate'] = { '$ne' : 'true' };
    this.paginatedQuery(query, this.sortBy, pagination, callback, failure);
};

//returns a list of tags eg. [movies, movie, games]
CountdownProvider.prototype.searchTags = function(startsWith, callback, failure) {
    this.mongoQuery(function(collection) {
        return collection.distinct("tags", {tags: new Regex(startsWith + '.*', "i") });
    }, callback, failure);
};

CountdownProvider.prototype.upsert = function(countdown, callback, failure) {
   countdown.eventDate = new Date(countdown.eventDate);  //make sure the date is a date
   this.collection(function (error, coll) {
       if (error) failure(error);
       coll.update({name : countdown.name}, countdown, {upsert: true, safe:true}, function(error, docs) {
            if (error) {
                if (typeof(failure) !== "undefined") {
                    failure(error);
                } else {
                    console.log("[no error handler] Error: " + error);
                }
            } else {
               callback(docs[0]);
            }
        });
    });
};

CountdownProvider.prototype.upsertMulti = function(countdowns, callback, failure){
    var i,
        results = [];
    
    for (i = 0; i < countdowns.length; i++){
        countdowns[i].eventDate = new Date(countdowns[i].eventDate);

        this.upsert(countdowns[i], function( resp ){
            results.push(resp);
        });
    }
    callback(results);
};

CountdownProvider.prototype.insert = function(countdown, callback, failure) {
    countdown.eventDate = new Date(countdown.eventDate);
    this.collection(function (error, coll) {
        if (error) failure(error);
        console.log("Inserting: " + JSON.stringify(countdown));
        coll.insert(countdown, {safe: true}, function(error, docs) {
            console.log("Got: " + JSON.stringify(docs));
            if (error) {
                if (typeof(failure) !== "undefined") {
                    failure(error);
                } else {
                    console.log("[no error handler] Error: " + error);
                }
            } else {
                callback(docs[0]);
            }
        });
    });
};
        

CountdownProvider.prototype.paginatedQuery = function(query, sortBy, pagination, callback, failure) {
    this.mongoQuery(function(collection){

        console.log("QUERY : "+ JSON.stringify(query) + " skipping: "+ pagination.skip + " limit: " + pagination.limit);
        var cursor = collection.find(query);
        return cursor.sort(sortBy).skip(pagination.skip).limit(pagination.limit);
    }, callback, failure);
};

CountdownProvider.prototype.sortBy = { eventDate: 1, name: -1};

CountdownProvider.prototype.mongoQuery = function(query, callback, failure) {
    this.collection(function(error, coll){
        if(error) {
            if (typeof(failure) !== "undefined") {
                failure(error);
            } else {
                console.log("[no error handler]: " + error);
            }
        } else {
            query(coll).toArray(function(error, results) {
                if(error){
                    if (typeof(failure) !== "undefined") {
                        failure(error);
                    } else {
                        console.log("[no error handler]: " + error);
                    }
                }
                else {
                    console.log("Got results "+results.length);
                    var i;
                    for (i = 0; i < results.length; i++){
                        //console.log(results[i].name);
                        // Convert all results to millis
                        if(results[i].eventDate !== undefined){
                            results[i].eventDate = results[i].eventDate.getTime();
                        }
                    }
                    
                    callback(results);
                }
            });
        }},failure);
};

exports.CountdownProvider = CountdownProvider;
