oFilterBox = function() {
	this.images = {
		magnify: null,
		resetIcon_off: null,
		resetIcon_ov: null
	};

	this.getImages = function() {
		var gb;
		var w = Math.round(18 * zdpi);
		var x5 = 5*zdpi;
		this.images.magnify = gdi.CreateImage(w, w);
		gb = this.images.magnify.GetGraphics();
		gb.SetTextRenderingHint(4);
		gb.DrawString("\uED23", g_fnico1, g_color_normal_txt, 0, 0, w, w, cc_stringformat);
		gb.SetTextRenderingHint(0);
		this.images.magnify.ReleaseGraphics(gb);

		this.images.resetIcon_off = gdi.CreateImage(w, w);
		gb = this.images.resetIcon_off.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawLine(x5, x5, w - x5, w - x5, 1, g_color_normal_txt);
		gb.DrawLine(x5, w - x5, w - x5, x5, 1, g_color_normal_txt);
		gb.SetSmoothingMode(0);
		this.images.resetIcon_off.ReleaseGraphics(gb);

		this.images.resetIcon_ov = gdi.CreateImage(w, w);
		gb = this.images.resetIcon_ov.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawLine(x5, x5, w - x5, w - x5, 1, g_color_normal_txt);
		gb.DrawLine(x5, w - x5, w - x5, x5, 1, g_color_normal_txt);
		gb.FillEllipse(1, 1, w - 2, w - 2, g_color_bt_overlay);
		gb.SetSmoothingMode(0);
		this.images.resetIcon_ov.ReleaseGraphics(gb);

		this.reset_bt = new button(this.images.resetIcon_off, this.images.resetIcon_ov, this.images.resetIcon_ov);
	};
	this.getImages();

	this.on_init = function() {
		this.inputbox = new oInputbox(cFilterBox.w, cFilterBox.h, "", "过滤", g_color_normal_txt, 0, 0, g_color_selected_bg, g_sendResponse, "brw");
		this.inputbox.autovalidation = true;
	};
	this.on_init();

	this.reset_colors = function() {
		this.inputbox.textcolor = g_color_normal_txt;
		this.inputbox.backselectioncolor = g_color_selected_bg;
	};

	this.setSize = function(w, h) {
		this.inputbox.setSize(w, h);
	};

	this.clearInputbox = function() {
		if (this.inputbox.text.length > 0) {
			this.inputbox.text = "";
			this.inputbox.offset = 0;
			filter_text = "";
		};
	};

	this.draw = function(gr, x, y, jsspm) {
		var bx = x;
		var by = y;
		var bx2 = bx + Math.round(22 * zdpi);
		if(jsspm){
			gr.FillSolidRect(cFilterBox.h + cFilterBox.x, by + this.inputbox.h + 2, cFilterBox.w, 1, g_color_normal_txt & 0x75ffffff);
		}else{
			var bx3 = bx2 + cFilterBox.w;
			gr.FillSolidRect(0, 0, bx3, ppt.headerBarHeight - 2, g_color_topbar);
			gr.FillGradRect(bx3 - 1, 0, 1, ppt.headerBarHeight - 2, 90, RGBA(0, 0, 0, 3), RGBA(0, 0, 0, 35), 0.5);
		}

		if (this.inputbox.text.length > 0) {
			this.reset_bt.draw(gr, bx - 1, by + 1, 255);
		}
		else {
			gr.DrawImage(this.images.magnify, bx, by + 2, cFilterBox.h - 2, cFilterBox.h - 2, 0, 0, cFilterBox.h - 2, cFilterBox.h - 2, 0, 255);
		};

		this.inputbox.draw(gr, bx2, by, 0, 0);
	};

	this.on_mouse = function(event, x, y, delta) {
		switch (event) {
		case "lbtn_down":
			this.inputbox.check("down", x, y);
			if (this.inputbox.text.length > 0) this.reset_bt.checkstate("down", x, y);
			break;
		case "lbtn_up":
			this.inputbox.check("up", x, y);
			if (this.inputbox.text.length > 0) {
				if (this.reset_bt.checkstate("up", x, y) == ButtonStates.hover) {
					this.inputbox.text = "";
					this.inputbox.offset = 0;
					this.reset_bt.state = ButtonStates.normal;
					g_sendResponse();
				};
			};
			break;
		case "lbtn_dblclk":
			this.inputbox.check("dblclk", x, y);
			break;
		case "rbtn_down":
			this.inputbox.check("right", x, y);
			break;
		case "move":
			this.inputbox.check("move", x, y);
			if (this.inputbox.text.length > 0) this.reset_bt.checkstate("move", x, y);
			break;
		};
	};

	this.on_key = function(event, vkey) {
		switch (event) {
		case "down":
			this.inputbox.on_key_down(vkey);
			break;
		};
	};

	this.on_char = function(code) {
		this.inputbox.on_char(code);
	};

	this.on_focus = function(is_focused) {
		this.inputbox.on_focus(is_focused);
	};
};

oScrollbar = function() {
	this.buttons = null;
	this.buttonClick = false;

	this.color_bg = g_color_normal_bg;
	this.color_txt = g_color_normal_txt;

	this.setNewColors = function() {
		this.color_bg = g_color_normal_bg;
		this.color_txt = g_color_normal_txt;
		this.setCursorButton();
	};

	this.setCursorButton = function() {
		// normal cursor Image
		this.cursorImage_normal = gdi.CreateImage(this.cursorw, this.cursorh);
		var gb = this.cursorImage_normal.GetGraphics();
		gb.FillSolidRect(this.cursorw - 4, 0, 4, this.cursorh, g_scroll_color);
		this.cursorImage_normal.ReleaseGraphics(gb);

		// hover cursor Image
		this.cursorImage_hover = gdi.CreateImage(this.cursorw, this.cursorh);
		gb = this.cursorImage_hover.GetGraphics();
		gb.FillSolidRect(0, 0, this.cursorw, this.cursorh, g_scroll_color);
		this.cursorImage_hover.ReleaseGraphics(gb);

		// down cursor Image
		this.cursorImage_down = gdi.CreateImage(this.cursorw, this.cursorh);
		gb = this.cursorImage_down.GetGraphics();
		gb.FillSolidRect(0, 0, this.cursorw, this.cursorh, g_scroll_color);
		this.cursorImage_down.ReleaseGraphics(gb);

		// create/refresh cursor Button in buttons array
		this.buttons = new button(this.cursorImage_normal, this.cursorImage_hover, this.cursorImage_down);
		this.buttons.x = this.x;
		this.buttons.y = this.cursory;
	};

	this.draw = function(gr) {
		if (cScrollBar.visible) this.buttons.draw(gr, this.x, this.cursory, 255);
	};

	this.updateScrollbar = function() {
		var prev_cursorh = this.cursorh;
		this.total = brw.rowsCount;
		this.totalh = this.total * ppt.rowHeight;
		this.totalRowsVish = brw.totalRowsVis * ppt.rowHeight;
		// set scrollbar visibility
		cScrollBar.visible = (this.totalh > brw.h);
		// set cursor width/height
		this.cursorw = cScrollBar.width;
		if (this.total > 0) {
			this.cursorh = Math.round((brw.h / this.totalh) * this.h);
			if (this.cursorh < cScrollBar.minCursorHeight) this.cursorh = cScrollBar.minCursorHeight;
			if (this.cursorh > cScrollBar.maxCursorHeight) this.cursorh = cScrollBar.maxCursorHeight;
		}
		else {
			this.cursorh = cScrollBar.minCursorHeight;
		};
		// set cursor y pos
		this.setCursorY();
		if (this.cursorh != prev_cursorh) this.setCursorButton();
	};

	this.setCursorY = function() {
		// set cursor y pos
		var ratio = scroll / (this.totalh - this.totalRowsVish);
		this.cursory = this.y + Math.round((this.h - this.cursorh) * ratio);
	};

	this.setSize = function() {
		this.x = brw.x + brw.w;
		this.y = brw.y;
		this.w = cScrollBar.width;
		this.h = brw.h;
	};

	this.setScrollFromCursorPos = function() {
		// calc ratio of the scroll cursor to calc the equivalent item for the full list (with gh)
		var ratio = (this.cursory - this.y) / (this.h - this.cursorh);
		// calc idx of the item (of the full list with gh) to display at top of the panel list (visible)
		scroll = Math.round((this.totalh - this.totalRowsVish) * ratio);
	};

	this.cursorCheck = function(event, x, y) {
		if (!this.buttons) return;
		switch (event) {
		case "down":
			var tmp = this.buttons.checkstate(event, x, y);
			if (tmp == ButtonStates.down) {
				this.cursorClickX = x;
				this.cursorClickY = y;
				this.cursorDrag = true;
				this.cursorDragDelta = y - this.cursory;
			};
			break;
		case "up":
			this.buttons.checkstate(event, x, y);
			if (this.cursorDrag) {
				this.setScrollFromCursorPos();
				brw.repaint();
			};
			this.cursorClickX = 0;
			this.cursorClickY = 0;
			this.cursorDrag = false;
			break;
		case "move":
			this.buttons.checkstate(event, x, y);
			if (this.cursorDrag) {
				this.cursory = y - this.cursorDragDelta;
				if (this.cursory + this.cursorh > this.y + this.h) {
					this.cursory = (this.y + this.h) - this.cursorh;
				};
				if (this.cursory < this.y) {
					this.cursory = this.y;
				};
				this.setScrollFromCursorPos();
				brw.repaint();
			};
			break;
		case "leave":
			this.buttons.checkstate(event, 0, 0);
			break;
		};
	};

	this._isHover = function(x, y) {
		return (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h);
	};

	this._isHoverArea = function(x, y) {
		return (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h);
	};

	this._isHoverCursor = function(x, y) {
		return (x >= this.x && x <= this.x + this.w && y >= this.cursory && y <= this.cursory + this.cursorh);
	};

	this.on_mouse = function(event, x, y, delta) {
		this.isHover = this._isHover(x, y);
		this.isHoverArea = this._isHoverArea(x, y);
		this.isHoverCursor = this._isHoverCursor(x, y);
		this.isHoverEmptyArea = this.isHoverArea && !this.isHoverCursor;

		var scroll_step = ppt.rowHeight;
		var scroll_step_page = brw.h;

		switch (event) {
		case "down":
		case "dblclk":
			if ((this.isHoverCursor || this.cursorDrag) && !this.buttonClick && !this.isHoverEmptyArea) {
				this.cursorCheck(event, x, y);
			}
			else {
				if (!this.buttonClick && this.isHoverEmptyArea) {
					// check click on empty area scrollbar
					if (y < this.cursory) {
						// up
						this.buttonClick = true;
						scroll = scroll - scroll_step_page;
						scroll = check_scroll(scroll);
						if (!cScrollBar.timerID) {
							cScrollBar.timerID = window.SetInterval(function() {
								if (cScrollBar.timerCounter > 6 && m_y < brw.scrollbar.cursory) {
									scroll = scroll - scroll_step_page;
									scroll = check_scroll(scroll);
								}
								else {
									cScrollBar.timerCounter++;
								};
							}, 80);
						};
					}
					else {
						// down
						this.buttonClick = true;
						scroll = scroll + scroll_step_page;
						scroll = check_scroll(scroll);
						if (!cScrollBar.timerID) {
							cScrollBar.timerID = window.SetInterval(function() {
								if (cScrollBar.timerCounter > 6 && m_y > brw.scrollbar.cursory + brw.scrollbar.cursorh) {
									scroll = scroll + scroll_step_page;
									scroll = check_scroll(scroll);
								}
								else {
									cScrollBar.timerCounter++;
								};
							}, 80);
						};
					};
				};
			};
			break;
		case "right":
		case "up":
			if (cScrollBar.timerID) {
				window.ClearInterval(cScrollBar.timerID);
				cScrollBar.timerID = false;
			};
			cScrollBar.timerCounter = -1;

			this.cursorCheck(event, x, y);
			this.buttonClick = false;
			break;
		case "move":
			this.cursorCheck(event, x, y);
			break;
		case "wheel":
			if (!this.buttonClick) {
				this.updateScrollbar();
			};
			break;
		case "leave":
			this.cursorCheck(event, 0, 0);
			break;
		};
	};
};