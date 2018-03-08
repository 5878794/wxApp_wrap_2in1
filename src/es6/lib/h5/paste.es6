
//pc用 ctrl+v 粘贴图片文件
//传入的id必须是focus状态才能监听到事件

//注意:
//只能复制一个文件,不能同时复制多个文件,多个文件貌似取最后一个选中的文件
//只能复制图片文件,其它文件接口不支持会提示错误。

// new pasteFile({
// 	id:'aaa',                           //要监听的容器对象id
// 	success:function(rs){               //返回对象{url:url,file:file}
// 		console.log(rs);                        //url: 图片的base64
// 		var src = rs.url;                       //file: 图片的文件对象,可以直接在FormData中上传
// 		var img = new Image();
// 		img.src=  src;
// 		img.width=100;img.height=100;
// 		img._file = rs.file;
// 		document.body.append(img)
//
// 	},
// 	error:function(rs){console.log(rs)}         //报错输出
// });








let addEvent = Symbol(),
	handlerFn = Symbol(),
	getFile = Symbol();


class PasteImage{
	constructor(opt={}){
		this.id = opt.id;
		this.container = (this.id)? document.getElementById(this.id) :
									document.body;

		this.success = opt.success || function(){};
		this.error = opt.error || function(){};

		this[addEvent]();

	}

	[addEvent](){
		this.container.addEventListener('paste',handlerFn = (e)=>{
			e.preventDefault();
			this[getFile](e);
		},false)
	}

	[getFile](e){
		let pasteObj = e.clipboardData,
			files = pasteObj.files,
			types = pasteObj.types,
			type = types[types.length-1],
			items = pasteObj.items,
			item = items[items.length-1],
			_this = this;

		if(type.toLowerCase()=='files' && files.length != 0){
			let thisFile = item.getAsFile(),
				fd = new FileReader();

			fd.onload = function(rs){
				let src = rs.target.result;
				_this._backData({
					url:src,
					file:thisFile
				})
			};

			fd.onerror = function(rs){
				_this.error(rs);
			};

			fd.readAsDataURL(thisFile);

		}else{
			this.error('拷贝的不是图片');
		}
	}

	_backData(data){
		this.success(data);
	}

	destroy(){
		this.container.removeEventListener('paste',handlerFn,false);
	}

}


module.exports = PasteImage;