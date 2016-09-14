var doc = " \
Usage: \
  index.js  --input=<input-json> --status=<status-json> \
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
var classificationRecords = jsonfile.readFileSync(inputFile);


var run = function * () {
  let statuses = {};
  for (var i = 0; i < classificationRecords.length; i++) {
  	let url = classificationRecords[i].url;
  	let image = classificationRecords[i].id+".png";
    yield scraper.scrape(url,image,statuses);
  }
  jsonfile.writeFileSync(statusFile,statuses);
  yield scraper.close();

}
vo(run)
.then(out => console.log('out', out))
.catch(e => {
	console.log('error',e);
});

