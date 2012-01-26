/* Modules */
var jsdom = require("jsdom");
var fs = require("fs");
var sys = require("util");
var X = require("./XMLHttpRequest.js");
var underscore = require("./public/vendor/underscore.js");

var XMLHttpRequest = X.XMLHttpRequest;
//global.XMLHttpRequest = X.XMLHttpRequest;

var loadCompleted = function (window) {
    var $ = window.$;
    var model = window.model;
    var controller = window.controller;
    var timo = window.timo;
    var m = model($("#countdownlist"), $("head"), {counterType: timo.noCounterType});
    var c = controller(m, "http://localhost:8080");

    window.m = m;
    window.c = c;
    window.console = console;

    return window;
};

var createPage = function (completed, html, scripts) {
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
        var totalScripts = scripts.length;
        var scriptLoaded = function () {
            scriptsDone++;
            if (scriptsDone >= totalScripts) {
                completed(w);
            }
        };

        scripts.forEach(function (s) {
            var script = w.document.createElement("script");
            script.onload = function () {
                scriptLoaded();
            };
            script.onerror = function () {
                scriptLoaded();
            };

            //console.log("Source: " + s);
            script.text = s;
            w.document.documentElement.appendChild(script);
            w.document.documentElement.removeChild(script);
        });
    });
};

var scripts = [
    fs.readFileSync("./public/vendor/jquery-1.7.1.min.js"),
    fs.readFileSync("./public/vendor/underscore.js"),
    fs.readFileSync("./public/vendor/timo-0.0.2.js"),
    fs.readFileSync('./public/model.js'),
    fs.readFileSync('./public/controller.js')
];

// Create the normal DOM - for viewing countdowns
createPage(function (window) {
    exports.paginatedClientWindow = loadCompleted(window);
}, underscore.template(fs.readFileSync("./index.html").toString(),
    {   "header" : fs.readFileSync("./header.html").toString(),
        "content" : fs.readFileSync("./countdowns.html").toString(),
        "pagination" : fs.readFileSync("./pagination.html").toString(),
        "footer" : fs.readFileSync("./footer.html").toString(),
        "css" : "/public/whenis.css",
        "indexjs": "/public/index.js"
    }
), scripts);

createPage(function (window) {
    exports.nonpaginatedClientWindow = loadCompleted(window);
}, underscore.template(fs.readFileSync("./index.html").toString(),
    {   "header" : fs.readFileSync("./header.html").toString(),
        "content" : fs.readFileSync("./countdowns.html").toString(),
        "pagination" : '',
        "footer" : fs.readFileSync("./footer.html").toString(),
        "css" : "/public/whenis.css",
        "indexjs": "/public/index.js"
    }
), scripts);
// Create the DOM for the addpage
createPage(function (window) {
    exports.addWindow = loadCompleted(window);
}, underscore.template(fs.readFileSync("./index.html").toString(),
    {   "header" : fs.readFileSync("./header.html").toString(),
        "content" : fs.readFileSync("./add.html").toString(),
        "pagination" : '<div></div>',
        "footer" : fs.readFileSync("./footer.html").toString(),
        "css" : "/public/whenis.css",
        "indexjs" : "/public/add.js"
    }
), scripts);

// Create the headless DOM
createPage(function (window) {
    exports.headlessWindow = loadCompleted(window);
}, underscore.template(fs.readFileSync("./index.html").toString(),
    {   "header" : "",
        "content" : fs.readFileSync("./countdowns.html").toString(),
        "pagination" : '<div></div>',
        "footer" : '<footer>Brought to you by <a href="http://www.whenis.co.za">When Is</a></footer>',
        "css" : "/public/whenis-headless.css",
        "indexjs" : "/public/index.headless.js"
    }
), scripts);

// Create the 503 DOM
createPage(function (window) {
    exports.error503Window = loadCompleted(window);
}, underscore.template(fs.readFileSync("./index.html").toString(),
    {   "header" : fs.readFileSync("./header.html").toString(),
        "content" : fs.readFileSync("./503.html").toString(),
        "pagination" : '<div></div>',
        "footer" : fs.readFileSync("./footer-contact.html").toString(),
        "css" : "/public/whenis.css",
        "indexjs": "/public/index.js"
    }
), scripts);

// Create the 404 DOM
createPage(function (window) {
    exports.error404Window = loadCompleted(window);
}, underscore.template(fs.readFileSync("./index.html").toString(),
    {   "header" : "",
        "content" : fs.readFileSync("./404.html").toString(),
        "pagination" : '<div></div>',
        "footer" : fs.readFileSync("./footer-contact.html").toString(),
        "css" : "/public/whenis.css",
        "indexjs": "/public/index.js"
    }
), scripts);

exports.paginated = function (req, resp, sendClient) {
    sendClient(resp, this.paginatedClientWindow);
};

exports.nonpaginated = function (req, resp, sendClient) {
    sendClient(resp, this.nonpaginatedClientWindow);
};

exports.add = function (req, resp, sendClient) {
    sendClient(resp, this.addWindow);
};

exports.headless = function (req, resp, sendClient) {
    sendClient(resp, this.headlessWindow);
};

exports.error503 = function (req, resp, sendClient) {
    sendClient(resp, this.error503Window);
};

exports.error404 = function (req, resp, sendClient) {
    sendClient(resp, this.error404Window);
};