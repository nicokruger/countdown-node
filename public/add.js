$(function () {
    var m = model($("#countdownlist"), undefined, timo.normalCounterType);
    var c = controller(m, "http://" + window.location.hostname +":" + window.location.port);
    var action = actions(c);
    var initialDatetime = moment().add("hours", 3);

    var gather = function (success) {
        var ed = moment($("#countdownDatetime").val(), "YYYY-MM-DD");
        var eh = moment($("#countdownTime").val(), "HH:mm");
        if (ed.year() === 1899 ) {
            c.messages.error("Invalid Date entered, please enter a date in the format 'YYYY-MM-DD', for eg. 2012-12-01");
            return;
        }

        var tz = $("#countdownTimezone").val();
        if (tz === "UTC") {
            ed = moment($("#countdownDatetime").val() + " 00:00", "YYYY-MM-DD Z");
        } else if (tz === "Local timezone") {
            // do nothing - should be local already?
        }
        var data = {
            _id: "asdfasfasdf",
            name: (!$("#countdownName").val()) ? "no name" : $("#countdownName").val(),
            tags: _($("#countdownTags").val().split(" ")).map(function (tag) {
                // remove # if user supplied it
                if (tag.charAt(0) === "#") {
                    return tag.slice(1,tag.length);
                }
                return tag;
            }),
            eventDate:  ed.native().getTime() + (eh.hours() * 60 * 60 + eh.minutes() * 60) * 1000
        };

        success(data);
    };

    var newCountdown = function (e) {
        e.preventDefault();

        gather(function (data) {
            c.newCountdown(data, function () {
                alert("added");
            });
        });
    };

    var preview = function () {
        if (!$("#countdownName").val()) {
            $(".actions").hide();
        } else {
            $(".actions").show();
        }
        gather(function (data) {
            m.clear();
            m.putCountdown(data);
        });
    };
    
    $("#countdownDatetime").val(initialDatetime.format("YYYY-MM-DD"));
    $("#countdownTime").val(initialDatetime.format("HH:mm"));
    preview();

    $("#countdownName").change(preview);
    $("#countdownName").keypress(function () { setTimeout(preview,0);});
    $("#countdownDatetime").change(preview);
    $("#countdownTime").change(preview);
    $("#countdownTimezone").change(preview);
    $("#countdownTags").change(preview);

    $("#newcountdownForm").bind("submit", newCountdown);
    $("#countdownName").focus();
    
    $("#countdownDatetime").datepicker();
    var h = $("#countdownTime").hours();
});

