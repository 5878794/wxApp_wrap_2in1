var pc = new RTCPeerConnection();
var dc = pc.createDataChannel('bens',null);

dc.onmessage = function (event) {
	console.log("received: " + event.data);
};

dc.onopen = function () {
	console.log("datachannel open");
};

dc.onclose = function () {
	console.log("datachannel close");
};


pc.onicecandidate = function(rs){
	console.log(rs);
	console.log(JSON.stringify(rs.candidate))
};
pc.ondatachannel = function(rs){
	receiveChannel = rs.channel;
	receiveChannel.onmessage = function(rs){console.log(1);console.log(rs)};
	receiveChannel.onopen = function(rs){console.log(1);console.log(rs)};
	receiveChannel.onclose = function(rs){console.log(1);console.log(rs)};
	console.log(rs);
};


var sender = async function(){
	let offer =await pc.createOffer();
	pc.setLocalDescription(offer);
	console.log(JSON.stringify(offer));
};

var setD = function(str){
	pc.setRemoteDescription(str);
};


var re = async function(){
	let offer = await pc.createAnswer();
	console.log(JSON.stringify(offer));
	pc.setLocalDescription(offer);
};


var setP = function(text){

}