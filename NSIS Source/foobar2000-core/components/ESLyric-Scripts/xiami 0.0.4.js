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
    // retry several times at most
    var i = null, xml_text = null;
    for (i = 0; i < XM_CFG.RETRY; i++) {
        if (!xm_http.handle) {
            try {
                xm_http.handle = utils.CreateHttpClient();
                xm_http.type = "u_c";
            } catch (e) {
                try {
                    xm_http.handle = utils.CreateHttpRequest("GET");
                    xm_http.type = "u_r";
                } catch (err) {
                    try {
                        xm_http.handle = new ActiveXObject("Microsoft.XMLHTTP");
                        xm_http.type = "ie";
                    } catch (error) {
                        xm_http.handle = null;
                        xm_http.type = null;
                        continue;
                    }
                }
            }
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
            continue;
        }
    }
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
            try {
                // Method 2: new Function
                return (new Function('return ' + str))();
            } catch (err) {
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

function xm_is_aborting() {
    if (xm_abort.isvalid) {
        try {
            return xm_abort.handle.IsAborting();
        } catch (e) {
            xm_abort.isvalid = false;
        }
    }
    return false;
}
