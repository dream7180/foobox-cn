//Name"WSH Cover Panel"
//Version 2.0.1f
//Author Jensen (jensen-yg@163.com) ------------
//mod for foobox https://github.com/dream7180
var zdpi = 1;
var g_fname, g_fsize;
var genre_cover_dir = fb.FoobarPath + "themes\\foobox\\Genre";
var Caption_Pack = {
	"Front": "封面",
	"Back": "封底",
	"Disc": "碟片",
	"Icon": "图标",
	"Artist": "艺术家"
}
var currentMetadb = null, l_mood;
var get_imgCol = false;
var dark_mode = false;
var color_bycover = window.GetProperty("foobox.color.by.cover", true);
var eslCtrl = null, eslPanels = null;
try{
	eslCtrl = new ActiveXObject("ESLyric");
	eslPanels = eslCtrl.GetAll();
} catch (e){
	console.log("ESLyric 接口创建失败，请把工具->ESLyric->高级选项: pref.script.expose 设置为 1");
}
function GetCaption(name) {
	var str = Caption_Pack[name];
	if (!str) str = name;
	return str;
}

//===================================

var window_id = window.ID;
//menu of online search links
var SearchItems = [];
//var getColor = false;
function SearchItem(name, url, keyword) {
	this.name = name;
	this.url = url;
	this.keyword = keyword;
}
SearchItems.push(new SearchItem("Baidu.com", "https://image.baidu.com/search/index?tn=baiduimage&word=%s", "[%album artist% ][%album%]"));
SearchItems.push(new SearchItem("Bing CN", "https://cn.bing.com/images/search?q=%s", "[%album artist% ][%album%]"));
SearchItems.push(new SearchItem("Google.com", "https://www.google.com/search?q=%s&tbm=isch", "[%album artist% ][%album%]"));
SearchItems.push(new SearchItem("Last.fm", "http://www.last.fm/search?q=%s&type=album", "[%album artist% ][%album%]"));

//----------infobar---------------------
var show_infobar = window.GetProperty("Display.InfoBar", true);
var rating_to_tag =  window.GetProperty("foobox.rating.write.to.file", false);
var is_mood = window.GetProperty("Display.Mood", false);
var g_font, g_font2;
var currentMetadb;
var rating_x, imgw, imgh, mood_h, infobar_h, pointArr, line2_y, infobar_y = 0;
g_tfo = {
	rating: fb.TitleFormat("%rating%"),
	title: fb.TitleFormat("$if2(%title%,)"),
	artist: fb.TitleFormat("$if2(%artist%,)"),
	album: fb.TitleFormat("$if2(%album%,)"),
	mood: fb.TitleFormat("%mood%"),
	codec: fb.TitleFormat("%codec%"),
	bitrate: fb.TitleFormat("$if(%codec_profile%, | %codec_profile% | %bitrate%,  | %bitrate%)")
}
var rating, txt_title, txt_info, txt_profile, show_info = true;
var time_circle = Number(window.GetProperty("Info: Circle time, 3000~60000ms", 12000));
if (time_circle < 3000) time_circle = 3000;
if (time_circle > 60000) time_circle = 60000;
var rbutton = Array();
var c_background, c_highlight, fontcolor, fontcolor2, icocolor, c_default_hl, c_rating_h;
var tracktype;
var img_rating_on, img_rating_off, mood_img, btn_mood, TextBtn_info;

function TextBtn() {
	this.setSize = function (x, y , w, h){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}
	this.isXYInButton = function(x, y) {
		return (x >= this.x && x <= (this.x + this.w) && y > this.y && y <= (this.y + this.h)) ? true : false;
	}
}

function obtn_mood(){
	this.y = infobar_y;
	this.w = imgw;
	this.h = mood_h;
	this.img = mood_img;
	this.isXYInButton = function(x, y) {
		return (x >= this.x && x <= this.x + this.w && y > this.y && y <= this.y + this.h) ? true : false;
	}
	this.Paint = function(gr) {
		var src_h;
		if  (l_mood != null && l_mood != "?") src_h = 0;
		else src_h = this.h;
		gr.DrawImage(this.img, this.x, this.y, this.w, this.h, 0, src_h, this.w, this.h, 0);
	}
	this.resetImg = function(){
		this.img = mood_img;
	}
	this.setx= function(x){
		this.x = x;
	}
	this.OnClick = function() {
		if (!currentMetadb) {
			return;
		}
		if (tracktype < 2){
			let handle_list = new FbMetadbHandleList(currentMetadb);
			if (l_mood == null || l_mood == "?") {
				handle_list.UpdateFileInfoFromJSON(JSON.stringify({"MOOD" : getTimestamp()}));
			} else {
				handle_list.UpdateFileInfoFromJSON(JSON.stringify({"MOOD" : ""}));
			}
		}
	}
}

function get_var() {
	imgw = Math.floor(18*zdpi);
	imgh = imgw;
	mood_h = Math.floor(20*zdpi);
	infobar_h = show_infobar ? Math.floor(80*zdpi) : 0;
	pointArr = {
		p1: Array(9*zdpi, zdpi, 6.4*zdpi, 5.6*zdpi, zdpi, 6.6*zdpi, 4.6*zdpi, 10.6*zdpi, 4*zdpi, 16*zdpi, 9*zdpi, 13.6*zdpi, 14*zdpi, 16*zdpi, 13.4*zdpi, 10.6*zdpi, 17*zdpi, 6.6*zdpi, 11.6*zdpi, 5.6*zdpi),
		p2: Array(2*zdpi,zdpi,2*zdpi,16*zdpi,8*zdpi,12*zdpi,14*zdpi,16*zdpi,14*zdpi,zdpi),
		p3: Array(2*zdpi,zdpi+mood_h,2*zdpi,16*zdpi+mood_h,8*zdpi,12*zdpi+mood_h,14*zdpi,16*zdpi+mood_h,14*zdpi,zdpi+mood_h)
	}
}

var ww = 0, wh = 0;

function get_colors() {
	c_background = window.GetColourDUI(ColorTypeDUI.background);
	fontcolor = window.GetColourDUI(ColorTypeDUI.text);
	c_default_hl = window.GetColourDUI(ColorTypeDUI.highlight);
	c_highlight = c_default_hl;
	c_rating_h = c_highlight;
	icocolor = fontcolor & 0x2dffffff;
	fontcolor2 = blendColors(c_background, fontcolor, 0.75);
	dark_mode = isDarkMode(c_background);
}
function get_font() {
	g_font2 = window.GetFontDUI(FontTypeDUI.playlists);
	g_fname = g_font2.Name;
	g_fsize = g_font2.Size;
	g_fstyle = g_font2.Style;
	zdpi = g_fsize / 12;
	g_font = GdiFont(g_fname, g_fsize + 2, 1);
}

function get_imgs() {
	var gb;
	img_rating_on = gdi.CreateImage(imgw, imgh);
	gb = img_rating_on.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillPolygon(c_rating_h, 0, pointArr.p1);
	gb.SetSmoothingMode(0);
	img_rating_on.ReleaseGraphics(gb);

	img_rating_off = gdi.CreateImage(imgw, imgh);
	gb = img_rating_off.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillPolygon(icocolor, 0, pointArr.p1);
	gb.SetSmoothingMode(0);
	img_rating_off.ReleaseGraphics(gb);

	mood_img = gdi.CreateImage(imgw, mood_h*2);
	gb = mood_img.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawPolygon(c_rating_h, 2, pointArr.p2);
	gb.DrawPolygon(icocolor, 2, pointArr.p3);
	gb.SetSmoothingMode(0);
	mood_img.ReleaseGraphics(gb);
}

function initbutton() {
	btn_mood = new obtn_mood();
	for(var i = 0; i < 5; i++){
		rbutton[i] = new ButtonUI_R();
	}
	TextBtn_info = new TextBtn();
}

function OnMetadbChanged() {
	if(!show_infobar) return;
	if(!currentMetadb){
		window.RepaintRect(0, infobar_y, ww, infobar_h);
		return;
	}
	rating = g_tfo.rating.EvalWithMetadb(currentMetadb);
	if (rating == "?") {
		rating = 0;
	}
	txt_title = g_tfo.title.EvalWithMetadb(currentMetadb);
	var txt_info_artist = g_tfo.artist.EvalWithMetadb(currentMetadb);
	var txt_info_album = g_tfo.album.EvalWithMetadb(currentMetadb);
	if(txt_info_artist) {
		txt_info = txt_info_artist;
		if(txt_info_album) txt_info = txt_info + "  |  " + txt_info_album;
	}else if(txt_info_album) txt_info = txt_info_album;
	else txt_info = "";
	txt_profile = g_tfo.codec.EvalWithMetadb(currentMetadb) + g_tfo.bitrate.EvalWithMetadb(currentMetadb) + "K";
	l_mood = g_tfo.mood.EvalWithMetadb(currentMetadb);
	tracktype = TrackType(currentMetadb.RawPath.substring(0, 4));
	show_info = true;
	window.RepaintRect(0, infobar_y, ww, infobar_h);
}

function initMetadb(){
	if (fb.IsPlaying || fb.IsPaused) currentMetadb = fb.GetNowPlaying();
	else if (fb.GetFocusItem()) currentMetadb = fb.GetFocusItem();
	OnMetadbChanged();
	if (currentMetadb) {
		MainController.Refresh(true, currentMetadb);
		tracktype = TrackType(currentMetadb.RawPath.substring(0, 4));
	}
}

//---------------------------------------


// Some functions =======================================

function CalcNewImgSize(img, dstW, dstH, srcW, srcH, strch, kar, fill) { // Calculate image's new size and offsets in new width and height range. 
	if (!img) return;
	if (!srcW) srcW = img.Width;
	if (!srcH) srcH = img.Height;
	if (strch == undefined) strch = Properties.Image.Stretch;
	if (kar == undefined) kar = Properties.Image.KeepAspectRatio;
	if (fill == undefined) fill = Properties.Image.Fill;

	var size;
	if (fill) {
		size = {
			x: 0,
			y: 0,
			w: dstW,
			h: dstH
		};
		if (srcH / srcW < dstH / dstW) size.w = Math.ceil(srcW * dstH / srcH);
		else size.h = Math.ceil(srcH * dstW / srcW);
	} else if (strch) {
		size = {
			x: 0,
			y: 0,
			w: dstW,
			h: dstH
		};
		if (kar) {
			size.w = Math.ceil(srcW * dstH / srcH);
			if (size.w > dstW) {
				size.w = dstW;
				size.h = Math.ceil(srcH * dstW / srcW);
			}
		}
	} else {
		size = {
			x: 0,
			y: 0,
			w: srcW,
			h: srcH
		};
		if (kar) {
			if (srcH > dstH) {
				size.h = dstH;
				size.w = Math.ceil(srcW * dstH / srcH);
			}
			if (size.w > dstW) {
				size.w = dstW;
				size.h = Math.ceil(srcH * dstW / srcW);
			}
		} else {
			size.w = Math.min(srcW, dstW);
			size.h = Math.min(srcH, dstH);
		}
	}
	size.x = Math.floor((dstW - size.w) / 2);
	size.y = Math.floor((dstH - size.h) / 2);
	return size;
}

//-------------------------------------

function ResizeImage(img, w, h) {
	if (!img || !w || !h) return null;
	var newImg = gdi.CreateImage(w, h);
	var g = newImg.GetGraphics();
	g.SetInterpolationMode(Properties.Image.InterpolationMode);
	g.DrawImage(img, 0, 0, w, h, 0, 0, img.Width, img.Height);
	newImg.ReleaseGraphics(g);
	return newImg;
}

//-------------------------------------

function CreateRawBitmap2(img) {
	var bmp = img.CreateRawBitmap();
	return bmp;
}

//-------------------------------------
function RGB(r, g, b) {
	return 0xff000000 | r << 16 | g << 8 | b;
}

function RGBA(r, g, b, a) {
	return ((a << 24) | (r << 16) | (g << 8) | (b));
}

//-------------------------------------
String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}


// Misc Classes =========================================
function MatchLogger() { // Debug class. The log info is not always correct.
	this.pathFormatGroup;
	this.pathStringGroup;
	this.pathArray;
	this.pathGroups = [];
	this.consuming;
	this.profiler = fb.CreateProfiler();

	this.Reset = function() {
		this.profiler.Reset();
		this.pathGroups = [];
		this.pathArray = null;
	}

	this.Print = function(toPopup) {
		var count = 0;
		var string = [];

		string.push(toPopup ? "" : "\n");
		string.push("Cover match log -------------------------------\n");
		string.push("The info below are debug infomation, they are not absolutely correct.\n");

		for (var i = 0; i < this.pathGroups.length; i++) {
			string.push("\n" + (i == 0 ? "Build-in Sources" : "Genre Image Sources") + " -----------------------\n");
			string.push("PathFormat:  " + this.pathFormatGroup[i] + "\n");
			i && string.push("PathString:  " + this.pathStringGroup[i] + "\n");
			string.push("\n");

			var pg = this.pathGroups[i];
			for (var j = 0; j < pg.length; j++) {
				var pi = pg[j];
				if (pi.artId == -1) string.push("Path: " + pi.path + "\n");
				else string.push("Path: <" + AlbumArtId.GetName(pi.artId) + ">\n");
				string.push("\tMatched: " + pi.results.length + " files");
				string.push("\tScan used: " + (pi.results.scanConsuming == -1 ? "n/a" : pi.results.scanConsuming) + " ms" + (pi.results.pathCacheHit ? "\t(Cache hit)" : "") + "\n");
				for (var k = 0; k < pi.results.length; k++) {
					var pi2 = pi.results[k];
					string.push("\t");
					if (pi2.embed) string.push("<Embed Image: " + AlbumArtId.GetName(pi2.artId) + ">");
					else string.push(pi2.path);
					if (pi2.duplicate) string.push("\t(Duplicate)");
					else count++;
					string.push((pi2.loadConsuming == -1 ? "" : ("\tLoad used: " + pi2.loadConsuming + " ms")) + (pi2.cacheHit ? "\t(Cache hit)" : "") + "\n");
				}
			}
		}
		string.push("\nTotal ---------------");
		string.push("\nMatched: " + count + " files");
		string.push("\tScan used: " + this.consuming + " ms");

		if (toPopup) PopMessage(string.join(""), 0);
		else console.log(string.join(""));
	}
}
var Logger = new MatchLogger(); // Debug object.

//============================================

function PathItem(path, artid, metadb, index) {
	this.path = path ? path : "";
	this.artId = artid;
	this.embed = false;
	this.metadb = metadb;
	this.index = index;
	this.results = [];
	// These below are for match logs.
	this.time;
	this.loadConsuming = -1;
	this.cacheHit = false;
	this.results.scanConsuming = -1;
	this.results.pathCacheHit = false;
}

PathItem.prototype.SimpleClone = function() {
	var newpi = new PathItem(this.path, this.artId, this.metadb);
	newpi.embed = this.embed;
	return newpi;
}


//----------------------------------------------------------

function ImageItem(img, srcw, srch) {
	this.img = img;
	this.srcW = srcw ? srcw : (img ? img.Width : 0);
	this.srcH = srch ? srch : (img ? img.Height : 0);
}

//----------------------------------------------------------

function QueueItem(cookie, pathitem, whendone) {
	this.cookie = cookie;
	this.pathItem = pathitem;
	this.whenDone = whendone;
}

//----------------------------------------------------------

function ImageLoader(maxCacheLength, w, h) {
	var Caches = [];
	var imgLoadingQueue = [];

	function ImageCacheItem(img, pathitem, srcw, srch) {
		this.img = img;
		this.embed = pathitem.embed;
		this.path = pathitem.path;
		this.artId = pathitem.artId;
		this.srcW = srcw;
		this.srcH = srch;
	}

	ImageCacheItem.prototype.Compare = function(newpathitem) {
		if (this.embed != newpathitem.embed) return false;
		else if (this.embed && newpathitem.embed) return this.path == newpathitem.path && this.artId == newpathitem.artId;
		else return this.path == newpathitem.path;
	}

	ImageCacheItem.prototype.ReadImage = function(dstw, dsth) {
		var img;
		if (!dstw || !dsth) img = this.img;
		else {
			var size = CalcNewImgSize({
				Width: this.srcW,
				Height: this.srcH
			}, dstw, dsth);
			if (size.w == this.img.Width && size.h == this.img.Height) // Nothing need to be changed.
			img = this.img;
			else if (Math.abs(size.w - this.img.Width) < Math.max(this.img.Width * 0.1, 5) && Math.abs(size.h - this.img.Height) < Math.max(this.img.Height * 0.1, 5)) { // Not too much, just take a zoom.
				//img = this.img.Resize(size.w, size.h);
				img = ResizeImage(this.img, size.w, size.h);
			} else if (size.w > this.img.Width || size.h > this.img.Height) // Too large to zoom, back to reload.
			return null;
			else { // Too small, update caches too.
				img = ResizeImage(this.img, size.w, size.h);
				//this.img.Dispose();
				this.img = img;
			}
		}

		return new ImageItem(img, this.srcW, this.srcH);
	}

	function StoreCache(img, pathitem, srcw, srch, check) {
		if (check) {
			for (var i = 0; i < Caches.length; i++) {
				if (Caches[i].Compare(pathitem)) {
					Caches[i].img = img;
					return;
				}
			}
		}

		Caches.unshift(new ImageCacheItem(img, pathitem, srcw, srch));

		if (Caches.length > maxCacheLength) Caches.splice(maxCacheLength, 1);
	}

	function SearchCache(pathitem, dstw, dsth) {
		var ci, imgitem;
		for (var i = 0; i < Caches.length; i++) {
			ci = Caches[i];
			if (ci.Compare(pathitem)) {
				Caches.splice(i, 1);
				imgitem = ci.ReadImage(dstw, dsth);
				if (imgitem) Caches.unshift(ci);
				return imgitem;
			}
		}
		return null;
	}

	function ResizeAndStoreImage(img, pathitem) {
		if (!img) return null;
		var srcW = img.Width,
			srcH = img.Height;
		var size = CalcNewImgSize(img, w, h);
		if (srcW != size.w || srcH != size.h) {
			var img2 = ResizeImage(img, size.w, size.h);
//			img.Dispose();
			img = img2;
		}
		if (img == undefined) return null;
		if (img.Width > w || img.Height > h) {
			var img2 = img.Clone(-size.x, -size.y, w, h);
//			img.Dispose();
			img = img2;
		}
		StoreCache(img, pathitem, srcW, srcH);
		return new ImageItem(img, srcW, srcH);
	}

	this.Load = function(pathitem, whendone, ignoreCache){//, sync) {
		pathitem.time = Logger.profiler.Time;
		var imgitem = (!maxCacheLength || ignoreCache) ? null : SearchCache(pathitem, w, h);
		if (imgitem) {
			pathitem.loadConsuming = Logger.profiler.Time - pathitem.time;
			pathitem.cacheHit = true;
			whendone && whendone(imgitem);
			return;
		} else pathitem.cacheHit = false;

		/*if (sync) {
			var img;
			if (pathitem.artId == -1) img = gdi.Image(pathitem.path);
			else if (pathitem.embed) img = utils.GetAlbumArtEmbedded(pathitem.metadb.RawPath, pathitem.artId);
			else img = utils.GetAlbumArtV2(pathitem.metadb, pathitem.artId, false);
			imgitem = new ImageItem(img);
			whendone && whendone(imgitem);
		} else {*/
			var cookie = null;
			if (pathitem.artId == -1) cookie = gdi.LoadImageAsync(window_id, pathitem.path);
			else utils.GetAlbumArtAsync(window_id, pathitem.metadb, pathitem.artId, false, pathitem.embed);
			imgLoadingQueue.push(new QueueItem(cookie, pathitem, whendone));
		//}
	}

	this.OnGetAlbumArtDone = function(metadb, art_id, image, image_path) {
		if (!imgLoadingQueue.length) {
//			image && image.Dispose();
			return;
		}

		for (var i = 0; i < imgLoadingQueue.length; i++) {
			var qi = imgLoadingQueue[i];
			if (qi.cookie) continue;
			var pi = qi.pathItem;
			if (art_id == pi.artId && metadb.Compare(pi.metadb)) {
				imgLoadingQueue.splice(i, 1);
				var imgitem = ResizeAndStoreImage(image, pi);
				pi.loadConsuming = Logger.profiler.Time - pi.time;
				qi.whenDone && qi.whenDone(imgitem);
				break;
			}
		}
	}

	this.OnLoadImageDone = function(cookie, image) {
		if (!imgLoadingQueue.length || !cookie) {
			return;
		}

		for (var i = 0; i < imgLoadingQueue.length; i++) {
			var qi = imgLoadingQueue[i];
			var pi = qi.pathItem;
			if (cookie == qi.cookie) {
				imgLoadingQueue.splice(i, 1);
				var imgitem = ResizeAndStoreImage(image, pi);
				pi.loadConsuming = Logger.profiler.Time - pi.time;
				qi.whenDone && qi.whenDone(imgitem);
				break;
			}
		}
	}

	this.ClearCache = function() {
		imgLoadingQueue = [];
		Caches = [];
	}

	this.FlushQueue = function() {
		if (!imgLoadingQueue.length) return;
		for (var i = 0; i < imgLoadingQueue.length; i++) {
			imgLoadingQueue[i].whenDone = null;
		}
	}

	this.Resize = function(w2, h2) {
		w = w2;
		h = h2;
	}
}


//----------------------------------------------------------

function PathChecker(supportedTypes, maxFileSize, singleImageMode, cycleInWildCard, maxCacheCapacity) {
	this.AsyncChecking = false;
	this.OnQueueFinished = null;
	var albumArtCheckQueue = [];
	var Caches = [];

	function PathCacheItem(pathitem, matchresult) {
		this.pathitem = pathitem.SimpleClone();
		this.matchResult = [];
		if (matchresult) {
			for (var i = 0; i < matchresult.length; i++)
			this.matchResult[i] = matchresult[i].SimpleClone();
		}
	}

	function SearchCache(pathitem) {
		if (pathitem.artId == -1) {
			for (var i = 0; i < Caches.length; i++) {
				if (Caches[i].pathitem.path == pathitem.path) {
					var mr = Caches[i].matchResult;
					var arr = [];
					for (var j = 0; j < mr.length; j++)
					arr[j] = mr[j].SimpleClone();
					return arr;
				}
			}
		} else {
			for (var i = 0; i < Caches.length; i++) {
				if (Caches[i].pathitem.artId == pathitem.artId && Caches[i].pathitem.metadb.Compare(pathitem.metadb)) return Caches[i].pathitem.SimpleClone();
			}
		}
		return null;
	}

	function StoreCache(pathitem, arg) {
		if (pathitem.artId == -1) {
			if (pathitem.path.indexOf("*") == -1 && pathitem.path.indexOf("?") == -1) return;
			else Caches.unshift(new PathCacheItem(pathitem, arg));
		} else {
			if (arg) pathitem.path = arg;
			Caches.unshift(new PathCacheItem(pathitem));
		}

		if (Caches.length > maxCacheCapacity) Caches.splice(maxCacheCapacity, 1);
	}

	this.Glob = function(pathitem, ignoreCache) {
		var resultArr = (!maxCacheCapacity || ignoreCache) ? null : SearchCache(pathitem);

		if (resultArr) var cachehit = true;
		else {
			var cachehit = false;
			paths = utils.Glob(pathitem.path);
			resultArr = [];
			var p, ext;
			for (var k = 0; k < paths.length; k++) {
				p = paths[k];
				ext = p.slice(p.lastIndexOf('.') + 1).toLowerCase();
				for (var l = 0; l < supportedTypes.length; l++) {
					if (ext == supportedTypes[l]) {
						if (maxFileSize > 0) {
							var size = utils.FileTest(p, "s");
							if (size > maxFileSize) // When size over 4G, "typeof(size)" will be unknown.
							break;
						}
						resultArr.push(new PathItem(p, -1, null, false, pathitem.index));
						break;
					}
				}
				if ((!cycleInWildCard || singleImageMode) && resultArr.length) break;
			}
			StoreCache(pathitem, resultArr);
		}

		pathitem.results = resultArr;
		pathitem.results.pathCacheHit = cachehit;
		return pathitem;
	}

	this.CheckAlbumArt = function(pathitem, whendone, ignoreCache) {
		var pi = (!maxCacheCapacity || ignoreCache) ? null : SearchCache(pathitem);
		if (pi) {
			pathitem.results.pathCacheHit = true;
			if (pi.path) {
				pathitem.path = pi.path;
				pathitem.embed = pi.embed;
				pathitem.results = [pathitem];
			}
			whendone && whendone(pathitem);
			return;
		} else {
			pathitem.results.pathCacheHit = false;

			this.AsyncChecking = true;
			utils.GetAlbumArtAsync(window_id, pathitem.metadb, pathitem.artId, false, pathitem.embed, true);
			albumArtCheckQueue.push(new QueueItem(null, pathitem, whendone));
		}
	}

	this.OnCheckAlbumArtDone = function(metadb, art_id, image, image_path) {
		if (!albumArtCheckQueue.length) {
//			image && image.Dispose();
			return;
		}

		var hit, qi, pi;
		for (var i = 0; i < albumArtCheckQueue.length; i++) {
			qi = albumArtCheckQueue[i];
			pi = qi.pathItem;
			if (pi.artId == art_id && metadb.Compare(pi.metadb)) {
				hit = true;
				break
			}
		}
		if (!hit) return;

		if (image_path) {
			if (qi.whenDone) pi.results = [pi];
			pi.path = image_path;
			if (image_path == metadb.Path) pi.embed = true;

		}
		StoreCache(pi);

		albumArtCheckQueue.splice(i, 1);
		if (!albumArtCheckQueue.length) {
			this.AsyncChecking = false;
			this.OnQueueFinished && this.OnQueueFinished();
			this.OnQueueFinished = null;
		}

		qi.whenDone && qi.whenDone(pi);
	}

	this.FlushQueue = function() {
		for (var i = 0; i < albumArtCheckQueue.length; i++)
		albumArtCheckQueue[i].whenDone = null;
	}

	this.ClearCache = function() {
		albumArtCheckQueue = [];
		Caches = [];
	}
}


//----------------------------------------------------------

function PathProcessor(prop) {
	var pathGroups;
	var currentPathGroup;
	var whenDone;
	var ignoreCache;
	var pathArray = [];
	var reg1 = /^\<(.*)\>$/; // Use to get field from "<field>".
	var _this = this;
	this.pathChecker = new PathChecker(prop.SupportedTypes, prop.MaxFileSize, prop.SingleImageMode, prop.CycleInWildCard, prop.PathsCacheCapacity);

	function ParsePathSting(psgroup, metadb) {
		var pathGroups = [],
			pathArr, path, arr, artid = null;

		for (var i = 0; i < psgroup.length; i++) {
			pathArr = psgroup[i].split('||');
			for (var j = 0; j < pathArr.length; j++) {
				path = pathArr[j];
				if (!path) continue;
				arr = path.match(reg1);
				if (arr) {
					artid = AlbumArtId[arr[1]];
					if (artid == null) { // Invalid artid, delete this item.
						pathArr.splice(j, 1);
						j--;
						continue;
					} else pathArr[j] = new PathItem(null, artid, metadb, j);
				} else pathArr[j] = new PathItem(path, -1, null, j);
			}
			pathGroups[i] = pathArr;
		}

		return pathGroups;
	}

	this.Parse = function(psgroup, metadb, whendone, ignorecache) {
		this.pathChecker.FlushQueue();
		pathGroups = ParsePathSting(psgroup, metadb);
		pathGroups.index = 0;
		Logger.pathGroups = pathGroups;
		whenDone = whendone;
		ignoreCache = ignorecache;
		CheckOneGroup(pathGroups.index);
	}

	function CheckOneGroup() {
		for (; pathGroups.index < pathGroups.length; pathGroups.index++) {
			currentPathGroup = pathGroups[pathGroups.index];
			currentPathGroup.checkFinished = 0;
			currentPathGroup.results = [];

			var wait = false;
			for (var i = 0; i < currentPathGroup.length; i++) {
				var pi = currentPathGroup[i];
				pi.time = Logger.profiler.Time;

				if (prop.SingleImageMode && currentPathGroup.results.length) currentPathGroup.checkFinished++;
				else {
					if (pi.artId == -1) { // Process common paths.
						_this.pathChecker.Glob(pi, ignoreCache);
						CheckFinished(pi);
					} else { // Process "<...>" paths.
						wait = true;
						_this.pathChecker.CheckAlbumArt(pi, CheckFinished, ignoreCache);
					}
				}
			}

			if (wait || currentPathGroup.results.length) break;
		}

		if (currentPathGroup.checkFinished == currentPathGroup.length) {
			CheckOneGroupDone();
		}
	}

	function CheckFinished(pathitem) {
		pathitem.results.scanConsuming = Logger.profiler.Time - pathitem.time;
		if (pathitem.results.length) currentPathGroup.results.push(pathitem);
		currentPathGroup.checkFinished++;

		if (pathitem.artId != -1 && currentPathGroup.checkFinished == currentPathGroup.length) {
			if (currentPathGroup.results.length) currentPathGroup.results.sort(sortByIndex);
			CheckOneGroupDone();
		}
	}

	var sortByIndex = function(a, b) {
			return a.index - b.index;
		};

	function CheckOneGroupDone() {
		var checkResults, lastIndex = 0;
		pathArray = []; // This one is the last result.
		checkResults = pathGroups[0].results;
		if (pathGroups.index != 0) {
			lastIndex = checkResults.length;
			checkResults = checkResults.concat(pathGroups[1].results);
		}

		if (checkResults.length) {
			if (prop.SingleImageMode) pathArray = [checkResults[0].results[0]]; // Cut to only one left.
			else {
				for (var i = 0; i < checkResults.length; i++) { // Remove duplicate paths.
					var cr1 = checkResults[i].results;
					for (var j = 0; j < cr1.length; j++) {
						var pi1 = cr1[j];
						if (pi1.duplicate) continue;
						if (!pi1.lowerPath) pi1.lowerPath = pi1.path.toLowerCase();
						for (var k = Math.max(i + 1, lastIndex); k < checkResults.length; k++) { // lastIndex: skip the results from last group, they're already checked.
							var cr2 = checkResults[k].results;
							for (var l = 0; l < cr2.length; l++) {
								var pi2 = cr2[l];
								if (pi2.duplicate) continue;
								if (!pi1.embed || !pi2.embed || pi1.artId == pi2.artId) {
									if (!pi2.lowerPath) pi2.lowerPath = pi2.path.toLowerCase();
									if (pi1.lowerPath == pi2.lowerPath) {
										pi2.duplicate = true;
										//cr2.splice(l,1);
										//l--;
									}
								}
							}
						}
						pi1.lowerPath = undefined;
						pathArray.push(pi1);
					}
				}
			}

			if (prop.AtMostLoadImagesNumber && pathArray.length > prop.AtMostLoadImagesNumber) pathArray.length = prop.AtMostLoadImagesNumber;
		}

		if (
		pathGroups.index >= pathGroups.length - 1 || (
		pathArray.length && (
		prop.SingleImageMode || prop.TreatGenrePathAsBackup || (prop.AtMostLoadImagesNumber && pathArray.length >= prop.AtMostLoadImagesNumber)))) {
			if (!_this.pathChecker.AsyncChecking) ParseDone();
			else _this.pathChecker.OnQueueFinished = ParseDone;
		} else {
			pathGroups.index++;
			CheckOneGroup();
		}
	}

	function ParseDone() {
		Logger.consuming = Logger.profiler.Time;
		whenDone && whenDone(pathArray);
		whenDone = null;
	}

	this.OnCheckAlbumArtDone = function(metadb, art_id, image, image_path) {
		this.pathChecker.OnCheckAlbumArtDone(metadb, art_id, image, image_path);
	}
}


// ImagesArray Class ===========================================

function ImagesArray(prop) {
	var w, h;
	this.Properties = prop;
	this.pathArray;
	this.currentImageItem = null;
	this.length = 0;
	this.pathFormatGroup = this.Properties.PathFormatGroup;
	this.pathStringGroup = [];
	var parse_done, load_done, load_index, load_ignoreCache;
	var _this = this;

	var imgLoader = new ImageLoader(this.Properties.ImagesCacheCapacity);
	var pathProcessor = new PathProcessor(this.Properties);

	function EvalTF(tfArr, metadb) {
		var arr = [],
			str;
		for (var i = 0; i < tfArr.length; i++) {
			str = tfArr[i];
			str = fb.TitleFormat(str).EvalWithMetadb(metadb);
			if(i == tfArr.length - 1){
				str = genre_cover_dir + "\\" + GetGenre(str) + ".*";
			}
			arr.push(str);
		}
		return arr;
	}

	this.Update = function(metadb, whendone, ignoreCache) {
		this.pathArray = [];
		this.length = 0;
		parse_done = whendone;

		if (metadb) {
			this.pathStringGroup = EvalTF(this.pathFormatGroup, metadb);
			Logger.pathFormatGroup = this.pathFormatGroup;
			Logger.pathStringGroup = this.pathStringGroup;
			Logger.Reset();
			pathProcessor.Parse(this.pathStringGroup, metadb, ParseFinished, ignoreCache);
		} else {
			Logger.pathFormatGroup = [];
			whendone && whendone();
		}
	}

	function ParseFinished(arr) {
		_this.pathArray = arr;
		_this.length = _this.pathArray.length;
		parse_done && parse_done();
	}

	this.GetImage = function(index, whendone, ignoreCache) {
		if (!this.pathArray.length) {
			whendone && whendone();
			return;
		}
		load_index = index;
		load_done = whendone;
		load_ignoreCache = ignoreCache;

		imgLoader.FlushQueue();
		imgLoader.Load(this.pathArray[index], LoadFinished, ignoreCache);
	}

	function LoadFinished(imgitem) {
		_this.currentImageItem = imgitem;
		load_done && load_done(imgitem ? imgitem.img : null);
		if (_this.Properties.ImagesCacheCapacity && _this.pathArray.length > 1) {
			if (load_index == _this.pathArray.length - 1) load_index = -1;
			imgLoader.Load(_this.pathArray[load_index + 1], null, load_ignoreCache); // Preload next image.
		}
	}

	this.ClearCache = function() {
		imgLoader.ClearCache();
		pathProcessor.pathChecker.ClearCache();
	}

	this.OnGetAlbumArtDone = function(metadb, art_id, image, image_path) {
		if (pathProcessor.pathChecker.AsyncChecking) pathProcessor.OnCheckAlbumArtDone(metadb, art_id, image, image_path);
		else imgLoader.OnGetAlbumArtDone(metadb, art_id, image, image_path);
	}

	this.OnLoadImageDone = function(cookie, image) {
		imgLoader.OnLoadImageDone(cookie, image)
	}

	this.Resize = function(w2, h2) {
		w = w2;
		h = h2;
		imgLoader.Resize(w, h);
	}
}


// Display Class =============================================

function Display(x, y, w, h, prop) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.Properties = prop;
	this.ImageRange = {
		x: 0,
		y: 0,
		w: 0,
		h: 0
	};
	var cover_default;
	var covers = [];
	var timer;
	var _this = this;

	//-----------------------------------------------
	var animation = new function(prop) {
			//this.enable = prop.Animation.Enable;
			this.duration = prop.Animation.Duration;
			this.refreshInterval = prop.Animation.RefreshInterval;
			this.totalFrames = Math.floor(this.duration / this.refreshInterval);
			this.rollingDistance = 0;
			this.rollingOffsets = [];
			this.opacitys = [];
			this.switchDelay = Math.floor(this.totalFrames * 2 / 5);

			// Calculate animation opacitys.
			for (var i = 0; i < this.totalFrames; i++)
			this.opacitys[i] = Math.ceil(255 * Math.pow((i + 1) / this.totalFrames, 2));

			this.CalcData = function(h) {
				// Calculate animation y offsets.
				this.rollingDistance = Math.round(h / 3);
				this.rollingOffsets = [];
				for (var i = 0; i < this.totalFrames; i++)
				this.rollingOffsets[i] = Math.ceil(Math.sqrt((i + 1) / this.totalFrames) * this.rollingDistance);
			}
			this.CalcData(0);
		}(this.Properties);

	function ActiveTimer() {
		if (!timer) timer = window.SetInterval(_this.OnTimer, animation.refreshInterval);
	}

	function KillTimer() {
		timer && window.ClearInterval(timer);
		timer = null;
	}

	//-----------------------------------------------

	function CoverItem(type, img) {
		this.img;
		this.opacity = 0;
		this.faddingStep = 0;
		this.faddingOn = false;
		this.isDefault = false;
		this.size;
		this.SetImage(type, img);
	}
	var prttp = CoverItem.prototype;

	prttp.w = 0;
	prttp.h = 0;
	prttp.faddingStep_abs = Math.ceil(255 * animation.refreshInterval / animation.duration);

	prttp.CalcSize = function(dstw, dsth) {
		if (!dstw || !dsth || !this.img) return;
		if (this.isDefault) this.size = this.defaultImgSize;
		else this.size = CalcNewImgSize(this.img, dstw, dsth);
	}

	prttp.SetImage = function(type, img) {
		if (type == undefined && img == undefined) return;
		//this.img && this.img != cover_default && this.img.Dispose();

		if (type == 0) {
			this.img = null;
			this.isDefault = false;
			this.size = {};
		} else if (img) {
			this.img = img;
			this.isDefault = false;
			this.CalcSize(this.w, this.h);
			if (this.w && this.h && (this.size.w != img.Width || this.size.h != img.Height)) {
				this.img = ResizeImage(img, this.size.w, this.size.h);
				//img.Dispose();
			}
			this.img = this.img.CreateRawBitmap();
		} else {
			this.img = cover_default;
			this.isDefault = true;
			this.CalcSize(this.w, this.h);
		}
	}

	prttp.Draw = function(g, x, y, opacity) {
		if (!this.img) return;
		opacity = 255 * (opacity / 255) * (this.opacity / 255);
		try {
			g.GdiAlphaBlend(this.img, x + this.size.x, y + this.size.y, this.size.w, this.size.h, 0, 0, this.img.Width, this.img.Height, opacity);
		} catch (e) {}
	}

	prttp.Show = function(show) {
		this.faddingStep = show ? this.faddingStep_abs : -this.faddingStep_abs;
		this.faddingOn = true;
		ActiveTimer();
	}

	prttp.OnTimer = function() {
		if (!this.faddingOn) return;
		this.opacity += this.faddingStep;
		if (this.opacity <= 0 || this.opacity >= 255) {
			this.opacity = Math.max(Math.min(this.opacity, 255), 0);
			this.faddingOn = true;
			return false;
		} else return true;
	}

	//-----------------------------------------------

	function FadingCovers(type, img) {
		this.nowIsDefault = false;
		this.size;
		this.covers = [];
		this.opacity = 0;
		this.rolling = {
			frame: 0,
			offset: 0,
			direction: 0,
			// 1: in, -1: out, 0: stay.
			delay: 0
		};
		this.SetImage(type, img);
		this.rolling.frame = 0;
	}
	prttp = FadingCovers.prototype;

	prttp.w = 0;
	prttp.h = 0;
	prttp.animation = animation;

	prttp.SetImage = function(type, img) {
		if (type == undefined) return;
		if (type) {
			if (this.covers.length) this.covers[this.covers.length - 1].SetImage(type, img);
			else {
				this.covers.push(new CoverItem(type, img));
				this.covers[0].opacity = 255;
			}
		} else this.covers = [];
	}

	prttp.CalcSize = function() {
		for (var i = 0; i < this.covers.length; i++)
		this.covers[i].CalcSize(this.w, this.h);
	}

	prttp.Draw = function(g, x, y) {
		var tempy = y + this.rolling.offset;
		for (var i = 0; i < this.covers.length; i++)
		this.covers[i].Draw(g, x, tempy, this.opacity);
	}

	prttp.ChangeImage = function(type, img) {
		if (this.covers.length) this.covers[this.covers.length - 1].Show(false);
		var newcover = new CoverItem(type, img);
		this.covers.push(newcover);
		newcover.Show(true);
	}

	prttp.Roll = function(direction, delay) {
		this.rolling.direction = direction;
		this.rolling.delay = delay;
		ActiveTimer();
	}

	prttp.OnTimer = function() {
		var flag;
		for (var i = 0; i < this.covers.length; i++) {
			flag = this.covers[i].OnTimer() || flag;
			if (this.covers[i].opacity == 0) {
				this.covers.splice(i, 1);
				i--
			}
		}

		if (this.rolling.direction != 0) {
			if (this.rolling.delay) {
				this.rolling.delay--;
				flag = true;
			} else {
				var k = Math.min(Math.max(0, this.rolling.frame), this.animation.totalFrames - 1);
				this.rolling.offset = this.animation.rollingOffsets[k] - this.animation.rollingDistance;
				this.opacity = this.animation.opacitys[k];
				this.rolling.frame += this.rolling.direction;

				if (this.rolling.frame < 0 || this.rolling.frame >= this.animation.totalFrames) {
					this.rolling.direction = 0;
					flag = false || flag;
				} else flag = true;
			}
		}

		return flag;
	}

	//-----------------------------------------------
	this.SetImage = function(type, img) {
		if (type == undefined) return;
		if (type) {
			if (covers.length) covers[covers.length - 1].SetImage(type, img);
			else {
				covers.push(new FadingCovers(type, img));
				covers[0].opacity = 255;
				covers[0].rolling.frame = animation.totalFrames;
			}
		} else covers = [];
	}

	this.ChangeImage = function(type, img, aniNo) { // type: 0: to empty, 1: to image or default image.
		if (!covers.length && aniNo == 1) aniNo = 2;

		if (aniNo == 0 || !prop.Animation.Enable) this.Refresh(type, img);
		else if (aniNo == 1) covers[covers.length - 1].ChangeImage(type, img);
		else if (aniNo == 2) {
			var newcover = new FadingCovers(type, img);
			if (covers.length) {
				covers[covers.length - 1].Roll(-1);
				newcover.Roll(1, animation.switchDelay);
			} else newcover.Roll(1);
			covers.push(newcover);
		}
	}

	this.Draw = function(g) {
		for (var i = 0; i < covers.length; i++)
		covers[i].Draw(g, this.ImageRange.x, this.ImageRange.y);
		if (this.menuButton) this.menuButton.Draw(g);
	}

	this.Refresh = function(type, img) {
		this.SetImage(type, img);
		window.Repaint();
	}

	this.Resize = function(w, h) {
		this.w = w;
		this.h = h;

		var old_w = this.ImageRange.w;
		var old_h = this.ImageRange.h;
		//this.ImageRange.w = Math.max(Math.min(this.w, this.h) - 0, 0);
		//this.ImageRange.h = this.ImageRange.w;
		this.ImageRange.w =  Math.max(this.w, 1);
		this.ImageRange.h = Math.max(this.h, 1);
		this.ImageRange.x = this.x + Math.round((this.w - this.ImageRange.w) / 2);// - img_padding_x;
		this.ImageRange.y = this.y + Math.round((this.h - this.ImageRange.h) / 2);

		if (this.ImageRange.w != old_w || this.ImageRange.h != old_h) {
			GenerateImages(this.ImageRange.w, this.ImageRange.h);
			CoverItem.prototype.w = this.ImageRange.w;
			CoverItem.prototype.h = this.ImageRange.h;
			//CoverItem.prototype.defaultImg = cover_default;
			CoverItem.prototype.defaultImgSize = {
				x: 0,
				y: 0,
				w: this.ImageRange.w,
				h: this.ImageRange.h
			};
			FadingCovers.prototype.w = this.ImageRange.w;
			FadingCovers.prototype.h = this.ImageRange.h;

			for (var i = 0; i < covers.length; i++)
			covers[i].CalcSize();
		}

		animation.CalcData(this.h);

		if (this.menuButton) {
			this.menuButton.x = this.x + Math.round(this.w / 2) - this.menuButton.w / 2;
			this.menuButton.y = this.ImageRange.y + this.ImageRange.h - this.menuButton.h - 1;
		}
	}

	function GenerateImages(w, h) {
		// Draw default cover ----------------
		cover_default = gdi.CreateImage(w, h);
		var g = cover_default.GetGraphics();
		if(w/(h-infobar_h) > 1.5) var cover_img_default = gdi.Image(fb.FoobarPath + "themes\\foobox\\images\\cover_w.jpg");
		else var cover_img_default = gdi.Image(fb.FoobarPath + "themes\\foobox\\images\\cover_default.jpg");
		var ratio = Math.min(w/cover_img_default.Width, h/cover_img_default.Height);
		var img_ww = Math.round(ratio * cover_img_default.Width), img_hh = Math.round(ratio * cover_img_default.Height);
		g.DrawImage(cover_img_default, Math.round((w-img_ww)/2), Math.round((h-img_hh)/2), img_ww, img_hh, 0, 0, cover_img_default.Width, cover_img_default.Height);
		cover_default.ReleaseGraphics(g);
		cover_default = CreateRawBitmap2(cover_default);
	}

	//---------------------------------------------
	this.isXYIn = function(x, y) {
		return x >= this.ImageRange.x && y >= this.ImageRange.y && x <= this.ImageRange.x + this.ImageRange.w && y <= this.ImageRange.y + this.ImageRange.h;
	}

	//if (this.Properties.MenuButton.Show) {
		this.menuButton = new function(x, y, w, h) {
			this.x = x, this.y = y, this.w = w, this.h = h;
			this.caption = "";
			this.menu = null;
			this.state = 0; // 0: hide, 1: normal, 2: hover, 3: down.
			var state_old = -1;
			var menuShowing = false;
			var faddingStep = 0;
			var faddingStep2 = 0;
			var opacity = 255;
			var opacity2 = 0;
			var fmt = StrFmt(1, 1, 0, 0); //prop.MacTypeSupport ? 1|4|100 : StrFmt(1, 2, 100, 0);
			var imgCache = {
				img: null,
				text: ""
			};
			var img_btn = gdi.CreateImage(this.w, this.h * 3);
			var g = img_btn.GetGraphics();
			g.SetSmoothingMode(2);
			g.FillRoundRect(1, 1, img_btn.Width - 2, img_btn.Height / 3 - 2, 8, 8, RGBA(0, 0, 0, 80));
			g.FillRoundRect(1, img_btn.Height / 3 + 1, img_btn.Width - 2, img_btn.Height / 3 - 2, 8, 8, RGBA(0, 0, 0, 120));
			g.FillRoundRect(1, img_btn.Height * 2 / 3 + 1, img_btn.Width - 2, img_btn.Height / 3 - 2, 8, 8, RGBA(0, 0, 0, 140));
			g.SetSmoothingMode(0);
			img_btn.ReleaseGraphics(g);
			img_btn = CreateRawBitmap2(img_btn);

			this.isXYIn = function(x, y) {
				return x >= this.x && y >= this.y && x <= this.x + this.w && y <= this.y + this.h;
			}

			function StrFmt(alignH, alignV, trim, flag) {
				return (alignH << 28) | (alignV << 24) | (trim << 20) | (StringTrimmingEllipsisWord = 4 << 20) | flag;
			}

			this.Draw = function(g) {
				if (opacity2 <= 0) return;

				g.GdiAlphaBlend(img_btn, this.x, this.y, this.w, this.h, 0, this.state * this.h, img_btn.Width, this.h, opacity * opacity2 / 255);
				if (state_old != -1) g.GdiAlphaBlend(img_btn, this.x, this.y, this.w, this.h, 0, state_old * this.h, img_btn.Width, this.h, (255 - opacity) * opacity2 / 255);

				if (!imgCache.img || imgCache.text != this.caption) {
					imgCache.text = this.caption;
					imgCache.img = gdi.CreateImage(this.w, this.h);
					var g2 = imgCache.img.GetGraphics();
					g2.SetTextRenderingHint(4);
					g2.DrawString(this.caption, g_font, RGBA(255, 255, 255, 255), 0, 0, this.w, this.h, fmt); // This is foreground text.
					g2.SetTextRenderingHint(0);
					//}
					imgCache.img.ReleaseGraphics(g2);
					imgCache.img = CreateRawBitmap2(imgCache.img);
				}
				g.GdiAlphaBlend(imgCache.img, this.x, this.y, this.w, this.h, 0, 0, imgCache.img.Width, imgCache.img.Height, opacity2);
			}

			this.OnClick = function(x, y) {
				menuShowing = true;
				this.menu.Pop(this.x, this.y + this.h);
				menuShowing = false;
			}

			this.ChangeState = function(s) {
				if (s == this.state || (s == 0 && menuShowing)) return;
				state_old = this.state;
				this.state = s;
				opacity = 0;
				if (s == 0) faddingStep = 43;
				else if (s == 1) faddingStep = 85;
				else faddingStep = 128;
				ActiveTimer();
			}

			this.ChangeState2 = function(s2) {
				if (s2) {
					if (opacity2 == 255) {
						faddingStep2 = 0;
						return;
					}
					faddingStep2 = 85;
				} else {
					if (opacity2 == 0 || menuShowing) {
						faddingStep2 = 0;
						return;
					}
					faddingStep2 = -43;
				}
				ActiveTimer();
			}

			this.OnTimer = function() {
				var flag;
				if (faddingStep) {
					opacity += faddingStep;
					if (opacity >= 255) {
						opacity = 255;
						state_old = -1;
						faddingStep = 0;
					} else flag = true;
				}

				if (faddingStep2) {
					opacity2 += faddingStep2;
					if (opacity2 <= 0 || opacity2 >= 255) {
						opacity2 = Math.max(Math.min(opacity2, 255), 0);
						faddingStep2 = 0;
					} else flag = true;
				}
				return flag;
			}

			this.ClearCache = function() {
				imgCache.img = null;
				imgCache.text = "";
			}

		}(0, 0, Math.ceil(55*zdpi) + 5, Math.ceil(25*zdpi));

		var btnStatus = -1; // -1: hide.
		var bugx, bugy; // Prevent a windows menu behaviour bug.

		this.OnMouseMove = function(x, y) {
			if (x == bugx && y == bugy) {
				bugx = null, bugy = null;
				return;
			}
			bugx = null, bugy = null;

			if (btnStatus == 2) this.menuButton.ChangeState(this.menuButton.isXYIn(x, y) ? 2 : 1);
			else if (this.isXYIn(x, y)) {
				if (btnStatus == -1) this.menuButton.ChangeState2(1);
				if (this.menuButton.isXYIn(x, y)) {
					btnStatus = 1;
					this.menuButton.ChangeState(1);
				} else {
					btnStatus = 0;
					this.menuButton.ChangeState(0);
				}
			} else if (btnStatus != -1) this.OnMouseLeave();
		}

		this.OnMouseDown = function(x, y) {
			if (btnStatus == 1) {
				btnStatus = 2;
				this.menuButton.ChangeState(2);
			}
		}

		this.OnMouseUp = function(x, y) {
			if (this.menuButton.state == 2) {
				bugx = x, bugy = y;
				this.menuButton.OnClick(x, y);
				this.menuButton.ChangeState2(0);
			}
			this.OnMouseMove(x, y);
		}

		this.OnMouseLeave = function(x, y) {
			btnStatus = -1;
			this.menuButton.ChangeState(0);
			this.menuButton.ChangeState2(0);
		}
	//}

	this.OnTimer = function() {
		var flag;
		for (var i = 0; i < covers.length; i++) {
			flag = covers[i].OnTimer() || flag;
			if (covers[i].rolling.frame < 0) {
				covers.splice(i, 1);
				i--;
			}
		}

		if (_this.menuButton) flag = _this.menuButton.OnTimer() || flag;

		window.Repaint();
		if (!flag) KillTimer();
	}
}


// Controller Class ==========================================

function Controller(imgArray, imgDisplay, prop) {
	this.Properties = prop;
	var groupString = null;
	var isFollowingCursor;
	var currentIndex = -1;
	var currentPathItem = null;
	var currentImage;
	var shellObj;
	var _this = this;

	if (!this.Properties.SingleImageMode) {
		this.imgSwitchMenu = new function() {
			var baseMenu;
			var funcs = {};
			this.matchResult;

			this.Update = function() {
				var arr = imgArray.pathArray;
				this.matchResult = [
					[],
					[],
					[],
					[],
					[]
				];
				this.matchResult[-1] = [];
				if (arr) {
					for (var i = 0; i < arr.length; i++)
					this.matchResult[arr[i].artId].push(i);
				}
			}

			this.Build = function() {
				this.Update();

				var id = 1;
				baseMenu = window.CreatePopupMenu();

				funcs[id] = [_this.SwitchCyclePause, null];
				baseMenu.AppendMenuItem(_this.cycle.paused ? MF_STRING : MF_CHECKED, id++, "循环开启");
				baseMenu.AppendMenuSeparator();
				funcs[id] = [_this.SwitchCover, this.matchResult[0][0]];
				baseMenu.AppendMenuItem(this.matchResult[0].length ? MF_STRING : MF_DISABLED, id++, "封面");
				funcs[id] = [_this.SwitchCover, this.matchResult[1][0]];
				baseMenu.AppendMenuItem(this.matchResult[1].length ? MF_STRING : MF_DISABLED, id++, "封底");
				funcs[id] = [_this.SwitchCover, this.matchResult[2][0]];
				baseMenu.AppendMenuItem(this.matchResult[2].length ? MF_STRING : MF_DISABLED, id++, "碟片");
				id++;
				funcs[id] = [_this.SwitchCover, this.matchResult[4][0]];
				baseMenu.AppendMenuItem(this.matchResult[4].length ? MF_STRING : MF_DISABLED, id--, "艺术家");
				funcs[id] = [_this.SwitchCover, this.matchResult[3][0]];
				baseMenu.AppendMenuItem(this.matchResult[3].length ? MF_STRING : MF_DISABLED, id++, "图标");
				id++;
				if (currentPathItem && this.matchResult[-1].length) {
					var flag = currentPathItem.artId == -1 ? MF_CHECKED : MF_STRING;
					funcs[id] = [_this.SwitchCover, this.matchResult[-1][0]];
					baseMenu.AppendMenuItem(flag, id++, "流派");
				}
				else baseMenu.AppendMenuItem(MF_DISABLED, id++, "流派");
				if (currentPathItem && currentPathItem.artId != -1) baseMenu.CheckMenuItem(currentPathItem.artId + 2, true);
			}

			this.Pop = function(x, y) {
				if (!baseMenu) this.Build();
				var ret = baseMenu.TrackPopupMenu(x, y);
				if (ret) funcs[ret] && funcs[ret][0].call(_this, funcs[ret][1]);
				this.Dispose();
			}

			this.Dispose = function() {
				baseMenu = null;
				funcs = {};
			}
		}();
	}

	this.funcMenu = new function() {
		var baseMenu = null,
			subMenus = [];
		var funcs = {};

		this.Build = function() {
			var id = 1;
			baseMenu = window.CreatePopupMenu();

			funcs[id] = [_this.AboutCurrentImage, null];
			baseMenu.AppendMenuItem(currentPathItem ? MF_STRING : MF_DISABLED, id++, "关于当前图片");
			funcs[id] = [_this.ViewWithExternalViewer, null];
			baseMenu.AppendMenuItem(currentPathItem && !currentPathItem.embed ? MF_STRING : MF_DISABLED, id++, "在外部查看器中查看");
			funcs[id] = [_this.OpenContainingFolder, null];
			baseMenu.AppendMenuItem(currentPathItem ? MF_STRING : MF_DISABLED, id++, "打开图片所在目录");
			funcs[id] = [_this.Refresh, true];
			baseMenu.AppendMenuItem(MF_STRING, id++, "刷新 (F5)");

			baseMenu.AppendMenuSeparator();
			if (currentMetadb) {
				//dl_id = 3;
				var subMenu_MAP = window.CreatePopupMenu();
				subMenus.push(subMenu_MAP);
				subMenu_MAP.AppendTo(baseMenu, MF_POPUP, "管理内嵌图像");

				funcs[id] = [_this.ManageAttachedImages, [0, currentMetadb]];
				subMenu_MAP.AppendMenuItem(MF_STRING, id++, "封面标签");
				funcs[id] = [_this.ManageAttachedImages, [1, currentMetadb]];
				subMenu_MAP.AppendMenuItem(MF_STRING, id++, "批量内嵌图像");
				funcs[id] = [_this.ManageAttachedImages, [2, currentMetadb]];
				subMenu_MAP.AppendMenuItem(MF_STRING, id++, "移除所有图像");
			} else {
				baseMenu.AppendMenuItem(MF_DISABLED, id++, "管理内嵌图像");
			}
	
			if (currentMetadb && _this.Properties.SearchScriptPresets.length) {
				var subMenu_SPFI = window.CreatePopupMenu();
				subMenus.push(subMenu_SPFI);
				subMenu_SPFI.AppendTo(baseMenu, MF_POPUP, "从网络搜索图片");
				var caption;
				for (var i = 0; i < _this.Properties.SearchScriptPresets.length; i++) {
					funcs[id] = [_this.SearchFromWeb, [i, currentMetadb]];
					caption = fb.TitleFormat(_this.Properties.SearchScriptPresets[i].name).EvalWithMetadb(currentMetadb);
					if (caption.length > 42) caption = caption.slice(0, 40) + "...";
					subMenu_SPFI.AppendMenuItem(MF_STRING, id++, caption);
				}
			} else baseMenu.AppendMenuItem(MF_DISABLED, id++, "从网络搜索图片");
			
			baseMenu.AppendMenuSeparator();

			var subMenu_IS = window.CreatePopupMenu();
			subMenus.push(subMenu_IS);
			subMenu_IS.AppendTo(baseMenu, MF_POPUP, "图像拉伸");

			funcs[id] = [_this.SetStretchProperties, 0];
			subMenu_IS.AppendMenuItem(imgArray.Properties.Stretch ? MF_CHECKED : MF_STRING, id++, "拉大图像");
			funcs[id] = [_this.SetStretchProperties, 1];
			subMenu_IS.AppendMenuItem(imgArray.Properties.KeepAspectRatio ? MF_CHECKED : MF_STRING, id++, "保持比例");
			subMenu_IS.AppendMenuSeparator();
			funcs[id] = [_this.SetStretchProperties, 2];
			subMenu_IS.AppendMenuItem(imgArray.Properties.Fill ? MF_CHECKED : MF_STRING, id++, "充满面板");

			funcs[id] = [_this.SetGenreBackup, null];
			baseMenu.AppendMenuItem(imgArray.Properties.TreatGenrePathAsBackup ? MF_CHECKED : MF_STRING, id++, "流派图片仅作备用");
			funcs[id] = [_this.SetAnimation, null];
			baseMenu.AppendMenuItem(Properties.Display.Animation.Enable ? MF_CHECKED : MF_STRING, id++, "淡入淡出效果");
			funcs[id] = [_this.ClearCache, null];
			baseMenu.AppendMenuItem(MF_STRING, id++, "清除缓存");
			baseMenu.AppendMenuSeparator();
			funcs[id] = [_this.CloseInfo, null];
			baseMenu.AppendMenuItem(show_infobar ? MF_STRING : MF_CHECKED, id++, "隐藏歌曲信息");
			funcs[id] = [_this.ShowProperties, null];
			baseMenu.AppendMenuItem(MF_STRING, id++, "面板属性");
		}

		this.Pop = function(x, y) {
			if (!baseMenu) this.Build();
			var ret = baseMenu.TrackPopupMenu(x, y);
			if (ret) funcs[ret] && funcs[ret][0].call(_this, funcs[ret][1]);
			this.Dispose();
		}

		this.Dispose = function() {
			baseMenu = null;
			subMenus = [];
			funcs = {};
		}
	}();

	this.cycle = new function(prop) {
		var timer;
		var locked = prop.SingleImageMode;
		this.paused = window.GetProperty("Cycle.Paused", false);

		this.Active = function() {
			if (!locked && !this.paused && !timer) timer = window.SetInterval(_this.OnTimer, prop.Period);
		}

		this.Stop = function() {
			timer && window.ClearInterval(timer);
			timer = null;
		}

		this.PauseOrResume = function() {
			if (this.paused) {
				this.paused = false;
				window.SetProperty("Cycle.Paused", false);
				this.Active();
			} else {
				this.paused = true;
				window.SetProperty("Cycle.Paused", true);
				this.Stop();
			}
		}

		this.Lock = function(lock) {
			locked = prop.SingleImageMode && lock;
			if (lock) this.Stop();
		}

		this.Reset = function() {
			this.Stop();
			this.Active();
		}
	}(this.Properties.Cycle);

	this.OnTimer = function() {
		_this.Next();
	}
	
	this.SwitchCyclePause = function() {
		this.cycle.PauseOrResume();
	}

	this.SwitchCover = function(index) {
		if (imgArray.length <= 1 || index < 0 || index >= imgArray.length || index == currentIndex) return;
		currentIndex = index;
		currentPathItem = imgArray.pathArray[currentIndex];
		this.cycle.Stop();
		imgArray.GetImage(currentIndex, NavFinished);
	}

	this.SwitchOthers = function(arg) {
		if (!this.imgSwitchMenu) return;
		var others = this.imgSwitchMenu.matchResult[-1];
		if (!others.length) return;
		var index;
		switch (arg) {
		case -2:
			index = others[0];
			break;
		case -1:
			index = currentIndex <= others[0] ? others[others.length - 1] : currentIndex - 1;
			break;
		case 1:
			index = currentIndex >= others[others.length - 1] ? others[0] : currentIndex + 1;
			if (index < others[0]) index = others[0];
			break;
		case 2:
			index = others[others.length - 1];
			break;
		}
		this.SwitchCover(index);
	}

	this.Next = function() {
		this.SwitchCover(currentIndex >= imgArray.length - 1 ? 0 : currentIndex + 1);
	}

	this.Prev = function() {
		this.SwitchCover(currentIndex <= 0 ? imgArray.length - 1 : currentIndex - 1);
	}

	function NavFinished(img) {
		currentImage = img;
		imgDisplay.ChangeImage(1, img, 1);
		SetMenuButtonCaption();
		_this.cycle.Reset();
	}

	function SetMenuButtonCaption() {
		if (!imgDisplay.menuButton) return;
		var caption;
		if (currentPathItem) caption = currentPathItem.artId == -1 ? "流派" : GetCaption(AlbumArtId.GetName(currentPathItem.artId).capitalize());
		else caption = "无封面";
		imgDisplay.menuButton.caption = GetCaption(caption);
	}

	this.AboutCurrentImage = function() {
		if (!currentPathItem) return;
		var str = [];

		str.push("  当前图片信息\n----------------------");

		str.push("\n图片类型:  ");
		str.push(currentPathItem.artId == -1 ? "流派" : GetCaption(AlbumArtId.GetName(currentPathItem.artId).capitalize()));

		str.push("\n文件路径:  ");
		if (currentPathItem.embed) str.push("(内嵌) ");
		str.push(currentPathItem.path);

		str.push("\n分辨率:  ");
		str.push(imgArray.currentImageItem ? (imgArray.currentImageItem.srcW + "×" + imgArray.currentImageItem.srcH) : "Invalid");

		PopMessage(str.join(""), 0);
	}

	this.ManageAttachedImages = function(arr) {
		if (!currentMetadb) return;
		switch (arr[0]) {
		case 0:
			fb.RunContextCommandWithMetadb("属性", arr[1]) || fb.RunContextCommandWithMetadb("Properties", arr[1]);
			break;
		case 1:
			fb.RunContextCommandWithMetadb("批量内嵌图像", arr[1]) || fb.RunContextCommandWithMetadb("Batch attach pictures", arr[1]);
			break;
		case 2:
			fb.RunContextCommandWithMetadb("移除所有图像", arr[1]) || fb.RunContextCommandWithMetadb("Remove all pictures", arr[1]);
			break;
		}
	}

	this.SearchFromWeb = function(arr) {
		var url, si = this.Properties.SearchScriptPresets[arr[0]];
		var keyword = fb.TitleFormat(si.keyword).EvalWithMetadb(arr[1]);
		keyword = encodeURIComponent(keyword);
		url = si.url.replace(/%s/ig, keyword);
		ShellExecute('"' + url + '"', "", "", "open", 1);
	}
	
	this.SetStretchProperties = function(switchWhichOne) {
		var str = imgArray.Properties.Stretch;
		var kar = imgArray.Properties.KeepAspectRatio;
		var fill = imgArray.Properties.Fill;
		if (switchWhichOne == 0) {
			str = !str;
			imgArray.Properties.Stretch = str;
			window.SetProperty("Image.Stretch.Stretch", str);
		} else if (switchWhichOne == 1) {
			kar = !kar;
			imgArray.Properties.KeepAspectRatio = kar;
			window.SetProperty("Image.Stretch.KeepAspectRatio", kar);
		} else if (switchWhichOne == 2) {
			fill = !fill;
			imgArray.Properties.Fill = fill;
			window.SetProperty("Image.Stretch.Fill", fill);
		}

		if (!fill || switchWhichOne == 2) {
			imgArray.ClearCache();
			if (imgArray.length) imgArray.GetImage(currentIndex, GetImageFinished);
		}

		function GetImageFinished(img) {
			currentImage = img;
			imgDisplay.ChangeImage(1, img, 1);
		}
	}

	this.SetFollowCursorProperties = function(fc) {
		this.Properties.FollowCursor = fc;
		window.SetProperty("foobox.infoArt.follow.cursor", this.Properties.FollowCursor);

		isFollowingCursor = this.Properties.FollowCursor || (!this.Properties.FollowCursor && !fb.IsPlaying);
		this.cycle.Lock(isFollowingCursor);

		if (isFollowingCursor) this.OnSelectionChanged(fb.GetSelection());
		else this.OnPlaybackNewTrack(fb.GetNowPlaying());
	}

	this.ViewWithExternalViewer = function() {
		if (currentPathItem) ShellExecute('"' +  currentPathItem.path + '"', "", "", "open", 1);
	}

	this.OpenContainingFolder = function() {
		if (currentPathItem) ShellExecute("explorer", '/select,\"' +  currentPathItem.path + '"', "", "open", 1);
	}

	function ShellExecute(arg1, arg2, arg3, arg4, arg5) {
		if (!shellObj) {
			try {
				shellObj = new ActiveXObject("Shell.Application");
			} catch (e) {
				PopMessage("Can not create ActiveX object (Shell.Application), command can't be execute. Please check your system authorities.", 16);
				return;
			}
		}
		shellObj.ShellExecute(arg1, arg2, arg3, arg4, arg5);
	}

	this.ShowMatchLog = function(toPopup) {
		Logger.Print(toPopup);
	}

	this.ClearCache = function() {
		imgArray.ClearCache();
	}
	
	this.SetGenreBackup = function() {
		imgArray.Properties.TreatGenrePathAsBackup = !imgArray.Properties.TreatGenrePathAsBackup;
		window.SetProperty("Image.Genre.Image.TreatAsBackup", imgArray.Properties.TreatGenrePathAsBackup);
	}
	
	this.SetAnimation = function() {
		Properties.Display.Animation.Enable = !Properties.Display.Animation.Enable;
		window.SetProperty("Cycle.Animation.Enable", Properties.Display.Animation.Enable);
	}
	
	this.CloseInfo = function() {
		show_infobar = !show_infobar;
		window.SetProperty("Display.InfoBar", show_infobar);
		window.Reload();
		on_size();
	}

	this.ShowProperties = function() {
		window.ShowProperties();
	}

	this.OnRightClick = function(x, y) {
		if (CoverDisplay.isXYIn(x, y) && this.funcMenu) this.funcMenu.Pop(x, y);
	}

	this.OnDoubleClick = function(x, y) {
		if (CoverDisplay.isXYIn(x, y)){// && currentPathItem) {
			this.ManageAttachedImages([0, currentMetadb]); // "Edit attached pictures"
		}
	}

	//-----------------------------------------------------------------
	this.OnSelectionChanged = function(metadb) {
		if (metadb) {
			if (isFollowingCursor && fb.GetSelectionType() < 3) OnNewTrack(metadb);
		} else OnStop();
	}

	this.OnPlaybackNewTrack = function(metadb) {
		if (metadb) {
			if (!this.Properties.FollowCursor) {
				isFollowingCursor = false;
				this.cycle.Lock(false);
				OnNewTrack(metadb);
			}
		} else OnStop();
	}

	this.OnPlaybackStop = function(reason) {
		this.cycle.Stop();
		if (reason == 2) {
		} else {
			isFollowingCursor = true;
			this.cycle.Lock(true);
			this.OnSelectionChanged(fb.GetSelection());
		}// else OnStop();
	}

	//------------------------------------------
	var isNewgroup;

	function OnNewTrack(metadb) {
		if (metadb && currentMetadb && currentMetadb.Compare(metadb)) {
			_this.SwitchCover(0);
			if (get_imgCol) getColorSchemeFromImage();
		}
		else {
			isNewgroup = false;
			currentIndex = -1;
			currentMetadb = metadb;
			imgArray.Update(currentMetadb, OnNewTrack_UpdateFinished);
		}
	}

	function OnNewTrack_UpdateFinished() {
		isNewgroup = groupString != (groupString = fb.TitleFormat(_this.Properties.GroupFormat).EvalWithMetadb(currentMetadb));
		if (imgArray.length) {
			currentIndex = 0;
			if (currentPathItem && imgArray.pathArray[0].path == currentPathItem.path && (!currentPathItem.embed || imgArray.pathArray[0].artId == currentPathItem.artId)) {
				currentPathItem = imgArray.pathArray[0];
				if (isNewgroup) imgDisplay.ChangeImage(1, currentImage, 2);
				if (imgArray.length > 1) _this.cycle.Active();
			} else {
				currentPathItem = imgArray.pathArray[0];
				imgArray.GetImage(currentIndex, OnNewTrack_GetImageFinished);
			}
		} else if (currentPathItem != null) {
			currentPathItem = null;
			currentImage = null;
			imgDisplay.ChangeImage(1, currentImage, isNewgroup ? 2 : 1);
			if(get_imgCol) {
				getColorSchemeFromImage();
				window.NotifyOthers("color_scheme_updated", null);
				if(eslPanels) eslPanels.SetTextHighlightColor(c_default_hl);
			}
		}
		SetMenuButtonCaption();
	}

	function OnNewTrack_GetImageFinished(img) {
		currentImage = img;
		imgDisplay.ChangeImage(1, currentImage, isNewgroup ? 2 : 1);
		if (imgArray.length > 1) _this.cycle.Active();
		if (get_imgCol) getColorSchemeFromImage();
	}
	
	getColorSchemeFromImage = function() {
		var imgColor = null;
		if(!currentImage || currentImage == null){
			window.NotifyOthers("color_scheme_updated", imgColor);
			if(eslPanels) eslPanels.SetTextHighlightColor(c_default_hl);
			get_imgCol = false;
		}else{
			var imgColorData = JSON.parse(currentImage.GetColourSchemeJSON(1));
			imgColor = toRGB(imgColorData[0].col);
			if(imgColor[0]>160 && imgColor[1]>160 && imgColor[2]>160){
				if(!dark_mode && imgColor[0]>240 && imgColor[1]>240 && imgColor[2]>240) imgColor = false;
				else{
					var reduction = Math.round((imgColor[0]+imgColor[1]+imgColor[2] - 480) / 3);
					imgColor[0] = Math.max(imgColor[0]-reduction, 0);
					imgColor[1] = Math.max(imgColor[1]-reduction, 0);
					imgColor[2] = Math.max(imgColor[2]-reduction, 0);
				}
			}
			else if(dark_mode && imgColor[0]<75 && imgColor[1]<75 && imgColor[2]<75){
				var reduction = Math.round((225-imgColor[0]-imgColor[1]-imgColor[2]) / 3);
				imgColor[0] = Math.min(imgColor[0]+reduction, 255);
				imgColor[1] = Math.min(imgColor[1]+reduction, 255);
				imgColor[2] = Math.min(imgColor[2]+reduction, 255);
			}
			window.NotifyOthers("color_scheme_updated", imgColor);
			get_imgCol = false;
		}
		on_colorscheme_update(imgColor);
	}
	
	on_colorscheme_update = function(imgColor){
		var c_hl_tmp = c_highlight;
		if(imgColor) c_highlight = RGB(imgColor[0], imgColor[1], imgColor[2]);
		else c_highlight = c_default_hl;
		c_rating_h = c_highlight;
		if(c_highlight != c_hl_tmp){
			if(imgColor && dark_mode){
				var r = getRed(c_background) + 27;
				var g = getGreen(c_background) + 27;
				var b = getBlue(c_background) + 27;
				if(Math.abs(imgColor[0]-r)<25 && Math.abs(imgColor[1]-g)<25 && Math.abs(imgColor[2]-b)<25) c_rating_h = fontcolor;
			}
			get_imgs();
			if (is_mood && show_infobar) btn_mood.resetImg();
			if(eslPanels) eslPanels.SetTextHighlightColor(c_highlight);
			window.RepaintRect(0, infobar_y, ww, infobar_h);
		}
	}
	
	//------------------------------------------

	function OnStop() {
		imgArray.Update();
		if (currentPathItem) imgDisplay.ChangeImage(1, null, 2);
		currentMetadb = null;
		groupString = null;
		currentPathItem = null;
		currentImage = null;
		SetMenuButtonCaption();
		_this.cycle.Lock(true);
		window.Repaint();
	}

	//------------------------------------------
	var refresh_ignoreCache;
	this.Refresh = function(ignoreCache, metadb) {
		refresh_ignoreCache = ignoreCache;
		if (!metadb) metadb = isFollowingCursor ? fb.GetSelection() : fb.GetNowPlaying();
		if (metadb) {
			currentMetadb = metadb;
			groupString = fb.TitleFormat(_this.Properties.GroupFormat).EvalWithMetadb(metadb);
			imgArray.Update(metadb, Refresh_UpdateFinished, ignoreCache);
		} else {
			groupString = "";
			Refresh_UpdateFinished();
		}
	}

	function Refresh_UpdateFinished() {
		if (imgArray.length) {
			if (currentIndex == -1 || currentIndex >= imgArray.length) currentIndex = 0;
			currentPathItem = imgArray.pathArray[currentIndex];
			imgArray.GetImage(currentIndex, Refresh_GetImageFinished, refresh_ignoreCache);
		} else Refresh_GetImageFinished(null);
		SetMenuButtonCaption();
	}

	function Refresh_GetImageFinished(img) {
		currentImage = img;
		if (currentMetadb) {
			imgDisplay.ChangeImage(1, currentImage, 1);
			window.Repaint();
		}
		if (imgArray.length > 1) _this.cycle.Active();
	}

	//------------------------------------------
	this.Resize = function(w, h) {
		if (w == 0 || h == 0) return;
		imgDisplay.Resize(w, h);
		imgArray.Resize(imgDisplay.ImageRange.w, imgDisplay.ImageRange.h);

		if (imgArray.length) imgArray.GetImage(currentIndex, Resize_GetImageFinished);
		else Resize_GetImageFinished(null);
	}

	function Resize_GetImageFinished(img) {
		currentImage = img;
		imgDisplay.Refresh(1, currentImage);
		window.Repaint();
	}

	//------------------------------------------
	this.Init = function() {
		if (imgDisplay.menuButton && this.imgSwitchMenu) imgDisplay.menuButton.menu = this.imgSwitchMenu;

		isFollowingCursor = this.Properties.FollowCursor|| (!this.Properties.FollowCursor && !fb.IsPlaying);
		this.cycle.Lock(isFollowingCursor);

		metadb = isFollowingCursor ? fb.GetSelection() : fb.GetNowPlaying();
		if (metadb) {
			currentMetadb = metadb;
			groupString = fb.TitleFormat(this.Properties.GroupFormat).EvalWithMetadb(metadb);
			imgArray.Update(metadb, Init_UpdateFinished);
		} else {
			groupString = "";
			Init_UpdateFinished();
		}
	}

	function Init_UpdateFinished() {
		//this.ShowMatchLog();
		if (imgArray.length) {
			currentIndex = currentIndex == -1 ? 0 : currentIndex;
			currentPathItem = imgArray.pathArray[currentIndex];
			imgArray.GetImage(currentIndex, Init_GetImageFinished);
		} else Init_GetImageFinished(null);
		SetMenuButtonCaption();
	}

	function Init_GetImageFinished(img) {
		currentImage = img;
		imgDisplay.Refresh(1, currentImage);
		if (imgArray.length > 1) _this.cycle.Active();
	}

	this.Init();
}


// ===================================================

var themePath = fb.FoobarPath + "themes\\foobox\\js_panels";
//------------------------------------------------
var VBE;
try {
	VBE = new ActiveXObject("ScriptControl");
	VBE.Language = "VBScript";
} catch (e) {
	PopMessage("Can not create ActiveX object (ScriptControl), some functions are not available.\nPlease check your system authorities.", 1);
}

function PopMessage(text, type) {
	fb.ShowPopupMessage(text, "Foobox Cover Panel", type);
}
//------------------------------------------------
var Properties = new function() {
		this.Controller = {
			GroupFormat: window.GetProperty("Image.GroupFormat", "%album artist%|%album%"),
			//false: When not playing, true: Always.
			FollowCursor: window.GetProperty("foobox.infoArt.follow.cursor", false),//fbx_set[10],
			Cycle: {
				SingleImageMode: window.GetProperty("Cycle.SingleImageMode", false),
				Period: window.GetProperty("Cycle.Period", 20000)
			}
		}

		if (typeof(this.Controller.Cycle.Period) != "number") this.Controller.Cycle.Period = 15000;
		else if (this.Controller.Cycle.Period < 100) this.Controller.Cycle.Period = 100;
		window.SetProperty("Cycle.Period", this.Controller.Cycle.Period);

		this.Display = {
			Animation: {
				Enable: window.GetProperty("Cycle.Animation.Enable", true),
				RefreshInterval: window.GetProperty("Cycle.Animation.RefreshInterval", 60),
				Duration: window.GetProperty("Cycle.Animation.Duration", 480)
			}
		}

		if (typeof(this.Display.Animation.RefreshInterval) != "number") this.Display.Animation.RefreshInterval = 50;
		else if (this.Display.Animation.RefreshInterval < 10) this.Display.Animation.RefreshInterval = 10;
		window.SetProperty("Cycle.Animation.RefreshInterval", this.Display.Animation.RefreshInterval);

		if (typeof(this.Display.Animation.Duration) != "number") this.Display.Animation.Duration = 300;
		else if (this.Display.Animation.Duration < this.Display.Animation.RefreshInterval) this.Display.Animation.Duration = this.Display.Animation.RefreshInterval;
		window.SetProperty("Cycle.Animation.Duration", this.Display.Animation.Duration);

		//------------------------------------------------------
		var GenrePathFormat = "%genre%";
		this.Image = {
			BuildinPathFormat: '<front>||<back>||<disc>||<artist>||<icon>',
			GenrePathFormat: GenrePathFormat,
			TreatGenrePathAsBackup: window.GetProperty("Image.Genre.Image.TreatAsBackup", true),
			//SupportedTypes: ['jpg', 'png', 'gif', 'bmp', 'jpeg'],
			SupportedTypes: ['jpg', 'png'],
			SingleImageMode: this.Controller.Cycle.SingleImageMode,
			CycleInWildCard: window.GetProperty("Cycle.CycleInWildCard", true),
			MaxFileSize: window.GetProperty("Image.Genre.MaxFileSize (byte)", 2621440),
			AtMostLoadImagesNumber: window.GetProperty("Image.AtMostLoadImagesNumber", 10),
			KeepAspectRatio: window.GetProperty("Image.Stretch.KeepAspectRatio", true),
			Stretch: window.GetProperty("Image.Stretch.Stretch", true),
			Fill: window.GetProperty("Image.Stretch.Fill", false),
			InterpolationMode: window.GetProperty("Image.Stretch.InterpolationMode", 2),
			ImagesCacheCapacity: window.GetProperty("Image.CacheCapacity.Images", 10),
			PathsCacheCapacity: window.GetProperty("Image.CacheCapacity.Paths", 30)
		}

		this.Image.GenrePathFormat = this.Image.GenrePathFormat.replace(/%foobar_path%/ig, fb.FoobarPath.slice(0, -1)); // Process %foobar_path% field.
		this.Image.PathFormatGroup = [this.Image.BuildinPathFormat, this.Image.GenrePathFormat];

		if (typeof(this.Image.MaxFileSize) != "number") this.Image.MaxFileSize = 2621440;
		else if (this.Image.MaxFileSize < 0) this.Image.MaxFileSize = 0;
		window.SetProperty("Image.Genre.MaxFileSize (byte)", this.Image.MaxFileSize);

		if (typeof(this.Image.AtMostLoadImagesNumber) != "number") this.Image.AtMostLoadImagesNumber = 10;
		else if (this.Image.AtMostLoadImagesNumber < 0) this.Image.AtMostLoadImagesNumber = 0;
		window.SetProperty("Image.AtMostLoadImagesNumber", this.Image.AtMostLoadImagesNumber);

		if (typeof(this.Image.ImagesCacheCapacity) != "number") this.Image.ImagesCacheCapacity = 10;
		else if (this.Image.ImagesCacheCapacity < 0) this.Image.ImagesCacheCapacity = 0;
		window.SetProperty("Image.CacheCapacity.Images", this.Image.ImagesCacheCapacity);

		if (typeof(this.Image.PathsCacheCapacity) != "number") this.Image.PathsCacheCapacity = 10;
		else if (this.Image.PathsCacheCapacity < 0) this.Image.PathsCacheCapacity = 0;
		window.SetProperty("Image.CacheCapacity.Paths", this.Image.PathsCacheCapacity);
}();


//===================================================
for (var i = 0; i < SearchItems.length; i++) {
	if (!SearchItems[i] instanceof SearchItem) {
		SearchItems.splice(i, 1);
		i--;
	}
}

Properties.Controller.SearchScriptPresets = SearchItems;
//====================================
get_font();
get_var();
get_colors();
if(show_infobar) get_imgs();
//-------------------
var Covers = new ImagesArray(Properties.Image);
var CoverDisplay = new Display(0, 0, 0, 0, Properties.Display);
var MainController = new Controller(Covers, CoverDisplay, Properties.Controller);
// START ==============================================
initMetadb();
function on_paint(gr) {
	if (!ww || !wh) return;
	gr.FillSolidRect(0, 0, ww, wh, c_background);
	CoverDisplay.Draw(gr);
	if (currentMetadb && show_infobar) {
		for (var i = 1; i < rbutton.length + 1; i++) {
			rbutton[i - 1].Paint(gr, i);
		}
		if (is_mood) btn_mood.Paint(gr);
		gr.GdiDrawText(txt_title, g_font, fontcolor, 0, infobar_y + imgh + 1*zdpi, ww, 30*zdpi, DT_CENTER | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX | DT_END_ELLIPSIS);
		var txt_line2 = (txt_info !="" && show_info) ? txt_info : txt_profile;
		gr.GdiDrawText(txt_line2, g_font2, fontcolor2, 0, line2_y, ww, 25*zdpi, DT_CENTER | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX | DT_END_ELLIPSIS);
	}
}

function on_size() {
	if (!window.Width || !window.Height) return;
	ww = window.Width;
	wh = window.Height;
	MainController.Resize(Math.max(ww, 50), Math.max(wh, 50) - infobar_h);
	
	if(show_infobar){
		infobar_y = Math.round(wh - infobar_h + 5 * zdpi);
		line2_y = infobar_y + imgh + 30*zdpi;
		initbutton();
		
		if(is_mood) {
			var spacing = Math.min(15, Math.round(ww / 25));
		}else{
			var spacing = imgw;
		}
		var img_rating_w = imgw * 5 + spacing * 4;
		rating_x = Math.round((ww - img_rating_w) / 2);
		if(is_mood) btn_mood.setx(rating_x - btn_mood.w - spacing);
		for(var i = 0; i < rbutton.length; i++){
			rbutton[i].setx(rating_x + imgw * i + spacing * i);
		}
		TextBtn_info.setSize(0, imgh + infobar_y, ww, infobar_h - imgh);
	}
}

function on_selection_changed(metadb) {
	if (!fb.IsPlaying || MainController.Properties.FollowCursor) {
		metadb = fb.GetFocusItem();
		MainController.OnSelectionChanged(metadb);
		OnMetadbChanged();
	}
}

function on_playlist_switch() {
	if (!fb.IsPlaying || MainController.Properties.FollowCursor) {
		metadb = fb.GetFocusItem();
		MainController.OnSelectionChanged(metadb);
		OnMetadbChanged();
	}
}

function on_playback_new_track(metadb) {
	if (!MainController.Properties.FollowCursor && color_bycover) get_imgCol = true;
	MainController.OnPlaybackNewTrack(metadb);
	OnMetadbChanged();
}

function on_playback_stop(reason) {
	MainController.OnPlaybackStop(reason);
	OnMetadbChanged();
}

var cursorX, cursorY;

function on_mouse_move(x, y) {
	cursorX = x, cursorY = y;
	CoverDisplay.OnMouseMove && CoverDisplay.OnMouseMove(x, y);

}

function on_mouse_lbtn_down(x, y) {
	CoverDisplay.OnMouseDown && CoverDisplay.OnMouseDown(x, y);
}

function on_mouse_lbtn_up(x, y) {
	CoverDisplay.OnMouseUp && CoverDisplay.OnMouseUp(x, y);
	if(show_infobar){
		for (var i = 1; i < rbutton.length + 1; i++) {
			rbutton[i - 1].MouseUp(x, y, i);
		}
		if (is_mood && btn_mood.isXYInButton(x, y)) btn_mood.OnClick();
	}
}

function on_mouse_leave() {
	CoverDisplay.OnMouseLeave && CoverDisplay.OnMouseLeave();
}

function on_mouse_lbtn_dblclk(x, y, mask) {
	MainController.OnDoubleClick(x, y, mask);
	if (show_infobar && TextBtn_info.isXYInButton(x, y)){
		if (fb.IsPlaying) {
			fb.RunMainMenuCommand("激活正在播放项目");
			window.NotifyOthers("show_Now_Playing", 1);
		}
	}
}

function on_mouse_wheel(delta) {
	if (!CoverDisplay.isXYIn(cursorX, cursorY)) return;
	if (delta > 0) MainController.Prev();
	else MainController.Next();
}

function on_metadb_changed(handles, fromhook) {
	if(currentMetadb && currentMetadb.Compare(handles[0])) {
		MainController.Refresh(true, handles[0]);
		OnMetadbChanged();
	}
}

function on_get_album_art_done(metadb, art_id, image, image_path) {
	Covers.OnGetAlbumArtDone(metadb, art_id, image, image_path);
}


function on_load_image_done(cookie, image) {
	Covers.OnLoadImageDone(cookie, image)
}

function on_mouse_rbtn_up(x, y, vkey) {
	MainController.OnRightClick(x, y, vkey);
	if (show_infobar && TextBtn_info.isXYInButton(x, y)) {
		var rMenu = window.CreatePopupMenu();
		rMenu.AppendMenuItem(MF_STRING, 3, "显示喜爱按钮");
		rMenu.CheckMenuItem(3, is_mood ? 1 : 0);
		rMenu.AppendMenuSeparator();
		rMenu.AppendMenuItem(MF_STRING, 1, "激活正在播放项目");
		rMenu.AppendMenuItem(MF_STRING, 2, "属性");
		rMenu.AppendMenuSeparator();
		rMenu.AppendMenuItem(show_infobar ? MF_STRING : MF_CHECKED, 6, "隐藏歌曲信息");
		rMenu.AppendMenuItem(MF_STRING, 5, "面板属性");
		var a = rMenu.TrackPopupMenu(x, y);
		switch (a) {
		case 1:
			if (fb.IsPlaying) {
				fb.RunMainMenuCommand("激活正在播放项目");
				window.NotifyOthers("show_Now_Playing", 1);
			}
			break;
		case 2:
			if (currentMetadb) fb.RunContextCommandWithMetadb("属性", currentMetadb);
			break;
		case 3:
			is_mood = !is_mood;
			window.SetProperty("Display.Mood", is_mood);
			on_size();
			window.RepaintRect(0, infobar_y, ww, mood_h);
			break;
		case 5:
			window.ShowProperties();
			break;
		case 6:
			show_infobar = !show_infobar;
			window.SetProperty("Display.InfoBar", show_infobar);
			window.Reload();
			on_size();
			break;
		}
	}
	return true;
}

function on_font_changed() {
	get_font();
	if(show_infobar){
		get_var();
		get_imgs();
		on_size();
		window.RepaintRect(0, infobar_y, ww, infobar_h);
	}
	CoverDisplay.menuButton.ClearCache();
};

function on_colours_changed() {
	get_colors();
	if(show_infobar){
		get_imgs();
	}
	on_size();
	window.Repaint();
};

function on_notify_data(name, info) {
	switch (name) {
	case "foobox_infoArt_followcursor":
		MainController.SetFollowCursorProperties(info);
		OnMetadbChanged();
		break;
	case "set_rating_2_tag":
		rating_to_tag = info;
		window.SetProperty("foobox.rating.write.to.file", rating_to_tag);
		break;
	case "foobox_color_bycover":
		color_bycover = info;
		window.SetProperty("foobox.color.by.cover", color_bycover);
		if(color_bycover){
			if (!MainController.Properties.FollowCursor) {
				get_imgCol = true;
				getColorSchemeFromImage();
			}
		} else{
			get_imgCol = false;
			window.NotifyOthers("color_scheme_updated", null);
			if(eslPanels) eslPanels.SetTextHighlightColor(c_default_hl);
			on_colorscheme_update(false);
		}
		break;
	}
}

//----------------infobar-----------------------
var timer_cycle = false;

if (timer_cycle) {
	window.KillTimer(timer_cycle);
	timer_cycle = false;
}

function activate_infotimer(){
	if(!timer_cycle) timer_cycle = window.SetInterval(function() {
		show_info = !show_info;
		window.RepaintRect(0, line2_y, ww, 25*zdpi);
	}, time_circle);
}

function dactivate_infotimer(){
	timer_cycle && window.ClearInterval(timer_cycle);
	timer_cycle = false;
}

if(show_infobar) activate_infotimer();

/****************************************
 * DEFINE CLASS ButtonUI  for RATING
 *****************************************/
function ButtonUI_R() {
	this.y = infobar_y;
	this.width = imgw;
	this.height = imgh;
	
	this.setx = function(x){
		this.x = x;
	}

	this.Paint = function(gr, button_n) {
		this.img = ((rating - button_n) >= 0) ? img_rating_on : img_rating_off;
		gr.DrawImage(this.img, this.x, this.y, this.width, this.height, 0, 0, this.width, this.height, 0);
	}

	this.MouseUp = function(x, y, i) {
		if (currentMetadb) {
			let handle_list = new FbMetadbHandleList(currentMetadb);
			if (x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height) {
				var derating_flag = (i == rating ? true : false);
				if (derating_flag) {
					if (rating_to_tag && tracktype < 2) handle_list.UpdateFileInfoFromJSON(JSON.stringify({"RATING" : ""}));
					fb.RunContextCommandWithMetadb("Playback Statistics/Rating/" + "<not set>", currentMetadb) || fb.RunContextCommandWithMetadb("播放统计信息/等级/" + "<未设置>", currentMetadb);
				} else {
					if (rating_to_tag && tracktype < 2) handle_list.UpdateFileInfoFromJSON(JSON.stringify({"RATING" : i}));
					fb.RunContextCommandWithMetadb("Playback Statistics/Rating/" + i, currentMetadb) || fb.RunContextCommandWithMetadb("播放统计信息/等级/" + i, currentMetadb);
				}
			}
		}
	}
}

function on_key_down(vkey) {
	var mask = GetKeyboardMask();
	switch (mask) {
	case KMask.ctrl:
		switch (vkey) {
		case 80:// CTRL+P
			fb.RunMainMenuCommand("文件/参数选项");
			break;
		case 70:// CTRL+F
			fb.RunMainMenuCommand("编辑/搜索");
			break;
		case 78:// CTRL+N
			fb.RunMainMenuCommand("文件/新建播放列表");
			break;
		case 83:// CTRL+S
			fb.RunMainMenuCommand("文件/保存播放列表...");
			break;
		case 87:// CTRL+W
			fb.RunMainMenuCommand("文件/移除播放列表");
			break;
		case 79:// CTRL+O
			fb.RunMainMenuCommand("文件/打开...");
			break;
		case 85:// CTRL+U
			fb.RunMainMenuCommand("文件/添加位置...");
			break;
		case 65:// CTRL+A
			fb.RunMainMenuCommand("编辑/全选");
			break;
		}
		break;
	case KMask.alt:
		switch (vkey) {
		case 65:// ALT+A
			fb.RunMainMenuCommand("视图/总在最上面");
			break;
		case 115://Alt+F4
			fb.RunMainMenuCommand("文件/退出");
			break;
		case 13://Alt+Enter
			fb.RunMainMenuCommand("属性");
			break;
		};
		break;
	case KMask.none:
		switch (vkey) {
		case 116:// F5
			MainController.Refresh(true, currentMetadb);
			break;
		};
		break;
	}
}

function on_script_unload() {
	dactivate_infotimer();
}
//EOF