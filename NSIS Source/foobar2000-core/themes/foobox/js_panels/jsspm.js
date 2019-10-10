// Name "JS Smooth Playlist Manager"
// Version "20151115-1000-151"
// Author "Br3tt aka Falstaff >> http://br3tt.deviantart.com"
//mod for foobox http://blog.sina.com.cn/dream7180

var fbx_set = [];
window.NotifyOthers("get_fbx_set", fbx_set);
var zdpi = fbx_set[9];
var ui_mode = fbx_set[11];
var random_color = fbx_set[12];
var show_shadow = fbx_set[28];
var g_handles = null;
var g_fname, g_fsize, g_fstyle;
var sys_scrollbar = fbx_set[29];
var default_sort =  window.GetProperty("_PROPERTY: New playlist sortorder", "%album% | %album artist% | %discnumber% | %tracknumber% | %title%");
function GetGrey(grey, alpha) {
	alpha = typeof alpha !== 'undefined' ? alpha : 255;
	return RGBA(grey, grey, grey, alpha);
}

var DefaultPlaylistIdx = -1;

function arrayContains(array, name) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] == name) return true;
	}
	return false;
}

var vbs = new ActiveXObject("ScriptControl");
vbs.Language = "VBScript";

function MsgBox(prompt, buttones, title) {
	prompt = prompt.replace(/"/g, '" + Chr(34) + "');
	prompt = prompt.replace(/\n/g, '" + Chr(13) + "');
	title = title.replace(/"/g, '" + Chr(34) + "');
	return vbs.eval('MsgBox' + '("' + prompt + '", "' + buttones + '", "' + title + '")');
}

function InputBox(prompt, title, default_value) {
	prompt = prompt.replace(/"/g, '" + Chr(34) + "');
	prompt = prompt.replace(/\n/g, '" + Chr(13) + "');
	title = title.replace(/"/g, '" + Chr(34) + "');
	default_value = default_value.replace(/"/g, '" + Chr(34) + "');
	return vbs.eval('InputBox' + '("' + prompt + '", "' + title + '", "' + default_value + '")');
}
/*
function CreatePlaylist() {
	var QuestionString = "输入播放列表名称。"
	var result = InputBox(QuestionString, "新建播放列表", "新建播放列表");
	if (result) {
		if (result == "") {
			plman.CreatePlaylist(plman.PlaylistCount, "新建播放列表");
		} else plman.CreatePlaylist(plman.PlaylistCount, result);

		window.SetProperty("Displayed playlist", plman.PlaylistCount - 1);
		on_playlist_switch();
	}
}

function DeletePlaylist(pid) {
	parsed_tabname = plman.GetPlaylistName(pid);

	var QuestionString = "要删除播放列表 '" + parsed_tabname + "' 吗?";
	var result = MsgBox(QuestionString, 4, "请确认");
	if (result == 6) {
		plman.RemovePlaylist(pid);
	}
}
*/
ppt = {
	defaultRowHeight: window.GetProperty("_PROPERTY: Row Height", 35),
	rowHeight: window.GetProperty("_PROPERTY: Row Height", 35),
	rowScrollStep: window.GetProperty("_PROPERTY: Scroll Step", 6),
	scrollSmoothness: 3.0,
	refreshRate: 20,
	showHeaderBar: window.GetProperty("_DISPLAY: Show Top Bar", true),
	lockReservedPlaylist: window.GetProperty("_PROPERTY: Lock Reserved Playlist", false),
	defaultHeaderBarHeight: 28,
	headerBarHeight: 28,
	showFilterBox: window.GetProperty("_PROPERTY: Enable Playlist Filterbox in Top Bar", true),
	showGrid: window.GetProperty("_PROPERTY: Show Grid", true),
	//drawUpAndDownScrollbar: window.GetProperty("_PROPERTY: Draw Up and Down Scrollbar Buttons", false),
	enableTouchControl: window.GetProperty("_PROPERTY: Touch control", true)
};
var track_gradient_size = 0;
var color_selected_row = GetGrey(219);
var gradient_p = 30;
var gradient_m = 10;
var b_red = 190;
var b_green = 190;
var b_blue = 190;
var border_color = RGBA(b_red, b_green, b_blue, 190);
var border_color_line = RGBA(b_red, b_green, b_blue, 170);
var border_color_0 = RGBA(b_red, b_green, b_blue, 0);
var border_color_15 = RGBA(b_red, b_green, b_blue, 15);
var border_color_25 = RGBA(b_red, b_green, b_blue, 25);
var border_color_40 = RGBA(b_red, b_green, b_blue, 40);
var PlaylistExcludedIdx = Array();
cPlaylistManager = {
	playlist_switch_pending: false,
	drag_clicked: false,
	drag_droped: false,
	drag_x: -1,
	drag_y: -1,
	drag_source_id: -1,
	drag_target_id: -1,
	inputbox_w: 0,
	inputbox_h: 0
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

cSettings = {
	visible: false
};

cFilterBox = {
	enabled: window.GetProperty("_PROPERTY: Enable Filter Box", true),
	//default_w: 106,
	//default_h: 20,
	x: 5,
	y: 4,
	w: 106,
	h: Math.round(20*zdpi)
};

cColumns = {
	dateWidth: 0,
	albumArtistWidth: 0,
	titleWidth: 0,
	genreWidth: 0
};

cScrollBar = {
	enabled: window.GetProperty("_DISPLAY: Show Scrollbar", true),
	visible: true,
	//themed: false,
	//defaultWidth: 14,
	width: sys_scrollbar ? get_system_scrollbar_width() : 12*zdpi,
	//normalWidth: 4,
	//hoverWidth: 12,
	//downWidth: 12,
	ButtonType: {
		cursor: 0,
		up: 1,
		down: 2
	},
	//defaultMinCursorHeight: 25,
	minCursorHeight: 25*zdpi,
	maxCursorHeight: sys_scrollbar ? 120*zdpi : 105*zdpi,
	timerID: false,
	timerCounter: -1
};

images = {};

blink = {
	x: 0,
	y: 0,
	totaltracks: 0,
	id: -1,
	counter: -1,
	timer: false
};

timers = {
	mouseWheel: false,
	saveCover: false,
	mouseDown: false,
	movePlaylist: false,
	deletePlaylist: false,
	rightClick: false,
	addPlaylistDone: false
};

//=================================================// Extra functions for playlist manager panel

function renamePlaylist() {
	if (!brw.inputbox.text || brw.inputbox.text == "" || brw.inputboxID == -1) brw.inputbox.text = brw.rows[brw.inputboxID].name;
	if (brw.inputbox.text.length > 1) {
	//if (brw.inputbox.text.length > 1 || (brw.inputbox.text.length == 1 && (brw.inputbox.text >= "a" && brw.inputbox.text <= "z") || (brw.inputbox.text >= "A" && brw.inputbox.text <= "Z") || (brw.inputbox.text >= "0" && brw.inputbox.text <= "9"))) {
		brw.rows[brw.inputboxID].name = brw.inputbox.text;
		plman.RenamePlaylist(brw.rows[brw.inputboxID].idx, brw.inputbox.text);
		window.SetCursor(IDC_ARROW);
		brw.repaint();
	};
	brw.inputboxID = -1;
};

//===================================================================================================
//    Objects
//===================================================================================================
oPlaylist = function(idx, rowId, name) {
	this.idx = idx;
	this.rowId = rowId;
	this.name = name;
	this.isAutoPlaylist = plman.IsAutoPlaylist(idx);
	this.islocked = false;
	if (ppt.lockReservedPlaylist && this.name == "媒体库" && this.idx == 0) this.islocked = true;
};

oBrowser = function(name) {
	this.name = name;
	this.rows = [];
	this.SHIFT_start_id = null;
	this.SHIFT_count = 0;
	this.scrollbar = new oScrollbar();
	this.keypressed = false;
	this.inputbox = null;
	this.inputboxID = -1;
	this.selectedRow = plman.ActivePlaylist;
	this.new_bt = null;

	this.images = {
		newplaylist_off: null,
		newplaylist_ov: null,
		newplaylist_dn: null
	};

	this.getImages = function() {
		var gb;
		var bt_w = 65*(zdpi+1), x7 = 7*zdpi, x9 = 9*zdpi, bt_h = ppt.rowHeight;
		this.images.newplaylist_off = gdi.CreateImage(bt_w, bt_h);
		gb = this.images.newplaylist_off.GetGraphics();
		gb.fillSolidRect(10+x7, bt_h / 2 - 1, x9, 1, g_color_normal_txt);
		gb.fillSolidRect(10+x7 + 4*zdpi, bt_h / 2 - 5*zdpi, 1, x9, g_color_normal_txt);
		this.images.newplaylist_off.ReleaseGraphics(gb);

		this.images.newplaylist_ov = gdi.CreateImage(bt_w, bt_h);
		gb = this.images.newplaylist_ov.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillEllipse(10, bt_h / 2 - 12*zdpi, 22*zdpi, 22*zdpi, g_color_bt_overlay);
		gb.SetSmoothingMode(0);
		gb.fillSolidRect(10+x7, bt_h / 2 - 1, x9, 1, g_color_normal_txt);
		gb.fillSolidRect(10+x7 + 4*zdpi, bt_h / 2 - 5*zdpi, 1, x9, g_color_normal_txt);
		this.images.newplaylist_ov.ReleaseGraphics(gb);

		this.images.newplaylist_dn = gdi.CreateImage(bt_w, bt_h);
		gb = this.images.newplaylist_dn.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillEllipse(10, bt_h / 2 - 12*zdpi, 22*zdpi, 22*zdpi, g_color_bt_overlay);
		gb.FillEllipse(10, bt_h / 2 - 12*zdpi, 22*zdpi, 22*zdpi, g_color_line);
		gb.SetSmoothingMode(0);
		gb.fillSolidRect(10+x7, bt_h / 2 - 1, x9, 1, g_color_normal_txt);
		gb.fillSolidRect(10+x7 + 4*zdpi, bt_h / 2 - 5*zdpi, 1, x9, g_color_normal_txt);
		this.images.newplaylist_dn.ReleaseGraphics(gb);

		this.new_bt = new button(this.images.newplaylist_off, this.images.newplaylist_ov, this.images.newplaylist_dn);
	};
	this.getImages();
	
	this.launch_populate = function() {
		var launch_timer = window.SetTimeout(function() {
			brw.populate(is_first_populate = true, reset_scroll = true);
			launch_timer && window.ClearTimeout(launch_timer);
			launch_timer = false;
		}, 5);
	};

	this.repaint = function() {
		if (!window.IsVisible) return;
		repaint_main1 = repaint_main2;
	};

	this.setSize = function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.marginLR = 0;
		this.paddingLeft = 8;
		this.paddingRight = cScrollBar.width + 1;
		this.totalRows = Math.ceil(this.h / ppt.rowHeight);
		this.totalRowsVis = Math.floor(this.h / ppt.rowHeight);

		this.getlimits();

		g_filterbox.setSize(cFilterBox.w, cFilterBox.h);

		if (this.inputboxID > -1) {
			var rh = ppt.rowHeight - 10;
			var tw = this.w - rh - 10;
			this.inputbox && this.inputbox.setSize(tw, rh);
		};

		this.scrollbar.setSize();

		scroll = Math.round(scroll / ppt.rowHeight) * ppt.rowHeight;
		scroll = check_scroll(scroll);
		scroll_ = scroll;

		// scrollbar update       
		this.scrollbar.updateScrollbar();
	};

	this.init_groups = function() {
		var rowId = 0;
		var name = "";
		var total = plman.PlaylistCount;
		this.previous_playlistCount = total;

		this.rows.splice(0, this.rows.length);
		CollectGarbage();
		var str_filter = process_string(filter_text);

		for (var i = 0; i < total; i++) {
			name = plman.GetPlaylistName(i);
			if (str_filter.length > 0) {
				var toAdd = match(name, str_filter);
			};
			else {
				var toAdd = true;
			};
			if (toAdd) {
				this.rows.push(new oPlaylist(i, rowId, name));
				rowId++;
			};
		};
		this.rowsCount = rowId;
		this.getlimits();
	};

	this.getlimits = function() {
		if (this.rowsCount <= this.totalRowsVis) {
			var start_ = 0;
			var end_ = this.rowsCount - 1;
		};
		else {
			if (scroll_ < 0) scroll_ = scroll;
			var start_ = Math.round(scroll_ / ppt.rowHeight + 0.4);
			var end_ = start_ + this.totalRows;
			// check boundaries
			start_ = start_ > 0 ? start_ - 1 : start_;
			if (start_ < 0) start_ = 0;
			if (end_ >= this.rows.length) end_ = this.rows.length - 1;
		};
		g_start_ = start_;
		g_end_ = end_;
	};

	this.populate = function(is_first_populate, reset_scroll) {
		this.init_groups();
		if (reset_scroll) scroll = scroll_ = 0;
		this.scrollbar.updateScrollbar();
		this.repaint();
		g_first_populate_done = true;
	};

	this.getRowIdFromIdx = function(idx) {
		var total = this.rows.length;
		var rowId = -1;
		if (plman.PlaylistCount > 0) {
			for (var i = 0; i < total; i++) {
				if (this.rows[i].idx == idx) {
					rowId = i;
					break;
				};
			};
		};
		return rowId;
	};

	this.isVisiblePlaylist = function(idx) {
		var rowId = this.getRowIdFromIdx(idx);
		var offset_active_pl = ppt.rowHeight * rowId;
		if (offset_active_pl < scroll || offset_active_pl + ppt.rowHeight > scroll + this.h) {
			return false;
		};
		else {
			return true;
		};
	};

	this.showSelectedPlaylist = function() {
		var rowId = this.getRowIdFromIdx(brw.selectedRow);

		if (!this.isVisiblePlaylist(brw.selectedRow)) {
			scroll = (rowId - Math.floor(this.totalRowsVis / 2)) * ppt.rowHeight;
			scroll = check_scroll(scroll);
			this.scrollbar.updateScrollbar();
		};
	};

	this.showActivePlaylist = function() {
		var rowId = this.getRowIdFromIdx(plman.ActivePlaylist);

		if (!this.isVisiblePlaylist(plman.ActivePlaylist)) {
			scroll = (rowId - Math.floor(this.totalRowsVis / 2)) * ppt.rowHeight;
			scroll = check_scroll(scroll);
			this.scrollbar.updateScrollbar();
		};
	};

	this.draw = function(gr) {
		if (cPlaylistManager.playlist_switch_pending) {
			window.SetCursor(IDC_ARROW);
			cPlaylistManager.playlist_switch_pending = false;
		};
		if (repaint_main || !repaintforced) {
			repaint_main = false;
			repaintforced = false;
			if (this.rows.length > 0) {
				var ax = this.marginLR;
				var ay = 0;
				var aw = this.w + cScrollBar.width;
				var ah = ppt.rowHeight;
				var g = 0;
				for (var i = g_start_; i <= g_end_; i++) {
					ay = Math.floor(this.y + (i * ah) - scroll_);
					this.rows[i].x = ax;
					this.rows[i].y = ay;
					if (ay > this.y - ppt.headerBarHeight - ah && ay < this.y + this.h) {
						// row bg
						var track_color_txt = RGB(150, 150, 150);
						if(ppt.showGrid) gr.DrawLine(ax, ay + ah, aw, ay + ah, 1, g_color_line);
						// active playlist row bg
						if (this.rows[i].idx == plman.ActivePlaylist || (arrayContains(PlaylistExcludedIdx, plman.ActivePlaylist) && this.rows[i].idx == DefaultPlaylistIdx && DefaultPlaylistIdx > -1)) {
							track_color_txt = g_color_normal_txt;
							gr.FillSolidRect(ax, ay, aw, ah, g_color_selected_bg);
						};
						if (this.rows[i].idx == plman.PlayingPlaylist && fb.IsPlaying) {
							gr.FillSolidRect(ax, ay, aw, ah, g_color_playing);
						}
						// hover item
						if ((i == this.activeRow && !g_dragndrop_status && !(cPlaylistManager.drag_clicked && cPlaylistManager.drag_source_id != i)) || (cPlaylistManager.drag_clicked && cPlaylistManager.drag_source_id == i && !g_dragndrop_status)) {
							gr.FillSolidRect(ax, ay, 4, ah, g_color_highlight);
						};
						// target location mark
						if (cPlaylistManager.drag_target_id == i && !(ppt.lockReservedPlaylist && i == 0)) {
							if (cPlaylistManager.drag_target_id > cPlaylistManager.drag_source_id) {
								gr.FillSolidRect(ax, ay + ppt.rowHeight - 2, aw - 1, 2, RGBA(0, 0, 0, 105));
								gr.FillSolidRect(ax, ay + ppt.rowHeight - 2, aw - 1, 2, g_color_highlight);
							};
							else if (cPlaylistManager.drag_target_id < cPlaylistManager.drag_source_id) {
								gr.FillSolidRect(ax, ay + 1, aw - 1, 2, RGBA(0, 0, 0, 105));
								gr.FillSolidRect(ax, ay + 1, aw - 1, 2, g_color_highlight);
							};
						};
						if (g_dragndrop_status && i == g_dragndrop_targetPlaylistId && !this.rows[i].isAutoPlaylist) {
							gr.FillSolidRect(ax, ay, aw, ah, g_color_highlight &0x40ffffff);
						};
						// draw blink rectangle after an external drag'n drop files
						if (blink.counter > -1) {
							if (i == blink.id && !this.rows[i].isAutoPlaylist) {
								if (blink.counter <= 5 && Math.floor(blink.counter / 2) == Math.ceil(blink.counter / 2)) {
									gr.DrawRect(ax + 1, ay + 1, aw - 2, ah - 2, 2.0, g_color_selected_bg);
								};
							};
						};
						// =====
						// text
						// =====
						if (ay >= (0 - ah) && ay < this.y + this.h) {
							// playlist icon
							//var rh = ppt.rowHeight-10;
							var playlist_icon = playlistName2icon(this.rows[i].name, plman.IsAutoPlaylist(this.rows[i].idx), (fb.IsPlaying && (this.rows[i].idx == plman.PlayingPlaylist || (arrayContains(PlaylistExcludedIdx, plman.PlayingPlaylist) && this.rows[i].idx == DefaultPlaylistIdx && DefaultPlaylistIdx > -1))));
							var rh = playlist_icon.Width;
							gr.DrawImage(playlist_icon, ax + this.paddingLeft, ay + Math.round(ah / 2 - playlist_icon.Height / 2) - 1, playlist_icon.Width, playlist_icon.Height, 0, 0, playlist_icon.Width, playlist_icon.Height, 0, 255);
							if ((fb.IsPlaying && this.rows[i].idx == plman.PlayingPlaylist) || fb.IsPlaying && (arrayContains(PlaylistExcludedIdx, plman.PlayingPlaylist) && this.rows[i].idx == DefaultPlaylistIdx && DefaultPlaylistIdx > -1)) {
								var font = g_font_b;
								var name_color = g_color_playing_txt;
								var track_color = g_color_playing_txt;
							};
							else {
								var font = g_font;
								var name_color = g_color_normal_txt;
								var track_color = track_color_txt;
							};
							// fields
							var track_name_part = this.rows[i].name;
							var track_total_part = plman.PlaylistItemCount(this.rows[i].idx);
							cColumns.track_name_part = gr.CalcTextWidth(track_name_part, font) + 15;
							cColumns.track_total_part = gr.CalcTextWidth(track_total_part, font);
							var tx = ax + rh + this.paddingLeft + 4;
							var tw = aw;
							if (this.inputboxID == i) {
								this.inputbox.draw(gr, tx + 2, ay + 5);
							};
							else {
								gr.gdiDrawText(track_name_part, font, name_color, tx, ay, aw - tx - cColumns.track_total_part - this.paddingRight - 5, ah, lc_txt);
								gr.gdiDrawText(track_total_part, g_font_track, track_color, ax + aw - cColumns.track_total_part - this.paddingRight, ay, cColumns.track_total_part, ah, rc_txt);
							};
						};
					};
				};
			};
			else { // no playlist, manager panel is empty

			};

			// draw header
			if (ppt.showHeaderBar) {
				var boxText = this.rows.length/* + " 个" */+ "  ";
				var tx = cFilterBox.x + cFilterBox.w + Math.round(22 * zdpi) + 5;
				var tw = this.w - tx;
				gr.FillSolidRect(tx - 3, 0, tw + 3 + cScrollBar.width, ppt.headerBarHeight - 2, g_color_topbar);
				gr.gdiDrawText(boxText, g_font_b, blendColors(g_color_normal_txt, g_color_normal_bg, 0.2), tx, 0, tw + cScrollBar.width, ppt.headerBarHeight - 1, rc_txt);
			};
			var new_bt_y = ppt.showHeaderBar ? ppt.headerBarHeight : 0;
			gr.fillSolidRect(0, new_bt_y - 2, ww, ppt.rowHeight + 2, g_color_normal_bg);
			gr.DrawLine(0, new_bt_y + ppt.rowHeight, ww, new_bt_y + ppt.rowHeight, 1, g_color_line);
			gr.DrawLine(0, new_bt_y, ww, new_bt_y, 1, g_color_line);
			this.new_bt.draw(gr, 0, new_bt_y + 1, 255);
			var new_bt_txt_x = this.marginLR + Math.floor(27*zdpi) + this.paddingLeft + 4;
			gr.GdiDrawText("新建播放列表", g_font, g_color_normal_txt, new_bt_txt_x, ppt.showHeaderBar ? ppt.headerBarHeight + 1 : 0, ww - new_bt_txt_x - 10, ppt.rowHeight - 2, lc_txt);
			// draw scrollbar
			if (cScrollBar.enabled) {
				brw.scrollbar && brw.scrollbar.draw(gr);
			};

		};
	};

	this._isHover = function(x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
	};

	this.on_mouse = function(event, x, y) {
		this.ishover = this._isHover(x, y);

		// get hover row index (mouse cursor hover)
		this.activeRow = -1;
		if (this.ishover) {
			if (y > this.y && y < this.y + this.h) {
				this.activeRow = Math.ceil((y + scroll_ - this.y) / ppt.rowHeight - 1);
				if (this.activeRow >= this.rows.length) this.activeRow = -1;
			}
		}
		if (brw.activeRow != brw.activeRowSaved) {
			brw.activeRowSaved = brw.activeRow;
			this.repaint();
		};

		switch (event) {
		case "down":
			this.down = true;
			if (!cTouch.down && !timers.mouseDown && this.ishover && this.activeRow > -1 && Math.abs(scroll - scroll_) < 2) {
				this.selectedRow = this.activeRow;
				if (this.activeRow == this.inputboxID) {
					this.inputbox.check("down", x, y);
				};
				else {
					if (this.inputboxID > -1) this.inputboxID = -1;
					//if(this.selectedRow == this.rows[this.activeRow].idx) {
					if (!(ppt.lockReservedPlaylist && this.rows[this.activeRow].idx == 0)) {
						if (!this.up) {
							// set dragged item to reorder list
							cPlaylistManager.drag_clicked = true;
							cPlaylistManager.drag_x = x;
							cPlaylistManager.drag_y = y;
							cPlaylistManager.drag_source_id = this.selectedRow;
						};
					}
					//};
					if (plman.ActivePlaylist != this.rows[this.activeRow].idx && !(arrayContains(PlaylistExcludedIdx, plman.ActivePlaylist) && this.rows[this.activeRow].idx == DefaultPlaylistIdx && DefaultPlaylistIdx > -1)) {
						if (this.inputboxID > -1) this.inputboxID = -1;
						this.repaint();
						plman.ActivePlaylist = this.rows[this.activeRow].idx;
						cPlaylistManager.playlist_switch_pending = true;
						window.SetCursor(IDC_WAIT);
					};
				};
				this.repaint();
			};
			else {
				if (this.inputboxID > -1) this.inputboxID = -1;
				// scrollbar
				if (cScrollBar.enabled && cScrollBar.visible) {
					this.scrollbar && this.scrollbar.on_mouse(event, x, y);
				};
				this.new_bt.checkstate("down", x, y);
			};
			this.up = false;
			break;
		case "up":
			this.up = true;
			if (this.down) {
				// scrollbar
				if (cScrollBar.enabled && cScrollBar.visible) {
					brw.scrollbar && brw.scrollbar.on_mouse(event, x, y);
				};

				if (this.new_bt.checkstate("up", x, y) == ButtonStates.hover) {
					var total = plman.PlaylistCount;
					var pl_idx = total;
					var id = this.rowsCount;
					plman.CreatePlaylist(total, "");
					plman.MovePlaylist(total, pl_idx);
					plman.ActivePlaylist = pl_idx;
					// set rename it
					var rh = ppt.rowHeight - 10;
					var tw = this.w - rh - 20;
					this.inputbox = new oInputbox(tw, rh, plman.GetPlaylistName(pl_idx), "", g_color_normal_txt, g_color_normal_bg, RGB(0, 0, 0), g_color_playing & 0xb9ffffff, "renamePlaylist()", "brw");
					//this.inputbox.setSize(tw, rh, g_fsize); // set font_size
					this.inputboxID = id;
					// activate inputbox for edit
					this.inputbox.on_focus(true);
					this.inputbox.edit = true;
					this.inputbox.Cpos = this.inputbox.text.length;
					this.inputbox.anchor = this.inputbox.Cpos;
					this.inputbox.SelBegin = this.inputbox.Cpos;
					this.inputbox.SelEnd = this.inputbox.Cpos;
					if (!cInputbox.timer_cursor) {
						this.inputbox.resetCursorTimer();
					};
					this.inputbox.dblclk = true;
					this.inputbox.SelBegin = 0;
					this.inputbox.SelEnd = this.inputbox.text.length;
					this.inputbox.text_selected = this.inputbox.text;
					this.inputbox.select = true;
					this.repaint();
				};

				if (this.inputboxID >= 0) {
					this.inputbox.check("up", x, y);
				};
				else {
					// drop playlist switch
					if (cPlaylistManager.drag_target_id > (ppt.lockReservedPlaylist ? 0 : -1)) {
						if (cPlaylistManager.drag_target_id != cPlaylistManager.drag_source_id) {
							cPlaylistManager.drag_droped = true
							if (cPlaylistManager.drag_target_id < cPlaylistManager.drag_source_id) {
								plman.MovePlaylist(this.rows[cPlaylistManager.drag_source_id].idx, this.rows[cPlaylistManager.drag_target_id].idx);
							};
							else if (cPlaylistManager.drag_target_id > cPlaylistManager.drag_source_id) {
								plman.MovePlaylist(this.rows[cPlaylistManager.drag_source_id].idx, this.rows[cPlaylistManager.drag_target_id].idx);
							};
						};
						this.selectedRow = cPlaylistManager.drag_target_id;
					};
				};

				if (timers.movePlaylist) {
					timers.movePlaylist && window.ClearInterval(timers.movePlaylist);
					timers.movePlaylist = false;
				};
			};

			this.down = false;

			if (cPlaylistManager.drag_moved) window.SetCursor(IDC_ARROW);

			cPlaylistManager.drag_clicked = false;
			cPlaylistManager.drag_moved = false;
			cPlaylistManager.drag_source_id = -1;
			cPlaylistManager.drag_target_id = -1;
			cPlaylistManager.drag_x = -1;
			cPlaylistManager.drag_y = -1;
			break;
		case "dblclk":
			//browser dblclk
			if (this.ishover && this.activeRow > -1 && Math.abs(scroll - scroll_) < 2) {
				/*if(plman.ActivePlaylist != this.rows[this.activeRow].idx) {
					    if(this.inputboxID > -1) this.inputboxID = -1;
					    this.repaint();
					    plman.ActivePlaylist = this.rows[this.activeRow].idx;
					    cPlaylistManager.playlist_switch_pending = true;
					    window.SetCursor(IDC_WAIT);
					};*/
				var focus_item = plman.GetPlaylistFocusItemIndex(fb.ActivePlaylist);
				if(focus_item > -1)
					plman.ExecutePlaylistDefaultAction(this.rows[this.activeRow].idx, focus_item);
				else
					plman.ExecutePlaylistDefaultAction(this.rows[this.activeRow].idx, 0);
			};
			else {
				// scrollbar
				if (cScrollBar.enabled && cScrollBar.visible) {
					brw.scrollbar && brw.scrollbar.on_mouse(event, x, y);
				};
			};
			break;
		case "move":
			this.up = false;
			if (this.inputboxID >= 0) {
				this.inputbox.check("move", x, y);
			};
			else {
				if (cPlaylistManager.drag_clicked) {
					cPlaylistManager.drag_moved = true;
				};
				if (cPlaylistManager.drag_moved) {
					if (this.activeRow > -1) {
						if (timers.movePlaylist) {
							timers.movePlaylist && window.ClearInterval(timers.movePlaylist);
							timers.movePlaylist = false;
						};
						if (this.activeRow != cPlaylistManager.drag_source_id) {
							if (this.activeRow != cPlaylistManager.drag_source_id) {
								cPlaylistManager.drag_target_id = this.activeRow;
							};
						};
						else if (y > this.rows[this.rowsCount - 1].y + ppt.rowHeight && y < this.rows[this.rowsCount - 1].y + ppt.rowHeight * 2) {
							cPlaylistManager.drag_target_id = this.rowsCount;
						};
						else {
							cPlaylistManager.drag_target_id = -1;
						};
						//if(ppt.lockReservedPlaylist && cPlaylistManager.drag_target_id == 0) cPlaylistManager.drag_target_id = -1;
					};
					else {
						if (y < this.y) {
							if (!timers.movePlaylist) {
								timers.movePlaylist = window.SetInterval(function() {
									scroll -= ppt.rowHeight;
									scroll = check_scroll(scroll);
									cPlaylistManager.drag_target_id = cPlaylistManager.drag_target_id > 0 ? cPlaylistManager.drag_target_id - 1 : 0;
								}, 100);
							}
						};
						else if (y > this.y + this.h) {
							if (!timers.movePlaylist) {
								timers.movePlaylist = window.SetInterval(function() {
									scroll += ppt.rowHeight;
									scroll = check_scroll(scroll);
									cPlaylistManager.drag_target_id = cPlaylistManager.drag_target_id < this.rowsCount - 1 ? cPlaylistManager.drag_target_id + 1 : this.rowsCount - 1;
								}, 100);
							}
						};
					};
					brw.repaint();
				};
				if (g_handles != null) {
					var row_current = this.activeRow;
					if (this.activeRow > -1 && !plman.IsAutoPlaylist(row_current)) {
						var insert_index = fb.PlaylistItemCount(row_current);
						plman.InsertPlaylistItems(row_current, insert_index, g_handles, false);
					} else {
						fb.RunMainMenuCommand("文件/新建播放列表");
						var insert_index = fb.PlaylistItemCount(fb.PlaylistCount - 1);
						plman.InsertPlaylistItems(fb.PlaylistCount - 1, insert_index, g_handles, false);
					}
				}
				g_handles = null;
			};

			// scrollbar
			if (cScrollBar.enabled && cScrollBar.visible) {
				brw.scrollbar && brw.scrollbar.on_mouse(event, x, y);
			};

			this.new_bt.checkstate("move", x, y);
			break;
		case "right":
			if (this.inputboxID >= 0) {
				this.inputbox.check("bidon", x, y);
				if (!this.inputbox.hover) {
					this.inputboxID = -1;
					this.on_mouse("right", x, y);
				};
				else {
					this.inputbox.check("right", x, y);
				};
			};
			else {
				if (this.ishover) {
					if (this.activeRow > -1 && Math.abs(scroll - scroll_) < 2) {
						if (!utils.IsKeyPressed(VK_SHIFT)) {
							this.repaint();
							this.selectedRow = this.activeRow;
							//plman.ActivePlaylist = this.rows[this.activeRow].idx;
							if (!timers.rightClick) {
								timers.rightClick = window.SetTimeout(function() {
									brw.context_menu(m_x, m_y, brw.selectedRow);
									timers.rightClick && window.ClearTimeout(timers.rightClick);
									timers.rightClick = false;
								}, 50);
							};
						};
						this.repaint();
					};
					else {
						this.context_menu(x, y, this.activeRow);
					};
				};
				else {
					if (this.new_bt.checkstate("right", x, y) == ButtonStates.hover) {
						if (!utils.IsKeyPressed(VK_SHIFT)) {
							this.repaint();
							//plman.ActivePlaylist = this.rows[this.activeRow].idx;
							timers.rightClick = window.SetTimeout(function() {
								brw.context_menu(m_x, m_y, null);
								timers.rightClick && window.ClearTimeout(timers.rightClick);
								timers.rightClick = false;
							}, 50);
						};
						break;
					}
					// scrollbar
					if (cScrollBar.enabled && cScrollBar.visible) {
						brw.scrollbar && brw.scrollbar.on_mouse(event, x, y);
					};
					// settings menu
					if (!g_filterbox.inputbox.hover) {
						this.settings_context_menu(x, y);
					};
				};
			};
			break;
		case "wheel":
			//browser mouse event
			break;
		case "leave":
			this.new_bt.checkstate("leave", x, y);

			// scrollbar
			if (cScrollBar.enabled && cScrollBar.visible) {
				this.scrollbar && this.scrollbar.on_mouse(event, 0, 0);
			};
			break;
		case "drag_over":

			if (this.rows.length > 0) {
				if (y > brw.y) {
					if (this.activeRow > -1) {
						if (this.rows[this.activeRow].isAutoPlaylist) {
							g_dragndrop_targetPlaylistId = -1;
						};
						else {
							g_dragndrop_targetPlaylistId = this.activeRow;
						};
					};
					else {
						g_dragndrop_targetPlaylistId = -1;
					};
				};
			};
			else {
				g_dragndrop_bottom = true;
				g_dragndrop_trackId = 0;
				g_dragndrop_rowId = 0;
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

		// get hover row index (mouse cursor hover)
/* if(m_y > brw.y && m_y < brw.y + brw.h) {
		    brw.activeRow = Math.ceil((m_y + scroll_ - brw.y ) / ppt.rowHeight - 1);
		    if(brw.activeRow >= brw.rows.length) brw.activeRow = -1;
		}; else {
		    brw.activeRow = -1;
		}; */

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
		};
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

		// tweak to fix bug in timer/memory/repaint handle in WSH Panel Mod with timers
		g_counter_repaint++;
		if (g_counter_repaint > 100) {
			g_counter_repaint = 0;
			CollectGarbage();
		};

	}, ppt.refreshRate);

	this.context_menu = function(x, y, id) {
		var MF_SEPARATOR = 0x00000800;
		var MF_STRING = 0x00000000;
		var _menu = window.CreatePopupMenu();
		var _newplaylist = window.CreatePopupMenu();
		var _autoplaylist = window.CreatePopupMenu();
		var PLRecManager = plman.PlaylistRecyclerManager;
		var _restorepl = window.CreatePopupMenu();
		var idx;
		var total_area, visible_area;
		var bout, z;
		var add_mode = (id == null || id < 0);
		var total = plman.PlaylistCount;
		
		if (!add_mode) {
			_menu.AppendMenuItem(this.rows[this.activeRow].islocked ? MF_DISABLED : MF_STRING, 8, "移除");
			_menu.AppendMenuItem(MF_SEPARATOR, 0, "");
			_menu.AppendMenuItem(this.rows[this.activeRow].islocked ? MF_DISABLED : MF_STRING, 3, "重命名");
			_menu.AppendMenuItem(this.rows[this.activeRow].islocked ? MF_DISABLED : MF_STRING, 9, "自动命名");
			_menu.AppendMenuItem(MF_STRING, 5, "复制");
			if (plman.IsAutoPlaylist(id)) {
				_menu.AppendMenuItem(MF_SEPARATOR, 0, "");
				_menu.AppendMenuItem(MF_STRING, 6, "智能列表属性...");
				_menu.AppendMenuItem(this.rows[this.activeRow].islocked ? MF_DISABLED : MF_STRING, 7, "转换为普通列表");
			};
			_menu.AppendMenuItem(MF_SEPARATOR, 0, "");
		}

		if (!add_mode) {
			var pl_idx = this.rows[id].idx;
			_newplaylist.AppendTo(_menu, (g_filterbox.inputbox.text.length > 0 ? MF_GRAYED | MF_DISABLED : MF_STRING), "插入...");
		};
		else {
			id = this.rowsCount;
			var pl_idx = total;
			_newplaylist.AppendTo(_menu, (g_filterbox.inputbox.text.length > 0 ? MF_GRAYED | MF_DISABLED : MF_STRING), "添加...");
		};
		_newplaylist.AppendMenuItem(MF_STRING, 100, "新建播放列表");
		_newplaylist.AppendMenuItem(MF_STRING, 101, "新建智能列表");
		_autoplaylist.AppendTo(_newplaylist, MF_STRING, "预设智能列表");
		_autoplaylist.AppendMenuItem(MF_STRING, 200, "媒体库 (完整)");
		_autoplaylist.AppendMenuItem(MF_STRING, 204, "未播放过的音轨");
		_autoplaylist.AppendMenuItem(MF_STRING, 205, "历史记录 (一个星期内播放过的音轨)");
		_autoplaylist.AppendMenuItem(MF_STRING, 206, "最常播放的音轨");
		_autoplaylist.AppendMenuItem(MF_STRING, 210, "最近添加的音轨");
/*		_autoplaylist.AppendMenuItem(MF_STRING, 211, "网络广播");
		_autoplaylist.AppendMenuItem(MF_STRING, 212, "External Files");
		_autoplaylist.AppendMenuItem(MF_STRING, 213, "Podcasts");*/
		_autoplaylist.AppendMenuItem(MF_SEPARATOR, 0, "");
		_autoplaylist.AppendMenuItem(MF_STRING, 250, "喜爱的音轨");
		_autoplaylist.AppendMenuItem(MF_SEPARATOR, 0, "");
		_autoplaylist.AppendMenuItem(MF_STRING, 225, "音轨评级为 5");
		_autoplaylist.AppendMenuItem(MF_STRING, 224, "音轨评级为 4");
		_autoplaylist.AppendMenuItem(MF_STRING, 223, "音轨评级为 3");
		_autoplaylist.AppendMenuItem(MF_STRING, 222, "音轨评级为 2");
		_autoplaylist.AppendMenuItem(MF_STRING, 221, "音轨评级为 1");
		_autoplaylist.AppendMenuItem(MF_STRING, 220, "音轨未评级");
		_menu.AppendMenuItem(MF_SEPARATOR, 0, "");
		_menu.AppendMenuItem(MF_STRING, 2, "载入播放列表");
		_menu.AppendMenuItem(MF_STRING, 13, "保存所有播放列表");
		if (!add_mode) {
			_menu.AppendMenuItem(MF_STRING, 4, "保存播放列表");
			_menu.AppendMenuItem(MF_SEPARATOR, 0, "");
			_restorepl.AppendTo(_menu, PLRecManager.Count >= 1 ? MF_STRING : MF_GRAYED | MF_DISABLED, "列表记录");
			if (PLRecManager.Count >= 1) {
				for (var irm = 0; irm < PLRecManager.Count; irm++) {
					_restorepl.AppendMenuItem(MF_STRING, 2001 + irm, PLRecManager.Name(irm));
				}
				_restorepl.AppendMenuItem(MF_SEPARATOR, 0, 0);
				_restorepl.AppendMenuItem(MF_STRING, 2000, "清除列表记录");
			}

			if (!fb.IsAutoPlaylist(id)) {
				_menu.AppendMenuItem(MF_SEPARATOR, 0, "");
				_menu.AppendMenuItem((fb.PlaylistItemCount(id) >= 1) ? MF_STRING : MF_GRAYED | MF_DISABLED, 10, "清空列表");
				_menu.AppendMenuItem((fb.PlaylistItemCount(id) >= 1) ? MF_STRING : MF_GRAYED | MF_DISABLED, 11, "移除重复项");
				_menu.AppendMenuItem((fb.PlaylistItemCount(id) >= 1) ? MF_STRING : MF_GRAYED | MF_DISABLED, 12, "移除无效项");
			}

		};

		idx = _menu.TrackPopupMenu(x, y);

		switch (true) {
		case (idx == 100):
			plman.CreatePlaylist(total, "");
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			// set rename it
			var rh = ppt.rowHeight - 10;
			var tw = this.w - rh - 20;
			this.inputbox = new oInputbox(tw, rh, plman.GetPlaylistName(pl_idx), "", g_color_normal_txt, g_color_normal_bg, RGB(0, 0, 0), g_color_playing & 0xb9ffffff, "renamePlaylist()", "brw");
			//this.inputbox.setSize(tw, rh, g_fsize); // set font_size
			this.inputboxID = id;
			// activate inputbox for edit
			this.inputbox.on_focus(true);
			this.inputbox.edit = true;
			this.inputbox.Cpos = this.inputbox.text.length;
			this.inputbox.anchor = this.inputbox.Cpos;
			this.inputbox.SelBegin = this.inputbox.Cpos;
			this.inputbox.SelEnd = this.inputbox.Cpos;
			if (!cInputbox.timer_cursor) {
				this.inputbox.resetCursorTimer();
			};
			this.inputbox.dblclk = true;
			this.inputbox.SelBegin = 0;
			this.inputbox.SelEnd = this.inputbox.text.length;
			this.inputbox.text_selected = this.inputbox.text;
			this.inputbox.select = true;
			this.repaint();
			break;
		case (idx == 101):
			var total = plman.PlaylistCount;
			g_avoid_on_playlists_changed = true;
			plman.CreatePlaylist(total, "");
			var new_label = plman.GetPlaylistName(total);
			plman.RemovePlaylist(total);
			g_avoid_on_playlists_changed = false;
			plman.CreateAutoPlaylist(total, new_label, "在这里输入你的查询", "", 0);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			plman.ShowAutoPlaylistUI(pl_idx);
			// set rename it
			var rh = ppt.rowHeight - 10;
			var tw = this.w - rh - 20;
			this.inputbox = new oInputbox(tw, rh, plman.GetPlaylistName(pl_idx), "", g_color_normal_txt, g_color_normal_bg, RGB(0, 0, 0), g_color_playing & 0xb9ffffff, "renamePlaylist()", "brw");
			//this.inputbox.setSize(tw, rh, g_fsize); // set font_size
			this.inputboxID = id;
			// activate inputbox for edit
			this.inputbox.on_focus(true);
			this.inputbox.edit = true;
			this.inputbox.Cpos = this.inputbox.text.length;
			this.inputbox.anchor = this.inputbox.Cpos;
			this.inputbox.SelBegin = this.inputbox.Cpos;
			this.inputbox.SelEnd = this.inputbox.Cpos;
			if (!cInputbox.timer_cursor) {
				this.inputbox.resetCursorTimer();
			};
			this.inputbox.dblclk = true;
			this.inputbox.SelBegin = 0;
			this.inputbox.SelEnd = this.inputbox.text.length;
			this.inputbox.text_selected = this.inputbox.text;
			this.inputbox.select = true;
			this.repaint();
			break;
		case (idx == 2):
			fb.RunMainMenuCommand("文件/载入播放列表...");
			break;
		case (idx == 13):
			fb.RunMainMenuCommand("文件/保存所有播放列表");
			break;
		case (idx == 3):
			// set rename it
			var rh = ppt.rowHeight - 10;
			var tw = this.w - rh - 10;
			this.inputbox = new oInputbox(tw, rh, plman.GetPlaylistName(pl_idx), "", g_color_normal_txt, g_color_normal_bg, RGB(0, 0, 0), g_color_playing & 0xb9ffffff, "renamePlaylist()", "brw");
			//this.inputbox.setSize(tw, rh, g_fsize); // set font_size
			this.inputboxID = id;
			// activate inputbox for edit
			this.inputbox.on_focus(true);
			this.inputbox.edit = true;
			this.inputbox.Cpos = this.inputbox.text.length;
			this.inputbox.anchor = this.inputbox.Cpos;
			this.inputbox.SelBegin = this.inputbox.Cpos;
			this.inputbox.SelEnd = this.inputbox.Cpos;
			if (!cInputbox.timer_cursor) {
				this.inputbox.resetCursorTimer();
			};
			this.inputbox.dblclk = true;
			this.inputbox.SelBegin = 0;
			this.inputbox.SelEnd = this.inputbox.text.length;
			this.inputbox.text_selected = this.inputbox.text;
			this.inputbox.select = true;
			this.repaint();
			break;
		case (idx == 4):
			fb.RunMainMenuCommand("文件/保存播放列表...");
			break;
		case (idx == 5):
			plman.DuplicatePlaylist(pl_idx, plman.GetPlaylistName(pl_idx) + " (复件)");
			plman.ActivePlaylist = pl_idx + 1;
			break;
		case (idx == 6):
			plman.ShowAutoPlaylistUI(pl_idx);
			break;
		case (idx == 7):
			plman.DuplicatePlaylist(pl_idx, plman.GetPlaylistName(pl_idx));
			plman.RemovePlaylist(pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 8):
			if (brw.rowsCount > 0) {
				//DeletePlaylist(pl_idx);
				if (!this.delete_pending && !timers.deletePlaylist) {
					this.delete_pending = true;
					timers.deletePlaylist = window.SetTimeout(function() {
						timers.deletePlaylist && window.ClearTimeout(timers.deletePlaylist);
						timers.deletePlaylist = false;
					}, 150);
					//
					var updateActivePlaylist = (this.selectedRow == plman.ActivePlaylist);
					var id = this.selectedRow;
					var row = this.getRowIdFromIdx(id);
					plman.RemovePlaylist(id);
					if (row < this.rowsCount - 1) {
						this.selectedRow = id;
					};
					else if (row > 0) {
						this.selectedRow = id - 1;
					};
					if (updateActivePlaylist) {
						if (row < this.rowsCount - 1) {
							plman.ActivePlaylist = id;
						};
						else if (row > 0) {
							plman.ActivePlaylist = id - 1;
						};
					};
				};
			};
			break;
		case (idx == 9):
			plman.RenamePlaylist(id, plman.GetPlaylistAutoName(id));
			break;
		case (idx == 10):
			fb.RunMainMenuCommand("编辑/清除");
			break;
		case (idx == 11):
			fb.RunMainMenuCommand("编辑/移除重复项");
			break;
		case (idx == 12):
			fb.RunMainMenuCommand("编辑/移除无效项");
			break;
		case (idx == 200):
			if (ppt.lockReservedPlaylist) checkMediaLibrayPlaylist();
			else {
				var total = plman.PlaylistCount;
				plman.CreateAutoPlaylist(total, "媒体库", "ALL", default_sort, 0);
				plman.MovePlaylist(total, pl_idx);
				plman.ActivePlaylist = pl_idx;
				window.NotifyOthers("reload_cover_folder", 1);
			}
			break;
		case (idx == 204):
			var total = plman.PlaylistCount;
			//p.playlistManager.inputboxID = -1;
			plman.CreateAutoPlaylist(total, "未播放过的音轨", "%play_count% IS 0", default_sort, 1);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 205):
			var total = plman.PlaylistCount;
			//p.playlistManager.inputboxID = -1;
			plman.CreateAutoPlaylist(total, "历史记录", "%last_played% DURING LAST 1 WEEK SORT DESCENDING BY %last_played%", "", 1);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 206):
			var total = plman.PlaylistCount;
			//p.playlistManager.inputboxID = -1;
			plman.CreateAutoPlaylist(total, "最常播放", "%play_count% GREATER 0 SORT DESCENDING BY %play_count%", "", 1);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 210):
			var total = plman.PlaylistCount;
			//p.playlistManager.inputboxID = -1;
			plman.CreateAutoPlaylist(total, "最近添加", "%added% DURING LAST 12 WEEKS SORT DESCENDING BY %added%", "", 1);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		/*case (idx == 211):
			var total = plman.PlaylistCount;
			//brw.inputboxID = -1;
			plman.CreatePlaylist(total, "网络广播");
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
			*/
		case (idx == 220):
			var total = plman.PlaylistCount;
			//p.playlistManager.inputboxID = -1;
			fb.CreateAutoPlaylist(total, "音轨未评级", "%rating% MISSING", default_sort, 0);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 221):
			var total = plman.PlaylistCount;
			//brw.inputboxID = -1;
			fb.CreateAutoPlaylist(total, "音轨评级为 1", "%rating% IS 1", default_sort, 0);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 222):
			var total = plman.PlaylistCount;
			//p.playlistManager.inputboxID = -1;
			fb.CreateAutoPlaylist(total, "音轨评级为 2", "%rating% IS 2", default_sort, 0);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 223):
			var total = plman.PlaylistCount;
			//p.playlistManager.inputboxID = -1;
			fb.CreateAutoPlaylist(total, "音轨评级为 3", "%rating% IS 3", default_sort, 0);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 224):
			var total = plman.PlaylistCount;
			//p.playlistManager.inputboxID = -1;
			fb.CreateAutoPlaylist(total, "音轨评级为 4", "%rating% IS 4", default_sort, 0);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 225):
			var total = plman.PlaylistCount;
			//p.playlistManager.inputboxID = -1;
			fb.CreateAutoPlaylist(total, "音轨评级为 5", "%rating% IS 5", default_sort, 0);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 250):
			var total = plman.PlaylistCount;
			//p.playlistManager.inputboxID = -1;
			plman.CreateAutoPlaylist(total, "喜爱的音轨", "%mood% GREATER 0", default_sort, 0);
			plman.MovePlaylist(total, pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 2000):
			var affectedItems = Array();
			for (var i = 0; i < PLRecManager.Count; i++) {
				affectedItems.push(i);
			}
			PLRecManager.Purge(affectedItems);
			break;
		case (idx > 2000):
			(PLRecManager.Count >= 1) && PLRecManager.Restore(idx - 2001);
			break;
		};
		_autoplaylist.Dispose();
		_newplaylist.Dispose();
		_menu.Dispose();
		g_rbtn_click = false;
		brw.repaint();
		return true;
	};

	this.settings_context_menu = function(x, y) {
		var _menu = window.CreatePopupMenu();
		var _menu1 = window.CreatePopupMenu();
		var idx;

		_menu.AppendMenuItem(MF_STRING, 910, "过滤器");
		_menu.CheckMenuItem(910, ppt.showHeaderBar);

		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(MF_STRING, 992, "显示网格线");
		_menu.CheckMenuItem(992, ppt.showGrid);
		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(MF_STRING, 991, "面板属性");

		idx = _menu.TrackPopupMenu(x, y);

		switch (true) {
		case (idx == 910):
			ppt.showHeaderBar = !ppt.showHeaderBar;
			window.SetProperty("_DISPLAY: Show Top Bar", ppt.showHeaderBar);
			get_metrics();
			brw.repaint();
			break;
		case (idx == 991):
			window.ShowProperties();
			break;
		case (idx == 992):
			ppt.showGrid = !ppt.showGrid;
			window.SetProperty("_PROPERTY: Show Grid", ppt.showGrid);
			brw.repaint();
			break;
		};
		_menu1.Dispose();
		_menu.Dispose();
		g_rbtn_click = false;
		return true;
	};
};

/* 
===================================================================================================
    Main
===================================================================================================
*/
var fso = new ActiveXObject("Scripting.FileSystemObject");
var WshShell = new ActiveXObject("WScript.Shell");
var htmlfile = new ActiveXObject('htmlfile');

var brw = null;
var isScrolling = false;

var g_filterbox = null;
var filter_text = "";

var g_instancetype = window.InstanceType;
var g_counter_repaint = 0;

// fonts
var g_font = null;
var g_font_b = null;
// drag'n drop from windows system
var g_dragndrop_status = false;
var g_dragndrop_x = -1;
var g_dragndrop_y = -1;
var g_dragndrop_trackId = -1;
var g_dragndrop_rowId = -1;
var g_dragndrop_targetPlaylistId = -1;
//
var ww = 0,
	wh = 0;
//var g_metadb = null;
var g_focus = false;
//var foo_playcount = utils.CheckComponent("foo_playcount", true);
clipboard = {
	selection: null
};

var m_x = 0,
	m_y = 0;
var g_active_playlist = null;
var g_focus_id = -1;
var g_focus_id_prev = -1;
var g_focus_row = 0;
var g_focus_album_id = -1;
var g_populate_opt = 1;
// color vars
var g_color_normal_bg = 0;
var g_color_selected_bg = 0;
var g_color_normal_txt = 0;
var g_color_selected_txt = 0;
var g_color_highlight = 0;
var g_color_playing = 0;
// boolean to avoid callbacks
var g_avoid_on_playlists_changed = false;
var g_avoid_on_item_focus_change = false;
var g_avoid_on_playlist_items_added = false;
var g_avoid_on_playlist_items_removed = false;
var g_avoid_on_playlist_items_removed_callbacks_on_sendItemToPlaylist = false;
var g_avoid_on_playlist_items_reordered = false;
// mouse actions
var g_lbtn_click = false;
var g_rbtn_click = false;
//
var g_first_populate_done = false;
var g_first_populate_launched = false;
//
var repaintforced = false;
var launch_time = fb.CreateProfiler("launch_time");
var form_text = "";
var repaint_main = true,
	repaint_main1 = true,
	repaint_main2 = true;
var window_visible = false;
var scroll_ = 0,
	scroll = 0,
	scroll_prev = 0;
var time222;
var g_start_ = 0,
	g_end_ = 0;

function on_init() {
	window.DlgCode = DLGC_WANTALLKEYS;

	get_font();
	get_colors();
	get_metrics();
	get_images();

	g_active_playlist = plman.ActivePlaylist;
	
	ppt.rowHeight = Math.round(ppt.defaultRowHeight * zdpi);
	//cScrollBar.width = Math.floor(cScrollBar.defaultWidth * zdpi);
	//cScrollBar.minCursorHeight = Math.round(cScrollBar.defaultMinCursorHeight * zdpi);

	//cFilterBox.w = 100 * zdpi;//Math.floor(window.Width * 0.53);//Math.floor(cFilterBox.default_w * zdpi);
	//cFilterBox.h = Math.round(cFilterBox.default_h * zdpi);

	brw = new oBrowser("brw");
	if (ppt.lockReservedPlaylist && fb.IsMediaLibraryEnabled()) checkMediaLibrayPlaylist();
	g_filterbox = new oFilterBox();
	g_filterbox.inputbox.visible = true;
};
on_init();

// START

function on_size() {
	window.DlgCode = DLGC_WANTALLKEYS;
	ww = window.Width;
	wh = window.Height;
	if (!ww || !wh) {
		ww = 1;
		wh = 1;
	};
	window.MinWidth = 1;
	window.MinHeight = 1;
	cFilterBox.w = Math.floor(ww * 0.55);
	// set Size of browser
	brw.setSize(0, ppt.rowHeight + (ppt.showHeaderBar ? ppt.headerBarHeight : 0), ww - cScrollBar.width, wh - ppt.rowHeight - (ppt.showHeaderBar ? ppt.headerBarHeight : 0));
};

function on_paint(gr) {

	if (!ww) return;
	gr.FillSolidRect(0, 0, ww, wh, g_color_normal_bg);
	brw && brw.draw(gr);

	if (ppt.showHeaderBar) {
		// inputBox
		if (ppt.showFilterBox && g_filterbox) {
			if (g_filterbox.inputbox.visible) {
				g_filterbox.draw(gr, cFilterBox.x, cFilterBox.y);
			};
		};
	};
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
				};
				else {
					cTouch.t1 = fb.CreateProfiler("t1");
				};
				timers.mouseDown = window.SetTimeout(function() {
					window.ClearTimeout(timers.mouseDown);
					timers.mouseDown = false;
					if (Math.abs(cTouch.y_start - m_y) > 015) {
						cTouch.down = true;
					};
					else {
						brw.on_mouse("down", x, y);
					};
				}, 50);
			};
		};
		else {
			brw.on_mouse("down", x, y);
		};
	};
	else {
		brw.on_mouse("down", x, y);
	};

	// inputBox
	if (ppt.showHeaderBar && ppt.showFilterBox && g_filterbox.inputbox.visible) {
		g_filterbox.on_mouse("lbtn_down", x, y);
	};
};

function on_mouse_lbtn_up(x, y) {

	// inputBox
	if (ppt.showHeaderBar && ppt.showFilterBox && g_filterbox.inputbox.visible) {
		g_filterbox.on_mouse("lbtn_up", x, y);
	};

	brw.on_mouse("up", x, y);

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
		//cTouch.y_delta = cTouch.y_start - cTouch.y_end;
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

	g_lbtn_click = false;
};

function on_mouse_lbtn_dblclk(x, y, mask) {
	if (y >= brw.y) {
		brw.on_mouse("dblclk", x, y);
	};
	else if (x > brw.x && x < brw.x + brw.w) {
		brw.showActivePlaylist();
	};
	else {
		brw.on_mouse("dblclk", x, y);
	};
};

function on_mouse_rbtn_down(x, y, mask) {
	/*g_rbtn_click = true;

	if (!utils.IsKeyPressed(VK_SHIFT)) {
		// inputBox
		if (ppt.showHeaderBar && ppt.showFilterBox && g_filterbox.inputbox.visible) {
			g_filterbox.on_mouse("rbtn_down", x, y);
		};
		brw.on_mouse("right", x, y);
	};*/

};

function on_mouse_rbtn_up(x, y) {
	g_rbtn_click = true;
	if (!utils.IsKeyPressed(VK_SHIFT)) {
		// inputBox
		if (ppt.showHeaderBar && ppt.showFilterBox && g_filterbox.inputbox.visible) {
			g_filterbox.on_mouse("rbtn_down", x, y);
		};
		brw.on_mouse("right", x, y);
	};
	g_rbtn_click = false;
	//if (!utils.IsKeyPressed(VK_SHIFT)) {
	return true;
	//};
};

function on_mouse_move(x, y) {

	if (m_x == x && m_y == y) return;

	// inputBox
	if (!cPlaylistManager.drag_moved) {
		if (ppt.showHeaderBar && ppt.showFilterBox && g_filterbox.inputbox.visible) {
			g_filterbox.on_mouse("move", x, y);
		};
	};

	if (cTouch.down) {
		cTouch.y_current = y;
		cTouch.y_move = (cTouch.y_current - cTouch.y_prev);
		if (x < brw.w) {
			scroll -= cTouch.y_move;
			cTouch.scroll_delta = scroll - scroll_;
			if (Math.abs(cTouch.scroll_delta) < 030) cTouch.y_start = cTouch.y_current;
			cTouch.y_prev = cTouch.y_current;
		};
	};
	else {
		brw.on_mouse("move", x, y);
	};

	m_x = x;
	m_y = y;
};

function on_mouse_wheel(step) {

	if (cTouch.timer) {
		window.ClearInterval(cTouch.timer);
		cTouch.timer = false;
	};

	var rowStep = ppt.rowScrollStep;
	if(g_start_) {
		var voffset = brw.rows[g_start_].y - ppt.rowHeight - ppt.headerBarHeight;
		scroll -= step * ppt.rowHeight * (rowStep - step/Math.abs(step)) - voffset;
	}
	else scroll -= step * ppt.rowHeight * rowStep;
	scroll = check_scroll(scroll);
	//brw.on_mouse("wheel", m_x, m_y, step);
};

function on_mouse_leave() {
	// inputBox
	if (ppt.showHeaderBar && ppt.showFilterBox && g_filterbox.inputbox.visible) {
		g_filterbox.on_mouse("leave", 0, 0);
	};
	brw.on_mouse("leave", 0, 0);
};

//=================================================// Metrics & Fonts & Colors & Images

function get_metrics() {
	if (ppt.showHeaderBar) {
		ppt.headerBarHeight = Math.ceil((ppt.defaultHeaderBarHeight - 2) * zdpi) + 2;
		//ppt.headerBarHeight = Math.floor(ppt.headerBarHeight / 2) != ppt.headerBarHeight / 2 ? ppt.headerBarHeight : ppt.headerBarHeight - 1;
	};
	else {
		ppt.headerBarHeight = 0;
	};
	if (brw) {
		brw.setSize(0, ppt.rowHeight + (ppt.showHeaderBar ? ppt.headerBarHeight : 0), ww - cScrollBar.width, wh - ppt.rowHeight - (ppt.showHeaderBar ? ppt.headerBarHeight : 0));
		if (brw.rowsCount > 0) brw.getlimits();
	};
};

function playlistName2icon(name, auto_playlist, playing_playlist) {
	if (ui_mode < 3) {
		if (playing_playlist) {
			if (auto_playlist){
				if (name == "媒体库") return images.library_icon_hl;
				if (name == "最近添加") return images.newly_added_icon_hl;
				if (name == "历史记录") return images.history_icon_hl;
				if (name == "最常播放") return images.most_played_icon_hl;
				if (name == "喜爱的音轨") return images.mood_icon_hl;
				else return images.icon_auto_pl_hl;
			}else{
				if (name.substr(0, 2) == "电台") return images.radios_icon_hl;
				if (name.substr(0, 2) == "榜单") return images.board_icon_hl;
				else return images.icon_normal_pl_playing_hl;
			}
		} else {
			if (auto_playlist){
				if (name == "媒体库") return images.library_icon;
				if (name == "最近添加") return images.newly_added_icon;
				if (name == "历史记录") return images.history_icon;
				if (name == "最常播放") return images.most_played_icon;
				if (name == "喜爱的音轨") return images.mood_icon;
				else return images.icon_auto_pl;
			}else{
				if (name.substr(0, 2) == "电台") return images.radios_icon;
				if (name.substr(0, 2) == "榜单") return images.board_icon;
				else return images.icon_normal_pl;
			}
		}
	} else {
		if (auto_playlist){
		if (name == "媒体库") return images.library_icon;
		if (name == "最近添加") return images.newly_added_icon;
		if (name == "历史记录") return images.history_icon;
		
		if (name == "最常播放") return images.most_played_icon;
		if (name == "喜爱的音轨") return images.mood_icon;
		else return images.icon_auto_pl;
		} else{
			if (name.substr(0, 2) == "电台") return images.radios_icon;
			if (name.substr(0, 2) == "榜单") return images.board_icon;
			if (playing_playlist) return images.icon_normal_pl_playing;
			else return images.icon_normal_pl;
		}
	}
}

function get_images() {
	var gb;
	var imgw = Math.floor(27*zdpi), imgh = Math.floor(25*zdpi);
	images.icon_normal_pl = gdi.CreateImage(imgw, imgh);
	gb = images.icon_normal_pl.GetGraphics();
	var _x8 = 8*zdpi, x3 = Math.ceil(3*zdpi), _x7 = 7*zdpi, _x9 = 9*zdpi, _x10 = 10*zdpi, _x11 = 11*zdpi, _x12 = 12*zdpi, _x13 = 13*zdpi, _x14 = 14*zdpi, _x15 = 15*zdpi, _x17 = 17*zdpi, _x18 = 18*zdpi, _x19 = 19*zdpi;
	gb.DrawLine(_x8, _x8, _x19, _x8, 1, g_color_normal_txt);
	gb.DrawLine(_x8, _x8+x3, _x17, _x8+x3, 1, g_color_normal_txt);
	gb.DrawLine(_x8, _x8+x3*2, _x19, _x8+x3*2, 1, g_color_normal_txt);
	gb.DrawLine(_x8, _x8+x3*3, _x18, _x8+x3*3, 1, g_color_normal_txt);
	images.icon_normal_pl.ReleaseGraphics(gb);

	images.icon_normal_pl_playing = gdi.CreateImage(imgw, imgh);
	gb = images.icon_normal_pl_playing.GetGraphics();
	gb.DrawLine(_x8, _x11, _x8, _x18, 1, g_color_normal_txt);
	gb.DrawLine(_x8+x3, _x7, _x8+x3, _x18, 1, g_color_normal_txt);
	gb.DrawLine(_x8+x3*2, _x13, _x8+x3*2, _x18, 1, g_color_normal_txt);
	gb.DrawLine(_x8+x3*3, _x9, _x8+x3*3, _x18, 1, g_color_normal_txt);
	images.icon_normal_pl_playing.ReleaseGraphics(gb);

	images.icon_auto_pl = gdi.CreateImage(imgw, imgh);
	gb = images.icon_auto_pl.GetGraphics();
	gb.DrawLine(_x8, _x8, 16*zdpi, _x8, 1, g_color_normal_txt);
	gb.DrawLine(_x8, _x8+x3, _x15, _x8+x3, 1, g_color_normal_txt);
	gb.DrawLine(_x8, _x8+x3*2, _x12, _x8+x3*2, 1, g_color_normal_txt);
	gb.DrawLine(_x8, _x8+x3*3, _x12, _x8+x3*3, 1, g_color_normal_txt);
	gb.DrawLine(18.3*zdpi, _x9, 18.3*zdpi, 17*zdpi, 1, g_color_normal_txt);
	gb.SetSmoothingMode(2)
	gb.DrawEllipse(_x14, _x15, 4*zdpi, 4*zdpi, 1, g_color_normal_txt);
	gb.SetSmoothingMode(0)
	images.icon_auto_pl.ReleaseGraphics(gb);

	images.history_icon = gdi.CreateImage(imgw, imgh);
	gb = images.history_icon.GetGraphics();
	gb.DrawRect(_x7, _x7, _x12, _x10, 1, g_color_normal_txt);
	gb.DrawLine(_x10, 5*zdpi, _x10, _x10, 1, g_color_normal_txt);
	gb.DrawLine(16*zdpi, 5*zdpi, 16*zdpi, _x10, 1, g_color_normal_txt);
	images.history_icon.ReleaseGraphics(gb);
	
	images.library_icon = gdi.CreateImage(imgw, imgh);
	gb = images.library_icon.GetGraphics();
	gb.DrawRect(_x8, _x7, _x11, _x11, 1, g_color_normal_txt);
	gb.FillSolidRect(_x10, _x9, 1, 1, g_color_normal_txt);
	gb.FillSolidRect(_x17, _x9, 1, 1, g_color_normal_txt);
	gb.FillSolidRect(_x10, _x11, 1, 1, g_color_normal_txt);
	gb.FillSolidRect(_x17, _x11, 1, 1, g_color_normal_txt);
	gb.FillSolidRect(_x10, _x13, 1, 1, g_color_normal_txt);
	gb.FillSolidRect(_x17, _x13, 1, 1, g_color_normal_txt);
	gb.FillSolidRect(_x10, _x15, 1, 1, g_color_normal_txt);
	gb.FillSolidRect(_x17, _x15, 1, 1, g_color_normal_txt);
	images.library_icon.ReleaseGraphics(gb);

	images.newly_added_icon = gdi.CreateImage(imgw, imgh);
	gb = images.newly_added_icon.GetGraphics();
	gb.DrawLine(_x8, _x8, _x19, _x8, 1, g_color_normal_txt);
	gb.DrawLine(_x8, _x8+x3, _x15, _x8+x3, 1, g_color_normal_txt);
	gb.DrawLine(_x8, _x8+x3*2, _x13, _x8+x3*2, 1, g_color_normal_txt);
	gb.DrawLine(_x8, _x8+x3*3, _x13, _x8+x3*3, 1, g_color_normal_txt);
	gb.DrawLine(_x18, _x13, _x18, _x18, 1, g_color_normal_txt);
	gb.DrawLine(_x15, _x15, 20*zdpi, _x15, 1, g_color_normal_txt);
	images.newly_added_icon.ReleaseGraphics(gb);

	images.most_played_icon = gdi.CreateImage(imgw, imgh);
	gb = images.most_played_icon.GetGraphics();
	gb.DrawLine(_x7, _x18, _x18, _x18, 1, g_color_normal_txt);
	gb.DrawLine(_x10, _x12, _x10, _x18, 1, g_color_normal_txt);
	gb.DrawLine(_x15, _x12, _x15, _x18, 1, g_color_normal_txt);
	gb.DrawLine(_x7, _x11, _x10, _x11, 1, g_color_normal_txt);
	gb.DrawLine(_x15, _x11, _x18, _x11, 1, g_color_normal_txt);
	gb.SetSmoothingMode(2)
	gb.DrawLine(_x12, 6*zdpi, _x7, _x11, 1, g_color_normal_txt);
	gb.DrawLine(_x13, 6*zdpi, _x18, _x11, 1, g_color_normal_txt);
	gb.SetSmoothingMode(0)
	images.most_played_icon.ReleaseGraphics(gb);
	
	images.radios_icon = gdi.CreateImage(imgw, imgh);
	gb = images.radios_icon.GetGraphics();
	gb.DrawLine(_x12, _x12, _x12, _x19, 1, g_color_normal_txt);
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(_x10, _x8, 4*zdpi, 4*zdpi, 1, g_color_normal_txt);
	gb.DrawEllipse(_x7, 5*zdpi, _x10, _x10, 1, g_color_normal_txt);
	gb.SetSmoothingMode(0);
	images.radios_icon.ReleaseGraphics(gb);
	
	var point_arr = new Array(_x8,_x8,_x18,_x8,_x18,_x19,_x13,_x15,_x8,_x19);
	images.mood_icon = gdi.CreateImage(imgw, imgh);
	gb = images.mood_icon.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawPolygon(g_color_normal_txt,1,point_arr);
	gb.SetSmoothingMode(0);
	images.mood_icon.ReleaseGraphics(gb);
	
	var point_arr2 = new Array(_x18,_x10,_x15,_x11,_x18,_x13);
	images.board_icon = gdi.CreateImage(imgw, imgh);
	gb = images.board_icon.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawLine(_x7, _x18, _x11, _x12, 1, g_color_normal_txt);
	gb.DrawLine(_x12-1, _x12, _x13, _x17, 1, g_color_normal_txt);
	gb.DrawLine(_x13, _x17, _x18, _x10, 1, g_color_normal_txt);
	gb.FillPolygon(g_color_normal_txt, 0, point_arr2);
	gb.SetSmoothingMode(0);
	images.board_icon.ReleaseGraphics(gb);

	if (ui_mode > 2) return;

	images.icon_normal_pl_playing_hl = gdi.CreateImage(imgw, imgh);
	gb = images.icon_normal_pl_playing_hl.GetGraphics();
	gb.DrawLine(_x8, _x11, _x8, _x18, 1, g_color_playing_txt);
	gb.DrawLine(_x8+x3, _x7, _x8+x3, _x18, 1, g_color_playing_txt);
	gb.DrawLine(_x8+x3*2, _x13, _x8+x3*2, _x18, 1, g_color_playing_txt);
	gb.DrawLine(_x8+x3*3, _x9, _x8+x3*3, _x18, 1, g_color_playing_txt);
	images.icon_normal_pl_playing_hl.ReleaseGraphics(gb);

	images.icon_auto_pl_hl = gdi.CreateImage(imgw, imgh);
	gb = images.icon_auto_pl_hl.GetGraphics();
	gb.DrawLine(_x8, _x8, 16*zdpi, _x8, 1, g_color_playing_txt);
	gb.DrawLine(_x8, _x8+x3, _x15, _x8+x3, 1, g_color_playing_txt);
	gb.DrawLine(_x8, _x8+x3*2, _x12, _x8+x3*2, 1, g_color_playing_txt);
	gb.DrawLine(_x8, _x8+x3*3, _x12, _x8+x3*3, 1, g_color_playing_txt);
	gb.DrawLine(_x18, _x8, _x18, _x14, 1, g_color_playing_txt);
	gb.SetSmoothingMode(2)
	gb.DrawEllipse(_x14, _x13, 4*zdpi, 4*zdpi, 1, g_color_playing_txt);
	gb.SetSmoothingMode(0)
	images.icon_auto_pl_hl.ReleaseGraphics(gb);
	
	images.history_icon_hl = gdi.CreateImage(imgw, imgh);
	gb = images.history_icon_hl.GetGraphics();
	gb.DrawRect(_x7, _x7, _x12, _x10, 1, g_color_playing_txt);
	gb.DrawLine(_x10, 5*zdpi, _x10, _x10, 1, g_color_playing_txt);
	gb.DrawLine(16*zdpi, 5*zdpi, 16*zdpi, _x10, 1, g_color_playing_txt);
	images.history_icon_hl.ReleaseGraphics(gb);

	images.library_icon_hl = gdi.CreateImage(imgw, imgh);
	gb = images.library_icon_hl.GetGraphics();
	gb.DrawRect(_x8, _x7, _x11, _x11, 1, g_color_playing_txt);
	gb.FillSolidRect(_x10, _x9, 1, 1, g_color_playing_txt);
	gb.FillSolidRect(_x17, _x9, 1, 1, g_color_playing_txt);
	gb.FillSolidRect(_x10, _x11, 1, 1, g_color_playing_txt);
	gb.FillSolidRect(_x17, _x11, 1, 1, g_color_playing_txt);
	gb.FillSolidRect(_x10, _x13, 1, 1, g_color_playing_txt);
	gb.FillSolidRect(_x17, _x13, 1, 1, g_color_playing_txt);
	gb.FillSolidRect(_x10, _x15, 1, 1, g_color_playing_txt);
	gb.FillSolidRect(_x17, _x15, 1, 1, g_color_playing_txt);
	images.library_icon_hl.ReleaseGraphics(gb);
	
	images.newly_added_icon_hl = gdi.CreateImage(imgw, imgh);
	gb = images.newly_added_icon_hl.GetGraphics();
	gb.DrawLine(_x8, _x8, _x19, _x8, 1, g_color_playing_txt);
	gb.DrawLine(_x8, _x8+x3, _x15, _x8+x3, 1, g_color_playing_txt);
	gb.DrawLine(_x8, _x8+x3*2, _x13, _x8+x3*2, 1, g_color_playing_txt);
	gb.DrawLine(_x8, _x8+x3*3, _x13, _x8+x3*3, 1, g_color_playing_txt);
	gb.DrawLine(_x18, _x13, _x18, _x18, 1, g_color_playing_txt);
	gb.DrawLine(_x15, _x15, 20*zdpi, _x15, 1, g_color_playing_txt);
	images.newly_added_icon_hl.ReleaseGraphics(gb);

	images.most_played_icon_hl = gdi.CreateImage(imgw, imgh);
	gb = images.most_played_icon_hl.GetGraphics();
	gb.DrawLine(_x7, _x18, _x18, _x18, 1, g_color_playing_txt);
	gb.DrawLine(_x10, _x12, _x10, _x18, 1, g_color_playing_txt);
	gb.DrawLine(_x15, _x12, _x15, _x18, 1, g_color_playing_txt);
	gb.DrawLine(_x7, _x11, _x10, _x11, 1, g_color_playing_txt);
	gb.DrawLine(_x15, _x11, _x18, _x11, 1, g_color_playing_txt);
	gb.SetSmoothingMode(2)
	gb.DrawLine(_x12, 6*zdpi, _x7, _x11, 1, g_color_playing_txt);
	gb.DrawLine(_x13, 6*zdpi, _x18, _x11, 1, g_color_playing_txt);
	gb.SetSmoothingMode(0)
	images.most_played_icon_hl.ReleaseGraphics(gb);
	
	images.radios_icon_hl = gdi.CreateImage(imgw, imgh);
	gb = images.radios_icon_hl.GetGraphics();
	gb.DrawLine(_x12, _x12, _x12, _x19, 1, g_color_playing_txt);
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(_x10, _x8, 4*zdpi, 4*zdpi, 1, g_color_playing_txt);
	gb.DrawEllipse(_x7, 5*zdpi, _x10, _x10, 1, g_color_playing_txt);
	gb.SetSmoothingMode(0);
	images.radios_icon_hl.ReleaseGraphics(gb);
	
	images.mood_icon_hl = gdi.CreateImage(imgw, imgh);
	gb = images.mood_icon_hl.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawPolygon(g_color_playing_txt,1,point_arr);
	gb.SetSmoothingMode(0);
	images.mood_icon_hl.ReleaseGraphics(gb);
	
	images.board_icon_hl = gdi.CreateImage(imgw, imgh);
	gb = images.board_icon_hl.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawLine(_x7, _x18, _x11, _x12, 1, g_color_playing_txt);
	gb.DrawLine(_x12-1, _x12, _x13, _x17, 1, g_color_playing_txt);
	gb.DrawLine(_x13, _x17, _x18, _x10, 1, g_color_playing_txt);
	gb.FillPolygon(g_color_playing_txt, 0, point_arr2);
	gb.SetSmoothingMode(0);
	images.board_icon_hl.ReleaseGraphics(gb);
};

function get_font() {
	g_fname = fbx_set[13];
	g_fsize = fbx_set[14];
	g_fstyle = fbx_set[15];
	g_font = GdiFont(g_fname, g_fsize, g_fstyle);
	g_font_b = GdiFont(g_fname, g_fsize, 1);
	g_track_size = Math.max(10, g_fsize-2);
	g_font_track = GdiFont(g_fname, g_track_size, g_fstyle);
};

function get_colors() {
	switch (ui_mode) {
	case (1):
		g_color_normal_txt = RGB(36, 36, 36);
		g_color_selected_txt = RGB(20, 20, 20);
		g_color_normal_bg = RGB(255,255,255);
		g_color_line = RGBA(0, 0, 0, 35);
		g_color_bt_overlay = RGBA(0, 0, 0, 30);
		g_scroll_color = fbx_set[0];
		g_color_selected_bg = fbx_set[7];
		g_color_topbar = g_color_normal_txt & 0x15ffffff;
		break;
	case (2):
		g_color_normal_txt = RGB(36, 36, 36);
		g_color_selected_txt = RGB(20, 20, 20);
		g_color_normal_bg = fbx_set[3];
		g_color_line = RGBA(0, 0, 0, 35);
		g_color_bt_overlay = RGBA(0, 0, 0, 30);
		g_scroll_color = fbx_set[0];
		g_color_selected_bg = fbx_set[7];
		g_color_topbar = g_color_normal_txt & 0x15ffffff;
		break;
	case (3):
		g_color_normal_txt = RGB(235, 235, 235);
		g_color_selected_txt = RGB(255, 255, 255);
		g_color_normal_bg = fbx_set[0];
		g_color_line = RGBA(0, 0, 0, 35);
		g_color_bt_overlay = RGBA(255, 255, 255, 30);
		g_scroll_color = fbx_set[5];
		g_color_selected_bg = fbx_set[7];
		g_color_topbar = g_color_normal_txt & 0x12ffffff;
		break;
	case (4):
		g_color_normal_txt = RGB(235, 235, 235);
		g_color_selected_txt = RGB(255, 255, 255);
		g_color_normal_bg = fbx_set[2];
		g_color_line = RGBA(0, 0, 0, 55);
		g_color_bt_overlay = RGBA(255, 255, 255, 30);
		g_scroll_color = fbx_set[5];
		g_color_selected_bg = (random_color == 1 || g_color_normal_bg == RGB(10, 10, 10)) ? RGBA(255, 255, 255, 30) : fbx_set[7];
		g_color_topbar = g_color_normal_txt & 0x12ffffff;
		break;
	}
	g_color_highlight = fbx_set[5];
	g_color_playing = fbx_set[6];
	g_color_playing_txt = RGB(255, 255, 255);
};

function on_script_unload() {
	brw.g_time && window.ClearInterval(brw.g_time);
	brw.g_time = false;
};

//=================================================// Keyboard Callbacks

function on_key_up(vkey) {
	if (cSettings.visible) {

	};
	else {
		// inputBox
		if (ppt.showFilterBox && g_filterbox.inputbox.visible) {
			g_filterbox.on_key("up", vkey);
		};

		// scroll keys up and down RESET (step and timers)
		brw.keypressed = false;
		cScrollBar.timerCounter = -1;
		cScrollBar.timerID && window.ClearTimeout(cScrollBar.timerID);
		cScrollBar.timerID = false;
		if (vkey == VK_SHIFT) {
			brw.SHIFT_start_id = null;
			brw.SHIFT_count = 0;
		};
	};
	brw.repaint();
};

function on_key_down(vkey) {
	var mask = GetKeyboardMask();

	if (cSettings.visible) {

	};
	else {
		if (brw.inputboxID >= 0) {
			if (mask == KMask.none) {
				switch (vkey) {
				case VK_ESCAPE:
				case 222:
					brw.inputboxID = -1;
					window.SetCursor(IDC_ARROW);
					brw.repaint();
					break;
				default:
					brw.inputbox.on_key_down(vkey);
				};
			};
			else {
				brw.inputbox.on_key_down(vkey);
			}
		};
		else {

			// inputBox
			if (ppt.showFilterBox && g_filterbox.inputbox.visible && g_filterbox.inputbox.edit) {
				g_filterbox.on_key("down", vkey);
			};

			var act_pls = g_active_playlist;

			if (mask == KMask.none) {
				switch (vkey) {
				case VK_F2:
					// set rename it
					var rowId = brw.selectedRow;
					if (rowId > (ppt.lockReservedPlaylist ? 0 : -1)) {
						var rh = ppt.rowHeight - 10;
						var tw = brw.w - rh - 10;
						brw.inputbox = new oInputbox(tw, rh, plman.GetPlaylistName(brw.rows[rowId].idx), "", g_color_normal_txt, g_color_normal_bg, RGB(0, 0, 0), g_color_playing & 0xb9ffffff, "renamePlaylist()", "brw");
						//brw.inputbox.setSize(tw, rh, g_fsize); // set font_size
						brw.inputboxID = rowId;
						// activate inputbox for edit
						brw.inputbox.on_focus(true);
						brw.inputbox.edit = true;
						brw.inputbox.Cpos = brw.inputbox.text.length;
						brw.inputbox.anchor = brw.inputbox.Cpos;
						brw.inputbox.SelBegin = brw.inputbox.Cpos;
						brw.inputbox.SelEnd = brw.inputbox.Cpos;
						if (!cInputbox.timer_cursor) {
							brw.inputbox.resetCursorTimer();
						};
						brw.inputbox.dblclk = true;
						brw.inputbox.SelBegin = 0;
						brw.inputbox.SelEnd = brw.inputbox.text.length;
						brw.inputbox.text_selected = brw.inputbox.text;
						brw.inputbox.select = true;
						brw.repaint();
					};
					break;
				case VK_F3:
					brw.showActivePlaylist();
					break;
				case VK_F5:
					brw.repaint();
					break;
				case VK_F6:

					break;
				case VK_TAB:
					break;
				case VK_BACK:
					break;
				case VK_ESCAPE:
				case 222:
					brw.inputboxID = -1;
					break;
				case VK_UP:
					if (brw.rowsCount > 0) {
						if (g_filterbox.inputbox && g_filterbox.inputbox.edit) return;
						var rowId = brw.selectedRow;
						if (rowId > 0) {
							if (brw.inputboxID > -1) brw.inputboxID = -1;
							brw.repaint();
							brw.selectedRow--;
							if (brw.selectedRow < 0) brw.selectedRow = 0;
							brw.showSelectedPlaylist();
							brw.repaint();
						};
					};
					break;
				case VK_DOWN:
					if (brw.rowsCount > 0) {
						if (g_filterbox.inputbox && g_filterbox.inputbox.edit) return;
						var rowId = brw.selectedRow;
						if (rowId < brw.rowsCount - 1) {
							if (brw.inputboxID > -1) brw.inputboxID = -1;
							brw.repaint();
							brw.selectedRow++;
							if (brw.selectedRow > brw.rowsCount - 1) brw.selectedRow = brw.rowsCount - 1;
							brw.showSelectedPlaylist();
							brw.repaint();
						};
					};
					break;
				case VK_PGUP:
					break;
				case VK_PGDN:
					break;
				case VK_RETURN:
					if (brw.rowsCount > 0) {
						if (g_filterbox.inputbox && g_filterbox.inputbox.edit) return;
						brw.repaint();
						plman.ActivePlaylist = brw.selectedRow;
						cPlaylistManager.playlist_switch_pending = true;
						window.SetCursor(IDC_WAIT);
					};
					break;
				case VK_END:
					if (brw.rowsCount > 0) {
						if (g_filterbox.inputbox && g_filterbox.inputbox.edit) return;
						if (brw.inputboxID > -1) brw.inputboxID = -1;
						brw.repaint();
						brw.selectedRow = brw.rowsCount - 1;
						brw.showSelectedPlaylist();
					};
					break;
				case VK_HOME:
					if (brw.rowsCount > 0) {
						if (g_filterbox.inputbox && g_filterbox.inputbox.edit) return;
						if (brw.inputboxID > -1) brw.inputboxID = -1;
						brw.repaint();
						brw.selectedRow = 0;
						brw.showSelectedPlaylist();
					};
					break;
				case VK_DELETE:
					if (!brw.delete_pending && !timers.deletePlaylist) {
						if (g_filterbox.inputbox && g_filterbox.inputbox.edit) return;
						if (brw.selectedRow > (ppt.lockReservedPlaylist ? 0 : -1) && brw.selectedRow < brw.rowsCount && brw.rowsCount > 0) {
							//
							brw.delete_pending = true;
							timers.deletePlaylist = window.SetTimeout(function() {
								timers.deletePlaylist && window.ClearTimeout(timers.deletePlaylist);
								timers.deletePlaylist = false;
							}, 150);
							//
							var updateActivePlaylist = (brw.selectedRow == plman.ActivePlaylist);
							var id = brw.selectedRow;
							var row = brw.getRowIdFromIdx(id);
							plman.RemovePlaylist(id);
							if (row < brw.rowsCount - 1) {
								brw.selectedRow = id;
							};
							else if (row > 0) {
								brw.selectedRow = id - 1;
							};
							if (updateActivePlaylist) {
								if (row < brw.rowsCount - 1) {
									plman.ActivePlaylist = id;
								};
								else if (row > 0) {
									plman.ActivePlaylist = id - 1;
								};
							};
						};
					};
					break;
				};
			};
			else {
				switch (mask) {
				case KMask.shift:
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
					break;
				case KMask.ctrl:
					if (vkey == 65) { // CTRL+A

					};
					if (vkey == 66) { // CTRL+B
						cScrollBar.enabled = !cScrollBar.enabled;
						window.SetProperty("_DISPLAY: Show Scrollbar", cScrollBar.enabled);
						get_metrics();
						brw.repaint();
					};
					if (vkey == 88) { // CTRL+X

					};
					if (vkey == 67) { // CTRL+C

					};
					if (vkey == 86) { // CTRL+V

					};
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
					if (vkey == 84) { // CTRL+T
						ppt.showHeaderBar = !ppt.showHeaderBar;
						window.SetProperty("_DISPLAY: Show Top Bar", ppt.showHeaderBar);
						get_metrics();
						brw.repaint();
					};
					break;
				case KMask.alt:
					switch (vkey) {
					case 65:
						// ALT+A
						fb.RunMainMenuCommand("视图/总在最上面");
						break;
					case VK_ALT:
						// ALT key alone
						break;
					};
					break;
				};
			};
		};

	};
};

function on_char(code) {
	// rename inputbox
	if (brw.inputboxID >= 0) {
		brw.inputbox.on_char(code);
	};
	else {
		// filter inputBox
		if (ppt.showFilterBox && g_filterbox.inputbox.visible) {
			g_filterbox.on_char(code);
		};
	};
};

//=================================================// Playlist Callbacks
var playing_pl = null;
function on_playback_new_track(metadb) {
	if(playing_pl != plman.PlayingPlaylist) {
		playing_pl = plman.PlayingPlaylist;
		window.Repaint();
	}
};
function on_playback_stop() {
	playing_pl = null;
	window.Repaint();
}

function on_playlists_changed() {

	if (cPlaylistManager.drag_droped) {
		window.SetCursor(IDC_ARROW);
	};
	else {
		if (brw.previous_playlistCount != plman.PlaylistCount) g_filterbox.clearInputbox();
	};

	brw.populate(is_first_populate = false, reset_scroll = false);

	if (brw.selectedRow > brw.rowsCount) brw.selectedRow = plman.ActivePlaylist;

	brw.repaint();
	brw.delete_pending = false;
};

function on_playlist_switch() {
	g_active_playlist = plman.ActivePlaylist;
	brw.showActivePlaylist();
	if (brw.selectedRow > brw.rowsCount) brw.selectedRow = plman.ActivePlaylist;
	brw.repaint();
};

function on_playlist_items_added(playlist_idx) {
	brw.repaint();
};

function on_playlist_items_removed(playlist_idx, new_count) {
	brw.repaint();
};

function on_playlist_items_reordered(playlist_idx) {

};


function on_item_focus_change(playlist, from, to) {

};

function on_metadb_changed(metadb_or_metadbs, fromhook) {

};

function on_item_selection_change() {

};

function on_playlist_items_selection_change() {

};

function on_focus(is_focused) {
	g_focus = is_focused;

	if (brw.inputboxID >= 0) {
		brw.inputbox.on_focus(is_focused);
	};
	if (!is_focused) {
		brw.inputboxID = -1;
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

function check_playlist(name) {
	var pl_name = "",
		pl_idx = -1;
	for (var i = 0; i < plman.PlaylistCount; i++) {
		pl_name = plman.GetPlaylistName(i);
		if (pl_name == name) {
			pl_idx = i;
			break;
		};
	};
	return pl_idx;
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

function checkMediaLibrayPlaylist() {
	g_avoid_on_playlists_changed = true;

	// check if library playlist is present
	var isMediaLibraryFound = false;
	var total = plman.PlaylistCount;
	for (var i = 0; i < total; i++) {
		if (plman.GetPlaylistName(i) == "媒体库") {
			var mediaLibraryIndex = i;
			isMediaLibraryFound = true;
			break;
		};
	};
	if (!isMediaLibraryFound) {
		// create Media Library playlist (sort forced)
		// > sort: sort string expression.
		// > flags: 1 - always sort.
		// > boolean CreateAutoPlaylist(idx, name, query, sort = "", flags = 0);
		plman.CreateAutoPlaylist(total, "媒体库", "%path% PRESENT", default_sort, 0);
		// Move it to the top
		plman.MovePlaylist(total, 0);
	};
	else if (mediaLibraryIndex > 0) {
		// Always move it to the top
		plman.MovePlaylist(mediaLibraryIndex, 0);
	};
	g_avoid_on_playlists_changed = false;
};

function check_scroll(scroll___) {
	if (scroll___ < 0) scroll___ = 0;
	var g1 = brw.h - (brw.totalRowsVis * ppt.rowHeight);
	//var scroll_step = Math.ceil(ppt.rowHeight / ppt.scroll_divider);
	//var g2 = Math.floor(g1 / scroll_step) * scroll_step;

	var end_limit = (brw.rowsCount * ppt.rowHeight) - (brw.totalRowsVis * ppt.rowHeight) - g1;
	if (scroll___ != 0 && scroll___ > end_limit) {
		scroll___ = end_limit;
	};
	if (scroll___ == 1) scroll___ = 0;
	return scroll___;
};

function g_sendResponse() {

	if (g_filterbox.inputbox.text.length == 0) {
		filter_text = "";
	};
	else {
		filter_text = g_filterbox.inputbox.text;
	};

	// filter in current panel
	brw.populate(true);
	if (brw.selectedRow < 0 || brw.selectedRow > brw.rowsCount - 1) brw.selectedRow = 0;
};

function on_notify_data(name, info) {
	switch (name) {
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
		if (ppt.showFilterBox) {
			g_filterbox.getImages();
			g_filterbox.reset_colors();
		}
		if (brw) {
			brw.scrollbar.setCursorButton();
		}
		window.Repaint();
		break;
	case "set_ui_mode":
		ui_mode = info;
		get_colors();
		get_images();
		if (ppt.showFilterBox) {
			g_filterbox.getImages();
			g_filterbox.reset_colors();
		}
		if (brw) {
			brw.getImages();
			brw.scrollbar.setCursorButton();
		}
		window.Repaint();
		break;
	case "random_color_mode":
		random_color = info;
		get_colors();
		if (ppt.showFilterBox) {
			g_filterbox.reset_colors();
		}
		window.Repaint();
		break;
	case "set_font":
		fbx_set[13] = info[0];
		fbx_set[14] = info[1];
		fbx_set[15] = info[2];
		window.Reload();
		//get_font();
		//get_metrics();
		//brw.repaint();
		//window.Repaint();
		break;
	case "WSH_playlist_drag_drop":
		// send from a WSH playlist panel to simulate a drag and drop feature
		g_handles = info;
		break;
	case "lock_lib_playlist":
		if (ppt.lockReservedPlaylist == info) break;
		ppt.lockReservedPlaylist = info;
		window.SetProperty("_PROPERTY: Lock Reserved Playlist", ppt.lockReservedPlaylist);
		if (ppt.lockReservedPlaylist) checkMediaLibrayPlaylist();
		//get_metrics();
		//brw.repaint();
		brw.populate(is_first_populate = false, reset_scroll = false);
		//window.Repaint();
		break;
	case "panel_show_shadow":
		show_shadow = info;
		window.RepaintRect(0,0,ww,5);
		window.RepaintRect(0,wh-5,ww,5);
		break;
	case "scrollbar_width":
		if(!cScrollBar.enabled) return;
		sys_scrollbar = info;
		cScrollBar.width = sys_scrollbar ? get_system_scrollbar_width() : 12*zdpi;
		cScrollBar.maxCursorHeight = sys_scrollbar ? 120*zdpi : 105*zdpi;
		get_metrics();
		brw.scrollbar.updateScrollbar();
		brw.scrollbar.setCursorButton();
		brw.scrollbar.setSize();
		brw.repaint();
		break;
	case "PLMan to change sorting":
		default_sort = info;
		window.SetProperty("_PROPERTY: New playlist sortorder", default_sort);
		break;
	}
};

//=================================================// Drag'n'Drop Callbacks

function on_drag_enter() {
	g_dragndrop_status = true;
};

function on_drag_leave() {
	g_dragndrop_status = false;
	g_dragndrop_trackId = -1;
	g_dragndrop_rowId = -1;
	g_dragndrop_targetPlaylistId = -1;
	brw.buttonclicked = false;
	cScrollBar.timerID && window.ClearInterval(cScrollBar.timerID);
	cScrollBar.timerID = false;
	brw.repaint();
};

function on_drag_over(action, x, y, mask) {

	if (x == g_dragndrop_x && y == g_dragndrop_y) return true;

	g_dragndrop_trackId = -1;
	g_dragndrop_rowId = -1;
	g_dragndrop_targetPlaylistId = -1;
	g_dragndrop_bottom = false;

	brw.on_mouse("drag_over", x, y);
	brw.repaint();

	g_dragndrop_x = x;
	g_dragndrop_y = y;
};

function on_drag_drop(action, x, y, mask) {

	if (y > brw.y) {
		var drop_done = false;
		if (brw.activeRow > -1) {
			drop_done = true;
			if (g_dragndrop_targetPlaylistId > -1) {
				action.ToPlaylist();
				action.Playlist = g_dragndrop_targetPlaylistId;
				action.ToSelect = true;
			};
		};
		else {
			drop_done = true;
			var total_pl = plman.PlaylistCount;
			plman.CreatePlaylist(total_pl, "新建播放列表 (" + total_pl + ")");
			action.ToPlaylist();
			action.Playlist = total_pl;
			action.ToSelect = true;
		};
		if (drop_done) {
			// create a timer to blink the playlist item where tracks have been droped!
			if (!blink.timer) {
				blink.x = x;
				blink.y = y;
				blink.totaltracks = 1;
				blink.id = brw.activeRow;
				blink.counter = 0;
				blink.timer = window.SetInterval(function() {
					blink.counter++;
					if (blink.counter > 5) {
						blink.timer && window.ClearInterval(blink.timer);
						blink.timer = false;
						blink.counter = -1;
						blink.id = null;
					};
					brw.repaint();
				}, 125);
			};
		};
	};
	g_dragndrop_status = false;
	brw.repaint();
};