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
            controller.search(data);
        },
        next: function(data) {
            controller.next(data);
        },
        prev: function(data) {
            controller.prev(data);
        }


                
    };

};
