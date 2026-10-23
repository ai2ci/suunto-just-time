function(fontType) {
  // get font type id: bit 0 = hour digits in outline font, bit 1 = minute digits in outline font
  switch(fontType) {
    case "hh-outline mm-solid":
      return 1;
    case "hh-solid mm-outline":
      return 2;
    case "hh-outline mm-outline":
      return 3;
    case "hh-solid mm-solid":
    default:
      return 0;
  }
}
