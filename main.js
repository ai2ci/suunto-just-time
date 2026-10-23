var loadExt = function(id) {
  // 01 - get next digit style
  // 02 - get digit style id
  // 03 - get color id
  // 04 - get next color
  // 05 - get RGB convert to int by color
  // 06 - colors maps
  // 07 - get shortname template by id
  return evalFile('{file_path}/ext' + id + '.js');
}
// templates 
//  - 't' basic during activity
//  - 'u' without user inputs
//  - 'v' settings
var t = 't';
// settings:
//  - color
//  - digitStyle
var setting_mode = 'color';

function onExercisePause(input, output) {
  systemEvent('onExercisePause');
  // switch to template with no user inputs
  t = 'u';
  unload("_cm"); 
}

function onExerciseContinue(input, output) {
  systemEvent('onExerciseContinue');
  // switch to base template
  t = 't';
  unload("_cm"); 
}

function evaluate(input, output) {}

function onLoad(input, output) {
  // load defaults from localStorage
  output.color = loadExt('05')(localStorage.getItem("color"));
  output.digitStyle = loadExt('02')(localStorage.getItem("digitStyle"));
  
  // parse time to outputs
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
      case 5: // Up - next value
      case 1: // Down - previous value
        var step = eventId == 5 ? 1 : -1;
        if (setting_mode == 'color') {
          var color = localStorage.getItem("color");
          color = loadExt('04')(color, step);
          localStorage.setItem("color", color);
          output.color = loadExt('05')(color);
        } else {
          var digitStyle = localStorage.getItem("digitStyle");
          digitStyle = loadExt('01')(loadExt('02')(digitStyle), step);
          localStorage.setItem("digitStyle", digitStyle);
          output.digitStyle = loadExt('02')(digitStyle);
        }

        break;
      case 3: // middle
          setting_mode = setting_mode == 'color' ? 'digitStyle' : 'color';
        break;
    }
  }

  if (t == 't' && eventId == 2) { // common template + long down press
    // switch to settings template
    setting_mode = 'color';
    t = 'v';
    unload("_cm");
    return;
  }

}


function getUserInterface() {
  // var templateId = loadExt('02')(localStorage.getItem("digitStyle"));
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
