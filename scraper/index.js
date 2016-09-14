var doc = " \
Usage: \
  index.js  --input=<input-json> --status=<status-json> --output=<out-path> \
"
var docopt = require('docopt');
var Scraper = require('./scraper');
var vo = require('vo');
var jsonfile = require('jsonfile');

var options = docopt.docopt(doc, {version: '0.1.1rc'});
console.log(options);

scraper = new Scraper();
var inputFile = options["--input"];
var statusFile = options["--status"];
var errorFile = options["--error"];
var outPath = options["--output"];
var classificationRecords = jsonfile.readFileSync(inputFile);


var run = function * () {
  let statuses = {};
  for (var i = 0; i < classificationRecords.length; i++) {
  	let url = classificationRecords[i].url;
  	let id = classificationRecords[i].id;
  	let image = outPath+"/"+id+".png";
    yield scraper.scrape(id,url,image,statuses);
  }
  jsonfile.writeFileSync(statusFile,statuses);
  yield scraper.close();

}
vo(run)
.then(out => console.log('out', out))
.catch(e => {
	console.log('error',e);
});

