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

CountdownProvider.prototype.day = function (pagination, callback, failure) {
    this.paginatedQuery(this.todayPlus(1*24*60*60*1000), this.sortBy, pagination, callback, failure);
};

CountdownProvider.prototype.week = function (pagination, callback, failure) {
    this.paginatedQuery(this.todayPlus(7*24*60*60*1000), this.sortBy, pagination, callback, failure);
};

CountdownProvider.prototype.month = function (pagination, callback, failure) {
    this.paginatedQuery(this.todayPlus(30*24*60*60*1000), this.sortBy, pagination, callback, failure);
};

CountdownProvider.prototype.year = function (pagination, callback, failure) {
    this.paginatedQuery(this.todayPlus(365*24*60*60*1000), this.sortBy, pagination, callback, failure);
};

CountdownProvider.prototype.todayPlus = function(num) {
    var end = new Date(new Date().getTime() + num);
    return {'eventDate': { '$gte' : new Date(), '$lt': end}};
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
    this.paginatedQuery(query, this.sortBy, pagination, callback, failure);
};

//returns a list of tags eg. [movies, movie, games]
CountdownProvider.prototype.searchTags = function(startsWith, callback, failure) {
    this.mongoQuery(function(collection) {
        return collection.distinct("tags", {tags: new Regex(startsWith + '.*', "i") });
    }, callback, failure);
};

CountdownProvider.prototype.upsert = function(countdown, callback, failure) {
   this.collection(function (error, coll) {
        if (error) failure(error);
       coll.update({name : countdown.name}, countdown, {upsert: true}, function(error, docs) {
           callback(docs);
        });
    });
};

CountdownProvider.prototype.insert = function(countdown, callback, failure) {
    this.collection(function (error, coll) {
        if (error) failure(error);
        coll.insert(countdown, function(error, docs) {
            callback(docs);
        });
    });
};
        

CountdownProvider.prototype.paginatedQuery = function(query, sortBy, pagination, callback, failure){
    this.mongoQuery(function(collection){

        //modify the query to be greater than the last name and millis
        var oldName = query.name,
            newName = {name: {$lt : pagination.last.name}};

        //if the query already had a name constraint we have to $and them
        //query.name = newName.name;
        if(oldName !== undefined) {
            query.name = { $and : [ oldName, newName ]};
        }
        
        //if query already had a start ( $gt on eventdate) just swap it
        // if(query.eventDate !== undefined){
        //     query.eventDate['$gt'] = pagination.last.eventDate;  //might have an $lt we do not want to lose
        //     delete query.eventDate['$gte'];
        // }
        // else {
        //     query.eventDate = {$gt : pagination.last.eventDate };
        // }
        
        //console.log('paginatified query is: ' + JSON.stringify(query) );
   
        var cursor = collection.find(query);
        //console.log("Limit is: "+pagination.limit);
        //console.log("SORTY BY: " + JSON.stringify(sortBy));
        //console.log(cursor.length);
        return cursor; //.sort(sortBy).limit(pagination.limit);
    }, callback, failure);
};

CountdownProvider.prototype.sortBy = { eventDate: -1 };

CountdownProvider.prototype.mongoQuery = function(query, callback, failure) {
    this.collection(function(error, coll){
        if(error) {
            failure(error);
        } else {
            query(coll).toArray(function(error, results) {
                if(error){
                    failure(error);
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
        }},failure);
};

exports.CountdownProvider = CountdownProvider;
