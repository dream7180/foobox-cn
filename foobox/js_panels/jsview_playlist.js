//foobox right panel simple playlist viewer for JSSB, https://github.com/dream7180
var zdpi = 1;
var sys_scrollbar = window.GetProperty("foobox.ui.scrollbar.system", false);
var g_fname, g_fsize, g_fstyle;
var VK_SHIFT = 0x10, VK_CONTROL = 0x11;
var txt_format = DT_LEFT | DT_VCENTER | DT_NOPREFIX | DT_CALCRECT | DT_END_ELLIPSIS,
txt_format_c = DT_CENTER | DT_VCENTER | DT_NOPREFIX | DT_CALCRECT | DT_END_ELLIPSIS,
txt_format_r = DT_RIGHT | DT_VCENTER | DT_NOPREFIX | DT_CALCRECT | DT_END_ELLIPSIS;
var title_type = window.GetProperty("List: Group type", 1);
if (title_type<1 || title_type>5) {
	title_type = 1;
	window.SetProperty("List: Group type", 1);
}
var cursor_min = 25;
var cursor_max = 110;
var show_active_pl = window.GetProperty("List: Show active playlist", false);
var playing_ico;
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
var default_row_height = window.GetProperty("List: Row height", 35), total_h, list_h, margin_top;
row_height = default_row_height;
var pidx = -1;
var g_font, g_font2;
var bgcolor, fontcolor, fontcolor2, g_color_line, g_color_topbar, g_color_line_div, c_default_hl;
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
			metadb = this.list[k];
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
		gr.FillSolidRect(0, margin_top, ww, 1, g_color_line_div);
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
				else gr.FillSolidRect(0, y2_, ww, row_height, g_color_selected_bg & 0x85ffffff)
			} else if (i == this.focus_id) gr.DrawRect(1, y2_, ww - 2, row_height, 2, g_color_selected_bg);
			var tracknum = show_active_pl ? this.list_dr[i].index : this.list_dr[i].string[0];
			if (fb.IsPlaying && plman.PlayingPlaylist == pidx) {
				var _playing = plman.GetPlayingItemLocation();
				if (i == _playing.PlaylistItemIndex) {
					gr.FillSolidRect(0, y2_, ww, row_height, g_color_highlight);
					gr.DrawImage(playing_ico, Math.round(15 + 7 * zdpi), Math.round(y_ + (row_height - playing_ico.Height) / 2), playing_ico.Width, playing_ico.Height, 0, 0, playing_ico.Width, playing_ico.Height, 0, 255);
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
		_child01.AppendTo(_menu, MF_STRING, "选择添加到...");
		_child01.AppendMenuItem(MF_STRING, 801, "新播放列表");
		if (plman.PlaylistCount > 1) {
			_child01.AppendMenuItem(MF_SEPARATOR, 0, "");
		};
		for (var i = 0; i < plman.PlaylistCount; i++) {
			if (i != pidx && !plman.IsAutoPlaylist(i)) {
				_child01.AppendMenuItem(MF_STRING, 1000 + i, plman.GetPlaylistName(i));
			}
		};
		var ret = _menu.TrackPopupMenu(x, y);
		if (ret > 0 && ret < 800) {
			Context.ExecuteByID(ret - 1);
		} else {
			switch (ret) {
			case 800:
				plman.RemovePlaylistSelection(pidx, false);
				break;
			case 801:
				fb.RunMainMenuCommand("文件/新建播放列表");
				plman.InsertPlaylistItems(plman.PlaylistCount - 1, 0, this.metadblist_selection, false);
				break;
			default:
				var insert_index = plman.PlaylistItemCount(ret - 1000);
				plman.InsertPlaylistItems((ret - 1000), insert_index, this.metadblist_selection, false);
			}
		}
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
				if(plman.ActivePlaylist != pidx) fb.RunContextCommandWithMetadb("播放", this.list_dr[this.activeindex].metadb, 0);
				else plman.ExecutePlaylistDefaultAction(plman.ActivePlaylist, plman.GetPlaylistFocusItemIndex(plman.ActivePlaylist));
			} else if (y < margin_top && x < ww - playing_ico.Width - 1) {
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
	this.bar_w = 12;
	this.vis = false;
	this._on = false;
}

get_metrics = function(){
	cursor_min = 25*zdpi;
	cursor_max = sys_scrollbar ? 125*zdpi : 110*zdpi;
	row_height = Math.round(default_row_height * zdpi);
	ocursor.bar_w = sys_scrollbar ? utils.GetSystemMetrics(2) : 12*zdpi;
}

var glist = new olist();
var gcursor = new ocursor();
var btn_w = 24, btn_h = 24;
get_metrics();
get_imgs();
init_btn();

function init_btn(){
	if (show_active_pl) btn_sw = new ButtonUI(img_plsw_2, "切换到视图列表");
	else btn_sw = new ButtonUI(img_plsw, "切换到当前列表");
}

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
}

function get_colors() {
	bgcolor = window.GetColourDUI(ColorTypeDUI.background);
	fontcolor = window.GetColourDUI(ColorTypeDUI.text);
	fontcolor2 = RGB(100, 100, 100);
	g_color_line = RGBA(0, 0, 0, 20);
	g_color_line_div = RGBA(0, 0, 0, 45);
	g_color_selected_bg = window.GetColourDUI(ColorTypeDUI.selection);
	g_scroll_color = fontcolor & 0x95ffffff;
	g_btn_color1 = fontcolor & 0x35ffffff;
	g_btn_color2 = RGBA(0, 0, 0, 90)
	g_color_topbar = fontcolor & 0x09ffffff;
	g_color_playing_txt = RGB(255, 255, 255);
	c_default_hl = window.GetColourDUI(ColorTypeDUI.highlight);
	g_color_highlight = c_default_hl;
}

function get_font() {
	g_font = window.GetFontDUI(FontTypeDUI.playlists);
	g_fname = g_font.Name;
	g_fsize = g_font.Size;
	g_fstyle = g_font.Style;
	zdpi = g_fsize / 12;
	g_font2 = GdiFont(g_fname, g_fsize, 1);
	margin_top = Math.ceil(26 * zdpi) + 2;
}

function check_pidx() {
	if (show_active_pl) pidx = plman.ActivePlaylist;
	else {
		var total = plman.PlaylistCount;
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
	btn_w = Math.floor(24 * zdpi);
	btn_h = Math.floor(12 * zdpi) + 12;
	var gb,
		x5 = 5 * zdpi;
	img_plsw = gdi.CreateImage(btn_w, btn_h * 3);
	gb = img_plsw.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillRoundRect(2*zdpi,x5, 18*zdpi,10*zdpi, x5,x5, g_btn_color1);
	gb.FillRoundRect(2*zdpi+2,x5+2, 10*zdpi-4,10*zdpi-4, x5-2,x5-2, RGBA(255, 255, 255, 180));
	img_plsw.ReleaseGraphics(gb)
	
	img_plsw_2 = gdi.CreateImage(btn_w, btn_h * 3);
	gb = img_plsw_2.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillRoundRect(2*zdpi,x5, 18*zdpi,10*zdpi, x5,x5, g_btn_color1);
	gb.FillRoundRect(10*zdpi+2,x5+2, 10*zdpi-4,10*zdpi-4, x5-2,x5-2, RGBA(255, 255, 255, 180));
	img_plsw_2.ReleaseGraphics(gb);
	
	playing_ico = gdi.CreateImage(z(16), z(14));
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
	if (show_active_pl) {
		check_pidx();
		load_pl(20);
	}
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

function on_mouse_rbtn_up(x, y) {
	glist.on_mouse("right", x, y);
	return true;
}
function on_mouse_move(x, y, mask) {
	btn_sw.MouseMove(x, y);
	if (m_x == x && m_y == y) return;
	if (hold_scroll) {
		scroll = Math.round((((y - margin_top) * total_h / (wh - row_height)) - (wh - row_height) / 2) / row_height - 0.5) * row_height;
	} else if (gcursor.vis && x > (ww - gcursor.bar_w) && y > gcursor._y && y < (gcursor._y + gcursor._h)) {
		gcursor._on = true;
	} else {
		gcursor._on = false;
	}
}
function on_mouse_leave() {
	btn_sw.Reset();
	gcursor._on = false;
}

function on_font_changed() {
	get_font();
	get_metrics();
	get_imgs();
	init_btn();
	btn_sw.SetXY(ww - btn_w - 1, Math.floor((margin_top - btn_h) / 2));
	repaint_main1 = repaint_main2;
};

function on_colours_changed() {
	get_colors();
	get_imgs();
	btn_sw.img = show_active_pl ? img_plsw_2 : img_plsw;
	repaint_main1 = repaint_main2;
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
		break;
	case "lib_cover_type":
		title_type = info;
		window.SetProperty("List: Group type", title_type);
		break;
	case "show_Now_Playing":
		glist.show_playing();
		break;
	case "scrollbar_width":
		sys_scrollbar = info;
		window.SetProperty("foobox.ui.scrollbar.system", sys_scrollbar);
		cursor_max = sys_scrollbar ? 125*zdpi : 110*zdpi;
		gcursor.bar_w = sys_scrollbar ? utils.GetSystemMetrics(2) : 12*zdpi;
		repaint_main1 = repaint_main2;
		break;
	case "LibviewUpdated":
		load_pl(20);
		break;
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
			SelectAtoB(0, glist.list.Count-1);
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
	}
}

function on_script_unload() {
	g_timer && window.ClearInterval(g_timer);
	g_timer = false;
}