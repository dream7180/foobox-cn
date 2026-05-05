window.DefinePanel('Jsplitter R02');
window.DlgCode = 0x0004;
let ww = 0;
let wh = 0;
var INFO, ESL, active_p;
var timer_swp = false;
var autosw = window.GetProperty("Auto.Switch", true);

function RGB(r, g, b) {
	return (0xff000000 | (r << 16) | (g << 8) | (b))
}

function get_colors() {
	g_color_background_default = window.GetColourDUI(1);
	g_color_background = g_color_background_default;
}

function get_panel() {
	INFO = window.GetPanel('TrackProp');
	ESL = window.GetPanel('ESLyric');
	if(!autosw){
		if(ESL.Hidden) active_p = INFO;
		else active_p = ESL;
	}
	else{
		if(!fb.IsPlaying) {
			active_p = INFO;
			if(INFO.Hidden) INFO.Show(true);
			if(!ESL.Hidden) ESL.Show(false);
		}
		else {
			active_p = ESL;
			if(ESL.Hidden) ESL.Show(true);
			if(!INFO.Hidden) INFO.Show(false);
		}
	}
	INFO.ShowCaption = ESL.ShowCaption = false;
}

function swith_panel(pno) {
	active_p.Show(false);
	if(pno == 2) active_p = ESL;
	else active_p = INFO;
	active_p.Show(true);
}

//////////////
get_panel();
get_colors();

function on_size() {
    ww = window.Width;
	wh = window.Height;
	if (!ww || !wh) return;
	window.SetTimeout(function() {
		try{
			ESL.Move(0, 0, ww, wh);
			INFO.Move(0, 0, ww, wh);
		} catch(e){//快速设置布局的bug
			get_panel();
		}
		window.Repaint();
	}, 50);
}

function on_paint(gr) {
	if (!ww || !wh) return;
    gr.FillSolidRect(0, 0, ww, wh, g_color_background);
}

function on_playback_new_track(info) {
	if(!autosw) return;
	timer_swp && window.ClearTimeout(timer_swp);
	timer_swp = false;
	swith_panel(2);
}

function on_playback_stop(reason) {
	if(!autosw) return;
	timer_swp = window.SetTimeout(function() {
		swith_panel(1);
		timer_swp && window.ClearTimeout(timer_swp);
		timer_swp = false;
	}, 150); 
}

function on_notify_data(name, info) {
	switch (name) {
	case "SwitchESLProp":
		if(INFO.Hidden) swith_panel(1);
		else swith_panel(2);
		break;
	case "AutoESLProp":
		autosw = info;
		window.SetProperty("Auto.Switch", autosw);
		break;
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
