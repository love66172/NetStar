/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-12 16:38:47
 * @LastEditTime: 2019-08-29 17:13:37
 * @LastEditors: Please set LastEditors
 */
var NetstarLogin = (function () {

    var config = {};
    var loginRes = {};
    //初始化
    function init(_config){
        /**
         * containerEl:string   整体登录容器 例如'#loginPanel',
         * usernameEl: string   用户名 例如 "#username"
         * passwordEl: string   密码 例如 "#password"
         * msgEl:string         提示信息容器 例如 "#pwmsg"
         * loginAjax:{
         *      url:'',
         *      ...
         * }
         * getLoginProperty:{        该请求必须用token当header
         *      url:'',
         * }
         * styleEl:'#loginStyle' //登录专用的CSS 
         */
        config = getDefault(_config);
        //如果登录信息没有过期，直接跳转，不需要登录
        var authCode = NetStarUtils.OAuthCode.get();
        if(authCode != false){
            //登录信息没有过期 不需要登录
            toHomePage();
        }
        //初始化欢迎界面
        loginPanel.init();
    }

    
    
    //默认值
    function getDefault(_config){
        var returnConfig = $.extend(true, {}, _config);
        //默认的静态资源路径
        var staticRootPath = ''
        switch(_config.userMode){
            case 'user':
                //用户模式
                staticPath = _config.rootPath + 'dist/';
                break;
            case 'dev':
                //开发模式
                staticPath = _config.rootPath + 'assets/';
                break;
        }
        _config.staticRootPath = staticRootPath;
        return returnConfig;
    }
    /**
     * 调用首页加载，需要使用getLoginProperty 方法所返回的结果
     */
    function toHomePage(res){

        //跳转页面 没有参数加 ? 有则加 &
        var mainPageUrl = config.mainPage.url;
        var urlParamsStr = 'form=login&source=' + encodeURI( window.location.href );
        if(mainPageUrl.indexOf('?') == -1){
            mainPageUrl = mainPageUrl + '?' + urlParamsStr;
        }else{
            mainPageUrl = mainPageUrl + '&' + urlParamsStr;
        }
        window.location.href = mainPageUrl;
    }


    //登录面板
    var loginPanel = {
        config:{},
        loginInfo:{
            //保存登录页config到本地存储，以方便之后调用
            save:function(_config){
                var storeConfigStr = JSON.stringify(config);
                store.set('NetstarLoginConfig', storeConfigStr);
            },
            //清除登录页config的本地存储
            clear:function(){
                store.remove('NetstarLoginConfig');
            }
        },
        //初始化面板
        init:function(){
            this.loginInfo.save();
            this.initImages();
            this.setUserNameByCookie();
            $(document).on('keyup',this.enterEvent);
            $(config.submitBtnEl).on('click', this.submit);
        },
        //发送loginSubmit
        submit:function () {
            var _this = this;
            var username = $(config.usernameEl).val();
            var password = $(config.passwordEl).val();
            if(username == '' || typeof(username)!='string'){
                $(config.msgEl).html("用户名必填！");
                $(config.msgEl).removeClass('hide');
                return;
            }
            if(password == '' || typeof(password)!='string'){
                $(config.msgEl).html("密码必填！");
                $(config.msgEl).removeClass('hide');
                return;
            }

            var passwordMD5 = hex_md5(password);
            var ajaxData = {
                login: 1,
                username: username,
                password: passwordMD5
            };

            var urlParams = NetStarUtils.getUrlPara();
            if(typeof(urlParams)=='object'){
                $.each(urlParams, function(key,value){
                    switch(key){
                        case 'callback':
                            //callback是一个json文本 需要decode 例如 %257B%2522customerId%2522:1310336379963573234%257D  => {"customerId":1310336379963573234}
                            //曹雷登录需求  cy 20190826
                            ajaxData[key] = decodeURIComponent(value);
                            break;
                        default:
                            break;
                    }
                });
            }
            
            $.ajax({
                type: "POST",
                dataType: 'json',
                url: config.loginAjax.url,  
                data: ajaxData,
                success: function (res) {
                     /**
                     * res:{
                     *  success:true,
                     *  data:'eyJ0eXA...'   //返回的data就是token
                     * }
                     */
                    if (res.success) {
                        //登录成功后请求用户消息并登录系统  
                        if(typeof(res.data)!='string'){
                            console.error('登录接口未返回授权码');
                            return;
                        }

                        var cookieJson = {
                            isSave: true,
                            username: "username",
                            remember: "remember"
                        }
                        loginPanel.checkCookie(cookieJson);
                        var params = window.location.search.slice(1).split('&');
                        var result = {};
                        for (var i = 0; i < params.length; i++) {
                            var idx = params[i].indexOf('=');
                            if (idx > 0) {
                                result[params[i].substring(0, idx)] = params[i].substring(idx + 1);
                            }
                        }
                        //window.top.location.href = "home" + window.location.search;
                        
                        loginRes = res;
                        NetstarLogin.loginRes = res;
                        NetstarLogin.Authorization = NetstarLogin.loginRes.data;

                        //保存授权码
                        NetStarUtils.OAuthCode.set({
                            authorization:      NetstarLogin.Authorization, 
                            expireMinute:       config.expireMinute,
                            loginTimeStamp:     new Date().getTime(),
                        });
                        
                        NetstarLogin.toHomePage();
                        //loginPanel.getLoginProperty(res); //获取登录信息
                        //$(config.msgEl).addClass('hide');

                    } else {
                        //不成功提示错误 如密码错误等
                        $(config.msgEl).html(res.pwmsg);
                        $(config.msgEl).removeClass('hide');
                    }
                },
                error: ajaxError
            });
        },
        //绑定回车事件
        enterEvent: function(event) {
            if (event.keyCode == 13) {
                loginPanel.submit();
            }
        },
        //初始化图片
        initImages:function(){
            //添加背景图 <div id="loginPanel" class="page-login common-top-right" style="background-image:url(http://nscloud.applinzi.com/images/erp/bg.png)">
            //添加LOGO  <img src="http://nscloud.applinzi.com/images/erp/logo.png" alt="LOGO">
            var bgImage = config.images.bg;
            var logoImage = config.images.logo;
            $(config.containerEl).attr('style', "background-image:url("+bgImage+")");
            $(config.containerEl + ' .logo img').attr('src', logoImage);
        },
        //从cookie中读取用户名
        setUserNameByCookie: function(){
            var cookies = document.cookie;
            var cookiePos = cookies.indexOf("name");
            if (cookiePos != -1) {
                cookiePos += 5;
                var cookieEnd = cookies.indexOf(";", cookiePos);
                if (cookieEnd == -1) {
                    cookieEnd = cookies.length;
                }
                var value = unescape(cookies.substring(cookiePos, cookieEnd));
            }
            $(config.usernameEl).val(value);
            $(config.passwordEl).val('');
        },
        //清除面板
        clear:function(){
            /**
             * 清除登录页面 清除页面上的style  body中的html等
             * 包括  config.styleEl config.containerEl
             */
            var $loginContainer= $(config.containerEl);
            var $loginStyle = $(config.styleEl);
            $loginContainer.remove();
            $loginStyle.remove();
        },
        checkCookie: function(typeJsonData){
            //isSetDefault是否是设置默认读取 true
            //isSave是否保存cookie false
            //isSavePassword是否保存密码 false
            //isDirectLogin是否直接登录 false
            //password,username,remember读取的id----用户名，密码，选择
            var isSetDefault = typeof(typeJsonData.isSetDefault) == 'boolean' ? typeJsonData.isSetDefault : true;
            var isSave = typeof(typeJsonData.isSave) == 'boolean' ? typeJsonData.isSave : false;
            var isSavePassword = typeof(typeJsonData.isSavePassword) == 'boolean' ? typeJsonData.isSavePassword : false;
            var isDirectLogin = typeof(typeJsonData.isDirectLogin) == 'boolean' ? typeJsonData.isDirectLogin : false;
            if(isSave){
                isSetDefault = false;
            }
            if(isSave || isSetDefault){
                if(typeof(typeJsonData.username) != "string" || $("#"+typeJsonData.username).length != 1){
                    // alert("没有找到--用户名id");
                }
                if(typeof(typeJsonData.remember) != "string" || $("#"+typeJsonData.remember).length != 1){
                    // alert("没有找到默认--记住id");
                }
                if(isSavePassword){
                    if(typeof(typeJsonData.password) != "string" || $("#"+typeJsonData.password).length != 1){
                        // alert("没有找到--密码id");
                    }
                }
            }
            // if(isDirectLogin){
        
            // }
            if(isSetDefault){
                var username=$.cookie("username");
                if (username){
                    if(typeof(typeJsonData.remember) == "string"){
                        $("#"+typeJsonData.remember).attr("checked","checked");
                    }
                    // $("#"+typeJsonData.remember).attr("checked","checked");
                    $("#"+typeJsonData.username).val(username);
                    if(isSavePassword){
                        var password=$.cookie("password");
                        if(password){
                            $("#"+typeJsonData.password).val(password);
                            if(isDirectLogin){
                                login_submit();
                            }
                        }
                    }
                }
            }else{
                if($("#"+typeJsonData.remember).is(':checked')){
                // if(isSave){
                    var user = $("#"+typeJsonData.username).val();
                    if (user!="" && user!=null){
                        $.cookie("username",user, { expires: 7 });
                    }
                    if(isSavePassword){
                        var pass = $("#"+typeJsonData.password).val();
                        if (pass!="" && pass!=null){
                            $.cookie("password",pass, { expires: 7 });
                        }
                    }
                }else{
                    $.cookie("username", "");
                    $.cookie("password", "");
                }
        
            }
        }
    }
    var mainPage = {
        BODYCLASS:'body-page-body skin-autoservice frame-standard',
        init:function(html){
            //更换body class 并插入内容
            $('body').attr('class',this.BODYCLASS);
            $('body').html(html);
        }
    }
    /**
     * 获取静态资源
     */
    var staticManager = {
        staticSource:{}, //
        //获取静态资源加载列表
        staticSourceAjax:function(callbackFunc){
            var _this = this;
            $.ajax({
                type: "GET",
                dataType: 'json',
                url: config.staticSourceAjax.url,
                success:function(res){
                    _this.staticSource = res;
                    //加载最基础的静态资源列表
                    if(typeof(callbackFunc)=='function'){
                        callbackFunc(res);
                    }
                },
                error:ajaxError
            })
        },
        /****** 根据环境获取文件
         * Preload              预加载文件 
         * Disabled             已经停用
         * PC_base_1            基础版 
         * PC_template_1        PC模板第一版 
         * MOBILE_template_1    手机模板第一版 
         * PC_editor_1          编辑器第一版 
         * PC_template_2        PC模板第二版
         */
        getStaticSourceByEnv:function(envType){
            var _this = this;
            var staticSource = {
                style:[],
                script:[]
            }
            var ENVType = envType.toUpperCase();  //转成大写后比较
            var sourceArray = _this.staticSource.source
            for(var i=0; i<sourceArray.length; i++){
                var staticObj = sourceArray[i];
                if(staticObj.evnVersion == ENVType){
                    switch(staticObj.type){
                        case "style":
                            staticSource.style.push(staticObj);
                            break;
                        case "script":
                            staticSource.script.push(staticObj);
                            break;
                    }
                    
                }
            }
            return staticSource;
        },
        //转换为插入标签 批量
        getTagsByStaticSource:function(staticSource){
            var _this = this;
            var tagsHtml = '';
            for(var si=0; si<staticSource.script.length; si++){
                var tagHtml  = _this.getScriptTagHtmlByObj(staticSource.script[si]);
                tagsHtml += tagHtml;
            }
            for(var ci=0; ci<staticSource.style.length; ci++){
                var tagHtml  = _this.getStyleTagHtmlByObj(staticSource.style[ci]);
                tagsHtml += tagHtml;
            }
            return tagsHtml;
        },
        //转换为插入SCRIPT标签 单独一条
        getScriptTagHtmlByObj:function(tagObj){
            var src = config.rootPath + config.sourcePath + tagObj.fileName;
            var tagHtml = '<script  type="text/javascript" src="'+src+'?v='+tagObj.version+'"></script>';

            return tagHtml;
        },
        //转换为插入LINK CSS标签 单独一条
        getStyleTagHtmlByObj:function(tagObj){
            var src = config.rootPath + config.sourcePath + tagObj.fileName;
            var tagHtml = '<link rel="stylesheet" href="'+src+'?v='+tagObj.version+'"/>';
            return tagHtml;
        },
        
    }

    //AJAX 错误回调方法 和回调信息
    function ajaxError(error){
        //ajax错误，根据默认错误信息提示错误
        console.error(error);
        var errorInfo = '';
        //优先使用服务器端返回的错误信息
        if(error.responseJSON){
            if(typeof(error.responseJSON.msg) == 'string'){
                errorInfo = error.responseJSON.msg;
            }
        }

        //未返回服务器定义的错误信息，则使用错误代码
        if(errorInfo == ''){
            if (typeof (NSAJAXERRORINFO[error.status]) == "string") {
                errorInfo = NSAJAXERRORINFO[error.status];
            } else {
                errorInfo = '请求错误，错误代码：' + error.status + "。";
            }
        }
        

        $(config.msgEl).html(errorInfo);
        $(config.msgEl).removeClass('hide');
    }

    
	return {
        init:init,
        loginPanel:loginPanel,
        staticManager:staticManager,
        ajaxError:ajaxError,
        toHomePage:toHomePage,
	}
})(jQuery);

