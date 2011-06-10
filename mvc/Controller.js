//require(Class.js)
var Controllers = Object.subClass({
	init: function(){
		this._controllers = {};
		this._focuscontrol = {};
	},
	setup: function(controller){
		controller._active = false;
		controller._lastRoute = "";
		controller.visible = function(){
			return this._active;
		};
		
		if(controller.focuscontrol !== undefined){
			if(this._focuscontrol[controller.focuscontrol] === undefined){
				this._focuscontrol[controller.focuscontrol] = [];
			}
			this._focuscontrol[controller.focuscontrol].push(controller.name);
		}
		
		this._controllers[controller.name] = controller;
		
		if(typeof this._controllers[controller.name].construct === 'function'){
			this._controllers[controller.name].construct();
		}
	},
	focus_change: function(controller){
		//blur
		try{
		var thisfc = this._controllers[controller].focuscontrol;
		if(thisfc !== undefined){
			for(var c in this._focuscontrol[thisfc]){
				var thiscontrol = this._focuscontrol[thisfc][c];
				this._controllers[thiscontrol]._active = false;
				if(thiscontrol !== controller && typeof this._controllers[thiscontrol].blur === 'function'){
					this._controllers[thiscontrol].blur();
				}
			}
			
		}
		//focus
		this._controllers[controller]._active = true;
		if(typeof this._controllers[controller].focus === 'function'){
			this._controllers[controller].focus();
		}
		}catch(e){
			
		}
		
	},
	controller: function(what){
		if(this._controllers[what] !== undefined){
			this.focus_change(what);
			return this._controllers[what];
		}else{
			console.error("Undefined Controller : " + what);	
			throw "Error";
		}
	
	},
	route: function(what,data){
		if(this._controllers[what] !== undefined){
			
			this.focus_change(what);
			
			if(typeof this._controllers[what].init === "function"){
				this._controllers[what].init();
				this._controllers[what]._lastRoute = 'init';
			}
			for(var cd in data){
				data[cd] = this.register_vars(data[cd]);
			}
			if(typeof this._controllers[what][data[1]] === "function"){
				this._controllers[what][data[1]](data.slice(2));
				this._controllers[what]._lastRoute = data[1];	
			}else{
				this._controllers[what].base(data);
				this._controllers[what]._lastRoute = 'base';
			}
			
		}else{
			console.error("Undefined Controller : " + what);	
		}
	},
	
	register_vars: function(str){
		var str = String(str);
		var qs = {};
		if(str === undefined || str === "" || !str.match(/\=/) ){
			return str;
		}
		str.replace(
		    new RegExp("([^?=&]+)(=([^&]*))?", "g"),
		    function($0, $1, $2, $3) { qs[$1] = decodeURIComponent($3); }
		);
		
		return qs;
	}
});

K.Control = new Controllers();