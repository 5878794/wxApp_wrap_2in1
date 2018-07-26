let regeneratorRuntime = require('regenerator-runtime');


let app = require('./all/page'),
	{ajax,api} = require('./all/_api');




let page = {
	data:{

	},
	init(opt){
		console.log(opt)
	}



};

if(window){
	window.page = page;
}

app.run(page);


