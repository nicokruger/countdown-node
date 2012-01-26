
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
        if(lastAction !== undefined) {
                lastAction.url = urlCreator( getLastParts(lastAction.url));
            }
            if(lastAction === undefined) {
                lastAction = {url: urlCreator( getLastParts(window.location.pathname)),
                              data: {},
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
                }
                if (isArray(o)) {
                    if(config.ogp === undefined) {
                        model.putCountdowns(o);
                    } else {
                        model.putCountdownOGP(o[0]);
                    }
                } else {
                    model.putCountdown(o);
                }
                if (config.success !== undefined) {
                    config.success(o);
                }
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

    return {
        clear: function (e) {
            model.clear();
            $("head > meta").remove(); // clear all meta tags
        },
        random: function (callback, failure) {
            countdownAction({url: "/random",
                             data: {},
                             method: "GET",
                             success: callback,
                             failure: failure
                            });
        },
        nextDay: function (callback, failure) {
            lastAction = {url:"/day", data:{}, method:"GET", success:callback, failure:failure};
            countdownAction(lastAction);
        },
        nextWeek: function (callback, failure) {
            lastAction = {url:"/week", data:{}, method:"GET", success:callback, failure:failure};
            countdownAction(lastAction);
        },
        nextMonth: function (callback, failure) {
            lastAction = {url:"/month", data:{}, method: "GET", success: callback, failure:failure};
            countdownAction(lastAction);
        },
        nextWeekend: function (callback, failure) {
            lastAction = {url: "/weekend", data:{}, method:"GET", success: callback, failure: failure};
            countdownAction(lastAction);
        },
        nextYear: function (callback, failure) {
            lastAction = {url : "/year", data: {}, method: "GET", success: callback, failure: failure};
            countdownAction(lastAction);
        },
        search: function(data) {
            lastAction = {url: "/countdowns", data: data, method: "GET"};
            countdownAction(lastAction);
        },
        countdown: function (id, callback, failure) {
            countdownAction({url:"?" + id, data: {}, method:"GET", success: callback, failure: failure, ogp: true});
        },
        
        newCountdown:  function (data, callback, failure) {
            countdownAction({
                url: "/insert",
                data:data,
                method: "POST",
                success: callback,
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
        messages: model.messages,
        countdownAction: countdownAction
    };
};

if (typeof(exports) !== "undefined") {
    exports.controller = controller;
}


