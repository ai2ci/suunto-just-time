function(output, min) {
  // set time to output
  output.hour_01 = parseInt(((min / 60) % 24) % 10, 10);
  output.hour_10 = parseInt(((min / 60) % 24) / 10, 10);
  output.minute_01 = parseInt((min % 60) % 10, 10);
  output.minute_10 = parseInt((min % 60) / 10, 10);
}