//bug....
//for循环不能使用静态数组 eg:wx:for='{{[1,2,3]}}'

//for循环中全局变量更新后 不会更新
//for循环中最好不要使用全局变量,要使用放在for的data中




require('../lib/pro/array');
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
	setForListNode = Symbol();



class dataBind{
	constructor(opt){
		this.data = opt.data || {};                 //需要绑定的数据
		this.node = opt.dom || document.body;       //domObj  原生dom对象


		this.bindTree = {};
		this.forBindTree = new Map();

		this[resolveDom](this.node);
	}


	//提取字符串中的变量
	//TODO bug 带双引号的字符串也会提取
	//param:
	//  @text:string
	//  @exclude:obj
	//return:array
	[getGlobalVar](text,exclude={}){
		let vars = text.match(/(?<=\{\{[\s\+\-\*\\\\a-zA-Z0-9_\'\"]*)[a-zA-Z0-9_\"]+/ig) || [],
			backVars = [];

		vars.map(rs=>{
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

			this.bindTree[rs].push(function(){
				dom.nodeValue = _this[getCompiledValue](val);
			});
		});
	}
	//处理node=1的attr (不含wx:for属性的)
	[handlerNodeAttr](dom){
		let attr = dom.attributes,
			_this = this;

		for(let i=0,l=attr.length;i<l;i++){
			let attrName = attr[i].nodeName,
				attrValue = attr[i].nodeValue;

			//获取值中的{{}}的变量
			let _thisVar = this[getGlobalVar](attrValue);

			//变量生成函数
			_thisVar.map(rs=>{
				if(!this.bindTree[rs]){
					this.bindTree[rs] = [];
				}

				this.bindTree[rs].push(function(){
					let val = _this[getCompiledValue](attrValue);
					dom.setAttribute(attrName,val);
				});
			});
		}
	}
	//处理node=1的 含wx:for的元素
	[handlerNodeWxFor](dom,childWxFor){
		let forData = dom.getAttribute('wx:for'),
			_this = this;

		//设置该wx:for的dom的子元素对象存储地方
		if(!this.forBindTree.get(dom)){
			this.forBindTree.set(dom,{
				children:[],
				globalParam:{}
			})
		}

		let _thisVar = this[getGlobalVar](forData);
		_thisVar.pushArray(childWxFor);
		_thisVar.map(rs=>{
			if(!this.bindTree[rs]){
				this.bindTree[rs] = [];
			}

			this.bindTree[rs].push(function(){
				//清除之前的片段
				let catchData = _this.forBindTree.get(dom);
				catchData.children.map(rs=>{
					rs.parentElement.removeChild(rs);
				});
				catchData.children = [];
				catchData.globalParam = {};


				//获取新的片段
				let fragment = _this[getCompiledList](dom,catchData.globalParam);
				//缓存 添加的片段元素
				for(let i=0,l=fragment.children.length;i<l;i++){
					catchData.children.push(fragment.children[i]);
				}

				//存储到map对象
				_this.forBindTree.set(dom,catchData);

				//插入片段
				dom.parentElement.insertBefore(fragment,dom);
			});
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
				rs = rs.replace(/((?<!\.[a-zA-Z_0-9_]*)[a-zA-Z0-9_\"]+)/ig,'data.$1');
				newText += eval('('+rs+')');
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
		textArray = textArray.replace(/((?<!\.[a-zA-Z_0-9_]*)[a-zA-Z0-9_\"]+)/ig,function(key){
			return (listData.hasOwnProperty(key))? 'listData.'+key : 'data.'+key;
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
				rs = rs.replace(/((?<!\.[a-zA-Z_0-9_]*)[a-zA-Z0-9_\"]+)/ig,function(key){
					return (listData.hasOwnProperty(key))? 'listData.'+key : 'data.'+key;
				});
				newText += eval('('+rs+')');
			}else{
				newText += rs;
			}
		});

		return newText;
	}


	//计算列表node
	[getCompiledList](dom,globalParam){
		let fragment = document.createDocumentFragment();
		let listData = {};
		let cloneDom = dom.cloneNode(true);
		let display = cloneDom.dataset.display;
		cloneDom.dataset.display = '';
		cloneDom.style.display = display;

		this[createListDom](fragment,cloneDom,listData,globalParam);


		return fragment;
	}

	//生成列表dom并赋值
	[createListDom](parentDom,dom,listData,globalParam){
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
				this[setForListNode](this_dom,nowListData,globalParam);

				parentDom.appendChild(this_dom);

				if(dom.childNodes.length !=0){
					for(let i=0,l=dom.childNodes.length;i<l;i++){
						this[createListDom](this_dom,dom.childNodes[i].cloneNode(true),nowListData,globalParam);
					}
				}
			});
		}else{
			// 普通的
			let this_dom = dom.cloneNode();
			//设置该dom克隆后的属性
			this[setForListNode](this_dom,nowListData,globalParam);

			parentDom.appendChild(this_dom);

			if(dom.childNodes.length !=0){
				for(let i=0,l=dom.childNodes.length;i<l;i++){
					this[createListDom](this_dom,dom.childNodes[i],nowListData,globalParam);
				}
			}
		}
	}
	//生成列表中的值
	[setForListNode](this_dom,nowListData,globalParam){
		let _this = this;

		if(this_dom.nodeType==1){
			//计算属性
			let attr = this_dom.attributes;
			for(let i=0,l=attr.length;i<l;i++){
				let attrName = attr[i].nodeName,
					attrValue = attr[i].nodeValue;
				let val = this[getCompiledForValue](attrValue,nowListData);
				this_dom.setAttribute(attrName,val);

				let _var = this[getGlobalVar](attrValue,nowListData);
				_var.map(rs=>{
					if(!globalParam[rs]){
						globalParam[rs] = [];
					}
					globalParam[rs].push(function(){
						let val = _this[getCompiledForValue](attrValue,nowListData);
						this_dom.setAttribute(attrName,val);
					});
				})
			}
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
				globalParam[rs].push(function(){
					this_dom.nodeValue = _this[getCompiledForValue](val,nowListData);
				});
			})

		}
	}


}


module.exports = dataBind;


