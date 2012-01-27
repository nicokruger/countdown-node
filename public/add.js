    var newCountdown = function (e) {
        if (typeof(e) !== "undefined") { e.preventDefault(); }

        gather(function (data) {
            c.newCountdown(data, function () {
                alert("added");
            });
        });
    };

$(function () {
    var m = model($("#countdownlist"), undefined, {
        counterType: timo.normalCounterType,
        socialLinks: false,
        counterLink: false
    });
    var c = controller(m, "http://" + window.location.hostname +":" + window.location.port);
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
            // do nothing - should be local already
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

    var preview = function () {
        if (!$("#countdownName").val()) {
            $("#previewMessage").show();
            $("#previewMessage").html('<div class="alert-message block-message warning">Please enter name, time and optional tags</div>');
            $("#preview").hide();
            $(".actions .btn").attr("disabled", true);
        } else {
            $("#previewMessage").hide();
            $("#preview").show();
            $(".actions .btn").attr("disabled", false);
        }
        gather(function (data) {
            m.clear();
            m.putCountdown(data);
        });
    };
    
    $("#countdownDatetime").val(initialDatetime.format("YYYY-MM-DD"));
    $("#countdownTime").val(initialDatetime.format("HH:mm"));

    $("#countdownName").keydown(function () { setTimeout(preview, 0); });
    $("#countdownDatetime").keydown(function () {setTimeout(preview, 0); });
    $("#countdownDatetime").change(function () {setTimeout(preview, 0); });
    $("#countdownTime").keydown(function () {setTimeout(preview, 0); });
    $("#countdownTimezone").change(function () {setTimeout(preview, 0); });
    $("#countdownTags").keydown(function () {setTimeout(preview, 0); });

    $("#countdownName").focus();
    
    $("#countdownDatetime").datepicker();
    var h = $("#countdownTime").hours();
    preview();
    $("#addPublic").click(function (e) {
        e.preventDefault();

        gather(function (data) {
            c.newCountdown(data, function (c) {
                window.location.pathname = "/" + c._id;
            });
        });
    });

    $("#addPrivate").click(function (e) {
        e.preventDefault();
        gather(function (data) {
            data.isPrivate = true;
            c.newCountdown(data, function (c) {
                window.location.pathname = "/" + c._id;
            });
        });
    });

    $("#addMulti").click(function (e) {
        e.preventDefault();
        gather(function (data) {
            c.newCountdown(data, function (c) {
                $("#countdownName").val("");
                $("#countdownName").focus();
                preview();
                $("#previewMessage").html('<div class="alert-message success">Added counter.</div>');
            });
        });
    });

});

