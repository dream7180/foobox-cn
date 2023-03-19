// Name "JS Smooth Browser"
// Version "20151114-1630-340"
// Author "Br3tt aka Falstaff >> http://br3tt.deviantart.com"
// mod for foobox https://github.com/dream7180
var zdpi = 1;
var dark_mode = 0;
	var genre_cover_dir = fb.FoobarPath + "themes\\foobox\\Genre";
//}
var dir_cover_name = window.GetProperty("foobox.cover.folder.name", "cover.jpg;folder.jpg");
var CACHE_FOLDER = fb.ProfilePath + "cache\\CoverCache\\";
var sys_scrollbar = window.GetProperty("foobox.ui.scrollbar.system", false);
var g_fname, g_fsize, g_fstyle;
var avoid_checkscroll = false;
var lib_pl = 0;
var pidx = -1; //libview playlist index
var _TFsorting = [];
_TFsorting[0] = "%album% | %discnumber% | %tracknumber% | %title%";
_TFsorting[1] = "%album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%";
_TFsorting[2] = "%artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%";
_TFsorting[3] = "%genre% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%";
_TFsorting[4] = "$directory_path(%path%) | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%";
var boxText_len = 0;
var albumsource = 0;
//var is_first_populate = true;

images = {
	path: fb.FoobarPath + "themes\\foobox\\images\\",
	loading_angle: 0,
	loading_draw: null,
	noart: null,
	sw_btn_n0: null,
	sw_btn_n1: null,
	stream: null,
	img_loading: null
};

ppt = {
	// only in source mode = Playlist
	sourceMode: window.GetProperty("_PROPERTY: Source Mode", 1),
	// 0 = Library, 1 = Playlist
	locklibpl: window.GetProperty("_PROPERTY: Lock to Library playlist", true),
	tagMode: window.GetProperty("_PROPERTY: Tag Mode", 1),
	// 1 = album, 2 = artist, 3 = genre
	albumMode: window.GetProperty("_PROPERTY: Album Mode", 1), //0-with art, 1-without art
	artistMode: window.GetProperty("_PROPERTY: Artist Mode", 0), //0-albumartist, 1-artist
	genre_dir: window.GetProperty("_PROPERTY: Genre or Directory", 0), //0-genre, 1-dir
	albumArtId: 0,
	// 0 = front
	panelMode: window.GetProperty("_PROPERTY: Display Mode", 1),
	// 0 = text, 1 = stamps + text, 2 = lines + text, 3 = stamps no text
	forceSorting: window.GetProperty("_PROPERTY: Forced sorting - Playlist Mode", false),
	showAllItem: window.GetProperty("_PROPERTY: Show ALL item", true),
	showloading: window.GetProperty("_PROPERTY: Show loading animation", true),
	default_thumbnailWidthMin: window.GetProperty("SYSTEM thumbnails Minimal Width", 130),
	thumbnailWidthMin: 0,
	default_lineHeightMin: window.GetProperty("SYSTEM Minimal Line Height", 90),
	lineHeightMin: 0,
	//enableDiskCache: window.GetProperty("SYSTEM Disk Cache", true),
	cache_size: window.GetProperty("Cover image cache dimension (100-500)", 250),
	scrollRowDivider: window.GetProperty("SYSTEM Scroll Row Divider", 1),
	tf_groupkey_genre: fb.TitleFormat("$if2(%genre%,未知流派)"),
	tf_groupkey_dir: fb.TitleFormat("$directory_path(%path%)"),
	tf_groupkey_albumartist: fb.TitleFormat("$if2(%album artist%,未知艺术家)"),
	tf_groupkey_artist: fb.TitleFormat("$if2(%artist%,未知艺术家)"),
	tf_groupkey_album: fb.TitleFormat("%album artist% ^^ %album% ## %title%"),
	tf_groupkey_album_lt: fb.TitleFormat("$if2(%album%,单曲)"),
	tf_path_genre: genre_cover_dir + "\\",
	tf_path_dir: fb.TitleFormat("$directory_path(%path%)\\"),
	tf_crc: fb.TitleFormat("$crc32('aa'%album artist%-%album%)"),
	tf_crc_dir: fb.TitleFormat("$crc32('directories'$directory(%path%,1))"),
	tf_crc_albumartist: fb.TitleFormat("$crc32('artists'%album artist%)"),
	tf_crc_artist: fb.TitleFormat("$crc32('artists'%artist%)"),
	tf_crc_genre: fb.TitleFormat("$crc32('genres'%genre%)"),
	rowHeight: 22,
	rowScrollStep: 1,
	scrollSmoothness: 2.5,
	refreshRate: 40,
	refreshRateCover: 2,
	headerBarHeight: 28,
	enableTouchControl: window.GetProperty("_PROPERTY: Enable Scroll Touch Control", true),
	botStampHeight: 48,
	default_botGridHeight: 26,
	botGridHeight: 0,
	botTextRowHeight: 17,
	textLineHeight: 10
};

cTouch = {
	down: false,
	y_start: 0,
	y_end: 0,
	y_current: 0,
	y_prev: 0,
	y_move: 0,
	scroll_delta: 0,
	t1: null,
	timer: false,
	multiplier: 0,
	delta: 0
};

cFilterBox = {
	x: 5,
	y: 2,
	w: 120,
	h: 20
};

cSwitchBtn = {
	x: 0,
	y: 0,
	w: 24,
	h: 24
}

cPlaylistManager = {
	width: 230,
	topbarHeight: 30,
	botbarHeight: 4,
	scrollbarWidth: 10,
	rowHeight: 30,
	blink_timer: false,
	blink_counter: -1,
	blink_id: null,
	blink_row: null,
	blink_totaltracks: 0,
	showTotalItems: window.GetProperty("_PROPERTY.PlaylistManager.ShowTotalItems", true)
};

cScrollBar = {
	//enabled: window.GetProperty("_DISPLAY: Show Scrollbar", true),
	visible: true,
	width: 12,
	ButtonType: {
		cursor: 0,
		up: 1,
		down: 2
	},
	minCursorHeight: 25,
	maxCursorHeight: 110,
	timerID: false,
	timerCounter: -1
};

cover = {
	//keepaspectratio: true,
	max_w: 1
};

cList = {
	search_string: "",
	incsearch_font: null,
	inc_search_noresult: false,
	clear_incsearch_timer: false,
	incsearch_timer: false
};

timers = {
	coverLoad: false,
	coverDone: false,
	mouseWheel: false,
	saveCover: false,
	mouseDown: false,
	addItems: false,
	showMenu: false,
	showPlaylistManager: false,
	hidePlaylistManager: false,
	avoidPlaylistSwitch: false
};

//=============================Images cache========================================================

function reset_cover_timers() {
	if (timers.coverDone) {
		timers.coverDone && window.ClearTimeout(timers.coverDone);
		timers.coverDone = false;
	};
};

function on_load_image_done(tid, image) {
	var tot = brw.groups.length;
	for (var k = 0; k < tot; k++) {
		if (brw.groups[k].metadb) {
			if (brw.groups[k].tid == tid && brw.groups[k].load_requested == 1) {
				brw.groups[k].load_requested = 2;
				brw.groups[k].cover_img = g_image_cache.getit(brw.groups[k].metadb, k, image, false);
				//if(!isScrolling && !cScrollBar.timerID) {
				if (k < brw.groups.length && k >= g_start_ && k <= g_end_) {
					if (!timers.coverDone) {
						timers.coverDone = window.SetTimeout(function() {
							g_1x1 = false;
							brw.cover_repaint();
							timers.coverDone && window.ClearTimeout(timers.coverDone);
							timers.coverDone = false;
						}, 5);
					};
				}
				else {
                        g_1x1 = true;
                        window.RepaintRect(0, 0, 1, 1);
                        g_1x1 = false;
                    };
				//};
				break;
			};
		};
	};
};

function on_get_album_art_done(metadb, art_id, image, image_path) {
	var tot = brw.groups.length;
	for (var i = 0; i < tot; i++) {
		try {
			if (brw.groups[i].metadb) {
				if (brw.groups[i].metadb.Compare(metadb)) {
					if(path_img(image_path))
						brw.groups[i].cover_img = g_image_cache.getit(metadb, i, image, image_path);
					else
						brw.groups[i].cover_img = g_image_cache.getit(metadb, i, image, 1);
					//if(!isScrolling && !cScrollBar.timerID) {
					if (i < brw.groups.length && i >= g_start_ && i <= g_end_) {
						if (!timers.coverDone) {
							timers.coverDone = window.SetTimeout(function() {
								g_1x1 = false;
								brw.cover_repaint();
								timers.coverDone && window.ClearTimeout(timers.coverDone);
								timers.coverDone = false;
							}, 5);
						};
					}
					else {
						g_1x1 = true;
						window.RepaintRect(0, 0, 1, 1);
						g_1x1 = false;
					};
					//};
					break;
				};
			};
		} catch (e) {}
	};
};

//=================================================// Cover Tools
image_cache = function() {
	this._cachelist = {};
	this.hit = function(metadb, albumIndex) {
		var img = this._cachelist[brw.groups[albumIndex].cachekey];
		if (typeof(img) == "undefined" || img == null) {
			//if(!isScrolling  && !cScrollBar.timerID) { // and when no scrolling
			var crc_exist = check_cache(albumIndex);
			if (crc_exist && brw.groups[albumIndex].load_requested == 0) {
				// load img from cache
				if (!timers.coverLoad) {
					timers.coverLoad = window.SetTimeout(function() {
						try {
							brw.groups[albumIndex].tid = load_image_from_cache(brw.groups[albumIndex].cachekey);
							brw.groups[albumIndex].load_requested = 1;
						}
						catch (e) {};
						timers.coverLoad && window.ClearTimeout(timers.coverLoad);
						timers.coverLoad = false;
					}, (!isScrolling && !cScrollBar.timerID ? 5 : 20));
				}
			} else if (brw.groups[albumIndex].load_requested == 0) {
				// load img default method
				if (!timers.coverLoad) {
					timers.coverLoad = window.SetTimeout(function() {
						if (ppt.albumArtId == 5) { // genre
							try {
								var arr = brw.groups[albumIndex].groupkey.split(" ^^ ");
							} catch(e) {}
							try {
								if(ppt.genre_dir){
									var dc_arr = dir_cover_name.split(";");
									var folder_path = ppt.tf_path_dir.EvalWithMetadb(metadb);
									var _path;
									for (var i = 0; i <= dc_arr.length; i++) {
										_path = folder_path + dc_arr[i];
										if(path_img(_path)) {
											var genre_img = gdi.Image(_path);
											try {
												brw.groups[albumIndex].load_requested = 1;
												brw.groups[albumIndex].cover_img = g_image_cache.getit(metadb, albumIndex, genre_img, _path);
											}catch(e) {}
											if(brw.groups[albumIndex].cover_img != null) break;
										}
									}
									brw.repaint();
								}
								else{
									var _path = ppt.tf_path_genre +  GetGenre(arr[0]) + ".jpg";
									var genre_img = gdi.Image(_path);
									try {
										brw.groups[albumIndex].load_requested = 1;
										brw.groups[albumIndex].cover_img = g_image_cache.getit(metadb, albumIndex, genre_img, _path);
										brw.repaint();
									} catch(e) {}
								}
							} catch (e) {};
						}
						else {
							this.albumArtId = ppt.albumArtId;
							try {
								brw.groups[albumIndex].load_requested = 1;
								utils.GetAlbumArtAsync(window.ID, metadb, this.albumArtId, false, false, false);
							}
							catch(e) {}
						};
						timers.coverLoad && window.ClearTimeout(timers.coverLoad);
						timers.coverLoad = false;
					}, (!isScrolling && !cScrollBar.timerID ? 6 : 22));
				};
			};
		};
		if (typeof(img) != "undefined" || img != null || ppt.showloading) return img;
		else {
			if(brw.groups[albumIndex].tracktype != 3) return images.noart;
			else return images.stream;
		}
	};
	this.reset = function(key) {
		this._cachelist[key] = null;
	};
	this.getit = function(metadb, albumId, image, image_path) {
		var cw = cover.max_w;
		var ch = cw;
		var img = null;
		var cover_type = null;

		if (!image) {
			cover_type = 0;
		}
		else {
			//if (cover.keepaspectratio) {
				if (image.Height >= image.Width) {
					var ratio = image.Width / image.Height;
					var pw = cw * ratio;
					var ph = ch;
				}
				else {
					var ratio = image.Height / image.Width;
					var pw = cw;
					var ph = ch * ratio;
				};
			//}
			//else {
			//	var pw = cw;
			//	var ph = ch;
			//};
			if (metadb) {
				img = image.Resize(pw, ph, 2);
				cover_type = 1;
			};
			this._cachelist[brw.groups[albumId].cachekey] = img;

			// save img to cache
			if (image_path) {
				if (cover_type == 1 && !brw.groups[albumId].save_requested) {
					if (!timers.saveCover) {
						brw.groups[albumId].save_requested = true;
						let crc = brw.groups[albumId].cachekey;
						let s = Math.min(ppt.cache_size / image.Width, ppt.cache_size / image.Height);
						if(s > 1){
							image.SaveAs(CACHE_FOLDER + crc, "image/jpeg");
						} else {
							let w = Math.floor(image.Width * s);
							let h = Math.floor(image.Height * s);
							image.Resize(w, h, 2).SaveAs(CACHE_FOLDER + crc, "image/jpeg");
						}
						timers.saveCover = window.SetTimeout(function() {
							window.ClearTimeout(timers.saveCover);
							timers.saveCover = false;
						}, 100);
					};
				};
			}
		};

		brw.groups[albumId].cover_type = cover_type;
		return img;
	};
};
var g_image_cache = new image_cache;

function SortPlaylist(){
	var sortingFormat = find_sorting();
	plman.SortByFormatV2(g_active_playlist, sortingFormat, 1);
	window.NotifyOthers("Sorting format change", sortingFormat);
}
//===================================================================================================
//    Objects
//===================================================================================================
oSwitchbar = function() {
	this.x = 5;
	this.y = 5;
	this.w = 200;
	this.h = 22;
	this.hover_tab = 0;
	this.setSize= function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}
	this.on_mouse = function(event, x, y) {
		var tab_old = this.hover_tab;
		this.ishover = this._isHover(x, y);
		switch (event) {
		case "move":
			if(this.ishover){
				if(x < 70*zdpi) this.hover_tab = 1;
				else if (x > 140*zdpi) this.hover_tab = 3;
				else this.hover_tab = 2;
			}
			else this.hover_tab = 0;
			break;
		case "lbtn_up":
			if (this.hover_tab > 0 && this.hover_tab != ppt.tagMode){
				ppt.tagMode = this.hover_tab;
				window.SetProperty("_PROPERTY: Tag Mode", ppt.tagMode);
			switch (ppt.tagMode) {
				case 1:
					ppt.albumArtId = 0;
					break;
				case 2:
					ppt.albumArtId = 4;
					break;
				case 3:
					ppt.albumArtId = 5;
					break;
			};
				if (ppt.sourceMode != 0 && ppt.forceSorting) SortPlaylist();
				//g_image_cache = new image_cache;
				//CollectGarbage();
				brw.reset_swbtn();
				brw.populate();
				transfer_covertype();
				brw.showItemPanelInit();
			}
			break;
		case "leave":
			this.hover_tab = 0;
			break;
		}
		if(this.hover_tab != tab_old) this.repaint_line();
	}
	this._isHover = function(x, y) {
		return (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h);
	};
	this.repaint_line = function () {
		window.RepaintRect(this.x, ppt.headerBarHeight - 4, this.w, 4);
	};
	
	this.draw = function(gr){
		var sw_img_y = Math.ceil((ppt.headerBarHeight - images.album.Height)/2);
		gr.DrawImage(images.album, Math.round(10*zdpi), sw_img_y, images.album.Width, images.album.Height, 0, 0, images.album.Width, images.album.Height,0,255);
		gr.DrawImage(images.artist, Math.round(75*zdpi), sw_img_y, images.artist.Width, images.artist.Height, 0, 0, images.artist.Width, images.artist.Height,0,255);
		gr.DrawImage(images.genre, Math.round(145*zdpi), sw_img_y, images.genre.Width, images.genre.Height, 0, 0, images.genre.Width, images.genre.Height,0,255);
		gr.GdiDrawText("专 辑", g_font, g_color_normal_txt, 30*zdpi, sw_img_y, 35*zdpi, images.album.Height, lc_txt);
		gr.GdiDrawText("艺术家", g_font, g_color_normal_txt, 95*zdpi, sw_img_y, 40*zdpi, images.album.Height, lc_txt);
		gr.GdiDrawText(ppt.genre_dir?"文件夹":"流 派", g_font, g_color_normal_txt, 165*zdpi, sw_img_y, 40*zdpi, images.album.Height, lc_txt);
		var bys = Math.round((ppt.headerBarHeight - 2) / 2);
		gr.FillGradRect(this.x + this.w -1, 0, 1, bys, 90, RGBA(0, 0, 0, 3), RGBA(0, 0, 0, 35));
		gr.FillGradRect(this.x + this.w -1, bys, 1, bys, 270, RGBA(0, 0, 0, 3), RGBA(0, 0, 0, 35));
		gr.FillSolidRect(this.x + this.w, 0, 1, ppt.headerBarHeight - 2, g_color_normal_bg);
		if(this.hover_tab == 1) gr.FillSolidRect(this.x, ppt.headerBarHeight - 4, 63*zdpi, 4, g_color_selected_bg);
		else if(this.hover_tab > 1) gr.FillSolidRect((this.hover_tab-1)*70*zdpi, ppt.headerBarHeight - 4, 68*zdpi, 4, g_color_selected_bg);
		if(ppt.tagMode==1)
			gr.FillSolidRect(this.x, ppt.headerBarHeight - 4, 63*zdpi, 4, g_color_highlight);
		else
			gr.FillSolidRect((ppt.tagMode-1)*70*zdpi, ppt.headerBarHeight - 4, 68*zdpi, 4, g_color_highlight);
	}
}

oPlaylist = function(idx, rowId) {
	this.idx = idx;
	this.rowId = rowId;
	this.name = plman.GetPlaylistName(idx);
	this.y = -1;
};

oPlaylistManager = function(name) {
	this.name = name;
	this.playlists = [];
	this.state = 0; // 0 = hidden, 1 = visible
	// metrics
	this.scroll = 0;
	this.offset = 0;
	this.w = 250;
	this.h = brw.h - 100;
	this.x = ww;
	this.y = brw.y + 50;
	this.total_playlists = null;
	this.rowTotal = -1;
	this.drop_done = false;

	this.adjustPanelHeight = function() {
		// adjust panel height to avoid blank area under last visible item in the displayed list
		var target_total_rows = Math.floor((this.default_h - cPlaylistManager.topbarHeight) / cPlaylistManager.rowHeight);
		if (this.rowTotal != -1 && this.rowTotal < target_total_rows) target_total_rows = this.rowTotal;
		this.h = cPlaylistManager.topbarHeight + (target_total_rows * cPlaylistManager.rowHeight);
		this.y = this.default_y + Math.floor((this.default_h - this.h) / 2);

		this.totalRows = Math.floor((this.h - cPlaylistManager.topbarHeight) / cPlaylistManager.rowHeight);
		this.max = (this.rowTotal > this.totalRows ? this.totalRows : this.rowTotal);
	};

	this.setSize = function(x, y, w, h) {
		this.default_x = x;
		this.default_y = y;
		this.default_w = w;
		this.default_h = h;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.totalRows = Math.floor((this.h - cPlaylistManager.topbarHeight) / cPlaylistManager.rowHeight);
		cSwitchBtn.x = ww - cSwitchBtn.w - 1;

		// adjust panel height / rowHeight + rowTotal (! refresh must have been executed once to have a valide rowTotal)
		this.adjustPanelHeight();
	};

	this.showPanel = function() {
		if (pman.offset < pman.w) {
			var delta = Math.ceil((pman.w - pman.offset) / 2);
			pman.offset += delta;
			brw.repaint();
		};
		if (pman.offset >= pman.w) {
			pman.offset = pman.w;
			window.ClearInterval(timers.showPlaylistManager);
			timers.showPlaylistManager = false;
			brw.repaint();
		};
	};

	this.hidePanel = function() {
		if (pman.offset > 0) {
			var delta = Math.ceil((pman.w - (pman.w - pman.offset)) / 2);
			pman.offset -= delta;
			brw.repaint();
		};
		if (pman.offset < 1) {
			pman.offset = 0;
			pman.state = 0;
			window.ClearInterval(timers.hidePlaylistManager);
			timers.hidePlaylistManager = false;
			brw.repaint();
		};
	};

	this.populate = function(exclude_active, reset_scroll) {
		this.playlists.splice(0, this.playlists.length);
		this.total_playlists = plman.PlaylistCount;
		var rowId = 0;
		var isAutoPl = false;
		var isReserved = false;
		var plname = null;
		for (var idx = 0; idx < this.total_playlists; idx++) {
			plname = plman.GetPlaylistName(idx);
			isAutoPl = plman.IsAutoPlaylist(idx);
			isReserved = (plname == "播放队列" || plname == "播放记录");

			if (!isAutoPl && !isReserved) {
				if (idx == plman.ActivePlaylist) {
					if (!exclude_active) {
						this.playlists.push(new oPlaylist(idx, rowId));
						rowId++;
					};
				}
				else {
					this.playlists.push(new oPlaylist(idx, rowId));
					rowId++;
				};
			};
		};
		this.rowTotal = rowId;

		// adjust panel height / rowHeight + rowTotal
		this.adjustPanelHeight();

		if (reset_scroll || this.rowTotal <= this.totalRows) {
			this.scroll = 0;
		}
		else {
			//check it total playlist is coherent with scroll value
			if (this.scroll > this.rowTotal - this.totalRows) {
				this.scroll = this.rowTotal - this.totalRows;
			};
		};
	};

	this.draw = function(gr) {
		if (this.offset > 0) {
			// metrics
			var cx = this.x - this.offset;
			var ch = cPlaylistManager.rowHeight;
			var cw = this.w;
			var bg_margin_top = 2;
			var bg_margin_left = 6;
			var txt_margin = 10;
			var bg_color = RGB(0, 0, 0);
			var txt_color = RGB(255, 255, 255);

			// scrollbar metrics
			if (this.rowTotal > this.totalRows) {
				this.scr_y = this.y + cPlaylistManager.topbarHeight;
				this.scr_w = cPlaylistManager.scrollbarWidth;
				this.scr_h = this.h - cPlaylistManager.topbarHeight;
			}
			else {
				this.scr_y = 0;
				this.scr_w = 0;
				this.scr_h = 0;
			};

			// ** panel bg **
			gr.SetSmoothingMode(2);
			gr.FillRoundRect(cx, this.y, this.w + 12, this.h + cPlaylistManager.botbarHeight + 1, 10, 10, RGBA(0, 0, 0, 120));
			gr.FillRoundRect(cx, this.y, this.w + 12, this.h + cPlaylistManager.botbarHeight, 10, 10, RGBA(0, 0, 0, 150));
			gr.DrawRoundRect(cx, this.y, this.w + 12, this.h + cPlaylistManager.botbarHeight - 1, 9, 9, 1.0, RGBA(255, 255, 255, 200));
			gr.SetSmoothingMode(0);

			gr.FillSolidRect(cx + bg_margin_left, this.y + cPlaylistManager.topbarHeight - 2, this.w - bg_margin_left * 2, 1, RGBA(255, 255, 255, 40));

			// ** items **
			var rowIdx = 0;
			var totalp = this.playlists.length;
			var start_ = this.scroll;
			var end_ = this.scroll + this.totalRows;
			if (end_ > totalp) end_ = totalp;
			for (var i = start_; i < end_; i++) {
				cy = this.y + cPlaylistManager.topbarHeight + rowIdx * ch;
				this.playlists[i].y = cy;

				// ** item bg **
				gr.FillSolidRect(cx + bg_margin_left, cy + bg_margin_top, cw - bg_margin_left * 2 - this.scr_w, ch - bg_margin_top * 2, RGBA(0, 0, 0, 130));
				gr.DrawRect(cx + bg_margin_left, cy + bg_margin_top, cw - bg_margin_left * 2 - this.scr_w - 1, ch - bg_margin_top * 2 - 1, 1.0, RGBA(255, 255, 255, 20));

				// ** item text **
				// playlist total items
				if (cPlaylistManager.showTotalItems) {
					t = plman.PlaylistItemCount(this.playlists[i].idx);
					tw = gr.CalcTextWidth(t + "  ", g_font_s);
					gr.GdiDrawText(t, g_font_s, blendColors(txt_color, bg_color, 0.2), cx + bg_margin_left + txt_margin, cy, cw - bg_margin_left * 2 - txt_margin * 2 - this.scr_w, ch, rc_txt);
				}
				else {
					tw = 0;
				};
				// draw playlist name
				if ((this.activeIndex == i + 1 && cPlaylistManager.blink_counter < 0) || (cPlaylistManager.blink_id == i + 1 && cPlaylistManager.blink_row != 0)) {
					gr.GdiDrawText("+ " + this.playlists[i].name, g_font_bb, txt_color, cx + bg_margin_left + txt_margin, cy, cw - bg_margin_left * 2 - txt_margin * 2 - tw - this.scr_w, ch, lc_txt);
				}
				else {
					gr.GdiDrawText(this.playlists[i].name, g_font, blendColors(txt_color, bg_color, 0.2), cx + bg_margin_left + txt_margin, cy, cw - bg_margin_left * 2 - txt_margin * 2 - tw - this.scr_w, ch, lc_txt);
				};

				// draw flashing item on lbtn_up after a drag'n drop
				if (cPlaylistManager.blink_counter > -1) {
					if (cPlaylistManager.blink_row != 0) {
						if (i == cPlaylistManager.blink_id - 1) {
							if (cPlaylistManager.blink_counter <= 6 && Math.floor(cPlaylistManager.blink_counter / 2) == Math.ceil(cPlaylistManager.blink_counter / 2)) {
								gr.FillSolidRect(cx + bg_margin_left, cy + bg_margin_top, cw - bg_margin_left * 2 - this.scr_w, ch - bg_margin_top * 2, RGBA(255, 255, 255, 75));
							};
						};
					};
				};

				rowIdx++;
			};

			// top bar
			// draw flashing top bar item on lbtn_up after a drag'n drop
			if (cPlaylistManager.blink_counter > -1) {
				if (cPlaylistManager.blink_row == 0) {
					if (cPlaylistManager.blink_counter <= 6 && Math.floor(cPlaylistManager.blink_counter / 2) == Math.ceil(cPlaylistManager.blink_counter / 2)) {
						gr.GdiDrawText("+ 发送到新播放列表", g_font_bb, txt_color, cx + bg_margin_left + txt_margin, this.y, cw - bg_margin_left * 2 - txt_margin * 2 - tw - this.scr_w, ch, lc_txt);
					};
				}
				else {
					gr.GdiDrawText("发送到 ...", g_font, txt_color, cx + bg_margin_left + txt_margin, this.y, cw - bg_margin_left * 2 - txt_margin * 2 - tw - this.scr_w, ch, lc_txt);
				};
			}
			else {
				if (this.activeRow == 0) {
					gr.GdiDrawText("+ 发送到新播放列表", g_font_bb, txt_color, cx + bg_margin_left + txt_margin, this.y, cw - bg_margin_left * 2 - txt_margin * 2 - tw - this.scr_w, ch, lc_txt);
				}
				else {
					gr.GdiDrawText("发送到 ...", g_font, txt_color, cx + bg_margin_left + txt_margin, this.y, cw - bg_margin_left * 2 - txt_margin * 2 - tw - this.scr_w, ch, lc_txt);
				};
			};

			// draw activeIndex hover frame
			if (cPlaylistManager.blink_counter > -1 && cPlaylistManager.blink_row > 0) {
				cy_ = this.y + cPlaylistManager.blink_row * ch;
				gr.DrawRect(cx + bg_margin_left + 1, cy_ + bg_margin_top + 1, cw - bg_margin_left * 2 - this.scr_w - 2, ch - bg_margin_top * 2 - 2, 2.0, RGBA(255, 255, 255, 240));
			}
			else {
				if (this.activeRow > 0 && this.activeIndex > 0) {
					if (cPlaylistManager.blink_counter < 0) {
						cy_ = this.y + this.activeRow * ch;
						gr.DrawRect(cx + bg_margin_left + 1, cy_ + bg_margin_top + 1, cw - bg_margin_left * 2 - this.scr_w - 2, ch - bg_margin_top * 2 - 2, 2.0, RGBA(255, 255, 255, 240));
					};
				};
			};

			// scrollbar
			if (this.scr_w > 0) {
				this.scr_cursor_h = (this.scr_h / (ch * this.rowTotal)) * this.scr_h;
				if (this.scr_cursor_h < 20) this.scr_cursor_h = 20;
				// set cursor y pos
				var ratio = (this.scroll * ch) / (this.rowTotal * ch - this.scr_h);
				this.scr_cursor_y = this.scr_y + Math.round((this.scr_h - this.scr_cursor_h) * ratio);
			};
		};
	};

	this._isHover = function(x, y) {
		return (x >= this.x - this.offset && x <= this.x - this.offset + this.w && y >= this.y && y <= this.y + this.h - 1);
	};


	this.on_mouse = function(event, x, y, delta) {
		this.ishover = this._isHover(x, y);

		switch (event) {
		case "move":
			// get active item index at x,y coords...
			this.activeIndex = -1;
			if (this.ishover) {
				this.activeRow = Math.ceil((y - this.y) / cPlaylistManager.rowHeight) - 1;
				this.activeIndex = Math.ceil((y - this.y) / cPlaylistManager.rowHeight) + this.scroll - 1;
			};
			if (this.activeIndex != this.activeIndexSaved) {
				this.activeIndexSaved = this.activeIndex;
				brw.repaint();
			};
			if (this.scr_w > 0 && x > this.x - this.offset && x <= this.x - this.offset + this.w) {
				if (y < this.y && pman.scroll > 0) {
					if (!timers.scrollPman && cPlaylistManager.blink_counter < 0) {
						timers.scrollPman = window.SetInterval(function() {
							pman.scroll--;
							if (pman.scroll < 0) {
								pman.scroll = 0;
								window.ClearInterval(timers.scrollPman);
								timers.scrollPman = false;
							}
							else {
								brw.repaint();
							};
						}, 100);
					};
				}
				else if (y > this.scr_y + this.scr_h && pman.scroll < this.rowTotal - this.totalRows) {
					if (!timers.scrollPman && cPlaylistManager.blink_counter < 0) {
						timers.scrollPman = window.SetInterval(function() {
							pman.scroll++;
							if (pman.scroll > pman.rowTotal - pman.totalRows) {
								pman.scroll = pman.rowTotal - pman.totalRows;
								window.ClearInterval(timers.scrollPman);
								timers.scrollPman = false;
							}
							else {
								brw.repaint();
							};
						}, 100);
					};
				}
				else {
					if (timers.scrollPman) {
						window.ClearInterval(timers.scrollPman);
						timers.scrollPman = false;
					};
				};
			};
			break;
		case "up":
			brw.drag_clicked = false;
			if (brw.drag_moving) {
				window.SetCursor(IDC_ARROW);
				this.drop_done = false;
				if (this.activeIndex > -1) {
					try {
						brw.metadblist_selection = brw.groups[brw.activeIndex].pl.Clone();
					} catch (e) {};
					if (this.activeRow == 0) {
						// send to a new playlist
						this.drop_done = true;
						fb.RunMainMenuCommand("文件/新建播放列表");
						plman.InsertPlaylistItems(plman.PlaylistCount - 1, 0, brw.metadblist_selection, false);
					}
					else {
						// send to selected (hover) playlist
						this.drop_done = true;
						var row_idx = this.activeIndex - 1;
						var playlist_idx = this.playlists[row_idx].idx;
						var insert_index = plman.PlaylistItemCount(playlist_idx);
						plman.InsertPlaylistItems(playlist_idx, insert_index, brw.metadblist_selection, false);
					};
					// timer to blink the playlist item where tracks have been droped!
					if (this.drop_done) {
						if (!cPlaylistManager.blink_timer) {
							cPlaylistManager.blink_x = x;
							cPlaylistManager.blink_y = y;
							cPlaylistManager.blink_totaltracks = brw.metadblist_selection.Count;
							cPlaylistManager.blink_id = this.activeIndex;
							cPlaylistManager.blink_row = this.activeRow;
							cPlaylistManager.blink_counter = 0;
							cPlaylistManager.blink_timer = window.SetInterval(function() {
								cPlaylistManager.blink_counter++;
								if (cPlaylistManager.blink_counter > 6) {
									window.ClearInterval(cPlaylistManager.blink_timer);
									cPlaylistManager.blink_timer = false;
									cPlaylistManager.blink_counter = -1;
									cPlaylistManager.blink_id = null;
									this.drop_done = false;
									// close pman
									if (!timers.hidePlaylistManager) {
										timers.hidePlaylistManager = window.SetInterval(pman.hidePanel, 30);
									};
									brw.drag_moving = false;
								};
								brw.repaint();
							}, 150);
						};
					};
				}
				else {
					if (timers.showPlaylistManager) {
						window.ClearInterval(timers.showPlaylistManager);
						timers.showPlaylistManager = false;
					};
					if (!timers.hidePlaylistManager) {
						timers.hidePlaylistManager = window.SetInterval(this.hidePanel, 30);
					};
					brw.drag_moving = false;
				};
				brw.drag_moving = false;
			};
			break;
		case "right":
			brw.drag_clicked = false;
			if (brw.drag_moving) {
				if (timers.showPlaylistManager) {
					window.ClearInterval(timers.showPlaylistManager);
					timers.showPlaylistManager = false;
				};
				if (!timers.hidePlaylistManager) {
					timers.hidePlaylistManager = window.SetInterval(this.hidePanel, 30);
				};
				brw.drag_moving = false;
			};
			break;
		case "wheel":
			var scroll_prev = this.scroll;
			this.scroll -= delta;
			if (this.scroll < 0) this.scroll = 0;
			if (this.scroll > (this.rowTotal - this.totalRows)) this.scroll = (this.rowTotal - this.totalRows);
			if (this.scroll != scroll_prev) {
				this.on_mouse("move", m_x, m_y);
			};
			break;
		case "leave":
			brw.drag_clicked = false;
			if (brw.drag_moving) {
				if (timers.showPlaylistManager) {
					window.ClearInterval(timers.showPlaylistManager);
					timers.showPlaylistManager = false;
				};
				if (!timers.hidePlaylistManager) {
					timers.hidePlaylistManager = window.SetInterval(this.hidePanel, 30);
				};
				brw.drag_moving = false;
			};
			break;
		};
	};
};

oDLItem = function(idx, type, groupIndex){
	this.idx = idx;
	this.type = type;
	this.downloaded = 0;
	this.groupIndex = groupIndex;
	this.infoKey = "";
}

oGroup = function(index, start, handle, groupkey) {
	this.index = index;
	this.start = start;
	this.count = 1;
	this.metadb = handle;
	this.groupkey = groupkey;
	if (handle) {
		switch (ppt.tagMode) {
		case 1:
			this.cachekey = process_cachekey(ppt.tf_crc.EvalWithMetadb(handle));
			break;
		case 2:
			if(ppt.artistMode == 0){
				this.cachekey = process_cachekey(ppt.tf_crc_albumartist.EvalWithMetadb(handle));
			}else{
				this.cachekey = process_cachekey(ppt.tf_crc_artist.EvalWithMetadb(handle));
			}
			break;
		case 3:
			this.cachekey = ppt.genre_dir? process_cachekey(ppt.tf_crc_dir.EvalWithMetadb(handle)) : process_cachekey(ppt.tf_crc_genre.EvalWithMetadb(handle));
			if (ppt.genre_dir == 1) this.dir_name = fb.TitleFormat("$directory(%path%,1)").EvalWithMetadb(handle);
			break;
		}
		this.tracktype = TrackType(handle.RawPath.substring(0, 4));
	}
	else {
		this.cachekey = null;
		this.tracktype = 0;
	};
	this.cover_img = null;
	this.cover_type = null;
	this.load_requested = 0;
	this.save_requested = false;

	this.finalize = function(count, tracks, handles) {
		this.tra = tracks.slice(0);
		this.pl = handles.Clone();
		this.count = count;
	};
};

oBrowser = function(name) {
	this.name = name;
	this.groups = [];
	this.rows = [];
	this.scrollbar = new oScrollbar();
	this.keypressed = false;
	this.selectedIndex = -1;
	this.playingIndex = -1;

	this.metadblist_selection = plman.GetPlaylistSelectedItems(g_active_playlist);

	this.launch_populate = function() {
		var launch_timer = window.SetTimeout(function() {
			// populate browser with items
			brw.populate();
			// populate playlist popup panel list
			pman.populate(exclude_active = false, reset_scroll = true);
			// kill Timeout
			launch_timer && window.ClearTimeout(launch_timer);
			launch_timer = false;
		}, 5);
	};

	this.repaint = function() {
		repaint_main1 = repaint_main2;
	};

	this.cover_repaint = function() {
		repaint_cover1 = repaint_cover2;
	};

	this.update = function() {
		this.stampDrawMode = (ppt.panelMode == 1 ? true : false);
		this.thumb_w = ppt.thumbnailWidthMin;
		this.marginLR = 0;
		// set margins betweens album stamps
		if (ppt.panelMode == 1) {
			this.marginTop = 2;
			this.marginBot = 2;
			this.marginSide = 2;
			this.marginCover = 16;
		}
		else {
			this.marginTop = 0;
			this.marginBot = 0;
			this.marginSide = 0;
			this.marginCover = 1;
		};
		// Adjust Column 
		this.totalColumns = Math.floor((this.w - this.marginLR * 2) / this.thumb_w);
		if (this.totalColumns < 1) this.totalColumns = 1;
		// count total of rows for the whole library
		this.rowsCount = Math.ceil(this.groups.length / this.totalColumns);
		var gapeWidth = (this.w - this.marginLR * 2) - (this.totalColumns * this.thumb_w);
		var deltaToAdd = Math.floor(gapeWidth / this.totalColumns);
		this.thumbnailWidth = this.thumb_w + deltaToAdd;
		// calc size of the cover art
		cover.max_w = (this.thumbnailWidth - (this.marginSide * 2) - (this.marginCover * 2));
		// Adjust Row & showList bloc Height
		if (ppt.panelMode == 1) {
			this.rowHeight = 10 + cover.max_w + ppt.botStampHeight;
		}
		else {
			this.rowHeight = cover.max_w + 1;
		};
		this.totalRows = Math.ceil(this.h / this.rowHeight);
		this.totalRowsVis = Math.floor(this.h / this.rowHeight);
		ppt.rowHeight = this.rowHeight;
		//scaled loading img
		var iw = ppt.rowHeight / 2;
		images.loading_draw = images.img_loading.Resize(iw, iw, 2);

		//
		scroll = Math.round(scroll / this.rowHeight) * this.rowHeight;
		scroll = check_scroll(scroll);
		scroll_ = scroll;

		// scrollbar update       
		this.scrollbar.updateScrollbar();
		this.repaint();
	};

	this.setSize = function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		this.scrollbar.setSize();

		scroll = Math.round(scroll / ppt.rowHeight) * ppt.rowHeight;
		scroll = check_scroll(scroll);
		scroll_ = scroll;
		// scrollbar update       
		//this.scrollbar.updateScrollbar();
		this.update();

		pman.setSize(ww, y + 50, (cPlaylistManager.width < ww ? cPlaylistManager.width : ww), h - 100);
	};

	this.setList = function() {
		var end = this.groups.length;
		for (var i = 0; i < end; i++) {
			this.groups[i].load_requested = 0;
		};
	};
	
	this.showItemPanelInit = function(){
		plman.ActivePlaylist = g_active_playlist;
		if(!this.list) return;
		if (ppt.sourceMode == 1) {
			if (ppt.forceSorting) {
				var ItemIndex = plman.GetPlaylistFocusItemIndex(g_active_playlist);
				if (ItemIndex > -1 && ItemIndex < this.list.Count) {
					var gid = this.getItemIndexFromTrackIndex(ItemIndex);
					if (gid > -1) {
					this.showItemFromItemIndex(gid);
					};
				};
			}
			else {
				var handle = fb.GetFocusItem();
				this.showItemFromItemHandle(handle);
			}
		}
		else {
			try{
				var handle = fb.GetFocusItem();
				if(TrackType(handle.rawpath.substring(0, 4)) > 3) return;
				if (fb.IsMetadbInMediaLibrary(handle)) {
					this.showItemFromItemHandle(handle);
					avoid_checkscroll = false;
				}
			} catch(e) {}
		}
		if(brw.selectedIndex > -1)
			brw.sendItemToPlaylist(brw.selectedIndex);
	}

	this.showItemFromItemHandle = function(metadb, isplaying) {
		var total = this.groups.length;
		if(total == 0 || metadb == null) return;
		var total_tracks = 0;
		var found = false;
		for (var a = (ppt.showAllItem ? 1 : 0); a < total; a++) {
			total_tracks = this.groups[a].pl.Count;
			for (var t = 0; t < total_tracks; t++) {
				found = this.groups[a].pl[t].Compare(metadb);
				if (found) {
					break;
				};
			};
			if (found) break;
		};
		if (found) { // scroll to album and open showlist
			if (ppt.showAllItem && a == 0) a += 1;
			if(ppt.sourceMode == 1) avoid_checkscroll =false;
			if(!avoid_checkscroll){
			var row = Math.floor(a / this.totalColumns);
			if (this.h / 2 > this.rowHeight) {
				var delta = Math.floor(this.h / 2);
			}
			else {
				var delta = 0
			};
			scroll = row * this.rowHeight - delta;
			scroll = check_scroll(scroll);
			}
			this.activateItem(a, isplaying);
		}
		else {
			if(isplaying) this.playingIndex = -1;
			else this.selectedIndex = -1;
		}
	};

	this.showNowPlaying = function(initial) {
		if (this.groups.length == 0) return;
		if (ppt.sourceMode == 1 && fb.IsPlaying) {
			try {
				if (!ppt.locklibpl) {//pure playlist mode
					if (plman.PlayingPlaylist != plman.ActivePlaylist) {
						if (initial) return;
						g_active_playlist = plman.ActivePlaylist = plman.PlayingPlaylist;
					};
					if(ppt.forceSorting){
						this.nowplaying = plman.GetPlayingItemLocation();
						var gid = this.getItemIndexFromTrackIndex(this.nowplaying.PlaylistItemIndex);
						if (gid > -1) {
							this.showItemFromItemIndex(gid, true);
						};
					}
					else{
						var handle = fb.GetNowPlaying();
						this.showItemFromItemHandle(handle, true);
					}
				}
				else {
					var handle = fb.GetNowPlaying();
					if (fb.IsMetadbInMediaLibrary(handle)) {
						this.showItemFromItemHandle(handle, true);
					};
				};
			}
			catch (e) {};
		}
		else try {
			if (initial) {
				var handle = fb.GetFocusItem();
				this.showItemFromItemHandle(handle);
				return;
			}
			var index = this.selectedIndex;
			if (ppt.showAllItem && index == 0) index += 1;
			var row = Math.floor(index / this.totalColumns);
			if (this.h / 2 > this.rowHeight) {
				var delta = Math.floor(this.h / 2);
			}
			else {
				var delta = 0
			};
			scroll = row * this.rowHeight - delta;
			scroll = check_scroll(scroll);
		}catch (e) {};
	};

	this.showItemFromItemIndex = function(index, isplaying) {
		if (ppt.showAllItem && index == 0) index += 1;
		var row = Math.floor(index / this.totalColumns);
		if (this.h / 2 > this.rowHeight) {
			var delta = Math.floor(this.h / 2);
		}
		else {
			var delta = 0
		};
		scroll = row * this.rowHeight - delta;
		scroll = check_scroll(scroll);
		this.activateItem(index, isplaying);
	};
	
	this.FindItemFromItemHandle = function(metadb, isplaying) {
		var total = this.groups.length;
		var total_tracks = 0;
		var found = false;
		for (var a = (ppt.showAllItem ? 1 : 0); a < total; a++) {
			total_tracks = this.groups[a].pl.Count;
			for (var t = 0; t < total_tracks; t++) {
				found = this.groups[a].pl[t].Compare(metadb);
				if (found) {
					break;
				};
			};
			if (found) break;
		};
		if (found) { // scroll to album and open showlist
			if (ppt.showAllItem && a == 0) a += 1;
			this.playingIndex = a;
		}
		else {
			if(isplaying) this.playingIndex = -1;
		}
	};

	this.getItemIndexFromTrackIndex = function(tid) {
		var mediane = 0;
		var deb = 0;
		var fin = this.groups.length - 1;
		while (deb <= fin) {
			mediane = Math.floor((fin + deb) / 2);
			if (tid >= this.groups[mediane].start && tid < this.groups[mediane].start + this.groups[mediane].count) {
				return mediane;
			}
			else if (tid < this.groups[mediane].start) {
				fin = mediane - 1;
			}
			else {
				deb = mediane + 1;
			};
		};
		return -1;
	};

	this.selectAtoB = function(start_id, end_id) {
		var affectedItems = Array();

		if (start_id < end_id) {
			var deb = start_id;
			var fin = end_id;
		}
		else {
			var deb = end_id;
			var fin = start_id;
		};

		for (var i = deb; i <= fin; i++) {
			affectedItems.push(i);
		};
		plman.SetPlaylistSelection(g_active_playlist, affectedItems, true);
	};

	this.init_groups = function() {
		var handle = null;
		var current = "";
		var previous = "";
		var g = 0,
			t = 0;
		var arr = [];
		var tr = [];
		var pl = plman.GetPlaylistItems(-1);
		var total = this.list.Count;
		var t_all = 0;
		var tr_all = [];
		var pl_all = plman.GetPlaylistItems(-1);
		var e = [];

		this.groups.splice(0, this.groups.length);

		switch (ppt.tagMode) {
		case 1:
			// album
			if (ppt.albumMode == 0) var tf = ppt.tf_groupkey_album;
			else var tf = ppt.tf_groupkey_album_lt;
			break;
		case 2:
			// artist
			var tf = (ppt.artistMode == 0) ? ppt.tf_groupkey_albumartist: ppt.tf_groupkey_artist;
			break;
		case 3:
			// genre
			var tf = ppt.genre_dir? ppt.tf_groupkey_dir : ppt.tf_groupkey_genre;
			break;
		};
		var str_filter = process_string(filter_text);

		for (var i = 0; i < total; i++) {
			handle = this.list[i];
			arr = tf.EvalWithMetadb(handle).split(" ## ");
			current = arr[0].toUpperCase();
			if (str_filter.length > 0) {
				var comp_str = (arr.length > 1 ? arr[0] + " " + arr[1] : arr[0]);
				var toAdd = match(comp_str, str_filter);
			}
			else {
				var toAdd = true;
			};
			if (toAdd) {
				if (current != previous && !e[current]) {
					//if (ppt.sourceMode == 1) e[current] = true;
					e[current] = true;
					if (g > 0) {
						// update current group
						this.groups[g - 1].finalize(t, tr, pl);
						tr.splice(0, t);
						pl.RemoveAll();
						t = 0;
					};
					if (i < total) {
						// add new group
						tr.push(arr[1]);
						pl.Add(handle);
						if (ppt.showAllItem) {
							tr_all.push(arr[1]);
							pl_all.Add(handle);
						};
						t_all++;
						t++;
						this.groups.push(new oGroup(g + 1, i, handle, arr[0]));
						g++;
						previous = current;
					};
				}
				else {
					// add track to current group
					tr.push(arr[1]);
					pl.Add(handle);
					if (ppt.showAllItem) {
						tr_all.push(arr[1]);
						pl_all.Add(handle);
					};
					t_all++;
					t++;
				};
			};
		};
		if (g > 0) {
			// update last group properties
			this.groups[g - 1].finalize(t, tr, pl);
			// add 1st group ("ALL" item)
			if (ppt.showAllItem) {
				this.groups.unshift(new oGroup(0, 0, null, null));
				this.groups[0].finalize(t_all, tr_all, pl_all);
			};
		};

		// free memory
		tr.splice(0, tr.length);
		tr_all.splice(0, tr_all.length);
		e.splice(0, e.length);
		pl.RemoveAll();
		pl_all.RemoveAll();
		//var d2 = new Date();
		//var t2 = d2.getSeconds() * 1000 + d2.getMilliseconds();
		//console.log("JSB POPULATE: init groups delay = " + Math.round(t2 - t1) + " /handleList count=" + total);
	};

	this.populate = function(/*is_first_populate*/) {
		//fb.trace("--> populate");
		//if (this.list) this.list.Dispose();
		//if (this.list_unsorted) this.list_unsorted.Dispose();
		// define sort order
		var TFsorting = find_sorting();

		if (ppt.sourceMode == 0) {
			// populate library
			this.list = fb.GetLibraryItems();
			// sort the list
			this.list.OrderByFormat(fb.TitleFormat(TFsorting), 1);
		}
		else {
			// populate current playlist
			this.list_unsorted = this.list = plman.GetPlaylistItems(g_active_playlist);
			// sort the list
			this.list.OrderByFormat(fb.TitleFormat(TFsorting), 1);
		};

		this.init_groups();
		//if(is_first_populate) get_metrics();
		this.setList();
		this.update();
		//this.scrollbar.updateScrollbar();
		this.showNowPlaying(true);
		//this.repaint();
		//g_first_populate_done = true;
	};

	this.activateItem = function(index, isplaying) {
		if (this.groups.length == 0) return;
		if(isplaying) this.playingIndex = index;
		else this.selectedIndex = index;
	};

	this.focusItemToPlaylist = function(metadb) {
		if (this.groups.length == 0) return;
			g_avoid_on_item_focus_change = true;
			plman.SetPlaylistFocusItemByHandle(g_active_playlist, metadb);
			plman.ClearPlaylistSelection(g_active_playlist);
			plman.SetPlaylistSelectionSingle(g_active_playlist, plman.GetPlaylistFocusItemIndex(g_active_playlist), true);
		//};
	};

	this.sendItemToPlaylist = function(index) {
		if (this.groups.length == 0) return;

		// notify JSSmoothPlaylist panel to avoid "on_playlist_items_removed" until "on_playlist_items_added" was called (to avoid x2 call of populate function!)
		//window.NotifyOthers("JSSmoothBrowser->JSSmoothPlaylist:avoid_on_playlist_items_removed_callbacks_on_sendItemToPlaylist", true);
		// parse stored tags
		// ======================================
		// Send item tracks to JSBrowser playlist
		// ======================================
		// check if JSBrowser playlists are present
		var affectedItems = [];
		var pfound = false;
		var pfound_playing = false;
			
		pidx = (plman.GetPlaylistName(0) == "媒体库") ? 1 : 0;
		var pidx_playing = -1;
		for (var i = 0; i < plman.PlaylistCount; i++) {
			if (!pfound && plman.GetPlaylistName(i) == "媒体库视图") {
				pidx = i;
				pfound = true;
			};
			if (!pfound_playing && plman.GetPlaylistName(i) == "媒体库视图(正在播放)") {
				pidx_playing = i;
				pfound_playing = true;
			};
			if (pfound && pfound_playing) break;
		};

		if (utils.IsKeyPressed(VK_CONTROL)) {
			// initialize "Library selection" playlist
			if (pfound) {
				var from = plman.PlaylistItemCount(pidx);
			}
			else {
				plman.CreatePlaylist(pidx, "媒体库视图");
				var from = 0;
			};
			// *** insert tracks into pidx playlist
			plman.InsertPlaylistItems(pidx, from, brw.groups[index].pl, false);
		}
		else {
			if (fb.IsPlaying && plman.PlayingPlaylist == pidx) {
				if (plman.PlayingPlaylist == pidx) { // playing playlist is "Library selection"
					plman.RenamePlaylist(pidx, "媒体库视图(正在播放)");
					if (pfound_playing) {
						plman.RenamePlaylist(pidx_playing, "媒体库视图");
						// 1. initialize old "Library selection (playing)" playlist
						var tot = plman.PlaylistItemCount(pidx_playing);
						affectedItems.splice(0, affectedItems.length);
						for (var i = 0; i < tot; i++) {
							affectedItems.push(i);
						};
						plman.SetPlaylistSelection(pidx_playing, affectedItems, true);
						plman.RemovePlaylistSelection(pidx_playing, false);
					}
					else {
						pidx_playing = pidx + 1;
						plman.CreatePlaylist(pidx_playing, "媒体库视图");
					};
					// *** insert tracks into pidx_playing playlist
					plman.InsertPlaylistItems(pidx_playing, 0, brw.groups[index].pl, false);
					plman.MovePlaylist(pidx_playing, pidx);
					if (pidx_playing < pidx)
						plman.MovePlaylist(pidx - 1, pidx_playing);
					else plman.MovePlaylist(pidx + 1, pidx_playing);
					window.NotifyOthers("LibviewUpdated", true);
				}
				else {
					// initialize true "Library selection" playlist
					if (pfound) {
						// clear "Library selection" playlist content
						var tot = plman.PlaylistItemCount(pidx);
						for (var i = 0; i < tot; i++) {
							affectedItems.push(i);
						};
						plman.SetPlaylistSelection(pidx, affectedItems, true);
						plman.RemovePlaylistSelection(pidx, false);
					}
					else {
						// create "Library selection" playlist
						plman.CreatePlaylist(pidx, "媒体库视图");
					};
					// *** insert tracks into pidx playlist
					plman.InsertPlaylistItems(pidx, 0, brw.groups[index].pl, false);
				};
			}
			else {
				// initialize "Library selection" playlist
				if (pfound) {
					// clear "Library selection" playlist content
					var tot = plman.PlaylistItemCount(pidx);
					for (var i = 0; i < tot; i++) {
						affectedItems.push(i);
					};
					plman.SetPlaylistSelection(pidx, affectedItems, true);
					plman.RemovePlaylistSelection(pidx, false);
				}
				else {
					// create "Library selection" playlist
					plman.CreatePlaylist(pidx, "媒体库视图");
				};
				// *** insert tracks into pidx playlist
				plman.InsertPlaylistItems(pidx, 0, brw.groups[index].pl, false);
			};
		};
	};
	
	this.change_active_item = function(){
		if (ppt.sourceMode == 0) {
			g_avoid_on_playlist_items_removed = true;
			g_avoid_on_item_focus_change = true;
			this.sendItemToPlaylist(this.activeIndex);
			plman.ActivePlaylist = pidx;
			g_active_playlist = pidx;
			avoid_checkscroll = true;
			//plman.SetPlaylistSelectionSingle(g_active_playlist, 0, true);
		}
		else {
			g_avoid_on_playlist_items_removed = true;
			g_avoid_on_item_focus_change = true;
			this.sendItemToPlaylist(this.activeIndex);
			if (ppt.locklibpl) {
				plman.ActivePlaylist = lib_pl;
			}
			if (!ppt.forceSorting && this.activeIndex > (ppt.showAllItem - 1)){
				this.focusItemToPlaylist(this.groups[this.activeIndex].metadb);
			} else {
				plman.ClearPlaylistSelection(g_active_playlist);
				this.selectAtoB(this.groups[this.activeIndex].start, this.groups[this.activeIndex].start + this.groups[this.activeIndex].count - 1);
				g_avoid_on_item_focus_change = true;
				plman.SetPlaylistFocusItem(g_active_playlist, this.groups[this.activeIndex].start);
			}
		};
	}

	this.getlimits = function() {

		// get visible stamps limits (start & end indexes)
		if (this.groups.length <= this.totalRowsVis * this.totalColumns) {
			var start_ = 0;
			var end_ = this.groups.length;
		}
		else {
			var start_ = Math.round(scroll_ / this.rowHeight) * this.totalColumns;
			var end_ = Math.round((scroll_ + wh + this.rowHeight) / this.rowHeight) * this.totalColumns;
			// check values / limits
			end_ = (this.groups.length < end_) ? this.groups.length : end_;
			start_ = start_ > 0 ? start_ - this.totalColumns : (start_ < 0 ? 0 : start_);
		};

		// save limits calculated into globals var
		g_start_ = start_;
		g_end_ = end_;
	};
	
	this.init_swbtn = function(){
		switch(ppt.tagMode){
			case 1:
			if (ppt.albumMode ==0) this.switch_btn = new button(images.sw_btn_n1, images.sw_btn_n1, images.sw_btn_n1, "切换至简单专辑模式");
			else this.switch_btn = new button(images.sw_btn_n0, images.sw_btn_n0, images.sw_btn_n0, "切换至高级专辑模式");
			break;
			case 2:
			if (ppt.artistMode ==0) this.switch_btn = new button(images.sw_btn_n0, images.sw_btn_n0, images.sw_btn_n0, "切换至艺术家");
			else this.switch_btn = new button(images.sw_btn_n1, images.sw_btn_n1, images.sw_btn_n1, "切换至专辑艺术家");
			break;
			case 3:
			if (ppt.genre_dir ==0) this.switch_btn = new button(images.sw_btn_n0, images.sw_btn_n0, images.sw_btn_n0, "切换至文件夹");
			else this.switch_btn = new button(images.sw_btn_n1, images.sw_btn_n1, images.sw_btn_n1, "切换至流派");
			break;
		}
	}
	this.init_swbtn();
	
	this.reset_swbtn = function(){
		this.switch_btn.Tooltip.Deactivate();
		switch(ppt.tagMode){
			case 1:
			if (ppt.albumMode ==0) {
				this.switch_btn.img = Array(images.sw_btn_n1, images.sw_btn_n1, images.sw_btn_n1);
				this.switch_btn.Tooltip.Text = "切换至简单专辑模式";
			}else{
				this.switch_btn.img = Array(images.sw_btn_n0, images.sw_btn_n0, images.sw_btn_n0);
				this.switch_btn.Tooltip.Text = "切换至高级专辑模式";
			}
			break;
			default:
			case 2:
			if (ppt.artistMode ==0) {
				this.switch_btn.img = Array(images.sw_btn_n0, images.sw_btn_n0, images.sw_btn_n0);
				this.switch_btn.Tooltip.Text = "切换至艺术家";
			}else{
				this.switch_btn.img = Array(images.sw_btn_n1, images.sw_btn_n1, images.sw_btn_n1);
				this.switch_btn.Tooltip.Text = "切换至专辑艺术家";
			}
			break;
			case 3:
			if (ppt.genre_dir ==0) {
				this.switch_btn.img = Array(images.sw_btn_n0, images.sw_btn_n0, images.sw_btn_n0);
				this.switch_btn.Tooltip.Text = "切换至文件夹";
			}else{
				this.switch_btn.img = Array(images.sw_btn_n1, images.sw_btn_n1, images.sw_btn_n1);
				this.switch_btn.Tooltip.Text = "切换至流派";
			}
			break;
		}
	}

	this.draw = function(gr) {
		var tmp, offset;
		var cx = 0;
		var ax, ay, by, rowStart, row, coverTop;
		var aw = this.thumbnailWidth - (this.marginSide * 2);
		var ah = this.rowHeight - this.marginTop - this.marginBot;
		var coverWidth = cover.max_w;
		var txt_color = g_color_normal_txt;//1, txt_color2;
		var total = this.groups.length;
		var all_x = -1,
			all_y = -1,
			all_w = 0,
			all_h = 0;
		var coverImg = null;

		this.getlimits();

		if (repaint_main || !repaintforced) {
			repaint_main = false;
			repaintforced = false;

			// draw visible stamps (loop)
			for (var i = g_start_; i < g_end_; i++) {
				row = Math.floor(i / this.totalColumns);
				ax = this.x + (cx * this.thumbnailWidth) + this.marginSide + this.marginLR;
				ay = Math.floor(this.y + (row * this.rowHeight) + this.marginTop - scroll_);
				this.groups[i].x = ax;
				this.groups[i].y = ay;

				if (ay >= (0 - this.rowHeight) && ay < this.y + this.h) { // if stamp visible, we have to draw it
					// parse stored tags
					if (!(ppt.showAllItem && i == 0)) {// && total > 1)) {
						if (this.groups[i].groupkey.length > 0) {
							var arr = this.groups[i].groupkey.split(" ^^ ");
						};
					};
					// get cover
					if (ppt.showAllItem && i == 0) {
						this.groups[i].cover_img = images.all;
					}
					else {
						if (this.groups[i].cover_type == null) {
							if (this.groups[i].load_requested == 0) {
								this.groups[i].cover_img = g_image_cache.hit(this.groups[i].metadb, i);
							};
						}
						else if (this.groups[i].cover_type == 0) {
							if(this.groups[i].tracktype != 3) this.groups[i].cover_img = images.noart;
							else this.groups[i].cover_img = images.stream;
						};
					};
					
					if (i == this.playingIndex) {
						txt_color = ppt.panelMode == 1 ? RGBA(255, 255, 255) : g_color_highlight;
						//txt_color2 = txt_color1;
						if (this.stampDrawMode) {
							gr.FillSolidRect(ax, ay, aw, ah, g_color_highlight);
						}
					}
					else if (this.stampDrawMode) {
						if (i == this.selectedIndex) {
							gr.FillSolidRect(ax, ay, aw, ah, g_color_selected_bg);
						};
						txt_color = g_color_normal_txt;
					}	
					else { // panelMode = 3 (Grid)
						txt_color = g_color_normal_txt;
					};
					coverTop = ppt.panelMode == 1 ? ay + 10 : ay;
					// draw cover
					if (this.groups[i].cover_img) {
						//if (cover.keepaspectratio) {
							var max = this.groups[i].cover_img.Width > this.groups[i].cover_img.Height ? this.groups[i].cover_img.Width : this.groups[i].cover_img.Height;
							var rw = this.groups[i].cover_img.Width / max;
							var rh = this.groups[i].cover_img.Height / max;
							var im_w = (rw * coverWidth) - 2;
							var im_h = (rh * coverWidth) - 2;
						//}
						//else {
						//	var im_w = coverWidth;
						//	var im_h = coverWidth;
						//};
						// save coords ALL cover image:
						if (ppt.showAllItem && i == 0) {
							all_x = ax + Math.round((aw - im_w) / 2);
							all_y = coverTop + coverWidth - im_h;
							all_w = im_w;
							all_h = im_h;
						}
						else {
							gr.DrawImage(this.groups[i].cover_img, ax + Math.round((aw - im_w) / 2), coverTop + coverWidth - im_h, im_w, im_h, 1, 1, this.groups[i].cover_img.Width - 2, this.groups[i].cover_img.Height - 2);
							//cover frame:
							gr.DrawRect(ax + Math.round((aw - im_w) / 2), coverTop + coverWidth - im_h, im_w - 1, im_h - 1, 1.0, g_color_normal_txt & 0x25ffffff);
							// grid text background rect
							if (ppt.panelMode == 3) {
								if (i == this.playingIndex) {
									gr.FillSolidRect(ax + 2, coverTop + coverWidth - ppt.botGridHeight, aw - 4, ppt.botGridHeight, g_color_normal_bg & 0xddffffff);
								}
								else if (i == this.selectedIndex) {
									//gr.FillSolidRect(ax + 2, coverTop, aw - 4, im_h, g_color_selected_bg);
									gr.FillSolidRect(ax + 2, coverTop + coverWidth - ppt.botGridHeight, aw - 4, ppt.botGridHeight, g_color_selected_bg);
								}
								else gr.FillSolidRect(ax + 2, coverTop + coverWidth - ppt.botGridHeight, aw - 4, ppt.botGridHeight, g_color_grid_bg);
							}else if (ppt.panelMode == 2 && i == this.playingIndex){
								gr.FillSolidRect(ax + 2, coverTop + coverWidth - ppt.botGridHeight, aw - 4, ppt.botGridHeight, g_color_normal_bg & 0xddffffff);
							};
						};
					}
					else {
						var im_w = coverWidth;
						var im_h = coverWidth;
							gr.DrawImage(images.loading_draw, ax + Math.round((aw - images.loading_draw.Width) / 2), ay + Math.round((aw - images.loading_draw.Height) / 2), images.loading_draw.Width, images.loading_draw.Height, 0, 0, images.loading_draw.Width, images.loading_draw.Height, images.loading_angle, 255);
					};

					// in Grid mode (panelMode = 3), if cover is in portrait mode, adjust width to the stamp width
					if (ppt.panelMode == 3 && im_h > im_w) {
						var frame_w = coverWidth;
						var frame_h = im_h;
					}
					else {
						var frame_w = im_w;
						var frame_h = im_h;
					};
					var _cx = ax + Math.round((aw - frame_w) / 2);
					//if (!ppt.showAllItem || (ppt.showAllItem && i > 0) || (ppt.panelMode != 3)) {
						if (g_rightClickedIndex > -1) {
							if (g_rightClickedIndex == i) {
								if (this.stampDrawMode) {
									gr.DrawRect(ax + 1, ay + 1, aw - 2, ah - 2, 2.0, g_color_selected_bg);
								}
								else {
									gr.DrawRect(_cx + 1, coverTop + coverWidth - frame_h + 1, frame_w - 3, frame_h - 3, 3.0, g_color_selected_bg);
								};
							};
						}
						else {
							if (i == this.activeIndex) {
								if (this.stampDrawMode) {
									gr.DrawRect(ax + 1, ay + 1, aw - 2, ah - 2, 2.0, g_color_selected_bg);
								}
								else {
									gr.DrawRect(_cx + 1, coverTop + coverWidth - frame_h + 1, frame_w - 3, frame_h - 3, 3.0, g_color_selected_bg);
								};
							};
						};
					//};
					if(i == this.playingIndex && ppt.panelMode != 1){
						gr.DrawRect(_cx + 1, coverTop + coverWidth - frame_h + 1, frame_w - 3, frame_h - 3, 3.0, g_color_highlight);
					}

					if (ppt.panelMode == 1) { // panelMode = 1 (Art + bottom labels)
						// draw text
						if (ppt.showAllItem && i == 0) {// && total > 1) { // aggregate item ( [ALL] )
							try {
								if (ppt.tagMode == 1) {
									gr.GdiDrawText("所有项目", g_font_b, txt_color, ax + Math.round((aw - coverWidth) / 2), (coverTop + 5 + coverWidth), coverWidth, ppt.botTextRowHeight, lt_txt);
								}
								else {
									gr.GdiDrawText("所有项目", (i == this.selectedIndex ? g_font_b : g_font), txt_color, ax + Math.round((aw - coverWidth) / 2), (coverTop + 5 + coverWidth), coverWidth, ppt.botTextRowHeight, lt_txt);
								};
							} catch (e) {}
						}
						else {
							if (arr[1] == "?") {
								if (this.groups[i].count > 1) {
									var album_name = (this.groups[i].tracktype != 3 ? "(单曲)" : "(网络电台)");
								}
								else {
									var arr_t = this.groups[i].tra[0].split(" ^^ ");
									var album_name = (this.groups[i].tracktype != 3 ? "(单曲) " : "") + arr_t[0];
								};
							}
							else {
								var album_name = arr[1];
							};
							try {
								if (ppt.tagMode == 1 && ppt.albumMode == 0) {
									gr.GdiDrawText(album_name, g_font_b, txt_color, ax + Math.round((aw - coverWidth) / 2), (coverTop + 5 + coverWidth), coverWidth, ppt.botTextRowHeight, lt_txt);
									gr.GdiDrawText(arr[0], g_font_s, txt_color, ax + Math.round((aw - coverWidth) / 2), (coverTop + 5 + coverWidth + ppt.botTextRowHeight), coverWidth, ppt.botTextRowHeight, lt_txt);
								}
								else if(ppt.tagMode == 3 && ppt.genre_dir == 1){
									gr.GdiDrawText(this.groups[i].dir_name, (i == this.selectedIndex ? g_font_b : g_font), txt_color, ax + Math.round((aw - coverWidth) / 2), (coverTop + 5 + coverWidth), coverWidth, ppt.botTextRowHeight, lt_txt);
								}
								else {
									gr.GdiDrawText(arr[0], (i == this.selectedIndex ? g_font_b : g_font), txt_color, ax + Math.round((aw - coverWidth) / 2), (coverTop + 5 + coverWidth), coverWidth, ppt.botTextRowHeight, lt_txt);
								};
							} catch (e) {}
						};
					}
					else if (this.groups[i].cover_img) { // panelMode = 3 (Grid)
						// draw text
						if (ppt.showAllItem && i == 0) {// && total > 1) { // aggregate item ( [ALL] )
							// nothing
						}
						else if(ppt.panelMode == 3 || (ppt.panelMode == 2 && i ==this.playingIndex)) {
							if (arr[1] == "?") {
								if (this.groups[i].count > 1) {
									var album_name = (this.groups[i].tracktype != 3 ? "(单曲)" : "(网络电台)");
								}
								else {
									var arr_t = this.groups[i].tra[0].split(" ^^ ");
									var album_name = (this.groups[i].tracktype != 3 ? "(单曲) " : "") + arr_t[0];
								};
							}
							else {
								var album_name = arr[1];
							};
							try {
								if (ppt.tagMode == 1 && ppt.albumMode == 0) {
									gr.GdiDrawText(album_name, g_font_b, txt_color, ax + 10, (coverTop + 5 + coverWidth) - ppt.botGridHeight, aw - 20, ppt.botTextRowHeight, lt_txt);
									if (this.groups[i].tracktype != 3) {
										gr.GdiDrawText(arr[0], g_font_s, txt_color, ax + 10, (coverTop + 5 + coverWidth + ppt.botTextRowHeight) - ppt.botGridHeight, aw - 20, ppt.botTextRowHeight, lt_txt);
									}
								}
								else if(ppt.tagMode == 3 && ppt.genre_dir == 1){
									gr.GdiDrawText(this.groups[i].dir_name, (i == this.selectedIndex ? g_font_b : g_font), txt_color, ax + 10, (coverTop + coverWidth + 6) - ppt.botGridHeight, aw - 20, ppt.botTextRowHeight, lt_txt);
								}
								else {
									gr.GdiDrawText(arr[0], (i == this.selectedIndex ? g_font_b : g_font), txt_color, ax + 10, (coverTop + coverWidth + 6) - ppt.botGridHeight, aw - 20, ppt.botTextRowHeight, lt_txt);
								};
							} catch (e) {}
						};
					};
				};

				// set next column index
				if (cx == this.totalColumns - 1) {
					cx = 0;
				}
				else {
					cx++;
				};
			};

			// draw scrollbar
			//if (cScrollBar.enabled) {
			try{
				brw.scrollbar && brw.scrollbar.draw(gr);
			}catch(e){
				brw.scrollbar.updateScrollbar();
				brw.scrollbar.draw(gr);
			}
				
			//};

			// Incremental Search Display
			if (cList.search_string.length > 0) {
				var string_w = gr.CalcTextWidth(cList.search_string, cList.incsearch_font);
				var string_h = gr.CalcTextHeight(cList.search_string, cList.incsearch_font);
				gr.SetSmoothingMode(2);
				brw.tt_w = Math.round(string_w + cSwitchBtn.w);
				brw.tt_h = Math.round(string_h + 16 * zdpi);
				brw.tt_x = Math.floor((brw.w - brw.tt_w) / 2);
				brw.tt_y = brw.y + ((brw.h - brw.tt_h) / 2);
				gr.FillRoundRect(brw.tt_x, brw.tt_y, brw.tt_w, brw.tt_h, 5, 5, RGBA(0, 0, 0, 150));
				gr.DrawRoundRect(brw.tt_x-1, brw.tt_y-1, brw.tt_w+2, brw.tt_h+2, 5, 5, 1.0, RGBA(0, 0, 0, 180));
				try {
					gr.GdiDrawText(cList.search_string, cList.incsearch_font, RGB(0, 0, 0), brw.tt_x + 1, brw.tt_y + 1, brw.tt_w, brw.tt_h, ccf_txt);
					gr.GdiDrawText(cList.search_string, cList.incsearch_font, cList.inc_search_noresult ? RGB(255, 70, 70) : RGB(250, 250, 250), brw.tt_x, brw.tt_y, brw.tt_w, brw.tt_h, ccf_txt);
				}
				catch (e) {};
			};

			// fill ALL cover image with the 1st four cover art found
			// get cover
			if (all_x > -1 && ppt.showAllItem && g_start_ == 0) {// && total > 1) {
				var ii_w = Math.floor(all_w / 2);
				var ii_h = Math.floor(all_h / 2);
				var ii_x1 = all_x;
				var ii_x2 = ii_x1 + ii_w;
				var ii_y1 = all_y;
				var ii_y2 = ii_y1 + ii_h;
				var lim = this.groups.length;
				if (lim > 5) lim = 5;
				for (var ii = 1; ii < lim; ii++) {
					if (this.groups[ii].cover_img) {
						switch (ii) {
						case 1:
							gr.DrawImage(this.groups[ii].cover_img, ii_x1, ii_y1, ii_w, ii_h, 1, 1, this.groups[ii].cover_img.Width - 2, this.groups[ii].cover_img.Height - 2);
							break;
						case 2:
							gr.DrawImage(this.groups[ii].cover_img, ii_x2, ii_y1, ii_w, ii_h, 1, 1, this.groups[ii].cover_img.Width - 2, this.groups[ii].cover_img.Height - 2);
							break;
						case 3:
							gr.DrawImage(this.groups[ii].cover_img, ii_x1, ii_y2, ii_w, ii_h, 1, 1, this.groups[ii].cover_img.Width - 2, this.groups[ii].cover_img.Height - 2);
							break;
						case 4:
							gr.DrawImage(this.groups[ii].cover_img, ii_x2, ii_y2, ii_w, ii_h, 1, 1, this.groups[ii].cover_img.Width - 2, this.groups[ii].cover_img.Height - 2);
							break;
						};
					};
				};
				var frame_col = g_color_normal_txt & 0x25ffffff;//“所有项目”的边框
				gr.DrawRect(ii_x1, ii_y1, all_w - 2, all_h - 2, 1.0, frame_col);
				gr.FillSolidRect(ii_x1 + 1, ii_y1 + Math.round(all_h / 2) - 1, all_w - 3, 1, frame_col);
				gr.FillSolidRect(ii_x1 + Math.round(all_w / 2) - 1, ii_y1 + 1, 1,  all_h - 3, frame_col);

				// redraw hover frame selection on ALL item for Grid view
				if (ppt.panelMode != 1) { // grid
					if (g_rightClickedIndex == 0 || this.activeIndex == 0) {
						gr.DrawRect(all_x + 1, all_y + 1, all_w - 3, all_h - 3, 3.0, g_color_selected_bg & 0xddffffff);
					};
				};
			};

			// draw top header bar 
			var item_txt = new Array("", "张专辑", "位专辑艺术家", "位艺术家", "个流派", "个文件夹");
			var nb_groups = (ppt.showAllItem/* && total > 1*/ ? total - 1 : total);
			var _idx1 = (ppt.tagMode == 2 && ppt.artistMode);
			var _idx2 = (ppt.tagMode == 3 ? (ppt.genre_dir ? 2 : 1) : 0);
			var boxText = nb_groups + " " +  item_txt[ppt.tagMode+_idx1+_idx2] + "  ";
			try{boxText_len = gr.CalcTextWidth(boxText, g_font_b)}
			catch (e) {boxText_len = 0;}
			if (ppt.sourceMode == 0) {
				var source_name = "媒体库"
			}
			else {
				var source_name = "当前列表：" + (ppt.locklibpl ? "媒体库" : plman.GetPlaylistName(plman.ActivePlaylist));
			};
			var source_width = gr.CalcTextWidth(source_name, g_font_b);
			gr.FillSolidRect(0, 0, ww, brw.y + 1, g_color_normal_bg);
			gr.FillSolidRect(this.x, ppt.headerBarHeight, this.w + cScrollBar.width/*(cScrollBar.enabled ? cScrollBar.width : 0)*/, 1, g_color_line);
			var tx = cFilterBox.x + cFilterBox.w + Math.round(22 * zdpi) + 10;
			var tw = (this.w - tx - cSwitchBtn.w - 2 + cScrollBar.width/*(cScrollBar.enabled ? cScrollBar.width : 0)*/)*2/3;
			var source_w = Math.min(tw, source_width);
			gr.FillSolidRect(tx - 8, 0, tw * 2 + 8 + ppt.headerBarHeight , ppt.headerBarHeight - 2, g_color_topbar);
			try {
				gr.GdiDrawText(source_name, g_font_b, g_color_normal_txt, tx, 0, source_w, ppt.headerBarHeight, lc_txt);
				if(fb.IsPlaying && playing_title) gr.GdiDrawText("  |  "+ playing_title + " [播放中] ", g_font, g_color_highlight, tx + source_width, 0, tw - source_width, ppt.headerBarHeight, lc_txt);
				gr.GdiDrawText(boxText, g_font_b, g_color_normal_txt, tx + tw, 0, tw/2, ppt.headerBarHeight, rc_txt);
			}
			catch (e) {};
			this.switch_btn.draw(gr, cSwitchBtn.x, cSwitchBtn.y, 255);
		};
	};

	this._isHover = function(x, y) {
		return (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h);
	};

	this.on_mouse = function(event, x, y, delta) {
		this.ishover = this._isHover(x, y);

		// get active item index at x,y coords...
		this.activeIndex = -1;
		if (this.ishover) {
			this.activeRow = Math.ceil((y + scroll_ - this.y) / this.rowHeight) - 1;
			if (y > this.y && x > this.x && x < this.x + this.w) {
				this.activeColumn = Math.ceil((x - this.x - this.marginLR) / this.thumbnailWidth) - 1;
				this.activeIndex = (this.activeRow * this.totalColumns) + this.activeColumn;
				this.activeIndex = this.activeIndex > this.groups.length - 1 ? -1 : this.activeIndex;
			};
		};
		if (brw.activeIndex != brw.activeIndexSaved) {
			brw.activeIndexSaved = brw.activeIndex;
			this.repaint();
		};

		switch (event) {
		case "down":
			if (this.ishover) {
				if (this.activeIndex > -1) {
					if (this.activeIndex == this.selectedIndex) {
						this.drag_clicked = true;
						this.drag_clicked_x = x;
						if(plman.ActivePlaylist == g_active_playlist) return;
					}
					else{
						this.activateItem(this.activeIndex);
						this.change_active_item();
					}
				};
				if(ppt.sourceMode == 0) this.repaint();
			}
			else {
				if (/*cScrollBar.enabled && */cScrollBar.visible) {
					this.scrollbar && this.scrollbar.on_mouse(event, x, y);
				};
			};
			break;
		case "up":
			this.drag_clicked = false;
			if (/*cScrollBar.enabled && */cScrollBar.visible) {
				this.scrollbar && this.scrollbar.on_mouse(event, x, y);
			};
			break;
		case "dblclk":
			if (this.ishover) {
				if (brw.activeIndex > -1) {
					if (ppt.sourceMode == 0) {
						// play first track of the selection                     
						plman.ExecutePlaylistDefaultAction(g_active_playlist, 0);
					}
					else {
						plman.ExecutePlaylistDefaultAction(g_active_playlist, plman.GetPlaylistFocusItemIndex(g_active_playlist));
					};
				};
			}
			else {
				if (/*cScrollBar.enabled && */cScrollBar.visible) {
					this.scrollbar && this.scrollbar.on_mouse(event, x, y);
				};
			};
			break;
		case "right":
			g_rightClickedIndex = this.activeIndex;
			if (this.ishover && this.activeIndex > -1) {
				this.item_context_menu(x, y, this.activeIndex);
			}
			else {
				if (!g_filterbox.inputbox.hover) {
					this.settings_context_menu(x, y);
				};
			};
			g_rightClickedIndex = -1;
			if (!this.ishover) {
				if (/*cScrollBar.enabled && */cScrollBar.visible) {
					this.scrollbar && this.scrollbar.on_mouse(event, x, y);
				};
			};
			break;
		case "move":
			if (this.drag_clicked && !this.drag_moving) {
				if (x - this.drag_clicked_x > 30 && this.h > cPlaylistManager.rowHeight * 6) {
					this.drag_moving = true;
					window.SetCursor(IDC_HELP);
					pman.state = 1;
					if (timers.hidePlaylistManager) {
						window.ClearInterval(timers.hidePlaylistManager);
						timers.hidePlaylistManager = false;
					};
					if (!timers.showPlaylistManager) {
						timers.showPlaylistManager = window.SetInterval(pman.showPanel, 30);
					};
				};
			};
			if (this.drag_moving && !timers.hidePlaylistManager && !timers.showPlaylistManager) {
				pman.on_mouse("move", x, y);
			};
			if (/*cScrollBar.enabled && */cScrollBar.visible) {
				this.scrollbar && this.scrollbar.on_mouse(event, x, y);
			};
			break;
		case "wheel":
			if (/*cScrollBar.enabled && */cScrollBar.visible) {
				this.scrollbar.updateScrollbar();
			};
			break;
		case "leave":
			if (/*cScrollBar.enabled && */cScrollBar.visible) {
				this.scrollbar && this.scrollbar.on_mouse(event, x, y);
			};
			break;
		};
	};

	if (this.g_timeCover) {
		window.ClearInterval(this.g_timeCover);
		this.g_timeCover = false;
	};
	this.g_timeCover = window.SetInterval(function() {
		if (!window.IsVisible) {
			window_visible = false;
			return;
		};

		var repaint_1 = false;

		if (repaint_cover1 == repaint_cover2) {
			repaint_cover2 = !repaint_cover1;
			repaint_1 = true;
		};

		if (repaint_1) {
			repaintforced = true;
			repaint_main = true;
			images.loading_angle = (images.loading_angle + 15) % 360;
			window.Repaint();
		};

	}, ppt.refreshRateCover);

	if (this.g_time) {
		window.ClearInterval(this.g_time);
		this.g_time = false;
	};
	this.g_time = window.SetInterval(function() {
		if (!window.IsVisible) {
			window_visible = false;
			return;
		};

		var repaint_1 = false;

		if (!window_visible) {
			window_visible = true;
		};

		if (!g_first_populate_launched) {
			if (isNaN(scroll) || isNaN(scroll_)) {
				scroll = scroll_ = 0;
			};
			g_first_populate_launched = true;
			brw.launch_populate();
		};

		if (repaint_main1 == repaint_main2) {
			repaint_main2 = !repaint_main1;
			repaint_1 = true;
		};

		scroll = check_scroll(scroll);
		if (Math.abs(scroll - scroll_) >= 1) {
			scroll_ += (scroll - scroll_) / ppt.scrollSmoothness;
			isScrolling = true;
			repaint_1 = true;
			if (scroll_prev != scroll) brw.scrollbar.updateScrollbar();
		}
		else {
			if (scroll_ != scroll) {
				scroll_ = scroll; // force to scroll_ value to fixe the 5.5 stop value for expanding album action
				repaint_1 = true;
			};
			if (isScrolling) {
				if (scroll_ < 1) scroll_ = 0;
				isScrolling = false;
				repaint_1 = true;
			};
		};

		if (repaint_1) {
			repaintforced = true;
			repaint_main = true;
			images.loading_angle = (images.loading_angle + 15) % 360;
			window.Repaint();
		};

		scroll_prev = scroll;
	}, ppt.refreshRate);

	this.item_context_menu = function(x, y, albumIndex) {
		var _menu = window.CreatePopupMenu();
		var Context = fb.CreateContextMenuManager();
		var _child01 = window.CreatePopupMenu();

		var crc = this.groups[albumIndex].cachekey;

		this.metadblist_selection = this.groups[albumIndex].pl.Clone();
		Context.InitContext(this.metadblist_selection);

		_menu.AppendMenuItem(MF_STRING, 1, "设置...");
		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(MF_STRING, 899, "创建智能列表");
		_menu.AppendMenuSeparator();
		Context.BuildMenu(_menu, 2, -1);
		_menu.AppendMenuItem(MF_STRING, 1010, "重置所选图像的缓存");
		_child01.AppendTo(_menu, MF_STRING, "选择添加到...");
		_child01.AppendMenuItem(MF_STRING, 2000, "新播放列表");

		var pl_count = plman.PlaylistCount;
		if (pl_count > 1) {
			_child01.AppendMenuItem(MF_SEPARATOR, 0, "");
		};
		for (var i = 0; i < pl_count; i++) {
			if (i != this.playlist && !plman.IsAutoPlaylist(i)) {
				_child01.AppendMenuItem(MF_STRING, 2001 + i, plman.GetPlaylistName(i));
			};
		};

		var ret = _menu.TrackPopupMenu(x, y);
		if (ret > 1 && ret < 800) {
			Context.ExecuteByID(ret - 2);
		}
		else if (ret < 2) {
			switch (ret) {
			case 1:
				this.settings_context_menu(x, y);
				break;
			};
		} else {
			switch (ret) {
			case 899:
				var list_g = "";
				switch (ppt.tagMode) {
					case 1:
						list_g = "%album%";
						break;
					case 2:
						list_g = "%album artist%";
						break;
					case 3:
						list_g = ppt.genre_dir? "%directory%" : "%genre%";
					break;
				}
				var pl_n = plman.PlaylistCount;
				var string_n = fb.TitleFormat(list_g).EvalWithMetadb(fb.GetFocusItem());
				plman.CreateAutoPlaylist(pl_n, string_n, list_g + " IS " + string_n);
				break;
			case 1010:
				reset_this_cache(albumIndex, crc);
				this.repaint();
				break;
			case 2000:
				fb.RunMainMenuCommand("文件/新建播放列表");
				plman.InsertPlaylistItems(plman.PlaylistCount - 1, 0, this.metadblist_selection, false);
				break;
			default:
				var insert_index = plman.PlaylistItemCount(ret - 2001);
				plman.InsertPlaylistItems((ret - 2001), insert_index, this.metadblist_selection, false);
			};
		};
		g_rbtn_click = false;
		return true;
	};

	this.settings_context_menu = function(x, y) {
		var _menu = window.CreatePopupMenu();
		var _menu0 = window.CreatePopupMenu();
		var _menu1 = window.CreatePopupMenu();
		var _menu2 = window.CreatePopupMenu();
		var _menu3 = window.CreatePopupMenu();
		var idx;

		_menu0.AppendMenuItem(MF_STRING, 50, "媒体库");
		_menu0.AppendMenuItem(MF_STRING, 51, "播放列表");
		_menu0.CheckMenuRadioItem(50, 51, 50 + ppt.sourceMode);
		_menu0.AppendMenuSeparator();
		_menu0.AppendMenuItem((ppt.sourceMode == 1 && fb.IsLibraryEnabled()) ? MF_STRING : MF_DISABLED, 52, "锁定在媒体库播放列表");
		_menu0.CheckMenuItem(52, ppt.locklibpl);
		_menu0.AppendMenuItem((ppt.sourceMode == 1) ? MF_STRING : MF_DISABLED, 53, "播放列表强制排序");
		_menu0.CheckMenuItem(53, ppt.forceSorting);
		_menu0.AppendTo(_menu, MF_STRING, "来源");
		_menu.AppendMenuSeparator();
		
		_menu1.AppendMenuItem(MF_STRING, 111, "专辑 | 专辑艺术家");
		_menu1.AppendMenuItem(MF_STRING, 112, "专辑");
		_menu1.AppendMenuItem(MF_STRING, 113, "专辑艺术家");
		_menu1.AppendMenuItem(MF_STRING, 114, "艺术家");
		_menu1.AppendMenuItem(MF_STRING, 115, "流派");
		_menu1.AppendMenuItem(MF_STRING, 116, "文件夹");
		var _idx1 = (ppt.tagMode == 1 && ppt.albumMode);
		var _idx2 = (ppt.tagMode == 2 ? (ppt.artistMode ? 2 : 1)  : 0);
		var _idx3 = (ppt.tagMode == 3 ? (ppt.genre_dir ? 3 : 2)  : 0);
		_menu1.CheckMenuRadioItem(111, 116, 110 + ppt.tagMode + _idx1 + _idx2 + _idx3);
		_menu1.AppendTo(_menu, MF_STRING, "视图");
		_menu2.AppendMenuItem(MF_STRING, 901, "间距排列模式");
		_menu2.AppendMenuItem(MF_STRING, 902, "网格排列无文字模式");
		_menu2.AppendMenuItem(MF_STRING, 903, "网格排列模式");
		_menu2.CheckMenuRadioItem(901, 903, 900 + ppt.panelMode);
		_menu2.AppendMenuSeparator();
		_menu2.AppendMenuItem(MF_STRING, 911, "合计项目");
		_menu2.CheckMenuItem(911, ppt.showAllItem);
		_menu2.AppendMenuSeparator();
		_menu2.AppendMenuItem(MF_STRING, 912, "重置磁盘缓存");
		_menu2.AppendTo(_menu, MF_STRING, "显示");
		_menu.AppendMenuItem(MF_STRING, 200, "刷新封面 (F5)");
		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(MF_STRING, 201, "加载时动画效果");
		_menu.CheckMenuItem(201, ppt.showloading);
		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(MF_STRING, 991, "面板属性");

		idx = _menu.TrackPopupMenu(x, y);

		switch (true) {
		case (idx >= 50 && idx <= 51):
			ppt.sourceMode = idx - 50;
			window.SetProperty("_PROPERTY: Source Mode", ppt.sourceMode);
			if (ppt.sourceMode != 0 && ppt.forceSorting) SortPlaylist();
			window.Reload();
			break;
		case (idx == 52):
			ppt.locklibpl = !ppt.locklibpl;
			if (ppt.lock_lib_playlist) g_active_playlist = lib_pl;
			else g_active_playlist = plman.ActivePlaylist;
			window.SetProperty("_PROPERTY: Lock to Library playlist", ppt.locklibpl);
			window.NotifyOthers("lock_lib_playlist", ppt.locklibpl);
			window.Reload();
			break;
		case (idx == 53):
			ppt.forceSorting = !ppt.forceSorting;
			window.SetProperty("_PROPERTY: Forced sorting - Playlist Mode", ppt.forceSorting);
			if (ppt.sourceMode != 0 && ppt.forceSorting) SortPlaylist();
			break;
		case (idx >= 111 && idx <= 112):
			ppt.tagMode = 1;
			ppt.albumMode = idx - 111;
			window.SetProperty("_PROPERTY: Tag Mode", ppt.tagMode);
			window.SetProperty("_PROPERTY: Album Mode", ppt.albumMode);
			ppt.albumArtId = 0;
			if (ppt.sourceMode != 0 && ppt.forceSorting) SortPlaylist();
			get_botGridHeight();
			brw.reset_swbtn();
			brw.populate();
			transfer_covertype();
			break;
		case (idx >= 113 && idx <= 114):
			ppt.tagMode = 2;
			ppt.artistMode = idx - 113;
			window.SetProperty("_PROPERTY: Tag Mode", ppt.tagMode);
			window.SetProperty("_PROPERTY: Album Mode", ppt.artistMode);
			ppt.albumArtId = 4;
			if (ppt.sourceMode != 0 && ppt.forceSorting) SortPlaylist();
			get_botGridHeight();
			brw.reset_swbtn();
			brw.populate();
			transfer_covertype();
			break;
		case (idx >= 115 && idx <= 116):
			ppt.tagMode = 3;
			ppt.genre_dir = idx - 115;
			window.SetProperty("_PROPERTY: Tag Mode", ppt.tagMode);
			window.SetProperty("_PROPERTY: Genre or Directory", ppt.genre_dir);
			ppt.albumArtId = 5;
			if (ppt.sourceMode != 0 && ppt.forceSorting) SortPlaylist();
			get_botGridHeight();
			brw.reset_swbtn();
			brw.populate();
			transfer_covertype();
			break;
		case (idx == 200):
			refresh_cover();
			break;
		case (idx == 201):
			ppt.showloading = !ppt.showloading;
			window.SetProperty("_PROPERTY: Show loading animation", ppt.showloading);
			break;
		case (idx >= 900 && idx <= 903):
			ppt.panelMode = idx - 900;
			window.SetProperty("_PROPERTY: Display Mode", ppt.panelMode);
			g_image_cache = new image_cache;
			get_metrics();
			brw.setList();
			brw.update();
			break;
		case (idx == 911):
			ppt.showAllItem = !ppt.showAllItem;
			window.SetProperty("_PROPERTY: Show ALL item", ppt.showAllItem);
			brw.populate();
			break;
		case (idx == 912):
			if (fso.FolderExists(fb.ProfilePath + "cache\\CoverCache")){
				try{
					fso.DeleteFile(fb.ProfilePath + "cache\\CoverCache\\*");
				} catch(e){}
			}
			var tot = brw.groups.length;
			var crc;
			for (var k = (ppt.showAllItem ? 1 : 0); k < tot; k++) {
				crc = brw.groups[k].cachekey;
				brw.groups[k].tid = -1;
				brw.groups[k].load_requested = 0;
				brw.groups[k].save_requested = false;
				g_image_cache.reset(crc);
				brw.groups[k].cover_img = null;
				brw.groups[k].cover_type = null;
			}
			brw.cover_repaint();
			break;
		case (idx == 991):
			window.ShowProperties();
			break;
		};
		return true;
	};

	this.incrementalSearch = function() {
		var count = 0;
		var groupkey;
		var chr;
		var gstart;
		var pid = -1;

		// exit if no search string in cache
		if (cList.search_string.length <= 0) return true;

		var total = this.groups.length;

		// 1st char of the search string
		var first_chr = cList.search_string.substring(0, 1);
		var len = cList.search_string.length;

		// which start point for the search
		if (total > 1000) {
			if(ppt.tagMode == 3 && ppt.genre_dir == 1) groupkey = this.groups[Math.floor(total / 2)].dir_name;
			else groupkey = this.groups[Math.floor(total / 2)].groupkey;
			chr = groupkey.substring(0, 1);
			if (first_chr.charCodeAt(first_chr) > chr.charCodeAt(chr)) {
				gstart = Math.floor(total / 2);
			}
			else {
				gstart = (ppt.showAllItem ? 1 : 0);
			};
		}
		else {
			gstart = (ppt.showAllItem ? 1 : 0);
		};

		var format_str = "";
		for (var i = gstart; i < total; i++) {
			if(ppt.tagMode == 3 && ppt.genre_dir == 1) groupkey = this.groups[i].dir_name;
			else groupkey = this.groups[i].groupkey;
			if (len <= groupkey.length) {
				format_str = groupkey.substring(0, len);
			}
			else {
				format_str = groupkey;
			};
			if (format_str.toLowerCase() == cList.search_string.toLowerCase()) {
				pid = i;
				break;
			};
		};

		if (pid >= 0) { // found
			this.showItemFromItemIndex(pid);
		}
		else { // not found on "album artist" TAG, new search on "artist" TAG
			cList.inc_search_noresult = true;
			brw.repaint();
		};

		cList.clear_incsearch_timer && window.ClearTimeout(cList.clear_incsearch_timer);
		cList.clear_incsearch_timer = window.SetTimeout(function() {
			// reset incremental search string after 1 seconds without any key pressed
			cList.search_string = "";
			cList.inc_search_noresult = false;
			brw.repaint();
			window.ClearInterval(cList.clear_incsearch_timer);
			cList.clear_incsearch_timer = false;
		}, 1000);
	};
};


//===================================================================================================
//    Main
//===================================================================================================

var fso = new ActiveXObject("Scripting.FileSystemObject");
var cover_img = null;//cover.masks.split(";");

var brw = null;
var g_1x1 = false;
var isScrolling = false;
var g_switchbar = null;
var g_filterbox = null;
var filter_text = "";

// fonts
var g_font = null, g_font_b = null, g_font_s = null, g_font_bb = null;
//
var ww = 0,
	wh = 0;
var g_metadb = null;
var g_focus = false;
clipboard = {
	selection: null
};
// wallpaper infos
var m_x = 0,
	m_y = 0;
var g_active_playlist = null;
// color vars
var g_color_normal_bg = 0;
var g_color_selected_bg = 0;
var g_color_normal_txt = 0;
var g_color_highlight = 0, c_default_hl = 0;
var g_scroll_color = 0;
var g_color_grid_bg = 0;
var g_btn_color1, g_color_bt_overlay;
// boolean to avoid callbacks
var g_avoid_on_playlists_changed = false;
var g_avoid_on_playlist_switch = false;
var g_avoid_on_item_focus_change = false;
var g_avoid_on_playlist_items_added = false;
var g_avoid_on_playlist_items_removed = false;
//var g_avoid_on_playlist_switch_callbacks_on_sendItemToPlaylist = false;
var g_avoid_on_playlist_items_reordered = false;
// mouse actions
var g_lbtn_click = false;
var g_rbtn_click = false;
//
var g_total_duration_text = "";
var g_first_populate_launched = false;

var repaintforced = false;
var launch_time = fb.CreateProfiler("launch_time");
var form_text = "";
var repaint_main = true,
	repaint_main1 = true,
	repaint_main2 = true;
var repaint_cover = true,
	repaint_cover1 = true,
	repaint_cover2 = true;
var window_visible = false;
var scroll_ = 0,
	scroll = 0,
	scroll_prev = 0;
var time222;
var g_start_ = 0,
	g_end_ = 0;

var g_rightClickedIndex = -1;
var playing_title;

function on_init() {
	window.DlgCode = DLGC_WANTALLKEYS;
	get_font();
	get_colors();
	g_switchbar = new oSwitchbar();
	get_metrics();
	if(!fb.IsLibraryEnabled()) ppt.locklibpl = false;
	window.NotifyOthers("lock_lib_playlist", ppt.locklibpl);
	if (ppt.locklibpl) {
		g_active_playlist = lib_pl;
		if (plman.GetPlaylistName(lib_pl) != "媒体库") {
			ppt.locklibpl = false;
			g_active_playlist = plman.ActivePlaylist;
			window.NotifyOthers("lock_lib_playlist", ppt.locklibpl);
			window.SetProperty("_PROPERTY: Lock to Library playlist", ppt.locklibpl);
		}
	} else g_active_playlist = plman.ActivePlaylist;

	switch (ppt.tagMode) {
	case 1:
		ppt.albumArtId = 0;
		break;
	case 2:
		ppt.albumArtId = 4;
		break;
	case 3:
		ppt.albumArtId = 5;
		break;
	};
	if (ppt.sourceMode != 0 && ppt.forceSorting) SortPlaylist();
	get_images();
	get_images_loading();
	brw = new oBrowser("brw");
	pman = new oPlaylistManager("pman");
	g_filterbox = new oFilterBox();
	g_filterbox.setSize(cFilterBox.w, cFilterBox.h);
	g_filterbox.inputbox.visible = true;
	if(ppt.cache_size < 100) ppt.cache_size = 100;
	if(ppt.cache_size > 500) ppt.cache_size = 500;
};
on_init();
// START

function on_size() {
	window.DlgCode = DLGC_WANTALLKEYS;

	ww = window.Width;
	wh = window.Height;

	if (!ww || !wh) {
		ww = ppt.default_lineHeightMin;
		wh = ppt.default_lineHeightMin;
	};

	window.MinWidth = ppt.default_lineHeightMin;
	window.MinHeight = ppt.default_lineHeightMin;
	// set Size of browser
	//if (cScrollBar.enabled) {
		brw.setSize(0, ppt.headerBarHeight, ww - cScrollBar.width, wh - ppt.headerBarHeight);
	//}
	//else {
	//	brw.setSize(0, ppt.headerBarHeight, ww, wh - ppt.headerBarHeight);
	//};
	g_switchbar.setSize(g_switchbar.x, g_switchbar.y, g_switchbar.w, g_switchbar.h);
};

function on_paint(gr) {
	if (!window.Width || !window.Height) return;
	gr.FillSolidRect(0, 0, ww, wh, g_color_normal_bg);
	if (!g_1x1) {
		brw && brw.draw(gr);
		if (pman.offset > 0) {
			pman.draw(gr);
		};
	
	g_filterbox.draw(gr, cFilterBox.x, cFilterBox.y);
	g_switchbar.draw(gr);
	};
};

function on_mouse_lbtn_down(x, y) {
	g_lbtn_click = true;
	g_rbtn_click = false;

	// stop inertia
	if (cTouch.timer) {
		window.ClearInterval(cTouch.timer);
		cTouch.timer = false;
		// stop scrolling but not abrupt, add a little offset for the stop
		if (Math.abs(scroll - scroll_) > ppt.rowHeight) {
			scroll = (scroll > scroll_ ? scroll_ + ppt.rowHeight : scroll_ - ppt.rowHeight);
			scroll = check_scroll(scroll);
		};
	};

	var is_scroll_enabled = brw.rowsCount > brw.totalRowsVis;
	if (ppt.enableTouchControl && is_scroll_enabled) {
		if (brw._isHover(x, y) && !brw.scrollbar._isHover(x, y)) {
			if (!timers.mouseDown) {
				cTouch.y_prev = y;
				cTouch.y_start = y;
				if (cTouch.t1) {
					cTouch.t1.Reset();
				}
				else {
					cTouch.t1 = fb.CreateProfiler("t1");
				};
				timers.mouseDown = window.SetTimeout(function() {
					window.ClearTimeout(timers.mouseDown);
					timers.mouseDown = false;
					if (Math.abs(cTouch.y_start - m_y) > 015) {
						cTouch.down = true;
					}
					else {
						brw.on_mouse("down", x, y);
					};
				}, 50);
			};
		}
		else {
			brw.on_mouse("down", x, y);
		};
	}
	else {
		brw.on_mouse("down", x, y);
	};

	// inputBox
	g_filterbox.on_mouse("lbtn_down", x, y);
	brw.switch_btn.checkstate("down", x, y);
};

function on_mouse_lbtn_up(x, y) {
		g_filterbox.on_mouse("lbtn_up", x, y);
		g_switchbar.on_mouse("lbtn_up", x, y);

	if (pman.state == 1) {
		pman.on_mouse("up", x, y);
	}
	else {
		brw.on_mouse("up", x, y);
		if (brw.switch_btn.checkstate("up", x, y) == ButtonStates.hover) {
			switch (ppt.tagMode){
				case 1:
					ppt.albumMode = !ppt.albumMode;
					window.SetProperty("_PROPERTY: Album Mode", ppt.albumMode);
					get_botGridHeight();
					brw.populate();
					break;
				case 2:
					ppt.artistMode = !ppt.artistMode;
					window.SetProperty("_PROPERTY: Artist Mode", ppt.artistMode);
					if (ppt.sourceMode != 0 && ppt.forceSorting) SortPlaylist();
					brw.populate();
					transfer_covertype();
					break;
				case 3:
					ppt.genre_dir = !ppt.genre_dir;
					window.SetProperty("_PROPERTY: Genre or Directory", ppt.genre_dir);
					if (ppt.sourceMode != 0 && ppt.forceSorting) SortPlaylist();
					brw.populate();
					transfer_covertype();
					break;
			}
			brw.reset_swbtn();
		}
	};

	if (timers.mouseDown) {
		window.ClearTimeout(timers.mouseDown);
		timers.mouseDown = false;
		if (Math.abs(cTouch.y_start - m_y) <= 030) {
			brw.on_mouse("down", x, y);
		};
	};

	// create scroll inertia on mouse lbtn up
	if (cTouch.down) {
		cTouch.down = false;
		cTouch.y_end = y;
		cTouch.scroll_delta = scroll - scroll_;
		if (Math.abs(cTouch.scroll_delta) > 015) {
			cTouch.multiplier = ((1000 - cTouch.t1.Time) / 20);
			cTouch.delta = Math.round((cTouch.scroll_delta) / 015);
			if (cTouch.multiplier < 1) cTouch.multiplier = 1;
			if (cTouch.timer) window.ClearInterval(cTouch.timer);
			cTouch.timer = window.SetInterval(function() {
				scroll += cTouch.delta * cTouch.multiplier;
				scroll = check_scroll(scroll);
				cTouch.multiplier = cTouch.multiplier - 1;
				cTouch.delta = cTouch.delta - (cTouch.delta / 10);
				if (cTouch.multiplier < 1) {
					window.ClearInterval(cTouch.timer);
					cTouch.timer = false;
				};
			}, 75);
		};
	};

	g_lbtn_click = false;
};

function on_mouse_lbtn_dblclk(x, y, mask) {
	if (y >= brw.y) {
		brw.on_mouse("dblclk", x, y);
	}
	else if (x > brw.x && x < brw.x + brw.w - cSwitchBtn.w - 2 + cScrollBar.width/*(cScrollBar.enabled ? cScrollBar.width : 0)*/) {
		brw.showNowPlaying();
	}
};

function on_mouse_rbtn_down(x, y, mask) {

};

function on_mouse_rbtn_up(x, y) {
	g_rbtn_click = true;
	if (!utils.IsKeyPressed(VK_SHIFT)) {
		g_filterbox.on_mouse("rbtn_down", x, y);
		if (pman.state == 1) {
			pman.on_mouse("right", x, y);
		};
	};
	brw.on_mouse("right", x, y);
	g_rbtn_click = false;
	
	//if (!utils.IsKeyPressed(VK_SHIFT)) {
	return true;
	//};
};

function on_mouse_move(x, y) {
	if (m_x == x && m_y == y) return;
	g_filterbox.on_mouse("move", x, y);
	g_switchbar.on_mouse("move", x, y);

	if (pman.state == 1) {
		pman.on_mouse("move", x, y);
	}
	else {
		if (cTouch.down) {
			cTouch.y_current = y;
			cTouch.y_move = (cTouch.y_current - cTouch.y_prev);
			if (x < brw.w) {
				scroll -= cTouch.y_move;
				cTouch.scroll_delta = scroll - scroll_;
				if (Math.abs(cTouch.scroll_delta) < 030) cTouch.y_start = cTouch.y_current;
				cTouch.y_prev = cTouch.y_current;
			};
		}
		else {
			brw.on_mouse("move", x, y);
			brw.switch_btn.checkstate("move", x, y);
		};
	};

	m_x = x;
	m_y = y;
};

function on_mouse_wheel(step) {
	if (cTouch.timer) {
		window.ClearInterval(cTouch.timer);
		cTouch.timer = false;
	};

	if (utils.IsKeyPressed(VK_SHIFT)) { // zoom cover size only
		var zoomStep = Math.round(ppt.thumbnailWidthMin / 3);
		var previous = ppt.default_thumbnailWidthMin;
		if (!timers.mouseWheel) {
			ppt.default_thumbnailWidthMin += step * zoomStep;
			if (ppt.default_thumbnailWidthMin < 130) ppt.default_thumbnailWidthMin = 130;
			if (ppt.default_thumbnailWidthMin > 250) ppt.default_thumbnailWidthMin = 250;
			if (previous != ppt.default_thumbnailWidthMin) {
				timers.mouseWheel = window.SetTimeout(function() {
					window.SetProperty("SYSTEM thumbnails Minimal Width", ppt.default_thumbnailWidthMin);
					g_image_cache = new image_cache;
					get_metrics();
					brw.setList();
					brw.update();
					timers.mouseWheel && window.ClearTimeout(timers.mouseWheel);
					timers.mouseWheel = false;
				}, 100);
			};
		};
	}
	else {
		if (pman.state == 1) {
			if (pman.scr_w > 0) pman.on_mouse("wheel", m_x, m_y, step);
		}
		else {
			scroll -= step * (brw.rowHeight / ppt.scrollRowDivider * ppt.rowScrollStep);
			scroll = check_scroll(scroll)
			brw.on_mouse("wheel", m_x, m_y, step);
		};
	};
};

function on_mouse_leave() {
	g_filterbox.on_mouse("leave", 0, 0);
	brw.switch_btn.checkstate("leave", 0, 0);
	brw.on_mouse("leave", 0, 0);

	if (pman.state == 1) {
		pman.on_mouse("leave", 0, 0);
	};
	g_switchbar.on_mouse("leave", 0, 0);
};

//=================================================// Metrics & Fonts & Colors & Images
function get_botGridHeight(){
	if(ppt.tagMode == 1 && ppt.albumMode == 0){
		ppt.botGridHeight = Math.floor((ppt.default_botGridHeight + 14) * zdpi);
	}
	else ppt.botGridHeight = Math.floor(ppt.default_botGridHeight * zdpi);
}

function get_metrics() {
	ppt.lineHeightMin = Math.floor(ppt.default_lineHeightMin * zdpi);
	ppt.thumbnailWidthMin = Math.floor(ppt.default_thumbnailWidthMin * zdpi);
	get_botGridHeight();
	ppt.botStampHeight = 48*zdpi;
	ppt.botTextRowHeight =  17*zdpi;
	ppt.textLineHeight = 10*zdpi;
	cPlaylistManager.width = 230*zdpi;
	cPlaylistManager.topbarHeight = 30*zdpi;
	cPlaylistManager.botbarHeight = 4*zdpi;
	cPlaylistManager.scrollbarWidth = 10*zdpi;
	cPlaylistManager.rowHeight = 30*zdpi;
	cScrollBar.width = sys_scrollbar ? get_system_scrollbar_width() : 12*zdpi;
	cScrollBar.minCursorHeight = 25*zdpi;
	cScrollBar.maxCursorHeight = sys_scrollbar ? 125*zdpi : 110*zdpi;
	ppt.headerBarHeight = Math.ceil(26 * zdpi) + 2;
	g_switchbar.x = z(5);
	g_switchbar.y = z(5);
	g_switchbar.w = z(205);
	g_switchbar.h = ppt.headerBarHeight;
	cFilterBox.x = g_switchbar.x * 2 + g_switchbar.w;
	cFilterBox.w = 120*zdpi;
	cFilterBox.h = 20*zdpi;
	cFilterBox.y = Math.ceil((ppt.headerBarHeight - cFilterBox.h)/2);
	cSwitchBtn.h = 12 * zdpi + 12;
	cSwitchBtn.y = Math.ceil((ppt.headerBarHeight - cSwitchBtn.h) / 2);
	cSwitchBtn.w = 24 * zdpi;
	if (brw) {
		//if (cScrollBar.enabled) {
			brw.setSize(0, ppt.headerBarHeight, ww - cScrollBar.width, wh - ppt.headerBarHeight);
		//}
		//else {
		//	brw.setSize(0, ppt.headerBarHeight, ww, wh - ppt.headerBarHeight);
		//};
	};
};

function get_images() {
	var gb;
	var txt = "";
	var x5 = 5*zdpi, _x10 = 10*zdpi, _x14 = 14*zdpi;
	images.all = gdi.CreateImage(150, 150);
	gb = images.all.GetGraphics();
	gb.FillSolidRect(0, 0, 150, 150, g_color_normal_txt & 0x10ffffff);
	images.all.ReleaseGraphics(gb);

	var nw = 250,
		nh = 250;
	var _font = GdiFont(g_fname, Math.round(nh / 12 * 1.75), 1)
	images.noart = gdi.CreateImage(nw, nh);
	gb = images.noart.GetGraphics();
	// draw no cover art image
	gb.SetSmoothingMode(2);
	gb.FillSolidRect(0, 0, nw, nh, g_color_normal_txt & 0x10ffffff);
	gb.DrawEllipse(30,30,nw-60,nh-60,4,g_color_normal_txt & 0x15ffffff)
	gb.DrawEllipse(100,100,nw-200,nh-200,4,g_color_normal_txt & 0x15ffffff)
	gb.SetSmoothingMode(0);
	images.noart.ReleaseGraphics(gb);

	var stream_1 = gdi.CreateImage(100, 100);
	gb = stream_1.GetGraphics();
	// draw no cover art image
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(44,44,nw-80,nh-80,3,g_color_normal_txt & 0x15ffffff)
	gb.DrawEllipse(62,62,nw-130,nh-130,3,g_color_normal_txt & 0x15ffffff)
	gb.SetSmoothingMode(0);
	stream_1.ReleaseGraphics(gb);
	
	images.stream = gdi.CreateImage(nw, nh);
	gb = images.stream.GetGraphics();
	gb.DrawImage(images.noart, 0, 0, nw, nh, 0, 0, nw, nh);
	gb.DrawImage(stream_1, 0, 0, stream_1.Width, stream_1.Height, 0, 0, stream_1.Width, stream_1.Height);
	images.stream.ReleaseGraphics(gb);
	
	images.sw_btn_n0 = gdi.CreateImage(cSwitchBtn.w, cSwitchBtn.h);
	gb = images.sw_btn_n0.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillRoundRect(2*zdpi,x5, 18*zdpi,_x10, x5,x5, g_btn_color1);
	gb.FillRoundRect(2*zdpi+2,x5+2, _x10-4,_x10-4, x5-2,x5-2, RGBA(255, 255, 255, 180));
	images.sw_btn_n0.ReleaseGraphics(gb);
	
	images.sw_btn_n1 = gdi.CreateImage(cSwitchBtn.w, cSwitchBtn.h);
	gb = images.sw_btn_n1.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillRoundRect(2*zdpi,x5, 18*zdpi,_x10, x5,x5, g_btn_color1);
	gb.FillRoundRect(_x10+2,x5+2, _x10-4,_x10-4, x5-2,x5-2, RGBA(255, 255, 255, 180));
	images.sw_btn_n1.ReleaseGraphics(gb);
	
	nw = Math.round(16*zdpi);
	nh = Math.round(15*zdpi);
	images.album = gdi.CreateImage(nw, nw);
	gb = images.album.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(zdpi,zdpi, _x14,_x14, 1, g_color_normal_txt);
	gb.DrawEllipse(6*zdpi,6*zdpi, 4*zdpi,4*zdpi, 1, g_color_normal_txt);
	gb.SetSmoothingMode(0);
	images.album.ReleaseGraphics(gb);
	
	images.artist = gdi.CreateImage(nw, nh);
	gb = images.artist.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(4*zdpi,zdpi, 8*zdpi,8*zdpi, 1, g_color_normal_txt);
	gb.DrawEllipse(zdpi,9*zdpi, _x14,_x14, 1, g_color_normal_txt);
	gb.SetSmoothingMode(0);
	images.artist.ReleaseGraphics(gb);
	
	images.genre = gdi.CreateImage(nw, nh);
	gb = images.genre.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(zdpi,_x10, 4*zdpi,4*zdpi, 1, g_color_normal_txt);
	gb.DrawEllipse(_x10,_x10, 4*zdpi,4*zdpi, 1, g_color_normal_txt);
	gb.SetSmoothingMode(0);
	gb.DrawLine(Math.round(x5),12*zdpi, Math.round(x5),2*zdpi, 1, g_color_normal_txt);
	gb.DrawLine(Math.round(_x14),12*zdpi, Math.round(_x14),2*zdpi, 1, g_color_normal_txt);
	gb.DrawLine(Math.round(x5),2*zdpi, Math.round(_x14),2*zdpi, 1, g_color_normal_txt);
	gb.DrawLine(Math.round(x5),x5, Math.round(_x14),x5, 1, g_color_normal_txt);
	images.genre.ReleaseGraphics(gb);
}

function get_images_loading() {
	images.img_loading = gdi.CreateImage(300, 300);
	gb = images.img_loading.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillEllipse(136,108, 28, 28, g_color_highlight&0x75ffffff);
	gb.FillEllipse(108,136, 28, 28, g_color_highlight&0x55ffffff);
	gb.FillEllipse(136,164, 28, 28, g_color_highlight&0x35ffffff);
	gb.FillEllipse(164,136, 28, 28, g_color_highlight&0x15ffffff);
	gb.SetSmoothingMode(0);
	images.img_loading.ReleaseGraphics(gb);
	
	var iw = ppt.rowHeight / 2;
	images.loading_draw = images.img_loading.Resize(iw, iw, 2);
}

function get_font() {
	g_font = window.GetFontDUI(FontTypeDUI.playlists);
	g_fname = g_font.Name;
	g_fsize = g_font.Size;
	g_fstyle = g_font.Style;
	zdpi = g_fsize / 12;
	g_font_b = GdiFont(g_fname, g_fsize, 1);
	g_font_s = GdiFont(g_fname, g_fsize - 1, 0);
	g_font_bb = GdiFont(g_fname, g_fsize + 1, 1);
	g_font_lock = GdiFont(g_fname, g_fsize*2, 1);
	cList.incsearch_font = GdiFont(g_fname, g_fsize + 10, 1);
};

function get_colors() {
	g_color_normal_bg = window.GetColourDUI(ColorTypeDUI.background);
	g_color_normal_txt = window.GetColourDUI(ColorTypeDUI.text);
	g_scroll_color = g_color_normal_txt & 0x95ffffff;
	g_color_line = RGBA(0, 0, 0, 45);
	g_color_topbar = g_color_normal_txt & 0x09ffffff;
	g_btn_color1 = g_color_normal_txt & 0x35ffffff;
	g_color_bt_overlay = g_color_normal_txt & 0x35ffffff;
	c_default_hl =  window.GetColourDUI(ColorTypeDUI.highlight);
	g_color_highlight = c_default_hl;
	g_color_grid_bg = g_color_normal_bg & 0x60ffffff;
	if(isDarkMode(g_color_normal_bg)) dark_mode = 1;
	else dark_mode = 0;
	g_color_selected_bg = window.GetColourDUI(ColorTypeDUI.selection);
};

function on_script_unload() {
	brw.g_time && window.ClearInterval(brw.g_time);
	brw.g_time = false;
	brw.g_timeCover && window.ClearInterval(brw.g_timeCover);
	brw.g_timeCover = false;
};

//=================================================// Keyboard Callbacks

function on_key_up(vkey) {
	g_filterbox.on_key("up", vkey);
	// scroll keys up and down RESET (step and timers)
	brw.keypressed = false;
	cScrollBar.timerCounter = -1;
	cScrollBar.timerID && window.ClearTimeout(cScrollBar.timerID);
	cScrollBar.timerID = false;
	brw.repaint();
};


function on_key_down(vkey) {
	var mask = GetKeyboardMask();
	g_filterbox.on_key("down", vkey);
	var act_pls = g_active_playlist;

	if (mask == KMask.none) {
		switch (vkey) {
		case VK_F2:
			brw.showNowPlaying();
			break;
		case VK_F5:
			refresh_cover();
			break;
		case VK_TAB:
			break;
		case VK_BACK:
			if (cList.search_string.length > 0) {
				cList.inc_search_noresult = false;
				brw.tt_x = ((brw.w) / 2) - (((cList.search_string.length * 13) + (10 * 2)) / 2);
				brw.tt_y = brw.y + Math.floor((brw.h / 2) - 30);
				brw.tt_w = ((cList.search_string.length * 13) + (10 * 2));
				brw.tt_h = 60;
				cList.search_string = cList.search_string.substring(0, cList.search_string.length - 1);
				brw.repaint();
				cList.clear_incsearch_timer && window.ClearTimeout(cList.clear_incsearch_timer);
				cList.clear_incsearch_timer = false;
				cList.incsearch_timer && window.ClearTimeout(cList.incsearch_timer);
				cList.incsearch_timer = window.SetTimeout(function() {
					brw.incrementalSearch();
					window.ClearTimeout(cList.incsearch_timer);
					cList.incsearch_timer = false;
					cList.inc_search_noresult = false;
				}, 500);
			};
			break;
		case VK_ESCAPE:
		case 222:
			brw.tt_x = ((brw.w) / 2) - (((cList.search_string.length * 13) + (10 * 2)) / 2);
			brw.tt_y = brw.y + Math.floor((brw.h / 2) - 30);
			brw.tt_w = ((cList.search_string.length * 13) + (10 * 2));
			brw.tt_h = 60;
			cList.search_string = "";
			window.RepaintRect(0, brw.tt_y - 2, brw.w, brw.tt_h + 4);
			break;
		case VK_UP:
			if (brw.rowsCount > 0 && !brw.keypressed && !cScrollBar.timerID) {
				brw.keypressed = true;
				reset_cover_timers();
			};
			break;
		case VK_DOWN:
			if (brw.rowsCount > 0 && !brw.keypressed && !cScrollBar.timerID) {
				brw.keypressed = true;
				reset_cover_timers();
			};
			break;
		case VK_PGUP:
			if (brw.rowsCount > 0 && !brw.keypressed && !cScrollBar.timerID) {
				brw.keypressed = true;
				reset_cover_timers();
			};
			break;
		case VK_PGDN:
			if (brw.rowsCount > 0 && !brw.keypressed && !cScrollBar.timerID) {
				brw.keypressed = true;
				reset_cover_timers();
			};
			break;
		case VK_RETURN:
			// play/enqueue focused item
			break;
		case VK_END:
			if (brw.rowsCount > 0) {
			};
			break;
		case VK_HOME:
			if (brw.rowsCount > 0) {

			};
			break;
		case VK_DELETE:
			if (!plman.IsAutoPlaylist(act_pls)) {

			};
			break;
		};
	}
	else {
		switch (mask) {
		/*case KMask.shift:
			switch (vkey) {
			case VK_SHIFT:
				// SHIFT key alone
				break;
			case VK_UP:
				// SHIFT + KEY UP
				break;
			case VK_DOWN:
				// SHIFT + KEY DOWN
				break;
			};
			break;*/
		case KMask.ctrl:
			//if (vkey == 65) { // CTRL+A
			//};
			/*if (vkey == 66) { // CTRL+B
				cScrollBar.enabled = !cScrollBar.enabled;
				window.SetProperty("_DISPLAY: Show Scrollbar", cScrollBar.enabled);
				get_metrics();
				brw.repaint();
			};
			if (vkey == 88) { // CTRL+X
				if (!plman.IsAutoPlaylist(act_pls)) {

				};
			};
			if (vkey == 67) { // CTRL+C

			};
			if (vkey == 86) { // CTRL+V

			};*/
			if (vkey == 70) { // CTRL+F
				fb.RunMainMenuCommand("编辑/搜索");
			};
			if (vkey == 73) { // CTRL+I

			};
			if (vkey == 78) { // CTRL+N
				fb.RunMainMenuCommand("文件/新建播放列表");
			};
			if (vkey == 79) { // CTRL+O
				fb.RunMainMenuCommand("文件/打开...");
			};
			if (vkey == 80) { // CTRL+P
				fb.RunMainMenuCommand("文件/参数选项");
			};
			if (vkey == 83) { // CTRL+S
				fb.RunMainMenuCommand("文件/保存播放列表...");
			};
			break;
		case KMask.alt:
			switch (vkey) {
			case 65:// ALT+A
				fb.RunMainMenuCommand("视图/总在最上面");
				break;
			case 115://Alt+F4
				fb.RunMainMenuCommand("文件/退出");
				break;
			};
			break;
		};
	};
};

function on_char(code) {
		g_filterbox.on_char(code);
	if (g_filterbox.inputbox.edit) {
	}
	else {
		if (brw.list.Count > 0) {
			brw.tt_x = ((brw.w) / 2) - (((cList.search_string.length * 13) + (10 * 2)) / 2);
			brw.tt_y = brw.y + Math.floor((brw.h / 2) - 30);
			brw.tt_w = ((cList.search_string.length * 13) + (10 * 2));
			brw.tt_h = 60;
			if (code == 32 && cList.search_string.length == 0) return true; // SPACE Char not allowed on 1st char
			if (cList.search_string.length <= 20 && brw.tt_w <= brw.w - 20) {
				if (code > 31) {
					cList.search_string = cList.search_string + String.fromCharCode(code);
					brw.repaint();
					cList.clear_incsearch_timer && window.ClearTimeout(cList.clear_incsearch_timer);
					cList.clear_incsearch_timer = false;
					cList.incsearch_timer && window.ClearTimeout(cList.incsearch_timer);
					cList.incsearch_timer = window.SetTimeout(function() {
						brw.incrementalSearch();
						window.ClearTimeout(cList.incsearch_timer);
						cList.incsearch_timer = false;
					}, 500);
				};
			};
		};
	};
};

//=================================================// Playback Callbacks

function on_playback_stop(reason) {
	brw.playingIndex = -1;
	brw.repaint();
	g_metadb = null;
};

function on_playback_new_track(metadb) {
	g_metadb = metadb;
	if(ppt.sourceMode == 0) {
		try{
			playing_title = fb.TitleFormat("$if2(%title%,%filename%)").EvalWithMetadb(fb.GetNowPlaying());
		} catch (e) {};
		return;	
	}
	try {
		if (!ppt.locklibpl) {//pure playlist mode
			if (plman.PlayingPlaylist != plman.ActivePlaylist) {
				g_active_playlist = plman.ActivePlaylist = plman.PlayingPlaylist;
			};
			if(ppt.forceSorting){
				brw.nowplaying = plman.GetPlayingItemLocation();
				var gid = brw.getItemIndexFromTrackIndex(brw.nowplaying.PlaylistItemIndex);
				if (gid > -1) {
					if (ppt.showAllItem && gid == 0) gid += 1;
					brw.playingIndex = gid;
				};
			} else{
				var handle = fb.GetNowPlaying();
				brw.FindItemFromItemHandle(handle, true);
			}
		}
		else {
			var handle = fb.GetNowPlaying();
			if (fb.IsMetadbInMediaLibrary(handle)) {
				brw.FindItemFromItemHandle(handle, true);
			};
		};
	}
	catch (e) {};
	try{
		playing_title = fb.TitleFormat("$if2(%title%,%filename%)").EvalWithMetadb(fb.GetNowPlaying());
	} catch (e) {};
	window.Repaint();
};
/*
function on_playback_starting(cmd, is_paused) {};

//================// Library Callbacks

function on_library_items_added() {
	brw.populate(is_first_populate = false);
};

function on_library_items_removed() {
	brw.populate(is_first_populate = false);
};

function on_library_items_changed() {
	brw.populate(is_first_populate = false);
};
*/
//================// Playlist Callbacks

function on_playlists_changed() {
	//g_avoid_on_playlist_switch = true;
	if (plman.PlaylistCount > 0 && (plman.ActivePlaylist < 0 || plman.ActivePlaylist > plman.PlaylistCount - 1)) {
		plman.ActivePlaylist = 0;
	};
	if (!ppt.locklibpl && g_active_playlist != plman.ActivePlaylist) {
		g_active_playlist = plman.ActivePlaylist;
	};

	if (ppt.locklibpl) {
		if (plman.GetPlaylistName(lib_pl) != "媒体库") {
			ppt.locklibpl = false;
			g_active_playlist = plman.ActivePlaylist;
			window.NotifyOthers("lock_lib_playlist", ppt.locklibpl);
			window.SetProperty("_PROPERTY: Lock to Library playlist", ppt.locklibpl);
		}
	}
	// refresh playlists list
	pman.populate(exclude_active = false, reset_scroll = false);
};

function on_playlist_switch() {

	if (!ppt.locklibpl) g_active_playlist = plman.ActivePlaylist;
	if (ppt.sourceMode == 1 && !ppt.locklibpl) {
		scroll = scroll_ = 0;
		brw.populate();
	};

	// refresh playlists list
	pman.populate(exclude_active = false, reset_scroll = false);
};

function on_playlist_items_added(playlist_idx) {
	g_avoid_on_playlist_items_removed = false;
	if (ppt.sourceMode == 1) {
		if (playlist_idx == g_active_playlist) {
			brw.populate();
		};
	};
};

function on_playlist_items_removed(playlist_idx, new_count) {

	if (g_avoid_on_playlist_items_removed) return;

	if (playlist_idx == g_active_playlist && new_count == 0) scroll = scroll_ = 0;

	if (ppt.sourceMode == 1) {
		if (playlist_idx == g_active_playlist) {
			brw.populate();
		};
	};
};

function on_playlist_items_reordered(playlist_idx) {
	if (ppt.sourceMode == 1) {
		if (playlist_idx == g_active_playlist) {
			brw.populate();
		};
	};
};


function on_item_focus_change(playlist_idx, from, to) {
	if (g_avoid_on_item_focus_change) {
		g_avoid_on_item_focus_change = false;
		return;
	};
	if(!brw.list) return;
	if (ppt.sourceMode == 1) {
		if (playlist_idx == g_active_playlist) {
			if (ppt.forceSorting) {
				if (to > -1 && to < brw.list.Count) {
					var gid = brw.getItemIndexFromTrackIndex(to);
					if (gid > -1) {
						brw.showItemFromItemIndex(gid);
					};
				};
			}
			else {
				var handle = fb.GetFocusItem();
				brw.showItemFromItemHandle(handle);
			}
			//if(brw.selectedIndex > -1)
			//	brw.sendItemToPlaylist(brw.selectedIndex);
		};
	};
};

function on_metadb_changed() {
	brw.populate();
};

function on_playlist_items_selection_change() {
	if (ppt.sourceMode == 1) brw.repaint();
};

function on_focus(is_focused) {
	g_focus = is_focused;
	g_filterbox.on_focus(g_focus);
	if (!is_focused) {
		brw.repaint();
	};
};

//=================================================// Custom functions

function match(input, str) {
	var temp = "";
	input = input.toLowerCase();
	for (var j in str) {
		if (input.indexOf(str[j]) < 0) return false;
	};
	return true;
};

function process_string(str) {
	str_ = [];
	str = str.toLowerCase();
	while (str != (temp = str.replace("  ", " ")))
	str = temp;
	var str = str.split(" ").sort();
	for (var i in str) {
		if (str[i] != "") str_[str_.length] = str[i];
	};
	return str_;
};

function check_scroll(scroll___) {
	if (scroll___ < 0) scroll___ = 0;
	var g1 = brw.h - (brw.totalRowsVis * ppt.rowHeight);

	var end_limit = (brw.rowsCount * ppt.rowHeight) - (brw.totalRowsVis * ppt.rowHeight) - g1;
	if (scroll___ != 0 && scroll___ > end_limit) {
		scroll___ = end_limit;
	};
	return scroll___;
};

function g_sendResponse() {
	if (g_filterbox.inputbox.text.length == 0) {
		filter_text = "";
	}
	else {
		filter_text = g_filterbox.inputbox.text;
	};

	// filter in current panel
	brw.populate();
};

function on_font_changed() {
	get_font();
	get_metrics();
	get_images();
	get_images_loading();
	g_filterbox.inputbox.FontUpdte();
	g_filterbox.getImages();
	g_filterbox.setSize(cFilterBox.w, cFilterBox.h);
	brw.init_swbtn();
	brw.repaint();
};

function on_colours_changed() {
	get_colors();
	get_images();
	get_images_loading();
	if (brw)
		brw.scrollbar.setNewColors();
	g_filterbox.getImages();
	g_filterbox.reset_colors();
	brw.reset_swbtn();
	brw.repaint();
};

function on_notify_data(name, info) {
	switch (name) {
	case "color_scheme_updated":
		var c_ol_tmp = g_color_highlight;
		if(info) g_color_highlight = RGB(info[0], info[1], info[2]);
		else g_color_highlight = c_default_hl;
		if(g_color_highlight != c_ol_tmp){
			repaint_main1 = repaint_main2;
		}
		get_images_loading();
		break;
	case "show_Now_Playing":
		brw.showNowPlaying();
		break;
	case "set_dir_name":
		dir_cover_name = info;
		window.SetProperty("foobox.cover.folder.name", dir_cover_name);
		if(ppt.tagMode == 3 && ppt.genre_dir){
			g_image_cache = new image_cache;
			brw.populate();
		}
		break;
	case "scrollbar_width":
		sys_scrollbar = info;
		window.SetProperty("foobox.ui.scrollbar.system", sys_scrollbar);
		//if (!cScrollBar.enabled) break;
		cScrollBar.width = sys_scrollbar ? get_system_scrollbar_width() : 12*zdpi;
		cScrollBar.maxCursorHeight = sys_scrollbar ? 125*zdpi : 110*zdpi;
		get_metrics();
		brw.scrollbar.updateScrollbar();
		brw.scrollbar.setSize();
		brw.repaint();
		break;
	case "Sorting format change":
		ppt.forceSorting = (info == find_sorting()) ? true : false;
		break;
		case "Sorting format null":
		ppt.forceSorting = false;
		break;
	};
};

// ======================================================================================================================= //

function path_img(path) {
	var file_ext =path.substring(path.length - 4);
	if(file_ext == ".jpg" || file_ext == ".png") return true;
	else return false;
}

function check_cache(albumIndex) {
	var crc = brw.groups[albumIndex].cachekey;
	if (fso.FileExists(fb.ProfilePath + "cache\\CoverCache\\" + crc)) {
		return true;
	};
	return false;
};

function load_image_from_cache(crc) {
	if (fso.FileExists(fb.ProfilePath + "cache\\CoverCache\\" + crc)) { // image in folder cache
		var tdi = gdi.LoadImageAsync(window.ID, fb.ProfilePath + "cache\\CoverCache\\" + crc);
		return tdi;
	}
	else {
		return -1;
	};
};

function process_cachekey(str) {
	var str_return = "";
	str = str.toLowerCase();
	var len = str.length;
	for (var i = 0; i < len; i++) {
		var charcode = str.charCodeAt(i);
		if (charcode > 96 && charcode < 123) str_return += str.charAt(i);
		if (charcode > 47 && charcode < 58) str_return += str.charAt(i);
	};
	return str_return;
};

function reset_this_cache(idx, crc){
	if (fso.FileExists(fb.ProfilePath + "cache\\CoverCache\\" + crc)) {
		try {
			fso.DeleteFile(fb.ProfilePath + "cache\\CoverCache\\" + crc);
		}
		catch (e) {
			console.log("WSH Panel 错误: 图像缓存 [" + crc + "] 无法删除, 文件正在使用中,稍后重试或重载面板.");
		};
	};
	brw.groups[idx].tid = -1;
	brw.groups[idx].load_requested = 0;
	brw.groups[idx].save_requested = false;
	g_image_cache.reset(crc);
	brw.groups[idx].cover_img = null;
	brw.groups[idx].cover_type = null;
}

function refresh_cover() {
	g_image_cache = new image_cache;
	var total = brw.groups.length;
	for (var i = 0; i < total; i++) {
		brw.groups[i].tid = -1;
		brw.groups[i].load_requested = 0;
		brw.groups[i].save_requested = false;
		brw.groups[i].cover_img = null;
		brw.groups[i].cover_type = null;
	};
	brw.repaint();
}

on_load();

function on_load() {
	if (!fso.FolderExists(fb.ProfilePath + "cache")) fso.CreateFolder(fb.ProfilePath + "cache");
	if (!fso.FolderExists(fb.ProfilePath + "cache\\CoverCache")) fso.CreateFolder(fb.ProfilePath + "cache\\CoverCache");
};

function transfer_covertype(){
	switch (ppt.tagMode){
		case 1:
			__type = ppt.tagMode;
			break;
		case 2:
			__type = ppt.tagMode + ppt.artistMode;
			break;
		case 3:
			__type = ppt.tagMode + ppt.genre_dir + 1;
			break;
	}
	window.NotifyOthers("lib_cover_type", __type);
}

function find_sorting(){
	switch (ppt.tagMode){
		case 1:
			return _TFsorting[1 - ppt.albumMode];
			break;
		case 2:
			return _TFsorting[1 + ppt.artistMode];
			break;
		case 3:
			return _TFsorting[3 + ppt.genre_dir]; 
			break;
	}
}