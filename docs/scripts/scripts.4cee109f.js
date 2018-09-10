"use strict";angular.module("appApp",["ngAnimate","ngCookies","ngResource","ngRoute","ngSanitize","ngTouch"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl",controllerAs:"main"}).when("/monitor",{templateUrl:"views/monitor.html",controller:"MonitorCtrl",controllerAs:"monitor"}).otherwise({redirectTo:"/"})}]),angular.module("appApp").controller("HeaderCtrl",["$scope","$location",function(a,b){a.isActive=function(a){return a===b.path().slice(1)},a.menuItems=[{name:"网站",icon:"fas fa-map-signs",url:""},{name:"节点监控",icon:"fab fa-connectdevelop",url:"monitor"}]}]),angular.module("appApp").controller("MainCtrl",["$scope",function(a){function b(){var a="https://api.fibos123.com/json2jsonp?url="+encodeURIComponent("https://fibos.io/getExchangeInfo?rand="+Math.random())+"&callback=?";$.getJSON(a,function(a){c=a.price,d=1/a.price,setTimeout(b,5e3)})}document.title="FIBOS 导航",$.getJSON("data.json?rand="+Math.random(),function(b){a.data=b,a.$apply(),AOS.init({startEvent:"aosEvent",disable:"mobile",once:!0,offset:60}),document.dispatchEvent(new Event("aosEvent"))});var c,d,e=0;b();var f=setInterval(function(){c&&(e%2===0?document.title=c+" FO / EOS | FIBOS 导航":document.title=d.toFixed(6)+" EOS / FO | FIBOS 导航",e++)},3e3);a.$on("$destroy",function(){clearInterval(f)})}]),angular.module("appApp").controller("MonitorCtrl",["$scope",function(a){function b(){$.getJSON("https://api.fibos123.com/bp_status",function(c){a.bp_status=c,h&&JSON.stringify(h)==JSON.stringify(c.rows2)||(a.bp_status_rows=c.rows2,h=c.rows2),a.$apply(),e=setTimeout(function(){b()},1e3)})}function c(){$.getJSON("https://api.fibos123.com/bp_status_change_logs",function(b){a.bp_status_change_logs=b,i&&i.length==b.rows.length||(a.bp_status_change_logs_rows=b.rows,i=b.rows),a.$apply(),f=setTimeout(function(){c()},1e3)})}function d(){function b(a,b,c,d){$.ajax({type:"GET",timeout:1e3,url:b,data:{},dataType:"json",success:function(d,e){c(a,b,d)},error:function(c,e,f){d(a,b,e)}})}function c(a,b,c,d,e){var f="https://api.fibos123.com/json2jsonp?url="+encodeURIComponent("https://networkappers.com/api/port.php?ip="+b+"&port="+c)+"&callback=?";$.ajax({type:"GET",timeout:2e3,url:f,data:{},dataType:"json",success:function(e,f){d(a,b,c,e)},error:function(d,f,g){e(a,b,c,f)}})}$.post("https://rpc-mainnet.fibos123.com/v1/chain/get_table_rows",JSON.stringify({json:"true",code:"producerjson",scope:"producerjson",table:"producerjson",limit:1e3}),function(e){for(var f={},h=0;h<e.rows.length;h++){var i=JSON.parse(e.rows[h].json);f[h]={owner:e.rows[h].owner,http_status:"unset",http_number:"",https_status:"unset",https_number:"",p2p_status:"unset"},j[h]||(j[h]={owner:e.rows[h].owner,http_status:"unset",http_number:"",http_msg:"",https_status:"unset",https_number:"",https_msg:"",p2p_status:"unset"});for(var k=0;k<i.nodes.length;k++){var l=i.nodes[k].api_endpoint||i.nodes[k].rpc_endpoint;l&&(j[h].http_status&&(f[h].http_status=j[h].http_status,f[h].http_number=j[h].http_number,f[h].http_msg=j[h].http_msg),0===l.indexOf("http://")?b(h,l+"/v1/chain/get_info",function(a,b,c){c.head_block_num?(f[a].http_status=j[a].http_status="online",f[a].http_number=j[a].http_number=c.head_block_num):f[a].http_status=j[a].http_status="offline"},function(a,c,d){if("timeout"==d)f[a].http_status=j[a].http_status="timeout";else{var c="https://api.fibos123.com/json2jsonp?url="+encodeURIComponent(c)+"&callback=?";b(a,c,function(a,b,c){c.head_block_num?(f[a].http_status=j[a].http_status="warning",f[a].http_number=j[a].http_number=c.head_block_num):f[a].http_status=j[a].http_status="offline"},function(a,b,c){f[a].http_status=j[a].http_status="error",f[a].http_msg=j[a].http_msg="error"})}}):(f[h].http_status=j[h].http_status="error",f[h].http_msg=j[h].http_msg="not http"),f[h].http_endpoint=j[h].http_endpoint=l);var m=i.nodes[k].ssl_endpoint;m&&(j[h].https_status&&(f[h].https_status=j[h].https_status,f[h].https_number=j[h].https_number),0===m.indexOf("https://")?b(h,m+"/v1/chain/get_info",function(a,b,c){c.head_block_num?(f[a].https_status=j[a].https_status="online",f[a].https_number=j[a].https_number=c.head_block_num):f[a].https_status=j[a].https_status="offline"},function(a,c,d){if("timeout"==d)f[a].https_status=j[a].https_status="timeout";else{var c="https://api.fibos123.com/json2jsonp?url="+encodeURIComponent(c)+"&callback=?";b(a,c,function(a,b,c){c.head_block_num?(f[a].https_status=j[a].https_status="warning",f[a].https_number=j[a].https_number=c.head_block_num):f[a].https_status=j[a].https_status="offline"},function(a,b,c){f[a].https_status=j[a].https_status="error",f[a].https_msg=j[a].https_msg="error"})}}):(f[h].https_status=j[h].https_status="error",f[h].https_msg=j[h].https_msg="not https"),f[h].https_endpoint=j[h].https_endpoint=m);var n=i.nodes[k].p2p_endpoint;if(n){if(j[h].p2p_status&&"unset"!=j[h].p2p_status)f[h].p2p_status=j[h].p2p_status;else{var o=n.split(":"),p=o[0],q=o[1];j[h].p2p_status="connecting",c(h,p,q,function(a,b,c,d){var e=d.msg.indexOf("open");e?f[a].p2p_status=j[a].p2p_status="open":f[a].p2p_status=j[a].p2p_status="blocked"},function(a){f[a].p2p_status=j[a].p2p_status="timeout"})}f[h].p2p_endpoint=j[h].p2p_endpoint=n}}}a.producerjson=f,a.$apply(),$('[data-toggle="tooltip"]').tooltip(),g=setTimeout(function(){d()},1e3)})}document.title=" 节点监控 | FIBOS 导航";var e,f,g,h={},i=[],j={};a.protocol=window.location.protocol,b(),c(),d(),a.$on("$destroy",function(){clearTimeout(e),clearTimeout(f),clearTimeout(g)})}]),angular.module("appApp").run(["$templateCache",function(a){a.put("views/main.html",'<main role="main"> <section class="jumbotron text-center"> <div class="bg"></div> <div class="container"> <h1 class="jumbotron-heading">FIBOS 导航</h1> <p class="lead"> 一个汇集 FIBOS 优质网址及资源的导航网站 </p> </div> </section> <div class="album py-5 bg-light"> <div id="content" class="container"> <section ng-repeat="value in data"> <div class="panel-heading"><a id="{{ value.name }}" data-aos="fade-up"> <i class="{{ value.icon }}"></i> {{ value.name }}</a> </div> <content ng-repeat="value in value.sub" data-aos="fade-up" ng-class="{ line1: value.child.length <= 5 }"> <header ng-if="value.name"> <h2 class="icon-download"><a id="{{ value.name }}"><i ng-if="value.icon" class="{{ value.icon }}"></i> {{ value.name }}</a></h2> </header> <ul class="website-list"> <li ng-repeat="value in value.child"> <a href="{{ value.url }}" class="website" target="_blank"> <p class="name"><i ng-if="value.icon" class="{{ value.icon }}"></i> {{ value.name }}</p> <p class="description">{{ value.desc }}</p> </a> <p class="more" ng-if="value.more"> <a href="{{ value.more.url }}" target="_blank" class="{{ value.more.color }}"> <i ng-if="value.more.icon" class="{{ value.more.icon }}"></i> {{ value.more.name }} </a> </p> </li> </ul> </content> </section> </div> </div> </main>'),a.put("views/monitor.html",'<main role="main"> <div class="album py-5 bg-light"> <div id="content" class="container"> <h3>出块节点在线状态</h3> <div ng-if="bp_status"> 最新区块：{{ bp_status.head_block_num | number }}<br> 状态更新时间：{{ bp_status.bp_status_refresh_time | date : "yyyy-MM-dd HH:mm:ss.sss Z" }} </div> <table ng-if="bp_status_rows" class="table table-bordered table-hover table-sm table-striped monospaced-font"> <tr> <th width="50" class="text-center">编号</th> <th>节点账户</th> <th width="35%">状态</th> <th width="35%">打包区块</th> </tr> <tr ng-repeat="(key, value) in bp_status_rows" ng-class="{ \'font-weight-bold\': bp_status.head_block_producer == value.bpname }"> <td align="center">{{ $index + 1 }}</td> <td>{{ value.bpname }}</td> <td class="{{ value.status }}"> {{ value.status }} </td> <td> {{ value.number | number }} </td> </tr> </table> <div ng-if="!bp_status">获取中...</div> <br> <h3>接入点在线状态</h3> <div> HTTP 状态和 HTTPS 状态：支持跨来源资源共享（CORS）的接入点 <br> P2P 状态：检查是否开放端口 </div> <table ng-if="producerjson" class="table table-bordered table-hover table-sm table-striped monospaced-font"> <tr> <th width="50" class="text-center">编号</th> <th>节点账户</th> <th width="25%"> HTTP 状态 <a ng-if="protocol == \'https:\'" href="http://www.fibos123.com/#!/monitor" target="_blank">点击显示 HTTP 监控</a> </th> <th width="25%">HTTPS 状态</th> <th width="25%">P2P 状态</th> </tr> <tr ng-repeat="(key, value) in producerjson"> <td align="center">{{ $index + 1 }}</td> <td>{{ value.owner }}</td> <td class="{{ value.http_status }}"> <span data-toggle="tooltip" title="{{ value.http_endpoint }}"> <span ng-if="value.http_status == \'online\'">{{ value.http_number | number }}</span> <span ng-if="value.http_status == \'warning\'">{{ value.http_number | number }} </span> <span ng-if="value.http_status == \'unset\'">unset</span> <span ng-if="value.http_status == \'offline\'">offline</span> <span ng-if="value.http_status == \'timeout\'">timeout</span> <span ng-if="value.http_status == \'error\'">{{ value.http_msg }}</span> </span> <span ng-if="value.http_status == \'warning\'" data-toggle="tooltip" title="未开启 CORS">*</span> </td> <td class="{{ value.https_status }}"> <span data-toggle="tooltip" title="{{ value.https_endpoint }}"> <span ng-if="value.https_status == \'online\'">{{ value.https_number | number }}</span> <span ng-if="value.https_status == \'warning\'">{{ value.https_number | number }}</span> <span ng-if="value.https_status == \'unset\'">unset</span> <span ng-if="value.https_status == \'offline\'">offline</span> <span ng-if="value.https_status == \'timeout\'">timeout</span> <span ng-if="value.https_status == \'error\'">{{ value.https_msg }}</span> </span> <span ng-if="value.https_status == \'warning\'" data-toggle="tooltip" title="未开启 CORS">*</span> </td> <td class="{{ value.p2p_status }}"> <span data-toggle="tooltip" title="{{ value.p2p_endpoint }}"> {{ value.p2p_status }} </span> </td> </tr> </table> <div ng-if="!bp_status">获取中...</div> <br> <h3>出块节点在线状态变更记录</h3> <div ng-if="bp_status_change_logs"> 记录开始时间：{{ bp_status_change_logs.log_birthtime | date : "yyyy-MM-dd HH:mm:ss.sss Z" }} <br> 记录更新时间：{{ bp_status_change_logs.now_time | date : "yyyy-MM-dd HH:mm:ss.sss Z" }} </div> <table ng-if="bp_status_change_logs_rows" class="table table-bordered table-hover table-sm table-striped monospaced-font"> <tr><th width="50" class="text-center">编号</th><th>时间</th><th>节点账户</th><th>旧状态</th><th>新状态</th></tr> <tr ng-repeat="(key, value) in bp_status_change_logs_rows"> <td align="center">{{ $index + 1 }}</td> <td>{{ value.date | date : "yyyy-MM-dd HH:mm:ss Z" }}</td> <td>{{ value.bp }}</td> <td class="{{ value.from }}">{{ value.from }}</td> <td class="{{ value.to }}">{{ value.to }}</td> </tr> </table> <div ng-if="!bp_status_change_logs">获取中...</div> <a href="https://api.fibos123.com/" target="_blank">查看 API</a> </div> </div> </main>')}]);