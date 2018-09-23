'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:HeaderCtrl
 * @description
 * # HeaderCtrl
 * Controller of the appApp
 */
angular.module('appApp')
  .controller('HeaderCtrl', function ($scope, $location) {

    $scope.isActive = function (viewLocation) { 
        return viewLocation === $location.path().slice(1).split("/")[0];
    };

    $scope.menuItems = [
      {
        name: '网站',
        icon: 'fas fa-map-signs',
        url:  ''
      },
      {
        name: '节点列表',
        icon: 'fas fa-server',
        url:  'bp'
      },
      {
        name: '节点监控',
        icon: 'fab fa-connectdevelop',
        url:  'monitor'
      }
    ];

    // $scope.$apply();

  });
