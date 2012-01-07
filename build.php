<?php
/*
Here are my changes

*/
if ( ! function_exists('js_include')){
function js($config){
	global $KEY;
	
	$pack = ($KEY['env'] == "production");
	$env = $KEY['env_config'][$KEY['env']];
	
	return '<script type="text/javascript" '. ($pack ? ' src="" ' : '').'>'. ($pack ? '': simple_pack($env)).'</script>';
	
	
};
function simple_pack($config){
	global $KEY;
	$output = "";
	
	foreach($KEY['plugins'] as $dir){
		$output .= simple_get_all($KEY['base'] . DS . $config['plugin_path'] . DS . $dir);
	}
	foreach($KEY['key'] as $dir){
		$output .= simple_get_all($KEY['base'] . DS . $config['key_path'] . DS . $dir);
	}
	foreach($KEY['app'] as $dir){
		$output .= simple_get_all($KEY['base'] . DS . $config['app_path'] . DS . $dir);
	}
	
	
	return $output;
	
}
/*
Some more

*/
function simple_get_all($dir){
	if ($handle = opendir($dir)) {
	    $output = "";
	
	    while (false !== ($file = readdir($handle))) {
			if(substr($file,0,1) != "."){
				$output .= file_get_contents($dir . DS . $file); //"$file\n";
			}
	        
	    }

	    closedir($handle);
		return $output;
	}
}
function js_pack($PATH, $APPNAME, $PACK){
	//$PATH, $APPNAME
	
	$nl = "\n\n//-------------------------------//\n\n";
	$output = "/* $APPNAME \n-------------------------------\n";


	$load_order = array();
	$load_wait = array();
	$load_reqs = array();

	foreach($INC as $i){
		$output .= js_pack_read_entry(
			$i,
			array($APPNAME . "/" . $i),
			$PATH,
			$load_order,
			$load_reqs,
			$load_wait
		);
	}
	$output .= "*/\n";

	$get_first_cache = array();


	$rkeys = array_keys($load_reqs);
	foreach($load_reqs as $k=>$i){
		foreach($load_reqs[$k] as $subv){
			if(array_key_exists($subv, $load_reqs)){
				$load_reqs[$k] = array_merge($load_reqs[$k], $load_reqs[$subv]);
			}
		}
	}


	foreach($load_reqs as $rk=>$rv){

		$loc = js_get_first_loc($rv, $load_order);

		//error_log("Moving " .  $rk . " to " . $loc);
		$wait_keys = js_get_name_map($load_wait);
		$moving = array_splice($load_wait, array_search($rk, $wait_keys), 1);

		$oldarr = array_splice($load_order, $loc,0,$moving);
	}

	$looutput = "";


	$output .= "/*\nLoad Order: \n\n";
	foreach($load_order as $lok=>$lov){
		$output .=  $lov['name'] . "\n";
		$looutput .= $lov['content'] . "\n";
	}
	$output .= "---\n";

	$output .= "*/\n";
	$output .= $looutput;

	if($PACK){
		file_put_contents($PATH . $APPNAME . "/" . $APPNAME . ".debug.js", $output);
	}else{
		return $output;
	}
	
}

function js_pack_read_entry($point, $dir_tree, $PATH, &$load_order, &$load_reqs, &$load_wait){
	$local_output = "";
	
	if(!is_array($dir_tree)){ error_log("Fail"); return; };
	
	$last_dir = $PATH;
	foreach($dir_tree as $dt){
		$last_dir .= "/" . $dt;
	}
	
	if(! is_dir($last_dir)){  return;}
	
	$d = dir( $last_dir);
	$local_output .= $point . "\n";
	
	if(true){
		$local_output .= "\n// [" . $point . "] \n";
	}
	
	while(false != ($entry = $d->read()) ){
	$file_path = $d->path ."/". $entry;
		
		if(isset($entry) && substr($entry,0,1) != "." ){
		//	error_log("Check: " . $file_path);
			if(is_file($file_path) ){
				
				$local_output .= "\t" . $entry . "\n";
				//$local_output .= "\n//---------- start " . $entry . " ---------- //\n";
				
				$file_contents = file_get_contents($file_path);
				preg_match_all("/\/\/require\((.*)\)/", $file_contents, $require );
				
				if(count($require[1])>0){
					$load_reqs[$entry] = $require[1];
					
					array_push($load_wait, array('name'=>$entry, 'content'=>$file_contents));
				}else
					array_push($load_order, array('name'=>$entry, 'content'=>$file_contents));
				
				//$local_output .= "\n//---------- end " . $entry . " ---------- //\n";
				
				
			}else if(is_dir($file_path)){
				
				$local_output .= js_pack_read_entry(
					$entry,
					array_merge($dir_tree,
					array($entry)),
					$PATH,
					$load_order,
					$load_reqs,
					$load_wait
				);
			}
		}
		
	}
	$d->close();
	
	return $local_output;
}
function js_get_name_map(&$stack){
	$map = array();
	for($i=0; $i<count($stack); $i++){
		array_push($map, $stack[$i]['name']);
	}
	return $map;
}
function js_get_first_loc($search_stack, &$stack){
	global $get_first_cache;
	
	$keys = js_get_name_map($stack);
	
	$loc = 0;
	foreach($search_stack as $sik=>$siv){
		
		$find = array_search($siv, $keys);
		if($find === false) $find = 0;
		else $find += 1;
		//error_log("Searching: $siv at $find");
		if($find > $loc) $loc = $find;
	}
	//error_log("Searched: " . implode(",",$search_stack) . " | loc: " . $loc);
	
	return $loc;
}


}//endif

//eof: build_helper