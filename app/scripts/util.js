var url = {};

url.api = {};
url.api.endpoint = "https://api.fibos123.com";
url.api.bp_info = url.api.endpoint + "/bp_info";
url.api.bp_status = url.api.endpoint + "/bp_status";
url.api.bp_status_change_logs = url.api.endpoint + "/bp_status_change_logs";
url.api.check_p2p = url.api.endpoint + "/check_p2p";
url.api.json2jsonp = url.api.endpoint + "/json2jsonp";

url.rpc = {};
url.rpc.endpoint = "https://rpc-mainnet.fibos123.com";
url.rpc.get_table_rows = url.rpc.endpoint + "/v1/chain/get_table_rows";
url.rpc.get_info = url.rpc.endpoint + "/v1/chain/get_info";
url.rpc.get_account = url.rpc.endpoint + "/v1/chain/get_account";
url.rpc.get_transaction = url.rpc.endpoint + "/v1/history/get_transaction";

var util = {

    // ajax 加入自动重试
    ajax: function (options, success, error) {
        options = Object.assign({
            timeout: 5000,
            tryCount : 0,
            retryLimit : 3,
            success: function (data, textStatus){
                success(data);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown){
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
        var e = Date.now() / 1e3 - 946684800, // 946684800 = 2000-01-01 UTC
            s = Math.floor(e / 604800) / 52; // 604800 = 1 week
        return (t = total_votes / Math.pow(2, s) / 1e4).toFixed(0)
    },


    // 对象排序 顺序
    compare_sort: function (pro) { 
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
    }, 

    // 对象排序 倒序
    compare_reverse: function (pro) { 
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
    },

    // 复制对象
    copy: function ( obj ){
        return JSON.parse( JSON.stringify( obj ) );
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
        var bpay2 = (global.perblock_bucket * 5000) / 172800 / 10000;
        var vpay = (global.pervote_bucket * producer.total_votes) / (1 * global.total_producer_vote_weight) / 10000;
        var next_claim_time = 1 * producer.last_claim_time / 1000 + 24 * 60 * 60 * 1000;
        if (vpay < 1000) {
            vpay = 0;
        }
        total = (rank < 21) ? bpay2 + vpay : vpay;
        unreceived = (next_claim_time > Date.now()) ? 0 : bpay + vpay;
        return {
            total: total.toFixed(0),
            unreceived: unreceived.toFixed(0)
        }
    },
}

