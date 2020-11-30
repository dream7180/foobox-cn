// Created by Elia <elia.of.little@gmail.com>
// Update 2016-08-09 19:36
// Require:
// - foobar2000 v1.3.3+ with ESLyric v0.3.5+
// Thanks: 
// - Moon for netease's api >>> [http://moonlib.com/606.html]
// - ttsping for ESLyric and sample scripts
// - keperlia, ABC超人1, etc
//
// Another NeteaseCloudMusicScript here:
//  [http://tieba.baidu.com/p/4651402375?pn=1]
//
// Issues || bug reports || advices are all encouraged!

var header = {
    'Referer': 'http://music.163.com/',
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36'
    //'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36'
};
var cookie = "appver=2.0.2";

var api = {
    "lyric": 'http://music.163.com/api/song/lyric',
    "query": "http://music.163.com/api/search/get/"
};

// Set false if do not want console output infos.
var dbg = false;

// Eng | CHN, separated by `|', but only one will be displayed in lyric search
// window (`Source' column) acording to foobar2000.exe's lang.
function get_my_name() {
    return "NeteaseCloudMusic|网易云音乐";
}

function get_version() {
    return "0.0.1";
}

function get_author() {
    return "Elia";
}

function start_search(info, callback) {

    var url;
    var title = info.Title;
    var artist = info.Artist;

    var http_client = utils.CreateHttpClient();
    var json_txt;

    // Set headers, Cookie, postData
    add_headers(header, http_client);
    http_client.addCookie("Cookie", cookie);
    http_client.addPostData(get_search_params(artist, title));

    json_txt = http_client.Request(api.query, "POST");
    if (http_client.StatusCode != 200) {
        console("Request url >>>" + api.query + "<<< error: " + http_client.StatusCode);
        return;
    }

    var obj_result = json(json_txt)["result"];
    var songs;
    if (obj_result.songs) {
        songs = obj_result.songs;
        console(songs.length);
    } else {
        console(json_txt);
        return;
    }

    console(json_txt);

    var _new_lyric = callback.CreateLyric();
    var id;

    // get lyrics
    for (var i = 0; i < songs.length; i++) {
        if (callback.IsAborting()) {
            console("User aborted!");
            break;
        }
        try {
            id = songs[i]["id"];
            artist = songs[i].artists[0].name;
            title = songs[i].name;
            album = songs[i].album.name;
        } catch (e) { };
        url = api.lyric + "?os=pc&id=" + id + "&lv=-1&kv=-1&tv=-1";
        add_headers(header, http_client);
        json_txt = http_client.Request(url);
        if (http_client.StatusCode != 200) {
            console("Request url >>>" + url + "<<< error: " + http_client.StatusCode);
            continue;
        }
        // 
        try {
            _new_lyric.LyricText = json(json_txt).lrc.lyric;
            _new_lyric.Title = title;
            _new_lyric.Artist = artist;
            _new_lyric.Album = album;
            _new_lyric.Location = url;
            _new_lyric.Source = get_my_name();
            callback.AddLyric(_new_lyric);
            (i%2 == 0) && callback.Refresh();
        } catch (e) {
            console("Unkown, failed to add lyric");
        }
    }

    _new_lyric.Dispose();

}

function add_headers(header, client) {
    for (var i in header) {
        client.addHttpHeader(i, header[i]);
    }
}

function get_search_params(artist, title, limit, type, offset) {
    if (limit == undefined) limit = 10;
    if (type == undefined) type = 1;
    if (offset == undefined) offset = 0;
    artist = process_keywords(artist);
    title = process_keywords(title);
    return "s=" + artist + "+" + title + "&limit=" + limit + "&type=" + type + "&offset=" + offset;
};


function process_keywords(str) {
    var s = str;
    s = s.toLowerCase();
    s = s.replace(/\'|·|\$|\&|–/g, "");
    //truncate all symbols
    s = s.replace(/\(.*?\)|\[.*?]|{.*?}|（.*?/g, "");
    s = s.replace(/[-/:-@[-`{-~]+/g, "");
    s = s.replace(/[\u2014\u2018\u201c\u2026\u3001\u3002\u300a\u300b\u300e\u300f\u3010\u3011\u30fb\uff01\uff08\uff09\uff0c\uff1a\uff1b\uff1f\uff5e\uffe5]+/g, "");
    return s;
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

function console(s) {
    if (dbg) {
        return;
    }
    fb.trace(get_my_name() + " $>  " + s);
};


// TODO: grab klyric && tlyric too.
