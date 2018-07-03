


require('../lib/pro/array');
let init = Symbol(),
	resolveDom = Symbol(),
	regText = Symbol(),
	resolveDomAttr = Symbol(),
	resolveDomText = Symbol(),
	resolveNext = Symbol(),
	getCompiledValue = Symbol();



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
			this[resolveDomAttr](dom);
		}
		if(type==3){
			this[resolveDomText](dom);
		}
	}
	//继续查找
	[resolveNext](dom){
		let l = dom.childNodes.length || 0;

		for(let i=0;i<l;i++){
			this[resolveDom](dom.childNodes[i]);
		}
	}
	//解析type=1的node
	[resolveDomAttr](dom){
		let attr = dom.attributes,
			hasWxFor = (dom.getAttribute('wx:for'))? true : false,
			hasVar = [],
			exclude = [];

		//如果是wx:for 去除设置的item和key的变量到缓存
		if(hasWxFor){
			let index = dom.getAttribute('wx:for-index') || 'index',
				item = dom.getAttribute('wx:for-item') || 'item';
			exclude.push(index);
			exclude.push(item);
		}

		for(let i=0,l=attr.length;i<l;i++){
			let attrName = attr[i].nodeName,
				attrValue = attr[i].nodeValue;

			//获取值中的{{}}的变量
			let _thisVal = this[regText](attrValue);
			if(_thisVal){
				//删除要忽略的变量名
				exclude.map(rs=>{
					_thisVal.del(rs);
				});
				//记录
				hasVar.push({
					attrName:attrName,
					attrValue:attrValue,
					dom:dom,
					data:_thisVal,
					type:'attr',
					isFor:hasWxFor
				})
			}

		}

		//TODO
		// this.bindTree.pushArray(hasVar);
		if(hasWxFor) {
			dom.style.display = 'none';
		}else{
			this[resolveNext](dom);
		}
	}
	//解析type=3的node
	[resolveDomText](dom){
		let val = dom.nodeValue,
			_this = this;

		let _thisVar = this[regText](val);

		_thisVar.map(rs=>{
			if(!this.bindTree[rs]){
				this.bindTree[rs] = [];
			}

			this.bindTree[rs].push(function(){
				dom.nodeValue = _this[getCompiledValue](val);
			});
		});


		this[resolveNext](dom);
	}



	[getCompiledValue](text){
		let data = this.data;
		text = text.replace(/\{\{(.*?)\}\}/ig,'$1,').split(',');
		let newText = '';

		text.map((rs,i)=>{
			if(i%2==0){
				rs = rs.replace(/((?<!\.[a-zA-Z_0-9_]*)[a-zA-Z0-9_\"]+)/ig,'data.$1');
				newText += eval('('+rs+')');
			}else{
				newText += rs;
			}
		});

		return newText;
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


