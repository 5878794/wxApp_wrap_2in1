let fs = require('fs'),
	path = require('path'),
	exec = require('child_process').exec;


let imgDir = path.join(__dirname,'../src/image/*'),
	wwwDir = path.join(__dirname,'../trunk/image'),
	wxDir = path.join(__dirname,'../wxApp_trunk/image');


let runExec = function(cmdText){
	return new Promise(success=>{
		exec(cmdText,function(err,stdout,stderr){
			if(err) {
				console.log(err.toString())
			} else {
				success();
			}
		})
	})
};


let renderFn = function(){
	let cmdText1 = 'cp -r '+imgDir+' '+wwwDir,
		cmdText2 = 'cp -r '+imgDir+' '+wxDir;

	if(!fs.existsSync(wwwDir)){
		fs.mkdirSync(wwwDir);
	}
	if(!fs.existsSync(wxDir)){
		fs.mkdirSync(wxDir);
	}


	runExec(cmdText1).then(rs=>{
		runExec(cmdText2).then(rs=>{
			console.log('image dir copy ok!')
		})
	});


};


renderFn();
