
//下拉刷新

// new pullRefresh({
// 	canRefreshFn:function(){
//      //函数自己生成的div需要这样设置修改文字
// 		$(this).find("span").text("释放刷新");
// 	},
// 	notCanRefreshFn:function(){
// 		$(this).find("span").text("下拉刷新");
// 	},
// 	refreshFn:function(){
// 		window.location.reload();
// 	},
//  viewport:750  //psd效果图大小。前提使用rem布局
// });



let app = require("../device"),
	animate = require("../fn/jsAnimate"),
	viewport = 750,
	setRefreshDomStyle = Symbol(),
	init = Symbol(),
	createShowDom = Symbol(),
	addEvent = Symbol(),
	touchStartFn = Symbol(),
	touchMoveFn = Symbol(),
	touchEndFn = Symbol(),
	iosTouchStart = Symbol(),
	iosTouchMove = Symbol(),
	iosTouchEnd = Symbol(),
	androidTouchStart = Symbol(),
	androidTouchMove = Symbol(),
	androidTouchEnd = Symbol(),
	savePoint = Symbol(),
	clearPoint = Symbol(),
	points = Symbol(),
	hasTouched = Symbol(),
	y = Symbol(),
	animateFn = Symbol(),
	setParam = Symbol(),
	maxPullHeight = Symbol(),
	body = "";

require("../jq/extend");




class pullRefresh{
	constructor(opt = {}){
		viewport = opt.viewport || 320;
		body = $("body");
		//下啦刷新时要显示的dom
		this.refreshDom = opt.refreshDom || pullRefresh[createShowDom]();
		this.canRefreshFn = opt.canRefreshFn || function(){};
		this.notCanRefreshFn = opt.notCanRefreshFn || function(){};
		this.refreshFn = opt.refreshFn || function(){};


		//按下的点的集合
		this[points] = [];
		//是否已经按下
		this[hasTouched] = false;
		//下拉滚动条到0的时候的偏移量
		this[y] = 0;
		//动画函数对象
		this[animateFn] = null;
		//最大下拉高度
		this[maxPullHeight] = 0;


		this[init]();

	}

	[init](){
		this[setParam]();
		this[setRefreshDomStyle]();
		this[addEvent]();
	}

	//刷新参数
	[setParam](){
		this[maxPullHeight] = parseInt(this.refreshDom.height());
	}

	//设置刷新dom的定位
	[setRefreshDomStyle](){
		let height = parseInt(this.refreshDom.height());

		//微信背景色  rgb(48,49,51)
		this.refreshDom.css({
			position:"absolute",
			left:0,
			top:-height+"px",
			background:"#fff"
		});

		//ios超出弹性部分的遮挡层
		let wxZZ = $("<div></div>");
		wxZZ.css({
			position:"absolute",
			left:0,top:"-1000px",width:"100%",height:"1000px",
			background:"#fff"
		});
		this.refreshDom.append(wxZZ);

		body.append(this.refreshDom);
	}

	//创建刷新的dom
	static [createShowDom](){
		let dom = $("<div><span>下拉刷新</span></div>"),
			height = app.rem2Px(viewport,1.5);


		dom.css({
			 width:"100%",height:height+"px",
			"text-align":"center",
			"font-size":"0.24rem",
			"line-height":height+"px"
		});

		return dom;
	}

	//添加事件
	[addEvent](){
		let _this = this;
		document.addEventListener(app.START_EV,this[touchStartFn] = function(e){
			if(app.isAndroid){
				_this[androidTouchStart](e);
			}else{
				_this[iosTouchStart](e);
			}

		},false);
		document.addEventListener(app.MOVE_EV,this[touchMoveFn] = function(e){
			if(app.isAndroid){
				_this[androidTouchMove](e);
			}else{
				_this[iosTouchMove](e);
			}

		},false);
		document.addEventListener(app.END_EV,this[touchEndFn] = function(e){
			if(app.isAndroid){
				_this[androidTouchEnd]();
			}else{
				_this[iosTouchEnd]();
			}

		},false);
	}

	//ios 按下时
	[iosTouchStart](){
		if(this[animateFn]){
			this[animateFn].stop();
		}
	}
	//android
	[androidTouchStart](e){
		if(this[animateFn]){
			this[animateFn].stop();
		}

		if($(window).scrollTop() == 0){
			this[y] = 0;
			this[hasTouched] = true;
		}

		this[clearPoint]();
		this[savePoint](e);
	}

	//ios 移动
	[iosTouchMove](e){
		let l = -$(window).scrollTop();

		if(l>0){
			body.css3({
				transform:"translate3d(0,"+ l/10+"px,0)"
			});
			this[y] = l/10;
		}
		if(l+l/10 >= this[maxPullHeight]){
			this.canRefreshFn.call(this.refreshDom);
		}else{
			this.notCanRefreshFn.call(this.refreshDom);
		}
	}
	//android
	[androidTouchMove](e){
		if(!this[hasTouched]){return;}
		this[savePoint](e);



		let point_length = this[points].length;
		if(point_length<2){return;}

		let start_point = this[points][point_length-2],
			end_point = this[points][point_length-1];


		this[y] += end_point - start_point;
		this[y] = (this[y]>this[maxPullHeight])? this[maxPullHeight] : this[y];

		if(this[y]>=0){
			e.stopPropagation();
			e.preventDefault();
			$(window).scrollTop(0);
			body.css3({
				transform:"translate3d(0,"+this[y]+"px,0)"
			});
		}

		if(this[y] >= this[maxPullHeight]*2/3){
			this.canRefreshFn.call(this.refreshDom);
		}else{
			this.notCanRefreshFn.call(this.refreshDom);
		}
	}

	//ios 释放
	[iosTouchEnd](){
		let l = this[y],
			_this = this;

		if(l>0){
			this[animateFn] = new animate({
				start:l,                  //@param:number   初始位置
				end:0,                    //@param:number   结束位置
				time:500,                 //@param:number   动画执行时间  ms
				type:"Cubic",             //@param:str      tween动画类别,默认：Linear 详见函数内tween函数
				class:"easeIn",           //@param:str      tween动画方式,默认：easeIn 详见函数内tween函数
				stepFn:function(val){     //@param:fn       每步执行函数,返回当前属性值
					body.css3({
						transform:"translate3d(0,"+val+"px,0)"
					});
					_this[y] = val;
				},
				endFn:function(){         //@param:fn       动画结束执行
					body.css3({
						transform:""
					});
					_this[y] = 0;
				},
				alternate:false,          //@param:boolean  动画结束时是否反向运行，默认：false
				infinite:false            //@param:boolean  动画是否循环执行，默认：false
			});
			this[animateFn].play();
		}

		//执行刷新
		if(l+l*10>this[maxPullHeight]){
			setTimeout(function(){
				_this.refreshFn();
			},500)
		}
	}
	//android
	[androidTouchEnd](){
		if(!this[hasTouched]){return;}
		this[hasTouched] = false;

		let _this = this;

		//回滚
		if(this[y]>0 && this[y]<this[maxPullHeight]*2/3){
			this[animateFn] = new animate({
				start:this[y],                  //@param:number   初始位置
				end:0,                    //@param:number   结束位置
				time:500,                 //@param:number   动画执行时间  ms
				type:"Cubic",             //@param:str      tween动画类别,默认：Linear 详见函数内tween函数
				class:"easeIn",           //@param:str      tween动画方式,默认：easeIn 详见函数内tween函数
				stepFn:function(val){     //@param:fn       每步执行函数,返回当前属性值
					$(window).scrollTop(0);
					body.css3({
						transform:"translate3d(0,"+val+"px,0)"
					});
					_this[y] = val;
				},
				endFn:function(){         //@param:fn       动画结束执行
					$(window).scrollTop(0);
					body.css3({
						transform:""
					});
					_this[y] = 0;
				},
				alternate:false,          //@param:boolean  动画结束时是否反向运行，默认：false
				infinite:false            //@param:boolean  动画是否循环执行，默认：false
			});
			this[animateFn].play();
		}

		//执行刷新
		if(this[y]>this[maxPullHeight]*2/3){
			setTimeout(function(){
				_this[animateFn] = new animate({
					start:_this[y],                  //@param:number   初始位置
					end:0,                    //@param:number   结束位置
					time:500,                 //@param:number   动画执行时间  ms
					type:"Cubic",             //@param:str      tween动画类别,默认：Linear 详见函数内tween函数
					class:"easeIn",           //@param:str      tween动画方式,默认：easeIn 详见函数内tween函数
					stepFn:function(val){     //@param:fn       每步执行函数,返回当前属性值
						$(window).scrollTop(0);
						body.css3({
							transform:"translate3d(0,"+val+"px,0)"
						});
						_this[y] = val;
					},
					endFn:function(){         //@param:fn       动画结束执行
						$(window).scrollTop(0);
						body.css3({
							transform:""
						});
						_this[y] = 0;
					},
					alternate:false,          //@param:boolean  动画结束时是否反向运行，默认：false
					infinite:false            //@param:boolean  动画是否循环执行，默认：false
				});
				_this[animateFn].play();
				$(window).scrollTop(0);
				setTimeout(function(){
					_this.refreshFn();
				},500);
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

}


module.exports = pullRefresh;