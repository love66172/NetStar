/**
 * @Desription: 主界面组件
 * @Author: netstar.cy
 * @Date: 2019-06-29 11:00:00
 */
"use strict"; 
var NetstarHomePage = {
    //主页初始化方法
    init:function(_config){
        var _this = this;
        var config = _config;
        this.config = config;
        
        //载入登录属性
        if(config.getLoginProperty){
            this.getLoginProperty(config.getLoginProperty, function(res){
                //获取后的回调 
                var defalutServerUrl = window.location.origin;
                NetstarHomePage.defaultServerUrl = defalutServerUrl;
                //重建getRootPath
                window.getRootPath = function () {
                    return NetstarHomePage.loginProperty.data.context.weburl;
                }
                nsVals.getDictAjax();
                NetstarHomePage.showMainMeuns();
            });
        }
    },
    showMainMeuns : function(){
        var tokenStr = sessionStorage.getItem('Authorization');
        var nsHealth = {};
        nsHealth.customerCRM = {};
        nsHealth.customerCRM.view = {
            customerCRM: {
                init: function () {
                    var _this = this;
                    var searchInputConfig = {
                        containerId: "customerSearchBar",
                        placeholder: "客户名称/联系人名称/手机",
                        defaultValue: "",
                        type: "search",
                        label: "<i class='fa-search'></i>",
                        showSearchHis: false,
                        btns: [
                            {
                                text: "取消",
                                iconClass: "",
                                btnType: "",
                                handler: function (res) {
                                    $('#customerSearchBar').empty();
                                    $('#customerSearchBar').append(defaultInputText);
                                    $('#customerSearchBar').on('click', function () {
                                        nsUI.mobileSearch.init(searchInputConfig);
                                        $('#customerSearchBar').find('input').select();
                                        $('#customerSearchBar').off();
                                    });
                                }
                            }
                        ],
                        handler: function (res) {
                            console.log(res);
                            nsalert('res');
                        }
                    }
                },
                setValue: function (data) {
                    $('#mobile-loading').remove();
                    var _this = this;
                    if ($.isEmptyObject(data)){
                        $("#customerCRM").append('<span id="emptyData" class="card-text">暂无数据</span>');
                        return;
                    }
                    //$('#emptyData').remove();
                    var crmData = data;
                    //下方菜单栏
                    var $customerMenu = $('#customerMenu');
                    $.each(crmData, function (index, item) {
                        var blockStr = '<div class="card">' +
                            '<div class="card-header"><div class="title">' + item.menuName + '</div></div>' +
                            '<nav class="nav-grid grid-4"></nav>' +
                            '</div>';
                        $customerMenu.append(blockStr);
                        if (typeof item.children != 'undefined' && item.children.length > 0) {
                            var cardItemsStr = '';
                            var $cardItems = $('.nav-grid:last');
                            $.each(item.children, function (idx, itm) {
                                // var url = getRootPath() + itm.menuUrl;
                                var url = getRootPath() + itm.url;
                                itm.singlePageMode = true;//临时强制更改为true,使用单页面模式
                                cardItemsStr += (itm.singlePageMode ? cardItemsStr = '<a class="nav-item" href="javascript:nsFrame.loadPageVRouter(\'' + url + '\');">' : cardItemsStr = '<a class="nav-item" href="' + url + '">') +
                                    '<div ns-parentIndex="' + index + '" ns-currentIndex="' + idx + '" class="card-item">' +
                                    '<i class="' + itm.menuIcon + '"></i>' +
                                    '<span>' + itm.menuName + '</span>' +
                                    '</div></a>';
                            })
                            $cardItems.append(cardItemsStr);
                        }
                    })
                },
                getValue: function () { }
            }
        }
        nsHealth.customerCRM.pageConfig = {
            ajaxConfigField: "customerConfig",
            customerConfig: {
                customerCRM: {
                    parentNodeName: "root",
                    panelId: 'customerCRM',
                    ajax: {
                        url: getRootPath() + '/system/menus/getUserMenu',
                        type: "GET",
                        // data: {"usedOnPcOrPhone":1},
                        data: {
                            isPc : false
                        },
                        headers : {
                            Authorization:tokenStr
                        },
                        dataSrc: "rows"
                    }
                }
            }
        }
        fillDataWithConfig.fillValue(nsHealth.customerCRM.view, nsHealth.customerCRM.pageConfig);
        nsFrame.listenVRouter();
    },
    /**
     * 登录成功调用获取用户数据的方法，该方法必须发送header：token
     * token 是登录成功后返回的
     */
    getLoginProperty:function(_ajaxConfig, callbackFunc){
        var _this = this;
        var ajaxConfig = 
        {
            url: _ajaxConfig.url, 
            type: "GET",
            dataType: 'json',
            contentType:'application/x-www-form-urlencoded',
        }
        NetStarUtils.ajax(ajaxConfig, function(res){
            NetstarHomePage.loginProperty = res;
            if(typeof(callbackFunc) == 'function'){
                callbackFunc(res);
            }
        })
    },
}


