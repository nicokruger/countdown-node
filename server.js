var fs = require("fs");
var client = require("./client");
var bee = require("beeline");
var nodeStatic = require("node-static");
var http = require("http");
var controller = require("./public/controller.js").controller;
//var timo = require("./public/controller.js").controller;

var error404 = fs.readFileSync("404.html").toString();
var error503 = fs.readFileSync("503.html").toString();
var addHtml = fs.readFileSync("add.html").toString();

// Static file server
var file = new (nodeStatic.Server)("./");


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


// Router
var router = bee.route({
    "r`^/public.*`" : function(req,res) {
        file.serve(req,res);
    },
    "r`^/$`" : function (req,res) {
        client.client(req, res, putCountdowns(function (c) {
            return function (callback) {
                c.nextWeek(callback);
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
        client.client(req, res, putCountdowns(function (c) {
            return function (callback) {
                c.nextWeek(callback);
            };
        }));
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
        client.client(req, res, putCountdowns(function (c) {
            return function (callback) {
                c.random(callback);
            };
        }));
    },
    "r`/tags/(.+)`": function (req, res, matches) {
        client.client(req, res, putCountdowns(function (c) {
            return function (callback) {
                c.search({"tags" : matches[0]}, callback);
            };
        }));
    },
    "r`/(.+)`" : function (req, res, matches) {
        var id = matches[0];
        client.client(req, res, putCountdowns(function (c) {
            return function (callback, failure) {
                c.countdown(id, callback, failure);
            };
        }));
    },

    "`404`" : function (req,res) {
        file.serveFile("/404.html", 404, {}, req, res);
    },

    "`503`" : function (req,res,err) {
        console.error(err.stack);
        file.serveFile("/503.html", 503, {}, req, res);
    }
});

http.createServer(router).listen(8080, "127.0.0.1");

