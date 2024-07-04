include(fb.ProfilePath + 'foobox\\script\\js_common\\common.js');
window.DlgCode = DLGC_WANTALLKEYS;
let ww = 0;
let wh = 0;
let sp_drag = false;
var leftratio = 0;
PLeft.ShowCaption = PRight.ShowCaption = false;
var c_default_hl = 0, g_color_highlight = 0;

function get_colors() {
	g_color_background_default = window.GetColourDUI(ColorTypeDUI.background);
	g_color_background = g_color_background_default;
	dark_mode = isDarkMode(g_color_background);
	if(dark_mode){
		c_line = RGBA(0,0,0,100);
		g_color_topbar = RGBA(0,0,0,30);
	}else{
		c_line = RGBA(0,0,0,75);
		g_color_topbar = RGBA(0,0,0,15);
	}
	c_default_hl = window.GetColourDUI(ColorTypeDUI.highlight);
	g_color_highlight = c_default_hl;
}

function get_font() {
	let g_font = window.GetFontDUI(FontTypeDUI.playlists);
	zdpi = g_font.Size / 12;
	g_topbarheight = z(26) + 2;
};

//////////////
get_colors();
get_font();

function on_size() {
    ww = window.Width;
	wh = window.Height;
	if(leftratio && ww) {
		var lw_calc = Math.round((ww-2)*leftratio);
		PLeft.Move(0, 0, lw_calc, wh);
		PRight.Move(lw_calc + 2, 0, ww - lw_calc - 2, wh);
	} else{
		PLeft.Move(0, 0, PLeft.Width, wh);
		PRight.Move(PLeft.Width + 2, 0, ww - PLeft.Width - 2, wh);
	}
	if(ww) leftratio = PLeft.Width/(ww-2);
}

function on_paint(gr) {
    gr.FillSolidRect(0, 0, ww, wh, g_color_background);
	if(hasTopbar){
		gr.FillSolidRect(0, 0, ww, g_topbarheight - 2, g_color_topbar);
		gr.DrawLine(0, g_topbarheight, ww, g_topbarheight, 1, RGBA(0, 0, 0, 45));
	}
	gr.DrawLine(PLeft.Width + 1, 0, PLeft.Width + 1, wh, 1, c_line);
}

function on_mouse_move(x, y) {
	if(x > 0 && y > 0 && x < ww && y < wh) {
		window.SetCursor(32644);//IDC_SIZE
		if(sp_drag){
			PLeft.Move(0, 0, x, wh);
			PRight.Move(x + 2, 0, ww - x - 2, wh);
			window.Repaint();
			leftratio = PLeft.Width/(ww -2);
		}
	}
}

function on_mouse_lbtn_down(x, y) {
	if(x > PLeft.Width - 1 && y > 0 && x < PLeft.Width + 3 && y < wh) sp_drag = true;
}

function on_mouse_lbtn_up(x, y) {
	sp_drag = false;
}

function on_mouse_rbtn_up() {
	return true;
}

function on_colours_changed() {
	get_colors();
	window.Repaint();
}

function on_font_changed() {
	get_font();
	window.Repaint();
}

function on_notify_data(name, info) {
	switch (name) {
	case "color_scheme_updated":
		var c_hl_tmp = g_color_highlight;
		if(info) g_color_highlight = RGB(info[0], info[1], info[2]);
		else {
			g_color_highlight = c_default_hl;
			g_color_background = g_color_background_default;
		}
		if(g_color_highlight != c_hl_tmp){
			if(info){
				if(dark_mode){
					if(info.length == 3) g_color_background = blendColors(g_color_background_default, RGB(info[0], info[1], info[2]), 0.24);
					else g_color_background = blendColors(g_color_background_default, RGB(info[3], info[4], info[5]), 0.24);
				} else{
					if(g_color_background_default != 4294967295) g_color_background = blendColors(g_color_background_default, RGB(info[0], info[1], info[2]), 0.24);
				}
			}
			window.Repaint();
		}
		break;
	}
}