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
  	$(window).scrollTop(0)

  	var st1;

  	main();

	function main() {
	  	util.ajax({url: url.api.bp_status}, function(data) {
	  		$scope.data = data;
	  		$scope.items = data.rows2;
	  		$scope.$apply();
			st1 = setTimeout(function (){
				main()
			}, 1000)
	  	}, function(){});
	}

	$scope.$on("$destroy", function() {
		clearTimeout(st1);
	})

  });
