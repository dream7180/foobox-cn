//foobox http://blog.sina.com.cn/dream7180
var g_instancetype = window.InstanceType;
var ui_mode = window.GetProperty("foobox.UiMode", 0);
var ui_mode_num = ui_mode ? ui_mode : Math.floor(Math.random() * 4 + 1);
var ui_noborder = window.GetProperty("foobox.ui.noBorders", true);
var random_color = window.GetProperty("foobox.RandomColor", 0);
var follow_cursor = window.GetProperty("foobox.right-panels.follow.cursor", false);
var esl_font_auto = window.GetProperty("foobox.eslyric.font.auto", true);
var esl_font_bold = window.GetProperty("foobox.eslyric.font.bold", true);
var g_fname, g_fsize, g_fstyle, zdpi = 1;
var rating2tag = window.GetProperty("foobox.rating.write.to.file", false);
var album_front_disc = window.GetProperty("foobox.album.disc.front", false);
var album_cover_dir = window.GetProperty("foobox.cover.album.dir", "B:\\MusicArt\\Album");
var artist_cover_dir = window.GetProperty("foobox.cover.artist.dir", "B:\\MusicArt\\Artist");
var genre_cover_dir = window.GetProperty("foobox.cover.genre.dir", "B:\\MusicArt\\Genre");
var dir_cover_name = window.GetProperty("foobox.cover.dir.name", "cover");
var auto_sw = window.GetProperty("foobox.panels.switch.interlock", true);
var btn_fullscr = window.GetProperty("foobox.ui.fullscreen.button", false);
var show_shadow = window.GetProperty("foobox.ui.show.shadow", true);
var sys_scrollbar = window.GetProperty("foobox.ui.scrollbar.system", false);
var col_by_color = window.GetProperty("foobox.color.by.cover", true);

function get_font_sys() {
	var font_error = false;
	var default_font = null;

	if (g_instancetype == 0) {
		default_font = window.GetFontCUI(FontTypeCUI.items);
		g_font_headers = window.GetFontCUI(FontTypeCUI.labels);
	};
	else if (g_instancetype == 1) {
		default_font = window.GetFontDUI(FontTypeDUI.playlists);
		g_font_headers = window.GetFontDUI(FontTypeDUI.tabs);
	};

	// tweaks to fix a problem with WSH Panel Mod on Font object Name property
	try {
		g_fname = default_font.Name;
		g_fsize = default_font.Size;
		g_fstyle = default_font.Style;
	};
	catch (e) {
		fb.trace("WSH Panel Error: Unable to use the default font. Using Arial font instead.");
		g_fname = "arial";
		g_fsize = 12;
		g_fstyle = 0;
		font_error = true;
	};
	zdpi = g_fsize / 12;
};
get_font_sys();

var GetWnd = utils.CreateWND(window.ID);
var fb_hWnd = GetWnd.GetAncestor(2);

function set_uiborders() {
	if (ui_noborder) {
		fb_hWnd.Style &= ~0x400000;
		fb_hWnd.Style &= ~0x40000;
		fb_hWnd.Style &= ~0x800000;
		fb_hWnd.Style &= ~0x80000;
	} else {
		fb_hWnd.Style |= 0x400000;
		fb_hWnd.Style |= 0x40000;
		fb_hWnd.Style |= 0x800000;
		fb_hWnd.Style |= 0x80000;
	}
}
set_uiborders();

var rr, gg, bb;

function get_random_color() {
	rr = Math.floor(Math.random() * 255);
	gg = Math.floor(Math.random() * 255);
	bb = Math.floor(Math.random() * 255);
}

function reColor(r, g, b){
	var cols = r + g + b;
	if(cols < 50) return cols;
	else if(cols > 100 && cols < 675) return 255;
	var v1 = Math.abs(r - g), v2 = Math.abs(g - b), v3 = Math.abs(r - b);
	if(v1 > 15 || v2 > 15 || v3 > 15) return 255;
	else return cols;
}

var color_arr = [];

function set_default_color() {
	color_arr[0] = window.GetProperty("UI.fixed.color.bgdark", RGB(40, 40, 40)); //g_color_bg_dark
	color_arr[1] = window.GetProperty("UI.fixed.color.bgdarker", RGB(30, 30, 30)); //g_color_bg_darker
	color_arr[2] = window.GetProperty("UI.fixed.color.bgdarkest", RGB(10, 10, 10)); //g_color_bg_darkest
	color_arr[3] = window.GetProperty("UI.fixed.color.bglight", RGB(242, 242, 242)); //g_color_bg_light
	color_arr[4] = window.GetProperty("UI.fixed.color.bglightest", RGB(255, 255, 255)); //g_color_bg_lightest
	color_arr[5] = window.GetProperty("UI.fixed.color.bgactive", RGB(41, 138, 190)); //g_color_bg_active
	color_arr[6] = window.GetProperty("UI.fixed.color.bghighlight", RGB(41, 138, 190)); //g_color_bg_highlight
	color_arr[7] = window.GetProperty("UI.fixed.color.bgdselected", RGBA(0, 0, 0, 100)); //g_color_bg_selected
	color_arr[8] = window.GetProperty("UI.fixed.color.bgdarkest.right", RGB(20, 20, 20)); //g_color_bg_darkest_right
}

function reset_color() {
	color_arr[0] = RGB(40, 40, 40); //g_color_bg_dark
	color_arr[1] = RGB(30, 30, 30); //g_color_bg_darker
	color_arr[2] = RGB(10, 10, 10); //g_color_bg_darkest
	color_arr[3] = RGB(242, 242, 242); //g_color_bg_light
	color_arr[4] = RGB(255, 255, 255); //g_color_bg_lightest
	color_arr[5] = RGB(41, 138, 190); //g_color_bg_active
	color_arr[6] = RGB(41, 138, 190); //g_color_bg_highlight
	color_arr[7] = RGBA(0, 0, 0, 100); //g_color_bg_selected
	color_arr[8] = RGB(20, 20, 20); //g_color_bg_darkest_right
	save_color();
}

function save_color() {
	window.SetProperty("UI.fixed.color.bgdark", color_arr[0]); //g_color_bg_dark
	window.SetProperty("UI.fixed.color.bgdarker", color_arr[1]); //g_color_bg_darker
	window.SetProperty("UI.fixed.color.bgdarkest", color_arr[2]); //g_color_bg_darkest
	window.SetProperty("UI.fixed.color.bglight", color_arr[3]); //g_color_bg_light
	window.SetProperty("UI.fixed.color.bglightest", color_arr[4]); //g_color_bg_lightest
	window.SetProperty("UI.fixed.color.bgactive", color_arr[5]); //g_color_bg_active
	window.SetProperty("UI.fixed.color.bghighlight", color_arr[6]); //g_color_bg_highlight
	window.SetProperty("UI.fixed.color.bgdselected", color_arr[7]); //g_color_bg_selected
	window.SetProperty("UI.fixed.color.bgdarkest.right", color_arr[8]); //g_color_bg_darkest_right
}

if (random_color == 0) get_random_color();

function set_color(rr, gg, bb) {
	var cols = reColor(rr, gg, bb);
	if(cols < 101){
		var m = Math.min(rr, gg, bb, 10);
		var r1 = rr - m + 10, g1 = gg - m + 10, b1 = bb - m + 10;
		var n = ui_mode_num < 3 ? 3 : 4;
		color_arr[0] = RGB(r1 + 30, g1 + 30, b1 + 30); //g_color_bg_dark
		color_arr[1] = RGB(r1 + 20, g1 + 20, b1 + 20); //g_color_bg_darker
		color_arr[2] = RGB(r1, g1, b1); //g_color_bg_darkest
		color_arr[3] = RGB(242, 242, 242); //g_color_bg_light
		color_arr[4] = RGB(255, 255, 255); //g_color_bg_lightest
		color_arr[5] = RGB(r1 + n*40, g1 + n*40, b1 + n*40); //g_color_bg_active
		color_arr[6] = RGB(r1 + n*20, g1 + n*20, b1 + n*20);; //g_color_bg_highlight
		color_arr[7] = RGBA(20*n, 20*n, 20*n, 100); //g_color_bg_selected
		color_arr[8] = RGB(r1 + 10, g1 + 10, b1 + 10); //g_color_bg_darkest_right
	} else if(cols > 674){
		var m = Math.max(rr, gg, bb);
		m = m - 220;
		rr = rr - m;
		gg = gg - m;
		bb = bb - m;
		var rr1 = Math.min(255, rr + 30);
		var gg1 = Math.min(255, gg + 30);
		var bb1 = Math.min(255, bb + 30);
		var color_overlay = RGB(rr, gg, bb);
		color_arr[0] = blendColors(color_overlay, RGB(40, 40, 40), 0.7); //g_color_bg_dark
		color_arr[1] = blendColors(color_overlay, RGB(30, 30, 30), 0.7); //g_color_bg_darker
		color_arr[2] = blendColors(color_overlay, RGB(10, 10, 10), 0.9); //g_color_bg_darkest
		color_arr[3] = blendColors(color_overlay, RGB(242, 242, 242), 0.925); //g_color_bg_light
		color_arr[4] = blendColors(color_overlay, RGB(255, 255, 255), 0.925); //g_color_bg_lightest
		color_arr[5] = RGB(rr1, gg1, bb1); //g_color_bg_active
		color_arr[6] = blendColors(color_overlay, RGB(41, 138, 190), 0.3); //g_color_bg_highlight
		color_arr[7] = RGBA(rr, gg, bb, 100); //g_color_bg_selected
		color_arr[8] = blendColors(color_overlay, RGB(20, 20, 20), 0.9); //g_color_bg_darkest_right
	} else{
		var rr1 = Math.min(255, rr + 30);
		var gg1 = Math.min(255, gg + 30);
		var bb1 = Math.min(255, bb + 30);
		var color_overlay = RGB(rr, gg, bb);
		color_arr[0] = blendColors(color_overlay, RGB(40, 40, 40), 0.7); //g_color_bg_dark
		color_arr[1] = blendColors(color_overlay, RGB(30, 30, 30), 0.7); //g_color_bg_darker
		color_arr[2] = blendColors(color_overlay, RGB(10, 10, 10), 0.9); //g_color_bg_darkest
		color_arr[3] = blendColors(color_overlay, RGB(242, 242, 242), 0.925); //g_color_bg_light
		color_arr[4] = blendColors(color_overlay, RGB(255, 255, 255), 0.925); //g_color_bg_lightest
		color_arr[5] = RGB(rr1, gg1, bb1); //g_color_bg_active
		color_arr[6] = blendColors(color_overlay, RGB(41, 138, 190), 0.3); //g_color_bg_highlight
		color_arr[7] = RGBA(rr, gg, bb, 100); //g_color_bg_selected
		color_arr[8] = blendColors(color_overlay, RGB(20, 20, 20), 0.9); //g_color_bg_darkest_right
	}
}
if (random_color == 0) set_color(rr, gg, bb);
else set_default_color();
//

function on_notify_data(name, info) {
	switch (name) {
	case "get_fbx_set":
		info[0] = color_arr[0];
		info[1] = color_arr[1];
		info[2] = color_arr[2];
		info[3] = color_arr[3];
		info[4] = color_arr[4];
		info[5] = color_arr[5];
		info[6] = color_arr[6];
		info[7] = color_arr[7];
		info[8] = color_arr[8];
		info[9] = zdpi;
		info[10] = follow_cursor;
		info[11] = ui_mode_num;
		info[12] = random_color;
		info[13] = g_fname;
		info[14] = g_fsize;
		info[15] = g_fstyle;
		info[16] = esl_font_auto;
		info[17] = esl_font_bold;
		info[18] = rating2tag;
		info[19] = ui_noborder;
		info[20] = ui_mode;
		info[21] = album_front_disc;
		info[22] = album_cover_dir;
		info[23] = artist_cover_dir;
		info[24] = genre_cover_dir;
		info[25] = dir_cover_name;
		info[26] = auto_sw;
		info[27] = btn_fullscr;
		info[28] = show_shadow;
		info[29] = sys_scrollbar;
		info[30] = col_by_color;
		break;
	case "ui_mode":
		ui_mode = info;
		window.SetProperty("foobox.UiMode", ui_mode);
		ui_mode_num = ui_mode ? ui_mode : Math.floor(Math.random() * 4 + 1);
		window.NotifyOthers("set_ui_mode", ui_mode_num);
		break;
	case "random_color_mode":
		random_color = info;
		window.SetProperty("foobox.RandomColor", random_color);
		if(random_color == 1) {
			reset_color();
			window.NotifyOthers("set_random_color", color_arr);
		}
		else if(random_color == 2) {
			save_color();
		}
		break;
	case "Right_panel_follow_cursor":
		follow_cursor = info;
		window.SetProperty("Always follow cursor", follow_cursor);
		break;
	case "set_eslfont_auto":
		esl_font_auto = info;
		window.SetProperty("foobox.eslyric.font.auto", esl_font_auto);
		break;
	case "set_eslfont_bold":
		esl_font_bold = info;
		window.SetProperty("foobox.eslyric.font.bold", esl_font_bold);
		break;
	case "set_rating_2_tag":
		rating2tag = info;
		window.SetProperty("foobox.rating.write.to.file", rating2tag);
		break;
	case "set_ui_noborders":
		ui_noborder = info;
		window.SetProperty("foobox.ui.noBorders", ui_noborder);
		set_uiborders();
		break;
	case "set_album_cover":
		album_front_disc = info;
		window.SetProperty("foobox.album.disc.front", album_front_disc);
		break;
	case "set_album_dir":
		album_cover_dir = info;
		window.SetProperty("foobox.cover.album.dir", album_cover_dir);
		window.NotifyOthers("reload_cover_folder", 1);
		break;
	case "set_artist_dir":
		artist_cover_dir = info;
		window.SetProperty("foobox.cover.artist.dir", artist_cover_dir);
		window.NotifyOthers("reload_cover_folder", 1);
		break;
	case "set_genre_dir":
		genre_cover_dir = info;
		window.SetProperty("foobox.cover.genre.dir", genre_cover_dir);
		window.NotifyOthers("reload_cover_folder", 1);
		break;
	case "set_dir_name":
		dir_cover_name = info;
		window.SetProperty("foobox.cover.dir.name", dir_cover_name);
		window.NotifyOthers("reload_cover_folder", 1);
		break;
	case "set_panels_interlock":
		auto_sw = info;
		window.SetProperty("foobox.panels.switch.interlock", auto_sw);
		break;
	case "show_button_fullscreen":
		btn_fullscr = info;
		window.SetProperty("foobox.ui.fullscreen.button", btn_fullscr);
		break;
	case "panel_show_shadow":
		show_shadow = info;
		window.SetProperty("foobox.ui.show.shadow", show_shadow);
		break;
	case "scrollbar_width":
		sys_scrollbar = info;
		window.SetProperty("foobox.ui.scrollbar.system", sys_scrollbar);
		break;
	case "color_by_color":
		col_by_color = info;
		window.SetProperty("foobox.color.by.cover", col_by_color);
		break;
	case "get cover color":
		if(col_by_color){
			if(rr != info[0] || gg != info[1] || bb != info[2]){
			rr = info[0], gg = info[1], bb = info[2];
			set_color(rr, gg, bb);
			window.NotifyOthers("set_random_color", color_arr);
			}
		}
		break;
	case "none cover color":
		if(random_color == 0){
			get_random_color();
			set_color(rr, gg, bb);
			window.NotifyOthers("set_random_color", color_arr);
		} else if(random_color == 1){
			reset_color();
			window.NotifyOthers("set_random_color", color_arr);
		}
		break;
	}
};

function on_font_changed() {
	get_font_sys();
	zdpi = g_fsize / 12;
	var font_arr = [g_fname, g_fsize, g_fstyle, zdpi];
	window.NotifyOthers("set_font", font_arr);
};

function on_playback_new_track(metadb) {
	if (random_color == 0 && !col_by_color) {
		get_random_color();
		set_color(rr, gg, bb);
		window.NotifyOthers("set_random_color", color_arr);
	}
};