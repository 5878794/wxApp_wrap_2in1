//文件上传
//h5 需要支持 formData和xmlHttpRequest2
//server 需要支持 options请求,特别是跨域的情况,不支持请不要设置progress回调



// new upload({
// 	inputId:'file',                 //@param:str    input type=file的id
// 	uploadKey:'file',               //@param:str    input type=file的name
// 	submitBtnID:'btnId',            //@param:str    上传按钮id
//                                          //设置上传按钮id,则需要点击按钮上传,
//                                          //不设置该id选择文件后立即上传
// 	uploadSize:1024*1024*2,         //@param:number  上传文件大小限制(字节),默认2m
// 	uploadOtherParam:{              //@param:json    上传文件时附带的其它表单
// 		uploadUser:123
// 	},
// 	serverUrl:'http://172.16.21.90:10101/test/api/upload',  //@param:str  服务器地址
// 	uploadType:['image/jpeg','image/png','image/gif'],      //@param:array 允许上传的文件类型
// 	success:function(e){console.log(e)},         //@param:function  成功回调返回报文
// 	error:function(e){console.log(e)},           //@param:function  失败回调返回报文
// 	progress:function(a){console.log(a)}         //@param:function  进度回调,返回百分比 0-100
// });




let $$ = require('../event/$$');
require('../jq/extend');

let init = Symbol(),
	addEvent = Symbol(),
	eventFn = Symbol(),
	checkInput = Symbol(),
	showError = Symbol(),
	upload = Symbol();


class uploadFile{
	constructor(opt={}){
		this.inputId = opt.inputId;
		this.uploadKey = opt.uploadKey || 'file';
		this.uploadType = opt.uploadType || ['image/jpeg','image/png','image/gif'];
		this.submitBtnID = opt.submitBtnID || "";
		this.uploadSize = opt.uploadSize || 1024*1024*2;
		this.uploadOtherParam = opt.uploadOtherParam || {};
		this.serverUrl = opt.serverUrl || "";
		this.success = opt.success || function(){};
		this.error = opt.error || function(){};
		this.progress = opt.progress || null;


		if(!this.inputId || !this.serverUrl){
			throw 'uploadFile 缺少必要参数,inputId或serverUrl';
		}

		this.inputObj = document.getElementById(this.inputId);

		if(this.submitBtnID){
			this.submitBtn = document.getElementById(this.submitBtnID);
		}


		this[init]();
	}

	[init](){
		this[addEvent]();
	}

	[addEvent](){
		let _this = this;

		//判断是否设置上传按钮
		if(this.submitBtn){
			//点击按钮上传
			$$(this.submitBtn).myclickok(function(){
				_this[checkInput]();
			});
		}else{
			//选择文件上传
			this.inputObj.addEventListener('change',this[eventFn]=function(){
				_this[checkInput]();
			},false)
		}
	}

	[checkInput](){
		let file = this.inputObj.files;

		//检查是否有文件
		if(file.length == 0 && this.submitBtn){
			this[showError]('上传文件为空!');
			return;
		}

		if(file.length == 0){
			return;
		}

		file = file[0];

		//检查文件大小
		let fileSize = file.size;
		if(fileSize > this.uploadSize){
			this[showError]('上传文件超出'+(this.uploadSize/1024/1024).toFixed(1)+'M');
			return;
		}

		//检查文件类型
		let fileType = file.type;
		if(this.uploadType.indexOf(fileType) == -1){
			this[showError]('上传文件类型错误');
			return;
		}

		this[upload](file);
	}

	[showError](text){
		this.error(text);
	}

	[upload](file){
		let _this = this;

		//创建form
		let form = new FormData();
		form.append(this.uploadKey,file);

		//插入其它需要上传的数据
		for(let [key,val] of Object.entries(this.uploadOtherParam)){
			form.append(key,val);
		}

		//创建xml
		let xhr = new XMLHttpRequest();
		xhr.open('post',this.serverUrl,true);
		xhr.onload = function(e){
			if (xhr.status == 200) {
				var rs = e.target.responseText;
				rs = JSON.parse(rs);
				_this.success(rs);
			} else {
				_this[showError](xhr.status);
			}
		};

		if(_this.progress){
			xhr.upload.onprogress = function(progress){
				if(progress.lengthComputable){
					let total = progress.total,
						loaded = progress.loaded,
						pre = (loaded/total)*100;
					pre = pre.toFixed(2);
					_this.progress(pre);
				}else{
					_this.progress(0);
				}
			};
		}


		xhr.send(form);
	}

	destroy(){
		if(this.submitBtn){
			//点击按钮上传
			$$(this.submitBtn).unbind(true);
		}else{
			//选择文件上传
			this.inputObj.removeEventListener('change',this[eventFn],false);
		}
	}
}

module.exports = uploadFile;