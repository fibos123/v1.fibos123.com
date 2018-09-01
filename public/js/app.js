document.getElementById('content').innerHTML = template('tpl-site', data);
AOS.init({
  disable: 'mobile',
  once: true
});

var eos2fo, fo2eos;

getExchangeInfo();

function getExchangeInfo() {
  var url = "https://json2jsonp.com/?url=https://fibos.io/getExchangeInfo&callback=?";
  $.getJSON(url, function(data){
    eos2fo = data.price
    fo2eos = 1 / data.price
    document.title = eos2fo + " FO / EOS | FIBOS 导航"
    setTimeout(getExchangeInfo, 1000)
  });
}

