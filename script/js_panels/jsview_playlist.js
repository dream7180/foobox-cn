// foobox https://github.com/dream7180
window.DefinePanel('simple js playlist viewer', {author: 'dreamawake'});
include(fb.ProfilePath + 'foobox\\js_common\\getconfig.js');
include(fb.ProfilePath + 'foobox\\js_common\\common.js');
include(fb.ProfilePath + 'foobox\\js_common\\JScommon.js');
include(fb.ProfilePath + 'foobox\\js_common\\JScomponents.js');
var panel = [], active_p;
var mpinfo = {
	names: [],
	icos: [],
	active: 0
};
var leftratio = window.GetProperty("LeftPane.Ratio", 0.7825);
var pcb, rx = 0;
var sys_scrollbar = cfg_map.sys_scrollbar;
var zdpi = 1, dark_mode = 0;
var g_font, g_font_b, g_font_track;
var g_color_line, g_color_line_div, g_color_playing_txt = c_white;
var sp_drag = false;
var sizectl = 0;

var brw = null;
var isScrolling = false;
var ww = 0, wh = 0;
var m_x = 0, m_y = 0;
//mouse status in brw range, lbtn_brw is lbtn pressed and hold within brw
var m_mouse = { hover: false, lbtn_brw: false };
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
var Queue_timer = false;
// 行文本缓存失效标记：加一即整表缓存失效（O(1)）
var g_text_epoch = 1;
// 播放队列是否非空，避免每行每帧调用 FindPlaybackQueueItemIndex
var g_has_queue = false;
// 列表事件去抖；曲目数低于阈值时直接同步重建
var g_items_timer = false;
var g_metadb_timer = false;
var G_SYNC_REBUILD_MAX = 1000;
var g_panel_timer = false;
var g_panel_target = 0;
// 视图模式（active = 当前播放列表，lib = 媒体库视图）的行数据快照
var g_view_mode = "active";
var g_snapshots = {};

// cache TitleFormat objects once instead of creating them per row/frame in draw()
var tf_length = fb.TitleFormat("%length%");
var tf_title = fb.TitleFormat("%title%");
var tf_tracknum = fb.TitleFormat("$if2(%tracknumber%,)");
// group-by TF objects (indexed by title_type - 1)
var tf_string = ["$if2(%album%,单曲)", "$if2(%album artist%,未知艺术家)", "$if2(%artist%,未知艺术家)", "$if2(%genre%,未知流派)", "%directoryname%"].map(function(f) {
	return fb.TitleFormat(f);
});
var btn_sw;
var btn_clicked = false;

var ppt = {
	defaultRowHeight: cfg_map.LineHeight,
	rowHeight: 0,
	rowScrollStep: cfg_map.ScrollStep,
	scrollSmoothness: 2.0,
	refreshRate: 20,
	headerBarHeight: 28,
	showGrid: window.GetProperty("_PROPERTY: Show Grid", true),
	show_activepl: window.GetProperty("List: Show active playlist", false),
	title_type: window.GetProperty("List: Group type", 1),
	enableTouchControl: window.GetProperty("_PROPERTY: Touch control", true)
};
cfg_map = {};
var rowScrollStep_org = ppt.rowScrollStep;

var cTouch = {
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

var cScrollBar = {
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

var timers = {
	mouseDown: false
};

//==============Objects======================================================
var oPlaylist = function(idx, metadb) {
	this.idx = idx;
	this.metadb = metadb;
	// 行文本缓存（title/length/tracknumber），由 g_text_epoch 统一失效
	this._epoch = 0;
	this._title = "";
	this._len = "";
	this._tnum = "";
};

var oBrowser = function(name) {
	this.name = "";
	this.rows = [];
	this.rowsCount = 0;
	this.scrollbar = new oScrollbar();
	this.focusRow = plman.GetPlaylistFocusItemIndex(pidx);
	this.activeRow = this.focusRow;
	this.SHIFT_start_id = null;
	this.show_tracknum = false;
	this.tag = "";
	
	this.launch_populate = function() {
		window.SetTimeout(function() {
			brw.populate();
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
		var _list = plman.GetPlaylistItems(pidx);
		var rows = this.rows;
		// 复用行对象，避免每次重建都为整个列表重新分配
		if (rows.length < total) {
			for (var i = rows.length; i < total; i++) rows.push(new oPlaylist(i, _list[i]));
		} else if (rows.length > total) {
			rows.length = total;
		};
		for (var i = 0; i < total; i++) {
			rows[i].idx = i;
			rows[i].metadb = _list[i];
		};
		this.rowsCount = total;
		// 列表内容变了，行文本缓存统一失效
		g_text_epoch++;
		this.show_tracknum = false;
		this.getlimits(); 
		
		if (pcb && !ppt.show_activepl){
			this.tag = "\uEF13";
			if(this.rows.length == 0){
				this.name = "";
				return;
			}
			var subject_start, subject_end;
			if(ppt.title_type == 6){
				var path_start = fb.GetLibraryRelativePath(_list[0]).split("\\");
				var path_end = fb.GetLibraryRelativePath(_list[total - 1]).split("\\");
				if(path_start.length == 1) {
					if(path_start[0] != "") subject_start = "媒体库根目录";
					else subject_start = "非媒体库目录";
				} else {
					subject_start = path_start[0];
				}
				if(path_end.length == 1) {
					if(path_end[0] != "") subject_end = "媒体库根目录";
					else subject_end = "非媒体库目录";
				} else {
					subject_end = path_end[0];
				}
		} else {
			subject_start = tf_string[ppt.title_type - 1].EvalWithMetadb(_list[0]);
			subject_end = tf_string[ppt.title_type - 1].EvalWithMetadb(_list[total - 1]);
		}
			if(subject_start.toUpperCase() != subject_end.toUpperCase()) this.name = "所有项目";
			else {
				this.name = subject_start;
				if(ppt.title_type == 1 && this.name != "单曲") this.show_tracknum = true;
			}
		} else {
			this.name = plman.GetPlaylistName(pidx);
			if(pidx > -1 && plman.IsAutoPlaylist(pidx)) this.tag = "\uEECD";
			else this.tag = "\uECEC";
		}
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

	this.showFocusItem = function(showplaying, forcedUpdate) {
		if(showplaying && fb.IsPlaying && plman.PlayingPlaylist == pidx) var rowId = plman.GetPlayingItemLocation().PlaylistItemIndex;
		else var rowId = this.focusRow;

		if (rowId > -1 && !this.isVisibleItem(rowId)) {
			scroll = (rowId - Math.floor(this.totalRowsVis / 2)) * ppt.rowHeight;
			scroll = check_scroll(scroll);
			this.scrollbar.updateScrollbar();
		} else if(forcedUpdate){
			scroll = scroll_ = 0;
			this.scrollbar.updateScrollbar();
		}
	};

	this.draw = function(gr) {
		if (repaint_main || !repaintforced) {
			repaint_main = false;
			repaintforced = false;
			var isplaying_pidx = (fb.IsPlaying && plman.PlayingPlaylist == pidx);
			var playing_itemidx = isplaying_pidx ? plman.GetPlayingItemLocation().PlaylistItemIndex : -1;
			var has_queue = g_has_queue;
			var queue_idx = -1;
			var track_color = g_color_tracknum;
			var tag_color = isplaying_pidx ? g_color_highlight : g_color_tracknum;
			var ax = this.x, ay = 0;
			var aw = this.w + cScrollBar.width;
			var ah = ppt.rowHeight;
			var rh = gr.CalcTextWidth("0" + this.rows.length.toString(), g_font);
			var tx = ax + rh + this.paddingLeft + 4;
			// 行宽常量提到循环外
			var txt_tracklen_w = gr.CalcTextWidth("00:00:00", g_font_track);
			var show_len_col = brw.w > window.MinWidth;
			if (this.rows.length > 0) {
				for (var i = g_start_; i <= g_end_; i++) {
					var row = this.rows[i];
					ay = Math.floor(this.y + (i * ah) - scroll_);
					row.x = ax;
					row.y = ay;
					if (ay > this.y - ppt.headerBarHeight - ah && ay < this.y + this.h) {
						if (row._epoch != g_text_epoch) {
							// 曲目文本按行懒缓存，滚动时不再逐帧重复求值
							row._title = tf_title.EvalWithMetadb(row.metadb);
							row._len = tf_length.EvalWithMetadb(row.metadb);
							row._tnum = this.show_tracknum ? tf_tracknum.EvalWithMetadb(row.metadb) : "";
							row._epoch = g_text_epoch;
						};
						queue_idx = has_queue ? plman.FindPlaybackQueueItemIndex(row.metadb, pidx, row.idx) + 1 : 0;
						var txt_idx = this.show_tracknum ? row._tnum : row.idx + 1;
						// row bg
						if(ppt.showGrid) gr.DrawLine(ax, ay + ah, ax + aw, ay + ah, 1, g_color_line);
						if (plman.IsPlaylistItemSelected(pidx, row.idx)) {
							track_color = g_color_normal_txt;
							gr.FillSolidRect(ax, ay, aw, ah, g_color_selected_bg);
						}
						if (isplaying_pidx && row.idx == playing_itemidx) {
							var font = g_font_b;
							var name_color = g_color_playing_txt;
							track_color = g_color_playing_txt;
							gr.FillSolidRect(ax, ay, aw, ah, g_color_highlight);
							gr.GdiDrawText("\uF507", g_font_tag, c_white, ax + this.paddingLeft, ay, rh, ah, lc_txt);
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
						if(show_len_col) {
							gr.GdiDrawText(row._title, font, name_color, tx, ay, aw - txt_tracklen_w - this.paddingRight*3, ah, lc_txt);
							gr.GdiDrawText(row._len, g_font_track, track_color, ww - txt_tracklen_w - this.paddingRight, ay, txt_tracklen_w, ah, rc_txt);
						} else gr.GdiDrawText(row._title, font, name_color, tx, ay, aw - this.paddingRight, ah, lc_txt);
					};
				};
			}
			gr.FillSolidRect(ax, 0, aw, ppt.headerBarHeight+1, g_color_normal_bg);
			gr.FillGradRect(ww-1, 0, 1, wh, 0, g_color_normal_bg, g_color_normal_bg, 1);//bug of win10 border
			gr.FillSolidRect(ax-1, 0, aw+1, ppt.headerBarHeight - 2, g_color_topbar);
			gr.DrawLine(ax-1, ppt.headerBarHeight, ww, ppt.headerBarHeight, 1, g_color_line_div);
			gr.GdiDrawText(this.tag, g_font_tag, tag_color, ax + this.paddingLeft, 0, this.paddingLeft*2, ppt.headerBarHeight, lc_txt);
			gr.GdiDrawText(this.name, g_font, g_color_normal_txt, ax + this.paddingLeft*4, 0, ww - btn_sw.w - rh - this.paddingLeft*6 - rx, ppt.headerBarHeight, lc_txt);
			gr.GdiDrawText(this.rows.length, g_font, g_color_normal_txt, ww - btn_sw.w - this.paddingLeft*2 - rh, 0, rh+this.paddingLeft, ppt.headerBarHeight, rc_txt);
			brw.scrollbar && brw.scrollbar.draw(gr);
			gr.DrawLine(ax-1, 0, ax-1, wh, 1, g_color_split);
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
			window.RepaintRect(brw.x - 2, 0, brw.w + cScrollBar.width + 2, wh);
		};
		scroll_prev = scroll;
	}, ppt.refreshRate);

	this.context_menu = function(x, y, id) {
		var _menu = window.CreatePopupMenu();
		var _child01 = window.CreatePopupMenu();
		var Context = fb.CreateContextMenuManager();
		var metadblist_selection = plman.GetPlaylistSelectedItems(pidx);
		if(metadblist_selection.Count > 0){
			let plname = plman.GetPlaylistName(pidx);
			if(plname != "媒体库视图") _menu.AppendMenuItem((plman.IsAutoPlaylist(pidx) || plname == "播放队列")?MF_DISABLED|MF_GRAYED:MF_STRING, 800, "移除");
			Context.InitContext(metadblist_selection);
			Context.BuildMenu(_menu, 3, -1);
			if(plman.PlaylistCount > 1 && plman.PlaylistCount < 51){
				var addline = true;
				for (var i = 0; i < plman.PlaylistCount; i++) {
					if (i != pidx && !plman.IsAutoPlaylist(i)) {
						if (addline) {
							_child01.AppendTo(_menu, MF_STRING, "添加到...");
							_child01.AppendMenuItem(MF_STRING, 801, "新建播放列表");
							_child01.AppendMenuSeparator();
							addline = false;
						}
						_child01.AppendMenuItem(MF_STRING, 1000 + i, plman.GetPlaylistName(i));
					}
				}
				if(addline) _menu.AppendMenuItem(MF_STRING, 801, "发送到新建播放列表");
			} else _menu.AppendMenuItem(MF_STRING, 801, "发送到新建播放列表");
		}
		var ret = _menu.TrackPopupMenu(x, y);
		if (ret > 2 && ret < 800) {
			Context.ExecuteByID(ret - 3);
		}else if (ret == 800){
			plman.RemovePlaylistSelection(pidx, false);
		}else if (ret == 801){
			plman.CreatePlaylist(plman.PlaylistCount, '');
			plman.InsertPlaylistItems(plman.PlaylistCount - 1, 0, metadblist_selection, false);
		}else if (ret > 999){
			var insert_index = plman.PlaylistItemCount(ret - 1000);
			plman.InsertPlaylistItems((ret - 1000), insert_index, metadblist_selection, false);
		}
	};
};

 
	// menu item ids are playlist index + 1 (0 is returned on menu cancel)
var PL_Menu = function(x, y) {
	var PLmenu = window.CreatePopupMenu();
	var total = plman.PlaylistCount;
	const pl_no = Math.ceil(total / 30);
	if (!total) PLmenu.AppendMenuItem(MF_DISABLED, 0, "无播放列表");
	else if(total < 31) {
		for (var i = 0; i < total; i++) {
			if(fb.IsPlaying && i == plman.PlayingPlaylist) PLmenu.AppendMenuItem(MF_STRING, i + 1, plman.GetPlaylistName(i) + " ►");
			else PLmenu.AppendMenuItem(MF_STRING, i + 1, plman.GetPlaylistName(i));
		}
		PLmenu.CheckMenuRadioItem(1, total, plman.ActivePlaylist + 1);
	} else {
		for (let j = 0; j < pl_no; j++) {
				const n = '# ' + (j * 30 + 1 + ' - ' + Math.min(total, 30 + j * 30) + (30 + j * 30 > plman.ActivePlaylist && ((j * 30) - 1) < plman.ActivePlaylist ? ' ▪' : ''));
				var child1 = window.CreatePopupMenu();
				child1.AppendTo(PLmenu, MF_STRING | MF_POPUP, n);
				for (let i = j * 30; i < Math.min(total, 30 + j * 30); i++) {
					if(fb.IsPlaying && i == plman.PlayingPlaylist) child1.AppendMenuItem(MF_STRING, i + 1, plman.GetPlaylistName(i) + " ►");
					else child1.AppendMenuItem(MF_STRING, i + 1, plman.GetPlaylistName(i));
					if(i == plman.ActivePlaylist) child1.CheckMenuRadioItem(i + 1, i + 1, i + 1);
			}
		}
	}
	var ret = PLmenu.TrackPopupMenu(x, y);
	if (ret > 0) {
		plman.ActivePlaylist = ret - 1;
		pidx = ret - 1;
	}
}
//=================================== Main ================================================================
function init_btn(){
	if (pcb) {
		if (ppt.show_activepl) btn_sw = new button(img_plsw_2, img_plsw_2, img_plsw_2, "切换到视图列表");
		else btn_sw = new button(img_plsw, img_plsw, img_plsw, "切换到当前列表");
	} else {
		btn_sw = new button(false, img_menubt, img_menubt);
	}
}

function check_pidx() {
	if (!pcb || ppt.show_activepl) pidx = plman.ActivePlaylist;
	else {
		var total = plman.PlaylistCount;
		pidx = -1;
		for (var i = 0; i < total; i++) {
			if (plman.GetPlaylistName(i) == "媒体库视图") {
				pidx = i;
			}
		}
		// fallback: create the missing view playlist (same behaviour as jssb.js)
		if (pidx < 0) {
			plman.CreatePlaylist(total, "媒体库视图");
			pidx = plman.PlaylistCount - 1;
		}
	}
	return pidx;
}

function get_view_mode() {
	return (pcb && !ppt.show_activepl) ? "lib" : "active";
}

// 播放列表增删/重排时，把对应 pidx 的快照标记为失效（O(1)，不在隐藏状态下重建）
function mark_snapshot_dirty(playlist_idx) {
	for (var k in g_snapshots) {
		var s = g_snapshots[k];
		if (s && s.pidx == playlist_idx) s.dirty = true;
	};
}

function save_view_snapshot(mode) {
	if (!mode) return;
	var s = g_snapshots[mode];
	if (!s) s = g_snapshots[mode] = {};
	s.pidx = pidx;
	s.plname = plman.GetPlaylistName(pidx);
	s.rows = brw.rows;
	s.rowsCount = brw.rowsCount;
	s.scroll = scroll;
	s.focusRow = brw.focusRow;
	s.activeRow = brw.activeRow;
	s.SHIFT_start_id = brw.SHIFT_start_id;
	s.name = brw.name;
	s.tag = brw.tag;
	s.show_tracknum = brw.show_tracknum;
	s.dirty = false;
}

function restore_view_snapshot(mode) {
	var s = g_snapshots[mode];
	if (!s || s.dirty) return false;
	if (s.pidx != pidx) return false;
	// 播放列表增删/重排可能让索引指向别的列表：名称不一致就不复用
	if (s.plname != plman.GetPlaylistName(pidx)) return false;
	brw.rows = s.rows;
	brw.rowsCount = s.rowsCount;
	brw.focusRow = s.focusRow;
	brw.activeRow = s.activeRow;
	brw.SHIFT_start_id = s.SHIFT_start_id;
	brw.name = s.name;
	brw.tag = s.tag;
	brw.show_tracknum = s.show_tracknum;
	scroll_ = scroll = check_scroll(s.scroll);
	brw.getlimits();
	brw.scrollbar.updateScrollbar();
	return true;
}

// 在 active / lib 两种模式之间切换：能命中快照就不调用 GetPlaylistItems
function switch_view_mode() {
	var mode = get_view_mode();
	if (mode == g_view_mode) {
		brw.repaint();
		return;
	};
	save_view_snapshot(g_view_mode);
	pidx = check_pidx();
	g_view_mode = mode;
	if (!restore_view_snapshot(mode)) {
		var s = g_snapshots[mode];
		brw.rows = (s && s.rows) ? s.rows : [];
		brw.populate();
	};
	brw.repaint();
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

var check_leavemenu = function(){
	var _state = btn_sw.state;
	if(btn_clicked && _state == ButtonStates.hover) btn_clicked = false;
	else btn_sw.state = ButtonStates.normal;
	if(btn_sw.state != _state) btn_sw.repaint();
};

function on_init() {
	window.DlgCode = DLGC_WANTALLKEYS;
	get_font();
	get_panel();
	window.MinWidth = sizectl * 2;
	window.MinHeight = window.MinWidth;
	get_colors();
	get_metrics();
	get_images();
	init_btn();
	check_pidx();
	brw = new oBrowser();
	g_view_mode = get_view_mode();
	// 初始化队列非空标记，避免绘制时逐行查找队列
	g_has_queue = plman.GetPlaybackQueueContents().length > 0;
};

// START
on_init();

function on_size() {
	ww = window.Width;
	wh = window.Height;
	if (!ww || !wh) return;
	rx = Math.round((ww-2)*leftratio) + 2;
	brw.setSize(rx, ppt.headerBarHeight, ww - cScrollBar.width - rx, wh - ppt.headerBarHeight);
	set_panel(rx - 1);
	brw.repaint();
};

function on_paint(gr) {
	if (!ww) return;
	gr.FillSolidRect(0, 0, ww, wh, g_color_normal_bg);
	brw && brw.draw(gr);
	if (pcb) {
		btn_sw.draw(gr, ww - btn_sw.w - 1, Math.floor((ppt.headerBarHeight - btn_sw.h) / 2), 255);
	} else {
		btn_sw.draw(gr, ww - btn_sw.w - z(3), Math.floor((ppt.headerBarHeight - btn_sw.h - z(2)) / 2), 255);
		gr.GdiDrawText("\uEF3E", g_font_tag, g_color_normal_txt, btn_sw.x, btn_sw.y, btn_sw.w, btn_sw.h, cc_txt);
	}
};

function on_mouse_lbtn_down(x, y) {
	if(x < rx + 2) {
		sp_drag = true;
		g_panel_target = rx - 1;
	}
	else{
		m_mouse.lbtn_brw = true;
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
						if (Math.abs(cTouch.y_start - m_y) > 13) { // touch drag threshold (px)
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
		if (pcb) {
			btn_sw.checkstate("down", x, y);
		} else if(btn_sw.checkstate("down", x, y) == ButtonStates.down) {
			btn_clicked = true;
			btn_sw.state = ButtonStates.hover;
		};
	};
};

function on_mouse_lbtn_up(x, y) {
	m_mouse.lbtn_brw = false;
	if(sp_drag){
		sp_drag = false;
		// 丢弃未执行的帧定时器，并把最终位置立即落地
		if (g_panel_timer) {
			window.ClearTimeout(g_panel_timer);
			g_panel_timer = false;
		};
		set_panel(g_panel_target);
		brw.setSize(g_panel_target + 2, ppt.headerBarHeight, ww - cScrollBar.width - g_panel_target - 2, wh - ppt.headerBarHeight);
		window.Repaint();
		leftratio = (brw.x + 2)/(ww - 2);
		rx = Math.round((ww - 2) * leftratio) + 2;
		brw.setSize(rx, ppt.headerBarHeight, ww - cScrollBar.width - rx, wh - ppt.headerBarHeight);
		window.Repaint();
		set_panel(rx - 1);
		window.SetProperty("LeftPane.Ratio", Math.round(leftratio*100000)/100000); // 松开时写一次，避免拖动中每帧写盘
	}
	brw.on_mouse("up", x, y);
	if (timers.mouseDown) {
		window.ClearTimeout(timers.mouseDown);
		timers.mouseDown = false;
		if (Math.abs(cTouch.y_start - m_y) <= 24) {
			brw.on_mouse("down", x, y);
		};
	};
	// create scroll inertia on mouse lbtn up
	if (cTouch.down) {
		cTouch.down = false;
		cTouch.y_end = y;
		cTouch.scroll_delta = scroll - scroll_;
		if (Math.abs(cTouch.scroll_delta) > 24) {
			cTouch.multiplier = ((1000 - cTouch.t1.Time) / 20);
			cTouch.delta = Math.round((cTouch.scroll_delta) / 24);
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
	if (pcb) {
		if (btn_sw.checkstate("up", x, y) == ButtonStates.hover) {
			ppt.show_activepl = !ppt.show_activepl;
			window.SetProperty("List: Show active playlist", ppt.show_activepl);
			init_btn();
			switch_view_mode();
		}
	} else {
		if (btn_clicked && btn_sw.checkstate("up", x, y) == ButtonStates.hover) {
			if(plman.PlaylistCount < 901) PL_Menu(ww-btn_sw.w-4*zdpi, btn_sw.h+4*zdpi);
			else fb.RunMainMenuCommand("视图/播放列表管理器");
			btn_sw.state = ButtonStates.normal;
			btn_sw.repaint();
		}
		btn_clicked = false;
	}
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
	m_mouse.hover = true;
	if(m_x == x && m_y == y) return;
	if(!sp_drag){
		if(x < rx + 2 && !m_mouse.lbtn_brw){
			window.SetCursor(32644);//IDC_SIZEWE
		}else{
			window.SetCursor(32512);//IDC_ARROW
			if (cTouch.down) {
				cTouch.y_current = y;
				cTouch.y_move = (cTouch.y_current - cTouch.y_prev);
				if (x < brw.w) {
					scroll -= cTouch.y_move;
					cTouch.scroll_delta = scroll - scroll_;
					if (Math.abs(cTouch.scroll_delta) < 24) cTouch.y_start = cTouch.y_current;
					cTouch.y_prev = cTouch.y_current;
				};
			}
			else {
				brw.on_mouse("move", x, y);
			};
			btn_sw.checkstate("move", x, y);
		}
	} else if(x > sizectl && (ww - x) > sizectl){
		// 只更新目标位置；已有待执行任务时不重置计时器，避免被高频鼠标事件饿死
		g_panel_target = x - 1;
		if (!g_panel_timer) {
			g_panel_timer = window.SetTimeout(function() {
				g_panel_timer = false;
				var pw = g_panel_target;
				set_panel(pw);
				brw.setSize(pw + 2, ppt.headerBarHeight, ww - cScrollBar.width - pw - 2, wh - ppt.headerBarHeight);
				window.Repaint();
			}, 20);
		};
	}
	m_x = x;
	m_y = y;
};

function on_mouse_wheel(step) {
	if (cTouch.timer) {
		window.ClearInterval(cTouch.timer);
		cTouch.timer = false;
	};
    if(brw.rowsCount == 0) return;
	if(!m_mouse.hover || m_x < rx) return;
	scroll -= step * ppt.rowHeight * ppt.rowScrollStep;
	scroll = check_scroll(scroll);
};

function on_mouse_leave() {
	m_mouse.hover = false;
	if(!sp_drag) window.SetCursor(32512);//IDC_ARROW
	brw.on_mouse("leave", 0, 0);
	if (pcb) btn_sw.checkstate("leave", 0, 0);
	else check_leavemenu();
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
	let btn_w = Math.floor(24 * zdpi);
	let btn_h = Math.floor(12 * zdpi) + 12;
	let gb, x5 = 5*zdpi;
	img_plsw = gdi.CreateImage(btn_w, btn_h);
	gb = img_plsw.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillRoundRect(2*zdpi,x5, 18*zdpi,10*zdpi, x5,x5, g_color_bt_overlay);
	gb.FillRoundRect(2*zdpi+2,x5+2, 10*zdpi-4,10*zdpi-4, x5-2,x5-2, RGBA(255, 255, 255, 180));
	img_plsw.ReleaseGraphics(gb)
	
	img_plsw_2 = gdi.CreateImage(btn_w, btn_h);
	gb = img_plsw_2.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillRoundRect(2*zdpi,x5, 18*zdpi,10*zdpi, x5,x5, g_color_bt_overlay);
	gb.FillRoundRect(10*zdpi+2,x5+2, 10*zdpi-4,10*zdpi-4, x5-2,x5-2, RGBA(255, 255, 255, 180));
	img_plsw_2.ReleaseGraphics(gb);

	// multi 模式的播放列表菜单按钮
	let mbt_w = z(24);
	img_menubt = gdi.CreateImage(mbt_w, mbt_w);
	gb = img_menubt.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillRoundRect(0, 0, mbt_w-1, mbt_w-1, z(3), z(3), g_color_bt);
	img_menubt.ReleaseGraphics(gb);
};

function get_font() {
	g_font = window.GetFontDUI(FontTypeDUI.playlists);
	zdpi = g_font.Size / 12;
	g_fsize = g_font.Size;
	g_font_b = GdiFont(g_font.Name, g_font.Size, 1);
	g_track_size = Math.max(10, g_font.Size - 2);
	g_font_track = GdiFont(g_font.Name, g_track_size, g_font.Style);
	g_font_tag = GdiFont("remixicon", g_fsize+2, 0);
	sizectl = z(50);
};

function get_colors() {
	g_color_normal_txt = window.GetColourDUI(ColorTypeDUI.text);
	g_color_normal_bg_default = window.GetColourDUI(ColorTypeDUI.background);
	g_color_selected_bg_default = window.GetColourDUI(ColorTypeDUI.selection);
	c_default_hl = window.GetColourDUI(ColorTypeDUI.highlight);
	g_color_selected_txt = g_color_normal_txt;
	g_color_normal_bg = g_color_normal_bg_default;
	g_color_bt_overlay = g_color_normal_txt & 0x45ffffff;
	g_color_bt = g_color_normal_txt & 0x35ffffff;
	g_scroll_color = g_color_normal_txt & 0x95ffffff;
	g_color_selected_bg = g_color_selected_bg_default;
	g_color_highlight = c_default_hl;
	g_color_tracknum = blendColors(g_color_normal_bg, g_color_normal_txt, 0.65);
	if(isDarkMode(g_color_normal_bg)) {
		dark_mode = 1;
		g_color_topbar = RGBA(0,0,0,30);
		g_color_line = RGBA(0, 0, 0, 25);
		g_color_line_div = RGBA(0, 0, 0, 55);
		g_color_split = RGBA(0,0,0,100);
	}
	else {
		dark_mode = 0;
		g_color_topbar = RGBA(0,0,0,15);
		g_color_line = RGBA(0, 0, 0, 18);
		g_color_line_div = RGBA(0, 0, 0, 45);
		g_color_split = RGBA(0,0,0,75);
	}
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
	} else if (mask == KMask.ctrl) {
		if(vkey == 49){
			if(rowScrollStep_org != 1){
				if(ppt.rowScrollStep != 1) ppt.rowScrollStep = 1;
				else ppt.rowScrollStep = rowScrollStep_org;
			}
		}
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

function on_playback_queue_changed(origin) {
	if (!Queue_timer) {
		Queue_timer = window.SetTimeout(function() {
			window.ClearTimeout(Queue_timer);
			Queue_timer = false;
			// 只有队列非空时才需要在绘制里逐行查找队列序号
			g_has_queue = plman.GetPlaybackQueueContents().length > 0;
			brw.repaint();
		}, 250);
	}
}

// 列表事件重建：小列表直接同步重建，大列表合并到一次 150ms 后重建
function schedule_list_rebuild() {
	if (brw.rowsCount < G_SYNC_REBUILD_MAX) {
		if (g_items_timer) {
			window.ClearTimeout(g_items_timer);
			g_items_timer = false;
		};
		brw.populate();
		return;
	};
	if (g_items_timer) return;
	g_items_timer = window.SetTimeout(function() {
		g_items_timer = false;
		brw.populate();
	}, 150);
};

function on_playlists_changed() {
	if (plman.PlaylistCount > 0 && (plman.ActivePlaylist < 0 || plman.ActivePlaylist > plman.PlaylistCount - 1)) {
		plman.ActivePlaylist = 0;
	};
	// 活跃列表的索引可能因增删/重排变化，快照不再可信
	if (g_snapshots["active"] && g_snapshots["active"].pidx != plman.ActivePlaylist) g_snapshots["active"].dirty = true;
	var pidx_old = pidx;
	pidx = check_pidx();
	// 实际切换了列表才需要重建，单纯改名/重排只需重绘
	if (pidx != pidx_old) {
		if (!restore_view_snapshot(g_view_mode)) {
			var s = g_snapshots[g_view_mode];
			brw.rows = (s && s.rows) ? s.rows : [];
			brw.populate();
		};
	} else brw.repaint();
};

function on_playlist_switch() {
	// 缓存的 active 快照已不对应当前的活跃列表
	if (g_snapshots["active"]) g_snapshots["active"].dirty = true;
	if (get_view_mode() == "active") {
		pidx = plman.ActivePlaylist;
		brw.populate();
	};
};

function on_playlist_items_added(playlist_idx) {
	mark_snapshot_dirty(playlist_idx);
	if (playlist_idx == pidx) schedule_list_rebuild();
}

function on_playlist_items_removed(playlist_idx) {
	mark_snapshot_dirty(playlist_idx);
	if (playlist_idx == pidx) schedule_list_rebuild();
}

function on_playlist_items_reordered(playlist_idx) {
	mark_snapshot_dirty(playlist_idx);
	if (playlist_idx == pidx) schedule_list_rebuild();
}

function on_metadb_changed(handles, fromhook) {
	// 标签变化后行文本需要重新求值
	if (brw.rowsCount < G_SYNC_REBUILD_MAX) {
		if (g_metadb_timer) {
			window.ClearTimeout(g_metadb_timer);
			g_metadb_timer = false;
		};
		g_text_epoch++;
		brw.repaint();
		return;
	};
	if (g_metadb_timer) return;
	g_metadb_timer = window.SetTimeout(function() {
		g_metadb_timer = false;
		g_text_epoch++;
		brw.repaint();
	}, 150);
}

//==panels===============
function get_panel(){
	let pdetect = undefined;
	pdetect = window.GetPanel('jssb');
	panel.push(pdetect);
	try{
		pdetect = window.GetPanel('biography');
		panel.push(pdetect);
		mpinfo.names.push('简介');
		mpinfo.icos.push('\uF2EF');
	}catch(e){}
	try{
		pdetect = window.GetPanel('video');
		panel.push(pdetect);
		mpinfo.names.push('视频');
		mpinfo.icos.push('\uEF7F');
	}catch(e){}
	try{
		pdetect = window.GetPanel('vis');
		panel.push(pdetect);
		mpinfo.names.push('可视化');
		mpinfo.icos.push('\uEA96');
	}catch(e){}
	for (let i = 0; i < panel.length; i++) {
		panel[i].ShowCaption = false;
		if(!panel[i].Hidden) {
			active_p = panel[i];
			mpinfo.active = i;
		}
	};
	if(mpinfo.active == 0) pcb = true;
	else pcb = false;
}

function set_panel(pw) {
	try{
		if(active_p.Width != pw || active_p.Height != wh)
		active_p.Move(0, 0, pw, wh);
	}catch(e){}
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
	brw.setSize(rx, ppt.headerBarHeight, ww - cScrollBar.width - rx, wh - ppt.headerBarHeight);
	brw.repaint();
};

function on_colours_changed() {
	get_colors();
	get_images();
	init_btn();
	if (brw) {
		brw.scrollbar.setNewColors();
		brw.repaint();
	}
};

function on_notify_data(name, info) {
	switch (name) {
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
		brw.repaint();
		break;
	case "show_subpanel":
		try{
			active_p.Show(false);
		}catch(e){}
		active_p = panel[info];
		active_p.Show(true);
		set_panel(rx - 1);
		let pcb_old = pcb;
		if(info == 0) pcb = true;
		else pcb = false;
		if(pcb != pcb_old){
			init_btn();
			switch_view_mode();
		}
		break;
	case "lib_cover_type":
		ppt.title_type = info;
		window.SetProperty("List: Group type", ppt.title_type);
		brw.populate();
		break;
	case "scrollbar_width":
		sys_scrollbar = info;
		cScrollBar.width = sys_scrollbar ? get_system_scrollbar_width() : 12*zdpi;
		cScrollBar.maxCursorHeight = sys_scrollbar ? 125*zdpi : 110*zdpi;
		get_metrics();
		brw.scrollbar.updateScrollbar();
		brw.scrollbar.setSize();
		brw.setSize(rx, ppt.headerBarHeight, ww - cScrollBar.width - rx, wh - ppt.headerBarHeight);
		brw.repaint();
		break;
	case "ScrollStep":
		ppt.rowScrollStep = info;
		break;
	case "row_height_changed":
		ppt.defaultRowHeight = info;
		get_metrics();
		brw.setSize(rx, ppt.headerBarHeight, ww - cScrollBar.width - rx, wh - ppt.headerBarHeight);
		brw.repaint();
		break;
	case "fetch_subpanels":
		info.names = mpinfo.names;
		info.icos = mpinfo.icos;
		info.active = mpinfo.active;
		break;
	}
};