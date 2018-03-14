let device = require('../device');


//stamp2time和time2stamp   2个时间转换的毫秒数会被忽略。
let getDateTime = function(b){
	b = b || new Date().getTime();
	var a = new Date(parseInt(b));
	var year=a.getFullYear();
	var month=parseInt(a.getMonth())+1;
	month= (month<10)? "0"+month : month;
	var date=a.getDate();
	date= (date<10)? "0"+date : date;
	var hours=a.getHours();
	hours= (hours<10)? "0"+hours : hours;
	var minutes=a.getMinutes();
	minutes= (minutes<10)? "0"+minutes : minutes;
	var seconds=a.getSeconds();
	seconds= (seconds<10)? "0"+seconds : seconds;

	return year+"-"+month+"-"+date+" "+hours+":"+minutes+":"+seconds;
};


//传入时间戳，输出日期部分
let getDate = function (b) {
	b = b || new Date().getTime();
	var a = new Date(parseInt(b));
	var year = a.getFullYear();
	var month = parseInt(a.getMonth()) + 1;
	month = (month < 10) ? "0" + month : month;
	var date = a.getDate();
	date = (date < 10) ? "0" + date : date;
	return year + "-" + month + "-" + date;
};


//a :   2012-12-13   2012-12-12 12:12:33  自动补位
let getStamp = function(a){
	if(!a){
		return new Date().getTime();
	}


	var new_str = a.replace(/:/g,'-');
	new_str = new_str.replace(/ /g,'-');
	new_str = new_str.replace(/\//ig,'-');
	var arr = new_str.split("-");
	if(arr.length != 6){
		for(var i= 0,l=6-arr.length;i<l;i++){
			arr.push(0);
		}
	}

	return new Date(Date.UTC(arr[0],arr[1]-1,arr[2],arr[3]-8,arr[4],arr[5])).getTime();
};


//a=20110104
let getStamp1 = function(a){
	if(!a){return new Date().getTime();}
	a = a.toString();
	let year = a.substr(0,4),
		month = a.substr(4,2),
		day = a.substr(6,2),
		date = year + '-' + month +'-'+day;

	if(device.isIpad || device.isIphone){
		date = date.replace(/\-/ig,'\/');
	}

	return new Date(date).getTime();


};


module.exports = {getDateTime,getDate,getStamp,getStamp1};