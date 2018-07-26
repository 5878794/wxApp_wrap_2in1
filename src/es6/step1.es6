let regeneratorRuntime = require('regenerator-runtime');


let app = require('./all/page'),
	{ajax,api} = require('./all/_api');




let page = {
	data:{

	},
	init(){
		console.log(222)
	}



};

if(window){
	window.page = page;
}

app.run(page);


