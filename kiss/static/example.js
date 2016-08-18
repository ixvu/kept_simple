var Nightmare = require('nightmare');
var nightmare = Nightmare({ show: false, width:1024, height: 768})

nightmare
  .goto('https://www.amazon.com/Polo-Ralph-Lauren-Faxon-Low/dp/B0066AJ4YG')
  .screenshot('amazon.png',{x:0,y:0,width:1024,height:768})
  .end()
  .then(function (result) {
    console.log("screenshot taken")
  })
  .catch(function (error) {
    console.error('Search failed:', error);
  });