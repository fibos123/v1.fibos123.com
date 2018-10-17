'use strict';

/**
 * @ngdoc overview
 * @name appApp
 * @description
 * # appApp
 *
 * Main module of the application.
 */
angular
  .module('appApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ng-layer'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
      })
      .when('/bp', {
        templateUrl: 'views/bp.html',
        controller: 'BpCtrl',
      })
      .when('/bp/:bpname', {
        templateUrl: 'views/bp_detail.html',
        controller: 'BpdetailCtrl',
      })
      .when('/monitor', {
        templateUrl: 'views/monitor.html',
        controller: 'MonitorCtrl',
      })
      .when('/monitor/pointer', {
        templateUrl: 'views/monitor_pointer.html',
        controller: 'MonitorPointerCtrl',
      })
      .when('/monitor/logs', {
        templateUrl: 'views/monitor_logs.html',
        controller: 'MonitorLogsCtrl',
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
      })
      .otherwise({
        redirectTo: '/'
      });
  });
