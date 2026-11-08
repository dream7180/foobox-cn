//foobox https://github.com/dream7180; JSPlaylist http://br3tt.deviantart.com
window.DefinePanel('JSPlaylist', {author: 'Br3tt, dreamawake, always_beta(cn)', version: '1.3.2', features: {drag_n_drop: true} });
include(fb.ProfilePath + 'foobox\\js_common\\getconfig.js');
include(fb.ProfilePath + 'foobox\\js_common\\common.js');
include(fb.ProfilePath + 'foobox\\js_common\\JScommon.js');
include(fb.ProfilePath + 'foobox\\js_common\\JSinputbox.js');
include(fb.ProfilePath + 'foobox\\js_common\\Genre.js');
include(fb.ProfilePath + 'foobox\\js_panels\\jsplaylist\\WSHscrollbar.js');
include(fb.ProfilePath + 'foobox\\js_panels\\jsplaylist\\WSHheaderbar.js');
include(fb.ProfilePath + 'foobox\\js_panels\\jsplaylist\\WSHplaylist.js');
include(fb.ProfilePath + 'foobox\\js_panels\\jsplaylist\\WSHsettings.js');

var zdpi = 1;
var drawmode = window.DrawMode;
var follow_cursor = window.GetProperty("foobox.infoArt.follow.cursor", false);
var genre_cover_dir = fb.ProfilePath + "foobox\\images\\genre";
var config_dir = fb.ProfilePath + "foobox\\data\\";
var pv_db_path = config_dir + "pv.db"; // 面板数据库（layout/group/column 表）
function pv_db_open() {
	if (!utils.IsDirectory(config_dir)) utils.CreateFolder(config_dir);
	return utils.OpenDatabase(pv_db_path);
}
var dir_cover_name = window.GetProperty("foobox.cover.folder.name", "cover.jpg;folder.jpg");
var cache_size = window.GetProperty("foobox.cover.cache.size", 250);
var queue_pl_on = window.GetProperty("Playlist: Turn on queue playlist", false);
let dark_mode = 0;
let tab_collapse;
// GLOBALS
var g_script_version = "9.0";
var g_textbox_tabbed = false;
var g_init_window = true;
var g_left_click_hold = false;
var g_selHolder = null;
var g_seconds = 0;
var	repaint_main1 = true,
	repaint_main2 = true,
	g_timer = false;
var repaint_cover1 = true,
	repaint_cover2 = false;
var g_mouse_wheel_timer = false;
//
var setting_init = false;
// drag'n drop from windows system
var g_dragndrop_status = false;
var g_dragndrop_bottom = false;
// font vars
var g_fname, g_fsize;
var g_font = null;
var g_font_b = null;
var g_font_group1 = null;
var g_font_group2 = null;
var g_font_ud = null;
// color vars
var g_color_normal_bg = 0;
var g_color_star = 0;
var g_color_selected_bg = 0;
var g_color_selected_bg2 = 0;
var g_color_normal_txt = 0;
var g_color_selected_txt = 0;
var g_color_highlight = 0;
var g_color_status = 0;
var c_default_hl = 0;
var c_divline = 0;
var g_color_playing_txt = c_white;
var g_color_line, g_color_line_div, g_group_header_bg, g_group_header_div;

// main window vars
var g_delay_refresh_items = false;
var g_avoid_on_item_focus_change = false;

//albumart
var albumart_id, cache_subdir, crc_set = {};
var cover_worker = null;
var cover_cache_folder = fb.ProfilePath + "foobox\\data\\albumart_cache\\";

function get_table_name(subdir) {
	return subdir.replace(/\\/g, "");
}

var g_z2, g_z3, g_z4, g_z5, g_z6, g_z7, g_z8, g_z10, g_z16, g_z30;
var ww = 0, wh = 0;
var mouse_x = 0,
	mouse_y = 0;
var clipboard = {
	selection: null
};

// WSH statistics globals
var g_track_type;
var g_group_id_focused = 0; // 当前焦点分组 id（主文件与 WSHplaylist.js 共享）
var repeat_pls = window.GetProperty("PLAYBACK: Repeat playlists", false);

//=================================================// main properties / parameters
var properties = {
	enableTouchControl: window.GetProperty("SYSTEM.Enable Touch Scrolling", false),
	defaultPlaylistItemAction: window.GetProperty("SYSTEM.Default Playlist Action", 1),
	settingspanel: false,
	smoothscrolling: window.GetProperty("CUSTOM Enable Smooth Scrolling", true),
	selectionmenu: window.GetProperty("CUSTOM Enable Selection Menu", true),
	cursor_min: 25,
	cursor_max: 110,
	repaint_rate: 20,
	max_columns: 24,
	max_patterns: 25
};

var layout = {
	ids: ["默认布局"],
	uid: "默认布局",
	playlistName: "",
	index: 0,
	gopts: [],
	setting_idx: 0,
	config: [],
	pattern_idx: 0,
	showCover: true,
	autocollapse: false,
	collapsedHeight: 2,
	expandedHeight: 1,
	collapseGroupsByDefault: 0,
	showgroupheaders: 1,
	enableExtraLine: 0,
	columnWidth: []
}

// Singleton for Images
var images = {
	playing_ico: null,
	selected_ico: null,
	mood_ico: null,
	sortdirection: null,
	nocover: null,
	beam: null
};

// Fonts / Dpi / Colors / Images init
var InfoPane = null; // 信息面板实例（on_init 创建）
var g_font_2 = null; // 次要字体（WSHplaylist.js 绘制副标题用）
var fn_ico1 = null, fn_ico2 = null; // FontAwesome 图标字体

function system_init() {
	get_font();
	get_colors();
	get_metrics();
	get_images_static();
	get_img_nocover();
	get_images_color();
};

// Titleformat field
var tf_group_key = null;
// tf fields used in incremental search feature
var tf_artist = fb.TitleFormat("$if(%length%,%artist%,'流媒体')");
var tf_albumartist = fb.TitleFormat("$if(%length%,%album artist%,'流媒体')");
var tf_bitrate = fb.TitleFormat("$if(%__bitrate_dynamic%,$if(%el_isplaying%,%__bitrate_dynamic%'K',$if($stricmp($left(%codec_profile%,3),'VBR'),%codec_profile%,%__bitrate%'K')),$if($stricmp($left(%codec_profile%,3),'VBR'),%codec_profile%,%__bitrate%'K'))");
var tf_bitrate_playing = fb.TitleFormat("$if(%__bitrate_dynamic%,$if(%_isplaying%,$select($add($mod(%_time_elapsed_seconds%,2),1),%__bitrate_dynamic%,%__bitrate_dynamic%),%__bitrate_dynamic%),%__bitrate%)'K'");
// Sort pattern
var sort_pattern_albumartist = "%album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%";
var sort_pattern_artist = "%artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%";
var sort_pattern_album = "%album% | %discnumber% | %tracknumber% | %title%";
var sort_pattern_tracknumber = "%tracknumber% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %title%";
var sort_pattern_title = "%title% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber%";
var sort_pattern_path = "$directory_path(%path%) | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%";
var sort_pattern_date = "%date% | %album artist% | %album% | %discnumber% | %tracknumber% | %title%";
var sort_pattern_genre = "%genre% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%";
var sort_pattern_rating = "%rating% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%";
var sort_pattern_bitrate = "%bitrate% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%";
var sort_pattern_modified = "%last_modified% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%";
var sort_pattern_playcount = "$if2(%play_count%,0) | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%";
var sort_pattern_codec = "%codec% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%";
var sort_pattern_queue = "%queue_index% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %title%";
// Singletons
var cRow = {
	default_playlist_h: 33,
	playlist_h: 33,
	extra_line_h: 16,
	settings_h: 30
};
cRow.extra_line_h = Math.max(Math.round(cRow.playlist_h/2), 12);

var p = {
	headerBar: null,
	list: null,
	settings: null,
	timer_onKey: false
};

var cTouch = {
	down: false,
	y_start: 0,
	y_end: 0,
	down_id: 0,
	up_id: 0
};

var cSettings = {
	visible: false,
	topBarHeight: 50,
	tabPaddingWidth: 2,
	rowHeight: cRow.settings_h,
	wheel_timer: false
};

var cHeaderBar = {
	height: 26,
	borderWidth: 2,
	timerAutoHide: false,
	sortRequested: false,
	lock_hint_shown: false // 锁定列表排序提示：每次切换播放列表重置，避免重复弹窗
};

var cScrollBar = {
	width: 12,
	timerID: false,
	parentObjectScrolling: null,
	timerID1: false,
	timerID2: false,
	timerCounter: 0,
	timer_repaint: false
};

var cTrack = {
	height: cRow.playlist_h
};

var cGroup = {
	collapsed_height: 2,
	expanded_height: 1,
	default_count_minimum: window.GetProperty("*GROUP: Minimum number of rows in a group", 0),
	count_minimum: window.GetProperty("*GROUP: Minimum number of rows in a group", 0),
	count_minimum_pre: 0
};

var cover = {
	show: true,
	keepaspectratio: window.GetProperty("CUSTOM.Cover keep ration aspect", true),
	load_timer: false,
	repaint_timer: false,
	margin: 2,
	w: 0,
	h: 0,
	previous_max_size: -1,
	preload_timer: false,
	resized: false
};

var cList = {
	search_string: "",
	incsearch_font: null,
	inc_search_noresult: false,
	clear_incsearch_timer: false,
	incsearch_timer: false,
	repaint_timer: false,
	scrollstep: 3,
	touchstep: window.GetProperty("SYSTEM.Playlist Touch Step", 3),
	scroll_timer: false,
	scroll_delta: cTrack.height,
	scroll_direction: 1,
	scroll_step: Math.floor(cTrack.height / 3),
	scroll_div: 2,
	borderWidth: 2,
	borderWidth_half: 1,
	beam_timer: false,
	addToQueue_timer: false
};
var scrollstep_org = cList.scrollstep;

var dragndrop = {
	enabled: true,
	contigus_sel: null,
	drag_id: -1,
	drop_id: -1,
	timerID: false,
	clicked: false,
	leave_flag: false
};

var columns = {
	rating: false,
	rating_x: 0,
	rating_w: 0,
	rating_drag: false,
	mood: false,
	mood_x: 0,
	mood_w: 0,
	mood_drag: false
};

// Smoother scrolling in playlist

function set_scroll_delta() {
	var maxOffset = (p.list.totalRows > p.list.totalRowVisible ? p.list.totalRows - p.list.totalRowVisible : 0);
	if (p.list.offset > 0 && p.list.offset < maxOffset) {
		if (!cList.scroll_timer) {
			cList.scroll_delta = cTrack.height;
			if (!(cList.scroll_direction > 0 && p.list.offset == 0) && !(cList.scroll_direction < 0 && p.list.offset >= p.list.totalRows - p.list.totalRowVisible)) {
				cList.scroll_timer = window.SetInterval(function() {
					cList.scroll_step = Math.round(cList.scroll_delta / cList.scroll_div);
					cList.scroll_delta -= cList.scroll_step;
					if (cList.scroll_delta <= 1) {
						window.ClearInterval(cList.scroll_timer);
						cList.scroll_timer = false;
						cList.scroll_delta = 0;
					};
					full_repaint();
				}, 30);
			};
		}
		else {
			cList.scroll_delta = cTrack.height;
		};
	};
};

// ============================================================
// Cover Worker (read-only): reads albumart.db + loads cover images
// ============================================================
var cover_worker_source = `
var db = null;

function open_db(path) {
	try { db = utils.OpenDatabase(path); } catch (e) { db = null; }
}

function db_keys(table) {
	if (!db) return [];
	try {
		var rows = db.Query('SELECT crc FROM "' + table + '"');
		var keys = [];
		for (var i = 0; i < rows.length; i++) keys.push(rows[i].crc);
		return keys;
	} catch (e) { console.log('cover worker db_keys error (table: ' + table + '): ' + e.message); return []; }
}

// 抓取原生封面（genre_dir 文件或专辑封面），并缩放到 cacheSize
async function fetch_native_art(msg) {
	var art = null;
	if (msg.mode == 'genre_dir') {
		if (msg.folderPath && msg.dirCoverName) {
			var dc = msg.dirCoverName.split(';');
			for (var j = 0; j < dc.length; j++) {
				var fp = msg.folderPath + dc[j];
				if (utils.FileExists(fp)) {
					art = gdi.Image(fp);
					if (art != null) break;
				}
			}
		} else if (msg.genreImagePath) {
			art = gdi.Image(msg.genreImagePath);
		}
	} else {
		var result = await utils.GetAlbumArtAsyncV2(0, msg.handle, msg.artId, false);
		art = result.image;
	}
	if (art) {
		var s = Math.min(msg.cacheSize / art.Width, msg.cacheSize / art.Height);
		if (s < 1) {
			var w = Math.floor(art.Width * s);
			var h = Math.floor(art.Height * s);
			art = art.Resize(w, h, 2);
		}
	}
	return art;
}

onmessage = async function (event) {
	var msg = event.data;
	switch (msg.cmd) {
	case 'init':
		open_db(msg.dbPath);
		postMessage({ cmd: 'init_done' });
		break;
	case 'load_keys':
		postMessage({ cmd: 'keys', table: msg.table, keys: db_keys(msg.table) });
		break;
	case 'preload_cover':
		try {
			if (utils.FileExists(msg.path)) {
				var im = gdi.Image(msg.path);
				if (im) postMessage({ cmd: 'cached_image', albumIndex: msg.albumIndex, crc: msg.crc, image: im });
				else postMessage({ cmd: 'preload_miss', albumIndex: msg.albumIndex, crc: msg.crc });
			} else {
				postMessage({ cmd: 'preload_miss', albumIndex: msg.albumIndex, crc: msg.crc });
			}
		} catch (e) {
			postMessage({ cmd: 'preload_miss', albumIndex: msg.albumIndex, crc: msg.crc });
		}
		break;
	case 'get_cover':
		try {
			if (utils.FileExists(msg.path)) {
				var cached = gdi.Image(msg.path);
				postMessage({ cmd: 'cover_image', albumIndex: msg.albumIndex, crc: msg.crc, image: cached, fromCache: true });
			} else {
				var art = await fetch_native_art(msg);
				postMessage({ cmd: 'cover_image', albumIndex: msg.albumIndex, crc: msg.crc, image: art, fromCache: false });
			}
		} catch (e) {
			postMessage({ cmd: 'cover_image', albumIndex: msg.albumIndex, crc: msg.crc, image: null, fromCache: false });
		}
		break;
	case 'reset_cover':
		// 右键“刷新本封面缓存”：删除旧缓存（文件+DB记录）→ 重新抓取原生封面 → 保存到缓存
		try {
			if (utils.FileExists(msg.path)) { try { utils.RemovePath(msg.path); } catch (e) {} }
			if (db) { try { db.Exec('DELETE FROM "' + msg.table + '" WHERE crc = ?', [msg.crc]); } catch (e) {} }
			var art2 = await fetch_native_art(msg);
			if (art2) {
				try {
					art2.SaveAs(msg.path, 'image/jpeg');
					if (db) db.Exec('INSERT OR IGNORE INTO "' + msg.table + '" (crc) VALUES (?)', [msg.crc]);
				} catch (e) {}
			}
			postMessage({ cmd: 'cover_reset', albumIndex: msg.albumIndex, crc: msg.crc, image: art2 });
		} catch (e) {
			postMessage({ cmd: 'cover_reset', albumIndex: msg.albumIndex, crc: msg.crc, image: null });
		}
		break;
	}
};
`;

function create_cover_worker() {
	cover_worker = new Worker(cover_worker_source, 'jsplaylist-cover-worker');
	cover_worker.onmessage = function (event) {
		var msg = event.data;
		switch (msg.cmd) {
		case 'keys':
			crc_reset(msg.keys || []);
			// 缓存键就绪后按当前可见窗口预加载封面（原来的 setList 调用并不存在）
			if (p.list && p.list.preload_cover_window) p.list.preload_cover_window();
			break;
		case 'cached_image':
			g_image_cache.set(msg.crc, msg.image);
			if (p.list && p.list.groups && msg.albumIndex >= 0 && msg.albumIndex < p.list.groups.length) {
				var grp2 = p.list.groups[msg.albumIndex];
				if (grp2 && grp2.cachekey == msg.crc && grp2.cover_img == null) {
					grp2.cover_img = msg.image;
					cover_repaint();
				}
			}
			break;
		case 'preload_miss':
			if (p.list && p.list.groups && msg.albumIndex >= 0 && msg.albumIndex < p.list.groups.length) {
				var grp3 = p.list.groups[msg.albumIndex];
				if (grp3 && grp3.cachekey == msg.crc && grp3.cover_img == null) {
					grp3.load_requested = 0;
				}
			}
			break;
		case 'cover_image':
			var grp = (p.list && p.list.groups && msg.albumIndex >= 0 && msg.albumIndex < p.list.groups.length) ? p.list.groups[msg.albumIndex] : null;
			if (grp) {
				if (msg.image) {
					grp.cover_img = msg.image;
					g_image_cache.set(msg.crc, msg.image);
				} else {
					// No cover found (cached or native) — show nocover immediately
					grp.cover_img = images.nocover;
				}
				cover_repaint();
			}
			break;
		case 'cover_reset':
			// “刷新本封面缓存”完成：更新内存缓存与视图
			var grpR = (p.list && p.list.groups && msg.albumIndex >= 0 && msg.albumIndex < p.list.groups.length) ? p.list.groups[msg.albumIndex] : null;
			if (msg.image) {
				g_image_cache.set(msg.crc, msg.image);
				crc_add(msg.crc);
				if (grpR && grpR.cachekey == msg.crc) {
					grpR.cover_img = msg.image;
					grpR.load_requested = 1;
				}
			} else {
				g_image_cache.remove(msg.crc);
				if (grpR && grpR.cachekey == msg.crc) {
					grpR.cover_img = images.nocover;
					grpR.load_requested = 1;
				}
			}
			cover_repaint();
			break;
		}
	};
	cover_worker.onerror = function (event) {
		console.log('JSPlaylist cover worker error: ' + event.message);
	};
	cover_worker.postMessage({ cmd: 'init', dbPath: config_dir + 'albumart.db' });
}

// Send a cover request to the worker (read-only: cache lookup + native art fetch, no save)
function request_cover(albumIndex) {
	var grp = p.list.groups[albumIndex];
	var table = get_table_name(cache_subdir);
	var msg = {
		cmd: 'get_cover',
		albumIndex: albumIndex,
		crc: grp.cachekey,
		table: table,
		path: cover_cache_folder + cache_subdir + grp.cachekey + '.jpg',
		cacheSize: cache_size
	};
	if (layout.pattern_idx == 4) {
		msg.mode = 'genre_dir';
		var genre = fb.TitleFormat("%genre%").EvalWithMetadb(grp.metadb);
		msg.genreImagePath = genre_cover_dir + "\\" + GetGenre(genre) + ".jpg";
	} else if (layout.pattern_idx == 5) {
		msg.mode = 'genre_dir';
		msg.folderPath = fb.TitleFormat("$directory_path(%path%)\\").EvalWithMetadb(grp.metadb);
		msg.dirCoverName = dir_cover_name;
	} else {
		msg.mode = 'album';
		msg.handle = grp.metadb;
		msg.artId = albumart_id;
	}
	cover_worker.postMessage(msg);
}

// 计算单个 handle 所属分组的 cachekey（与 WSHplaylist.js oGroup 构造逻辑一致）
function get_cachekey_for_handle(handle) {
	return utils.CRC32(get_group_crc_tf().EvalWithMetadb(handle));
}

// 右键菜单“刷新本封面缓存”：按选中曲目算出所属分组（去重），
// 删除其缓存封面（文件+albumart.db记录）后由 worker 重新抓取原生封面并写库
function reset_cover_from_selection(handleList) {
	if (!cover_worker || !handleList || handleList.Count == 0) return;
	var done = [];
	for (var i = 0; i < handleList.Count; i++) {
		var handle = handleList[i];
		var crc = get_cachekey_for_handle(handle);
		if (done.indexOf(crc) > -1) continue;
		done.push(crc);
		// 当前视图内该分组的显示复位（回执到达后重新赋图并重绘）
		var albumIndex = -1;
		if (p.list && p.list.groups) {
			for (var g = 0; g < p.list.groups.length; g++) {
				if (p.list.groups[g].cachekey == crc) { albumIndex = g; break; }
			}
		}
		if (albumIndex >= 0) {
			var grp = p.list.groups[albumIndex];
			grp.cover_img = null;
			grp.load_requested = 1; // 等待 cover_reset 回执，避免 hit() 并发请求
		}
		var msg = {
			cmd: 'reset_cover',
			albumIndex: albumIndex,
			crc: crc,
			table: get_table_name(cache_subdir),
			path: cover_cache_folder + cache_subdir + crc + '.jpg',
			cacheSize: cache_size
		};
		if (layout.pattern_idx == 4) {
			msg.mode = 'genre_dir';
			msg.genreImagePath = genre_cover_dir + "\\" + GetGenre(fb.TitleFormat("%genre%").EvalWithMetadb(handle)) + ".jpg";
		} else if (layout.pattern_idx == 5) {
			msg.mode = 'genre_dir';
			msg.folderPath = fb.TitleFormat("$directory_path(%path%)\\").EvalWithMetadb(handle);
			msg.dirCoverName = dir_cover_name;
		} else {
			msg.mode = 'album';
			msg.handle = handle;
			msg.artId = albumart_id;
		}
		cover_worker.postMessage(msg);
	}
}

function crc_reset(keys) {
	crc_set = {};
	if (keys) {
		for (var i = 0; i < keys.length; i++) crc_set[keys[i]] = 1;
	};
};

function crc_has(crc) {
	return crc_set[crc] === 1;
};

function crc_add(crc) {
	crc_set[crc] = 1;
};

image_cache = function() {
	this._cachelist = {};
	this._cache_order = [];
	this._cache_limit = 150; // 最多保留 150 张解码后的封面，减少来回滚动时的重复解码

	// 淘汰封面时同步清理所有引用该 crc 的分组，避免 grp.cover_img 长期占用位图
	this._drop_group_img = function(crc) {
		if (!p.list || !p.list.crc_to_groups) return;
		var arr = p.list.crc_to_groups[crc];
		if (!arr) return;
		for (var i = 0; i < arr.length; i++) {
			var grp = p.list.groups[arr[i]];
			if (grp && grp.cachekey == crc) {
				grp.cover_img = null;
				grp.load_requested = 0;
			};
		};
	};

	this.set = function(crc, img) {
		if (!img) return;
		if (typeof this._cachelist[crc] == "undefined") this._cache_order.push(crc);
		this._cachelist[crc] = img;
		while (this._cache_order.length > this._cache_limit) {
			var old = this._cache_order.shift();
			if (typeof this._cachelist[old] == "undefined") continue;
			delete this._cachelist[old];
			this._drop_group_img(old);
		};
	};

	this.remove = function(crc) {
		if (typeof this._cachelist[crc] == "undefined") return;
		delete this._cachelist[crc];
		var pos = this._cache_order.indexOf(crc);
		if (pos > -1) this._cache_order.splice(pos, 1);
		this._drop_group_img(crc);
	};

	this.hit = function(albumIndex) {
		var grp = p.list.groups[albumIndex];
		if (grp.load_requested) return;
		var _crc = grp.cachekey;
		var img = this._cachelist[_crc];
		if (typeof img == "undefined" || img == null) {
			grp.load_requested = 1;
			var _delay = (layout.pattern_idx >= 4 ? 4 : 8);
			window.SetTimeout(function () {
				try { request_cover(albumIndex); } catch (e) {}
			}, (g_mouse_wheel_timer || cScrollBar.timerID2 ? _delay * 3 : _delay));
		} else {
			grp.load_requested = 1;
			grp.cover_img = img;
		}
		return img;
	};

	this.getit = function(image, albumIndex) {
		if (image) {
			try { this.set(p.list.groups[albumIndex].cachekey, image); } catch (e) {}
		} else image = null;
		return image;
	};

	this.preload = function(albumIndex) {
		var grp = p.list.groups[albumIndex];
		var img = this._cachelist[grp.cachekey];
		if (img) {
			grp.load_requested = 1;
			grp.cover_img = img;
		} else if (crc_has(grp.cachekey)) {
			grp.load_requested = 1;
			cover_worker.postMessage({
				cmd: 'preload_cover',
				albumIndex: albumIndex,
				crc: grp.cachekey,
				path: cover_cache_folder + cache_subdir + grp.cachekey + '.jpg'
			});
		}
		// else: not cached — leave load_requested=0 so hit() fetches native art when visible
	};
};
var g_image_cache = new image_cache;

//==================Cover tools
function reset_cover_timers() {
	cover.load_timer && window.ClearTimeout(cover.load_timer);
	cover.load_timer = false;
};

function full_repaint() {
	repaint_main1 = repaint_main2;
};

function cover_repaint() {
	repaint_cover1 = repaint_cover2;
};

function resize_panels() {
	// list row height
	if (layout.enableExtraLine) {
		cRow.playlist_h = cRow.default_playlist_h + cRow.extra_line_h;
	}
	else {
		cRow.playlist_h = cRow.default_playlist_h;
	};
	cTrack.height = z(cRow.playlist_h);
	var list_h = wh - cHeaderBar.height - cHeaderBar.borderWidth;
	// set Size of Header Bar
	if (p.headerBar) {
		p.headerBar.setSize(0, 0, ww, cHeaderBar.height);
		p.headerBar.calculateColumns();
	}
	// set Size of List
	p.list.setSize(0, (wh - list_h), ww, list_h);
	if (!g_init_window) {
		p.list.setItems(2);
	};
	// set Size of scrollbar
	p.scrollbar.setSize(p.list.x + p.list.w - cScrollBar.width, p.list.y, cScrollBar.width, p.list.h);
	p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
	// set Size of Settings
	if (cSettings.visible) p.settings.setSize(0, 0, ww, wh);
};

function get_metrics() {
	g_z2 = z(2);
	g_z3 = z(3);
	g_z4 = z(4);
	g_z5 = z(5);
	g_z6 = z(6);
	g_z7 = z(7);
	g_z8 = z(8);
	g_z10 = z(10);
	g_z16 = z(16);
	g_z30 = z(30);
	properties.cursor_min = 25*zdpi;
	properties.cursor_max = cfg_map.sys_scrollbar ? 125*zdpi : 110*zdpi;
	cSettings.topBarHeight = z(50);
	// 注：字号基值取自 z(30/14)≈z(2)，历史遗留表达式，行为保持不变
	cSettings.tabPaddingWidth = z(30/ 14);
	cSettings.rowHeight = Math.round(cRow.settings_h * zdpi);
	cHeaderBar.height = z(26);
	cScrollBar.width = cfg_map.sys_scrollbar ? get_system_scrollbar_width() : z(12);
	cTrack.height = z(cRow.playlist_h);
}

//=================================================// Init
system_init();
function on_init() {
	window.DlgCode = DLGC_WANTALLKEYS;
	window.MinWidth = cSettings.topBarHeight;
	window.MinHeight = cSettings.topBarHeight;
	if (!utils.IsDirectory(fb.ProfilePath + "foobox\\data")) {
		utils.CreateFolder(fb.ProfilePath + "foobox\\data");
	}
	// 播放队列与队列列表交由 foobar 自身维护，on_init 不做任何清空：
	// 面板重载（切主题/改布局/脚本重载）保留用户队列；重启后队列必为空，
	// 残留的队列列表会在下一次队列变化时由 on_playback_queue_changed 自动清空重填

	create_cover_worker();
	get_misccfg();
	layout.playlistName = plman.GetPlaylistName(plman.ActivePlaylist);
	get_layout();
	tab_collapse = layout.collapseGroupsByDefault;

	if (!layout.showgroupheaders) {
		cGroup.collapsed_height = 0;
		cGroup.expanded_height = 0;
	};
	
	InfoPane = new oInfoPane();
	p.list = new oList("p.list", plman.ActivePlaylist);
	// 同步队列计数：面板重载/重建后右键菜单的「显示播放队列」才能正常出现
	p.list.queue_total = plman.GetPlaybackQueueContents().length;
	p.headerBar = new oHeaderBar();
	p.headerBar.initColumns();
	p.scrollbar = new oScrollbar( /*cScrollBar.themed*/ );
	p.settings = new oSettings();

	if (!g_timer) {
		g_timer = window.SetInterval(function() {
			if (!window.IsVisible) return;
			if (repaint_main1 == repaint_main2) {
				repaint_main2 = !repaint_main1;
				repaint_cover2 = !repaint_cover1;
				window.Repaint();
			} else if(repaint_cover1 == repaint_cover2){
				repaint_cover2 = !repaint_cover1;
				if (!g_mouse_wheel_timer && !cScrollBar.timerID2 && !cList.repaint_timer) {
					var bigger_grp_height = Math.max(layout.expandedHeight, layout.collapsedHeight);
					if (p.headerBar.columns[0].percent > 0) {
						var cw = cover.margin + p.headerBar.columns[0].w;
					} else if (cover.show) {
						var cw = cover.margin + (cTrack.height * bigger_grp_height);
					}
					window.RepaintRect(p.list.x, p.list.y, cw, p.list.h);
				}
			}
		}, properties.repaint_rate);
	}
};
on_init();

// OnSize

function on_size() {
	ww = window.Width;
	wh = window.Height;
	if (!ww || !wh) return;
	resize_panels();

	// Set the empty rows count in playlist setup for cover column size!
	get_grprow_minimum(p.headerBar.columns[0].w);

	if (g_init_window) {
		update_playlist(layout.collapseGroupsByDefault);
		g_init_window = false;
	} else {
		if(p.headerBar.columns[0].w > 0 && cGroup.count_minimum != cGroup.count_minimum_pre) update_playlist(tab_collapse, 2);
	}
	cover.previous_max_size = p.headerBar.columns[0].w;
};

//=================================================// OnPaint

function on_paint(gr) {
	if (!ww) return true;
	if (!cSettings.visible) {
		gr.FillSolidRect(0, p.list.y, ww, wh - p.list.y, g_color_normal_bg);
		// List
		if (p.list) {
			if (p.list.count > 0) {
				p.list && p.list.draw(gr);
				// scrollbar
				if (p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
					p.scrollbar.visible = true;
					p.scrollbar.draw(gr);
				}
				else {
					p.scrollbar.visible = false;
				};
				// draw flashing beam if scroll max reached on mouse wheel! (android like effect)
				if (p.list.beam > 0) {
					var beam_h = Math.floor(cTrack.height * 7 / 4);
					var alpha = (p.list.beam_alpha <= 255 ? p.list.beam_alpha : 255);
					switch (p.list.beam) {
					case 1:
						// top beam
						gr.DrawImage(images.beam, p.list.x, p.list.y - cHeaderBar.borderWidth * 10, p.list.w, beam_h - cHeaderBar.borderWidth, 0, 0, images.beam.Width, images.beam.Height, 180, alpha);
						break;
					case 2:
						// bot beam
						gr.DrawImage(images.beam, p.list.x, p.list.y + p.list.h - beam_h + cHeaderBar.borderWidth * 10, p.list.w, beam_h, 0, 0, images.beam.Width, images.beam.Height, 0, alpha);
						break;
					};
				};
			}
			else {
				var z20 = z(20);
				if (plman.PlaylistCount > 0) {
					var text_top = layout.playlistName;
					var text_bot = "空列表";
				}
				else {
					var text_top = "从播放列表管理面板创建一个新的播放列表开始！";
					var text_bot = "当前无播放列表";
				};
				if (text_top.substr(0, 4) == "搜索 [") {
					var search_text = text_top.substr(4, text_top.length - 5);
					gr.GdiDrawText("搜索 \"" + search_text + "\" 无结果", g_font_blank, g_color_normal_txt, 0, 0 - z20, ww, wh, cc_txt);
					gr.GdiDrawText(text_bot, g_font_group2, g_color_normal_txt, 0, 0 + z20, ww, wh, cc_txt);
					gr.FillGradRect(0, Math.floor(wh / 2), ww, 1, 0, 0, c_divline, 0.5);
				} else {
					// if empty playlist, display text info
					gr.GdiDrawText(text_top, g_font_blank, g_color_normal_txt, 0, 0 - z20, ww, wh, cc_txt);
					gr.GdiDrawText(text_bot, g_font_group2, g_color_normal_txt, 0, 0 + z20, ww, wh, cc_txt);
					gr.FillGradRect(0, Math.floor(wh / 2), ww, 1, 0, 0, c_divline, 0.5);
				};
			};
		};
		gr.FillSolidRect(0, 0, ww, p.list.y, g_color_normal_bg);
		gr.FillSolidRect(0, p.list.y, ww, 1, g_color_line_div);
		p.headerBar && p.headerBar.drawColumns(gr);
		if (p.headerBar.borderDragged && p.headerBar.borderDraggedId >= 0) {
			// all borders
			var fin = p.headerBar.borders.length;
			for (var b = 0; b < fin; b++) {
				var lg_x = p.headerBar.borders[b].x - 2;
				var lg_w = p.headerBar.borders[b].w;
				var segment_h = g_z5;
				var gap_h = g_z5;
				if (b == p.headerBar.borderDraggedId) {
					var d = ((mouse_x / g_z10) - Math.floor(mouse_x / g_z10)) * g_z10; // give a value between [0;9]
				}
				else {
					d = 5;
				};
				var ty = 0;
				for (var lg_y = p.list.y; lg_y < p.list.y + p.list.h + segment_h; lg_y += segment_h + gap_h) {
					ty = lg_y - segment_h + d;
					var th = segment_h;
					if (ty < p.list.y) {
						th = th - Math.abs(p.list.y - ty);
						ty = p.list.y;
					}
					if (b == p.headerBar.borderDraggedId) {
						gr.FillSolidRect(lg_x, ty, lg_w, th, g_color_normal_txt & 0x32ffffff);
					}
					else {
						gr.FillSolidRect(lg_x, ty, lg_w, th, g_color_normal_txt & 0x16ffffff);
					};
				};
			};
		};
		// Incremental Search Display
		if (cList.search_string.length > 0) {
			var string_w = gr.CalcTextWidth(cList.search_string, cList.incsearch_font);
			gr.SetSmoothingMode(2);
			p.list.tt_w = Math.round(string_w + 24 * zdpi);
			p.list.tt_h = cTrack.height * 1.5;
			p.list.tt_x = Math.floor((p.list.w - p.list.tt_w) / 2);
			p.list.tt_y = p.list.y + Math.floor((p.list.h - p.list.tt_h) / 2);;
			gr.FillRoundRect(p.list.tt_x, p.list.tt_y, p.list.tt_w, p.list.tt_h, 5, 5, RGBA(0, 0, 0, 150));
			gr.DrawRoundRect(p.list.tt_x-1, p.list.tt_y-1, p.list.tt_w+2, p.list.tt_h+2, 5, 5, 1.0, RGBA(0, 0, 0, 180));
			try {
				gr.GdiDrawText(cList.search_string, cList.incsearch_font, c_black, p.list.tt_x + 1, p.list.tt_y + 1, p.list.tt_w, p.list.tt_h, ccf_txt);
				gr.GdiDrawText(cList.search_string, cList.incsearch_font, cList.inc_search_noresult ? RGB(255, 70, 70) : RGB(250, 250, 250), p.list.tt_x, p.list.tt_y, p.list.tt_w, p.list.tt_h, ccf_txt);
			}
			catch (e) {};
		};
	}
	else {
		p.settings && p.settings.draw(gr);
	};
};

// Mouse Callbacks
function on_mouse_lbtn_down(x, y) {

	if (properties.enableTouchControl) {
		cTouch.up_id = -1;
		if (cSettings.visible) {
			cTouch.down = true;
			cTouch.y_start = y;
		}
		else {
			if (p.list.isHoverObject(x, y) && !p.scrollbar.isHoverObject(x, y)) {
				cTouch.down = true;
				cTouch.y_start = y;
			};
		};
	};

	g_left_click_hold = true;

	// check settings
	if (cSettings.visible) {
		p.settings.on_mouse("down", x, y);
	}
	else {
		cover.previous_max_size = p.headerBar.columns[0].w;

		// check list
		p.list.check("down", x, y);
		if (p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
			p.scrollbar.check("down", x, y);
		};

		// check scrollbar scroll on click above or below the cursor
		if (p.scrollbar.hover && !p.scrollbar.cursorDrag) {
			var scrollstep = p.list.totalRowVisible;
			if (y < p.scrollbar.cursorPos) {
				if (!p.list.buttonclicked && !cScrollBar.timerID1) {
					p.list.buttonclicked = true;
					p.list.scrollItems(1, scrollstep);
					cScrollBar.timerID1 = window.SetTimeout(function() {
						p.list.scrollItems(1, scrollstep);
						cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
						cScrollBar.timerID1 = false;
						cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
						cScrollBar.timerID2 = window.SetInterval(function() {
							if (p.scrollbar.hover) {
								if (mouse_x > p.scrollbar.x && p.scrollbar.cursorPos > mouse_y) {
									try{
										p.list.scrollItems(1, scrollstep);
									} catch(e) {};
								};
							};
						}, 60);
					}, 400);
				};
			}
			else {
				if (!p.list.buttonclicked && !cScrollBar.timerID1) {
					p.list.buttonclicked = true;
					p.list.scrollItems(-1, scrollstep);
					cScrollBar.timerID1 = window.SetTimeout(function() {
						p.list.scrollItems(-1, scrollstep);
						cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
						cScrollBar.timerID1 = false;
						cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
						cScrollBar.timerID2 = window.SetInterval(function() {
							if (p.scrollbar.hover) {
								if (mouse_x > p.scrollbar.x && p.scrollbar.cursorPos + p.scrollbar.cursorHeight < mouse_y) {
									p.list.scrollItems(-1, scrollstep);
								};
							};
						}, 60);
					}, 400)
				};
			};
		};
		p.headerBar.on_mouse("down", x, y);
	};
};

function on_mouse_lbtn_dblclk(x, y, mask) {

	g_left_click_hold = true;

	// check settings
	if (cSettings.visible) {
		p.settings.on_mouse("dblclk", x, y);
	}
	else {
		// check list
		p.list.check("dblclk", x, y);
		p.headerBar.on_mouse("dblclk", x, y);

		// check scrollbar
		if (p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
			p.scrollbar.check("dblclk", x, y);
			if (p.scrollbar.hover) {
				on_mouse_lbtn_down(x, y); // ...to have a scroll response on double clicking scrollbar area above or below the cursor!
			};
		};
	};
};

function on_mouse_lbtn_up(x, y) {

	// check settings
	if (cSettings.visible) {
		p.settings.on_mouse("up", x, y);
	}
	else {
		// scrollbar scrolls up and down RESET
		p.list.buttonclicked = false;
		cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
		cScrollBar.timerID1 = false;
		cScrollBar.timerID2 && window.ClearTimeout(cScrollBar.timerID2);
		cScrollBar.timerID2 = false;

		// after a cover column resize, update cover image cache
		if (cover.resized == true) {
			cover.resized = false;
			// === 封面列宽度自动吸附到行高整数倍 ===
			var _rowH = cTrack.height;
			var _curW = p.headerBar.columns[0].w;
			var _snapW = Math.round(_curW / _rowH) * _rowH;
			if (_snapW != _curW && _snapW >= p.headerBar.columns[0].minWidth) {
				p.headerBar.columns[0].w = _snapW;
				p.headerBar.columns[0].percent = Math.round(_snapW / zdpi * 100) / 100;
				p.headerBar.calculateColumns();
			}
			// === 吸附结束 ===
			cover.previous_max_size = p.headerBar.columns[0].w;
			update_playlist(layout.collapseGroupsByDefault, 2);
		};

		// check list
		p.list.check("up", x, y);

		// check scrollbar
		if (p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
			p.scrollbar.check("up", x, y);
		};

		// Drop items after a drag'n drop INSIDE the playlist
		if (!properties.enableTouchControl) {
			if (p.list.ishover && g_dragndrop_status) {
				if (dragndrop.drag_id >= 0 && dragndrop.drop_id >= 0) {
					var save_focus_handle = fb.GetFocusItem();
					var drop_handle = p.list.handleList[dragndrop.drop_id];
					var nb_selected_items = p.list.metadblist_selection.Count;

					if (dragndrop.contigus_sel && nb_selected_items > 0) {
						if(nb_selected_items == 1){
							var move_delta = dragndrop.drop_id - dragndrop.drag_id;
							plman.MovePlaylistSelection(p.list.playlist, move_delta);
						} else {
							if (dragndrop.drop_id > dragndrop.drag_id) {
								// on pointe sur le dernier item de la selection si on move vers le bas
								var new_drag_pos = p.list.handleList.Find(p.list.metadblist_selection[nb_selected_items - 1]);
								var move_delta = dragndrop.drop_id - new_drag_pos;
							}
							else {
								// on pointe sur le 1er item de la selection si on move vers le haut
								var new_drag_pos = p.list.handleList.Find(p.list.metadblist_selection[0]);
								var move_delta = dragndrop.drop_id - new_drag_pos;
							};
							plman.MovePlaylistSelection(p.list.playlist, move_delta);
						}
					} else {
						// 1st: move selected item at the full end of the playlist to make then contigus
						g_avoid_on_item_focus_change = true;
						plman.MovePlaylistSelection(p.list.playlist, plman.PlaylistItemCount(p.list.playlist));
						// 2nd: move bottom selection to new drop_id place (to redefine first...)
						plman.SetPlaylistFocusItemByHandle(p.list.playlist, drop_handle);
						var drop_id_new = plman.GetPlaylistFocusItemIndex(p.list.playlist);
						plman.SetPlaylistFocusItemByHandle(p.list.playlist, save_focus_handle);
						if (dragndrop.drag_id > drop_id_new) {
							var mdelta = p.list.count - nb_selected_items - drop_id_new;
						}
						else {
							var mdelta = p.list.count - nb_selected_items - drop_id_new - 1;
						};
						plman.MovePlaylistSelection(p.list.playlist, mdelta * -1);
						g_avoid_on_item_focus_change = false;
					};
				};
			};
		};
		g_dragndrop_status = false;
		dragndrop.leave_flag = false;
		dragndrop.drag_id = -1;
		dragndrop.drop_id = -1;
		dragndrop.clicked = false;
		dragndrop.timerID && window.ClearTimeout(dragndrop.timerID);
		dragndrop.timerID = false;
		//window.SetCursor(IDC_ARROW);

		p.headerBar.on_mouse("up", x, y);

		// repaint on mouse up to refresh covers just loaded
		full_repaint();
	};

	if (cTouch.down) {
		cTouch.down = false;
		cTouch.y_start = y;
		cTouch.down_id = cTouch.up_id;
	};

	g_left_click_hold = false;
};

function on_mouse_rbtn_down(x, y) {

};

function on_mouse_rbtn_up(x, y) {
	if (!g_left_click_hold) {
		// check settings
		if (cSettings.visible) {
			p.settings.on_mouse("right", x, y);
		}
		else {
			// check list
			p.list.check("right", x, y);
			p.headerBar.on_mouse("right", x, y);
		};
	};
	return true;
};

function on_mouse_move(x, y) {

	if (x == mouse_x && y == mouse_y) return true;

	// check settings
	if (cSettings.visible) {

		if (cTouch.down) {
			cTouch.y_end = y;
			var y_delta = (cTouch.y_end - cTouch.y_start);
			if (x < p.list.w) {
				if (y_delta > p.settings.h / cSettings.rowHeight) {
					on_mouse_wheel(1); // scroll up
					cTouch.y_start = cTouch.y_end;
				};
				if (y_delta < -p.settings.h / cSettings.rowHeight) {
					on_mouse_wheel(-1); // scroll down
					cTouch.y_start = cTouch.y_end;
				};
			};
		};
		p.settings.on_mouse("move", x, y);
	}
	else {

		if (cTouch.down) {

			if (p.headerBar.columnDragged < 1 && !p.headerBar.borderDragged) {
				cTouch.y_end = y;
				var y_delta = (cTouch.y_end - cTouch.y_start);
				if (x < p.list.w) {
					if (y_delta > p.list.h / cTrack.height) {
						on_mouse_wheel(1); // scroll up
						cTouch.y_start = cTouch.y_end;
					};
					if (y_delta < -p.list.h / cTrack.height) {
						on_mouse_wheel(-1); // scroll down
						cTouch.y_start = cTouch.y_end;
					};
				};
			};
		}
		else {
			// check list
			p.list.check("move", x, y);

			if (p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
				p.scrollbar.check("move", x, y);
			};

			p.headerBar.on_mouse("move", x, y);

			// if cover column resized (or init), refresh column cover, minimum count, ... and playlist
			if (cover.previous_max_size != p.headerBar.columns[0].w) {
				cover.resized = true;
				get_grprow_minimum(p.headerBar.columns[0].w);
			};
		};
	};
	// save coords
	mouse_x = x;
	mouse_y = y;
};

function on_mouse_wheel(delta) {
		// check settings
	if (cSettings.visible) {
		p.settings.on_mouse("wheel", mouse_x, mouse_y, delta);
		if (cSettings.wheel_timer) {
			window.ClearTimeout(cSettings.wheel_timer);
			cSettings.wheel_timer = false;
		};
		cSettings.wheel_timer = window.SetTimeout(function() {
			on_mouse_move(mouse_x + 1, mouse_y + 1);
			window.ClearTimeout(cSettings.wheel_timer);
			cSettings.wheel_timer = false;
		}, 50);
	}
	else {
		// handle p.list Beam
		var limit_reached = false;
		var maxOffset = (p.list.totalRows > p.list.totalRowVisible ? p.list.totalRows - p.list.totalRowVisible : 0);
		if (maxOffset > 0) {
			if (delta > 0) { // scroll up requested
				if (p.list.offset == 0) {
					// top beam to draw
					p.list.beam = 1;
					cList.beam_sens = 1;
					limit_reached = true;
				};
			}
			else { // scroll down requested
				if (p.list.offset >= maxOffset) {
					// bottom beam to draw
					p.list.beam = 2;
					cList.beam_sens = 1;
					limit_reached = true;
				};
			};
			if (limit_reached) {
				if (!cList.beam_timer) {
					p.list.beam_alpha = 0;
					cList.beam_timer = window.SetInterval(function() {
						if (cList.beam_sens == 1) {
							p.list.beam_alpha = (p.list.beam_alpha <= 275 ? p.list.beam_alpha + 25 : 300);
							if (p.list.beam_alpha >= 300) {
								cList.beam_sens = 2;
							};
						}
						else {
							p.list.beam_alpha = (p.list.beam_alpha >= 25 ? p.list.beam_alpha - 25 : 0);
							if (p.list.beam_alpha <= 0) {
								p.list.beam = 0;
								window.ClearInterval(cList.beam_timer);
								cList.beam_timer = false;
							};
						};
						full_repaint();
					}, 32);
				};
			};
		};

		reset_cover_timers();

		if (p.list.ishover || cScrollBar.timerID1 || cList.repaint_timer) {
			// timer to tell to other functions (on cover load asynch done, ...) that a repaint is already running
			if (!g_mouse_wheel_timer) {
				// set scroll speed / mouse y offset from panel limits
				if (mouse_y < p.list.y) {
					var s = Math.abs(mouse_y - p.list.y);
					var h = Math.ceil(cTrack.height / 2);
					if (s > h) s = h;
					var t = h - s + 1;
					var r = Math.round(500 / h);
					var scroll_speed_ms = ((t * r) < 10 ? 10 : (t * r));
				}
				else if (mouse_y > p.list.y + p.list.h) {
					var s = Math.abs(mouse_y - (p.list.y + p.list.h));
					var h = Math.ceil(cTrack.height / 2);
					if (s > h) s = h;
					var t = h - s + 1;
					var r = Math.round(500 / h);
					var scroll_speed_ms = ((t * r) < 10 ? 10 : (t * r));
				}
				else {
					scroll_speed_ms = 20;
				};
					//
				g_mouse_wheel_timer = window.SetTimeout(function() {
					p.list.scrollItems(delta, properties.enableTouchControl ? cList.touchstep : cList.scrollstep);
					g_mouse_wheel_timer && window.ClearTimeout(g_mouse_wheel_timer);
					g_mouse_wheel_timer = false;
				}, scroll_speed_ms);
			};
		};
	};
};

function on_mouse_mbtn_up(x, y, mask) {
	if (cSettings.visible || p.list.count == 0) return;
	var mask = GetKeyboardMask();
	if (mask == KMask.shift) {
		var fin = p.list.items.length;
		for (var i = 0; i < fin; i++) {
			if (p.list.items[i].ishover) {
				plman.SetPlaylistFocusItem(p.list.playlist, p.list.items[i].track_index);
				fb.RunContextCommandWithMetadb("添加到播放队列", fb.GetFocusItem()) 
			}
		};
	} else {
		if(InfoPane.ItemReset) p.list.check("move", InfoPane.mouse[0], InfoPane.mouse[1]);
		InfoPane.show = !InfoPane.show;
		full_repaint();
	}
};

function on_mouse_leave() {
	if (p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
		p.scrollbar.check("leave", 0, 0);
	};
	p.headerBar.buttonCheck("leave_menu");
	InfoPane.metadb = null;
	InfoPane.rowindex = -1;
	if(InfoPane.show) {
		InfoPane.show = false;
		full_repaint();
	}
};

// Callbacks
function update_playlist(iscollapsed, listnochange) {
	g_selHolder = fb.AcquireUiSelectionHolder();
	// activate playlist selection tracking
	g_selHolder.SetPlaylistSelectionTracking();
	g_group_id_focused = 0;
	p.list.updateHandleList(plman.ActivePlaylist, iscollapsed, listnochange);
	if(listnochange == 2) p.list.setItems(listnochange);
	else p.list.setItems(!listnochange);
	p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
	// if sort by header click was requested, reset mouse cursor to default
	if (cHeaderBar.sortRequested) {
		window.SetCursor(IDC_ARROW);
		cHeaderBar.sortRequested = false;
	};
};

function on_playlist_switch() {
	var old_extraline = layout.enableExtraLine;
	var old_columnwidth = layout.columnWidth[layout.index];
	layout.playlistName = plman.GetPlaylistName(plman.ActivePlaylist);
	get_layout_cache(layout.playlistName);
	if(old_columnwidth != layout.columnWidth[layout.index]) {
		p.headerBar.initColumns();
	}
	if(old_extraline != layout.enableExtraLine) resize_panels();
	get_grprow_minimum(p.headerBar.columns[0].w);
	if (!layout.showgroupheaders) {
		cGroup.collapsed_height = 0;
		cGroup.expanded_height = 0;
	};
	update_playlist(layout.collapseGroupsByDefault);
	p.headerBar.resetSortIndicators();
	cHeaderBar.lock_hint_shown = false;
	if(cSettings.visible && p.settings.currentPageId == 4) p.settings.pages[p.settings.currentPageId].elements[0].showSelected(layout.index);
	full_repaint();
};

function on_playlists_changed() {
	if (!g_delay_refresh_items) {
		if (plman.PlaylistCount > 0 && (plman.ActivePlaylist < 0 || plman.ActivePlaylist > plman.PlaylistCount - 1)) {
			plman.ActivePlaylist = 0;
		};
		// close timers if dragging tracks is running
		if (g_dragndrop_status) {
			if (dragndrop.timerID) {
				window.ClearTimeout(dragndrop.timerID);
				dragndrop.timerID = false;
			};
			g_dragndrop_status = false;
			dragndrop.leave_flag = false;
			on_mouse_move(mouse_x + 1, mouse_y); // to reset window cursor style to a simple arrow
		};
		p.list.playlist = plman.ActivePlaylist;
		full_repaint();
	};
};

// 列表变更 150ms 去抖：批量导入/连续事件只做一次全量重建
var g_refresh_timer = false;
// 曲目数低于该值时重建成本可忽略，直接同步执行，保持小列表的即时手感
var G_SYNC_REBUILD_MAX = 1000;

function do_playlist_rebuild() {
	g_refresh_timer = false;
	if (g_delay_refresh_items) return;
	update_playlist(layout.collapseGroupsByDefault);
	p.headerBar.resetSortIndicators();
	full_repaint();
};

function schedule_playlist_rebuild() {
	if (p.list && p.list.count < G_SYNC_REBUILD_MAX) {
		// 小列表：取消可能存在的待执行定时器，立即同步重建
		if (g_refresh_timer) {
			window.ClearTimeout(g_refresh_timer);
			g_refresh_timer = false;
		};
		do_playlist_rebuild();
		return;
	};
	if (g_refresh_timer) return;
	g_refresh_timer = window.SetTimeout(do_playlist_rebuild, 150);
};

// 元数据变更同样去抖，避免库扫描/批量打标签时反复 setItems + 重绘
var g_metadb_timer = false;
var g_metadb_handles = null;

function do_metadb_refresh() {
	g_metadb_timer = false;
	var hs = g_metadb_handles;
	g_metadb_handles = null;
	p.list.setItems(false);
	if (hs) {
		var found = -1;
		for (var j = 0; j < p.list.groups.length; j++) {
			if (hs.Find(p.list.groups[j].metadb) > -1) {
				found = j;
				break;
			}
		}
		if (found > -1) {
			p.list.groups[found].load_requested = 0;
			g_image_cache.remove(p.list.groups[found].cachekey);
		}
	}
	full_repaint();
};

function schedule_metadb_refresh(handles) {
	if (handles) g_metadb_handles = handles;
	if (p.list && p.list.count < G_SYNC_REBUILD_MAX) {
		if (g_metadb_timer) {
			window.ClearTimeout(g_metadb_timer);
			g_metadb_timer = false;
		};
		do_metadb_refresh();
		return;
	};
	if (g_metadb_timer) return;
	g_metadb_timer = window.SetTimeout(do_metadb_refresh, 150);
};

function on_playlist_items_added(playlist_idx) {
	if (!g_delay_refresh_items && playlist_idx == p.list.playlist) {
		schedule_playlist_rebuild();
	};
};

function on_playlist_items_removed(playlist_idx, new_count) {
	if (!g_delay_refresh_items && playlist_idx == p.list.playlist) {
		schedule_playlist_rebuild();
	};
};

function on_playlist_items_reordered(playlist_idx) {
	if (!g_avoid_on_item_focus_change) {
		if (playlist_idx == p.list.playlist && p.headerBar.columnDragged == 0) {
			schedule_playlist_rebuild();
		}
		else {
			p.headerBar.columnDragged = 0;
		};
	};
};

function on_playlist_items_selection_change() {
	full_repaint();
};

function on_item_focus_change(playlist, from, to) {
	if (!g_avoid_on_item_focus_change) {
		var mdb = (fb.IsPlaying || fb.IsPaused) ? fb.GetNowPlaying() : plman.PlaylistItemCount(plman.ActivePlaylist) > 0 ? fb.GetFocusItem() : false;
		if (mdb) {
			p.list.setItems(false);
			full_repaint();
		};
		if (playlist == p.list.playlist) {
			p.list.focusedTrackId = to;
			plman.SetActivePlaylistContext();
			var center_focus_item = p.list.isFocusedItemVisible();

			if (layout.autocollapse) {
				var grpId = p.list.getGroupIdfromTrackId(to);
				if (grpId >= 0) {
					if (p.list.groups[grpId].collapsed) {
						p.list.updateGroupStatus(grpId);
						p.list.setItems(true);
						center_focus_item = p.list.isFocusedItemVisible();
					}
					else {
						if ((!center_focus_item && !p.list.drawRectSel) || (center_focus_item && to == 0)) {
							p.list.setItems(true);
						};
					};
				};
			}
			else {
				if ((!center_focus_item && !p.list.drawRectSel) || (center_focus_item && to == 0)) {
					p.list.setItems(true);
				};
			};
			p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
		};
	};
};

function on_metadb_changed(handles, fromhook) {
	schedule_metadb_refresh(fromhook ? null : handles);
};

//=================================================// Keyboard Callbacks

function on_key_up(vkey) {
	if (cSettings.visible) {
		var fin = p.settings.pages[p.settings.currentPageId].elements.length;
		for (var j = 0; j < fin; j++) {
			p.settings.pages[p.settings.currentPageId].elements[j].on_key("up", vkey);
		};
	}
	else {
		// after a cover column resize, update cover image and empty rows to show the whole cover if low tracks count in group
		if (cover.resized == true) {
			cover.resized = false;
			update_playlist(layout.collapseGroupsByDefault, 2);
		};

		// scroll keys up and down RESET (step and timers)
		p.list.keypressed = false;
		cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
		cScrollBar.timerID1 = false;
		cScrollBar.timerID2 && window.ClearTimeout(cScrollBar.timerID2);
		cScrollBar.timerID2 = false;
		if (vkey == VK_SHIFT) {
			p.list.SHIFT_start_id = null;
			p.list.SHIFT_count = 0;
		};
	};
};

function on_key_down(vkey) {
	InfoPane.show = false;
	var mask = GetKeyboardMask();
	if (cSettings.visible) {
		g_textbox_tabbed = false;
		var fin = p.settings.pages[p.settings.currentPageId].elements.length;
		for (var j = 0; j < fin; j++) {
			p.settings.pages[p.settings.currentPageId].elements[j].on_key("down", vkey);
		};
	}
	else {
		if (g_dragndrop_status) return true;

		var act_pls = plman.ActivePlaylist;

		if (mask == KMask.none) {
			switch (vkey) {
			case VK_F2:
				p.list.showNowPlaying();
				p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
				break;
			case VK_F5:
				refresh_cover(true);
				break;
			case VK_TAB:
				tab_collapse = !tab_collapse;
				if (!cSettings.visible && p.list.totalRows > 0 && !layout.autocollapse && cGroup.expanded_height > 0 && cGroup.collapsed_height > 0) {
					resize_panels();
					p.list.updateHandleList(plman.ActivePlaylist, tab_collapse, true);
					p.list.setItems(2);
					p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
					full_repaint();
				}
				break;
			case VK_BACK:
				if (cList.search_string.length > 0) {
					cList.inc_search_noresult = false;
					cList.search_string = cList.search_string.substring(0, cList.search_string.length - 1);
					full_repaint();
					cList.clear_incsearch_timer && window.ClearTimeout(cList.clear_incsearch_timer);
					cList.clear_incsearch_timer = false;
					cList.incsearch_timer && window.ClearTimeout(cList.incsearch_timer);
					cList.incsearch_timer = window.SetTimeout(function() {
						p.list.incrementalSearch();
						cList.incsearch_timer = false;
						cList.inc_search_noresult = false;
					}, 500);
				};
				break;
			case VK_ESCAPE:
			case 222:
				//
				p.list.tt_x = ((p.list.w) / 2) - (((cList.search_string.length * z(13)) + (g_z10 * 2)) / 2);
				p.list.tt_y = p.list.y + Math.floor((p.list.h / 2) - g_z30);
				p.list.tt_w = ((cList.search_string.length * z(13)) + (g_z10 * 2));
				p.list.tt_h = z(60);
				cList.search_string = "";
				window.RepaintRect(0, p.list.tt_y - 2, p.list.w, p.list.tt_h + 4);
				break;
			case VK_UP:
				var scrollstep = 1;
				var new_focus_id = 0;
				if (p.list.count > 0 && !p.list.keypressed && !cScrollBar.timerID1) {
					p.list.keypressed = true;
					reset_cover_timers();

					if (p.list.focusedTrackId < 0) {
						var old_grpId = 0;
					}
					else {
						var old_grpId = p.list.getGroupIdfromTrackId(p.list.focusedTrackId);
					};
					new_focus_id = (p.list.focusedTrackId > 0) ? p.list.focusedTrackId - scrollstep : 0;
					var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
					if (!layout.autocollapse) {
						if (p.list.groups[old_grpId].collapsed) {
							if (old_grpId > 0 && old_grpId == grpId) {
								new_focus_id = (p.list.groups[grpId].start > 0) ? p.list.groups[grpId].start - scrollstep : 0;
								var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
							};
						};
					};

					// if new track focused id is in a collapsed group, set the 1st track of the group as the focused track (= group focused)
					if (p.list.groups[grpId].collapsed) {
						if (layout.autocollapse) {
							new_focus_id = p.list.groups[grpId].start + p.list.groups[grpId].count - 1;
						}
						else {
							new_focus_id = p.list.groups[grpId].start;
						};
					};
					if (p.list.focusedTrackId == 0 && p.list.offset > 0) {
						p.list.scrollItems(1, scrollstep);
						cScrollBar.timerID1 = window.SetTimeout(function() {
							p.list.scrollItems(1, scrollstep);
							cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
							cScrollBar.timerID1 = false;
							cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
							cScrollBar.timerID2 = window.SetInterval(function() {
								p.list.scrollItems(1, scrollstep);
							}, 50);
						}, 400);
					}
					else {
						plman.SetPlaylistFocusItem(act_pls, new_focus_id);
						plman.ClearPlaylistSelection(act_pls);
						plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
						cScrollBar.timerID1 = window.SetTimeout(function() {
							cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
							cScrollBar.timerID1 = false;
							cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
							cScrollBar.timerID2 = window.SetInterval(function() {
								new_focus_id = (p.list.focusedTrackId > 0) ? p.list.focusedTrackId - scrollstep : 0;
								// if new track focused id is in a collapsed group, set the 1st track of the group as the focused track (= group focused)
								var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
								if (p.list.groups[grpId].collapsed) {
									if (layout.autocollapse) {
										new_focus_id = p.list.groups[grpId].start + p.list.groups[grpId].count - 1;
									}
									else {
										new_focus_id = p.list.groups[grpId].start;
									};
								};
								plman.SetPlaylistFocusItem(act_pls, new_focus_id);
								plman.ClearPlaylistSelection(act_pls);
								plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
							}, 50);
						}, 400);
					};
				};
				break;
			case VK_DOWN:
				var new_focus_id = 0;
				if (p.list.count > 0 && !p.list.keypressed && !cScrollBar.timerID1) {
					p.list.keypressed = true;
					reset_cover_timers();

					if (p.list.focusedTrackId < 0) {
						var old_grpId = 0;
					}
					else {
						var old_grpId = p.list.getGroupIdfromTrackId(p.list.focusedTrackId);
					};
					new_focus_id = (p.list.focusedTrackId < p.list.count - 1) ? p.list.focusedTrackId + 1 : p.list.count - 1;
					var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
					if (!layout.autocollapse) {
						if (p.list.groups[old_grpId].collapsed) {
							if (old_grpId < (p.list.groups.length - 1) && old_grpId == grpId) {
								new_focus_id = ((p.list.groups[grpId].start + p.list.groups[grpId].count - 1) < (p.list.count - 1)) ? (p.list.groups[grpId].start + p.list.groups[grpId].count - 1) + 1 : p.list.count - 1;
								var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
							};
						};
					};

					// if new track focused id is in a collapsed group, set the last track of the group as the focused track (= group focused)
					if (p.list.groups[grpId].collapsed) {
						if (layout.autocollapse) {
							new_focus_id = p.list.groups[grpId].start;
						}
						else {
							new_focus_id = p.list.groups[grpId].start + p.list.groups[grpId].count - 1;
						};
					};
					plman.SetPlaylistFocusItem(act_pls, new_focus_id);
					plman.ClearPlaylistSelection(act_pls);
					plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
					cScrollBar.timerID1 = window.SetTimeout(function() {
						cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
						cScrollBar.timerID1 = false;
						cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
						cScrollBar.timerID2 = window.SetInterval(function() {
							new_focus_id = (p.list.focusedTrackId < p.list.count - 1) ? p.list.focusedTrackId + 1 : p.list.count - 1;
							// if new track focused id is in a collapsed group, set the last track of the group as the focused track (= group focused)
							var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
							if (p.list.groups[grpId].collapsed) {
								if (layout.autocollapse) {
									new_focus_id = p.list.groups[grpId].start;
								}
								else {
									new_focus_id = p.list.groups[grpId].start + p.list.groups[grpId].count - 1;
								};
							};
							plman.SetPlaylistFocusItem(act_pls, new_focus_id);
							plman.ClearPlaylistSelection(act_pls);
							plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
						}, 50);
					}, 400);
				};
				break;
			case VK_PGUP:
				var scrollstep = p.list.totalRowVisible;
				var new_focus_id = 0;
				if (p.list.count > 0 && !p.list.keypressed && !cScrollBar.timerID1) {
					p.list.keypressed = true;
					reset_cover_timers();
					new_focus_id = (p.list.focusedTrackId > scrollstep) ? p.list.focusedTrackId - scrollstep : 0;
					if (p.list.focusedTrackId == 0 && p.list.offset > 0) {
						p.list.scrollItems(1, scrollstep);
						cScrollBar.timerID1 = window.SetTimeout(function() {
							p.list.scrollItems(1, scrollstep);
							cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
							cScrollBar.timerID1 = false;
							cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
							cScrollBar.timerID2 = window.SetInterval(function() {
								p.list.scrollItems(1, scrollstep);
							}, 60);
						}, 400);
					}
					else {
						plman.SetPlaylistFocusItem(act_pls, new_focus_id);
						plman.ClearPlaylistSelection(act_pls);
						plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
						cScrollBar.timerID1 = window.SetTimeout(function() {
							cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
							cScrollBar.timerID1 = false;
							cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
							cScrollBar.timerID2 = window.SetInterval(function() {
								new_focus_id = (p.list.focusedTrackId > scrollstep) ? p.list.focusedTrackId - scrollstep : 0;
								plman.SetPlaylistFocusItem(act_pls, new_focus_id);
								plman.ClearPlaylistSelection(act_pls);
								plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
							}, 60);
						}, 400);
					};
				};
				break;
			case VK_PGDN:
				var scrollstep = p.list.totalRowVisible;
				var new_focus_id = 0;
				if (p.list.count > 0 && !p.list.keypressed && !cScrollBar.timerID1) {
					p.list.keypressed = true;
					reset_cover_timers();
					new_focus_id = (p.list.focusedTrackId < p.list.count - scrollstep) ? p.list.focusedTrackId + scrollstep : p.list.count - 1;
					plman.SetPlaylistFocusItem(act_pls, new_focus_id);
					plman.ClearPlaylistSelection(act_pls);
					plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
					cScrollBar.timerID1 = window.SetTimeout(function() {
						cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
						cScrollBar.timerID1 = false;
						cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
						cScrollBar.timerID2 = window.SetInterval(function() {
							new_focus_id = (p.list.focusedTrackId < p.list.count - scrollstep) ? p.list.focusedTrackId + scrollstep : p.list.count - 1;
							plman.SetPlaylistFocusItem(act_pls, new_focus_id);
							plman.ClearPlaylistSelection(act_pls);
							plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
						}, 60);
					}, 400);
				};
				break;
			case VK_RETURN:
				// play/enqueue focused item
				if (!isQueuePlaylistActive()) {
					plman.ExecutePlaylistDefaultAction(act_pls, p.list.focusedTrackId);
				};
				break;
			case VK_END:
				if (p.list.count > 0) {
					plman.SetPlaylistFocusItem(act_pls, p.list.count - 1);
					plman.ClearPlaylistSelection(act_pls);
					plman.SetPlaylistSelectionSingle(act_pls, p.list.count - 1, true);
				};
				break;
			case VK_HOME:
				if (p.list.count > 0) {
					plman.SetPlaylistFocusItem(act_pls, 0);
					plman.ClearPlaylistSelection(act_pls);
					plman.SetPlaylistSelectionSingle(act_pls, 0, true);
				};
				break;
			case VK_DELETE:
				if (!plman.IsAutoPlaylist(act_pls)) {
					if (isQueuePlaylistActive()) {
						var affected_items = Array();
						var first_focus_id = null;
						var next_focus_id = null;
						for (var k = 0; k < p.list.count; k++) {
							if (plman.IsPlaylistItemSelected(act_pls, k)) {
								affected_items.push(k);
								if (first_focus_id == null) first_focus_id = k;
								next_focus_id = k + 1;
							};
						};
						if (next_focus_id >= p.list.count) {
							next_focus_id = first_focus_id;
						};
						if (next_focus_id != null) {
							plman.SetPlaylistFocusItem(act_pls, next_focus_id);
							plman.SetPlaylistSelectionSingle(act_pls, next_focus_id, true);
						};
						plman.RemoveItemsFromPlaybackQueue(affected_items);
					}
					else {
						plman.RemovePlaylistSelection(act_pls, false);
					};
					// 删除后焦点可能变为 -1，仅在有效索引时恢复选区
					var del_focus = plman.GetPlaylistFocusItemIndex(act_pls);
					if (del_focus > -1) plman.SetPlaylistSelectionSingle(act_pls, del_focus, true);
				};
				break;
			};
		}
		else {
			switch (mask) {
			case KMask.shift:
				switch (vkey) {
				case VK_SHIFT:
					// SHIFT key alone
					p.list.SHIFT_count = 0;
					break;
				case VK_UP:
					// SHIFT + KEY UP
					if (p.list.SHIFT_count == 0) {
						if (p.list.SHIFT_start_id == null) {
							p.list.SHIFT_start_id = p.list.focusedTrackId;
						};
						plman.ClearPlaylistSelection(act_pls);
						plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, true);
						if (p.list.focusedTrackId > 0) {
							p.list.SHIFT_count--;
							p.list.focusedTrackId--;
							plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, true);
							plman.SetPlaylistFocusItem(act_pls, p.list.focusedTrackId);
						};
					}
					else if (p.list.SHIFT_count < 0) {
						if (p.list.focusedTrackId > 0) {
							p.list.SHIFT_count--;
							p.list.focusedTrackId--;
							plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, true);
							plman.SetPlaylistFocusItem(act_pls, p.list.focusedTrackId);
						};
					}
					else {
						plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, false);
						p.list.SHIFT_count--;
						p.list.focusedTrackId--;
						plman.SetPlaylistFocusItem(act_pls, p.list.focusedTrackId);
					};
					break;
				case VK_DOWN:
					// SHIFT + KEY DOWN
					if (p.list.SHIFT_count == 0) {
						if (p.list.SHIFT_start_id == null) {
							p.list.SHIFT_start_id = p.list.focusedTrackId;
						};
						plman.ClearPlaylistSelection(act_pls);
						plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, true);
						if (p.list.focusedTrackId < p.list.count - 1) {
							p.list.SHIFT_count++;
							p.list.focusedTrackId++;
							plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, true);
							plman.SetPlaylistFocusItem(act_pls, p.list.focusedTrackId);
						};
					}
					else if (p.list.SHIFT_count > 0) {
						if (p.list.focusedTrackId < p.list.count - 1) {
							p.list.SHIFT_count++;
							p.list.focusedTrackId++;
							plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, true);
							plman.SetPlaylistFocusItem(act_pls, p.list.focusedTrackId);
						};
					}
					else {
						plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, false);
						p.list.SHIFT_count++;
						p.list.focusedTrackId++;
						plman.SetPlaylistFocusItem(act_pls, p.list.focusedTrackId);
					};
					break;
				};
				break;
			case KMask.ctrl:
				if (vkey == 65) { // CTRL+A
					fb.RunMainMenuCommand("编辑/全选");
					p.list.metadblist_selection = plman.GetPlaylistSelectedItems(p.list.playlist);
					//full_repaint();
				} else if (vkey == 88) { // CTRL+X
					if (!plman.IsAutoPlaylist(act_pls)) {
						clipboard.selection = plman.GetPlaylistSelectedItems(plman.ActivePlaylist);

						if (isQueuePlaylistActive()) {
							var affected_items = Array();
							var first_focus_id = null;
							var next_focus_id = null;
							for (var k = 0; k < p.list.count; k++) {
								if (plman.IsPlaylistItemSelected(act_pls, k)) {
									affected_items.push(k);
									if (first_focus_id == null) first_focus_id = k;
									next_focus_id = k + 1;
								};
							};
							if (next_focus_id >= p.list.count) {
								next_focus_id = first_focus_id;
							};
							if (next_focus_id != null) {
								plman.SetPlaylistFocusItem(act_pls, next_focus_id);
								plman.SetPlaylistSelectionSingle(act_pls, next_focus_id, true);
							};
							plman.RemoveItemsFromPlaybackQueue(affected_items);
						}
						else {
							plman.RemovePlaylistSelection(act_pls, false);
						};

						// 删除后焦点可能变为 -1，仅在有效索引时恢复选区
						var cut_focus = plman.GetPlaylistFocusItemIndex(act_pls);
						if (cut_focus > -1) plman.SetPlaylistSelectionSingle(act_pls, cut_focus, true);
					};
				} else if (vkey == 67) { // CTRL+C
					clipboard.selection = plman.GetPlaylistSelectedItems(plman.ActivePlaylist);
				} else if (vkey == 86) { // CTRL+V
					// insert the clipboard selection (handles) after the current position in the active playlist
					if (clipboard.selection) {
						if (clipboard.selection.Count > 0) {
							try {
								if (p.list.count > 0) {
									plman.InsertPlaylistItems(plman.ActivePlaylist, p.list.focusedTrackId + 1, clipboard.selection);
								}
								else {
									plman.InsertPlaylistItems(plman.ActivePlaylist, 0, clipboard.selection);
								};
							}
							catch (e) {
								console.log("WSH 播放列表警告: 剪贴板无法粘贴,无效的剪贴板内容。");
							};
						};
					};
				} else if(vkey == 49){
					if(scrollstep_org != 1){
						if(cList.scrollstep != 1) cList.scrollstep = 1;
						else cList.scrollstep = scrollstep_org;
					}
				}
				break;
			case KMask.alt:
				if(vkey == 115) fb.RunMainMenuCommand("文件/退出");
				break;
			};
		};
	};
};

function on_char(code) {
	if (cSettings.visible) {
		var fin = p.settings.pages.length;
		var fin2;
		for (var i = 0; i < fin; i++) {
			fin2 = p.settings.pages[i].elements.length;
			for (var j = 0; j < fin2; j++) {
				p.settings.pages[i].elements[j].on_char(code);
			};
		};
	}
	else {
		if (p.list.count > 0) {
			p.list.tt_x = ((p.list.w) / 2) - (((cList.search_string.length * z(13)) + (g_z10 * 2)) / 2);
			p.list.tt_y = p.list.y + Math.floor((p.list.h / 2) - g_z30);
			p.list.tt_w = ((cList.search_string.length * z(13)) + (g_z10 * 2));
			p.list.tt_h = z(60);
			if (code == 32 && cList.search_string.length == 0) return true; // SPACE Char not allowed on 1st char
			if (cList.search_string.length <= 20 && p.list.tt_w <= p.list.w - 20) {
				if (code > 31) {
					cList.search_string = cList.search_string + String.fromCharCode(code);//.toUpperCase();
					full_repaint();
					cList.clear_incsearch_timer && window.ClearTimeout(cList.clear_incsearch_timer);
					cList.clear_incsearch_timer = false;
					cList.incsearch_timer && window.ClearTimeout(cList.incsearch_timer);
					cList.incsearch_timer = window.SetTimeout(function() {
						p.list.incrementalSearch();
						cList.incsearch_timer = false;
					}, 500);
				};
			};
		};
	};
};

// Playback Callbacks

function on_playback_starting(cmd, is_paused) {
	// called only on user action (cmd)
};

function on_playback_new_track(metadb) {
	full_repaint();
};

function on_playback_stop(reason) { // reason: (integer, begin with 0): user, eof, starting_another
	switch (reason) {
	// user stop
	case 0:
		full_repaint();
		break;
	case 1:
		// eof (e.g. end of playlist)
		if(repeat_pls && plman.PlaybackOrder == 0 && plman.PlaylistCount > 0){
			var next_idx = get_next_nonempty(plman.PlayingPlaylist);
			// 回退值可能指向空列表，此时不做任何动作
			if (plman.PlaylistItemCount(next_idx) > 0) {
				plman.ActivePlaylist = next_idx;
				plman.ExecutePlaylistDefaultAction(next_idx, 0);
			}
		}
		full_repaint();
		break;
	case 2:
		// starting_another (only called on user action, i.e. click on next button)
		break;
	};

};

function on_playback_pause(state) {
	if (p.list.nowplaying_y + cTrack.height > p.list.y && p.list.nowplaying_y < p.list.y + p.list.h) {
		window.RepaintRect(p.list.x, p.list.nowplaying_y, p.list.w, cTrack.height);
	};
};

function on_playback_seek(time) {

};

function on_playback_time(time) {
	g_seconds = time;
	if (!cSettings.visible) {
		if (p.list.nowplaying_y + cTrack.height > p.list.y && p.list.nowplaying_y < p.list.y + p.list.h) {
			window.RepaintRect(p.list.x, p.list.nowplaying_y, p.list.w, cTrack.height);
		};
	};
};

function on_playback_order_changed(new_order_index) {

};

function on_focus(is_focused) {
	if (cSettings.visible) {
		p.settings.on_focus(is_focused);
		full_repaint();
	}
};

function on_font_changed() {
	get_font();
	get_metrics();
	get_images_static();
	get_images_color();
	p.headerBar.setButtons();
	resize_panels();
	if(p.list) {
		if (p.list.totalRows > p.list.totalRowVisible) {
			p.scrollbar.setCursorButton();
		}
	};
	var settingpageid = p.settings.currentPageId;
	p.settings = new oSettings();
	setting_init = false;
	if(cSettings.visible) show_setting(settingpageid);
	full_repaint();
};

function on_colours_changed() {
	get_colors();
	get_img_nocover();
	get_images_color();
	p.headerBar.setButtons();
	if(p.list) {
		if (p.list.totalRows > p.list.totalRowVisible) {
			p.scrollbar.setCursorButton();
		}
		p.list.setItemColors();
	};
	p.settings.refreshColors();
	p.settings.setButtons();
	refresh_cover();
};

function on_notify_data(name, info) {
	switch (name) {
	case "show_Now_Playing":
		p.list.showNowPlaying();
		p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
		break;
	case "color_scheme_updated":
		if(!info) {
			g_color_highlight = c_default_hl;
			g_color_normal_bg = g_color_normal_bg_default;
			g_color_selected_bg = g_color_selected_bg_default;
		} else {
			g_color_highlight = RGB(info[0], info[1], info[2]);
			if(info.length > 3) {
				g_color_normal_bg = RGB(info[3], info[4], info[5]);
				g_color_selected_bg = RGB(info[6], info[7], info[8]);
			}
		}
		p.list.lcolor_85 = blendColors(g_color_normal_txt, g_color_highlight, 0.85);
		g_color_selected_bg2 = g_color_selected_bg & 0x85ffffff;
		if(dark_mode) p.list.lcolor_75 = blendColors(c_black, p.list.lcolor_85, 0.75);
		else p.list.lcolor_75 = blendColors(c_white, p.list.lcolor_85, 0.75);
		get_images_color();
		full_repaint();
		break;
	case "Playlist_Renamed":
		var pl_index = layout.ids.indexOf(info[0]);
		if(pl_index > 0){
			layout.ids[pl_index] = info[1];
			save_layout();
		}
		break;
	case "foobox_setting":
		if(info) show_setting(3);
		else if(cSettings.visible){
			p.settings.colorWidgetFocusedId = -1;
			p.settings.colorSliderFocusedId = -1;
			cSettings.visible = false;
			resize_panels();
			update_playlist(layout.collapseGroupsByDefault);
			full_repaint();
		}
		break;
	};
};

function show_setting(pageid){
	if(!setting_init) {
		p.settings.initpages();
		p.settings.setButtons();
		setting_init = true;
	}
	if(!p.settings.page_loaded[pageid]){
		p.settings.pages[pageid].init();
		p.settings.page_loaded[pageid] = true;
	}
	cSettings.visible = true;
	p.settings.currentPageId = pageid;
	p.settings.setSize(0, 0, ww, wh);
	full_repaint();
}

function get_font() {
	g_font = window.GetFontDUI(FontTypeDUI.playlists);
	g_fname = g_font.Name;
	g_fsize = g_font.Size;
	zdpi = g_fsize / 12;
	g_font_b = GdiFont(g_fname, g_fsize, 1);
	g_font_2 = GdiFont(g_fname, g_fsize - 1, g_font.Style);
	g_font_blank = GdiFont(g_fname, g_fsize + 4, 1);
	g_font_group1 = GdiFont(g_fname, g_fsize + 4, 0);
	g_font_group1_bold = GdiFont(g_fname, g_fsize + 3, 1);
	g_font_group2 = GdiFont(g_fname, g_fsize + 2, 0);
	cList.incsearch_font = GdiFont(g_fname, g_fsize + 10, 1);
	g_font_ud = GdiFont(g_fname, g_fsize, 4);
	fn_ico1 = GdiFont("FontAwesome", g_fsize + 2, 0);
	fn_ico2 = GdiFont("FontAwesome", g_fsize, 0);
};

function get_colors() {
	g_color_normal_bg_default = window.GetColourDUI(ColorTypeDUI.background);
	g_color_normal_txt = window.GetColourDUI(ColorTypeDUI.text);
	g_color_selected_bg_default = window.GetColourDUI(ColorTypeDUI.selection);
	c_default_hl = window.GetColourDUI(ColorTypeDUI.highlight);
	g_color_normal_bg = g_color_normal_bg_default;
	g_color_selected_txt = g_color_normal_txt;
	g_scroll_color = g_color_normal_txt & 0x95ffffff;
	g_color_selected_bg = g_color_selected_bg_default;
	g_color_selected_bg2 = g_color_selected_bg & 0x85ffffff;
	g_color_highlight = c_default_hl;
	g_color_status = g_color_normal_txt & 0x07ffffff;
	g_color_star = g_color_normal_txt & 0x2dffffff;
	if(isDarkMode(g_color_normal_bg)){
		dark_mode = 1;
		g_color_topbar = RGBA(0,0,0,30);
		g_color_line = RGBA(0, 0, 0, 25);
		g_color_line_div = RGBA(0, 0, 0, 55);
		g_group_header_bg = RGBA(0, 0, 0, 25);
		g_group_header_div = RGBA(255, 255, 255, 10);
		c_divline = blendColors(g_color_normal_bg, c_black, 0.4);
	}else{
		dark_mode = 0;
		g_color_topbar = RGBA(0,0,0,15);
		g_color_line = RGBA(0, 0, 0, 18);
		g_color_line_div = RGBA(0, 0, 0, 45);
		g_group_header_bg = RGBA(0, 0, 0, 8);
		g_group_header_div = RGBA(255, 255, 255, 50);
		c_divline = blendColors(g_color_normal_bg, c_black, 0.25);
	}
};

function get_images_color() {
	g_color_infopanebg = blendColors(g_color_selected_bg, g_color_normal_bg, 0.5);
	g_color_infopanebg = blendColors(g_color_infopanebg, g_color_highlight, 0.055);
	
	var imgh = Math.floor(15*zdpi);
	var gb;
	images.star = gdi.CreateImage(imgh, imgh);
	gb = images.star.GetGraphics();
	gb.SetTextRenderingHint(4);
	gb.DrawString("\uF005", fn_ico1, g_color_star, 0, 0, imgh, imgh, cc_stringformat);
	gb.SetTextRenderingHint(0);
	images.star.ReleaseGraphics(gb);

	images.star_h = gdi.CreateImage(imgh, imgh);
	gb = images.star_h.GetGraphics();
	gb.SetTextRenderingHint(4);
	gb.DrawString("\uF005", fn_ico1, g_color_highlight, 0, 0, imgh, imgh, cc_stringformat);
	gb.SetTextRenderingHint(0);
	images.star_h.ReleaseGraphics(gb);
	
	images.mood_ico = gdi.CreateImage(imgh, imgh*2);
	gb = images.mood_ico.GetGraphics();
	gb.SetTextRenderingHint(4);
	gb.DrawString("\uF004", fn_ico2, g_color_star, 0, 0, imgh, imgh, cc_stringformat);
	gb.DrawString("\uF004", fn_ico2, g_color_highlight, 0, imgh, imgh, imgh, cc_stringformat);
	gb.SetTextRenderingHint(0);
	images.mood_ico.ReleaseGraphics(gb);
	
	images.beam = draw_beam_image();
}

function get_img_nocover() {
	let color_ico = dark_mode ? RGBA(255,255,255,10) : RGBA(0,0,0,10);
	let imgh = g_z16;
	let gb;
	
	images.nocover = gdi.CreateImage(250, 250);
	gb = images.nocover.GetGraphics();
	gb.FillSolidRect(0, 0, 250, 250, color_ico);
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(70,70,100,100,50,color_ico);
	gb.SetSmoothingMode(0);
	images.nocover.ReleaseGraphics(gb);
	
	images.sortdirection = gdi.CreateImage(g_z7, g_z5);
	gb = images.sortdirection.GetGraphics();
	gb.SetSmoothingMode(2);
	var points_arr = new Array(g_z4,g_z4,zdpi,zdpi,g_z7,zdpi);
	gb.FillPolygon(g_color_normal_txt, 0, points_arr);
	gb.SetSmoothingMode(0);
	images.sortdirection.ReleaseGraphics(gb);
	
	images.selected_ico = gdi.CreateImage(imgh, imgh);
	gb = images.selected_ico.GetGraphics();
	gb.SetTextRenderingHint(4);
	gb.DrawString("\uF00C", fn_ico2, g_color_normal_txt, 0, 0, imgh, imgh, cc_stringformat);
	gb.SetTextRenderingHint(0);
	images.selected_ico.ReleaseGraphics(gb);
}

function get_images_static() {
	let gb, color_playing_alpha = g_color_playing_txt & 0x2dffffff;
	let imgh = g_z16;
	
	images.playing_ico = gdi.CreateImage(imgh, imgh);
	gb = images.playing_ico.GetGraphics();
	gb.SetTextRenderingHint(4);
	gb.DrawString("\uF04B", fn_ico2, g_color_playing_txt, 0, 0, imgh, imgh, cc_stringformat);
	gb.SetTextRenderingHint(0);
	images.playing_ico.ReleaseGraphics(gb);

	images.star_h_playing = gdi.CreateImage(imgh, imgh);
	gb = images.star_h_playing.GetGraphics();
	gb.SetTextRenderingHint(4);
	gb.DrawString("\uF005", fn_ico1, g_color_playing_txt, 0, 0, imgh, imgh, cc_stringformat);
	gb.SetTextRenderingHint(0);
	images.star_h_playing.ReleaseGraphics(gb);
	
	images.star_playing = gdi.CreateImage(imgh, imgh);
	gb = images.star_playing.GetGraphics();
	gb.SetTextRenderingHint(4);
	gb.DrawString("\uF005", fn_ico1, color_playing_alpha, 0, 0, imgh, imgh, cc_stringformat);
	gb.SetTextRenderingHint(0);
	images.star_playing.ReleaseGraphics(gb);
	
	images.mood_ico_playing = gdi.CreateImage(imgh, imgh*2);
	gb = images.mood_ico_playing.GetGraphics();
	gb.SetTextRenderingHint(4);
	gb.DrawString("\uF004", fn_ico2, color_playing_alpha, 0, 0, imgh, imgh, cc_stringformat);
	gb.DrawString("\uF004", fn_ico2, g_color_playing_txt, 0, imgh, imgh, imgh, cc_stringformat);
	gb.SetTextRenderingHint(0);
	images.mood_ico_playing.ReleaseGraphics(gb);
}

function draw_beam_image() {
	var sbeam = gdi.CreateImage(500, 128);
	// Get graphics interface like "gr" in on_paint
	var gb = sbeam.GetGraphics();
	gb.FillEllipse(-250, 50, 1000, 640, g_color_highlight & 0x60ffffff);
	sbeam.ReleaseGraphics(gb);

	var beamA = sbeam.Resize(500 / 50, 128 / 50, 2);
	var beamB = beamA.Resize(500, 128, 2);
	return beamB;
};

function showhide_groupheader(){
	if (layout.showgroupheaders) {
		layout.showgroupheaders = 0;
	} else {
		layout.showgroupheaders = 1;
	};
	layout.config[layout.index][6] = layout.showgroupheaders.toString();
	layout.gopts[6] = layout.showgroupheaders.toString();
	save_layout();

	if (cGroup.collapsed_height > 0) {
		cGroup.collapsed_height = 0;
		cGroup.expanded_height = 0;
		// disable autocollapse when there is no group!
		layout.autocollapse = 0;
	} else {
		cGroup.collapsed_height = layout.collapsedHeight;
		cGroup.expanded_height = layout.expandedHeight;
	};

	// refresh playlist
	p.list.updateHandleList(plman.ActivePlaylist, false, true);
	p.list.setItems(2);
	p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
}

//=================================================// Queue Playlist features

function isQueuePlaylistActive() {
	var queue_pl_idx = isQueuePlaylistPresent();
	if (queue_pl_idx < 0) {
		return false;
	}
	else if (plman.ActivePlaylist == queue_pl_idx) {
		return true;
	}
	else {
		return false;
	};
};

function isQueuePlaylistPresent() {
	for (var i = 0; i < plman.PlaylistCount; i++) {
		if (plman.GetPlaylistName(i) == "播放队列") return i;
	};
	return -1;
};

function CheckPlaylistQueue() {
	var total_pl = plman.PlaylistCount;
	var queue_pl_idx = isQueuePlaylistPresent();
	if (queue_pl_idx < 0) {
		plman.CreatePlaylist(total_pl, "播放队列");
		queue_pl_idx = total_pl;
		var vbarr = plman.GetPlaybackQueueContents();
		var q_handlelist = plman.GetPlaylistSelectedItems(-1);
		for (var i = 0; i < p.list.queue_total; i++) {
			q_handlelist.Add(vbarr[i].Handle);
		};
		plman.InsertPlaylistItems(queue_pl_idx, i, q_handlelist, false);
	}
	plman.ActivePlaylist = queue_pl_idx;
};

function on_playback_queue_changed(origin) {
	if (!cList.addToQueue_timer) {
		g_delay_refresh_items = true;
		let vbarr = plman.GetPlaybackQueueContents();
		p.list.queue_total = vbarr.length;
		switch (origin) {
		case 0:
			// changed_user_added
			var total_pl = plman.PlaylistCount;
			var queue_pl_idx = isQueuePlaylistPresent();
			if (queue_pl_idx < 0) {
				// 队列列表不存在：仅在开关打开时创建
				if (queue_pl_on) {
					plman.CreatePlaylist(total_pl, "播放队列");
					queue_pl_idx = total_pl;
				}
			} else {
				plman.ClearPlaylist(queue_pl_idx);
			};
			// fill it
			if(queue_pl_idx > -1){
				var q_handlelist = plman.GetPlaylistSelectedItems(-1);
				for (var i = 0; i < p.list.queue_total; i++) {
					q_handlelist.Add(vbarr[i].Handle);
				};
				plman.InsertPlaylistItems(queue_pl_idx, 0, q_handlelist, false);
			}
			break;
		case 1:
			// changed_user_removed
			var queue_pl_idx = isQueuePlaylistPresent();
			if (queue_pl_idx < 0) {
				break;
			} else {
				plman.ClearPlaylist(queue_pl_idx);
			};
			// fill it
			if (p.list.queue_total > 0) {
				var q_handlelist = plman.GetPlaylistSelectedItems(-1);
				for (var i = 0; i < p.list.queue_total; i++) {
					q_handlelist.Add(vbarr[i].Handle);
				};
				plman.InsertPlaylistItems(queue_pl_idx, 0, q_handlelist, false);
			}
			else {
				plman.RemovePlaylist(queue_pl_idx);
			};
			break;
		case 2:
			// changed_playback_advance
			var queue_pl_idx = isQueuePlaylistPresent();
			if (queue_pl_idx < 0) {
				break;
			}
			else {
				if (p.list.queue_total > 0) {
					plman.ClearPlaylist(queue_pl_idx);
					// fill it
					var q_handlelist = plman.GetPlaylistSelectedItems(-1);
					for (var i = 0; i < p.list.queue_total; i++) {
						q_handlelist.Add(vbarr[i].Handle);
					};
					plman.InsertPlaylistItems(queue_pl_idx, 0, q_handlelist, false);
				}
				else { // remove queue playlist!
					plman.RemovePlaylist(queue_pl_idx);
				};
			};
			break;
		};

		cList.addToQueue_timer = window.SetTimeout(function() {
			window.ClearTimeout(cList.addToQueue_timer);
			cList.addToQueue_timer = false;
			g_delay_refresh_items = false;
			if (plman.ActivePlaylist == queue_pl_idx) {
				update_playlist(layout.collapseGroupsByDefault);
			}
			full_repaint();
		}, 250);
	};
};

//=================================================// Drag'n'Drop Callbacks

function on_drag_enter() {
	g_dragndrop_status = true;
	dragndrop.leave_flag = true;
};

function on_drag_leave() {
	g_dragndrop_status = false;
	p.list.buttonclicked = false;
	cScrollBar.timerID1 && window.ClearInterval(cScrollBar.timerID1);
	cScrollBar.timerID1 = false;
};

function on_drag_over(action, x, y, mask) {
	if (g_dragndrop_status) {
		// Dragn Drop
		if (y < p.list.y) {
			action.Effect = 0;
			if (!p.list.buttonclicked) {
				p.list.buttonclicked = true;
				if (!cScrollBar.timerID1) {
					cScrollBar.timerID1 = window.SetInterval(function() {
					on_mouse_wheel(1);
					}, 30);
				};
			} else {
				full_repaint();
			};
		} else {
			cScrollBar.timerID1 && window.ClearInterval(cScrollBar.timerID1);
			cScrollBar.timerID1 = false;
			p.list.buttonclicked = false;
			
			if(!action.IsInternal) {
				dragndrop.drag_id = plman.PlaylistItemCount(plman.ActivePlaylist);
				plman.ClearPlaylistSelection(plman.ActivePlaylist);
			}
			action.Effect = 1;
			//g_dragndrop_bottom = false;
			if (!dragndrop.timerID) {
				dragndrop.timerID = window.SetTimeout(function() {
				p.list.check("drag_over", x, y);
				if(g_dragndrop_bottom) {
					dragndrop.drop_id = plman.PlaylistItemCount(plman.ActivePlaylist) - 1;
				}
				full_repaint();
				dragndrop.timerID && window.ClearTimeout(dragndrop.timerID);
				dragndrop.timerID = false;
				}, 50);
			};
			if (y > p.list.y + p.list.h && !g_dragndrop_bottom) {
				if (!p.list.buttonclicked) {
					p.list.buttonclicked = true;
					if (!cScrollBar.timerID1) {
						cScrollBar.timerID1 = window.SetInterval(function() {
						on_mouse_wheel(-1);
						}, 30);
					};
				}
			}
		};
	};
};

function on_drag_drop(action, x, y, mask) {
	if (y < p.list.y) {
		action.Effect = 0;
	} else if (action.IsInternal) {
		action.Effect = 0; 
    } else {
		if (plman.ActivePlaylist > -1 && plman.IsPlaylistLocked(plman.ActivePlaylist)) {
			action.Effect = 0;
			fb.ShowPopupMessage("  错误信息\n----------------\n当前播放列表是智能列表或已被锁定，不可以手动添加音轨.", "不允许的操作");
		} else if (plman.PlaylistCount == 0 || plman.ActivePlaylist == -1) {
			var count = plman.PlaylistCount;
			plman.CreatePlaylist(count, "拖入的项目");
			action.Playlist = count;
			action.Base = 0;
			action.ToSelect = true;
			action.Effect = 1;
		} else {
			action.Playlist = plman.ActivePlaylist;
			if(g_dragndrop_bottom) action.Base = dragndrop.drop_id + 1;
			else action.Base = dragndrop.drop_id;
			action.ToSelect = true;
			action.Effect = 1;
			if(g_dragndrop_bottom) plman.SetPlaylistFocusItem(plman.ActivePlaylist, plman.PlaylistItemCount(plman.ActivePlaylist) - 1);
		}
		
	}
	cScrollBar.timerID1 && window.ClearInterval(cScrollBar.timerID1);
	cScrollBar.timerID1 = false;
	p.list.buttonclicked = false;
	g_dragndrop_bottom = false;
	g_dragndrop_status = false;
	dragndrop.leave_flag = false;
	dragndrop.drop_id = -1;
	full_repaint();
};

function createDragText(line1, line2){
	var img_h = z(62), img_w = z(100);
	var drag_img = gdi.CreateImage(img_w, img_h);
    var gb = drag_img.GetGraphics();
	gb.FillSolidRect(0,0,img_w,img_h,g_color_normal_txt);
	gb.SetSmoothingMode(1);
	gb.FillGradRect(5,img_h/2,img_w-10, 1, 0, g_color_normal_txt, g_color_normal_bg, 0.5);
	gb.SetSmoothingMode(0);
	gb.SetTextRenderingHint(5);
	gb.DrawString(line1, g_font, g_color_normal_bg, 0, 0, img_w, img_h/2, cc_stringformat);
	gb.DrawString(line2, g_font, g_color_normal_bg, 0, img_h/2, img_w, img_h/2, cc_stringformat);
	drag_img.ReleaseGraphics(gb);
	return drag_img;
};

function refresh_cover(recache){
	var fin = p.list.groups.length;
    for(var i = 0; i < fin; i++) {
		p.list.groups[i].load_requested = 0;
	}
	if(recache) g_image_cache = new image_cache;
	//CollectGarbage();
	full_repaint();
}

function get_misccfg(){
	cRow.default_playlist_h = cfg_map.LineHeight;
	cList.scrollstep = cfg_map.ScrollStep;
	if(!cfgexist){ // common.cfg 不存在：写入默认值
		save_defaultcfg();
	}
}

function common_cfg_write() { // common.cfg：JSON 文本，整文件覆盖（仅本面板写入，其余面板只读）
	utils.WriteTextFile(fb.ProfilePath + "foobox\\data\\common.cfg", JSON.stringify(cfg_map, null, 3));
}

function save_defaultcfg(){
	common_cfg_write();
}

function save_config(name, value) {
	cfg_map[name] = value;
	common_cfg_write();
}

function get_layout(){
	// 布局数据：pv.db 的 layout 表，每行一个布局 {id, config, columnWidth}，仅此一次读库
	var rows = [];
	try {
		if (utils.FileExists(pv_db_path)) {
			var db = utils.OpenDatabase(pv_db_path);
			rows = db.Query('SELECT id, config, columnWidth FROM "layout" ORDER BY rowid');
		}
	} catch (e) { // 表不存在等情况
		console.log('jsplaylist: read pv.db failed: ' + e.message);
		rows = [];
	}
	if (rows.length > 0) {
		layout.ids = [];
		layout.config = [];
		layout.columnWidth = [];
		for (var i = 0; i < rows.length; i++){
			layout.ids.push(rows[i].id);
			layout.config.push(rows[i].config.split(","));
			layout.columnWidth.push(rows[i].columnWidth); // 缺省时为 ""（falsy，与原 null 语义一致）
		}
		layout.index = layout.ids.indexOf(layout.playlistName);
		if(layout.index > -1) layout.uid = layout.playlistName;
		else {
			layout.uid = "默认布局";
			layout.index = 0;
		}
	} else {
		var default_gopts = ["0","1","0","2","1","0","1","0"];
		layout.config.push(default_gopts);
		layout.columnWidth.push(null);
	}
	layout.gopts = layout.config[layout.index];
	assign_gopts();
}

function get_layout_cache(plname){
	var old_index = layout.index;
	layout.index = layout.ids.indexOf(plname);
	if(layout.index > -1)
		layout.uid = plname;
	else {
		layout.uid = "默认布局";
		layout.index = 0;
	}
	if(old_index != layout.index){
		layout.gopts = layout.config[layout.index];
		assign_gopts();
	}
}

function assign_gopts(){
	if(!layout.gopts) {
		layout.pattern_idx = 0;
		layout.showCover = 1;
		layout.autocollapse = 0;
		layout.collapsedHeight = 2;
		layout.expandedHeight = 1;
		layout.collapseGroupsByDefault = 0;
		layout.showgroupheaders = 1;
		layout.enableExtraLine = 0;
	} else {
		layout.pattern_idx = Number(layout.gopts[0]);
		layout.showCover = Number(layout.gopts[1]);
		layout.autocollapse = Number(layout.gopts[2]);
		layout.collapsedHeight = Number(layout.gopts[3]);
		layout.expandedHeight = Number(layout.gopts[4]);
		layout.collapseGroupsByDefault = Number(layout.gopts[5]);
		layout.showgroupheaders = Number(layout.gopts[6]);
		layout.enableExtraLine = Number(layout.gopts[7]);
		if(!layout.showgroupheaders){
			layout.autocollapse = 0;
			layout.collapseGroupsByDefault = 0;
		}
	}
	get_covercahe_config();
}

function save_layout(){
	// 布局数据写入 pv.db：清空后按数组顺序整表重写（rowid 顺序即数组顺序）
	try {
		var db = pv_db_open();
		db.Exec('CREATE TABLE IF NOT EXISTS "layout" (id TEXT PRIMARY KEY, config TEXT, columnWidth TEXT)');
		db.Exec('DELETE FROM "layout"');
		for (var i = 0; i < layout.ids.length; i++){
			var cw = layout.columnWidth[i];
			if (cw == null || cw == "null") cw = ""; // 缺省列宽统一存空串（原文本 null 会产生 "null" 字符串，此处顺带修正）
			db.Exec('INSERT OR REPLACE INTO "layout" (id, config, columnWidth) VALUES (?, ?, ?)', [layout.ids[i], layout.config[i].join(","), cw]);
		}
	} catch (e) {
		console.log('jsplaylist: save pv.db failed: ' + e.message);
	}
}

function get_grprow_minimum(column_w){
	cGroup.count_minimum_pre = cGroup.count_minimum;
	if (column_w > 0) {
		cGroup.count_minimum = Math.ceil(column_w / cTrack.height);
		if (cGroup.count_minimum < cGroup.default_count_minimum) cGroup.count_minimum = cGroup.default_count_minimum;
	} else {
		cGroup.count_minimum = cGroup.default_count_minimum;
	}
	cover.previous_max_size = column_w;
}

function get_next_nonempty(idx){
	if(idx == plman.PlaylistCount - 1) idx = 0;
	else idx += 1;
	for (var i = idx; i < plman.PlaylistCount; i++) {
		if(plman.PlaylistItemCount(i) > 0) return i;
	}
	return 0;
}

function get_covercahe_config(){
	switch (layout.pattern_idx) {
		case 0:
			albumart_id = AlbumArtId.front;
			cache_subdir = "album\\";
			break;
		case 1:
			albumart_id = AlbumArtId.front;
			cache_subdir = "artist_album\\";
			break;
		case 2:
		case 3:
			albumart_id = AlbumArtId.artist;
			cache_subdir = "artist\\";
			break;
		case 4:
		case 5:
			albumart_id = 5;
			cache_subdir = "genre_dir\\";
			break;
		default:
			albumart_id = AlbumArtId.front;
			cache_subdir = "album\\";
	};
	// Load cached cover keys from SQLite albumart.db (worker)
	crc_reset(null);
	if (cover_worker) {
		cover_worker.postMessage({ cmd: 'load_keys', table: get_table_name(cache_subdir) });
	}
}

function on_script_unload() {
	g_timer && window.ClearInterval(g_timer);
	g_timer = false;
	if (cover_worker) {
		cover_worker.terminate();
		cover_worker = null;
	}
};