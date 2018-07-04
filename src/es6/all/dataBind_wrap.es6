


require('../lib/pro/array');
let init = Symbol(),
	resolveDom = Symbol(),
	regText = Symbol(),
	resolveNext = Symbol(),
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

		this[init]();
	}

	[init](){
		this[resolveDom](this.node);

	}

	//提取字符串中的变量
	//bug 带双引号的字符串也会提取
	[regText](text){
		return text.match(/(?<=\{\{[\s\+\-\*\\\\a-zA-Z0-9_\'\"]*)[a-zA-Z0-9_\"]+/ig) || [];
	}

	//解析dom
	//查找 wx:属性 的dom,忽略其下含有 {{}}的部分
	//查找非wx:属性的dom,查找所有含有 {{}}的部分
	[resolveDom](dom){
		let type = dom.nodeType;

		if(type==1){
			let hasWxFor = (dom.getAttribute('wx:for'))? true : false;
			if(hasWxFor){
				//如果是wx:for 不向下解析
				this[handlerNodeWxFor](dom);

			}else{
				//非wx:for的元素
				this[handlerNodeAttr](dom);
				//搜索子集
				this[resolveNext](dom);
			}
		}
		if(type==3){
			this[handlerNodeText](dom);
			this[resolveNext](dom);
		}
	}
	//继续查找
	[resolveNext](dom){
		let l = dom.childNodes.length || 0;

		for(let i=0;i<l;i++){
			this[resolveDom](dom.childNodes[i]);
		}
	}




	//处理node=3的值 生成处理函数
	[handlerNodeText](dom){
		let val = dom.nodeValue,
			_thisVar = this[regText](val),
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
			let _thisVar = this[regText](attrValue);

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
	[handlerNodeWxFor](dom){
		let forData = dom.getAttribute('wx:for'),
			_this = this;

		let _thisVar = this[regText](forData);
		_thisVar.map(rs=>{
			if(!this.bindTree[rs]){
				this.bindTree[rs] = [];
			}

			let addDoms=[];
			this.bindTree[rs].push(function(){
				//清除之前的片段
				addDoms.map(rs=>{
					rs.parentElement.removeChild(rs);
				});
				addDoms = [];

				//获取新的片段
				let fragment = _this[getCompiledList](dom);
				//缓存添加的片段元素
				for(let i=0,l=fragment.children.length;i<l;i++){
					addDoms.push(fragment.children[i]);
				}

				//插入片段
				dom.parentElement.insertBefore(fragment,dom);
			});
		});


		//TODO
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
	[getArrayData](text){
		let data = this.data;
		let textArray = text.replace(/\{\{(.*?)\}\}/ig,',$1,').split(',');

		if(textArray.length==1){
			return text;
		}

		textArray = textArray[1];
		textArray = textArray.replace(/((?<!\.[a-zA-Z_0-9_]*)[a-zA-Z0-9_\"]+)/ig,'data.$1');

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
	[getCompiledList](dom){
		let fragment = document.createDocumentFragment();
		let listData = {};
		let cloneDom = dom.cloneNode(true);
		cloneDom.style.display = 'block';

		this[createListDom](fragment,cloneDom,listData);


		return fragment;
	}

	//生成列表dom并赋值
	[createListDom](parentDom,dom,listData){
		let nowListData = JSON.parse(JSON.stringify(listData));
		//判断是否含有wx:for
		if(dom.nodeType == 1 && dom.getAttribute('wx:for')){
			let forData = dom.getAttribute('wx:for'),
				forIndex = dom.getAttribute('wx:for-index') || 'index',
				forItem = dom.getAttribute('wx:for-item') || 'item';
			forData = this[getArrayData](forData);

			dom.removeAttribute('wx:for');
			dom.removeAttribute('wx:for-index');
			dom.removeAttribute('wx:for-item');

			forData.map((rs,i)=>{
				nowListData[forIndex] = i;
				nowListData[forItem] = rs;

				let this_dom = dom.cloneNode();
				//设置该dom克隆后的属性
				this[setForListNode](this_dom,nowListData);

				parentDom.appendChild(this_dom);

				if(dom.childNodes.length !=0){
					for(let i=0,l=dom.childNodes.length;i<l;i++){
						this[createListDom](this_dom,dom.childNodes[i],nowListData);
					}
				}
			});
		}else{
			// 普通的
			let this_dom = dom.cloneNode();
			//设置该dom克隆后的属性
			this[setForListNode](this_dom,nowListData);

			parentDom.appendChild(this_dom);

			if(dom.childNodes.length !=0){
				for(let i=0,l=dom.childNodes.length;i<l;i++){
					this[createListDom](this_dom,dom.childNodes[i],nowListData);
				}
			}
		}
	}

	[setForListNode](this_dom,nowListData){
		if(this_dom.nodeType==1){
			//计算属性
			let attr = this_dom.attributes;
			for(let i=0,l=attr.length;i<l;i++){
				let attrName = attr[i].nodeName,
					attrValue = attr[i].nodeValue;
				let val = this[getCompiledForValue](attrValue,nowListData);
				this_dom.setAttribute(attrName,val);
			}
		}
		if(this_dom.nodeType==3){
			//计算text的值
			let val = this_dom.nodeValue;
			this_dom.nodeValue = this[getCompiledForValue](val,nowListData);
		}
	}


}

//
// class dataBind{
// 	constructor(opt={}){
// 		this.data = opt.data || {};
//
// 		//body的dom树
// 		this.bodyTree = null;
// 		//数据绑定的对象key
// 		this.domBinds = {};
//
//
// 		this[init]();
// 	}
//
// 	[init](){
// 		//克隆body
// 		this.bodyTree = document.body.cloneNode(true);
//
// 		//解析body中需要数据绑定的部分
// 		this[resolveDom](this.bodyTree);
//
// 		console.log(this.domBinds)
//
// 	}
//
// 	//获取{{}}中的变量名数组
// 	[getVarName](str){
// 		return str.match(/(?<!\.[a-zA-Z_0-9_]*)[a-zA-Z_][a-zA-Z0-9_]*/ig);
// 	}
//
// 	//解析body的结构,获取要数据绑定的部分
// 	[resolveDom](dom,exclude=[]){
// 		//解析该dom的属性和值
// 		let l = dom.childNodes.length,
// 			attrs = dom.attributes,
// 			value = dom.nodeValue;
//
// 		//解析value
// 		this[resolveText](dom,value,exclude);
//
// 		if(dom.nodeType != 1){return;}
//
// 		//解析attr
// 		for(let i=0,l=attrs.length;i<l;i++){
// 			let key = attrs[i].nodeName,
// 				val = attrs[i].nodeValue;
// 			this[resolveAttr](dom,key,val,exclude);
//
// 			//排除自定义的index和val
// 			if(key=='wx:for-item' || key == 'wx:for-index'){
// 				exclude.push(val);
// 			}
// 		}
//
//
// 		//解析子元素
// 		for(let i=0;i<l;i++){
// 			let _dom = dom.childNodes[i];
// 			this[resolveDom](_dom,exclude)
// 		}
//
// 	}
//
// 	//解析attr
// 	[resolveAttr](dom,key,val,exclude){
// 		//如果含有wx:字符  需要刷新这一层的dom
// 		let refresh = (key.indexOf('wx:')>-1);
//
// 		//获取{{}}中的变量
// 		let has = val.match(/\{\{.*?\}\}/ig);
// 		if(has && has.length != 0){
// 			//获取每个{{}}中的变量名
// 			has.map(rs=>{
// 				let keys = this[getVarName](rs);
// 				keys.map(bb=>{
// 					if(exclude.indexOf(bb)>-1){
// 						//判断是否在排除列表
//
// 					}else{
// 						if(!this.domBinds[bb]){
// 							this.domBinds[bb] = [];
// 						}
// 						this.domBinds[bb].push({
// 							dom:dom,
// 							refresh:refresh,
// 							key:key,
// 							val:val
// 						});
// 					}
// 				})
// 			})
// 		}
//
// 	}
//
// 	//解析node的value
// 	[resolveText](dom,str,exclude){
// 		if(!str){return;}
// 		//判断是否含有{{}}
// 		let has = str.match(/\{\{.*?\}\}/ig);
// 		if(has && has.length != 0){
// 			has.map(rs=>{
// 				let keys = this[getVarName](rs);
// 				keys.map(bb=>{
// 					if(exclude.indexOf(bb)>-1){
// 						//判断是否在排除列表
//
// 					}else{
// 						if(!this.domBinds[bb]){
// 							this.domBinds[bb] = [];
// 						}
// 						this.domBinds[bb].push({
// 							dom:dom,
// 							refresh:false,
// 							key:false,
// 							val:str
// 						});
// 					}
// 				})
// 			})
// 		}
//
// 	}
//
// 	//刷新某个属性的值
// 	refresh(key){
// 		let list = this.domBinds[key] || [];
//
// 		list.map(rs=>{
// 			this[createDom](rs);
// 		});
// 	}
//
// 	[createDom](rs){
// 		let allData = this.data,
// 			dom = rs.dom,
// 			refresh = rs.refresh,
// 			key = rs.key,
// 			val = rs.val;
//
// 		if(refresh){
// 			if(key == 'wx:for'){
// 				//获取数据绑定的对象值
// 				let data = val.replace(/((?<!\.[a-zA-Z_0-9_]*)[a-zA-Z_][a-zA-Z0-9_]*)/ig,'allData.$1');
// 				data = data.replace(/\{\{/ig,'').replace(/\}\}/ig,'');
// 				data = eval('('+data+')');
// 				console.log(data);
//
// 				this[dom2Html_for](data,dom);
//
// 			}
// 		}else{
//
// 		}
// 	}
//
// 	[dom2Html_for](data,dom){
// 		let key = dom.getAttribute('wx:for-index') || 'index',
// 			val = dom.getAttribute('wx:for-item') || 'item',
// 			tag = dom.nodeName;
//
// 		data.map((rs,i)=>{
//
// 		})
// 	}
//
// }
//


module.exports = dataBind;


