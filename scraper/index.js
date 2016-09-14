var doc = " \
Usage: \
  index.js  --input=<input-json> \
"
var docopt = require('docopt');
var Scraper = require('./scraper');
var vo = require('vo');

var options = docopt.docopt(doc, {version: '0.1.1rc'});
console.log(options);

scraper = new Scraper();
var classificationRecords = require(options["--input"])

var run = function * () {
  for (var i = 0; i < classificationRecords.length; i++) {
  	let url = classificationRecords[i].url;
  	let image = classificationRecords[i].id+".png";
    yield scraper.scrape(url,image);
  }
  yield scraper.close();

}

vo(run)
.then(out => console.log('out', out))
.catch(e => console.error('error',error));