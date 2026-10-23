var loadExt = function(id) {
  // 01 - get next font type
  // 02 - get font type id
  // 04 - get next color
  // 05 - get RGB convert to int by color
  return evalFile('{file_path}/ext' + id + '.js');
}
// templates
//  - 't' main during activity
//  - 'u' without user inputs
//  - 'v' settings
var t = 't';
// settings (middle button switches between them):
//  - 0 fontType (hour and minute digits, each solid or outline)
//  - 1 hourColor
//  - 2 minuteColor
var setting_mode = 0;

var getSetting = function(key, defaultValue) {
  return localStorage.getItem(key) || defaultValue;
}

// fontType id: bit 0 = hour digits use outline font, bit 1 = minute digits use outline font
var setFontOutputs = function(output, fontType) {
  var id = loadExt('02')(fontType);
  output.hourFont = id % 2;
  output.minuteFont = parseInt(id / 2, 10);
}

function onExercisePause(input, output) {
  // switch to template with no user inputs
  t = 'u';
  unload("_cm");
}

function onExerciseContinue(input, output) {
  // switch to base template
  t = 't';
  unload("_cm");
}

function evaluate(input, output) {}

function onLoad(input, output) {
  // load defaults from localStorage
  setFontOutputs(output, getSetting("fontType", "hh-outline mm-outline"));
  output.hourColor = loadExt('05')(getSetting("hourColor", "white"));
  output.minuteColor = loadExt('05')(getSetting("minuteColor", "grey"));
  output.settingMode = setting_mode;
}


function onEvent(input, output, eventId) {
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
        if (setting_mode == 0) {
          var fontType = loadExt('01')(loadExt('02')(getSetting("fontType", "hh-outline mm-outline")), step);
          localStorage.setItem("fontType", fontType);
          setFontOutputs(output, fontType);
        } else if (setting_mode == 1) {
          var hourColor = loadExt('04')(getSetting("hourColor", "white"), step);
          localStorage.setItem("hourColor", hourColor);
          output.hourColor = loadExt('05')(hourColor);
        } else {
          var minuteColor = loadExt('04')(getSetting("minuteColor", "grey"), step);
          localStorage.setItem("minuteColor", minuteColor);
          output.minuteColor = loadExt('05')(minuteColor);
        }

        break;
      case 3: // middle
        setting_mode = (setting_mode + 1) % 3;
        output.settingMode = setting_mode;
        break;
    }
  }

  if (t == 't' && eventId == 2) { // common template + long down press
    // switch to settings template
    setting_mode = 0;
    output.settingMode = setting_mode;
    t = 'v';
    unload("_cm");
    return;
  }

}


function getUserInterface() {
  return { template: t };
}



// Defines the info shown at the bottom of the exercise summary info shown after the exercise.
// These values are also provided to SuuntoApp.
// This is called when exercise ends and also when user backs from exercise start panel
// without starting the exercise.
function getSummaryOutputs(input, output) {
}
