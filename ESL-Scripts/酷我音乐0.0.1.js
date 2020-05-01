/*----------------------------------------------
Date: 2017/10/14
Author: btx258
----------------------------------------------*/

var KW_CFG = {
    // DEBUG: true,
    S_SRV: "http://sou.kuwo.cn/ws/NSearch",
    L_SRV: "http://www.kuwo.cn/yinyue/",
    P_MAX: 1,
    L_LOW: 5,
    L_MAX: 10,
    RETRY: 1,
};

var kw_http = {
    handle: null,
    type: null,
};

var kw_abort = {
    handle: null,
    isvalid: true
};

function get_my_name() {
    return "KuwoMusic|酷我音乐";
}

function get_version() {
    return "0.0.1";
}

function get_author() {
    return "btx258";
}

function start_search(info, callback) {
    var html_text = null, json_text = null, new_lyric = null;
    var song = null, lyric = null, i = null, j = null;
    var page = null, count = null;
    var reg = null, reg_text = null;
    kw_abort.handle = callback;
    kw_abort.isvalid = true;
    for (page = 0, count = 0; page < KW_CFG.P_MAX && count < KW_CFG.L_LOW; page++) {
        if (kw_is_aborting()) {
            break;
        }
        html_text = kw_download(KW_CFG.S_SRV,
            "key=" + kw_normalize(info.Title) + "+" + kw_normalize(info.Artist)
            + "&pn=" + (page + 1)
            + "&type=music"
            );
        if (html_text) {
            reg = new RegExp("mid=\\\"(\\d+)\\\"","g");
            for (i = 0, song = []; reg_text = reg.exec(html_text); i++) {
                song[i] = reg_text[1];
            }
        }
        if (song && song.length) {
            new_lyric = fb.CreateLyric();
            for (i = 0; i < song.length && count < KW_CFG.L_MAX; i++) {
                if (kw_is_aborting()) {
                    break;
                }
                html_text = kw_download(KW_CFG.L_SRV
                    + song[i] + "/"
                    , null);
                reg = new RegExp("\\blrcList\\b[^\\\[]+(\\\[[^\\\]]*\\\])","g");
                if (reg_text = reg.exec(html_text)) {
                    json_text = reg_text[1];
                    try {
                        lyric = kw_json(json_text);
                    } catch (e) {
                        lyric = [];
                    }
                    new_lyric.LyricText = kw_parser(lyric);
                    if (new_lyric.LyricText.length > 128) {
                        reg = new RegExp("=\\\"lrcName\\\">(.*?)</p>.*?=\\\"album\\\".+?([^><]*)</a>.+?=\\\"artist\\\".+?([^><]*)</a>","g");
                        if (reg_text = reg.exec(html_text.replace(/\r|\n/g,""))) {
                            new_lyric.Title = reg_text[1];
                            new_lyric.Album = reg_text[2];
                            new_lyric.Artist = reg_text[3];
                            new_lyric.Source = get_my_name();
                            callback.AddLyric(new_lyric);
                            count++;
                            if (count % 2 === 0) {
                                callback.Refresh();
                            }
                        }
                    }
                }
            }
            new_lyric.Dispose();
        } else {
            break;
        }
    }
}

function kw_download(url, param) {
    // kw_trace("INFO-kw_download-url: " + url + ", param: " + param);
    // retry several times at most
    var i = null, xml_text = null;
    for (i = 0; i < KW_CFG.RETRY; i++) {
        if (!kw_http.handle) {
            try {
                kw_http.handle = utils.CreateHttpClient();
                kw_http.type = "u_c";
            } catch (e) {
                // kw_trace("ERROR-kw_download-CreateHttpClient message: " + e.message);
                try {
                    kw_http.handle = utils.CreateHttpRequest("GET");
                    kw_http.type = "u_r";
                } catch (err) {
                    // kw_trace("ERROR-kw_download-CreateHttpRequest message: " + err.message);
                    try {
                        kw_http.handle = new ActiveXObject("Microsoft.XMLHTTP");
                        kw_http.type = "ie";
                    } catch (error) {
                        // kw_trace("ERROR-kw_download-ActiveXObject message: " + error.message);
                        kw_http.handle = null;
                        kw_http.type = null;
                        continue;
                    }
                }
            }
            // kw_trace("INFO-kw_download-kw_http.type: " + kw_http.type);
        }
        try {
            if (param) {
                url += "?" + encodeURI(param);
            }
            if (kw_http.type == "u_c") {
                // kw_http.handle.addHttpHeader("Referer", KW_CFG.E_SRV);
                xml_text = kw_http.handle.Request(url, "GET");
                if (kw_http.handle.StatusCode == 200) {
                    return xml_text;
                }
            } else if (kw_http.type == "u_r") {
                // kw_http.AddHeader("Referer", KW_CFG.E_SRV);
                xml_text = kw_http.handle.Run(url);
                return xml_text;
            } else if (kw_http.type == "ie") {
                kw_http.handle.open("GET", url, false);
                // kw_http.handle.setRequestHeader("Referer", KW_CFG.E_SRV);
                kw_http.handle.send();
                if (kw_http.handle.readyState == 4 && kw_http.handle.status == 200) {
                    xml_text = kw_http.handle.responseText;
                    return xml_text;
                }
            }
        } catch (e) {
            // kw_trace("ERROR-kw_download-request message: " + e.message);
            continue;
        }
    }
    // kw_trace("FAILED-kw_download");
    return null;
}

function kw_parser(arr) {
    var str = "";
    if (arr && arr.length) {
        for (var i = 0; i < arr.length; i++) {
            try {
                str += kw_time_converter(arr[i].time) + arr[i].lineLyric + "\r\n";
            } catch (e) {
                str = "";
                break;
            }
        }
    }
    return str;
}

function kw_time_converter(str) {
    var num = Number(str);
    var s = "[" + ("00" + parseInt(num / 60)).slice(-2)
        + ":" + ("00" + parseInt(num % 60)).slice(-2)
        + "." + num.toFixed(2).slice(-2)
        + "]";
    return s;
}

function kw_json(str) {
    if (typeof JSON == 'object') {
        return JSON.parse(str);
    } else {
        try {
            // Method 1: eval
            return eval("(" + str + ")");
        } catch (e) {
            // kw_trace("ERROR-kw_json-eval message: " + e.message);
            try {
                // Method 2: new Function
                return (new Function('return ' + str))();
            } catch (err) {
                // kw_trace("ERROR-kw_json-Function message: " + e.message);
                throw new SyntaxError('FAILED-kw_json');
                // Method 3: json2.js
            }
        }
    }
}

function kw_normalize(str) {
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

function kw_capitalize(str) {
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

// function kw_create_array(length) {
//     var arr = null, i = null;
//     arr = new Array(length);
//     for (i = 0; i < arr.length; i++) {
//         arr[i] = {};
//     }
//     return arr;
// }

function kw_is_aborting() {
    if (kw_abort.isvalid) {
        try {
            return kw_abort.handle.IsAborting();
        } catch (e) {
            // kw_trace("ERROR-kw_is_aborting message: " + e.message);
            kw_abort.isvalid = false;
        }
    }
    return false;
}

function kw_trace(str) {
    if (KW_CFG.DEBUG) {
        fb.trace("KW_DEBUG> " + str);
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

