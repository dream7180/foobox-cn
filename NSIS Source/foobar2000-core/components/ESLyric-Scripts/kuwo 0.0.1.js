/*----------------------------------------------
Date: 2017/10/14
Author: btx258
----------------------------------------------*/

var KW_CFG = {
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
    // retry several times at most
    var i = null, xml_text = null;
    for (i = 0; i < KW_CFG.RETRY; i++) {
        if (!kw_http.handle) {
            try {
                kw_http.handle = utils.CreateHttpClient();
                kw_http.type = "u_c";
            } catch (e) {
                try {
                    kw_http.handle = utils.CreateHttpRequest("GET");
                    kw_http.type = "u_r";
                } catch (err) {
                    try {
                        kw_http.handle = new ActiveXObject("Microsoft.XMLHTTP");
                        kw_http.type = "ie";
                    } catch (error) {
                        kw_http.handle = null;
                        kw_http.type = null;
                        continue;
                    }
                }
            }
        }
        try {
            if (param) {
                url += "?" + encodeURI(param);
            }
            if (kw_http.type == "u_c") {
                xml_text = kw_http.handle.Request(url, "GET");
                if (kw_http.handle.StatusCode == 200) {
                    return xml_text;
                }
            } else if (kw_http.type == "u_r") {
                xml_text = kw_http.handle.Run(url);
                return xml_text;
            } else if (kw_http.type == "ie") {
                kw_http.handle.open("GET", url, false);
                kw_http.handle.send();
                if (kw_http.handle.readyState == 4 && kw_http.handle.status == 200) {
                    xml_text = kw_http.handle.responseText;
                    return xml_text;
                }
            }
        } catch (e) {
            continue;
        }
    }
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
            try {
                // Method 2: new Function
                return (new Function('return ' + str))();
            } catch (err) {
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

function kw_is_aborting() {
    if (kw_abort.isvalid) {
        try {
            return kw_abort.handle.IsAborting();
        } catch (e) {
            kw_abort.isvalid = false;
        }
    }
    return false;
}
