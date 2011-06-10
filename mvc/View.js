//require(Class.js)

var View = Object.subClass({
	init: function(structure){
		this.display = "";
	},
	render: function(){
		return this.display;
	}
});