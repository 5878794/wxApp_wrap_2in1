let DEVICE = require("./../device");



//判断是否是数字
$.isNumber = function(val){
	return typeof val === 'number';
};
//判断是否是字符串
$.isString = function(val){
	return typeof val === 'string';
};
//判断是否是布尔
$.isBoolean = function(val){
	return typeof val === 'boolean';
};
//判断是否是对象   jqmobi有
$.isObject = function(str){
	if(str === null || typeof str === 'undefined' || $.isArray(str))
	{
		return false;
	}
	return typeof str === 'object';
};
//判断是否是数组   jqmobi有
$.isArray = function (arr){
	return arr.constructor === Array;
};
//判断是函数    jqmobi有
$.isFunction = function(fn){
	return typeof fn === 'function'
};
//判断定义值没
$.isUndefined = function(val){
	return typeof val === 'undefined'
};
//判断是否是网址
$.isUrl = function(url){
	var strRegex = "[a-zA-z]+://[^s]*";
	var re=new RegExp(strRegex);
	return re.test(url);
};
$.isJson = function(obj){
	return (typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length)
};



$.getDom = function(obj){
	var returnobj;

	if(!obj){return returnobj;}

	if($.isString(obj)){
		returnobj = document.getElementById(obj);
	}else if($.isObject(obj)){
		if(obj.length == 1){
			returnobj = obj.get(0);
		}
		if(obj.nodeType == 1){
			returnobj = obj;
		}
	}

	return returnobj;
};
$.getArray = function(str){
	return ($.isArray(str))? str : [];
};
$.getFunction = function(fn){
	return ($.isFunction(fn))? fn : function(){};
};
$.getBloom = function(str){
	return ($.isBoolean(str))? str : false;
};
$.getObj = function(obj){
	return ($.isObject(obj))? obj : {};
};
$.getNumber = function(str){
	str = parseInt(str);
	str = str || 0;
	return str;
};


//设置css样式
$.fn.css3 = function(css){
	$(this).css(DEVICE.fixObjCss(css));
	return $(this);
};
//返回style的css变换
$.css3 = function(css){
	return DEVICE.fixCss(css);
};

//div添加滚动
$.fn.addScroll = function(){
	$(this).css({
		"overflow-x":"hidden",
		"overflow-y":"scroll",
		"-webkit-overflow-scrolling" :"touch"
	});
};


//设置3d视窗 会自动包裹一层
$.fn.set3dDom = function(a){
	var b = $("<div></div>");
	b.css({'transform-style':'preserve-3d'});
	b.append($(this).children());
	$(this).css({perspective:a+'px'}).append(b);
};



//禁止所有input输入     参数type=true
//取消禁止(之前禁止的)      type=false
$.allInputCanNotUse = function(type){
	if(type){
		//不可用
		var input = $("input"),
			textarea = $("textarea"),
			select = $("select"),
			setFn = function(dom){
				let dis = dom.attr("disabled");
				if(!dis){
					dom.attr({
						disabled:"disabled"
					}).data({
						__set_disabled__:"yes"
					});
				}
			};

		input.each(function(){
			setFn($(this));
		});
		textarea.each(function(){
			setFn($(this));
		});
		select.each(function(){
			setFn($(this));
		});

	}else{
		//可用
		var input1 = $("input"),
			textarea1 = $("textarea"),
			select1 = $("select"),
			setFn1 = function(dom){
				var hasSet = dom.data("__set_disabled__");
				if(hasSet == "yes"){
					dom.removeAttr("disabled").data({
						__set_disabled__:""
					})
				}
			};

		input1.each(function(){
			setFn1($(this));
		});
		textarea1.each(function(){
			setFn1($(this));
		});
		select1.each(function(){
			setFn1($(this));
		});

	}
};



module.exports = null;