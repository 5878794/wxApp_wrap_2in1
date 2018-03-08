let webpack = require('webpack'),
	path = require('path'),
	glob = require("glob"),
	wxDir = path.join(__dirname,'../wxApp_trunk/pages/'),
	wrapDir = path.join(__dirname,'../trunk/js/');

let setting = require('./setting.es6');


//获取es6文件列表
let getEs6FileList = function(isWxApp){
	let es6Dir = path.join(__dirname,'../src/es6/'),
		entryFiles = glob.sync(es6Dir+"*.es6");

	if(isWxApp){
		return getWxFilesObj(entryFiles,es6Dir);
	}else{
		return getWrapFileObj(entryFiles,es6Dir);
	}
};

//生成微信app的文件对应关系
let getWxFilesObj = function(entryFiles,es6Dir){
	let obj = {};
	entryFiles.map(filePath=>{
		let fileName = filePath.replace(es6Dir,"").split('.')[0],
			key = 'wxApp_trunk/pages/'+fileName+'/'+fileName;

		obj[key] = filePath;
	});
	return obj;
};

//生成wrap的app的文件对应关系
let getWrapFileObj = function(entryFiles,es6Dir){
	let obj = {};
	entryFiles.map(filePath=>{
		let fileName = filePath.replace(es6Dir,"").split('.')[0],
			key = 'trunk/js/'+fileName;

		obj[key] = filePath;
	});
	return obj;
};

//根据是否是微信app加载插件和设置全局变量
let getPlugIns = function(isWxApp){
	if(isWxApp){
		return [
			new webpack.DefinePlugin({
				isWxApp:true,
				psdWidth:setting.psdWidth,
				wxWidth:setting.wxWidth
			}),
			new webpack.optimize.UglifyJsPlugin({
				compress: true,
				output: {
					comments: false
				},
				except: ['$super', '$', 'App','Page','exports','require','super','window','wx']    //排除关键字
			})
		]
	}else{
		return [
			new webpack.DefinePlugin({
				isWxApp:false,
				psdWidth:setting.psdWidth,
				wxWidth:setting.wxWidth
			}),
			new webpack.optimize.UglifyJsPlugin({
				compress: true,
				output: {
					comments: false
				},
				except: ['$super', '$', 'exports','require','super','window']    //排除关键字
			})
		]
	}
};



let param = {
	//页面入口文件配置
	//下面自动生成
	// entry:getEs6FileList(),
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
	// devtool:false,
	devtool:'eval-source-map',
	//入口文件输出配置
	output: {
		path: path.join(__dirname,'../'),
		filename: "[name].js"
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
			path.resolve(__dirname,"../src/es6/lib"),
			path.resolve(__dirname,'../src/js/include'),
			"../node_modules"
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
	// plugins:[
	// 	//全局变量
	// 	new webpack.DefinePlugin({
	// 		isWxApp:false
	// 	}),
	//
	//
	// 	//去除注释 压缩代码
	// 	new webpack.optimize.UglifyJsPlugin({
	// 		compress: true,
	// 		output: {
	// 			comments: false
	// 		},
	// 		except: ['$super', '$', 'exports','require','super','window']    //排除关键字
	// 	})
	// 	//合并公共部分生成单独的文件,需要单独引用  pub.bundle.js
	// 	// new webpack.optimize.CommonsChunkPlugin('pub'),
	// 	//文件头部注释
	// 	// new webpack.BannerPlugin("######5878794@qq.com######"),
	//
	// 	//提取公共代码放到指定位置
	// 	// new webpack.optimize.CommonsChunkPlugin({
	// 	// 	name: 'common', // 这公共代码的chunk名为'commons'
	// 	// 	filename: 'js/[name].min.js', // 生成后的文件名，虽说用了[name]，但实际上就是'commons.bundle.js'了
	// 	// 	minChunks: 3 // 设定要有4个chunk（即4个页面）加载的js模块才会被纳入公共代码。这数目自己考虑吧，我认为3-5比较合适。
	// 	// })
	// ]

};


let renderFn = function(opt={}){

	//生成不同的文件编译对象
	param.entry = getEs6FileList(opt.isWxApp);

	//是否是调试模式  wxApp暂时不支持
	if(opt.isDebug){
		param.devtool = 'eval-source-map';
	}else{
		param.devtool = false;
	}

	//传入全局变量 isWxApp
	//设置插件等
	param.plugins = getPlugIns(opt.isWxApp);


	let compiler = webpack(param);
	compiler.run((err, stats) => {
		if(err){
			console.log(err);
		}
		// console.log('----------');
		// console.log(stats);
	});
};




renderFn({isWxApp:true,isDebug:false});
renderFn({isWxApp:false,isDebug:true});


