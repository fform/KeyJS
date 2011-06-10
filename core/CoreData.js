//require(Class.js)
var CoreData = Object.subClass({
	_transactions: {},
	_data: {},
	_rest_provider: undefined,
	
	collection: function(name){
		return this._data[name];
	},
	registerProvider: function(name, config){
		if(name === "rest"){
			this._rest_provider = config.provider;
			return this;
		}
		name = this._keyfilter(name);
		config.data = [];
		this._data[name] = config;
		
		if(config.model !== undefined && config.model !== ""){
			//return K.Control.controller(config.model);
		}
		
		if(config.fixture){
			console.log('FIXTURE: ' + config.model);
			this._receive({
				action: "get",
				name: 'content_item',
				set: FIX[config.model]
			});
		}
		
		return this._data[name];
		
	},
	get_all: function(){
		for(var d in this._data){
			if(this._data[d].blind !== true)
				this.get(d);
		}
	},
//TRANSPORT
	_send: function(name, action, data){
		if(this._data[name].provider === undefined) return;
		subdata = {
			n: name,
			a: action,
			d: data,
			tid: Math.floor(Math.random()* 1000000)
		};
		this._transactions[subdata.tid] = {
			name: name,
			action: action,
			id: (data !== undefined && data.id !== undefined ? data.id : "")
		};
		
		var ref = this;
		$.ajax({
			type: 'POST',
			url: this._data[name].provider + "/" + action,
			data: subdata,
			success: this._receive,
			dataType: "json"
		});
		
	},
	_receive: function(d){
		if(d===undefined || d===null || d.action === undefined) return;
		K.Data["_process_" + d.action](d);
		
		$(K.Data._data[d.name]).trigger("update", d);
	},
	
	
//CRUD	
	get: function(name, data){
		if(this._data[name].data.length === 0)
			this._send(name,'get',data);
	},
	_process_get: function(data){
		name = this._keyfilter(data.name);
		
		for(var d in data.set){
			//if(data.set[d].id === undefined){
			//	data.set[d].id = d;
			//}
			this._insert_record(name,data.set[d]);
		}
		this._data[name].data = data.set;
	},
	_insert_record: function(n,d){
		if(d.date !== undefined && d.dateunix === undefined) d.dateunix = new Date(d.date).getTime();
		
		if($.isArray( this._data[n].data )){
			if($.isArray(d)){
				for(var i in d){
					d._index = this._data[n].data.length;
					this._data[n].data.unshift(d[i]);
				}
			}else{
				d._index = this._data[n].data.length;
				this._data[n].data.unshift(d);
			}
		}			
		else{
			if($.isArray(d)){
				for(var i in d){
					this._data[n].data[d[i].id] = d[i];
					this._data[n].data[d[i].id]._index = i;
				}
			}else{
				this._data[n].data[d.id] = d;
			}
		}
		
	},
	insert: function(n,d){
		this._send(n, 'insert', d);
	},
	_process_insert: function(record){
		if(record.set.success){
			this._insert_record(record.name, record.set.data);
			
			console.log(record);
		}else console.error("Error: " + record.set.msg);
	},
	update: function(name,search,update_data){
		var result = K.Data.search(name, search);
		
		var set = [];
		if(result.length > 0){
			for(var i in result){
				var d = {};
				for(var k in update_data){
					if(k !== 'id')
						this._data[name].data[result[i]._index][k] = update_data[k];
					
					d[k] = update_data[k];
				}
				d.id = result[i].id;
				set.push( d );

			}
			if(set.length > 0){
				this._send(name, 'update', set);
				$(K.Data._data[name]).trigger("update");
			}
		}
		
	},
	_process_update: function(data){
	},
	remove: function(name,search){
		var set = this.search(name, search);
		console.log("Removing");
		console.log(set);
	},
	_process_remove: function(data){
		
	},
//CUSTOM REST
	rest: function(target, action, data, callback){
		if(this._rest_provider === undefined){
			console.error('Data: No REST provider defined');
			return;
		}
		var data = data || {};
		var callback = callback || function(){};
		var subdata = {
			a: action,
			d: data,
			tid: Math.floor(Math.random()* 1000000)
		};
		this._transactions[subdata.tid] = {
			name: target,
			action: action,
			id: (data !== undefined && data.id !== undefined ? data.id : "")
		};
		
		
		$.ajax({
			type: 'POST',
			url: this._rest_provider + "/" + target + "/" + action,
			data: subdata,
			success: callback,
			dataType: "json"
		});
	},
//INDEXING AND SEARCH

	search: function(name, srch){
		name = this._keyfilter(name);
		if(srch === undefined || srch.length === 0){
			return this._data[name].data;
		}
		var result = [];
		var pass = true;
		
		for(var i in this._data[name].data){
			pass = true;
			
			for(var s in srch){
				pass = pass && (this._search_level(name, i,srch[s]));
			}
			if(pass){
				result.push(this._data[name].data[i]);
			}
		}
		
		return result;
	},
	_search_level: function(name, conkey, srch){
	
	 	if(typeof srch === "object"){
			var pass = false;
			
			for(var k in srch){
				if(typeof srch[k] !== "object" || k === "not" || k === "like"){
					//base case
					
					if( k==="not" ) {
						pass = pass || this._data[name].data[conkey][srch[k].field] !== srch[k].val;
					}else if( k==="like" ) {
						if($.isArray(srch[k])){
							var likepass = false;
							for(var li in srch[k]){
								if(this._data[name].data[conkey][srch[k][li].field].substr(0,srch[k][li].val.length).toLowerCase() === srch[k][li].val.toLowerCase()){
									likepass = true;
								}
							}
							pass = pass || likepass;
						}else{
							pass = pass || 
							this._data[name].data[conkey][srch[k].field].substr(0,srch[k].val.length).toLowerCase() === srch[k].val.toLowerCase();	
						}
						
					}else{
						pass = pass || this._data[name].data[conkey][k] === srch[k];
					}
					
				}else{
					pass =  (pass || this._search_level(name, conkey, srch[k]));
				}
			}
			return pass;
		}
		
	},
	unique: function(name, key, where){
		name = this._keyfilter(name);
		var tree = {};
		var result = [];
		
		var data = this.search(name,where);
		
		for(var i in data){
			val = data[i][key];
			tree[val] = key;
		}
		
		for(var k in tree){
			result.push(k);
		}
		
		return result;
	},
	sort: function(name, key){
		var sortkey = key;
		this._data[name].data.sort(function(a,b){
			return ( (a[sortkey] < b[sortkey]) - (a[sortkey] > b[sortkey]) );
		});
		var c = 0;
		for(var i in this._data[name].data){
			this._data[name].data[i]._index = c;
			c += 1;
		}
		$(K.Data._data[name]).trigger("update");
	},
	
//HELPERS
	_keyfilter: function(val){
		return val.toLowerCase();
	},
	itemAt: function(name, i){
		return this._data[name].data[i];
	}
});

K.Data = new CoreData();