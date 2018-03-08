


require("../jq/extend");
require("../css/all");

let app = require("../device"),
	$$ = require("../event/$$"),
	installSvg = require("../svg/installSvgSprite"),
	svgYesId = "submit_"+new Date().getTime(),
	svgCloseId = "close_"+new Date().getTime(),
	//x图标
	svgSpriteYes = '<svg><symbol id="icon-dui" viewBox="0 0 1024 1024"><path d="M887.232 266.688c-12.16-13.632-32.448-14.336-45.248-1.344l-417.344 421.504L182.016 441.728C169.152 428.8 148.928 429.376 136.768 443.008c-12.16 13.632-11.648 35.328 1.216 48.256l264.64 267.392c2.048 2.048 4.416 3.2 6.784 4.544 1.088 0.704 1.984 1.664 3.136 2.112C416.448 767.04 420.544 768 424.64 768s8.192-0.96 12.032-2.624c1.088-0.448 1.984-1.408 3.008-2.048 2.368-1.344 4.864-2.56 6.912-4.608l439.36-443.776C898.816 301.952 899.392 280.384 887.232 266.688z"  ></path></symbol></svg>',
	svgSpriteClose = '<svg><symbol id="icon-weibiaoti101" viewBox="0 0 1024 1024"><path d="M553.568 512l270.112-270.112c11.488-11.488 11.488-30.08 0-41.568-11.488-11.488-30.08-11.488-41.568 0L512 470.432 241.888 200.352c-11.488-11.488-30.08-11.488-41.568 0-11.488 11.488-11.488 30.08 0 41.568L470.432 512l-270.112 270.112c-11.488 11.488-11.488 30.08 0 41.568 11.488 11.488 30.08 11.488 41.568 0L512 553.568l270.112 270.112c11.488 11.488 30.08 11.488 41.568 0 11.488-11.488 11.488-30.08 0-41.568L553.568 512z"  ></path></symbol></svg>',
	init = Symbol("init"),
	createZZ = Symbol("createZZ"),
	createMain = Symbol("createMain"),
	createTitle = Symbol("createTitle"),
	createCloseBtn = Symbol("createCloseBtn"),
	createYseBtn = Symbol("createYseBtn"),
	createBody = Symbol("createBody"),
	moveFn = "",
	startFn = "",
	addEvent = Symbol("addEvent");


class bodyStyle{
	constructor(opt={}){
		//线条颜色
		this.lineColor = opt.lineColor || "#ddd";
		//背景色
		this.bg = opt.bg || "#fff";
		//viewport大小
		this.viewPort = opt.viewPort || 750;
		//其它字体大小
		this.fontSize = app.rem2Px(this.viewPort,(opt.fontSize || 0.24));
		//字体颜色
		this.fontColor = opt.fontColor || "#333";


		//标题栏高度 rem
		this.titleHeight = app.rem2Px(this.viewPort,(opt.titleHeight || 0.9));
		//标题栏字体大小
		this.titleFontSize = app.rem2Px(this.viewPort,(opt.titleFontSize || 0.32));
		//标题名称
		this.titleText = opt.titleText || "请选择";

		//关闭按钮颜色
		this.closeBtnColor = opt.closeBtnColor || "#999";
		//关闭按钮大小 图标是字体
		this.closeBtnFontSize = app.rem2Px(this.viewPort,(opt.closeBtnFontSize || 0.4));
		//确定按钮颜色
		this.yesBtnColor = opt.yesBtnColor || "#007df2";
		//确定按钮大小 图标是字体
		this.yesBtnFontSize = app.rem2Px(this.viewPort,(opt.yesBtnFontSize || 0.4));


		//遮罩层dom
		this.domZZ = null;
		//主体层dom
		this.domMain = null;
		//容器层dom
		this.domBody = null;
		//标题层dom
		this.domTitle = null;
		//关闭按钮
		this.domClose = null;
		//确认按钮
		this.domYes = null;

		this.svgYesId = svgYesId;
		this.svgCloseId = svgCloseId;


		installSvg.set(svgSpriteYes,svgYesId);
		installSvg.set(svgSpriteClose,svgCloseId);

		this[init]();
	}

	[init](){
		$.allInputCanNotUse(true);

		this[createZZ]();
		this[createMain]();
		this[createTitle]();
		this[createCloseBtn]();
		this[createYseBtn]();
		this[createBody]();
		this[addEvent]();



		this.domTitle.append(this.domClose).append(this.domYes);
		this.domMain.append(this.domTitle).append(this.domBody);
		this.domZZ.append(this.domMain);

		$("body").append(this.domZZ);

	}

	//创建遮罩层
	[createZZ](){
		let div = $("<div></div>");
		div.css({
			width:"100%",
			height:"100%",
			position:"fixed",
			left:0,top:0,
			background:"rgba(0,0,0,0.5)",
			'z-index':1000
		});

		this.domZZ = div;
	}

	//创建主体层
	[createMain](){
		let div = $("<div></div>");
		div.css3({
			width:"100%",
			"height":"50%",
			position:"absolute",
			left:0,bottom:0,
			background:this.bg,
			display:"box",
			"box-orient":"vertical",
			color:this.fontColor,
			"font-size":this.fontSize+"px",
			'z-index':1001
		});

		this.domMain = div;
	}

	//创建标题层
	[createTitle](){
		let div = $("<div>"+this.titleText+"</div>");
		div.css3({
			width:"100%",
			height:this.titleHeight+"px",
			"text-align":"center",
			"line-height":this.titleHeight+"px",
			"font-size":this.titleFontSize+"px",
			position:"relative",
			"border-bottom":"1px solid "+this.lineColor,
			"box-sizing":"border-box",
			padding:"0 "+this.titleHeight+"px"
		}).addClass("diandian");
		this.domTitle = div;
	}

	//创建关闭按钮
	[createCloseBtn](){
		let div = $("<div></div>");
		div.css3({
			position:"absolute",
			left:0,
			top:0,
			width:this.titleHeight+"px",
			height:this.titleHeight+"px",
			"text-align":"center",
			"line-height":this.titleHeight+"px",
			"font-size":this.closeBtnFontSize+"px",
			color:this.closeBtnColor
		});
		div.html(installSvg.get(svgCloseId));

		this.domClose = div;
	}

	//创建确定按钮
	[createYseBtn](){
		let div = $("<div></div>");
		div.css3({
			position:"absolute",
			right:0,
			top:0,
			width:this.titleHeight+"px",
			height:this.titleHeight+"px",
			"text-align":"center",
			"line-height":this.titleHeight+"px",
			"font-size":this.yesBtnFontSize+"px",
			color:this.yesBtnColor
		});
		div.html(installSvg.get(svgYesId));

		this.domYes = div;
	}

	//创建主窗口
	[createBody](){
		var div = $("<div></div>");
		div.addClass("boxflex1");

		this.domBody = div;
	}

	//添加事件
	[addEvent](){
		let _this = this;
		$$(this.domYes).myclickok(function(e){
			e.stopPop();
			_this.success();
			_this.destroy();
		});
		$$(this.domMain).myclickdown(function(){}).
			myclickup(function(){}).
			myclickok(function(e){
				e.stopPop();
		});

		$$(this.domClose).myclickok(function(){
			_this.cancel();
			_this.destroy();
		});
		$$(this.domZZ).myclickok(function(){
			_this.destroy();
		}).myclickdown(function(){})
			.myclickup(function(){});

	}

	//阻止div顶部时下啦触发下啦刷新
	preventDefaultPushRefresh(){
		let points = [],
			_this = this,
			savePoint = function(e){
				var touch;
				if (e.touches) {
					touch = e.touches[0];
				} else {
					touch = e;
				}
				points.push(touch.pageY);
			},
			maxScrollTop = this.domBody.get(0).scrollHeight,
			bodyHeight = this.domBody.height().toFixed(0);
		maxScrollTop = maxScrollTop - bodyHeight;




		this.domZZ.get(0).addEventListener(app.START_EV,startFn = function(e){
			points = [];
			savePoint(e);
		},false);


		this.domZZ.get(0).addEventListener(app.MOVE_EV,moveFn = function(e){
			savePoint(e);
			let s_p = points[points.length-2],
				e_p = points[points.length-1];
			//阻止向上的滑动
			if(_this.domBody.scrollTop()==0 && e_p>s_p){
				e.preventDefault();
			}
			//阻止向下的滑动
			if(_this.domBody.scrollTop()==maxScrollTop && e_p<s_p){
				e.preventDefault();
			}
		},false);
	}

	//取消阻止div顶部时下啦触发下啦刷新
	unPreventDefaultPushRefresh(){
		if(startFn){
			this.domZZ.get(0).removeEventListener(app.START_EV,startFn,false);
		}
		if(moveFn){
			this.domZZ.get(0).removeEventListener(app.MOVE_EV,moveFn,false);
		}
	}

	//点击确定按钮返回,子类继承覆盖
	success(){

	}

	cancel(){

	}


	//销毁
	destroy(){
		setTimeout(function(){
			$.allInputCanNotUse(false);
		},500);
		$$(this.domYes).unbind(true);
		$$(this.domClose).unbind(true);
		$$(this.domZZ).unbind(true);
		$$(this.domMain).unbind(true);
		this.unPreventDefaultPushRefresh();

		this.domZZ.remove();

		installSvg.del(svgYesId);
		installSvg.del(svgCloseId);
	}
}


module.exports = bodyStyle;


