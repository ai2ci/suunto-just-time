function (color) {
  // getRGB
  switch(color) {
    case 'green':
      return parseInt('00aa00', 16);
    case 'blue':
      return parseInt('0000aa', 16);
    case 'azure':
      return parseInt('00aaaa', 16);
    case 'yellow':
      return parseInt('aaaa00', 16);
    case 'orange':
      return parseInt('aa5500', 16);
    case 'grey':
      return parseInt('555555', 16);
    case 'white':
      return parseInt('999999', 16);
    case 'red':
      default:
      return parseInt('aa0000', 16);
  }



  // '#00aa00',
  // '#0000aa',
  // '#00aaaa',
  // '#aaaa00',
  // '#aa5500',
  // '#555555',
  // '#999999',
  // '#aa0000',
}