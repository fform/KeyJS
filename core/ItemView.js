//require(Class.js)


var ItemView = Object.subClass({
	init: function(parent){
		this.id_value = "iv_" +__APP.random_id();
		this.id = "#" + this.id_value;
		this.parent = "#" + parent;
		this.shadowClass = undefined;
		
		this.display = "";
		this._visible = true;
		this.childViews = [];
		this.render();
	},
	render: function(){
		if($(this.id).length === 0){
			$(this.parent).append("<div id='"+ this.id_value+"'></div>");
		}
		$(this.id).html(this.display).addClass(this.style);
		
		if(this.shadowClass !== undefined){
			$(this.id).append(
				"<span class='"+ this.shadowClass + " " + this.shadowClass + "-left'></span>"+
				"<span class='"+ this.shadowClass + " " + this.shadowClass + "-right'></span>"
			);
		}
	},
	addChildView: function(child){
		this.childViews[child.id_value] = child;
	},
	hide: function(){
		$(this.id).hide();
		this._visible = false;
	},
	show: function(){
		$(this.id).show();
		this._visible = true;
	}
});

