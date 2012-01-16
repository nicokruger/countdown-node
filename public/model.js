
var ledColors = {
    lit: "rgba(82, 139, 183, 1.0)",
    unlit: "rgba(0, 0, 0, 0.0)",
    outline: "rgba(0, 0, 0, 0.0)"
};

var emptyHtml = "<h1>Nothing to see here...</h1>";

var model = function (countdownHolder, head) {
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
        },
        // adds a countdown, and refreshes the view
        putCountdown: function (c) {
            var o = this._putCountdown(c);
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
            var where = this.find(c);
            var outside;
            if (where === undefined) {
                outside = $('<li class="countdown"></li>').appendTo(countdownHolder);
                this.countdowns.push(c);
            } else {
                outside = $('<li class="countdown"></li>').insertBefore($(countdownHolder).find("#" + this.countdowns[where].url).parent());
                this.countdowns.splice(where, 0, c);
            }

            // Name of countdown
            var countdownName = $('<span class="countdown-name"><a href="' + c.url + '">' + c.name + '</a></span>').appendTo($(outside));
            
            // Tags
            $(countdownName).append('<span class="countdown-tags">' + c.tags + '</span>');
           
            // Social links
            var social = $('<span class="countdown-social">' + this._twitter_link(c.url) + this._facebook_link(c.url) + this._plusone_link(c.url) + '</span>').appendTo($(outside));

            // Countdown itself
            var cd = $("<span class=\"countdown\" id=\"" + c.url + "\"></span>").appendTo($(outside));
            countdown(cd, c.eventDate, 24, 32, ledColors);
            
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
        return '<span class="social-link"><g:plusone size="medium" annotation="none" href="www.whenis.co.za/' + url + '"></g:plusone></span>';
    },
    _ogp : function(c) {
        return {
            title: '<meta property="og:title" content="Whenis - ' + c.name +'" />',
            //this is not scraped atm :( it's also quite limiting in possible values http://ogp.me/#types
            ogtype: '<meta name="og.type" content="website" />',
            url: '<meta name="og.url" content="http://www.whenis.co.za/' + c.url + '" />',
            metaTags: function(){
                return [ this.title, this.ogtype, this.url, '<meta property="og:site_name" content="Whenis"/>' ].join("\n");
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
