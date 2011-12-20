/* Modules */
var jsdom = require("jsdom");
var fs = require("fs");
var http = require("http");
var nodeStatic = require("node-static");
var bee = require("beeline");

// Static file server
var file = new (nodeStatic.Server)("./");

var x = function (req, resp) {
	console.log("run1");

	var appScripts = [
		"./public/vendor/jquery-1.6.2.min.js",
		"./public/vendor/underscore.js",
		'./public/timo/led.js',
		'./public/timo/timer.js',
		'./public/timo/countdown.js',
		'./public/timo/times.js',
		'./public/model.js'
	];

	console.log("run2");

	jsdom.env({
			html: fs.readFileSync("index.html").toString(),
			scripts: appScripts
		},
		function (errors,window) {
			console.log("Errors: " + errors + " - " + window.$ + " - " + window.model);
			var $ = window.$;
			var model = window.model;
			window.console = console;

			//$.ajax

			//var m = model($("#countdownlist"));
			console.log("----" + model);

			var m = model($("#countdownlist"));
			console.log("B: " + m.putCountdown);

			for (var i = 0; i < 10; i++) {
				console.log("Adding: " + i + " - " + m);
				m.putCountdown({url:"URL" + i, eventDate: 0, name: "Counter" + i, tags:[]});
			}
			
			resp.writeHead(200, {"Content-type":"text/html"});
			resp.end(window.document.innerHTML);
	});
};

// Router
var router = bee.route({
	"r`^/public.*`" : function(req,res) {
		console.log("serve public");
		file.serve(req,res);
	},
	"r`^/$`" : function (req,res) {
		console.log("client");
		x(req,res);
	},

	"`404`" : function (req,res) {
		console.log("serve 404");
		file.serveFile("/404.html", 404, {}, req, res);
	},

	"`503`" : function (req,res) {
		console.log("serve 503");
		file.serveFile("/503.html", 503, {}, req, res);
	}
});

http.createServer(router).listen(8080, "127.0.0.1");

