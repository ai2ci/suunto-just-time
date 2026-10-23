function(digitStyle) {
  // get digit style id
  switch(digitStyle) {
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
