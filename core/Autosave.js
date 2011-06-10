//require(Class.js)
var Autosave_Controller = Object.subClass({
	init: function(){
		this._count = 0;
		this._list = {};
		this._interval = setInterval(function(){Autosave.check_status();}, 1000);
	},
	setup: function(saver){
		if(saver.watch !== undefined && saver.provider !== undefined){
				saver.last_hash = this._hash(eval(saver.watch));
				this._list[saver.name] = saver;
				this._count += 1;
		}else{
			console.error("Misconfigured autosave");
		}

	},
	get_all: function(){
		for(var i in this._list){
			this._send(this._list[i].name,'init');
		}
	},
	_send: function(name,action,d){
		var d = d || {};
		$.ajax({
			type: 'POST',
			url: this._list[name].provider + "/" + action + "/" + name,
			data: {data: d},
			success: this._receive,
			dataType: "json"
		});
	},
	_receive: function(d){
		d.data = d.data || {};
		
		//console.log(eval(Autosave._list[d.name].watch + "=1") );
		//eval(eval(Autosave._list[d.name].watch) + " = d.data");
		if(d.update === true){
			eval(this._list[d.name].watch + "= d.data");
			this._list[d.name].last_hash = Autosave._hash(d.data);
		}
		
	},
	_hash: function(str){
		return crc32(JSON.stringify(str));
	},
	check_status: function(){
		if(this._count < 1){
			return;
		}
		for(var i in this._list){
			var hash = this._hash( eval(this._list[i].watch) );
			if(this._list[i].last_hash !== hash){
				this._list[i].last_hash = hash;
				this._send(this._list[i].name, 'save', eval(this._list[i].watch) );
			}
		}
	}
	
});

//K.Autosave = new Autosave_Controller();