function (color, step) {
  // getNextColor, step 1 = next, -1 = previous
  var colors = ['red', 'green', 'blue', 'azure', 'yellow', 'orange', 'grey', 'white'];
  var index = colors.indexOf(color);
  if (index < 0) return 'red';
  return colors[(index + step + colors.length) % colors.length];
}