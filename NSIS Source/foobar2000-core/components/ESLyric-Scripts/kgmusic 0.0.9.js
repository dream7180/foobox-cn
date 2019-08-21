//===================================================
//============KG Music Source For ESLyric============
//===============Anonymous 2016-10-22================
//===================================================

var ado = new ActiveXObject("ADODB.Stream");
var xmlhttp = new ActiveXObject("Msxml2.XMLHTTP.6.0");
var debug = false;

function get_my_name() {
	return "KGMusic|酷狗音乐";
}

function get_version() {
	return "0.0.9";
}

function get_author() {
	return "Anonymous";
}

function start_search(info, callback) {
	var artist = KGStringFilter(info.Artist);
	var title = KGStringFilter(info.Title);

	var http_client = utils.CreateHttpClient();

    if(info.Length > 0) {
	    url = "http://lyrics.kugou.com/search?ver=1&man=yes&client=pc&keyword=" + encodeURIComponent(artist) + "-" + encodeURIComponent(title) + "&duration=" + Math.round(info.Length) * 1000 + "&hash=";
    }else{
        url1 = "http://mobilecdn.kugou.com/api/v3/search/song?format=jsonp&keyword=" + encodeURIComponent(artist) + "-" + encodeURIComponent(title) + "&page=1&pagesize=10";
        var rex = new RegExp('"duration":(.+?),"',"g");
        var text1 = http_client.Request(url1);
        var ret = rex.exec(text1);
        url = "http://lyrics.kugou.com/search?ver=1&man=yes&client=pc&keyword=" + encodeURIComponent(artist) + "-" + encodeURIComponent(title) + "&duration=" + ret[1] * 1000 + "&hash=";
    }
    
	dbg_trace("url to query 'accesskey','id', 'score', 'singer', 'song': " + url);

	var _json_text = http_client.Request(url);
	if (http_client.StatusCode != 200) {
		dbg_trace("request url[" + url + "] error : " + http_client.StatusCode);
		return;
	}
	dbg_trace("\r\n" + _json_text);
	var _new_lyric = callback.CreateLyric();

	var _json_obj = json(_json_text);
	var _candidates = _json_obj["candidates"];

	for (var i = 0; i < _candidates.length; ++i) {
		if (callback.IsAborting()) {
			dbg_trace("user aborted");
			break;
		}
		var _candidate = _candidates[i];
		var _id = _candidate["id"];
		var _accesskey = _candidate["accesskey"];
		if (_id == null || _accesskey == null)
			continue;
		url = "http://lyrics.kugou.com/download?ver=1&client=pc&id=" + _id + "&accesskey=" + _accesskey + "&fmt=krc&charset=utf8";
		dbg_trace("url to request krc : " + url);
		_json_text = http_client.Request(url);
		if (http_client.StatusCode != 200) {
			dbg_trace("request url[" + url + "] error : " + http_client.StatusCode);
			continue;
		}

		_json_obj = json(_json_text);
		var _content = _json_obj["content"];
		if (_content == null)
			continue;

		var _title = _candidate["song"];
		var _artist = _candidate["singer"];
		if (_title)
			_new_lyric.Title = _title;
		if (_artist)
			_new_lyric.Artist = _artist;
		_new_lyric.Source = get_my_name();
		_new_lyric.FileType = "krc";
		_new_lyric.LyricData = base64decode(_content);
		callback.AddLyric(_new_lyric);
		if (i % 3 == 0)
			callback.Refresh();
	}
	_new_lyric.Dispose();
}

function dbg_trace(s) {
    if(!debug)return;
	fb.trace("KGMusic : " + s);
}

function KGStringFilter(s) {
	//s = s.toLowerCase();
	s = s.replace(/\'|·|\&|–/g, "");
	//trim all spaces
	//s = s.replace(/(\s*)|(\s*$)/g,"");
	//truncate all symbols
	s = s.replace(/\(.*?\)|\[.*?]|{.*?}|（.*?/g, "");
	s = s.replace(/[-/:-@[-`{-~]+/g, "");
	//s = et.Translate(s, 0x0804, 0x02000000);
	s = s.replace(/[\u2014\u2018\u201c\u2026\u3001\u3002\u300a\u300b\u300e\u300f\u3010\u3011\u30fb\uff01\uff08\uff09\uff0c\uff1a\uff1b\uff1f\uff5e\uffe5]+/g, "");
	return s;
}

function A2U(s) {
	ado.Type = 1;
	ado.Open();
	ado.Write(s);
	ado.Position = 0;
	ado.Type = 2;
	ado.Charset = "gb2312";
	var ret = ado.ReadText();
	ado.Close();
	return ret;
}
var base64DecodeChars = new Array(
		-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
		52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
		-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
		15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
		-1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
		41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

function base64decode(str) {
	var c1,
	c2,
	c3,
	c4;
	var i,
	len,
	out;

	len = str.length;
	i = 0;
	out = "";
	while (i < len) {
		/* c1 */
		do {
			c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
		} while (i < len && c1 == -1);
		if (c1 == -1)
			break;

		/* c2 */
		do {
			c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
		} while (i < len && c2 == -1);
		if (c2 == -1)
			break;

		out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

		/* c3 */
		do {
			c3 = str.charCodeAt(i++) & 0xff;
			if (c3 == 61)
				return out;
			c3 = base64DecodeChars[c3];
		} while (i < len && c3 == -1);
		if (c3 == -1)
			break;

		out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

		/* c4 */
		do {
			c4 = str.charCodeAt(i++) & 0xff;
			if (c4 == 61)
				return out;
			c4 = base64DecodeChars[c4];
		} while (i < len && c4 == -1);
		if (c4 == -1)
			break;
		out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
	}
	return out;
}

function json(text) 
{
	try{
		var data=JSON.parse(text);
		return data;
	}catch(e){
		return false;
	}
}

//json2.js
if(typeof JSON!=='object'){JSON={};}
(function(){'use strict';function f(n){return n<10?'0'+n:n;}
if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+
f(this.getUTCMonth()+1)+'-'+
f(this.getUTCDate())+'T'+
f(this.getUTCHours())+':'+
f(this.getUTCMinutes())+':'+
f(this.getUTCSeconds())+'Z':null;};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf();};}
var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+string+'"';}
function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key);}
if(typeof rep==='function'){value=rep.call(holder,key,value);}
switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null';}
gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null';}
v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v;}
if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==='string'){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}
v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v;}}
if(typeof JSON.stringify!=='function'){JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' ';}}else if(typeof space==='string'){indent=space;}
rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}
return str('',{'':value});};}
if(typeof JSON.parse!=='function'){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}
return reviver.call(holder,key,value);}
text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+
('0000'+a.charCodeAt(0).toString(16)).slice(-4);});}
if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j;}
throw new SyntaxError('JSON.parse');};}}());
