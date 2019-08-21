/*----------------------------------------------
Date: 2017/10/14
Author: btx258
----------------------------------------------*/

var BD_CFG = {
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
    // retry several times at most
    var i = null, xml_text = null;
    for (i = 0; i < BD_CFG.RETRY; i++) {
        if (!bd_http.handle) {
            try {
                bd_http.handle = utils.CreateHttpClient();
                bd_http.type = "u_c";
            } catch (e) {
                try {
                    bd_http.handle = utils.CreateHttpRequest("GET");
                    bd_http.type = "u_r";
                } catch (err) {
                    try {
                        bd_http.handle = new ActiveXObject("Microsoft.XMLHTTP");
                        bd_http.type = "ie";
                    } catch (error) {
                        bd_http.handle = null;
                        bd_http.type = null;
                        continue;
                    }
                }
            }
        }
        try {
            if (param) {
                url += "?" + encodeURI(param);
            }
            if (bd_http.type == "u_c") {
                xml_text = bd_http.handle.Request(url, "GET");
                if (bd_http.handle.StatusCode == 200) {
                    return xml_text;
                }
            } else if (bd_http.type == "u_r") {
                xml_text = bd_http.handle.Run(url);
                return xml_text;
            } else if (bd_http.type == "ie") {
                bd_http.handle.open("GET", url, false);
                bd_http.handle.send();
                if (bd_http.handle.readyState == 4 && bd_http.handle.status == 200) {
                    xml_text = bd_http.handle.responseText;
                    return xml_text;
                }
            }
        } catch (e) {
            continue;
        }
    }
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
            try {
                // Method 2: new Function
                return (new Function('return ' + str))();
            } catch (err) {
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

function bd_is_aborting() {
    if (bd_abort.isvalid) {
        try {
            return bd_abort.handle.IsAborting();
        } catch (e) {
            bd_abort.isvalid = false;
        }
    }
    return false;
}
