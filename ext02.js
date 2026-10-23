function(watchFace) {
  // get watchFace id
  switch(watchFace) {
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
