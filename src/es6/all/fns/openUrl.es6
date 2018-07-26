if(isWxApp){
	module.exports = {
		open(url){
			url = url.split('.')[0];
			wx.navigateTo({
				url:'../'+url+'/index'
			})
		},
		closeOpen(url){
			url = url.split('.')[0];
			wx.redirectTo({
				url:'../'+url+'/index'
			})
		}
	};
}


if(!isWxApp){
	module.exports = {
		open(url){
			window.location.href = url;
		},
		closeOpen(url){
			window.location.replace(url);
		}
	};
}