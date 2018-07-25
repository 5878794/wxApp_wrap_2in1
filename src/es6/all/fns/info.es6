if(isWxApp){
	module.exports = {
		show:function(text){
			wx.showToast({
				title:text,
				icon:'none',
				duration:1500,
				mask:true
			});
		},
		hide:function(){
			wx.hideToast();
		}
	}
}


if(!isWxApp){
	let info = require('../../lib/ui/info');

	module.exports = {
		show:function(text){
			info.show(text);
		},
		hide:function(){
			info.hide();
		}
	}
}