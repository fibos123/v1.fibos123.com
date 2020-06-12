'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:BpCtrl
 * @description
 * # BpCtrl
 * Controller of the appApp
 */
angular.module('appApp')
  .controller('BpCtrl', function ($scope) {

    document.title = '节点列表 | FIBOS 导航';
    $(window).scrollTop(0)

    if (window.location.protocol === "https:") {
      window.location.href = "http:" + window.location.href.substring(window.location.protocol.length);
      return;
    }

    var items = [];
    var is_set = false;
    var global = {}; // 计算收益
    var info = {}; // 最新区块
    var totalVotessum = 0;
    var st1;
    var bpname2i = {};

    // $scope.bp_honor = util.copy(bp_honor);
    $scope.bp_honor = {};
    $scope.refresh = main;

    main();
    get_info();

    function main() {
      bpname2i = {};
      // $scope.bp_honor = util.copy(bp_honor);
      get_global(function (data) {
        global = data.rows[0];
        get_producers(function (data) {
          items = data.rows;
          totalVotessum = util.totalVotessum(data.rows);
          for (var i = 0; i < items.length; i++) {
            var bp = items[i];
            items[i]["rank"] = i + 1;
            items[i]["history"] = {};
            items[i]["history"]["weekpercent"] = 0;
            items[i]["staked"] = util.getStaked(bp.total_votes)
            items[i]["weight_percent"] = util.weightPercent(bp.total_votes, totalVotessum)
            var getClaimRewards = util.getClaimRewards(bp, global, items[i]["rank"]);
            items[i]["claim_rewards_total"] = getClaimRewards.total;
            items[i]["claim_rewards_unreceived"] = getClaimRewards.unreceived;
            items[i]["http"] = {
              status: "un",
              msg: "unset",
              endpoint: "",
              version: "",
              number: 0,
              history: false,
              cors: true
            };

            items[i]["https"] = {
              status: "un",
              msg: "unset",
              endpoint: "",
              version: "",
              number: 0,
              history: false,
              cors: true
            };
            items[i]["p2p"] = {
              status: "un",
              msg: "unset",
              endpoint: "",
              detecting: true
            };


            bpname2i[bp["owner"]] = i;
          }
          is_set = true;
          get_producerjson();
        }, function () { })
      })
    }

    function get_info() {
      util.ajax({ url: url.rpc.get_info }, function (data) {
        info = data;
        $scope.info = info;
        setTimeout(function () {
          $(".progress-bar").width("100%");
        }, 1);
        $scope.$apply();
        clearTimeout(st1);
        st1 = setTimeout(function () {
          get_info()
        }, 1000)
      }, function () { })
    }


    function set() {
      $scope.items = items;
      $scope.$apply();
      // $(".tooltip").remove();
      $('[data-toggle="tooltip"]').tooltip();
    }

    var si1 = setInterval(function () {
      if (is_set) {
        is_set = false;
        set()
      }
    }, 200);

    $scope.$on("$destroy", function () {
      clearInterval(si1);
      clearTimeout(st1);
    })

    function get_global(success, error) {
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
        function (data) {
          success(data)
        },
        function (textStatus) { error(textStatus) }
      )
    }

    function get_producers(success, error) {
      util.ajax(
        {
          type: "post",
          url: url.rpc.get_table_rows,
          data: JSON.stringify({
            "scope": "eosio",
            "code": "eosio",
            "table": "producers",
            "json": "true",
            "limit": 100,
            "key_type": "float64",
            "index_position": 2,
          }),
        },
        function (data) { success(data) },
        function (textStatus) { error(textStatus) }
      )
    }

    function get_bp_info(i, bpname, success, error) {
      util.ajax(
        {
          url: url.api.bp_info,
          data: { bpname: bpname },
        },
        function (data) { success(i, bpname, data) },
        function (textStatus) { error(textStatus) }
      )
    }

    function get_producerjson() {
      util.ajax({
        url: url.rpc.get_table_rows, data:
          JSON.stringify({
            "json": "true",
            "code": "producerjson",
            "scope": "producerjson",
            "table": "producerjson",
            "limit": 1000
          }), type: "POST"
      }
        , function (data) {
          for (var i = 0; i < data.rows.length; i++) {
            var json = JSON.parse(data.rows[i].json);
            var bpname = data.rows[i].owner;

            if ("undefined" === typeof $scope.bp_honor[bpname]) {
            	$scope.bp_honor[bpname] = [];
            }
            // $scope.bp_honor[bpname].push("已设置 JSON");

            if ("undefined" !== typeof bpname2i[bpname]) {
              items[bpname2i[bpname]] = Object.assign(items[bpname2i[bpname]], { json: json });
              if (json.nodes) {
                for (var j = 0; j < json.nodes.length; j++) {
                  util.check_http_or_https(bpname, json.nodes[j], "http", function (bpname, info) {
                    if (info.status == "ok") {
                      $scope.bp_honor[bpname].push("HTTP 接入点可用");
                      is_set = true;
                    }
                    items[bpname2i[bpname]]["http"] = Object.assign(items[bpname2i[bpname]]["http"], info)
                  });
                  util.check_http_or_https(bpname, json.nodes[j], "https", function (bpname, info) {
                    if (info.status == "ok") {
                      $scope.bp_honor[bpname].push("HTTPS 接入点可用");
                      is_set = true;
                    }
                    items[bpname2i[bpname]]["https"] = Object.assign(items[bpname2i[bpname]]["https"], info)
                  });
                  util.check_p2p(bpname, json.nodes[j], function (bpname, info) {
                    if (info.status == "ok") {
                      $scope.bp_honor[bpname].push("P2P 接入点可用");
                      is_set = true;
                    }
                    items[bpname2i[bpname]]["p2p"] = Object.assign(items[bpname2i[bpname]]["p2p"], info)
                  });
                }
              }
            }
          }
          is_set = true;
        }, function () { });

    }

  });
