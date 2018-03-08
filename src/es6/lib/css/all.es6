require("../jq/extend");


var css = {
	'*':{
		margin:0,
		padding:0,
		'list-style':'none',
		'-webkit-user-select':'none',
		'-ms-user-select':'none',
		'-moz-user-select':'none',
		'-webkit-tap-highlight-color':'rgba(0,0,0,0)',
		'-webkit-touch-callout':'none',
		'-webkit-text-size-adjust':'none'
	},
	'img':{
		border:'none'
	},
	'input,textarea':{
		'-webkit-user-select':'auto',
		'-ms-user-select':'auto',
		'-moz-user-select':'auto',
		'user-select':'auto',
		border:'none'
	},
	'input,button,select,textarea':{
		outline:'none'
	},
	'select':{
		'background-color':'transparent',
		'border-color':'transparent',
		'-webkit-appearance': 'none'
	},
	'a:link,a:visited':{
		'text-decoration': 'none'
	},
	'a:hover':{
		'text-decoration': 'none'
	},
	'.backhidden':{
		'backface-visibility': 'hidden',
		'-webkit-backface-visibility': 'hidden',
		'-ms-backface-visibility': 'hidden',
		'transform-style': 'preserve-3d',
		'-webkit-transform-style': 'preserve-3d'
	},
	'.diandian':{
		'text-overflow':'ellipsis',
		'white-space':'nowrap',
		'overflow':'hidden'
	},
	'.diandian2':{
		'overflow':'hidden',
		'text-overflow': 'ellipsis',
		'display': '-webkit-box',
		'-webkit-line-clamp': '2',
		'-webkit-box-orient': 'vertical'
	},
	'.diandian3':{
		'overflow': 'hidden',
		'text-overflow': 'ellipsis',
		'display': '-webkit-box',
		'-webkit-line-clamp':'3',
		'-webkit-box-orient':'vertical'
	},
	'.breakall':{
		'word-wrap':'break-word',
		'word-break':'break-all'
	},
	'.notbreak':{
		'white-space':'nowrap'
	},
	'.boxflex1':{
		'flex':'1',
		'box-flex':'1',
		'-webkit-box-flex':'1',
		'-ms-flex':'1',
		'-moz-box-flex':'1'
	},
	'.boxflex2':{
		'box-flex':'2',
		'-webkit-box-flex':'2',
		'-ms-flex':'2',
		'-moz-box-flex':'2'
	},
	'.box_s':{
		'display': ['flex','-ms-flexbox','-webkit-box','-moz-box'],
		'width': '100%',
		'flex-direction':'column',
		'box-orient':'vertical',
		'-webkit-box-orient':'vertical',
		'-ms-flex-direction':'column',
		'-moz-box-orient':'vertical'
	},
	'.box_h':{
		'display':['flex','-ms-flexbox','-webkit-box','-moz-box'],
		'width': '100%',
		'flex-direction':'row',
		'box-orient':'horizontal',
		'-webkit-box-orient':'horizontal',
		'-ms-flex-direction':'row',
		'-moz-box-orient':'horizontal'
	},
	'.hidden':{
		'display':'none'
	},
	'.center':{
		'display':['flex','-ms-flexbox','-webkit-box','-moz-box'],
		'width': '100%',
		'align-items':'center',
		'justify-content':'center',
		'box-align':'center',
		'box-pack':'center',
		'-webkit-box-align':'center',
		'-webkit-box-pack':'center',
		'-ms-flex-pack':'center',
		'-ms-flex-align':'center',
		'-moz-box-align':'center',
		'-moz-box-pack':'center'
	},
	'.center_s':{
		'display':['flex','-ms-flexbox','-webkit-box','-moz-box'],
		'width':'100%',
		'align-items':'center',
		'box-align':'center',
		'-webkit-box-align':'center',
		'-ms-flex-align':'center',
		'-moz-box-align':'center'
	},
	'.center_h':{
		'display':['flex','-ms-flexbox','-webkit-box','-moz-box'],
		'width':'100%',
		'justify-content':'center',
		'box-pack':'center',
		'-webkit-box-pack':'center',
		'-ms-flex-pack':'center',
		'-moz-box-pack':'center'
	},
	'.average_h':{
		'display':['flex','-ms-flexbox','-webkit-box','-moz-box'],
		'width':'100%',
		'justify-content':'space-between',
		'box-pack':'justify',
		'-webkit-box-pack':'justify',
		'-ms-flex-pack':'justify',
		'-moz-box-pack':'justify'
	},
	'.average_s':{
		'display':['flex','-ms-flexbox','-webkit-box','-moz-box'],
		'width':'100%',
		'align-items':'stretch',
		'box-align':'baseline',
		'-webkit-box-align':'baseline',
		'-ms-flex-align':'baseline',
		'-moz-box-align':'baseline'
	},
	'.align_left':{
		'display':['flex','-ms-flexbox','-webkit-box','-moz-box'],
		'width':'100%',
		'align-items':'flex-start',
		'box-pack':'start',
		'-webkit-box-pack':'start',
		'-ms-flex-pack':'start',
		'-moz-box-pack':'start'
	},
	'.border_box':{
		'box-sizing': 'border-box',
		'-webkit-box-sizing': 'border-box',
		'-moz-box-sizing': 'border-box'
	},
	'.gray':{
		'-webkit-filter':'grayscale(100%)',
		'-moz-filter': 'grayscale(100%)',
		'-ms-filter': 'grayscale(100%)',
		'-o-filter': 'grayscale(100%)',
		'filter': ['grayscale(100%)','gray']
	},
	'.clear':{
		'clear': 'both'
	},
	'.hover_animate':{
		'-webkit-transition': 'all .2s linear',
		'-moz-transition': 'all .2s linear',
		'-ms-transition': 'all .2s linear',
		'-o-transition': 'all .2s linear',
		'transition': 'all .2s linear'
	}
};








//json对象转 css样式文本
var jsonToCss = function(obj){
	let text = "";
	for(var key in obj){
		if(obj.hasOwnProperty(key)){
			let this_obj = obj[key];
			text += key+"{";
			for(var key1 in this_obj){
				if(this_obj.hasOwnProperty(key1)){
					let val = this_obj[key1];
					if($.isArray(val)){
						for(var i=0,l=val.length;i<l;i++){
							text += key1 + ":" + val[i] + ";";
						}
					}else{
						text += key1+":"+this_obj[key1]+";";
					}
				}
			}
			text += "}"
		}
	}
	return text;
};


//json对象转 css样式文本
var cssHtml = jsonToCss(css);


//创建style元素
var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = cssHtml;

//style插入到title元素到后面
var title = document.getElementsByTagName('title')[0];
document.head.insertBefore(style,title.nextSibling);


module.exports = null;