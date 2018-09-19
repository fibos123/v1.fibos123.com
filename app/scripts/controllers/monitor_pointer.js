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

	var list = [];
	var is_set = false;

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
	  		list = [];
	  		for (var i = 0; i < data.rows.length; i++) {
	  			var json = JSON.parse(data.rows[i].json);
	  			var bpname = data.rows[i].owner;
	  			var index = list.push({
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
  						list[bpname]["http"] = Object.assign(list[bpname]["http"], info)
  						list[bpname]["score"] = count_score(list[bpname]);
  						is_set = true;
	  				});
	  				// https
	  				check_http_or_https(bpname, json.nodes[j], "https", function (bpname, info) {
  						list[bpname]["https"] = Object.assign(list[bpname]["https"], info)
  						list[bpname]["score"] = count_score(list[bpname]);
  						is_set = true;
	  				});
	  				// p2p
	  				check_p2p(bpname, json.nodes[j], function (bpname, info) {
  						list[bpname]["p2p"] = Object.assign(list[bpname]["p2p"], info)
  						list[bpname]["score"] = count_score(list[bpname]);
  						is_set = true;
	  				});
	  			}
	  		}

	  	});

	}

	function set() {
		is_set = false;
		var _list = copy(list);
		_list = _list.sort(compare_sort("bpname"));
		_list = _list.sort(compare_reverse("score"));
  		$scope.list = _list;
		$scope.$apply();
		$(".tooltip").remove();
	  	$('[data-toggle="tooltip"]').tooltip();
	}

	var si1 = setInterval(function (){
  		if (is_set) {
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
		callback(bpname, {status: "ing",msg:"connecting",endpoint: endpoint,});
		get_info(bpname, endpoint + '/v1/chain/get_info', "GET", {},function(bpname, url, info) {
			if (info && info.head_block_num) {
				get_info(bpname, endpoint + '/v1/history/get_transaction', "POST", '{"id":"ba59b1eb11f49d9d7ef881e3055c0ec7956e9b7921605a3cc6d5172e3de54154"}',function(bpname, url, info) {
					if (info && info.id) {
						var info = list[bpname][type];
						info["history"] = true;
						return callback(bpname, info);
					}
				}, function(){})
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
								return callback(bpname, {history: true});
							}
						}, function(){})
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
			return;
		}
		endpoint = endpoint.replace("http://", "");
		var addr = endpoint.split(":");
		var host = addr[0];
		var port = addr[1];

		callback(bpname, {status: "ing",msg:"connecting",endpoint: endpoint});
		get_p2p(bpname, host, port, function(bpname, host, port, data) {
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
		}, function(bpname, host, port, textStatus){
			if (textStatus == "timeout") {
				callback(bpname, {status: "un",msg:"timeout"});
			} else {
				callback(bpname, {status: "un",msg: "unknown"});
			}
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
     	    tryCount : 0,
			retryLimit : 3,
		    success: function (data, textStatus){
		    	callback(bp, url, data);
		    },
		    error: function (XMLHttpRequest, textStatus, errorThrown){
	       	    if (textStatus == 'timeout') {
				    this.tryCount++;
				    if (this.tryCount <= this.retryLimit) {
				        $.ajax(this);
				        return;
				    }
				}
		    	errcallback(bp, url, textStatus);
		    }
		})
  	}

  	function get_p2p(bp, host, port, callback, errcallback) {
	    // var url = 'http://localhost:3000/check_p2p?host='+host+'&port='+port;
	    var url = 'https://rpc-mainnet.fibos123.com/check_p2p?host='+host+'&port='+port;
  		$.ajax({
		    type: "GET",
		    cache: false,
		    timeout: 5000,
		    url: url,
		    data: {},
		    dataType: "json",
     	    tryCount : 0,
			retryLimit : 3,
		    success: function (data, textStatus){
		    	callback(bp, host, port, data);
		    },
		    error: function (XMLHttpRequest, textStatus, errorThrown){
	       	    if (textStatus == 'timeout') {
				    this.tryCount++;
				    if (this.tryCount <= this.retryLimit) {
				        $.ajax(this);
				        return;
				    }
				}

		    	errcallback(bp, host, port, textStatus);
		    }
		})
  	}

	// 对象排序 顺序
	function compare_sort(pro) { 
	    return function (obj1, obj2) { 
	        var val1 = obj1[pro]; 
	        var val2 = obj2[pro]; 
	        if (val1 < val2 ) { //正序
	            return -1; 
	        } else if (val1 > val2 ) { 
	            return 1; 
	        } else { 
	            return 0; 
	        } 
	    } 
	} 
	// 对象排序 倒序
	function compare_reverse(pro) { 
	    return function (obj1, obj2) { 
	        var val1 = obj1[pro]; 
	        var val2 = obj2[pro]; 
	        if (val1 < val2 ) { //正序
	            return 1; 
	        } else if (val1 > val2 ) { 
	            return -1; 
	        } else { 
	            return 0; 
	        } 
	    } 
	} 

	// 复制对象
	function copy( obj ){
	    return JSON.parse( JSON.stringify( obj ) );
	}



  });
