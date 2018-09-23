'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:MonitorLogsCtrl
 * @description
 * # MonitorLogsCtrl
 * Controller of the appApp
 */
angular.module('appApp')
  .controller('MonitorLogsCtrl', function ($scope) {

  	document.title = ' 节点监控 | FIBOS 导航';
    $(window).scrollTop(0)

  	var bp_status_change_logs_rows = [];
  	var st1;
  	var is_all = false;

  	main();

  	$scope.refresh = main;
  	$scope.is_all = is_all;

  	$scope.show_all = function (){
  		$scope.is_all = true;
  	}

	function main() {
		bp_status_change_logs_rows = {};
	  	util.ajax({url: url.api.bp_status_change_logs}, function(data) {
	  		$scope.data = data;
	  		$scope.items = data.rows;
	  		$scope.$apply();
	  	}, function (){});
	}

	$scope.$on("$destroy", function() {
		clearTimeout(st1);
	})

  });
