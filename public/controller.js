var controller = function (model, server) {
    
    server = server === undefined ? "" : server;

    var countdownAction = function (url, data, method, success) {

        $.ajax({
            url: server + url,
            //url: "http://localhost:55555/filesystem/index.html",
            data: data,
            type: method,
            dataType: "json",
            success: function (o) {
                model.clear();
                if (o.hasOwnProperty("countdowns")) {
                    model.putCountdowns(o.countdowns);
                } else {
                    model.putCountdown(o);
                }
                if (success !== undefined) {
                    success(o);
                }
            },
            error: function (e) {
                $("#info").html("An error occurred... Please try again." + JSON.stringify(e));
            }
        });
    };
    
    return {
        clear: function (e) {
            model.clear();
        },
        random: function (callback) {
            countdownAction("/random", {}, "GET", callback);
        },
        nextDay: function (callback) {
            countdownAction("/day", {}, "GET", callback);
        },
        nextWeek: function (callback) {
            countdownAction("/week", {}, "GET", callback);
        },
        nextMonth: function (callback) {
            countdownAction("/month", {}, "GET", callback);
        },
        nextWeekend: function (callback) {
            countdownAction("/weekend", {}, "GET", callback);
        },
        nextYear: function (callback) {
            countdownAction("/year", {}, "GET", callback);
        },
        search: function(data) {
            countdownAction("/countdowns", data, "GET");
        }

	};
};

if (typeof(exports) !== "undefined") {
	exports.controller = controller;
}


