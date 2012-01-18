$(function () {
  
  var m = model($("#countdownlist"), undefined, timo.normalCounterType);
  var c = controller(m, "http://" + window.location.hostname + ":55555");
  var action = actions(c);

});
    
