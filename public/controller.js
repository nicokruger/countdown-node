
var controller = function (model, server) {
    
    server = server === undefined ? "" : server;

    var isArray = function(value) {
        return Object.prototype.toString.apply(value) == '[object Array]';
    };
    var parseLast = function(){
        var lastName = $('#countdownlist li:last-child > .countdown-name > a').text();
        var lastMillis = $('#countdownlist li:last-child > .countdown-counter').attr('data-eventdate');
       // console.log(lastName + " " + lastMillis);
        return {name: lastName, eventDate: parseInt(lastMillis, 10)};
    };
    // var parseFirst = function(){
    //     var firstName = $('#countdownlist li:first-child > .countdown-name > a').text();
    //     var firstMillis = $('#countdownlist li:first-child > .countdown-counter').attr('data-eventdate');
    //     console.log(firstName + " " + firstMillis);
    //     return {name: firstName, eventDate: parseInt(firstMillis, 10)};
    // };

    // var getPath = function(q){
    //     return q.substring(0, q.indexOf('?'));
    // };
    
    //built-in way to do this?
    var createParamString = function(params){
        if(params === undefined) return "";
        var ps = "?",
            f;       
        for (f in params){
            ps += (f + "=" + encodeURIComponent(params[f]) + "&");
        }
       // console.log("PARAM STRNIG: "+ ps);
        return ps;
    };

    var lastAction = undefined;

    var countdownAction = function (config)  {
        console.log("Doing countdownAction " + server + config.url );
        $.ajax({
            url: server + config.url + createParamString(config.params),
            //url: "http://localhost:55555/filesystem/index.html",
            data: config.data,
            type: config.method,
            dataType: "json",
            beforeSend: function( xhr ) {
                xhr.setRequestHeader('Content-Type', 'application/json');
            },
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
                model.messages.error("An error occurred. Please try again. If the problem persists, something is broken. We will fix it shortly.");
                console.error(e);
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
            // contentType: "application/json",
            var action = {url: "/insert", data: data, method: "POST", success: callback, failure: failure};
            countdownAction(action);
        },
        next: function (callback, failure) {
            var last = parseLast();
            if(lastAction !== undefined) {
                lastAction.params = last;      
            }
            else {
                console.log("PATH NAME IS "+ window.location.pathname);
                lastAction = {url: window.location.pathname,
                              data: {},
                              params: last,
                              method: "GET"};
            }
            countdownAction(lastAction);

        },
        prev: function(callback, failure) {
            //var first = parseFirst();
        },
        messages: model.messages,
        countdownAction: countdownAction
    };
};

if (typeof(exports) !== "undefined") {
    exports.controller = controller;
}


