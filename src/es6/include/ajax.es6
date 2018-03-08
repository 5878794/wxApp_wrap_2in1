// let md5 = require("./lib/fn/md5"),
// 	app = require("./lib/JkAndWeChat");


let ajax = {
	//请求函数主体
	run(url, data, success, error){
		url = SETTING.serverUrl + url;

		//预约挂号特有
		// data.token = this.token;
		// data.userToken = this.userToken;
		// data.sign = this.sign(data);


		$.ajax({
			type: "post",
			cache: false,
			url: url,
			data: data,
			//contentType:"application/json",
			dataType: "json",
			timeout: 20000,     //20秒
			success: function(rs) {
				if(rs.state != 1){
					error(rs.msg);
				}

				success(rs.data);

			},
			error: function() {
				error("网络错误,无法连接服务器。");
			}
		});
	},
	//发送一堆请求
	async send(arr){
		//预约挂号特有
		// this.token = await this.getToken();
		// this.userToken = await app.getUserToken();

		return new Promise((success,error)=>{
			Promise.all(arr).then(rs=>{
				success(rs)
			}).catch(rs=>{
				error(rs);
				throw "ajax error";
			})
		})
	}

};

let api = {
	//场馆列表
	// data={
	//      name:"",        str  名称模糊查询
	//      index:"",       int  分页页数
	//      size:""         int  每页数量
	// }
	// "getVenuesList":"appVenue/getAppVenueByPage.do",
	"getVenuesList":function(data={}){
		return new Promise((success,error)=>{
			ajax.run("api/appVenue/getAppVenueByPage.do",data,success,error);
		})
	}
};





module.exports = {ajax,api};