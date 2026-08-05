function (color) {
  // getColorIndex
  switch(color) {
    case 'red':
      return 0
    case 'green':
      return 1;
    case 'blue':
      return 2;
    case 'azure':
      return 3;
    case 'yellow':
      return 4;
    case 'orange':
      return 5;
    case 'grey':
      return 6;
    case 'white':
    default:
      return 7;
  }
}