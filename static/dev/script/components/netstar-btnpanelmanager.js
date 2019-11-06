/**
 * 2019-09-23 按钮面板管理器
 */
var NetstarBtnPanelManager = {
   configs:{},
   dialogBody:{
      TEMPLATE:{
         PC:{
            dragable : '<div class="pt-panel-col pt-formeditor" :ns-type="type">'
                         + '<div class="pt-container">'
                             + '<div class="pt-title">'
                                 + '<h6>{{title}}</h6>'
                             + '</div>'
                             + '<div class="pt-list">'
                                  + '<ul>'
                                     + '<li>'
                                         + '<span>行号</span>'
                                         + '<span>文本值</span>'
                                     + '</li>'
                                 + '</ul>'
                                 + '<ul v-on:drop="drop($event)" v-on:dragover="dragover($event)">'
                                       + '<li v-for="(item,i) in dragableField" :class="item.class" :disabled=item.disabled draggable="true" :ns-type=item.attrtype :ns-index=i :ns-position=item.position :ns-englishname=item.englishName v-on:dragstart="dragstart($event)" v-on:dblclick="dblclick($event)">'
                                          + '<span v-on:click="click($event)">{{i+1}}</span>'
                                          + '<span>{{item.text}}</span>'
                                       + '</li>'
                                 + '</ul>'
                             + '</div>'
                         + '</div>'
                     + '</div>',
            movedragable:'<div class="pt-panel-col pt-formeditor" :ns-type="movetype">'
                              +'<div class="pt-container">'
                                 +'<div class="pt-title"><h6>{{movetitle}}</h6></div>'
                                 +'<div class="pt-list">'
                                    +'<ul>'
                                       +'<li><span>行号</span><span>文本值</span></li>'
                                    +'</ul>'
                                    +'<ul v-on:drop="movedrop($event)" v-on:dragover="dragover($event)">'
                                       +'<li v-for="(item,i) in moveableField" draggable="true" :class="item.class" :ns-type=item.attrtype :ns-index=i :ns-position=item.position :ns-englishname=item.englishName v-on:dragstart="dragstart($event)" v-on:dblclick="moveDblclick($event)">'
                                          +'<span v-if="item.show === true">{{i+1}}</span>'
                                          +'<span>{{item.text}}</span>'
                                       +'</li>'
                                    +'</ul>'
                                    +'<div class="drag-move" v-if="moveEmpty === true">{{moveText}}</div>'
                                 +'</div>'
                              +'</div>'
                           +'</div>',
         },
         MOBILE:{},
      },
      getHtml:function(_bodyConfig){
         var template = this.TEMPLATE[_bodyConfig.templateName];
         var panel = template.dragable;
         var moveFieldPanel = template.movedragable;
         return '<div class="pt-panel"><div class="pt-container"><div class="pt-panel-row">'+panel+moveFieldPanel+'</div></div></div>';
      },
      getData:function(_btnPanelData){
         var data = {
            title:'当前按钮显示顺序',
            dragableField:_btnPanelData.dragableField,
            moveableField:[{text:'暂无数据',attrtype:'',position:-1,englishName:'',class:'pt-nodata',show:false}],
            movetitle:'隐藏的按钮',
            type:'movebefore',
            movetype:'moveafter',
            moveText:'按等级拖放至此区域',
            moveEmpty:false
         };
         return data;
      },
      getComponentConfig:function(_btnPanelData){
         var _this = this;
         var html = _this.getHtml(_btnPanelData);
         var component = {
            template:html,
            data:function(){
               return _this.getData(_btnPanelData);
            },
            methods:{
               //排序
               sortDragableField:function(sortData){
                  /*
                     * sortData : {} 传参配置
                     * star : 开始位置 点击/拖拽的位置
                     * end : 结束位置 拖放结束的位置
                     * seat : 在拖放位置 之前/之后
                  */
                  var dragableField = this.dragableField;
                  var startData = {};//起始位置的数据
                  var endData = {};//结束位置的数据
                  var endIndex = -1;//结束位置的下标
                  var startIndex = -1;//找到开始位置的下标
                  //找到起始和结束位置进行互换
                  for(var i=0; i<dragableField.length; i++){
                     var dragData = dragableField[i];
                     if(dragData.position == Number(sortData.star)){
                        //起始位置
                        startData = dragData;
                        startIndex = i;//找到开始位置的下标
                        continue;
                     }
                     if(dragData.position == Number(sortData.end)){
                        //结束位置
                        endData = dragData;
                        endIndex = i;//结束位置的下标
                        continue;
                     }
                  }
                  if(endIndex > -1 && startIndex > -1){
                     //存在结束位置和开始位置
                     dragableField[startIndex].position = sortData.end;//互换位置
                     dragableField[endIndex].position = sortData.star;//互换位置
                     dragableField[startIndex] = dragableField.splice(endIndex,1,dragableField[startIndex])[0];
                  }
                  //console.log(dragableField)
               },
               //根据位置找数据
               getDataByDragPosition:function(position){
                  var dragableField = this.dragableField;
                  var moveData = {};
                  for(var i=0; i<dragableField.length; i++){
                     if(dragableField[i].position == position){
                        moveData = dragableField[i];
                        break;
                     }
                  }
                  return $.extend(true,{},moveData);
               },
               getDataByMovePosition:function(position){
                  var moveableField = this.moveableField;
                  var moveData = {};
                  for(var i=0; i<moveableField.length; i++){
                     if(moveableField[i].position == position){
                        moveData = moveableField[i];
                        break;
                     }
                  }
                  return $.extend(true,{},moveData);
               },
               getDataByEnglishName:function(englishName){
                  var dragableField = this.dragableField;
                  var data = {};
                  for(var i=0; i<dragableField.length; i++){
                     if(dragableField[i].englishName == englishName){
                        data = dragableField[i];
                        break;
                     }
                  }
                  return $.extend(true,{},data);
               },
               //根据englishName判断是否存在数组中
               isExistByEnglishname:function(englishName){
                  var moveableField = this.moveableField;
                  var isExist = false;//默认不存在
                  for(var i=0; i<moveableField.length; i++){
                     if(moveableField[i].englishName == englishName){
                        isExist = true;
                        break;
                     }
                  }
                  return isExist;
               },
               fillDataByModeDrop:function(_moveData){
                  var starData = _moveData.startData;
                  var endData = _moveData.endData;
                  var star = _moveData.star;
                  var end = _moveData.end;
                  var moveableField = this.moveableField;
                  if(starData.attrtype != endData.attrtype){
                     starData.attrtype = endData.attrtype;
                    
                     switch(_moveData.seat){
                        case 'after':
                           starData.show = true;
                           moveableField.splice((end+1),0,starData);
                           break;
                        case 'before':
                           starData.show = true;
                           moveableField.splice(end,0,starData);
                           break;
                        case 'child':
                           starData.parent = endData.englishName;
                           this.moveableField.splice((end+1),0,starData);
                           break;
                        case 'parent':
                           starData.show = true;
                           this.moveableField[end].parent = starData.englishName;
                           this.moveableField[end].show = false;
                           //starData.child = endData.englishName;
                           this.moveableField.splice(end,0,starData);
                           break;
                     }
                  }else{
                     var endIndex = -1;//结束位置的下标
                     var startIndex = -1;//找到开始位置的下标
                     //找到起始和结束位置进行互换
                     for(var i=0; i<moveableField.length; i++){
                        var dragData = moveableField[i];
                        if(dragData.position == Number(starData.position)){
                           //起始位置
                           startIndex = i;//找到开始位置的下标
                           continue;
                        }
                        if(dragData.position == Number(endData.position)){
                           //结束位置
                           endIndex = i;//结束位置的下标
                           continue;
                        }
                     }

                     switch(_moveData.seat){
                        case 'after':
                           moveableField[startIndex] = moveableField.splice(endIndex,1,moveableField[startIndex])[0];
                           break;
                        case 'before':
                           moveableField[startIndex] = moveableField.splice(endIndex,1,moveableField[startIndex])[0];
                           break;
                        case 'child':
                           console.log('startIndex:'+startIndex)
                           console.log('endIndex:'+endIndex)
                           moveableField[startIndex] = moveableField.splice(endIndex,1,moveableField[startIndex])[0];
                           break;
                        case 'parent':
                           moveableField[startIndex].show = true;
                           moveableField[endIndex].show = false;
                           moveableField[startIndex] = moveableField.splice(endIndex,1,moveableField[startIndex])[0];
                           break;
                     }
                  }
                  //console.log(this.moveableField)
               },
               //拖动结束
               movedrop:function(ev){
                  var star = ev.dataTransfer.getData('star');
                  var starType = ev.dataTransfer.getData('type');
                  var nsIndex = ev.dataTransfer.getData('nindex');
                  // 拖放到的容器 根据容器 确定结束位置
                  var $this = $(ev.target);
                  var $tr;
                  if(ev.target.nodeName == "LI"){
                     $tr = $this;
                  }else{
                     $tr = $this.parent('li');
                  }
                  var end = Number($tr.attr('ns-position'));
                  var endType = $tr.attr('ns-type');

                  var starData = this.getDataByDragPosition(star);
                  if(starType == 'movesort'){
                     starData = this.getDataByMovePosition(star);
                  }
                  if(end == -1){
                     //左侧往右侧移动
                     this.moveableField = [
                        {
                           text:starData.text,
                           attrtype:'movesort',
                           position:starData.position,
                           englishName:starData.englishName,
                           class:'',
                           show:true
                        }
                     ];
                     this.dragableField.splice(nsIndex,1);
                  }else{
                     //当前拖拽数据是否存在于隐藏数据中
                     //判断当前拖拽的数据是否存在于已经拖拽的行中
                     var isExist = this.isExistByEnglishname(starData.englishName);
                  }

                  return;



                  var starData = this.getDataByDragPosition(star);
                  if(starType == 'movesort'){
                     starData = this.getDataByMovePosition(star);
                  }
                  
                  //判断当前拖拽的数据是否存在于已经拖拽的行中
                  var isExist = this.isExistByEnglishname(starData.englishName);
                  var offsetY = 'after';
                  
                  var endData = this.getDataByDragPosition(end);
                  if(endType == 'movesort'){
                     endData = this.getDataByMovePosition(end);
                  }
                  if(endData.attrtype=='movesort' && starData.attrtype == 'movesort'){
                     isExist = false;
                  }
                  if(!isExist){
                     if(end == -1){
                        // 从左边往右边拖拽
                        this.moveableField = [
                           {
                              text:starData.text,attrtype:'movesort',position:starData.position,englishName:starData.englishName,class:'',show:true
                           }
                        ];
                     }else{
                        //根据拖拽位置判断是拖拽到其父元素之上还是添加子元素
                        var height = $tr.height();
                        var pageY = $tr.offset().top;
                        var centerHeightY = pageY + height/2;
                        var mousePageY = ev.pageY;
                        var seat = 'after';
                        if(mousePageY < centerHeightY){
                           seat = 'before';
                        }
                        /*switch(seat){
                           case 'after':
                              if(mousePageY - centerHeightY >5){
                                 //给当前元素插入子元素 child
                                 offsetY = 'child';
                              }
                              break;
                           case 'before':
                              if(centerHeightY - mousePageY > 5){
                                 //给当前元素插入父元素 parent
                                 offsetY = 'parent';
                              }else{
                                 offsetY = 'before';
                              }
                              break;
                        }*/
                        var refreshConfig = {
                           seat:seat,
                           startData:starData,
                           endData:endData,
                           star:star,
                           end:Number($tr.attr('ns-index'))
                        };
                        if(endData.attrtype=='movesort' && starData.attrtype == 'movesort'){
                           refreshConfig.end = Number($tr.attr('ns-position'));
                        }
                        this.fillDataByModeDrop(refreshConfig);
                     }
                  }
               },
               //拖动结束
               drop:function(ev){
                  var star = ev.dataTransfer.getData('star');
                  var starType = ev.dataTransfer.getData('type');
                  // 拖放到的容器 根据容器 确定结束位置
                  var $this = $(ev.target);
                  var $tr;
                  if(ev.target.nodeName == "LI"){
                     $tr = $this;
                  }else{
                     $tr = $this.parent('li');
                  }
                  var end = $tr.attr('ns-position');
                  var endType = $tr.attr('ns-type');
                  // 插入位置 之前/之后
                  var seat = 'after';
                  var height = $tr.height();
                  var pageY = $tr.offset().top;
                  var centerHeightY = pageY + height/2;
                  var mousePageY = ev.pageY;
                  if(mousePageY<centerHeightY){
                      seat = 'before';
                  };
                  var refreshConfig = {
                     star : star,
                     end : end,
                     seat : seat,
                  }
                  console.log(starType)
                  console.log(endType)
                  if(starType == endType){
                     switch(endType){
                        case 'sort':
                           this.sortDragableField(refreshConfig);//当前进行排序
                           break;
                     }
                  }else{
                     //当前是第一个拖拽的行
                  }
               },
               // 当某被拖动的对象在另一对象容器范围内拖动时触发此事件
               dragover: function(ev){
                  ev.preventDefault();
               },
               //开始拖动
               dragstart:function(ev){
                  var $this = $(ev.target);
                  var position = Number($this.attr('ns-position'));
                  var attrtype = $this.attr('ns-type');
                  var nindex = Number($this.attr('ns-index'));
                  ev.dataTransfer.setData("star", position);//dataTransfer对象可以用来保存被拖动的数据。它可以保存一项或多项数据、一种或多数数据类型。通谷一点讲，就是可以通过它来传输被拖动的数据，以便在拖拽结束的时候，对数据进行其他的操作
                  ev.dataTransfer.setData("type", attrtype);
                  ev.dataTransfer.setData("nindex",nindex);
               },
               //双击事件
               dblclick:function(ev){
                  var $li = $(ev.target).closest('li');
                  var nsIndex = $li.attr('ns-index');
                  var starData = $.extend(true,{},this.dragableField[nsIndex]);
                  starData.show = true;
                  starData.attrtype = 'movesort';
                  var isContinue = false;
                  if(this.moveableField.length == 1){
                     if(this.moveableField[0].position == -1){
                        this.moveableField = [starData];
                     }else{
                        isContinue = true;
                     }
                  }else{
                     isContinue = true;
                  }
                  this.dragableField.splice(nsIndex,1);//从当前移除
                  if(isContinue){
                     this.moveableField.push(starData);
                  }
               },
               moveDblclick:function(ev){
                  var $li = $(ev.target).closest('li');
                  var nsIndex = $li.attr('ns-index');
                  var data = $.extend(true,{},this.moveableField[nsIndex]);
                  data.attrtype = 'sort';
                  this.moveableField.splice(nsIndex,1);//从当前移除
                  this.dragableField.push(data);
                  if(this.moveableField.length == 0){
                     this.moveableField = [{text:'暂无数据',attrtype:'',position:-1,englishName:'',class:'pt-nodata',show:false}];
                  }
               },
               //单击事件
               click:function(ev){
                  var $li = $(ev.target).closest('li');
                  if($li.index()> 0){
                     $(ev.target).toggleClass('select');
                  }
               }
            }
         };
         return component;
      },
      init:function(_btnPanelData,_runData){
         /**
          * 左侧上下进行拖拽改变的按钮的显示顺序
          * 左侧拖拽到右侧可以进行二级结构的拖拽
          */
         var _this = this;
         _this.panelData = _runData;
         //console.log(_btnPanelData)
        // console.log(_runData)
       
         var vueComponentConfig = _this.getComponentConfig(_btnPanelData);
         $('#'+_btnPanelData.id).html('<table-panel></table-panel>');
         var vuePanel = new Vue({
            el:'#'+_btnPanelData.id,
            components:{
               'table-panel':vueComponentConfig
            }
         });
         _this.vueObj = vuePanel;
         _this.vueConfig = vueComponentConfig;
      }
   },
   setDefault:function(_config){
      var btnDataByEnglishName = {};//根据名称存储数据
      var dragableField = [];//可拖拽的按钮列

      var fieldArray = store.get('dialog-'+_config.containerId);//从缓存中读取
      if($.isEmptyObject(fieldArray)){
         fieldArray = _config.field;
      }
      var increaseNum = 0;
      for(var fieldI=0; fieldI<fieldArray.length; fieldI++){
         var fieldData = fieldArray[fieldI];
         var functionConfig = fieldData.functionConfig ? fieldData.functionConfig : {};
         var btnData = fieldData.btn;
         if(!$.isEmptyObject(functionConfig)){
            //存在配置参数
            btnDataByEnglishName[functionConfig.englishName] = fieldData;//根据名称存储数据
            dragableField.push({
               englishName:functionConfig.englishName,
               text:btnData.text,
               position:increaseNum,
               attrtype:'sort',//左侧上下进行拖拽是排序
               disabled:false,//默认不禁用
            });
            increaseNum++;
         }
         if(btnData.dropdownType == 'memoryDropdown'){
            for(var s=0; s<btnData.subdata.length; s++){
               var dropBaseData = btnData.subdata[s].btn;
               var dropFunctionConfig = btnData.subdata[s].functionConfig;
               if(!$.isEmptyObject(dropFunctionConfig)){
                  //存在配置参数
                  btnDataByEnglishName[dropFunctionConfig.englishName] = btnData.subdata[s];//根据名称存储数据
                  dragableField.push({
                     englishName:dropFunctionConfig.englishName,
                     text:dropBaseData.text,
                     position:increaseNum,
                     optionfid:s,
                     attrtype:'sort',//左侧上下进行拖拽是排序
                     disabled:false,//默认不禁用
                     class:'select',
                  });
                  increaseNum++;
               }
            }
         }
      }
      var runData = {
         package:_config.package,//包名
         templateConfig:NetstarTemplate.templates.configs[_config.package],//模板配置
         dragableField:dragableField,
         btnDataByEnglishName:btnDataByEnglishName,
         id:'dialog-'+_config.containerId,//运行参数中弹出框的容器id
      };
      return runData;
   },
   saveBtnPanelByMode:function($lis,containerId){
      var btnPanelRunData = NetstarBtnPanelManager.configs[containerId].run;//当前面板运行时参数
      var btnDataByEnglishName = btnPanelRunData.btnDataByEnglishName;//根据名称存储数据
      var btnFieldArray = [];
      var increaseNum = 0;
      $.each($lis,function(index,item){
         var $this = $(item);
         var englishName = $this.attr('ns-englishname');
         var isHasSelect = $this.hasClass('select');
         if(isHasSelect){
            btnFieldArray[increaseNum-1].btn.dropdownType = 'memoryDropdown';
            if(!$.isArray(btnFieldArray[increaseNum-1].subdata)){
               btnFieldArray[increaseNum-1].btn.subdata = [];  
            }
            btnFieldArray[increaseNum-1].btn.subdata.push(btnDataByEnglishName[englishName]);
         }else{
            btnFieldArray.push(btnDataByEnglishName[englishName]);
            increaseNum++;
         }
      });
      console.log(btnFieldArray);
      var btnRootJson = {};
      var btnRootData = btnPanelRunData.templateConfig.btnKeyFieldJson.root;
      btnRootJson[btnRootData.id] = {
         id:btnRootData.id,
         field:btnFieldArray,
         operatorObject:'dialogpanel'
      };
      store.set(btnPanelRunData.id,btnFieldArray);//记录到缓存
      NetstarTemplate.commonFunc.btns.initBtns(btnRootJson,btnPanelRunData.templateConfig);//初始化按钮组件
      NetstarComponent.dialog[btnPanelRunData.id].vueConfig.close();//关闭弹出框
   },
   saveBtnPanel:function(_btnPanelData,containerId){
      var btnPanelRunData = NetstarBtnPanelManager.configs[containerId].run;//当前面板运行时参数
      var btnDataByEnglishName = btnPanelRunData.btnDataByEnglishName;//根据名称存储数据
      var btnFieldArray = [];
      _btnPanelData.sort(function(a,b){return a.position-b.position});//升序排列
      for(var i=0; i<_btnPanelData.length; i++){
         var btnData = _btnPanelData[i];
         btnFieldArray.push(btnDataByEnglishName[btnData.englishName]);
      }
      console.log(btnFieldArray);
      //执行按钮初始化
      var btnRootData = btnPanelRunData.templateConfig.btnKeyFieldJson.root;

      var btnRootJson = {};
      btnRootJson[btnRootData.id] = {
         id:btnRootData.id,
         field:btnFieldArray,
         operatorObject:'dialogpanel'
      };
      store.set(btnPanelRunData.id,btnFieldArray);//记录到缓存
      NetstarTemplate.commonFunc.btns.initBtns(btnRootJson,btnPanelRunData.templateConfig);//初始化按钮组件
      NetstarComponent.dialog[btnPanelRunData.id].vueConfig.close();//关闭弹出框
   },
   init:function(_config,isCache){
      /****
       * _config.package  string  包名
       * _config.containerId string 按钮容器的id
       * _config.field array 按钮字段配置
       * isCache boolean  是否记录缓存
       * ['save','saveSubmit']//拖拽前
       * ['saveSubmit':{parent:'save',index:0}] 拖拽后两个按钮合并到一组
       * 左侧上下进行拖拽改变的按钮的显示顺序
       * 左侧拖拽到右侧可以进行二级结构的拖拽
       */
      var _this = this;
      isCache = typeof(isCache)=='boolean' ? isCache : true;//默认记录缓存
      
      var containerId;//容器id
      if(_config.containerId){
         containerId = _config.containerId;
      }else{
         containerId = 'netstar-btnpanelmanager-dialog';//没有定义containerId给个默认值
      }
      _config.containerId = containerId;
      var runData = _this.setDefault(_config);//根据初始化进来的参数 配置当前面板需要的配置参数

      //根据容器id存储初始化进来的默认配置参数
      _this.configs[containerId] = {
         original:_config,//初始化进来的参数
         run:runData,//当前面板运行时参数
      };
      
      //开始调用弹出框
      var dialogConfig = {
         id : runData.id,
         title : '按钮面板管理',
         templateName : 'PC',
         height:800,
         width:800,
         shownHandler : function(_showConfig){
            var obj = {
               id: _showConfig.config.bodyId,//填充内容的容器id
               containerId : _showConfig.config.id,//弹出框容器id
               btnPanelManagerId:_config.containerId,//按钮容器id
               templateName : 'PC',
               dragableField:$.extend(true,[],runData.dragableField),
            };
            NetstarBtnPanelManager.dialogBody.init(obj,runData);//填充内容
            
            //输出按钮
            var btnConfig = {
               id:_showConfig.config.footerIdGroup,
               isShowTitle:false,
               btns:[
                  {
                     text:'还原默认设置',
                     handler:function(data){
                        //console.log(data)
                        nsconfirm('确定恢复默认设置吗？',function(state){
                           if(state){
                              NetstarBtnPanelManager.saveBtnPanel(runData.dragableField,containerId);
                           }
                        },'warning')
                     }
                  },{
                     text:'保存/关闭',
                     handler:function(data){
                        if($(_this.dialogBody.vueObj.$el).find('div[ns-type="moveafter"] ul:eq(1) li').length == _this.dialogBody.vueConfig.data().dragableField.length){
                           var $lis = $(_this.dialogBody.vueObj.$el).find('div[ns-type="moveafter"] ul:eq(1) li');
                           NetstarBtnPanelManager.saveBtnPanelByMode($lis,containerId);
                        }else{
                           NetstarBtnPanelManager.saveBtnPanel(_this.dialogBody.vueConfig.data().dragableField,containerId);
                        }
                     }
                  }
               ]
            };
            vueButtonComponent.init(btnConfig);
         }
      };
     NetstarComponent.dialogComponent.init(dialogConfig);
   }
};