'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:MonitorCtrl
 * @description
 * # MonitorCtrl
 * Controller of the appApp
 */
angular.module('appApp')
  .controller('MonitorCtrl', function ($scope) {

  	document.title = ' 节点监控 | FIBOS 导航';

  	get_bp_status()
  	bp_status_change_logs()

  	var bp_status_rows = {};
  	var bp_status_change_logs_rows = [];
  	var st1, st2;

	function get_bp_status() {
	  	$.getJSON('https://api.fibos123.com/bp_status', function(data) {
	  		$scope.bp_status = data;
	  		if (!bp_status_rows || JSON.stringify(bp_status_rows) != JSON.stringify(data.rows)) {
	  			$scope.bp_status_rows = data.rows;
	  			bp_status_rows = data.rows;
	  		}
	  		$scope.$apply();
			st1 = setTimeout(function (){
				get_bp_status()
			}, 1000)
	  	});
	}

	function bp_status_change_logs() {
	  	$.getJSON('https://api.fibos123.com/bp_status_change_logs', function(data) {
	  		$scope.bp_status_change_logs = data;
	  		if (!bp_status_change_logs_rows || bp_status_change_logs_rows.length != data.rows.length) {
	  			$scope.bp_status_change_logs_rows = data.rows;
	  			bp_status_change_logs_rows = data.rows;
	  		}
	  		$scope.$apply();
			st2 = setTimeout(function (){
				bp_status_change_logs()
			}, 1000)
	  	});
	}

	$scope.$on("$destroy", function() {
		clearTimeout(st1);
		clearTimeout(st2);
	})



  });
