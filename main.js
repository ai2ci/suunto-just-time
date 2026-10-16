var loadExt = function(id) {
  return evalFile('{file_path}/ext' + id + '.js');
}

var t = 't';
var setting_mode = 'hour';

function onExercisePause(input, output) {
  systemEvent('onExercisePause');
  t = 'u';
  unload("_cm"); 
}

function onExerciseContinue(input, output) {
  systemEvent('onExerciseContinue');
  t = 't';
  unload("_cm"); 
}

function evaluate(input, output) {}

function onLoad(input, output) {
  output.color = loadExt('05')(localStorage.getItem("color"));
  output.watchFace = loadExt('02')(localStorage.getItem("watchFace"));
  
  var min = parseInt((input.min % (24 * 3600)) / 60, 10);

  output.hour_01 = parseInt(((min / 60) % 24) % 10, 10);
  output.hour_10 = parseInt(((min / 60) % 24) / 10, 10);
  output.minute_01 = parseInt((min % 60) % 10, 10);
  output.minute_10 = parseInt((min % 60) / 10, 10);
}


function onEvent(input, output, eventId) {
  if (eventId >= 1000) {
    var min = eventId - 1000;

    output.hour_01 = parseInt(((min / 60) % 24) % 10, 10);
    output.hour_10 = parseInt(((min / 60) % 24) / 10, 10);
    output.minute_01 = parseInt((min % 60) % 10, 10);
    output.minute_10 = parseInt((min % 60) / 10, 10);
    return;
  }
  systemEvent('eventId ', eventId);

  // during settings
  if (t == 'v') {
    if (eventId == 4 || eventId == 6 || eventId == 2) { // long press any button
      // switch to common template
      t = 't';
      unload("_cm");
      return;
    }

    switch (eventId) {
      case 1: // Up
      case 5: // Down
        if (setting_mode == 'hour') {
          var color = localStorage.getItem("color");
          color = loadExt('04')(color);
          localStorage.setItem("color", color);
          output.color = loadExt('05')(color);
        } else {
          var template = localStorage.getItem("watchFace");
          template = loadExt('01')(loadExt('02')(template));
          localStorage.setItem("watchFace", template);
          output.watchFace = loadExt('02')(template);
        }

        break;
      case 3: // middle
          setting_mode = setting_mode == 'hour' ? 'minute' : 'hour';
        break;
    }
  }

  if (t == 't' && eventId == 2) { // comon template + long down press
    // switch to settings template
    t = 'v';
    unload("_cm");
    return;
  }

}


function getUserInterface() {
  // var templateId = loadExt('02')(localStorage.getItem("watchFace"));
  // return { template: loadExt('07')(templateId) };
  systemEvent('template', t);
  return { template: t };
}



// Defines the info shown at the bottom of the exercise summary info shown after the exercise.
// These values are also provided to SuuntoApp.
// This is called when exercise ends and also when user backs from exercise start panel
// without starting the exercise.
function getSummaryOutputs(input, output) {
}
