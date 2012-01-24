

$(function () {
  
  // add social mouse-over
  $("li.countdown").live("mouseenter", function (eventObject) {
    if (typeof(gapi) !== "undefined") {
      gapi.plusone.go();
    }
    if (typeof(twttr) !== "undefined") {
      twttr.widgets.load();
    }
    $(".social-link").css("display", "none");
    $(eventObject.target).find(".social-link").css("display","inline-block");
  });

  var m = model($("#countdownlist"), undefined, timo.normalCounterType);
  var c = controller(m, "http://" + window.location.hostname);
  var action = actions(c);

  $("#random").click(action.random);
  $("#fetchDay").click(action.nextDay);
  $("#fetchWeek").click(action.nextWeek);
  $("#fetchMonth").click(action.nextMonth);
  $("#fetchYear").click(action.nextYear);

  //pagination
  $("#next_link").click(action.next);
  $("#prev_link").click(action.prev);

  $("#searchForm").bind("submit", action.search);

  $("#searchbox").keyup(function (e) {
      if (e.which == 13) {
          e.preventDefault();
          action.search(parseSearchData($("#searchbox").val()));
      } else if (e.keyCode == 27) {
          e.preventDefault();
          $("#searchbar").toggle();
      }
  });

});
    
var parseSearchData = function (text) {
    var i =  _(text.split(' ')).chain().reduce(function (o, ww) {
        if (ww[0] == "#") {
            o.tags.push(ww.slice(1, o.length));
        } else {
            o.names.push(ww);
        }
        return o;
    }, {names: [], tags: []}).value();
    
    var sd = {};
    
    if (i.tags.length > 0) {
        sd.tags = i.tags.join(",");
    }
    if (i.names.length > 0) {
        sd.name = i.names.join(" ");
    }
    return (i.names.length > 0 || i.tags.length > 0) ? sd : { name: "" };
};

