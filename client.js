/* Modules */
var jsdom = require("jsdom");
var fs = require("fs");
var sys = require("util");
var X = require("./XMLHttpRequest.js");
var underscore = require("./public/vendor/underscore.js");

var XMLHttpRequest = X.XMLHttpRequest;
//global.XMLHttpRequest = X.XMLHttpRequest;

var content = {
    scripts: [
        fs.readFileSync("./public/vendor/jquery-1.7.1.min.js"),
        fs.readFileSync("./public/vendor/underscore.js"),
        fs.readFileSync("./public/vendor/timo-0.0.2.js"),
        fs.readFileSync('./public/model.js'),
        fs.readFileSync('./public/controller.js')
    ]
};

var loadCompleted = function (window) {
    var $ = window.$;
    var model = window.model;
    var controller = window.controller;
    var timo = window.timo;
    var m = model($("#countdownlist"), $("head"), timo.noCounterType);
    var c = controller(m, "http://localhost:55555");

    window.m = m;
    window.c = c;
    window.console = console;

    return window;
};

var load = function (completed, html) {
    process.nextTick(function () {

        var client = jsdom.jsdom(html, null, {
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


// Create the normal DOM - for viewing countdowns
load(function (window) {
    exports.countdownClientWindow = loadCompleted(window);
}, underscore.template(fs.readFileSync("./index.html").toString(),
    {   "header" : fs.readFileSync("./header.html").toString(),
        "content" : fs.readFileSync("./countdowns.html").toString(),
        "footer" : fs.readFileSync("./footer.html").toString(),
        "css" : "/public/whenis.css"
    }
));

// Create the DOM for the addpage
load(function (window) {
    exports.addWindow = loadCompleted(window);
}, underscore.template(fs.readFileSync("./index.html").toString(),
    {   "header" : fs.readFileSync("./header.html").toString(),
        "content" : fs.readFileSync("./add.html").toString(),
        "footer" : fs.readFileSync("./footer.html").toString(),
        "css" : "/public/whenis.css"
    }
));

// Create the headless DOM
load(function (window) {
    exports.headlessWindow = loadCompleted(window);
}, underscore.template(fs.readFileSync("./index.html").toString(),
    {   "header" : "",
        "content" : fs.readFileSync("./countdowns.html").toString(),
        "footer" : '<footer>Brought to you by <a href="http://www.whenis.co.za">When Is</a></footer>',
        "css" : "/public/whenis-headless.css"
    }
));

exports.countdowns = function (req, resp, sendClient) {
    sendClient(resp, this.countdownClientWindow);
};

exports.add = function (req, resp, sendClient) {
    sendClient(resp, this.addWindow);
};

exports.headless = function (req, resp, sendClient) {
  sendClient(resp, this.headlessWindow);
};
