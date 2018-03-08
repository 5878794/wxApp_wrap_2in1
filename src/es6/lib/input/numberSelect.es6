//双数字选择
//需要 all.css

// let numberSelect = require("numberSelect");
// new numberSelect({
// 	titleText:"请选择体重",       //@param:str    标题
// 	viewPort:750,                //@param:number 设置psd的大小，布局需要使用rem 默认：750
//  selected:[10,1],            //@param:array  选中的值
//  units:['.','kg'],           //@param:array  2列的单位
//  unit2Left:'90%',            //@param:str    第2列单位距左边屏幕的位置,默认90%;
//  textAlign:['center','center'],         //@param:array    文字对齐方式,同css,默认居中
//  values:[                    //@param:array
//      [1,2,3,4,5,6,7,8]  ,             //第一列的值
//      [0,1,2,3,4,5,6,7,8,9]           //第二列的值
//  ],
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
	createListCel1 = Symbol("createListCel1"),
	createRowDiv = Symbol("createRowDiv"),
	createListCel2 = Symbol("createListCel2"),
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
	{abs} = Math,
	getCelVal = Symbol("getCelVal");


class dateChoose extends zz{
	constructor(opt={}){
		super(opt);


		//当前选中的值
		this.titleText = opt.titleText || '请选择';
		this.selected = opt.selected || [];             //[10,1]
		this.units = opt.units || [];                   //['.','kg']
		this.values = opt.values || [];                 //[[1,2,3],[2,3,4]]
		this.textAlign = opt.textAlign || ['center','center'];
		this.unit2Left = opt.unit2Left || '90%';

		this.callback = opt.success || function(){};
		this.error = opt.error || function(){};


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
		//列1的包裹层
		this.cel1BodyDom = null;
		//列2的包裹层
		this.cel2BodyDom = null;
		//点击的列对象是哪一个
		this[touchDomN] = 0;
		//滚动列的宽度
		this[celWidth] = window.innerWidth/2;

		//dom排列顺序，用于判断点击的是哪一列
		this[touchDomList] = [];
		//列Y轴移动的距离
		this[touchDomY] = [0,0];
		//最大的滚动距离
		this[maxScrollValue] = [];
		//临时动画函数对象赋值
		this[animateTemp] = null;

		this[init]();
	}

	[init](){

		this[createDataMain]();

		this.domBody
			.append(this.cel1BodyDom)
			.append(this.cel2BodyDom);
		this[touchDomList] = [this.cel1BodyDom,this.cel2BodyDom];
		

		this[createListCel1]();
		this[createListCel2]();


		this[createDateZZ]();
		this[refreshParam]();


		this[addEvent]();
	}

	//创建2个包裹层
	[createDataMain](){
		this.domBody
			.addClass("box_h");

		let div = $("<div><p></p></div>"),
			width = '50%';
		div.css({
			width:width,
			overflow:"hidden"
		});

		this.cel1BodyDom = div.clone();
		this.cel2BodyDom = div.clone();
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

		//创建第一列的单位
		let unit1Div = $('<div>'+this.units[0]+'</div>');
		unit1Div.css({
			width:'10%',
			height:this.rowHeight+'px',
			position:'absolute',
			left:'40%',top:0,
			'text-align':'center',
			color:'rgb(0, 125, 242)',
			"font-size":this.rowFontSize+"px",
			'line-height':this.rowHeight+"px"
		});
		//创建第二列的单位
		let unit2Div = $('<div>'+this.units[1]+'</div>');
		unit2Div.css({
			width:'10%',
			height:this.rowHeight+'px',
			position:'absolute',
			left:this.unit2Left,
			top:0,
			'text-align':'center',
			color:'rgb(0, 125, 242)',
			"font-size":this.rowFontSize+"px",
			'line-height':this.rowHeight+"px"
		});
		centerDiv.append(unit1Div).append(unit2Div);


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
		var div = $("<div class='border_box'></div>");
		div.css({
			width:"100%",
			height:this.rowHeight+"px",
			'padding-right':'20%',
			"line-height":this.rowHeight+"px",
			color:this.rowColor,
			"font-size":this.rowFontSize+"px"
		});
		return div;
	}

	//创建数据列1
	[createListCel1](){
		let body = this.cel1BodyDom.find("p"),
			data = this.values[0];

		let emptyRow = (this.showRows - 1)/2;

		//补前面的空行
		for(let i=0,l=emptyRow;i<l;i++){
			let this_div = this[createRowDiv]();
			body.append(this_div);
		}


		//生成列表
		let n = 0;
		data.map((rs,i)=>{
			let this_div = this[createRowDiv]();
			if(this.selected[0] == rs){
				n = i;
			}
			this_div.text(rs).data({data:rs});
			this_div.css({
				"text-align":this.textAlign[0],
			});
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



	//创建数据列2
	[createListCel2](){
		let body = this.cel2BodyDom.find("p"),
			data = this.values[1];


		let emptyRow = (this.showRows - 1)/2;

		//补前面的空行
		for(let i=0,l=emptyRow;i<l;i++){
			let this_div = this[createRowDiv]();
			body.append(this_div);
		}

		//创建月到列表
		let n=0;
		data.map((rs,i)=>{
			let this_div = this[createRowDiv]();
			if(this.selected[1] == rs){
				n=i;
			}
			this_div.text(rs).data({data:rs});
			this_div.css({
				"text-align":this.textAlign[1],
			});
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



	//刷新参数
	[refreshParam](){
		let cel1DomHeight = this.cel1BodyDom.find("p").height(),
			cel2DomHeight = this.cel2BodyDom.find("p").height();

		this[maxScrollValue] = [
			cel1DomHeight - this[bodyDomHeight],
			cel2DomHeight - this[bodyDomHeight]
		];
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
			},
			alternate:false,          //@param:boolean  动画结束时是否反向运行，默认：false
			infinite:false            //@param:boolean  动画是否循环执行，默认：false
			// 设置该参数endFn将失效
		});
		this[animateTemp].play();
	}


	//获取列的值
	[getCelVal](n){

		let y = abs(this[touchDomY][n]),
			row = (y/this.rowHeight).toFixed(0);
		row = parseInt(row) + (this.showRows-1)/2;
		return this[touchDomList][n].find("div").eq(row).data("data");
	}

	success(){
		let year = this[getCelVal](0),
			month = this[getCelVal](1);

		this.callback([year,month]);
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