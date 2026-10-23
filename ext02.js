function(fontType) {
  // get font type id: bit 0 = hour digits in line font, bit 1 = minute digits in line font
  switch(fontType) {
    case "hh-line mm-basic":
      return 1;
    case "hh-basic mm-line":
      return 2;
    case "hh-line mm-line":
      return 3;
    case "hh-basic mm-basic":
    default:
      return 0;
  }
}
