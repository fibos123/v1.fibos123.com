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

		// url.rpc.get_table_rows = "http://127.0.0.1:8888/v1/chain/get_table_rows"
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

	// AOS.init({
	//   startEvent: 'aosEvent',
	//   // disable: 'mobile',
	//   once: true,
	//   offset: 60
	// });
	// document.dispatchEvent(new Event('aosEvent'));

	var eos2fo, fo2eos;
	var i = 0;

	getExchangeInfo();

	var si1 = setInterval(function () {
		if (eos2fo) {
		    if (i % 2 === 0) {
				document.title = eos2fo + ' FO / EOS | FIBOS 导航';
		    } else {
				document.title = fo2eos.toFixed(6) + ' EOS / FO | FIBOS 导航';
		    }
		    i++;
	    }
	}, 3 * 1000);

	$scope.$on("$destroy", function() {
		clearInterval(si1);
	})

	function getExchangeInfo() {
	  util.ajax({url: url.api.json2jsonp, dataType: "jsonp", data:{url: 'https://fibos.io/getExchangeInfo'}}, function (data){
	    eos2fo = data.price;
	    fo2eos = 1 / data.price;
	    setTimeout(getExchangeInfo, 5000);
	  }, function(){})
	}

  });
