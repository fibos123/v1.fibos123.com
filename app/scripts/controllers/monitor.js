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

  	var bp_status_rows = {};
  	var st1;

  	get_bp_status();

	function get_bp_status() {
	  	$.getJSON('https://api.fibos123.com/bp_status', function(data) {
	  		$scope.bp_status = data;
	  		if (!bp_status_rows || JSON.stringify(bp_status_rows) != JSON.stringify(data.rows2)) {
	  			$scope.bp_status_rows = data.rows2;
	  			bp_status_rows = data.rows2;
	  		}
	  		$scope.$apply();
			st1 = setTimeout(function (){
				get_bp_status()
			}, 1000)
	  	});
	}

	$scope.$on("$destroy", function() {
		clearTimeout(st1);
	})

  });
