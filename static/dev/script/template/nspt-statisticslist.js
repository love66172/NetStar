/*
	* @Author: netstar.sjj
	* @Date: 2019-09-29 11:45:00
*/
/******************** 表格模板 start ***********************/
NetstarTemplate.templates.statisticsList = (function(){
	/***************组件事件调用 start**************************** */
	function dialogBeforeHandler(data,templateId){
		data = typeof(data)=='object' ? data : {};
		var config = NetstarTemplate.templates.statisticsList.data[templateId].config;
		var controllerObj = typeof(data.controllerObj)=='object' ? data.controllerObj : {};
		data.config = config;
		return data;
	}
	//ajax前置回调
	function ajaxBeforeHandler(handlerObj,templateId){
		//是否有选中值有则处理，无则返回
		var config = NetstarTemplate.templates.statisticsList.data[templateId].config;
		handlerObj.config = config;
		return handlerObj;
	}
	//ajax后置回调
	function ajaxAfterHandler(res,templateId){
		var config = NetstarTemplate.templates.statisticsList.data[templateId].config;	
	}
	//跳转打开界面回调
	function loadPageHandler(){}
	//关闭打开界面回调
	function closePageHandler(){}
	/***************组件事件调用 end************************** */
	//组件初始化
	function initComponent(_config){
		for(var componentType in _config.componentsConfig){
			var componentData = _config.componentsConfig[componentType];
			switch(componentType){
			   case 'vo':
				  NetstarTemplate.commonFunc.vo.initVo(componentData,_config);
				  break;
			   case 'list':
					NetstarTemplate.commonFunc.list.initList(componentData,_config);
				  break;
			   case 'blockList':
				  	NetstarTemplate.commonFunc.blockList.initBlockList(componentData,_config);
				  break;
			   case 'btns':
				  	NetstarTemplate.commonFunc.btns.initBtns(componentData,_config);
				  break;
			}
		}
	}
	//初始化容器通过弹出框的形式
	function initComponentHtmlByDialog(html,_config){
		var dialogJson = {
			id:'dialog-'+_config.id,
			title: _config.title,
			templateName:'PC',
			width:1100,
			height:'auto',
			shownHandler:function(data){
				var $body = $('#'+data.config.bodyId);
				$body.html(html);
				initComponent(_config);//调用组件初始化

				//给底部绑定按钮
				var btnJson = {
					id:data.config.footerId,
					pageId:_config.id,
					package:_config.package,
					btns:[
						{
							text:'关闭',
							handler:function(){
								$('#'+data.config.dialogContainerId).remove();
							}
						}
					]
				 };
				 vueButtonComponent.init(btnJson);
			}
		};
		NetstarComponent.dialogComponent.init(dialogJson);
	}
	//初始化容器面板
	function initContainer(_config){
		var $container = $('container');
		if($container.length > 0){
			$container = $('container:last');
		}
		var templateClassStr = '';
		if(_config.plusClass){
			templateClassStr = _config.plusClass;
		}
		var titleHtml = '';
		var componentsHtml = '';
		if(_config.title && _config.mode !='dialog'){
			//定义了标题输出
			titleHtml = '<div class="pt-main-row">'
								+'<div class="pt-main-col">'
									+'<div class="pt-panel pt-panel-header">'
										+'<div class="pt-container">'
											+'<div class="pt-panel-row">'
												+'<div class="pt-panel-col">'
													+'<div class="pt-title pt-page-title"><h4>'+_config.title+'</h4></div>'
												+'</div>'
											+'</div>'
										+'</div>'
									+'</div>'
								+'</div>'
							+'</div>';
		}
		for(var componentI=0; componentI<_config.components.length; componentI++){
			var componentData = _config.components[componentI];
			//list的高度按5行计算
			if(typeof(componentData.params)!='object'){
				componentData.params = {};
			}
			componentData.isAjax = true;//调用ajax
			componentData.params.height = 28*5;
			_config.componentsConfig[componentData.type][componentData.id] = componentData;//根据类型和id存储组件信息
			var classStr = 'component-'+componentData.type;
			componentsHtml += '<div class="pt-panel">'
								+'<div class="pt-container">'
									+'<div class="'+classStr+'" id="'+componentData.id+'"></div>'
								+'</div>'
							+'</div>'
		}
		var html = '<div class="pt-main statisticsList '+templateClassStr+' '+_config.mode+'" id="'+_config.id+'">'
						+titleHtml
						+'<div class="pt-container">'
							+'<div class="pt-main-row">'
								+'<div class="pt-main-col">'
									+componentsHtml
								+'</div>'
							+'</div>'
						+'</div>'
					+'</div>';
		if(config.$container){
			config.$container.html(html);
			initComponent(_config);
		}else{
			switch(_config.mode){
				case 'dialog':
					initComponentHtmlByDialog(html,_config);
					break;
				default:
					$container.html(html);
					initComponent(_config);
					break;
			}
		}
	}
	//设置默认值
	function setDefault(_config){
		var defaultConfig = {
			levelConfig:{},//等级数据存放
			mode:'dialog',  //dialog
			commonPanelHeight:$(window).outerHeight()-(NetstarTopValues.topNav.height),
		};
		NetStarUtils.setDefaultValues(_config,defaultConfig);
	}
	function init(_config){
		//如果开启了debugerMode
		var isValid = true;
		if(debugerMode){
		   //验证配置参数是否合法
		   isValid = NetstarTemplate.commonFunc.validateByConfig(_config);
		}
		if(!isValid){
		   nsalert('配置文件验证失败', 'error');
		   console.error('配置文件验证失败');
		   console.error(_config);
		   return false;
		}
		NetstarTemplate.commonFunc.setTemplateParamsByConfig(_config);//存储模板配置参数
		NetstarTemplate.commonFunc.setDefault(_config);//设置默认值参数
		setDefault(_config);
		initContainer(_config);
	}
	function refreshByConfig(_config){
		initComponent(_config);
	}
	return{
		init:											init,								
		VERSION:										'0.0.1',						//版本号
		dialogBeforeHandler:							dialogBeforeHandler,			//弹框调用前置方法
		ajaxBeforeHandler:								ajaxBeforeHandler,				//弹框ajax保存前置方法
		ajaxAfterHandler:								ajaxAfterHandler,				//弹框ajax保存后置方法
		loadPageHandler:								loadPageHandler,				//弹框初始化加载方法
		closePageHandler:								closePageHandler,				//弹框关闭方法
		refreshByConfig:								refreshByConfig,
		gridSelectedHandler:							function(){}
	}
})(jQuery)
/******************** 表格模板 end ***********************/