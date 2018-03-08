//加载iconFort的svg图标
//先载入svg
//在插入html显示svg
//svg的宽、高是em单位，因此设置字体大小可以改变他的宽高

// let svgSprite = '<svg>' +
// 	'   <symbol id="icon-weibiaoti101" viewBox="0 0 1024 1024">' +
// 	'       <path d="M553.568 512l270.112-270.112c11.488-11.488 11.488-30.08 0-41.568-11.488-11.488-30.08-11.488-41.568 0L512 470.432 241.888 200.352c-11.488-11.488-30.08-11.488-41.568 0-11.488 11.488-11.488 30.08 0 41.568L470.432 512l-270.112 270.112c-11.488 11.488-11.488 30.08 0 41.568 11.488 11.488 30.08 11.488 41.568 0L512 553.568l270.112 270.112c11.488 11.488 30.08 11.488 41.568 0 11.488-11.488 11.488-30.08 0-41.568L553.568 512z"  >' +
// 	'       </path>' +
// 	'   </symbol>' +
// 	'   </svg>';
// let id = Symbol();
//
// svgFontHtmlSet(svgSprite,id);
// let html = svgFontHtmlGet(id);
//
// $("body").append(html);


let svgFontHtmlSet = function(svgHtml,id){
	let div = document.createElement("div");
	div.innerHTML = svgHtml;
	let svg = div.getElementsByTagName("svg")[0];
	if (svg) {
		svg.setAttribute("aria-hidden", "true");
		svg.style.position = "absolute";
		svg.style.width = 0;
		svg.style.height = 0;
		svg.style.overflow = "hidden";

		$(svg).find("symbol").attr({id:id});
	}

	$("body").prepend($(div).html());
};



let svgFontHtmlGet = function(id){
	let svg = $("<svg  aria-hidden='true'></svg>");
	svg.css({
		width: "1em",
		height: "1em",
		"vertical-align": "-0.15em",
		fill: "currentColor",
		overflow: "hidden"
	});
	svg.append("<use xlink:href='#"+id+"'></use>");
	return svg.get(0).outerHTML;
};


let svgFontHtmlDel = function(id){
	$("#"+id).parent().remove();
};




module.exports = {
	set:svgFontHtmlSet,
	get:svgFontHtmlGet,
	del:svgFontHtmlDel
};