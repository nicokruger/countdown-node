// create a DDD:HH:MM:SS countdown
// where - jquery object
var countdown = (function () {
    // helper function to pad numbers with leading "0"
    var pad = function (num, pads) {
        var s = ''+num;
        return s.length == pads ? ''+num : _(_.range(pads - s.length)).map(function() { return "0" }).join('') + num;
    };
    
    var updateCounter = function(counter) {
        // don't do anything if counter is not visible
        if (!$(counter[5]).is(":visible")) {
            return;
        }
        var now = (new Date()).getTime();
        var c = convertTime(now, counter[0]);
        // check if timer has expired
        if (counter[0] < now) {
            c = {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            }
        }
        
        counter[1].update(pad(c.days, 3));
        counter[2].update(pad(c.hours, 2));
        counter[3].update(pad(c.minutes, 2));
        counter[4].update(pad(c.seconds, 2));
    }

    var createCounterInfo = function (t) {
        return [
            parseInt($(t).attr("data-eventdate")),
            {update: function (x) { $(t).find(".timer-days").html(x); } },
            {update: function (x) { $(t).find(".timer-hours").html(x); } },
            {update: function (x) { $(t).find(".timer-minutes").html(x); } },
            {update: function (x) { $(t).find(".timer-seconds").html(x); } },
            t
        ];
    }
    // the following code is the *single* function that gets called very second
    // and runs through the countdowns and updates them
    setInterval(function () {
        //_(counters).each(function (counter) {
        //    updateCounter(counter);
        //});
        
        _($(".timer")).each(function (t) {
            updateCounter(createCounterInfo(t));
        });
    }, 1000);
    
    var num = 0; // another counter to identify countdowns
    
    // colorscheme can be undefined, default will be used
    return function (where, target, w, h, colorscheme) {
        
        num+=1;
        var id = "countdown" + num;
        where.append( '<div class="timer" data-eventdate="' + target +'" id="' + id + '"></div>');
        where.find("#" + id).append('<span class="timer-days" id="days' + id + '"></span>');
        where.find("#" + id).append('<span class="seperator">d</span>');
        where.find("#" + id).append('<span class="timer-hours" id="hours' + id + '"></span>');
        where.find("#" + id).append('<span class="seperator">h</span>');
        where.find("#" + id).append('<span class="timer-minutes" id="minutes'+ id + '"></span>');
        where.find("#" + id).append('<span class="seperator">m</span>');
        where.find("#" + id).append('<span class="timer-seconds" id="seconds' + id + '"></span>');
        
        updateCounter(createCounterInfo(where.find("#" + id)[0]));
        /*var counter = [
            target,
            timer(where.find("#days"+id), 3, w, h, colorscheme), 
            timer(where.find("#hours" + id), 2, w, h, colorscheme), 
            timer(where.find("#minutes" + id), 2, w, h, colorscheme), 
            timer(where.find("#seconds" + id), 2, w, h, colorscheme),
            where
        ]*/
        
        /*counters.push(counter);
        
        updateCounter(counter);*/
    }
})();

