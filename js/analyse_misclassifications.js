var fs = require('fs');
var parse = require('csv-parse');

var parser = parse({delimiter: ','}, function(err, data){
  console.log(data);
});

fs.createReadStream('/home/vumaasha/clothing_sub_category/spotcheck/round_2_both_wrong.csv').pipe(parser);