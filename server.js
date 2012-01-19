var fs = require("fs");
var url = require("url");
var client = require("./client");
//var bee = require("beeline");
var nodeStatic = require("node-static");
var http = require("http");
var controller = require("./public/controller.js").controller;
var underscore = require("./public/vendor/underscore.js");
var express = require('express');
var app = express.createServer();

var error404 = fs.readFileSync("404.html").toString();
var error503 = fs.readFileSync("503.html").toString();
var addHtml = fs.readFileSync("add.html").toString();

// Static file server
var file = new (nodeStatic.Server)("./");

var CountdownProvider = require("./countdown_provider").CountdownProvider;
var countdownProvider = new CountdownProvider("localhost", 27017);

var failure = function (req, resp, error) {
    console.log("For the url " + req.url +" :" );
    console.error("Error: " + error);
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
app.configure( function(req,res) {
	app.use('/public', express.static('./public')); // static is a reserved word
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.get("/", function (req,res) {
	client.countdowns(req, res, function(r,w) {
		countdownProvider.week(function(data){
			putMongoCountdowns(data, r, w);
        });
    });
});

app.get("/add", function (req, res) {
    client.add(req, res, success);
});

app.get("/day", function (req,res) {
	client.countdowns(req, res, function(r,w) {
		countdownProvider.day(function(data){
			putMongoCountdowns(data, r, w);
        });
    });
});

app.get("/week", function (req,res) {
	client.countdowns(req, res, function(r,w) {
		countdownProvider.week(function(data){
			putMongoCountdowns(data, r, w);
        });
    });
});
app.get("/month", function (req,res) {
	client.countdowns(req, res, function(r,w) {
		countdownProvider.month(function(data){
			putMongoCountdowns(data, r, w);
		});
	});
});
app.get("/year", function (req,res) {
	client.countdowns(req, res, function (r, w) {
		countdownProvider.year ( function(data) {
			putMongoCountdowns(data, r, w);
		});
	});
});
app.get("/random", function (req,res) {
	client.countdowns(req, res, function (r, w) {
		countdownProvider.random ( function(data) {
			putMongoCountdowns(data, r, w);
		});
	});
});
app.get("/countdowns", function (req, res) {
        
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
        //not handled atm
	}
});

app.post('/upsert', function (req, res) {
	var countdown = countdownFromReq(req);
    console.log('upserting '+ countdown.eventDate.getTime());
    countdownProvider.upsert(countdown, function(data) {
		res.json(data);
    });
});

app.post('/insert', function (req, res) {
	var countdown = countdownFromReq(req);
	countdownProvider.insert(countdown, function(data) {
		res.json(data);
	});
});

app.get("/favicon.ico", function (req,res) {
    file.serve(req,res);
});

app.get("/robots.txt", function (req,res) {
    file.serve(req,res);
});

app.get('/:id', function(req, res) {
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

app.get("`404`", function (req,res) {
    file.serveFile("/404.html", 404, {}, req, res);
});

app.get("`503`", function (req,res,err) {
	console.log("matched 503 because:");
	console.error(err.stack);
	file.serveFile("/503.html", 503, {}, req, res);
});
   
app.listen(8080);

