'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:BpdetailCtrl
 * @description
 * # BpdetailCtrl
 * Controller of the appApp
 */
angular.module('appApp')
  .controller('BpdetailCtrl', function ($scope, $routeParams) {

    var bpname = $routeParams.bpname;
    var info = {};
    var totalVotessum = 0;
    var global = {};

    $scope.bpname = bpname;
    $scope.global = global;
    $scope.getStaked = util.getStaked;
    $scope.totalVotessum = util.totalVotessum;
    $scope.weightPercent = util.weightPercent;
    $scope.getClaimRewards = util.getClaimRewards;

    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    })

    // Create the chart
    var pointStart = 1535414400000;
    var pointInterval = 126000;
    var history_data = [];
    var chart = Highcharts.stockChart('history', {
        chart: {
            zoomType: 'x',
            backgroundColor: "transparent"
        },
        tooltip: {
            split: false,
            shared: true,
        },
        rangeSelector: {
            buttons: [{
                type: 'day',
                count: 3,
                text: '3天'
            }, {
                type: 'week',
                count: 1,
                text: '1周'
            }, {
                type: 'month',
                count: 1,
                text: '1个月'
            }, {
                type: 'month',
                count: 6,
                text: '6个月'
            }, {
                type: 'year',
                count: 1,
                text: '1年'
            }, {
                type: 'all',
                text: '所有'
            }],
            selected: 1
        },
        title: {
            text: bpname + ' 节点每轮出块情况'
        },
        xAxis: {
            events : {
                afterSetExtremes : afterSetExtremes
            },
        },
        series: [{
            pointStart: pointStart,
            pointInterval: pointInterval,
            name: "平均值",
            tooltip: {
                valueDecimals: 1,
                valueSuffix: ''
            }
        }]
    });
    chart.showLoading('使出吃奶的劲加载中...');

    function afterSetExtremes(e) {
        if (!e.min) return;
        var min = Math.floor((e.min - pointStart) / pointInterval);
        var max = Math.floor((e.max - pointStart) / pointInterval);
        var fall = 0;
        var success = 0;
        for (var i = min; i < max; i++) {
            success += history_data[i];
            if (history_data[i] < 12) {
                fall += 12 - history_data[i]
            }
        }
        var percent = (1 - (fall / ((max - min) * 12))) * 100
        chart.setTitle(null, {text: 
            " 从 " + util.timetrans(e.min) + 
            " 至 " + util.timetrans(e.max) + 
            "，出块数量：" + success.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " 块" +
            "，丢块数量：" + fall.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " 块" + 
            " 出块率：" + percent.toFixed(3) + " %" +
            ""
        });
    }

    document.title = bpname + ' 节点详情 | FIBOS 导航';
    $(window).scrollTop(0)

    get_global(function(data){
      global = data.rows[0];
      $scope.global = global;
      main()
    })

    function main(){
        util.ajax({url: url.api.bp_info,data: {bpname: bpname}}, function(data){
            info = Object.assign(info, data);
            $scope.info = info;
            $scope.$apply();

            util.ajax({url: url.api.bp_history, data:{bpname: bpname}}, function (data){
              history_data = data.rows.slice(0, data.rows.length-1);
                console.log(history_data)
              if (!history_data.length) {
                chart.showLoading('暂无数据，请刷新页面重试');
                return
              }
              chart.series[0].setData(history_data);
              chart.hideLoading();
            }, function (){
                chart.showLoading('加载失败，请刷新页面重试');
            })

        }, function() {
            chart.showLoading('加载失败，请刷新页面重试');
        })

        util.ajax({url: url.rpc.get_account, type: "POST", data: JSON.stringify({account_name: bpname})}, function(data){
            info = Object.assign(info, data);
            $scope.info = info;
            $scope.$apply();
        }, function() {})

      get_producers(function(data) {
        totalVotessum = util.totalVotessum(data.rows);
        $scope.totalVotessum = totalVotessum;
          for (var i = 0; i < data.rows.length; i++) {
            if (data.rows[i]["owner"] == bpname) {
              info = Object.assign(info, data.rows[i]);
              info = Object.assign(info, {rank: i + 1});
              $scope.info = info;
              $scope.$apply();
            }
          }
       }, function(){})

        util.ajax({url: url.rpc.get_table_rows, data: 
            JSON.stringify({
                "json": "true",
            "code": "producerjson",
            "scope": "producerjson",
            "table": "producerjson",
            "limit": 1000
        }), type: "POST"}
        , function(data) {
            if (data.rows) {
                for (var i = 0; i < data.rows.length; i++) {
                    if (data.rows[i]["owner"] == bpname) {
                        var json = JSON.parse(data.rows[i]["json"]);
                    info = Object.assign(info, {json: json});
                    $scope.info = info;
                      $scope.$apply();
                    }
                }
            }
        }, function (){})
    }


    function get_global(success, error){
      util.ajax(
        {
          url: url.rpc.get_table_rows, 
          type: "POST", 
          data: JSON.stringify({
            code: "eosio",
          json: true,
          limit: 1,
          scope: "eosio",
          table: "global"
          })
        },
        function(data){
          success(data)
        }, 
      function(textStatus) {error(textStatus)}
      )
    }

    function get_producers(success, error) {
      util.ajax(
        {
          type: "post",
          url: url.rpc.get_table_rows,
          data: JSON.stringify({
                    "scope": "eosio",
                    "code":  "eosio",
                        "table": "producers",
                        "json":  "true",
                        "limit": 100,
                        "key_type": "float64",
                        "index_position": 2,
                }),
      }, 
      function(data){success(data)}, 
      function(textStatus) {error(textStatus)}
    )
    }


  });
