//foobox https://github.com/dream7180; JSPlaylist http://br3tt.deviantart.com
window.DefinePanel('JSPlaylist', {author: 'Br3tt, dreamawake(MOD), always_beta(CN)', version: '1.3.2', features: {drag_n_drop: true} });
include(fb.ProfilePath + 'foobox\\script\\js_common\\common.js');
include(fb.ProfilePath + 'foobox\\script\\js_common\\JScommon.js');
include(fb.ProfilePath + 'foobox\\script\\js_common\\JSinputbox.js');
include(fb.ProfilePath + 'foobox\\script\\js_common\\Genre.js');
include(fb.ProfilePath + 'foobox\\script\\js_panels\\jsplaylist\\WSHscrollbar.js');
include(fb.ProfilePath + 'foobox\\script\\js_panels\\jsplaylist\\WSHheaderbar.js');
include(fb.ProfilePath + 'foobox\\script\\js_panels\\jsplaylist\\WSHplaylist.js');
include(fb.ProfilePath + 'foobox\\script\\js_panels\\jsplaylist\\WSHsettings.js');

var zdpi = 1;
var follow_cursor = window.GetProperty("foobox.infoArt.follow.cursor", false);
var rating2tag = window.GetProperty("foobox.rating.write.to.file", false);
var genre_cover_dir = fb.ProfilePath + "foobox\\genre";
var config_dir = fb.ProfilePath + "foobox\\config\\";
var dir_cover_name = window.GetProperty("foobox.cover.folder.name", "cover.jpg;folder.jpg");
var sys_scrollbar = window.GetProperty("foobox.ui.scrollbar.system", false);
var track_edit_app = "";
var color_bycover = window.GetProperty("foobox.color.by.cover", true);
var color_noesl = window.GetProperty("foobox.color.by.cover.except.ESL", false);
var show_extrabtn = window.GetProperty("foobox.show.Open.Stop.buttons", true);
var albcov_lt = window.GetProperty("Album.cover.ignoring.artist", false);
var libbtn_fuc = window.GetProperty("foobox.library.button: Show.Albumlist", true);
var queue_pl_on =  window.GetProperty("Playlist: Turn on queue playlist", false);
var title_add = "";
var radiom3u = "";
let dark_mode = 0;
let tab_collapse;
// GLOBALS
var g_script_version = "6.38 (Remastered)";
var g_version = g_script_version.substr(0, 1);
var g_textbox_tabbed = false;
var g_init_window = true;
var g_left_click_hold = false;
var g_selHolder = null;
var g_seconds = 0;
var	repaint_main1 = true,
	repaint_main2 = true,
	g_timer1 = false,
	g_timer2 = false;
var repaint_cover1 = true,
	repaint_cover2 = false;
var window_visible = false;
var g_mouse_wheel_timer = false;
//
var setting_init = false;
// drag'n drop from windows system
var g_dragndrop_status = false;
var g_dragndrop_bottom = false;
// font vars
var g_fname, g_fsize, g_fstyle;
var g_font = null;
var g_font_b = null;
var g_font_group1 = null;
var g_font_group2 = null;
var g_font_queue_idx;
var g_font_ud = null;
// color vars
var g_color_normal_bg = 0;
var g_color_star = 0;
var g_color_star_h = 0;
var g_color_selected_bg = 0;
var g_color_normal_txt = 0;
var g_color_selected_txt = 0;
var g_color_highlight = 0;
var c_default_hl = 0;
var c_divline = 0;
var g_color_playing_txt = RGB(255, 255, 255);
var g_color_line, g_color_line_div, g_group_header_bg, g_group_header_div;

// main window vars
var g_delay_refresh_items = false;
var g_avoid_on_item_focus_change = false;

//albumart
var albumart_id, cache_subdir;

var g_z2, g_z3, g_z4, g_z5, g_z6, g_z7, g_z8, g_z10, g_z12, g_z16, g_z30;
var ww = 0,
	wh = 0;
var mouse_x = 0,
	mouse_y = 0;
var g_metadb;
clipboard = {
	selection: null
};
var star_arr;

// WSH statistics globals
var g_track_type;
var repeat_pls = window.GetProperty("PLAYBACK: Repeat playlists", false);
var tf_length_seconds = fb.TitleFormat("%length_seconds_fp%");
var first_played = fb.TitleFormat("%first_played%");
var last_played = fb.TitleFormat("%last_played%");
var play_count = fb.TitleFormat("%play_count%");

//=================================================// main properties / parameters
properties = {
	enableTouchControl: window.GetProperty("SYSTEM.Enable Touch Scrolling", false),
	defaultPlaylistItemAction: window.GetProperty("SYSTEM.Default Playlist Action", "播放"),
	settingspanel: false,
	smoothscrolling: window.GetProperty("CUSTOM Enable Smooth Scrolling", true),
	selectionmenu: window.GetProperty("CUSTOM Enable Selection Menu", true),
	cursor_min: 25,
	cursor_max: 110,
	repaint_rate1: 20,
	repaint_rate2: 30,
	max_columns: 24,
	max_patterns: 25
};

layout = {
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
images = {
	playing_ico: null,
	selected_ico: null,
	mood_ico: null,
	sortdirection: null,
	nocover: null,
	stream: null,
	beam: null
};

// Fonts / Dpi / Colors / Images init

function system_init() {
	get_font();
	get_colors();
	get_metrics();
	get_images_static();
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
cRow = {
	default_playlist_h: window.GetProperty("SYSTEM.Playlist Row Height in Pixel", 33),
	playlist_h: 29,
	extra_line_h: window.GetProperty("SYSTEM.Playlist Extra-row Height in Pixel", 10),
//	headerBar_h: 26,
	settings_h: 30
};

p = {
	headerBar: null,
	list: null,
	settings: null,
	timer_onKey: false
};

cTouch = {
	down: false,
	y_start: 0,
	y_end: 0,
	down_id: 0,
	up_id: 0
};

cSettings = {
	visible: false,
	topBarHeight: 50,
	tabPaddingWidth: 2,
	rowHeight: cRow.settings_h,
	wheel_timer: false
};

cHeaderBar = {
	height: 26,
	borderWidth: 2,
	timerAutoHide: false,
	sortRequested: false
};

cScrollBar = {
	width: 12,
	buttonType: {
		cursor: 0,
		up: 1,
		down: 2
	},
	timerID: false,
	parentObjectScrolling: null,
	timerID1: false,
	timerID2: false,
	timerCounter: 0,
	timer_repaint: false
};

cTrack = {
	height: cRow.playlist_h
};

cGroup = {
	collapsed_height: 2,
	expanded_height: 1,
	default_count_minimum: window.GetProperty("*GROUP: Minimum number of rows in a group", 0),
	count_minimum: window.GetProperty("*GROUP: Minimum number of rows in a group", 0),
	count_minimum_pre: 0
};

cover = {
	show: true,
	keepaspectratio: window.GetProperty("CUSTOM.Cover keep ration aspect", true),
	load_timer: false,
	repaint_timer: false,
	margin: 2,
	w: 0,
	max_w: layout.collapsedHeight > layout.expandedHeight ? layout.collapsedHeight * cTrack.height : layout.expandedHeight * cTrack.height,
	h: 0,
	previous_max_size: -1,
	preload_timer: false,
	resized: false
};

cList = {
	search_string: "",
	incsearch_font: null,
	inc_search_noresult: false,
	clear_incsearch_timer: false,
	incsearch_timer: false,
	repaint_timer: false,
	scrollstep: window.GetProperty("SYSTEM.Playlist Scroll Step", 3),
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

dragndrop = {
	enabled: true,
	contigus_sel: null,
	drag_id: -1,
	drop_id: -1,
	timerID: false,
	clicked: false,
	leave_flag: false
};

columns = {
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

// Images cache
const load_image_from_cache = async (albumIndex, preload) =>
{
	try{
		var crc = p.list.groups[albumIndex].cachekey;
		const image = await gdi.LoadImageAsyncV2(0, fb.ProfilePath + "foobox\\covercache\\" + cache_subdir + crc + ".jpg");
		p.list.groups[albumIndex].cover_img = g_image_cache.getit(image, albumIndex);
		if (!preload && !cList.repaint_timer) {
			if (!cover.repaint_timer) {
				cover.repaint_timer = setInterval(() => {
					cover_repaint();
					clearInterval(cover.repaint_timer);
					cover.repaint_timer = null;
				}, 2);
			};
		};
	} catch(e) {}
}

const get_album_art_async = async (albumIndex) =>
{
	try{
		let result = await utils.GetAlbumArtAsyncV2(0, p.list.groups[albumIndex].metadb, albumart_id, false);
		p.list.groups[albumIndex].cover_img = g_image_cache.getit(result.image, albumIndex);
		if (!g_mouse_wheel_timer && !cScrollBar.timerID2 && !cList.repaint_timer) {
			if (!cover.repaint_timer) {
				cover.repaint_timer = setInterval(() => {
					if (!g_mouse_wheel_timer && !cScrollBar.timerID2 && !cList.repaint_timer) cover_repaint();
					clearInterval(cover.repaint_timer);
					cover.repaint_timer = null;
				}, 8);
			};
		}
	} catch(e) {}
}

image_cache = function() {
	this._cachelist = {};
	this.hit = function(albumIndex) {
		var _crc = p.list.groups[albumIndex].cachekey;
		var img = this._cachelist[_crc];
		if (typeof img == "undefined" || img == null) { // if image not in cache, we load it asynchronously
			var crc_exist = check_cache(albumIndex);
			if (crc_exist){
				if (!cover.load_timer) {
					cover.load_timer = window.SetTimeout(function() {
						try {
							p.list.groups[albumIndex].load_requested = 1;
							load_image_from_cache(albumIndex);
						} catch(e) {};
						cover.load_timer && window.ClearTimeout(cover.load_timer);
						cover.load_timer = false;
					}, (!g_mouse_wheel_timer && !cScrollBar.timerID2 ? 2 : 10));
				};
			}
			else if (!cover.load_timer) {
				cover.load_timer = window.SetTimeout(function() {
					try{
						if (layout.pattern_idx == 4) {
							var _path = genre_cover_dir + "\\" + GetGenre(fb.TitleFormat("%genre%").EvalWithMetadb(p.list.groups[albumIndex].metadb));
							var genre_img = gdi.Image( _path + ".jpg") || gdi.Image( _path + ".png");
							p.list.groups[albumIndex].load_requested = 1;
							img = g_image_cache.getit(genre_img, albumIndex);
							full_repaint();
						} else if (layout.pattern_idx == 5) {
							var _path = fb.TitleFormat("$directory_path(%path%)\\").EvalWithMetadb(p.list.groups[albumIndex].metadb);
							var dc_arr = dir_cover_name.split(";");
							for (var i = 0; i <= dc_arr.length; i++) {
								var dir_img = gdi.Image( _path + dc_arr[i]);
								p.list.groups[albumIndex].load_requested = 1;
								img = g_image_cache.getit(dir_img, albumIndex);
								if(img != null) break;
							}
								full_repaint();
						}
						else {
							p.list.groups[albumIndex].load_requested = 1;
							get_album_art_async(albumIndex);
						}
					} catch(e) {};
					cover.load_timer && window.ClearTimeout(cover.load_timer);
					cover.load_timer = false;
				}, (!g_mouse_wheel_timer && !cScrollBar.timerID2 ? 5 : 10));
			}
		} else p.list.groups[albumIndex].load_requested = 1;
		return img;
	};
	
	this.getit = function(image, albumIndex) {
		var cw = (p.headerBar.columns[0].w >0) ? ((p.headerBar.columns[0].w <= cover.max_w) ? cover.max_w : p.headerBar.columns[0].w) : cover.max_w;
		var ch = cw;
		var img;
		if (cover.keepaspectratio) {
			if (!image) {
				var pw = cw + cover.margin * 2;
				var ph = ch + cover.margin * 2;
			}
			else {
				if (image.Height >= image.Width) {
					var ratio = image.Width / image.Height;
					var pw = (cw + cover.margin * 2) * ratio;
					var ph = ch + cover.margin * 2;
				}
				else {
					var ratio = image.Height / image.Width;
					var pw = cw + cover.margin * 2;
					var ph = (ch + cover.margin * 2) * ratio;
				};
			};
		}
		else {
			var pw = cw + cover.margin * 2;
			var ph = ch + cover.margin * 2;
		};
		// cover.type : 0 = nocover, 1 = external cover, 2 = embedded cover, 3 = stream
		if (p.list.groups[albumIndex].metadb) {
			img = FormatCover(image, pw, ph, false);
			if (!img) img = null;
		};
		try{
			this._cachelist[p.list.groups[albumIndex].cachekey] = img;
		} catch(e){}
		return img;
	};
	
	this.preload = function(albumIndex) {
		var img = this._cachelist[p.list.groups[albumIndex].cachekey];
		if (typeof(img) == "undefined" || img == null) {
			var crc_exist = check_cache(albumIndex);
			if (crc_exist) {
				p.list.groups[albumIndex].load_requested = 1;
				load_image_from_cache(albumIndex, true);
			}
		} else {
			p.list.groups[albumIndex].load_requested = 1;
		}
		return img;
	}
};
var g_image_cache = new image_cache;

//=================================================// Cover tools

function FormatCover(image, w, h, rawBitmap) {
	if (!image || w <= 0 || h <= 0) return image;
	if (rawBitmap) {
		return image.Resize(w, h, 2).CreateRawBitmap();
	}
	else {
		return image.Resize(w, h, 2);
	};
};

function reset_cover_timers() {
	cover.load_timer && window.ClearTimeout(cover.load_timer);
	cover.load_timer = false;
};
// ================================================================================================== //

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
	p.headerBar && p.headerBar.setSize(0, 0, ww, cHeaderBar.height);
	p.headerBar.calculateColumns();
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
	g_z12 = z(12);
	g_z16 = z(16);
	g_z30 = z(30);
	star_arr = new Array(zdpi, 5.5*zdpi, 4.05*zdpi, 8.8*zdpi, 3.5*zdpi, 13*zdpi, 7.5*zdpi, 11.15*zdpi, 11.5*zdpi, 13*zdpi, 11*zdpi, 8.8*zdpi, 14*zdpi, 5.5*zdpi, 9.65*zdpi, 4.75*zdpi, 7.5*zdpi, 1*zdpi, 5.25*zdpi, 4.75*zdpi);
	properties.cursor_min = 25*zdpi;
	properties.cursor_max = sys_scrollbar ? 125*zdpi : 110*zdpi;
	cSettings.topBarHeight = z(50);
	cSettings.tabPaddingWidth = z(30/ 14);
	cSettings.rowHeight = Math.round(cRow.settings_h * zdpi);
	cHeaderBar.height = z(26);
	cScrollBar.width = sys_scrollbar ? get_system_scrollbar_width() : g_z12;
	cTrack.height = z(cRow.playlist_h);
}

//=================================================// Init
system_init();
function on_init() {
	window.DlgCode = DLGC_WANTALLKEYS;
	if (!utils.IsDirectory(fb.ProfilePath + "foobox\\config")) {
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		fso.CreateFolder(fb.ProfilePath + "foobox\\config");
	}
	// clear queue and queue playlist
	plman.FlushPlaybackQueue();
	ClearQueuePlaylist();

	get_playlist_layout_id();
	layout.playlistName = plman.GetPlaylistName(plman.ActivePlaylist);
	get_layout(layout.playlistName);
	tab_collapse = layout.collapseGroupsByDefault;
	
	get_misccfg();

	if (!layout.showgroupheaders) {
		cGroup.collapsed_height = 0;
		cGroup.expanded_height = 0;
	};
	
	InfoPane = new oInfoPane();
	p.list = new oList("p.list", plman.ActivePlaylist);
	p.headerBar = new oHeaderBar();
	p.headerBar.initColumns();
	p.scrollbar = new oScrollbar( /*cScrollBar.themed*/ );
	p.settings = new oSettings();

	if (!g_timer1) {
		g_timer1 = window.SetInterval(function() {
			if (!window.IsVisible) {
				window_visible = false;
				return;
			};
			if (!window_visible) {
				window_visible = true;
			};
			if (repaint_main1 == repaint_main2) {
				repaint_main2 = !repaint_main1;
				window.Repaint();
			};
		}, properties.repaint_rate1);
	}

	if (!g_timer2) {
		g_timer2 = window.SetInterval(function() {
			if (repaint_main1 == repaint_main2) {
				return;
			};
			if (!window.IsVisible) {
				window_visible = false;
				return;
			};
			var repaint_2 = false;
			if (!window_visible) {
				window_visible = true;
			};
			if (repaint_cover1 == repaint_cover2) {
				repaint_cover2 = !repaint_cover1;
				if (!cScrollBar.timerID2 && !g_mouse_wheel_timer) repaint_2 = true;
			};
			if (repaint_2) {
				if (!g_mouse_wheel_timer && !cScrollBar.timerID2 && !cList.repaint_timer) {
					var bigger_grp_height = (layout.expandedHeight > layout.collapsedHeight ? layout.expandedHeight : layout.collapsedHeight);
					if (p.headerBar.columns[0].percent > 0) {
						var cw = cover.margin + p.headerBar.columns[0].w;
					}
					else if (cover.show) {
						var cw = cover.margin + (cTrack.height * bigger_grp_height);
					};
					window.RepaintRect(p.list.x, p.list.y, cw, p.list.h);
				};
			};
		}, properties.repaint_rate2);
	}
};
on_init();

// OnSize

function on_size() {
	if (!window.Width || !window.Height) return;
	window.MinWidth = z(360);
	window.MinHeight = z(200);

	ww = window.Width;
	wh = window.Height;
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
					th = segment_h;
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
				gr.GdiDrawText(cList.search_string, cList.incsearch_font, RGB(0, 0, 0), p.list.tt_x + 1, p.list.tt_y + 1, p.list.tt_w, p.list.tt_h, ccf_txt);
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
			cover.max_w = (layout.collapsedHeight > layout.expandedHeight ? layout.collapsedHeight * cTrack.height : layout.expandedHeight * cTrack.height);
			cover.previous_max_size = p.headerBar.columns[0].w;
			//g_image_cache = new image_cache;// reset cache
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
					var cw = (p.headerBar.columns[0].w > 0) ? ((p.headerBar.columns[0].w <= cover.max_w) ? cover.max_w : p.headerBar.columns[0].w) : cover.max_w;
					var ch = cw;
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

function on_playlist_items_added(playlist_idx) {
	if (!g_delay_refresh_items) {
		if (playlist_idx == p.list.playlist) {
			update_playlist(layout.collapseGroupsByDefault);
			p.headerBar.resetSortIndicators();
			full_repaint();
		};
	};
};

function on_playlist_items_removed(playlist_idx, new_count) {
	if (!g_delay_refresh_items) {
		if (playlist_idx == p.list.playlist) {
			update_playlist(layout.collapseGroupsByDefault);
			p.headerBar.resetSortIndicators();
			full_repaint();
		};
	};
};

function on_playlist_items_reordered(playlist_idx) {
	if (!g_avoid_on_item_focus_change) {
		if (playlist_idx == p.list.playlist && p.headerBar.columnDragged == 0) {
			update_playlist(layout.collapseGroupsByDefault);
			p.headerBar.resetSortIndicators();
			full_repaint();
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
		g_metadb = (fb.IsPlaying || fb.IsPaused) ? fb.GetNowPlaying() : plman.PlaylistItemCount(plman.ActivePlaylist) > 0 ? fb.GetFocusItem() : false;
		if (g_metadb) {
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
	p.list.setItems(false);
	if(!fromhook && p.headerBar.columns[0].w >0) {
		var fin = p.list.groups.length;
    	for(var i = 0; i < fin; i++) {
			p.list.groups[i].load_requested = 0;
		}
	}
	full_repaint();
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
				refresh_cover();
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
					p.list.tt_x = ((p.list.w) / 2) - (((cList.search_string.length * z(13)) + (g_z10 * 2)) / 2);
					p.list.tt_y = p.list.y + Math.floor((p.list.h / 2) - g_z30);
					p.list.tt_w = ((cList.search_string.length * z(13)) + (g_z10 * 2));
					p.list.tt_h = z(60);
					cList.search_string = cList.search_string.substring(0, cList.search_string.length - 1);
					full_repaint();
					cList.clear_incsearch_timer && window.ClearTimeout(cList.clear_incsearch_timer);
					cList.clear_incsearch_timer = false;
					cList.incsearch_timer && window.ClearTimeout(cList.incsearch_timer);
					cList.incsearch_timer = window.SetTimeout(function() {
						p.list.incrementalSearch();
						window.ClearTimeout(cList.incsearch_timer);
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
					var cmd = properties.defaultPlaylistItemAction;
					if (cmd == "播放") {
						plman.ExecutePlaylistDefaultAction(act_pls, p.list.focusedTrackId);
					}
					else {
						fb.RunContextCommandWithMetadb(cmd, p.list.handleList[p.list.focusedTrackId], 0);
					};
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
								if (first_focus_id == null) fist_focus_id = k;
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
					plman.RemovePlaylistSelection(act_pls, false);
					plman.SetPlaylistSelectionSingle(act_pls, plman.GetPlaylistFocusItemIndex(act_pls), true);
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
									if (first_focus_id == null) fist_focus_id = k;
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

						plman.RemovePlaylistSelection(act_pls, false);
						plman.SetPlaylistSelectionSingle(act_pls, plman.GetPlaylistFocusItemIndex(act_pls), true);
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
				};
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
						window.ClearTimeout(cList.incsearch_timer);
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
			var idx = plman.PlayingPlaylist;
			plman.ActivePlaylist = get_next_nonempty(idx);
			plman.ExecutePlaylistDefaultAction(plman.ActivePlaylist, 0);
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
	/*get_font();
	get_metrics();
	get_images_static();
	get_images_color();
	p.headerBar.setButtons();	
	//setting_init = false;
	//p.settings.setFont();
	//p.settings.setButtons();
	full_repaint();*/
	window.Reload();
};

function on_colours_changed() {
	get_colors();
	get_images_color();
	p.headerBar.setButtons();
	if(p.list) {
		if (p.list.totalRows > p.list.totalRowVisible) {
			p.scrollbar.setButtons();
			p.scrollbar.setCursorButton();
		};
		p.list.setItemColors();
	};
	//if (cSettings.visible) {
	p.settings.refreshColors();
	p.settings.setButtons();
	//};
	full_repaint();
};

function on_notify_data(name, info) {
	switch (name) {
	case "show_Now_Playing":
		p.list.showNowPlaying();
		p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
		break;
	case "color_scheme_updated":
		var c_ol_tmp = g_color_highlight;
		if(info) g_color_highlight = RGB(info[0], info[1], info[2]);
		else {
			g_color_highlight = c_default_hl;
			g_color_normal_bg = g_color_normal_bg_default;
			g_color_selected_bg = g_color_selected_bg_default;
		}
		g_color_star_h = g_color_highlight;
		if(g_color_highlight != c_ol_tmp){
			if(info){
				if(dark_mode){
					var r = getRed(g_color_normal_bg) + 27;
					var g = getGreen(g_color_normal_bg) + 27;
					var b = getBlue(g_color_normal_bg) + 27;
					if(Math.abs(info[0]-r)<25 && Math.abs(info[0]-g)<25 && Math.abs(info[0]-b)<25) g_color_star_h = g_color_normal_txt;
					if(info.length == 3) {
						g_color_normal_bg = blendColors(g_color_normal_bg_default, RGB(info[0], info[1], info[2]), 0.24);
						g_color_selected_bg = blendColors(g_color_selected_bg_default, RGB(info[0], info[1], info[2]), 0.2);
					} else {
						g_color_normal_bg = blendColors(g_color_normal_bg_default, RGB(info[3], info[4], info[5]), 0.24);
						g_color_selected_bg = blendColors(g_color_selected_bg_default, RGB(info[3], info[4], info[5]), 0.2);
					}
				} else {
					if(g_color_normal_bg_default != 4294967295) {
						g_color_normal_bg = blendColors(g_color_normal_bg_default, RGB(info[0], info[1], info[2]), 0.24);
						g_color_selected_bg = blendColors(g_color_selected_bg_default, RGB(info[0], info[1], info[2]), 0.2);
					}
				}
			}
			get_images_color();
			if(p.list){
				p.list.lcolor_85 = blendColors(g_color_normal_txt, g_color_highlight, 0.85);
				p.list.lcolor_75 = blendColors(g_color_normal_bg, p.list.lcolor_85, 0.75);
			}
			full_repaint();
		}
		break;
	case "Playlist_Renamed":
		var pl_index = layout.ids.indexOf(info[0]);
		if(pl_index > 0){
			layout.ids[pl_index] = info[1];
			save_config("ids");
		}
		break;
	case "foobox_setting":
		show_setting(3);
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
	g_fstyle = g_font.Style;
	zdpi = g_fsize / 12;
	g_font_b = GdiFont(g_fname, g_fsize, 1);
	g_font_2 = GdiFont(g_fname, g_fsize - 1, g_fstyle);
	g_font_queue_idx = GdiFont("tahoma", z(11), 1);
	g_font_wd3_scrollBar = GdiFont("wingdings 3", z(10), 0);
	g_font_blank = GdiFont(g_fname, g_fsize + 4, 1);
	// group font
	g_font_group1 = GdiFont(g_fname, g_fsize + 4, 0);
	g_font_group1_bold = GdiFont(g_fname, g_fsize + 3, 1);
	g_font_group2 = GdiFont(g_fname, g_fsize + 2, 0);
	cList.incsearch_font = GdiFont(g_fname, g_fsize + 10, 1);
	g_font_ud = GdiFont(g_fname, g_fsize, 4);
};

function get_colors() {
	g_color_normal_bg_default = window.GetColourDUI(ColorTypeDUI.background);
	g_color_normal_bg = g_color_normal_bg_default;
	g_color_normal_txt = window.GetColourDUI(ColorTypeDUI.text);
	g_color_selected_txt = g_color_normal_txt;
	g_scroll_color = g_color_normal_txt & 0x95ffffff;
	g_color_selected_bg_default = window.GetColourDUI(ColorTypeDUI.selection);
	g_color_selected_bg = g_color_selected_bg_default;
	c_default_hl = window.GetColourDUI(ColorTypeDUI.highlight);
	g_color_highlight = c_default_hl;
	g_color_star = g_color_normal_txt & 0x2dffffff;
	g_color_star_h = g_color_highlight;
	if(isDarkMode(g_color_normal_bg)){
		dark_mode = 1;
		g_color_topbar = RGBA(0,0,0,30);
		g_color_line = RGBA(0, 0, 0, 25);
		g_color_line_div = RGBA(0, 0, 0, 55);
		g_group_header_bg = RGBA(0, 0, 0, 25);
		g_group_header_div = RGBA(255, 255, 255, 10);
		c_divline = blendColors(g_color_normal_bg, RGB(0,0,0), 0.4);
	}else{
		dark_mode = 0;
		g_color_topbar = RGBA(0,0,0,15);
		g_color_line = RGBA(0, 0, 0, 18);
		g_color_line_div = RGBA(0, 0, 0, 45);
		g_group_header_bg = RGBA(0, 0, 0, 8);
		g_group_header_div = RGBA(255, 255, 255, 50);
		c_divline = blendColors(g_color_normal_bg, RGB(0,0,0), 0.25);
	}
};

function get_images_color() {
	g_color_infopanebg = blendColors(g_color_selected_bg, g_color_normal_bg, 0.5);
	g_color_infopanebg = blendColors(g_color_infopanebg, g_color_highlight, 0.055);
	let mood_font = GdiFont("Segoe UI", Math.round(g_fsize*1.5), 0);
	
	imgh = Math.floor(15*zdpi);
	images.star = gdi.CreateImage(imgh, imgh);
	gb = images.star.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillPolygon(g_color_star, 0, star_arr);
	gb.SetSmoothingMode(0);
	images.star.ReleaseGraphics(gb);

	images.star_h = gdi.CreateImage(imgh, imgh);
	gb = images.star_h.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillPolygon(g_color_star_h, 0, star_arr);
	gb.SetSmoothingMode(0);
	images.star_h.ReleaseGraphics(gb);
	
	imgh = z(18);
	images.mood_ico = gdi.CreateImage(g_z16, imgh*2);
	gb = images.mood_ico.GetGraphics();
	gb.SetTextRenderingHint(4);
	gb.DrawString("♥", mood_font, g_color_star, 0, 0, g_z16, imgh, cc_stringformat);
	gb.DrawString("♥", mood_font, g_color_star_h, 0, imgh, g_z16, imgh, cc_stringformat);
	gb.SetTextRenderingHint(0);
	images.mood_ico.ReleaseGraphics(gb);
	
	images.beam = draw_beam_image();

	images.sortdirection = gdi.CreateImage(g_z7, g_z5);
	gb = images.sortdirection.GetGraphics();
	gb.SetSmoothingMode(2);
	var points_arr = new Array(g_z4,g_z4,zdpi,zdpi,g_z7,zdpi);
	gb.FillPolygon(g_color_normal_txt, 0, points_arr);
	gb.SetSmoothingMode(0);
	images.sortdirection.ReleaseGraphics(gb);
	
	imgh = z(14);
	images.selected_ico = gdi.CreateImage(imgh, imgh);
	gb = images.selected_ico.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawLine(g_z2, g_z8, g_z7, g_z12, 1, g_color_normal_txt);
	gb.DrawLine(g_z7, g_z12, z(13), g_z3, 1, g_color_normal_txt);
	gb.SetSmoothingMode(0);
	images.selected_ico.ReleaseGraphics(gb);
}

function get_images_static() {
	let gb, mood_font = GdiFont("Segoe UI", Math.round(g_fsize*1.5), 0), color_playing_alpha = g_color_playing_txt & 0x2dffffff;
	let imgh = z(14);
	let color_ico_bg = RGBA(130,130,130,30);
	let color_ico = RGBA(130,130,130,60);
	
	images.nocover = gdi.CreateImage(300, 300);
	gb = images.nocover.GetGraphics();
	gb.FillSolidRect(0, 0, 300, 300, color_ico_bg);
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(40, 40, 220, 220, 6, color_ico);
	gb.DrawEllipse(110, 110, 80, 80, 6, color_ico);
	gb.SetSmoothingMode(0);
	images.nocover.ReleaseGraphics(gb);
	
	stream_1 = gdi.CreateImage(100, 300);
	gb = stream_1.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(70, 80, 100, 100, 10, color_ico);
	gb.SetSmoothingMode(0);
	stream_1.ReleaseGraphics(gb);

	stream_2 = gdi.CreateImage(100, 300);
	gb = stream_2.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(-70, 80, 100, 100, 10, color_ico);
	gb.SetSmoothingMode(0);
	stream_2.ReleaseGraphics(gb);

	images.stream = gdi.CreateImage(300, 300);
	gb = images.stream.GetGraphics();
	gb.FillSolidRect(0, 0, 300, 300, color_ico_bg);
	gb.DrawImage(stream_1, 0, 0, 100, 300, 0, 0, 100, 300, 0, 255);
	gb.DrawImage(stream_2, 200, 0, 100, 300, 0, 0, 100, 300, 0, 255);
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(125, 105, 50, 50, 10, color_ico);
	gb.SetSmoothingMode(0);
	gb.FillSolidRect(145, 165, 10, 55, color_ico);
	images.stream.ReleaseGraphics(gb);
	
	images.playing_ico = gdi.CreateImage(g_z16, imgh*2);
	gb = images.playing_ico.GetGraphics();
	gb.SetSmoothingMode(2);
	var ponit_arr = new Array(g_z3,g_z2,g_z3,g_z12,z(13),g_z7);
	gb.FillPolygon(RGBA(255, 255, 255,100), 0, ponit_arr);
	ponit_arr = new Array(g_z3,g_z2+imgh,g_z3,g_z12+imgh,z(13),g_z7+imgh);
	gb.FillPolygon(RGBA(255, 255, 255,255), 0, ponit_arr);
	gb.SetSmoothingMode(0);
	images.playing_ico.ReleaseGraphics(gb);

	imgh = z(15);
	images.star_h_playing = gdi.CreateImage(imgh, imgh);
	gb = images.star_h_playing.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillPolygon(g_color_playing_txt, 0, star_arr);
	gb.SetSmoothingMode(0);
	images.star_h_playing.ReleaseGraphics(gb);
	
	images.star_playing = gdi.CreateImage(imgh, imgh);
	gb = images.star_playing.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillPolygon(color_playing_alpha, 0, star_arr);
	gb.SetSmoothingMode(0);
	images.star_playing.ReleaseGraphics(gb);
	
	imgh = z(18);
	images.mood_ico_playing = gdi.CreateImage(g_z16, imgh*2);
	gb = images.mood_ico_playing.GetGraphics();
	gb.SetTextRenderingHint(4);
	gb.DrawString("♥", mood_font, color_playing_alpha, 0, 0, g_z16, imgh, cc_stringformat);
	gb.DrawString("♥", mood_font, g_color_playing_txt, 0, imgh, g_z16, imgh, cc_stringformat);
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

function draw_blurred_image(image, ix, iy, iw, ih, bx, by, bw, bh, blur_value, overlay_color) {
	var blurValue = blur_value;
	var imgA = image.Resize(iw * blurValue / 100, ih * blurValue / 100, 2);
	var imgB = imgA.resize(iw, ih, 2);

	var bbox = gdi.CreateImage(bw, bh);
	// Get graphics interface like "gr" in on_paint
	var gb = bbox.GetGraphics();
	var offset = 90 - blurValue;
	gb.DrawImage(imgB, 0 - offset, 0 - (ih - bh) - offset, iw + offset * 2, ih + offset * 2, 0, 0, imgB.Width, imgB.Height, 0, 255);
	bbox.ReleaseGraphics(gb);

	var newImg = gdi.CreateImage(iw, ih);
	var gb = newImg.GetGraphics();

	if (ix != bx || iy != by || iw != bw || ih != bh) {
		gb.DrawImage(image, ix, iy, iw, ih, 0, 0, image.Width, image.Height, 0, 255);
		gb.FillSolidRect(bx, by, bw, bh, 0xffffffff);
	};
	gb.DrawImage(bbox, bx, by, bw, bh, 0, 0, bbox.Width, bbox.Height, 0, 255);

	// overlay
	if (overlay_color != null) {
		gb.FillSolidRect(bx, by, bw, bh, overlay_color);
	};

	// top border of blur area
	if (ix != bx || iy != by || iw != bw || ih != bh) {
		gb.FillSolidRect(bx, by, bw, 1, 0x22ffffff);
		gb.FillSolidRect(bx, by - 1, bw, 1, 0x22000000);
	};
	newImg.ReleaseGraphics(gb);

	return newImg;
};

function showhide_groupheader(){
	if (layout.showgroupheaders) {
		layout.showgroupheaders = 0;
	} else {
		layout.showgroupheaders = 1;
	};
	layout.config[layout.index][6] = layout.showgroupheaders.toString();
	layout.gopts[6] = layout.showgroupheaders.toString();
	save_config("config");

	if (cGroup.collapsed_height > 0) {
		cGroup.collapsed_height = 0;
		cGroup.expanded_height = 0;
		// disable autocollapse when there is no group!
		layout.autocollapse = false;
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

function ClearQueuePlaylist() {
	var current_pl = plman.ActivePlaylist;
	var queue_pl_idx = isQueuePlaylistPresent();
	if (queue_pl_idx >= 0) {
		plman.ActivePlaylist = queue_pl_idx;
		plman.RemovePlaylist(queue_pl_idx);
		plman.ActivePlaylist = current_pl < plman.PlaylistCount ? current_pl : current_pl - 1;
	};
};

function CheckPlaylistQueue() {
	var total_pl = plman.PlaylistCount;
	var queue_pl_idx = isQueuePlaylistPresent();
	if (queue_pl_idx < 0) {
		plman.CreatePlaylist(total_pl, "播放队列");
		queue_pl_idx = total_pl;
		var vbarr = plman.GetPlaybackQueueContents();
		var queue_total = vbarr.length;
		var q_handlelist = plman.GetPlaylistSelectedItems(-1);
		for (var i = 0; i < queue_total; i++) {
			q_handlelist.Add(vbarr[i].Handle);
		};
		plman.InsertPlaylistItems(queue_pl_idx, i, q_handlelist, false);
	}
	plman.ActivePlaylist = queue_pl_idx;
};

function on_playback_queue_changed(origin) {
	if (!cList.addToQueue_timer) {
		g_delay_refresh_items = true;
		switch (origin) {
		case 0:
			// changed_user_added
			var total_pl = plman.PlaylistCount;
			var queue_pl_idx = isQueuePlaylistPresent();
			if (queue_pl_idx < 0 && queue_pl_on) {
				plman.CreatePlaylist(total_pl, "播放队列");
				queue_pl_idx = total_pl;
			} else {
				plman.ClearPlaylist(queue_pl_idx);
			};
			// fill it
			if(queue_pl_idx > -1){
				var vbarr = plman.GetPlaybackQueueContents();
				var queue_total = vbarr.length;
				var q_handlelist = plman.GetPlaylistSelectedItems(-1);
				for (var i = 0; i < queue_total; i++) {
					q_handlelist.Add(vbarr[i].Handle);
				};
				plman.InsertPlaylistItems(queue_pl_idx, 0, q_handlelist, false);
			}
			break;
		case 1:
			// changed_user_removed
			var queue_pl_idx = isQueuePlaylistPresent();
			if (queue_pl_idx < 0) {
				return false;
			} else {
				plman.ClearPlaylist(queue_pl_idx);
			};
			// fill it
			var vbarr = plman.GetPlaybackQueueContents();
			var queue_total = vbarr.length;
			if (queue_total > 0) {
				var q_handlelist = plman.GetPlaylistSelectedItems(-1);
				for (var i = 0; i < queue_total; i++) {
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
				return false;
			}
			else {
				var vbarr = plman.GetPlaybackQueueContents();
				var queue_total = vbarr.length;
				if (queue_total > 0) {
					plman.ClearPlaylist(queue_pl_idx);
					// fill it
					var q_handlelist = plman.GetPlaylistSelectedItems(-1);
					for (var i = 0; i < queue_total; i++) {
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
			if (isQueuePlaylistActive()) {
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
					}, 5);
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
			if (y > p.list.h && !g_dragndrop_bottom) {
				if (!p.list.buttonclicked) {
					p.list.buttonclicked = true;
					if (!cScrollBar.timerID1) {
						cScrollBar.timerID1 = window.SetInterval(function() {
						on_mouse_wheel(-1);
						}, 5);
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

function check_cache(albumIndex) {
	var crc = p.list.groups[albumIndex].cachekey;
	if (utils.FileExists(fb.ProfilePath + "foobox\\covercache\\" + cache_subdir + crc + ".jpg")) {
		return true;
	}
	return false;
};

function refresh_cover(){
	var fin = p.list.groups.length;
    for(var i = 0; i < fin; i++) {
		p.list.groups[i].load_requested = 0;
	}
	g_image_cache = new image_cache;
	//CollectGarbage();
	full_repaint();
}

function get_playlist_layout_id(){
	var layout_id = "";
	try{
		layout_id = utils.ReadTextFile(config_dir + "layout_ids", 0);
	}catch(e){}
	if(!layout_id){
		utils.WriteTextFile(config_dir + "layout_ids", layout.ids);
	}else{
		layout.ids = layout_id.split("##");
	}
}

function get_misccfg(){
	var misccfg = "";
	try{
		misccfg = utils.ReadTextFile(config_dir + "misc", 0);
	}catch(e){}
	if(!misccfg){
		save_misccfg();
	}else{
		misccfg = misccfg.split("##");
		radiom3u = misccfg[0];
		if(radiom3u == "null") radiom3u = "";
		if(misccfg.length > 1) {
			track_edit_app = misccfg[1];
			if(track_edit_app == "null") track_edit_app = "";
			else if(track_edit_app == "") save_misccfg();
		} else {
			track_edit_app = "";
			save_misccfg();
		}
		if(misccfg.length > 2) {
			title_add = misccfg[2];
			if(title_add == "null") title_add = "";
			else if(title_add == "") save_misccfg();
		} else {
			title_add = "";
			save_misccfg();
		}
	}
}

function save_misccfg(){
	var _radiom3u = radiom3u;
	var _track_edit_app = track_edit_app;
	var _title_add = title_add;
	if(_radiom3u == "") _radiom3u = "null";
	if(_track_edit_app == "") _track_edit_app = "null";
	if(_title_add == "") _title_add = "null";
	utils.WriteTextFile(config_dir + "misc", _radiom3u + "##" + _track_edit_app + "##" + _title_add);
}

function get_layout(plname){
	var layoutcfg_arr = "";
	layout.index = layout.ids.indexOf(plname);
	if(layout.index > -1)
		layout.uid = plname;
	else {
		layout.uid = "默认布局";
		layout.index = 0;
	}
	try{
		layoutcfg_arr = utils.ReadTextFile(config_dir + "layout_config", 0);
	} catch(e){}
	if (layoutcfg_arr == "") {
		var default_gopts = ["0","1","0","2","1","0","1","0"];
		layout.config.push(default_gopts);
		layoutcfg_arr = default_gopts;
		for (var i = 1; i < layout.ids.length; i++){
			layoutcfg_arr = layoutcfg_arr + "##0,1,0,2,1,0,1,0";
			layout.config.push(default_gopts);
		}
		utils.WriteTextFile(config_dir + "layout_config", layoutcfg_arr);
		if(layout.ids.length > 1) reinit_config();
	} else{
		layout.config =layoutcfg_arr.split("##");
		for (var i = 0; i < layout.config.length; i++){
			layout.config[i] = layout.config[i].split(",");
		}
	}
	layout.gopts = layout.config[layout.index];
	assign_gopts();
	//get_column_width_percents
	try{
		var columns_width = utils.ReadTextFile(config_dir + "layout_columnWidth", 0);
		layout.columnWidth = columns_width.split("##");
	}catch(e){
		for (var i = 0; i < layout.ids.length; i++){
			layout.columnWidth.push(null);
		}
	}
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
	}
	get_covercahe_config();
}

function save_config(arrname){
	var config = eval("layout." + arrname);
	var tmp = config[0];
	for (var i = 1; i < config.length; i++){
		tmp = tmp + "##" + config[i];
	}
	utils.WriteTextFile(config_dir + "layout_" + arrname, tmp);
}

function reinit_config(){
	layout.config.splice(0, layout.config.length);
	var layoutcfg_arr = utils.ReadTextFile(config_dir + "layout_config", 0);
	layout.config =layoutcfg_arr.split("##");
	for (var i = 0; i < layout.config.length; i++){
		layout.config[i] = layout.config[i].split(",");
	}
}

function get_grprow_minimum(column_w){
	cGroup.count_minimum_pre = cGroup.count_minimum;
	if (column_w > 0) {
		cGroup.count_minimum = Math.ceil(column_w / cTrack.height);
		if (cGroup.count_minimum < cGroup.default_count_minimum) cGroup.count_minimum = cGroup.default_count_minimum;
		//if(reimgcache) g_image_cache = new image_cache;
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
			cache_subdir = albcov_lt ? "album\\" : "artist_album\\";
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
}

function on_script_unload() {
	g_timer1 && window.ClearInterval(g_timer1);
	g_timer1 = false;
	g_timer2 && window.ClearInterval(g_timer2);
	g_timer2 = false;
	ClearQueuePlaylist();
};