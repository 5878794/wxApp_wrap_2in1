//需要jq，setting.js

let device = require("./device"),
    getUrlParam = require("./fn/getParamFromUrl"),
    session = require("./h5/sessionData"),
    localData = require('./h5/localData'),
    isDebug = Symbol("isDebug"),
    isApp = Symbol("isApp"),
    hasAllReady = Symbol("hasAllReady"),
    readyFns = Symbol("readyFns"),
    init = Symbol("init"),
    pageReady = Symbol("pageReady"),
    appReady = Symbol("appReady"),
    needWeChatApi = Symbol("needWeChatApi"),
    weChatReady = Symbol("weChatReady"),
    weChatCertification = Symbol("weChatCertification"),
    loadScripts = Symbol("loadScripts"),
    autoSaveUrlParam = Symbol("autoSaveUrlParam"),
    appAutoGetUrl = Symbol("appAutoGetUrl");

let path = require('path');
window.path = path;


let page = {
    //是否调试模式
    [isDebug]:SETTING.isDebug || false,
    //是否是健康成都app内的h5页面
    [isApp]:SETTING.isAPP || false,
    //是否需要加载微信js
    [needWeChatApi]:SETTING.weChatUseApiList || [],
    //页面是否已经ready
    [hasAllReady]:false,

    //缓存的readyFn的调用
    [readyFns]:[],
    //页面初始执行入口
    isReady(fn){
        if(!this[hasAllReady]){
            this[readyFns].push(fn);
        }else{
            fn();
        }
    },


    //类的入口
    async [init](callback){
        await Promise.all([
            this[pageReady](),
            this[appReady](),
            this[weChatReady](),
            this[loadScripts](SETTING.needLoadOtherJsList)
        ]);

        //设置全部已经ready状态
        this[hasAllReady] = true;

        //需要初始执行的。。。。
        callback();

        //运行队列中的函数
        this[readyFns].map(fn=>{
            fn();
        });


        return true;
    },
    //页面准备ok
    [pageReady](){
        return new Promise(success=>{
            $(document).ready(function(){
                success();
            });
        })
    },
    //app准备ok
    [appReady](){
        var _this = this;
        return new Promise(success=>{
            if(_this[isApp]){
                document.addEventListener("deviceready", function() {

                    //app自动设置服务器地址
                    _this[appAutoGetUrl](function(){
                        success();
                    });


                }, false);
            }else{
                success();
            }
        })
    },
    //微信ready
    [weChatReady](){
        let _this = this;

        return new Promise(async (success,error)=>{
            if(_this[isApp]){
                success();
                return;
            }

            if(this[needWeChatApi].length == 0){
                success();
                return;
            }

            //加载微信js
            await _this.loadScript(SETTING.weChatJsUrl);
            //客户端权限认证
            await _this[weChatCertification](
                SETTING.weChatCertificationApi,
                SETTING.weChatUseApiList
            ).catch(e=>{
                if(_this[isDebug]){
                    _this.alert(e);
                    error(e);
                }else{
                    console.log(e);
                    success();
                }
            });


            wx.ready(function(){
                success();
            });
        })
    },
    //加载配置文件、字典等
    [loadScripts](src=[]){
        let _this = this;

        if(src.length != 0){
            return Promise.all(
                src.map(url=>{
                    return _this.loadScript(url);
                })
            )
        }else{
            return new Promise(success=>{
                success();
            });
        }
    },
    //微信权限认证
    [weChatCertification](apiUrl,apiList=[]){
        return new Promise((success,error)=>{
            $.ajax({
                type : 'POST',
                url : apiUrl,
                dataType : "json",
                data : {
                    url : window.location.href
                },
                success : function(data) {
                    if(data.stateCode == 'success'){
                        wx.config({
                            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                            appId: data.appId, // 必填，公众号的唯一标识
                            timestamp: data.timestamp, // 必填，生成签名的时间戳
                            nonceStr: data.nonceStr, // 必填，生成签名的随机串
                            signature: data.signature,// 必填，签名，见附录1
                            jsApiList: apiList
                        });
                        success();
                    }else{
                        error("接口错误");
                    }
                },
                error:function(e){
                    error(e);
                }
            });
        })
    },

    //自动缓存链接带入的参数，如果重名会被覆盖  app无法使用
    //主要方便微信的userToken存入，统一微信和app获取userToken的方法
    [autoSaveUrlParam](){
        let list = SETTING.saveUrlParamList || [],
            param = getUrlParam();

        list.map(item=>{
            if(param[item]){
                session.save(item,param[item]);
            }
        });
    },

    //自动配置服务器地址  app自动获取并覆盖setting.js中的服务器地址
    [appAutoGetUrl](callback){
        let _this = this;
        if(this[isApp]){
            YJH.H5ModuleManager.getValue(function(rs){
                rs = rs.result;
                rs = rs.substr(0,rs.length-1);
                rs = rs.substr(0,rs.lastIndexOf("\/")+1);
                SETTING.serverUrl = rs;
                SETTING.serverImgUrl = SETTING.serverUrl+'HealthWeb/';
                // SETTING.serverUrl = 'http://phr.care4u.cn/';
                // SETTING.serverImgUrl = SETTING.serverUrl+'HealthWeb/';
                callback();
            },function(){
                _this.error("无法获取服务器地址");
            },"AppNetWorkBaseUrl");
        }
    },

    //加载js接口
    loadScript(src){
        return new Promise(success=>{
            $.getScript(src,function(){
                success();
            })
        })
    },

    //alert
    alert(text,callback){
        callback = callback || function() {};

        if(this[isApp]){
            YJH.H5Dialogs.alert(text.toString(), callback, "提示");
        }else{
            alert(text);
            callback();
        }
    },

    //confirm
    confirm(msg, success,error) {
        msg = msg || "";
        success = success || function(){};
        error = error || function(){};
        if(this[isApp]){
            YJH.H5Dialogs.confirm(
                msg,
                function(aa) {
                    aa = aa.buttonIndex;
                    if(aa == 1) {
                        error();
                    } else {
                        success();
                    }
                },
                "提示",
                ["取消", "确定"]
            )
        }else{
            if(confirm(msg)){
                success();
            }else{
                error();
            }
        }
    },
    //相对地址转绝对地址
    getFullUrl(url){
        if(url.substr(0,2) == '\/\/' || url.substr(0,4)=='http'){
            return url;
        }


        if(url.substr(0,1) == '\/'){
            return window.location.origin + url;
        }else{
            let win_url = window.location.href;
            win_url = win_url.substr(0,win_url.lastIndexOf('\/')+1);
            let newUrl = path.join(win_url,url);

            //path转换时会将//2个斜杠当成本地路径转换成一个斜杠
            newUrl = newUrl.replace('http:\/','http:\/\/');
            newUrl = newUrl.replace('https:\/','https:\/\/');
            return newUrl;
        }
    },

    //打开新页面
    openUrl(url,type) {
        if(this[isApp]){
            if(type=="self"){
                window.location.href=url;
            }else{
                let newUrl = this.getFullUrl(url);
                YJH.H5ModuleManager.openWebInApp(newUrl);
            }
        }else{
            window.location.href=url;
        }
    },

    //关闭子应用回到主界面，微信需要注入接口
    closeApp(){
        if(this[isApp]){
            YJH.H5NativeAppInfo.goToRootPage();
        }else{
            if(window.wx && wx.closeWindow){
                wx.closeWindow();
            }
        }
    },

    //主动退后
    goBack() {
        if(this[isApp]){
            YJH.H5ModuleManager.closeH5App({url:window.location.href})
        }else{
            window.history.go(-1);
        }
    },

    //点击后退时关闭 app
    backClose(){
        let _this = this;
        window.addEventListener("popstate",function(e){
            if(e.state && e.state.close){
                console.log("close");
                _this.closeApp();
            }
        },false);
        history.replaceState({close:true},"",window.location.href);
        history.pushState("", "", window.location.href);
    },

    //退回到当前页面时 执行传入到函数
    backRefresh:(function(){
        var isHiddened = false,
            fn = [];

        if(SETTING.isAPP && device.isAndroid){
            //原生提供
            window.addEventListener('view_visibilitychange', function(e) {
                setTimeout(function(){
                    for(var i= 0,l=fn.length;i<l;i++){
                        fn[i]();
                    }
                },100)
            }, false);
        }else{
            document.addEventListener('visibilitychange', function(e) {
                if(document.hidden){
                    isHiddened = true;
                }else{
                    if(isHiddened){
                        setTimeout(function(){
                            for(var i= 0,l=fn.length;i<l;i++){
                                fn[i]();
                            }
                        },100);
                    }
                }
            }, false);
        }


        return function(callback){
            callback = callback || function(){};
            fn.push(callback);
        };
    })(),

    //后退刷新页面  //待测试
    //  必须页面打开就执行不能放到ready里面
    historyBackRefresh:function(){
        window.onpageshow=function(e){
            console.log(e.persisted)
            //从缓存加载页面 e.persisted=true
            if(e.persisted){
                window.location.reload();
            }
        }
    },

    //获取用户token
    //如果非app需要使用，要在setting中设置
    //tokenKeyFromUrl中需要设置获取时的key
    //同时saveUrlParamList数组中也需要添加该值
    getUserToken(){
        return new Promise((success,error)=>{
            if(this[isApp]){
                YJH.AppUserInfoManager.fetchUserInfo(
                    function(rs){
                        rs = rs.result || {};
                        success(rs.token);
                    }
                )
            }else{
                let token = session.get(SETTING.tokenKeyFromUrl);

                if(token){
                    success(token);
                }else{
                    error("还未登陆");
                }
            }
        });
    },

    //关闭下拉刷新
    closePullRefresh(){
        if(this[isApp]){
            YJH.H5NativeUIManager.closeDownLoad();
        }
    },

    //设置标题
    setTitle(text){
        if(this[isApp]){
            YJH.H5NativeAppInfo.setNavBarTitle(text);
        }else{
            document.title = text;
            if (/ip(hone|od|ad)/i.test(navigator.userAgent)) {
                var i = document.createElement('iframe');
                i.src = '/favicon.ico';
                i.style.display = 'none';
                i.onload = function() {
                    setTimeout(function(){
                        i.remove();
                    }, 9)
                };
                document.body.appendChild(i);
            }
        }
    },

    //微信设置分享 要设置setting的wx的api列表
    //showAllNonBaseMenuItem
    //onMenuShareTimeline
    //onMenuShareAppMessage
    wxSetShare(opt){
        let {title="",link,imgUrl="",desc="",type="link",dataUrl=""} = opt;

        wx.showAllNonBaseMenuItem();

        wx.onMenuShareTimeline({
            title: title, // 分享标题
            link: link, // 分享链接
            imgUrl: imgUrl, // 分享图标
            success: function () {

            },
            cancel: function () {

            }
        });

        wx.onMenuShareAppMessage({
            title: title, // 分享标题
            desc: desc, // 分享描述
            link: link, // 分享链接
            imgUrl: imgUrl, // 分享图标
            type: type, // 分享类型,music、video或link，不填默认为link
            dataUrl: dataUrl, // 如果type是music或video，则要提供数据链接，默认为空
            success: function () {
                //alert('确认分享');
            },
            cancel: function () {
                //alert('取消分享');
            }
        });
    },

    //微信不分享 要设置setting的wx的api列表
    //hideMenuItems
    wxNotShowShare(){
        wx.hideMenuItems({
            // 发送给朋友: "menuItem:share:appMessage"
            // 分享到朋友圈: "menuItem:share:timeline"
            // 分享到QQ: "menuItem:share:qq"
            // 分享到Weibo: "menuItem:share:weiboApp"
            // 收藏: "menuItem:favorite"
            // 分享到FB: "menuItem:share:facebook"
            // 分享到 QQ 空间/menuItem:share:QZone
            menuList: [
                "menuItem:share:appMessage",
                "menuItem:share:timeline",
                "menuItem:share:qq",
                "menuItem:share:weiboApp",
                "menuItem:share:facebook",
                "menuItem:share:QZone"
            ] // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
        });
    },

    //获取模版 模版位置需要在setting中设置
    getTemplate(templateName){
        return new Promise((success,error)=>{
            $.ajax({
                type: "get",
                cache: false,
                url: SETTING.pugTemplatePath+templateName+".js",
                //contentType:"application/json",
                dataType: "script",
                timeout: 60000,
                success: function() {
                    success();
                },
                error: function() {
                    error();
                }
            });

        })
    },

    //照相或从相册获取图片base64
    //微信权限
    //chooseImage
    //getLocalImgData
    //uploadImage
    getImageSrc(){
        return new Promise((success,error)=>{
            if(this[isApp]){
                YJH.Cameramethod.getThePicture(
                    function(aa){
                        let state = aa.status;
                        if(state == 0){
                            let base64 = aa.result.result;
                            success({
                                src:base64,
                                id:base64
                            })
                        }else{
                            error("获取失败");
                        }
                    }
                )
            }else{
                if(!wx){
                    error("不支持浏览器直接调用");
                    return;
                }
                wx.chooseImage({
                    count: 1, // 默认9
                    sizeType: ['compressed'], // original原图   compressed压缩
                    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                    success: function (res) {
                        let localIds = res.localIds,
                            src= localIds[0];

                        if(wx.getLocalImgData && (device.isIphone || device.isIpad)){
                            wx.getLocalImgData({
                                localId: src, // 图片的localID
                                success: function (res) {
                                    var localData = res.localData; // localData是图片的base64数据，可以用img标签显示
                                    success({
                                        src:localData,
                                        id:localData
                                    })
                                }
                            });
                        }else{
                            wx.uploadImage({
                                localId: src, // 需要上传的图片的本地ID，由chooseImage接口获得
                                isShowProgressTips: 1, // 默认为1，显示进度提示
                                success: function (res) {
                                    let serverId = res.serverId; // 返回图片的服务器端ID
                                    success({
                                        src:src,
                                        id:serverId
                                    })
                                }
                            });
                        }
                    }
                });
            }
        })
    },

    //身份证照相及读取信息
    //type=1 正面
    //type=2 反面
    //微信权限 微信不能识别，只能调用相机
    //chooseImage
    //getLocalImgData
    //uploadImage
    getIdCardInfo(type){
        return new Promise((success,error)=>{
            if(this[isApp]){
                YJH.Cameramethod.idCardRecognition(
                    type,
                    function(rs){
                        success({
                            src:rs.idCardImage,
                            id:rs.idCardImage,
                            info:rs.idCardInfo
                        });
                    },
                    function(){
                        error("图片异常");
                    }
                );
            }else{
                if(!wx){
                    error("不支持浏览器直接调用");
                    return;
                }
                wx.chooseImage({
                    count: 1, // 默认9
                    sizeType: ['compressed'], // original原图   compressed压缩
                    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                    success: function (res) {
                        let localIds = res.localIds,
                            src= localIds[0];

                        if(wx.getLocalImgData && (device.isIphone || device.isIpad)){
                            wx.getLocalImgData({
                                localId: src, // 图片的localID
                                success: function (res) {
                                    var localData = res.localData; // localData是图片的base64数据，可以用img标签显示
                                    success({
                                        src:localData,
                                        id:localData,
                                        info:null
                                    })
                                }
                            });
                        }else{
                            wx.uploadImage({
                                localId: src, // 需要上传的图片的本地ID，由chooseImage接口获得
                                isShowProgressTips: 1, // 默认为1，显示进度提示
                                success: function (res) {
                                    let serverId = res.serverId; // 返回图片的服务器端ID
                                    success({
                                        src:src,
                                        id:serverId,
                                        info:null
                                    })
                                }
                            });
                        }
                    }
                });
            }
        })
    },

    //报错提示并返回
    error(text){
        var _this = this;
        console.log(text);

        // if(this[isDebug]){
        text = text || "网络连接出现了一点问题，请重新尝试";
        // }else{
        // 	text = "系统错误，请稍后在试";
        // }

        this.alert(text,function(){
            if(!_this[isDebug]){
                _this.goBack();
            }
        });
    },

    //生成条形码 app才能调用
    createBarCode(code){
        let _this = this;
        return new Promise(function(success,error){
            if(_this[isApp]){
                YJH.H5QRCodeManager.generateQRCode(rs=>{
                    success(rs)
                },function(){
                    error()
                },{
                    content:code,
                    type:1
                })
            }else{
                error();
            }

        })
    },

    //生成二维码 app才能调用
    create2Code(code){
        let _this = this;
        return new Promise(function(success,error){
            if(_this[isApp]){
                YJH.H5QRCodeManager.generateQRCode(rs=>{
                    success(rs)
                },function(){
                    error()
                },{
                    content:code,
                    type:0
                })
            }else{
                error();
            }

        })
    },

    //打开第三方应用  app才能调用
    //不传id  是打开主应用的某个页面
    //不传page  是打开index.html页面
    //必传一个参数
    openOtherApp(id,page){
        page = page || "";
        id = id || "";
        if(this[isApp]){
            if(id){
                YJH.H5ModuleManager.openApp(
                    rs=>console.log(rs),
                    rs=>console.log(rs),
                    {h5Id:id,page:page,notUseCfg:true}
                )
            }else{
                YJH.H5ModuleManager.openApp(
                    rs=>console.log(rs),
                    rs=>console.log(rs),
                    {page:page,notUseCfg:true}
                )
            }
        }
    },

    //设置app 顶部右上角按钮 (只能是文字)    app才能调用
    setRightBtn(opt){
        if(!this[isApp]){return;}

        let name = opt.name || "",
            color = opt.color || "#000000",
            callback = opt.callback || function(){};

        YJH.H5NativeAppInfo.setNavBarRightBtn(callback,{
            btnTitle:name,
            btnTitleColor:color,
            enable:true,
            url:window.location.pathname
        });
    },

    //后退提示表单有变动
    //表单是否变化需要自己判断
    inputChangeBackAlert(){
        let _this = this;
        window.addEventListener("popstate",function(e){
            if(e.state && e.state.input_change){
                _this.confirm("确定放弃保存？",function(){
                    _this.goBack();
                },function(){
                    _this.inputChangeBackAlert();
                });
            }
        },false);
        history.replaceState({input_change:true},"",window.location.href);
        history.pushState("", "", window.location.href);
    },

    //页面缓存 数据
    pageCatch : {
        async get(key){
            return new Promise((success,error)=>{
                if(SETTING.isAPP){
                    YJH.H5ModuleManager.getValue(
                        function(aa){
                            aa = aa.result || "";
                            //统一android和ios统一返回字符串
                            if(typeof aa != "string"){
                                aa = JSON.stringify(aa);
                            }
                            success(aa);
                        },function(bb){
                            success("");
                        },
                        key
                    );
                }else{
                    let val = localStorage.getItem(key) || "";
                    success(val);
                }
            })
        },
        async save(key,val){
            return new Promise((success,error)=>{
                if(SETTING.isAPP){
                    YJH.H5ModuleManager.setValueForKey(
                        function(){
                            success();
                        },function(bb){
                            error("app内部错误");
                        },
                        key,
                        val
                    )
                }else{
                    localStorage.setItem(key,val);
                    success();
                }
            });
        },
        async del(key){
            return new Promise((success,error)=>{
                if(SETTING.isAPP){
                    YJH.H5ModuleManager.setValueForKey(
                        function(){
                            success();
                        },function(bb){
                            error("app内部错误");
                        },
                        key,
                        ""
                    )
                }else{
                    localStorage.removeItem(key);
                    success();
                }
            })
        }
    },

    //删除html标签
    delHtmlTag(str){
        return str.replace(/<[^>]+>/g,"");    //去掉所有的html标记
    },

    //获取本地缓存数据
    appLocalData:{
        get(key){
            return new Promise((success,error)=>{
                if(page[isApp]){
                    YJH.AppUserInfoManager.getSpecifiedUserInfo(function(rs){
                        rs = rs.result || '{}';
                        rs = JSON.parse(rs);
                        success(rs[key]);
                    },function(rs){
                        rs = rs.des || '网络连接出现了一点问题，请重新尝试';
                        error(rs)
                    })
                }else{
                    let data = localData.getItem(key);
                    success(data);
                }

            })
        },
        set(key,val){
            return new Promise((success,error)=>{
                if(page[isApp]){
                    YJH.AppUserInfoManager.getSpecifiedUserInfo(function(rs){
                        rs = rs.result || '{}';
                        rs = JSON.parse(rs);
                        rs[key] = val;
                        rs = JSON.stringify(rs);
                        YJH.AppUserInfoManager.setSpecifiedUserInfo(rs,function(){
                            success();
                        },function(rs){
                            rs = rs.des || '网络连接出现了一点问题，请重新尝试';
                            error(rs)
                        })
                    },function(rs){
                        rs = rs.des || '网络连接出现了一点问题，请重新尝试';
                        error(rs)
                    })
                }else{
                    localData.setItem(key,val);
                    success();
                }

            })
        }
    },
    mdfSoftKeyBoardBug(){
        $('input').each(function(){
            this.addEventListener('touchstart',function(e){
                e.stopPropagation();
            },false)
        });
        document.body.addEventListener('touchstart',function(){
            $('input').blur();
        },false)
    }

};


page[init](function(){
    //初始执行，优先于page.isReady中传入的函数

    //自动缓存参数，非app用
    page[autoSaveUrlParam]();
    page.mdfSoftKeyBoardBug();

}).then(()=>{
    if(page[isDebug]){
        console.log("初始化完成");
    }
}).catch(e=>{
    if(page[isDebug]){
        console.log(e);
        page.alert("网络连接出现了一点问题，请重新尝试");
    }else{
        page.alert("网络连接出现了一点问题，请重新尝试;",function(){
            page.goBack();
        });
    }
});
module.exports = page;



