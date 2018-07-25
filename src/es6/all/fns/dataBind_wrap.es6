//wx小程序的数据绑定  {{至少有一个变量的运算,暂不支持全常量计算}}
//实现
//wx:for
//wx:for-item
//wx:for-index


//事件实现
//bindtap
//bindtouchstart
//bindtouchmove
//bindtouchend
//bindinput
//bindchange


//方法实现
// this.setData({a:1});
// this.data.a


//控件
//input
//textarea
//checkbox
//radio
//picker   mode = selector
//picker   mode = date     fields只支持month和day 如果用year请使用单选
//scroll-view
//swiper




// 未实现
//for循环不能使用静态数组 eg:wx:for='{{[1,2,3]}}'







require('../../lib/pro/array');
let device = require('../../lib/device'),
	input_select = require('../../lib/input/select'),
	date_select = require('../../lib/input/date'),
	banner_object = require('../../lib/ui/bannerScroll_wx');

let resolveDom = Symbol(),
	getGlobalVar = Symbol(),
	getChildWxFor = Symbol(),
	resolveChild = Symbol(),
	getCompiledValue = Symbol(),
	handlerNodeText = Symbol(),
	handlerNodeAttr = Symbol(),
	handlerNodeWxFor = Symbol(),
	getCompiledList = Symbol(),
	getArrayData = Symbol(),
	createListDom = Symbol(),
	getCompiledForValue = Symbol(),
	setForListNode = Symbol(),
	checkEventBind = Symbol(),
	checkTagNameEffect = Symbol(),
	eventListNames = Symbol(),
	inputEventListener = Symbol(),
	checkboxChangeEventListener = Symbol(),
	radioChangeEventListener = Symbol(),
	pickerChangeEventListener = Symbol(),
	showPickerOneChoose = Symbol(),
	showPickerDateChoose = Symbol(),
	createDataChangeFunction = Symbol(),
	scrollEventListener = Symbol(),
	specialTagAndAttrHandler = Symbol(),
	mouseEventListener = Symbol();





class dataBind{
	constructor(opt){
		this.data = opt.data || {};                 //需要绑定的数据
		this.node = opt.dom || document.body;       //domObj  原生dom对象
		this.runObj = opt.runObj || this;

		this[eventListNames] = {
			bindtap:'click',
			bindtouchstart:device.START_EV,
			bindtouchmove:device.MOVE_EV,
			bindtouchend:device.END_EV,
			bindinput:'input',
			bindchange:'change',
			bindscroll:'scroll'
		};

		this.bindTree = {};
		this.forBindTree = new Map();
		this.eventList = [];

		this[resolveDom](this.node);
		this.refreshAll();
	}


	//提取字符串中的变量
	//param:
	//  @text:string
	//  @exclude:obj
	//  @exclude:obj
	//return:array
	[getGlobalVar](text='',exclude={}){
		// vars = text.match(/(?<=\{\{[\s\+\-\*\/\%a-zA-Z0-9_\(\)\?\:]*)[a-zA-Z0-9_]+/ig) || [],

		//初步取出字符串中{{}}部分
		let vars = text.match(/\{\{(.*?)\}\}/ig) || [],
			_vars = [],
			backVars = [];

		vars.map(rs=>{
			//取出字符串中的字符串 或 .字符串
			let _tt = rs.match(/\.?[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
			_tt.map(t=>{
				if(t.substr(0,1)!='.'){
					//排除不是.开头的字符串
					_vars.push(t);
				}
			});
		});



		//去重
		_vars.delReplace();

		//除去exclude中的字符串
		_vars.map(rs=>{
			if(!exclude.hasOwnProperty(rs)){
				backVars.push(rs);
			}
		});

		return backVars;
	}

	//获取wx:for下面的wx:for的变量
	[getChildWxFor](dom){
		let forData = dom.getAttribute('wx:for'),
			forIndex = dom.getAttribute('wx:for-index'),
			forItem = dom.getAttribute('wx:for-item'),
			exclude = {},
			_this = this,
			wxFor = {};

		exclude[forData] = true;
		exclude[forIndex] = true;
		exclude[forItem] = true;


		let search = function(dom,exclude){
			if(dom.nodeType != 1){return;}
			exclude = JSON.parse(JSON.stringify(exclude));
			if(dom.hasAttribute('wx:for')){
				let forData = dom.getAttribute('wx:for'),
					forIndex = dom.getAttribute('wx:for-index'),
					forItem = dom.getAttribute('wx:for-item');

				let _var = 	_this[getGlobalVar](forData,exclude);
				_var.map(rs=>{
					wxFor[rs] = true;
					exclude[rs] = true;
				});
				exclude[forIndex] = true;
				exclude[forItem] = true;
			}

			for(let i=0,l=dom.childNodes.length;i<l;i++){
				search(dom.childNodes[i],exclude);
			}
		};

		for(let i=0,l=dom.childNodes.length;i<l;i++){
			search(dom.childNodes[i],exclude);
		}

		return Object.keys(wxFor);
	}





	//解析dom
	//查找 wx:属性 的dom,忽略其下含有 {{}}的部分
	//查找非wx:属性的dom,查找所有含有 {{}}的部分
	//param:
	//  @dom:dom
	[resolveDom](dom){
		let type = dom.nodeType;

		if(type==1){
			let hasWxFor = (dom.getAttribute('wx:for'))? true : false;
			if(hasWxFor){
				//如果是wx:for 不向下解析
				let childWxFor = this[getChildWxFor](dom);
				this[handlerNodeWxFor](dom,childWxFor);

			}else{
				//非wx:for的元素
				this[handlerNodeAttr](dom);
				//搜索子集
				this[resolveChild](dom);
			}
		}
		if(type==3){
			this[handlerNodeText](dom);
			this[resolveChild](dom);
		}
	}
	//继续查找
	[resolveChild](dom){
		let l = dom.childNodes.length || 0;

		for(let i=0;i<l;i++){
			this[resolveDom](dom.childNodes[i]);
		}
	}




	//处理node=3的值 生成处理函数
	[handlerNodeText](dom,childData={}){
		let val = dom.nodeValue,
			_thisVar = this[getGlobalVar](val),
			_this = this;

		_thisVar.map(rs=>{
			if(!this.bindTree[rs]){
				this.bindTree[rs] = [];
			}

			let fn = _this[createDataChangeFunction]('text',{
				dom:dom,
				val:val
			});

			this.bindTree[rs].push(fn);
		});
	}
	//处理node=1的attr (不含wx:for属性的)
	[handlerNodeAttr](dom){
		let attr = dom.attributes,
			_this = this;



		for(let i=0,l=attr.length;i<l;i++){
			let attrName = attr[i].nodeName,
				attrValue = attr[i].nodeValue;

			this[checkEventBind](dom,attrName,attrValue,this.eventList);


			//获取值中的{{}}的变量
			let _thisVar = this[getGlobalVar](attrValue);

			//变量生成函数
			_thisVar.map(rs=>{
				if(!this.bindTree[rs]){
					this.bindTree[rs] = [];
				}

				let fn = _this[createDataChangeFunction]('attr',{
					dom:dom,
					val:attrValue,
					attr:attrName
				});

				this.bindTree[rs].push(fn);
			});
		}


		this[checkTagNameEffect](dom,this.eventList);
	}
	//处理node=1的 含wx:for的元素
	[handlerNodeWxFor](dom,childWxFor){
		let forData = dom.getAttribute('wx:for'),
			_this = this;

		//设置该wx:for的dom的子元素对象存储地方
		if(!this.forBindTree.get(dom)){
			this.forBindTree.set(dom,{
				children:[],
				globalParam:{},
				eventList:[]
			})
		}

		let _thisVar = this[getGlobalVar](forData);

		_thisVar.pushArray(childWxFor);
		_thisVar.map(rs=>{
			if(!this.bindTree[rs]){
				this.bindTree[rs] = [];
			}

			let fn = _this[createDataChangeFunction]('for',{
				dom:dom
			});

			this.bindTree[rs].push(fn);
		});

		//获取dom的display属性 写入data-display中
		let display = getComputedStyle(dom,null).getPropertyValue('display');
		dom.dataset.display=display;
		dom.style.display = 'none';
	}



	//计算最终的值
	[getCompiledValue](text){
		let data = this.data;
		let textArray = text.replace(/\{\{(.*?)\}\}/ig,',$1,').split(',');
		let newText = '';

		if(textArray.length==1){
			return text;
		}

		textArray.map((rs,i)=>{
			if(i%2==1){
				//js 不支持 <?!
				// rs = rs.replace(/((?<!\.[a-zA-Z_0-9_]*)[a-zA-Z0-9_\"]+)/ig,'data.$1');
				rs = rs.replace(/\.?[a-zA-Z_][a-zA-Z0-9_\"]*/ig,function(key){
					if(key.substr(0,1) == '.'){
						return key;
					}else{
						return 'data.'+key;
					}
				});
				let str = eval('('+rs+')');
				newText += (str || str==0)? str : '';
			}else{
				newText += rs;
			}
		});

		return newText;
	}
	//获取wx:for的实际数组
	[getArrayData](text,listData){
		let data = this.data;
		let textArray = text.replace(/\{\{(.*?)\}\}/ig,',$1,').split(',');

		if(textArray.length==1){
			return text;
		}

		textArray = textArray[1];
		//js  不支持 <?!
		// textArray = textArray.replace(/((?<!\.[a-zA-Z_0-9_]*)[a-zA-Z0-9_\"]+)/ig,function(key){
		// 	return (listData.hasOwnProperty(key))? 'listData.'+key : 'data.'+key;
		// });
		textArray = textArray.replace(/\.?[a-zA-Z_][a-zA-Z0-9_\"]*/ig,function(key){
			if(key.substr(0,1)=='.'){
				return key;
			}else{
				return (listData.hasOwnProperty(key))? 'listData.'+key : 'data.'+key;
			}
		});

		return eval('('+textArray+')');
	}
	//计算wx:for中的变量值
	[getCompiledForValue](text,listData){
		let data = this.data;
		let textArray = text.replace(/\{\{(.*?)\}\}/ig,',$1,').split(',');
		let newText = '';

		if(textArray.length == 1){
			return text;
		}

		textArray.map((rs,i)=>{
			if(i%2==1){
				//js 不支持 ?<!
				// rs = rs.replace(/((?<!\.[a-zA-Z_0-9_]*)[a-zA-Z0-9_\"]+)/ig,function(key){
				// 	return (listData.hasOwnProperty(key))? 'listData.'+key : 'data.'+key;
				// });
				rs = rs.replace(/\.?[a-zA-Z_][a-zA-Z0-9_\"]*/ig,function(key){
					if(key.substr(0,1) == '.'){
						return t;
					}else{
						return (listData.hasOwnProperty(key))? 'listData.'+key : 'data.'+key;
					}
				});
				newText += eval('('+rs+')');
			}else{
				newText += rs;
			}
		});

		return newText;
	}


	//计算列表node
	[getCompiledList](dom,globalParam,eventList){
		let fragment = document.createDocumentFragment();
		let listData = {};
		let cloneDom = dom.cloneNode(true);
		let display = cloneDom.dataset.display;
		cloneDom.dataset.display = '';
		cloneDom.style.display = display;

		this[createListDom](fragment,cloneDom,listData,globalParam,eventList);


		return fragment;
	}

	//生成列表dom并赋值
	[createListDom](parentDom,dom,listData,globalParam,eventList){
		let nowListData = JSON.parse(JSON.stringify(listData));
		//判断是否含有wx:for
		if(dom.nodeType == 1 && dom.getAttribute('wx:for')){
			let forData = dom.getAttribute('wx:for'),
				forIndex = dom.getAttribute('wx:for-index') || 'index',
				forItem = dom.getAttribute('wx:for-item') || 'item';
			forData = this[getArrayData](forData,listData);

			dom.removeAttribute('wx:for');
			dom.removeAttribute('wx:for-index');
			dom.removeAttribute('wx:for-item');

			forData.map((rs,i)=>{
				nowListData[forIndex] = i;
				nowListData[forItem] = rs;

				let this_dom = dom.cloneNode();
				//设置该dom克隆后的属性
				this[setForListNode](this_dom,nowListData,globalParam,eventList);

				parentDom.appendChild(this_dom);

				if(dom.childNodes.length !=0){
					for(let i=0,l=dom.childNodes.length;i<l;i++){
						this[createListDom](this_dom,dom.childNodes[i].cloneNode(true),nowListData,globalParam,eventList);
					}
				}
			});
		}else{
			// 普通的
			let this_dom = dom.cloneNode();
			//设置该dom克隆后的属性
			this[setForListNode](this_dom,nowListData,globalParam,eventList);

			parentDom.appendChild(this_dom);

			if(dom.childNodes.length !=0){
				for(let i=0,l=dom.childNodes.length;i<l;i++){
					this[createListDom](this_dom,dom.childNodes[i],nowListData,globalParam,eventList);
				}
			}
		}
	}
	//生成列表中的值
	[setForListNode](this_dom,nowListData,globalParam,eventList){
		let _this = this;

		if(this_dom.nodeType==1){


			//计算属性
			let attr = this_dom.attributes;

			for(let i=0,l=attr.length;i<l;i++){
				let attrName = attr[i].nodeName,
					attrValue = attr[i].nodeValue;

				this[checkEventBind](this_dom,attrName,attrValue,eventList);

				let val = this[getCompiledForValue](attrValue,nowListData);

				this_dom.setAttribute(attrName,val);

				let _var = this[getGlobalVar](attrValue,nowListData);

				_var.map(rs=>{
					if(!globalParam[rs]){
						globalParam[rs] = [];
					}

					let fn = _this[createDataChangeFunction]('for_attr',{
						dom:this_dom,
						attr:attrName,
						val:attrValue,
						parentData:nowListData
					});

					globalParam[rs].push(fn);
				})
			}

			//处理特殊标签
			this[checkTagNameEffect](this_dom,eventList);
		}
		if(this_dom.nodeType==3){
			//计算text的值
			let val = this_dom.nodeValue;
			this_dom.nodeValue = this[getCompiledForValue](val,nowListData);

			let _var = this[getGlobalVar](val,nowListData);
			_var.map(rs=>{
				if(!globalParam[rs]){
					globalParam[rs] = [];
				}

				let fn = _this[createDataChangeFunction]('for_text',{
					dom:this_dom,
					val:val,
					parentData:nowListData
				});

				globalParam[rs].push(fn);
			})

		}
	}

	//执行所有的数据更新
	refreshAll(){
		Object.values(this.bindTree).map(rs=>{
			rs.map(r=>{
				r();
			})
		});


		[...this.forBindTree.values()].map(rs=>{
			Object.values(rs.globalParam).map(rr=>{
				rr.map(r=>{
					r();
				})
			})
		})
	}

	//跟新指定的变量
	refreshParam(key){
		//跟新非for下面的
		if(this.bindTree.hasOwnProperty(key)){
			this.bindTree[key].map(rs=>{
				rs();
			})
		}

		//跟新for里面的
		[...this.forBindTree.values()].map(rs=>{
			if(rs.globalParam.hasOwnProperty(key)){
				rs.globalParam[key].map(rr=>{
					rr();
				})
			}
		})
	}

	//设置参数
	setData(obj={}){
		for(let [key,val] of Object.entries(obj)){
			this.data[key] = val;
			this.refreshParam(key);
		}
	}


	//检查是否有事件绑定
	[checkEventBind](dom,attrName,attrValue,eventList){
		//判断是否是设置的事件名
		if(!this[eventListNames].hasOwnProperty(attrName)){return;}

		let eventName = this[eventListNames][attrName],
			tagName = dom.tagName.toLowerCase(),
			_this = this;

		if( eventName == 'click' ||
			eventName == device.START_EV ||
			eventName == device.MOVE_EV ||
			eventName == device.END_EV){
			this[mouseEventListener](dom,eventName,attrValue,eventList);
			return;
		}

		//处理input、textarea的事件绑定
		if(eventName == 'input'){
			this[inputEventListener](dom,eventName,attrValue,eventList);
			return;
		}

		//处理checkbox绑定事件
		if(tagName == 'checkbox-group' && eventName=='change'){
			this[checkboxChangeEventListener](dom,eventName,attrValue,eventList);
			return;
		}

		//处理radio绑定事件
		if(tagName == 'radio-group' && eventName=='change'){
			this[radioChangeEventListener](dom,eventName,attrValue,eventList);
			return;
		}

		//处理picker绑定事件'
		if(tagName == 'picker' && eventName=='change'){
			this[pickerChangeEventListener](dom,eventName,attrValue,eventList);
		}

		//处理滚动容器 滚动事件
		if(tagName == 'scroll-view' && eventName=='scroll'){
			this[scrollEventListener](dom,eventName,attrValue,eventList);
		}


	}
	//处理特殊标签
	[checkTagNameEffect](dom,eventList){
		let tagName = dom.tagName.toLowerCase(),
			_this = this;

		//判断是否是滑动区域
		if(tagName == 'scroll-view'){
			let scrollX = dom.getAttribute('scroll-x'),
				scrollY = dom.getAttribute('scroll-y'),
				className = dom.className,
				classNames = className.split(' ');

			scrollX = (scrollX && scrollX != 'false');
			scrollY = (scrollY && scrollY != 'false');

			if(scrollX && scrollY){
				if(classNames.indexOf('scroll_xy') == -1){
					dom.className = className+' scroll_xy';
				}
			}else if(scrollX && !scrollY){
				if(classNames.indexOf('scroll_x') == -1){
					dom.className = className+' scroll_x';
				}
			}else if(!scrollX && scrollY){
				if(classNames.indexOf('scroll_y') == -1){
					dom.className = className+' scroll_y';
				}
			}
		}

		//处理横向滚动banner 滚动事件
		else if(tagName == 'swiper') {
			setTimeout(function(){
				let interval = dom.getAttribute('interval') || 5000,
					duration = dom.getAttribute('duration') || 1000,
					showPoint = (dom.getAttribute('indicator-dots'))? true : false,
					pointColor = dom.getAttribute('indicator-color'),
					pointChooseColor = dom.getAttribute('indicator-active-color'),
					eventFnName = dom.getAttribute('bindchange');


				let newE = {};
				newE.currentTarget = {
					id:dom.id,
					dataset:dom.dataset
				};
				newE.type = 'change';


				let fn = new banner_object({
					win:dom,
					body:dom.children[0],
					time:interval,
					animateTime:duration,
					showPoint:showPoint,
					pointBg:pointColor,
					pointSelectBg:pointChooseColor,
					changeStartFn:function(e){
						if(eventFnName && _this.runObj[eventFnName]){
							newE.detail = {
								current:e
							};
							_this.runObj[eventFnName].call(_this.runObj,newE);
						}
					}
				});


				eventList.push(function(){
					fn.destroy();
				});
			},0)


		}







	}




	//处理click，mousedown，mousemove，mouseup事件
	[mouseEventListener](dom,eventName,attrValue,eventList){
		let _this = this.runObj,
			fn = null,
			newE = {};

		dom.addEventListener(eventName,fn = function(e){
			//将事件的返回改为微信的返回
			//只返回了常用的
			newE.currentTarget = {
				id:e.currentTarget.id,
				dataset:e.currentTarget.dataset
			};
			newE.type = eventName;

			//执行绑定的函数
			if(_this.hasOwnProperty(attrValue)){
				_this[attrValue].call(_this,newE);
			}
		},false);

		//根据全局和for中的变量 分别缓存注销事件
		//缓存对象是传入的
		eventList.push(function(){
			dom.removeEventListener(eventName,fn,false);
		});
	}
	//处理input、textarea的事件绑定
	[inputEventListener](dom,eventName,attrValue,eventList){
		let _this = this.runObj,
			fn = null,
			newE = {};


		dom.addEventListener(eventName,fn = function(e){
			//将事件的返回改为微信的返回
			//只返回了常用的
			newE.detail = {
				value:e.currentTarget.value
			};
			newE.currentTarget = {
				id:e.currentTarget.id,
				dataset:e.currentTarget.dataset
			};
			newE.type = eventName;

			//执行绑定的函数
			if(_this.hasOwnProperty(attrValue)){
				_this[attrValue].call(_this,newE);
			}
		},false);

		//根据全局和for中的变量 分别缓存注销事件
		//缓存对象是传入的
		eventList.push(function(){
			dom.removeEventListener(eventName,fn,false);
		});
	}
	//处理checkbox绑定事件
	[checkboxChangeEventListener](dom,eventName,attrValue,eventList){
		let _this = this.runObj,
			checkbox = dom.getElementsByTagName('input'),
			checkboxs = [];

		//获取所有的checkbox
		for(let i=0,l=checkbox.length;i<l;i++){
			let input = checkbox[i];
			if(input.getAttribute('type') == 'checkbox'){
				checkboxs.push(input);
			}
		}

		let getVal = function(){
			let val=[];
			checkboxs.map(rs=>{
				if(rs.checked){
					val.push(rs.value);
				}
			});
			return val;
		};

		//事件绑定
		checkboxs.map(rs=>{
			let fn = null,
				newE = {};
			rs.addEventListener(eventName,fn=function(e){
				//将事件的返回改为微信的返回
				//只返回了常用的
				newE.detail = {
					value:getVal()
				};
				newE.currentTarget = {
					id:e.currentTarget.id,
					dataset:e.currentTarget.dataset
				};
				newE.type = eventName;

				//执行绑定的函数
				if(_this.hasOwnProperty(attrValue)){
					_this[attrValue].call(_this,newE);
				}
			},false);
			//根据全局和for中的变量 分别缓存注销事件
			//缓存对象是传入的
			eventList.push(function(){
				rs.removeEventListener(eventName,fn,false);
			});


		});
	}
	//处理radio绑定事件
	[radioChangeEventListener](dom,eventName,attrValue,eventList){
		let _this = this.runObj,
			checkbox = dom.getElementsByTagName('input'),
			checkboxs = [],
			name = new Date().getTime()+''+Math.random()*100;

		//获取所有的checkbox
		for(let i=0,l=checkbox.length;i<l;i++){
			let input = checkbox[i];
			if(input.getAttribute('type') == 'radio'){
				input.setAttribute('name',name);
				checkboxs.push(input);
			}
		}

		let getVal = function(){
			let val='';
			checkboxs.map(rs=>{
				if(rs.checked){
					val = rs.value;
				}
			});
			return val;
		};

		//事件绑定
		checkboxs.map(rs=>{
			let fn = null,
				newE = {};
			rs.addEventListener(eventName,fn=function(e){
				//将事件的返回改为微信的返回
				//只返回了常用的
				newE.detail = {
					value:getVal()
				};
				newE.currentTarget = {
					id:e.currentTarget.id,
					dataset:e.currentTarget.dataset
				};
				newE.type = eventName;

				//执行绑定的函数
				if(_this.hasOwnProperty(attrValue)){
					_this[attrValue].call(_this,newE);
				}
			},false);
			//根据全局和for中的变量 分别缓存注销事件
			//缓存对象是传入的
			eventList.push(function(){
				rs.removeEventListener(eventName,fn,false);
			});


		});
	}
	//处理picker绑定事件  select单选和 date选择控件
	[pickerChangeEventListener](dom,eventName,attrValue,eventList){
		let _this = this.runObj,
			fn = null,
			newE = {},
			__this__ = this;

		dom.addEventListener('click',fn = function(e){
			let tag = e.currentTarget,
				mode = tag.getAttribute('mode'),

				newData = [];

			//生成新的事件返回对象
			newE.currentTarget = {
				id:tag.id,
				dataset:tag.dataset
			};
			newE.type = eventName;

			//单选
			if(!mode || mode=='selector'){
				let range = tag.getAttribute('range'),
					showKey = tag.getAttribute('range-key'),
					showIndex = tag.getAttribute('value'),
					data = _this.data[range] || [];

				//生成数据格式
				data.map((rs,i)=>{
					newData.push({
						key:i,
						val:rs[showKey]
					})
				});

				__this__[showPickerOneChoose](newData,showIndex).then(rs=>{
					newE.detail = {value:rs};
					// tag.setAttribute('value',rs);
					_this[attrValue].call(_this,newE);
				})

			}

			//日期
			if(mode=='date'){
				let selected = tag.getAttribute('value'),
					min = tag.getAttribute('start'),
					max = tag.getAttribute('end'),
					showDay = tag.getAttribute('fields');

				showDay = (!showDay || showDay == 'day');

				__this__[showPickerDateChoose](selected,min,max,showDay).then(rs=>{
					newE.detail = {value:rs};
					// tag.setAttribute('value',rs);
					_this[attrValue].call(_this,newE);
				})
			}


		},false);

		//根据全局和for中的变量 分别缓存注销事件
		//缓存对象是传入的
		eventList.push(function(){
			dom.removeEventListener(eventName,fn,false);
		});
	}
	//处理scroll-view滚动事件
	[scrollEventListener](dom,eventName,attrValue,eventList){
		let _this = this.runObj,
			fn = null,
			newE = {};


		dom.addEventListener(eventName,fn = function(e){
			//将事件的返回改为微信的返回
			//只返回了常用的
			newE.detail = {
				scrollHeight: e.target.scrollHeight,
				scrollLeft: e.target.scrollLeft,
				scrollTop: e.target.scrollTop,
				scrollWidth: e.target.scrollWidth
			};
			newE.currentTarget = {
				id:e.currentTarget.id,
				dataset:e.currentTarget.dataset
			};
			newE.type = eventName;

			//执行绑定的函数
			if(_this.hasOwnProperty(attrValue)){
				_this[attrValue].call(_this,newE);
			}
		},false);

		//根据全局和for中的变量 分别缓存注销事件
		//缓存对象是传入的
		eventList.push(function(){
			dom.removeEventListener(eventName,fn,false);
		});
	}




	//显示单选控件 返回:promise对象
	[showPickerOneChoose](data,index){
		return new Promise(success=>{
			new input_select({
				titleText:"",       //@param:str             标题  默认：请选择
				data:data,
				selected:[parseInt(index)],        //@param:array(必填)    选中的key
				radio:true,                  //@param:boolean          单选还是多选   默认true
				//psdWidth webpack传入全区变量
				viewPort:psdWidth,           //@param:number 设置psd的大小，布局需要使用rem 默认：750
				success:function(rs){
					//返回选择的对象
					//json数组，  传入的格式
					let key = rs[0] || {};
					key = key.key;

					success(key);
				},
				error:function(){
					//取消选择
				}
			});
		});
	}
	//显示日期控件 返回：promise对象
	[showPickerDateChoose](selected,min,max,showDay){
		return new Promise(success=>{
			new date_select({
				titleText:"",       //@param:str    标题
				selected:selected,      //@param:str    初始显示的日期， 默认：当前日期
				minDate:min,         //@param:str    最小显示时间 默认：1950-1-1
				maxDate:max,       //@param:str    最大显示时间 默认：2050-12-12
				isShowDay:showDay,          //@param:bool   是否显示日,默认：true
				viewPort:psdWidth,                //@param:number 设置psd的大小，布局需要使用rem 默认：750
				success:function(rs){
					//rs返回选择的年月日   yyyy-mm-dd
					success(rs);
				},
				error:function(){
					//取消选择
				}
			})
		})
	}
	//显示banner 返回：promise对象



	//创建数据变化时的处理函数
	[createDataChangeFunction](type,opt={}){
		let _this = this,
			dom = opt.dom;


		if(type == 'text'){
			return function(){
				dom.nodeValue = _this[getCompiledValue](opt.val);
			};
		}

		else if(type == 'attr'){
			return function(){
				let val = _this[getCompiledValue](opt.val);
				dom.setAttribute(opt.attr,val);

				_this[specialTagAndAttrHandler](dom,opt.attr,val);
			}
		}

		else if(type == 'for'){
			return function(){
				//清除之前的片段
				let catchData = _this.forBindTree.get(dom);
				//清除事件
				catchData.eventList.map(rs=>{
					rs();
				});
				//清除dom
				catchData.children.map(rs=>{
					rs.parentElement.removeChild(rs);
				});
				catchData.children = [];
				catchData.globalParam = {};
				catchData.eventList = [];


				//获取新的片段
				let fragment = _this[getCompiledList](dom,catchData.globalParam,catchData.eventList);
				//缓存 添加的片段元素
				for(let i=0,l=fragment.children.length;i<l;i++){
					catchData.children.push(fragment.children[i]);
				}

				//存储到map对象
				_this.forBindTree.set(dom,catchData);

				//插入片段
				dom.parentElement.insertBefore(fragment,dom);
			};
		}

		else if(type == 'for_attr'){
			return function(){
				let val = _this[getCompiledForValue](opt.val,opt.parentData);
				dom.setAttribute(opt.attr,val);

				_this[specialTagAndAttrHandler](dom,opt.attr,val);
			};
		}

		else if(type == 'for_text'){
			return function(){
				dom.nodeValue = _this[getCompiledForValue](opt.val,opt.parentData);
			};
		}

	}
	//检查并返回scroll-view的scroll-into-view属性处理函数
	[specialTagAndAttrHandler](dom,attr,id){
		if(dom.tagName.toLowerCase() == 'scroll-view' && attr == 'scroll-into-view'){
			setTimeout(function(){
				document.getElementById(id).scrollIntoView(true);
			},0);

		}
	}

}


module.exports = dataBind;


