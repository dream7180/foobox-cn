/*----------------------------------------------
Date: 2018/08/09
Original Author: btx258、cimoc
----------------------------------------------*/

var QM_CFG = {
	DEBUG: true,
	E_SRV: "http://y.qq.com/portal/player.html",
	S_SRV: "http://c.y.qq.com/soso/fcgi-bin/client_search_cp",
	L_SRV: "http://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg",
	G_PRM: "&format=json&inCharset=utf8&outCharset=utf-8",
	P_MAX: 3,
	P_NUM: 30,
	L_LOW: 5,
	L_MAX: 10,
	RETRY: 1,
};

	//更改lrc_order内标识顺序,设置歌词输出顺序,删除即不获取
	//old_merge:并排合并歌词,newtype:并列合并,tran:翻译,origin:原版歌词,
	/*
	new_merge:并排合并歌词,在卡拉OK模式下仅高亮原语言歌词
	不推荐使用,仅能即时获取歌词即时使用,不能保存,且若原词为全英文或英文符号则翻译前会显示时间轴
	*/
var lrc_order = [
		"origin",
		"old_merge",
		"newtype",
		"tran", 
		//"new_merge"
	];

//更改或删除翻译外括号
//提供一些括号〔 〕〈 〉《 》「 」『 』〖 〗【 】( ) [ ] { }
var bracket = [
	"「", //左括号
	"」"  //右括号
];

//修复newtype歌词保存 翻译提前秒数 设为0则取消 如果翻译歌词跳的快看的难过,蕴情设为0.4-1.0
var savefix = 0.01;
//new_merge歌词翻译时间轴滞后秒数，防闪
var timefix = 0.41;
//当timefix有效时设置offset(毫秒),防闪
var offset=-20;

var qm_http = {
	handle: null,
	type: null
};

var qm_abort = {
	handle: null,
	isvalid: true
};

function get_my_name() {
	return "QQMusic|QQ音乐";
}

function get_version() {
	return "0.0.3";
}

function get_author() {
	return "Anonymous";
}

function start_search(info, callback) {
	var json_text = null, new_lyric = null;
	var song = null, lyric = null, i = null, j = null;
	var page = null, count = null;
	qm_abort.handle = callback;
	qm_abort.isvalid = true;
	for (var page = 0, count = 0; page < QM_CFG.P_MAX && count < QM_CFG.L_LOW; page++) {
		if (qm_is_aborting()) {
			break;
		}
		json_text = qm_download(QM_CFG.S_SRV,
			"w=" + qm_normalize(info.Title) + "+" + qm_normalize(info.Artist)
			+ "&p=" + (page + 1)
			+ "&n=" + QM_CFG.P_NUM
			+ "&new_json=1&cr=1"
			+ QM_CFG.G_PRM
			);
		if (json_text) {
			try {
				song = qm_json(json_text);
			} catch (e) {
				song = null;
			}
		}
		if (song && !song.code) {
			if (song.subcode || !song.data.song.totalnum) {
				break;
			}
			new_lyric = fb.CreateLyric();
			for (i = 0; i < song.data.song.list.length && count < QM_CFG.L_MAX; i++) {
				if (qm_is_aborting()) {
					break;
				}
				json_text = qm_download(QM_CFG.L_SRV,
					"songmid=" + song.data.song.list[i].mid
					+ "&g_tk=5381"
					+ QM_CFG.G_PRM
					);
				if (json_text) {
					try {
						lyric = qm_json(json_text.replace(/(^\w+\()|(\)$)/g, ""));
					} catch (e) {
						lyric = null;
					}
				}
				if (lyric && !lyric.code) {
                    if ((lyric.lyric.length > 128) && (lyric.trans.length > 128)) {
						fb.trace(Base64.decode(lyric.lyric), Base64.decode(lyric.trans));
					}
					if (!lrc_order.length) lrc_order = ["new_merge", "newtype", "origin", "tran"];
					for (var key in lrc_order) {
						switch (lrc_order[key]) {
							case "new_merge" :
								if ((lyric.lyric.length > 128) && (lyric.trans.length > 128)) {
									new_lyric.LyricText = lrc_newtype(Base64.decode(lyric.lyric), Base64.decode(lyric.trans), false);
									new_lyric.Title = song.data.song.list[i].title + " (并排)";
									for (j = 0, new_lyric.Artist = ""; j < song.data.song.list[i].singer.length; j++) {
										new_lyric.Artist += (j === 0 ? "" : ",") + song.data.song.list[i].singer[j].title;
									}
									new_lyric.Album = song.data.song.list[i].album.title;
									new_lyric.Source = get_my_name();
									fb.trace(Base64.decode(lyric.lyric));
									fb.trace(Base64.decode(lyric.trans));
									callback.AddLyric(new_lyric);
								}
								break;
							case "origin" :
								if (lyric.lyric.length > 128) {
									new_lyric.LyricText = Base64.decode(lyric.lyric);
									new_lyric.Title = song.data.song.list[i].title + ((lyric.trans.length > 128) ? " (原词)" : "");
									for (j = 0, new_lyric.Artist = ""; j < song.data.song.list[i].singer.length; j++) {
										new_lyric.Artist += (j === 0 ? "" : ",") + song.data.song.list[i].singer[j].title;
									}
									new_lyric.Album = song.data.song.list[i].album.title;
									new_lyric.Source = get_my_name();
									callback.AddLyric(new_lyric);
								}
								break;
							case "tran" :
								if (lyric.trans.length > 128) {
									new_lyric.LyricText = Base64.decode(lyric.trans);
									new_lyric.Title = song.data.song.list[i].title + " (翻译)";
									for (j = 0, new_lyric.Artist = ""; j < song.data.song.list[i].singer.length; j++) {
										new_lyric.Artist += (j === 0 ? "" : ",") + song.data.song.list[i].singer[j].title;
									}
									new_lyric.Album = song.data.song.list[i].album.title;
									new_lyric.Source = get_my_name();
									callback.AddLyric(new_lyric);
								}
								break;
							case "newtype":
								if ((lyric.lyric.length > 128) && (lyric.trans.length > 128)) {
									new_lyric.LyricText = lrc_newtype(Base64.decode(lyric.lyric), Base64.decode(lyric.trans), true);
									new_lyric.Title = song.data.song.list[i].title + " (并列)";
									for (j = 0, new_lyric.Artist = ""; j < song.data.song.list[i].singer.length; j++) {
										new_lyric.Artist += (j === 0 ? "" : ",") + song.data.song.list[i].singer[j].title;
									}
									new_lyric.Album = song.data.song.list[i].album.title;
									new_lyric.Source = get_my_name();
									callback.AddLyric(new_lyric);
								}
								break;
							case "old_merge" :
								if ((lyric.lyric.length > 128) && (lyric.trans.length > 128)) {
									new_lyric.LyricText = lrc_merge(Base64.decode(lyric.lyric), Base64.decode(lyric.trans));
									new_lyric.Title = song.data.song.list[i].title + " (并排-旧)";
									for (j = 0, new_lyric.Artist = ""; j < song.data.song.list[i].singer.length; j++) {
										new_lyric.Artist += (j === 0 ? "" : ",") + song.data.song.list[i].singer[j].title;
									}
									new_lyric.Album = song.data.song.list[i].album.title;
									new_lyric.Source = get_my_name();
									callback.AddLyric(new_lyric);
								}
								break;
						}
					}
				}
				count++;
				if (count % 2 === 0) {
					callback.Refresh();
				}
			}
			new_lyric.Dispose();
		}
	}
}

function qm_download(url, param) {
	QM_CFG.DEBUG && qm_trace("INFO-qm_download-url: " + url + ", param: " + param);
	// retry several times at most
	var i = null, xml_text = null;
	for (i = 0; i < QM_CFG.RETRY; i++) {
		if (!qm_http.handle) {
			try {
				qm_http.handle = utils.CreateHttpClient();
				qm_http.type = "u_c";
			} catch (e) {
				QM_CFG.DEBUG && qm_trace("ERROR-qm_download-CreateHttpClient message: " + e.message);
				try {
					qm_http.handle = utils.CreateHttpRequest("GET");
					qm_http.type = "u_r";
				} catch (err) {
					QM_CFG.DEBUG && qm_trace("ERROR-qm_download-CreateHttpRequest message: " + err.message);
					try {
						qm_http.handle = new ActiveXObject("Microsoft.XMLHTTP");
						qm_http.type = "ie";
					} catch (error) {
						QM_CFG.DEBUG && qm_trace("ERROR-qm_download-ActiveXObject message: " + error.message);
						qm_http.handle = null;
						qm_http.type = null;
						continue;
					}
				}
			}
			QM_CFG.DEBUG && qm_trace("INFO-qm_download-qm_http.type: " + qm_http.type);
		}
		try {
			if (param) {
				url += "?" + encodeURI(param);
			}
			if (qm_http.type == "u_c") {
				qm_http.handle.addHttpHeader("Referer", QM_CFG.E_SRV);
				xml_text = qm_http.handle.Request(url, "GET");
				if (qm_http.handle.StatusCode == 200) {
					return xml_text;
				}
			} else if (qm_http.type == "u_r") {
				qm_http.AddHeader("Referer", QM_CFG.E_SRV);
				xml_text = qm_http.handle.Run(url);
				return xml_text;
			} else if (qm_http.type == "ie") {
				qm_http.handle.open("GET", url, false);
				qm_http.handle.setRequestHeader("Referer", QM_CFG.E_SRV);
				qm_http.handle.send();
				if (qm_http.handle.readyState == 4 && qm_http.handle.status == 200) {
					xml_text = qm_http.handle.responseText;
					return xml_text;
				}
			}
		} catch (e) {
			QM_CFG.DEBUG && qm_trace("ERROR-qm_download-request message: " + e.message);
			continue;
		}
	}
	QM_CFG.DEBUG && qm_trace("FAILED-qm_download");
	return null;
}

function qm_json(str) {
	if (typeof JSON == 'object') {
		return JSON.parse(str);
	} else {
		try {
			// Method 1: eval
			return eval("(" + str + ")");
		} catch (e) {
			QM_CFG.DEBUG && qm_trace("ERROR-qm_json-eval message: " + e.message);
			try {
				// Method 2: new Function
				return (new Function('return ' + str))();
			} catch (err) {
				QM_CFG.DEBUG && qm_trace("ERROR-qm_json-Function message: " + e.message);
				throw new SyntaxError('FAILED-qm_json');
				// Method 3: json2.js
			}
		}
	}
}

function qm_normalize(str) {
	var s = null;
	if (str) {
		s = str;
		// !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~
		s = s.replace(/([\u0021-\u002F]|[\u003A-\u0040]|[\u005B-\u0060]|[\u007B-\u007E])+/g, " ");
		// ！＂＃＄％＆＇（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝～
		s = s.replace(/([\uFF01-\uFF20]|[\uFF3B-\uFF40]|[\uFF5B-\uFF5E])+/g, " ");
		// ·×‐‑‒–—―‖‗‘’‚‛“”„‟…‧‰、。〇〈〉《》「」『』【】〔〕〖〗〜・
		s = s.replace(/(\u00B7|\u00D7|[\u2010-\u201F]|[\u2026-\u2027]|\u2030|[\u3001-\u3002]|[\u3007-\u3011]|[\u3014-\u3017]|\u301C|\u30FB)+/g, " ");
		s = s.replace(/\s+/g, " ");
	} else {
		s = "";
	}
	return s;
}

function qm_is_aborting() {
	if (qm_abort.isvalid) {
		try {
			return qm_abort.handle.IsAborting();
		} catch (e) {
			QM_CFG.DEBUG && qm_trace("ERROR-qm_is_aborting message: " + e.message);
			qm_abort.isvalid = false;
		}
	}
	return false;
}

function qm_trace(str) {
	if (QM_CFG.DEBUG) {
		fb.trace("QM_DEBUG> " + str);
	}
}

function lrc_merge(olrc, tlrc) {
	olrc = olrc.split("\n");
	tlrc = tlrc.split("\n");
	var o_f = olrc[0].indexOf("[by:");
	if (o_f == 0) {
		var o_b = olrc[0].indexOf("]");
		var o = (o_f != -1 && o_b != -1) ? olrc[0].substring(4, o_b) : "";

		var t_f = tlrc[0].indexOf("[by:");
		var t_b = tlrc[0].indexOf("]");
		var t = (t_f != -1 && t_b != -1) ? olrc[0].substring(4, o_b) : "";
		olrc[0] = "[by:" + o + "/译:" + t + "]";
	}
	for (var ii = 5,set=0,counter; ii < 10; ii++) {//玄学取set...
		counter = olrc[ii].indexOf("]");
		QM_CFG.DEBUG &&qm_trace(ii+':'+counter);
		counter = (counter == -1) ? 9 : counter;
		set+=counter;
	}
	set = Math.round(set/5);
	var i = 0;
	var l = tlrc.length;
	var lrc = [];
	for (var k in olrc) {
		var a = olrc[k].substring(1, set);
		while (i < l) {
			var j = 0;
			var tf = 0;
			while (j < 5) {
				if (i + j >= l) break;
				var b = tlrc[i + j].substring(1, set);
				if (a == b) {
					tf = 1;
					i += j;
					break;
				}
				j++;
			}
			if (tf == 0) {
				lrc[k] = olrc[k];
				break;
			}
			var c = tlrc[i].substr(set + 1);
			if (c) {
				lrc[k] = olrc[k] + bracket[0] + tlrc[i].substr(set + 1) + bracket[1];
				i++;
				break;
			} else {
				lrc[k] = olrc[k];
				break;
			}
		}
	}
	return lrc.join("\n");

}
function lrc_newtype(olrc, tlrc, merge_type) {
	olrc = olrc.split("\n");
	tlrc = tlrc.split("\n");
	for (var ii = 5,set=0,counter; ii < 10; ii++) {//玄学取set...
		counter = olrc[ii].indexOf("]");
		QM_CFG.DEBUG &&qm_trace(ii+':'+counter);
		counter = (counter == -1) ? 9 : counter;
		set+=counter;
	}
	set = Math.round(set/5);
	QM_CFG.DEBUG &&qm_trace("set:"+set);
	var i = 0;
	var l = tlrc.length;
	var lrc = new Array();
	var r = new Array();
	for (var k in olrc) {
		var a = olrc[k].substring(1, set);
		if (i >= l) break;//防溢出数组
		var j = 0;
		var tf = 0;//标记变量,时间轴符合置1
		while (j < 5) {
			if (i + j >= l) break;//防溢出数组
			var b = tlrc[i + j].substring(1, set);
			if (a == b) {
				tf = 1;
				i += j;
				break;
			}
			j++;
		}
		if (tf == 0) {
			r.push([k, false, a]);
		} else {
			r.push([k, i, a]);
		}

	}
	var l_r = r.length;

	if (merge_type) {
		for (var kk = 0; kk < l_r; kk++) {
			o = r[kk][0];
			t = r[kk][1];
			var o_lrc=olrc[o].substr(set + 1);
			o_lrc=o_lrc?olrc[o]:"["+r[kk][2]+"]  ";
			lrc.push(o_lrc);
			var t_lrc = t !==false && tlrc[t].substr(set + 1) ? bracket[0] + tlrc[t].substr(set + 1) + bracket[1] : " ";
			if (kk + 2 > l_r) break;
			if (r[kk + 1][2]) {
				var timeb = r[kk + 1][2].replace(/(])/, "");

				if (savefix) {
					var x = parseInt(timeb.substr(0, 2));
					var y = parseFloat(timeb.substr(3, set - 4));
					var ut = x * 60 + y - savefix;
					var time = "[" + prefix(Math.floor(ut / 60),2) + ":" + prefix((ut % 60).toFixed(2),5) + "]";
					QM_CFG.DEBUG && qm_trace("fixtime: " + time);
				} else var time = "[" + timeb + "]";
			} else {
				var x = parseInt(r[kk][2].substr(0, 2));
				var y = parseInt(r[kk][2].substr(3, 2));
				var z = r[kk][2].substr(5, 3);
				var ut = x * 60 + y + 4;
				var time = "[" + prefix(Math.floor(ut / 60),2) + ":" + prefix((ut % 60).toFixed(2),5) + "]";
				QM_CFG.DEBUG && qm_trace("orgtime: " + time);
			}

			lrc.push(time + t_lrc);
		}
	} else {
		if (timefix&&offset) lrc.push("[offset:"+offset+"]");
		for (var kk = 0; kk < l_r; kk++) {
			o = r[kk][0];
			t = r[kk][1];
			var o_lrc=olrc[o].substr(set + 1);
			o_lrc=o_lrc?olrc[o]:"["+r[kk][2]+"]  ";//重要：空格
			var t_lrc = t !==false && tlrc[t].substr(set + 1) ? bracket[0] + tlrc[t].substr(set + 1) + bracket[1] : " ";
			if (kk + 2 > l_r) break;
			if (r[kk + 1][2]) {
				var timeb = r[kk + 1][2].replace(/(])/, "");
				QM_CFG.DEBUG &&qm_trace("timeb="+timeb);

				if (timefix) {
					var x = parseInt(timeb.substr(0, 2));
					var y = parseFloat(timeb.substr(3, set - 4));
					var ut = x * 60 + y + timefix;
					var time = "[" + prefix(Math.floor(ut / 60),2) + ":" + prefix((ut % 60).toFixed(2),5) + "]";
					QM_CFG.DEBUG &&qm_trace("time="+time);
				} else {var time = "[" + timeb + "]";}
				lrc.push(o_lrc + " " + time + t_lrc);
			} else {
				var x = parseInt(r[kk][2].substr(0, 2));
				var y = parseInt(r[kk][2].substr(3, 2));
				var z = r[kk][2].substr(5, 3);
				var ut = x * 60 + y + 4;
				var time = "[" + prefix(Math.floor(ut / 60),2) + ":" + prefix((ut % 60).toFixed(2),5) + "]";
				lrc.push(o_lrc + " " + time + t_lrc);
				lrc.push(time+"-End-");
				QM_CFG.DEBUG && qm_trace(time);
			}
			QM_CFG.DEBUG &&qm_trace(o_lrc + time + t_lrc);
		}
	}


	QM_CFG.DEBUG && qm_trace("lyric length:" + lrc.length);
	return lrc.join("\n");

}
function prefix(num, length) {
 return (Array(length).join('0') + num).slice(-length);
}


// https://github.com/dankogai/js-base64
// https://github.com/dankogai/js-base64/raw/master/base64.min.js
(function(global){"use strict";var _Base64=global.Base64;var version="2.3.2";var buffer;if(typeof module!=="undefined"&&module.exports){try{buffer=require("buffer").Buffer}catch(err){}}var b64chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var b64tab=function(bin){var t={};for(var i=0,l=bin.length;i<l;i++)t[bin.charAt(i)]=i;return t}(b64chars);var fromCharCode=String.fromCharCode;var cb_utob=function(c){if(c.length<2){var cc=c.charCodeAt(0);return cc<128?c:cc<2048?fromCharCode(192|cc>>>6)+fromCharCode(128|cc&63):fromCharCode(224|cc>>>12&15)+fromCharCode(128|cc>>>6&63)+fromCharCode(128|cc&63)}else{var cc=65536+(c.charCodeAt(0)-55296)*1024+(c.charCodeAt(1)-56320);return fromCharCode(240|cc>>>18&7)+fromCharCode(128|cc>>>12&63)+fromCharCode(128|cc>>>6&63)+fromCharCode(128|cc&63)}};var re_utob=/[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;var utob=function(u){return u.replace(re_utob,cb_utob)};var cb_encode=function(ccc){var padlen=[0,2,1][ccc.length%3],ord=ccc.charCodeAt(0)<<16|(ccc.length>1?ccc.charCodeAt(1):0)<<8|(ccc.length>2?ccc.charCodeAt(2):0),chars=[b64chars.charAt(ord>>>18),b64chars.charAt(ord>>>12&63),padlen>=2?"=":b64chars.charAt(ord>>>6&63),padlen>=1?"=":b64chars.charAt(ord&63)];return chars.join("")};var btoa=global.btoa?function(b){return global.btoa(b)}:function(b){return b.replace(/[\s\S]{1,3}/g,cb_encode)};var _encode=buffer?buffer.from&&buffer.from!==Uint8Array.from?function(u){return(u.constructor===buffer.constructor?u:buffer.from(u)).toString("base64")}:function(u){return(u.constructor===buffer.constructor?u:new buffer(u)).toString("base64")}:function(u){return btoa(utob(u))};var encode=function(u,urisafe){return!urisafe?_encode(String(u)):_encode(String(u)).replace(/[+\/]/g,function(m0){return m0=="+"?"-":"_"}).replace(/=/g,"")};var encodeURI=function(u){return encode(u,true)};var re_btou=new RegExp(["[À-ß][-¿]","[à-ï][-¿]{2}","[ð-÷][-¿]{3}"].join("|"),"g");var cb_btou=function(cccc){switch(cccc.length){case 4:var cp=(7&cccc.charCodeAt(0))<<18|(63&cccc.charCodeAt(1))<<12|(63&cccc.charCodeAt(2))<<6|63&cccc.charCodeAt(3),offset=cp-65536;return fromCharCode((offset>>>10)+55296)+fromCharCode((offset&1023)+56320);case 3:return fromCharCode((15&cccc.charCodeAt(0))<<12|(63&cccc.charCodeAt(1))<<6|63&cccc.charCodeAt(2));default:return fromCharCode((31&cccc.charCodeAt(0))<<6|63&cccc.charCodeAt(1))}};var btou=function(b){return b.replace(re_btou,cb_btou)};var cb_decode=function(cccc){var len=cccc.length,padlen=len%4,n=(len>0?b64tab[cccc.charAt(0)]<<18:0)|(len>1?b64tab[cccc.charAt(1)]<<12:0)|(len>2?b64tab[cccc.charAt(2)]<<6:0)|(len>3?b64tab[cccc.charAt(3)]:0),chars=[fromCharCode(n>>>16),fromCharCode(n>>>8&255),fromCharCode(n&255)];chars.length-=[0,0,2,1][padlen];return chars.join("")};var atob=global.atob?function(a){return global.atob(a)}:function(a){return a.replace(/[\s\S]{1,4}/g,cb_decode)};var _decode=buffer?buffer.from&&buffer.from!==Uint8Array.from?function(a){return(a.constructor===buffer.constructor?a:buffer.from(a,"base64")).toString()}:function(a){return(a.constructor===buffer.constructor?a:new buffer(a,"base64")).toString()}:function(a){return btou(atob(a))};var decode=function(a){return _decode(String(a).replace(/[-_]/g,function(m0){return m0=="-"?"+":"/"}).replace(/[^A-Za-z0-9\+\/]/g,""))};var noConflict=function(){var Base64=global.Base64;global.Base64=_Base64;return Base64};global.Base64={VERSION:version,atob:atob,btoa:btoa,fromBase64:decode,toBase64:encode,utob:utob,encode:encode,encodeURI:encodeURI,btou:btou,decode:decode,noConflict:noConflict};if(typeof Object.defineProperty==="function"){var noEnum=function(v){return{value:v,enumerable:false,writable:true,configurable:true}};global.Base64.extendString=function(){Object.defineProperty(String.prototype,"fromBase64",noEnum(function(){return decode(this)}));Object.defineProperty(String.prototype,"toBase64",noEnum(function(urisafe){return encode(this,urisafe)}));Object.defineProperty(String.prototype,"toBase64URI",noEnum(function(){return encode(this,true)}))}}if(global["Meteor"]){Base64=global.Base64}if(typeof module!=="undefined"&&module.exports){module.exports.Base64=global.Base64}else if(typeof define==="function"&&define.amd){define([],function(){return global.Base64})}})(typeof self!=="undefined"?self:typeof window!=="undefined"?window:typeof global!=="undefined"?global:this);

