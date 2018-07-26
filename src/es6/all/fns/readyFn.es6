
let inputEvent = function(e){
	let id = e.currentTarget.id,
		val = e.detail.value;

	let obj = {};
	obj[id] = val;

	this.setData(obj);
};

let getParamFn = require('../../lib/fn/getParamFromUrl');


if(isWxApp){
	module.exports = function(obj){
		obj.onLoad = obj.init;

		obj.inputEvent = inputEvent;


		Page(obj);
	}
}


if(!isWxApp){
	//页面适配
	let viewPort = require('../../lib/ui/setViewport'),
		dataEventBind = require('./dataBind_wrap');
	viewPort(psdWidth);

	//页面ready事件
	let isReady = false,
		cacheFns = [],
		bindFnIsRun = false;


	$(document).ready(function(){
		isReady = true;
		cacheFns.map(fn=>{
			fn();
		})
	});


	let dataBindFn = function(obj){
		let aa = new dataEventBind({
			data:obj.data,
			runObj:obj
		});

		obj.setData = function(dd){
			aa.setData(dd);
		};
		obj.inputEvent = inputEvent;
	};

	module.exports = function(obj){
		if(isReady){
			if(!bindFnIsRun){
				bindFnIsRun = true;
				dataBindFn(obj);
				let param = getParamFn();
				obj.init(param);
			}
		}else{
			cacheFns.push(function(){
				if(!bindFnIsRun){
					bindFnIsRun = true;
					dataBindFn(obj);
					let param = getParamFn();
					obj.init(param);
				}
			});
		}
	};
}