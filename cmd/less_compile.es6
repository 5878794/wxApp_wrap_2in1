// lessc --modify-var="isWxApp=true"  ./src/less/index.less ./index.css

// lessc --functions --modify-var="isWxApp=false"   ./src/less/index.less ./index.css



let fs = require('fs'),
	path = require('path'),
	glob = require("glob"),
	exec = require('child_process').exec,
	setting = require('./setting.es6');


let lessDir = path.join(__dirname,'../src/less/'),
	wwwDir = path.join(__dirname,'../trunk/css/'),
	wxDir = path.join(__dirname,'../wxApp_trunk/pages/');


let runExec = function(cmdText){
	exec(cmdText,function(err,stdout,stderr){
		if(err) {
			console.log(err.toString())
		} else {

		}
	})
};


let renderFn = function(opt={}){
	let entryFiles = glob.sync(lessDir+"*.less"),
		isWxApp = (opt.isWxApp)? 'true' : 'false';

	entryFiles.map(filePath=>{
		let fileName = filePath.replace(lessDir,"").split('.')[0],
			outPath = (opt.isWxApp)?
				path.join(wxDir,'/'+fileName+'/'+fileName+'.wxss') :
				path.join(wwwDir,'/'+fileName+'.css'),
			cmdText = 'lessc --functions --modify-var="wxWidth='+setting.wxWidth+'"  --modify-var="psdWidth='+setting.psdWidth+'" --modify-var="isWxApp='+isWxApp+'"   '+filePath+' ' +outPath;

		runExec(cmdText);
	});
};


renderFn({isWxApp:true});
renderFn({isWxApp:false});


