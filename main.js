var loadExt = function(id) {
  return evalFile('{file_path}/ext' + id + '.js');
}

function evaluate(input, output) {}

function onLoad(input, output) {
  output.color = loadExt('05')(localStorage.getItem("color"));
  output.watchFace = loadExt('02')(localStorage.getItem("watchFace"));
}


function onEvent(_input, output, eventId) {
  switch (eventId) {
    case 1: // Down
      var color = localStorage.getItem("color");
      color = loadExt('04')(color);
      localStorage.setItem("color", color);
      output.color = loadExt('05')(color);

      break;
    case 2: // Down-hold
      var template = localStorage.getItem("watchFace");
      template = loadExt('01')(loadExt('02')(template));
      localStorage.setItem("watchFace", template);
      output.watchFace = loadExt('02')(template);
      unload("_cm"); 
      break;
  }
}


function getUserInterface() {
  var templateId = loadExt('02')(localStorage.getItem("watchFace"));
  return { template: loadExt('07')(templateId) };
}



// Defines the info shown at the bottom of the exercise summary info shown after the exercise.
// These values are also provided to SuuntoApp.
// This is called when exercise ends and also when user backs from exercise start panel
// without starting the exercise.
function getSummaryOutputs(input, output) {
}
