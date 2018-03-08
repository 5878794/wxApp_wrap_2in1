


//生成曲线图效果4  月经的




let svgObj = require("./../svg/svg"),
	init = Symbol('init'),
	device = require('./../device'),
	typeInfo = [
		{
			name:'月经期',
			color:'#ff9436',
			val:'10'
		},{
			name:'安全期',
			color:'#07ecc2',
			val:'15'
		},{
			name:'易孕期',
			color:'#ff4b6f',
			val:'90'
		}
	],
	createSVG = Symbol(),
	getSvgWidth = Symbol(),
	setBodyStyle = Symbol(),
	getRealPoint = Symbol(),
	createLine = Symbol(),
	createY = Symbol(),
	createX = Symbol(),
	createFilter = Symbol(),
	weekList = {
		'0':'日',
		'1':'一',
		'2':'二',
		'3':'三',
		'4':'四',
		'5':'五',
		'6':'六'
	},
	createInfo = Symbol(),
	createMain = Symbol();





class graph4{
	constructor(opt={}){
		this.body = opt.body || $("body");
		this.data = opt.data || [];         //[{x:0,y:0,isToday:false},...]
		this.y = opt.y || [0,20,40,60,80,100];
		this.yTitle = opt.yTitle || '怀孕几率(%)';
		this.typeInfo = opt.typeInfo || typeInfo;

		this.todayBg = '#fbc114';
		this.todayColor = '#51301e';
		this.xDateColor = '#ababab';
		this.xDateFontsize = 11;
		this.color = '#666666';
		this.fontsize = 12;
		// this.infoFontSize = 11;
		// this.infoColor = '#666666';
		this.yTitleColor = '#ababab';
		this.yTitleFontSize = 11;
		this.lineColor = '#ececec';
		this.lineColors = ['rgb(255,173,75)','rgb(0,253,194)','rgb(255,104,138)'];

		//是否显示线条颜色说明块
		this.isShowInfo = opt.isShowInfo || false;

		//svg 除曲线图外的空白区域（空白区域包含x、y信息）
		this.leftPadding = opt.leftPadding || 70;
		this.bottomPadding = opt.bottomPadding || 60;
		this.topPadding = opt.topPadding || 40;
		this.rightPadding = opt.rightPadding || 20;
		this.infoHeight = opt.infoHeight || 25;


		//svg的宽、高
		this.width = null;
		this.height = null;
		//线条 x、y的间距
		this.xySpacing = null;
		//y轴 1个点对应的距离xp；
		this.yScale = null;


		this.svg = null;
		this[init]();
	}

	[init](){
		this[setBodyStyle]();
		this[getSvgWidth]();
		this[createSVG]();
		this[createLine]();
		this[createY]();
		this[createX]();
		this[createInfo]();
		// this[createFilter]();
		this[createMain]();

		this.body.html(this.body.html());
	}

	//设置容器样式
	[setBodyStyle](){
		this.body.css({
			'overflow-x':'scroll',
			'overflow-y':'hidden',
			'-webkit-overflow-scrolling':'touch'
		});
	}

	//根据数据获取svg的总宽、高
	[getSvgWidth](){
		this.height = parseInt(this.body.height());

		let height = this.height - this.topPadding - this.bottomPadding;
		height = (this.isShowInfo)? height - this.infoHeight : height;

		//获取x、y坐标间的间距
		this.xySpacing = height/5;
		this.yScale = height/this.y[this.y.length-1];

		this.width = (this.data.length - 1) * this.xySpacing + this.leftPadding + this.rightPadding;
	}

	//创建svg
	[createSVG](){
		this.svg = new svgObj({
			container:this.body,
			width:this.width,
			height:this.height
		});
	}

	//获取真实的坐标
	[getRealPoint](x,y){
		x = x*this.xySpacing + this.leftPadding;
		y = this.height - this.bottomPadding - y*this.yScale;

		return x+","+y;
	}

	//创建表格
	[createLine](){
		let g = this.svg.createElement({
			tag:"g",
			attr:{_name:'wg'}

		});


		//创建横线
		let x1 = 0,
			x2 = this.data.length-1;

		this.y.map(_y=>{
			let p1 = this[getRealPoint](x1,_y),
				p2 = this[getRealPoint](x2,_y),
				line = this.svg.createElement({
				tag:"path",
				attr:{
					d:"M "+p1+" L "+p2,
					fill:"none",
					stroke:this.lineColor,
					"stroke-width":"1px"
				}
			});

			g.append(line);
		});


		//创建竖线
		let y1 = 0,
			y2 = this.y[this.y.length-1];

		for(let i =0,l=this.data.length;i<l;i++){
			let p1 = this[getRealPoint](i,y1),
				p2 = this[getRealPoint](i,y2),
				line = this.svg.createElement({
					tag:"path",
					attr:{
						d:"M "+p1+" L "+p2,
						fill:"none",
						stroke:this.lineColor,
						"stroke-width":"1px"
					}
				});

			g.append(line);
		}



		this.svg.svg.append(g);
	}

	//创建y轴
	[createY](){
		let g = this.svg.createElement({
			tag:"g",
			attr:{_name:'y'}
		});

		let x= this.leftPadding/2;
		this.y.map(val=>{
			let y = this.height - this.bottomPadding - val*this.yScale,
				text = this.svg.createElement({
				tag: "text",
				val: val.toString(),
				attr: {
					x:x,
					y:y,
					fill:this.color,
					"text-anchor":"middle",
					"dominant-baseline":"middle",  //垂直底部居中
					"font-size":this.fontsize+"px"
				}
			});

			g.append(text);
		});


		//创建y的名称
		let yName = this.svg.createElement({
			tag: "text",
			val: this.yTitle,
			attr: {
				x:x,
				y:this.topPadding/2,
				fill:this.yTitleColor,
				"text-anchor":"middle",
				"dominant-baseline":"middle",  //垂直底部居中
				"font-size":this.yTitleFontSize+"px"
			}
		});
		g.append(yName);

		this.svg.svg.append(g);
	}

	//创建x轴
	[createX](){
		//生成容器
		let g = this.svg.createElement({
			tag:"g",
			attr:{_name:'x'}
		});


		//生成日期
		let y = this.height - this.bottomPadding + this.bottomPadding/4,
			y1 = y + this.bottomPadding/4;
		for(let i=0,l=this.data.length;i<l;i++){
			let x = this.leftPadding + i * this.xySpacing,
				val = this.data[i].x.split('-');
			val = val[1]+'-'+val[2];

			if(this.data[i].isToday){
				let grap = this.svg.createElement({
					tag:'rect',
					attr:{
						x:x - this.xDateFontsize*1.5,
						y:y - this.xDateFontsize/2 -2,
						width:this.xDateFontsize*3,
						height:this.xDateFontsize+4,
						rx:this.xDateFontsize/2,
						ry:this.xDateFontsize/2,
						fill:this.todayBg,
					}
				});
				g.append(grap);
			}
			let text = this.svg.createElement({
				tag: "text",
				val: val,
				attr: {
					x:x,
					y:y,
					fill:(this.data[i].isToday)? this.todayColor : this.xDateColor,
					"text-anchor":"middle",
					"dominant-baseline":"middle",  //垂直底部居中
					"font-size":this.xDateFontsize+"px"
				}
			});

			//生成星期
			let this_date = this.data[i].x;
			this_date = (device.isIphone || device.isIpad)? this_date.replace(/\-/ig,'\/') : this_date;
			let week = new Date(this_date).getDay().toString();
			week = weekList[week];
			let text1 = this.svg.createElement({
				tag: "text",
				val: week,
				attr: {
					x:x,
					y:y1,
					fill:this.color,
					"text-anchor":"middle",
					"dominant-baseline":"middle",  //垂直底部居中
					"font-size":this.fontsize+"px"
				}
			});
			g.append(text);
			g.append(text1);
		}


		this.svg.svg.append(g);
	}

	//创建图示区域
	[createInfo](){
		// div+css单独写
	}

	//创建滤镜
	[createFilter](){
		//生成容器
		let defs = this.svg.createElement({
			tag:"defs",
			attr:{}
		});

		let filter = this.svg.createElement({
			tag:'filter',
			attr:{
				id:'filter',
				x:0,y:0,width:'1000%',height:'1000%'
			}
		});

		let feOffset = this.svg.createElement({
			tag:'feOffset',
			attr:{
				result:'offOut',
				in:'SourceGraphic',
				dx:0,
				dy:9
			}
		});

		let feGaussianBlur = this.svg.createElement({
			tag:'feGaussianBlur',
			attr:{
				result:'blurOut',
				in:'offOut',
				stdDeviation:'5'
			}
		});

		// let feBlend = this.svg.createElement({
		// 	tag:'feBlend',
		// 	attr:{
		// 		in:'SourceGraphic',
		// 		in2:'blurOut',
		// 		mode:'normal'
		// 	}
		// });

		filter.append(feOffset).append(feGaussianBlur);
		defs.append(filter);
		this.svg.svg.append(defs);

	}

	//创建曲线
	[createMain](){
		//生成容器
		let g = this.svg.createElement({
			tag:"g",
			attr:{_name:'line'}
		});


		for(let i=0,l=this.data.length-1;i<l;i++){
			let rs = this.data[i],
				rs1 = this.data[i+1],
				p1x = i,
				p1y = rs.y,
				p2x = i+1,
				p2y = rs1.y;

			if(!p1y || !p2y){
				continue;
			}
				// p3x = i+1,
				// p3y = p2y+1,
				// p4x = i,
				// p4y = p1y+1,
				// p5x = i,
				// p5y = p1y+2,
				// p6x = i+1,
				// p6y = p2y+2,
			let	p1 = this[getRealPoint](p1x,p1y),
				p2 = this[getRealPoint](p2x,p2y),
				// p3 = this[getRealPoint](p3x,p3y),
				// p4 = this[getRealPoint](p4x,p4y),
				// p5 = this[getRealPoint](p5x,p5y),
				// p6 = this[getRealPoint](p6x,p6y),
				maxY = (p1y>p2y)? p1y : p2y,
				color = (maxY<=10)? this.lineColors[0] :
						(maxY<=15)? this.lineColors[1] :
									this.lineColors[2];

			let line = this.svg.createElement({
				tag:"path",
				attr:{
					d:'M '+p1+' L '+p2,
					fill:'none',
					stroke:color,
					'stroke-width':'4px',
					"stroke-linecap": "round"
				}
			});
			// let line1 = this.svg.createElement({
			// 	tag:"path",
			// 	attr:{
			// 		d:'M '+p4+' L '+p3+' L '+p6+' L '+p5+' Z',
			// 		fill:color,
			// 		stroke:color,
			// 		'stroke-width':'10px',
			// 		filter:'url(#filter)',
			// 		"stroke-linecap": "round"
			// 	}
			// });

			g.append(line);
			// g.append(line1);

		}

		this.svg.svg.append(g);
	}
}


module.exports = graph4;








