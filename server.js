var fs = require("fs");
var client = require("./client");
var bee = require("beeline");
var nodeStatic = require("node-static");
var http = require("http");

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
    console.log("In putMongoCountdowns");
    window.m.putCountdowns(data);
    resp.writeHead(200, {"Content-type":"text/html"});
    resp.end(window.document.innerHTML);
    console.log("fsdafasd");
};
	

// Router
var router = bee.route({
	"r`^/public.*`" : function(req,res) {
		file.serve(req,res);
	},
	"r`^/$`" : function (req,res) {
		console.log("Month");
		client.client(req, res, putCountdowns(function (c) {
			return function (callback) {
				c.nextMonth(callback);
			};
		}));
	},

	"/add" : function (req, res) {
		res.writeHead(200, {"Content-type":"text/html"});
		res.end(addHtml);
	},

	"/day" : function (req,res) {
		client.client(req, res, putCountdowns(function (c) {
			return function (callback) {
				c.nextDay(callback);
			};
		}));
	},
	"/week" : function (req,res) {
	        client.client(req, res, function(r,w) {
		    countdownProvider.week(function(data){
			    putMongoCountdowns(data, r, w);
		    });
		 });
	},
	"/month" : function (req,res) {
		client.client(req, res, putCountdowns(function (c) {
			return function (callback) {
				c.nextMonth(callback);
			};
		}));
	},
	"/year" : function (req,res) {
		client.client(req, res, putCountdowns(function (c) {
			return function (callback) {
				c.nextYear(callback);
			};
		}));
	},
	"/random" : function (req,res) {

		//	client.client(req, res, putCountdowns(function (c) {
		//	return function (callback) {
		//		c.random(callback);
		//	};
		// }));
	},
	"r`/(.+)`" : function (req, res, matches) {
		var id = matches[0];

		client.client(req, res, function(r,w) {
			countdownProvider.retrieveById(id, function(data){
				putMongoCountdowns(data, r, w);
			    });
		});
	},

	"`404`" : function (req,res) {
		file.serveFile("/404.html", 404, {}, req, res);
	},

	"`503`" : function (req,res,err) {
		console.log("matched 503 because:");
		console.error(err.stack);
		file.serveFile("/503.html", 503, {}, req, res);
	}
});
http.createServer(router).listen(8080, "127.0.0.1");

