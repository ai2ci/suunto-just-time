function (fontType, step) {
  // next font type, step 1 = next, -1 = previous, 0 = same; fontType is the stored enum index as a string
  // (order of "values" of fontType in manifest.json); returns [index string, id]
  // id: bit 0 = hour digits use outline font, bit 1 = minute digits use outline font
  var index = parseInt(fontType, 10);
  if (!(index >= 0 && index < 4)) return ['0', 0];
  var next = (index + step + 4) % 4;
  return ['' + next, next];
}
