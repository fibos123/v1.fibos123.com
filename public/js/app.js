document.getElementById('content').innerHTML = template('tpl-site', data);
AOS.init({
  startEvent: "aosEvent",
  disable: 'mobile',
  once: true,
  offset: 60
});
document.dispatchEvent(new Event('aosEvent'))

var eos2fo, fo2eos;
var i = 0;

getExchangeInfo();

setInterval(function () {
	if (eos2fo) {
	    if (i % 2 == 0) {
			document.title = eos2fo + " FO / EOS | FIBOS 导航"
	    } else {
			document.title = fo2eos.toFixed(6) + " EOS / FO | FIBOS 导航"
	    }
	    i++;
    }
}, 3 * 1000)

function getExchangeInfo() {
  var url = "https://json2jsonp.com/?url=" + encodeURIComponent('https://fibos.io/getExchangeInfo?rand='+Math.random()) + "&callback=?";
  $.getJSON(url, function(data){
    eos2fo = data.price
    fo2eos = 1 / data.price
    setTimeout(getExchangeInfo, 2000)
  });
}

// 使用 Ironman 投票
const bp2vote = "fibos123comm"
$('#vote_with_ironman').on('click', function (event) {
    event.preventDefault();
    if ($('#vote_with_ironman').attr("onclick")) {
        $('#vote_with_ironman').removeAttr("onclick");
    }
    const vote_info = $('#vote_with_ironman').html()
    $('#vote_with_ironman').prop('disabled', true).text('加载中...');
    setTimeout(function () {
        $('#vote_with_ironman').prop('disabled', false).html(vote_info);
    }, 2000);
    if (window.ironman) {
        const ironman = window.ironman;
        ironman.requireVersion(1.2);
        const foNetwork = {
            name: 'FIBOS Mainnet',
            protocol: 'https',
            port: 80,
            host: 'rpc-mainnet.fibos123.com',
            blockchain: 'fibos',
            chainId: '6aa7bd33b6b45192465afa3553dedb531acaaff8928cf64b70bd4c5e49b7ec6a'
        }
        const RequirefoNetwork = {
            blockchain: 'fibos',
            chainId: '6aa7bd33b6b45192465afa3553dedb531acaaff8928cf64b70bd4c5e49b7ec6a'
        }
        ironman.getIdentity({
            accounts: [RequirefoNetwork]
        }).then(identity => {
            console.log('get identity');
            const account = identity.accounts.find(acc => acc.blockchain === 'fibos');
            // FO参数
            const foOptions = {
                broadcast: true,
                chainId: "6aa7bd33b6b45192465afa3553dedb531acaaff8928cf64b70bd4c5e49b7ec6a"
            }
            //获取FO instance
            const fo = ironman.fibos(foNetwork, Fo, foOptions, "http");
            const requiredFields = {
                accounts: [foNetwork]
            };
            cb(ironman, fo, requiredFields, account);
        }).
        catch (e => {
            console.log("error", e);
        });
    } else {
        if (confirm("您还没安装 Ironman ，是否打开官网进行安装？")) {
            window.open("http://foironman.com");
        }
    }
});

function cb(ironman, fo, requiredFields, account) {
    const encodedName = new BigNumber(
    Fo.modules.format.encodeName(account.name, false))
    fo.getTableRows({
        json: true,
        code: "eosio",
        scope: "eosio",
        table: "voters",
        lower_bound: encodedName.toString(),
        upper_bound: encodedName.plus(1).toString()
    }).then(table => {
        if (table && table.rows && table.rows[0] && table.rows[0].producers) {
            let producers = table.rows[0].producers
            if (producers.indexOf(bp2vote) == -1) {
                if (producers.length >= 30) {
                    alert("您已经投票过30个节点，请移除后再投票，谢谢");
                } else {
                    producers.push(bp2vote);
                    producers.sort();
                    //执行智能合约
                    fo.contract('eosio', {
                        requiredFields
                    }).then(contract => {
                        contract.voteproducer(account.name, "", producers).then(trx => {
                            let url = `http: //explorer.fibos.rocks/transactions/${trx.transaction_id}`;
                            alert(`投票成功，谢谢支持`)
                        }).
                        catch (e => {
                            console.log("error", e);
                            if (e.toString().includes("overdrawn balance")) {
                                alert("No money, go back to Getting Started and refill")
                            }
                            // let error = JSON.parse(e);
                            // alert(error.message || 'Server Error');
                        })
                    });
                }
            } else {
                alert(`您已经给 ${bp2vote} 投过票了，无需重复投票，谢谢支持`)
            }
        }
    });
}