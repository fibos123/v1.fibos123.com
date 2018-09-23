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
    	}, function() {})

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
              info = Object.assign(info, {rank: i});
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
