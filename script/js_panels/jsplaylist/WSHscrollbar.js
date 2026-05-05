// *****************************************************************************************************************************************
// scrollbar & scrollBar object by Br3tt aka Falstaff (c)2015 mod for foobox https://github.com/dream7180
// *****************************************************************************************************************************************

oScrollbar = function( /*themed*/ ) {
	this.cursorScrollTimer = false;
	this.buttons = null;

	this.draw = function(gr, x, y) {
		// draw cursor
		this.buttons && this.buttons.draw(gr, this.x, this.cursorPos, 255);
	};

	this.setCursor = function(totalRowVisible, totalRows, offset) {
		if (totalRows > 0 && totalRows > totalRowVisible && this.w > 2) {
			this.cursorWidth = this.w;
			// calc cursor height
			this.cursorHeight = Math.round((totalRowVisible / totalRows) * this.area_h);
			if (this.cursorHeight < properties.cursor_min) this.cursorHeight = properties.cursor_min;
			if (this.cursorHeight > properties.cursor_max) this.cursorHeight = properties.cursor_max;
			// cursor pos
			var ratio = offset / (totalRows - totalRowVisible);
			this.cursorPos = this.area_y + Math.round((this.area_h - this.cursorHeight) * ratio);
			this.setCursorButton();
		};
	};

	this.setCursorButton = function() {
		// normal cursor Image
		this.cursorImage_normal = gdi.CreateImage(this.cursorWidth, this.cursorHeight);
		var gb = this.cursorImage_normal.GetGraphics();
		gb.FillSolidRect(this.cursorWidth - 4, 0, 4, this.cursorHeight, g_scroll_color);
		this.cursorImage_normal.ReleaseGraphics(gb);

		// hover cursor Image
		this.cursorImage_hover = gdi.CreateImage(this.cursorWidth, this.cursorHeight);
		gb = this.cursorImage_hover.GetGraphics();
		gb.FillSolidRect(0, 0, this.cursorWidth, this.cursorHeight, g_scroll_color);
		this.cursorImage_hover.ReleaseGraphics(gb);

		// down cursor Image
		this.cursorImage_down = gdi.CreateImage(this.cursorWidth, this.cursorHeight);
		gb = this.cursorImage_down.GetGraphics();
		gb.FillSolidRect(0, 0, this.cursorWidth, this.cursorHeight, g_scroll_color);
		this.cursorImage_down.ReleaseGraphics(gb);

		// create/refresh cursor Button in buttons array
		this.buttons = new button(this.cursorImage_normal, this.cursorImage_hover, this.cursorImage_down);
	};

	this.setSize = function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		// scrollbar area for the cursor (<=> scrollbar height minus up & down buttons height)
		this.area_y = y;
		this.area_h = h;
	};

	this.setOffsetFromCursorPos = function() {
		// calc ratio of the scroll cursor to calc the equivalent item for the full playlist (with gh)
		var ratio = (this.cursorPos - this.area_y) / (this.area_h - this.cursorHeight);
		// calc idx of the item (of the full playlist with gh) to display at top of the panel list (visible)
		var newOffset = Math.round((p.list.totalRows - p.list.totalRowVisible) * ratio);
		return newOffset;
	};

	this.cursorCheck = function(event, x, y) {
		this.ishover = (x >= this.x && x <= this.x + this.w && y >= this.cursorPos && y <= (this.cursorPos + this.cursorHeight));

		switch (event) {
		case "down":
			this.buttons && this.buttons.checkstate(event, x, y);
			if (this.ishover) {
				this.cursorClickX = x;
				this.cursorClickY = y;
				this.cursorDrag = true;
				this.cursorDragDelta = y - this.cursorPos;
				this.clicked = true;
			};
			break;
		case "up":
			this.buttons && this.buttons.checkstate(event, x, y);
			if (this.cursorDrag) {
				p.list.offset = this.setOffsetFromCursorPos();
				p.list.setItems(false);
				full_repaint();
			};
			this.cursorClickX = 0;
			this.cursorClickY = 0;
			this.cursorDrag = false;
			this.clicked = false;
			break;
		case "move":
			this.buttons && this.buttons.checkstate(event, x, y);
			if (this.cursorDrag) {
				this.cursorPos = y - this.cursorDragDelta;
				if (this.cursorPos + this.cursorHeight > this.area_y + this.area_h) {
					this.cursorPos = (this.area_y + this.area_h) - this.cursorHeight;
				};
				if (this.cursorPos < this.area_y) {
					this.cursorPos = this.area_y;
				};

				p.list.offset = this.setOffsetFromCursorPos();
				InfoPane.show = false;
				if (!g_mouse_wheel_timer) {
					g_mouse_wheel_timer = window.SetTimeout(function() {
						p.list.setItems(false);
						full_repaint();
						g_mouse_wheel_timer && window.ClearTimeout(g_mouse_wheel_timer);
						g_mouse_wheel_timer = false;
					}, 30);
				};
			};
			break;
		case "leave":
			this.buttons && this.buttons.checkstate(event, x, y);
			break;
		};
	};

	this.isHoverObject = function(x, y) {
		return (x >= this.x && x <= this.x + this.w && y > this.area_y && y < this.area_y + this.area_h);
	};

	this.check = function(event, x, y) {
		this.hover = this.isHoverObject(x, y);
		this.cursorCheck(event, x, y);
	};
	this.repaint = function() {
		window.RepaintRect(this.x, this.y, this.w, this.h);
	};
};

oScrollBar = function(id, object_name, x, y, w, h, total_items, item_height, offset, parent_object,/* show_buttons,*/ scroll_step, isbox) {
	this.id = id;
	this.objectName = object_name;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.total = total_items;
	this.itemHeight = item_height;
	this.offset = offset;
	this.parentObject = parent_object;
	this.cursorColor = RGB(105, 105, 105);
	this.buttons = null;
	this.scrollStep = scroll_step;

	this.parentRepaint = function() {
		eval(this.parentObject).repaint();
	};

	this.repaint = function() {
		window.RepaintRect(this.x, this.y, this.w, this.h);
	};

	this.setCursorButton = function() {
		// normal cursor Image
		this.cursorImage_normal = gdi.CreateImage(this.cursorWidth, this.cursorHeight);
		var gb = this.cursorImage_normal.GetGraphics();
		if(isbox) gb.FillSolidRect(0, 0, this.cursorWidth, this.cursorHeight, this.cursorColor);
		else gb.FillSolidRect(this.cursorWidth - 4, 0, 4, this.cursorHeight, this.cursorColor);
		this.cursorImage_normal.ReleaseGraphics(gb);

		// hover cursor Image
		this.cursorImage_hover = gdi.CreateImage(this.cursorWidth, this.cursorHeight);
		gb = this.cursorImage_hover.GetGraphics();
		gb.FillSolidRect(0, 0, this.cursorWidth, this.cursorHeight, this.cursorColor);
		this.cursorImage_hover.ReleaseGraphics(gb);

		// down cursor Image
		this.cursorImage_down = gdi.CreateImage(this.cursorWidth, this.cursorHeight);
		gb = this.cursorImage_down.GetGraphics();
		gb.FillSolidRect(0, 0, this.cursorWidth, this.cursorHeight, this.cursorColor);
		this.cursorImage_down.ReleaseGraphics(gb);

		// create/refresh cursor Button in buttons array
		this.buttons = new button(this.cursorImage_normal, this.cursorImage_hover, this.cursorImage_down);
	};

	this.setDefaultColors = function() {
		this.color_bg = g_color_normal_bg;
		this.color_txt = g_color_normal_txt;
		if (this.cursorHeight) this.setCursorButton();
	};
	this.setDefaultColors();

	this.setCustomColors = function(color_bg, color_txt) {
		this.color_bg = color_bg;
		this.color_txt = color_txt;
		if (this.cursorHeight) this.setCursorButton();
	};

	this.updateCursorPos = function(offset) {
		this.offset = offset;
		// calc cursor position and height / offset
		this.ratio1 = this.totalRowsFull / this.total;
		this.cursorWidth = this.w;
		this.cursorHeight = Math.round(this.ratio1 * this.cursorAreaHeight);
		if (this.cursorHeight < this.w - 2 || this.cursorHeight > p.list.h) this.cursorHeight = this.w - 2;
		if (this.cursorHeight < 25) this.cursorHeight = 25;
		if (this.cursorHeight > 120) this.cursorHeight = 120;
		var ratio2 = this.offset / (this.total - this.totalRowsFull);
		this.cursorY = this.cursorAreaY + Math.round((this.cursorAreaHeight - this.cursorHeight) * ratio2);
		this.setCursorButton();
	};

	this.reSet = function(total_items, item_height, offset) {
		this.total = total_items;
		this.itemHeight = item_height;
		this.offset = offset;
		this.totalRowsFull = Math.floor(this.h / this.itemHeight);
		this.totalRowsVisibles = Math.ceil(this.h / this.itemHeight);
		this.visible = (this.total > this.totalRowsFull);
		this.buttonHeight = 0;
		this.cursorAreaY = this.y;
		this.cursorAreaHeight = this.h;
		if (this.visible) this.updateCursorPos(this.offset);
	};
	this.reSet(this.total, this.itemHeight, this.offset);

	this.reSize = function(x, y, w, h, total_items, item_height, offset) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.total = total_items;
		this.itemHeight = item_height;
		this.offset = offset;
		this.reSet(this.total, this.itemHeight, this.offset);
	};

	this.drawXY = function(gr, x, y) {
		this.x = x;
		this.y = y;
		if (this.visible) {
			this.buttons.draw(gr, x, this.cursorY, 255);
		};
	};

	this.draw = function(gr) {
		if (this.visible) {
			this.buttons.draw(gr, this.x, this.cursorY, 255);
		};
	};


	this.getOffsetFromCursorPos = function() {
		// calc ratio of the scroll cursor to calc the equivalent item for the full playlist (with gh)
		var ratio = (this.cursorY - this.cursorAreaY) / (this.cursorAreaHeight - this.cursorHeight);
		// calc idx of the item (of the full list with gh) to display at top of the panel list (visible)
		var newOffset = Math.round((this.total - this.totalRowsFull) * ratio);
		return newOffset;
	};

	this.setCursorPosFromOffset = function() {
		return;
		this.cursorY = Math.round((this.y + this.buttonHeight) + this.offset * (this.cursorAreaHeight / this.total));
		if (this.cursorY + this.cursorHeight > this.cursorAreaY + this.cursorAreaHeight) {
			this.cursorY = (this.cursorAreaY + this.cursorAreaHeight) - this.cursorHeight;
		};
		if (this.cursorY < this.cursorAreaY) {
			this.cursorY = this.cursorAreaY;
		};
	};

	this.cursorCheck = function(event, x, y) {
		this.ishover = (x >= this.x && x <= this.x + this.w && y >= this.cursorY && y <= (this.cursorY + this.cursorHeight));

		if (!this.buttons) return;

		switch (event) {
		case "down":
			if (this.buttons.checkstate(event, x, y) == ButtonStates.down) {
				this.cursorClickX = x;
				this.cursorClickY = y;
				this.cursorDrag = true;
				this.cursorDragDelta = y - this.cursorY;
			};
			break;
		case "up":
			this.buttons.checkstate(event, x, y);
			if (this.cursorDrag) {
				eval(this.parentObject).offset = this.getOffsetFromCursorPos();
				this.setCursorPosFromOffset();
				this.parentRepaint();
			};
			this.cursorClickX = 0;
			this.cursorClickY = 0;
			this.cursorDrag = false;
			break;
		case "move":
			this.buttons.checkstate(event, x, y);
			if (this.cursorDrag) {
				this.cursorY = y - this.cursorDragDelta;
				if (this.cursorY + this.cursorHeight > this.cursorAreaY + this.cursorAreaHeight) {
					this.cursorY = (this.cursorAreaY + this.cursorAreaHeight) - this.cursorHeight;
				};
				if (this.cursorY < this.cursorAreaY) {
					this.cursorY = this.cursorAreaY;
				};
				this.offset = this.getOffsetFromCursorPos();
				eval(this.parentObject).offset = this.offset;

				if (!cScrollBar.timer_repaint) {
					cScrollBar.timer_repaint = window.SetTimeout(function() {
						//this.parentRepaint();
						full_repaint();
						window.ClearTimeout(cScrollBar.timer_repaint);
						cScrollBar.timer_repaint = false;
					}, 32);
				};
			};
			break;
		case "leave":
			this.buttons.checkstate(event, x, y);
			break;
		};
	};

	this.check = function(event, x, y, delta) {

		this.isHoverScrollbar = (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h);
		this.isHoverCursor = (x >= this.x && x <= this.x + this.w && y >= this.cursorY && y <= this.cursorY + this.cursorHeight);
		this.isHoverEmptyArea = (x >= this.x && x <= this.x + this.w && y >= this.y + this.buttonHeight && y <= this.cursorAreaY + this.cursorAreaHeight) && !this.isHoverCursor;
		if (!this.buttonClick) this.cursorCheck(event, x, y);
		if (!this.cursorDrag) {
			// click on empty scrollbar area to scroll page
			if (this.isHoverEmptyArea) {
				switch (event) {
				case "down":
				case "dblclk":
					switch (y < this.cursorY) {
					case true:
						// up
						this.offset = this.offset > this.totalRowsFull ? this.offset - this.totalRowsFull : 0;
						eval(this.parentObject).offset = this.offset;
						this.reSet(this.total, this.itemHeight, this.offset);
						this.parentRepaint();
						cScrollBar.obj = eval(this.objectName);
						if (!cScrollBar.timerID) {
							cScrollBar.timerID = window.SetInterval(function() {
								var obj = cScrollBar.obj;
								if (cScrollBar.timerCounter > 7 && mouse_y < obj.cursorY) {
									obj.offset = obj.offset > obj.totalRowsFull ? obj.offset - obj.totalRowsFull : 0;
									eval(obj.parentObject).offset = obj.offset;
									obj.reSet(obj.total, obj.itemHeight, obj.offset);
									obj.parentRepaint();
								}
								else {
									cScrollBar.timerCounter++;
								};
							}, 60);
						};
						break;
					case false:
						// down
						var max_offset = this.total - this.totalRowsFull;
						this.offset = (this.offset + this.totalRowsFull >= max_offset ? max_offset : this.offset + this.totalRowsFull);
						eval(this.parentObject).offset = this.offset;
						this.reSet(this.total, this.itemHeight, this.offset);
						this.parentRepaint();
						cScrollBar.obj = eval(this.objectName);
						if (!cScrollBar.timerID) {
							cScrollBar.timerID = window.SetInterval(function() {
								var obj = cScrollBar.obj;
								if (cScrollBar.timerCounter > 7 && mouse_y > obj.cursorY + obj.cursorHeight) {
									var max_offset = obj.total - obj.totalRowsFull;
									obj.offset = (obj.offset + obj.totalRowsFull >= max_offset ? max_offset : obj.offset + obj.totalRowsFull);
									eval(obj.parentObject).offset = obj.offset;
									obj.reSet(obj.total, obj.itemHeight, obj.offset);
									obj.parentRepaint();
								}
								else {
									cScrollBar.timerCounter++;
								};
							}, 60);
						};
						break;
					};
					break;
				};
			};

			// mouse wheel event
			if (event == "wheel") {
				if (delta > 0) {
					this.offset = this.offset > this.scrollStep ? this.offset - this.scrollStep : 0;
					eval(this.parentObject).offset = this.offset;
					this.reSet(this.total, this.itemHeight, this.offset);
					this.parentRepaint();
				}
				else {
					this.offset = (this.offset < (this.total - this.totalRowsFull - this.scrollStep) ? (this.offset + this.scrollStep) : (this.total - this.totalRowsFull));
					eval(this.parentObject).offset = this.offset;
					this.reSet(this.total, this.itemHeight, this.offset);
					this.parentRepaint();
				};
			};
		};
	};

	this.on_key = function(event, vkey) {
		switch (event) {
		case "down":
			switch (vkey) {
			case VK_DOWN:
				var max_offset = this.total - this.totalRowsFull;
				this.offset = (this.offset + 1 >= max_offset ? max_offset : this.offset + 1);
				eval(this.parentObject).offset = this.offset;
				this.updateCursorPos(this.offset);
				this.parentRepaint();
				cScrollBar.obj = eval(this.objectName);
				if (!cScrollBar.timerID) {
					cScrollBar.timerID = window.SetInterval(function() {
						if (cScrollBar.timerCounter > 7) {
							var obj = cScrollBar.obj;
							var max_offset = obj.total - obj.totalRowsFull;
							obj.offset = (obj.offset + 1 >= max_offset ? max_offset : obj.offset + 1);
							eval(obj.parentObject).offset = obj.offset;
							obj.updateCursorPos(obj.offset);
							obj.parentRepaint();
						}
						else {
							cScrollBar.timerCounter++;
						};
					}, 60);
				};
				break;
			case VK_UP:
				this.offset = this.offset > 0 ? this.offset - 1 : 0;
				eval(this.parentObject).offset = this.offset;
				this.updateCursorPos(this.offset);
				this.parentRepaint();
				cScrollBar.obj = eval(this.objectName);
				if (!cScrollBar.timerID) {
					cScrollBar.timerID = window.SetInterval(function() {
						if (cScrollBar.timerCounter > 7) {
							var obj = cScrollBar.obj;
							obj.offset = obj.offset > 0 ? obj.offset - 1 : 0;
							eval(obj.parentObject).offset = obj.offset;
							obj.updateCursorPos(obj.offset);
							obj.parentRepaint();
						}
						else {
							cScrollBar.timerCounter++;
						};
					}, 60);
				};
				break;
			};
			break;
		case "up":
			if (cScrollBar.timerID) {
				window.ClearInterval(cScrollBar.timerID);
				cScrollBar.timerID = false;
			};
			cScrollBar.timerCounter = 0;
			break;
		};
	};

	this.on_char = function(code) {

	};

	this.on_focus = function(is_focused) {

	};
};