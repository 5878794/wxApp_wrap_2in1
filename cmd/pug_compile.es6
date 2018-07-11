//源代码按照微信的格式写，会自动转换

//处理的特殊便签
//input
//textarea
//checkbox
//img


let pug = require('pug'),
	fs = require('fs'),
	path = require('path'),
	glob = require("glob"),
	cheerio = require("cheerio");

let pugDir = '../src/pug/',
	wwwDir = '../trunk/',
	wxDir = '../wxApp_trunk/pages/';

pugDir = path.join(__dirname,pugDir);
wwwDir = path.join(__dirname,wwwDir);
wxDir  = path.join(__dirname,wxDir);


let renderFn = function(opt={}){
	global.isWxApp = opt.isWxApp;

	//获取pugDir根目录下的所有pug文件
	let entryFiles = glob.sync(pugDir+"*.pug");


	entryFiles.map(filePath=>{
			//获取文件名 文件名不带后缀
		let fileName = filePath.replace(pugDir,"").split('.')[0],
			//获取源码,并根据全局参数编译
			html = pug.renderFile(
				filePath,
				{
					globals:['isWxApp'],
					pretty:true
				}
			);



		if(opt.isWxApp){
			let $ = cheerio.load(html,{decodeEntities: false}),
				title = $('title').text(),
				body = $('body').html();

			renderWxHtml(body,fileName,filePath,title);
		}else{
			renderWrapHtml(html,fileName,filePath);
		}
	});
};

var renderWxHtml = function(html,fileName,filePath,title){
	//处理input标签
	html = html.replace(/(<input.*?)>/gi ,"$1 />");

	//处理textarea标签
	html = html.replace(/(<textarea.*?)>/gi ,"$1 />");
	html = html.replace(/<\/textarea>/gi,'');

	// //处理checkbox标签
	html = html.replace(/(<checkbox[^-].*?)>/gi,'$1 />');
	html = html.replace(/<\/checkbox>/gi,'');

	//处理image
	html = html.replace(/<img(.*?)>/gi ,"<image $1 />");


	//根据微信app结构生成 wxml文件
	let wwwFileName = path.join(wxDir,'/'+fileName+'/'+fileName+'.wxml');
	fs.writeFileSync(wwwFileName,html,function(err){
		if(err){
			console.log(filePath+'    err!');
			console.log(err);
		}
	});

	//提取title中的标题 生成json文件
	let jsonText = {navigationBarTitleText:title};
	jsonText = JSON.stringify(jsonText);
	//json地址路径
	let jsonFileName = path.join(wxDir,'/'+fileName+'/'+fileName+'.json');
	fs.writeFileSync(jsonFileName,jsonText,function(err){
		if(err){
			console.log(filePath+'    err!');
			console.log(err);
		}
	});
};


var renderWrapHtml = function(html,fileName,filePath){
	//处理checkbox标签
	html = html.replace(/<checkbox[^-](.*?)>/gi,'<input type="checkbox" $1 />');
	html = html.replace(/<\/checkbox>/gi,'');

	//处理textarea
	//textarea的value便签的值放在中间
	html = html.replace(/<textarea.*?>/,function(rs){
		let a = rs.replace(/<textarea.*?value\s*=\s*\"(.*?)\".*?>/,'$1');
		return rs+a;
	});



	//根据www结构生成 html文件
	let wwwFileName = path.join(wwwDir,fileName+'.html');
	fs.writeFileSync(wwwFileName,html,function(err){
		if(err){
			console.log(filePath+'    err!');
			console.log(err);
		}
	});
};




renderFn({isWxApp:false});
renderFn({isWxApp:true});


