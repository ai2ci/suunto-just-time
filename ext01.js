function (id, step) {
  // getNextFontType, step 1 = next, -1 = previous
  var types = ['hh-basic mm-basic', 'hh-line mm-basic', 'hh-basic mm-line', 'hh-line mm-line'];
  return types[(id + step + types.length) % types.length];
}
