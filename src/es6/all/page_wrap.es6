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
let viewPort = require('../lib/ui/setViewport');
viewPort(psdWidth);



module.exports = {
	run(obj){
		if(isReady){
			obj.init();
		}else{
			cacheFns.push(function(){
				obj.init();
			});
		}


	}
};