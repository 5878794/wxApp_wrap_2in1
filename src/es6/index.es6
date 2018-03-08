

let app = require('./all/page');



let page = {
	init(){
		console.log('start')
		console.log('thisname='+this.name)
	},
	name:123
};



app.run(page);


