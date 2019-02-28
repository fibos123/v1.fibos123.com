var url = {};

url.api = {};
url.api.endpoint = "https://api.fibos123.com";
url.api.bp_info = url.api.endpoint + "/bp_info";
url.api.bp_status = url.api.endpoint + "/bp_status";
url.api.bp_status_change_logs = url.api.endpoint + "/bp_status_change_logs";
url.api.check_p2p = url.api.endpoint + "/check_p2p";
url.api.json2jsonp = url.api.endpoint + "/json2jsonp";
url.api.bp_history = url.api.endpoint + "/bp_history";

url.rpc = {};
// url.rpc.endpoint = "https://rpc-mainnet.fibos123.com";
url.rpc.endpoint = "https://api.fibos.rocks";
url.rpc.get_table_rows = url.rpc.endpoint + "/v1/chain/get_table_rows";
url.rpc.get_info = url.rpc.endpoint + "/v1/chain/get_info";
url.rpc.get_account = url.rpc.endpoint + "/v1/chain/get_account";
url.rpc.get_transaction = url.rpc.endpoint + "/v1/history/get_transaction";

var util = {

    // ajax 加入自动重试
    ajax: function (options, success, error) {
        options = Object.assign({
            timeout: 5000,
            tryCount: 0,
            retryLimit: 3,
            success: function (data, textStatus) {
                success(data);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (textStatus == 'timeout') {
                    this.tryCount++;
                    if (this.tryCount <= this.retryLimit) {
                        $.ajax(this);
                        return;
                    }
                }
                error(textStatus);
            }
        }, options);
        $.ajax(options);
    },

    // 权重转换票数
    getStaked: function (total_votes) {
        var t = 0;
        if (0 == total_votes) return t;
        var e = Date.now() / 1000 - 946684800, // 946684800 = 2000-01-01 UTC
            s = Math.floor(e / 604800) / 52; // 604800 = 1 week
        return (t = total_votes / Math.pow(2, s) / 10000).toFixed(0)
    },


    // 对象排序 顺序
    compare_sort: function (pro) {
        return function (obj1, obj2) {
            var val1 = obj1[pro];
            var val2 = obj2[pro];
            if (val1 < val2) { //正序
                return -1;
            } else if (val1 > val2) {
                return 1;
            } else {
                return 0;
            }
        }
    },

    // 对象排序 倒序
    compare_reverse: function (pro) {
        return function (obj1, obj2) {
            var val1 = obj1[pro];
            var val2 = obj2[pro];
            if (val1 < val2) { //正序
                return 1;
            } else if (val1 > val2) {
                return -1;
            } else {
                return 0;
            }
        }
    },

    // 复制对象
    copy: function (obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // 投票统计
    totalVotessum: function (producers) {
        var sum = 0;
        for (var i = 0; i < producers.length; i++) {
            sum += parseFloat(producers[i].total_votes)
        }
        return sum;
    },

    // 得票率
    weightPercent: function (total_votes, totalvotessum) {
        var percent = ((parseFloat(total_votes) / parseFloat(totalvotessum)) * 100).toFixed(3);
        return percent;
    },

    // 奖励
    getClaimRewards: function (producer, global, rank) {
        if (!producer) return;
        var total = 0;
        var unreceived = 0;
        var bpay = (global.perblock_bucket * producer.unpaid_blocks) / global.total_unpaid_blocks / 10000;
        var vpay = (global.pervote_bucket * producer.total_votes) / (1 * global.total_producer_vote_weight) / 10000;
        var next_claim_time = 1 * producer.last_claim_time / 1000 + 24 * 60 * 60 * 1000;
        var bpay2 = 3200;
        var vpay2 = 4879e5 / 365 * 0.2 * 0.9 * producer.total_votes / global.total_producer_vote_weight
        if (vpay < 1000) {
            vpay = 0;
        }
        if (vpay2 < 1000) {
            vpay2 = 0;
        }
        total = (rank <= 21) ? bpay2 + vpay2 : vpay2;
        unreceived = (next_claim_time > Date.now()) ? 0 : bpay + vpay;
        return {
            total: total.toFixed(0),
            unreceived: unreceived.toFixed(0)
        }
    },

    // 时间格式化函数
    timetrans: function (date) {
        var date = new Date(date);//如果date为13位不需要乘1000
        var Y = date.getFullYear() + '-';
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
        var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
        var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
        var s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
        return Y + M + D + h + m + s;
    },

    // 数组去重
    unique: function (array) {
        var res = [];
        for (var i = 0, len = array.length; i < len; i++) {
            var current = array[i];
            if (res.indexOf(current) === -1) {
                res.push(current)
            }
        }
        return res;
    },


    check_http_or_https: function (bpname, bpinfo, type, callback) {
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
                return callback(bpname, { status: "ng", msg: "not http", endpoint: endpoint });
            }
        }
        if (type === "https") {
            if (endpoint.indexOf("https://") !== 0) {
                return callback(bpname, { status: "ng", msg: "not https", endpoint: endpoint });
            }
        }
        callback(bpname, { status: "ing", msg: "connecting", endpoint: endpoint });
        var url_get_info = endpoint + '/v1/chain/get_info';
        var url_get_transaction = endpoint + '/v1/history/get_key_accounts';
        // get_info
        util.ajax({ url: url_get_info }, function (info) {
            if (info && info.head_block_num) {
                // history
                util.ajax({ url: url_get_transaction, type: "POST", headers: { 'content-type': 'application/json' }, data: '{"public_key":"FO6MzV92DgYjwDa7K3rtc28dPhGt2Gy8oUoHjESUq4gBx63v8num"}' }, function (info) {
                    if (info) {
                        return callback(bpname, { history: true });
                    }
                }, function () { })
                util.ajax({ url: url_get_info, headers: { 'content-type': 'application/json' } }, function () { }, function () {
                    callback(bpname, { cors: false });
                });
                return callback(bpname, { status: "ok", msg: "", number: info.head_block_num, version: info.server_version_string });
            } else {
                return callback(bpname, { status: "ng", msg: "offline" });
            }
        }, function (textStatus) {
            if (textStatus == "timeout") {
                return callback(bpname, { status: "ng", msg: "timeout" });
            } else {
                return callback(bpname, { status: "ng", msg: "error" });
            }
        });
    },

    check_p2p: function (bpname, bpinfo, callback) {
        var endpoint = bpinfo.p2p_endpoint;
        if (!endpoint) {
            return;
        }
        endpoint = endpoint.replace("http://", "");
        var addr = endpoint.split(":");
        var host = addr[0];
        var port = addr[1] || "";

        callback(bpname, { status: "ing", msg: "connecting", endpoint: endpoint });
        util.ajax({ url: url.api.check_p2p, data: { host: host, port: port } }, function (data) {
            var status = data && data.rows && data.rows.length;
            if (!status) {
                return callback(bpname, { status: "un", msg: "unknown", detecting: false });
            }

            var rows = data.rows;
            var msg = "";
            var ok_num = 0;
            var length = 1; // rows.length

            for (var i = 0; i < length; i++) {
                if (
                    (rows[i].indexOf("connect ") >= 0 ||
                        rows[i].indexOf("connection ") >= 0 ||
                        rows[i].indexOf("self connect") >= 0 ||
                        rows[1].indexOf("self connect") >= 0
                    )
                    && rows[i].indexOf("failed ") === -1
                    && port
                ) {
                    ok_num++;
                }
                var _msg = rows[i].split(port);
                _msg = _msg[1] || _msg[0];
                _msg = _msg.substr(1).replace(/\s+/g, "");
                if (_msg) {
                    msg = rows[i].split(port);
                    if (msg[1]) {
                        msg = msg[1].substr(1);
                    } else {
                        msg = msg[0];
                    }
                }
                if (!port) {
                    msg = "Invalid peer address"
                }
            }

            if (ok_num == length) {
                return callback(bpname, { status: "ok", msg: "connect" });
            } else {
                return callback(bpname, { status: "ng", msg: msg });
            }
        }, function (textStatus) {
            if (textStatus == "timeout") {
                callback(bpname, { status: "un", msg: "timeout" });
            } else {
                callback(bpname, { status: "un", msg: "unknown" });
            }
        })
    }

}

