window.DefinePanel('Jsplitter V01');
include(fb.ProfilePath + 'foobox\\script\\js_common\\common.js');
var PUpper = window.GetPanel('infoart');
var PLower = window.GetPanel('ESLProp');
window.DlgCode = DLGC_WANTALLKEYS;
let ww = 0;
let wh = 0;
let sp_drag = false;
var upperratio = 0;
var linecolor, divcolor;
var draw_splitter = window.GetProperty("Splitter.on", true);
var splitter_hover = false;
PUpper.ShowCaption = PLower.ShowCaption = false;
var c_default_hl = 0, g_color_highlight = 0;

function get_colors() {
	g_color_background_default = window.GetColourDUI(ColorTypeDUI.background);
	g_color_background = g_color_background_default;
	dark_mode = isDarkMode(g_color_background);
	if(dark_mode){
		linecolor = blendColors(g_color_background, RGB(0,0,0), 0.45);
		divcolor = RGBA(0, 0, 0, 120);
	}else{
		linecolor = blendColors(g_color_background, RGB(0,0,0), 0.3);
		divcolor = RGBA(0, 0, 0, 75);
	}
	c_default_hl = window.GetColourDUI(ColorTypeDUI.highlight);
	g_color_highlight = c_default_hl;
}

//////////////
get_colors();

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
		var line_w = Math.round(ww / 2);
	if(draw_splitter){
		gr.FillGradRect(0, PUpper.Height, line_w, 1, 0, g_color_background, linecolor, 1.0);
		gr.FillGradRect(line_w, PUpper.Height, ww - line_w, 1, 0, linecolor, g_color_background, 1.0);
		gr.FillSolidRect(line_w, PUpper.Height, 1, 1, linecolor);
	} else if(splitter_hover) gr.DrawLine(0, PUpper.Height, ww, PUpper.Height, 1, divcolor);
	
}

function on_mouse_move(x, y) {
	var splitter_tmp = splitter_hover;
	if(x > 0 && y > 0 && x < ww && y < wh) {
		window.SetCursor(32645);//IDC_SIZE
		if(sp_drag){
			PUpper.Move(0, 0, ww, y);
			PLower.Move(0, y + 2, ww, wh - y - 2);
			window.Repaint();
			upperratio = PUpper.Height/(wh-2);
		}
		splitter_hover = true;
	} else splitter_hover = false;
	if(!draw_splitter && (splitter_tmp != splitter_hover)) window.RepaintRect(0, PUpper.Height - 1, ww, 3);
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

function on_mouse_leave(){
	splitter_hover = false;
	if(!draw_splitter) window.RepaintRect(0, PUpper.Height - 1, ww, 3);
}

function on_colours_changed() {
	get_colors();
	window.Repaint();
}

function on_notify_data(name, info) {
	switch (name) {
	case "MetadataInfo":
		draw_splitter = info;
		window.SetProperty("Splitter.on", draw_splitter);
		window.Repaint();
		break;
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
					linecolor = blendColors(g_color_background, RGB(0,0,0), 0.51);
				} else{
					if(g_color_background_default != 4294967295) {
						g_color_background = blendColors(g_color_background_default, RGB(info[0], info[1], info[2]), 0.24);
						linecolor = blendColors(g_color_background, RGB(0,0,0), 0.255);
					}
				}
			}
			window.Repaint();
		}
		break;
	}
}
