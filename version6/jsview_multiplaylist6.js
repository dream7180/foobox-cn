// foobox https://github.com/dream7180
window.DefinePanel('simple multi playlist viewer', {author: 'dreamawake'});
include(fb.ProfilePath + 'foobox\\script\\js_common\\common.js');
include(fb.ProfilePath + 'foobox\\script\\js_common\\JScommon.js');
include(fb.ProfilePath + 'foobox\\script\\js_common\\JScomponents.js');
include(fb.ProfilePath + 'foobox\\version6\\uihacks.js');

var sys_scrollbar = window.GetProperty("foobox.ui.scrollbar.system", false);
var zdpi = 1, dark_mode = 0;
var g_font, g_font_b, g_font_track;
var g_color_line = RGBA(0, 0, 0, 20), g_color_line_div = RGBA(0, 0, 0, 45), g_color_playing_txt = RGB(255, 255, 255);

var brw = null;
var isScrolling = false;
var ww = 0,
	wh = 0;
var m_x = 0,
	m_y = 0;
// color vars
var g_color_normal_bg = 0;
var g_color_selected_bg = 0;
var g_color_normal_txt = 0;
var g_color_selected_txt = 0;
var g_color_highlight = 0;
var c_default_hl = 0;
var g_color_tracknum = 0;
var g_first_populate_launched = false;
//
var repaintforced = false;
var repaint_main = true,
	repaint_main1 = true,
	repaint_main2 = true;
var window_visible = false;
var scroll_ = 0,
	scroll = 0,
	scroll_prev = 0;
var g_start_ = 0,
	g_end_ = 0;

var pidx = -1;
var playing_ico, btn_sw;
var btn_clicked = false;
var btn_w = 22, btn_h = 22;

ppt = {
	defaultRowHeight: window.GetProperty("_PROPERTY: Row Height", 35),
	rowHeight: window.GetProperty("_PROPERTY: Row Height", 35),
	rowScrollStep: window.GetProperty("_PROPERTY: Scroll Step", 3),
	scrollSmoothness: 3.0,
	refreshRate: 20,
	headerBarHeight: 28,
	showGrid: window.GetProperty("_PROPERTY: Show Grid", true),
	enableTouchControl: window.GetProperty("_PROPERTY: Touch control", true)
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

cScrollBar = {
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

timers = {
	mouseDown: false
};

//==============Objects======================================================
oPlaylist = function(idx, metadb) {
	this.idx = idx;
	this.metadb = metadb;
};

oBrowser = function(name) {
	this.name = "";
	this.rows = [];
	this.scrollbar = new oScrollbar();
	this.focusRow = plman.GetPlaylistFocusItemIndex(pidx);
	this.activeRow = this.focusRow;
	this.SHIFT_start_id = null;
	this.show_tracknum = false;
	this.tag = "";
	
	this.launch_populate = function() {
		var launch_timer = window.SetTimeout(function() {
			brw.populate();
			launch_timer && window.ClearTimeout(launch_timer);
			launch_timer = false;
		}, 5);
	};

	this.repaint = function() {
		repaint_main1 = repaint_main2;
	};

	this.setSize = function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.paddingLeft = Math.round(6*zdpi);
		this.paddingRight = cScrollBar.width + 1;
		this.totalRows = Math.ceil(this.h / ppt.rowHeight);
		this.totalRowsVis = Math.floor(this.h / ppt.rowHeight);

		this.getlimits();

		this.scrollbar.setSize();
		scroll = Math.round(scroll / ppt.rowHeight) * ppt.rowHeight;
		scroll = check_scroll(scroll);
		scroll_ = scroll;
		this.scrollbar.updateScrollbar();
	};

	this.init_groups = function() {
		var total = plman.PlaylistItemCount(pidx);
		this.rows.splice(0, this.rows.length);
		var _list = plman.GetPlaylistItems(pidx);
		for (var i = 0; i < total; i++) {
			this.rows.push(new oPlaylist(i, _list[i]));
		};
		this.rowsCount = this.rows.length;
		this.show_tracknum = false;
		this.getlimits();
		this.name = plman.GetPlaylistName(pidx);
		if(pidx > -1 && plman.IsAutoPlaylist(pidx)) this.tag = "\uF023";
		else this.tag = "\uF03A";
	};

	this.getlimits = function() {
		if (this.rowsCount <= this.totalRowsVis) {
			var start_ = 0;
			var end_ = this.rowsCount - 1;
		} else {
			if (scroll_ < 0) scroll_ = scroll;
			var start_ = Math.round(scroll_ / ppt.rowHeight + 0.4);
			var end_ = start_ + this.totalRows;
			start_ = start_ > 0 ? start_ - 1 : start_;
			if (start_ < 0) start_ = 0;
			if (end_ >= this.rows.length) end_ = this.rows.length - 1;
		};
		g_start_ = start_;
		g_end_ = end_;
	};

	this.populate = function() {
		this.init_groups();
		this.focusRow = plman.GetPlaylistFocusItemIndex(pidx);
		this.showFocusItem(true, true);
		this.repaint();
	};

	this.isVisibleItem = function(idx) {
		var offset_active_pl = ppt.rowHeight * idx;
		if (offset_active_pl < scroll || offset_active_pl + ppt.rowHeight > scroll + this.h) {
			return false;
		}
		else {
			return true;
		};
	};

	this.showFocusItem = function(showplaying, forecedUpdate) {
		if(showplaying && fb.IsPlaying && plman.PlayingPlaylist == pidx) var rowId = plman.GetPlayingItemLocation().PlaylistItemIndex;
		else var rowId = this.focusRow;

		if (rowId > -1 && !this.isVisibleItem(rowId)) {
			scroll = (rowId - Math.floor(this.totalRowsVis / 2)) * ppt.rowHeight;
			scroll = check_scroll(scroll);
			this.scrollbar.updateScrollbar();
		} else if(forecedUpdate){
			scroll = scroll_ = 0;
			this.scrollbar.updateScrollbar();
		}
	};

	this.draw = function(gr) {
		if (repaint_main || !repaintforced) {
			repaint_main = false;
			repaintforced = false;
			var isplaying_pidx = (fb.IsPlaying && plman.PlayingPlaylist == pidx);
			var playing_itemidx = plman.GetPlayingItemLocation().PlaylistItemIndex;
			var queue_idx = -1;
			var track_color = g_color_tracknum;
			var tag_color = isplaying_pidx ? g_color_highlight : g_color_tracknum;
			var ax = 0, ay = 0;
			var aw = this.w + cScrollBar.width;
			var ah = ppt.rowHeight;
			var rh = gr.CalcTextWidth("0" + this.rows.length.toString(), g_font);
			var tx = ax + rh + this.paddingLeft + 4;
			if (this.rows.length > 0) {
				for (var i = g_start_; i <= g_end_; i++) {
					queue_idx = plman.FindPlaybackQueueItemIndex(this.rows[i].metadb, pidx, this.rows[i].idx) + 1;
					ay = Math.floor(this.y + (i * ah) - scroll_);
					this.rows[i].x = ax;
					this.rows[i].y = ay;
					var txt_tracklen = fb.TitleFormat("%length%").EvalWithMetadb(this.rows[i].metadb);
					var txt_tracklen_w = gr.CalcTextWidth(" " + txt_tracklen, g_font_track);
					var txt_idx = this.show_tracknum ? fb.TitleFormat("$if2(%tracknumber%,)").EvalWithMetadb(this.rows[i].metadb) : this.rows[i].idx + 1;
					if (ay > this.y - ppt.headerBarHeight - ah && ay < this.y + this.h) {
						// row bg
						if(ppt.showGrid) gr.DrawLine(ax, ay + ah, aw, ay + ah, 1, g_color_line);
						if (plman.IsPlaylistItemSelected(pidx, this.rows[i].idx)) {
							track_color = g_color_normal_txt;
							gr.FillSolidRect(ax, ay, aw, ah, g_color_selected_bg);
						}
						if (isplaying_pidx && this.rows[i].idx == playing_itemidx) {
							var font = g_font_b;
							var name_color = g_color_playing_txt;
							track_color = g_color_playing_txt;
							gr.FillSolidRect(ax, ay, aw, ah, g_color_highlight);
							gr.DrawImage(playing_ico, ax + this.paddingLeft/2, Math.round(ay + (ppt.rowHeight - playing_ico.Height) / 2), playing_ico.Width, playing_ico.Height, 0, 0, playing_ico.Width, playing_ico.Height, 0, 255);
						} else {
							var font = g_font;
							var name_color = g_color_normal_txt;
							var track_color = g_color_tracknum;
							if(queue_idx > 0) {
								gr.FillSolidRect(ax, ay, rh, ah, g_color_highlight&0x25ffffff);
								gr.GdiDrawText(queue_idx, g_font_b, g_color_highlight, ax + this.paddingLeft, ay, rh, ah, lc_txt);
							}
							else gr.GdiDrawText(txt_idx, g_font_track, track_color, ax + this.paddingLeft, ay, rh, ah, lc_txt);
						};
						if (i == this.focusRow) gr.FillSolidRect(ax, ay, 4, ah, g_color_highlight);
						gr.GdiDrawText(fb.TitleFormat("%title%").EvalWithMetadb(this.rows[i].metadb), font, name_color, tx, ay, aw - tx - txt_tracklen_w - this.paddingRight - 5, ah, lc_txt);
						gr.GdiDrawText(txt_tracklen, g_font_track, track_color, ax + aw - txt_tracklen_w - this.paddingRight, ay, txt_tracklen_w, ah, rc_txt);
					};
				};
			}
			gr.FillSolidRect(0, 0, ww, ppt.headerBarHeight+1, g_color_normal_bg);
			gr.FillSolidRect(0, 0, ww, ppt.headerBarHeight - 2, g_color_topbar);
			gr.DrawLine(0, ppt.headerBarHeight, ww, ppt.headerBarHeight, 1, g_color_line_div);
			gr.GdiDrawText(this.tag, g_font_tag, tag_color, this.paddingLeft, 0, this.paddingLeft*2, ppt.headerBarHeight, lc_txt);
			gr.GdiDrawText(this.name, g_font, g_color_normal_txt, this.paddingLeft*4, 0, ww - btn_w - rh - this.paddingLeft*6.5, ppt.headerBarHeight, lc_txt);
			gr.GdiDrawText(this.rows.length, g_font, g_color_normal_txt, ww - btn_w - rh - this.paddingLeft*1.5, 0, rh+this.paddingLeft, ppt.headerBarHeight, cc_txt);
			brw.scrollbar && brw.scrollbar.draw(gr);
		};
	};

	this._isHover = function(x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
	};

	this.on_mouse = function(event, x, y) {
		this.ishover = this._isHover(x, y);
		if (this.ishover) {
			if (y > this.y && y < this.y + this.h) {
				this.activeRow = Math.ceil((y + scroll_ - this.y) / ppt.rowHeight - 1);
				if (this.activeRow >= this.rows.length) this.activeRow = -1;
			}
		}

		switch (event) {
		case "down":
			this.down = true;
			if (!cTouch.down && !timers.mouseDown && this.ishover && this.activeRow > -1 && Math.abs(scroll - scroll_) < 2) {
				if (utils.IsKeyPressed(VK_SHIFT)) {
					if (this.SHIFT_start_id != this.activeRow) {
						if (this.SHIFT_start_id != null) {
							SelectAtoB(this.SHIFT_start_id, this.activeRow);
						} else {
							SelectAtoB(this.focusRow, this.activeRow);
						}
					}
				} else if (utils.IsKeyPressed(VK_CONTROL)) {
					if (plman.IsPlaylistItemSelected(pidx, this.activeRow)) {
						plman.SetPlaylistSelectionSingle(pidx, this.activeRow, false);
					} else {
						plman.SetPlaylistFocusItem(pidx, this.activeRow);
						this.focusRow = this.activeRow;
						plman.SetPlaylistSelectionSingle(pidx, this.activeRow, true);
					}
				} else {
					plman.SetPlaylistFocusItem(pidx, this.activeRow);
					this.focusRow = this.activeRow;
					plman.ClearPlaylistSelection(pidx);
					plman.SetPlaylistSelectionSingle(pidx, this.activeRow, true);
				};
				this.SHIFT_start_id = this.activeRow;
				this.repaint();
			}
			else {
				if (cScrollBar.visible) {
					this.scrollbar && this.scrollbar.on_mouse(event, x, y);
				};
			};
			break;
		case "up":
			if (this.down) {
				if (cScrollBar.visible) {
					brw.scrollbar && brw.scrollbar.on_mouse(event, x, y);
				};
			};

			this.down = false;
			break;
		case "dblclk":
			if (this.ishover && this.focusRow > -1) {
				if(plman.ActivePlaylist != pidx) fb.RunContextCommandWithMetadb("播放", this.rows[this.focusRow].metadb, 0);
				else plman.ExecutePlaylistDefaultAction(pidx, this.focusRow);
			}
			else {
				if (cScrollBar.visible) {
					brw.scrollbar && brw.scrollbar.on_mouse(event, x, y);
				};
			};
			break;
		case "move":
			if (cScrollBar.visible) {
				brw.scrollbar && brw.scrollbar.on_mouse(event, x, y);
			};
			break;
		case "right":
			if (this.ishover) {
				if (!plman.IsPlaylistItemSelected(pidx, this.activeRow)) {
					plman.SetPlaylistFocusItem(pidx, this.activeRow);
					plman.ClearPlaylistSelection(pidx);
					plman.SetPlaylistSelectionSingle(pidx, this.activeRow, true);
				};
				this.repaint();
				this.context_menu(x, y, this.activeRow);
			} else {
				if (cScrollBar.visible) {
					brw.scrollbar && brw.scrollbar.on_mouse(event, x, y);
				};
			};
			break;
		case "leave":
			if (cScrollBar.visible) {
				this.scrollbar && this.scrollbar.on_mouse(event, 0, 0);
			};
			break;
		};
	};

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
			repaint_1 = true;
			isScrolling = true;
			//
			if (scroll_prev != scroll) brw.scrollbar.updateScrollbar();
		}
		else {
			if (isScrolling) {
				if (scroll_ < 1) scroll_ = 0;
				isScrolling = false;
				repaint_1 = true;
			};
		};

		if (repaint_1) {
			if (brw.rows.length > 0) brw.getlimits();
			repaintforced = true;
			repaint_main = true;
			window.Repaint();
		};
		scroll_prev = scroll;
	}, ppt.refreshRate);

	this.context_menu = function(x, y, id) {
		var _menu = window.CreatePopupMenu();
		var _child01 = window.CreatePopupMenu();
		var Context = fb.CreateContextMenuManager();
		var metadblist_selection = plman.GetPlaylistSelectedItems(pidx);
		if(metadblist_selection.Count > 0){
			_menu.AppendMenuItem((plman.IsAutoPlaylist(pidx) || plman.GetPlaylistName(pidx) == "播放队列")?MF_DISABLED|MF_GRAYED:MF_STRING, 800, "移除");
			Context.InitContext(metadblist_selection);
			Context.BuildMenu(_menu, 3, -1);
			_child01.AppendTo(_menu, MF_STRING, "选择添加到...");
			_child01.AppendMenuItem(MF_STRING, 801, "新播放列表");
			var addline = true;
			for (var i = 0; i < plman.PlaylistCount; i++) {
				if (i != pidx && !plman.IsAutoPlaylist(i)) {
					if (addline) {
						_child01.AppendMenuSeparator();
						addline = false;
					}
					_child01.AppendMenuItem(MF_STRING, 1000 + i, plman.GetPlaylistName(i));
				}
			}
		}
		var ret = _menu.TrackPopupMenu(x, y);
		if (ret > 2 && ret < 800) {
			Context.ExecuteByID(ret - 3);
		}else{
			switch (ret) {
			case 800:
				plman.RemovePlaylistSelection(pidx, false);
				break;
			case 801:
				plman.CreatePlaylist(plman.PlaylistCount, '');
				plman.InsertPlaylistItems(plman.PlaylistCount - 1, 0, metadblist_selection, false);
				break;
			default:
				var insert_index = plman.PlaylistItemCount(ret - 1000);
				plman.InsertPlaylistItems((ret - 1000), insert_index, metadblist_selection, false);
			}
		}
	};
};

PL_Menu = function(x, y) {
	var PLmenu = window.CreatePopupMenu();
	var total = plman.PlaylistCount;
	if (!total) PLmenu.AppendMenuItem(MF_DISABLED, 0, "无播放列表");
	else {
		for (var i = 0; i < total; i++) {
			if(fb.IsPlaying && i == plman.PlayingPlaylist) PLmenu.AppendMenuItem(MF_STRING, 100+i, plman.GetPlaylistName(i) + " >>>");
			else PLmenu.AppendMenuItem(MF_STRING, 100+i, plman.GetPlaylistName(i));
		}
		PLmenu.CheckMenuRadioItem(100, 100 + total, 100 + plman.ActivePlaylist);
	}
	var ret = PLmenu.TrackPopupMenu(x, y);
	if (ret) {
		switch (ret) {
		default:
			plman.ActivePlaylist = ret - 100;
			pidx = ret;
			PLmenu.CheckMenuRadioItem(100, 100 + total, ret);
			break;
		}
	}
}
//=================================== Main ================================================================
function init_btn(){
	btn_sw = new button(img_menubt, img_menubt_ov, img_menubt_ov, "");
}

function SelectAtoB(start_id, end_id) {
	var affectedItems = Array();
	if (brw.SHIFT_start_id == null) {
		brw.SHIFT_start_id = start_id;
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
	brw.focusRow = end_id;
};

function on_init() {
	window.DlgCode = DLGC_WANTALLKEYS;
	get_font();
	get_colors();
	get_metrics();
	get_images();
	init_btn();
	pidx = plman.ActivePlaylist;
	brw = new oBrowser();
};

// START
on_init();

function on_size() {
	ww = window.Width;
	wh = window.Height;
	if (!ww || !wh) {
		ww = 1;
		wh = 1;
	};
	window.MinWidth = 1;
	window.MinHeight = 1;
	brw.setSize(0, ppt.headerBarHeight, ww - cScrollBar.width, wh - ppt.headerBarHeight);
	brw.repaint();
};

function on_paint(gr) {
	if (!ww) return;
	gr.FillSolidRect(0, 0, ww, wh, g_color_normal_bg);
	brw && brw.draw(gr);
	btn_sw.draw(gr, Math.round(ww - btn_w - 3*zdpi), Math.floor((ppt.headerBarHeight - btn_h) / 2), 255);
	gr.DrawImage(img_plsw, Math.round(ww - btn_w), Math.floor((ppt.headerBarHeight - btn_h) / 2 + img_plsw.Height/4), img_plsw.Width, img_plsw.Height, 0, 0, img_plsw.Width, img_plsw.Height);
};

function on_mouse_lbtn_down(x, y) {
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
	if(brw.scrollbar.cursorDrag && uiHacks) UIHacks.DisableSizing = true;
	if(btn_sw.checkstate("down", x, y) == ButtonStates.down) {
		btn_clicked = true;
		btn_sw.state = ButtonStates.hover;
	};
};

function on_mouse_lbtn_up(x, y) {
	brw.on_mouse("up", x, y);
	if(uiHacks && UIHacks.MainWindowState != 2 && UIHacks.DisableSizing) UIHacks.DisableSizing = false;
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
		if (Math.abs(cTouch.scroll_delta) > 030) {
			cTouch.multiplier = ((1000 - cTouch.t1.Time) / 20);
			cTouch.delta = Math.round((cTouch.scroll_delta) / 030);
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
	if (btn_clicked && btn_sw.checkstate("up", x, y) == ButtonStates.hover) {
		PL_Menu(ww-btn_w-4*zdpi, btn_h+2*zdpi);
		btn_sw.state = ButtonStates.normal;
		btn_sw.repaint();
	}
	btn_clicked = false;
};

function on_mouse_lbtn_dblclk(x, y, mask) {
	if (y >= brw.y) {
		brw.on_mouse("dblclk", x, y);
	}
	else if(x > brw.x && y < ppt.headerBarHeight) {
		brw.showFocusItem(true, false);
	}
};

function on_mouse_rbtn_down(x, y, mask) {
};

function on_mouse_rbtn_up(x, y) {
	if (!utils.IsKeyPressed(VK_SHIFT)) {
		brw.on_mouse("right", x, y);
	};
	return true;
};

function on_mouse_move(x, y) {
	if (m_x == x && m_y == y) return;
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
	};
	btn_sw.checkstate("move", x, y);
	m_x = x;
	m_y = y;
};

function on_mouse_wheel(step) {
	if (cTouch.timer) {
		window.ClearInterval(cTouch.timer);
		cTouch.timer = false;
	};
    if(brw.rowsCount == 0) return;
	var g_start_y = brw.rows[g_start_].y;
	if(g_start_ && g_start_y) {
		var voffset = g_start_y - ppt.rowHeight - ppt.headerBarHeight;
		scroll -= step * ppt.rowHeight * (ppt.rowScrollStep - step/Math.abs(step)) - voffset;
	}
	else scroll -= step * ppt.rowHeight * ppt.rowScrollStep;
	scroll = check_scroll(scroll);
};

function on_mouse_leave() {
	brw.on_mouse("leave", 0, 0);
};

//=================================================// Metrics & Fonts & Colors & Images

function get_metrics() {
	cScrollBar.minCursorHeight = 25*zdpi;
	if(sys_scrollbar){
		cScrollBar.width = get_system_scrollbar_width();
		cScrollBar.maxCursorHeight = 125*zdpi;
	}else{
		cScrollBar.width = 12*zdpi;
		cScrollBar.maxCursorHeight = 110*zdpi;
	}
	ppt.rowHeight = Math.round(ppt.defaultRowHeight * zdpi);
	ppt.headerBarHeight = z(26) + 2;
};

function get_images() {
	var gb;
	var add_h = z(4), bt_h = z(24), _x2 = 2*zdpi, x2 = Math.floor(_x2), _x12 = 12*zdpi;
	btn_w = z(22);
	btn_h = z(22);
	
	img_menubt = gdi.CreateImage(bt_h, bt_h);
	gb = img_menubt.GetGraphics();
	img_menubt.ReleaseGraphics(gb);
		
	img_menubt_ov = gdi.CreateImage(bt_h, bt_h);
	gb = img_menubt_ov.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillRoundRect(zdpi, zdpi, z(20)-1, z(20)-1, z(3), z(3), g_color_bt_overlay);
	img_menubt_ov.ReleaseGraphics(gb);
	
	img_plsw = gdi.CreateImage(z(14), add_h*3+3);
	gb = img_plsw.GetGraphics();
	gb.SetSmoothingMode(0);
	gb.DrawLine(Math.ceil(_x2), x2+1, Math.ceil(_x12), x2+1, 1, g_color_normal_txt);
	gb.DrawLine(Math.ceil(_x2), x2+add_h+1, Math.ceil(_x12), x2+add_h+1, 1, g_color_normal_txt);
	gb.DrawLine(Math.ceil(_x2), x2+add_h*2+1, Math.ceil(_x12), x2+add_h*2+1, 1, g_color_normal_txt);	
	img_plsw.ReleaseGraphics(gb)
	
	playing_ico = gdi.CreateImage(z(16), z(14));
	gb = playing_ico.GetGraphics();
	gb.SetSmoothingMode(2);
	var ponit_arr = new Array(3 * zdpi, _x2, 3 * zdpi, _x12, 13 * zdpi, 7 * zdpi);
	gb.FillPolygon(RGB(255, 255, 255), 0, ponit_arr);
	gb.SetSmoothingMode(0);
	playing_ico.ReleaseGraphics(gb);
};

function get_font() {
	g_font = window.GetFontDUI(FontTypeDUI.playlists);
	zdpi = g_font.Size / 12;
	g_fsize = g_font.Size;
	g_font_b = GdiFont(g_font.Name, g_font.Size, 1);
	g_track_size = Math.max(10, g_font.Size - 2);
	g_font_track = GdiFont(g_font.Name, g_track_size, g_font.Style);
	g_font_tag = GdiFont("FontAwesome", g_fsize+2, 0);
};

function get_colors() {
	g_color_normal_txt = window.GetColourDUI(ColorTypeDUI.text);
	g_color_selected_txt = g_color_normal_txt;
	g_color_normal_bg_default = window.GetColourDUI(ColorTypeDUI.background);
	g_color_normal_bg = g_color_normal_bg_default;
	g_color_bt_overlay = g_color_normal_txt & 0x35ffffff;
	g_scroll_color = g_color_normal_txt & 0x95ffffff;
	g_color_selected_bg_default = window.GetColourDUI(ColorTypeDUI.selection);
	g_color_selected_bg = g_color_selected_bg_default;
	g_color_topbar = g_color_normal_txt & 0x09ffffff;
	c_default_hl = window.GetColourDUI(ColorTypeDUI.highlight);
	g_color_highlight = c_default_hl;
	g_color_tracknum = blendColors(g_color_normal_bg, g_color_normal_txt, 0.65);
	if (isDarkMode(g_color_normal_bg)) dark_mode = 1;
	else dark_mode = 0;
};

function on_script_unload() {
	brw.g_time && window.ClearInterval(brw.g_time);
	brw.g_time = false;
};

//=================================================// Keyboard Callbacks

function on_key_up(vkey) {
	// scroll keys up and down RESET (step and timers)
	cScrollBar.timerCounter = -1;
	if(cScrollBar.timerID){
		window.ClearTimeout(cScrollBar.timerID);
		cScrollBar.timerID = false;
		brw.repaint();
	}
};

function on_key_down(vkey) {
	var mask = GetKeyboardMask();
	if (mask == KMask.none) {
		switch (vkey) {
		case VK_F5:
			brw.repaint();
			break;
		case VK_UP:
			if (brw.rowsCount > 0) {
				if (brw.focusRow > 0) brw.focusRow--;
				else brw.focusRow = 0;
				brw.activeRow = brw.focusRow;
				plman.SetPlaylistFocusItem(pidx, brw.focusRow);
				plman.ClearPlaylistSelection(pidx);
				plman.SetPlaylistSelectionSingle(pidx, brw.focusRow, true);
				brw.repaint();
			}
			break;
		case VK_DOWN:
			if (brw.rowsCount > 0) {
				if (brw.focusRow < brw.rowsCount - 1) brw.focusRow++;
				else return;
				brw.activeRow = brw.focusRow;
				plman.SetPlaylistFocusItem(pidx, brw.focusRow);
				plman.ClearPlaylistSelection(pidx);
				plman.SetPlaylistSelectionSingle(pidx, brw.focusRow, true);
				brw.repaint();
			}
			break;
		case VK_PGUP:
			if (cTouch.timer) {
				window.ClearInterval(cTouch.timer);
				cTouch.timer = false;
			};
			scroll -= brw.totalRowsVis * ppt.rowHeight;
			scroll = check_scroll(scroll);
			break;
		case VK_PGDN:
			if (cTouch.timer) {
				window.ClearInterval(cTouch.timer);
				cTouch.timer = false;
			};
			if (brw.rowsCount >0){
				var g_start_y = brw.rows[g_start_].y;
				var voffset = g_start_y - ppt.headerBarHeight;
				scroll += ppt.rowHeight * (brw.totalRowsVis - 1) - voffset;
				scroll = check_scroll(scroll);
			}
			break;
		case VK_RETURN:
			if (brw.rowsCount > 0) {
				if(brw.focusRow > -1) {
					if(plman.ActivePlaylist != pidx) fb.RunContextCommandWithMetadb("播放", brw.rows[brw.focusRow].metadb, 0);
					else plman.ExecutePlaylistDefaultAction(pidx, brw.focusRow);
				}
			};
			break;
		case VK_END:
			if (brw.rowsCount > 0) {
				brw.focusRow = brw.rowsCount - 1;
				brw.activeRow = brw.focusRow;
				plman.SetPlaylistFocusItem(pidx, brw.focusRow);
				plman.ClearPlaylistSelection(pidx);
				plman.SetPlaylistSelectionSingle(pidx, brw.focusRow, true);
			};
			break;
		case VK_HOME:
			if (brw.rowsCount > 0) {
				brw.focusRow = 0;
				brw.activeRow = brw.focusRow;
				plman.SetPlaylistFocusItem(pidx, brw.focusRow);
				plman.ClearPlaylistSelection(pidx);
				plman.SetPlaylistSelectionSingle(pidx, brw.focusRow, true);
			};
			break;
		}
	} else if (mask == KMask.alt) {
		if(vkey == 115) fb.RunMainMenuCommand("文件/退出");
	}
};

//=================================================// Playlist Callbacks
function on_playback_new_track(metadb) {
	if(plman.PlayingPlaylist == pidx) brw.repaint();
};
function on_playback_stop() {
	if(plman.PlayingPlaylist == pidx) brw.repaint();
}

function on_item_focus_change(playlistIndex, from, to){
	if(playlistIndex == pidx) {
		brw.focusRow = to;
		brw.showFocusItem(false, false);
	}
}

function on_playlist_items_selection_change() {
	brw.repaint();
};

function on_playlists_changed() {
	if (plman.PlaylistCount > 0 && (plman.ActivePlaylist < 0 || plman.ActivePlaylist > plman.PlaylistCount - 1)) {
		plman.ActivePlaylist = 0;
	};
	pidx = plman.ActivePlaylist;
	brw.repaint();
};

function on_playlist_switch() {
		pidx = plman.ActivePlaylist;
		brw.populate();
};

function on_playlist_items_added(playlist_idx) {
	if (playlist_idx == pidx) {
		brw.populate();
	}
}

function on_playlist_items_removed(playlist_idx) {
	if (playlist_idx == pidx) {
		brw.populate();
	}
}

//=================================================// Custom functions

function check_scroll(scroll___) {
	if (scroll___ < 0) scroll___ = 0;
	var end_limit = (brw.rowsCount * ppt.rowHeight) - brw.scrollbar.totalRowsVish;
	if (scroll___ != 0 && scroll___ > end_limit) {
		scroll___ = end_limit;
	};
	if (scroll___ == 1) scroll___ = 0;
	return scroll___;
};

function on_font_changed() {
	get_font();
	get_metrics();
	init_btn();
	get_images();
	on_size();
	brw.repaint();
};

function on_colours_changed() {
	get_colors();
	get_images();
	init_btn();
	if (brw) brw.scrollbar.setNewColors();
	brw.repaint();
};

function on_notify_data(name, info) {
	switch (name) {
	case "color_scheme_updated":
		var c_ol_tmp = g_color_highlight;
		if(info) g_color_highlight = RGB(info[0], info[1], info[2]);
		else {
			g_color_highlight = c_default_hl;
			g_color_normal_bg = g_color_normal_bg_default;
			g_color_selected_bg = g_color_selected_bg_default;
		}
		if(g_color_highlight != c_ol_tmp){
			if(info){
				if(dark_mode){
					if(info.length == 3) {
						g_color_normal_bg = blendColors(g_color_normal_bg_default, RGB(info[0], info[1], info[2]), 0.1);
						g_color_selected_bg = blendColors(g_color_selected_bg_default, RGB(info[0], info[1], info[2]), 0.2);
					} else {
						g_color_normal_bg = blendColors(g_color_normal_bg_default, RGB(info[3], info[4], info[5]), 0.1);
						g_color_selected_bg = blendColors(g_color_selected_bg_default, RGB(info[3], info[4], info[5]), 0.2);
					}
				} else{
					if(g_color_normal_bg_default != 4294967295) {
						g_color_normal_bg = blendColors(g_color_normal_bg_default, RGB(info[0], info[1], info[2]), 0.1);
						g_color_selected_bg = blendColors(g_color_selected_bg_default, RGB(info[0], info[1], info[2]), 0.2);
					}
				}
			}
			brw.repaint();
		}
		break;
	case "scrollbar_width":
		sys_scrollbar = info;
		window.SetProperty("foobox.ui.scrollbar.system", sys_scrollbar);
		cScrollBar.width = sys_scrollbar ? get_system_scrollbar_width() : 12*zdpi;
		cScrollBar.maxCursorHeight = sys_scrollbar ? 125*zdpi : 110*zdpi;
		get_metrics();
		brw.scrollbar.updateScrollbar();
		brw.scrollbar.setSize();
		brw.setSize(0, ppt.headerBarHeight, ww - cScrollBar.width, wh - ppt.headerBarHeight);
		brw.repaint();
		break;
	case "ScrollStep":
		ppt.rowScrollStep = info;
		window.SetProperty("_PROPERTY: Scroll Step", ppt.rowScrollStep);
		break;
	}
};