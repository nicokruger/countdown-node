
var ledTheme = {
    lit: "rgba(82, 139, 183, 1.0)",
    unlit: "rgba(0, 0, 0, 0.0)",
    outline: "rgba(0, 0, 0, 0.0)",
    width: 24,
    height: 32
};

var emptyHtml = "<div class=\"no-counters\">Oops! There are no counters for your selection. Try a different search or time range.</div>";
var formatDate = function (t) {
    var d = new Date(t);
    return d.getFullYear() + "-" + timo.pad(d.getMonth()+1,2) + "-" + timo.pad(d.getDate(),2) + " " + timo.pad(d.getHours(),2) + ":" + timo.pad(d.getMinutes(),2) + " UTC";
};

var timoTypes = [timo.normalCounterType, timo.noCounterType, timo.ledCounterType(ledTheme)];

var model = function (countdownHolder, head, timoCounterType) {
    var countdownQuery = ".countdown-counter";
    var counters;
    var makeCounters = function () {
        counters = timo.counters($(countdownQuery), timoCounterType);
        $(countdownQuery).click(function () {
            curTimoType++;
            if (curTimoType >= timoTypes.length) {
                curTimoType = 0;
            }
            counters.changeType(timoTypes[curTimoType]);
        });
    };
    // find the current timo types' index
    var curTimoType = 0;
    for (var i = 0; i < timoTypes.length; i++) {
        if (timoTypes[i] === timoCounterType) {
            curTimoType = i;
        }
    }
    //counters = timo.counters($(countdownQuery), timoCounterType);
    makeCounters();
    return {
        
        countdowns: [],
        
        find: function (countdownInfo) {
            if (this.countdowns.length === 0) {
                return undefined;
            }
            
            var sortFunc = function (x) { return x.eventDate; };
            var i = _(this.countdowns).sortedIndex(countdownInfo, sortFunc);
            return i < this.countdowns.length ? i : undefined;
        },
        
        putCountdowns: function (countdowns) {
            if (countdowns.length === 0) {
                $(countdownHolder).html(emptyHtml);
                return;
            }
            $(countdownHolder).html(""); // clear
            var that = this;
            _(countdowns).each(function (countdown) {
                that._putCountdown(countdown);
            });

            makeCounters();
        },
        // adds a countdown, and refreshes the view
        putCountdown: function (c) {
            var o = this._putCountdown(c);
            makeCounters();
            return o;
        },
        putCountdownOGP: function (c) {
            $(countdownHolder).html("");
            var o = this._putCountdown(c);
            var meta = this._ogp(c).metaTags();
            $(head).append(meta);
        },
        
        //ads a countdown, does not refresh the view
        _putCountdown: function (c) {
            var where = this.find(c), outside, c_id = c._id.toString();

            if (where === undefined) {
                outside = $('<li class="countdown"></li>').appendTo(countdownHolder);
                this.countdowns.push(c);
            } else {
                outside = $('<li class="countdown"></li>').insertBefore($(countdownHolder).find("#" + this.countdowns[where]._id.toString()).parent());
                this.countdowns.splice(where, 0, c);
            }
            // Name of countdown
            var countdownName = $('<span class="countdown-name"><a href="' + c_id + '">' + c.name + '</a></span>').appendTo($(outside));
            
            // Tags
            var tags = $('<span class="countdown-tags"></span>').appendTo(countdownName);
            _(c.tags).each(function (tag) {
                tags.append('<span class="countdown-tag"><a href="/tags/' + tag + '">' + tag + '</a></span>');
            });
           
            // Social links
            var social = $('<span class="countdown-social">' + this._twitter_link(c_id) + this._facebook_link(c_id) + this._plusone_link(c_id) + '</span>').appendTo($(outside));
            // Countdown itself
            var cd = $("<span class=\"countdown-counter\" id=\"" + c.url + "\" data-eventdate=\"" + c.eventDate + "\">" + formatDate(c.eventDate) + "</span>").appendTo($(outside));

            return $(outside);
        },
    _facebook_link : function(url) {
        return '<span class="social-link"><iframe src="http://www.facebook.com/plugins/like.php?layout=button_count&href=www.whenis.co.za/' + url + '"' +
        'scrolling="no" frameborder="0" style="border:none; width: 85px; height:20px"></iframe></span>';
    },
    _twitter_link : function(url) {
        return '<span class="social-link"><a href="http://twitter.com/share" class="twitter-share-button" ' +
        'data-url="http://www.whenis.co.za/' + url + '">Tweet</a></span>';
    },
    _plusone_link : function(url) {
        return '<span class="social-link"><g:plusone size="medium" annotation="none" href="http://www.whenis.co.za/' + url + '"></g:plusone></span>';
    },
    _ogp : function(c) {
        return {
            title: '<meta property="og:title" content="Whenis - ' + c.name +'" />',
            //this is not scraped atm :( it's also quite limiting in possible values http://ogp.me/#types
            ogtype: '<meta property="og:type" content="website" />',
            url: '<meta property="og:url" content="http://www.whenis.co.za/' + c._id.toString() + '" />',
            description: '<meta property="og:description" content="WhenIs - Release Dates For Games, Movies, Music and Everything Else" />',
            metaTags: function(){
                return [ this.title, this.ogtype, this.url, this.description, '<meta property="og:site_name" content="Whenis"/>' ].join("\n");
            }
        };
    },
        
        pending: 0,
        
        clear: function () {
            this.countdowns = [];
            countdownHolder.html(emptyHtml);
        }

    };

};

 
//exports.model = model;
