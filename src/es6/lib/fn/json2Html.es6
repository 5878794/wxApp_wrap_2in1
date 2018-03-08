//在html中显示JSON格式的样式,不能收缩代码

//
// var json2Html = require("json2Html"),
// 	aaa = {a:1,b:{c:"aa",d:1},c:[1,2,3]};
// $("body").html(json2Html(aaa));



let changeFn = function(json){
	json = JSON.stringify(json, undefined, 4);
	json = json.replace(/\n/g,"<br/>").replace(/\s{4}/g,"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
	// json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	// json = json.replace(/\{/g,"object<div>").replace(/\}/g,"</div>");


	return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
		//number
		var cls = 'color: darkorange;';
		if (/^"/.test(match)) {
			if (/:$/.test(match)) {
				//key
				cls = 'color: red;';
			} else {
				//string
				cls = 'color: green;';
			}
		} else if (/true|false/.test(match)) {
			//boolean
			cls = 'color: blue;';
		} else if (/null/.test(match)) {
			//null
			cls = 'color: magenta;';
		}
		return '<span style="' + cls + '">' + match + '</span>';
	});
};




module.exports = changeFn;