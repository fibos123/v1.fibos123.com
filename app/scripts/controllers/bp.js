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

  	var items = [];
	var is_set = false;
	var global = {}; // 计算收益
	var info = {}; // 最新区块
	var totalVotessum = 0;
  	var st1;
  	var bpname2i = {};
  	var s = 0;
  	var last_producer = '';

  	$scope.refresh = main;
  	$scope.getStaked = util.getStaked;
  	$scope.totalVotessum = util.totalVotessum;
  	$scope.weightPercent = util.weightPercent;
  	$scope.getClaimRewards = util.getClaimRewards;

  	get_global(function(data){
  		global = data.rows[0];
		$scope.global = global;
  		get_info();
  		main();
  	})

  	function get_info () {
  		util.ajax({url: url.rpc.get_info}, function(data){
	  		info = data;
			$scope.info = info;

			s++;

			if (last_producer != info["head_block_producer"]) {
				last_producer = info["head_block_producer"];
				s = 0;
				setTimeout(function(){
					s++;
					$scope.s = s;
					$scope.$apply();
				}, 1);
			}

			$scope.s = s;

			if ("undefined" !== typeof bpname2i[info["head_block_producer"]]) {
	  			get_bp_info(bpname2i[info["head_block_producer"]], info["head_block_producer"], function(i, bpname, info){
	  				items[i] = Object.assign(items[i], info);
					is_set = true;
	  			}, function(){})
  			}

			$scope.$apply();
			st1 = setTimeout(function (){
				get_info()
			}, 1000)
  		}, function(){})
  	}

  	function main(){
	  	get_producers(function(data) {
	  		items = data.rows;
			totalVotessum = util.totalVotessum(data.rows);
			$scope.totalVotessum = totalVotessum;
	  		for (var i = 0; i < items.length; i++) {
	  			var bp = items[i];
	  			items[i]["rank"] = i;
	  			bpname2i[bp["owner"]] = i;
	  			get_bp_info(i, bp["owner"], function(i, bpname, info){
	  				items[i] = Object.assign(items[i], info);
	  				items[i] = Object.assign(items[i], {bp_info: true});
					is_set = true;
	  			}, function(){})
	  		}
			is_set = true;
	  	}, function(){})
  	}

	function set() {
  		$scope.items = items;
		$scope.$apply();
		$(".tooltip").remove();
	  	$('[data-toggle="tooltip"]').tooltip();
	}

	var si1 = setInterval(function (){
  		if (is_set) {
  			is_set = false;
  			set()
  		}
	}, 200);

	$scope.$on("$destroy", function() {
		clearInterval(si1);
		clearTimeout(st1);
	})

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

  	function get_bp_info(i, bpname, success, error) {
  		util.ajax(
	  		{
			    url: url.api.bp_info,
			    data: {bpname: bpname},
			}, 
			function(data){success(i, bpname, data)}, 
			function(textStatus) {error(textStatus)}
		)
  	}

  });
