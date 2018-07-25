let n = 0,
	t = 0;

if(isWxApp){
	module.exports = {
		show:function(text){
			n++;
			if(n==1){
				t = new Date().getTime();
				wx.showLoading({
					title:text,
					mask:true
				});
			}
		},
		hide:function(){
			n--;
			if(n==0){
				let nowT = new Date().getTime(),
					tt = nowT - t;
				if(tt >= 1000){
					wx.hideLoading();
				}else{
					setTimeout(function(){
						wx.hideLoading();
					},1000-tt);
				}

			}
		}
	}
}


if(!isWxApp){
	let loadFn = require('../../lib/ui/loading_old'),
		loading;

	module.exports = {
		show:function(text){
			if(!loading){
				loading = new loadFn();
			}

			n++;
			if(n==1){
				t = new Date().getTime();
				loading.show(text);
			}
		},
		hide:function(){
			if(!loading){return;}

			n--;
			if(n==0){
				let nowT = new Date().getTime(),
					tt = nowT - t;
				if(tt >= 1000){
					loading.hide();
				}else{
					setTimeout(function(){
						loading.hide();
					},1000-tt);
				}

			}
		}
	}
}

