'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the appApp
 */
angular.module('appApp')
  .controller('AboutCtrl', function ($scope) {

  	document.title = 'BP 候选人 | FIBOS 导航';

  	$("body").addClass("full-bg");
  	$(".navbar").addClass("navbar-dark").removeClass("navbar-light");

	$scope.$on("$destroy", function() {
		$("body").removeClass("full-bg");
  		$(".navbar").addClass("navbar-light").removeClass("navbar-dark");
	})


  });
