'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:MonitorPointerCtrl
 * @description
 * # MonitorPointerCtrl
 * Controller of the appApp
 */
angular.module('appApp')
	.controller('MonitorPointerCtrl', function ($scope, layer) {

		document.title = '节点监控 | FIBOS 导航';
		$(window).scrollTop(0)

		if (window.location.protocol === "https:") {
			window.location.href = "http:" + window.location.href.substring(window.location.protocol.length);
			return;
		}
		var items = [];
		var is_set = false;
		var httpArr = [];
		var httpsArr = [];
		var p2pArr = [];
		var info = {};

		main();

		$scope.simple = false;
		$scope.changeSimple = function () {
			$scope.simple = !$scope.simple;
			setTimeout(function () {
				$(".tooltip").remove();
				$('[data-toggle="tooltip"]').tooltip();
			}, 500)
		}

		$scope.refresh = main;
		$scope.url_api_check_p2p = url.api.check_p2p;
		$scope.openLayer = function () {
			layer.open({
				type: 1,
				title: '可用接入点列表',
				area: ['', '420px'],
				content: '<div style="padding: 20px"><pre><code>{{ urls | json}}</code></pre></div>',
				scope: $scope
			});
		}
		function main() {
			httpArr = [];
			httpsArr = [];
			p2pArr = [];

			util.ajax({ url: url.rpc.get_info }, function (data) {
				info = data;
				$scope.info = info;
			}, function () { })

			util.ajax({
				url: url.rpc.get_table_rows, data:
					JSON.stringify({
						"json": "true",
						"code": "producerjson",
						"scope": "producerjson",
						"table": "producerjson",
						"limit": 1000
					}), type: "POST"
			}
				, function (data) {
					items = [];
					for (var i = 0; i < data.rows.length; i++) {
						var json = JSON.parse(data.rows[i].json);
						var bpname = data.rows[i].owner;
						var index = items.push({
							bpname: bpname,
							producerjson: json,
							score: 0,
							http: {
								status: "un",
								msg: "unset",
								endpoint: "",
								version: "",
								number: 0,
								history: false,
								cors: true
							},
							https: {
								status: "un",
								msg: "unset",
								endpoint: "",
								version: "",
								number: 0,
								history: false,
								cors: true
							},
							p2p: {
								status: "un",
								msg: "unset",
								endpoint: "",
								detecting: true
							}
						});
						bpname = index - 1;
						if (json.nodes) {
							for (var j = 0; j < json.nodes.length; j++) {
								// http
								util.check_http_or_https(bpname, json.nodes[j], "http", function (bpname, info) {
									items[bpname]["http"] = Object.assign(items[bpname]["http"], info)
									items[bpname]["score"] = count_score(items[bpname]);
									is_set = true;
								});
								// https
								util.check_http_or_https(bpname, json.nodes[j], "https", function (bpname, info) {
									items[bpname]["https"] = Object.assign(items[bpname]["https"], info)
									items[bpname]["score"] = count_score(items[bpname]);
									is_set = true;
								});
								// p2p
								util.check_p2p(bpname, json.nodes[j], function (bpname, info) {
									items[bpname]["p2p"] = Object.assign(items[bpname]["p2p"], info)
									items[bpname]["score"] = count_score(items[bpname]);
									is_set = true;
								});
							}
						}
					}
				}, function () { });

		}

		function set() {
			$scope.items = util.copy(items).sort(util.compare_reverse("score"));
			$scope.urls = {
				"p2p-peer-address": util.unique(p2pArr),
				"http-api-address": util.unique(httpArr),
				"https-api-address": util.unique(httpsArr)
			}
			$scope.$apply();
			$(".tooltip").remove();
			$('[data-toggle="tooltip"]').tooltip();
		}

		var si1 = setInterval(function () {
			if (is_set) {
				is_set = false;
				set()
			}
		}, 200);

		$scope.$on("$destroy", function () {
			clearInterval(si1);
		})

		function count_score(bp) {

			var http_score = 0;
			var https_score = 0;
			var p2p_score = 0;

			http_score += (bp.http.endpoint) ? 1 : 0;
			http_score += (bp.http.status === 'ok') ? 1 : 0;
			http_score += (bp.http.version >= info.server_version_string) ? 1 : 0;
			http_score += (bp.http.status === 'ok' && bp.http.cors === true) ? 1 : 0;
			http_score += (bp.http.history === true) ? 0.5 : 0;
			http_score += (bp.http.number > info.last_irreversible_block_num) ? 1 : 0;

			https_score += (bp.https.endpoint) ? 1 : 0;
			https_score += (bp.https.status === 'ok') ? 1 : 0;
			https_score += (bp.https.version >= info.server_version_string) ? 1 : 0;
			https_score += (bp.https.status === 'ok' && bp.https.cors === true) ? 1 : 0;
			https_score += (bp.https.history === true) ? 0.5 : 0;
			https_score += (bp.https.number > info.last_irreversible_block_num) ? 1 : 0;

			p2p_score += (bp.p2p.endpoint) ? 1 : 0;
			p2p_score += (bp.p2p.status === 'ok') ? 3 : 0;

			if (bp.http.version >= info.server_version_string) {
				if (http_score >= 5) {
					httpArr.push(bp.http.endpoint)
				}
				if (https_score >= 5) {
					httpsArr.push(bp.https.endpoint)
				}
				if (p2p_score == 4) {
					p2pArr.push(bp.p2p.endpoint)
				}
			}

			return http_score + https_score + p2p_score;
		}


	});
