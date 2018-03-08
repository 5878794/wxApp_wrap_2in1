



module.exports = {
	run(obj){
		obj.onLoad = obj.init;
		Page(obj);
	}
};