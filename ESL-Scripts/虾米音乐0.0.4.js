/*----------------------------------------------
Date: 2017/10/14
Author: btx258
----------------------------------------------*/

var XM_CFG = {
    // DEBUG: true,
    E_SRV: "http://www.xiami.com/play",
    S_SRV: "http://www.xiami.com/search",
    L_SRV: "http://www.xiami.com/song/playlist/cat/json/id/",
    P_MAX: 1,
    L_LOW: 5,
    L_MAX: 10,
    RETRY: 1,
};

var xm_http = {
    handle: null,
    type: null,
    xmldom: null
};

var xm_abort = {
    handle: null,
    isvalid: true
};

function get_my_name() {
    return "XiamiMusic|虾米音乐";
}

function get_version() {
    return "0.0.4";
}

function get_author() {
    return "btx258";
}

function start_search(info, callback) {
    var html_text = null, json_text = null, new_lyric = null;
    var song = null, lyric = null, i = null, j = null;
    var page = null, count = null;
    var reg = new RegExp("play\\\(\\\'(\\d+)\\\'","g"), reg_text = null;
    xm_abort.handle = callback;
    xm_abort.isvalid = true;
    for (page = 0, count = 0; page < XM_CFG.P_MAX && count < XM_CFG.L_LOW; page++) {
        if (xm_is_aborting()) {
            break;
        }
        html_text = xm_download(XM_CFG.S_SRV,
            "key=" + xm_normalize(info.Title) + "+" + xm_normalize(info.Artist)
            );
        if (html_text) {
            for (i = 0, song = []; reg_text = reg.exec(html_text); i++) {
                song[i] = reg_text[1];
                // xm_trace("INFO-start_search-song[i]: " + song[i] + ", i: " + i);
            }
        }
        if (song.length) {
            json_text = xm_download(XM_CFG.L_SRV
                + song.join(",")
                , null);
            try {
                lyric = xm_json(json_text);
            } catch (e) {
                lyric = {
                    data: {
                        trackList: []
                    }
                };
            }
            new_lyric = fb.CreateLyric();
            for (i = 0; i < lyric.data.trackList.length && count < XM_CFG.L_MAX; i++) {
                if (xm_is_aborting()) {
                    break;
                }
                new_lyric.Title = lyric.data.trackList[i].songName;
                new_lyric.Artist = lyric.data.trackList[i].artist_name;
                new_lyric.Album = lyric.data.trackList[i].album_name;
                new_lyric.Source = get_my_name();
                html_text = lyric.data.trackList[i].lyric_url;
                if (html_text.search(/^\/\//i) === 0) {
                    html_text = "http:" + html_text;
                } else if (html_text === null || html_text.length === 0) {
                    continue;
                }
                new_lyric.LyricText = xm_download(html_text, null);
                // xm_trace("INFO-start_search-LyricText: " + new_lyric.LyricText);
                if (new_lyric.LyricText) {
                    callback.AddLyric(new_lyric);
                    count++;
                }
                if (count % 2 === 0) {
                    callback.Refresh();
                }
            }
            new_lyric.Dispose();
        }
    }
}

function xm_download(url, param) {
    // xm_trace("INFO-xm_download-url: " + url + ", param: " + param);
    // retry several times at most
    var i = null, xml_text = null;
    for (i = 0; i < XM_CFG.RETRY; i++) {
        if (!xm_http.handle) {
            try {
                xm_http.handle = utils.CreateHttpClient();
                xm_http.type = "u_c";
            } catch (e) {
                // xm_trace("ERROR-xm_download-CreateHttpClient message: " + e.message);
                try {
                    xm_http.handle = utils.CreateHttpRequest("GET");
                    xm_http.type = "u_r";
                } catch (err) {
                    // xm_trace("ERROR-xm_download-CreateHttpRequest message: " + err.message);
                    try {
                        xm_http.handle = new ActiveXObject("Microsoft.XMLHTTP");
                        xm_http.type = "ie";
                    } catch (error) {
                        // xm_trace("ERROR-xm_download-ActiveXObject message: " + error.message);
                        xm_http.handle = null;
                        xm_http.type = null;
                        continue;
                    }
                }
            }
            // xm_trace("INFO-xm_download-xm_http.type: " + xm_http.type);
        }
        try {
            if (param) {
                url += "?" + encodeURI(param);
            }
            if (xm_http.type == "u_c") {
                xm_http.handle.addHttpHeader("Referer", XM_CFG.E_SRV);
                xml_text = xm_http.handle.Request(url, "GET");
                if (xm_http.handle.StatusCode == 200) {
                    return xml_text;
                }
            } else if (xm_http.type == "u_r") {
                xm_http.AddHeader("Referer", XM_CFG.E_SRV);
                xml_text = xm_http.handle.Run(url);
                return xml_text;
            } else if (xm_http.type == "ie") {
                xm_http.handle.open("GET", url, false);
                xm_http.handle.setRequestHeader("Referer", XM_CFG.E_SRV);
                xm_http.handle.send();
                if (xm_http.handle.readyState == 4 && xm_http.handle.status == 200) {
                    xml_text = xm_http.handle.responseText;
                    return xml_text;
                }
            }
        } catch (e) {
            // xm_trace("ERROR-xm_download-request message: " + e.message);
            continue;
        }
    }
    // xm_trace("FAILED-xm_download");
    return null;
}

function xm_json(str) {
    if (typeof JSON == 'object') {
        return JSON.parse(str);
    } else {
        try {
            // Method 1: eval
            return eval("(" + str + ")");
        } catch (e) {
            // xm_trace("ERROR-xm_json-eval message: " + e.message);
            try {
                // Method 2: new Function
                return (new Function('return ' + str))();
            } catch (err) {
                // xm_trace("ERROR-xm_json-Function message: " + e.message);
                throw new SyntaxError('FAILED-xm_json');
                // Method 3: json2.js
            }
        }
    }
}

function xm_normalize(str) {
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

function xm_capitalize(str) {
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

// function xm_create_array(length) {
//     var arr = null, i = null;
//     arr = new Array(length);
//     for (i = 0; i < arr.length; i++) {
//         arr[i] = {};
//     }
//     return arr;
// }

function xm_is_aborting() {
    if (xm_abort.isvalid) {
        try {
            return xm_abort.handle.IsAborting();
        } catch (e) {
            // xm_trace("ERROR-xm_is_aborting message: " + e.message);
            xm_abort.isvalid = false;
        }
    }
    return false;
}

function xm_trace(str) {
    if (XM_CFG.DEBUG) {
        fb.trace("XM_DEBUG> " + str);
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

