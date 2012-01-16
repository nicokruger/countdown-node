if (typeof(timo) === "undefined") timo = {};

timo.ledDefaultColorscheme = {
    lit: "rgba(0, 0, 0, 1.0)",
    unlit: "rgba(255, 255, 255, 0.1)",
    outline: "rgba(255, 255, 255, 1.0)",
    width: 32,
    height: 32
};

timo.led = function(canvas, colorscheme) {

    // ctx will never change - get it once and save it in the closure
    var ctx = canvas.getContext("2d");
    
    // holds the previous value for this LED
    var prevValue = [undefined, undefined, undefined];

    var cs = colorscheme === undefined ? timo.ledDefaultColorscheme : colorscheme;
    
    return function (num) {
        
        // the canvas could be resized, so we need to retrieve width/height
        // on each char draw
        var w = $(canvas).width();
        var h = $(canvas).height();
        
        if (_.isEqual([num,w,h], prevValue)) {
            return; // don't do anything, it's not necessary to redraw
        }

        var syms = timo.makeLedSymbols(w,h);
        
        // Clear
        //ctx.fillStyle = 'rgba(0, 0, 0, 0.0)';
        //ctx.fillRect(0,0,w,h);
        ctx.clearRect(0, 0, w, h);
        
        var symbolMap = timo.ledSymbolMapping[num];
        
        _(_.zip(syms, symbolMap)).each(function (s) {
            var symbol = s[0];
            var lit = s[1];
            
            ctx.fillStyle = lit === 0 ? cs.unlit : cs.lit;
            ctx.strokeStyle = cs.outline;
            
            ctx.beginPath();
            ctx.moveTo(symbol[0][0], symbol[0][1]);
            for (var i = 1; i < symbol.length; i++) {
                ctx.lineTo(symbol[i][0], symbol[i][1]);
            }
            ctx.fill();

            ctx.lineTo(symbol[0][0], symbol[0][1]);
            ctx.stroke();
        
        });
        
        prevValue = [num, w, h];
    };
};

// This keeps the mapping from int to which symbols should be lit / not-lit in the LED
//
// We order the symbols as follows:
//   - the 3 horizontal symbols in the LED are 0,1,2
//   - the left vertical symbols are orderered as 3,4 (from the top to bottom)
//   - the right vertical symbols are then 5,6 (again from top to bottom)
timo.ledSymbolMapping = {
    0: [1, 0, 1, 1, 1, 1, 1],
    1: [0, 0, 0, 0, 0, 1, 1],
    2: [1, 1, 1, 0, 1, 1, 0],
    3: [1, 1, 1, 0, 0, 1, 1],
    4: [0, 1, 0, 1, 0, 1, 1],
    5: [1, 1, 1, 1, 0, 0, 1],
    6: [0, 1, 1, 1, 1, 0, 1],
    7: [1, 0, 0, 0, 0, 1, 1],
    8: [1, 1, 1, 1, 1, 1, 1],
    9: [1, 1, 1, 1, 0, 1, 1]
};

timo.makeLedSymbols = function (w, h) {
    // this should actually be related to w,h, hardcoded for now
    var margin = 4;
    // "thickness" of a symbol in the LED
    var symbolThickness = 3;
    // "length" of "arrow" (the triangular end of the LED symbol)
    var arrowLength = 3;
    
    // we need to get 6 points
    // top left
    var tl = [margin,margin];
    // top right
    var tr = [w-margin,margin];
    // center left
    var cl = [margin, h/2.0];
    // center right
    var cr = [w-margin, h/2.0];
    // bottom left
    var bl = [margin, h-margin];
    // bottom right
    var br = [w-margin,h-margin];
    
    var horizontals = [];
    _([ [tl, tr], [cl,cr], [bl, br] ]).each(function (horline) {
        var left = horline[0], right = horline[1];
        horizontals.push([
            left,
            [left[0] + arrowLength, left[1] - symbolThickness],
            [right[0] - arrowLength, left[1] - symbolThickness],
            right,
            [right[0] - arrowLength, left[1] + symbolThickness],
            [left[0] + arrowLength, left[1] + symbolThickness]
        ]);
    });
    
    var verticals = [];
    _([ [tl, cl], [cl, bl], [tr, cr], [cr, br] ]).each(function (vertline) {
        var top = vertline[0], bottom = vertline[1];
        verticals.push([
            top,
            [top[0] + symbolThickness, top[1] + arrowLength],
            [top[0] + symbolThickness, bottom[1] - arrowLength],
            bottom,
            [bottom[0] - symbolThickness, bottom[1] - arrowLength],
            [bottom[0] - symbolThickness, top[1] + arrowLength]
        ]);
    });
    
    return horizontals.concat(verticals);
};if (typeof(timo) === "undefined") timo = {};

timo.makeled = (function() {
    
    var countdownTimer = 0; // simple counter to uniquely ID LEDs
    
    // where should be a jquery object
    // num - maximum number of characters (numeric)
    // w - width of a character
    // h - height of a character
    return function(where, num, w, h, colorscheme) {
        
        
        var leds = _.range(num).map(function (x) {
            var id = "led" + countdownTimer;
            var canvas = where.append('<canvas id="' + id+ '" width="' + w + '" height="' + h + '"></canvas>');
            countdownTimer += 1;
            
            return timo.led(where.find("#" + id)[0], colorscheme);
            
        });
        
        return function (time) { // time should be a string
                _(_.zip(leds, time.slice(0, time.length))).each(function (x) {
                    var led = x[0];
                    var n = parseInt(x[1], 10);
                    if (!isNaN(n)) led(n);
                });
            };
        };
})();
if (typeof(timo) === "undefined") timo = {};

// create a DDD:HH:MM:SS countdown
// where - jquery object
timo.normalCounterType = function (where) {
    var prevContent = $(where).html();
    $(where).html("");
    var counterHolder = $('<div class="timer"></div>').appendTo(where);
    var td = $('<span class="timer-days"></span>').appendTo(counterHolder);
    $(counterHolder).append('<span class="seperator">d</span>');
    var th = $('<span class="timer-hours"></span>').appendTo(counterHolder);
    $(counterHolder).append('<span class="seperator">h</span>');
    var tm = $('<span class="timer-minutes"></span>').appendTo(counterHolder);
    $(counterHolder).append('<span class="seperator">m</span>');
    var ts = $('<span class="timer-seconds"></span>').appendTo(counterHolder);
    return {
        time: $(where).attr("data-eventdate"),
        remove: function() {
            $(counterHolder).remove();
            $(where).html(prevContent);
        },
        update: function(days, hours, minutes, seconds) {
            td.html(timo.pad(days,3));
            th.html(timo.pad(hours,2));
            tm.html(timo.pad(minutes,2));
            ts.html(timo.pad(seconds,2));
        }

    };
};

timo.noCounterType = function (where) {
    return {
        time: $(where).attr("data-eventdate"),
        remove: function () {
            
        },
        update: function (days, hours,minutes,seconds) {
            
        }
    };
};

timo.ledCounterType = function (ledTheme) {
    return function (where) {
        var theme = (typeof(ledTheme) !== "undefined") ? ledTheme : timo.ledDefaultColorscheme;
        var prevContent = $(where).html();
        $(where).html("");
        var counterHolder = $('<div class="timer"></div>').appendTo(where);
        var td_div = $('<span class="timer-days"></span>').appendTo(counterHolder);
        $(counterHolder).append('<span class="seperator">d</span>');
        var th_div = $('<span class="timer-hours"></span>').appendTo(counterHolder);
        $(counterHolder).append('<span class="seperator">h</span>');
        var tm_div = $('<span class="timer-minutes"></span>').appendTo(counterHolder);
        $(counterHolder).append('<span class="seperator">m</span>');
        var ts_div = $('<span class="timer-seconds"></span>').appendTo(counterHolder);

        var td = timo.makeled(td_div, 3, theme.width, theme.height, theme);
        var th = timo.makeled(th_div, 2, theme.width, theme.height, theme);
        var tm = timo.makeled(tm_div, 2, theme.width, theme.height, theme);
        var ts = timo.makeled(ts_div, 2, theme.width, theme.height, theme);

        return {
            time: $(where).attr("data-eventdate"),
            remove: function () {
                $(counterHolder).remove();
                $(where).html(prevContent);
            },
            update: function (days, hours, minutes, seconds) {
                td(timo.pad(days,3));
                th(timo.pad(hours,2));
                tm(timo.pad(minutes,2));
                ts(timo.pad(seconds,2));
            }
        };
    };
    
};

timo.counters = function (where, counterType) {
    var defaultCounterType = (typeof(counterType) !== "undefined") ? counterType : timo.normalCounterType;
    var type = defaultCounterType;
    var countdowns = [];

    // helper function to pad numbers with leading "0"
    var pad = function (num, pads) {
        var s = ''+num;
        return s.length == pads ? ''+num : _(_.range(pads - s.length)).map(function() { return "0"; }).join('') + num;
    };
    
    var updateCounter = function(target) {
        // don't do anything if counter is not visible
        //if (!$(counter[5]).is(":visible")) {
        //    return;
        //}
        var now = (new Date()).getTime();
        var c = timo.convertTime(now, parseInt(target, 10));
        // check if timer has expired
        if (target < now) {
            c = {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            };
        }
        
        return [c.days, c.hours, c.minutes, c.seconds];
    };

    var generate = function () {
        countdowns = _($(where)).map(function (w) {
            return type(w);
        });
        _(countdowns).each(function (countdown) {
            var timeInfo = updateCounter(countdown.time);
            countdown.update(timeInfo[0], timeInfo[1], timeInfo[2], timeInfo[3]);
        });
    };
    generate();
    // the following code is the *single* function that gets called very second
    // and runs through the countdowns and updates them
    setInterval(function () {
        _(countdowns).each(function (t) {
            var timeInfo = updateCounter(t.time);
            t.update(timeInfo[0], timeInfo[1], timeInfo[2], timeInfo[3]);
        });
    }, 1000);
  
    return {
        changeType: function (newType) {
            _(countdowns).each(function (countdown) {
                countdown.remove();
            });
            type = newType;
            generate();
        }
    };
};

timo.pad = function (num, pads) {
    var s = ''+num;
    return s.length == pads ? ''+num : _(_.range(pads - s.length)).map(function() { return "0"; }).join('') + num;
};

timo.convertTime = function (now_millis, then_millis) {
    var DAY = 1000*60*60*24;
    var HOUR = 1000*60*60;
    var MINUTE = 1000*60;
    var SECOND = 1000;
    
    var now = new Date(now_millis);
    var then = new Date(then_millis);
    
    var diff = then.getTime() - now.getTime();
    var days = Math.floor(diff / DAY);
    var hours = Math.floor( (diff - DAY*days) / HOUR );
    var minutes = Math.floor( (diff - DAY*days - hours*HOUR) / MINUTE);
    var seconds = Math.floor( (diff - DAY*days - hours*HOUR - minutes*MINUTE) / SECOND);
    
    return {
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };
};
