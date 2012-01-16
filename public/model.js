
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
		    console.log("putting countdown ..." + countdown.name);
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
            var where = this.find(c),
	    outside,
	    c_id = c._id.toString();

            if (where === undefined) {
                outside = $('<li class="countdown"></li>').appendTo(countdownHolder);
                this.countdowns.push(c);
            } else {
                outside = $('<li class="countdown"></li>').insertBefore($(countdownHolder).find("#" + this.countdowns[where].url).parent());
                this.countdowns.splice(where, 0, c);
            }


            $(outside).append('<span class="countdown-name"><a href="' + c_id + '">' + c.name + '</a></span>');
            

            var cd = $("<span class=\"countdown\" id=\"" + c_id + "\"></span>").appendTo($(outside));

            $(outside).append('<span class="ui-li-count countdown-tags">' + c.tags + '</span>');
	    
	    $(outside).append('<a href="#" onclick="$(\'#social_group'+ c_id +'\').css({\'display\' : \'block\'}); initSocial();">share &gt;&gt; </a>' + 
	    	      '<div id="social_group'+ c_id +'" style="display: none">' + this._twitter_link(c_id) + this._facebook_link(c_id) + this._plusone_link(c_id) +
	    	      '</div>');
	    
	    countdown(cd, c.eventDate.getTime(), 24, 32, ledColors);
            console.log('done putting ' + c.name);
            return $(outside);

        },
	_facebook_link : function(url) {
	    return '<span><iframe src="http://www.facebook.com/plugins/like.php?layout=button_count&href=www.whenis.co.za/' + url + '"' +
	    'scrolling="no" frameborder="0" style="border:none; width: 85px; height:20px"></iframe></span>';
	},
	_twitter_link : function(url) {
	    return '<span><a href="https://twitter.com/share" class="twitter-share-button" ' +
	    'data-url="http://www.whenis.co.za/' + url + '">Tweet</a></span>';
	},
	_plusone_link : function(url) {
	    return '<span><g:plusone size="medium" annotation="inline" href="www.whenis.co.za/' + url + '"></g:plusone></span>';
	},
	_ogp : function(c) {
	    return {
		title: '<meta property="og:title" content="Whenis - ' + c.name +'" />',
		//this is not scraped atm :( it's also quite limiting in possible values http://ogp.me/#types
		ogtype: '<meta name="og.type" content="website" />', 
		url: '<meta name="og.url" content="http://www.whenis.co.za/' + c._id.toString() + '" />',
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
