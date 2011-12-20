var actions = function (model) {
    

    window.onpopstate = function (e) {
        if (e.state && e.state.url) {
            countdownAction(e.state.url, e.state.data, e.state.method);
        }
    };
    
    var historyAction = function (e, url, data, method, success) {
        if (!(window.history && history.pushState)) {
            return;
        }
        
        e.preventDefault();
        countdownAction(url, data, method, function () {
            if (success !== undefined) {
                success();
            }
            history.pushState({"url": url, "data" : data, "method" : method}, "", url);
        });
    };
    
    var countdownAction = function (url, data, method, success) {
        $.ajax({
            url: url,
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
                alert("an error occurred");
                
                $("#info").html("An error occurred... Please try again");
            }
        });
    };
    
    var timeSearch = function (endTime) {
        var start = Date.parse("today").getTime();
        var data = {
            start: start,
            end: endTime
        };
        countdownAction("/countdown/search", data, "POST", function () {
            var format = "yyyy-MM-dd HH:mm";
            $("#info").html("<h4>From " + (new Date(start)).toString(format) + " to " + (new Date(endTime)).toString(format));
        });
    };
    
    return {
        clear: function (e) {
            model.clear();
        },
        
        random: function (e) {
            historyAction(e, "/random", {}, "GET");
        },
        nextDay: function (e) {
            historyAction(e, "/day", {}, "GET", function () { });
        },
        nextWeek: function (e) {
            historyAction(e, "/week", {}, "GET", function () { });
        },
        nextMonth: function (e) {
            historyAction(e, "/month", {}, "GET", function () { });
        },
        nextWeekend: function (e) {
            historyAction(e, "/weekend", {}, "GET", function () { });
        },
        nextYear: function (e) {
            historyAction(e, "/year", {}, "GET", function () { });
        },
        
        search: function(data) {
            countdownAction("/countdowns", data, "GET");
        }

                
    };
};

var parseSearchData = function (text) {
    var i =  _(text.split(' ')).chain().reduce(function (o, ww) {
        if (ww[0] == "#") {
            o.tags.push(ww.slice(1, o.length));
        } else {
            o.names.push(ww);
        }
        return o;
    }, {names: [], tags: []}).value();
    
    var sd = {};
    
    if (i.tags.length > 0) {
        sd.tags = i.tags.join(",");
    }
    if (i.names.length > 0) {
        sd.name = i.names.join(" ");
    }
    return (i.names.length > 0 || i.tags.length > 0) ? sd : { name: "" };
};

