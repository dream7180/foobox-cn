//Name"WSH Cover Panel"
//Version 2.0.1f
//Author Jensen (jensen-yg@163.com) ------------
//mod for foobox http://blog.sina.com.cn/dream7180
var fbx_set = [];
window.NotifyOthers("get_fbx_set", fbx_set);
var zdpi = fbx_set[9];
var ui_mode = fbx_set[11];
var g_fname = fbx_set[13];
var g_fsize = fbx_set[14];
var album_front_disc = fbx_set[21];
var genre_cover_dir = fbx_set[24];
var show_shadow = fbx_set[28];
var col_by_cover = fbx_set[30];
var tracktype = 8;
var Caption_Pack = {
	"Front": "封面",
	"Back": "封底",
	"Disc": "碟片",
	"Icon": "图标",
	"Artist": "艺术家"
}
var currentMetadb = null;

function GetCaption(name) {
	var str = Caption_Pack[name];
	if (!str) str = name;
	return str;
}

//===================================
// Flags, used by Menu -----------------
var MF_STRING = 0x00000000;
var MF_DISABLED = 0x00000002;
var MF_CHECKED = 0x00000008;
var MF_POPUP = 0x00000010;

var window_id = window.ID;

var AlbumArtId = {
	front: 0,
	back: 1,
	disc: 2,
	icon: 3,
	artist: 4,

	GetName: function(value) {
		for (var i in this) {
			if (this[i] == value) return i;
		}
		return null;
	}
};

var dl_id = 0;
//menu of online search links
var SearchItems = [];
var getColor = false;

function getRed(color) {
	return ((color >> 16) & 0xff);
}

function getGreen(color) {
	return ((color >> 8) & 0xff);
}

function getBlue(color) {
	return (color & 0xff);
}

function SearchItem(name, url, keyword) {
	this.name = name;
	this.url = url;
	this.keyword = keyword;
}
SearchItems.push(new SearchItem("Baidu.com", "https://image.baidu.com/search/index?tn=baiduimage&word=%s", "[%album artist% ][%album%]"));
SearchItems.push(new SearchItem("Google.com", "https://www.google.com/search?q=%s&tbm=isch", "[%album artist% ][%album%]"));
SearchItems.push(new SearchItem("Last.fm", "http://www.last.fm/search?q=%s&type=album", "[%album artist% ][%album%]"));

//var show_cover_case = window.GetProperty("Panel.ShowCoverCase", false);
var img_padding_x = 0;
// Some functions =======================================

function CalcNewImgSize(img, dstW, dstH, srcW, srcH, strch, kar, fill) { // Calculate image's new size and offsets in new width and height range. 
	if (!img) return;
	if (!srcW) srcW = img.width;
	if (!srcH) srcH = img.height;
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
	g.DrawImage(img, 0, 0, w, h, 0, 0, img.width, img.height);
	newImg.ReleaseGraphics(g);
	return newImg;
}

//-------------------------------------

function CreateRawBitmap2(img) {
	var bmp = img.CreateRawBitmap();
	img.Dispose();
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
		string.push("WSH Cover match log -------------------------------\n");
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

		if (toPopup) PopMessage(0, string.join(""), 0);
		else fb.trace(string.join(""));
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
	this.srcW = srcw ? srcw : (img ? img.width : 0);
	this.srcH = srch ? srch : (img ? img.height : 0);
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
				width: this.srcW,
				height: this.srcH
			}, dstw, dsth);
			if (size.w == this.img.width && size.h == this.img.height) // Nothing need to be changed.
			img = this.img;
			else if (Math.abs(size.w - this.img.width) < Math.max(this.img.width * 0.1, 5) && Math.abs(size.h - this.img.height) < Math.max(this.img.height * 0.1, 5)) { // Not too much, just take a zoom.
				//img = this.img.Resize(size.w, size.h);
				img = ResizeImage(this.img, size.w, size.h);
			} else if (size.w > this.img.width || size.h > this.img.height) // Too large to zoom, back to reload.
			return null;
			else { // Too small, update caches too.
				img = ResizeImage(this.img, size.w, size.h);
				this.img.Dispose();
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
		var srcW = img.width,
			srcH = img.height;
		var size = CalcNewImgSize(img, w, h);
		if (srcW != size.w || srcH != size.h) {
			var img2 = ResizeImage(img, size.w, size.h);
			img.Dispose();
			img = img2;
		}
		if (img == undefined) return null;
		if (img.width > w || img.height > h) {
			var img2 = img.Clone(-size.x, -size.y, w, h);
			img.Dispose();
			img = img2;
		}
		StoreCache(img, pathitem, srcW, srcH);
		return new ImageItem(img, srcW, srcH);
	}

	this.Load = function(pathitem, whendone, ignoreCache, sync) {
		pathitem.time = Logger.profiler.Time;
		var imgitem = (!maxCacheLength || ignoreCache) ? null : SearchCache(pathitem, w, h);
		if (imgitem) {
			pathitem.loadConsuming = Logger.profiler.Time - pathitem.time;
			pathitem.cacheHit = true;
			whendone && whendone(imgitem);
			return;
		} else pathitem.cacheHit = false;

		if (sync) {
			var img;
			if (pathitem.artId == -1) img = gdi.Image(pathitem.path);
			else if (pathitem.embed) img = utils.GetAlbumArtEmbedded(pathitem.metadb.RawPath, pathitem.artId);
			else img = utils.GetAlbumArtV2(pathitem.metadb, pathitem.artId, false);
			imgitem = new ImageItem(img);
			whendone && whendone(imgitem);
		} else {
			var cookie = null;
			if (pathitem.artId == -1) cookie = gdi.LoadImageAsync(window_id, pathitem.path);
			else utils.GetAlbumArtAsync(window_id, pathitem.metadb, pathitem.artId, false, pathitem.embed);
			imgLoadingQueue.push(new QueueItem(cookie, pathitem, whendone));
		}
	}

	this.OnGetAlbumArtDone = function(metadb, art_id, image, image_path) {
		if (!imgLoadingQueue.length) {
			image && image.Dispose();
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
			image && image.Dispose();
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
		CollectGarbage(); // Release memory.
	}

	this.FlushQueue = function() {
		if (!imgLoadingQueue.length) return;
		for (var i = 0; i < imgLoadingQueue.length; i++) {
			imgLoadingQueue[i].whenDone = null;
		}
		//imgLoadingQueue = [];
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
			paths = utils.Glob(pathitem.path).toArray();
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
			image && image.Dispose();
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
		//albumArtCheckQueue = [];
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
			this.enable = prop.Animation.Enable;
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
		this.img && this.img != cover_default && this.img.Dispose();

		if (type == 0) {
			this.img = null;
			this.isDefault = false;
			this.size = {};
		} else if (img) {
			this.img = img;
			this.isDefault = false;
			this.CalcSize(this.w, this.h);
			if (this.w && this.h && (this.size.w != img.width || this.size.h != img.height)) {
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
		g.DrawRect(x + this.size.x - 1, y + this.size.y - 1, this.size.w + 1, this.size.h + 1, 1, RGBA(255, 255, 255, opacity));
		g.DrawRect(x + this.size.x - 2, y + this.size.y - 2, this.size.w + 3, this.size.h + 3, 1, RGBA(0, 0, 0, opacity / 2.8));
		try {
			g.GdiAlphaBlend(this.img, x + this.size.x, y + this.size.y, this.size.w, this.size.h, 0, 0, this.img.width, this.img.height, opacity);
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

		if (aniNo == 0 || !animation.enable) this.SetImage(type, img);
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
		this.ImageRange.w = Math.max(Math.min(this.w, this.h) - 6, 0);
		this.ImageRange.h = this.ImageRange.w;
		this.ImageRange.x = this.x + Math.round((this.w - this.ImageRange.w) / 2) - img_padding_x;
		this.ImageRange.y = this.y + Math.round((this.h - this.ImageRange.h) / 2);

		if (this.ImageRange.w != old_w || this.ImageRange.h != old_h) {
			GenerateImages(this.ImageRange.w, this.ImageRange.h);
			CoverItem.prototype.w = this.ImageRange.w;
			CoverItem.prototype.h = this.ImageRange.h;
			CoverItem.prototype.defaultImg = cover_default;
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
		cover_default && cover_default.Dispose();
		cover_default = gdi.CreateImage(w, h);
		var g = cover_default.GetGraphics();
/*
		g.FillSolidRect(0, 0, w, h, RGBA(192,171,116,255));
		var txt_font = GdiFont("Tahoma",Math.floor(w/7),0);
		var txt_title_w = g.CalcTextWidth("FOOBOX", txt_font);
		var txt_title_h = g.CalcTextHeight("FOOBOX", txt_font);
		var margin_left = (w - txt_title_w)/2;
		var margin_top = (h - txt_title_h)/2 - 0.05*h;
		g.SetTextRenderingHint(4);
		g.DrawString("FOO",txt_font, RGBA(255,255,255,255), margin_left,margin_top,txt_title_w,txt_title_h)
		g.DrawString("BOX",txt_font, RGBA(0,0,0,255), margin_left+txt_title_w/2,margin_top,txt_title_w,txt_title_h)
		g.DrawString("5  E D I T I O N",GdiFont("Tahoma",Math.floor(w/26),0), RGBA(0,0,0,255), margin_left+txt_title_w/2,margin_top+txt_title_h+10,txt_title_w,txt_title_h)
		*/
		var cover_img_default = gdi.Image(fb.FoobarPath + "themes\\foobox\\images\\cover_default.jpg")
		g.DrawImage(cover_img_default, 0, 0, w, h, 0, 0, cover_img_default.Width, cover_img_default.Height, 0);
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
			g.FillRoundRect(1, 1, img_btn.width - 2, img_btn.height / 3 - 2, 8, 8, RGBA(0, 0, 0, 80));
			g.FillRoundRect(1, img_btn.height / 3 + 1, img_btn.width - 2, img_btn.height / 3 - 2, 8, 8, RGBA(0, 0, 0, 120));
			g.FillRoundRect(1, img_btn.height * 2 / 3 + 1, img_btn.width - 2, img_btn.height / 3 - 2, 8, 8, RGBA(0, 0, 0, 140));
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

				g.GdiAlphaBlend(img_btn, this.x, this.y, this.w, this.h, 0, this.state * this.h, img_btn.width, this.h, opacity * opacity2 / 255);
				if (state_old != -1) g.GdiAlphaBlend(img_btn, this.x, this.y, this.w, this.h, 0, state_old * this.h, img_btn.width, this.h, (255 - opacity) * opacity2 / 255);

				if (!imgCache.img || imgCache.text != this.caption) {
					imgCache.text = this.caption;
					imgCache.img && imgCache.img.Dispose();
					imgCache.img = gdi.CreateImage(this.w, this.h);
					var g2 = imgCache.img.GetGraphics();
					g2.SetTextRenderingHint(4);
					//if(prop.MacTypeSupport)
					//g2.GdiDrawText(this.caption, prop.Font, RGBA(255,255,255,255), 0, -1, imgCache.img.width, imgCache.img.height, fmt);
					//else
					//g2.DrawString(this.caption, prop.Font, RGBA(0,0,0,255), 0, -3, imgCache.img.width, imgCache.img.height, fmt);     // This is the blured text background.
					//imgCache.img.BoxBlur(2, 2);
					//if(prop.MacTypeSupport)
					//g2.GdiDrawText(this.caption, prop.Font, prop.CaptionColor, 0, -1, imgCache.img.width, imgCache.img.height, fmt);
					//else {
					//g2.DrawImage(imgCache.img, 0, 0, imgCache.img.width, imgCache.img.height, 0, 0, imgCache.img.width, imgCache.img.height);
					g2.DrawString(this.caption, GdiFont(g_fname, g_fsize + 1, 1), RGBA(255, 255, 255, 255), 0, 0, this.w, this.h, fmt); // This is foreground text.
					g2.SetTextRenderingHint(0);
					//}
					imgCache.img.ReleaseGraphics(g2);
					imgCache.img = CreateRawBitmap2(imgCache.img);
				}
				g.GdiAlphaBlend(imgCache.img, this.x, this.y, this.w, this.h, 0, 0, imgCache.img.width, imgCache.img.height, opacity2);
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
				imgCache.img && imgCache.img.Dispose();
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
				/*var check;
				if (this.matchResult[-1].length) {
					if (this.matchResult[-1].length > 1) {
						subMenu = window.CreatePopupMenu();
						funcs[id] = [_this.SwitchOthers, -2];
						subMenu.AppendMenuItem(MF_STRING, id++, "第一张图片");
						funcs[id] = [_this.SwitchOthers, -1];
						subMenu.AppendMenuItem(MF_STRING, id++, "上一张图片");
						funcs[id] = [_this.SwitchOthers, 1];
						subMenu.AppendMenuItem(MF_STRING, id++, "下一张图片");
						funcs[id] = [_this.SwitchOthers, 2];
						subMenu.AppendMenuItem(MF_STRING, id++, "最后一张图片");
					}

					if (currentPathItem) {
						if (this.matchResult[-1].length > 1)
							var caption = "流派" + " (" + Math.max(currentIndex - (imgArray.length - this.matchResult[-1].length) + 1, 0) + "/" + this.matchResult[-1].length + ")";
						else var caption = "流派";
						var flag = currentPathItem.artId == -1 ? MF_CHECKED : MF_STRING;
						if (subMenu) subMenu.AppendTo(baseMenu, flag | MF_POPUP, caption);
						else {
							funcs[id] = [_this.SwitchCover, this.matchResult[-1][0]];
							baseMenu.AppendMenuItem(flag, id++, caption);
						}
					}
				} else if (imgArray.Properties.GenrePathFormat) baseMenu.AppendMenuItem(MF_DISABLED, id++, "流派");
				*/
				
			}

			this.Pop = function(x, y) {
				if (!baseMenu) this.Build();
				var ret = baseMenu.TrackPopupMenu(x, y);
				if (ret) funcs[ret] && funcs[ret][0].call(_this, funcs[ret][1]);
				this.Dispose();
			}

			this.Dispose = function() {
				baseMenu && baseMenu.Dispose();
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
			var dl_menu = new Array("下载专辑封面", "下载艺术家封面", "下载专辑和艺术家封面");
			baseMenu = window.CreatePopupMenu();

			funcs[id] = [_this.AboutCurrentImage, null];
			baseMenu.AppendMenuItem(currentPathItem ? MF_STRING : MF_DISABLED, id++, "关于当前图片");
			funcs[id] = [_this.ViewWithExternalViewer, null];
			baseMenu.AppendMenuItem(currentPathItem ? MF_STRING : MF_DISABLED, id++, "在外部查看器中查看");
			funcs[id] = [_this.OpenContainingFolder, null];
			baseMenu.AppendMenuItem(currentPathItem ? MF_STRING : MF_DISABLED, id++, "打开图片所在目录");
			funcs[id] = [_this.Refresh, true];
			baseMenu.AppendMenuItem(MF_STRING, id++, "刷新");
			//funcs[id] = [_this.ShowMatchLog, true];
			//baseMenu.AppendMenuItem(currentMetadb ? MF_STRING : MF_DISABLED, id++, GetText("Show match log"));

			baseMenu.AppendMenuSeparator();
			if (currentMetadb) {
				dl_id = 3;
				var subMenu_MAP = window.CreatePopupMenu();
				subMenus.push(subMenu_MAP);
				subMenu_MAP.AppendTo(baseMenu, MF_POPUP, "管理内嵌图像");

				funcs[id] = [_this.ManageAttachedImages, [0, currentMetadb]];
				subMenu_MAP.AppendMenuItem(MF_STRING, id++, "封面标签");
				funcs[id] = [_this.ManageAttachedImages, [1, currentMetadb]];
				subMenu_MAP.AppendMenuItem(MF_STRING, id++, "批量内嵌图像");
				funcs[id] = [_this.ManageAttachedImages, [2, currentMetadb]];
				subMenu_MAP.AppendMenuItem(MF_STRING, id++, "移除所有图像");
				if (imgArray.length){
					for (var i = 0; i < imgArray.length; i++){
						if(imgArray.pathArray[i].artId == 0) dl_id -= 1;
						if(imgArray.pathArray[i].artId == 4) dl_id -= 2;
					}
				}
			} else {
				dl_id = 0;
				baseMenu.AppendMenuItem(MF_DISABLED, id++, "管理内嵌图像");
			}
			funcs[id] = [_this.downcover, currentMetadb];
			if(dl_id) baseMenu.AppendMenuItem(MF_STRING, id++, dl_menu[dl_id - 1]);
			
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
			funcs[id] = [_this.ClearCache, null];
			baseMenu.AppendMenuItem(MF_STRING, id++, "清除缓存");
			baseMenu.AppendMenuSeparator();
			funcs[id] = [_this.ShowProperties, null];
			baseMenu.AppendMenuItem(MF_STRING, id++, "面板属性");
			//funcs[id] = [_this.ShowHelp, null];
			//baseMenu.AppendMenuItem(MF_STRING, id++, "帮助...");
		}

		this.Pop = function(x, y) {
			if (!baseMenu) this.Build();
			var ret = baseMenu.TrackPopupMenu(x, y);
			if (ret) funcs[ret] && funcs[ret][0].call(_this, funcs[ret][1]);
			this.Dispose();
		}

		this.Dispose = function() {
			baseMenu && baseMenu.Dispose();
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

		str.push("-- 当前图片信息 --------------------\n");

		str.push("\n" + "图片类型" + ":\t");
		str.push(currentPathItem.artId == -1 ? "流派" : GetCaption(AlbumArtId.GetName(currentPathItem.artId).capitalize()));

		str.push("\n" + "文件路径" + ":\t");
		if (currentPathItem.embed) str.push("(内嵌) ");
		str.push(currentPathItem.path);

		str.push("\n" + "分辨率" + ":\t");
		str.push(imgArray.currentImageItem ? (imgArray.currentImageItem.srcW + "×" + imgArray.currentImageItem.srcH) : "Invalid");

		PopMessage(0, str.join(""), 0);
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
	
	this.downcover = function(metadb){
		if (!metadb || !dl_id) return;
		var til = fb.TitleFormat("%title%").EvalWithMetadb(metadb).replace(/(\\|:|\*|\?|"|<|>|\/|\|)/g, "");
		var alb = fb.TitleFormat("$if2(%album%,单曲)").EvalWithMetadb(metadb).replace(/(\\|:|\*|\?|"|<|>|\/|\|)/g, "");
		var art = fb.TitleFormat("$if2(%album artist%,未知艺术家)").EvalWithMetadb(metadb).replace(/(\\|:|\*|\?|"|<|>|\/|\|)/g, "");
		var info = new Array(dl_id, metadb, til, art, alb);
		window.NotifyOthers("search this cover", info);
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

		isFollowingCursor = this.Properties.FollowCursor || (!this.Properties.FollowCursor && !fb.IsPlaying);
		this.cycle.Lock(isFollowingCursor);

		if (isFollowingCursor) this.OnSelectionChanged(fb.GetSelection());
		else this.OnPlaybackNewTrack(fb.GetNowPlaying());
	}

	this.ViewWithExternalViewer = function() {
		if (!currentPathItem) return;
		if (currentPathItem.embed) {
			PopMessage(1, "当前图片为内嵌图片，无法用外部查看器打开。", 48);
			return;
		}
		var filepath = currentPathItem.path;
		if (currentPathItem.path.substring(0,1) == "B") filepath = filepath.replace('B:\\', fb.FoobarPath);
		ShellExecute('"' + filepath + '"', "", "", "open", 1);
	}

	this.OpenContainingFolder = function() {
		if (!currentPathItem) return;
		var filepath = currentPathItem.path;
		if (currentPathItem.path.substring(0,1) == "B") filepath = filepath.replace('B:\\', fb.FoobarPath);
		ShellExecute("explorer", '/select,\"' + filepath + '"', "", "open", 1);
	}

	function ShellExecute(arg1, arg2, arg3, arg4, arg5) {
		if (!shellObj) {
			try {
				shellObj = new ActiveXObject("Shell.Application");
			} catch (e) {
				PopMessage(1, "Can not create ActiveX object (Shell.Application), command can't be execute. Please check your system authorities.", 16);
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

	this.ShowProperties = function() {
		window.ShowProperties();
	}

	this.OnRightClick = function(x, y) {
		if (CoverDisplay.isXYIn(x, y) && this.funcMenu) this.funcMenu.Pop(x, y);
	}

	this.OnDoubleClick = function(x, y) {
		if (CoverDisplay.isXYIn(x, y) && currentPathItem) {
			if (currentPathItem.embed) this.ManageAttachedImages([0, currentMetadb]); // "Edit attached pictures"
			else this.ViewWithExternalViewer();
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
			CollectGarbage(); // Release memory.
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
			if(col_by_cover && getColor) getColorSchemeFromImage();
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
			if(col_by_cover && getColor) getColorSchemeFromImage();
		} else {
			//isNewgroup && imgDisplay.ChangeImage(1, currentImage, 2);
			if(col_by_cover && getColor) getColorSchemeFromImage();
		}
		SetMenuButtonCaption();
	}

	function OnNewTrack_GetImageFinished(img) {
		currentImage = img;
		imgDisplay.ChangeImage(1, currentImage, isNewgroup ? 2 : 1);
		if (imgArray.length > 1) _this.cycle.Active();
		if(col_by_cover && getColor) getColorSchemeFromImage();
	}

	getColorSchemeFromImage = function() {
		if(!currentImage || currentImage == null) {
			window.NotifyOthers("none cover color", true);
			getColor = false;
		}else{
			var left_img = gdi.CreateImage(30, 50);
			var gb = left_img.GetGraphics();
			var colorScheme_array = Array();
			gb.DrawImage(currentImage, 0, 0, currentImage.Width, currentImage.Height, 7, 7, currentImage.Width-14, currentImage.Height-14, 0, 255);
			left_img.ReleaseGraphics(gb);
			var myVBArray = left_img.GetColorScheme(1);
			colorScheme_array.splice(0, colorScheme_array.length);
			colorScheme_array = myVBArray.toArray();
			var gRed = getRed(colorScheme_array[0]);
			var gGreen = getGreen(colorScheme_array[0]);
			var gBlue = getBlue(colorScheme_array[0]);
			var col_info = new Array(gRed, gGreen, gBlue);
			window.NotifyOthers("get cover color", col_info);
			getColor = false;
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
		CollectGarbage(); // Release memory.
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
var margin = {
	left: 6,
	top: 6,
	right: 6,
	bottom: 6
};

var themePath = fb.FoobarPath + "themes\\foobox\\js_panels";
//------------------------------------------------
var VBE;
try {
	VBE = new ActiveXObject("ScriptControl");
	VBE.Language = "VBScript";
} catch (e) {
	PopMessage(0, "Can not create ActiveX object (ScriptControl), some functions are not available.\nPlease check your system authorities.", 1);
}

function PopMessage(method, text, type) {
	if (method == 1) {
		if (VBE) {
			var s = VBE.eval("MsgBox(\"" + text + "\", " + type + ", \"WSH Cover Panel\")");
			return s;
		} else type = type == 32 ? 2 : (type == 16 ? 1 : 0);
	}
	fb.ShowPopupMessage(text, "WSH Cover Panel", type);
}
//------------------------------------------------
var Properties = new function() {
		//------------------------------------------------------
		//this.Panel = {
			//WorkDirectory: themePath + "\\wsh_cover"//fb.TitleFormat(window.GetProperty("Panel.WorkDirectory", "")).Eval(true)
			//		Lang: window.GetProperty("Panel.Language", "auto").toLowerCase()			// Language
		//}
		//if (this.Panel.WorkDirectory) this.PanelWorkDirectory = fb.FoobarPath + this.PanelWorkDirectory;
		//else this.Panel.WorkDirectory = themePath + "\\wsh_cover";

		//if (!utils.FileTest(this.Panel.WorkDirectory, "e")) PopMessage(1, "Invalid work directory.", 16);

		//------------------------------------------------------
		this.Controller = {
			GroupFormat: window.GetProperty("Image.GroupFormat", "%album artist%|%album%"),
			//false: When not playing, true: Always.
			FollowCursor: fbx_set[10],
			Cycle: {
				SingleImageMode: window.GetProperty("Cycle.SingleImageMode", false),
				Period: window.GetProperty("Cycle.Period", 20000)
			}
		}

		if (typeof(this.Controller.Cycle.Period) != "number") this.Controller.Cycle.Period = 15000;
		else if (this.Controller.Cycle.Period < 100) this.Controller.Cycle.Period = 100;
		window.SetProperty("Cycle.Period", this.Controller.Cycle.Period);

		//------------------------------------------------------
		//this.GetFont = function() {
			//var font = window.GetFontCUI(0);
			//var fs = font ? font.Style : 0;
			//var fn = fb.TitleFormat(window.GetProperty("MenuButton.Font", "")).Eval(true);
			//if (!utils.CheckFont(fn)) fn = font ? font.Name : "Microsoft Yahei";
			//font.Dispose();
			//return GdiFont(g_fname, g_fsize + 1, 1);
		//}

		this.Display = {
			Animation: {
				Enable: window.GetProperty("Cycle.Animation.Enable", true),
				RefreshInterval: window.GetProperty("Cycle.Animation.RefreshInterval", 50),
				Duration: window.GetProperty("Cycle.Animation.Duration", 500)
			}
			//MenuButton: {
				//Show: !this.Controller.Cycle.SingleImageMode && window.GetProperty("MenuButton.Show", true)
				//Font: this.GetFont()
				//CaptionColor: RGBA(255, 255, 255, 255)
			//}
		}

		if (typeof(this.Display.Animation.RefreshInterval) != "number") this.Display.Animation.RefreshInterval = 50;
		else if (this.Display.Animation.RefreshInterval < 10) this.Display.Animation.RefreshInterval = 10;
		window.SetProperty("Cycle.Animation.RefreshInterval", this.Display.Animation.RefreshInterval);

		if (typeof(this.Display.Animation.Duration) != "number") this.Display.Animation.Duration = 300;
		else if (this.Display.Animation.Duration < 10) this.Display.Animation.Duration = 10;
		window.SetProperty("Cycle.Animation.Duration", this.Display.Animation.Duration);

		//------------------------------------------------------
		var GenrePathFormat = "%genre%";//genre_cover_dir + "\\%genre%.jpg";
		//var defaultGenrePathFormat = fb.FoobarPath + 'MusicArt\\Other\\*.*';//'$directory_path(%path%)\\cover.jpg';
		this.Image = {
			BuildinPathFormat: '<front>||<back>||<disc>||<artist>||<icon>',
			GenrePathFormat: GenrePathFormat,//window.GetProperty('Image.GenrePath.Format', defaultGenrePathFormat),
			TreatGenrePathAsBackup: window.GetProperty("Image.Genre.Image.TreatAsBackup", false),
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

		//this.Image.BuildinPathFormat = this.Image.BuildinPathFormat.replace(/%foobar_path%/ig, fb.FoobarPath.slice(0,-1));
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
var ww, wh;
for (var i = 0; i < SearchItems.length; i++) {
	if (!SearchItems[i] instanceof SearchItem) {
		SearchItems.splice(i, 1);
		i--;
	}
}
Properties.Controller.SearchScriptPresets = SearchItems;
//====================================
var Covers = new ImagesArray(Properties.Image);
var CoverDisplay = new Display(margin.left, margin.top, 0, 0, Properties.Display);
var MainController = new Controller(Covers, CoverDisplay, Properties.Controller);
// START ==============================================

function on_paint(gr) {
	if (!ww || !wh) return;
	var bg_color; // = dark_mode?fbx_set[10]:fbx_set[13];
	switch (ui_mode) {
	case (0):
		return;
	case (1):
		bg_color = RGB(255, 255, 255);
		break;
	case (2):
		bg_color = fbx_set[4];
		break;
	case (3):
		bg_color = fbx_set[1];
		break;
	case (4):
		bg_color = fbx_set[8];
		break;
	}
	gr.FillSolidRect(0, 0, ww, wh, bg_color);
	CoverDisplay.Draw(gr);
	gr.DrawLine(0, 0, 0, wh, 1, RGBA(0, 0, 0, 80));//100));
	//gr.drawline(1, 0, 1, wh, 1, RGBA(0, 0, 0, 60));
	//gr.drawline(2, 0, 2, wh, 1, RGBA(0, 0, 0, 30));
	//gr.drawline(3, 0, 3, wh, 1, RGBA(0, 0, 0, 15));

	gr.DrawLine(0, 0, ww, 0, 1, RGBA(0, 0, 0, 100));
	if(show_shadow){
		gr.DrawLine(0, 1, ww, 1, 1, RGBA(0, 0, 0, 60));
		gr.DrawLine(0, 2, ww, 2, 1, RGBA(0, 0, 0, 30));
		gr.DrawLine(0, 3, ww, 3, 1, RGBA(0, 0, 0, 15));
	}
}

function on_size() {
	if (!window.Width || !window.Height) return;
	ww = window.Width;
	wh = window.Height;
	MainController.Resize(Math.max(ww, 91) - margin.left - margin.right, Math.max(wh, 91) - margin.top - margin.bottom);
}

function on_selection_changed(metadb) {
	if (!fb.IsPlaying || MainController.Properties.FollowCursor) {
		metadb = fb.GetFocusItem();
		MainController.OnSelectionChanged(metadb);
	}
}

function on_playlist_switch() {
	if (!fb.IsPlaying || MainController.Properties.FollowCursor) {
		metadb = fb.GetFocusItem();
		MainController.OnSelectionChanged(metadb);
	}
}

function on_playback_new_track(metadb) {
	getColor = true;
	MainController.OnPlaybackNewTrack(metadb);
}

function on_playback_stop(reason) {
	MainController.OnPlaybackStop(reason);
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
}

function on_mouse_leave() {
	CoverDisplay.OnMouseLeave && CoverDisplay.OnMouseLeave();
}

function on_mouse_lbtn_dblclk(x, y, mask) {
	MainController.OnDoubleClick(x, y, mask);
}

function on_mouse_wheel(delta) {
	if (!CoverDisplay.isXYIn(cursorX, cursorY)) return;
	if (delta > 0) MainController.Prev();
	else MainController.Next();
}

function on_metadb_changed(metadb, fromhook) {
	MainController.Refresh(true, metadb);
}

function on_get_album_art_done(metadb, art_id, image, image_path) {
	Covers.OnGetAlbumArtDone(metadb, art_id, image, image_path);
}

function on_load_image_done(cookie, image) {
	Covers.OnLoadImageDone(cookie, image)
}

function on_mouse_rbtn_up(x, y, vkey) {
	MainController.OnRightClick(x, y, vkey);
	return true; // Disable default right click menu.
}
/*
function on_font_changed() {
	var oldfont = Properties.Display.MenuButton.Font;
	var newfont = Properties.GetFont();
	if (oldfont && oldfont.Name == newfont.Name && oldfont.Style == newfont.Style) return;
	oldfont && oldfont.Dispose();
	Properties.Display.MenuButton.Font = newfont;
	CoverDisplay.menuButton.ClearCache();
	//window.Repaint();
}
*/

function on_notify_data(name, info) {
	switch (name) {
	case "Right_panel_follow_cursor":
		MainController.SetFollowCursorProperties(info);
		break;
	case "set_random_color":
		fbx_set[0] = info[0];
		fbx_set[1] = info[1];
		fbx_set[2] = info[2];
		fbx_set[3] = info[3];
		fbx_set[4] = info[4];
		fbx_set[5] = info[5];
		fbx_set[6] = info[6];
		fbx_set[7] = info[7];
		fbx_set[8] = info[8];
		window.Repaint();
		break;
	case "set_ui_mode":
		ui_mode = info;
		window.Repaint();
		break;
	case "set_font":
		window.Reload();
		break;
	case "reload_cover_folder":
		window.Reload();
		break;
	case "Track_Type_info":
		tracktype = Number(info);
		break;
	case "set_album_cover":
		album_front_disc = info;
		break;
	case "panel_show_shadow":
		show_shadow = info;
		window.RepaintRect(0,0,ww,5);
		break;
	case "refresh cover":
		if(currentMetadb && currentMetadb.Compare(info[1])) MainController.Refresh(true, currentMetadb);
		break;
	}
}