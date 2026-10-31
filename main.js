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

// Setting values are enum indexes stored as strings (order of "values" in manifest.json, saved this way by the Suunto app).
// Initial values come from data.json. localStorage exists only when data.json is packed into the app (not on every watch),
// so reads and writes are guarded and the values are also kept in memory for the time the app runs.
// DEFAULTS is the last resort when neither memory nor localStorage has a value (same values as data.json).
var DEFAULTS = {
  fontType: "3", // hh-outline mm-outline
  hourColor: "6", // grey
  minuteColor: "7" // white
};
var memory = {};

// localStorage can be missing (ReferenceError) or fail, both give null
var readStored = function(key) {
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(key);
    }
  } catch (x) {}
  return null;
}

var writeStored = function(key, value) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
    }
  } catch (x) {}
}

// memory (written by setSetting) -> localStorage (data.json or saved before) -> DEFAULTS
var getSetting = function(key) {
  var value = memory[key];
  if (value === undefined) {
    value = readStored(key);
  }
  return value === null || value === undefined ? DEFAULTS[key] : value;
}

var setSetting = function(key, value) {
  memory[key] = value;
  writeStored(key, value);
}

// fontType id: bit 0 = hour digits use outline font, bit 1 = minute digits use outline font
var setFontOutputs = function(output, id) {
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
  // load settings (memory, localStorage or defaults)
  // ext01.js: stored font type index -> [index, id], step 0 keeps the same font type
  setFontOutputs(output, evalFile('{file_path}/ext01.js')(getSetting("fontType"), 0)[1]);
  // ext04.js: stored colour index -> [index, RGB int], step 0 keeps the same colour
  output.hourColor = evalFile('{file_path}/ext04.js')(getSetting("hourColor"), 0)[1];
  output.minuteColor = evalFile('{file_path}/ext04.js')(getSetting("minuteColor"), 0)[1];
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
          // ext01.js: next font type (step 1 = next, -1 = previous), returns [index, id]
          var font = evalFile('{file_path}/ext01.js')(getSetting("fontType"), step);
          setSetting("fontType", font[0]);
          setFontOutputs(output, font[1]);
        } else if (setting_mode == 1) {
          // ext04.js: next colour (step 1 = next, -1 = previous), returns [index, RGB int]
          var hour = evalFile('{file_path}/ext04.js')(getSetting("hourColor"), step);
          setSetting("hourColor", hour[0]);
          output.hourColor = hour[1];
        } else {
          // ext04.js: next colour (step 1 = next, -1 = previous), returns [index, RGB int]
          var minute = evalFile('{file_path}/ext04.js')(getSetting("minuteColor"), step);
          setSetting("minuteColor", minute[0]);
          output.minuteColor = minute[1];
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
