/* Modules */
var jsdom = require("jsdom");
var fs = require("fs");
var sys = require("util");
var X = require("./XMLHttpRequest.js");
var XMLHttpRequest = X.XMLHttpRequest;
//global.XMLHttpRequest = X.XMLHttpRequest;

var content = {
    html: fs.readFileSync("./index.html").toString(),
    scripts: [
        fs.readFileSync("./public/vendor/jquery-1.7.1.min.js"),
        fs.readFileSync("./public/vendor/underscore.js"),
        fs.readFileSync('./public/timo/led.js'),
        fs.readFileSync('./public/timo/timer.js'),
        fs.readFileSync('./public/timo/countdown.js'),
        fs.readFileSync('./public/timo/times.js'),
        fs.readFileSync('./public/model.js'),
        fs.readFileSync('./public/controller.js')
    ]
};

var loadCompleted = function (window) {
    var $ = window.$;
    var model = window.model;
    var controller = window.controller;
    var m = model($("#countdownlist"), $("head"));
    var c = controller(m, "http://localhost:55555");

    console.log(c);

    window.m = m;
    window.c = c;
    window.console = console;

    exports.window = window;
};

var load = function (completed) {
    process.nextTick(function () {

        var client = jsdom.jsdom(content.html, null, {
            // set features to false to parse initial html
            features: {
                'FetchExternalResources':false,
                'ProcessExternalResources':false
            }
        });
        
        var w = client.createWindow();
        w.console = console;
        w.XMLHttpRequest = XMLHttpRequest;

        // reset features for loading
        w.document.implementation.addFeature("FetchExternalResources", ["script"]);
        w.document.implementation.addFeature("ProcessExternalResources", ["script"]);

        var scriptsDone = 0;
        var totalScripts = content.scripts.length;
        var scriptLoaded = function () {
            scriptsDone++;
            if (scriptsDone >= totalScripts) {
                completed(w);
            }
        };

        content.scripts.forEach(function (s) {
            var script = w.document.createElement("script");
            script.onload = function () {
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
    });
};

load(loadCompleted);

exports.client = function (req, resp, makeClient) {
    makeClient(resp, this.window);
};
