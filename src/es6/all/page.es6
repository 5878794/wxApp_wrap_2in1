//兼容es7
let regeneratorRuntime = require('regenerator-runtime');




let backObj = {};


if(isWxApp){
	backObj = require('./page_wx');
}else{
	backObj = require('./page_wrap');
}


module.exports = backObj;