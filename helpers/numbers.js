function currencyFormat(num){
	var price = Number(num).toFixed(2);
	
	return '$' + price;
}
function _cfr(num){
	var ns = String(num);
	var d = arrayIndexOf.call(ns, '.');
	
	return num;
	
	if(d === -1){
		return num;
	}else{
		var offset = ns.length - (3 +(d!== -1 ? ns.length-d : 0));
		return _cfr(Number(ns.substr(0,offset))) + ',' + ns.substr( offset);
	}
}