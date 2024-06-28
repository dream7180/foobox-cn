include(fb.ProfilePath + 'foobox\\script\\js_common\\common.js');
window.DlgCode = DLGC_WANTALLKEYS;
let ww = 0;
let wh = 0;
let sp_drag = false;
var upperratio = 0;
PUpper.ShowCaption = PLower.ShowCaption = false;

function get_colors() {
	g_color_background = window.GetColourDUI(ColorTypeDUI.background);
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
	gr.FillSolidRect(0, PUpper.Height, ww, 1, RGBA(0, 0, 0, 80));
	gr.FillSolidRect(0, PUpper.Height+1, ww, 1, RGBA(0, 0, 0, 160));
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
