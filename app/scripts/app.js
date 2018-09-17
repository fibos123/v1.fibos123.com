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
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/monitor', {
        templateUrl: 'views/monitor.html',
        controller: 'MonitorCtrl',
        controllerAs: 'monitor'
      })
      .when('/monitor/pointer', {
        templateUrl: 'views/monitor_pointer.html',
        controller: 'MonitorPointerCtrl',
        controllerAs: 'monitorpointer'
      })
      .when('/monitor/logs', {
        templateUrl: 'views/monitor_logs.html',
        controller: 'MonitorLogsCtrl',
        controllerAs: 'monitorlogs'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
