

let add = function(cssHtml,id){
	//创建style元素
	let style = document.getElementById(id) || document.createElement('style');

	style.type = 'text/css';
	style.innerHTML += cssHtml;
	style.id = id;

	//style插入到title元素到后面
	document.head.appendChild(style);
};


let del = function(id){
	let delObj = document.getElementById(id);
	delObj.parentElement.removeChild(delObj);
};





module.exports = {add,del};