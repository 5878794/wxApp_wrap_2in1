//页面ready事件
let isReady = false,
	cacheFns = [];


$(document).ready(function(){
	isReady = true;
	cacheFns.map(fn=>{
		fn();
	})
});


//页面适配
let viewPort = require('../lib/ui/setViewport'),
	dataEventBind = require('./dataBind_wrap');
viewPort(psdWidth);


let bindFnIsRun = false;
let bindFn = function(obj){
	let aa = new dataEventBind({
		data:obj.data,
		runObj:obj
	});

	obj.setData = function(dd){
		aa.setData(dd);
	};
};


module.exports = {
	run(obj){
		if(isReady){

			if(!bindFnIsRun){
				bindFnIsRun = true;
				bindFn(obj);
			}

			obj.init();
		}else{
			cacheFns.push(function(){

				if(!bindFnIsRun){
					bindFnIsRun = true;
					bindFn(obj);
				}

				obj.init();
			});
		}
	}
};