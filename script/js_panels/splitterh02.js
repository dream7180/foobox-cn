window.DefinePanel('Jsplitter H02');
include(fb.ProfilePath + 'foobox\\js_common\\common.js');
window.DlgCode = DLGC_WANTALLKEYS;
let ww = 0, wh = 0, minw = 1;
let m_x = 0, m_y = 0;
let sp_drag = false;
// 拖动时按帧合并 Move+Repaint，避免每次鼠标移动都重排子面板
let move_timer = false;
let drag_x = 0;
var PLeft = window.GetPanel('jsspm');
var PRight = window.GetPanel('jsspv');
var leftratio = window.GetProperty("LeftPane.Ratio", 0.195);
//var hasTopbar = true;

function apply_drag() {
	move_timer = false;
	PLeft.Move(0, 0, drag_x, wh);
	PRight.Move(drag_x + 2, 0, ww - drag_x - 2, wh);
	window.Repaint();
};
PLeft.ShowCaption = PRight.ShowCaption = false;

function get_colors() {
	g_color_background_default = window.GetColourDUI(ColorTypeDUI.background);
	g_color_background = g_color_background_default;
	let dark_mode = isDarkMode(g_color_background);
	if(dark_mode){
		c_line = RGBA(0,0,0,100);
		g_color_topbar = RGBA(0,0,0,30);
	}else{
		c_line = RGBA(0,0,0,75);
		g_color_topbar = RGBA(0,0,0,15);
	}
}

function get_font() {
	let g_font = window.GetFontDUI(FontTypeDUI.playlists);
	zdpi = g_font.Size / 12;
	g_topbarheight = z(26) + 2;
	minw = z(50);
};

//////////////
get_colors();
get_font();

function on_size() {
    ww = window.Width;
	wh = window.Height;
	if (!ww || !wh) return;
	window.SetTimeout(function() {
		var lw_calc = Math.round((ww-2)*leftratio);
		PLeft.Move(0, 0, lw_calc, wh);
		PRight.Move(lw_calc + 2, 0, ww - lw_calc - 2, wh);
		window.Repaint();
	}, 20);
}

function on_paint(gr) {
	if (!ww || !wh) return;
    gr.FillSolidRect(0, 0, ww, wh, g_color_background);
	//if(hasTopbar){
		gr.FillSolidRect(0, 0, ww, g_topbarheight - 2, g_color_topbar);
		gr.DrawLine(0, g_topbarheight, ww, g_topbarheight, 1, RGBA(0, 0, 0, 45));
	//}
	gr.DrawLine(PLeft.Width + 1, 0, PLeft.Width + 1, wh, 1, c_line);
}

function on_mouse_move(x, y) {
	if(m_x == x && m_y == y) return;
	if(x > minw && y > 0 && x < ww - minw && y < wh) {
		window.SetCursor(32644);//IDC_SIZEWE
		if(sp_drag){
			drag_x = x;
			if (!move_timer) move_timer = window.SetTimeout(apply_drag, 20);
		}
	}
	m_x = x;
	m_y = y;
}

function on_mouse_lbtn_down(x, y) {
	if(x > PLeft.Width - 1 && y > 0 && x < PLeft.Width + 3 && y < wh) {
		sp_drag = true;
		drag_x = PLeft.Width;
	}
}

function on_mouse_lbtn_up(x, y) {
	if(sp_drag){
		sp_drag = false;
		// 松开时丢弃未执行的帧定时器，并立即落到最后一次位置
		if (move_timer) window.ClearTimeout(move_timer);
		apply_drag();
		leftratio = PLeft.Width/(ww - 2);
		window.SetProperty("LeftPane.Ratio", Math.round(leftratio*100000)/100000); // 松开时写一次，避免拖动中每帧写盘
	}
}

function on_mouse_leave() {
	if(!sp_drag) window.SetCursor(32512);//IDC_ARROW
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