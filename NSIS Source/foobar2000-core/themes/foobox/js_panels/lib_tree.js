// Name "Library Tree"
// Version "1.3.9.2"
// Author "Wilb, 汉化:alwaysbeta"
// mod for foobox http://blog.sina.com.cn/dream7180

var fbx_set = [];
window.NotifyOthers("get_fbx_set", fbx_set);
var zdpi = fbx_set[9];
var ui_mode = fbx_set[11];
var ui_noborder = fbx_set[19];
var show_shadow = fbx_set[28];
var GetWnd = utils.CreateWND(window.ID);
var fb_hWnd = GetWnd.GetAncestor(2);
var sys_scrollbar = fbx_set[29];

String.prototype.strip = function() {
	return this.replace(/[\.,\!\?\:;'\u2019"\-_\u2010\s+]/g, "").toLowerCase();
}
if (!String.prototype.trim) {
	String.prototype.trim = function() {
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	};
}

function userinterface() {
	var custom_col = window.GetProperty("_CUSTOM FONTS: USE", false),
		cust_icon_font = window.GetProperty("_Custom.Font Icon [Node] (Name,Style[0or1])", "Segoe UI Symbol,0"),
		icon = window.GetProperty(" Node: Custom Icon: +|- // Examples", "+|-//(+)|(−)").trim(),
		icon_f_name = "Segoe UI",
		icon_f_style = 0,
		iconcol_h = "",
		orig_font_sz = 16,
		sp = 6,
		sp1 = 6,
		sp2 = 6,
		node_sz = 11,
		zoom_font_sz = 16;
	this.b1 = 0x04ffffff;
	this.b2 = 0x04000000;
	this.backcol = "";
	this.backcol_h = "";
	this.backcolsel = "";
	this.collapse = "";
	this.expand = "";
	this.dui = window.InstanceType;
	this.font;
	this.framecol = "";
	this.h = 0;
	this.icon_font;
	this.icon_pad = window.GetProperty(" Node: Custom Icon: Vertical Padding", -2);
	this.icon_w = 17;
	this.iconcol_c = "";
	this.iconcol_e = "";
	this.iconcol_h = "";
	this.j_font;
	this.l_s1 = 4;
	this.l_s2 = 6;
	this.l_s3 = 7;
	this.linecol = "";
	this.row_h = 20;
	this.s_font;
	this.s_linecol = "";
	this.searchcol = "";
	this.sel = 3;
	this.textcol = "";
	this.textcol_h = "";
	this.textselcol = "";
	this.txt_box = "";
	this.w = 0;
	this.alternate = window.GetProperty(" Row Stripes", false);
	this.margin = window.GetProperty(" Margin", 5);
	this.node_sz = 11;
	this.trace = function(message) {
		var trace = true;
		if (trace) fb.trace("媒体库目录树: " + message);
	} // true enables fb.trace
	if (custom_col) {
		if (cust_icon_font.length) {
			cust_icon_font = cust_icon_font.split(",");
			try {
				var st = Math.round(parseFloat(cust_icon_font[1]));
				if (!st) st = 0;
				var font_test = GdiFont(cust_icon_font[0], 16, st);
				icon_f_name = cust_icon_font[0];
				icon_f_style = st;
			} catch (e) {
				this.trace("无法使用您的节点图标字体。将使用 Segoe UI 代替");
			}
		}
	}
	this.node_style = window.GetProperty(" Node: Custom (No Lines)", false) ? 0 : 1; ////!win_node ? 1 : 2;
	if (this.node_style > 1 || this.node_style < 0) this.node_style = 0;
	if (!this.node_style) {
		if (!icon.charAt(0).length) this.node_style = 1;
		else try {
			icon = icon.split("//");
			icon = icon[0].split("|");
			this.expand = icon[0].trim();
			this.collapse = icon[1].trim();
		} catch (e) {
			this.node_style = 1;
		}
	}
	if (!this.expand.length || !this.collapse.length) this.node_style = 1;
	this.hot = window.GetProperty(" Node: Hot Highlight", true);
	this.pad = window.GetProperty(" Tree Indent", 19);
	this.scrollbar_show = window.GetProperty(" Scrollbar Show", true);
	this.scrollbar_bt_show = window.GetProperty(" Scrollbar Buttons Show", false);
	this.scr_w = sys_scrollbar ? utils.GetSystemMetrics(2) : 12*zdpi;
	this.scr_but_w = this.scr_w;
	this.arrow_pad = 0;
	if (!this.scrollbar_show) this.scr_w = 0;
	this.but_h = this.scr_w;
	this.sbar_sp = this.scr_w ? this.scr_w : 0;
	this.arrow_pad = Math.min(Math.max(-this.but_h / 5, this.arrow_pad), this.but_h / 5);
	var R = function(c) {
			return c >> 16 & 0xff;
		};
	var G = function(c) {
			return c >> 8 & 0xff;
		};
	var B = function(c) {
			return c & 0xff;
		};
	var A = function(c) {
			return c >> 24 & 0xff;
		}
	var RGBAtoRGB = function(col, bg) {
			var r = R(col) / 255,
				g = G(col) / 255,
				b = B(col) / 255,
				a = A(col) / 255,
				bgr = R(bg) / 255,
				bgg = G(bg) / 255,
				bgb = B(bg) / 255,
				nR = ((1 - a) * bgr) + (a * r),
				nG = ((1 - a) * bgg) + (a * g),
				nB = ((1 - a) * bgb) + (a * b);
			nR = Math.max(Math.min(Math.round(nR * 255), 255), 0);
			nG = Math.max(Math.min(Math.round(nG * 255), 255), 0);
			nB = Math.max(Math.min(Math.round(nB * 255), 255), 0);
			return RGB(nR, nG, nB);
		}
	var get_blend = function(c1, c2, f) {
			var nf = 1 - f,
				r = (R(c1) * f + R(c2) * nf),
				g = (G(c1) * f + G(c2) * nf),
				b = (B(c1) * f + B(c2) * nf);
			return RGB(r, g, b);
		}
	var get_grad = function(c, f1, f2) {
			return [RGB(Math.min(R(c) + f1, 255), Math.min(G(c) + f1, 255), Math.min(B(c) + f1, 255)), RGB(Math.max(R(c) + f2, 0), Math.max(G(c) + f2, 0), Math.max(B(c) + f2, 0))];
		}
	var get_textselcol = function(c, n) {
			var cc = [R(c), G(c), B(c)];
			var ccc = [];
			for (var i = 0; i < cc.length; i++) {
				ccc[i] = cc[i] / 255;
				ccc[i] = ccc[i] <= 0.03928 ? ccc[i] / 12.92 : Math.pow(((ccc[i] + 0.055) / 1.055), 2.4);
			}
			var L = 0.2126 * ccc[0] + 0.7152 * ccc[1] + 0.0722 * ccc[2];
			if (L > 0.31) return n ? 50 : RGB(0, 0, 0);
			else return n ? 200 : RGB(255, 255, 255);
		}

	this.draw = function(gr) {
		gr.FillSolidRect(0, 0, this.w, this.h, this.backcol)
	}
	this.outline = function(c, but) {
		if (but) {
			if (window.IsTransparent || R(c) + G(c) + B(c) > 30) return RGBA(0, 0, 0, 36);
			else return RGBA(255, 255, 255, 36);
		} else if (R(c) + G(c) + B(c) > 255 * 1.5) return RGB(30, 30, 10);
		else return RGB(225, 225, 245);
	}
	this.reset_colors = function() {
		iconcol_h = "";
		this.backcol = "";
		this.backcol_h = "";
		this.backcolsel = "";
		this.framecol = "";
		this.iconcol_c = "";
		this.iconcol_e = "";
		this.iconcol_h = "";
		this.linecol = "";
		this.s_linecol = "";
		this.searchcol = "";
		this.textcol = "";
		this.textcol_h = "";
		this.textselcol = "";
		this.txt_box = "";
	}

	this.icon_col = function(c) {
		if(ui_mode < 3) this.iconcol_c = this.node_style ? [RGB(248, 248, 248), RGB(248, 248, 248)] : this.textcol;
		else this.iconcol_c = this.node_style ? [this.backcol, this.backcol] : this.textcol;
		if(ui_mode < 3) this.iconcol_e = this.node_style ? [RGB(248, 248, 248), RGB(248, 248, 248)] : this.textcol & 0xC0ffffff;
		else this.iconcol_e = this.node_style ? [this.backcol, this.backcol] : this.textcol;
		this.iconpluscol = get_textselcol(this.iconcol_e[0], true) == 50 ? RGB(41, 66, 114) : RGB(225, 225, 245);
		if (!this.hot) return;
		this.iconcol_h = this.node_style ? (R(this.textcol_h) + G(this.textcol_h) + B(this.textcol_h) < 650 ? this.textcol_h : this.textcol) : this.textcol_h;
		iconcol_h = this.iconcol_h
		if (this.node_style) {
			if (A(iconcol_h) != 255) {
				this.iconcol_h = RGBAtoRGB(iconcol_h, c ? c : this.backcol);
			} else if (iconcol_h !== "") this.iconcol_h = iconcol_h;
			this.iconcol_h = get_grad(this.iconcol_h, 15, -14);
		}
	}

	this.get_colors = function() {
		switch (ui_mode) {
		case (1):
			this.backcol = RGB(255,255,255);
			this.s_linecol = RGBA(0, 0, 0, 35);
			this.linecol = RGBA(0, 0, 0, 35);
			this.textcol = RGB(36, 36, 36);
			this.textcol_nottrack = RGB(80, 80, 80);
			this.textcol_h = RGB(25, 25, 25);
			this.textselcol = RGB(255, 255, 255);
			this.txt_c_track = RGB(140, 140, 140);
			this.scroll_color = fbx_set[0];
			this.topbar_color = this.textcol & 0x15ffffff;
			break;
		case (2):
			this.backcol = fbx_set[4];
			this.s_linecol = RGBA(0, 0, 0, 35);
			this.linecol = RGBA(0, 0, 0, 35);
			this.textcol = RGB(36, 36, 36);
			this.textcol_nottrack = RGB(80, 80, 80);
			this.textcol_h = RGB(25, 25, 25);
			this.textselcol = RGB(255, 255, 255);
			this.txt_c_track = RGB(140, 140, 140);
			this.scroll_color = fbx_set[0];
			this.topbar_color = this.textcol & 0x15ffffff;
			break;
		case (3):
			this.backcol = fbx_set[1];
			this.s_linecol = RGBA(0, 0, 0, 35);
			this.linecol = RGBA(255, 255, 255, 35);
			this.textcol = RGB(235, 235, 235);
			this.textcol_nottrack = RGB(185, 185, 185);
			this.textcol_h = RGB(255, 255, 255);
			this.textselcol = RGB(255, 255, 255);
			this.txt_c_track = RGB(130, 130, 130);
			this.scroll_color = fbx_set[5];
			this.topbar_color = this.textcol & 0x12ffffff;
			break;
		case (4):
			this.backcol = fbx_set[8];
			this.s_linecol = RGBA(0, 0, 0, 55);
			this.linecol = RGBA(255, 255, 255, 35);
			this.textcol = RGB(235, 235, 235);
			this.textcol_nottrack = RGB(185, 185, 185);
			this.textcol_h = RGB(255, 255, 255);
			this.textselcol = RGB(255, 255, 255);
			this.txt_c_track = RGB(120, 120, 120);
			this.scroll_color = fbx_set[5];
			this.topbar_color = this.textcol & 0x12ffffff;
			break;
		}
		this.backcol_h = fbx_set[7];
		this.backcolsel = fbx_set[6];
		this.framecol = fbx_set[6];
		this.searchcol = this.textcol;
		this.txt_box = this.textcol;
		this.textsymbcol = this.textcol;
		this.icon_col();
		this.ibeamcol = window.IsTransparent || !this.backcolsel ? 0xff0099ff : this.backcolsel != this.searchcol ? this.backcolsel : 0xff0099ff;
	}
	this.get_colors();

	this.get_font = function() {
		this.font = {
			Name: fbx_set[13],
			Size: fbx_set[14],
			Style: fbx_set[15]
		}
		orig_font_sz = this.font.Size;
		zoom_font_sz = Math.max(orig_font_sz, 1);
		this.node_sz = this.node_style ? node_sz : orig_font_sz;
		this.font = GdiFont(this.font.Name, zoom_font_sz, this.font.Style);
		this.s_font = GdiFont(this.font.Name, this.font.Size, 0);
		this.j_font = GdiFont(this.font.Name, this.font.Size * 1.5, 0);
		this.calc_text();
	}

	this.calc_text = function() {
		var i = gdi.CreateImage(1, 1),
			g = i.GetGraphics();
		this.row_h = Math.round(g.CalcTextHeight("String", this.font)) + window.GetProperty(" Row Vertical Item Padding", 3);
		if (this.node_style) {
			this.node_sz = Math.round(Math.max(Math.min(this.node_sz, this.row_h - 2), 7)*zdpi);
			if(this.node_sz % 2 == 0 ) this.node_sz = this.node_sz - 1;
			pop.create_images();
		} else {
			this.node_sz = Math.round(Math.max(Math.min(this.node_sz, this.row_h * 1.15), 7));
			this.icon_font = GdiFont(icon_f_name, this.node_sz, icon_f_style);
		}
		sp = Math.max(Math.round(g.CalcTextWidth(" ", this.font)), 4);
		sp1 = Math.max(Math.round(sp * 1.5), 6);
		if (!this.node_style) {
			var sp_e = g.MeasureString(this.expand, this.icon_font, 0, 0, 500, 500).Width;
			var sp_c = g.MeasureString(this.collapse, this.icon_font, 0, 0, 500, 500).Width;
			sp2 = Math.round(Math.max(sp_e, sp_c) + sp / 3);
		}
		this.l_s1 = Math.max(sp1 / 2, 4);
		this.l_s2 = Math.ceil(this.node_sz / 2);
		this.l_s3 = Math.max(7, this.node_sz / 2)
		this.icon_w = this.node_style ? this.node_sz + sp1 : sp + sp2;
		this.sel = (this.node_style ? sp1 : sp + Math.round(sp / 3)) / 2;
		this.tt = this.node_style ? -Math.ceil(sp1 / 2 - 3) + sp1 : sp;
		i.ReleaseGraphics(g);
		i.Dispose();
	}
}
var ui = new userinterface();

function scrollbar() {
	var smoothness = 1 - window.GetProperty("ADV.Scroll: Smooth Scroll Level 0-1", 0.6561);
	smoothness = Math.max(Math.min(smoothness, 0.99), 0.01);
	this.count = -1;
	this.draw_timer = false;
	this.hover = false;
	this.s1 = 0;
	this.s2 = 0;
	this.scroll_page = window.GetProperty(" Scroll - Mouse Wheel: Page Scroll", false);
	this.scroll_step = window.GetProperty(" Scroll - Mouse Wheel Step", 6);
	this.smooth = window.GetProperty(" Scroll: Smooth Scroll", true);
	this.timer_but = false;
	this.x = 0;
	this.y = 0;
	this.w = 0;
	this.h = 0;
	this.bar_ht = 0;
	this.but_h = 0;
	this.bar_y = 0;
	this.row_count = 0;
	this.scroll = 0;
	this.delta = 0;
	this.ratio = 1;
	this.rows_drawn = 0;
	this.row_h = 0;
	this.scrollbar_height = 0;
	this.scrollable_lines = 0;
	this.scrollbar_travel = 0;
	this.stripe_w = 0;
	this.tree_w = 0;
	this.b_is_dragging = false;
	this.drag_distance_per_row;
	this.initial_drag_y = 0; // dragging
	this.leave = function() {
		if (this.b_is_dragging) return;
		this.hover = false;
		this.hover_o = false;
		window.RepaintRect(this.x, this.y, this.w, this.h);
	}
	this.nearest = function(y) {
		y = (y - this.but_h) / this.scrollbar_height * this.scrollable_lines * this.row_h;
		y = y / this.row_h;
		y = Math.round(y) * this.row_h;
		return y;
	}
	this.reset = function() {
		this.delta = this.scroll = this.s1 = this.s2 = 0;
		this.metrics(this.x, this.y, this.w, this.h, this.rows_drawn, this.row_h);
	}
	this.scroll_timer = function() {
		var that = this;
		this.draw_timer = window.SetInterval(function() {
			if (ui.w < 1 || !window.IsVisible) return;
			that.smooth_scroll();
		}, 16);
	}
	this.set_rows = function(row_count) {
		this.row_count = row_count;
		this.metrics(this.x, this.y, this.w, this.h, this.rows_drawn, this.row_h);
	}
	this.wheel = function(step, pgkey) {
		this.check_scroll(this.scroll + step * -(this.scroll_page || pgkey ? this.rows_drawn : this.scroll_step) * this.row_h);
	}

	this.metrics = function(x, y, w, h, rows_drawn, row_h) {
		this.x = x;
		this.y = Math.round(y);
		this.w = w;
		this.h = h;
		this.rows_drawn = rows_drawn;
		if (!p.autofit) this.rows_drawn = Math.floor(this.rows_drawn);
		this.row_h = row_h;
		this.but_h = ui.scrollbar_bt_show ? ui.scr_w : 0;
		var cursor_max = sys_scrollbar ? 120 * zdpi : 105 *zdpi;
		// draw info
		this.scrollbar_height = Math.round(this.h - this.but_h * 2);
		this.bar_ht = Math.max(Math.round(this.scrollbar_height * this.rows_drawn / this.row_count), 20);
		if (this.bar_ht > cursor_max) this.bar_ht = cursor_max;
		this.scrollbar_travel = this.scrollbar_height - this.bar_ht;
		// scrolling info
		this.scrollable_lines = this.row_count - this.rows_drawn;
		this.ratio = this.row_count / this.scrollable_lines;
		this.bar_y = this.but_h + this.scrollbar_travel * (this.delta * this.ratio) / (this.row_count * this.row_h);
		this.bar_y = Math.min(this.bar_y, this.h - this.bar_ht);
		this.drag_distance_per_row = this.scrollbar_travel / this.scrollable_lines;
		// panel info
		this.tree_w = ui.w - Math.max(ui.scrollbar_show && this.scrollable_lines > 0 ? ui.sbar_sp + ui.sel : ui.sel, ui.margin);
		if (ui.alternate) this.stripe_w = ui.scrollbar_show && this.scrollable_lines > 0 ? ui.w - ui.sbar_sp : ui.w;
	}

	this.draw = function(gr) {
		if (this.scrollable_lines > 0) {
			try {
				if (!this.hover && !this.b_is_dragging) gr.FillSolidRect(window.width - 4, this.y + this.bar_y, 4, this.bar_ht, ui.scroll_color);
				else gr.FillSolidRect(this.x, this.y + this.bar_y, this.w, this.bar_ht, ui.scroll_color);
			} catch (e) {}

		}
	}

	this.lbtn_up = function(p_x, p_y) {
		var x = p_x - this.x;
		var y = p_y - this.y;
		if (this.b_is_dragging) this.b_is_dragging = false;
		window.RepaintRect(this.x, this.y, this.w, this.h);
		this.initial_drag_y = 0;
		if (this.timer_but) {
			window.ClearTimeout(this.timer_but);
			this.timer_but = false;
		};
		this.count = -1;
	}

	this.lbtn_dn = function(p_x, p_y) {
		var x = p_x - this.x;
		var y = p_y - this.y;
		if (x < 0 || x > this.w || y < 0 || y > this.h || this.row_count <= this.rows_drawn) return;
		if (y < this.but_h || y > this.h - this.but_h) return;
		if (y < this.bar_y) var dir = 1; // above bar
		else if (y > this.bar_y + this.bar_ht) var dir = -1; // below bar
		if (y < this.bar_y || y > this.bar_y + this.bar_ht) this.check_scroll(this.nearest(y));
		else { // on bar
			this.b_is_dragging = true;
			window.RepaintRect(this.x, this.y, this.w, this.h);
			this.initial_drag_y = y - this.bar_y;
		}
	}

	this.move = function(p_x, p_y) {
		var x = p_x - this.x;
		var y = p_y - this.y;
		if (x < 0 || x > this.w || y > this.bar_y + this.bar_ht || y < this.bar_y) this.hover = false;
		else this.hover = true;
		if (this.hover != this.hover_o) window.RepaintRect(this.x, this.y, this.w, this.h);
		this.hover_o = this.hover;
		if (uiHacks && ui_noborder && !fb_hWnd.IsMaximized()) {
			if (this.hover || sbar.b_is_dragging) UIHacks.DisableSizing = true;
			else UIHacks.DisableSizing = false;
		}
		if (!this.b_is_dragging || this.row_count <= this.rows_drawn) return;
		this.check_scroll(Math.round((y - this.initial_drag_y - this.but_h) / this.drag_distance_per_row) * this.row_h);
	}

	this.check_scroll = function(new_scroll) {
		var s = Math.max(0, Math.min(new_scroll, this.scrollable_lines * this.row_h));
		if (s == this.scroll) return;
		this.scroll = s;
		if (this.smooth) {
			if (!this.draw_timer) this.scroll_timer();
		}
		if (!this.smooth) {
			this.delta = this.scroll;
			this.bar_y = this.but_h + this.scrollbar_travel * (this.delta * this.ratio) / (this.row_count * this.row_h);
			p.tree_paint();
		}
	}

	this.smooth_scroll = function() {
		if (this.delta <= 0.5) {
			this.delta = 0;
			this.bar_y = this.but_h + this.scrollbar_travel * (this.delta * this.ratio) / (this.row_count * this.row_h);
			p.tree_paint();
		}
		if (Math.abs(this.scroll - this.delta) > 0.5) {
			this.s1 += (this.scroll - this.s1) * smoothness;
			this.s2 += (this.s1 - this.s2) * smoothness;
			this.delta += (this.s2 - this.delta) * smoothness;
			this.bar_y = this.but_h + this.scrollbar_travel * (this.delta * this.ratio) / (this.row_count * this.row_h);
			p.tree_paint();
		} else if (this.draw_timer) {
			window.ClearTimeout(this.draw_timer);
			this.draw_timer = false;
		}
	}

	this.but = function(dir) {
		this.check_scroll(this.scroll + (dir * -this.row_h));
		if (!this.timer_but) {
			var that = this;
			this.timer_but = window.SetInterval(function() {
				if (that.count > 6) {
					that.check_scroll(that.scroll + (dir * -that.row_h));
				} else that.count++;
			}, 40);
		}
	}
}
var sbar = new scrollbar();

function panel_operations() {
	var def_ppt = window.GetProperty(" View by Folder Structure: Name // Pattern", "按文件夹结构 // 无需配置模版");
	var DT_LEFT = 0x00000000,
		DT_CENTER = 0x00000001,
		DT_RIGHT = 0x00000002,
		DT_VCENTER = 0x00000004,
		DT_SINGLELINE = 0x00000020,
		DT_CALCRECT = 0x00000400,
		DT_NOPREFIX = 0x00000800,
		DT_END_ELLIPSIS = 0x00008000,
		grps = [],
		i = 0,
		sort = "";
	var view_ppt = [
		window.GetProperty(" View 01: Name // Pattern", "按艺术家 // %artist%|%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%"), 
		window.GetProperty(" View 02: Name // Pattern", "按专辑艺术家 // %album artist%|%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%"), 
		window.GetProperty(" View 03: Name // Pattern", "按艺术家(简单) // %artist%|%title%"), 
		window.GetProperty(" View 04: Name // Pattern", "按专辑艺术家 - 专辑 // [%album artist% - ]%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%"), 
		window.GetProperty(" View 05: Name // Pattern", "按专辑[专辑艺术家] // %album%[ '['%album artist%']']|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%"), 
		window.GetProperty(" View 06: Name // Pattern", "按专辑 // %album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%"), 
		window.GetProperty(" View 07: Name // Pattern", "按流派 // %<genre>%|[%album artist% - ]%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%"), 
		window.GetProperty(" View 08: Name // Pattern", "按年份 // $year($replace(%date%,/,-,.,-))|[%album artist% - ]%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%"), 
		window.GetProperty(" View 09: Name // Pattern", "按日期 // %date%|[%album artist% - ]%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%"), 
		window.GetProperty(" View 10: Name // Pattern", "按目录名称 // %directory%|[%album artist% - ]%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%")];
	var nm = "",
		ppt_l = view_ppt.length + 1;
	for (i = ppt_l; i < ppt_l + 93; i++) {
		nm = window.GetProperty(" View " + (i < 10 ? "0" + i : i) + ": Name // Pattern");
		if (nm && nm != " // ") view_ppt.push(window.GetProperty(" View " + (i < 10 ? "0" + i : i) + ": Name // Pattern"));
	}
	if (!window.GetProperty("SYSTEM.View Update", false)) {
		i = view_ppt.length + 1;
		window.SetProperty(" View " + (i < 10 ? "0" + i : i) + ": Name // Pattern", null);
		view_ppt.push(window.GetProperty(" View " + (i < 10 ? "0" + i : i) + ": Name // Pattern", "按文件路径 // $directory_path(%path%)|%filename_ext%"));
		window.SetProperty("SYSTEM.View Update", true);
	}
	var filter_ppt = [
	window.GetProperty(" View Filter 01: Name // Query", "过滤 // Query Not Configurable"),
		window.GetProperty(" View Filter 02: Name // Query", "无损 // \"$info(encoding)\" IS lossless"),
		window.GetProperty(" View Filter 03: Name // Query", "有损 // \"$info(encoding)\" IS lossy"),
		window.GetProperty(" View Filter 04: Name // Query", "无增益 // %replaygain_track_gain% MISSING"),
		window.GetProperty(" View Filter 05: Name // Query", "从未播放 // %play_count% MISSING"),
		window.GetProperty(" View Filter 06: Name // Query", "经常播放 // %play_count% GREATER 9"),
		window.GetProperty(" View Filter 07: Name // Query", "最近添加 // %added% DURING LAST 2 WEEKS"),
		window.GetProperty(" View Filter 08: Name // Query", "最近播放 // %last_played% DURING LAST 2 WEEKS"),
		window.GetProperty(" View Filter 09: Name // Query", "最高评级 // %rating% IS 5")];
	var filt_l = filter_ppt.length + 1;
	for (i = filt_l; i < filt_l + 90; i++) {
		nm = window.GetProperty(" View Filter " + (i < 10 ? "0" + i : i) + ": Name // Query");
		if (nm && nm != " // ") filter_ppt.push(window.GetProperty(" View Filter " + (i < 10 ? "0" + i : i) + ": Name // Query"));
	}

	this.cc = DT_CENTER | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX;
	this.l = DT_LEFT | DT_VCENTER | DT_SINGLELINE | DT_CALCRECT | DT_NOPREFIX;
	this.lc = DT_VCENTER | DT_CALCRECT | DT_NOPREFIX | DT_END_ELLIPSIS;
	this.rc = DT_RIGHT | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX;
	this.s_lc = StringFormat(0, 1)
	this.f_w = [];
	this.f_h = 0;
	this.f_x1 = 0;
	this.filt = [];
	this.folder_view = 10;
	this.grp = [];
	this.grp_sort = "";
	this.grp_split = [];
	this.grp_split_clone = [];
	this.grp_split_orig = [];
	this.f_menu = [];
	this.menu = [];
	this.multi_value = [];
	this.m_x = 0;
	this.m_y = 0;
	this.pos = -1;
	this.s_cursor = false;
	this.s_search = false;
	this.s_txt = "";
	this.s_x = 0;
	this.s_h = 0;
	this.s_w1 = 0;
	this.s_w2 = 0;
	this.statistics = false;
	this.tf = "";
	this.autofit = window.GetProperty(" Auto Fit", true);
	this.base = window.GetProperty(" Node: Root Hide-0 All Music-1 View Name-2", 2);
	this.base = Math.max(Math.min(this.base, 2), 0);
	this.syncType = window.GetProperty(" Library Sync: Auto-0, Initialisation Only-1", 0);
	this.s_show = window.GetProperty(" Search: Hide-0, SearchOnly-1, Search+Filter-2", 2);
	if (!this.s_show) this.autofit = true;
	this.filter_by = window.GetProperty("SYSTEM.Filter By", 0);
	this.full_line = window.GetProperty(" Text Whole Line Clickable", false);
	this.get_font = function() {
		this.f_font = GdiFont(fbx_set[13], fbx_set[14], 1);
		this.f_but_ft = GdiFont(fbx_set[13], fbx_set[14] - 2, fbx_set[15]);
	}
	this.get_font();
	this.reset = window.GetProperty("SYSTEM.Reset Tree", false);
	this.search_paint = function() {
		window.RepaintRect(Math.round(ui.margin), 0, ui.w - ui.margin, this.s_h);
	}
	this.set_statistics_mode = function() {
		this.statistics = false;
		var chk = this.grp[this.view_by].name + this.grp[this.view_by].type + this.filt[this.filter_by].name + this.filt[this.filter_by].type;
		chk = chk.toUpperCase();
		if (chk.indexOf("ADD") != -1 || chk.indexOf("PLAY") != -1 || chk.indexOf("RATING") != -1) this.statistics = true;
	}
	this.show_counts = window.GetProperty(" Node: Item Counts 0-Hide 1-Tracks 2-Sub-Items", 1);
	this.show_tracks = window.GetProperty(" Node: Show Tracks", true);
	this.sort = function(li) {
		switch (this.view_by) {
		case this.folder_view:
			//li.OrderByPath();
			li.OrderByRelativePath();
			break;
		default:
			var tfo = fb.TitleFormat(this.grp_sort);
			li.OrderByFormat(tfo, 1);
			tfo.Dispose();
			break;
		}
	}
	var paint_y = Math.floor(this.s_show || !ui.scrollbar_show ? this.s_h : 0);
	this.tree_paint = function() {
		window.RepaintRect(0, paint_y, ui.w, ui.h - paint_y + 1);
	}
	this.view_by = window.GetProperty("SYSTEM.View By", 1);
	this.calc_text = function() {
		this.f_w = [];
		var im = gdi.CreateImage(1, 1),
			g = im.GetGraphics();
		for (i = 0; i < this.filt.length; i++) {
			this.f_w[i] = g.CalcTextWidth(this.filt[i].name, this.f_font);
			if (!i) this.f_h = g.CalcTextHeight("String", this.f_font);
		}
		this.f_sw = g.CalcTextWidth("   ▼", this.f_but_ft);
		this.f_x1 = ui.w - ui.margin - this.f_w[this.filter_by] - this.f_sw;
		this.s_w2 = this.s_show > 1 ? this.f_x1 - this.s_x - 11 : this.s_w1 - Math.round(ui.row_h * 0.75) - this.s_x + 1;
		im.ReleaseGraphics(g);
		im.Dispose();
	}

	this.fields = function(view, filter) {
		this.filt = [];
		this.folder_view = 10;
		this.grp = [];
		this.grp_sort = "";
		this.multi_process = false;
		this.filter_by = filter;
		this.mv_sort = "";
		this.view = "";
		this.view_by = view;
		for (i = 0; i < view_ppt.length; i++) {
			if (view_ppt[i].indexOf("//") != -1) {
				grps = view_ppt[i].split("//");
				this.grp[i] = {
					name: grps[0].trim(),
					type: grps[1]
				}
			}
		}
		grps = [];
		for (i = 0; i < filter_ppt.length; i++) {
			if (filter_ppt[i].indexOf("//") != -1) {
				grps = filter_ppt[i].split("//");
				this.filt[i] = {
					name: grps[0].trim(),
					type: grps[1].trim()
				}
			}
		}
		i = this.grp.length;
		while (i--) if (!this.grp[i] || this.grp[i].name == "" || this.grp[i].type == "") this.grp.splice(i, 1);
		i = this.filt.length;
		while (i--) if (!this.filt[i] || this.filt[i].name == "" || this.filt[i].type == "") this.filt.splice(i, 1);
		this.grp[this.grp.length] = {
			name: def_ppt.split("//")[0].trim(),
			type: ""
		}
		this.folder_view = this.grp.length - 1;
		this.filter_by = Math.min(this.filter_by, this.filt.length - 1);
		this.view_by = Math.min(this.view_by, this.grp.length - 1);
		if (this.grp[this.view_by].type.indexOf("%<") != -1) this.multi_process = true;
		this.cond = false;
		this.unbranched = false;
		if (this.view_by != this.folder_view) {
			if (this.multi_process) this.mv_sort = (this.grp[this.view_by].type.indexOf("album artist") != -1 || this.grp[this.view_by].type.indexOf("%artist%") == -1 && this.grp[this.view_by].type.indexOf("%<artist>%") == -1 && this.grp[this.view_by].type.indexOf("$meta(artist") == -1 ? "%album artist%" : "%artist%") + "|%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%";
			this.grp_split = this.grp[this.view_by].type.replace(/^\s+/, "").split("|");
			var chkCond = this.grp[this.view_by].type.replace(/[^\[\]\(\)\|]/g, '').replace(/\(\)/g, "").replace(/\[\]/g, "");
			if (chkCond.indexOf("(|") != -1 || chkCond.indexOf("[|") != -1 || this.show_counts == 2) this.cond = true;
			var count = (this.grp[this.view_by].type.match(/\|/g) || []).length;
			if (!count && !this.cond) this.unbranched = true;
			if (!this.cond) this.tf = this.grp_split.length > 1 ? this.grp_split.pop() : this.grp_split[0];
			for (i = 0; i < this.grp_split.length; i++) {
				this.multi_value[i] = this.grp_split[i].indexOf("%<") != -1 ? true : false;
				if (this.multi_value[i]) {
					this.grp_split_orig[i] = this.grp_split[i].slice();
					this.grp_split[i] = this.grp_split[i].replace(/%<album artist>%/i, "$if3(%<#album artist#>%,%<#artist#>%,%<#composer#>%,%<#performer#>%)").replace(/%<album>%/i, "$if2(%<#album#>%,%<#venue#>%)").replace(/%<artist>%/i, "$if3(%<artist>%,%<album artist>%,%<composer>%,%<performer>%)").replace(/<#/g, "<").replace(/#>/g, ">");
					this.grp_split_clone[i] = this.grp_split[i].slice();
					this.grp_split[i] = this.grp_split_orig[i].replace(/[<>]/g, "");
				}
				this.grp_sort += (this.grp_split[i] + "|");
				if (this.multi_value[i]) this.grp_split[i] = this.grp_split_clone[i].replace(/%</g, "#!#$meta_sep(").replace(/>%/g, "," + "@@)#!#");
				this.view += (this.grp_split[i] + "|");
			}
			this.view = this.view.slice(0, -1);
			if (!this.cond) {
				if (this.tf.indexOf("%<") != -1) this.tf = this.tf.replace(/%<album artist>%/i, "$if3(%<#album artist#>%,%<#artist#>%,%<#composer#>%,%<#performer#>%)").replace(/%<album>%/i, "$if2(%<#album#>%,%<#venue#>%)").replace(/%<artist>%/i, "$if3(%<artist>%,%<album artist>%,%<composer>%,%<performer>%)").replace(/<#/g, "<").replace(/#>/g, ">");
				this.grp_sort = this.grp_sort + this.tf.replace(/[<>]/g, "");
				if (this.tf.indexOf("%<") != -1) this.tf = this.tf.replace(/%</g, "#!#$meta_sep(").replace(/>%/g, "," + "@@)#!#");
			}
		}
		this.set_statistics_mode();
		window.SetProperty("SYSTEM.Filter By", filter);
		window.SetProperty("SYSTEM.View By", view);
		this.baseName = this.base == 2 ? this.grp[view].name : "所有音乐";
		this.f_menu = [];
		this.menu = [];
		for (i = 0; i < this.grp.length; i++) this.menu.push(this.grp[i].name);
		for (i = 0; i < this.filt.length; i++) {
			this.f_menu.push(this.filt[i].name);
		}
		//this.menu.splice(this.menu.length, 0, "面板属性");
		//if (this.syncType) this.menu.splice(this.menu.length, 0, "刷新");
		//this.menu.splice(this.menu.length, 0, "配置...");
		this.calc_text();
	}
	this.fields(this.view_by, this.filter_by);

	var k = 1;
	for (i = 0; i < 100; i++) {
		nm = window.GetProperty(" View " + (i < 10 ? "0" + i : i) + ": Name // Pattern");
		if (nm && nm != " // ") {
			window.SetProperty(" View " + (k < 10 ? "0" + k : k) + ": Name // Pattern", nm);
			k += 1
		} else window.SetProperty(" View " + (i < 10 ? "0" + i : i) + ": Name // Pattern", null);
	}
	for (i = k; i < k + 5; i++) window.SetProperty(" View " + (i < 10 ? "0" + i : i) + ": Name // Pattern", " // ");
	k = 1;
	for (i = 0; i < 100; i++) {
		nm = window.GetProperty(" View Filter " + (i < 10 ? "0" + i : i) + ": Name // Query");
		if (nm && nm != " // ") {
			window.SetProperty(" View Filter " + (k < 10 ? "0" + k : k) + ": Name // Query", nm);
			k += 1
		} else window.SetProperty(" View Filter " + (i < 10 ? "0" + i : i) + ": Name // Query", null);
	}
	for (i = k; i < k + 5; i++) window.SetProperty(" View Filter " + (i < 10 ? "0" + i : i) + ": Name // Query", " // ");

	this.on_size = function() {
		this.f_x1 = ui.w - ui.margin - this.f_w[this.filter_by] - this.f_sw;
		this.s_x = Math.round(ui.margin + ui.row_h);
		this.s_w1 = ui.w - ui.margin;
		this.s_w2 = this.s_show > 1 ? this.f_x1 - this.s_x - 11 : this.s_w1 - Math.round(ui.row_h * 0.75) - this.s_x + 1;
		var g_zoom = Math.floor(ui.font.Size / 12 * 100);
		this.s_sp = Math.ceil(26 * g_zoom / 100);
		this.s_h = this.s_show ? this.s_sp + ui.margin : ui.margin;
		this.sp = ui.h - this.s_h - (this.s_show ? 0 : ui.margin);
		this.rows = this.sp / ui.row_h;
		if (this.autofit) {
			this.rows = Math.floor(this.rows);
			this.sp = ui.row_h * this.rows;
		}
		this.node_y = Math.round((ui.row_h - ui.node_sz) / 1.75);
		var sbar_top = 3;
		this.sbar_x = ui.w - ui.sbar_sp;
		var bot_corr = 3;
		var sbar_y = (this.s_show ? this.s_sp + 1 : 0) + sbar_top;
		var sbar_h = ui.h - sbar_y - bot_corr;
		sbar.metrics(this.sbar_x, sbar_y, ui.scr_w, sbar_h, this.rows, ui.row_h);
	}
}
var p = new panel_operations();
window.DlgCode = 0x004;

function v_keys() {
	this.selAll = 1;
	this.copy = 3;
	this.back = 8;
	this.enter = 13;
	this.shift = 16;
	this.paste = 22;
	this.cut = 24;
	this.redo = 25;
	this.undo = 26;
	this.pgUp = 33;
	this.pgDn = 34;
	this.end = 35;
	this.home = 36;
	this.left = 37;
	this.up = 38;
	this.right = 39;
	this.dn = 40;
	this.del = 46;
	this.k = function(n) {
		switch (n) {
		case 0:
			return utils.IsKeyPressed(0x10);
			break;
		case 1:
			return utils.IsKeyPressed(0x11);
			break;
		case 2:
			return utils.IsKeyPressed(0x12);
			break;
		case 3:
			return utils.IsKeyPressed(0x11) && utils.IsKeyPressed(0x12);
			break;
		}
	}
}
var v = new v_keys();

function library_manager() {
	var exp = [],
		lib_update = false,
		name_idx = [],
		name_ix = [],
		node = [],
		node_s = [],
		process = false,
		scr = [],
		sel = [];
	this.allmusic = [];
	this.init = true;
	this.list;
	this.none = "";
	this.node = [];
	this.root = [];
	this.time = fb.CreateProfiler();
	this.upd = false, this.upd_search = false;
	var tr_sort = function(data) {
			data.sort(function(a, b) {
				return parseFloat(a.tr) - parseFloat(b.tr)
			});
			return data;
		}
	this.update = function() {
		if (ui.w < 1 || !window.IsVisible) this.upd = true;
		else {
			this.refresh();
			this.upd = false;
		}
	}

	this.refresh = function(b) {
		if (sbar.draw_timer) return;
		if (this.upd) {
			p.search_paint();
			p.tree_paint();
		}
		try {
			var ix = -1,
				tr = 0;
			process = false;
			if (pop.tree.length && (!b || b && !p.reset)) {
				tr = 0;
				process = true;
				scr = [];
				sel = [];
				for (var i = 0; i < pop.tree.length; i++) {
					tr = !p.base ? pop.tree[i].tr : pop.tree[i].tr - 1;
					if (pop.tree[i].child.length) exp.push({
						tr: tr,
						a: tr < 1 ? pop.tree[i].name : pop.tree[pop.tree[i].par].name,
						b: tr < 1 ? "" : pop.tree[i].name
					});
					tr = pop.tree[i].tr;
					if (pop.tree[i].sel == true) sel.push({
						tr: tr,
						a: pop.tree[i].name,
						b: tr != 0 ? pop.tree[pop.tree[i].par].name : "",
						c: tr > 1 ? pop.tree[pop.tree[pop.tree[i].par].par].name : ""
					});
				}
				ix = pop.get_ix(0, p.s_h + ui.row_h / 2, true, false);
				tr = 0;
				var l = Math.min(Math.floor(p.rows), pop.tree.length);
				for (var i = ix; i < l; i++) {
					tr = pop.tree[i].tr;
					scr.push({
						tr: tr,
						a: pop.tree[i].name,
						b: tr != 0 ? pop.tree[pop.tree[i].par].name : "",
						c: tr > 1 ? pop.tree[pop.tree[pop.tree[i].par].par].name : ""
					})
				}
				exp = JSON.stringify(tr_sort(exp));
			}
		} catch (e) {}
		lib_update = true;
		this.get_library();
		this.rootNodes();
	}

	this.get_library = function() {
		this.empty = "";
		if (this.list) this.list.Dispose();
		if (p.list) p.list.Dispose();
		this.time.Reset();
		this.none = "";
		this.list = fb.GetLibraryItems();
		if (!this.list.Count || !fb.IsMediaLibraryEnabled()) {
			pop.tree = [];
			pop.line_l = 0;
			sbar.set_rows(0);
			this.empty = "没有可以显示的项目\n\n请先配置好媒体库\n\n文件>参数选项>媒体库";
			p.tree_paint();
			return;
		}
		if (p.filter_by > 0 && p.s_show > 1) try {
			this.list = fb.GetQueryItems(this.list, p.filt[p.filter_by].type)
		} catch (e) {};
		if (!this.list.Count) {
			pop.tree = [];
			pop.line_l = 0;
			sbar.set_rows(0);
			this.none = "没有与搜索条件匹配的项";
			p.tree_paint();
			return;
		}
		this.rootNames("", 0);
	}

	this.rootNames = function(li, search) {
		var i = 0,
			tf = fb.TitleFormat(p.view),
			total;
		switch (search) {
		case 0:
			p.sort(this.list);
			li = p.list = this.list;
			name_idx = [];
			break;
		case 1:
			name_ix = [];
			break;
		}
		total = li.Count;
		var tree_type = !search ? p.view_by != p.folder_view ? !p.base ? 0 : 1 : !p.base ? 2 : 3 : p.view_by != p.folder_view ? !p.base ? 4 : 5 : !p.base ? 6 : 7;
		switch (tree_type) {
		case 0:
			for (i = 0; i < total; i++) {
				node[i] = tf.EvalWithMetadb(li.Item(i)).split("|");
				name_idx[i] = !node[i][0].length || node[i][0] == "#!##!#" ? "?" : node[i][0];
			};
			break;
		case 1:
			for (i = 0; i < total; i++) {
				node[i] = tf.EvalWithMetadb(li.Item(i)).split("|");
			};
			break;
		case 2:
			for (i = 0; i < total; i++) {
				node[i] = fb.GetLibraryRelativePath(li.Item(i)).split("\\");
				name_idx[i] = node[i][0];
			};
			break;
		case 3:
			for (i = 0; i < total; i++) {
				node[i] = fb.GetLibraryRelativePath(li.Item(i)).split("\\");
			};
			break;
		case 4:
			for (i = 0; i < total; i++) {
				node_s[i] = tf.EvalWithMetadb(li.Item(i)).split("|");
				name_ix[i] = !node_s[i][0].length || node_s[i][0] == "#!##!#" ? "?" : node_s[i][0];
			};
			break;
		case 5:
			for (i = 0; i < total; i++) {
				node_s[i] = tf.EvalWithMetadb(li.Item(i)).split("|");
			};
			break;
		case 6:
			for (i = 0; i < total; i++) {
				node_s[i] = fb.GetLibraryRelativePath(li.Item(i)).split("\\");
				name_ix[i] = node_s[i][0];
			};
			break;
		case 7:
			for (i = 0; i < total; i++) {
				node_s[i] = fb.GetLibraryRelativePath(li.Item(i)).split("\\");
			};
			break;
		}
	}

	this.rootNodes = function() {
		this.root = [];
		var i = 0,
			j = 1,
			h = 0,
			l = 0,
			n = "";
		if (p.s_txt && (this.upd_search || lib_update)) {
			if (!this.list.Count) return;
			this.none = "";
			try {
				p.list = fb.GetQueryItems(this.list, p.s_txt)
			} catch (e) {};
			if (!p.list.Count) {
				pop.tree = [];
				pop.line_l = 0;
				sbar.set_rows(0);
				this.none = "没有与搜索条件匹配的项";
				p.tree_paint();
				return;
			}
			this.rootNames(p.list, 1);
			this.node = node_s.slice();
			this.upd_search = false;
		} else if (!p.s_txt) {
			p.list = this.list;
			this.node = node.slice()
		};
		var arr = !p.s_txt ? name_idx : name_ix,
			n_o = "#get_node#",
			nU = "",
			total = p.list.Count;
		if (!p.base) for (l = 0; l < total; l++) {
			n = arr[l];
			nU = n.toUpperCase();
			if (nU != n_o) {
				n_o = nU;
				this.root[i] = {
					name: n,
					sel: false,
					child: [],
					item: []
				};
				this.root[i].item.push(l);
				i++;
			} else this.root[i - 1].item.push(l);
		} else {
			this.root[0] = {
				name: p.baseName,
				sel: false,
				child: [],
				item: []
			};
			for (l = 0; l < total; l++) this.root[0].item.push(l);
		}
		if (!lib_update) sbar.reset(); /* Draw tree -> */
		if (!p.base || p.s_txt) pop.buildTree(this.root, 0);
		if (p.base) pop.branch(this.root[0], true);
		p.init = false;

		if (lib_update && process) {
			try {
				var exp_l = exp.length,
					scr_l = scr.length,
					sel_l = sel.length,
					tree_l = pop.tree.length;
				for (h = 0; h < exp_l; h++) {
					if (exp[h].tr == 0) {
						for (j = 0; j < tree_l; j++)
							if (pop.tree[j].name.toUpperCase() == exp[h].a.toUpperCase()) {
								pop.branch(pop.tree[j]);
								tree_l = pop.tree.length;
								break;
							}
					} else if (exp[h].tr > 0) {
						for (j = 0; j < tree_l; j++)
							if (pop.tree[j].name.toUpperCase() == exp[h].b.toUpperCase() && pop.tree[pop.tree[j].par].name.toUpperCase() == exp[h].a.toUpperCase()) {
								pop.branch(pop.tree[j]);
								tree_l = pop.tree.length;
								break;
							}
					}
				}
				for (h = 0; h < sel_l; h++) {
					if (sel[h].tr == 0) {
						for (j = 0; j < tree_l; j++)
							if (pop.tree[j].name.toUpperCase() == sel[h].a.toUpperCase()) {
								pop.tree[j].sel = true;
								break;
							}
					} else if (sel[h].tr == 1) {
						for (j = 0; j < tree_l; j++) 
							if (pop.tree[j].name.toUpperCase() == sel[h].a.toUpperCase() && pop.tree[pop.tree[j].par].name.toUpperCase() == sel[h].b.toUpperCase()) {
								pop.tree[j].sel = true;
								break;
							}
					} else if (sel[h].tr > 1) {
						for (j = 0; j < tree_l; j++)
							if (pop.tree[j].name.toUpperCase() == sel[h].a.toUpperCase() && pop.tree[pop.tree[j].par].name.toUpperCase() == sel[h].b.toUpperCase() && pop.tree[pop.tree[pop.tree[j].par].par].name.toUpperCase() == sel[h].c.toUpperCase()) {
								pop.tree[j].sel = true;
								break;
						}
					}
				}
				var scr_pos = false;
				h = 0;
				while (h < scr_l && !scr_pos) {
					if (scr[h].tr == 0) {
						for (j = 0; j < tree_l; j++) 
							if (pop.tree[j].name.toUpperCase() == scr[h].a.toUpperCase()) {
								sbar.check_scroll(!h ? j * ui.row_h : (j - 3) * ui.row_h);
								scr_pos = true;
								break;
							}
					} else if (scr[h].tr == 1 && !scr_pos) {
						for (j = 0; j < tree_l; j++)
							if (pop.tree[j].name.toUpperCase() == scr[h].a.toUpperCase() && pop.tree[pop.tree[j].par].name.toUpperCase() == scr[h].b.toUpperCase()) {
								sbar.check_scroll(!h ? j * ui.row_h : (j - 3) * ui.row_h);
								scr_pos = true;
								break;
							}
					} else if (scr[h].tr > 1 && !scr_pos) {
						for (j = 0; j < tree_l; j++)
							if (pop.tree[j].name.toUpperCase() == scr[h].a.toUpperCase() && pop.tree[pop.tree[j].par].name.toUpperCase() == scr[h].b.toUpperCase() && pop.tree[pop.tree[pop.tree[j].par].par].name.toUpperCase() == scr[h].c.toUpperCase()) {
								sbar.check_scroll(!h ? j * ui.row_h : (j - 3) * ui.row_h);
								scr_pos = true;
								break;
							}
					}
					h++;
				}
				if (!scr_pos) {
					sbar.reset();
					p.tree_paint();
				}
			} catch (e) {};
		}
		if (lib_update && !process) {
			sbar.reset();
			p.tree_paint();
		}
		lib_update = false;
	}
}
var lib = new library_manager();

function populate() {
	var get_pos = -1,
		ix_o = 0,
		last_sel = -1,
		m_i = -1,
		m_br = -1,
		nd = [],
		row_o = 0,
		tt = "",
		tt_c = 0,
		tt_y = 0,
		tt_id = -1;
	this.autoplay = window.GetProperty(" Playlist: Play On Send From Menu", false);
	var btn_pl = window.GetProperty(" Playlist Use: 0 or 1", "General,1,Alt+LeftBtn,1,MiddleBtn,1").replace(/\s+/g, "").split(",");
	if (btn_pl[0] == "LeftBtn") window.SetProperty(" Playlist Use: 0 or 1", "General," + btn_pl[1] + ",Alt+LeftBtn," + btn_pl[3] + ",MiddleBtn," + btn_pl[5]);
	var alt_lbtn_pl = btn_pl[3] == 1 ? true : false,
		mbtn_pl = btn_pl[5] == 1 ? true : false;
	var custom_sort = window.GetProperty(" Playlist: Custom Sort", "");
	this.dbl_action = window.GetProperty(" Text Double-Click: ExplorerStyle-0 Play-1 Send-2", 1);
	var lib_playlist = "媒体库视图"; //window.GetProperty(" Playlist", "媒体库视图");
	var sgl_fill = window.GetProperty(" Text Single-Click: AutoFill Playlist", true);
	this.line_l = 0;
	this.sel_items = [];
	this.tree = [];
	window.SetProperty("SYSTEM.Playlist Checked", true);
	var arr_contains = function(arr, item) {
			for (var i = 0; i < arr.length; i++) if (arr[i] == item) return true;
			return false;
		}
	var arr_index = function(arr, item) {
			var n = -1;
			for (var i = 0; i < arr.length; i++) if (arr[i] == item) {
				n = i;
				break;
			}
			return n;
		}

	var draw_node = function(gr, j, x, y) {
		if (!ui.hot && j > 1) j -= 2;
		x = Math.round(x);
		y = Math.round(y);
		gr.DrawImage(nd[j], x, y, nd[j].Width, nd[j].Height, 0, 0, nd[j].Width, nd[j].Height);
	}
	var num_sort = function(a, b) {
			return a - b;
		}
	var plID = function(Playlist_Name) {
			for (var i = 0; i < plman.PlaylistCount; i++)
				if (plman.GetPlaylistName(i) == Playlist_Name) return i;
			plman.CreatePlaylist(plman.PlaylistCount, Playlist_Name);
			return i;
		}
	var sort = function(a, b) {
		a = a.name.replace(/^\?/, "").replace(/(\d+)/g, function(n) {
			return ('0000' + n).slice(-5)
		});
		b = b.name.replace(/^\?/, "").replace(/(\d+)/g, function(n) {
			return ('0000' + n).slice(-5)
		});
		return a.localeCompare(b);
	}
	var uniq = function(a) {
			var j = 0,
				len = a.length,
				out = [],
				seen = {};
			for (var i = 0; i < len; i++) {
				var item = a[i];
				if (seen[item] !== 1) {
					seen[item] = 1;
					out[j++] = item;
				}
			}
			return out.sort(num_sort);
		}
	this.add = function(x, y, pl) {
		if (y < p.s_h) return;
		var ix = this.get_ix(x, y, true, false);
		p.pos = ix;
		if (ix < this.tree.length && ix >= 0)
			if (this.check_ix(this.tree[ix], x, y, true)) {
				this.clear();
				this.tree[ix].sel = true;
				this.get_sel_items();
				this.load(this.sel_items, true, true, false, pl, false);
			}
	}
	this.auto = window.GetProperty(" Node: Auto Collapse", false);
	this.branch_chg = function(br) {
		var new_br = 0;
		if (br.tr == 0) {
			for (var i = 0; i < lib.root.length; i++) {
				new_br += lib.root[i].child.length;
				lib.root[i].child = [];
			}
		} else {
			var par = this.tree[br.par];
			for (var i = 0; i < par.child.length; i++) {
				new_br += par.child[i].child.length;
				par.child[i].child = [];
			}
		}
		return new_br;
	}
	this.check_row = function(x, y) {
		m_br = -1;
		var im = this.get_ix(x, y, true, false);
		if (im >= this.tree.length || im < 0) return;
		var item = this.tree[im];
		if (x < Math.round(ui.pad * item.tr) + ui.icon_w + ui.margin && (!item.track || p.base && item.tr == 0)) m_br = im;
		return im;
	}
	this.clear = function() {
		for (var i = 0; i < this.tree.length; i++) this.tree[i].sel = false;
	}
	this.clear_child = function(br) {
		br.child = [];
		this.buildTree(lib.root, 0, true, true);
	}
	this.deactivate_tooltip = function() {
		tt_c = 0;
		tt.Text = "";
		tt.TrackActivate = false;
		tt.Deactivate();
		p.tree_paint();
	}
	this.expandNodes = function(obj, am) {
		this.branch(obj, !am ? false : true, true, true);
		if (obj.child)
			for (var k = 0; k < obj.child.length; k++)
				if (!obj.child[k].track) this.expandNodes(obj.child[k]);
	}
	this.gen_pl = btn_pl[1] == 1 ? true : false;
	this.get_sel_items = function() {
		p.tree_paint();
		var i = 0;
		this.sel_items = [];
		for (i = 0; i < this.tree.length; i++)
			if (this.tree[i].sel) this.sel_items.push.apply(this.sel_items, this.tree[i].item);
		this.sel_items = uniq(this.sel_items);
	}
	this.handle_list = null;
	this.leave = function() {
		if (men.r_up || tt.Text) return;
		m_br = -1;
		row_o = 0;
		m_i = -1;
		ix_o = 0;
		p.tree_paint();
	}
	this.mbtn_up = function(x, y) {
		this.add(x, y, mbtn_pl);
	}
	this.row = function(y) {
		return Math.round((y - p.s_h - ui.row_h * 0.5) / ui.row_h);
	}
	this.selection_holder = fb.AcquireUiSelectionHolder();

	this.create_tooltip = function() {
		//if (!tooltip) return;
		if (tt) tt.Dispose();
		tt = window.CreateTooltip(ui.font.Name, ui.font.Size, ui.font.Style);
		tt_y = ui.row_h - window.GetProperty(" Row Vertical Item Padding", 3);
		tt_y = p.s_h - Math.floor((ui.row_h - tt_y) / 2)
		tt.SetDelayTime(0, 500);
		tt.Text = "";
	}

	this.activate_tooltip = function(ix, y) {
		if (tt_id == ix || Math.round(ui.pad * this.tree[ix].tr + ui.margin) + ui.icon_w + (!p.full_line ? this.tree[ix].w : this.tree[ix].tt_w) <= sbar.tree_w - ui.sel) return;
		if (tt_c == 2) {
			tt_id = ix;
			return;
		}
		tt_c += 1;
		tt.Activate();
		tt.TrackActivate = true;
		tt.Text = this.tree[ix].name + this.tree[ix].count;
		tt.TrackPosition(Math.round(ui.pad * this.tree[ix].tr + ui.margin) + ui.icon_w - ui.tt, this.row(y) * ui.row_h + tt_y);
		p.tree_paint();
		timer.tooltip();
	}

	this.branch = function(br, base, node, block) {
		if (!br || br.track) return;
		var br_l = br.item.length,
			folderView = p.view_by == p.folder_view ? true : false,
			i = 0,
			k = 0,
			isTrack = false,
			l = base ? 0 : p.base ? br.tr : br.tr + 1,
			n = "",
			n_o = "#get_branch#",
			nU = "";
		if (folderView) base = false;
		if (base) node = false;
		switch (true) {
			case (p.cond):
				for (k = 0; k < br_l; k++) {
					var pos = br.item[k];
					try {
						if (base) {
							n = lib.node[pos][l];
							if (!n || n == "#!##!#") n = "?";
						}
						if (!p.s_txt && !base || p.s_txt) {
							if (l < lib.node[pos].length - 1) {
								n = lib.node[pos][l];
								if (!n || n == "#!##!#") n = "?";
							} else n = "#get_track#";
						}
						isTrack = p.show_tracks ? false : l < lib.node[pos].length - 2 ? false : true;
						if (n == "#get_track#") {
							n = lib.node[pos][l];
							isTrack = true;
						}
						nU = n.toUpperCase();
						if (n_o != nU) {
							n_o = nU;
							br.child[i] = {
								name: n,
								sel: false,
								child: [],
								track: isTrack,
								item: []
							};
							br.child[i].item.push(pos);
							i++;
						} else br.child[i - 1].item.push(pos);
					} catch (e) {}
				}
				break;
			case (!p.cond):
				var tf = fb.TitleFormat(p.tf);
				for (k = 0; k < br_l; k++) {
					var pos = br.item[k];
					try {
						if (base) {
							n = lib.node[pos][l];
							if (!n || n == "#!##!#") n = "?";
						}
						if (!p.s_txt && !base || p.s_txt) {
							if (!folderView && l < lib.node[pos].length || folderView && l < lib.node[pos].length - 1) {
								n = lib.node[pos][l];
								if (!n || n == "#!##!#") n = "?";
							} else n = "#get_track#";
						}
						isTrack = p.show_tracks ? false : !folderView && l < lib.node[pos].length - 1 || folderView && l < lib.node[pos].length - 2 ? false : true;
						if (n == "#get_track#") {
							n = !folderView ? tf.EvalWithMetadb(p.list.Item(pos)) : lib.node[pos][l];
							isTrack = true;
						}
						nU = n.toUpperCase();
						if (n_o != nU) {
							n_o = nU;
							br.child[i] = {
								name: n,
								sel: false,
								child: [],
								track: isTrack,
								item: []
							};
							br.child[i].item.push(pos);
							i++;
						} else br.child[i - 1].item.push(pos);
					} catch (e) {}
				}
				break;
		}
		this.buildTree(lib.root, 0, node, true, block);
	}

	var getAllCombinations = function(n) {
			var combinations = [],
				divisors = [],
				nn = [],
				arraysToCombine = [];
			nn = n.split("#!#");
			for (var i = 0; i < nn.length; i++) {
				nn[i] = nn[i].split("@@");
				if (nn[i] != "") arraysToCombine.push(nn[i]);
			}
			for (var i = arraysToCombine.length - 1; i >= 0; i--) divisors[i] = divisors[i + 1] ? divisors[i + 1] * arraysToCombine[i + 1].length : 1;

			function getPermutation(n, arraysToCombine) {
				var result = [],
					curArray;
				for (var i = 0; i < arraysToCombine.length; i++) {
					curArray = arraysToCombine[i];
					result.push(curArray[Math.floor(n / divisors[i]) % curArray.length]);
				}
				return result;
			}
			var numPerms = arraysToCombine[0].length;
			for (var i = 1; i < arraysToCombine.length; i++) numPerms *= arraysToCombine[i].length;
			for (var i = 0; i < numPerms; i++) combinations.push(getPermutation(i, arraysToCombine));
			return combinations;
		}

	this.buildTree = function(br, tr, node, full, block) {
		var br_l = br.length,
			i = 0,
			j = 0,
			l = !p.base ? tr : tr - 1;
		if (p.multi_process) {
			var h = -1,
				multi = [],
				multi_cond = [],
				multi_obj = [],
				multi_rem = [],
				n = "",
				n_o = "#condense#",
				nm_arr = [],
				nU = "";
			for (i = 0; i < br_l; i++) {
				if (br[i].name.indexOf("@@") != -1) {
					multi = getAllCombinations(br[i].name);
					multi_rem.push(i);
					for (var m = 0; m < multi.length; m++) multi_obj.push({
						name: multi[m].join(""),
						item: br[i].item.slice(),
						track: br[i].track
					});
				}
			}
			i = multi_rem.length;
			while (i--) br.splice(multi_rem[i], 1);
			br_l = br.length;
			multi_obj.sort(sort);
			i = 0;
			while (i < multi_obj.length) {
				n = multi_obj[i].name;
				nU = n.toUpperCase();
				if (n_o != nU) {
					n_o = nU;
					multi_cond[j] = {
						name: n,
						item: multi_obj[i].item.slice(),
						track: multi_obj[i].track
					};
					j++
				} else multi_cond[j - 1].item.push.apply(multi_cond[j - 1].item, multi_obj[i].item.slice());
				i++
			}
			for (i = 0; i < br_l; i++) {
				br[i].name = br[i].name.replace(/#!#/g, "");
				nm_arr.push(br[i].name);
			}
			for (i = 0; i < multi_cond.length; i++) {
				h = arr_index(nm_arr, multi_cond[i].name);
				if (h != -1) {
					br[h].item.push.apply(br[h].item, multi_cond[i].item.slice());
					multi_cond.splice(i, 1);
				}
			}
			for (i = 0; i < multi_cond.length; i++) br.splice(i + 1, 0, {
				name: multi_cond[i].name,
				sel: false,
				track: multi_cond[i].track,
				child: [],
				item: multi_cond[i].item.slice()
			});
			if (!node || node && !full) br.sort(sort);
			i = br.length;
			while (i--) {
				if (i != 0 && br[i].name.toUpperCase() == br[i - 1].name.toUpperCase()) {
					br[i - 1].item.push.apply(br[i - 1].item, br[i].item.slice());
					br.splice(i, 1);
				}
			}
		}
		var folderView = p.view_by == p.folder_view ? true : false,
			par = this.tree.length - 1;
		if (tr == 0) this.tree = [];
		br_l = br.length;
		for (i = 0; i < br_l; i++) {
			j = this.tree.length;
			this.tree[j] = br[i];
			this.tree[j].top = !i ? true : false;
			this.tree[j].bot = i == br_l - 1 ? true : false;
			if (tr == (p.base ? 1 : 0) && i == br_l - 1) this.line_l = j;
			this.tree[j].tr = tr;
			this.tree[j].par = par;
			this.tree[j].ix = j;
			switch (true) {
				case l != -1 && (p.cond || folderView) && !p.show_tracks:
					for (var r = 0; r < this.tree[j].item.length; r++) {
						if (lib.node[this.tree[j].item[r]].length == l + 1 || lib.node[this.tree[j].item[r]].length == l + 2) {
							this.tree[j].track = true;
							break;
						}
					}
					break;
				case l == 0 && lib.node[this.tree[j].item[0]].length == 1:
					if (!folderView && p.show_tracks && p.unbranched) this.tree[j].track = true;
					if (p.show_tracks && (p.cond || folderView)) this.tree[j].track = true;
					if (!p.show_tracks) this.tree[j].track = true;
					break;
			}
			this.tree[j].count = !this.tree[j].track || !p.show_tracks ? (p.show_counts == 1 ? "  (" + this.tree[j].item.length + ") " : p.show_counts == 2 ? "  (" + branchCounts(this.tree[j], !p.base || j ? false : true, true, false) + ") " : "") : "";
			if (br[i].child.length > 0) this.buildTree(br[i].child, tr + 1, node, p.base && tr == 0 ? true : false);
		}
		if (!block) {
			if (p.base && this.tree.length == 1) this.line_l = 0;
			sbar.set_rows(this.tree.length);
			p.tree_paint();
		}
	}

	var branchCounts = function(br, base, node, block) {
		if (!br) return;
		var b = [];
		var br_l = br.item.length,
			folderView = p.view_by == p.folder_view ? true : false,
			k = 0,
			l = base ? 0 : p.base ? br.tr : br.tr + 1,
			n = "",
			n_o = "#get_branch#",
			nU = "";
		if (folderView) base = false;
		if (base) node = false;
		for (k = 0; k < br_l; k++) {
			var pos = br.item[k];
			try {
				if (base) {
					n = lib.node[pos][l];
					if (!n || n == "#!##!#") n = "?";
				}
				if (!p.s_txt && !base || p.s_txt) {
					if (l < lib.node[pos].length - 1) {
						n = lib.node[pos][l];
						if (!n || n == "#!##!#") n = "?";
					} else n = "#get_track#";
				}
				if (n == "#get_track#") {
					n = lib.node[pos][l];
				}
				nU = n.toUpperCase();
				if (n_o != nU) {
					n_o = nU;
					b.push({
						name: n
					});
				}
			} catch (e) {}
		}
		if (p.multi_process) {
			var h = -1,
				j = 0,
				multi = [],
				multi_cond = [],
				multi_obj = [],
				multi_rem = [],
				nm_arr = [];
			br_l = b.length;
			n = "";
			n_o = "#condense#";
			nU = "";
			for (i = 0; i < br_l; i++) {
				if (b[i].name.indexOf("@@") != -1) {
					multi = getAllCombinations(b[i].name);
					multi_rem.push(i);
					for (var m = 0; m < multi.length; m++) multi_obj.push({
						name: multi[m].join("")
					});
				}
			}
			i = multi_rem.length;
			while (i--) b.splice(multi_rem[i], 1);
			br_l = b.length;
			multi_obj.sort(sort);
			i = 0;
			while (i < multi_obj.length) {
				n = multi_obj[i].name;
				nU = n.toUpperCase();
				if (n_o != nU) {
					n_o = nU;
					multi_cond[j] = {
						name: n
					};
					j++
				}
				i++
			}
			for (i = 0; i < br_l; i++) {
				b[i].name = b[i].name.replace(/#!#/g, "");
				nm_arr.push(b[i].name);
			}
			for (i = 0; i < multi_cond.length; i++) {
				h = arr_index(nm_arr, multi_cond[i].name);
				if (h != -1) multi_cond.splice(i, 1);
			}
			for (i = 0; i < multi_cond.length; i++) b.splice(i + 1, 0, {
				name: multi_cond[i].name
			});
			var full = p.base && br.tr == 0 ? true : false;
			if (!node || node && !full) b.sort(sort);
			i = b.length;
			while (i--) {
				if (i != 0 && b[i].name.toUpperCase() == b[i - 1].name.toUpperCase()) b.splice(i, 1);
			}
		}
		return b.length
	}

	this.create_images = function() {
		var sz = ui.node_sz,
			plus = true,
			hot = false,
			ln_w = 1;
			sy_w = Math.max(Math.floor(sz / 6), 1),
			x = 0,
			y = 0;

		for (var j = 0; j < 4; j++) {
			nd[j] = gdi.CreateImage(sz, sz);
			g = nd[j].GetGraphics();
			hot = j > 1 ? true : false;
			plus = !j || j == 2 ? true : false;
			g.DrawRect(x, y, sz-1, sz-1, 1, RGB(145, 145, 145));
			g.FillSolidRect(x + 1, y + 1, sz - 2, sz - 2, ui.backcol);
			if (hot)	g.FillSolidRect(x + ln_w, y + ln_w, sz - ln_w * 2, sz - ln_w * 2, ui.backcol_h);
			var x_o = [x, x + sz - ln_w, x, x + sz - ln_w],
				y_o = [y, y, y + sz - ln_w, y + sz - ln_w];
			if(plus) g.FillSolidRect(Math.floor(x + (sz - 1) / 2), y + ln_w + sy_w, 1, sz - ln_w*2 - sy_w*2, ui.iconpluscol);
			g.FillSolidRect(x + ln_w + sy_w, Math.floor(y + (sz - 1) / 2), sz - ln_w * 2 - sy_w * 2, 1, ui.iconpluscol);
			nd[j].ReleaseGraphics(g);
		}
	}
	
	this.tracking = function(list, type) {
		if (type) {
			this.handle_list = fb.CreateHandleList();
			try {
				for (var i = 0; i < list.length; i++) this.handle_list.Add(p.list.Item(list[i]));
			} catch (e) {}
		} else this.handle_list = list.Clone();
		if (custom_sort.length) this.handle_list.OrderByFormat(fb.TitleFormat(custom_sort), 1);
		this.selection_holder.SetSelection(this.handle_list);
	}

	this.load = function(list, type, add, send, def_pl, insert) {
		var i = 0,
			np_item = -1,
			pid = -1,
			pln = plID(lib_playlist);
		if (!def_pl) pln = plman.ActivePlaylist;
		else plman.ActivePlaylist = pln;
		if (type) {
			var items = fb.CreateHandleList();
			for (i = 0; i < list.length; i++) items.Add(p.list.Item(list[i]));
		} else var items = list.Clone();
		if (p.multi_process && !custom_sort.length) items.OrderByFormat(fb.TitleFormat(p.mv_sort), 1);
		if (custom_sort.length) items.OrderByFormat(fb.TitleFormat(custom_sort), 1);
		this.handle_list = items.Clone();
		this.selection_holder.SetSelection(this.handle_list);
		if (fb.IsPlaying && !add && fb.GetNowPlaying()) {
			for (i = 0; i < items.Count; i++)
				if (fb.GetNowPlaying().Compare(items.Item(i))) {
					np_item = i;
					break;
				}
			var pl_chk = true;
			if (np_item != -1) {
				var np = plman.GetPlayingItemLocation();
				if (np.IsValid) {
					if (np.PlaylistIndex != pln) pl_chk = false;
					else pid = np.PlaylistItemIndex;
				}
			}
			if (np_item != -1 && pl_chk && pid == -1 && items.Count < 5000) {
				if (ui.dui) plman.SetActivePlaylistContext();
				for (i = 0; i < 20; i++) {
					fb.RunMainMenuCommand("编辑/撤消");
					var np = plman.GetPlayingItemLocation();
					if (np.IsValid) {
						pid = np.PlaylistItemIndex;
						if (pid != -1) break;
					}
				}
			}
			if (np_item != -1 && pid != -1) {
				plman.ClearPlaylistSelection(pln);
				plman.SetPlaylistSelectionSingle(pln, pid, true);
				plman.RemovePlaylistSelection(pln, true);
				var it = items.Clone();
				items.RemoveRange(np_item, items.Count);
				it.RemoveRange(0, np_item + 1);
				if (plman.PlaylistItemCount(pln) < 5000) plman.UndoBackup(pln);
				plman.InsertPlaylistItems(pln, 0, items);
				plman.InsertPlaylistItems(pln, plman.PlaylistItemCount(pln), it);
				it.Dispose();
			} else {
				if (plman.PlaylistItemCount(pln) < 5000) plman.UndoBackup(pln);
				plman.ClearPlaylist(pln);
				plman.InsertPlaylistItems(pln, 0, items);
			}
		} else if (!add) {
			if (plman.PlaylistItemCount(pln) < 5000) plman.UndoBackup(pln);
			plman.ClearPlaylist(pln);
			plman.InsertPlaylistItems(pln, 0, items);
		} else {
			if (plman.PlaylistItemCount(pln) < 5000) plman.UndoBackup(pln);
			plman.InsertPlaylistItems(pln, !insert ? plman.PlaylistItemCount(pln) : plman.GetPlaylistFocusItemIndex(pln), items, true);
			var f_ix = !insert || plman.GetPlaylistFocusItemIndex(pln) == -1 ? plman.PlaylistItemCount(pln) - items.Count : plman.GetPlaylistFocusItemIndex(pln) - items.Count;
			plman.SetPlaylistFocusItem(pln, f_ix);
			plman.EnsurePlaylistItemVisible(pln, f_ix);
		}
		if (this.autoplay && send) {
			var c = (plman.PlaybackOrder == 3 || plman.PlaybackOrder == 4) ? Math.ceil(plman.PlaylistItemCount(pln) * Math.random() - 1) : 0;
			plman.ExecutePlaylistDefaultAction(pln, c);
		}
		items.Dispose();
	}

	this.collapseAll = function() {
		var ic = this.get_ix(0, p.s_h + ui.row_h / 2, true, false),
			j = this.tree[ic].tr;
		if (p.base) j -= 1;
		if (this.tree[ic].tr != 0) {
			var par = this.tree[ic].par,
				pr_pr = [];
			for (var m = 1; m < j + 1; m++) {
				if (m == 1) pr_pr[m] = par;
				else pr_pr[m] = this.tree[pr_pr[m - 1]].par;
				ic = pr_pr[m];
			}
		}
		var nm = this.tree[ic].name.toUpperCase();
		for (var h = 0; h < this.tree.length; h++)
			if (!p.base || this.tree[h].tr) this.tree[h].child = [];
		this.buildTree(lib.root, 0);
		scr_pos = false;
		for (j = 0; j < this.tree.length; j++)
			if (this.tree[j].name.toUpperCase() == nm) {
				sbar.check_scroll(j * ui.row_h);
				scr_pos = true;
				break;
			}
		if (!scr_pos) {
			sbar.reset();
			p.tree_paint();
		}
	}

	this.expand = function(ie, nm) {
		var h = 0,
			m = 0;
		this.tree[ie].sel = true;
		if (this.auto) {
			var j = 0,
				par = 0,
				parent = [];
			for (h = 0; h < this.tree.length; h++)
				if (this.tree[h].sel) {
					j = this.tree[h].tr;
					if (p.base) j -= 1;
					if (this.tree[h].tr != 0) {
						par = this.tree[h].par, pr_pr = [];
						for (m = 1; m < j + 1; m++) {
							if (m == 1) pr_pr[m] = par;
							else pr_pr[m] = this.tree[pr_pr[m - 1]].par;
							parent.push(pr_pr[m]);
						}
					}
				}
			for (h = 0; h < this.tree.length; h++)
				if (!arr_contains(parent, h) && !this.tree[h].sel && (!p.base || this.tree[h].tr)) this.tree[h].child = [];
			this.buildTree(lib.root, 0);
		}
		var start_l = this.tree.length,
			nodes = -1;
		m = this.tree.length;
		while (m--)
			if (this.tree[m].sel) {
				this.expandNodes(this.tree[m], !p.base || m ? false : true);
				nodes++
			}
		this.clear();
		if (p.base && this.tree.length == 1) this.line_l = 0;
		sbar.set_rows(this.tree.length);
		p.tree_paint();
		var nm_n = "";
		for (h = 0; h < this.tree.length; h++) {
			nm_n = (this.tree[h].tr ? this.tree[this.tree[h].par].name : "") + this.tree[h].name;
			nm_n = nm_n.toUpperCase();
			if (nm_n == nm) break;
		}
		var new_items = this.tree.length - start_l + nodes,
			s = Math.round(sbar.scroll / ui.row_h + 0.4),
			n = Math.max(h - s, p.base ? 1 : 0);
		if (n + 1 + new_items > sbar.rows_drawn) {
			if (new_items > (sbar.rows_drawn - 2)) sbar.check_scroll(h * ui.row_h);
			else sbar.check_scroll(Math.min(h * ui.row_h, (h + 1 - sbar.rows_drawn + new_items) * ui.row_h));
		}
		if (sbar.scroll > h * ui.row_h) sbar.check_scroll(h * ui.row_h);
	}

	this.draw = function(gr) {
		try {
			if (lib.empty) return gr.GdiDrawText(lib.empty, ui.font, ui.textcol, ui.margin, p.s_h, sbar.tree_w, ui.row_h * 5, 0x00000004 | 0x00000400);
			if (!this.tree.length) return gr.GdiDrawText(lib.none, ui.font, ui.textcol, ui.margin, p.s_h, sbar.tree_w, ui.row_h, 0x00000004 | 0x00000400);
			var item_x = 0,
				item_y = 0,
				item_w = 0,
				ln_x = ui.margin + Math.floor(ui.node_sz / 2) + (p.base ? ui.pad : 0),
				nm = "",
				s = Math.round(sbar.delta / ui.row_h + 0.4),
				f = s + p.rows;
			f = this.tree.length < f ? this.tree.length : f, sel_x = 0, sel_w = 0, y1 = Math.round(p.s_h - sbar.delta + p.node_y);
			//check_node(gr);
			for (var i = s; i < f; i++) {
				item_y = Math.round(ui.row_h * i + p.s_h - sbar.delta);
				if (ui.alternate) {
					if (i % 2 == 0) gr.FillSolidRect(0, item_y + 1, sbar.stripe_w, ui.row_h - 2, ui.b1);
					else gr.FillSolidRect(0, item_y, sbar.stripe_w, ui.row_h, ui.b2);
				}
				if (this.tree[i].sel && ui.backcolsel != 0) {
					nm = this.tree[i].name + this.tree[i].count;
					item_x = Math.round(ui.pad * this.tree[i].tr + ui.margin) + ui.icon_w;
					item_w = gr.CalcTextWidth(nm, ui.font);
					sel_x = item_x - ui.sel;
					sel_w = Math.min(item_w + ui.sel * 2, sbar.tree_w - sel_x - 1);
					if (p.full_line) sel_w = sbar.tree_w - sel_x;
					if (!tt.Text || m_i != i && tt.Text) {
						gr.FillSolidRect(sel_x, item_y, sel_w + 1, ui.row_h + 1, ui.backcolsel);//选定背景
					}
				}
				if (ui.node_style && ui.linecol) {
					var end_br = [],
						j = this.tree[i].tr,
						l_x = 0,
						l_y = item_y + ui.row_h / 2;
					if (p.base) j -= 1;
					var h1 = this.tree[i].top ? ui.row_h / 4 : ui.row_h;
					if (this.tree[i].tr != 0) {
						var par = this.tree[i].par,
							pr_pr = [];
						for (var m = 1; m < j + 1; m++) {
							if (m == 1) pr_pr[m] = par;
							else pr_pr[m] = this.tree[pr_pr[m - 1]].par
							if (this.tree[pr_pr[m]].bot) end_br[m] = true;
							else end_br[m] = false;
						}
					}
					for (var k = 0; k < j + 1; k++) {
						if (this.tree[i].top && !k && !this.tree[i].track) h1 = ui.row_h / 2;
						else h1 = ui.row_h;
						if (!k && !j && this.tree[i].top && !this.tree[i].track) h1 = -ui.row_h / 4;
						if (this.tree[i].track && !k && this.tree[i].top) h1 = ui.row_h / 2
						if (!end_br[k] && k == 1) h1 = ui.row_h;
						if (end_br[k]) h1 = 0;
						var h3 = l_y - h1;
						if (h3 < p.s_h) h1 = p.s_h - h3;
						l_x = (Math.round(ui.pad * this.tree[i].tr + ui.margin) + Math.floor(ui.node_sz / 2)) - ui.pad * k;
						var h2 = ((!this.tree[i].bot && !k && this.tree[i].track && i == Math.ceil(f - 1)) || (!this.tree[i].bot && !end_br[k] && !this.tree[i].track && i == Math.ceil(f - 1)) || (k && !end_br[k] && i == f - 1)) ? ui.row_h / 2 : 0;
						if (k != j) gr.FillSolidRect(l_x, l_y - h1, 1, h1 + h2, ui.linecol);//竖线
					}
				}
			}
			if (ui.node_style && ui.linecol) {
				var top = p.base ? p.s_h + ui.row_h * 3 / 4 : p.s_h;
				var ln_y = sbar.scroll == 0 ? top + p.node_y : p.s_h;
				var ln_h = Math.min(this.line_l * ui.row_h - sbar.delta + (sbar.scroll == 0 ? (p.base ? -ui.row_h * 3 / 4 : 0) : p.node_y), ui.row_h * Math.ceil(p.rows) - (sbar.scroll == 0 ? (p.node_y + (p.base ? ui.row_h * 3 / 4 : 0)) : 0));
				if (f == this.tree.length) ln_h += ui.row_h / 4;
				ln_h = Math.round(ln_h);
				if (this.line_l) gr.FillSolidRect(ln_x, ln_y, 1, ln_h, ui.linecol);//竖线
			}
			for (i = s; i < f; i++) {
				item_y = Math.round(ui.row_h * i + p.s_h - sbar.delta);
				nm = this.tree[i].name + this.tree[i].count;
				item_x = Math.round(ui.pad * this.tree[i].tr + ui.margin);
				item_w_name = gr.CalcTextWidth(this.tree[i].name, ui.font);
				item_w = gr.CalcTextWidth(nm, ui.font);
				if (p.full_line) this.tree[i].tt_w = item_w;
				if (ui.node_style) {
					var y2 = ui.row_h * i + y1 + Math.floor(ui.node_sz / 2);
					if (!this.tree[i].track) {
						if (ui.linecol) gr.FillSolidRect(item_x + ui.node_sz, y2, ui.l_s1, 1, ui.linecol);
						draw_node(gr, this.tree[i].child.length < 1 ? m_br != i ? 0 : 2 : m_br != i ? 1 : 3, item_x, item_y + p.node_y);
					} else if (ui.linecol) gr.FillSolidRect(item_x + ui.l_s2, y2, ui.l_s3, 1, ui.linecol);
				} else if (!this.tree[i].track) {
					gr.SetTextRenderingHint(4);
					gr.DrawString(this.tree[i].child.length < 1 ? ui.expand : ui.collapse, ui.icon_font, m_br == i && ui.hot ? ui.iconcol_h : this.tree[i].child.length < 1 ? ui.iconcol_e : ui.iconcol_c, item_x, item_y + ui.icon_pad, sbar.tree_w - item_x, ui.row_h, p.s_lc);
				}
				item_x += ui.icon_w;
				if (!tt.Text) {
					if (m_i == i) {
						sel_x = item_x - ui.sel;
						sel_w = Math.min(item_w + ui.sel * 2, sbar.tree_w - sel_x - 1);
						if (p.full_line) sel_w = sbar.tree_w - sel_x - 1;
						gr.FillSolidRect(sel_x, item_y, sel_w, ui.row_h, ui.backcol_h);//hover背景
						gr.DrawRect(sel_x, item_y, sel_w, ui.row_h, 1, ui.framecol);
					}
				}
				if (p.full_line) item_w = sbar.tree_w - item_x;
				this.tree[i].w = item_w;
				var txt_c_tmp = ui.textcol;
				if (p.view_by == p.folder_view && this.tree[i].track) {
					txt_c_tmp = ui.textcol_nottrack;
				}
				var txt_c = this.tree[i].sel ? ui.textselcol : m_i == i ? ui.textcol_h : txt_c_tmp;
				var txt_track_w = gr.CalcTextWidth(this.tree[i].count, ui.font);
				var txt_track_x = sbar.tree_w - ui.sel - txt_track_w;
				txt_track_x = Math.min(txt_track_x, item_x + item_w_name);
				gr.GdiDrawText(this.tree[i].name, ui.font, txt_c, item_x, item_y, txt_track_x - item_x, ui.row_h, p.lc);
				if (this.tree[i].sel && ui.backcolsel != 0) gr.GdiDrawText(this.tree[i].count, ui.font, RGB(200, 200, 200), txt_track_x, item_y, txt_track_w, ui.row_h, p.lc);
				else gr.GdiDrawText(this.tree[i].count, ui.font, ui.txt_c_track, txt_track_x, item_y, txt_track_w, ui.row_h, p.lc);
			}
		} catch (e) {}
	}

	this.send = function(item, x, y) {
		if (!this.check_ix(item, x, y, false)) return;
		if (v.k(1)) this.load(this.sel_items, true, false, false, this.gen_pl, false);
		else if (v.k(0)) this.load(this.sel_items, true, false, false, this.gen_pl, false);
		else this.load(item.item, true, false, false, this.gen_pl, false);
	}
	
	this.track = function(item, x, y) {
		if (!this.check_ix(item, x, y, false)) return;
		if (v.k(1)) this.tracking(this.sel_items, true);
		else if (v.k(0)) this.tracking(this.sel_items, true);
		else this.tracking(item.item, true);
	}

	this.lbtn_dn = function(x, y) {
		if (y < p.s_h) return;
		var ix = this.get_ix(x, y, true, false);
		p.pos = ix;
		if (ix >= this.tree.length || ix < 0) return this.get_selection(-1);
		var item = this.tree[ix],
			mode = x < Math.round(ui.pad * item.tr) + ui.icon_w + ui.margin ? 0 : this.check_ix(item, x, y, false) ? 1 : 2,
			xp = item.child.length > 0 ? 0 : 1;
		switch (mode) {
		case 0:
			switch (xp) {
			case 0:
				this.clear_child(item);
				break;
			case 1:
				if (this.auto) this.branch_chg(item, false, true);
				var row = this.row(y);
				this.branch(item, !p.base || ix ? false : true, true);
				if (this.auto) ix = item.ix
				if (row + 1 + item.child.length > sbar.rows_drawn) {
					if (item.child.length > (sbar.rows_drawn - 2)) sbar.check_scroll(ix * ui.row_h);
					else sbar.check_scroll(Math.min(ix * ui.row_h, (ix + 1 - sbar.rows_drawn + item.child.length) * ui.row_h));
				}
				break;
			}
			if (sbar.scroll > ix * ui.row_h) sbar.check_scroll(ix * ui.row_h);
			this.check_row(x, y);
			break;
		case 1:
			if (v.k(2) && sgl_fill) return this.add(x, y, alt_lbtn_pl);
			if (!v.k(1)) this.clear();
			if (!item.sel) this.get_selection(ix, item.sel);
			else if (v.k(1)) this.get_selection(ix, item.sel);
			p.tree_paint();
			break;
		}
		if (sgl_fill) this.send(item, x, y);
		else this.track(item, x, y);
	}

	this.lbtn_dblclk = function(x, y) {
		if (y < p.s_h) return;
		var ix = this.get_ix(x, y, true, false);
		if (ix >= this.tree.length || ix < 0) return;
		var item = this.tree[ix];
		if (!sgl_fill) this.send(item, x, y);
		if (!this.check_ix(item, x, y, false) || this.dbl_action == 2) return;
		var mp = 1;
		if (!this.dbl_action) {
			if (item.child.length) mp = 0;
			switch (mp) {
			case 0:
				this.clear_child(item);
				break;
			case 1:
				if (this.auto) this.branch_chg(item, false, true);
				var row = this.row(y);
				this.branch(item, !p.base || ix ? false : true, true);
				if (this.auto) ix = item.ix
				if (row + 1 + item.child.length > sbar.rows_drawn) {
					if (item.child.length > (sbar.rows_drawn - 2)) sbar.check_scroll(ix * ui.row_h);
					else sbar.check_scroll(Math.min(ix * ui.row_h, (ix + 1 - sbar.rows_drawn + item.child.length) * ui.row_h));
				}
				break;
			}
			if (sbar.scroll > ix * ui.row_h) sbar.check_scroll(ix * ui.row_h);
		}
		if (this.dbl_action || !this.dbl_action && mp == 1 && !item.child.length) {
			var pln = plID(lib_playlist);
			plman.ActivePlaylist = pln;
			var c = (plman.PlaybackOrder == 3 || plman.PlaybackOrder == 4) ? Math.ceil(plman.PlaylistItemCount(pln) * Math.random() - 1) : 0;
			plman.ExecutePlaylistDefaultAction(pln, c);
		}
	}

	this.get_selection = function(idx, state, add, bypass) {
		var sel_type = idx == -1 && !add ? 0 : v.k(0) && last_sel > -1 && !bypass ? 1 : v.k(1) && !bypass ? 2 : !state ? 3 : 0;
		switch (sel_type) {
		case 0:
			this.clear();
			this.sel_items = [];
			break;
		case 1:
			var direction = (idx > last_sel) ? 1 : -1;
			if (!v.k(1)) this.clear();
			for (var i = last_sel;; i += direction) {
				this.tree[i].sel = true;
				if (i == idx) break;
			}
			this.get_sel_items();
			p.tree_paint();
			break;
		case 2:
			this.tree[idx].sel = !this.tree[idx].sel;
			this.get_sel_items();
			last_sel = idx;
			break;
		case 3:
			this.sel_items = [];
			if (!add) this.clear();
			if (!add) this.tree[idx].sel = true;
			this.sel_items.push.apply(this.sel_items, this.tree[idx].item);
			this.sel_items = uniq(this.sel_items);
			last_sel = idx;
			break;
		}
	}

	this.move = function(x, y) {
		var ix = this.get_ix(x, y, false, false);
		get_pos = this.check_row(x, y);
		m_i = -1;
		if (ix != -1) {
			m_i = ix;
			this.activate_tooltip(ix, y);
		}
		if (m_i == ix_o && m_br == row_o) return;
		tt_id = -1;
		if (tt.Text) this.deactivate_tooltip();
		if (!sbar.draw_timer) p.tree_paint();
		ix_o = m_i;
		row_o = m_br;
	}

	this.get_ix = function(x, y, simple, type) {
		var ix;
		if (y > p.s_h && y < p.s_h + p.sp) ix = this.row(y + sbar.scroll);
		else ix = -1;
		if (simple) return ix;
		if (this.tree.length > ix && ix >= 0 && x < sbar.tree_w && y > p.s_h && y < p.s_h + p.sp && this.check_ix(this.tree[ix], x, y, type)) return ix;
		else return -1;
	}

	this.check_ix = function(br, x, y, type) {
		if (!br) return false;
		return type ? (x >= Math.round(ui.pad * br.tr + ui.margin) && x < Math.round(ui.pad * br.tr + ui.margin) + br.w + ui.icon_w) : (x >= Math.round(ui.pad * br.tr + ui.margin) + ui.icon_w) && x < Math.min(Math.round(ui.pad * br.tr + ui.margin) + ui.icon_w + br.w, sbar.tree_w);
	}

	this.on_key_down = function(vkey) {
		if (p.s_search) return;
		switch (vkey) {
		case v.left:
			if (!(p.pos >= 0) && get_pos != -1) p.pos = get_pos
			else p.pos = p.pos + this.tree.length % this.tree.length;
			p.pos = Math.max(Math.min(p.pos, this.tree.length - 1), 0);
			get_pos = -1;
			m_i = -1;
			if (this.tree[p.pos].tr == p.base ? 1 : 0) break;
			if (this.tree[p.pos].child.length > 0) {
				var item = this.tree[p.pos];
				this.clear_child(item);
				this.get_selection(item.ix);
				m_i = p.pos = item.ix;
			} else {
				try {
					var item = this.tree[this.tree[p.pos].par];
					this.clear_child(item);
					this.get_selection(item.ix);
					m_i = p.pos = item.ix;
				} catch (e) {
					return;
				};
			}
			p.tree_paint();
			this.load(this.sel_items, true, false, false, this.gen_pl, false);
			sbar.set_rows(this.tree.length);
			if (sbar.scroll > p.pos * ui.row_h) sbar.check_scroll(p.pos * ui.row_h);
			break;
		case v.right:
			if (!(p.pos >= 0) && get_pos != -1) p.pos = get_pos
			else p.pos = p.pos + this.tree.length % this.tree.length;
			p.pos = Math.max(Math.min(p.pos, this.tree.length - 1), 0);
			get_pos = -1;
			m_i = -1;
			var item = this.tree[p.pos];
			if (this.auto) this.branch_chg(item, false, true);
			this.branch(item, p.base && p.pos == 0 ? true : false, true);
			this.get_selection(item.ix);
			p.tree_paint();
			m_i = p.pos = item.ix;
			this.load(this.sel_items, true, false, false, this.gen_pl, false);
			sbar.set_rows(this.tree.length);
			var row = (p.pos * ui.row_h - sbar.scroll) / ui.row_h;
			if (row + item.child.length > sbar.rows_drawn) {
				if (item.child.length > (sbar.rows_drawn - 2)) sbar.check_scroll(p.pos * ui.row_h);
				else sbar.check_scroll(Math.min(p.pos * ui.row_h, (p.pos + 1 - sbar.rows_drawn + item.child.length) * ui.row_h));
			}
			break;
		case v.pgUp:
			if (this.tree.length == 0) break;
			p.pos = Math.round(sbar.scroll / ui.row_h + 0.4) - Math.floor(p.rows);
			p.pos = Math.max(!p.base ? 0 : 1, p.pos);
			sbar.wheel(1, true);
			this.get_selection(this.tree[p.pos].ix);
			p.tree_paint();
			this.load(this.sel_items, true, false, false, this.gen_pl, false);
			break;
		case v.pgDn:
			if (this.tree.length == 0) break;
			p.pos = Math.round(sbar.scroll / ui.row_h + 0.4);
			p.pos = p.pos + Math.floor(p.rows) * 2 - 1;
			p.pos = this.tree.length < p.pos ? this.tree.length - 1 : p.pos;
			sbar.wheel(-1, true);
			this.get_selection(this.tree[p.pos].ix);
			p.tree_paint();
			this.load(this.sel_items, true, false, false, this.gen_pl, false);
			break;
		case v.home:
			if (this.tree.length == 0) break;
			p.pos = !p.base ? 0 : 1;
			sbar.check_scroll(0);
			this.get_selection(this.tree[p.pos].ix);
			p.tree_paint();
			this.load(this.sel_items, true, false, false, this.gen_pl, false);
			break;
		case v.end:
			if (this.tree.length == 0) break;
			p.pos = this.tree.length - 1;
			sbar.check_scroll((this.tree.length) * ui.row_h);
			this.get_selection(this.tree[p.pos].ix);
			p.tree_paint();
			this.load(this.sel_items, true, false, false, this.gen_pl, false);
			break;
		case v.enter:
			if (!this.sel_items.length) return;
			this.load(this.sel_items, true, false, false, this.gen_pl, false);
			break;
		case v.dn:
		case v.up:
			if (this.tree.length == 0) break;
			if ((p.pos == 0 && get_pos == -1 && vkey == v.up) || (p.pos == this.tree.length - 1 && vkey == v.dn)) {
				this.get_selection(-1);
				break;
			}
			if (get_pos != -1) p.pos = get_pos;
			else p.pos = p.pos + this.tree.length % this.tree.length;
			get_pos = -1;
			m_i = -1;
			if (vkey == v.dn) p.pos++;
			if (vkey == v.up) p.pos--;
			p.pos = Math.max(Math.min(p.pos, this.tree.length - 1), !p.base ? 0 : 1);
			var row = (p.pos * ui.row_h - sbar.scroll) / ui.row_h;
			if (sbar.rows_drawn - row < 3) sbar.check_scroll((p.pos + 3) * ui.row_h - sbar.rows_drawn * ui.row_h);
			else if (row < 2 && vkey == v.up) sbar.check_scroll((p.pos - 1) * ui.row_h);
			m_i = p.pos;
			this.get_selection(p.pos);
			p.tree_paint();
			this.load(this.sel_items, true, false, false, this.gen_pl, false);
			break;
		}
	}
}
var pop = new populate();

function on_size() {
	ui.w = window.Width;
	ui.h = window.Height;
	if (!ui.w || !ui.h) return;
	ui.get_font();
	p.on_size();
	pop.create_tooltip();
	if (p.s_show || ui.scrollbar_show) but.refresh(true);
	jS.on_size();
}

function searchLibrary() {
	var cx = 0,
		doc = new ActiveXObject('htmlfile'),
		f = 0,
		expand_limit = Math.min(Math.max(window.GetProperty("ADV.Limit Search Results Auto Expand: 10-1000", 350), 10), 1000),
		i = 0,
		lbtn_dn = false,
		lg = [],
		log = [],
		offset = 0,
		s = 0,
		shift = false,
		shift_x = 0,
		txt_w = 0;
	var calc_text = function() {
			var im = gdi.CreateImage(1, 1),
				g = im.GetGraphics();
			txt_w = g.CalcTextWidth(p.s_txt.substr(offset), ui.font);
			im.ReleaseGraphics(g);
			im.Dispose();
		}
	var drawcursor = function(gr) {
			if (p.s_search && p.s_cursor && s == f && cx >= offset) {
				var x1 = p.s_x + get_cursor_x(cx),
					x2 = x1;
				gr.DrawLine(x1, p.s_sp * 0.1, x2, p.s_sp * 0.85, 1, ui.textcol);
			}
		}
	var drawsel = function(gr) {
			if (s == f) return;
			var clamp = p.s_x + p.s_w2;
			gr.DrawLine(Math.min(p.s_x + get_cursor_x(s), clamp), p.s_sp / 2, Math.min(p.s_x + get_cursor_x(f), clamp), p.s_sp / 2, ui.row_h - 3, ui.ibeamcol);
		}
	var get_cursor_pos = function(x) {
			var im = gdi.CreateImage(1, 1),
				g = im.GetGraphics(),
				nx = x - p.s_x,
				pos = 0;
			for (i = offset; i < p.s_txt.length; i++) {
				pos += g.CalcTextWidth(p.s_txt.substr(i, 1), ui.font);
				if (pos >= nx + 3) break;
			}
			im.ReleaseGraphics(g);
			im.Dispose();
			return i;
		}
	var get_cursor_x = function(pos) {
			var im = gdi.CreateImage(1, 1),
				g = im.GetGraphics(),
				x = 0;
			if (pos >= offset) x = g.CalcTextWidth(p.s_txt.substr(offset, pos - offset), ui.font);
			im.ReleaseGraphics(g);
			im.Dispose();
			return x;
		}
	var get_offset = function(gr) {
			var t = gr.CalcTextWidth(p.s_txt.substr(offset, cx - offset), ui.font);
			var j = 0;
			while (t >= p.s_w2 && j < 500) {
				j++;
				offset++;
				t = gr.CalcTextWidth(p.s_txt.substr(offset, cx - offset), ui.font);
			}
		}
	var record = function() {
			lg.push(p.s_txt);
			log = [];
			if (lg.length > 30) lg.shift();
		}
	this.clear = function() {
		lib.time.Reset();
		offset = s = f = cx = 0;
		p.s_cursor = false;
		p.s_search = false;
		p.s_txt = "";
		p.search_paint();
		timer.reset(timer.search_cursor, timer.search_cursori);
		lib.rootNodes();
	}
	this.on_key_up = function(vkey) {
		if (!p.s_search) return;
		if (vkey == v.shift) {
			shift = false;
			shift_x = cx;
		}
	}
	this.lbtn_up = function(x, y) {
		if (s != f) timer.reset(timer.search_cursor, timer.search_cursori);
		lbtn_dn = false;
	}
	this.move = function(x, y) {
		if (y > p.s_h || !lbtn_dn) return;
		var t = get_cursor_pos(x),
			t_x = get_cursor_x(t);
		calc_text();
		if (t < s) {
			if (t < f) {
				if (t_x < p.s_x)
					if (offset > 0) offset--;
			} else if (t > f) {
				if (t_x + p.s_x > p.s_x + p.s_w2) {
					var l = (txt_w > p.s_w2) ? txt_w - p.s_w2 : 0;
					if (l > 0) offset++;
				}
			}
			f = t;
		} else if (t > s) {
			if (t_x + p.s_x > p.s_x + p.s_w2) {
				var l = (txt_w > p.s_w2) ? txt_w - p.s_w2 : 0;
				if (l > 0) offset++;
			}
			f = t;
		}
		cx = t;
		p.search_paint();
	}
	this.rbtn_up = function(x, y) {
		men.search_menu(x, y, s, f, doc.parentWindow.clipboardData.getData('text') ? true : false)
	}
	this.search_auto_expand = window.GetProperty(" Search Results Auto Expand", false);

	this.lbtn_dn = function(x, y) {
		p.search_paint();
		lbtn_dn = p.s_search = (y < p.s_h && x > ui.margin + ui.row_h * 0.6 && x < p.s_x + p.s_w2);
		if (!lbtn_dn) {
			offset = s = f = cx = 0;
			timer.reset(timer.search_cursor, timer.search_cursori);
			return;
		} else {
			if (shift) {
				s = cx;
				f = cx = get_cursor_pos(x);
			} else {
				cx = get_cursor_pos(x);
				s = f = cx;
			}
			timer.reset(timer.search_cursor, timer.search_cursori);
			p.s_cursor = true;
			timer.search_cursor = window.SetInterval(function() {
				p.s_cursor = !p.s_cursor;
				p.search_paint();
			}, 530);
		}
		p.search_paint();
	}

	this.on_char = function(code, force) {
		var text = String.fromCharCode(code);
		if (force) p.s_search = true;
		if (!p.s_search) return;
		p.s_cursor = false;
		p.pos = -1;
		switch (code) {
		case v.enter:
			if (p.s_txt.length < 3) break;
			var items = fb.CreateHandleList();
			//var items = p.items();
			try {
				items = fb.GetQueryItems(lib.list, p.s_txt)
			} catch (e) {}
			pop.load(items, false, false, false, pop.gen_pl, false);
			items.Dispose();
			break;
		case v.redo:
			lg.push(p.s_txt);
			if (lg.length > 30) lg.shift();
			if (log.length > 0) {
				p.s_txt = log.pop() + "";
				cx++
			}
			break;
		case v.undo:
			log.push(p.s_txt);
			if (log.length > 30) lg.shift();
			if (lg.length > 0) p.s_txt = lg.pop() + "";
			break;
		case v.selAll:
			s = 0;
			f = p.s_txt.length;
			break;
		case v.copy:
			if (s != f) doc.parentWindow.clipboardData.setData('text', p.s_txt.substring(s, f));
			break;
		case v.cut:
			if (s != f) doc.parentWindow.clipboardData.setData('text', p.s_txt.substring(s, f));
		case v.back:
			record();
			if (s == f) {
				if (cx > 0) {
					p.s_txt = p.s_txt.substr(0, cx - 1) + p.s_txt.substr(cx, p.s_txt.length - cx);
					if (offset > 0) offset--;
					cx--;
				}
			} else {
				if (f - s == p.s_txt.length) {
					p.s_txt = "";
					cx = 0;
				} else {
					if (s > 0) {
						var st = s,
							en = f;
						s = Math.min(st, en);
						f = Math.max(st, en);
						p.s_txt = p.s_txt.substring(0, s) + p.s_txt.substring(f, p.s_txt.length);
						cx = s;
					} else {
						p.s_txt = p.s_txt.substring(f, p.s_txt.length);
						cx = s;
					}
				}
			}
			calc_text();
			offset = offset >= f - s ? offset - f + s : 0;
			s = cx;
			f = s;
			break;
		case "delete":
			record();
			if (s == f) {
				if (cx < p.s_txt.length) {
					p.s_txt = p.s_txt.substr(0, cx) + p.s_txt.substr(cx + 1, p.s_txt.length - cx - 1);
				}
			} else {
				if (f - s == p.s_txt.length) {
					p.s_txt = "";
					cx = 0;
				} else {
					if (s > 0) {
						var st = s,
							en = f;
						s = Math.min(st, en);
						f = Math.max(st, en);
						p.s_txt = p.s_txt.substring(0, s) + p.s_txt.substring(f, p.s_txt.length);
						cx = s;
					} else {
						p.s_txt = p.s_txt.substring(f, p.s_txt.length);
						cx = s;
					}
				}
			}
			calc_text();
			offset = offset >= f - s ? offset - f + s : 0;
			s = cx;
			f = s;
			break;
		case v.paste:
			text = doc.parentWindow.clipboardData.getData('text');
		default:
			record();
			if (s == f) {
				p.s_txt = p.s_txt.substring(0, cx) + text + p.s_txt.substring(cx);
				cx += text.length;
				f = s = cx;
			} else if (f > s) {
				p.s_txt = p.s_txt.substring(0, s) + text + p.s_txt.substring(f);
				calc_text();
				offset = offset >= f - s ? offset - f + s : 0;
				cx = s + text.length;
				s = cx;
				f = s;
			} else {
				p.s_txt = p.s_txt.substring(s) + text + p.s_txt.substring(0, f);
				calc_text();
				offset = offset < f - s ? offset - f + s : 0;
				cx = f + text.length;
				s = cx;
				f = s;
			}
			break;
		}
		if (!timer.search_cursor) timer.search_cursor = window.SetInterval(function() {
			p.s_cursor = !p.s_cursor;
			p.search_paint();
		}, 530);
		p.search_paint();
		lib.upd_search = true;
		timer.reset(timer.search, timer.searchi);
		timer.search = window.SetTimeout(function() {
			lib.time.Reset();
			lib.rootNodes();
			if (sL.search_auto_expand) {
				if (!pop.tree.length) return timer.search = false;
				var count = 0,
					m = p.base ? 1 : 0;
				for (m; m < pop.tree.length; m++) count += pop.tree[m].item.length;
				if (count > expand_limit) return timer.search = false;
				var n = false;
				if (p.base && pop.tree.length > 1) n = true;
				m = pop.tree.length;
				while (m--) {
					pop.expandNodes(pop.tree[m], !p.base || m ? false : true);
					if (n && m == 1) break;
				}
				if (p.base && pop.tree.length == 1) pop.line_l = 0;
				sbar.set_rows(pop.tree.length);
				p.tree_paint();
			}
			timer.search = false;
		}, 160);
	}

	this.on_key_down = function(vkey) {
		if (!p.s_search) return;
		switch (vkey) {
		case v.left:
		case v.right:
			if (vkey == v.left) {
				if (offset > 0) {
					if (cx <= offset) {
						offset--;
						cx--;
					} else cx--;
				} else if (cx > 0) cx--;
				s = f = cx
			}
			if (vkey == v.right && cx < p.s_txt.length) cx++;
			s = f = cx;
			if (shift) {
				s = Math.min(cx, shift_x);
				f = Math.max(cx, shift_x);
			}
			p.s_cursor = true;
			timer.reset(timer.search_cursor, timer.search_cursori);
			timer.search_cursor = window.SetInterval(function() {
				p.s_cursor = !p.s_cursor;
				p.search_paint();
			}, 530);
			break;
		case v.home:
		case v.end:
			if (vkey == v.home) offset = s = f = cx = 0;
			else s = f = cx = p.s_txt.length;
			p.s_cursor = true;
			timer.reset(timer.search_cursor, timer.search_cursori);
			timer.search_cursor = window.SetInterval(function() {
				p.s_cursor = !p.s_cursor;
				p.search_paint();
			}, 530);
			break;
		case v.shift:
			shift = true;
			shift_x = cx;
			break;
		case v.del:
			this.on_char("delete");
			break;
		}
		p.search_paint();
	}

	this.draw = function(gr) {
		try {
			s = Math.min(Math.max(s, 0), p.s_txt.length);
			f = Math.min(Math.max(f, 0), p.s_txt.length);
			cx = Math.min(Math.max(cx, 0), p.s_txt.length);
			gr.DrawLine(0, p.s_sp + 2, ui.w, p.s_sp + 2, 1, ui.s_linecol);
			gr.FillSolidRect(0, 0, p.f_x1 - ui.margin - 2, p.s_sp, ui.topbar_color);
			gr.FillSolidRect(p.f_x1 - ui.margin, 0, ui.w - p.f_x1 + ui.margin, p.s_sp, ui.topbar_color);
			if (p.s_txt) {
				f = (f < p.s_txt.length) ? f : p.s_txt.length;
				drawsel(gr);
				get_offset(gr);
				gr.GdiDrawText(p.s_txt.substr(offset), ui.font, ui.searchcol, p.s_x, 1, p.s_w2, p.s_sp, p.l);
			} else gr.GdiDrawText("搜索", ui.s_font, ui.txt_box, p.s_x, 1, p.s_w2, p.s_sp, p.l);
			drawcursor(gr);
			if (p.s_show > 1) {
				var l_x = p.f_x1 - 9,
					l_h = Math.round(p.s_sp / 2);
				gr.gdiDrawText(p.filt[p.filter_by].name, p.f_font, ui.txt_box, p.f_x1, 1, p.f_w[p.filter_by], p.s_sp, p.cc);
				gr.FillGradRect(l_x + 1, 0, 1, l_h, 90, RGBA(0, 0, 0, 3), ui.s_linecol);//搜索框右侧阴影线
				gr.FillGradRect(l_x + 1, l_h, 1, l_h, 90, ui.s_linecol, RGBA(0, 0, 0, 3));
			}
		} catch (e) {}
	}
}
if (p.s_show) var sL = new searchLibrary();

var j_Search = function() {
		var j_x = 5,
			j_h = 30,
			j_y = 5,
			jSearch = "",
			jump_search = true,
			rs1 = 5,
			rs2 = 4;
		this.on_size = function() {
			j_x = Math.round(ui.w / 2);
			j_h = Math.round(ui.row_h * 1.5);
			j_y = Math.round((ui.h - j_h) / 2);
			rs1 = Math.min(5, j_h / 2);
			rs2 = Math.min(4, (j_h - 2) / 2);
		}

		this.on_char = function(code) {
			var text = String.fromCharCode(code);
			if (!p.s_search) {
				var found = false,
					i = 0,
					pos = -1;
				switch (code) {
				case v.back:
					jSearch = jSearch.substr(0, jSearch.length - 1);
					break;
				case v.enter:
					jSearch = "";
					return;
				default:
					jSearch += text;
					break;
				}
				var l = pop.tree.length;
				for (i = 0; i < l; i++) pop.tree[i].sel = false;
				if (!jSearch) return;
				pop.sel_items = [];
				jump_search = true;
				window.RepaintRect(0, j_y - 1, ui.w, j_h + 3);
				timer.reset(timer.jsearch, timer.jsearchi);
				timer.jsearch = window.SetTimeout(function() {
					for (i = 0; i < l; i++) {
						if (pop.tree[i].name != p.baseName && pop.tree[i].name.substring(0, jSearch.length).toLowerCase() == jSearch.toLowerCase()) {
							found = true;
							pos = i;
							pop.tree[i].sel = true;
							pop.get_sel_items();
							break;
						}
					}
					if (!found) jump_search = false;
					p.tree_paint();
					sbar.check_scroll((pos - 5) * ui.row_h);
					timer.jsearch = false;
				}, 500);

				timer.reset(timer.clear_jsearch, timer.clear_jsearchi);
				timer.clear_jsearch = window.SetTimeout(function() {
					if (found) pop.load(pop.sel_items, true, false, false, pop.gen_pl, false);
					jSearch = "";
					window.RepaintRect(0, j_y - 1, ui.w, j_h + 3);
					timer.clear_jsearch = false;
				}, 1000);
			}
		}

		this.draw = function(gr) {
			if (jSearch) {
				try {
					gr.SetSmoothingMode(4);
					var j_w = gr.CalcTextWidth(jSearch, ui.j_font) + 24*zdpi;
					var j_x2 = j_x - j_w / 2;
					gr.FillRoundRect(j_x2, j_y, j_w, j_h, 5, 5, RGBA(0, 0, 0, 150));
					gr.DrawRoundRect(j_x2-1, j_y - 1, j_w + 2, j_h + 2, 5, 5, 1.0, RGBA(0, 0, 0, 180));
					gr.GdiDrawText(jSearch, ui.j_font, RGB(0, 0, 0), j_x2 + 1, j_y + 1, j_w, j_h, p.cc);
					gr.GdiDrawText(jSearch, ui.j_font, jump_search ? 0xfffafafa : 0xffff4646, j_x2, j_y, j_w, j_h, p.cc);
				} catch (e) {}
			}
		}
	}
var jS = new j_Search();

function on_paint(gr) {
	if (!ui.w) return;
	ui.draw(gr);
	if (lib.upd) {
		lib.refresh();
		lib.upd = false;
		return;
	}
	if (p.s_show) sL.draw(gr);
	pop.draw(gr);
	if (ui.scrollbar_show) sbar.draw(gr);
	if (p.s_show || ui.scrollbar_show) but.draw(gr);
	jS.draw(gr);
	
	gr.DrawLine(0, 0, 0, ui.h, 1, RGBA(0, 0, 0, 80));
	//gr.DrawLine(1, 0, 1, ui.h, 1, RGBA(0, 0, 0, 60));
	//gr.DrawLine(2, 0, 2, ui.h, 1, RGBA(0, 0, 0, 30));
	//gr.DrawLine(3, 0, 3, ui.h, 1, RGBA(0, 0, 0, 15));
	gr.DrawLine(0, 0, ui.w, 0, 1, RGBA(0, 0, 0, 100));
	gr.DrawLine(0, ui.h - 1, ui.w, ui.h - 1, 1, RGBA(0, 0, 0, 100));
	if(show_shadow){
		gr.DrawLine(0, 1, ui.w, 1, 1, RGBA(0, 0, 0, 60));
		gr.DrawLine(0, 2, ui.w, 2, 1, RGBA(0, 0, 0, 30));
		gr.DrawLine(0, 3, ui.w, 3, 1, RGBA(0, 0, 0, 15));
		
		gr.DrawLine(0, ui.h - 2, ui.w, ui.h - 2, 1, RGBA(0, 0, 0, 60));
		gr.DrawLine(0, ui.h - 3, ui.w, ui.h - 3, 1, RGBA(0, 0, 0, 30));
		gr.DrawLine(0, ui.h - 4, ui.w, ui.h - 4, 1, RGBA(0, 0, 0, 15));
	}
}

function button_manager() {
	var icon_f_name = "Segoe UI",
		icon_f_style = 0,
		arrow_symb = 0;
	
	var b_x, but_tt = window.CreateTooltip(fbx_set[13], fbx_set[14], 0),
		bx, by, bh, byDn, byUp, fw, i, qx, qy, qh, s_img = [],
		scr = [],
		scrollBut_x, scrollDn_y, scrollUp_y;
	this.btns = [];
	this.b = null;
	var browser = function(c) {
		if (!but.run(c)) fb.ShowPopupMessage("无法启动默认浏览器。", "媒体库目录树");
	}
	var tooltip = function(n) {
			if (but_tt.text == n) return;
			but_tt.text = n;
			but_tt.activate();
	}
	this.lbtn_dn = function(x, y) {
		if (!this.b) return false;
		if (ui.scrollbar_show && ui.scrollbar_bt_show && (this.b == "scrollUp" || this.b == "scrollDn")) {
			if (this.btns[this.b].trace(x, y)) this.btns[this.b].down = true;
			this.btns[this.b].changestate("down");
		}
		this.btns[this.b].lbtn_dn(x, y);
		return true;
	}
	this.lbtn_up = function(x, y) {
		if (!this.b) return false;
		if (ui.scrollbar_show && ui.scrollbar_bt_show) {
			this.btns["scrollUp"].down = false;
			this.btns["scrollDn"].down = false;
			if (this.b == "scrollUp" || this.b == "scrollDn") this.btns[this.b].changestate(this.btns[this.b].trace(x, y) ? "hover" : "normal");
		}
		this.move(x, y);
		if (!this.b) return false;
		this.btns[this.b].lbtn_up(x, y);
		return true;
	}
	this.leave = function() {
		if (this.b) this.btns[this.b].changestate("normal");
		this.b = null;
		tooltip("");
	}
	this.on_script_unload = function() {
		tooltip("");
	}
	this.run = function(c) {
		try {
			var WshShell = new ActiveXObject("WScript.Shell");
			WshShell.Run(c);
			return true;
		} catch (e) {
			return false;
		}
	}

	this.create_images = function() {
		var	c, col = [ui.textcol & 0x44ffffff, ui.textcol & 0x99ffffff, ui.textcol],
			g, sz =  Math.max(Math.round(ui.but_h * 1.666667), 1);
			sc = sz / 100;
		for (var j = 0; j < 2; j++) {
			c = j ? 0xe4ffffff : 0x99ffffff;
			s_img[j] = gdi.CreateImage(100, 100);//搜索图标
			g = s_img[j].GetGraphics();
			g.SetSmoothingMode(2);
			g.DrawLine(69, 71, 94, 96, 12, ui.txt_box & c);
			g.DrawEllipse(8, 11, 67, 67, 10, ui.txt_box & c);
			g.FillEllipse(15, 17, 55, 55, 0x0AFAFAFA);
			g.SetSmoothingMode(0);
			s_img[j].ReleaseGraphics(g);
		}
		for (j = 0; j < 3; j++) {
			scr[j] = gdi.CreateImage(sz, sz);
			g = scr[j].GetGraphics();
			g.SetSmoothingMode(2);
			arrow_symb == g.FillPolygon(ui.scroll_color, 1, [50 * sc, 2, 100 * sc, 88 * sc, 0, 88 * sc]) ;
			g.SetSmoothingMode(0);
			scr[j].ReleaseGraphics(g);
		}
	};
	this.create_images();

	this.draw = function(gr) {
		try {
			for (i in this.btns) {
				if ((p.s_show == 1 || p.s_show > 1 && !p.s_txt) && i == "s_img") this.btns[i].draw(gr);
				if (p.s_show == 1 && i == "cross1") this.btns[i].draw(gr);
				if (p.s_show > 1 && p.s_txt && i == "cross2") this.btns[i].draw(gr);
				if (p.s_show > 1 && i == "filter") this.btns[i].draw(gr);
				if (ui.scrollbar_show && sbar.scrollable_lines > 0 && ui.scrollbar_bt_show && (i == "scrollUp" || i == "scrollDn")) this.btns[i].draw(gr);
			}
		} catch (e) {}
	}

	this.move = function(x, y) {
		if (this.b && this.btns[this.b].down == true) return;
		var b = null,
			hand = false;
		for (i in this.btns) {
			if ((p.s_show == 1 || p.s_show > 1 && !p.s_txt) && i == "s_img" && this.btns[i].trace(x, y)) {
				b = i;
				hand = true;
			}
			if (p.s_show == 1 && i == "cross1" && this.btns[i].trace(x, y)) {
				b = i;
				hand = true;
			}
			if (p.s_show > 1 && p.s_txt && i == "cross2" && this.btns[i].trace(x, y)) {
				b = i;
				hand = true;
			}
			if (p.s_show > 1 && i == "filter" && this.btns[i].trace(x, y)) {
				b = i;
				hand = true;
			}
			if (ui.scrollbar_show && sbar.scrollable_lines > 0 && ui.scrollbar_bt_show && (i == "scrollUp" || i == "scrollDn") && this.btns[i].trace(x, y)) b = i;
		}
		window.SetCursor(hand ? 32649 : y < p.s_h && p.s_show && x > qx + qh ? 32513 : 32512);
		if (this.b == b) return this.b;
		if (b) this.btns[b].changestate("hover");
		if (this.b) this.btns[this.b].changestate("normal");
		this.b = b;
		if (!this.b) tooltip("");
		return this.b;
	}

	var btn = function(x, y, w, h, type, ft, txt, stat, img_src, down, l_dn, l_up, tooltext) {
			this.draw = function(gr) {
				switch (type) {
				case 3:
					gr.SetInterpolationMode(2);
					if (this.img) gr.DrawImage(this.img, this.x, this.y, this.w, this.h, 0, 0, this.img.Width, this.img.Height);
					gr.SetInterpolationMode(0);
					break;
				case 4:
					gr.DrawLine(Math.round(this.x + bh * 0.67), Math.round(this.y + bh * 0.67), Math.round(this.x + bh * 0.27), Math.round(this.y + bh * 0.27), Math.round(bh / 10), RGBA(155, 155, 155, this.img));
					gr.DrawLine(Math.round(this.x + bh * 0.67), Math.round(this.y + bh * 0.27), Math.round(this.x + bh * 0.27), Math.round(this.y + bh * 0.67), Math.round(bh / 10), RGBA(155, 155, 155, this.img));
					break;
				case 5:
					gr.SetTextRenderingHint(4);
					gr.DrawString(txt, ft, this.img, this.x, this.y - 1, this.w, this.h, StringFormat(2, 1));
					break;
				default:
					if (this.img) gr.DrawImage(this.img, this.x + ft, txt, stat, stat, 0, 0, this.img.Width, this.img.Height, type == 1 ? 0 : 180);
					break;
				}
			}
			this.trace = function(x, y) {
				return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
			}
			this.lbtn_dn = function() {
				this.l_dn && this.l_dn(x, y);
			}
			this.lbtn_up = function() {
				this.l_up && this.l_up(x, y);
			}

			this.changestate = function(state) {
				switch (state) {
				case "hover":
					this.img = this.img_hover;
					tooltip(this.tooltext);
					break;
				case "down":
					this.img = this.img_down;
					break;
				default:
					this.img = this.img_normal;
					break;
				}
				window.RepaintRect(this.x, this.y, this.w, this.h);
			}
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
			this.l_dn = l_dn;
			this.l_up = l_up;
			this.tooltext = tooltext;
			this.img_normal = img_src.normal;
			this.img_hover = img_src.hover || this.img_normal;
			this.img_down = img_src.down || this.img_normal;
			this.img = this.img_normal;
		}

	this.refresh = function(upd) {
		if (upd) {
			bx = p.s_w1 - Math.round(ui.row_h * 0.75);
			bh = ui.row_h;
			by = Math.round((p.s_sp - bh * 0.4) / 2 - bh * 0.27);
			b_x = p.sbar_x;
			byUp = sbar.y;
			byDn = sbar.y + sbar.h - ui.but_h;
			fw = p.f_w[p.filter_by] + p.f_sw + 12;
			qx = ui.margin;
			qy = (p.s_sp - ui.row_h * 0.6) / 2;
			qh = ui.row_h * 0.6;
			b_x -= 1;
			scrollBut_x = (ui.but_h - ui.scr_but_w) / 2;
			scrollUp_y = -ui.arrow_pad + byUp + (ui.but_h - 1 - ui.scr_but_w) / 2;
			scrollDn_y = ui.arrow_pad + byDn + (ui.but_h - 1 - ui.scr_but_w) / 2;
		}
		if (ui.scrollbar_show && ui.scrollbar_bt_show) {
			this.btns.scrollUp = new btn(b_x, byUp, ui.but_h, ui.but_h, 1, scrollBut_x, scrollUp_y, ui.scr_but_w, {
				normal: scr[0],
				hover: scr[1],
				down: scr[2]
			}, false, function() {
				sbar.but(1);
			}, "", "");
			this.btns.scrollDn = new btn(b_x, byDn, ui.but_h, ui.but_h, 2, scrollBut_x, scrollDn_y, ui.scr_but_w, {
				normal: scr[0],
				hover: scr[1],
				down: scr[2]
			}, false, function() {
				sbar.but(-1);
			}, "", "");
		}
		if (p.s_show) {
			this.btns.s_img = new btn(qx, qy, qh, qh, 3, "", "", "", {
				normal: s_img[0],
				hover: s_img[1]
			}, false, function() {
				browser("\"" + fb.FoobarPath + "Query Syntax Help.html");
			}, "", "打开查询语法帮助");
			this.btns.cross1 = new btn(bx, by, bh, bh, 4, "", "", "", {
				normal: "150",
				hover: "220"
			}, false, "", function() {
				sL.clear();
			}, "");//清除搜索文本
			this.btns.cross2 = new btn(qx - bh * 0.2, by, bh, bh, 4, "", "", "", {
				normal: "200",
				hover: "255"
			}, false, "", function() {
				sL.clear();
			}, "");//清除搜索文本
			this.btns.filter = new btn(p.f_x1 - 12, 0, fw, p.s_sp, 5, p.f_but_ft, "▼", "", {
				normal: ui.txt_box & 0x99ffffff,
				hover: ui.txt_box & 0xe4ffffff
			}, false, "", function() {
				men.button(p.f_x1, p.s_h);
				but.refresh(true)
			}, "");//过滤
		}
	}
}
var but = new button_manager();

function menu_object() {
	var expand_limit = Math.min(Math.max(window.GetProperty("ADV.Limit Menu Expand: 10-6000", 500), 10), 6000),
		i = 0,
		MenuMap = [],
		MF_GRAYED = 0x00000001,
		MF_SEPARATOR = 0x00000800,
		MF_STRING = 0x00000000,
		xp = false;
	this.NewMenuItem = function(index, type, value) {
		MenuMap[index] = [{
			type: ""
		}, {
			value: 0
		}];
		MenuMap[index].type = type;
		MenuMap[index].value = value;
	};
	this.r_up = false;
	this.ConfigTypeMenu = function(Menu, StartIndex) {
		var Index = StartIndex,
			n = ["面板属性"];
		if (p.syncType) n.push("刷新");
		for (var i = 0; i < n.length; i++) {
			this.NewMenuItem(Index, "Config", i + 1);
			Menu.AppendMenuItem(MF_STRING, Index, n[i]);
			Index++;
		}
		return Index;
	}
	this.OptionsTypeMenu = function(Menu, StartIndex) {
		var Index = StartIndex;
		for (i = 0; i < p.menu.length; i++) {
			this.NewMenuItem(Index, "Options", i + 1);
			Menu.AppendMenuItem(MF_STRING, Index, p.menu[i]);
			Index++;
			if (i == p.menu.length - 1 || i == p.menu.length - 2) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
		}
		Menu.CheckMenuRadioItem(StartIndex, StartIndex + p.grp.length - 1, StartIndex + p.view_by);
		return Index;
	}
	this.PlaylistTypeMenu = function(Menu, StartIndex) {
		var Index = StartIndex,
			n = ["发送到当前列表", "插入到当前列表", "添加到当前列表", "折叠全部", "展开"];
		for (i = 0; i < 5; i++) {
			this.NewMenuItem(Index, "Playlist", i + 1);
			Menu.AppendMenuItem(i != 4 || xp ? MF_STRING : MF_GRAYED, Index, n[i]);
			if (i == 2) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
			Index++;
		}
		return Index;
	}
	this.FilterMenu = function(Menu, StartIndex) {
		var Index = StartIndex;
		for (i = 0; i < p.f_menu.length + 1; i++) {
			this.NewMenuItem(Index, "Filter", i + 1);
			Menu.AppendMenuItem(MF_STRING, Index, i != p.f_menu.length ? (!i ? "不" : "") + p.f_menu[i] : "总是重置滚动");
			if (i == p.f_menu.length) Menu.CheckMenuItem(Index++, p.reset);
			else Index++;
			if (i == p.f_menu.length - 1) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
		}
		Menu.CheckMenuRadioItem(StartIndex, StartIndex + p.f_menu.length - 1, StartIndex + p.filter_by);
		return Index;
	}

	this.button = function(x, y) {
		var menu = window.CreatePopupMenu(),
			idx, Index = 1;
		Index = this.FilterMenu(menu, Index);
		idx = menu.TrackPopupMenu(x, y);
		if (idx >= 1 && idx <= Index) {
			i = MenuMap[idx].value;
			switch (i) {
			case p.f_menu.length + 1:
				p.reset = !p.reset;
				if (p.reset) {
					p.search_paint();
					lib.refresh(true);
				}
				window.SetProperty("SYSTEM.Reset Tree", p.bypass);
				break;
			default:
				p.filter_by = i - 1;
				p.set_statistics_mode();
				p.calc_text();
				p.search_paint();
				lib.refresh(true);
				window.SetProperty("SYSTEM.Filter By", p.filter_by);
				break;
			}
		}
		menu.Dispose();
	}

	this.search = function(Menu, StartIndex, s, f, paste) {
		var Index = StartIndex,
			n = ["复制", "剪切", "粘贴"];
		for (i = 0; i < 3; i++) {
			this.NewMenuItem(Index, "Search", i + 1);
			Menu.AppendMenuItem(s == f && i < 2 || i == 2 && !paste ? MF_GRAYED : MF_STRING, Index, n[i]);
			Index++;
			if (i == 1) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
		}
		return Index;
	}

	this.search_menu = function(x, y, s, f, paste) {
		var menu = window.CreatePopupMenu(),
			idx, Index = 1;
		Index = this.search(menu, Index, s, f, paste);
		idx = menu.TrackPopupMenu(x, y);
		if (idx >= 1 && idx <= Index) {
			i = MenuMap[idx].value;
			switch (i) {
			case 1:
				sL.on_char(v.copy);
				break;
			case 2:
				sL.on_char(v.cut);
				break;
			case 3:
				sL.on_char(v.paste, true);
				break;
			}
		}
		menu.Dispose();
	}

	this.rbtn_up = function(x, y) {
		this.r_up = true;
		var Context = fb.CreateContextMenuManager(),
			FilterMenu = window.CreatePopupMenu(),
			idx, Index = 1,
			menu = window.CreatePopupMenu(),
			new_sel = false,
			OptionsMenu = window.CreatePopupMenu(),
			SettingMenu = window.CreatePopupMenu(),
			CountMenu = window.CreatePopupMenu(),
			DClickMenu = window.CreatePopupMenu(),
			PlaylistMenu = window.CreatePopupMenu(),
			show_context = false;
		var ie = pop.get_ix(x, y, true, false),
			ix = pop.row(y + sbar.delta),
			item = pop.tree[ix],
			nm = "",
			row = -1;
		xp = false;
		if (ie < pop.tree.length && ie != -1) xp = pop.tree[ie].item.length > expand_limit || pop.tree[ie].track ? false : true;
		if (xp && pop.tree.length) {
			var count = 0,
				m = 0;
			for (m = 0; m < pop.tree.length; m++) if (m == ie || pop.tree[m].sel) {
				if (row == -1 || m < row) {
					row = m;
					nm = (pop.tree[m].tr ? pop.tree[pop.tree[m].par].name : "") + pop.tree[m].name;
					nm = nm.toUpperCase();
				}
				count += pop.tree[m].item.length;
				xp = count <= expand_limit;
			}
		}
		if (y < p.s_h + p.sp && pop.tree.length > ix && ix >= 0 && (x < Math.round(ui.pad * item.tr) + ui.icon_w + ui.margin && (!item.track || p.base && item.tr == 0) || pop.check_ix(item, x, y, true))) {
			if (!item.sel) {
				new_sel = true;
				pop.get_selection(ix, "", true, true);
			}
			Index = this.PlaylistTypeMenu(menu, Index);
			menu.AppendMenuSeparator();
			show_context = true;
		}
		SettingMenu.AppendTo(menu, MF_STRING, "常用设定"); {
			SettingMenu.AppendMenuItem(MF_STRING, 5801, "自动折叠");
			SettingMenu.CheckMenuItem(5801, pop.auto ? 1 : 0);
			SettingMenu.AppendMenuItem(MF_STRING, 5802, "显示根节点");
			SettingMenu.CheckMenuItem(5802, p.base ? 1 : 0);
			SettingMenu.AppendMenuItem(MF_STRING, 5803, "显示节点音轨");
			SettingMenu.CheckMenuItem(5803, p.show_tracks ? 1 : 0);
			SettingMenu.AppendMenuItem(MF_STRING, 5804, "发送后自动播放");
			SettingMenu.CheckMenuItem(5804, pop.autoplay ? 1 : 0);
			SettingMenu.AppendMenuSeparator();
			CountMenu.AppendTo(SettingMenu, MF_STRING, "数目显示设置");{
				CountMenu.AppendMenuItem(MF_STRING, 5805, "不显示数目");
				CountMenu.AppendMenuItem(MF_STRING, 5806, "显示音轨数");
				CountMenu.AppendMenuItem(MF_STRING, 5807, "显示子项目数");
				CountMenu.CheckMenuRadioItem(5805, 5807, p.show_counts + 5805);
			}
			SettingMenu.AppendMenuSeparator();
			DClickMenu.AppendTo(SettingMenu, MF_STRING, "双击操作设置");{
				DClickMenu.AppendMenuItem(MF_STRING, 5808, "双击展开/折叠");
				DClickMenu.AppendMenuItem(MF_STRING, 5809, "双击播放");
				DClickMenu.AppendMenuItem(MF_STRING, 5810, "双击发送到播放列表");
				DClickMenu.CheckMenuRadioItem(5808, 5810, pop.dbl_action + 5808);
			}
		}
		if (show_context) {
			Index = this.OptionsTypeMenu(OptionsMenu, Index);
			OptionsMenu.AppendTo(menu, MF_STRING, "选项");
			Index = this.ConfigTypeMenu(OptionsMenu, Index);
			menu.AppendMenuSeparator();
			var items = fb.CreateHandleList();
			try {
				for (var l = 0; l < pop.sel_items.length; l++) items.Add(p.list.Item(pop.sel_items[l]));
			} catch (e) {}
			Context.InitContext(items);
			Context.BuildMenu(menu, 5000, -1);
		} else {
			menu.AppendMenuItem(MF_STRING, 5820, "折叠全部");
			menu.AppendMenuSeparator();
			Index = this.OptionsTypeMenu(menu, Index);
			Index = this.ConfigTypeMenu(menu, Index);
		}
		menu.AppendMenuSeparator();
		menu.AppendMenuItem(MF_STRING, 5900, "切换到简单播放列表");
		idx = menu.TrackPopupMenu(x, y);
		if (idx >= 1 && idx <= Index) {
			i = MenuMap[idx].value;
			switch (MenuMap[idx].type) {
			case "Playlist":
				switch (i) {
				case 1:
					if (new_sel) pop.clear();
					item.sel = true;
					pop.get_sel_items();
					pop.load(pop.sel_items, true, false, true, false, false);
					p.tree_paint();
					break;
				case 4:
					pop.collapseAll();
					break;
				case 5:
					pop.expand(ie, nm);
					break;
				default:
					if (new_sel) pop.clear();
					item.sel = true;
					pop.get_sel_items();
					pop.load(pop.sel_items, true, true, false, false, i == 2 ? true : false);
					break;
				}
				break;
			case "Options":
				lib.time.Reset();
				if (p.s_txt) lib.upd_search = true;
				p.fields(i < p.grp.length + 1 ? i - 1 : p.view_by, i - 1 < p.grp.length ? p.filter_by : i - 1 - p.grp.length);
				lib.get_library();
				lib.rootNodes();
				if (p.pn_h_auto && p.pn_h == p.pn_h_min && pop.tree[0]) pop.clear_child(pop.tree[0]);
				break;
			case "Config":
				switch (i) {
				case 1:
					window.ShowProperties();
					break;
				case 2:
					lib.update();
					break;
				}
				break;
			}
		}
		if (idx >= 5000 && idx <= 5800) {
			show_context && Context.ExecuteByID(idx - 5000);
		}
		if (idx > 5800) {
			switch (idx) {
			case 5801:
				pop.auto = !pop.auto;
				window.SetProperty(" Node: Auto Collapse", pop.auto);
				lib.rootNodes();
				break;
			case 5802:
				if(p.base) p.base = 0;
				else p.base = 2;
				window.SetProperty(" Node: Root Hide-0 All Music-1 View Name-2", p.base);
				lib.get_library();
				lib.rootNodes();
				break;
			case 5803:
				p.show_tracks = !p.show_tracks;
				window.SetProperty(" Node: Show Tracks", p.show_tracks);
				lib.rootNodes();
				break;
			case 5804:
				pop.autoplay = !pop.autoplay;
				window.SetProperty(" Playlist: Play On Send From Menu", pop.autoplay);
				break;
			case 5805:
				p.show_counts = 0;
				window.SetProperty(" Node: Item Counts 0-Hide 1-Tracks 2-Sub-Items", p.show_counts);
				lib.rootNodes();
				break;
			case 5806:
				p.show_counts = 1;
				window.SetProperty(" Node: Item Counts 0-Hide 1-Tracks 2-Sub-Items", p.show_counts);
				lib.rootNodes();
				break;
			case 5807:
				p.show_counts = 2;
				window.SetProperty(" Node: Item Counts 0-Hide 1-Tracks 2-Sub-Items", p.show_counts);
				lib.rootNodes();
				break;
			case 5808:
				pop.dbl_action = 0;
				window.SetProperty(" Text Double-Click: ExplorerStyle-0 Play-1 Send-2", pop.dbl_action);
				break;
			case 5809:
				pop.dbl_action = 1;
				window.SetProperty(" Text Double-Click: ExplorerStyle-0 Play-1 Send-2", pop.dbl_action);
				break;
			case 5810:
				pop.dbl_action = 2;
				window.SetProperty(" Text Double-Click: ExplorerStyle-0 Play-1 Send-2", pop.dbl_action);
				break;
			case 5820:
				pop.collapseAll();
				break;
			case 5900:
				window.NotifyOthers("switch_plview_libtree", true);
				break;
			}
		}
		this.r_up = false;
		Context.Dispose();
		FilterMenu.Dispose();
		menu.Dispose();
		OptionsMenu.Dispose();
		SettingMenu.Dispose();
		CountMenu.Dispose();
		DClickMenu.Dispose();
		PlaylistMenu.Dispose();
	}
}
var men = new menu_object();

function timers() {
	var timer_arr = ["clear_jsearch", "jsearch", "search", "search_cursor", "tt", "update"];
	for (var i = 0; i < timer_arr.length; i++) {
		this[timer_arr[i]] = false;
		this[timer_arr[i] + "i"] = i;
	}
	this.reset = function(timer, n) {
		if (timer) window.ClearTimeout(timer);
		this[timer_arr[n]] = false;
	}
	this.lib = function() {
		window.SetTimeout(function() {
			if (ui.w < 1 || !window.IsVisible) lib.upd = true;
			lib.get_library();
			lib.rootNodes();
		}, 5);
	}
	this.tooltip = function() {
		this.reset(this.tt, this.tti);
		this.tt = window.SetTimeout(function() {
			pop.deactivate_tooltip();
			timer.tt = false;
		}, 5000);
	}
	this.lib_update = function() {
		this.reset(this.update, this.updatei);
		this.update = window.SetTimeout(function() {
			lib.update();
			timer.update = false;
		}, 500);
	}
}
var timer = new timers();
timer.lib();

function on_char(code) {
	if (!p.s_show) return;
	sL.on_char(code);
	jS.on_char(code)
}

function on_focus(is_focused) {
	if (is_focused && pop.handle_list && pop.handle_list.Count) pop.selection_holder.SetSelection(pop.handle_list);
}

function on_key_down(vkey) {
	pop.on_key_down(vkey);
	if (!p.s_show) return;
	sL.on_key_down(vkey);
}

function on_key_up(vkey) {
	if (!p.s_show) return;
	sL.on_key_up(vkey)
}

function on_library_changed(origin) {
	switch (origin) {
	case 0:
	case 1:
		if (p.syncType) return;
		timer.lib_update();
		break;
	case 2:
		if (p.syncType || !p.statistics && fb.PlaybackTime > 59 && fb.PlaybackTime < 65) return;
		timer.lib_update();
		break;
	}
}

function on_mouse_lbtn_dblclk(x, y) {
	but.lbtn_dn(x, y);
	pop.lbtn_dblclk(x, y);
}

function on_mouse_lbtn_down(x, y) {
	if (p.s_show || ui.scrollbar_show) but.lbtn_dn(x, y);
	if (p.s_show) sL.lbtn_dn(x, y);
	pop.lbtn_dn(x, y);
	sbar.lbtn_dn(x, y);
}

function on_mouse_lbtn_up(x, y) {
	if (p.s_show) {
		sL.lbtn_up();
		but.lbtn_up(x, y);
	}
	sbar.lbtn_up(x, y);
}

function on_mouse_leave() {
	if (p.s_show || ui.scrollbar_show) but.leave();
	sbar.leave();
	pop.leave();
	if (uiHacks && ui_noborder && !fb_hWnd.IsMaximized()) {
		UIHacks.DisableSizing = false;
	}
}

function on_mouse_mbtn_up(x, y) {
	pop.mbtn_up(x, y);
}

function on_mouse_move(x, y) {
	if (p.m_x == x && p.m_y == y) return;
	if (p.s_show || ui.scrollbar_show) but.move(x, y);
	if (p.s_show) sL.move(x, y);
	pop.move(x, y);
	sbar.move(x, y);
	p.m_x = x;
	p.m_y = y;
}

function on_mouse_rbtn_up(x, y) {
	if (y < p.s_h && x > p.s_x && x < p.s_x + p.s_w2) {
		if (p.s_show) sL.rbtn_up(x, y);
		return true;
	} else {
		men.rbtn_up(x, y);
		return true;
	}
}

function on_mouse_wheel(step) {
	sbar.wheel(step, false);
	//if (!v.k(3)) sbar.wheel(step, false);
	//else ui.wheel(step);
}

function on_notify_data(name, info) {
	switch (name) {
	case "set_font":
		fbx_set[13] = info[0];
		fbx_set[14] = info[1];
		fbx_set[15] = info[2];
		window.Reload();
		break;
	case "set_ui_mode":
		ui_mode = info;
		ui.get_colors();
		if (p.s_show) {
			if (ui.node_style) pop.create_images();
			but.create_images();
			but.refresh();
		}
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
		ui.get_colors();
		if (ui.node_style) pop.create_images();
		window.Repaint();
		break;
	case "panel_show_shadow":
		show_shadow = info;
		window.RepaintRect(0,0,ui.w,5);
		window.RepaintRect(0,ui.h-5,ui.w,5);
		break;
	case "scrollbar_width":
		if (!ui.scrollbar_show) return;
		window.Reload();
		break;
	}
}

function on_script_unload() {
	but.on_script_unload();
}

function RGB(r, g, b) {
	return 0xff000000 | r << 16 | g << 8 | b;
}

function RGBA(r, g, b, a) {
	return a << 24 | r << 16 | g << 8 | b;
}

function StringFormat() {
	var a = arguments,
		h_align = 0,
		v_align = 0,
		trimming = 0,
		flags = 0;
	switch (a.length) {
	case 3:
		trimming = a[2];
	case 2:
		v_align = a[1];
	case 1:
		h_align = a[0];
		break;
	default:
		return 0;
	}
	return (h_align << 28 | v_align << 24 | trimming << 20 | flags);
}

//if (!window.GetProperty("SYSTEM.Software Notice Checked", false)) fb.ShowPopupMessage("媒体库目录树\n\n(啊哦~翻译不动了...)\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.");
//window.SetProperty("SYSTEM.Software Notice Checked", true);