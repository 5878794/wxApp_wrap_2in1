




//窗口隐藏后显示时执行   android >=4.4  ios all
//DEVICE.windowShowRun(function(){
//    console.log(123)
//});

var hidden, state, visibilityChange;
if (typeof document.hidden !== "undefined") {
	hidden = "hidden";
	visibilityChange = "visibilitychange";
	state = "visibilityState";
} else if (typeof document.mozHidden !== "undefined") {
	hidden = "mozHidden";
	visibilityChange = "mozvisibilitychange";
	state = "mozVisibilityState";
} else if (typeof document.msHidden !== "undefined") {
	hidden = "msHidden";
	visibilityChange = "msvisibilitychange";
	state = "msVisibilityState";
} else if (typeof document.webkitHidden !== "undefined") {
	hidden = "webkitHidden";
	visibilityChange = "webkitvisibilitychange";
	state = "webkitVisibilityState";
}


var isHiddened = false,
	fn = function(){};
document.addEventListener(visibilityChange, function(e) {
	if(document[hidden]){
		isHiddened = true;
	}else{
		if(isHiddened){
			fn();
		}
	}
}, false);


module.exports = function(callback){
	fn = callback || function(){};
};


//判断当前窗口是否被隐藏  （最小化，切换tab会触发）

//document.addEventListener('visibilitychange', function(e) {
//    console.log('hidden:' + document.hidden,
//        'state:' + document.visibilityState)
//
//
//      //document.hidden               隐藏：true   显示：false
//      //document.visibilityState      隐藏：hidden  显示：visible
//
//}, false);