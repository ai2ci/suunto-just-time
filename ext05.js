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
    case 'gray': // alias of grey
    case 'grey':
      return parseInt('555555', 16);
    case 'white':
      return parseInt('999999', 16);
    case 'red':
      return parseInt('aa0000', 16);
    default:
      systemEvent('unknown color ', color);
      return parseInt('aa0000', 16);
  }


  //  red      0: '#aa0000' '#ff0000',
  //  green    1: '#00aa00' '#00ff00',
  //  blue     2: '#0000aa' '#0000ff',
  //  azure    3: '#00aaaa' '#00ffff',
  //  yellow   4: '#aaaa00' '#ffff00',
  //  orange   5: '#aa5500' '#ffaa00',
  //  grey     6: '#555555' '#999999',
  //  white    7: '#999999' '#ffffff',
}