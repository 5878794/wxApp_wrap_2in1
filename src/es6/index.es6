let regeneratorRuntime = require('regenerator-runtime');


let app = require('./all/page'),
	{ajax,api} = require('./all/_api');




let page = {
	data:{
		smsShowText:'发送验证码',
		sending:'',
		phone:'',
		yzm:'',
		sms:'',
		img_yzm:''
	},
	isSendSMS:false,
	token:'',
	init(){
		this.changeYZM();

	},
	changeYZM(){
		app.loading.show('极速加载中');
		this.getYZM().then(rs=>{
			app.loading.hide();
		}).catch(rs=>{
			app.loading.hide();
			app.info.show(rs);
		})
	},
	async getYZM(){
		let data = await ajax([
			api.getYZM()
		]);
		data = data[0] || [];
		data = data[0] || {};

		this.token = data.token;
		let src = data.base64;

		this.setData({
			img_yzm:src
		});
	},
	async sendSms(){
		let phone = this.data.phone,
			imgCode = this.data.yzm,
			_this = this;

		if(!phone || !imgCode){
			app.info.show('请输入手机号和图形验证码');
			return;
		}


		if(this.isSendSMS){return;}

		app.loading.show('极速加载中');
		await ajax([
			api.sendSMS({
				token:this.token,
				imageCode:imgCode,
				phone:phone
			})
		]).catch(rs=>{
			app.info.show(rs);
			app.loading.hide();
			_this.changeYZM();
			_this.setData({
				yzm:''
			});
			throw(rs);
		});
		app.loading.hide();

		this.isSendSMS = true;

		let t=10;
		let fn = setInterval(()=>{
			t--;

			if(t<0){
				this.isSendSMS = false;
				this.setData({
					smsShowText:'发送验证码'
				});
				clearInterval(fn);
			}else{
				this.setData({
					smsShowText:t
				})
			}
		},1000)
	}

};

if(window){
	window.page = page;
}

app.run(page);


