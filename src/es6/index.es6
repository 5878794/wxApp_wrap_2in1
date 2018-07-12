

let app = require('./all/page');




let page = {
	data:{
		aaa:123,
		a:[],
		c:[4,5,6],
		dd:[1,2],
		input1:3,
		picker:[{key:1,value:'啊'},{key:2,value:'的'}],
		picker_index:0,
		picker_date:'2018-11-11'
	},
	init(){
		let a = [];
		for(let i=0,l=3;i<l;i++){
			a.push(i);
		}

		this.setData({a:a});
		console.log(this.data.aaa);


	},
	testFn(e){
		// console.log(e);
		console.log('touch ok');
		console.log(e.currentTarget);
	},
	testTouch(e){
		// console.log(e)
		console.log('touch start');
		// console.log(e.target)
		console.log(e.currentTarget)
	},
	moveFn(e){
		console.log('touch move');
		console.log(e.currentTarget);
	},
	testEnd(e){
		console.log('touch end');
		console.log(e.currentTarget);
	},
	testLong(e){
		console.log('touch long');
		console.log(e);
	},
	input1(e){
		console.log(e)
		console.log('input:'+e.detail.value)
		console.log('dataset:'+e.currentTarget.dataset.t+'   '+e.currentTarget.dataset.test)
	},
	checkboxChange(e){
		console.log(e.detail.value);
	},
	radioChange(e){
		console.log(e.detail.value);
	},
	bindPickerChange(e){
		this.setData({
			picker_index:e.detail.value
		});
		console.log(e);
	},
	bindPickerDateChange(e){
		this.setData({
			picker_date:e.detail.value
		});
		console.log(e);
	}
};

if(window){
	window.page = page;
}
// window.page = page;

app.run(page);


