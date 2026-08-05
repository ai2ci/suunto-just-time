function (template) {
  // get next template
  switch(template) {
    case 0:
      return "line";
    case 1:
      return "weak";
    case 2:
      return "weakline";
    case 3:
    default:
      return "basic";
  }
}
