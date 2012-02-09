var fs = require("fs"), url = require("url"), nodeStatic = require("node-static");
var express = require('express');
var winston = require("winston");

// default transports
if (typeof(winston.loggers.options.transports) === "undefined") winston.loggers.options.transports = [];
winston.loggers.options.transports.push(new (winston.transports.Console)({ timestamp: true, colorize:true }));

var _ = require("../public/vendor/underscore.js");
var client = require("./client");
var controller = require("../public/controller.js").controller;
var CountdownProvider = require("./countdown_provider").CountdownProvider;

var defaults = {
    serverPort: 8080,
    database: "countDownDB",
    databaseHost: "localhost",
    databasePort: 27017,
    logging: true,
    paginationLimit: 4
};
// Special NotFound exception for 404's - for some reason this is not standard in express
function NotFound(msg){
  this.name = 'NotFound';
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
}
NotFound.prototype.__proto__ = Error.prototype;

var makeServer = function (options) {
    options = _.extend(defaults, typeof(options) !== "undefined" ? options : {});

    // http router
    var router = express.createServer();
    // Static file server
    var file = new (nodeStatic.Server)("./public");
    // countdowns from mongo!!
    var countdownProvider = new CountdownProvider(options.databaseHost, options.databasePort, options.database);

    // make winston pretty print stuff on console when file-logging is turned off
    winston.loggers.add("server");
    var logger = winston.loggers.get("server"),
        request_log;
    if (options.logging) {
        winston.loggers.add("requests", {
            console:{
                colorize:true
            },file:{
                filename:"requests.log",
                timestamp:true
            }
        });
        request_log = winston.loggers.get("requests");
    }
    var request_logger = function (req, res, next) {
        request_log.info("[REQ]", {url:req.url, ip:req.connection.remoteAddress, headers: JSON.stringify(req.headers)});
        next();
    };
    
    var failure = function (req, resp, error) {
        var msg = ((typeof(error) !== "undefined" && error !== null) ? error.toString() : "");
        logger.error("When Is Failure", {req: req.url, error_s: msg, error: error});
        client.error500(req, resp, function (r,w) {
            var $ = w.$;
            $("#message").html(msg);
            r.writeHead(500, {"Content-type":"text/html; charset=utf-8"});
            r.end(w.document.doctype + w.document.innerHTML);
        });

    };

    var defaultTitle = "When Again? Release dates for games, movies, music and everything in between.";

    var createDom = function (data, resp, window, title){
        window.c.clear();
        if (typeof(title) === "undefined") {
            title = defaultTitle;
        }
        window.$('title').html(title);
        if (data.length === 1) {
            window.m.putCountdownOGP(data[0]);
        } else {
            window.m.putCountdowns(data);
        }
        resp.writeHead(200, {"Content-type":"text/html; charset=utf-8"});
        resp.end(window.document.doctype + window.document.innerHTML);
    };

    var countdownFromReq = function(req){
        var countdown = {};
        countdown.tags = req.body.tags;
        countdown.name = req.body.name === undefined ? 'no-name' : req.body.name;
        countdown.eventDate = new Date(req.body.eventDate === undefined ? 0 : parseInt(req.body.eventDate, 10));
        if (req.body.hasOwnProperty("isPrivate")) {
            countdown.isPrivate = req.body.isPrivate;
        }
        return countdown;
    };

    var getPaginationParams = function(req){
        var limit = req.query.limit === undefined? options.paginationLimit : req.query.limit;
        var last = defaultLast;
        if(req.query.eventDate !== undefined && req.query.name !== undefined){
            last = {name : req.query.name, eventDate: new Date( parseInt(req.query.eventDate, 10)) };
        }
        return {'last' : last, 'limit' : limit};
    };
        
    var defaultRoute = function(req, res){
        var skip = isNaN(parseInt(req.params.skip, 10)) ? 0 : parseInt(req.params.skip, 10),
            pagination = {limit: options.paginationLimit, skip: skip};

        console.log("Accepts json???????????? html?????????? " + req.accepts("json") + " ----- " + req.accepts("html"));
        if(req.accepts('json')){
            countdownProvider.future(pagination, function(data){
                res.json({countdowns:data});
            }, _.bind(failure, undefined, req, res));
        }
        else {
            client.paginated(req, res, function(r,w) {
                countdownProvider.future(pagination, function(data){
                    createDom(data, r, w);
                });
            }, _.bind(failure, undefined, req, res));
        }
    };


    router.configure( function(req,res) {
        //router.use('/public:fingerprint', express.static('./public')); // static is a reserved word
        if (options.logging) router.use(request_logger);
        router.use(express.bodyParser());
        router.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

    });

    router.get("/", defaultRoute);

    router.get(/^\/public.*?\/.*/, function (req, res) {
        req.url = req.url.replace(/^\/public.*?\//, "");
        file.serve(req,res);
    });

    router.get("/add", function (req, res) {
        client.add(req, res, function (r,w) {
            res.writeHead(200, {"Content-type":"text/html; charset=utf-8"});
            res.end(w.document.doctype + w.document.innerHTML);
        }, _.bind(failure, undefined, req, res));
    });

    router.get("/future/:skip?", defaultRoute);

    router.get("/random/:something?", function (req,res) {
        if(req.is('application/json')){
            countdownProvider.random(function(data){
                res.json(data);
            }, _.bind(failure, undefined, req, res));
        }
        else {
            client.nonpaginated(req, res, function (r, w) {
                countdownProvider.random ( function(data) {
                    createDom(data, r, w);
                });
            }, _.bind(failure, undefined, req, res));
        }
    });
     
    router.get("/tags/:tag/:skip?", function (req, res) {
        var skip = isNaN(parseInt(req.params.skip, 10)) ? 0 : parseInt(req.params.skip, 10),
            pagination = {limit: options.paginationLimit, skip: skip};
        var searchParams = {
            name: '',
            tags: [req.params.tag],
            start: new Date(),
            end: undefined
        };

        if(req.accepts('json')){
            countdownProvider.search(searchParams, pagination, function(data){
                res.json({countdowns:data});
            }, _.bind(failure, undefined, req, res));
        }
        else {
            client.paginated(req, res, function (r, w) {
                countdownProvider.search(searchParams, pagination, function(data){
                    createDom(data, r, w, "When Again? " + req.params.tag);
                });
            }, _.bind(failure, undefined, req, res));
        }

    });

    router.get("/countdowns/:skip?", function (req, res) {
        var parseTags = function(tagsString) {
            if(tagsString !== undefined) {
                return tagsString.split(',');
            }
            else return [];
        };
        var skip = isNaN(parseInt(req.params.skip, 10)) ? 0 : parseInt(req.params.skip, 10),
            pagination = {limit: options.paginationLimit, skip: skip};

        var params = {};
        params.name = req.query.name === undefined ? '' : req.query.name;
        
        params.tags = parseTags(req.query.tags);
        params.start = new Date(req.query.start === undefined ? (new Date().getTime()) : parseInt(req.query.start, 10));
        params.end = req.query.end === undefined ? undefined : new Date( parseInt(req.query.end, 10));
        if(req.accepts('json')){
            countdownProvider.search(params, pagination, function(data){
                res.json({countdowns:data});
            }, _.bind(failure, undefined, req, res));
        }
        else {
            req.writeHead(400, {"Content-type":"text/html; charset=utf-8"});
            req.end("Not valid");
        }
    });

    router.post('/upsert', function (req, res) {
        var countdown = countdownFromReq(req);
        countdownProvider.upsert(countdown, function(data) {
            logger.info("Countdown upserted: " + JSON.stringify(data));
            res.json({countdown:data});
        }, _.bind(failure, undefined, req, res));
    });

    //scrapers should use this
    router.post('/upsertmulti', function(req, res) {
        var countdowns = req.body.countdowns;
        countdownProvider.upsertMulti(countdowns, function(data) {
            logger.info("Multiple countdowns upserted: " + JSON.stringify(data));
            res.json(data);
        }, _.bind(failure, undefined, req, res));
    });

    router.post('/insert', function (req, res) {
        var countdown = countdownFromReq(req);
        countdownProvider.insert(countdown, function(data) {
            logger.info("Countdown added: " + data.name);
            res.json({countdown:data});
        }, _.bind(failure, undefined, req, res));
    });

    router.get("/favicon.ico", function (req,res) {
        file.serve(req,res);
    });

    router.get("/robots.txt", function (req,res) {
        file.serve(req,res);
    });

    router.get('/:id', function(req, res) {
        var id = req.params.id;
        if (id.length !== 24) {
            throw new NotFound();
        }
        var query = url.parse(req.url,true).query;

        if (req.accepts("html")) {
            // determine which client to use - normal or headless by looking at the headless query parameter
            if (typeof(query) === "undefined" || query["embedded"] !== "true") {
                client.nonpaginated(req, res, function(r,w) {
                    countdownProvider.retrieveById(req.params.id, function(data){
                        createDom(data, r, w, "When Again? " + (data.length > 0 ? data[0].name : defaultTitle));
                    }, _.bind(failure, undefined, req, res));
                });
            } else {
                client.headless(req, res, function(r,w) {
                    countdownProvider.retrieveById(req.params.id, function(data){
                        createDom(data, r, w, "When Again? " + (data.length > 0 ? data[0].name : defaultTitle));
                    }, _.bind(failure, undefined, req, res));
                });
            }
        } else if (req.accepts("json")) {
            countdownProvider.retrieveById(req.params.id, function(data){
                        res.json({countdown:data});
                    }, _.bind(failure, undefined, req, res));
        }
    });

    router.get("*", function (req,resp,err) { // fallback for 404's
        client.error404(req, resp, function (r,w) {
            r.writeHead(404, {"Content-type":"text/html"});
            r.end(w.document.doctype + w.document.innerHTML);
        });
    });

    router.error(function(err, req, res, next){
        if (err instanceof NotFound) {
            // our special 404
            client.error404(req, res, function (r,w) {
                res.writeHead(404, {"Content-type":"text/html; charset=utf-8"});
                res.end(w.document.doctype + w.document.innerHTML);
            });
        } else {
            failure(req, res, "Server error");
            logger.error("Generic error", {err:err, stack:err.stack});
            next(err);
        }
    });

    return {
        listen: function (callback) {
            console.log("listening on " + options.serverPort);
            router.listen(options.serverPort);
        },
        close: function () {
            router.close();
        }
    };
};



exports.server = makeServer;




