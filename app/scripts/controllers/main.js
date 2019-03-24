'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the appApp
 */
angular.module('appApp')
  .controller('MainCtrl', function ($scope) {

    document.title = 'FIBOS 导航';
    $(window).scrollTop(0)

    // util.ajax({ url: 'fibos123comc/sites.json' }
    //   , function (data) {
    //     $scope.data = data
    //     $scope.$apply();
    //   }, function () { })

    util.ajax({url: url.rpc.get_table_rows, data:
    	JSON.stringify({
    		"json": "true",
    		"code": "fibos123comc",
    		"scope": "fibos123comc",
    		"table": "jsons",
    		"limit": 1,
    		"lower_bound": "sites",
    	}), type: "POST"}
    , function(data) {
    	if (data && data.rows && data.rows[0] && data.rows[0].text) {
    		var websites = data.rows[0].text;
    		$scope.data = JSON.parse(websites);
    		$scope.$apply();
    	}
    }, function (){})

  });
