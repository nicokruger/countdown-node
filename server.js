var fs = require("fs");
var url = require("url");
var nodeStatic = require("node-static");
var express = require('express');
var winston = require("winston");
var underscore = require("./public/vendor/underscore.js");

var client = require("./client");
var controller = require("./public/controller.js").controller;
var CountdownProvider = require("./countdown_provider").CountdownProvider;

var error404 = fs.readFileSync("404.html").toString();
var error503 = fs.readFileSync("503.html").toString();
var addHtml = fs.readFileSync("add.html").toString();

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
// make winston pretty print stuff on console
logger.cli();

var failure = function (req, resp, error) {
    logger.error("When Is Failure", {req: req.url, error: error});
    client.error503(req, resp, function (r,w) {
        var $ = w.$;
        $("#message").html(error.toString());
        r.writeHead(503, {"Content-type":"text/html"});
        r.end(w.document.innerHTML);
    });

};

var putMongoCountdowns = function (data, resp, window){
    window.c.clear();
    window.m.putCountdowns(data);
    resp.writeHead(200, {"Content-type":"text/html"});
    resp.end(window.document.innerHTML);
};

var parseTags = function(tagsString) {
    if(tagsString !== undefined) {
        return tagsString.split(',');
    }
    else return [];
};

var countdownFromReq = function(req){
    var countdown = {};
	countdown.tags = parseTags(req.query.tags);
	countdown.name = req.query.name === undefined ? 'no-name' : req.query.name;
	countdown.eventDate = new Date(req.query.eventDate === undefined ? 0 : parseInt(req.query.eventDate, 10));
    return countdown;
};

/**
    "r`/tags/(.+)`": function (req, res, matches) {
        client.countdowns(req, res, putCountdowns(function (c) {
            return function (callback) {
                c.search({"tags" : matches[0]}, callback);
            };
        }));
    },
*/
router.configure( function(req,res) {
	router.use('/public', express.static('./public')); // static is a reserved word
	router.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

router.get("/", function (req,res) {
	client.countdowns(req, res, function(r,w) {
		countdownProvider.week(function(data){
			putMongoCountdowns(data, r, w);
        });
    });
});

router.get("/add", function (req, res) {
    client.add(req, res, success);
});

router.get("/day", function (req,res) {
	client.countdowns(req, res, function(r,w) {
		countdownProvider.day(function(data){
			putMongoCountdowns(data, r, w);
        });
    });
});

router.get("/week", function (req,res) {
	client.countdowns(req, res, function(r,w) {
		countdownProvider.week(function(data){
			putMongoCountdowns(data, r, w);
        });
    });
});
router.get("/month", function (req,res) {
	client.countdowns(req, res, function(r,w) {
		countdownProvider.month(function(data){
			putMongoCountdowns(data, r, w);
		});
	});
});
router.get("/year", function (req,res) {
	client.countdowns(req, res, function (r, w) {
		countdownProvider.year ( function(data) {
			putMongoCountdowns(data, r, w);
		});
	});
});
router.get("/random", function (req,res) {
	client.countdowns(req, res, function (r, w) {
		countdownProvider.random ( function(data) {
			putMongoCountdowns(data, r, w);
		});
	});
});
router.get("/countdowns", function (req, res) {
        
	var params = {};
	params.name = req.query.name === undefined ? '' : req.query.name;
    
	params.tags = parseTags(req.query.tags);
	params.start = new Date(req.query.start === undefined ? 0 : parseInt(req.query.start, 10));
	params.end = req.query.end === undefined ? undefined : new Date( parseInt(req.query.end, 10));

	if(req.is('application/json')){
        countdownProvider.search(params, function(data){
            res.json(data);
        });
	}
	else {
        r.writeHead(400, {"Content-type":"text/html"});
        r.end("Not valid");
	}
});

router.post('/upsert', function (req, res) {
	var countdown = countdownFromReq(req);
    logger.info('upserting ' + countdown.eventDate.getTime());
    countdownProvider.upsert(countdown, function(data) {
		res.json(data);
    });
});

router.post('/insert', function (req, res) {
	var countdown = countdownFromReq(req);
	countdownProvider.insert(countdown, function(data) {
		res.json(data);
	});
});

router.get("/favicon.ico", function (req,res) {
    file.serve(req,res);
});

router.get("/robots.txt", function (req,res) {
    file.serve(req,res);
});

router.get('/:id', function(req, res) {
    var id =req.params.id;
    var query = url.parse(req.url,true).query;

    // determine which client to use - normal or headless by looking at the headless query parameter
    if (typeof(query) === "undefined" || query["embedded"] !== "true") {
        client.countdowns(req, res, function(r,w) {
            countdownProvider.retrieveById(req.params.id, function(data){
                putMongoCountdowns(data, r, w);
            }, underscore.bind(failure, undefined, req, res));
        });
    } else {
        client.headless(req, res, function(r,w) {
            countdownProvider.retrieveById(req.params.id, function(data){
                putMongoCountdowns(data, r, w);
            }, underscore.bind(failure, undefined, req, res));
        });
    }
});

router.get("`404`", function (req,res) {
    file.serveFile("/404.html", 404, {}, req, res);
});

router.get("`503`", function (req,res,err) {
	logger.error("matched 503 because:", {err: err});
	file.serveFile("/503.html", 503, {}, req, res);
});
   
router.listen(8080);

