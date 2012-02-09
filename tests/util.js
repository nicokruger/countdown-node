var spawn = require("child_process").spawn,
    fs = require("fs"),
    Db = require('mongodb').Db,
    _ = require("../public/vendor/underscore.js"),
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server,
    ObjectID = require('mongodb').ObjectID,
    assert = require("assert"),
    httpwrapper = require("./httpwrapper"),
    wrench = require("wrench");

var tempFile = function () {
    return (new Date()).getTime();
};

var tempDir = function () {
    var tmp = tempFile();
    var tmpPrefix = "/tmp";
    var tmpDir = tmpPrefix + "/" + tmp;
    console.log("tmpdir " + tmpDir);
    fs.mkdirSync(tmpDir);
    return tmpDir;
};

var spawnMongo = function (callback, countdowns) {
    var port = 18976,
        tmpPath = tempDir(),
        mongoDb = spawn("mongod", ["--dbpath", tmpPath,"--port", port, "--nojournal", "--noprealloc", "--nohttpinterface", "--nssize", "1"], {cwd:tmpPath}),
        first = true;

    mongoDb.stdout.on("data", function (data) {
        // TODO: this is specific to mongos stdout stream!!!
        if (data.asciiSlice(0, data.length).indexOf("waiting for connections on port") !== -1) {
            var db = new Db("countDownDB", new Server("localhost", port, {auto_reconnect: true}, {}), {
                reaperTimeout: 1000, reaperInterval: 500,
                numberOfRetries: 0, retryMilliseconds:2000});
            db.open(function(error, p_client){
                if (error) {
                    wrench.rmdirSyncRecursive(tmpPath, true);
                    callback(error);
                }

                db.collection('countdown', function(error, coll){
                    if (error) {
                        wrench.rmdirSyncRecursive(tmpPath, true);
                        callback(error);
                    }

                    var done = 0;
                    _(countdowns).each(function (countdown) {
                        coll.update({name:countdown.name}, countdown, {upsert: true, safe:true}, function (errors,docs) {
                            if (errors) { callback(errors); }
                            done++;
                            if (done == countdowns.length) {
                                callback();
                            }
                        });
                    });
                });
            });
        }
    });
    return {
        stop: function (callback) {
            mongoDb.on("exit", function () {
                console.log("exit");
                wrench.rmdirSyncRecursive(tmpPath, false);
                callback();
            });
            mongoDb.kill();
        },
        port: port
    };
};

var apiSpec = function (method, url, statusCode, contentType) {
    var html_headers = {"Accept":"text/html"},
        json_headers = {"Accept":"application/json"},
        httpVerb,
        httpHeaders;

    if (method.toLowerCase() === "get") {
        httpVerb = httpwrapper.get;
    } else {
        httpVerb = httpwrapper.post;
    }
    if (contentType === "html") {
        httpHeaders = html_headers;
    } else {
        httpHeaders = json_headers;
    }

    return function (done) {
        httpVerb(url, function (error, res, body) {
            if (error) { done(error); return; }
            assert.equal(res.statusCode, statusCode);
            if (contentType === "html") {
                assert.ok(res.headers["content-type"].indexOf("html") != -1);
            } else {
                assert.ok(res.headers["content-type"].indexOf("json") != -1);
            }
            done();
        }, httpHeaders);
    };
};

exports.tempFile = tempFile;
exports.tempDir = tempDir;
exports.spawnMongo = spawnMongo;

exports.GET = _.bind(apiSpec, undefined, "GET");
exports.POST = _.bind(apiSpec, undefined, "POST");
