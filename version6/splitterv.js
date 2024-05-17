window.DlgCode = DLGC_WANTALLKEYS;
let ww = 0;
let wh = 0;
let sp_drag = false;
var upperratio = 0;
PUpper.ShowCaption = PLower.ShowCaption = false;
var c_default_hl = 0, g_color_highlight = 0;

function get_colors() {
	g_color_background_default = window.GetColourDUI(ColorTypeDUI.background);
	g_color_background = g_color_background_default;
	var color_text = window.GetColourDUI(ColorTypeDUI.text);
	g_color_topbar = color_text & 0x09ffffff;
	dark_mode = isDarkMode(g_color_background);
	c_default_hl = window.GetColourDUI(ColorTypeDUI.highlight);
	g_color_highlight = c_default_hl;
}

function get_font() {
	var g_font = window.GetFontDUI(FontTypeDUI.playlists);
	zdpi = g_font.Size / 12;
	g_topbarheight = z(26) + 2;
};

//////////////
get_colors();
get_font();

function on_size() {
    ww = window.Width;
	wh = window.Height;
	if(upperratio && wh) {
		var uh_calc = Math.round((wh-2)*upperratio);
		PUpper.Move(0, 0, ww, uh_calc);
		PLower.Move(0, uh_calc + 2, ww, wh - uh_calc - 2);
	} else{
		PUpper.Move(0, 0, ww, PUpper.Height);
		PLower.Move(0, PUpper.Height + 2, ww, wh - PUpper.Height - 2);
	}
	if(wh) upperratio = PUpper.Height/(wh-2);
}

function on_paint(gr) {
    gr.FillSolidRect(0, 0, ww, wh, g_color_background);
	if(PLower.Name == "ESLyric"){
		var line_w = Math.round(ww / 2);
		gr.FillGradRect(0, PUpper.Height, line_w, 1, 0, RGBA(0, 0, 0, 0), RGBA(0, 0, 0, 65), 1.0);
		gr.FillGradRect(line_w, PUpper.Height, ww - line_w, 1, 0, RGBA(0, 0, 0, 65), RGBA(0, 0, 0, 0), 1.0);
	} else {
		gr.FillSolidRect(0, PUpper.Height, ww, 1, RGBA(0, 0, 0, 80));
		gr.FillSolidRect(0, PUpper.Height+1, ww, 1, RGBA(0, 0, 0, 160));
	}
}

function on_mouse_move(x, y) {
	if(x > 0 && y > 0 && x < ww && y < wh) {
		window.SetCursor(32645);//IDC_SIZE
		if(sp_drag){
			PUpper.Move(0, 0, ww, y);
			PLower.Move(0, y + 2, ww, wh - y - 2);
			window.Repaint();
			upperratio = PUpper.Height/(wh-2);
		}
	}
}

function on_mouse_lbtn_down(x, y) {
	if(y > PUpper.Height - 1 && x > 0 && y < PUpper.Height + 3 && x < ww) sp_drag = true;
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
					if(info.length == 3) g_color_background = blendColors(g_color_background_default, RGB(info[0], info[1], info[2]), 0.1);
					else g_color_background = blendColors(g_color_background_default, RGB(info[3], info[4], info[5]), 0.1);
				} else{
					if(g_color_background_default != 4294967295) g_color_background = blendColors(g_color_background_default, RGB(info[0], info[1], info[2]), 0.1);
				}
			}
			window.Repaint();
		}
		break;
	}
}