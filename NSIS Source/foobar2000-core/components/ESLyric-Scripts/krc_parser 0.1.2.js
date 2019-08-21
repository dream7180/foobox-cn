
function get_my_name()
{
    return "KRC Parser";
}

function get_version() 
{
    return "0.1.2";
}

function get_author() 
{
    return "wistaria";
}

function is_our_type(type)
{
   return type.toLowerCase() == "krc";
}

function start_parse(data)
{
    
	var zip_data = null;
	var krc_text = null;
	zip_data = krchex_xor(data);

	if(!zip_data) return;

	unzip_data = utils.ZUnCompress(zip_data);
    
    if(!unzip_data) return;
    
	krc_text = utils.UTF8ToUnicode(unzip_data);
	
	return krc2lrc(krc_text);
}

function krchex_xor(s)
{
	var magic_bytes = [ 0x6b, 0x72, 0x63, 0x31 ];// 'k' , 'r' , 'c' ,'1'
    
    if(s.length < magic_bytes.length)return;
    
	for(var i=0;i<magic_bytes.length;++i)
	{
		var c = s.charCodeAt(i);
		if( c != magic_bytes[i])return;
	}
	
	var enc_key = [ 0x40, 0x47, 0x61, 0x77, 0x5e, 0x32, 0x74, 0x47, 0x51, 0x36, 0x31, 0x2d , 0xce, 0xd2, 0x6e, 0x69 ];

	var buf = "";
	var krc_header = magic_bytes.length;//first 4 bytes
	
	for( var i = krc_header;i < s.length ; ++i )
	{
		
		var x1 = s.charCodeAt(i);;
		var x2 = enc_key[ (i - krc_header) % 16 ];
		buf += String.fromCharCode( x1 ^ x2 );
	}
	return buf;
}

function krc2lrc(text)
{
    
	var lrc_buf = "";
	var regx_meta_info = /^\[([^\d:][^:]*):([^:]*)\]\s*$/;
	var regx_timestamps1 = /^\[(\d*,\d*)\]/;
	var regx_timestamps2 = /<(\d*,\d*,\d*)>([^<]*)/g;
	var lrc_meta_info =  [ "ar", "ti", "al", "by", "offset" ];
	var meta_info_unlock = true;
	var line,arr;
    
    var lines = text.split(/[\n\r]/);
    //convert...
    for(var i=0;i<lines.length;++i)
    {
	    
	    line = lines[i];
	    //copy known meta tag back.
	    if(meta_info_unlock && (arr = regx_meta_info.exec(line)))
	    {
		    for( var idx in lrc_meta_info){
		    	if(lrc_meta_info[idx] == arr[1]){
			    	lrc_buf = lrc_buf + arr[0] + "\r\n";
			    	break;
			 	}
			}
	    }
	    else if((arr = regx_timestamps1.exec(line)))//parse lyric line
	    {
		    meta_info_unlock = false;
		    var buf = "";
			var _time_array = arr[1].split(',');
			var _start = parseInt(_time_array[0]);
			var _duaration = parseInt(_time_array[1]);
		    while((arr = regx_timestamps2.exec(line)))
		    {
			    var _sub_time = arr[1].split(',');
			    var _sub_start = parseInt(_sub_time[0]);
			    var _sub_duaration = parseInt(_sub_time[1]);
                var cnt = arr[2];
			    buf = buf + "[" + format_time(_start + _sub_start) + "]" + cnt;
			    _duaration = parseInt(_sub_start + _sub_duaration);
		    }
		    buf = buf + "[" + format_time(_start + _duaration) + "]";
		    lrc_buf += buf + "\r\n";
	    }
    }
    return lrc_buf;
}

function zpad(n){
    var s = n.toString();
    return (s.length < 2 ) ? "0" + s : s;
}

function format_time(time)
{
	var t = Math.abs(time/1000);
	var h = Math.floor(t/3600);
    t -= h*3600;
	var m = Math.floor(t/60);
    t -= m*60;
    var s = Math.floor(t);
    var ms = t - s;
	var str = (h ? zpad(h) + ":" : "")  + zpad(m) + ":" + zpad(s) + "." + zpad(Math.floor(ms*100)) ;
    return str;
}