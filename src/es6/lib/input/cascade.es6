//级联菜单

// let winDiv = require("./lib/input/cascade");
// new winDiv({
// 	titleText:"请选择日期",       //标题名称
// 	areaData:areaData,          //菜单数据 参见 /lib/code/areaCode.es6
// 	areaSelected:[2,3924,3],    //已选中的数据
// 	startParentId:1,            //初始第一层搜索数据中的parent=1的生成列表
// 	viewPort:750m,              //设置psd的大小，布局需要使用rem 默认：750
// 	success:function(rs){
// 		console.log(rs);        //选择完成返回数组，数组中对象格式和传入一样
// 	},
//  error:function(){
//          //取消选择
//  }
// });




require("../jq/extend");
let select = require("./select"),
	$$ = require("../event/$$"),
	init = Symbol(),
	createShowSelectedDiv = Symbol(),
	selectedBodyDom = Symbol(),
	createSelectDiv = Symbol(),
	selectedShowDom = Symbol(),
	getData = Symbol(),
	createSelectedList = Symbol(),
	areaDataByKey = Symbol(),
	handlerAreaData = Symbol(),
	getFirstShowParam = Symbol(),
	selectedAreaAddDom = Symbol(),
	addEvent = Symbol(),
	selectedAreaDomClick = Symbol();



class cascade extends select{
	constructor(opt={}){
		super(opt);

		//级联数据
		this.areaData = opt.areaData || [];
		//生成select的数据，初始空
		this.data = [];
		//select中选中的数据
		this.selected = [];
		//级联选择的数据
		this.areaSelected = opt.areaSelected || [];
		//初始开始的列表的父级id
		this.startParentId = opt.startParentId || 0;

		this.callback = opt.success || function(){};
		this.closeFn = opt.error || function(){};


		//已选择的类别的显示dom容器
		this[selectedBodyDom] = null;
		//在选择类别dom中显示选中的dom的clone对象
		this[selectedShowDom] = null;
		//区域数据转换的key为主键的对象
		this[areaDataByKey] = {};


		this[init]();
	}

	[init](){
		//隐藏确定按钮
		this.domYes.css({display:"none"});
		this[handlerAreaData]();
		this[createShowSelectedDiv]();
		this[createSelectDiv]();

		let {showList,passed} = this[getFirstShowParam]();

		let selected = this.areaSelected[passed-1];
		selected = (selected)? [selected] : [];

		this.reSetList(showList,selected);

		this.domBody.find("div").css({border:'none'});
		this[createSelectedList](passed);
	}

	//区域数据转换的key为主键的对象
	[handlerAreaData](){
		let data = this.areaData,
			newData = {};

		data.map(rs=>{
			newData[rs.key] = rs;
		});

		this[areaDataByKey] = newData;
	}

	//列表点击使用，继承父类
	listTouchEventHandler(dom){
		let data = dom.data("data"),
			{key} = data;


		//获取列表数据
		let {newData} = this[getData](key,"");

		if(newData.length != 0){
			//生成列表
			this.reSetList(newData,[]);
			this.domBody.find("div").css({border:'none'});

			//在选中dom容器中增加选中的值
			this[selectedAreaAddDom](data);
		}else{
			let lastDiv = this[selectedBodyDom].find("div").last();
			lastDiv.data({data:data}).text(data.val).addClass("__cascade_selected__");
			this.success();
		}
	}

	//创建显示区域
	[createShowSelectedDiv](){
		let div = $("<div></div>");
		div.css({
			width:"100%",
			height:this.listLineHeight+"px",
			// background:"#eee",
			"line-height":this.listLineHeight+"px",
			'overflow':'hidden',
			'border-bottom':'1px solid '+this.listBottomColor
		});

		div.addClass("border_box");

		this[selectedBodyDom] = div;

		//插入到标题下面
		this[selectedBodyDom].insertAfter(this.domTitle);
	}

	//创建已选中的dom
	[createSelectDiv](){
		let div = $("<div></div>");
		div.css({
			display:"block",
			padding:'0 '+this.fontSize+"px",
			height:this.listLineHeight-1+"px",
			float:"left",
			'border-bottom':'1px solid transparent'
		}).addClass("border_box");

		this[selectedShowDom] = div;
	}

	//获取列表数据
	[getData](parentId,selectedId){
		let data = this.areaData,
			newData = [],
			findSelected = false;

		if(!selectedId){findSelected = true;}


		data.map(list=>{
			if(list.parent == parentId){
				newData.push(list);

				if(list.key == selectedId){
					findSelected = true;
				}
			}
		});

		return {newData,findSelected};
	}

	//获取初始化时需要的参数
	[getFirstShowParam](){
		let selectData = this.areaSelected,
			parentId = this.startParentId,
			showList = [],
			passed = 0;

		for(let i=0,l=selectData.length;i<=l;i++){
			let selected = selectData[i],
				{newData,findSelected} = this[getData](parentId,selected);

			//没有数据了
			if(newData.length == 0){
				break;
			}
			//下次查询的父级id
			parentId = selected;
			showList = newData;

			//列表中有选中的项目
			if(findSelected){
				passed++;

			//列表中没有选中的项目,直接中断只显示到当前层级，忽略后面的选择
			}else{
				break;
			}
		}


		return {showList,passed}

	}

	//生成已选中的列表
	[createSelectedList](n){

		this.areaSelected = this.areaSelected.splice(0,n);

		if(n == 0){
			this[selectedAreaAddDom]();
			return;
		}

		for(let i=0,l=n;i<l;i++){
			let rs = this.areaSelected[i];

			if(rs){
				let this_data = this[areaDataByKey][rs];
				this[selectedAreaAddDom](this_data);
			}else{
				this[selectedAreaAddDom]();

			}
		}
	}

	//选中区域增加选中的值
	[selectedAreaAddDom](data={}){
		let list = this[selectedShowDom],
			body = this[selectedBodyDom],
			this_list = list.clone(),
			this_name = data.val || "请选择";

		if(data.val){
			this_list.text(this_name).data({data:data}).addClass("__cascade_selected__");
		}else{
			this_list.text(this_name).css({color:this.selectedColor,'border-bottom':'1px solid '+this.selectedColor});
		}

		//获取选中列表中最后一个元素
		let lastDiv = this[selectedBodyDom].find("div").last();
		//最后一个不是 "请选择"
		if(lastDiv.length == 0 || lastDiv.data("data")){
			body.append(this_list);

		//最后一个是 "请选中"
		}else{
			this_list.insertBefore(lastDiv);
		}

		this[addEvent]();
	}

	//添加事件
	[addEvent](){
		let div = this[selectedBodyDom].find(".__cascade_selected__"),
			_this = this;
		$$(div).unbind(true);

		$$(div).myclickok(function(){
			_this[selectedAreaDomClick]($(this));
		});
	}

	//已选中区域的列表点击事件
	[selectedAreaDomClick](dom){
		//清除事件
		let all = dom.parent().find("div");
		$$(all).unbind(true);

		//删除该dom后面的列表
		let find = false;
		dom.parent().find("div").each(function(){
			if(find){$(this).remove();}
			if(dom.get(0) == $(this).get(0)){find=true;}
		});

		//更改当前选项为'请选择'
		let data = dom.data("data"),
			parentId = data.parent,
			key = data.key;

		dom.text("请选择").removeData("data").removeClass("__cascade_selected__").css({color:this.selectedColor,'border-bottom':'1px solid '+this.selectedColor});


		//刷新选项
		let {newData} = this[getData](parentId,"");
		this.reSetList(newData,[]);
		this.domBody.find("div").css({border:'none'});


		//注册事件
		this[addEvent]();
	}

	success(){
		let div = this[selectedBodyDom].find("div");
		let data = [];
		div.each(function(){
			data.push($(this).data("data"));
		});

		this.callback(data);
		this.destroy();
	}

	error(){
		this.closeFn();
	}

	destroy(){
		let div = this[selectedBodyDom].find("div");
		$$(div).unbind(true);


		super.destroy();
	}
}




module.exports = cascade;