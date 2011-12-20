
$(function () {
  console.log("readyFunc");
  var m = model($("#countdownlist"));
  var action = actions(m);

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
    

    
