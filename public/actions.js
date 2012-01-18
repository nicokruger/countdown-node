var actions = function (controller) {
    
    // TODO: This is broken atm
    /*window.onpopstate = function (e) {
        if (e.state && e.state.url) {
            controller.countdownAction(e.state.url, e.state.data, e.state.method);
        }
    };*/
    
    var historyAction = function (e, retrieveData, url, data, method) {
        return;
        /*if (!(window.history && history.pushState)) {
            return;
        }
        
        e.preventDefault();
        
        retrieveData(function () {
            history.pushState({"url": url, "data" : data, "method" : method}, "", url);
        });*/

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
            controller.clear();
        },
        
        random: function (e) {
            historyAction(e, controller.random, "/random", {}, "GET");
        },
        nextDay: function (e) {
            historyAction(e, controller.nextDay, "/day", {}, "GET");
        },
        nextWeek: function (e) {
            historyAction(e, controller.nextWeek, "/week", {}, "GET");
        },
        nextMonth: function (e) {
            historyAction(e, controller.nextMonth, "/month", {}, "GET");
        },
        nextWeekend: function (e) {
            historyAction(e, controller.nextWeekend, "/weekend", {}, "GET");
        },
        nextYear: function (e) {
            historyAction(e, controller.nextYear, "/year", {}, "GET");
        },
        
        search: function(data) {
	    var href = '/countdowns?';
	    
	    if(data.name !== undefined){
		href += ('name=' + encodeURIComponent(data.name) + '&');
	    }
	    if(data.tags !== undefined && data.tags !== []) {
		href += ('tags=' + encodeURIComponent(data.tags.join(',')) + '&');
	    }
	    if(data.start != undefined){
		href += ("start=" + data.start.getTime() + '&');
	    }
	    if(data.end != undefined){
		href += ("end=" + data.end.getTime() + '&');
	    }
	    window.location.href = href;
	    //controller.search(data);
        }

                
    };
};

