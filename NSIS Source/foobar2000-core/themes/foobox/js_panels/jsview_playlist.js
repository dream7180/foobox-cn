//foobox right panel simple playlist viewer for JSSB
var fbx_set = [];
window.NotifyOthers("get_fbx_set", fbx_set);
var zdpi = fbx_set[9],
ui_mode = fbx_set[11];
var ui_noborder = fbx_set[19];
var random_mode = fbx_set[12];
var show_shadow = fbx_set[28];
var sys_scrollbar = fbx_set[29];
var g_fname, g_fsize, g_fstyle;
var VK_SHIFT = 0x10, VK_CONTROL = 0x11;
var txt_format = DT_LEFT | DT_VCENTER | DT_NOPREFIX | DT_CALCRECT | DT_END_ELLIPSIS,
txt_format_c = DT_CENTER | DT_VCENTER | DT_NOPREFIX | DT_CALCRECT | DT_END_ELLIPSIS,
txt_format_r = DT_RIGHT | DT_VCENTER | DT_NOPREFIX | DT_CALCRECT | DT_END_ELLIPSIS;
var GetWnd = utils.CreateWND(window.ID);
var fb_hWnd = GetWnd.GetAncestor(2);
var title_type = window.GetProperty("List: Group type", 1);
if (title_type<1 || title_type>5) {
	title_type = 1;
	window.SetProperty("List: Group type", 1);
}
var cursor_min = 25*zdpi;
var cursor_max = sys_scrollbar ? 120*zdpi : 105*zdpi;
var show_active_pl = window.GetProperty("List: Show active playlist", false);
var playing_ico, imgw = Math.floor(16 * zdpi), imgh = Math.floor(14 * zdpi);
var tf_string = [];
tf_string[0] = fb.TitleFormat("$if2(%tracknumber%,)^^%title%^^%length%");
tf_string[1] = fb.TitleFormat("$if2(%tracknumber%,)^^%title%^^%length%^^$if2(%album%,单曲)");
tf_string[2] = fb.TitleFormat("$if2(%tracknumber%,)^^%title%^^%length%^^$if2(%album artist%,未知艺术家)");
tf_string[3] = fb.TitleFormat("$if2(%tracknumber%,)^^%title%^^%length%^^$if2(%artist%,未知艺术家)");
tf_string[4] = fb.TitleFormat("$if2(%tracknumber%,)^^%title%^^%length%^^$if2(%genre%,未知流派)");
tf_string[5] = fb.TitleFormat("$if2(%tracknumber%,)^^%title%^^%length%^^%directory%");
var m_x = 0, m_y = 0, ww = 0, wh = 0, scroll = 0, scroll_ = 0, scroll__ = 0, scroll___ = 0, time_dl = 0;
var time222 = (new Date()).getTime();
var time_s = fb.CreateProfiler();
var hold_scroll = false, check_scro_hover = false, repaint_main1 = true, repaint_main2 = true;
var g_timer = false;
var row_height = window.GetProperty("List: Row height", 35), total_h, list_h, margin_top;
row_height = Math.round(row_height * zdpi);
var pidx = -1;
var g_font, g_font2;
var bgcolor, fontcolor, fontcolor2, g_color_line, g_color_topbar;
var scrollstep = window.GetProperty("List: Scroll step", 6);
get_colors();
get_font();

olist = function() {
	this.list_dr = [];
	this.list = {};
	this.SHIFT_start_id = null;
	this.nowplaying = null;
	this.get_list = function(start) {
		this.activeindex = -1;
		if (start == null) {
			scroll = 0;
			start = 0;
		}
		var k = start, temp = "";
		var total = this.list.Count, metadb;
		while (k < total) {
			metadb = this.list.Item(k);
			this.id = k;
			if (show_active_pl) temp = tf_string[0].EvalWithMetadb(metadb).split("^^");
			else temp = tf_string[title_type].EvalWithMetadb(metadb).split("^^");
			this.list_dr.push({
				metadb: metadb,
				index: k + 1,
				string: temp
			});
			k++;
		}
		this.focus_id = plman.GetPlaylistFocusItemIndex(pidx);
		repaint_main1 = repaint_main2;
	}
	this.draw = function(gr) {
		gr.FillSolidRect(0, 0, ww, margin_top - 2, g_color_topbar);
		gr.FillSolidRect(0, margin_top, ww, 1, g_color_line);
		var _dr_len = this.list_dr.length;
		if (_dr_len == 0) return;
		var y_;
		this.start_ = Math.round(scroll_ / row_height + 0.4);
		this.end_ = Math.ceil((scroll_ + list_h) / row_height);
		this.end_ = (this.list_dr.length < this.end_) ? this.list_dr.length: this.end_;
		gcursor.vis = (this.list_dr.length * row_height > wh - row_height);
		var _title = "";
		var string_n = 3;
		var len_w = gr.CalcTextWidth("00:00:00", g_font);
		var len_w_rx = 10 + len_w + (gcursor.vis * gcursor.bar_w);
		var _x30 = 30 * zdpi;
		if (show_active_pl) _title = "当前列表：" + plman.GetPlaylistName(pidx);
		else {
			try {
				if (this.list_dr[0].string[string_n].toUpperCase() != this.list_dr[_dr_len - 1].string[string_n].toUpperCase()) _title = "所有项目";
				else _title = this.list_dr[this.start_].string[string_n];
			} catch(e) {}
		}
		gr.GdiDrawText(_title + " (" + _dr_len + ")", g_font2, fontcolor, 20, 0, ww - btn_w - 40, margin_top - 2, txt_format);
		for (var i = this.start_; i < this.end_; i++) {
			y_ = margin_top + row_height * i - scroll_;
			var y2_ = i * row_height + margin_top - scroll_;
			if (plman.IsPlaylistItemSelected(pidx, i)) {
				if (i == this.focus_id) gr.FillSolidRect(0, y2_, ww, row_height, g_color_selected_bg);
				else gr.FillSolidRect(0, y2_, ww, row_height, g_color_selected_bg & RGBA(255, 255, 255, 60))
			} else if (i == this.focus_id) gr.DrawRect(1, y2_, ww - 2, row_height, 2, g_color_selected_bg);
			var tracknum = show_active_pl ? this.list_dr[i].index : this.list_dr[i].string[0];
			if (fb.IsPlaying && plman.PlayingPlaylist == pidx) {
				var _playing = plman.GetPlayingItemLocation();
				if (i == _playing.PlaylistItemIndex) {
					gr.FillSolidRect(0, y2_, ww, row_height, g_color_highlight);
					gr.DrawImage(playing_ico, 15 + 7 * zdpi, y_ + (row_height - imgh) / 2, imgw, imgh, 0, 0, imgw, imgh, 0, 255);
					gr.GdiDrawText(this.list_dr[i].string[2], g_font, g_color_playing_txt, ww - len_w_rx, y_, len_w, row_height, txt_format_r);
					gr.GdiDrawText(this.list_dr[i].string[1], g_font, g_color_playing_txt, 30 + _x30, y_, ww - _x30 - 30 - len_w_rx, row_height, txt_format);
				} else {
					gr.GdiDrawText(tracknum, g_font, fontcolor2, 15, y_, _x30, row_height, txt_format_r);
					gr.GdiDrawText(this.list_dr[i].string[2], g_font, fontcolor, ww - len_w_rx, y_, len_w, row_height, txt_format_r);
					gr.GdiDrawText(this.list_dr[i].string[1], g_font, fontcolor, 30 + _x30, y_, ww - _x30 - 30 - len_w_rx, row_height, txt_format);
				}
			} else {
				gr.GdiDrawText(tracknum, g_font, fontcolor2, 15, y_, _x30, row_height, txt_format_r);
				gr.GdiDrawText(this.list_dr[i].string[2], g_font, fontcolor, ww - len_w_rx, y_, len_w, row_height, txt_format_r);
				gr.GdiDrawText(this.list_dr[i].string[1], g_font, fontcolor, 30 + _x30, y_, ww - _x30 - 30 - len_w_rx, row_height, txt_format);
			}
			gr.DrawLine(0, y2_ + row_height, ww, y2_ + row_height, 1, g_color_line);
		}
	}
	this.item_context_menu = function(x, y, albumIndex) {
		var _menu = window.CreatePopupMenu();
		var Context = fb.CreateContextMenuManager();
		var _child01 = window.CreatePopupMenu();
		_menu.AppendMenuItem((plman.IsAutoPlaylist(pidx) || plman.GetPlaylistName(pidx) == "播放队列")?MF_DISABLED|MF_GRAYED:MF_STRING, 800, "移除");
		_menu.AppendMenuSeparator();
		this.metadblist_selection = plman.GetPlaylistSelectedItems(pidx);
		Context.InitContext(this.metadblist_selection);
		Context.BuildMenu(_menu, 1, -1);
		_menu.AppendMenuItem(MF_STRING, 803, "用Mp3tag编辑");
		_child01.AppendTo(_menu, MF_STRING, "发送到...");
		_child01.AppendMenuItem(MF_STRING, 801, "新播放列表");
		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(MF_STRING, 802, "切换到树形媒体库");
		var pl_count = plman.PlaylistCount;
		if (pl_count > 1) {
			_child01.AppendMenuItem(MF_SEPARATOR, 0, "");
		};
		for (var i = 0; i < pl_count; i++) {
			if (i != pidx && !plman.IsAutoPlaylist(i)) {
				_child01.AppendMenuItem(MF_STRING, 1000 + i, plman.GetPlaylistName(i));
			}
		};
		var ret = _menu.TrackPopupMenu(x, y);
		if (ret > 0 && ret < 800) {
			Context.ExecuteByID(ret - 1);
		};
		else {
			switch (ret) {
			case 800:
				plman.RemovePlaylistSelection(pidx, false);
				break;
			case 801:
				fb.RunMainMenuCommand("文件/新建播放列表");
				plman.InsertPlaylistItems(plman.PlaylistCount - 1, 0, this.metadblist_selection, false);
				break;
			case 802:
				window.NotifyOthers("switch_plview_libtree", true);
				break;
			case 803:
				var WshShell = new ActiveXObject("WScript.Shell");
				var obj_file = fb.Titleformat("%path%").EvalWithMetadb(fb.GetFocusItem());
				WshShell.Run("\"" + fb.FoobarPath + "assemblies\\Mp3tag\\Mp3tag.exe" + "\" " + "\"" + obj_file + "\"", false);
				break;
			default:
				var insert_index = plman.PlaylistItemCount(ret - 1000);
				plman.InsertPlaylistItems((ret - 1000), insert_index, this.metadblist_selection, false);
			}
		}
		_child01.Dispose();
		_menu.Dispose();
		return true;
	}
	this.on_mouse = function(event, x, y) {
		switch (event) {
		case "down":
			if (this.list_dr.length == 0) return;
			var _y = y - margin_top;
			if (_y > 0 && _y < (this.end_ - this.start_) * row_height && x < ww - gcursor.vis * gcursor.bar_w) {
				this.activeindex = Math.min(Math.floor(_y / row_height) + this.start_, this.list_dr.length - 1);
				if (utils.IsKeyPressed(VK_SHIFT)) {
					if (this.SHIFT_start_id != this.activeindex) {
						if (glist.SHIFT_start_id != null) {
							SelectAtoB(glist.SHIFT_start_id, this.activeindex);
						} else {
							SelectAtoB(glist.focus_id, this.activeindex);
						}
					}
				} else if (utils.IsKeyPressed(VK_CONTROL)) {
					if (plman.IsPlaylistItemSelected(pidx, this.activeindex)) {
						plman.SetPlaylistSelectionSingle(pidx, this.activeindex, false);
					} else {
						plman.SetPlaylistFocusItem(pidx, this.activeindex);
						this.focus_id = this.activeindex;
						plman.SetPlaylistSelectionSingle(pidx, this.activeindex, true);
					}
					repaint_main1 = repaint_main2;
				} else {
					plman.SetPlaylistFocusItem(pidx, this.activeindex);
					this.focus_id = this.activeindex;
					plman.ClearPlaylistSelection(pidx);
					plman.SetPlaylistSelectionSingle(pidx, this.activeindex, true);
					repaint_main1 = repaint_main2;
				};
				this.SHIFT_start_id = this.activeindex;
			}
			break;
		case "dblclk":
			if (this.list_dr.length == 0) return;
			if (y > margin_top) {
				//plman.ActivePlaylist = pidx;
				//plman.ExecutePlaylistDefaultAction(pidx, this.activeindex);
				plman.ExecutePlaylistDefaultAction(plman.ActivePlaylist, plman.GetPlaylistFocusItemIndex(plman.ActivePlaylist));
			} else if (y < margin_top && x < ww - imgw - 1) {
				if (fb.IsPlaying && plman.PlayingPlaylist == pidx) this.show_playing();
				else this.show_focus();
			}
			break;
		case "right":
			if (this.list_dr.length == 0) return;
			var _y = y - margin_top;
			if (_y > 0 && _y < (this.end_ - this.start_) * row_height && x < ww - gcursor.vis * gcursor.bar_w) {
				this.activeindex = Math.min(Math.floor(_y / row_height) + this.start_, this.list_dr.length - 1);
				if (!plman.IsPlaylistItemSelected(pidx, this.activeindex)) {
					plman.ClearPlaylistSelection(pidx);
					plman.SetPlaylistSelectionSingle(pidx, this.activeindex, true);
					plman.SetPlaylistFocusItem(pidx, this.activeindex);
				}
				this.item_context_menu(x, y, this.activeIndex);
			}
			break
		}
	}
	this.show_playing = function() {
		if (!plman.PlayingPlaylist == pidx) return;
		if (fb.IsPlaying) {
			this.nowplaying = plman.GetPlayingItemLocation();
			if (this.nowplaying.PlaylistItemIndex < this.start_) {
				scroll -= row_height * (this.start_ - this.nowplaying.PlaylistItemIndex + 2);
				scroll = check_scroll(scroll);
			} else if (this.nowplaying.PlaylistItemIndex > (this.end_ - 2)) {
				scroll += row_height * (this.nowplaying.PlaylistItemIndex - this.end_ + 3) + row_height;
				scroll = check_scroll(scroll);
			}
		}
	}
	this.show_focus = function() {
		if (this.focus_id < this.start_) {
			scroll -= row_height * (this.start_ - this.focus_id + 2);
			scroll = check_scroll(scroll);
		} else if (this.focus_id > (this.end_ - 2)) {
			scroll += row_height * (this.focus_id - this.end_ + 3) + row_height;
			scroll = check_scroll(scroll);
		}
	}
}
ocursor = function() {
	this._h = 0;
	this._w = 4;
	this._y = 0;
	this.bar_w = sys_scrollbar ? utils.GetSystemMetrics(2) : 12*zdpi;
	this.vis = false;
	this._on = false;
}

var glist = new olist();
var gcursor = new ocursor();
var btn_w = Math.floor(24 * zdpi),
btn_h = Math.floor(12 * zdpi) + 12;
get_imgs();
get_imgs_static();

if (show_active_pl) btn_sw = new ButtonUI(img_plsw_2, "切换到视图列表");
else btn_sw = new ButtonUI(img_plsw, "切换到当前列表");

if (g_timer) {
	window.KillTimer(g_timer);
	g_timer = false;
}
g_timer = window.SetInterval(function() {
	on_timer_(20);
}, 20);

var timeout_initpl = window.SetTimeout(function() {
	glist.list = plman.GetPlaylistItems(check_pidx());
	glist.get_list();
	timeout_initpl && window.ClearTimeout(timeout_initpl);
	timeout_initpl = false;
}, 20);

function on_size() {
	ww = window.Width;
	wh = window.Height;
	if (!ww) return;
	list_h = wh - margin_top;
	btn_sw.SetXY(ww - btn_w - 1, Math.floor((margin_top - btn_h) / 2));
}

function on_paint(gr) {
	if (!ww) return;
	gr.FillSolidRect(0, 0, ww, wh, bgcolor);
	glist.draw(gr);
	btn_sw.Paint(gr);
	gcursor._w = gcursor._on ? gcursor.bar_w: 4;
	total_h = glist.list_dr.length * row_height;
	if (list_h < total_h) {
		gcursor._h = Math.round((glist.end_ - glist.start_) * row_height / total_h * list_h);
		gcursor._h = (gcursor._h < cursor_min ? cursor_min: gcursor._h);
		if (gcursor._h > cursor_max) gcursor._h = cursor_max;
		var curcor_y1 = Math.round((list_h - gcursor._h) * Math.round(scroll_) / (total_h - list_h));
		gcursor._y = margin_top + curcor_y1;
		if (gcursor._h == cursor_max && gcursor._y > (wh - cursor_max)) gcursor._y = wh - cursor_max;
		gr.FillSolidRect(ww - gcursor._w, gcursor._y, gcursor._w, gcursor._h, g_scroll_color);
	}
	gr.DrawLine(0, 0, 0, wh, 1, RGBA(0, 0, 0, 80));
	//gr.DrawLine(1, 0, 1, wh, 1, RGBA(0, 0, 0, 60));
	//gr.DrawLine(2, 0, 2, wh, 1, RGBA(0, 0, 0, 30));
	//gr.DrawLine(3, 0, 3, wh, 1, RGBA(0, 0, 0, 15));
	gr.DrawLine(0, 0, ww, 0, 1, RGBA(0, 0, 0, 100));
	gr.DrawLine(0, wh - 1, ww, wh - 1, 1, RGBA(0, 0, 0, 100));
	if(show_shadow){
		gr.DrawLine(0, 1, ww, 1, 1, RGBA(0, 0, 0, 60));
		gr.DrawLine(0, 2, ww, 2, 1, RGBA(0, 0, 0, 30));
		gr.DrawLine(0, 3, ww, 3, 1, RGBA(0, 0, 0, 15));
	
		gr.DrawLine(0, wh - 2, ww, wh - 2, 1, RGBA(0, 0, 0, 60));
		gr.DrawLine(0, wh - 3, ww, wh - 3, 1, RGBA(0, 0, 0, 30));
		gr.DrawLine(0, wh - 4, ww, wh - 4, 1, RGBA(0, 0, 0, 15));
	}
}

function get_colors() {
	switch (ui_mode) {
	case(1):
		bgcolor = RGB(255, 255, 255);
		fontcolor = RGB(36, 36, 36);
		fontcolor2 = RGB(100, 100, 100);
		g_color_line = RGBA(0, 0, 0, 35);
		g_color_selected_bg = fbx_set[7];
		g_scroll_color = fbx_set[0];
		g_btn_color1 = RGBA(0, 0, 0, 40);
		g_btn_color2 = RGBA(0, 0, 0, 90);
		g_btn_color3 = RGBA(0, 0, 0, 70);
		g_btn_color4 = RGBA(0, 0, 0, 140);
		g_color_topbar = fontcolor & 0x15ffffff;
		break;
	case(2):
		bgcolor = fbx_set[4];
		fontcolor = RGB(36, 36, 36);
		fontcolor2 = RGB(100, 100, 100);
		g_color_line = RGBA(0, 0, 0, 35);
		g_color_selected_bg = fbx_set[7];
		g_scroll_color = fbx_set[0];
		g_btn_color1 = RGBA(0, 0, 0, 40);
		g_btn_color2 = RGBA(0, 0, 0, 90);
		g_btn_color3 = RGBA(0, 0, 0, 70);
		g_btn_color4 = RGBA(0, 0, 0, 140);
		g_color_topbar = fontcolor & 0x15ffffff;
		break;
	case (3):
		bgcolor = fbx_set[1];
		fontcolor = RGB(235, 235, 235);
		fontcolor2 = RGB(200, 200, 200);
		g_color_line = RGBA(0, 0, 0, 35);
		g_color_selected_bg = fbx_set[7];
		g_scroll_color = fbx_set[5];
		g_btn_color1 = RGBA(255, 255, 255, 85);
		g_btn_color2 = RGBA(255, 255, 255, 175);
		g_btn_color3 = RGBA(255, 255, 255, 120);
		g_btn_color4 = RGBA(255, 255, 255, 240);
		g_color_topbar = fontcolor & 0x12ffffff;
		break;
	case (4):
		bgcolor = fbx_set[8];
		fontcolor = RGB(235, 235, 235);
		fontcolor2 = RGB(200, 200, 200);
		g_color_line = RGBA(0, 0, 0, 55);
		g_color_selected_bg = (random_mode == 1 || bgcolor == RGB(20, 20, 20)) ? RGBA(255, 255, 255, 30) : fbx_set[7];
		g_scroll_color = fbx_set[5];
		g_btn_color1 = RGBA(255, 255, 255, 85);
		g_btn_color2 = RGBA(255, 255, 255, 175);
		g_btn_color3 = RGBA(255, 255, 255, 120);
		g_btn_color4 = RGBA(255, 255, 255, 240);
		g_color_topbar = fontcolor & 0x12ffffff;
		break;
	}
	g_color_playing_txt = RGB(255, 255, 255);
	g_color_highlight = fbx_set[6];
}

function get_font() {
	g_fname = fbx_set[13];
	g_fsize = fbx_set[14];
	g_fstyle = fbx_set[15];
	g_font = GdiFont(g_fname, g_fsize, g_fstyle);
	g_font2 = GdiFont(g_fname, g_fsize, 1);
	margin_top = Math.ceil(26 * Math.floor(g_fsize / 12 * 100) / 100) + 2;
}

function check_pidx() {
	var total = plman.PlaylistCount;
	if (show_active_pl) pidx = plman.ActivePlaylist;
	else {
		for (var i = 0; i < total; i++) {
			if (plman.GetPlaylistName(i) == "媒体库视图") {
				pidx = i;
			}
		}
	}
	return pidx;
}

function load_pl(timer) {
	var g_items_timer = window.SetTimeout(function() {
		glist.list_dr = [];
		glist.list = plman.GetPlaylistItems(pidx);
		glist.get_list();
		g_items_timer && window.ClearTimeout(g_items_timer);
		g_items_timer = false;
	},
	timer);
}

function SelectAtoB(start_id, end_id) {
	var affectedItems = Array();
	if (glist.SHIFT_start_id == null) {
		glist.SHIFT_start_id = start_id;
	};
	plman.ClearPlaylistSelection(pidx);
	if (start_id < end_id) {
		var deb = start_id;
		var fin = end_id;
	} else {
		var deb = end_id;
		var fin = start_id;
	};
	for (var i = deb; i <= fin; i++) {
		affectedItems.push(i);
	};
	plman.SetPlaylistSelection(pidx, affectedItems, true);
	plman.SetPlaylistFocusItem(pidx, end_id);
	glist.focus_id = end_id;
	repaint_main1 = repaint_main2;
};

function update_swBtn(){
	if(show_active_pl){
		btn_sw.img = img_plsw_2;
		btn_sw.Tooltip.Text = "切换到视图列表";
	} else{
		btn_sw.img = img_plsw;
		btn_sw.Tooltip.Text = "切换到当前列表";
	}
	btn_sw.Repaint();
}

function get_imgs() {
	var gb,
	x3 = Math.floor(3 * zdpi),
	x18 = Math.floor(18 * zdpi);
	img_plsw = gdi.CreateImage(btn_w, btn_h * 3);
	gb = img_plsw.GetGraphics();
	gb.FillSolidRect(x3, x3, x18, 3, g_btn_color1);
	gb.FillSolidRect(x3, x3 * 2 + 2, x18, 3, g_btn_color1);
	gb.FillSolidRect(x3, x3 * 3 + 4, x18, 3, g_btn_color1);
	gb.FillSolidRect(x3, x3 * 4 + 6, x18, 3, g_btn_color1);
	gb.FillSolidRect(x3 * 2 + 1, x3, x3 + 2, 3, g_btn_color2);
	gb.FillSolidRect(x3 * 2 + 1, x3 * 2 + 2, x3 + 2, 3, g_btn_color2);
	gb.FillSolidRect(x3 * 2 + 1, x3 * 3 + 4, x3 + 2, 3, g_btn_color2);
	gb.FillSolidRect(x3 * 2 + 1, x3 * 4 + 6, x3 + 2, 3, g_btn_color2);
	gb.FillSolidRect(x3, x3 + btn_h, x18, 3, g_btn_color3);
	gb.FillSolidRect(x3, x3 * 2 + 2 + btn_h, x18, 3, g_btn_color3);
	gb.FillSolidRect(x3, x3 * 3 + 4 + btn_h, x18, 3, g_btn_color3);
	gb.FillSolidRect(x3, x3 * 4 + 6 + btn_h, x18, 3, g_btn_color3);
	gb.FillSolidRect(x3 * 2 + 1, x3 + btn_h, x3 + 2, 3, g_btn_color4);
	gb.FillSolidRect(x3 * 2 + 1, x3 * 2 + 2 + btn_h, x3 + 2, 3, g_btn_color4);
	gb.FillSolidRect(x3 * 2 + 1, x3 * 3 + 4 + btn_h, x3 + 2, 3, g_btn_color4);
	gb.FillSolidRect(x3 * 2 + 1, x3 * 4 + 6 + btn_h, x3 + 2, 3, g_btn_color4);
	gb.FillSolidRect(x3, x3 + btn_h * 2, x18, 3, g_btn_color1 & 0xbbffffff);
	gb.FillSolidRect(x3, x3 * 2 + 2 + btn_h * 2, x18, 3, g_btn_color1 & 0xbbffffff);
	gb.FillSolidRect(x3, x3 * 3 + 4 + btn_h * 2, x18, 3, g_btn_color1 & 0xbbffffff);
	gb.FillSolidRect(x3, x3 * 4 + 6 + btn_h * 2, x18, 3, g_btn_color1 & 0xbbffffff);
	gb.FillSolidRect(x3 * 2 + 1, x3 + btn_h * 2, x3 + 2, 3, g_btn_color2 & 0xbbffffff);
	gb.FillSolidRect(x3 * 2 + 1, x3 * 2 + 2 + btn_h * 2, x3 + 2, 3, g_btn_color2 & 0xbbffffff);
	gb.FillSolidRect(x3 * 2 + 1, x3 * 3 + 4 + btn_h * 2, x3 + 2, 3, g_btn_color2 & 0xbbffffff);
	gb.FillSolidRect(x3 * 2 + 1, x3 * 4 + 6 + btn_h * 2, x3 + 2, 3, g_btn_color2 & 0xbbffffff);
	img_plsw.ReleaseGraphics(gb)
	
	x8 =  Math.floor(13 * zdpi)-1,
	img_plsw_2 = gdi.CreateImage(btn_w, btn_h * 3);
	gb = img_plsw_2.GetGraphics();
	gb.FillSolidRect(x3, x3, x18, 3, g_btn_color1);
	gb.FillSolidRect(x3, x3 * 2 + 2, x18, 3, g_btn_color1);
	gb.FillSolidRect(x3, x3 * 3 + 4, x18, 3, g_btn_color1);
	gb.FillSolidRect(x3, x3 * 4 + 6, x18, 3, g_btn_color1);
	gb.FillSolidRect(x8, x3, x3 + 2, 3, g_btn_color2);
	gb.FillSolidRect(x8, x3 * 2 + 2, x3 + 2, 3, g_btn_color2);
	gb.FillSolidRect(x8, x3 * 3 + 4, x3 + 2, 3, g_btn_color2);
	gb.FillSolidRect(x8, x3 * 4 + 6, x3 + 2, 3, g_btn_color2);
	gb.FillSolidRect(x3, x3 + btn_h, x18, 3, g_btn_color3);
	gb.FillSolidRect(x3, x3 * 2 + 2 + btn_h, x18, 3, g_btn_color3);
	gb.FillSolidRect(x3, x3 * 3 + 4 + btn_h, x18, 3, g_btn_color3);
	gb.FillSolidRect(x3, x3 * 4 + 6 + btn_h, x18, 3, g_btn_color3);
	gb.FillSolidRect(x8, x3 + btn_h, x3 + 2, 3, g_btn_color4);
	gb.FillSolidRect(x8, x3 * 2 + 2 + btn_h, x3 + 2, 3, g_btn_color4);
	gb.FillSolidRect(x8, x3 * 3 + 4 + btn_h, x3 + 2, 3, g_btn_color4);
	gb.FillSolidRect(x8, x3 * 4 + 6 + btn_h, x3 + 2, 3, g_btn_color4);
	gb.FillSolidRect(x3, x3 + btn_h * 2, x18, 3, g_btn_color1 & 0xbbffffff);
	gb.FillSolidRect(x3, x3 * 2 + 2 + btn_h * 2, x18, 3, g_btn_color1 & 0xbbffffff);
	gb.FillSolidRect(x3, x3 * 3 + 4 + btn_h * 2, x18, 3, g_btn_color1 & 0xbbffffff);
	gb.FillSolidRect(x3, x3 * 4 + 6 + btn_h * 2, x18, 3, g_btn_color1 & 0xbbffffff);
	gb.FillSolidRect(x8, x3 + btn_h * 2, x3 + 2, 2, g_btn_color2 & 0xbbffffff);
	gb.FillSolidRect(x8, x3 * 2 + 2 + btn_h * 2, x3 + 2, 3, g_btn_color2 & 0xbbffffff);
	gb.FillSolidRect(x8, x3 * 3 + 4 + btn_h * 2, x3 + 2, 3, g_btn_color2 & 0xbbffffff);
	gb.FillSolidRect(x8, x3 * 4 + 6 + btn_h * 2, x3 + 2, 3, g_btn_color2 & 0xbbffffff);
	img_plsw_2.ReleaseGraphics(gb)
}

function get_imgs_static() {
	playing_ico = gdi.CreateImage(imgw, imgh);
	gb = playing_ico.GetGraphics();
	gb.SetSmoothingMode(2);
	var ponit_arr = new Array(3 * zdpi, 2 * zdpi, 3 * zdpi, 12 * zdpi, 13 * zdpi, 7 * zdpi);
	gb.FillPolygon(RGBA(255, 255, 255, 255), 0, ponit_arr);
	gb.SetSmoothingMode(0);
	playing_ico.ReleaseGraphics(gb);
}

function on_playlist_items_added(playlist_idx) {
	if (playlist_idx == pidx) {
		load_pl(20);
	}
};

function on_playlist_items_removed(playlist_idx) {
	if (playlist_idx == pidx) {
		load_pl(20);
	}
};
function on_playlist_items_reordered(playlist_idx) {
	if (playlist_idx == pidx) {
		load_pl(20);
	}
};
function on_playlists_changed() {
	var temp_pidx = pidx;
	pidx = check_pidx();
	if (temp_pidx == pidx) return;
	else {
		load_pl(20);
	}
}
function on_playlist_switch() {
	check_pidx();
	if (show_active_pl || pidx == plman.ActivePlaylist) load_pl(20);
}
function on_playlist_items_selection_change() {
	glist.focus_id = plman.GetPlaylistFocusItemIndex(pidx);
	repaint_main1 = repaint_main2;
};
function on_item_focus_change(playlist) {
	if (pidx == playlist && show_active_pl) {
		glist.focus_id = plman.GetPlaylistFocusItemIndex(pidx);
		glist.show_focus();
	}
}
function on_playback_new_track(metadb) {
	if (plman.PlayingPlaylist == plman.ActivePlaylist) repaint_main1 = repaint_main2;
	//glist.show_playing();
}
function check_scroll(scroll___) {
	scroll___ = Math.round(scroll___ / row_height) * row_height;
	if (scroll___ > (total_h - list_h + row_height)) scroll___ = Math.round((total_h - list_h + row_height) / row_height - 0.5) * row_height;
	if (total_h < list_h || scroll___ < 0) scroll___ = 0;
	return scroll___;
}
function on_timer_(timer_interval) {
	time_dl = time_s.Time;
	time_s.Reset();
	var d = new Date();
	if (d.getTime() - time222 < timer_interval) return;
	else time222 = d.getTime();
	var repaint_2 = false,
	repaint_3 = false;
	if (repaint_main1 == repaint_main2) {
		repaint_main2 = !repaint_main1;
		repaint_2 = true;
	}
	if (check_scro_hover != gcursor._on) {
		check_scro_hover = gcursor._on;
		repaint_3 = true;
	}
	scroll = check_scroll(scroll);
	if (Math.abs(scroll - scroll_) > 1) {
		scroll___ += (scroll - scroll___) * (1 - Math.pow(0.9, time_dl / 4));
		scroll__ += (scroll___ - scroll__) * (1 - Math.pow(0, 9, time_dl / 4));
		scroll_ += (scroll__ - scroll_) * (1 - Math.pow(0, 9, time_dl / 4));
		repaint_2 = true;
	}
	if (repaint_2) {
		time_s.Reset();
		window.Repaint();
	} else if (repaint_3) {
		window.RepaintRect(ww - gcursor.bar_w, margin_top, gcursor.bar_w, wh - margin_top);
	}
}
function on_mouse_wheel(step) {
	repaint_main1 = repaint_main2;
	scroll -= step * row_height * scrollstep;
	scroll = check_scroll(scroll);
}
function on_mouse_lbtn_down(x, y, mask) {
	btn_sw.MouseDown(x, y);
	glist.on_mouse("down", x, y);
	if (y > margin_top) {
		var tam = Math.round((y + scroll - row_height * 1.5) / row_height);
		if (tam < glist.list_dr.length && tam >= 0) {}
	}
	if (total_h > list_h && x > ww - gcursor.bar_w && x < ww) {
		hold_scroll = true;
		scroll = Math.round((((y - margin_top) * total_h / list_h) - list_h / 2) / row_height - 0.5) * row_height;
	}
}
function on_mouse_lbtn_up(x, y, mask) {
	hold_scroll = false;
	if (btn_sw.MouseUp(x, y)) {
		show_active_pl = !show_active_pl;
		window.SetProperty("List: Show active playlist", show_active_pl);
		update_swBtn();
		check_pidx();
		load_pl(20);
	}
}
function on_mouse_lbtn_dblclk(x, y, mask) {
	glist.on_mouse("dblclk", x, y);
}
//var rbtnDown;
//function on_mouse_rbtn_down(x, y, vkey) {
//	rbtnDown = vkey == 6 ? true: false;
//}
function on_mouse_rbtn_up(x, y) {
	//if (rbtnDown) {
	//	rbtnDown = false;
	//	return vkey == 4 ? false: true;
	//} else {
		glist.on_mouse("right", x, y);
		return true;
	//}
}
function on_mouse_move(x, y, mask) {
	btn_sw.MouseMove(x, y);
	if (m_x == x && m_y == y) return;
	var uihacks_max = (uiHacks && ui_noborder && !fb_hWnd.IsMaximized());
	if (hold_scroll) {
		if (uihacks_max) {
			UIHacks.DisableSizing = true;
		}
		scroll = Math.round((((y - margin_top) * total_h / (wh - row_height)) - (wh - row_height) / 2) / row_height - 0.5) * row_height;
	} else if (gcursor.vis && x > (ww - gcursor.bar_w) && y > gcursor._y && y < (gcursor._y + gcursor._h)) {
		gcursor._on = true;
		if (uihacks_max) {
			UIHacks.DisableSizing = true;
		}
	} else {
		gcursor._on = false;
		if (uihacks_max) {
			UIHacks.DisableSizing = false;
		}
	}
}
function on_mouse_leave() {
	btn_sw.Reset();
	gcursor._on = false;
	if (uiHacks && ui_noborder && !fb_hWnd.IsMaximized()) {
		UIHacks.DisableSizing = false;
	}
}
function on_notify_data(name, info) {
	switch (name) {
	case "set_font":
		fbx_set[13] = info[0];
		fbx_set[14] = info[1];
		fbx_set[15] = info[2];
		window.Reload();
		//get_font();
		//get_imgs();
		//repaint_main1 = repaint_main2;
		break;
	case "set_ui_mode":
		ui_mode = info;
		get_colors();
		get_imgs();
		btn_sw.img = show_active_pl ? img_plsw_2 : img_plsw;
		repaint_main1 = repaint_main2;
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
		get_imgs();
		btn_sw.img = show_active_pl ? img_plsw_2 : img_plsw;
		repaint_main1 = repaint_main2;
		break;
	case "lib_cover_type":
		title_type = info;
		window.SetProperty("List: Group type", title_type);
		break;
	case "show_Now_Playing":
		glist.show_playing();
		break;
	case "panel_show_shadow":
		show_shadow = info;
		window.RepaintRect(0,0,ww,5);
		window.RepaintRect(0,wh-5,ww,5);
		break;
	case "scrollbar_width":
		sys_scrollbar = info;
		cursor_max = sys_scrollbar ? 120*zdpi : 105*zdpi;
		gcursor.bar_w = sys_scrollbar ? utils.GetSystemMetrics(2) : 12*zdpi;
		repaint_main1 = repaint_main2;
		break;
	}
}
function on_script_unload() {
	g_timer && window.ClearInterval(g_timer);
	g_timer = false;
}