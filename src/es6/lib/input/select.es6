//单选、多选控件
//需要all.css

// let select = require("select");
// new select({
// 	titleText:"请选中性别",       //@param:str             标题  默认：请选择
// 	data:[                      //@param:array(必填)      select的数据
// 		{key:"1",val:"男"},
// 		{key:"2",val:"女"}
// 	],
// 	selected:[1,2],             //@param:array(必填)    选中的key
// 	radio:true,                  //@param:boolean          单选还是多选   默认true
//  viewPort:750,                //@param:number 设置psd的大小，布局需要使用rem 默认：750
//  success:function(rs){
//          //返回选择的对象
//          //json数组，  传入的格式
//  },
//  error:function(){
//          //取消选择
//  };
// })





require("../jq/extend");
let app = require("../device"),
	zz = require("./bodyStyle"),
	$$ = require("../event/$$"),
	installSvg = require("../svg/installSvgSprite"),
	init = Symbol(),
	bindData = Symbol("bindData"),
	bindEvent = Symbol("bindEvent"),
	createListDom = Symbol("createListDom"),
	setSelectStyle = Symbol("setSelectStyle"),
	radioEvent = Symbol("radioEvent"),
	checkBoxEvent = Symbol("checkBoxEvent"),
	delSelectStyle = Symbol("delSelectStyle");




class select extends zz{
	constructor(opt={}){
		super(opt);
		//数据
		this.data = opt.data || [];
		//单选还是多选
		this.radio = ($.isBoolean(opt.radio))? opt.radio : true;
		//选中的对象
		this.selected = opt.selected || [];
		//点击确定按钮返回结果
		this.callback = opt.success || function(){};
		//取消执行
		this.closeFn = opt.error || function(){};
		//列表字体模式颜色
		this.notSelectColor = opt.notSelectColor || "#333";
		//选中的勾颜色
		this.selectedColor = opt.selectedColor || "#007df2";
		//行高 rem
		this.listLineHeight = app.rem2Px(this.viewPort,(opt.listLineHeight || 1));
		//行底部线条颜色
		this.listBottomColor = opt.listBottomColor || "#eee";
		//选中的勾的字体大小 图标字体
		this.selectedSize = app.rem2Px(this.viewPort,(opt.selectedSize || 0.32));
		//列表字体大小
		this.listFontSize = app.rem2Px(this.viewPort,(opt.listFontSize || 0.32));


		this[init]();
	}

	[init](){
		this[bindData]();
		this[bindEvent]();
		this.preventDefaultPushRefresh();
	}

	//创建行元素dom
	[createListDom](){
		let div = $("<div></div>");
		div.css3({
			width:"100%",
			"box-sizing":"border-box",
			height:this.listLineHeight+"px",
			"line-height":this.listLineHeight+"px",
			position:"relative",
			"padding-left":this.listLineHeight+"px",
			"border-bottom":"1px solid "+this.listBottomColor,
			"font-size":this.listFontSize+"px",
			color:this.notSelectColor
		}).addClass("diandian");

		let selected = $("<p></p>");
		selected.css({
			width:this.listLineHeight+"px",
			height:this.listLineHeight+"px",
			position:"absolute",
			left:0,top:0,
			display:"none",
			color:this.selectedColor,
			"text-align":"center",
			"font-size":this.selectedSize+"px"
		});
		selected.html(installSvg.get(this.svgYesId));

		div.append(selected).append("<span></span>");

		return div;
	}

	//设置选中行的样式
	[setSelectStyle](dom){
		dom.css({color:this.selectedColor})
			.addClass("__select__")
			.find("p")
			.css({display:"block"});

	}

	//清除选中的样式
	[delSelectStyle](dom){
		var _this = this;
		dom.each(function(){
			dom.css({color:_this.notSelectColor})
				.removeClass("__select__")
				.find("p")
				.css({display:"none"});
		});
	}


	//绑定数据
	[bindData](){
		let body = this.domBody,
			data = this.data,
			listDom = this[createListDom](),
			find=false,n=0;

		data.map((list,i)=>{
			let this_dom = listDom.clone(),
				this_key = list.key;

			if(this.selected.indexOf(this_key)>-1){
				if(!find){
					find = true;
					n = i;
				}
				this[setSelectStyle](this_dom);
			}


			this_dom.data({data:list});
			this_dom.find("span").text(list.val);

			body.append(this_dom);
		});

		this.domBody.addScroll();

		//滚动到第一个选中的地方
		n = (n>2)? n-2 : 0;
		this.domBody.get(0).scrollTop = n * this.listLineHeight;

	}

	//绑定事件
	[bindEvent](){
		let list = this.domBody.find("div"),
			_this = this;

		$$(list).myclickok(function(){
			if(_this.radio){
				_this.listTouchEventHandler($(this));
				_this[radioEvent](list,$(this));
			}else{
				_this.listTouchEventHandler($(this));
				_this[checkBoxEvent]($(this));
			}
		});
	}

	//列表点击后处理事件，继承的用
	listTouchEventHandler(dom){

	}

	//单选事件处理
	[radioEvent](list,dom){
		this[delSelectStyle](list);
		this[setSelectStyle](dom);
	}

	//多选事件处理
	[checkBoxEvent](dom){
		if(dom.hasClass("__select__")){
			this[delSelectStyle](dom);
		}else{
			this[setSelectStyle](dom);
		}
	}

	//重新生成列表
	reSetList(data,selected){
		//解绑列表事件
		let list = this.domBody.find("div");
		$$(list).unbind(true);
		//清除html
		this.domBody.html("");

		//重设参数
		this.selected = selected || [];
		this.data = data || [];

		//生成列表
		this[bindData]();
		this[bindEvent]();

		//重置滚动参数并阻止滚动到底和顶部的弹性滚动
		this.unPreventDefaultPushRefresh();
		this.preventDefaultPushRefresh();

		//滚动条滚动到顶部
		this.domBody.get(0).scrollTop = 0

	}

	//点击确定返回结果
	success(){
		let list = this.domBody.find("div"),
			selected = [];

		list.each(function(){
			if($(this).hasClass("__select__")){
				selected.push({
					key:$(this).data("data").key,
					val:$(this).find("span").text()
				});
			}
		});

		this.callback(selected);
		// this.destroy();
	}

	cancel(){
		this.closeFn();
		// this.destroy();
	}

	destroy(){
		let list = this.domBody.find("div");
		$$(list).unbind(true);
		super.destroy();
	}
}



module.exports = select;