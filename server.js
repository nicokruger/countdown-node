var fs = require("fs");
var url = require("url");
var nodeStatic = require("node-static");
var express = require('express');
var winston = require("winston");
var underscore = require("./public/vendor/underscore.js");

var client = require("./client");
var controller = require("./public/controller.js").controller;
var CountdownProvider = require("./countdown_provider").CountdownProvider;

// Special NotFound exception for 404's
function NotFound(msg){
  this.name = 'NotFound';
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
}
NotFound.prototype.__proto__ = Error.prototype;
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
    logger.error("When Is Failure", {req: req.url, error_s: error.toString(), error: error});
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
    }, underscore.bind(failure, undefined, req, res));
});

router.get("/add", function (req, res) {
    client.add(req, res, success);
});

router.get("/day", function (req,res) {
	client.countdowns(req, res, function(r,w) {
		countdownProvider.day(function(data){
			putMongoCountdowns(data, r, w);
        });
    }, underscore.bind(failure, undefined, req, res));
});

router.get("/week", function (req,res) {
	client.countdowns(req, res, function(r,w) {
		countdownProvider.week(function(data){
			putMongoCountdowns(data, r, w);
        });
    }, underscore.bind(failure, undefined, req, res));
});
router.get("/month", function (req,res) {
	client.countdowns(req, res, function(r,w) {
		countdownProvider.month(function(data){
			putMongoCountdowns(data, r, w);
		});
	}, underscore.bind(failure, undefined, req, res));
});
router.get("/year", function (req,res) {
	client.countdowns(req, res, function (r, w) {
		countdownProvider.year ( function(data) {
			putMongoCountdowns(data, r, w);
		});
	}, underscore.bind(failure, undefined, req, res));
});
router.get("/random", function (req,res) {
	client.countdowns(req, res, function (r, w) {
		countdownProvider.random ( function(data) {
			putMongoCountdowns(data, r, w);
		});
	}, underscore.bind(failure, undefined, req, res));
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
        }, underscore.bind(failure, undefined, req, res));
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
    }, underscore.bind(failure, undefined, req, res));
});

router.post('/insert', function (req, res) {
	var countdown = countdownFromReq(req);
	countdownProvider.insert(countdown, function(data) {
		res.json(data);
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
        next(err);
    }
});
router.listen(8080);

