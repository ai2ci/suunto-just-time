function (color) {
  // getNextColor
  switch(color) {
    case 'red':
      return 'green'
    case 'green':
      return 'blue';
    case 'blue':
      return 'azure';
    case 'azure':
      return 'yellow';
    case 'yellow':
      return 'orange';
    case 'orange':
      return 'grey';
    case 'grey':
      return 'white';
    case 'white':
    default:
      return 'red';
  }
}