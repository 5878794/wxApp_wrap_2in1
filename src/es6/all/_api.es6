let ajax = require('./fns/ajax');


let api = {
	//获取验证码图片
	// data={}
	getYZM(data={}){
		return new Promise((success,error)=>{
			ajax.run("get","npfmc/web/validate/getVerCodeToImg",data,success,error);
		})
	},
	//发送验证码
	// data={
	// 	token:'',
	// 	imageCode:'',
	// 	phone:''
	// };
	sendSMS(data={}){
		return new Promise((success,error)=>{
			ajax.run("post","npfmc/web/validate/sendMessageCode",data,success,error);
		})
	},

	//认证登录
	// data={
	// 	token:'',
	// 	messageCode:''
	// };
	login(data={}){
		return new Promise((success,error)=>{
			ajax.run("post","npfmc/web/validate/validationCode",data,success,error);
		})
	},


	//获取区域、站点信息
	getAreaData(data={}){
		return new Promise((success,error)=>{
			ajax.run("get","npfmc/web/appointment/getArea",data,success,error);
		})
	},


	//获取站点预约信息
	// data={stationId:''}
	getSiteInfo(data={}){
		return new Promise((success,error)=>{
			ajax.run("get","npfmc/web/appointment/getDateTime",data,success,error);
		})
	},


	//提交申请
	// data:{
	// 	userName:'',
	// 	sex:'',
	// 	IDCardNo:'',
	// 	age:'',
	// 	phone:'',
	// 	appointmentDate:'',
	// 	appointmentTime:'',
	// 	stationId:''
	// }
	submitData(data={}){
		return new Promise((success,error)=>{
			ajax.run("post","npfmc/web/appointment/appointmentSubmit",data,success,error);
		})
	},


	//获取预约结果
	// data={phone:''}
	getApplicationResult(data={}){
		return new Promise((success,error)=>{
			ajax.run("get","npfmc/web/appointment/getAppointmentResult",data,success,error);
		})
	},


	//获取报告列表
	// data={phone:''}
	getReport(data={}){
		return new Promise((success,error)=>{
			ajax.run("get","npfmc/web/report/getReport",data,success,error);
		})
	}

};


module.exports = {
	ajax:ajax.send,
	api:api
};