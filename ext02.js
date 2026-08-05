function(template) {
  // get template id
  switch(template) {
    case "line":
      return 1;
    case "weak":
      return 2;
    case "weakline":
      return 3;
    case "basic":
    default:
      return 0;
  }
}
