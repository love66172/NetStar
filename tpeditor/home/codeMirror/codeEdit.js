        var config = ajaxData();
        // console.log(config);
        var editor = CodeMirror.fromTextArea(document.getElementById("codeEdit"), {
            mode:"application/json",
            lineNumbers: true,
            smartIndent: true, // 是否智能缩进
            autofocus: true,
            theme: "default",
            matchBrackets: true,
            extraKeys: {
                "Esc": function (cm) {
                    var fullScreen = cm.getOption("fullScreen");
                    cm.setOption("fullScreen", !fullScreen);
                },
                "Ctrl-Q": "autocomplete"
            },
            mode: {
                name: "javascript",
                globalVars: true
            }
        });
        editor.setSize('100%', '500px');
        editor.on('keyup', function (cm, name, Event) {
            // console.log("name",name);
            // console.log("cm",cm);
            // console.log("Event",Event)
            //定义按哪些键时弹出提示框
            if (isShow(name.keyCode)) {
                
                // 页面模板配置项
                /*
                字符串string: ['""']
                布尔值boolean: ['true','false']
                方法function:['function(){}']
                obj{}:['{}']
                数值number: ['']
                数组[]: []

                */
                var datas = {};
                var cur = cm.getCursor();
                var ch = cur.ch;
                var line = cur.line;
                var lineStr = cm.getLine(line);
                var fromS = lineStr.lastIndexOf(" ");
                var fromSD = lineStr.lastIndexOf(":");
                var endS = lineStr.length;
                var obj = {};
                var packgeArrary = [];
                // debugger;
                //自定义的API关键字
                for(var key in config){
                    packgeArrary.push(key);
                    obj[key] = config[key]
                }

                if (fromS > -1) {
                    if (fromSD > -1) {
                        if (fromS < fromSD) {
                            var lineEnd = lineStr.substring(endS - 1, endS);
                            if (lineEnd == ":") {
                                lineStr = lineStr.substring(fromS + 1, endS - 1);
                                var list = obj[lineStr];

                                if (typeof (list) != "undefined") {

                                    datas.list = list;
                                    datas.from = {};
                                    datas.from.line = line;
                                    datas.from.ch = ch;
                                    datas.to = {};
                                    datas.to.line = line;
                                    datas.to.ch = ch + 1;

                                    editor.showHint1({
                                        completeSingle: false
                                    }, datas);
                                }
                            } else {
                                var packge = lineStr.substring(fromS + 1, fromSD);
                                var functioStr = lineStr.substring(fromSD + 1, endS).toLowerCase();
                                var packgeList = obj[packge];
                                var showList = [];
                                var showList2 = [];
                                for (var a = 0; a < packgeList.length; a++) {
                                    var info = packgeList[a];
                                    if (info.toLowerCase().lastIndexOf(functioStr) > -1) {
                                        showList.push(info);
                                        showList2.push(a);
                                    }
                                }
                                datas.list = showList;
                                datas.showList = showList2;
                                datas.key = packgeList[0];
                                datas.from = {};
                                datas.from.line = line;
                                datas.from.ch = ch;
                                datas.to = {};
                                datas.to.line = line;
                                datas.to.ch = fromSD + 1;
                                editor.showHint1({
                                    completeSingle: false
                                }, datas);
                            }

                        } else {
                            editor.showHint(); //满足自动触发自动联想功能
                        }
                    } else {
                        var showList = [];

                        var packgeS = lineStr.substring(fromS + 1, endS).toLowerCase();
                        if (packgeS == "" || packgeS == null) {
                            datas.list = packgeArrary;
                        } else {
                            for (var a = 0; a < packgeArrary.length; a++) {
                                var info = packgeArrary[a];
                                if (info.toLowerCase().lastIndexOf(packgeS) > -1) {
                                    showList.push(info);
                                }
                            }
                            datas.list = showList;
                        }

                        datas.from = {};
                        datas.from.line = line;
                        datas.from.ch = ch;
                        datas.to = {};
                        datas.to.line = line;
                        datas.to.ch = fromS + 1;
                        editor.showHint1({
                            completeSingle: false
                        }, datas);
                    }
                } else {
                    editor.showHint(); //满足自动触发自动联想功能
                }
            }
        });

        function isShow(z) {

            if (z == "8" || z == "173" || z == "190" || z == "189" || z == "110" || z == "65" || z == "66" || z ==
                "67" || z == "68" || z == "69" || z == "70" || z == "71" || z == "72" || z == "73" || z == "74" || z ==
                "75" || z == "76" || z == "77" || z == "78" || z == "79" || z == "80" || z == "81" || z == "82" || z == "83" || z == "84" ||
                z == "85" || z == "86" || z == "87" || z == "88" || z == "89" || z == "90" || z == "219" || z == "186" || z == "188" || z == "13" || z == "32") {
                return true;
            } else {
                return false;
            }
        }
        function ajaxData(){
            var obj = {};
            $.ajax({
                type:'GET',
                url:'pageKeyValue.json',
                dataType:"json",
                success:((data)=>{
                    // console.log(data)
                    // config = data;
                    for(var key in data){
                        if(data[key] == "function"){
                            obj[key] = ["function(){}"];
                        }else if(data[key] == "boolean"){
                            obj[key] = ["true","false"];
                        }else if(data[key] == "string"){
                            obj[key] = ['""'];
                        }else if(data[key] == "number"){
                            obj[key] = [''];
                        }else if(data[key] == "object"){
                            obj[key] = ['{}'];
                        }else if(data[key] == "array"){
                            obj[key] = ['[]']
                        }else{
                            var array = []
                            for(var i = 0; i < data[key].length; i ++){
                                var str = '' + data[key][i];
                                array.push(str);
                            }
                            obj[key] = array;
                        }
                    }
                })
            })
            return obj;
        }