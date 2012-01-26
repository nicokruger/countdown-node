
var controller = function (model, server) {
    
    server = server === undefined ? "" : server;
    var skipAmount = 4;
    var isArray = function(value) {
        return Object.prototype.toString.apply(value) == '[object Array]';
    };
    var getLastParts = function(path){
        if(path == "/") return {path: "future", skip: 0 };
        var parts = path.split('/').splice(1),
            pathname = parts[0],
            skip = (parts[1] === undefined ? 0 : parseInt(parts[1], 10));
        return {path: pathname, skip: skip};
    };
    
    //built-in way to do this?
    var createParamString = function(params){
        if(params === undefined) return "";
        var ps = "?", f;
        for (f in params){
            ps += (f + "=" + encodeURIComponent(params[f]) + "&");
        }
       // console.log("PARAM STRNIG: "+ ps);
        return ps;
    };

    var pagination = function( urlCreator ) {
        if(typeof(lastAction) !== "undefined") {
            lastAction.url = urlCreator( getLastParts(lastAction.url));
        } else {
            lastAction = {url: urlCreator( getLastParts(window.location.pathname)),
                          data: {},
                          success: addMultipleCountdowns(undefined, undefined),
                          failure: function (error) {
                                model.messages.error("Pagination error: " + error);
                          },
                          method: "GET"};
        }
        countdownAction(lastAction);
    };
    var lastAction;

    var countdownAction = function (config)  {
        console.log("Doing countdownAction " + server + config.url );
        $.ajax({
            url: server + config.url + createParamString(config.params),
            data: config.data,
            type: config.method,
            dataType: "json",
            success: function (o) {
                model.clear();
                if (o.hasOwnProperty("error")) {
                    if (config.failure !== undefined) {
                        config.failure(o.error);
                    }
                    console.log("Countdown error: " + o.error);
                    return;
                }

                config.success(o);
            },
            error: function (e) {
                model.messages.clear();
                model.messages.error("An error occurred. Please try again. If the problem persists, something is broken. We will fix it shortly.");
                if (typeof(config.failure) !== "undefined") {
                    config.failure(e);
                }
            }
        });
    };

    var addMultipleCountdowns = function (success, failure) {
        return function (o) {
            if (o.hasOwnProperty("countdowns")) {
                model.putCountdowns(o.countdowns);
                if (typeof(success) !== "undefined") {
                    success(o.countdowns);
                }
            } else {
                if (typeof(failure) !== "undefined") {
                    failure("No countdowns received.");
                } else {
                    model.messages.error("No countdowns received.");
                }
                console.log("No countdowns received.");
            }
        };
    };

    var addSingleCountdown = function (success, failure) {
        return function (o) {
            if (o.hasOwnProperty("countdown")) {
                model.putCountdownOGP(o.countdown);
                if (typeof(success) !== "undefined") {
                    success(o.countdown);
                }
            } else {
                if (typeof(failure) !== "undefined") {
                    failure("No countdown received.");
                } else {
                    model.messages.error("No countdown received.");
                }
                console.log("No countdown received.");
            }
        };
    };

    return {
        clear: function (e) {
            model.clear();
            $("head > meta").remove(); // clear all meta tags
        },
        random: function (callback, failure) {
            countdownAction({url: "/random",
                             data: {},
                             method: "GET",
                             success: addSingleCountdown(callback, failure),
                             failure: failure
                            });
        },
        search: function(data) {
            lastAction = {url: "/countdowns", data: data, method: "GET", success: addMultipleCountdowns(undefined,undefined)};
            countdownAction(lastAction);
        },
        countdown: function (id, callback, failure) {
            countdownAction({url:"?" + id, data: {}, method:"GET", success: addSingleCountdown(success, failure), failure: failure});
        },
        
        newCountdown:  function (data, callback, failure) {
            countdownAction({
                url: "/insert",
                data: data,
                method: "POST",
                success: addSingleCountdown(callback, failure),
                failure: failure
            });
        },
        next: function (callback, failure) {
            var getNewUrl = function(parts) {
                return "/" + parts.path + "/" + ( parts.skip + skipAmount );
            };
            pagination(getNewUrl);
        },
        prev: function(callback, failure) {
            var getNewUrl = function(parts) {
                var skip = parts.skip === 0? 0 : parts.skip - skipAmount;
                return "/" + parts.path + "/" + skip;
            };
            pagination(getNewUrl);
        },
        messages: model.messages
    };
};

if (typeof(exports) !== "undefined") {
    exports.controller = controller;
}


