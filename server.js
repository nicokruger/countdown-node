var fs = require("fs");
var url = require("url");
var nodeStatic = require("node-static");
var express = require('express');
var winston = require("winston");
var underscore = require("./public/vendor/underscore.js");

var client = require("./js/client");
var controller = require("./public/controller.js").controller;
var CountdownProvider = require("./js/countdown_provider").CountdownProvider;

// Special NotFound exception for 404's
function NotFound(msg){
  this.name = 'NotFound';
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
}
NotFound.prototype.__proto__ = Error.prototype;
var error404 = fs.readFileSync("html/404.html").toString();
var error503 = fs.readFileSync("html/503.html").toString();
var addHtml = fs.readFileSync("html/add.html").toString();


//pagination limit and initial query marker
var defaultLimit = 4,
    defaultLast = {name: ' ', eventDate: new Date()};

// http router
var router = express.createServer();
// Static file server
var file = new (nodeStatic.Server)("./");
// countdowns from mongo!!
var countdownProvider = new CountdownProvider("localhost", 27017);

// winston logging
var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({ timestamp: true }),
      new (winston.transports.File)({ filename: 'whenis.log', timestamp: true, json:false })
    ]
  });

var request_logger = function (req, res, next) {
    logger.info("[REQ]", {url:req.url, ip:req.connection.remoteAddress});
    next();
};
// make winston pretty print stuff on console
//logger.cli();

var failure = function (req, resp, error) {
    var msg = ((typeof(error) !== "undefined" && error !== null) ? error.toString() : "");
    logger.error("When Is Failure", {req: req.url, error_s: msg, error: error});
    client.error503(req, resp, function (r,w) {
        var $ = w.$;
        $("#message").html(msg);
        r.writeHead(503, {"Content-type":"text/html"});
        r.end(w.document.innerHTML);
    });

};

var defaultTitle = "When Is - Release dates for games, movies, music and everything in between";
var createDom = function (data, resp, window, title){
    window.c.clear();
    if (typeof(title) === "undefined") {
        title = defaultTitle;
    }
    window.$('title').html(title);
    window.m.putCountdowns(data);
    resp.writeHead(200, {"Content-type":"text/html"});
    resp.end(window.document.innerHTML);
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
    var limit = req.query.limit === undefined? defaultLimit : req.query.limit;
    var last = defaultLast;
    if(req.query.eventDate !== undefined && req.query.name !== undefined){
        last = {name : req.query.name, eventDate: new Date( parseInt(req.query.eventDate, 10)) };
    }
    return {'last' : last, 'limit' : limit};
};
    
var defaultRoute = function(req, res){
    var skip = isNaN(parseInt(req.params.skip, 10)) ? 0 : parseInt(req.params.skip, 10),
        pagination = {limit: defaultLimit, skip: skip};
    console.log("default: " + req.is("application/json"));
    if(req.accepts('json')){
        countdownProvider.future(pagination, function(data){
            res.json({countdowns:data});
        }, underscore.bind(failure, undefined, req, res));
    }
    else {
        client.paginated(req, res, function(r,w) {
            countdownProvider.future(pagination, function(data){
                createDom(data, r, w);
            });
        }, underscore.bind(failure, undefined, req, res));
    }
};


router.configure( function(req,res) {
    router.use('/public', express.static('./public')); // static is a reserved word
    router.use(request_logger);
    router.use(express.bodyParser());
    router.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

});

router.get("/", defaultRoute);

router.get("/add", function (req, res) {
    client.add(req, res, function (r,w) {
        res.writeHead(200, {"Content-type":"text/html"});
        res.end(w.document.innerHTML);
    }, underscore.bind(failure, undefined, req, res));
});

router.get("/future/:skip?", defaultRoute);

router.get("/random/:something?", function (req,res) {
    if(req.is('application/json')){
        countdownProvider.random(function(data){
            res.json(data);
        }, underscore.bind(failure, undefined, req, res));
    }
    else {
        client.nonpaginated(req, res, function (r, w) {
            countdownProvider.random ( function(data) {
                createDom(data, r, w);
            });
        }, underscore.bind(failure, undefined, req, res));
    }
});
 
router.get("/tags/:tag/:skip?", function (req, res) {
    var skip = isNaN(parseInt(req.params.skip, 10)) ? 0 : parseInt(req.params.skip, 10),
        pagination = {limit: defaultLimit, skip: skip};
    var searchParams = {
        name: '',
        tags: [req.params.tag],
        start: new Date(),
        end: undefined
    };

    console.log("JSON: " + JSON.stringify(pagination));
    if(req.accepts('json')){
        countdownProvider.search(searchParams, pagination, function(data){
            res.json({countdowns:data});
        }, underscore.bind(failure, undefined, req, res));
    }
    else {
        client.paginated(req, res, function (r, w) {
            countdownProvider.search(searchParams, pagination, function(data){
                createDom(data, r, w, "When Is - #" + req.params.tag);
            });
        }, underscore.bind(failure, undefined, req, res));
    }

});

router.get("/countdowns/:skip?", function (req, res) {
    var parseTags = function(tagsString) {
        if(tagsString !== undefined) {
            return tagsString.split(',');
        }
        else return [];
    };
    console.log("Searching");
    var skip = isNaN(parseInt(req.params.skip, 10)) ? 0 : parseInt(req.params.skip, 10),
        pagination = {limit: defaultLimit, skip: skip};

    var params = {};
    params.name = req.query.name === undefined ? '' : req.query.name;
    
    params.tags = parseTags(req.query.tags);
    params.start = new Date(req.query.start === undefined ? (new Date().getTime()) : parseInt(req.query.start, 10));
    params.end = req.query.end === undefined ? undefined : new Date( parseInt(req.query.end, 10));
    if(req.accepts('json')){
        countdownProvider.search(params, pagination, function(data){
            res.json({countdowns:data});
        }, underscore.bind(failure, undefined, req, res));
    }
    else {
        req.writeHead(400, {"Content-type":"text/html"});
        req.end("Not valid");
    }
});

router.post('/upsert', function (req, res) {
    var countdown = countdownFromReq(req);
    countdownProvider.upsert(countdown, function(data) {
        res.json({countdown:data});
    }, underscore.bind(failure, undefined, req, res));
});

//scrapers should use this
router.post('/upsertmulti', function(req, res) {
    var countdowns = req.body.countdowns;
        //console.log("upserting " +JSON.stringify(countdowns));
        countdownProvider.upsertMulti(countdowns, function(data) {
            res.json(data);
        }, underscore.bind(failure, undefined, req, res));

});

router.post('/insert', function (req, res) {
    var countdown = countdownFromReq(req);
    countdownProvider.insert(countdown, function(data) {
        logger.info("Countdown added: " + data.name);
        res.json({countdown:data});
    }, underscore.bind(failure, undefined, req, res));
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

    // determine which client to use - normal or headless by looking at the headless query parameter
    if (typeof(query) === "undefined" || query["embedded"] !== "true") {
        client.nonpaginated(req, res, function(r,w) {
            countdownProvider.retrieveById(req.params.id, function(data){
                createDom(data, r, w, "When Is - " + data[0].name);
            }, underscore.bind(failure, undefined, req, res));
        });
    } else {
        client.headless(req, res, function(r,w) {
            countdownProvider.retrieveById(req.params.id, function(data){
                createDom(data, r, w, "When Is - " + data[0].name);
            }, underscore.bind(failure, undefined, req, res));
        });
    }
});

router.get("*", function (req,resp,err) { // fallback for 404's
    client.error404(req, resp, function (r,w) {
        r.writeHead(404, {"Content-type":"text/html"});
        r.end(w.document.innerHTML);
    });
});

router.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        // our special 404
        client.error404(req, res, function (r,w) {
            res.writeHead(404, {"Content-type":"text/html"});
            res.end(w.document.innerHTML);
        });
    } else {
        winston.error("Generic error", {err:req});
        next(err);
    }
});
router.listen(8080);




