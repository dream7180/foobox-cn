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
}
var cookie = 'appver=2.0.2'

var api = {
  'lyric': 'http://music.163.com/api/song/lyric',
  'query': 'http://music.163.com/api/search/get/'
}

// Set false if do not want console output infos.
var dbg = false

// Eng | CHN, separated by `|', but only one will be displayed in lyric search
// window (`Source' column) acording to foobar2000.exe's lang.
function get_my_name () {
  return 'NeteaseCloudMusic|网易云音乐'
}

function get_version () {
  return '0.0.2'
}

function get_author () {
  return 'Elia'
}

function start_search (info, callback) {
  var url
  var title = info.Title
  var artist = info.Artist
  var album

  var httpClient = utils.CreateHttpClient()
  var jsonText

  // Set headers, Cookie, postData
  addHeaders(header, httpClient)
  httpClient.addCookie('Cookie', cookie)
  httpClient.addPostData(getQueryString(artist, title))

  jsonText = httpClient.Request(api.query, 'POST')
  if (httpClient.StatusCode !== 200) {
    console('Request url >>>' + api.query + '<<< error: ' + httpClient.StatusCode)
    return
  }

  var result = json(jsonText)['result']
  var songs
  if (result.songs) {
    songs = result.songs
    console(songs.length)
  } else {
    console(jsonText)
    return
  }

  console(jsonText)

  var newLyric = callback.CreateLyric()
  var id

  // get lyrics
  for (var i = 0; i < songs.length; i++) {
    if (callback.IsAborting()) {
      console('User aborted!')
      break
    }
    try {
      id = songs[i]['id']
      artist = songs[i].artists[0].name
      title = songs[i].name
      album = songs[i].album.name
    } catch (e) {}
    url = api.lyric + '?os=pc&id=' + id + '&lv=-1&kv=-1&tv=-1'
    addHeaders(header, httpClient)
    jsonText = httpClient.Request(url)
    if (httpClient.StatusCode !== 200) {
      console('Request url >>>' + url + '<<< error: ' + httpClient.StatusCode)
      continue
    }

    try {
      newLyric.LyricText = json(jsonText).lrc.lyric
      newLyric.Title = title
      newLyric.Artist = artist
      newLyric.Album = album
      newLyric.Location = url
      newLyric.Source = get_my_name()
      callback.AddLyric(newLyric)
      ;(i % 2 === 0) && callback.Refresh()
    } catch (e) {
      console('Unkown, failed to add lyric')
    }
  }

  newLyric.Dispose()
}

function addHeaders (header, client) {
  for (var i in header) {
    client.addHttpHeader(i, header[i])
  }
}

function getQueryString (artist, title, limit, type, offset) {
  if (typeof limit === 'undefined') limit = 10
  if (typeof type === 'undefined') type = 1
  if (typeof offset === 'undefined') offset = 0
  artist = processKeywords(artist)
  title = processKeywords(title)
  return 's=' + artist + '+' + title + '&limit=' + limit + '&type=' + type + '&offset=' + offset
}

function processKeywords (str) {
  var s = str
  s = s.toLowerCase()
  s = s.replace(/'|·|\$|&|–/g, '')
  // truncate all symbols
  s = s.replace(/\(.*?\)|\[.*?]|{.*?}|（.*?/g, '')
  s = s.replace(/[-/:-@[-`{-~]+/g, '')
  s = s.replace(/[\u2014\u2018\u201c\u2026\u3001\u3002\u300a\u300b\u300e\u300f\u3010\u3011\u30fb\uff01\uff08\uff09\uff0c\uff1a\uff1b\uff1f\uff5e\uffe5]+/g, '')
  return s
}

function json (text) {
  try {
    return JSON.parse(text)
  } catch (e) {
    return false
  }
}

function console (s) {
  dbg && fb.trace(get_my_name() + ' $>  ' + s)
}

// TODO: grab klyric && tlyric too.
