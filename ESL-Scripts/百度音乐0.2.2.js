/*----------------------------------------------
Date: 2017/10/14
Author: btx258
----------------------------------------------*/

var BD_CFG = {
    // DEBUG: true,
    D_SRV: "http://music.baidu.com",
    S_SRV: "http://music.baidu.com/search",
    C_SRV: "http://music.baidu.com/search/lrc",
    L_SRV: "http://play.baidu.com/data/music/songlink",
    U_FLG: "C",
    P_MAX: 2,
    L_LOW: 5,
    L_MAX: 10,
    RETRY: 1,
};

var bd_http = {
    handle: null,
    type: null,
};

var bd_abort = {
    handle: null,
    isvalid: true
};

function get_my_name() {
    return "BaiduMusic|百度音乐";
}

function get_version() {
    return "0.2.2";
}

function get_author() {
    return "btx258";
}

function start_search(info, callback) {
    var html_text = null, json_text = null, new_lyric = null;
    var song = null, lyric = null, i = null, j = null;
    var page = null, count = null;
    var reg = new RegExp("\\\{&quot;id&quot;:&quot;(\\\d+)&quot;","g"), reg_text = null;
    var flag = BD_CFG.U_FLG;
    bd_abort.handle = callback;
    bd_abort.isvalid = true;
    for (page = 0, count = 0; page < BD_CFG.P_MAX && count < BD_CFG.L_LOW; page++) {
        if (bd_is_aborting()) {
            break;
        }
        if (flag == "S") {
            html_text = bd_download(BD_CFG.S_SRV,
                "key=" + bd_normalize(info.Title) + "+" + bd_normalize(info.Artist)
                + "&start=" + (page * 20)
                );
        } else if (flag == "C") {
            html_text = bd_download(BD_CFG.C_SRV,
                "key=" + bd_normalize(info.Title) + "+" + bd_normalize(info.Artist)
                + "&start=" + (page * 10)
                );
        } else {
            break;
        }
        if (html_text) {
            for (i = 0, song = []; reg_text = reg.exec(html_text); i++) {
                song[i] = reg_text[1];
            }
        }
        if (song && song.length) {
            json_text = bd_download(BD_CFG.L_SRV,
                "songIds=" + song.join(",")
                );
            try {
                lyric = bd_json(json_text);
                if (!lyric.data.songList.length) {
                    continue;
                }
            } catch (e) {
                continue;
            }
            new_lyric = fb.CreateLyric();
            for (i = 0; i < lyric.data.songList.length && count < BD_CFG.L_MAX; i++) {
                if (bd_is_aborting()) {
                    break;
                }
                new_lyric.Title = lyric.data.songList[i].songName;
                new_lyric.Artist = lyric.data.songList[i].artistName;
                new_lyric.Album = lyric.data.songList[i].albumName;
                new_lyric.Source = get_my_name();
                html_text = lyric.data.songList[i].lrcLink;
                if (html_text && html_text.length) {
                    if (html_text.search(/^http/i)) {
                        new_lyric.LyricText = bd_download(BD_CFG.D_SRV + html_text, null);
                    } else {
                        new_lyric.LyricText = bd_download(html_text, null);
                    }
                    if (new_lyric.LyricText) {
                        callback.AddLyric(new_lyric);
                        count++;
                    }
                    if (count % 2 === 0) {
                        callback.Refresh();
                    }
                }
            }
            new_lyric.Dispose();
        } else {
            if (flag == BD_CFG.U_FLG) {
                flag = (BD_CFG.U_FLG == "C" ? "S" : "C");
                page = -1;
                continue;
            } else {
                break;
            }
        }
    }
}

function bd_download(url, param) {
    // bd_trace("INFO-bd_download-url: " + url + ", param: " + param);
    // retry several times at most
    var i = null, xml_text = null;
    for (i = 0; i < BD_CFG.RETRY; i++) {
        if (!bd_http.handle) {
            try {
                bd_http.handle = utils.CreateHttpClient();
                bd_http.type = "u_c";
            } catch (e) {
                // bd_trace("ERROR-bd_download-CreateHttpClient message: " + e.message);
                try {
                    bd_http.handle = utils.CreateHttpRequest("GET");
                    bd_http.type = "u_r";
                } catch (err) {
                    // bd_trace("ERROR-bd_download-CreateHttpRequest message: " + err.message);
                    try {
                        bd_http.handle = new ActiveXObject("Microsoft.XMLHTTP");
                        bd_http.type = "ie";
                    } catch (error) {
                        // bd_trace("ERROR-bd_download-ActiveXObject message: " + error.message);
                        bd_http.handle = null;
                        bd_http.type = null;
                        continue;
                    }
                }
            }
            // bd_trace("INFO-bd_download-bd_http.type: " + bd_http.type);
        }
        try {
            if (param) {
                url += "?" + encodeURI(param);
            }
            if (bd_http.type == "u_c") {
                // bd_http.handle.addHttpHeader("Referer", BD_CFG.E_SRV);
                xml_text = bd_http.handle.Request(url, "GET");
                if (bd_http.handle.StatusCode == 200) {
                    return xml_text;
                }
            } else if (bd_http.type == "u_r") {
                // bd_http.AddHeader("Referer", BD_CFG.E_SRV);
                xml_text = bd_http.handle.Run(url);
                return xml_text;
            } else if (bd_http.type == "ie") {
                bd_http.handle.open("GET", url, false);
                // bd_http.handle.setRequestHeader("Referer", BD_CFG.E_SRV);
                bd_http.handle.send();
                if (bd_http.handle.readyState == 4 && bd_http.handle.status == 200) {
                    xml_text = bd_http.handle.responseText;
                    return xml_text;
                }
            }
        } catch (e) {
            // bd_trace("ERROR-bd_download-request message: " + e.message);
            continue;
        }
    }
    // bd_trace("FAILED-bd_download");
    return null;
}

function bd_json(str) {
    if (typeof JSON == 'object') {
        return JSON.parse(str);
    } else {
        try {
            // Method 1: eval
            return eval("(" + str + ")");
        } catch (e) {
            // bd_trace("ERROR-bd_json-eval message: " + e.message);
            try {
                // Method 2: new Function
                return (new Function('return ' + str))();
            } catch (err) {
                // bd_trace("ERROR-bd_json-Function message: " + e.message);
                throw new SyntaxError('FAILED-bd_json');
                // Method 3: json2.js
            }
        }
    }
}

function bd_normalize(str) {
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

function bd_capitalize(str) {
    var s = null;
    if (str) {
        s = str;
        s = s.toLowerCase().replace(/(\b[a-z])/g, function(c) {
            return c.toUpperCase();
        }
        );
    } else {
        s = "";
    }
    return s;
}

// function bd_create_array(length) {
//     var arr = null, i = null;
//     arr = new Array(length);
//     for (i = 0; i < arr.length; i++) {
//         arr[i] = {};
//     }
//     return arr;
// }

function bd_is_aborting() {
    if (bd_abort.isvalid) {
        try {
            return bd_abort.handle.IsAborting();
        } catch (e) {
            // bd_trace("ERROR-bd_is_aborting message: " + e.message);
            bd_abort.isvalid = false;
        }
    }
    return false;
}

function bd_trace(str) {
    if (BD_CFG.DEBUG) {
        fb.trace("BD_DEBUG> " + str);
    }
}

// function encodeUnicode(str) {
//     var i = null, s = "";
//     for (i = 0; i < str.length; i++) {
//         s += "\\u" + ("0000" + str.charCodeAt(i).toString(16).toUpperCase()).slice(-4);
//     }
//     return s;
// }
//
// function decodeUnicode(str) {
//     return unescape(str.replace(/\\/g, "%"));
// }
//
// 
// https://github.com/dankogai/js-base64
// https://github.com/dankogai/js-base64/raw/master/base64.min.js
// (function(global){"use strict";var _Base64=global.Base64;var version="2.3.2";var buffer;if(typeof module!=="undefined"&&module.exports){try{buffer=require("buffer").Buffer}catch(err){}}var b64chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var b64tab=function(bin){var t={};for(var i=0,l=bin.length;i<l;i++)t[bin.charAt(i)]=i;return t}(b64chars);var fromCharCode=String.fromCharCode;var cb_utob=function(c){if(c.length<2){var cc=c.charCodeAt(0);return cc<128?c:cc<2048?fromCharCode(192|cc>>>6)+fromCharCode(128|cc&63):fromCharCode(224|cc>>>12&15)+fromCharCode(128|cc>>>6&63)+fromCharCode(128|cc&63)}else{var cc=65536+(c.charCodeAt(0)-55296)*1024+(c.charCodeAt(1)-56320);return fromCharCode(240|cc>>>18&7)+fromCharCode(128|cc>>>12&63)+fromCharCode(128|cc>>>6&63)+fromCharCode(128|cc&63)}};var re_utob=/[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;var utob=function(u){return u.replace(re_utob,cb_utob)};var cb_encode=function(ccc){var padlen=[0,2,1][ccc.length%3],ord=ccc.charCodeAt(0)<<16|(ccc.length>1?ccc.charCodeAt(1):0)<<8|(ccc.length>2?ccc.charCodeAt(2):0),chars=[b64chars.charAt(ord>>>18),b64chars.charAt(ord>>>12&63),padlen>=2?"=":b64chars.charAt(ord>>>6&63),padlen>=1?"=":b64chars.charAt(ord&63)];return chars.join("")};var btoa=global.btoa?function(b){return global.btoa(b)}:function(b){return b.replace(/[\s\S]{1,3}/g,cb_encode)};var _encode=buffer?buffer.from&&buffer.from!==Uint8Array.from?function(u){return(u.constructor===buffer.constructor?u:buffer.from(u)).toString("base64")}:function(u){return(u.constructor===buffer.constructor?u:new buffer(u)).toString("base64")}:function(u){return btoa(utob(u))};var encode=function(u,urisafe){return!urisafe?_encode(String(u)):_encode(String(u)).replace(/[+\/]/g,function(m0){return m0=="+"?"-":"_"}).replace(/=/g,"")};var encodeURI=function(u){return encode(u,true)};var re_btou=new RegExp(["[À-ß][-¿]","[à-ï][-¿]{2}","[ð-÷][-¿]{3}"].join("|"),"g");var cb_btou=function(cccc){switch(cccc.length){case 4:var cp=(7&cccc.charCodeAt(0))<<18|(63&cccc.charCodeAt(1))<<12|(63&cccc.charCodeAt(2))<<6|63&cccc.charCodeAt(3),offset=cp-65536;return fromCharCode((offset>>>10)+55296)+fromCharCode((offset&1023)+56320);case 3:return fromCharCode((15&cccc.charCodeAt(0))<<12|(63&cccc.charCodeAt(1))<<6|63&cccc.charCodeAt(2));default:return fromCharCode((31&cccc.charCodeAt(0))<<6|63&cccc.charCodeAt(1))}};var btou=function(b){return b.replace(re_btou,cb_btou)};var cb_decode=function(cccc){var len=cccc.length,padlen=len%4,n=(len>0?b64tab[cccc.charAt(0)]<<18:0)|(len>1?b64tab[cccc.charAt(1)]<<12:0)|(len>2?b64tab[cccc.charAt(2)]<<6:0)|(len>3?b64tab[cccc.charAt(3)]:0),chars=[fromCharCode(n>>>16),fromCharCode(n>>>8&255),fromCharCode(n&255)];chars.length-=[0,0,2,1][padlen];return chars.join("")};var atob=global.atob?function(a){return global.atob(a)}:function(a){return a.replace(/[\s\S]{1,4}/g,cb_decode)};var _decode=buffer?buffer.from&&buffer.from!==Uint8Array.from?function(a){return(a.constructor===buffer.constructor?a:buffer.from(a,"base64")).toString()}:function(a){return(a.constructor===buffer.constructor?a:new buffer(a,"base64")).toString()}:function(a){return btou(atob(a))};var decode=function(a){return _decode(String(a).replace(/[-_]/g,function(m0){return m0=="-"?"+":"/"}).replace(/[^A-Za-z0-9\+\/]/g,""))};var noConflict=function(){var Base64=global.Base64;global.Base64=_Base64;return Base64};global.Base64={VERSION:version,atob:atob,btoa:btoa,fromBase64:decode,toBase64:encode,utob:utob,encode:encode,encodeURI:encodeURI,btou:btou,decode:decode,noConflict:noConflict};if(typeof Object.defineProperty==="function"){var noEnum=function(v){return{value:v,enumerable:false,writable:true,configurable:true}};global.Base64.extendString=function(){Object.defineProperty(String.prototype,"fromBase64",noEnum(function(){return decode(this)}));Object.defineProperty(String.prototype,"toBase64",noEnum(function(urisafe){return encode(this,urisafe)}));Object.defineProperty(String.prototype,"toBase64URI",noEnum(function(){return encode(this,true)}))}}if(global["Meteor"]){Base64=global.Base64}if(typeof module!=="undefined"&&module.exports){module.exports.Base64=global.Base64}else if(typeof define==="function"&&define.amd){define([],function(){return global.Base64})}})(typeof self!=="undefined"?self:typeof window!=="undefined"?window:typeof global!=="undefined"?global:this);

