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

  	document.title = ' 节点监控 | FIBOS 导航';

  	var st1;
	var list = {};

	if (window.location.protocol === "https:") {
		window.location.href = "http:" + window.location.href.substring(window.location.protocol.length);
		return;
	}

  	main();
  	$scope.refresh = main;

	function main() {
		
	  	$.post('https://rpc-mainnet.fibos123.com/v1/chain/get_table_rows',
	  		JSON.stringify({
	  			"json": "true",
		  		"code": "producerjson",
		  		"scope": "producerjson",
		  		"table": "producerjson",
		  		"limit": 1000
		  	})
	  	, function(data) {
	  		list = {};
	  		for (var i = 0; i < data.rows.length; i++) {
	  			var json = JSON.parse(data.rows[i].json);
	  			var bpname = data.rows[i].owner;
	  			list[bpname] = {
	  				bpname: bpname,
	  				http: {
	  					status: "unset",
	  					msg: "unset",
	  					endpoint: "",
	  					number: 0,
	  					history: false,
	  					cors: true
	  				},
	  				https: {
	  					status: "unset",
	  					msg: "unset",
	  					endpoint: "",
	  					number: 0,
	  					history: false,
	  					cors: true
	  				},
	  				p2p: {
	  					status: "unset",
	  					msg: "unset",
	  					endpoint: "",
	  				}
	  			};

	  			for (var j = 0; j < json.nodes.length; j++) {
	  				// http
	  				check_http_or_https(bpname, json.nodes[j], "http", function (bpname, info) {
	  					if (info) {
	  						list[bpname]["http"] = Object.assign(list[bpname]["http"], info)
	  					}
	  				});
	  				// https
	  				check_http_or_https(bpname, json.nodes[j], "https", function (bpname, info) {
	  					if (info) {
	  						list[bpname]["https"] = Object.assign(list[bpname]["https"], info)
	  					}
	  				});
	  				// p2p
	  				check_p2p(bpname, json.nodes[j], function (bpname, info) {
	  					if (info) {
	  						list[bpname]["p2p"] = info;
	  					}
	  				});
	  			}
	  		}

	  		$scope.list = list;
	  		$scope.$apply();
	  		$('[data-toggle="tooltip"]').tooltip();
			// st1 = setTimeout(function (){
			// 	main();
			// }, 1000)
	  	});

		function check_http_or_https(bpname, bpinfo, type, callback) {
			var endpoint = "";
			if (type == "http") {
				endpoint = bpinfo.api_endpoint || bpinfo.rpc_endpoint;
			}
			if (type == "https") {
				endpoint = bpinfo.ssl_endpoint;
			}
			if (!endpoint) {
				return callback(bpname, false);
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
			callback(bpname, {status: "connecting",msg:"connecting",endpoint: endpoint,});
			get_info(bpname, endpoint + '/v1/chain/get_info', "GET", {},function(bpname, url, info) {
				if (info && info.head_block_num) {
					get_info(bpname, endpoint + '/v1/history/get_transaction', "POST", '{"id":"ba59b1eb11f49d9d7ef881e3055c0ec7956e9b7921605a3cc6d5172e3de54154"}',function(bpname, url, info) {
						if (info && info.id) {
							var info = list[bpname][type];
							info["history"] = true;
							return callback(bpname, info);
						}
					})
					return callback(bpname, {status: "ok", msg: "",number: info.head_block_num});
				} else {
					return callback(bpname, {status: "ng",msg: "offline"});
				}
			}, function(bpname, url, textStatus) {
				if (textStatus == "timeout") {
					return callback(bpname, {status: "ng",msg:"timeout"});
				} else {
				    var url = 'https://api.fibos123.com/json2jsonp?url=' + 
				    encodeURIComponent(url) + 
				    '&callback=?';
					get_info(bpname, url, "GET", {}, function(bpname, url, info) {
						if (info && info.head_block_num) {
						    var url = 'https://api.fibos123.com/json2jsonp?url=' + 
						    encodeURIComponent(endpoint + '/v1/history/get_transaction') + 
						    '&callback=?';
							get_info(bpname, url, "POST", '{"id":"ba59b1eb11f49d9d7ef881e3055c0ec7956e9b7921605a3cc6d5172e3de54154"}',function(bpname, url, info) {
								if (info && info.id) {
									var info = list[bpname][type];
									info["history"] = true;
									return callback(bpname, info);
								}
							})
							return callback(bpname, {status: "ok", msg: "",cors: false,number: info.head_block_num});
						} else {
							return callback(bpname, {status: "ng",msg: "offline"});
						}
					}, function (bpname, url, textStatus){
						return callback(bpname, {status: "ng",msg: "error"});
					})
				}
			});
		}

		function check_p2p(bpname, bpinfo, callback) {
			var endpoint = bpinfo.p2p_endpoint;
			if (!endpoint) {
				return callback(bpname, false);
			}
			var addr = endpoint.split(":");
			var host = addr[0];
			var port = addr[1];

			callback(bpname, {status: "connecting",msg:"connecting",endpoint: endpoint});
			get_p2p(bpname, host, port, function(bpname, host, port, info) {
				var status = info && info.msg;
				if (status && info.msg.indexOf("open") >= 0) {
					callback(bpname, {status: "ok",msg:"open",endpoint: endpoint});
				} else if (status && info.msg.indexOf("blocked") >= 0) {
					callback(bpname, {status: "ng",msg: "blocked",endpoint: endpoint});
				} else if (status && info.msg.indexOf("invalid") >= 0) {
					callback(bpname, {status: "ng",msg: "invalid",endpoint: endpoint});
				} else {
					callback(bpname, {status: "ng",msg: "timeout",endpoint: endpoint});
				}
			}, function(i){
				callback(bpname, {status: "ng",msg: "timeout",endpoint: endpoint});
			})
		}

	  	function get_info(bp, url, type, data, callback, errcallback) {
	  		$.ajax({
			    type: type,
			    // cache: false,
			    timeout: 5000,
			    url: url,
			    data: data,
			    dataType: "json",
			    success: function (data, textStatus){
			    	callback(bp, url, data);
			    },
			    error: function (XMLHttpRequest, textStatus, errorThrown){
			    	errcallback(bp, url, textStatus);
			    }
			})
	  	}

	  	function get_p2p(bp, host, port, callback, errcallback) {
		    var url = 'https://api.fibos123.com/json2jsonp?url=' + 
		    encodeURIComponent('https://networkappers.com/api/port.php?ip='+host+'&port='+port) + 
		    '&callback=?';
	  		$.ajax({
			    type: "GET",
			    cache: false,
			    timeout: 5000,
			    url: url,
			    data: {},
			    dataType: "json",
			    success: function (data, textStatus){
			    	callback(bp, host, port, data);
			    },
			    error: function (XMLHttpRequest, textStatus, errorThrown){
			    	errcallback(i, host, port, textStatus);
			    }
			})
	  	}
	}

	var si1 = setInterval(function (){
		$scope.$apply();
	  	$('[data-toggle="tooltip"]').tooltip();
	}, 100);

	$scope.$on("$destroy", function() {
		clearTimeout(st1);
		clearInterval(si1);
	})

  });
