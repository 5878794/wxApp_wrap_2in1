//时间选择控件
//需要 all.css

// let date = require("date");
// new date({
// 	titleText:"请选择日期",       //@param:str    标题
// 	selected:"2016-12-12",      //@param:str    初始显示的日期， 默认：当前日期
// 	minDate:"1950-1-1",         //@param:str    最小显示时间 默认：1950-1-1
// 	maxDate:"2050-12-12",       //@param:str    最大显示时间 默认：2050-12-12
//  isShowDay:true,               //@param:bool   是否显示日,默认：true
// 	viewPort:750m,                //@param:number 设置psd的大小，布局需要使用rem 默认：750
//  success:function(rs){
//          //rs返回选择的年月日   yyyy-mm-dd
//  },
//  error:function(){
//          //取消选择
//  }
// })



require("../jq/extend");
let zz = require("./bodyStyle"),
	app = require("../device"),
	touchEvent = require("../event/simpleSlide"),
	animate = require("../fn/jsAnimate"),
	animateFn = Symbol("animateFn"),
	animateTemp = Symbol("animateTemp"),
	init = Symbol("init3"),
	createDataMain = Symbol("createDataMain"),
	createListYear = Symbol("createListYear"),
	createRowDiv = Symbol("createRowDiv"),
	createListMonth = Symbol("createListMonth"),
	createListDay = Symbol("createListDay"),
	addEvent = Symbol("addEvent"),
	createDateZZ = Symbol("createDateZZ"),
	touchEventFn = Symbol("touchEventFn"),
	touchDomN = Symbol("touchDomN"),
	touchDomY = Symbol("touchDomY"),
	celWidth = Symbol("celWidth"),
	touchDomList = Symbol("touchDomList"),
	refreshParam = Symbol("refreshParam"),
	bodyDomHeight = Symbol("bodyDomHeight"),
	maxScrollValue = Symbol("maxScrollValue"),
	autoToScrollEnd = Symbol("autoToScrollEnd"),
	changeList = Symbol("changeList"),
	rollBackTop = Symbol("rollBackTop"),
	{abs} = Math,
	getDateNumber = Symbol("getDateNumber"),
	handlerYearData = Symbol("handlerYearData"),
	getCelVal = Symbol("getCelVal"),
	getMonthData = Symbol("getMonthData"),
	handlerMinMaxDate = Symbol("handlerMinMaxDate"),
	getNowDate = Symbol("getNowDate");


class dateChoose extends zz{
	constructor(opt={}){
		super(opt);
		//当前选中的值
		let data = opt.selected || this[getNowDate]();
		data = data.split("-");
		//选中的时间
		this.year = data[0] || "";
		this.month = data[1] || "";
		this.day = data[2] || "";
		this.minDate = opt.minDate || "1950-1-1";
		this.maxDate = opt.maxDate || "2050-12-12";
		this.isShowDay = $.isBoolean(opt.isShowDay)? opt.isShowDay : true;
		this.callback = opt.success || function(){};
		this.error = opt.error || function(){};

		this.minDates = [];     //生成处理好的最小日期
		this.maxDates = [];     //生成处理好的最大日期

		//颜色
		this.rowColor = opt.rowColor || "#666";
		//字体大小
		this.rowFontSize = app.rem2Px(this.viewPort,(opt.rowHeight || 0.32));
		//一屏显示的行数,必须奇数
		this.showRows = opt.showRows || 5;



		//主体显示区域的高度
		this[bodyDomHeight] = this.domBody.height();
		//行高
		this.rowHeight = this[bodyDomHeight]/this.showRows;
		//年的包裹层
		this.yearBodyDom = null;
		//月的包裹层
		this.monthBodyDom = null;
		//日的包裹层
		this.dayBodyDom = null;
		//点击的列对象是哪一个
		this[touchDomN] = 0;
		//滚动列的宽度
		this[celWidth] = (this.isShowDay)?
							window.innerWidth/3 :
						    window.innerWidth/2;

		//dom排列顺序，用于判断点击的是年月日中的哪一列
		this[touchDomList] = [];
		//年月日列Y轴移动的距离
		this[touchDomY] = [0,0,0];
		//最大的滚动距离
		this[maxScrollValue] = [];
		//临时动画函数对象赋值
		this[animateTemp] = null;

		this[init]();
	}

	[init](){
		this[handlerMinMaxDate]();

		this[createDataMain]();

		this.domBody
			.append(this.yearBodyDom)
			.append(this.monthBodyDom);
		this[touchDomList] = [this.yearBodyDom,this.monthBodyDom];

		if(this.isShowDay){
			this.domBody.append(this.dayBodyDom);
			this[touchDomList].push(this.dayBodyDom);
		}

		this[createListYear](this.year);
		this[createListMonth](this.month);

		if(this.isShowDay){
			this[createListDay](this.day);
		}


		this[createDateZZ]();
		this[refreshParam]();


		this[addEvent]();
	}

	//获取当前时间
	[getNowDate](){
		let now = new Date(),
			year = now.getFullYear(),
			month = now.getMonth()+1,
			day = now.getDate();

		return  year+"-"+month+"-"+day;
	}

	//处理最小最大日期,默认时间
	[handlerMinMaxDate](){
		let min = this.minDate,
			max = this.maxDate;

		min = this.minDate.split("-");
		max = this.maxDate.split("-");

		let minYear = parseInt(min[0]) || 1950,
			minMonth = parseInt(min[1]) || 1,
			minDay = parseInt(min[2]) || 1,
			maxYear = parseInt(max[0]) || 2050,
			maxMonth = parseInt(max[1]) || 12,
			maxDay = parseInt(max[2]) || 28;

		this.minDates = [minYear,minMonth,minDay];
		this.maxDates = [maxYear,maxMonth,maxDay];
	}

	//创建3个包裹层
	[createDataMain](){
		this.domBody
			.addClass("box_h");

		let div = $("<div><p></p></div>"),
			width = (this.isShowDay)? '33.333333%' : '50%';
		div.css({
			width:width,
			overflow:"hidden"
		});

		this.yearBodyDom = div.clone();
		this.monthBodyDom = div.clone();

		if(this.isShowDay){
			this.dayBodyDom = div.clone();
		}
	}

	//创建效果遮罩层
	[createDateZZ](){
		this.domBody.css({
			position:"relative",
			overflow:"hidden"
		});

		//中间显示的区域
		let centerDiv = $("<div class='__temp__zz__'></div>");
		centerDiv.css3({
			width:"100%",
			height:this.rowHeight+"px",
			position:"absolute",left:0,top:"50%",
			"margin-top":-this.rowHeight/2+"px",
			"border-bottom":"1px solid #ccc",
			"border-top":"1px solid #ccc",
			"box-sizing":"border-box",
			"z-index":100
		});

		//上部分遮罩层
		let divZZ = $("<div class='__temp__zz__'></div>");
		divZZ.css3({
			width:"100%", height:"50%",
			"margin-top":-this.rowHeight/2+"px",
			background:"rgba(255,255,255,0.4)",
			position:"absolute",left:0,top:0,
			"z-index":100
		});

		//下部分的遮罩层
		let divZZ1 = $("<div class='__temp__zz__'></div>");
		divZZ1.css3({
			width:"100%", height:"50%",
			background:"rgba(255,255,255,0.4)",
			position:"absolute",left:0,
			bottom:-this.rowHeight/2+"px",
			"z-index":100
		});

		this.domBody
			.append(divZZ)
			.append(divZZ1)
			.append(centerDiv);
	}

	//创建行
	[createRowDiv](){
		var div = $("<div></div>");
		div.css({
			width:"100%",
			height:this.rowHeight+"px",
			"text-align":"center",
			"line-height":this.rowHeight+"px",
			color:this.rowColor,
			"font-size":this.rowFontSize+"px"
		});
		return div;
	}

	//创建年的数据
	[createListYear](year){
		let body = this.yearBodyDom.find("p"),
			data = this[handlerYearData]();

		let emptyRow = (this.showRows - 1)/2;

		//补前面的空行
		for(let i=0,l=emptyRow;i<l;i++){
			let this_div = this[createRowDiv]();
			body.append(this_div);
		}


		//生成年列表
		let i = -1,
			n = 0;
		data.map(rs=>{
			i++;
			let this_div = this[createRowDiv]();
			if(year == rs){
				n = i;
			}
			this_div.text(rs+"年").data({data:rs});
			body.append(this_div);
		});

		//补后面的空行
		for(let i=0,l=emptyRow;i<l;i++){
			let this_div = this[createRowDiv]();
			body.append(this_div);
		}


		//定位到选定到行
		if(n != 0){
			let length = -this.rowHeight * n;
			this[touchDomList][0].find("p").css3({
				transform:"translate3d(0,"+length+"px,0)"
			});
			this[touchDomY][0] = length;
		}
	}

	//生成年的数组
	[handlerYearData](){
		let start = this.minDates[0],
			end = this.maxDates[0];

		let data = [];
		for(var i=start,l=end;i<=l;i++){
			data.push(i);
		}

		return data;
	}

	//创建月的数据
	[createListMonth](month){
		let body = this.monthBodyDom.find("p"),
			data = this[getMonthData]();

		body.html("");

		let emptyRow = (this.showRows - 1)/2;

		//补前面的空行
		for(let i=0,l=emptyRow;i<l;i++){
			let this_div = this[createRowDiv]();
			body.append(this_div);
		}

		//创建月到列表
		let i=-1,
			n=0;
		data.map(rs=>{
			i++;
			let this_div = this[createRowDiv]();
			if(month == rs){
				n=i;
			}
			this_div.text(rs+"月").data({data:rs});
			body.append(this_div);
		});

		//补后面的空行
		for(let i=0,l=emptyRow;i<l;i++){
			let this_div = this[createRowDiv]();
			body.append(this_div);
		}


		//定位到选定到行
		if(n != 0){
			let length = -this.rowHeight * n;
			this[touchDomList][1].find("p").css3({
				transform:"translate3d(0,"+length+"px,0)"
			});
			this[touchDomY][1] = length;
		}
	}

	//获取要显示的月
	[getMonthData](){
		let year = this[getCelVal](0),
			minYear = this.minDates[0],
			maxYear = this.maxDates[0],
			minMonth = this.minDates[1],
			maxMonth = this.maxDates[1],
			start = 1,
			end = 12,
			data = [];

		if(year == minYear){
			start = minMonth;
		}
		if(year == maxYear){
			end = maxMonth;
		}

		for(let i=start,l=end;i<=l;i++){
			data.push(i);
		}

		return data;
	}

	//创建日的数据
	[createListDay](day){
		let body = this.dayBodyDom.find("p");

		body.html("");

		let emptyRow = (this.showRows - 1)/2;

		//补前面的空行
		for(let i=0,l=emptyRow;i<l;i++){
			let this_div = this[createRowDiv]();
			body.append(this_div);
		}


		//创建日到列表
		let year = this[getCelVal](0),
			month = this[getCelVal](1);
		let dateNumber = this[getDateNumber](year,month);


		let i = -1,
			n = 0;
		dateNumber.map(rs=>{
			i++;
			let this_div = this[createRowDiv]();
			if(rs == day){
				n = i;
			}
			this_div.text(rs+"日").data({data:rs});
			body.append(this_div);
		});

		//补后面的空行
		for(let i=0,l=emptyRow;i<l;i++){
			let this_div = this[createRowDiv]();
			body.append(this_div);
		}


		//定位到选定到行
		if(n != 0){
			let length = -this.rowHeight * n;
			this[touchDomList][2].find("p").css3({
				transform:"translate3d(0,"+length+"px,0)"
			});
			this[touchDomY][2] = length;
		}

	}

	//获取日的天数
	[getDateNumber](year,month){
		//获取这个月的最大天数
		let day = 0;
		switch(month){
			case 1:
			case 3:
			case 5:
			case 7:
			case 8:
			case 10:
			case 12:
				day = 31;
				break;
			case 4:
			case 6:
			case 9:
			case 11:
				day = 30;
				break;
			case 2:
				if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
					day = 29;
				}else{
					day = 28;
				}
				break;
			default:
				day = 31;
		}

		//设定的值限定判断
		let minYear = this.minDates[0],
			minMonth = this.minDates[1],
			minDay = this.minDates[2],
			maxYear = this.maxDates[0],
			maxMonth = this.maxDates[1],
			maxDay = this.maxDates[2],
			nowYear = this[getCelVal](0),
			nowMonth = this[getCelVal](1),
			min = 1,
			max = day;


		if(nowYear == minYear && nowMonth == minMonth){
			min = minDay;
			min = app.getBetweenNumber(min,minDay,maxDay);
		}
		if(nowYear == maxYear && nowMonth == maxMonth){
			max = maxDay;
			max = app.getBetweenNumber(max,min,maxDay)
		}

		let data = [];
		for(let i=min,l=max;i<=l;i++){
			data.push(i);
		}

		return data;
	}

	//刷新参数
	[refreshParam](){
		let yearDomHeight = this.yearBodyDom.find("p").height(),
			monthDomHeight = this.monthBodyDom.find("p").height();

		this[maxScrollValue] = [
			yearDomHeight - this[bodyDomHeight],
			monthDomHeight - this[bodyDomHeight]
		];

		if(this.isShowDay){
			let dayDomHeight = this.dayBodyDom.find("p").height();
			this[maxScrollValue].push(dayDomHeight - this[bodyDomHeight])
		}


	}

	//创建事件监听
	[addEvent](){
		var _this = this;


		this[touchEventFn] = new touchEvent({
			dom:this.domBody,          //@param:jqobj   要监听的dom
			bodyNotScroll:true,
			startFn:function(e){
				if(_this[animateTemp]){
					_this[animateTemp].stop();
				}

				//获取点击的是哪一列
				var touch = (e.touches)? e.touches[0] : e,
					x = touch.clientX;

				_this[touchDomN] = parseInt(x/_this[celWidth]);
			},   //@param:fn      手指按下时执行
			moveFn:function(opt){   //@param:fn      手指滑动时执行
				let m = opt.move.y,
					n = _this[touchDomN],
					y = _this[touchDomY][n] + m;

				y = app.getBetweenNumber(y,-_this[maxScrollValue][n],0);

				_this[touchDomList][n].find("p").css3({
					transform:"translate3d(0,"+y+"px,0)"
				});
			},
			endFn:function(opt,isSlide){    //@param：fn  手指释放的时候执行
				//opt同上
				//isSlide   布尔，是否触发快速滑动
				let m = opt.move.y,
					n = _this[touchDomN],
					y = _this[touchDomY][n] + m;

				y = app.getBetweenNumber(y,-_this[maxScrollValue][n],0);

				_this[touchDomList][n].find("p").css3({
					transform:"translate3d(0,"+y+"px,0)"
				});
				_this[touchDomY][n] = y;

				if(!isSlide){
					_this[autoToScrollEnd](n);
				}

			},
			slideUpFn:function(){
				let n = _this[touchDomN],
					maxY = _this[maxScrollValue][n],
					length = _this.rowHeight * 8,
					startY = _this[touchDomY][n],
					endY = startY - length,
					endN = (endY/_this.rowHeight).toFixed(0);

				endY = endN * _this.rowHeight;
				endY = app.getBetweenNumber(endY,-maxY,0);


				_this[animateFn](n,startY,endY,500);

			},       //@param:fn   快速上滑促发
			slideDownFn:function(){
				let n = _this[touchDomN],
					maxY = _this[maxScrollValue][n],
					length = _this.rowHeight * 8,
					startY = _this[touchDomY][n],
					endY = startY + length,
					endN = (endY/_this.rowHeight).toFixed(0);

				endY = endN * _this.rowHeight;
				endY = app.getBetweenNumber(endY,-maxY,0);


				_this[animateFn](n,startY,endY,500);
			},     //@param:fn   快速下滑促发
			slideMaxTime:200,       //@param：number  触发快速滑动的最大时间 默认：500 ms
			useDirection:"y"        //@param:str    "x","y","xy"
		                            //使用哪个方向的滑动   默认：x
		});
	}

	//释放时自动定位到要显示到值
	[autoToScrollEnd](n){
		let maxY = this[maxScrollValue][n],
			y = this[touchDomY][n],
			nowN = (y/this.rowHeight).toFixed(0);

		y = nowN * this.rowHeight;
		y = app.getBetweenNumber(y,-maxY,0);


		this[animateFn](n,this[touchDomY][n],y,200);

	}

	//动画到某个点
	[animateFn](n,start,end,time){
		let dom = this[touchDomList][n],
			_this = this;

		this[animateTemp] =  new animate({
			start:start,                  //@param:number   初始位置
			end:end,                    //@param:number   结束位置
			time:time,                 //@param:number   动画执行时间  ms
			type:"Cubic",             //@param:str      tween动画类别,默认：Linear 详见函数内tween函数
			class:"easeOut",           //@param:str      tween动画方式,默认：easeIn 详见函数内tween函数
			stepFn:function(val){     //@param:fn       每步执行函数,返回当前属性值
				dom.find("p").css3({
					transform:"translate3d(0,"+val+"px,0)"
				});
				_this[touchDomY][n] = val;
			},
			endFn:function(){         //@param:fn       动画结束执行
				dom.find("p").css3({
					transform:"translate3d(0,"+end+"px,0)"
				});
				_this[touchDomY][n] = end;
				_this[changeList](n);
			},
			alternate:false,          //@param:boolean  动画结束时是否反向运行，默认：false
			infinite:false            //@param:boolean  动画是否循环执行，默认：false
			// 设置该参数endFn将失效
		});
		this[animateTemp].play();
	}

	//更改列表
	[changeList](n){
		if(n==0){
			this[createListMonth]();
			this[rollBackTop](1);
			if(this.isShowDay){
				this[createListDay]();
				this[rollBackTop](2);
			}
			this[refreshParam]();
		}
		if(n==1){
			if(this.isShowDay){
				this[createListDay]();
				this[rollBackTop](2);
			}
			this[refreshParam]();
		}
	}

	//回滚到顶部
	[rollBackTop](n){
		let nowY = this[touchDomY][n];

		this[animateFn](n,nowY,0,200);
	}

	//获取列的值
	[getCelVal](n){

		let y = abs(this[touchDomY][n]),
			row = (y/this.rowHeight).toFixed(0);
		row = parseInt(row) + (this.showRows-1)/2;
		return this[touchDomList][n].find("div").eq(row).data("data");
	}

	success(){
		if(this.isShowDay){
			let year = this[getCelVal](0),
				month = this[getCelVal](1),
				day = this[getCelVal](2);

			this.callback(year+"-"+month+"-"+day);
		}else{
			let year = this[getCelVal](0),
				month = this[getCelVal](1);

			this.callback(year+"-"+month);
		}
	}

	cancel(){
		this.error();
	}

	destroy(){
		this[touchEventFn].destroy();
		super.destroy();
	}
}



module.exports = dateChoose;