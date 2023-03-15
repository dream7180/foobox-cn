oFilterBox = function() {
	this.images = {
		magnify: null,
		resetIcon_off: null,
		resetIcon_ov: null
	};

	this.getImages = function() {
		var gb;
		var w = Math.round(18 * zdpi);
		var x5 = 5*zdpi, x_c = (w-3*zdpi)/2;
		this.images.magnify = gdi.CreateImage(w, w);
		gb = this.images.magnify.GetGraphics();
		var point_arr = new Array(3*zdpi,Math.round(3*zdpi),w-6*zdpi,Math.round(3*zdpi),x_c,w/2);
		gb.DrawLine(x_c, w/2 -1, x_c, w-x5, 2, g_color_normal_txt);
		gb.SetSmoothingMode(2);
		gb.DrawPolygon(g_color_normal_txt,1,point_arr);
		gb.SetSmoothingMode(0);
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
			var bys = Math.round((ppt.headerBarHeight - 2) / 2);
			gr.FillSolidRect(0, 0, bx3, ppt.headerBarHeight - 2, g_color_topbar);
			gr.FillGradRect(bx3 - 1, 0, 1, bys, 90, RGBA(0, 0, 0, 3), RGBA(0, 0, 0, 35));
			gr.FillGradRect(bx3 - 1, bys, 1, bys, 270, RGBA(0, 0, 0, 3), RGBA(0, 0, 0, 35));
		}
		//if (this.inputbox.edit) {
		//};

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
	this.showButtons = window.GetProperty("_DISPLAY: Show Scrollbar Buttons", false);
	this.buttons = Array(null, null, null);
	this.buttonType = {
		cursor: 0,
		up: 1,
		down: 2
	};
	this.buttonClick = false;

	this.color_bg = g_color_normal_bg;
	this.color_txt = g_color_normal_txt;

	this.setNewColors = function() {
		this.color_bg = g_color_normal_bg;
		this.color_txt = g_color_normal_txt;
		this.setButtons();
		this.setCursorButton();
	};

	this.setButtons = function() {
		this.upImage_normal = gdi.CreateImage(70, 70);
		var gb = this.upImage_normal.GetGraphics();
		DrawPolyStar(gb, 11, 16, 44, 1, 3, 0, RGB(0, 0, 0), blendColors(this.color_txt, this.color_bg, 0.5), 0, 200);
		this.upImage_normal.ReleaseGraphics(gb);

		this.upImage_hover = gdi.CreateImage(70, 70);
		var gb = this.upImage_hover.GetGraphics();
		DrawPolyStar(gb, 11, 16, 44, 1, 3, 0, blendColors(this.color_txt, this.color_bg, 0.3), blendColors(this.color_txt, this.color_bg, 0.3), 0, 240);
		this.upImage_hover.ReleaseGraphics(gb);
		this.upImage_down = gdi.CreateImage(70, 70);
		gb = this.upImage_down.GetGraphics();
		DrawPolyStar(gb, 11, 13, 44, 1, 3, 0, RGB(0, 0, 0), blendColors(this.color_txt, this.color_bg, 0.05), 0, 160);
		this.upImage_down.ReleaseGraphics(gb);

		this.downImage_normal = gdi.CreateImage(70, 70);
		gb = this.downImage_normal.GetGraphics();
		DrawPolyStar(gb, 11, 10, 44, 1, 3, 0, RGB(0, 0, 0), blendColors(this.color_txt, this.color_bg, 0.5), 180, 200);
		this.downImage_normal.ReleaseGraphics(gb);

		this.downImage_hover = gdi.CreateImage(70, 70);
		gb = this.downImage_hover.GetGraphics();
		DrawPolyStar(gb, 11, 10, 44, 1, 3, 1, blendColors(this.color_txt, this.color_bg, 0.3), blendColors(this.color_txt, this.color_bg, 0.3), 180, 240);
		this.downImage_hover.ReleaseGraphics(gb);

		this.downImage_down = gdi.CreateImage(70, 70);
		gb = this.downImage_down.GetGraphics();
		DrawPolyStar(gb, 11, 13, 44, 1, 3, 0, RGB(0, 0, 0), blendColors(this.color_txt, this.color_bg, 0.05), 180, 160);

		this.downImage_down.ReleaseGraphics(gb);

		for (i = 1; i < this.buttons.length; i++) {
			switch (i) {
			case this.buttonType.cursor:
				this.buttons[this.buttonType.cursor] = new button(this.cursorImage_normal, this.cursorImage_hover, this.cursorImage_down);
				break;
			case this.buttonType.up:
				this.buttons[this.buttonType.up] = new button(this.upImage_normal.Resize(this.w, this.w, 2), this.upImage_hover.Resize(this.w, this.w, 2), this.upImage_down.Resize(this.w, this.w, 2));
				break;
			case this.buttonType.down:
				this.buttons[this.buttonType.down] = new button(this.downImage_normal.Resize(this.w, this.w, 2), this.downImage_hover.Resize(this.w, this.w, 2), this.downImage_down.Resize(this.w, this.w, 2));
				break;
			};
		};
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
		this.buttons[this.buttonType.cursor] = new button(this.cursorImage_normal, this.cursorImage_hover, this.cursorImage_down);
		this.buttons[this.buttonType.cursor].x = this.x;
		this.buttons[this.buttonType.cursor].y = this.cursory;
	};

	this.draw = function(gr) {
		// scrollbar buttons
		if (cScrollBar.visible) this.buttons[this.buttonType.cursor].draw(gr, this.x, this.cursory, 255);
		if (this.showButtons) {
			this.buttons[this.buttonType.up].draw(gr, this.x, this.y, 255);
			this.buttons[this.buttonType.down].draw(gr, this.x, this.areay + this.areah, 255);
		};
	};

	this.updateScrollbar = function() {
		var prev_cursorh = this.cursorh;
		this.total = brw.rowsCount;
		this.rowh = ppt.rowHeight;
		this.totalh = this.total * this.rowh;
		// set scrollbar visibility
		cScrollBar.visible = (this.totalh > brw.h);
		// set cursor width/height
		this.cursorw = cScrollBar.width;
		if (this.total > 0) {
			this.cursorh = Math.round((brw.h / this.totalh) * this.areah);
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
		var ratio = scroll / (this.totalh - brw.h);
		this.cursory = this.areay + Math.round((this.areah - this.cursorh) * ratio);
	};

	this.setSize = function() {
		if (this.showButtons) this.buttonh = this.showButtons ? cScrollBar.width : 0;
		this.x = brw.x + brw.w;
		this.y = brw.y;// - ppt.headerBarHeight * 0;
		this.w = cScrollBar.width;
		this.h = brw.h;// + ppt.headerBarHeight * 0;
		if (this.showButtons) {
			this.areay = this.y + this.buttonh;
			this.areah = this.h - (this.buttonh * 2);
		}
		else {
			this.areay = this.y;
			this.areah = this.h;
		};
		this.setButtons();
	};

	this.setScrollFromCursorPos = function() {
		// calc ratio of the scroll cursor to calc the equivalent item for the full list (with gh)
		var ratio = (this.cursory - this.areay) / (this.areah - this.cursorh);
		// calc idx of the item (of the full list with gh) to display at top of the panel list (visible)
		scroll = Math.round((this.totalh - brw.h) * ratio);
	};

	this.cursorCheck = function(event, x, y) {
		if (!this.buttons[this.buttonType.cursor]) return;
		switch (event) {
		case "down":
			var tmp = this.buttons[this.buttonType.cursor].checkstate(event, x, y);
			if (tmp == ButtonStates.down) {
				this.cursorClickX = x;
				this.cursorClickY = y;
				this.cursorDrag = true;
				this.cursorDragDelta = y - this.cursory;
			};
			break;
		case "up":
			this.buttons[this.buttonType.cursor].checkstate(event, x, y);
			if (this.cursorDrag) {
				this.setScrollFromCursorPos();
				brw.repaint();
			};
			this.cursorClickX = 0;
			this.cursorClickY = 0;
			this.cursorDrag = false;
			break;
		case "move":
			this.buttons[this.buttonType.cursor].checkstate(event, x, y);
			if (this.cursorDrag) {
				this.cursory = y - this.cursorDragDelta;
				if (this.cursory + this.cursorh > this.areay + this.areah) {
					this.cursory = (this.areay + this.areah) - this.cursorh;
				};
				if (this.cursory < this.areay) {
					this.cursory = this.areay;
				};
				this.setScrollFromCursorPos();
				brw.repaint();
			};
			break;
		case "leave":
			this.buttons[this.buttonType.cursor].checkstate(event, 0, 0);
			break;
		};
	};

	this._isHover = function(x, y) {
		return (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h);
	};

	this._isHoverArea = function(x, y) {
		return (x >= this.x && x <= this.x + this.w && y >= this.areay && y <= this.areay + this.areah);
	};

	this._isHoverCursor = function(x, y) {
		return (x >= this.x && x <= this.x + this.w && y >= this.cursory && y <= this.cursory + this.cursorh);
	};

	this.on_mouse = function(event, x, y, delta) {
		this.isHover = this._isHover(x, y);
		this.isHoverArea = this._isHoverArea(x, y);
		this.isHoverCursor = this._isHoverCursor(x, y);
		this.isHoverButtons = this.isHover && !this.isHoverCursor && !this.isHoverArea;
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
				// buttons events
				var bt_state = ButtonStates.normal;
				for (var i = 1; i < 3; i++) {
					switch (i) {
					case 1:
						// up button
						bt_state = this.buttons[i].checkstate(event, x, y);
						if ((event == "down" && bt_state == ButtonStates.down) || (event == "dblclk" && bt_state == ButtonStates.hover)) {
							this.buttonClick = true;
							scroll = scroll - scroll_step;
							scroll = check_scroll(scroll);
							if (!cScrollBar.timerID) {
								cScrollBar.timerID = window.SetInterval(function() {
									if (cScrollBar.timerCounter > 6) {
										scroll = scroll - scroll_step;
										scroll = check_scroll(scroll);
									}
									else {
										cScrollBar.timerCounter++;
									};
								}, 80);
							};
						};
						break;
					case 2:
						// down button
						bt_state = this.buttons[i].checkstate(event, x, y);
						if ((event == "down" && bt_state == ButtonStates.down) || (event == "dblclk" && bt_state == ButtonStates.hover)) {
							this.buttonClick = true;
							scroll = scroll + scroll_step;
							scroll = check_scroll(scroll);
							if (!cScrollBar.timerID) {
								cScrollBar.timerID = window.SetInterval(function() {
									if (cScrollBar.timerCounter > 6) {
										scroll = scroll + scroll_step;
										scroll = check_scroll(scroll);
									}
									else {
										cScrollBar.timerCounter++;
									};
								}, 80);
							};
						};
						break;
					};
				};
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
			for (var i = 1; i < 3; i++) {
				this.buttons[i].checkstate(event, x, y);
			};
			this.buttonClick = false;
			break;
		case "move":
			this.cursorCheck(event, x, y);
			for (var i = 1; i < 3; i++) {
				this.buttons[i].checkstate(event, x, y);
			};
			break;
		case "wheel":
			if (!this.buttonClick) {
				this.updateScrollbar();
			};
			break;
		case "leave":
			this.cursorCheck(event, 0, 0);
			for (var i = 1; i < 3; i++) {
				this.buttons[i].checkstate(event, 0, 0);
			};
			break;
		};
	};
};