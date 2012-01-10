var bitly = {
    xhr : new XMLHttpRequest(),
    shorten_url : 'http://api.bitly.com/v3/shorten?login=whenislogin&apiKey=wheniskey&format=json&longUrl=',
    expand_url : 'http://api.bitly.com/v3/expand?login=whenislogin&apiKey=wheniskey&format=json&shortUrl=',
    shorten : function(url_to_shorten) {
	this.doxhr(this.shorten_url + url_to_shorten, function(content) {
		console.log(content);
	});
    },
    expand : function(url_to_expand) {
	this.doxhr( this.expand_url + url_to_expand, function(content) {
		console.log(content);
	});
    },
    doxhr : function(url, callback) {
	var that = this;  
	that.xhr.open("GET", url);
	that.xhr.onreadystatechange = function() { 
	    if(that.xhr.readyState == 4) { 
		if(that.xhr.status==200) {
		    callback(that.xhr.responseText);      
		} else {
		    console.log("Oops", that.xhr);
		}
	    } 
	}
	that.xhr.send();
    }
}