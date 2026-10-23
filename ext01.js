function (id, step) {
  // getNextDigitStyle, step 1 = next, -1 = previous
  var styles = ['basic', 'line', 'weak', 'weakline'];
  return styles[(id + step + styles.length) % styles.length];
}
