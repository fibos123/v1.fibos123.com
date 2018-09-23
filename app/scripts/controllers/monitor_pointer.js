'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:MonitorPointerCtrl
 * @description
 * # MonitorPointerCtrl
 * Controller of the appApp
 */
angular.module('appApp')
  .controller('MonitorPointerCtrl', function ($scope) {

  	document.title = '节点监控 | FIBOS 导航';
  	$(window).scrollTop(0)

  	var api = 'https://api.fibos123.com';

	var items = [];
	var is_set = false;

	if (window.location.protocol === "https:") {
		window.location.href = "http:" + window.location.href.substring(window.location.protocol.length);
		return;
	}
  	main();
  	$scope.refresh = main;
  	$scope.url_api_check_p2p = url.api.check_p2p;

	function main() {
		
	  	util.ajax({url: url.rpc.get_table_rows, data: 
	  		JSON.stringify({
	  			"json": "true",
		  		"code": "producerjson",
		  		"scope": "producerjson",
		  		"table": "producerjson",
		  		"limit": 1000
		  	}), type: "POST"}
	  	, function(data) {
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
	  					number: 0,
	  					history: false,
	  					cors: true
	  				},
	  				https: {
	  					status: "un",
	  					msg: "unset",
	  					endpoint: "",
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
	  			bpname = index-1;

	  			for (var j = 0; j < json.nodes.length; j++) {
	  				// http
	  				check_http_or_https(bpname, json.nodes[j], "http", function (bpname, info) {
  						items[bpname]["http"] = Object.assign(items[bpname]["http"], info)
  						items[bpname]["score"] = count_score(items[bpname]);
  						is_set = true;
	  				});
	  				// https
	  				check_http_or_https(bpname, json.nodes[j], "https", function (bpname, info) {
  						items[bpname]["https"] = Object.assign(items[bpname]["https"], info)
  						items[bpname]["score"] = count_score(items[bpname]);
  						is_set = true;
	  				});
	  				// p2p
	  				check_p2p(bpname, json.nodes[j], function (bpname, info) {
  						items[bpname]["p2p"] = Object.assign(items[bpname]["p2p"], info)
  						items[bpname]["score"] = count_score(items[bpname]);
  						is_set = true;
	  				});
	  			}
	  		}

	  	}, function(){});

	}

	function set() {
  		$scope.items = util.copy(items).sort(util.compare_reverse("score"));
		$scope.$apply();
		$(".tooltip").remove();
	  	$('[data-toggle="tooltip"]').tooltip();
	}

	var si1 = setInterval(function (){
  		if (is_set) {
			is_set = false;
  			set()
  		}
	}, 200);

	$scope.$on("$destroy", function() {
		clearInterval(si1);
	})

	function count_score(info){
		var score = 0;
		score += (info.http.endpoint) ? 1 : 0;
		score += (info.http.status === 'ok') ? 2 : 0;
		score += (info.http.status === 'ok' && info.http.cors === true) ? 1 : 0;
		score += (info.http.history === true) ? 1 : 0;

		score += (info.https.endpoint) ? 1 : 0;
		score += (info.https.status === 'ok') ? 2 : 0;
		score += (info.https.status === 'ok' && info.https.cors === true) ? 1 : 0;
		score += (info.https.history === true) ? 1 : 0;

		score += (info.p2p.endpoint) ? 1 : 0;
		score += (info.p2p.status === 'ok') ? 3 : 0;
		return score;
	}

	function check_http_or_https(bpname, bpinfo, type, callback) {
		var endpoint = "";
		if (type == "http") {
			endpoint = bpinfo.api_endpoint || bpinfo.rpc_endpoint;
		}
		if (type == "https") {
			endpoint = bpinfo.ssl_endpoint;
		}
		if (!endpoint) {
			return;
		}
		if (type === "http") {
			if (endpoint.indexOf("http://") !== 0) {
				return callback(bpname, {status: "ng",msg: "not http",endpoint: endpoint});
			}
		}
		if (type === "https") {
			if (endpoint.indexOf("https://") !== 0) {
				return callback(bpname, {status: "ng",msg: "not https",endpoint: endpoint});
			}
		}
		callback(bpname, {status: "ing",msg:"connecting",endpoint: endpoint});
		var url_get_info = endpoint + '/v1/chain/get_info';
		var url_get_transaction = endpoint + '/v1/history/get_transaction';
		// get_info
		util.ajax({url: url_get_info}, function(info) {
			if (info && info.head_block_num) {
				// history
				util.ajax({url: url_get_transaction, type: "POST", data: '{"id":"ba59b1eb11f49d9d7ef881e3055c0ec7956e9b7921605a3cc6d5172e3de54154"}'},function(info) {
					if (info && info.id) {
						return callback(bpname, {history: true});
					}
				}, function(){})
				return callback(bpname, {status: "ok", msg: "",number: info.head_block_num});
			} else {
				return callback(bpname, {status: "ng",msg: "offline"});
			}
		}, function(textStatus) {
			if (textStatus == "timeout") {
				return callback(bpname, {status: "ng",msg:"timeout"});
			} else {
				// cors
				util.ajax({url: url.api.json2jsonp, data: {url: url_get_info}, dataType: "jsonp"}, function(info) {
					if (info && info.head_block_num) {
						return callback(bpname, {status: "ok", msg: "",cors: false,number: info.head_block_num});
					} else {
						return callback(bpname, {status: "ng",msg: "offline"});
					}
				}, function (textStatus){
					return callback(bpname, {status: "ng",msg: "error"});
				})
			}
		});
	}

	function check_p2p(bpname, bpinfo, callback) {
		var endpoint = bpinfo.p2p_endpoint;
		if (!endpoint) {
			return;
		}
		endpoint = endpoint.replace("http://", "");
		var addr = endpoint.split(":");
		var host = addr[0];
		var port = addr[1];

		callback(bpname, {status: "ing",msg:"connecting",endpoint: endpoint});
		util.ajax({url: url.api.check_p2p, data: {host: host, port:port}}, function(data) {
			var status = data && data.rows && data.rows.length;
			if (!status) {
				return callback(bpname, {status: "un",msg: "unknown",detecting: false});
			}

			var rows = data.rows;
			var msg = "";
			var ok_num = 0;
			var length = 1; // rows.length

			for (var i = 0; i < length; i++) {
				if (rows[i].indexOf("connect ") >= 0 || rows[i].indexOf("connection ") >= 0) {
					ok_num++;
				}
				var _msg = rows[i].split(port)[1].substr(1).replace(/\s+/g,"")
				if (_msg) {
					msg = rows[i].split(port)[1].substr(1);
				}
			}

			if (ok_num == length) {
				return callback(bpname, {status: "ok",msg:"connect"});
			} else {
				return callback(bpname, {status: "ng",msg:msg});
			}
		}, function(textStatus){
			if (textStatus == "timeout") {
				callback(bpname, {status: "un",msg:"timeout"});
			} else {
				callback(bpname, {status: "un",msg: "unknown"});
			}
		})
	}

  });
