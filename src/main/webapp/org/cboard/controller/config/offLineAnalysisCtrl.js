/**
 * Created by yfyuan on 2016/10/11.
 */
cBoard.controller('offLineAnalysisCtrl', function ($scope, $http, dataService, $uibModal, ModalUtils, $filter, chartService, $timeout) {

    var translate = $filter('translate');
    $scope.optFlag = 'none';
    $scope.curDataset = {data: {expressions: []}};
    $scope.curWidget = {};
    $scope.alerts = [];
    $scope.verify = {dsName: true};

    $scope.curAnalysis = {data: {expressions: []}, config: {}};

    $scope.target = {};
    $scope.from = {};


    var treeID = 'dataSetTreeID'; // Set to a same value with treeDom
    var originalData = [];
    var updateUrl = "offLineAnalysis/updateAnalysis.do";


    // $http.get("offLineAnalysis/getAnalysisResult.do").success(function (response) {
    //     //$scope.datasourceList = response;
    // });


    $http.get("dashboard/getDatasourceList.do").success(function (response) {
        $scope.datasourceList = response;
    });

    $scope.datasourceIdSelectFrom = 0;
    $scope.datasourceIdSelectTo = 0;
    $scope.loadDB = function (datasource, type) {
        var databases = [];

        if (type == "from") {

            $scope.datasourceIdSelectFrom = datasource.id;
            $http.post("offLineAnalysis/getDBByDatasource.do", {datasourceId: $scope.datasourceIdSelectFrom}).success(function (response) {
                databases = response.data;
                $scope.databasesFrom = [];
                if (databases.length > 1) {
                    for (var i = 1; i < databases.length; i++) {
                        $scope.databasesFrom.push(databases[i][0]);

                    }
                }
                return $scope.databasesFrom;
            });


        } else if (type == "to") {

            $scope.datasourceIdSelectTo = datasource.id;
            $http.post("offLineAnalysis/getDBByDatasource.do", {datasourceId: $scope.datasourceIdSelectTo}).success(function (response) {
                databases = response.data;
                $scope.databasesTo = [];
                if (databases.length > 1) {
                    for (var i = 1; i < databases.length; i++) {
                        $scope.databasesTo.push(databases[i][0]);

                    }
                }
                return $scope.databasesTo;
            });


        }


    };

    $scope.loadTables = function (dbName, type) {
        var tables = [];

        if (type == "from") {
            $http.post("offLineAnalysis/getTablesByDBName.do", {
                datasourceId: $scope.datasourceIdSelectFrom,
                dbName: dbName == null ? "" : dbName
            }).success(function (response) {
                tables = response.data;
                $scope.tablesFrom = [];
                if (tables.length > 1) {
                    for (var i = 1; i < tables.length; i++) {
                        $scope.tablesFrom.push(tables[i][0]);

                    }
                }
            });
        } else if (type == "to") {

            $http.post("offLineAnalysis/getTablesByDBName.do", {
                datasourceId: $scope.datasourceIdSelectTo,
                dbName: dbName == null ? "" : dbName
            }).success(function (response) {
                tables = response.data;
                $scope.tablesTo = [];
                if (tables.length > 1) {
                    for (var i = 1; i < tables.length; i++) {
                        $scope.tablesTo.push(tables[i][0]);

                    }
                }
            });

        }

    };


    var getDatasetList = function () {
        $http.post("dashboard/getDatasetListByType.do", {type: 1}).success(function (response) {
            $scope.datasetList = response;
            $scope.searchNode();
        });

    };

    var getCategoryList = function () {
        $http.get("dashboard/getDatasetCategoryList.do").success(function (response) {
            $scope.categoryList = response;
            $("#DatasetName").autocomplete({
                source: $scope.categoryList
            });
        });
    };

    getCategoryList();
    getDatasetList();

    $scope.newDs = function () {
        $scope.optFlag = 'new';
        $scope.curAnalysis = {data: {expressions: []}, config: {}};

        cleanPreview();
    };

    $scope.editDs = function (ds) {
        $http.post("dashboard/checkDatasource.do", {id: ds.data.datasource}).success(function (response) {
            if (response.status == '1') {
                doEditDs(ds);
            } else {
                ModalUtils.alert(translate("ADMIN.CONTACT_ADMIN") + "：Datasource/" + response.msg, "modal-danger", "lg");
            }
        });
    };

    var doEditDs = function (ds) {
        $scope.optFlag = 'edit';
        $scope.curAnalysis = angular.copy(ds);
        $scope.curAnalysis.name = $scope.curAnalysis.categoryName + '/' + $scope.curAnalysis.name;

        if (!$scope.curAnalysis.data.expressions) {
            $scope.curAnalysis.data.expressions = [];
        }
        $scope.curAnalysis.config.databaseSource = _.find($scope.datasourceList, function (ds) {
            return ds.id == $scope.curAnalysis.config.databaseSource.id;
        });

        $scope.loadDB($scope.curAnalysis.config.databaseSource, "from");
        $scope.loadTables($scope.curAnalysis.config.dbSourceName, "from");

        $scope.curAnalysis.config.databaseResult = _.find($scope.datasourceList, function (ds) {
            return ds.id == $scope.curAnalysis.config.databaseResult.id;
        });

        $scope.loadDB($scope.curAnalysis.config.databaseResult, "to");
        $scope.loadTables($scope.curAnalysis.config.dbResultName, "to");
        $scope.curWidget.query = $scope.curAnalysis.data.query.sql;

    };

    $scope.deleteDs = function (ds) {
        ModalUtils.confirm(translate("COMMON.CONFIRM_DELETE"), "modal-warning", "lg", function () {
            $http.post("dashboard/deleteDataset.do", {id: ds.id}).success(function () {
                $scope.optFlag = 'none';
                getDatasetList();
            });
        });
    };

    $scope.copyDs = function (ds) {
        var data = angular.copy(ds);
        data.name = data.name + "_copy";
        $http.post("offLineAnalysis/saveNewAnalysis.do", {json: angular.toJson(data)}).success(function (serviceStatus) {
            if (serviceStatus.status == '1') {
                $scope.optFlag = 'none';
                getDatasetList();
                ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
            } else {
                ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
            }
        });
    };

    var validate = function () {
        $scope.alerts = [];
        if (!$scope.curAnalysis.name) {
            $scope.alerts = [{msg: translate('CONFIG.DATASET.NAME') + translate('COMMON.NOT_EMPTY'), type: 'danger'}];
            $scope.verify = {dsName: false};
            $("#DatasetName").focus();
            return false;
        }
        return true;
    };

    $scope.save = function () {
        //设置当前配置信息的datasource
        $scope.curAnalysis.config.databaseResult ? $scope.curAnalysis.data.datasource = $scope.curAnalysis.config.databaseResult.id : null;

        if (!validate()) {
            return;
        }
        var ds = angular.copy($scope.curAnalysis);
        var index = ds.name.lastIndexOf('/');
        ds.categoryName = $scope.curAnalysis.name.substring(0, index).trim();
        ds.name = $scope.curAnalysis.name.slice(index + 1).trim();
        if (ds.categoryName == '') {
            ds.categoryName = translate("COMMON.DEFAULT_CATEGORY");
        }
        if ($scope.optFlag == 'new') {
            $http.post("offLineAnalysis/saveNewAnalysis.do", {json: angular.toJson(ds)}).success(function (serviceStatus) {
                if (serviceStatus.status == '1') {
                    $scope.optFlag = 'edit';
                    getCategoryList();
                    getDatasetList();
                    $scope.verify = {dsName: true};
                    ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                } else {
                    $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
                }
            });
        } else {
            $http.post(updateUrl, {json: angular.toJson(ds)}).success(function (serviceStatus) {
                if (serviceStatus.status == '1') {
                    $scope.optFlag = 'edit';
                    getCategoryList();
                    getDatasetList();
                    $scope.verify = {dsName: true};
                    ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                } else {
                    $scope.alerts = [{msg: serviceStatus.msg, type: 'danger'}];
                }
            });
        }

    };

    $scope.editExp = function (col) {
        var selects = angular.copy($scope.widgetData[0]);
        var aggregate = [
            {name: 'sum', value: 'sum'},
            {name: 'count', value: 'count'},
            {name: 'avg', value: 'avg'},
            {name: 'max', value: 'max'},
            {name: 'min', value: 'min'}
        ];
        var ok;
        var data = {expression: ''};
        if (!col) {
            ok = function (exp, alias) {
                $scope.curDataset.data.expressions.push({
                    type: 'exp',
                    exp: data.expression,
                    alias: data.alias
                });
            }
        } else {
            data.expression = col.exp;
            data.alias = col.alias;
            ok = function (data) {
                col.exp = data.expression;
                col.alias = data.alias;
            }
        }

        $uibModal.open({
            templateUrl: 'org/cboard/view/config/modal/exp.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            controller: function ($scope, $uibModalInstance) {
                $scope.data = data;
                $scope.selects = selects;
                $scope.aggregate = aggregate;
                $scope.alerts = [];
                $scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.addToken = function (str, agg) {
                    var tc = document.getElementById("expression_area");
                    var tclen = $scope.data.expression.length;
                    tc.focus();
                    var selectionIdx = 0;
                    if (typeof document.selection != "undefined") {
                        document.selection.createRange().text = str;
                        selectionIdx = str.length - 1;
                    }
                    else {
                        var a = $scope.data.expression.substr(0, tc.selectionStart);
                        var b = $scope.data.expression.substring(tc.selectionStart, tclen);
                        $scope.data.expression = a + str;
                        selectionIdx = $scope.data.expression.length - 1;
                        $scope.data.expression += b;
                    }
                    if (!agg) {
                        selectionIdx++;
                    }
                    tc.selectionStart = selectionIdx;
                    tc.selectionEnd = selectionIdx;
                };
                $scope.verify = function () {
                    $scope.alerts = [];
                    var v = verifyAggExpRegx($scope.data.expression);
                    $scope.alerts = [{
                        msg: v.isValid ? translate("COMMON.SUCCESS") : v.msg,
                        type: v.isValid ? 'success' : 'danger'
                    }];
                };
                $scope.ok = function () {
                    if (!$scope.data.alias) {
                        ModalUtils.alert(translate('CONFIG.WIDGET.ALIAS') + translate('COMMON.NOT_EMPTY'), "modal-warning", "lg");
                        return;
                    }
                    ok($scope.data);
                    $uibModalInstance.close();
                };
            }
        });
    };

    $scope.loadData = function () {
        cleanPreview();
        $scope.loading = true;

        dataService.getDataForTest($scope.curAnalysis.config.databaseSource.id,
            {sql: $scope.curAnalysis.config.sqlSelect}, function (widgetData) {
                $scope.loading = false;
                $scope.toChartDisabled = false;
                if (widgetData.msg == '1') {
                    $scope.alerts = [];
                    $scope.widgetData = widgetData.data;
                    $scope.selects = angular.copy($scope.widgetData[0]);
                } else {
                    if (widgetData.msg != null) {
                        $scope.alerts = [{msg: widgetData.msg, type: 'danger'}];
                    }
                }

                var widget = {
                    chart_type: "table",
                    filters: [],
                    groups: [],
                    keys: [],
                    selects: [],
                    values: [{
                        cols: []
                    }
                    ]
                };
                _.each($scope.widgetData[0], function (c) {
                    widget.keys.push({
                        col: c,
                        type: "eq",
                        values: []
                    });
                });

                chartService.render($('#dataset_preview'), $scope.widgetData, widget, null, {myheight: 300});
            });
    };

    var cleanPreview = function () {
        $('#dataset_preview').html("");
    };


    /**  js tree related start **/
    $scope.treeConfig = jsTreeConfig1;

    $("#" + treeID).keyup(function (e) {
        if (e.keyCode == 46) {
            $scope.deleteNode();
        }
    });

    var getSelectedDataSet = function () {
        var selectedNode = jstree_GetSelectedNodes(treeID)[0];
        return _.find($scope.datasetList, function (ds) {
            return ds.id == selectedNode.id;
        });
    };

    var checkTreeNode = function (actionType) {
        return jstree_CheckTreeNode(actionType, treeID, ModalUtils.alert);
    };

    var switchNode = function (id) {
        $scope.ignoreChanges = false;
        var dataSetTree = jstree_GetWholeTree(treeID);
        dataSetTree.deselect_all();
        dataSetTree.select_node(id);
    };

    $scope.applyModelChanges = function () {
        return !$scope.ignoreChanges;
    };

    $scope.copyNode = function () {
        if (!checkTreeNode("copy")) return;
        $scope.copyDs(getSelectedDataSet());
    };

    $scope.editNode = function () {
        if (!checkTreeNode("edit")) return;
        $scope.editDs(getSelectedDataSet());
    };

    $scope.deleteNode = function () {
        if (!checkTreeNode("delete")) return;
        $scope.deleteDs(getSelectedDataSet());
    };

//生成树（前端加载出所有dataset）
    $scope.searchNode = function () {
        var para = {dsName: '', dsrName: ''};
        //map datasetList to list (add datasourceName)
        var list = $scope.datasetList.map(function (ds) {
            var dsr = _.find($scope.datasourceList, function (obj) {
                return obj.id == ds.data.datasource
            });
            return {
                "id": ds.id,
                "name": ds.name,
                "categoryName": ds.categoryName,
                "datasourceName": dsr ? dsr.name : ''
            };
        });
        //split search keywords
        if ($scope.keywords) {
            if ($scope.keywords.indexOf(' ') == -1 && $scope.keywords.indexOf(':') == -1) {
                para.dsName = $scope.keywords;
            } else {
                var keys = $scope.keywords.split(' ');
                for (var i = 0; i < keys.length; i++) {
                    var w = keys[i].trim();
                    if (w.split(':')[0] == 'ds') {
                        para["dsName"] = w.split(':')[1];
                    }
                    if (w.split(':')[0] == 'dsr') {
                        para["dsrName"] = w.split(':')[1];
                    }
                }
            }
        }
        //filter data by keywords
        originalData = jstree_CvtVPath2TreeData(
            $filter('filter')(list, {name: para.dsName, datasourceName: para.dsrName})
        );

        jstree_ReloadTree(treeID, originalData);
    };

    $scope.treeEventsObj = function () {
        var baseEventObj = jstree_baseTreeEventsObj({
            ngScope: $scope, ngHttp: $http, ngTimeout: $timeout,
            treeID: treeID, listName: "datasetList", updateUrl: updateUrl
        });
        return baseEventObj;
    }();

    /**  js tree related end **/
})
;