//require(Class.js)
window.ON = ON = true;
window.OFF = OFF = false;



var Application = Object.subClass({
	_childViews : [],
	init: function(){
		window.__APP = __APP = this;
		return this;
	},
	main: function(){
		this.binds();
	},
	addChild: function(key,what){
		this._childViews[key] = what;
	},
	view: function(key){
		return this._childViews[key];
	},
	binds: function(){
		
		$(window.location).bind("change",function(e,d){
			__APP.handle_location();
		});
		
		if(document.location.hash.length > 2 ){
			__APP.handle_location();
		}else{
			__APP.handle_location("main");
		}
	},
	alert: function(msg){
		alert(msg);
	},
//LOCATION
	handle_location: function(where){
		var sh = "";
		if(where !== undefined){
			sh = where;
		}else{
			sh = document.location.hash;
			sh = sh.substr(1);
		}
		var ch = sh.split("/");

		if(ch[0] !== "")
			K.Control.route(ch[0], ch);
	},
	location: function(where){
		document.location.hash = where;
	},
	encode_location: function(target,action,value){
		return "#" + target + "/" + action + "/" + (value!==undefined? value:"");
	},
//FORM
	validateForm: function(search, clear){
		var frm = {};
		var pass_all = true;
		var clear = clear || false;
		
		$("input",search).removeClass('input-error');
		$(".input-error-msg", search).remove();
		
		$(":input",search).each(function(i,d){
			var o = {name: $(d).attr('name'), value: $(d).val(), pass: true};
			var msg = "";
			
			switch($(d).attr('validate')){
				case 'restricted':
					if(o.value === ''){
						o.pass = false;
						msg += "This field is required";
					}else{
						o.pass = (String(o.value).match(/^\w*$/) !== null);
						msg += "Only letters and numbers";
					}
					
				break;
				case 'email':
					o.pass = (String(o.value).match(/^.*\@.*\..{2,4}$/) !== null);
					msg += "Not a valid email address";
				break;
				case "minlength":
					var len = Number($(d).attr('minlength'));
					o.pass = o.value.length >= len;
					msg += "Must be at least " + len + " characters";
				break;
				case "required":
					o.pass = o.value !== '';
					msg += "This field is required";
				break;
				case "match":
					var field = $(d).attr('rel');
					var target_val = $("input[name='"+field+"']").val();
					o.pass = o.value === target_val;
					msg += "Passwords must match";
				break;
			}
			if(!o.pass){
				$(d,search).addClass('input-error').before("<p class='input-error-msg'><span>"+ msg +"</span></p>").focus(function(){
					$(this).unbind('focus').prev('.input-error-msg').remove();
				});
				pass_all = false;
			}
			
			frm[o.name] = o;
		});
		
		$(".input-error-msg", search).hide().fadeIn(250);
		
		if(pass_all && !clear){
			$(":input",search).val("");
		}
		
		return {data: frm, pass: pass_all};
	},
//HELPERS
	random_id: function(len){
		var len = len || 10;
		var chars = "0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ";
		var uid = Math.round(new Date().getTime() / 1000) + "-";
		for(var i=0;i<len;i++){
			uid += chars.substr( Math.floor(Math.random() * 62), 1 );
		}
		
		return uid;
	}
});
