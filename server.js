var fs = require("fs");
var client = require("./client");
//var bee = require("beeline");
var nodeStatic = require("node-static");
//var http = require("http");

var express = require('express');
var app = express.createServer();

var error404 = fs.readFileSync("404.html").toString();
var error503 = fs.readFileSync("503.html").toString();
var addHtml = fs.readFileSync("add.html").toString();

// Static file server
var file = new (nodeStatic.Server)("./");

var CountdownProvider = require("./countdown_provider").CountdownProvider;
var countdownProvider = new CountdownProvider("localhost", 27017);

var putCountdowns = function (controllerAction) {
    return function (resp, window) {
        window.c.clear();

        var success = function () {
            resp.writeHead(200, {"Content-type":"text/html"});
            resp.end(window.document.innerHTML);
        };
        var failure = function () {
            resp.writeHead(404, {"Content-type":"text/html"});
            resp.end(error404);
        };

        controllerAction(window.c)(success, failure);
    };
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
}

app.configure( function(req,res) {
	app.use('/public', express.static('./public'));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.get("/", function (req,res) {
	client.client(req, res, function(r,w) {
		countdownProvider.week(function(data){
			putMongoCountdowns(data, r, w);
		    });
	    });
    });

app.get("/add", function (req, res) {
	res.writeHead(200, {"Content-type":"text/html"});
	res.end(addHtml);
    });

app.get("/day", function (req,res) {
	client.client(req, res, function(r,w) {
		countdownProvider.day(function(data){
			putMongoCountdowns(data, r, w);
		    });
	    });
    });
app.get("/week", function (req,res) {
	client.client(req, res, function(r,w) {
		countdownProvider.week(function(data){
			putMongoCountdowns(data, r, w);
		    });
	    });
    });
app.get("/month", function (req,res) {
	client.client(req, res, function(r,w) {
		countdownProvider.month(function(data){
			putMongoCountdowns(data, r, w);
		    });
	    });

    });
app.get("/year", function (req,res) {
	client.client(req, res, function (r, w) {
		countdownProvider.year ( function(data) {
			putMongoCountdowns(data, r, w);
		    });
	    });
    });
app.get("/random", function (req,res) {
	client.client(req, res, function (r, w) {
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
    }),
app.post('/insert', function (req, res) {
	var countdown = countdownFromReq(req);
	countdownProvider.insert(countdown, function(data) {
		res.json(data);
	    });
   }),
app.get('/:id', function(req, res) {
	client.client(req, res, function(r,w) {
		countdownProvider.retrieveById(req.params.id, function(data){
			putMongoCountdowns(data, r, w);
		    }, function(error){
                        console.log("For the url " + req.url +" :" );  //stupid favicon.ico  - why?
                        console.error(error);
                    });
	    });
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

