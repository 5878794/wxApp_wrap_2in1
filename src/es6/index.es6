

let app = require('./all/page');




let page = {
	data:{
		phone:'',
		yzm:'',
		sms:''
	},
	init(){
		console.log(123)


	}

};

if(window){
	window.page = page;
}

app.run(page);


