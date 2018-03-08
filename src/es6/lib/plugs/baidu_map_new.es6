
// <script type="text/javascript" src="http://api.map.baidu.com/api?v=2.0&ak=2E8A892BB5012b048b85cceae7e32665"></script>



let baidu = {
	map:null,
	//创建
	create:function(id){

		this.map = new BMap.Map(id);
	},
	//设置中心点和缩放
	setCenter:function(x,y){
		//设置中心点
		this.map.centerAndZoom(
			//中心点经纬度
			new BMap.Point(x,y),
			//地图初始缩放级别
			12
		);
	},
	//定位
	location:function(success,error){
		var geolocationControl = new BMap.GeolocationControl();
		geolocationControl.addEventListener("locationSuccess", function(e){
			// 定位成功事件

			success(e.point);
			//

		});
		geolocationControl.addEventListener("locationError",function(e){
			// 定位失败事件
			error(e.message);
			// alert(e.message);
		});
		this.map.addControl(geolocationControl);
		geolocationControl.location();
	},
	//驾车路径   p={x:point.lng,y:point.lat}
	driving:function(p1,p2){
		var _p1 = new BMap.Point(p1.x,p1.y);
		var _p2 = new BMap.Point(p2.x,p2.y);

		var _this = this;
		var driving = new BMap.DrivingRoute(_this.map, {renderOptions:{map: _this.map, autoViewport: true}});
		driving.search(_p1, _p2);
	},
	//获取2点点距离 单位：米    p={x:point.lng,y:point.lat}
	getDistance:function(p1,p2){
		var _p1 = new BMap.Point(p1.x,p1.y);
		var _p2 = new BMap.Point(p2.x,p2.y);

		return this.map.getDistance(_p1, _p2);
	}
};


module.exports = baidu;