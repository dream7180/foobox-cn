//by EHfive, https://github.com/EHfive/Some-js-script-for-FB2K, mod by Asion, dreamawake for foobox http://blog.sina.com.cn/dream7180
var debug=false;
var StatusHeadersAvailable = 1 << 0;
var StatusDataReadComplete = 1 << 1;
var downloaded = -1;//-1:no download, 0: download start, 1: download completed, >1: completed...
client = utils.CreateHttpRequestEx(window.ID);

function search_album(idx, title,artist,album, path, filename){
	downloaded = 0;
	var xmlHttp = new ActiveXObject("Microsoft.XMLHTTP"), xmlHttp2 = new ActiveXObject("WinHttp.WinHttpRequest.5.1");
	var searchURL, infoURL;
	var limit = 3;
	//删除feat.及之后内容并保存
	var str1 = del(title, "feat.");
	var str2 = del(artist, "feat.");
	var title = str1[0];
	var outstr1 = str1[1];
	var artist = str2[0];
	var outstr2 = str2[1];
	//搜索
	var s = artist ? (title + "-" + artist) : title;
	searchURL = "http://music.163.com/api/search/get/web?csrf_token=";
	var post_data = 'hlpretag=<span class="s-fc7">&hlposttag=</span>&s=' + encodeURIComponent(s) + '&type=1&offset=0&total=true&limit=' + limit;
	try {
		xmlHttp.Open("POST", searchURL, true);
		xmlHttp.SetRequestHeader("Host", "music.163.com");
		xmlHttp.SetRequestHeader("Origin", "http://music.163.com");
		xmlHttp.SetRequestHeader("User-Agent", "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36");
		xmlHttp.SetRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xmlHttp.SetRequestHeader("Referer", "http://music.163.com/search/");
		xmlHttp.SetRequestHeader("Connection", "Close");
		xmlHttp.Send(post_data);

		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
				if (xmlHttp.status == 200) {
					var ncm_back = json(xmlHttp.responseText);
					var result = ncm_back.result;
					if(!result || result == null) return;
					if (ncm_back.code != 200 || !result.songCount) {
						if(DLItems.length == 0) return;
						DLItems[idx].downloaded = 1;
						insertQueue();
						return;
					}
					//筛选艺术家、专辑、标题
					var song = result.songs;
					var b = c = 0;
					var out = [0, 0];
					for (var k in song) {
						var ncm_album = song[k].album.name;
						for (var a_k in song[k].artists) {
							var ncm_artist = song[k].artists[a_k].name;
							var p0 = compare(album, ncm_album);
							var p1 = compare(artist, ncm_artist);
							if (p0 == 100 && p1 == 100) {
								b = k;
								c = a_k;
								out[0] = p0;
								out[1] = p1;
								break;
							}
							if (p0 > out[0]) {
								b = k;
								c = a_k;
								out[0] = p0;
							} else {
								if (!artist && (p0 == out[0] && p1 > out[1])) {
									b = k;
									c = a_k;
									out[1] = p1;
								}
							}
						}
					}
					var res_id = song[b].id;
					var res_name = song[b].name;
					var res_artist = song[b].artists[c].name;
					//debug && console(res_id + " " + res_name + "    " + res_artist);

					//获取封面链接
					infoURL= "http://music.163.com/api/song/detail/?id=" + res_id + "&ids=%5B" + res_id + "%5D";
					try {
						xmlHttp2.Open("GET", infoURL, false);
						//noinspection JSAnnotator
						xmlHttp2.Option(4) = 13056;
						//noinspection JSAnnotator
						xmlHttp2.Option(6) = false;
						xmlHttp2.SetRequestHeader("Cookie", "appver=1.5.0.75771");
						xmlHttp2.SetRequestHeader("Referer", "http://music.163.com/");
						xmlHttp2.SetRequestHeader("Connection", "Close");
						xmlHttp2.Send(post_data);
						if (xmlHttp2.Status == 200) {
							var ncm_pic = json(xmlHttp2.responseText);
							client.SavePath = path;
							client.RunAsync(idx, ncm_pic.songs[0].album.picUrl, filename);
						}
					} catch (e) {
						if(DLItems.length == 0) return;
						DLItems[idx].downloaded = 1;
						insertQueue();
					}
				}
			}
		}
	} catch (e) {
		if(DLItems.length == 0) return;
		DLItems[idx].downloaded = 1;
		insertQueue();
	}
}

function search_artist(idx, Name, path, filename){
	var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	var xmlDoc = new ActiveXObject("MSXML.DOMDocument");
	var url = "http://artistpicserver.kuwo.cn/pic.web?type=big_artist_pic&pictype=url&content=list&&id=0&name=" + encodeURIComponent(Name) + "&from=pc&json=1&version=1&width=1980&height=1080"
	var pic_num = [];
	try {
		xmlhttp.open("GET", url, true);
		xmlhttp.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
		xmlhttp.send(null);
		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				if (xmlhttp.responseText != "NO_PIC"){
					var _json_obj = json(xmlhttp.responseText);
					var _candidates = _json_obj["array"];
					if(!_candidates || _candidates == null) return;
					for (var i = 0; i < _candidates.length; ++i) {
						if(_candidates[i].bkurl)pic_num[i] = _candidates[i].bkurl;
						if(_candidates[i].wpurl){
							pic_num[i] = _candidates[i].wpurl;
							break;
						}
					}
					client.SavePath = path;
					client.RunAsync(idx, pic_num[0], filename);
				}else {
					if(DLItems.length == 0) return;
					DLItems[idx].downloaded = 1;
					insertQueue();
				}
			}
		}
	}catch(e){
		if(DLItems.length == 0) return;
		DLItems[idx].downloaded = 1;
		insertQueue();
	}
}

function console(s) {
	fb.trace("Netease Art: " + s);
}

function del(str, delthis) {
	var s = [str, ""];
	var set = str.indexOf(delthis);
	if (set == -1) {
		return s;
	}
	s[1] = " " + str.substr(set);
	s[0] = str.substring(0, set);
	return s;
}

function compare(x, y) {
	x = x.split("");
	y = y.split("");
	var z = 0;
	var s = x.length + y.length;
	x.sort();
	y.sort();
	var a = x.shift();
	var b = y.shift();
	while (a !== undefined && b !== undefined) {
		if (a === b) {
			z++;
			a = x.shift();
			b = y.shift();
		} else if (a < b) {
			a = x.shift();
		} else if (a > b) {
			b = y.shift();
		}
	}
	return z / s * 200;
}    

function json(text) {
	try {
		var data = JSON.parse(text);
		return data;
	} catch (e) {
		return false;
	}
}