document.getElementById('content').innerHTML = template('tpl-site', data);
AOS.init({
  disable: 'mobile',
  once: true
});

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

