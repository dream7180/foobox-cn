include(fb.ProfilePath + 'foobox\\script\\js_common\\common.js');
window.DlgCode = DLGC_WANTALLKEYS;
let ww = 0, wh = 0, minh = 50;
let m_x = 0, m_y = 0;
let sp_drag = false;
var upperratio = 0;
PUpper.ShowCaption = PLower.ShowCaption = false;
let splitter_vis = (PLower.Text == "spectrogram") ? 1 : 0;

function get_colors() {
	g_color_background_default = window.GetColourDUI(ColorTypeDUI.background);
	g_color_background = g_color_background_default;
}

//////////////
get_colors();

function on_size() {
    ww = window.Width;
	wh = window.Height;
	if (!ww || !wh) return;
	window.SetTimeout(function() {
		if(upperratio) {
			var uh_calc = Math.round((wh-2)*upperratio);
			PUpper.Move(0, 0, ww, uh_calc);
			PLower.Move(splitter_vis, uh_calc + 2, ww - splitter_vis*2, wh - uh_calc - 2);
		} else{
			PUpper.Move(0, 0, ww, PUpper.Height);
			PLower.Move(splitter_vis, PUpper.Height + 2, ww - splitter_vis*2, wh - PUpper.Height - 2);
		}
		upperratio = PUpper.Height/(wh-2);
		window.Repaint();
	}, 50);
}

function on_paint(gr) {
	if (!ww || !wh) return;
    gr.FillSolidRect(0, 0, ww, wh, g_color_background);
	if(splitter_vis){
		gr.FillGradRect(ww-1, 0, 1, wh, 0, c_black, c_black, 1);//bug of win10 border
		gr.FillGradRect(0, 0, 1, wh, 0, c_black, c_black, 1);//bug of win10 border
	}
	gr.FillSolidRect(0, PUpper.Height, ww, 1, RGBA(0, 0, 0, 80));
	gr.FillSolidRect(0, PUpper.Height+1, ww, 1, RGBA(0, 0, 0, 160));
}

function on_mouse_move(x, y) {
	if(m_x == x && m_y == y) return;
	if(x > 0 && y > minh && x < ww && y < wh - minh) {
		window.SetCursor(32645);//IDC_SIZE
		if(sp_drag){
			PUpper.Move(0, 0, ww, y);
			PLower.Move(splitter_vis, y + 2, ww - splitter_vis*2, wh - y - 2);
			window.Repaint();
			upperratio = PUpper.Height/(wh-2);
		}
	}
	m_x = x;
	m_y = y;
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
		if(!info) {
			g_color_background = g_color_background_default;
			window.Repaint();
		}else if(info.length > 3){
			g_color_background = RGB(info[3], info[4], info[5]);
			window.Repaint();
		}
		break;
	}
}
