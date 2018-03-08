var webpack = require('webpack');
var path = require('path');
var glob = require("glob");



//生成要编译的文件列表
var getEs6List = function(){
	//获取es6文件夹的绝对地址
	var es6Src = __dirname+"/src/es6/";
	//获取es6文件夹下第2层目录中的所有es6文件  并返回数组
	var entryFiles = glob.sync(es6Src+"*.es6");
	var map = {};

	for(var i=0,l=entryFiles.length;i<l;i++){
		var this_file = entryFiles[i];
		//获取相对es6文件夹下的相对路径
		this_file = this_file.replace(es6Src,"");

		//获取es6下第一层文件夹的名字 和文件名不带后缀
		var paths = this_file.split("/"),
			dirName = "",fileName = "";

		if(paths.length == 2){
			dirName = paths[0]+"/";
			fileName = paths[1].split(".")[0];
		}else{
			fileName = paths[0].split(".")[0];
		}

		//排除lib文件夹
		if(dirName == "lib/"){continue;}
		//排除文件名中有"_"符号的文件
		if(fileName.indexOf("_")>-1){continue;}

		//生成需要存放编译后的相对trunk文件夹的路径
		var key = dirName+"js/"+fileName;
		//生成Json
		map[key] = entryFiles[i];
	}

	return map;
};
// console.log(getEs6List());

var getEs6List1 = function(){
	//获取es6文件夹的绝对地址
	var es6Src = __dirname+"/src/es6/";
	es6Src = es6Src.replace(/\\/ig,"/");
	//获取es6文件夹下第2层目录中的所有es6文件  并返回数组
	var entryFiles = glob.sync(es6Src+"*.es6");
	var map = {};

	for(var i=0,l=entryFiles.length;i<l;i++){
		var this_file = entryFiles[i];
		//获取相对es6文件夹下的相对路径
		this_file = this_file.replace(es6Src,"");

		//获取es6下第一层文件夹的名字 和文件名不带后缀
		var fileName = "";
		fileName = this_file.split(".")[0];

		//排除文件名中有"_"符号的文件
		if(fileName.indexOf("_") == 0){continue;}

		//生成需要存放编译后的相对trunk文件夹的路径
		var key = "js/dist/"+fileName;
		//生成Json
		map[key] = entryFiles[i];
	}

	return map;
};


module.exports = {

	//页面入口文件配置
	entry:getEs6List1(),
	// entry: {
	// 	// "coachesAndVenues/js/index":"./src/es6/coachesAndVenues/index.es6",
	// 	// "coachesAndVenues/js/coachList":"./src/es6/coachesAndVenues/coachList.es6",
	// 	// "coachesAndVenues/js/venuesInfo":"./src/es6/coachesAndVenues/venuesInfo.es6",
	// 	// "coachesAndVenues/js/coachInfo":"./src/es6/coachesAndVenues/coachInfo.es6",
	// 	// "appType/js/index":"./src/es6/appType/index.es6",
	// 	// "appType/js/more":"./src/es6/appType/more.es6",
	// 	// "handlingGuideline/js/index":"./src/es6/handlingGuideline/index.es6",
	// 	// "handlingGuideline/js/info":"./src/es6/handlingGuideline/info.es6",
	// 	// "news/js/index":"./src/es6/news/index.es6",
	// 	// "news/js/info":"./src/es6/news/info.es6",
	// 	// "healthTest/js/index":"./src/es6/healthTest/index.es6"
	// },
	devtool:false,
	//入口文件输出配置
	output: {
		path: __dirname+"/trunk/",
		filename: "[name].min.js"
	},
	// watch:true,
	module: {
		//加载器配置
		loaders: [
			{
				test: /\.es6?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				query: {
					presets: ['env','stage-3'],
					plugins: ["transform-decorators-legacy"]
				}
			}
		]
	},
	//其它解决方案配置
	resolve: {
		//自动扩展文件后缀名，意味着我们require模块可以省略不写后缀名
		extensions: ['.es6','.js'],
		//自己的库地址
		modules: [
			path.resolve(__dirname, "src/js/lib"),
			"node_modules"
		]
		//模块别名定义，方便后续直接引用别名，无须多写长长的地址
		// alias: {
		// 	//后续直接 require('mod1') 即可
		// 	mod1 : __dirname+'/js/mod1.es6',
		// 	mod2 : __dirname+'/js/mod2.js',
		// 	mod3 : __dirname+'/js/mod3.es6'
		// }
	},
	//插件
	plugins:[
		//去除注释 压缩代码
		new webpack.optimize.UglifyJsPlugin({
			compress: true,
			output: {
				comments: false
			},
			except: ['$super', '$', 'exports','require','super','window']    //排除关键字
		}),
		//合并公共部分生成单独的文件,需要单独引用  pub.bundle.js
		// new webpack.optimize.CommonsChunkPlugin('pub'),
		//文件头部注释
		new webpack.BannerPlugin("######5878794@qq.com######"),

		//提取公共代码放到指定位置
		new webpack.optimize.CommonsChunkPlugin({
			name: 'common', // 这公共代码的chunk名为'commons'
			filename: 'js/[name].min.js', // 生成后的文件名，虽说用了[name]，但实际上就是'commons.bundle.js'了
			minChunks: 3 // 设定要有4个chunk（即4个页面）加载的js模块才会被纳入公共代码。这数目自己考虑吧，我认为3-5比较合适。
		})
	]
};