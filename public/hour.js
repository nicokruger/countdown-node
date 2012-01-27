(function ($) {

    var hourInput = function (el) {
        var hour, minute;
                
        var parse = function () {
            var val = $(el).val(), h, m;
            // attempt to parse
            if (val.indexOf(":") !== -1) {
                var parts = val.split(":");
                h = parseInt(parts[0], 10);
                m = parseInt(parts[1], 10);
                if (h > 23) {
                    h = 23;
                }
            } else if (val.length == 4) {
                h = parseInt(val.slice(0,2), 10);
                m = parseInt(val.slice(2,4), 10);
                if (m > 59) {
                    m = 59;
                }
            } else {
                h = 0;
                m = 0;
            }

            return [h,m];
        };
        var selector;
        var selectHour = function () {
            var select = function () {
                var e = $(el).get()[0];
                if (e.setSelectionRange) {
                    e.focus();
                    e.setSelectionRange(0,2);
                } else if (e.createTextRange) {
                    var range = e.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', 2);
                    range.moveStart('character', 0);
                    range.select();
                }
            };
            select();
            return {
                increment: function () {
                    hour++;
                    if (hour > 23) { hour = 0; }
                    update();
                    setTimeout(select, 0);
                },
                decrement: function () {
                    hour--;
                    if (hour < 0) { hour = 23; }
                    update();
                    setTimeout(select, 0);
                },
                canAnother: function () {
                    if (hour > 10) {
                        return false;
                    }
                    return true;
                },
                toggle: function () {
                    return selectMinute;
                }
            };
        };
        var selectMinute = function () {
            var select = function () {
                var e = $(el).get()[0];
                if (e.setSelectionRange) {
                    e.focus();
                    e.setSelectionRange(3,5);
                } else if (e.createTextRange) {
                    var range = e.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', 5);
                    range.moveStart('character', 3);
                    range.select();
                }
            };
            select();
            return {
                increment: function () {
                    minute++;
                    if (minute > 59) { minute = 0; }
                    update();
                    setTimeout(select, 0);
                },
                decrement: function () {
                    minute--;
                    if (minute < 0) { minute = 59; }
                    update();
                    setTimeout(select, 0);
                },
                canAnother: function () {
                    if (minute > 10) {
                        return false;
                    }
                    return true;
                },
                toggle: function () {
                    return selectHour;
                }
            };
        };
        var update = function () {
            $(el).val((hour < 10 ? "0" + hour : hour) + ":" + (minute < 10 ? "0" + minute : minute));
        };

        $(el).focus(function () {
             setTimeout(function () { selector = selectHour(); }, 0);
             return false;
        });

        $(el).blur(function () {
            var d = parse();
            hour = d[0];
            minute = d[1];
            update();
        });

        $(el).keydown(function (e) {
            if (e.which == 38) { // up arrow
                selector.increment();
                return false;
            } else if (e.which == 40) {
                selector.decrement();
                return false;
            } else if (e.which == 37 || e.which == 39) {
                var s = selector.toggle();
                selector = s();
                return false;
            }
        });
        $(el).keypress(function (e) {
            if (event.which == 58) {
                var s = selector.toggle();
                selector = s();
                e.preventDefault();
                return false;
            }  if ((event.which < 48 || event.which > 57) && event.which != 190) {
                e.preventDefault();
                return false;
            }

        });
        var d = parse();
        hour = d[0];
        minute = d[1];
        update();
        return {
            hour: function (h) {
                if (typeof(h) === "undefined") {
                    return hour;
                }
                hour = h;
                update();
            },
            minute: function (m) {
                if (typeof(m) === "undefined") {
                    return minute;
                }
                minute = m;
                update();
            }
        };
    };

    $.fn.hours = function () {
        this.each(function () {
            var el = $(this);
            var hi = hourInput(el);

            var holder = $("<div></div>").insertAfter(el);
            var hour = $("<select></select>").appendTo(holder);
            var minute = $("<select></select>").appendTo(holder);
            var ampm = $("<select></select>").appendTo(holder);

            _(_.range(12)).each(function (h) {
                $(hour).append("<option>" + ((h < 10) ? "0" + h : h) + "</option>");
            });
            _(["00", "15", "30", "45"]).each(function (m) {
                $(minute).append("<option>" + m + "</option>");
            });
            ampm.append("<option>AM</option>");
            ampm.append("<option>PM</option>");

            hour.change(function () {
                hi.hour(parseInt($(hour).val(), 10));
            });
            minute.change(function () {
                hi.minute(parseInt($(minute).val(), 10));
            });

            ampm.change(function () {
                var v = $(ampm).val();
                if (v === "PM") {
                    hour += 12;
                }
                hi.hour((hi.hour() < 12) ? hi.hour() + 12 : hi.hour());
            });
        });

        return this;
    };

})(jQuery);
