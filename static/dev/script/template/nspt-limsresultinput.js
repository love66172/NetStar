/*
	*3级数据联动 块状表格（主表） 详情表（块状表格+list表格
	* @Author: netstar.sjj
	* @Date: 2019-06-19 10:45:00
	* 数据关系 {id:'333',saleList:[{saleId:'33',price:33,customerList:[{customerId:'333'}]}]} 
*/
/******************** 表格模板 start ***********************/
NetstarTemplate.templates.limsResultInput = (function(){
	/***************组件事件调用 start**************************** */
	function dialogBeforeHandler(data,templateId){
		data = typeof(data)=='object' ? data : {};
		var config = NetstarTemplate.templates.limsResultInput.data[templateId].config;
		var controllerObj = typeof(data.controllerObj)=='object' ? data.controllerObj : {};
		var operatorObject = 'detail';//默认操作的是主表
		if(data.event){
			if($(data.event.currentTarget).length > 0){
				var operatormain = $(data.event.currentTarget).attr('isoperatormain');
				if(operatormain == 'true'){
					operatorObject = 'main';
				}
			}
		}
		data.value = {};
		var idField = config.mainComponent.idField;
		var keyField = config.mainComponent.keyField;
		if(typeof(config.levelConfig[2])=='undefined'){
			operatorObject = 'main';
		}
		switch(operatorObject){
			case 'detail':
				idField = config.levelConfig[2].idField;
				keyField = config.levelConfig[2].keyField;
				data.value = getDetailsSelectedData(config);
				break;
			case 'main':
				data.value = getMainListSelectedData(config);
				break;
		}
		data.value.parentSourceParam = {
			package:config.package,
			id:idField,
			templateId:config.id,
		};
		data.btnOptionsConfig = {
			options:{
				idField:idField
			},
			descritute:{
				keyField:keyField,
				idField:idField
			}
		};
		data.config = config;
		return data;
	}
	//ajax前置回调
	function ajaxBeforeHandler(handlerObj,templateId){
		//是否有选中值有则处理，无则返回
		var config = NetstarTemplate.templates.limsResultInput.data[templateId].config;
		handlerObj.config = config;
		var gridConfig = config.mainComponent;
		if(config.levelConfig[2]){
			gridConfig = config.levelConfig[2];
		}
		if($.isEmptyObject(handlerObj.value)){
			handlerObj.value = getDetailsSelectedData(config);
		}
		handlerObj.ajaxConfigOptions = {
			idField:gridConfig.idField,
			keyField:gridConfig.keyField,
			pageParam:config.pageParam,
		};
		handlerObj.config = config;
		return handlerObj;
	}
	function refreshData(data){
		/**data object 接受参
				* idField 主键id
				*package 包名
				*templateId string*/
		var config = NetstarTemplate.templates.limsResultInput.data[data.templateId].config;
		var data = getMainListSelectedData(config);
		refreshListAjaxByData(config.levelConfig[2].ajax,data,config.levelConfig[2]);
	}
	//ajax后置回调
	function ajaxAfterHandler(res,templateId){
		var config = NetstarTemplate.templates.limsResultInput.data[templateId].config;
		var gridConfig = config.mainComponent;
		var gridId = gridConfig.id;
		NetStarGrid.refreshById(gridId);
		
		/*var level2Config = config.levelConfig[2];
		switch(res.objectState){
			case NSSAVEDATAFLAG.DELETE:
				//删除
				NetStarGrid.delRow(res,level2Config.id);
				break;
			case NSSAVEDATAFLAG.EDIT:
				//修改
				NetStarGrid.editRow(res,level2Config.id);
				break;
			case NSSAVEDATAFLAG.ADD:
				//添加
				NetStarGrid.addRow(res,level2Config.id);
				break;
			case NSSAVEDATAFLAG.VIEW:
				//刷新
				var data = getMainListSelectedData(config);
				refreshListAjaxByData(level2Config.ajax,data,level2Config);
				break;
		}*/
	}
	//跳转打开界面回调
	function loadPageHandler(){}
	//关闭打开界面回调
	function closePageHandler(){}
	//获取主表选中行数据
	function getMainListSelectedData(_config){
		var mainListId = _config.mainComponent.id;
		var data = [];
		switch(_config.mainComponent.type){
			case 'blockList':
				data = NetstarBlockList.getSelectedData(mainListId);
				break;
			case 'list':
				data = NetStarGrid.getSelectedData(mainListId);
				break;
		}
		return data[0] ? data[0] : {};
	}
	//获取子表数据选中行数据
	function getDetailsSelectedData(_config){
		var level2ListId = _config.levelConfig[2].id;
		var levelListSelectedData = [];
		var returnSelectedData = {};
		switch(_config.levelConfig[2].type){
			case 'blockList':
				levelListSelectedData = NetstarBlockList.getSelectedData(level2ListId);
				break;
			case 'list':
				levelListSelectedData = NetStarGrid.getSelectedData(level2ListId);
				break;
		}
		if($.isArray(levelListSelectedData)){
			if(levelListSelectedData.length > 0){
				returnSelectedData = levelListSelectedData[0];
				var level3ListSelectedData = [];
				var level3ListId = _config.levelConfig[3].id;
				switch(_config.levelConfig[3].type){
					case 'blockList':
						level3ListSelectedData = NetstarBlockList.getSelectedData(level3ListId);
						break;
					case 'list':
						level3ListSelectedData = NetStarGrid.getSelectedData(level3ListId);
						break;
				}
				if($.isArray(level3ListSelectedData)){
					if(level3ListSelectedData.length > 0){
						returnSelectedData[_config.levelConfig[3].keyField] = level3ListSelectedData;
					}
				}
			}
		}
		return returnSelectedData;
	}
	//获取整体参数
	function getWholeData(_config){
		return getDetailsSelectedData(_config);
	}
	// 主表设置按钮只读
	function setMainBtnsDisabled(data, gridConfig){
		// lyw 设置主表按钮是否只读   根据NETSTAR-TRDISABLE(行只读)(获得消息后行设置了只读按钮禁用了，选中其他行时需要取消禁用)
		var config = NetstarTemplate.templates.configs[gridConfig.package];
		var rootConfig = config.mainComponent;
		var isDisabled = false;
		if(data['NETSTAR-TRDISABLE']){
			// 行没有只读取消按钮禁用
			isDisabled = true;
		}
		var rootBtnId = '';  // 主表按钮容器id
		var components = config.components;
		for(var i=0; i<components.length; i++){
			var component = components[i];
			if(component.type == "btns" && component.operatorObject == 'root'){
				rootBtnId = component.id;
				break;
			}
		}
		var $btns = $('#' + rootBtnId).find('button');
		for(var i=0; i<$btns.length; i++){
			$btns.eq(i).attr('disabled', isDisabled);
		}
	}
	//结果录入初始化
	function resultInputByInit(componentConfig,paramsData){
		var resultTableConfig = {
			//id:componentConfig.id,
			id:'resultTableContainer',
			pageParam:paramsData,
			//containerID:'resultTableContainer',
			isUseAutoWindowHeight:false,
			isUseControlPanel:true,
			isUseSettingWidthSize:false, //是否使用设置宽度尺寸，如果不使用则匹配屏幕
			isUseSettingHeightSize:true, //是否使用设置高度，不使用则全部默认为30像素一行

			isUseSettingIndex:true,
			setAutoIndex:'h',
			//isAllReadonly:true, 		 //是否全部设为只读
			//isShowHistory:false, 		//是否显示历史记录
			//unUseSettingStyle:['border','background','align','font'], 
			//unUseSettingStyle 不使用的样式表对象类，只有这四类，写上了就不起作用
			tableAjax:componentConfig.tableAjax,
			saveTimer:2,
			timer:500,
			saveAjax:componentConfig.saveAjax,
			historyAjax:componentConfig.historyAjax,
			default:{
				urlPrefix:getRootPath(), 		//url前缀
				inputLength:12, 				//输入框默认长度
				selectLength:8, 				//下拉框默认长度
				checkboxajax:{ 					//系统数据多选组件相关配置项
					isNumberID:true, 				//id是否是数字
					isMultiSelect:true, 			//更多下拉框是否多选
					type:'GET', 					//ajax type
					dataSrc:'row', 					//ajax datascr
					field:{							//数据配置
						id:'id', 					//id
						name:'name', 			 	//名称
						py:'py', 					//拼音简拼
						wb:'wb', 					//五笔简拼
					},
					data:{},
					show:['name']
				},
				uploadAjax:{
					src:"http://ui-pc:8888/NPE/File/upload",//上传图片的路径
					dataSrc:"rows",//数据源
					field:{//数据配置
						name:"name",//名称
						id:"id",//id
					},
					downLoadAjax:{
						src:getRootPath()+'/Attachment/download',
						id:'attachmentId'
					},
				},
				uploadSaveAjax:{
					src:"http://ui-pc:8888/NPE/File/upload",//保存图片的路径
					dataSrc:"rows",//数据源
					field:{//数据配置
						id:"id",//id
						smallThumb:"smallThumb",//小缩略图
						bigThumb:"bigThumb",//大缩略图
						title:"title"//标题
					}
				},
				uploadAllAjax:{
					src:"http://ui-pc:8888/NPE/File/upload",//上传图片的路径
					dataSrc:"rows",//数据源
					field:{//数据配置
						name:"name",//名称
						id:"id",//id
					},
				},
				uploadAllSaveAjax:{
					src:"http://ui-pc:8888/NPE/File/upload",//保存图片的路径
					dataSrc:"rows",//数据源
					field:{//数据配置
						id:"id",//id
						smallThumb:"smallThumb",//小缩略图
						bigThumb:"bigThumb",//大缩略图
						title:"title"//标题
					}
				},
				uploadDelAjax:{
					src:getRootPath() + '/assets/json/ajaxtable.json',
				},
				datestring:{
					//format:'MM月DD日'
					format:'HH时mm分'
				}
			},
			callback:{
				//notesFunc:function(data){console.log(data)}
			},
			//缓存相关配置
			/*cache:{
				//列表
				cacheListKeyName:'taskGroupName',
				cachelistAjax:{
					url:getRootPath() + '/assets/json/resultmanager/cachelist.json',
					type:'get',
					data:{
						state:0,
						activityId:21355
					},
					dataSrc:'rows',
				},
				//数据
				cacheDataAjax:{
					//缓存ajax地址
					url:getRootPath() + '/assets/json/resultmanager/tabledata.json',
					//读取cachelistAjax的返回结果里的数据作为参数发出去
					dataNames:{
						recordId: 			'recordId',
						taskIds: 			'taskIds',
						recordTemplateId: 	'recordTemplateId'
					}
				},
				//固定缓存项
				cacheDataPlusAjax:[
					{
						url:getRootPath() + '/assets/json/project-list.json',
						type:'get',
						data:{
							state:0,
							activityId:1
						}
					},{
						url:getRootPath() + '/assets/json/project-list.json',
						type:'get',
						data:{
							state:0,
							activityId:2
						}
					}
				]	
			}*/
		}
		//sjj 20191021添加readonly setAutoIndex=“v”属性
		if(!$.isEmptyObject(componentConfig.params)){
			$.each(componentConfig.params,function(key,value){
				resultTableConfig[key] = value;
			});
		}
		if(typeof(resultTableConfig.readonly)=='boolean'){
			resultTableConfig.isAllReadonly = resultTableConfig.readonly;
		}
		NetstarUI.resultTable.init(resultTableConfig);
	}
	function refreshListAjaxByData(_listConfig,_data,componentConfig){
		var ajaxConfig = $.extend(true,{},_listConfig);
		var ajaxOptions = {
				url:ajaxConfig.src,       //地址
				data:ajaxConfig.data,     //参数
				type:ajaxConfig.type, 
				contentType:ajaxConfig.contentType, 
				plusData:{
					dataSrc:ajaxConfig.dataSrc,
					componentConfig:componentConfig
				},
		};
		if(!$.isEmptyObject(ajaxOptions.data)){
			//存在自定义值 需要区分是默认配置值如{dataauth:3}还是{"saleId":"{saleId}"}
			//如果是存在自定义要转换的参数
			var isUseObject = true;
			var ajaxParameterRegExp = /\{?\}/;  //识别{aaaa}的数据
			for(var key in ajaxOptions.data){
				if (ajaxParameterRegExp.test(ajaxOptions.data[key])) {
					isUseObject = false;
					break;
				}
			}
			if(isUseObject){
				ajaxOptions.data = _data;
			}else{
				ajaxOptions.data = NetStarUtils.getFormatParameterJSON(ajaxOptions.data,_data);
			}
		}else{
			ajaxOptions.data = _data;
		}
		NetStarUtils.ajax(ajaxOptions, function(res, _ajaxOptions){
			if(res.success){
				//成功
				var resData = res[_ajaxOptions.plusData.dataSrc];
				var listArray = [];
				if(!$.isArray(resData)){
					listArray = resData[_ajaxOptions.plusData.componentConfig.keyField];
				}else{
					listArray = resData;
				}
				if(!$.isArray(listArray)){
					listArray = [];
				}
				if(listArray.length > 0){
					listArray[0].netstarSelectedFlag = true;						
					switch(_ajaxOptions.plusData.componentConfig.type){
						case 'blockList':
							NetstarBlockList.refreshDataById(_ajaxOptions.plusData.componentConfig.id,listArray);
							break;
						case 'list':
							NetStarGrid.refreshDataById(_ajaxOptions.plusData.componentConfig.id,listArray);
							break;
					}
					if(_ajaxOptions.plusData.componentConfig.level === 2){
						//刷新的是第二级
						var templateConfig = NetstarTemplate.templates.limsResultInput.data[_ajaxOptions.plusData.componentConfig.templateId].config;
						var level3Config = templateConfig.levelConfig[3];
						switch(level3Config.type){
							case 'resultinput':
								var paramsConfig = $.extend(true,{},templateConfig.pageParam);
								$.each(listArray[0],function(key,value){
									paramsConfig[key] = value;
								})
								resultInputByInit(level3Config,paramsConfig);
								break;
						}
					}
				}else{
					switch(_ajaxOptions.plusData.componentConfig.type){
						case 'blockList':
							NetstarBlockList.refreshDataById(_ajaxOptions.plusData.componentConfig.id,[]);
							break;
						case 'list':
							NetStarGrid.refreshDataById(_ajaxOptions.plusData.componentConfig.id,[]);
							break;
					}
					if(_ajaxOptions.plusData.componentConfig.level === 2){
						var templateConfig = NetstarTemplate.templates.limsResultInput.data[_ajaxOptions.plusData.componentConfig.templateId].config;
						switch(templateConfig.levelConfig[3].type){
							case 'blockList':
								NetstarBlockList.refreshDataById(templateConfig.levelConfig[3].id,[]);
								break;
							case 'list':
								NetStarGrid.refreshDataById(templateConfig.levelConfig[3].id,[]);
								break;
						}
					}
				}
			}else{
				nsalert(res.msg,'warning');
			}
		},true);
	}
	function mainGridSelectedHandler(data,_rows,_vueData,gridConfig){
		//刷新二级数据
		var templateConfig = NetstarTemplate.templates.configs[gridConfig.package];
		if(templateConfig.levelConfig[2]){
			var componentConfig = templateConfig.levelConfig[2];
			refreshListAjaxByData(componentConfig.ajax,data,componentConfig);
		}else{
			var level3Config = templateConfig.levelConfig[3];
			switch(level3Config.type){
				case 'resultinput':
					var paramsConfig = $.extend(true,{},templateConfig.pageParam);
					$.each(data,function(key,value){
						paramsConfig[key] = value;
					})
					resultInputByInit(level3Config,paramsConfig);
					break;
			}
		}
		//var componentConfig = NetstarTemplate.templates.configs[gridConfig.package].levelConfig[2];
		//refreshListAjaxByData(componentConfig.ajax,data,componentConfig);
		// lyw 设置主表按钮是否只读   根据NETSTAR-TRDISABLE(行只读)(获得消息后行设置了只读按钮禁用了，选中其他行时需要取消禁用)
		setMainBtnsDisabled(data, gridConfig);
	}
	function mainGridAjaxSuccessHandler(resData,_gridId){
		var templateId =_gridId.substring(0,_gridId.lastIndexOf('-blockList'));
		if(templateId == ''){
			templateId = _gridId.substring(0,_gridId.lastIndexOf('-list'));
		}
		var templateConfig = NetstarTemplate.templates.limsResultInput.data[templateId].config;
		if(templateConfig.levelConfig[2]){
			var componentConfig = templateConfig.levelConfig[2];
			var listAjax = componentConfig.ajax;
			if($.isArray(resData)){
				var selectIndex = -1;
				for(var rowI=0; rowI<resData.length; rowI++){
					if(resData[rowI].netstarSelectedFlag){
						selectIndex = rowI;
						break;
					}
				}
				if(selectIndex > -1){
					refreshListAjaxByData(listAjax,resData[selectIndex],componentConfig);
				}
			}
		}else{
			var level3Config = templateConfig.levelConfig[3];
			if($.isArray(resData)){
				var selectIndex = -1;
				for(var rowI=0; rowI<resData.length; rowI++){
					if(resData[rowI].netstarSelectedFlag){
						selectIndex = rowI;
						break;
					}
				}
				if(selectIndex > -1){
					switch(level3Config.type){
						case 'resultinput':
							var paramsConfig = $.extend(true,{},templateConfig.pageParam);
							$.each(resData[selectIndex],function(key,value){
								paramsConfig[key] = value;
							})
							resultInputByInit(level3Config,paramsConfig);
							break;
					}
				}
			}
		}
	}
	function mainGridDrawHandler(){

	}
	function setMainGridQueryTableHtml(gridConfig){
		var contidionHtml = '';
		var quickqueryHtml = '';
		var id = 'query-'+gridConfig.id;
		if(gridConfig.ui.query){
			quickqueryHtml = '<div class="pt-panel-col" id="'+id+'">'
								
							+'</div>';
		}
		if(quickqueryHtml){
			contidionHtml = '<div class="pt-container">'
								+'<div class="pt-panel-row">'
									+quickqueryHtml
								+'</div>'
							+'</div>';
		}
		contidionHtml = '<div class="pt-panel pt-grid-header">'		
							+contidionHtml
						+'</div>';
		$('#'+gridConfig.id).prepend(contidionHtml);
	}
	function mainGridQuickqueryInit(gridConfig){
		var queryConfig = gridConfig.ui.query;
	//	queryConfig.queryForm[0].inputWidth = 120;
	//	queryConfig.queryForm[1].inputWidth = 120;
		var voWidth = parseFloat(($('#query-'+gridConfig.id).outerWidth()-100)/2);
		queryConfig.queryForm[0].inputWidth = voWidth;
		queryConfig.queryForm[1].inputWidth = voWidth;
		var formJson = {
			form:queryConfig.queryForm,
			id:'query-'+gridConfig.id,
			formStyle:'pt-form-normal',
			plusClass:'pt-custom-query',
			isSetMore:false
		};
		function customFilterRefreshBtnHandler(event){
			var $this = $(this);
			var package = $this.attr('ns-package');
			var config = NetstarTemplate.templates.configs[package];
			var mainConfig = config.mainComponent;
			var formId = 'query-'+mainConfig.id;
			var formJson = NetstarComponent.getValues(formId);
			var paramJson = {};
			if(formJson.filtermode == 'quickSearch'){
				if(formJson.filterstr){
					paramJson = {
						searchType:formJson.filtermode,
						keyword:formJson.filterstr
					};
				}
			}else{
				var queryConfig = NetstarComponent.config[formId].config[formJson.filtermode];
				if(!$.isEmptyObject(queryConfig)){
					if(formJson[formJson.filtermode]){
						if(queryConfig.type == 'business'){	
							switch(queryConfig.selectMode){
								case 'single':
									paramJson[formJson.filtermode] = formJson[formJson.filtermode][queryConfig.idField];
									break;
								case 'checkbox':
									paramJson[formJson.filtermode] = formJson[formJson.filtermode][0][queryConfig.idField];
									break;
							}
						}else{
							paramJson[formJson.filtermode] = formJson[formJson.filtermode];
						}
					}
					if(typeof(formJson[formJson.filtermode])=='number'){
						paramJson[formJson.filtermode] = formJson[formJson.filtermode];
					}
					if(queryConfig.type == 'dateRangePicker'){
						var startDate = formJson.filtermode+'Start';
						var endDate = formJson.filtermode+'End';
						paramJson[startDate] = formJson[startDate];
						paramJson[endDate] = formJson[endDate];
					}
				}else{
					if(formJson.filterstr){
						paramJson[formJson.filtermode] = formJson.filterstr;
					}
				}
			}
			if(!$.isEmptyObject(config.pageParam)){
				for(var valueI in config.pageParam){
					if(typeof(paramJson[valueI])=='number'){

					}else if(paramJson[valueI]){

					}else{
						paramJson[valueI] = config.pageParam[valueI];
					}
				}
			}
			NetStarGrid.refreshById(mainConfig.id,paramJson);
		}
		formJson.completeHandler = function(obj){
			var buttonHtml = '<div class="pt-btn-group">'
							+'<button type="button" class="pt-btn pt-btn-default pt-btn-icon" nstype="refresh" ns-package="'+gridConfig.package+'" containerid="'+formJson.id+'"><i class="icon-search"></i></button>'
						+'</div>';
			var $container = $('#'+formJson.id);
			$container.append(buttonHtml);
			$('button[containerid="'+formJson.id+'"]').off('click',customFilterRefreshBtnHandler);
			$('button[containerid="'+formJson.id+'"]').on('click',customFilterRefreshBtnHandler);
		}
		var component2 = NetstarComponent.formComponent.getFormConfig(formJson);
		NetstarComponent.formComponent.init(component2,formJson);
	}
	function mainGridCompleteHandler(_configs){
		var gridConfig = _configs.gridConfig;
		setMainGridQueryTableHtml(gridConfig);
		mainGridQuickqueryInit(gridConfig);
	}
	function gridLevel2SelectHandler(data,_rows,_vueData,gridConfig){
		//刷新三级数据
		var componentConfig = NetstarTemplate.templates.configs[gridConfig.package].levelConfig[3];
		refreshListAjaxByData(componentConfig.ajax,data,componentConfig);
	}
	function gridLevel2DrawHandler(){

	}
	function gridLevel2CompleteHandler(){

	}
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
				   	
					/*if(componentData[_config.levelConfig[2].id]){
						//list是第二层
						componentData[_config.levelConfig[2].id].params = {
							height:parseInt(_config.commonPanelHeight/2)
						};
					}else if(componentData[_config.levelConfig[3].id]){
							//list是第三层
						var gridHeight = _config.commonPanelHeight - 34;
						if(_config.mode == 'listgrid'){
							gridHeight = parseInt(_config.commonPanelHeight/2);
						}
						componentData[_config.levelConfig[3].id].params = {
							height:gridHeight
						};
					}*/
					NetstarTemplate.commonFunc.list.initList(componentData,_config);
				  break;
			   case 'blockList':
					/*if(componentData[_config.levelConfig[2].id]){
						//list是第二层
						var gridHeight = 34;
						if(_config.mode == 'listgrid'){
							gridHeight = _config.commonPanelHeight;
						}
						componentData[_config.levelConfig[2].id].params = {
							height:gridHeight,
							selectedHandler:gridLevel2SelectHandler,
							drawHandler:gridLevel2DrawHandler,
							completeHandler:gridLevel2CompleteHandler
						};
					}else if(componentData[_config.levelConfig[3].id]){
						
					}*/
				  	NetstarTemplate.commonFunc.blockList.initBlockList(componentData,_config);
				  break;
			   case 'btns':
					_config.btnKeyFieldJson.root.outBtns.push({
						btn:{
							text:'设置平行样',
							handler:function(data){
								data = data.dialogBeforeHandler(data);
								var _obj = data.value;
								var _templateConfig = data.config;
								if (!_obj) {
									nsalert("请选择记录");
									return;
								}
								var _node = NetstarUI.resultTable.getCurrentData();
								if (_node && _node.data.sampleItemId) {
									var ajaxConfig = {
										url:getRootPath() + '/sample/accept/sampleItems/getSampleItemBySampleIdAndRecordId',
										data: {
											sampleId: _node.data.sampleId,
											recordId: _node.data.recordId
										},
										type: "post",
									};
									NetStarUtils.ajax(ajaxConfig,function(res){
										if(res.success){
											var _itemArr = res.rows;
											if(!$.isArray(_itemArr)){
												_itemArr = [];
											}
											var _sampleItemIds="";
											for(var i=0;i<_itemArr.length;i++){
												_sampleItemIds = _sampleItemIds + _itemArr[i].id  + ",";
											}
											if(_sampleItemIds != ""){
												_sampleItemIds = _sampleItemIds.substring(0,_sampleItemIds.length-1);
											}
											var dialogCommon = {
												id:'parallelNumberDiv',
												title: '设置平行样',
												templateName: 'PC',
												height:'auto',
												width:'500px',
												shownHandler:function(data){
													var fieldArray =  [{
														id: "sampleItemIds",
														label: "项目名称",
														type: 'select',
														rules: 'required',
														selectMode: 'multi',
														width: '100%',
														maximumItem: 20,
														textField: "itemReportName",
														valueField: "id",
														rules: 'required',
														subdata: _itemArr,
														value:_sampleItemIds
													},
														{
															id: 'parallelNumber',
															label: '平行样数量',
															width: '100%',
															type: 'text',
															rules: 'required positiveInteger',
															column: 12
														}
													];
													var formConfig = {
														id: data.config.bodyId,
														templateName: 'form',
														componentTemplateName: 'PC',
														defaultComponentWidth:'50%',
														form:fieldArray,
													};
													NetstarComponent.formComponent.show(formConfig);
													var btnJson = {
														id:data.config.footerIdGroup,
														//pageId:id,
														btns:[
															{
																text:'保存',
																handler:function(){
																	var _jsonData = NetstarComponent.getValues('dialog-parallelNumberDiv-body');
																	if (_jsonData) {
																		var ajaxConfig = {
																			url: getRootPath() + '/sample/detection/testData/saveParallelNumber',
																			data: _jsonData,
																			type: "post",
																		};
																		NetStarUtils.ajax(ajaxConfig,function(res){
																			if(res.success){
																				nsalert('设置平行样成功');
																				//刷新操作
																				NetstarComponent.dialog['parallelNumberDiv'].vueConfig.close();
																				NetstarUI.resultTable.init(NetstarUI.resultTable.config);
																				//NetstarTemplate.templates.limsResultInput.ajaxAfterHandler({},_templateConfig.id);	
																			}else{
																				if (res.msg) {
																					nsalert(res.msg);
																				} else {
																					nsalert("设置平行样失败");
																				}
																			}
																		},true);
																	}
																}
															},{
																text:'关闭',
																handler:function(){
																	NetstarComponent.dialog['parallelNumberDiv'].vueConfig.close();
																}
															}
														]
													};
													vueButtonComponent.init(btnJson);
												}
											};
											NetstarComponent.dialogComponent.init(dialogCommon);
											
										}
									},true)
								} else {
									nsalert("请选择方法数据单元格！");
									return;
								}
							}
						},
						functionConfig:{}
					},{
						btn:{
							text:'矩阵样',
							handler:function(data){
								data = data.dialogBeforeHandler(data);
								var _obj = data.value;
								var _templateConfig = data.config;
								if (!obj) {
									nsalert("请选择任务组");
									return;
								}
								var node = NetstarUI.resultTable.getCurrentData();
								if (node && node.data) {
									var ajaxConfig = {
										url:getRootPath() + '/sample/detection/testData/saveMatrixList',
										data: {
											sampleId: _node.data.sampleId,
											recordId: _node.data.recordId
										},
										type: "post",
									};
									NetStarUtils.ajax(ajaxConfig,function(res){
										if(res.success){
											nsalert('设置矩阵样成功');
											//刷新操作
											NetstarTemplate.templates.limsResultInput.ajaxAfterHandler({},_templateConfig.id);
										}
									});
								} else {
									nsalert("请选择方法数据单元格");
									return;
								}
							}
						},
						functionConfig:{}
					},{
						btn:{
							text:'设置矩阵样条件',
							handler:function(data){
								data = data.dialogBeforeHandler(data);
								var _obj = data.value;
								var _templateConfig = data.config;
								if (!_obj) {
									nsalert("请选择记录", 'error');
									return;
								}
								var _node = NetstarUI.resultTable.getCurrentData();
								debugger;
								if (_node && _node.data) {
									var ajaxConfig = {
										url:getRootPath() + '/dataNodeMatrixConditions/getByRecordIdMatrixList',
										data: {
											gridId: _node.data.gridId,
											recordId: _node.data.recordId
										},
										type: "post",
										//contentType:'application/json'
									};
									NetStarUtils.ajax(ajaxConfig,function(res){
										if(res.success){
											nsalert('获取矩阵样关系成功');
											//刷新操作
											//NetstarTemplate.templates.limsResultInput.ajaxAfterHandler({},_templateConfig.id);
										}
									});
									//设置矩阵样条件弹框 start ------
									var dialogCommon = {
										id:'parallelNumberDiv',
										title: '设置矩阵样条件',
										templateName: 'PC',
										height:'auto',
										shownHandler:function(data){

											
											var columns =  [
											{
												title : '',
												field : 'id',
												hidden : true
											}, {
												field : 'recordId',
												title : 'recordId',
												hidden:true,
												searchable : true
											}, {
												field : 'gridId',
												title : 'gridId',
												hidden:true,
												searchable : true
											}, {
												field : 'dataNodeId',
												title : 'dataNodeId',
												hidden:true,
												searchable : true
											},{
												field : 'matrixconditions',
												title : '矩阵关系',
												searchable : true
											}
											];
											var gridConfig = {
												id: data.config.bodyId,
												columns:columns,
												data:{
													idField:'id',
													dataSource:[{id:'id--', recordId:'recordId--', gridId:'gridId--', dataNodeId:'dataNodeId--',  matrixConditions:'matrixConditions--'}],
												},
												ui:{
													tableRowBtns:[{
														text:'启用',
														handler:function(data){
															var _row = data.rowData;
															debugger;
															var startAjaxConfig = {
																url:getRootPath() + '/sample/detection/testData/startMatrixConditions',
																data: {
																	recordId: _row.recordId,
																	id: _row.id,
																	gridId:_row.gridId,
																	dataNodeId : _row.dataNodeId,
																	matrixConditions : _row.matrixConditions
																},
																type: "post",
																contentType:'application/json'
															};
															NetStarUtils.ajax(startAjaxConfig,function(res){
																if(res.success){
																	nsalert('获取矩阵样关系成功');
																	//刷新操作
																	//NetstarTemplate.templates.limsResultInput.ajaxAfterHandler({},_templateConfig.id);
																}
															});
														}
													},{
														text:'停用',
														handler:function(){
															var _row = data.rowData;
															debugger;
															var startAjaxConfig = {
																url:getRootPath() + '/sample/detection/testData/stopMatrixConditions',
																data: {
																	recordId: _row.recordId,
																	id: _row.id,
																	gridId:_row.gridId,
																	dataNodeId : _row.dataNodeId,
																	matrixConditions : _row.matrixConditions
																},
																type: "post",
																contentType:'application/json'
															};
															NetStarUtils.ajax(startAjaxConfig,function(res){
																if(res.success){
																	nsalert('获取矩阵样关系成功');
																	//刷新操作
																	//NetstarTemplate.templates.limsResultInput.ajaxAfterHandler({},_templateConfig.id);
																}
															});
														}
													}]
												}
											};
											NetStarGrid.init(gridConfig);


											var btnJson = {
												id:data.config.footerIdGroup,
												//pageId:id,
												btns:[
													{
														text:'保存',
														handler:function(){
															var _jsonData = NetstarComponent.getValues('dialog-parallelNumberDiv-body');
															if (_jsonData) {
																var ajaxConfig = {
																	url: getRootPath() + '/sample/detection/testData/saveMatrixList',
																	data: _jsonData,
																	type: "post",
																};
																NetStarUtils.ajax(ajaxConfig,function(res){
																	if(res.success){
																		nsalert('设置矩阵样条件成功');
																		//刷新操作
																		NetstarUI.resultTable.init(NetstarUI.resultTable.config);
																		//NetstarTemplate.templates.limsResultInput.ajaxAfterHandler({},_templateConfig.id);	
																	}else{
																		if (res.msg) {
																			nsalert(res.msg);
																		} else {
																			nsalert("设置矩阵样失败");
																		}
																	}
																},true);
															}
														}
													},{
														text:'关闭',
														handler:function(){
															NetstarComponent.dialog['parallelNumberDiv'].vueConfig.close();
														}
													}
												]
											};
											vueButtonComponent.init(btnJson);
										}
									};
									NetstarComponent.dialogComponent.init(dialogCommon);
									//设置矩阵样条件弹框 end ------

								} else {
									nsalert("请选择方法数据单元格");
									return;
								}
							}
						},
						functionConfig:{}
					});
				  	NetstarTemplate.commonFunc.btns.initBtns(componentData,_config);
				  break;
			}
		}
		if(!$.isEmptyObject(_config.btnKeyFieldJson)){
			for(var btnId in _config.btnKeyFieldJson){	
				if(_config.btnKeyFieldJson[btnId].inlineBtns.length > 0){
					vueButtonComponent.init({
						id:_config.btnKeyFieldJson[btnId].id,
						btns:_config.btnKeyFieldJson[btnId].inlineBtns,
						package:_config.package,
					});
				}
			}
		}
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
		var html = '<div class="pt-main limsresultinput '+templateClassStr+' '+_config.mode+'" id="'+_config.id+'">'
                     +'<div class="pt-container">'
						+'<div class="pt-main-row">'
							+'<div class="pt-main-col pt-col-auto" ns-position="left">'
								
							+'</div>'
							+'<div class="pt-main-col" ns-position="right">'
								
							+'</div>'
						+'</div>'
					+'</div>'
				  +'</div>';
	 	$container.prepend(html);//输出面板
		var btnsHtml = '';//按钮输出
		var mainBtnHtml = '';//主表按钮
		var resultinputWidth = 0;
		var resultinputHeight = _config.commonPanelHeight;
		var resultInputPanelHeight = 0;
		if($('#netstar-main-page').length >0){
			//resultinputWidth = $(window).outerWidth()-$('#netstar-main-page').offset().left - 350;
			resultInputPanelHeight =  $(window).outerWidth()-$('#netstar-main-page').offset().left-$('div[ns-position="left"]').outerWidth()-100;
		}else{
			//resultinputWidth = $(window).outerWidth()-350;
		}
		for(var componentsI=0; componentsI<_config.components.length; componentsI++){
			var componentData = _config.components[componentsI];
			componentData.templateId = _config.id;
			componentData.package = _config.package;
			var operatorObject = componentData.operatorObject ? componentData.operatorObject : '';
			switch(componentData.type){
				case 'btns':
					if(operatorObject == '' || operatorObject=='root'){
						mainBtnHtml = '<div class="nav-form main-btns" id="'+componentData.id+'"></div>';
						_config.mainBtnComponent = componentData;
					}else{
						btnsHtml = '<div class="nav-form" id="'+componentData.id+'"></div>';
					}
					break;
				case 'list':
				case 'blockList':
					if(componentData.parent == 'root'){
						//主表
						componentData.isAjax = true;
						componentData.level = 1;
						componentData.params = {
							selectedHandler:mainGridSelectedHandler,
							ajaxSuccessHandler:mainGridAjaxSuccessHandler,
							drawHandler:mainGridDrawHandler,
						};
						if(componentData.type == 'blockList'){
							var defaultParams = {
								isPage:false,
								pageLengthDefault:10000000,
								height:_config.commonPanelHeight,
								completeHandler:mainGridCompleteHandler,
								query:NetStarUtils.getListQueryData(componentData.field,{id:'query-'+componentData.id,value:''}),
							};
							NetStarUtils.setDefaultValues(componentData.params,defaultParams);
						}else{
							var defaultParams = {
								height:_config.commonPanelHeight,
							};
							NetStarUtils.setDefaultValues(componentData.params,defaultParams);
						}
						_config.mainComponent = componentData;
					}else{
						if(componentData.keyField){
							componentData.level = 2;
							_config.levelConfig[2] = componentData;
						}
					}
					break;
				case 'resultinput':
					componentData.level = 3;
					_config.levelConfig[3] = componentData;
					break;
			}
			if(typeof(_config.componentsConfig[componentData.type])=='undefined'){
				_config.componentsConfig[componentData.type] = {};
			}
			_config.componentsConfig[componentData.type][componentData.id] = componentData;
		}
		var positionLeftHtml = '';
		var positionRightHtml = '';
		switch(_config.mode){
			case 'blockgrid':
				positionLeftHtml =  '<div class="pt-panel">'
										+'<div class="pt-panel-container" id="'+_config.mainComponent.id+'" ns-level="1">'
										+'</div>'
									+'</div>'
									+'<div class="pt-panel">'
											+'<div class="pt-panel-container">'
												+'<div class="pt-panel-row">'
													+'<div class="pt-panel-col">'
														+'<div class="pt-panel">'
																+'<div class="pt-panel-container">'
																	+'<div class="pt-panel-row">'
																		+'<div class="pt-panel-col">'
																			+mainBtnHtml
																		+'</div>'
																	+'</div>'
																+'</div>'
														+'</div>'
													+'</div>'
												+'</div>'
											+'</div>'
									+'</div>';
				positionRightHtml = '<div class="pt-panel">'
										+'<div class="pt-panel-container" id="'+_config.levelConfig[2].id+'" ns-level="2">'
										+'</div>'
										+'<div class="pt-panel-container" id="resultTableContainer" ns-level="3">'
										+'</div>'
										+'<div class="pt-panel">'
												+'<div class="pt-panel-container">'
													+'<div class="pt-panel-row">'
														+'<div class="pt-panel-col">'
															+btnsHtml
														+'</div>'
													+'</div>'
												+'</div>'
										+'</div>'
									+'</div>'
				break;
			case 'listgrid':	
				positionLeftHtml = '<div class="pt-panel">'
										+'<div class="pt-panel-container" id="'+_config.mainComponent.id+'" ns-level="1" style="width:350px;"></div>'
									+'</div>'
									//+'<div class="pt-panel">'
										//+'<div class="pt-panel-container" id="'+_config.levelConfig[2].id+'" ns-level="2" style="width:350px;"></div>'
									//+'</div>';'+_config.levelConfig[3].id+'
				positionRightHtml = '<div class="pt-panel">'
										+'<div class="pt-panel-container" id="resultTableContainer" ns-level="3" style="height:'+resultinputHeight+'px;"></div>'
									+'</div>';
				var btnHtml = '<div class="pt-main-row">'
									+'<div class="pt-main-col">'
										+'<div class="pt-panel">'
											+'<div class="pt-panel-container">'
												+'<div class="pt-panel-row">'
													+'<div class="pt-panel-col">'
														+'<div class="nav-form" id="'+_config.mainBtnComponent.id+'"></div>'
													+'</div>'
												+'</div>'
											+'</div>'
										+'</div>'
									+'</div>'
								+'</div>';
				$('#'+_config.id).children('.pt-container').prepend(btnHtml);
				break;
		}
		var $positionLeft = $('#'+_config.id+' div[ns-position="left"]');
		var $positionRight = $('#'+_config.id+' div[ns-position="right"]');
		$positionLeft.html(positionLeftHtml);
		$positionRight.html(positionRightHtml);

		_config.expandId = 'expand-'+_config.id;
		$positionLeft.prepend('<div class="result-control"><a href="javascript:void(0);" id="'+_config.expandId+'"></a></div>');

		$('#'+_config.expandId).on('click',function(ev){
			$(this).closest('div[ns-position="left"]').toggleClass('collapsed');
		})
	}
	//设置默认值
	function setDefault(_config){
		var defaultConfig = {
			levelConfig:{},//等级数据存放
			mode:'listGrid',  //listGrid ,treeGrid,blockGrid
			//commonPanelHeight:$(window).outerHeight()-(NetstarTopValues.topNav.height+54),
		};
		NetStarUtils.setDefaultValues(_config,defaultConfig);
		var commonHeight = 0;
		for(var attrName in NetstarTopValues){
			//标签35+按钮的34
			commonHeight += NetstarTopValues[attrName].height;
		}
		_config.commonPanelHeight = $(window).outerHeight()-20-commonHeight;//减去上下边距的20减去标签的高度减去按钮的高度
	
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
		initComponent(_config);
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
		getMainListSelectedData:						getMainListSelectedData,		//获取主表选中行数据
		getDetailsSelectedData:							getDetailsSelectedData,			//获取子表数据选中行数据
		getWholeData:									getWholeData,					//获取整体参数
		refreshByConfig:								refreshByConfig,
		gridSelectedHandler:							function(){}
	}
})(jQuery)
/******************** 表格模板 end ***********************/