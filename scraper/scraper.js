var Nightmare = require('nightmare');


class Scraper {
	constructor(){
		this.scrapingOptions = {
			x : 0,
			y : 0,
			width : 1024,
			height: 768
		}
		this.nightmare = Nightmare({ 
			"show" : true, 
			"gotoTimeout" : 200,
			"ignore-certificate-errors" : true })
		.viewport(this.scrapingOptions.width,this.scrapingOptions.height)
		.useragent("Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:47.0) Gecko/20100101 Firefox/47.0");
	}	

	scrape(url,path,statuses){
		console.log(url)
		var screenShot = this.nightmare.goto(url)
		.then((result) => {
			console.log('Http-Staus',result.code);
			statuses[url] = result.code;
			this.nightmare
			.wait('body')
			.screenshot(path,this.scrapingOptions);
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