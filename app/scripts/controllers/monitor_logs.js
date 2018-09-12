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

  	var bp_status_change_logs_rows = [];
  	var st1;
  	var is_all = false;

  	bp_status_change_logs();

  	$scope.refresh = bp_status_change_logs;
  	$scope.is_all = is_all;

  	$scope.show_all = function (){
  		$scope.is_all = true;
  	}

	function bp_status_change_logs() {
		bp_status_change_logs_rows = {};
	  	$.getJSON('https://api.fibos123.com/bp_status_change_logs', function(data) {
	  		$scope.bp_status_change_logs = data;
	  		if (!bp_status_change_logs_rows || bp_status_change_logs_rows.length != data.rows.length) {
	  			$scope.bp_status_change_logs_rows = data.rows;
	  			bp_status_change_logs_rows = data.rows;
	  		}
	  		$scope.$apply();
			// st1 = setTimeout(function (){
			// 	bp_status_change_logs()
			// }, 1000)
	  	});
	}

	$scope.$on("$destroy", function() {
		clearTimeout(st1);
	})

  });
