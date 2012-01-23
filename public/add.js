$(function () {
    var m = model($("#countdownlist"), undefined, timo.normalCounterType);
    var c = controller(m, "http://" + window.location.hostname +":" + window.location.port);
    var action = actions(c);
    
    var newCountdown = function (e) {
        e.preventDefault();
        var ed = moment($("#countdownDatetime").val(), "YYYY-MM-DDTHH:mm");
        
        if (ed.year() === 1899 ) {
            c.messages.error("Invalid datetime entered, please enter a datetime in the format 'YYYY-MM-DDTHH:mm', for eg. 2012-12-01T14:00");
            return;
        }

        var data = {
            _id: "asdfasfasdf",
            name: $("#countdownName").val(),
            tags: _($("#countdownTags").val().split(" ")).map(function (tag) {
                // remove # if user supplied it
                if (tag.charAt(0) === "#") {
                    return tag.slice(1,tag.length);
                }
                return tag;
            }),
            eventDate:  ed.native().getTime()
        };

        m.clear();
        m.putCountdown(data);
/*        c.newCountdown(data, function () {
            alert("added");
        });*/
    };
    $("#newcountdownForm").bind("submit", newCountdown);
    $("#countdownName").focus();

    $("#countdownDatetime").datepicker();
});

