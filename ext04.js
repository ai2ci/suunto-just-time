function (color, step) {
  // next colour, step 1 = next, -1 = previous, 0 = same; color is the stored enum index as a string
  // (order of "values" of hourColor / minuteColor in manifest.json: red, green, blue, azure, yellow, orange, grey, white)
  // returns [index string, RGB int]
  var rgb = [0xaa0000, 0x00aa00, 0x0000aa, 0x00aaaa, 0xaaaa00, 0xaa5500, 0x555555, 0x999999];
  var index = parseInt(color, 10);
  if (!(index >= 0 && index < rgb.length)) return ['0', rgb[0]];
  var next = (index + step + rgb.length) % rgb.length;
  return ['' + next, rgb[next]];
}
