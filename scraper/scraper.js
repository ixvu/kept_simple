var Nightmare = require('nightmare');


class Scraper {
	constructor(){
		this.scrapingOptions = {
			x : 0,
			y : 0,
			width: 1024,
			height: 2000
		}
		this.nightmare = Nightmare({
			"show" : false,
			"gotoTimeout" : 30000,
			"ignore-certificate-errors" : true })
		.viewport(this.scrapingOptions.width,this.scrapingOptions.height)
		.useragent("Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:47.0) Gecko/20100101 Firefox/47.0");
	}	

	scrape(id,url,path,statuses){
		console.log(url)
		var screenShot = this.nightmare.goto(url)
		.then((result) => {
			console.log('Http-Staus',result.code);
			statuses[id] = result.code;
			this.nightmare
			.wait('body')
			.screenshot(path);
		})
		.catch(error => console.log('error',error) );
		console.log("done")
		return screenShot;
	}

	close(){
		return this.nightmare.end();
	}
}

module.exports = Scraper;