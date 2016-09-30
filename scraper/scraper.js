var Nightmare = require('nightmare');


class Scraper {
	constructor(){
		this.scrapingOptions = {
			x : 0,
			y : 0,
			width: 1024,
			height: 768
		}
		this.nightmare = Nightmare({
			"show" : false,
			"gotoTimeout" : 30000,
			"ignore-certificate-errors" : true })
		.viewport(this.scrapingOptions.width,this.scrapingOptions.height)
		.useragent("Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:47.0) Gecko/20100101 Firefox/47.0");
	}	

	cleanText(text) {
		return text.replace(/\n|\s+/g,' ') ;
	} 

	scrape(id,url,path,statuses){
		console.log(url);
		statuses[id] = {};
		return this.nightmare
		.goto(url)
		.then((result) => {
			console.log('Http-Staus',result.code);
			statuses[id]['http-status'] = result.code;
			return this.nightmare
			.wait('body')
			.evaluate((getElemText) => [...document.querySelectorAll('title,meta[name="TITLE"],meta[name="title"],meta[property="og:title"]')].map(x => x.innerText))
		})
		.then(result => statuses[id]['title'] = result.map(x => this.cleanText(x)))
		.then(() => {
			return this.nightmare
			.evaluate((getElemText) => [...document.querySelectorAll('meta[name="description"],meta[name="twitter:description"],meta[property="og:description"]')].map(x => x.innerText))
		})
		.then(result => statuses[id]['description'] = result.map(x => this.cleanText(x)))
		.then(() => {
			return this.nightmare
			.evaluate((getElemText) => [...document.querySelectorAll('meta[name="keywords"],meta[name="KEYWORDS"]')].map(x => x.innerText))
		})
		.then(result => statuses[id]['description'] = result.map(x => this.cleanText(x)))
		.then(()=> this.nightmare.screenshot(path))
		.catch(error => console.log('error',error) );
	}

	close(){
		console.log('Crawling completed.')
		return this.nightmare.end();
		this.nightmare.proc.disconnect();
		this.nightmare.proc.kill();
		this.nightmare.ended = true;
		this.nightmare = null;
	}
}

module.exports = Scraper;