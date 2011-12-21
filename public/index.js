

$(function () {
  console.log("readyFunc");
  var m = model($("#countdownlist"));
  var c = controller(m, "http://" + window.location.hostname + ":55555");
  var action = actions(c);

  $("#random").click(action.random);

  $("#fetchDay").click(action.nextDay);
  $("#fetchWeek").click(action.nextWeek);
  $("#fetchMonth").click(action.nextMonth);
  $("#fetchYear").click(action.nextYear);

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

