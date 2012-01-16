var timer = (function() {
    
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
            
            return led(where.find("#" + id)[0], colorscheme);
            
        });
        
        return {
            
            // time should be a string
            update: function (time) {
                
                
                _(_.zip(leds, time.slice(0, time.length))).each(function (x) {
                    
                    var led = x[0];
                    var n = parseInt(x[1]);
                    
                    n !== NaN && led(n);
                    
                });
            },
            close: function () {
            }
        }
}})();
