
//下拉加载

// var aaa = new pushLoading({
// 	canLoadingFn:function(){            //拖动到能下载加载时触发到函数
// 		$(this).find("span").text("释放加载");
// 	},
// 	notCanLoadingFn:function(){         //拖动到不能下载加载时触发到函数
// 		$(this).find("span").text("上拉加载");
// 	},
// 	loadingFn:function(){               //加载函数
// 		$(this).find("span").text("正在加载");
//
// 		setTimeout(function(){
// 			$("body").append("<div style='background: firebrick;height: 3rem;'></div>");
// 			aaa.loadingEnd();           //添加完dom后在执行该方法隐藏loadingDom
// 		},1000);
// 	},
// 	viewport:750,                       //psd大小   使用rem布局
// 	bottomFixedDivHeight:1              //底部如果有fixed定位的dom的高度  单位rem
// });

let app = require("../device"),
	animate = require("../fn/jsAnimate"),
	points = Symbol("points"),
	hasTouched = Symbol("hasTouched"),
	y = Symbol("y"),
	animateFn = Symbol("animateFn"),
	maxScrollHeight = Symbol("maxScrollHeight"),
	init = Symbol("init"),
	createShowDom = Symbol("createShowDom"),
	refreshParam = Symbol("setParam"),
	setLoadingDomStyle = Symbol("setLoadingDomStyle"),
	addEvent = Symbol("addEvent"),
	touchStartFn = Symbol("touchStartFn"),
	touchMoveFn = Symbol("touchMoveFn"),
	touchEndFn = Symbol("touchEndFn"),
	androidTouchStart = Symbol("androidTouchStart"),
	androidTouchMove = Symbol("androidTouchMove"),
	androidTouchEnd = Symbol("androidTouchEnd"),
	savePoint = Symbol("savePoint"),
	clearPoint = Symbol("clearPoint"),
	iosHandlerScroll = Symbol("iosHandlerScroll"),
	bodyPaddingBottom = Symbol("bodyPaddingBottom"),
	isLoading = Symbol("isLoading"),
	iosScroll = Symbol("iosScroll");

var viewport,body;


class pushLoading{
	constructor(opt={}){
		viewport = opt.viewport || 320;
		body = $("body");
		this.loadingDom = opt.loadingDom || pushLoading[createShowDom]();
		this.zIndex = opt.zIndex || 1;
		this.canLoadingFn = opt.canLoadingFn || function(){};
		this.notCanLoadingFn = opt.notCanLoadingFn || function(){};
		this.loadingFn = opt.loadingFn || function(){};

		let bottomFixedDivHeight = opt.bottomFixedDivHeight || 0;
		this.bottomFixedDivHeight = app.rem2Px(viewport,bottomFixedDivHeight);




		//下拉滚动条到0的时候的偏移量
		this[y] = 0;
		//动画函数对象
		this[animateFn] = null;
		//下啦刷新dom的高度
		this.loadingDomHeight = 0;
		//滚动条能滚动的最大高度
		this[maxScrollHeight] = 0;
		//body底部padding的高度
		this[bodyPaddingBottom] = 0;
		//是否在加载中
		this[isLoading] = false;
		//记录的触摸点
		this[points] = [];

		body.css({position:"relative"});
		this[init]();
	}


	//创建上拉加载要显示的dom
	static [createShowDom](){
		let dom = $("<div><span>上拉加载</span></div>"),
			height = app.rem2Px(viewport,1.5);


		dom.css({
			width:"100%",height:height+"px",
			"text-align":"center",
			"font-size":"0.24rem",
			"line-height":height+"px"
		});

		return dom;
	}


	[init](){
		this[setLoadingDomStyle]();
		this[refreshParam]();
		this[addEvent]();
	}

	//设置刷新dom的定位
	[setLoadingDomStyle](){
		let height = parseInt(this.loadingDom.height());

		//微信背景色  rgb(48,49,51)
		this.loadingDom.css({
			position:"fixed",
			left:0,
			bottom:this.bottomFixedDivHeight+"px",
			"z-index":-1,
			background:"#fff"
		});

		let bodyBottom = parseInt(body.css("padding-bottom"));

		this[bodyPaddingBottom] = bodyBottom + this.bottomFixedDivHeight;

		body.css({
			"padding-bottom":this[bodyPaddingBottom]+"px"
		});
		body.append(this.loadingDom);
	}

	//设置参数
	[refreshParam](){
		this.loadingDomHeight = parseInt(this.loadingDom.height());

		//计算最大大滚动距离
		let bodyHeight = body.outerHeight(),
			screenHeight = window.innerHeight;
		this[maxScrollHeight] = (bodyHeight > screenHeight)? bodyHeight-screenHeight : 0;
	}

	//添加事件
	[addEvent](){
		let _this = this;
		if(!app.isAndroid){
			window.addEventListener("scroll",function(){
				_this[iosScroll]();
			},false);
			document.addEventListener(app.END_EV,this[touchEndFn] = function(e){
				_this[iosHandlerScroll]();
			},false);
		}else{
			document.addEventListener(app.START_EV,this[touchStartFn] = function(e){
				_this[androidTouchStart](e);

			},false);
			document.addEventListener(app.MOVE_EV,this[touchMoveFn] = function(e){
				_this[androidTouchMove](e);

			},false);
			document.addEventListener(app.END_EV,this[touchEndFn] = function(e){
				_this[androidTouchEnd]();
			},false);
		}

	}

	//ios
	[iosHandlerScroll](){
		if(this[isLoading]){return;}

		let scrollTop = document.body.scrollTop,
			y = scrollTop - this[maxScrollHeight];

		if(y>this.loadingDomHeight){
			let bottom = this[bodyPaddingBottom];
			bottom += this.loadingDomHeight;

			this[isLoading] = true;
			body.css({"padding-bottom":bottom+"px"});
			this.loadingDom.css({"z-index":1});

			this.loadingFn.call(this.loadingDom);
		}
	}
	//ios滚动监听
	[iosScroll](){
		if(this[isLoading]){return;}

		let scrollTop = document.body.scrollTop,
			y = scrollTop - this[maxScrollHeight];

		if(y>=this.loadingDomHeight){
			this.canLoadingFn.call(this.loadingDom);
		}else{
			this.notCanLoadingFn.call(this.loadingDom);
		}
	}


	[androidTouchStart](e){
		if(this[isLoading]){return;}

		if(this[animateFn]){
			this[animateFn].stop();
		}

		if(document.body.scrollTop >= this[maxScrollHeight].toFixed(0)){
			this[y] = 0;
			this[hasTouched] = true;
		}

		this[clearPoint]();
		this[savePoint](e);
	}
	[androidTouchMove](e){
		if(this[isLoading]){return;}
		if(!this[hasTouched]){return;}
		this[savePoint](e);

		let point_length = this[points].length;
		if(point_length<2){return;}

		let start_point = this[points][point_length-2],
			end_point = this[points][point_length-1];


		this[y] += start_point - end_point;
		this[y] = (this[y]>this.loadingDomHeight)? this.loadingDomHeight : this[y];

		if(this[y]>=0){
			e.stopPropagation();
			e.preventDefault();
			body.css({
				"padding-bottom":this[bodyPaddingBottom] + this[y] + "px"
			});
			$(window).scrollTop(body.outerHeight()-window.innerHeight);

		}

		if(this[y] >= this.loadingDomHeight*2/3){
			this.canLoadingFn.call(this.loadingDom);
		}else{
			this.notCanLoadingFn.call(this.loadingDom);
		}
	}
	[androidTouchEnd](){
		if(this.isLoading){return;}
		if(!this[hasTouched]){return;}
		this[hasTouched] = false;

		let _this = this;

		//回滚
		if(this[y]>0 && this[y]<this.loadingDomHeight*2/3){
			this[animateFn] = new animate({
				start:this[y],                  //@param:number   初始位置
				end:0,                    //@param:number   结束位置
				time:500,                 //@param:number   动画执行时间  ms
				type:"Cubic",             //@param:str      tween动画类别,默认：Linear 详见函数内tween函数
				class:"easeIn",           //@param:str      tween动画方式,默认：easeIn 详见函数内tween函数
				stepFn:function(val){     //@param:fn       每步执行函数,返回当前属性值
					body.css({
						"padding-bottom":_this[bodyPaddingBottom] + val + "px"
					});
					$(window).scrollTop(body.outerHeight()-window.innerHeight);
					_this[y] = val;
				},
				endFn:function(){         //@param:fn       动画结束执行
					body.css({
						"padding-bottom":_this[bodyPaddingBottom] + "px"
					});
					$(window).scrollTop(body.outerHeight()-window.innerHeight);
					_this[y] = 0;
				},
				alternate:false,          //@param:boolean  动画结束时是否反向运行，默认：false
				infinite:false            //@param:boolean  动画是否循环执行，默认：false
			});
			this[animateFn].play();
		}

		//执行加载
		if(this[y]>this.loadingDomHeight*2/3){
			setTimeout(function(){
				_this[animateFn] = new animate({
					start:_this[y],                  //@param:number   初始位置
					end:_this.loadingDomHeight,                    //@param:number   结束位置
					time:100,                 //@param:number   动画执行时间  ms
					type:"Cubic",             //@param:str      tween动画类别,默认：Linear 详见函数内tween函数
					class:"easeIn",           //@param:str      tween动画方式,默认：easeIn 详见函数内tween函数
					stepFn:function(val){     //@param:fn       每步执行函数,返回当前属性值
						body.css({
							"padding-bottom":_this[bodyPaddingBottom] + val + "px"
						});
						$(window).scrollTop(body.outerHeight()-window.innerHeight);
						_this[y] = val;
					},
					endFn:function(){         //@param:fn       动画结束执行
						body.css({
							"padding-bottom":_this[bodyPaddingBottom] + _this.loadingDomHeight + "px"
						});
						$(window).scrollTop(body.outerHeight()-window.innerHeight);
						_this[y] = _this.loadingDomHeight;
						_this[isLoading] = true;
						_this.loadingFn.call(_this.loadingDom);
						_this.loadingDom.css({"z-index":1});
					},
					alternate:false,          //@param:boolean  动画结束时是否反向运行，默认：false
					infinite:false            //@param:boolean  动画是否循环执行，默认：false
				});
				_this[animateFn].play();
			},500)
		}

	}


	//记录点的位置等
	[savePoint](e){
		var point = (e.touches)? e.touches[0] : e;

		var y = point.clientY;
		this[points].push(y);
	}

	//清除记录的点集合
	[clearPoint](){
		this[points] = [];
	}

	//加载完成回调
	loadingEnd(){
		body.css({"padding-bottom":this[bodyPaddingBottom]+"px"});
		this.loadingDom.css({"z-index":-1});
		this[isLoading] = false;
		this[refreshParam]();
	}

}





module.exports = pushLoading;