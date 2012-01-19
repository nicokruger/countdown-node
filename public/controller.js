
var controller = function (model, server) {
    server = server === undefined ? "" : server;
    var isArray = function(value) {
        return Object.prototype.toString.apply(value) == '[object Array]';
    };

    var countdownAction = function (config)  {

        $.ajax({
            url: server + config.url,
            //url: "http://localhost:55555/filesystem/index.html",
            data: config.data,
            type: config.method,
            dataType: "json",
            beforeSend: function( xhr ) {
                xhr.setRequestHeader('Content-Type', 'application/json');
            },
            success: function (o) {
                console.log("Received response: " + JSON.stringify(o));
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
                $("#info").html("An error occurred... Please try again." + JSON.stringify(e));
                if (typeof(config.failure) !== "undefined") {
                    config.failure(e);
                }
            }
        });
    };

    return {
        clear: function (e) {
            model.clear();
            $("#info").html("");
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
        nextMonth: function (callback, failure) {
            countdownAction("/month", {}, "GET", callback, failure);
        },
        nextWeekend: function (callback, failure) {
            countdownAction("/weekend", {}, "GET", callback, failure);
        },
        nextYear: function (callback, failure) {
            countdownAction("/year", {}, "GET", callback, failure);
        },
        search: function(data, callback, failure) {
            countdownAction("/countdowns", data, "GET", callback, failure);
        },
        countdown: function (id, callback, failure) {
            countdownAction("?" + id, {}, "GET", callback, failure, true);
        },
        countdownAction: countdownAction

    };
};

if (typeof(exports) !== "undefined") {
    exports.controller = controller;
}


