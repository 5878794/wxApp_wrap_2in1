//ajax请求
let regeneratorRuntime = require('regenerator-runtime');

let serverUrl = require('../_setting').serverUrl;



if(isWxApp){
	module.exports = {
		run(type='get',url, data, success, error){
			type = type.toUpperCase();
			wx.request({
				url: serverUrl+url,
				data: data,
				method:type,
				dataType:'json',
				header: {
					'content-type': 'application/json' // 默认值
				},
				success: function(rs) {
					rs = rs.data;
					if(rs.state != 1){
						error(rs.msg);
					}

					success(rs.data);
				},
				fail:function (err) {
					error("网络错误,无法连接服务器。");
				}
			});
		},
		async send(arr){
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
}


if(!isWxApp){
	module.exports = {
		//请求函数主体
		run(type,url, data, success, error){
			$.ajax({
				type: type,
				cache: false,
				url: serverUrl+url,
				data: data,
				//contentType:"application/json",
				dataType: "json",
				timeout: 20000,     //20秒
				success: function(rs) {
					// console.log(rs)
					if(rs.state != 1){
						error(rs.msg);
					}

					success(rs.data);

				},
				error: function(e) {
					if(e.status == 0 && e.statusText != 'timeout'){
						return;
					}
					error("网络错误,无法连接服务器。");
				}
			});
		},
		//发送一堆请求
		async send(arr){
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
}