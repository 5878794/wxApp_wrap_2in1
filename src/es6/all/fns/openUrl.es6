if(isWxApp){
	module.exports = {
		open(url){
			let pageName = url.split('.')[0];
			let param = url.split('?')[1];
			param = (param)? '?'+param : '';
			wx.navigateTo({
				url:'../'+pageName+'/index'+param
			})
		},
		closeOpen(url){
			let pageName = url.split('.')[0];
			let param = url.split('?')[1];
			param = (param)? '?'+param : '';
			wx.redirectTo({
				url:'../'+url+'/index'+param
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