//foobox http://blog.sina.com.cn/dream7180
var fbx_set = [];
window.NotifyOthers("get_fbx_set", fbx_set);
var zdpi = fbx_set[9];
var ui_mode = fbx_set[11];
var random_color = fbx_set[12];
var esl_font_auto = fbx_set[16];
var esl_font_bold = fbx_set[17];
var follow_cursor = fbx_set[10];
var rating_to_tag = fbx_set[18];
var show_shadow = fbx_set[28];
//font
var g_font, g_font2, g_font_esl, font_size;
get_font();
var foo_spec = utils.CheckComponent("foo_uie_vis_channel_spectrum", true);
var is_mood = window.GetProperty("Display.Mood", true);
var spec_show_bg = window.GetProperty("Spectrum Background: Show bgcolor", true);
var spec_show_grid = window.GetProperty("Spectrum Background: Show grid", true);
var spec_grid_spacing = window.GetProperty("Spectrum Background: Grid spacing", 20);
var ESL_color_delay = window.GetProperty("ESL colorized delayed", 600);
if (spec_grid_spacing <= 0) spec_grid_spacing = 20;
var spec_h = Math.floor(font_size * 3 / 12) * 20;
if (spec_h > 300) spec_h = 300;
if (spec_h < 5) spec_h = 5;
spec_grid_spacing = Math.min(spec_grid_spacing, spec_h);
if (spec_h < 6 || !foo_spec) {
	spec_show_bg = false;
	spec_show_grid = false;
}
var g_metadb;
var top_padding = 0,
	left_padding = 10;
var rating_x, imgw = Math.floor(18*zdpi),
	imgh = imgw, mood_h = Math.floor(20*zdpi);
var text_bottom = Math.floor(80*zdpi);
g_tfo = {
	rating: fb.TitleFormat("%rating%"),
	title: fb.TitleFormat("$if2(%title%,)"),
	artist: fb.TitleFormat("$if2(%artist%,)"),
	album: fb.TitleFormat("$if(%album%,  |  %album%,)"),
	mood: fb.TitleFormat("%mood%"),
	codec: fb.TitleFormat("%codec%"),
	playcount: fb.TitleFormat("$if2(%play_count%,0)"),
	bitrate: fb.TitleFormat("$if(%codec_profile%, | %codec_profile% | %bitrate%,  | %bitrate%)")
}
var rating, mood = false,
	txt_title, txt_info, txt_profile, show_info = true;
var time_circle = Number(window.GetProperty("Info: Circle time, 3000~60000ms", 12000));
if (time_circle < 3000) time_circle = 3000;
if (time_circle > 60000) time_circle = 60000;
var rbutton = Array();
var esl_bg, esl_txt_normal, esl_txt_hight, fontcolor, fontcolor2, linecolor, icocolor;
var foo_playcount = utils.CheckComponent("foo_playcount", true);
var tracktype;
var img_rating_on, img_rating_off, btn_mood, mood_img;
var col_spec, col_grid;

get_colors();

var timer_esl_1 = window.SetTimeout(function() {
	set_esl_color();
	timer_esl_1 && window.ClearTimeout(timer_esl_1);
	timer_esl_1 = false;
}, 200); 

var timer_esl_2 = window.SetTimeout(function() {
	set_esl_color();
	timer_esl_2 && window.ClearTimeout(timer_esl_2);
	timer_esl_2 = false;
}, ESL_color_delay);
//确保esl已经载入

var pointArr = {
	p1: Array(9*zdpi, 1*zdpi, 6.4*zdpi, 5.6*zdpi, 1*zdpi, 6.6*zdpi, 4.6*zdpi, 10.6*zdpi, 4*zdpi, 16*zdpi, 9*zdpi, 13.6*zdpi, 14*zdpi, 16*zdpi, 13.4*zdpi, 10.6*zdpi, 17*zdpi, 6.6*zdpi, 11.6*zdpi, 5.6*zdpi),
	p2: Array(2*zdpi,1*zdpi,2*zdpi,16*zdpi,8*zdpi,12*zdpi,14*zdpi,16*zdpi,14*zdpi,1*zdpi),
	p3: Array(2*zdpi,1*zdpi+mood_h,2*zdpi,16*zdpi+mood_h,8*zdpi,12*zdpi+mood_h,14*zdpi,16*zdpi+mood_h,14*zdpi,1*zdpi+mood_h)
}

get_imgs();

TextBtn = function() {
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

var TextBtn_info = new TextBtn();
var TextBtn_spec = new TextBtn();

obtn_mood = function(){
	this.y = 0;
	this.w = imgw;
	this.h = mood_h;
	this.img = mood_img;
	this.isXYInButton = function(x, y) {
		return (x >= this.x && x <= this.x + this.w && y > this.y && y <= this.y + this.h) ? true : false;
	}
	this.Paint = function(gr) {
		gr.DrawImage(this.img, this.x, this.y, this.w, this.h, 0, mood ? 0 : this.h, this.w, this.h, 0);
	}
	this.resetImg = function(){
		this.img = mood_img;
	}
	this.setx= function(x){
		this.x = x;
	}
	this.OnClick = function() {
		if (!g_metadb) {
			mood = 0;
			return;
		}
		if (tracktype < 2){
			if (!mood) {
				if(g_metadb.UpdateFileInfoSimple("MOOD", getTimestamp()))
				mood = true;
			} else {
				if(g_metadb.UpdateFileInfoSimple("MOOD", ""))
				mood = false;
			}
		}
	}
}
var btn_mood = new obtn_mood();

initbutton();

var ww = 0, wh = 0, line2_w;
function on_size() {
	ww = window.Width;
	wh = window.Height;
	if(is_mood) {
		var spacing = Math.min(15, ww / 25);
	}else{
		var spacing = imgw;
	}
	var img_rating_w = imgw * 5 + spacing * 4;
	rating_x = (ww - img_rating_w) / 2;
	if(is_mood) btn_mood.setx(rating_x - btn_mood.w - spacing);
	for(var i = 0; i < rbutton.length; i++){
		rbutton[i].setx(rating_x + imgw * i + spacing * i);
	}
	line2_w = ww - 2 * left_padding;
	TextBtn_info.setSize(0, imgh + top_padding, ww, 60*zdpi);
	TextBtn_spec.setSize(0, wh - spec_h, ww, spec_h);
}
on_item_focus_change();

var line2_y = top_padding + imgh + 32*zdpi;

function on_paint(gr) {
	gr.FillSolidRect(0, 0, ww, wh, esl_bg);
	if (g_metadb) {
		for (var i = 1; i < rbutton.length + 1; i++) {
			rbutton[i - 1].Paint(gr, i);
		}
		if (is_mood) btn_mood.Paint(gr);
		gr.GdiDrawText(txt_title, g_font, fontcolor, left_padding, top_padding + imgh + 2*zdpi, ww - 2 * left_padding, 32*zdpi, cc_txt);
		var txt_line2 = (txt_info !="" && show_info) ? txt_info : txt_profile;
		gr.GdiDrawText(txt_line2, g_font2, fontcolor2, left_padding, line2_y, line2_w, 28*zdpi, cc_txt);
	}
	var line_w = Math.round(ww / 2);
	gr.FillGradRect(0, text_bottom - 1, line_w, 1, 0, RGBA(0, 0, 0, 0), RGBA(0, 0, 0, 65), 1.0);
	gr.FillGradRect(line_w, text_bottom - 1, line_w, 1, 0, RGBA(0, 0, 0, 65), RGBA(0, 0, 0, 0), 1.0);
	gr.FillSolidRect(line_w, text_bottom - 1, 1, 1, linecolor);
	
	if (fb.IsPlaying) {
		if(spec_show_bg){
			gr.FillSolidRect(0, wh - spec_h, ww, spec_h, col_spec);
		}
		if(spec_show_grid){
			var l_count = Math.floor(spec_h/spec_grid_spacing);
			for (var i = 1; i < l_count + 1; i++)
			gr.DrawLine(0, wh - spec_grid_spacing*i, ww, wh - spec_grid_spacing*i, 1, col_grid);
		}
	}

	gr.DrawLine(0, 0, 0, wh, 1, RGBA(0, 0, 0, 80));//100));
	//gr.DrawLine(1, 0, 1, wh, 1, RGBA(0, 0, 0, 60));
	//gr.DrawLine(2, 0, 2, wh, 1, RGBA(0, 0, 0, 30));
	//gr.DrawLine(3, 0, 3, wh, 1, RGBA(0, 0, 0, 15));

	gr.DrawLine(0, wh - 1, ww, wh - 1, 1, RGBA(0, 0, 0, 100));
	if(show_shadow){
		gr.DrawLine(0, wh - 2, ww, wh - 2, 1, RGBA(0, 0, 0, 60));
		gr.DrawLine(0, wh - 3, ww, wh - 3, 1, RGBA(0, 0, 0, 30));
		gr.DrawLine(0, wh - 4, ww, wh - 4, 1, RGBA(0, 0, 0, 15));
	}
}

function get_colors() {
	switch (ui_mode) {
	case (1):
		esl_bg = RGB(255,255,255);
		esl_txt_hight = fbx_set[6];
		esl_txt_normal = RGB(75, 75, 75);
		fontcolor = RGB(36, 36, 36);
		fontcolor2 = RGB(100, 100, 100);
		icocolor = RGBA(0,0,0,40);
		col_spec = RGBA(0,0,0,10);
		col_grid = RGBA(0,0,0,30);
		break;
	case (2):
		esl_bg = fbx_set[4];
		esl_txt_hight = fbx_set[6];
		esl_txt_normal = RGB(75, 75, 75);
		fontcolor = RGB(36, 36, 36);
		fontcolor2 = RGB(100, 100, 100);
		icocolor = RGBA(0,0,0,40);
		col_spec = RGBA(0,0,0,10);
		col_grid = RGBA(0,0,0,30);
		break;
	case (3):
		esl_bg = fbx_set[1];
		esl_txt_hight = fbx_set[5];
		esl_txt_normal = RGB(200, 200, 200);
		fontcolor = RGB(235, 235, 235);
		fontcolor2 = RGB(200, 200, 200);
		icocolor = RGBA(255,255,255,40);
		col_spec = RGBA(0,0,0,20);
		col_grid = RGBA(0,0,0,40);
		break;
	case (4):
		esl_bg = fbx_set[8];
		esl_txt_hight = fbx_set[5];
		esl_txt_normal = RGB(200, 200, 200);
		fontcolor = RGB(235, 235, 235);
		fontcolor2 = RGB(200, 200, 200);
		icocolor = RGBA(255,255,255,40);
		col_spec = RGBA(0,0,0,40);
		col_grid = RGBA(2,0,0,60);
		break;
	}
	linecolor = blendColors(esl_bg, RGB(0,0,0), 0.255);
}
function get_font() {
	font_size = fbx_set[14];
	g_font = GdiFont(fbx_set[13], fbx_set[14] + 2, 1);
	g_font2 = GdiFont(fbx_set[13], fbx_set[14], fbx_set[15]);
	g_font_esl = GdiFont(fbx_set[13], fbx_set[14], esl_font_bold ? 1 : fbx_set[15]);
	if (esl_font_auto) window.NotifyOthers("_eslyric_set_text_font_", g_font_esl);
}

function set_esl_color() {
	window.NotifyOthers("_eslyric_set_background_color_", esl_bg);
	window.NotifyOthers("_eslyric_set_text_color_normal_", esl_txt_normal);
	window.NotifyOthers("_eslyric_set_text_color_highlight_", esl_txt_hight);
}

function get_imgs() {
	var gb;
	img_rating_on = gdi.CreateImage(imgw, imgh);
	gb = img_rating_on.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillPolygon(esl_txt_hight, 0, pointArr.p1);
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
	gb.DrawPolygon(esl_txt_hight, 2, pointArr.p2);
	gb.DrawPolygon(icocolor, 2, pointArr.p3);
	gb.SetSmoothingMode(0);
	mood_img.ReleaseGraphics(gb);
}

function initbutton() {
	for(var i = 0; i < 5; i++){
		rbutton[i] = new ButtonUI_R();
	}
}

function on_mouse_lbtn_up(x, y) {
	for (var i = 1; i < rbutton.length + 1; i++) {
		rbutton[i - 1].MouseUp(x, y, i);
	}
	if (TextBtn_info.isXYInButton(x, y)) {
		if (fb.IsPlaying) {
			fb.RunMainMenuCommand("激活正在播放项目");
			window.NotifyOthers("show_Now_Playing", 1);
		}
	}
	if (is_mood && btn_mood.isXYInButton(x, y)) btn_mood.OnClick();
}

function on_mouse_lbtn_dblclk(x, y) {
	if (g_metadb && TextBtn_info.isXYInButton(x, y)) fb.RunContextCommandWithMetadb("属性", g_metadb);
}

function on_mouse_rbtn_up(x, y) {
	if (TextBtn_info.isXYInButton(x, y)) {
		var rMenu = window.CreatePopupMenu();
		rMenu.AppendMenuItem(MF_STRING, 3, "显示喜爱按钮");
		rMenu.CheckMenuItem(3, is_mood ? 1 : 0);
		rMenu.AppendMenuSeparator();
		rMenu.AppendMenuItem(MF_STRING, 1, "激活正在播放项目");
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		if(fso.FileExists(fb.FoobarPath +"assemblies\\Mp3tag\\Mp3tag.exe") && (tracktype < 2) && (follow_cursor || !fb.IsPlaying))
			rMenu.AppendMenuItem(MF_STRING, 4, "用Mp3tag编辑");
		rMenu.AppendMenuItem(MF_STRING, 2, "属性");
		rMenu.AppendMenuSeparator();
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
			if (g_metadb) fb.RunContextCommandWithMetadb("属性", g_metadb);
			break;
		case 3:
			is_mood = !is_mood;
			window.SetProperty("Display.Mood", is_mood);
			on_size();
			window.RepaintRect(0, top_padding, ww, top_padding + mood_h);
			break;
		case 4:
			var WshShell = new ActiveXObject("WScript.Shell");
			var obj_file = fb.Titleformat("%path%").EvalWithMetadb(g_metadb);
			WshShell.Run("\"" + fb.FoobarPath + "assemblies\\Mp3tag\\Mp3tag.exe" + "\" " + "\"" + obj_file + "\"", false);
			break;
		case 5:
			window.ShowProperties();
			break;
		}
		rMenu.Dispose();
	}
	if (TextBtn_spec.isXYInButton(x, y) && foo_spec) {
		var specMenu = window.CreatePopupMenu();
		specMenu.AppendMenuItem(MF_STRING, 11, "显示网格线");
		specMenu.CheckMenuItem(11, spec_show_grid ? 1 : 0);
		specMenu.AppendMenuItem(MF_STRING, 12, "填充背景色");
		specMenu.CheckMenuItem(12, spec_show_bg ? 1 : 0);
		specMenu.AppendMenuSeparator();
		specMenu.AppendMenuItem(MF_STRING, 13, "面板属性");
		var b = specMenu.TrackPopupMenu(x, y);
		switch (b) {
		case 11:
			spec_show_grid = !spec_show_grid;
			window.SetProperty("Spectrum Background: Show grid", spec_show_grid);
			window.RepaintRect(0, wh - spec_h, ww, spec_h);
			break;
		case 12:
			spec_show_bg = !spec_show_bg;
			window.SetProperty("Spectrum Background: Show bgcolor", spec_show_bg);
			window.RepaintRect(0, wh - spec_h, ww, spec_h);
			break;
		case 13:
			window.ShowProperties();
			break;
		}
		specMenu.Dispose();
	}
	return true;
}

function on_item_focus_change() {
	window.UnWatchMetadb();
	if (!follow_cursor && (fb.IsPlaying || fb.IsPaused)) g_metadb = fb.GetNowPlaying();
	else if (fb.GetFocusItem()) g_metadb = fb.GetFocusItem();
	else {
		g_metadb = null;
		window.RepaintRect(0, 0, ww, text_bottom);
	}
	if (g_metadb) {
		on_metadb_changed();
		window.WatchMetadb(g_metadb);
		tracktype = TrackType(g_metadb.rawpath.substring(0, 4));
		var track_len = fb.TitleFormat("%length%").EvalWithMetadb(g_metadb);
		if (!fb.IsPlaying && !fb.IsPaused) window.NotifyOthers("g_track_len", track_len);
		window.NotifyOthers("Track_Type_info", tracktype);
	}
}

function on_metadb_changed() {
	rating = g_tfo.rating.EvalWithMetadb(g_metadb);
	if (rating == "?") {
		rating = 0;
	}
	txt_title = g_tfo.title.EvalWithMetadb(g_metadb);
	txt_info = g_tfo.artist.EvalWithMetadb(g_metadb) + g_tfo.album.EvalWithMetadb(g_metadb);
	if(foo_playcount) txt_profile = g_tfo.codec.EvalWithMetadb(g_metadb) + g_tfo.bitrate.EvalWithMetadb(g_metadb) + "K | " + g_tfo.playcount.EvalWithMetadb(g_metadb) + "次";
	else txt_profile = g_tfo.codec.EvalWithMetadb(g_metadb) + g_tfo.bitrate.EvalWithMetadb(g_metadb) + "K";
	var l_mood = g_tfo.mood.EvalWithMetadb(g_metadb);
	if (l_mood != null && l_mood != "?") {
		mood = true;
	} else mood = 0;
	show_info = true;
	window.RepaintRect(0, 0, ww, text_bottom);
}

function on_playback_new_track(metadb) {
	on_item_focus_change();
	if(random_color != 0) window.RepaintRect(0, wh - spec_h, ww, spec_h);
	var track_len = fb.TitleFormat("%length%").EvalWithMetadb(g_metadb);
	window.NotifyOthers("g_track_len", track_len);
}

function on_playback_stop(metadb) {
	on_item_focus_change();
	window.RepaintRect(0, wh - spec_h, ww, spec_h);
}

function on_playlist_switch() {
	on_item_focus_change();
}


function on_notify_data(name, info) {
	switch (name) {
	case "set_font":
		fbx_set[13] = info[0];
		fbx_set[14] = info[1];
		fbx_set[15] = info[2];
		//get_font();
		window.Reload();
		break;
	case "Right_panel_follow_cursor":
		follow_cursor = Number(info);
		break;
	case "set_ui_mode":
		ui_mode = info;
		get_colors();
		set_esl_color();
		get_imgs();
		btn_mood.resetImg();
		window.Repaint();
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
		get_colors();
		set_esl_color();
		get_imgs();
		btn_mood.resetImg();
		window.Repaint();
		break;
	case "random_color_mode":
		random_color = info;
		break;
	case "set_eslfont_auto":
		esl_font_auto = info;
		get_font();
		break;
	case "set_eslfont_bold":
		esl_font_bold = info;
		get_font();
		break;
	case "set_rating_2_tag":
		rating_to_tag = info;
		break;
	case "panel_show_shadow":
		show_shadow = info;
		window.RepaintRect(0,wh-5,ww,5);
		break;
	}
}

var timer_cycle = false;

if (timer_cycle) {
	window.KillTimer(timer_cycle);
	timer_cycle = false;
}

timer_cycle = window.SetInterval(function() {
	show_info = !show_info;
	window.RepaintRect(left_padding, line2_y, line2_w, 28*zdpi);
}, time_circle);

/****************************************
 * DEFINE CLASS ButtonUI  for RATING
 *****************************************/
function ButtonUI_R() {
	this.y = top_padding;
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
		if (g_metadb) {
			if (x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height) {
				var derating_flag = (i == rating ? true : false);
				if (derating_flag) {
					if (foo_playcount) {
						if (rating_to_tag && tracktype < 2) g_metadb.UpdateFileInfoSimple("RATING", "");
						fb.RunContextCommandWithMetadb("Rating" + "/" + "<not set>", g_metadb) || fb.RunContextCommandWithMetadb("等级" + "/" + "<不设置>", g_metadb);
					} else if (tracktype < 2) g_metadb.UpdateFileInfoSimple("RATING", "");
				} else {
					if (foo_playcount) {
						if (rating_to_tag && tracktype < 2) g_metadb.UpdateFileInfoSimple("RATING", i);
						fb.RunContextCommandWithMetadb("Rating" + "/" + i, g_metadb) || fb.RunContextCommandWithMetadb("等级" + "/" + i, g_metadb);;
					} else if (tracktype < 2) g_metadb.UpdateFileInfoSimple("RATING", i);
				}
			}
		}
	}
}

function on_script_unload() {
	time_circle && window.ClearInterval(time_circle);
	time_circle = false;
}
//EOF