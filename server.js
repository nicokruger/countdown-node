var client = require("./client");
var bee = require("beeline");
var nodeStatic = require("node-static");
var http = require("http");

// Static file server
var file = new (nodeStatic.Server)("./");

var makeClient = function (resp, window) {
	console.log("done");
	console.log("Model: " + window.model);
	var model = window.model;
	var $ = window.$;
	var m = model($("#countdownlist"));

	for (var i = 0; i < 20; i++) {
		console.log("countdown: " + i);
		m.putCountdown({url:"URL" + i, name: "Countdown" + i, eventDate:0, tags:[]});
	}

	resp.writeHead(200, {"Content-type":"text/html"});
	resp.end(window.document.innerHTML);
	
	window = undefined;  // help v8 GC?
	
};


// Router
var router = bee.route({
	"r`^/public.*`" : function(req,res) {
		file.serve(req,res);
	},
	"r`^/$`" : function (req,res) {
		client.client(req,res, makeClient);
	},

	"`404`" : function (req,res) {
		file.serveFile("/404.html", 404, {}, req, res);
	},

	"`503`" : function (req,res) {
		file.serveFile("/503.html", 503, {}, req, res);
	}
});

http.createServer(router).listen(8080, "127.0.0.1");

