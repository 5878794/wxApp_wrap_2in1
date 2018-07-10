

let app = require('./all/page');




let page = {
	data:{
		aaa:123,
		a:[],
		c:[4,5,6],
		dd:[1,2]
	},
	init(){
		let a = [];
		for(let i=0,l=3;i<l;i++){
			a.push(i);
		}

		this.setData({a:a});


	},
	testFn(e){
		console.log(e);
		console.log('touch ok');
		console.log(e.currentTarget);
	},
	testTouch(e){
		console.log(e)
		console.log('touch start');
		console.log(e.target)
		console.log(e.currentTarget)
	},
	moveFn(e){
		console.log('touch move');
		console.log(e);
	},
	testEnd(e){
		console.log('touch end');
		console.log(e);
	},
	testLong(e){
		console.log('touch long');
		console.log(e);
	}
};

// window.page = page;

app.run(page);


