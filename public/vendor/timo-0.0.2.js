/* Moment.js | version : 1.3.0 | author : Tim Wood | license : MIT */
(function(a,b){function q(a){this._d=a}function r(a,b){var c=a+"";while(c.length<b)c="0"+c;return c}function s(b,c,d,e){var f=typeof c=="string",g=f?{}:c,h,i,j,k;return f&&e&&(g[c]=e),h=(g.ms||g.milliseconds||0)+(g.s||g.seconds||0)*1e3+(g.m||g.minutes||0)*6e4+(g.h||g.hours||0)*36e5,i=(g.d||g.days||0)+(g.w||g.weeks||0)*7,j=(g.M||g.months||0)+(g.y||g.years||0)*12,h&&b.setTime(+b+h*d),i&&b.setDate(b.getDate()+i*d),j&&(k=b.getDate(),b.setDate(1),b.setMonth(b.getMonth()+j*d),b.setDate(Math.min((new a(b.getFullYear(),b.getMonth()+1,0)).getDate(),k))),b}function t(a){return Object.prototype.toString.call(a)==="[object Array]"}function u(b){return new a(b[0],b[1]||0,b[2]||1,b[3]||0,b[4]||0,b[5]||0,b[6]||0)}function v(b,d){function u(d){var e,i;switch(d){case"M":return f+1;case"Mo":return f+1+s(f+1);case"MM":return r(f+1,2);case"MMM":return c.monthsShort[f];case"MMMM":return c.months[f];case"D":return g;case"Do":return g+s(g);case"DD":return r(g,2);case"DDD":return e=new a(h,f,g),i=new a(h,0,1),~~((e-i)/864e5+1.5);case"DDDo":return e=u("DDD"),e+s(e);case"DDDD":return r(u("DDD"),3);case"d":return l;case"do":return l+s(l);case"ddd":return c.weekdaysShort[l];case"dddd":return c.weekdays[l];case"w":return e=new a(h,f,g-l+5),i=new a(e.getFullYear(),0,4),~~((e-i)/864e5/7+1.5);case"wo":return e=u("w"),e+s(e);case"ww":return r(u("w"),2);case"YY":return r(h%100,2);case"YYYY":return h;case"a":return m>11?t.pm:t.am;case"A":return m>11?t.PM:t.AM;case"H":return m;case"HH":return r(m,2);case"h":return m%12||12;case"hh":return r(m%12||12,2);case"m":return n;case"mm":return r(n,2);case"s":return o;case"ss":return r(o,2);case"zz":case"z":return(b.toString().match(k)||[""])[0].replace(j,"");case"Z":return(p>0?"+":"-")+r(~~(Math.abs(p)/60),2)+":"+r(~~(Math.abs(p)%60),2);case"ZZ":return(p>0?"+":"-")+r(~~(10*Math.abs(p)/6),4);case"L":case"LL":case"LLL":case"LLLL":case"LT":return v(b,c.longDateFormat[d]);default:return d.replace(/(^\[)|(\\)|\]$/g,"")}}var e=new q(b),f=e.month(),g=e.date(),h=e.year(),l=e.day(),m=e.hours(),n=e.minutes(),o=e.seconds(),p=e.zone(),s=c.ordinal,t=c.meridiem;return d.replace(i,u)}function w(b,d){function p(a,b){var d;switch(a){case"M":case"MM":e[1]=~~b-1;break;case"MMM":case"MMMM":for(d=0;d<12;d++)if(c.monthsParse[d].test(b)){e[1]=d;break}break;case"D":case"DD":case"DDD":case"DDDD":e[2]=~~b;break;case"YY":b=~~b,e[0]=b+(b>70?1900:2e3);break;case"YYYY":e[0]=~~Math.abs(b);break;case"a":case"A":o=b.toLowerCase()==="pm";break;case"H":case"HH":case"h":case"hh":e[3]=~~b;break;case"m":case"mm":e[4]=~~b;break;case"s":case"ss":e[5]=~~b;break;case"Z":case"ZZ":h=!0,d=b.match(n),d[1]&&(f=~~d[1]),d[2]&&(g=~~d[2]),d[0]==="-"&&(f=-f,g=-g)}}var e=[0,0,1,0,0,0,0],f=0,g=0,h=!1,i=b.match(m),j=d.match(l),k,o;for(k=0;k<j.length;k++)p(j[k],i[k]);return o&&e[3]<12&&(e[3]+=12),o===!1&&e[3]===12&&(e[3]=0),e[3]+=f,e[4]+=g,h?new a(a.UTC.apply({},e)):u(e)}function x(a,b){var c=Math.min(a.length,b.length),d=Math.abs(a.length-b.length),e=0,f;for(f=0;f<c;f++)~~a[f]!==~~b[f]&&e++;return e+d}function y(a,b){var c,d=a.match(m),e=[],f=99,g,h,i;for(g=0;g<b.length;g++)h=w(a,b[g]),i=x(d,v(h,b[g]).match(m)),i<f&&(f=i,c=h);return c}function z(a,b,d){var e=c.relativeTime[a];return typeof e=="function"?e(b||1,!!d,a):e.replace(/%d/i,b||1)}function A(a,b){var c=d(Math.abs(a)/1e3),e=d(c/60),f=d(e/60),g=d(f/24),h=d(g/365),i=c<45&&["s",c]||e===1&&["m"]||e<45&&["mm",e]||f===1&&["h"]||f<22&&["hh",f]||g===1&&["d"]||g<=25&&["dd",g]||g<=45&&["M"]||g<345&&["MM",d(g/30)]||h===1&&["y"]||["yy",h];return i[2]=b,z.apply({},i)}function B(a,b){c.fn[a]=function(a){return a!=null?(this._d["set"+b](a),this):this._d["get"+b]()}}var c,d=Math.round,e={},f=typeof module!="undefined",g="months|monthsShort|monthsParse|weekdays|weekdaysShort|longDateFormat|calendar|relativeTime|ordinal|meridiem".split("|"),h,i=/(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|dddd?|do?|w[o|w]?|YYYY|YY|a|A|hh?|HH?|mm?|ss?|zz?|ZZ?|LT|LL?L?L?)/g,j=/[^A-Z]/g,k=/\([A-Za-z ]+\)|:[0-9]{2} [A-Z]{3} /g,l=/(\\)?(MM?M?M?|dd?d?d|DD?D?D?|YYYY|YY|a|A|hh?|HH?|mm?|ss?|ZZ?|T)/g,m=/(\\)?([0-9]+|([a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+|([\+\-]\d\d:?\d\d))/gi,n=/([\+\-]|\d\d)/gi,o="1.3.0",p="Month|Date|Hours|Minutes|Seconds|Milliseconds".split("|");c=function(c,d){if(c===null)return null;var e;return c&&c._d instanceof a?e=new a(+c._d):d?t(d)?e=y(c,d):e=w(c,d):e=c===b?new a:c instanceof a?c:t(c)?u(c):new a(c),new q(e)},c.version=o,c.lang=function(a,b){var d,h,i,j=[];if(b){for(d=0;d<12;d++)j[d]=new RegExp("^"+b.months[d]+"|^"+b.monthsShort[d].replace(".",""),"i");b.monthsParse=b.monthsParse||j,e[a]=b}if(e[a])for(d=0;d<g.length;d++)h=g[d],c[h]=e[a][h]||c[h];else f&&(i=require("./lang/"+a),c.lang(a,i))},c.lang("en",{months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),monthsShort:"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),weekdaysShort:"Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),longDateFormat:{LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D YYYY",LLL:"MMMM D YYYY LT",LLLL:"dddd, MMMM D YYYY LT"},meridiem:{AM:"AM",am:"am",PM:"PM",pm:"pm"},calendar:{sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[last] dddd [at] LT",sameElse:"L"},relativeTime:{future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},ordinal:function(a){var b=a%10;return~~(a%100/10)===1?"th":b===1?"st":b===2?"nd":b===3?"rd":"th"}}),c.fn=q.prototype={clone:function(){return c(this)},valueOf:function(){return+this._d},"native":function(){return this._d},toString:function(){return this._d.toString()},toDate:function(){return this._d},format:function(a){return v(this._d,a)},add:function(a,b){return this._d=s(this._d,a,1,b),this},subtract:function(a,b){return this._d=s(this._d,a,-1,b),this},diff:function(a,b,e){var f=c(a),g=this._d-f._d,h=this.year()-f.year(),i=this.month()-f.month(),j=this.day()-f.day(),k;return b==="months"?k=h*12+i+j/30:b==="years"?k=h+i/12:k=b==="seconds"?g/1e3:b==="minutes"?g/6e4:b==="hours"?g/36e5:b==="days"?g/864e5:b==="weeks"?g/6048e5:b==="days"?g/3600:g,e?k:d(k)},from:function(a,b){var d=this.diff(a),e=c.relativeTime,f=A(d,b);return b?f:(d<=0?e.past:e.future).replace(/%s/i,f)},fromNow:function(a){return this.from(c(),a)},calendar:function(){var a=c(),b=c([a.year(),a.month(),a.date()]),d=this.diff(b,"days",!0),e=c.calendar,f=e.sameElse,g=d<-6?f:d<-1?e.lastWeek:d<0?e.lastDay:d<1?e.sameDay:d<2?e.nextDay:d<7?e.nextWeek:f;return this.format(typeof g=="function"?g.apply(this):g)},isLeapYear:function(){var a=this.year();return a%4===0&&a%100!==0||a%400===0},isDST:function(){return this.zone()!==c([this.year()]).zone()},day:function(a){var b=this._d.getDay();return a==null?b:this.add({d:a-b})}};for(h=0;h<p.length;h++)B(p[h].toLowerCase(),p[h]);B("year","FullYear"),c.fn.zone=function(){return this._d.getTimezoneOffset()},f&&(module.exports=c),typeof window!="undefined"&&(window.moment=c)})(Date);


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
    var prevContent = $(where).html();
    return {
        time: $(where).attr("data-eventdate"),
        remove: function () {
            $(where).html(prevContent);
        },
        update: function (days, hours,minutes,seconds) {
            var m = moment(parseInt($(where).attr("data-eventdate"), 10));
            $(where).html(m.format("YYYY-MM-DD HH:mm z"));
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
