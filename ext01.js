function (id, step) {
  // getNextFontType, step 1 = next, -1 = previous
  var types = ['hh-solid mm-solid', 'hh-outline mm-solid', 'hh-solid mm-outline', 'hh-outline mm-outline'];
  return types[(id + step + types.length) % types.length];
}
