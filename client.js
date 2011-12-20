/* Modules */
var jsdom = require("jsdom");
var fs = require("fs");

var content = {
	html: fs.readFileSync("./index.html").toString(),
	scripts: [
		fs.readFileSync("./public/vendor/jquery-1.6.2.min.js"),
		fs.readFileSync("./public/vendor/underscore.js"),
		fs.readFileSync('./public/timo/led.js'),
		fs.readFileSync('./public/timo/timer.js'),
		fs.readFileSync('./public/timo/countdown.js'),
		fs.readFileSync('./public/timo/times.js'),
		fs.readFileSync('./public/model.js')
	]
};

/*	var appScripts = [
		"./public/vendor/jquery-1.6.2.min.js",
		"./public/vendor/underscore.js",
		'./public/timo/led.js',
		'./public/timo/timer.js',
		'./public/timo/countdown.js',
		'./public/timo/times.js',
		'./public/model.js'
	];

	var html = "./index.html"; //fs.readFileSync("index.html").toString(),
*/

var x = function (req, resp, completed) {
	process.nextTick(function () {


		var client = jsdom.jsdom(content.html, null, {
			// set features to false to parse initial html
			features: {
				'FetchExternalResources':false,
				'ProcessExternalResources':false
			}
		});
		
		var w = client.createWindow();

		// reset features for loading
		w.document.implementation.addFeature("FetchExternalResources", ["script"]);
		w.document.implementation.addFeature("ProcessExternalResources", ["script"]);

		var scriptsDone = 0;
		var totalScripts = content.scripts.length;
		var scriptLoaded = function () {
			scriptsDone++;
			if (scriptsDone >= totalScripts) {
				completed(resp, w);
			}
		};

		content.scripts.forEach(function (s) {
			console.log("script!");
			var script = w.document.createElement("script");
			script.onload = function () {
				console.log("script loaded!");
				scriptLoaded();
			};
			script.onerror = function () {
				console.log("script error!");
				scriptLoaded();
			};

			//console.log("Source: " + s);
			script.text = s;
			w.document.documentElement.appendChild(script);
			w.document.documentElement.removeChild(script);
		});

		client = undefined; // help v8 GC?
	});
};

exports.client = x;
