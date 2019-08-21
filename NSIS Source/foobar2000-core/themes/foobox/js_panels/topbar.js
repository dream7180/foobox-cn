//foobox http://blog.sina.com.cn/dream7180
var fbx_set = [];
window.NotifyOthers("get_fbx_set", fbx_set);
//===============
var ww = 0,
	wh = 0,
	line_y;
var g_fname, g_fsize, g_fstyle;
var ui_noborder = fbx_set[19];
ui_noborder = (uiHacks && ui_noborder);
var zdpi = fbx_set[9];
var IFormat = DT_RIGHT | DT_BOTTOM | DT_CALCRECT | DT_NOPREFIX | DT_END_ELLIPSIS;
var search_hover = 0;
var imgw = Math.floor(38*zdpi);
var x_offset = 20*zdpi, btn_space = Math.floor(10*zdpi), spacer = Math.floor(9*zdpi);
var img_close,img_max,img_min,img_playlist,img_artist,img_album,img_open,img_lrc,img_lib,img_lib_2,img_fullscreen,img_genre,img_shp,img_settings;
var auto_sw = fbx_set[26];
var btn_fullscr = fbx_set[27];
var JSSBLock = false;
var show_vis = utils.CheckComponent("foo_vis_shpeck", true);
//
var VBE;
try {
	VBE = new ActiveXObject("ScriptControl");
	VBE.Language = "VBScript";
} catch (e) {
	PopMessage(0, "Can not create ActiveX object (ScriptControl), some functions are not available.\nPlease check your system authorities.", 1);
}

function PopMessage(method, text, type) {
	if (method == 1) {
		if (VBE) {
			var s = VBE.eval("MsgBox(\"" + text + "\", " + type + ", \"About foobox\")");
			return s;
		} else type = type == 32 ? 2 : (type == 16 ? 1 : 0);
	}
	fb.ShowPopupMessage(text, "foobox help", type);
}

function AboutFoobox() {
	var shellObj = new ActiveXObject("Shell.Application");
	var HelpFile = fb.FoobarPath + "foobox帮助.chm";
	if (utils.FileTest(HelpFile, "e")) shellObj.ShellExecute('"' + HelpFile + '"', "", "", "open", 1);
	else PopMessage(1, "找不到文件: \'" + HelpFile + "\'", 16);
}
//===============
var show_playlist = window.GetProperty("Panel.show.playlist", true);
var show_browser = window.GetProperty("Panel.show.cover.browser", false);
var show_coverlrc = window.GetProperty("Panel.show.coverlrc", true);
var cover_type = window.GetProperty("Browser.cover.type", 2); //2-artist, 1-album, 3-genre
var show_pl_setting = false;
var show_libtree = window.GetProperty("Panel.show.library.tree", true);

var panel = {
	PSS: "PSSWindowContainer",
	WSHMP: "uie_wsh_panel_mod_plus_class",
	SHP: "{336638BD-8647-42CA-8A2F-2FB9C02A802F}",
	ESL: "uie_eslyric_wnd_class"
}
var GetWnd = utils.CreateWND(window.ID);
var fb_hWnd = GetWnd.GetAncestor(2);

var PLS = fb_hWnd.GetChild(panel.PSS, 4);
var LIBB = fb_hWnd.GetChild(panel.WSHMP, 4);
var COVERLRC = fb_hWnd.GetChild(panel.PSS, 6);
var LIBTREE = fb_hWnd.GetChild(panel.WSHMP, 7);
var VIEWPL = fb_hWnd.GetChild(panel.WSHMP, 8);
if(show_vis) {
	var SHP = fb_hWnd.GetChild(panel.SHP, 1);
	if(SHP == null) show_vis = 0;
}

var img_min, img_max, img_close;
var buttons = Array();
var hbtn = false;
var search_x = x_offset + imgw*(6+show_vis) + btn_space*(6+show_vis)  + spacer,
	search_y = 11*zdpi, x_lib = 0;
search_w = 150*zdpi, search_h = 22*zdpi;
window.DlgCode = DLGC_WANTALLKEYS;
get_font();
get_colors();
init_icons();
init_panels();
init_buttons();
// 搜索框
var g_searchbox = new searchbox();

function on_size() {
	ww = window.Width;
	wh = window.Height;
	line_y = wh - 3;
	spacer = Math.min(wh/2, Math.floor(9*zdpi));
	search_y = Math.min(wh/2, 11*zdpi);
	BtnSetSize_onsize();
	caption_n_full(ui_noborder);
	g_searchbox.setSize(search_x, search_y, search_w, search_h);
	g_searchbox.inputbox.visible = true;
}

function on_paint(gr) {
	var tab_color = fbx_set[5];
	var c_separator = RGBA(0,0,0,65);
	gr.FillSolidRect(0, 0, ww, wh, bg_color);
	if (ui_noborder) {
		buttons[0].Paint(gr);
		buttons[1].Paint(gr);
		buttons[2].Paint(gr);
	}
	for (i = 3; i < buttons.length - 1; i++) buttons[i].Paint(gr);
	if(btn_fullscr) buttons[12 + show_vis].Paint(gr);
	
	tmp_x = x_offset + imgw*(4+show_vis) + btn_space*(3.5+show_vis) + spacer/2;
	gr.DrawLine(tmp_x, 13*zdpi, tmp_x, 33*zdpi, 1, c_separator);
	tmp_x = x_lib + img_lrc.Width + spacer/2 + btn_space/2;
	gr.DrawLine(tmp_x, 13*zdpi, tmp_x, 33*zdpi, 1, c_separator);

	if (show_playlist) gr.FillSolidRect(x_offset - btn_space/2, line_y, imgw + btn_space, 3, tab_color);
	else if(show_browser){
		switch(cover_type){
			case 2:
				gr.FillSolidRect(x_offset + imgw + btn_space/2, line_y, imgw + btn_space, 3, tab_color);
				break;
			case 1:
				gr.FillSolidRect(x_offset + imgw*2 + btn_space*1.5, line_y, imgw + btn_space, 3, tab_color);
				break;
			case 3: 
				gr.FillSolidRect(x_offset + imgw*3 + btn_space*2.5, line_y, imgw + btn_space, 3, tab_color);
				break;
		}
	} else if (show_pl_setting){
		gr.FillSolidRect(x_offset + imgw*(show_vis+5) + btn_space*(4.5+show_vis)  + spacer, line_y, imgw + btn_space, 3, tab_color);
	}
	else if(show_vis) gr.FillSolidRect(x_offset + imgw*4 + btn_space*3.5, line_y, imgw + btn_space, 3, tab_color);

	if (show_coverlrc) gr.FillSolidRect(x_lib - img_lrc.Width - btn_space*1.5, line_y, img_lrc.Width + btn_space, 3, tab_color);
	else gr.FillSolidRect(x_lib - btn_space/2, line_y, img_lrc.Width + btn_space, 3, tab_color);

	// 搜索框
	if (g_searchbox.inputbox.visible) {
		g_searchbox.draw(gr);
	}
	gr.DrawLine(0, 0, ww, 0, 1, bg_color);
}

function auto_switch_lib(){
	if(auto_sw){
		show_coverlrc = false;
		window.SetProperty("Panel.show.coverlrc", show_coverlrc);
		COVERLRC.Show(0);
		show_libtree = false;
		window.SetProperty("Panel.show.library.tree", show_libtree);
		LIBTREE.Show(0);
		VIEWPL.Show(1);
		update_libBtn();
	}
}

function auto_switch_libico(){
	if(auto_sw && !show_libtree){
		show_libtree = true;
		window.SetProperty("Panel.show.library.tree", show_libtree);
		update_libBtn();
	}
}

function switch_plview_libtree(){
	show_libtree = !show_libtree;
	if(show_libtree) {
		LIBTREE.Show(1);
		VIEWPL.Show(0);
	}
	else {
		VIEWPL.Show(1);
		LIBTREE.Show(0);
	}
	window.SetProperty("Panel.show.library.tree", show_libtree);
	update_libBtn();
}

function on_mouse_move(x, y) {
	var state_sum = 0;
	var window_ctl_state =  0;
	for (i = 3; i < buttons.length; i++) {
		if (buttons[i].MouseMove(x, y)) {
			hbtn = true;
			state_sum += 1;
		}
	}
	if (g_searchbox.inputbox.visible) {
		if(g_searchbox.on_mouse("move", x, y)){
			state_sum += 1;
		}
	}
	if (ui_noborder) {
		for (var i = 0; i < 3; i++) {
			if (buttons[i].MouseMove(x, y)) {
				hbtn = true;
				state_sum += 1;
				window_ctl_state += 1;
			}
		}
		var window_ctl_state = window_ctl_state + buttons[12 + show_vis].state;
		if (state_sum > 0) mouseInControl = true;
		else mouseInControl = false;
		if(!fb_hWnd.IsMaximized()){
			if(window_ctl_state > 0) UIHacks.DisableSizing = true;
			else UIHacks.DisableSizing = false;
		} else UIHacks.DisableSizing = true;
		set_uihacks_caption(ui_noborder);
		//if(x > (search_x+search_w) && x < count_x) {
		//	utils.ReleaseCapture();
		//	fb_hWnd.SendMsg(0xA1, 2, 0);
		//}
	}
}

function on_mouse_lbtn_down(x, y) {
	for (i = 4; i < buttons.length; i++) {
		buttons[i].MouseDown(x, y);
	}
	if (buttons[3].MouseDown(x, y)) {
		hbtn = false;
		buttons[3].OnClick(x_lib + img_lrc.Width + spacer + btn_space, 35*zdpi);
		mouseInControl = false;
		set_uihacks_caption(ui_noborder);
	}

	if (ui_noborder) {
		for (i = 0; i < 3; i++) {
			buttons[i].MouseDown(x, y);
		}
	}
	if (g_searchbox.inputbox.visible) {
		g_searchbox.on_mouse("lbtn_down", x, y);
	}
}

function on_mouse_lbtn_up(x, y) {
	if (buttons[5].MouseUp()) {
		PLS.Show(1);
		LIBB.Show(0);
		if(show_vis) SHP.Show(0);
		show_playlist = true;
		show_browser = false;
		show_pl_setting = false;
		window.SetProperty("Panel.show.playlist", show_playlist);
		window.SetProperty("Panel.show.cover.browser", show_browser);
		window.NotifyOthers("jsplaylistview_show_playlist", true);
		if(auto_sw){
			show_coverlrc = true;
			window.SetProperty("Panel.show.coverlrc", show_coverlrc);
			COVERLRC.Show(1);
			LIBTREE.Show(0);
			VIEWPL.Show(0);
		}
		window.RepaintRect(0, wh-3, ww, 3);
		auto_switch_libico();
	}
	if (buttons[6].MouseUp()) {
		if(JSSBLock && show_browser) return;
		PLS.Show(0);
		LIBB.Show(1);
		if(show_vis) SHP.Show(0);
		show_playlist = false;
		show_browser = true;
		show_pl_setting = false;
		if(!JSSBLock) cover_type = 2;
		window.SetProperty("Panel.show.playlist", show_playlist);
		window.SetProperty("Panel.show.cover.browser", show_browser);
		window.SetProperty("Browser.cover.type", cover_type);
		window.NotifyOthers("Set_browser_cover", cover_type);
		auto_switch_lib();
		window.RepaintRect(0, wh-3, ww, 3);
	}
	if (buttons[7].MouseUp()) {
		if(JSSBLock && show_browser) return;
		PLS.Show(0);
		LIBB.Show(1);
		if(show_vis) SHP.Show(0);
		show_playlist = false;
		show_browser = true;
		show_pl_setting = false;
		if(!JSSBLock) cover_type = 1;
		window.SetProperty("Panel.show.playlist", show_playlist);
		window.SetProperty("Panel.show.cover.browser", show_browser);
		window.SetProperty("Browser.cover.type", cover_type);
		window.NotifyOthers("Set_browser_cover", cover_type);
		auto_switch_lib();
		window.RepaintRect(0, line_y, ww, 3);
	}
	if (buttons[8].MouseUp()) {
		if(JSSBLock && show_browser) return;
		PLS.Show(0);
		LIBB.Show(1);
		if(show_vis) SHP.Show(0);
		show_playlist = false;
		show_browser = true;
		show_pl_setting = false;
		if(!JSSBLock) cover_type = 3;
		window.SetProperty("Panel.show.playlist", show_playlist);
		window.SetProperty("Panel.show.cover.browser", show_browser);
		window.SetProperty("Browser.cover.type", cover_type);
		window.NotifyOthers("Set_browser_cover", cover_type);
		auto_switch_lib();
		window.RepaintRect(0, line_y, ww, 3);
	}
	if (buttons[9].MouseUp()) {
		PLS.Show(1);
		LIBB.Show(0);
		if(show_vis) SHP.Show(0);
		show_pl_setting = true;
		show_playlist = false;
		show_browser = false;
		//window.SetProperty("Panel.show.playlist", show_playlist);
		//window.SetProperty("Panel.show.cover.browser", show_browser);
		window.NotifyOthers("jsplaylistview_show_playlist", false);
		window.RepaintRect(0, line_y, ww, 3);
	}
	if (show_vis && buttons[12].MouseUp()) {
		PLS.Show(0);
		LIBB.Show(0);
		SHP.Show(1);
		show_playlist = false;
		show_browser = false;
		show_pl_setting = false;
		window.SetProperty("Panel.show.playlist", show_playlist);
		window.SetProperty("Panel.show.cover.browser", show_browser);
		window.RepaintRect(0, line_y, ww, 3);
	}
	if (buttons[4].MouseUp()) fb.RunMainMenuCommand("打开...");
	//buttons[5].MouseUp();
	if (buttons[10].MouseUp()) {
		COVERLRC.Show(1);
		LIBTREE.Show(0);
		VIEWPL.Show(0);
		show_coverlrc = true;
		window.SetProperty("Panel.show.coverlrc", show_coverlrc);
		//show_libtree = false;
		//window.SetProperty("Panel.show.library.tree", show_libtree);
		window.RepaintRect(0, line_y, ww, 3);
	}
	if (buttons[11].MouseUp()) {
		if(show_coverlrc){
			COVERLRC.Show(0);
			if(show_libtree) {
				LIBTREE.Show(1);
				VIEWPL.Show(0);
			}
			else {
				VIEWPL.Show(1);
				LIBTREE.Show(0);
			}
			show_coverlrc = false;
			window.SetProperty("Panel.show.coverlrc", show_coverlrc);
			window.RepaintRect(0, line_y, ww, 3);
		}
		else {
			switch_plview_libtree();
		}
	}
	if (btn_fullscr && buttons[12 + show_vis].MouseUp()) {
		fb.RunMainMenuCommand("视图/全屏显示");
	}
	buttons[3].MouseUp();
	if (ui_noborder) {
		if (buttons[0].MouseUp()) {
			UIHacks.DisableSizing = false;
			//fb.Exit();
			fb_hWnd.SendMsg(0x0010,0,0);
		}
		if (buttons[1].MouseUp()) {
			UIHacks.DisableSizing = false;
			if(fb_hWnd.IsMaximized()) {
				fb_hWnd.Show(1);
			}
			else {
				fb_hWnd.Show(3);
			}
		}
		if (buttons[2].MouseUp()) {
			UIHacks.DisableSizing = false;
			fb.RunMainMenuCommand("视图/隐藏");
		}
	}
	if (g_searchbox.inputbox.visible) {
		g_searchbox.on_mouse("lbtn_up", x, y);
	}
}

function on_mouse_lbtn_dblclk(x, y) {
	// 输入框
	if (g_searchbox.inputbox.visible) {
		g_searchbox.on_mouse("lbtn_dblclk", x, y);
	}
}

function on_mouse_rbtn_down(x, y) {
	
}

function on_mouse_rbtn_up(x, y) {
	// 输入框
	if (g_searchbox.inputbox.visible) {
		g_searchbox.on_mouse("rbtn_down", x, y);
	}
	return true;
}

function on_mouse_leave() {
	if (g_searchbox.inputbox.visible) {
		g_searchbox.on_mouse("leave");
	}
	if (!hbtn) return;
	for (i = 3; i < buttons.length; i++) {
		buttons[i].Reset();
	}
	if (ui_noborder) {
		for (i = 0; i < 3; i++) {
			buttons[i].Reset();
		}
		mouseInControl = false;
		set_uihacks_caption(ui_noborder);
		if(!fb_hWnd.IsMaximized())
			UIHacks.DisableSizing = false;
		else UIHacks.DisableSizing = true;
	}
}

function on_notify_data(name, info) {
	switch (name) {
	case "set_random_color":
		fbx_set[0] = info[0];
		fbx_set[1] = info[1];
		fbx_set[2] = info[2];
		fbx_set[3] = info[3];
		fbx_set[4] = info[4];
		fbx_set[5] = info[5];
		fbx_set[6] = info[6];
		fbx_set[7] = info[7];
		get_colors();
		g_searchbox.reset_colors();
		g_searchbox.getImages();
		g_searchbox.repaint();
		window.Repaint();
		break;
	case "Set_browser_cover_type":
		cover_type = info;
		window.SetProperty("Browser.cover.type", cover_type);
		window.RepaintRect(0, line_y, ww, 3);
		break;
	case "set_font":
		fbx_set[13] = info[0];
		fbx_set[14] = info[1];
		fbx_set[15] = info[2];
		//get_font();
		window.Reload();
		//window.Repaint();
		break;
	case "set_ui_noborders":
		ui_noborder = info;
		uihacks_settings(ui_noborder);
		BtnSetSize_onsize();
		window.RepaintRect(0.7*ww, 0, 0.3*ww, wh);
		break;
	case "set_panels_interlock":
		auto_sw = !auto_sw;
		break;
	case "switch_plview_libtree":
		switch_plview_libtree();
		break;
	case "topbar_show_settings":
		if(info) {
			show_pl_setting = true;
			show_playlist = false;
			window.RepaintRect(0, line_y, ww, 3);
		} else {
			show_pl_setting = false;
			show_playlist = true;
			if(auto_sw){
				show_coverlrc = true;
				window.SetProperty("Panel.show.coverlrc", show_coverlrc);
				COVERLRC.Show(1);
				LIBTREE.Show(0);
				VIEWPL.Show(0);
			}
			window.RepaintRect(0, line_y, ww, 3);
			auto_switch_libico();
		}
		break;
	case "netsearch_switchpage":
		NetSearch(info[0], info[1], true);
		break;
	case "netradio_update":
		var radio_num = null;
		var radio_name = info[1];
		if(info[0] == "电台"){
			for (var i = 0; i < ppt.webradiolistarr2.length; i++) {
				if(ppt.webradiolistarr2[i].split(":")[0] == radio_name) {
					radio_num = i;
					break;
				}
			}
			if (radio_num == null) return;
			QQRadiolist(ppt.webradiolistarr2[radio_num].split(":")[1],ppt.webradiolistarr2[radio_num].split(":")[0]);
		}else if(info[0] == "榜单"){
			for (var i = 0; i < ppt.weblistarr1.length; i++) {
				if(ppt.weblistarr1[i].split(":")[0] == radio_name)  {
					radio_num = i;break;
				}
			}
			//fb.trace("榜单号:" + radio_num);
			if (radio_num != null){
				QQRanklist(radio_num+101, ppt.weblistarr1[radio_num].split(":")[1], ppt.weblistarr1[radio_num].split(":")[0]);
			} else{
				for (var i = 0; i < ppt.weblistarr2.length; i++) {
					if(ppt.weblistarr2[i].split(":")[0] == radio_name)  {
						radio_num = i;break;
					}
				}
				if (radio_num != null){
					QQRanklist(radio_num+150, ppt.weblistarr2[radio_num].split(":")[1], ppt.weblistarr2[radio_num].split(":")[0]);
				}else{
					for (var i = 0; i < ppt.webkgranklistarr.length; i++) {
						if(ppt.webkgranklistarr[i].split(":")[0] == radio_name)  {
							radio_num = i;break;
						}
					}
					if (radio_num != null) KGRankListid(ppt.webkgranklistarr[radio_num].split(":")[1],ppt.webkgranklistarr[radio_num].split(":")[0]);
				}
			}
			
		}
		break;
	case "show_button_fullscreen":
		btn_fullscr = info;
		BtnSetSize_onsize();
		window.RepaintRect(0.7*ww, 0, 0.3*ww, wh);
		break;
	case "JSSB_Lock":
		JSSBLock = info[0];
		if(JSSBLock) cover_type = info[1];
		break;
	}
}

//=================================================// 键盘回调

function on_key_up(vkey) {
	// 输入框
	if (g_searchbox.inputbox.visible) {
		g_searchbox.on_key("up", vkey);
	}
}

function on_key_down(vkey) {
	// 输入框
	if (g_searchbox.inputbox.visible) {
		g_searchbox.on_key("down", vkey);
	}
}

function on_char(code) {
	// 输入框
	if (g_searchbox.inputbox.visible) {
		g_searchbox.on_char(code);
	}
}
//

function on_focus(is_focused) {
	g_searchbox.on_focus(is_focused);
}
//

function get_font() {
	g_fname = fbx_set[13];
	g_fsize = fbx_set[14];
	g_fstyle = fbx_set[15];
}

function get_colors() {
	g_color_normal_txt = RGB(236, 236, 236);
	g_color_selected_txt = fbx_set[6]&0xb9ffffff;
	bg_color = fbx_set[0];
	g_color_normal_bg = blendColors(fbx_set[0], fbx_set[3], 0.043);
	g_color_selected_bg = RGB(0, 0, 0);
	//g_color_bt = blendColors(fbx_set[1], RGB(255, 255, 255), 0.8);
};
//-------------------------------
function init_buttons() {
	buttons[0] = new ButtonUI(img_close, "");
	buttons[1] = new ButtonUI(img_max, "");
	buttons[2] = new ButtonUI(img_min, "");
	buttons[3] = new ButtonUI(img_menu, "菜单");
	buttons[4] = new ButtonUI(img_open, "打开...");
	//buttons[5] = new ButtonUI(img_add, "添加...");
	buttons[5] = new ButtonUI(img_playlist, "播放列表");
	buttons[6] = new ButtonUI(img_artist, "艺术家");
	buttons[7] = new ButtonUI(img_album, "专辑");
	buttons[8] = new ButtonUI(img_genre, "流派 | 目录");
	buttons[9] = new ButtonUI(img_settings, "设置");
	buttons[10] = new ButtonUI(img_lrc, "歌曲信息");
	if(show_libtree) buttons[11] = new ButtonUI(img_lib, "媒体库");
	else buttons[11] = new ButtonUI(img_lib_2, "列表视图");
	if(show_vis) buttons[12] = new ButtonUI(img_shp, "可视化");
	buttons[12 + show_vis] = new ButtonUI(img_fullscreen, "");

	buttons[3].OnClick = function(x, y) {

		var basemenu = window.CreatePopupMenu();

		var child1 = window.CreatePopupMenu(); //File
		var child2 = window.CreatePopupMenu(); //Edit
		var child3 = window.CreatePopupMenu(); //View
		var child4 = window.CreatePopupMenu(); //Playback
		var child5 = window.CreatePopupMenu(); //Library
		var child6 = window.CreatePopupMenu(); //Help

		var menuman1 = fb.CreateMainMenuManager();
		var menuman2 = fb.CreateMainMenuManager();
		var menuman3 = fb.CreateMainMenuManager();
		var menuman4 = fb.CreateMainMenuManager();
		var menuman5 = fb.CreateMainMenuManager();
		var menuman6 = fb.CreateMainMenuManager();

		child1.AppendTo(basemenu, MF_STRING | MF_POPUP, "文件");
		child2.AppendTo(basemenu, MF_STRING | MF_POPUP, "编辑");
		child3.AppendTo(basemenu, MF_STRING | MF_POPUP, "视图");
		child4.AppendTo(basemenu, MF_STRING | MF_POPUP, "播放");
		child5.AppendTo(basemenu, MF_STRING | MF_POPUP, "媒体库");
		child6.AppendTo(basemenu, MF_STRING | MF_POPUP, "帮助");

		menuman1.Init("file");
		menuman2.Init("edit");
		menuman3.Init("View");
		menuman4.Init("playback");
		menuman5.Init("library");
		menuman6.Init("help");

		menuman1.BuildMenu(child1, 1, 200);
		menuman2.BuildMenu(child2, 201, 200);
		menuman3.BuildMenu(child3, 401, 200);
		menuman4.BuildMenu(child4, 601, 300);
		menuman5.BuildMenu(child5, 901, 300);
		menuman6.BuildMenu(child6, 1201, 100);

		var fso = new ActiveXObject("Scripting.FileSystemObject");
		if(fso.FileExists(fb.FoobarPath + "assemblies\\Mp3tag\\Mp3tag.exe")){
			basemenu.AppendMenuSeparator();
			basemenu.AppendMenuItem(MF_STRING, 1319, "Mp3tag");
		}
		basemenu.AppendMenuSeparator();
		basemenu.AppendMenuItem(MF_STRING, 1311, "foobox 帮助");

		ret = 0;
		ret = basemenu.TrackPopupMenu(x, y);//, 0x0008);

		switch (true) {
		case (ret >= 1 && ret < 201):
			menuman1.ExecuteByID(ret - 1);
			break;

		case (ret >= 201 && ret < 401):
			menuman2.ExecuteByID(ret - 201);
			break;

		case (ret >= 401 && ret < 601):
			menuman3.ExecuteByID(ret - 401);
			break;

		case (ret >= 601 && ret < 901):
			menuman4.ExecuteByID(ret - 601);
			break;

		case (ret >= 901 && ret < 1201):
			menuman5.ExecuteByID(ret - 901);
			break;

		case (ret >= 1201 && ret < 1301):
			menuman6.ExecuteByID(ret - 1201);
			break;
		case (ret == 1311):
			AboutFoobox();
			break;
		case (ret == 1319):
			var WshShell = new ActiveXObject("WScript.Shell");
			WshShell.Run("\"" + fb.FoobarPath + "assemblies\\Mp3tag\\Mp3tag.exe" + "\"", false);
			break;
		}
		buttons[3].Reset();
		basemenu.Dispose();
		menuman1.Dispose();
		menuman2.Dispose();
		menuman3.Dispose();
		menuman4.Dispose();
		menuman5.Dispose();
		menuman6.Dispose();
	}
}

function BtnSetSize_onsize(){
	
	buttons[5].SetXY(x_offset, spacer);
	buttons[6].SetXY(x_offset + imgw + btn_space, spacer);
	buttons[7].SetXY(x_offset + imgw*2 + btn_space*2, spacer);
	buttons[8].SetXY(x_offset + imgw*3 + btn_space*3, spacer);
	buttons[4].SetXY(x_offset + imgw*(4+show_vis) + btn_space*(4+show_vis) + spacer, spacer);
	buttons[9].SetXY(x_offset + imgw*(5+show_vis) + btn_space*(5+show_vis) + spacer, spacer);
	if(show_vis) buttons[12].SetXY(x_offset + imgw*4 + btn_space*4, spacer);
	
	var bt_y2 = Math.max(0, (wh - img_close.Height/3)/2+1);
	var x_offset2 = (btn_fullscr || ui_noborder)  ? x_offset/2 : x_offset;
	var x_fullscreen = (ui_noborder) ? ww - img_close.Width*4 - x_offset2 : ww - img_close.Width - x_offset2;
	buttons[0].SetXY(ww - img_close.Width - x_offset/2, bt_y2);
	buttons[1].SetXY(ww - img_close.Width*2 - x_offset/2, bt_y2);
	buttons[2].SetXY(ww - img_close.Width*3 - x_offset/2, bt_y2);
	var x_menu = x_fullscreen - img_close.Width * btn_fullscr;
	buttons[3].SetXY(x_menu, spacer);
	x_lib = x_menu - img_lrc.Width - spacer - btn_space;
	if(show_libtree) buttons[11].SetXY(x_lib, spacer);
	else buttons[11].SetXY(x_lib, spacer);
	buttons[10].SetXY(x_lib - img_lrc.Width - btn_space, spacer);
	buttons[12 + show_vis].SetXY(x_fullscreen, bt_y2);
}

function update_libBtn(){
	if(show_libtree){
		buttons[11].img = img_lib;
		buttons[11].Tooltip.Text = "媒体库";
	} else{
		buttons[11].img = img_lib_2;
		buttons[11].Tooltip.Text = "列表视图";
	}
	buttons[11].Tooltip.Deactivate();
	buttons[11].Repaint();
}

function init_panels(){
	if (show_playlist) {
		PLS.Show(1);
		LIBB.Show(0);
		if(show_vis) SHP.Show(0);
	} else if(show_browser){
		PLS.Show(0);
		LIBB.Show(1);
		if(show_vis) SHP.Show(0);
	} else if(show_vis && !show_pl_setting){
		PLS.Show(0);
		LIBB.Show(0);
		SHP.Show(1);
	}
	if (show_coverlrc) {
		COVERLRC.Show(1);
		LIBTREE.Show(0);
	} else {
		COVERLRC.Show(0);
		if(show_libtree) {
			LIBTREE.Show(1);
			VIEWPL.Show(0);
		}
		else {
			VIEWPL.Show(1);
			LIBTREE.Show(0);
		}
	}
}

function init_icons() {
	var imgh = Math.floor(28*zdpi), gb, imgh_p = Math.floor(28 * zdpi)*3,
		imgh2 = imgh * 2,
		shadow_x = (imgw-imgh)/2,
		c_normal = RGB(240, 240, 240),
		c_hover = RGB(255, 255, 255),
		c_down = RGB(200, 200, 200),
		c_shadow_h = RGBA(0, 0, 0, 70),
		c_shadow = RGBA(0, 0, 0, 90);
		
	try {
		var _x5 = 5*zdpi, _x6 = 6*zdpi, _y6 = Math.floor(_x6), _x7 = 7*zdpi, _y7 = Math.floor(_x7), _x8 = 8*zdpi, _x9 = 9*zdpi, _y9 = Math.floor(_x9), _x10 = 10*zdpi, 
			_x12 = 12 * zdpi, _x13 = 13*zdpi, _x14 = 14*zdpi, _x15 = 15*zdpi, _x16 = 16*zdpi, _x17 = 17*zdpi, 
			_x18 = 18*zdpi, _x19 = 19*zdpi, _x22 = 22*zdpi, _x23 = 23 * zdpi, _x24 = 24 * zdpi, _x28 = 28*zdpi;
		
		img_playlist = gdi.CreateImage(imgw, imgh_p);
		gb = img_playlist.GetGraphics();
		gb.DrawLine(_x10, _y9, _x13,  _y9, 2, c_normal);
		gb.DrawLine(_x10, _y9+_y7, _x13, _y9+_y7, 2, c_normal);
		gb.DrawLine(_x10, _y9+_y7*2, _x13, _y9+_y7*2, 2, c_normal);
		gb.DrawLine(_x16, _y9, Math.floor(_x28), _y9, 2, c_normal);
		gb.DrawLine(_x16, _y9+_y7, Math.floor(_x28), _y9+_y7, 2, c_normal);
		gb.DrawLine(_x16, _y9+_y7*2, Math.floor(_x28), _y9+_y7*2, 2, c_normal);
		gb.SetSmoothingMode(2);
		gb.FillEllipse(shadow_x, imgh, imgh, imgh, c_shadow_h);
		gb.SetSmoothingMode(0);
		gb.DrawLine(_x10, _y9 + imgh, _x13,  _y9 + imgh, 2, c_hover);
		gb.DrawLine(_x10, _y9+_y7 + imgh, _x13, _y9+_y7 + imgh, 2, c_hover);
		gb.DrawLine(_x10, _y9+_y7*2 + imgh, _x13, _y9+_y7*2 + imgh, 2, c_hover);
		gb.DrawLine(_x16, _y9 + imgh, Math.floor(_x28), _y9 + imgh, 2, c_hover);
		gb.DrawLine(_x16, _y9+_y7 + imgh, Math.floor(_x28), _y9+_y7 + imgh, 2, c_hover);
		gb.DrawLine(_x16, _y9+_y7*2 + imgh, Math.floor(_x28), _y9+_y7*2 + imgh, 2, c_hover);
		gb.SetSmoothingMode(2);
		gb.FillEllipse(shadow_x, imgh2, imgh, imgh, c_shadow);
		gb.SetSmoothingMode(0);
		gb.DrawLine(_x10, _y9 + imgh2, _x13,  _y9 + imgh2, 2, c_down);
		gb.DrawLine(_x10, _y9+_y7 + imgh2, _x13, _y9+_y7 + imgh2, 2, c_down);
		gb.DrawLine(_x10, _y9+_y7*2 + imgh2, _x13, _y9+_y7*2 + imgh2, 2, c_down);
		gb.DrawLine(_x16, _y9 + imgh2, Math.floor(_x28), _y9 + imgh2, 2, c_down);
		gb.DrawLine(_x16, _y9+_y7 + imgh2, Math.floor(_x28), _y9+_y7 + imgh2, 2, c_down);
		gb.DrawLine(_x16, _y9+_y7*2 + imgh2, Math.floor(_x28), _y9+_y7*2 + imgh2, 2, c_down);
		img_playlist.ReleaseGraphics(gb);
		
		var _imgh = Math.floor(_x8);
		var img_up = gdi.CreateImage(imgw, _imgh);
		gb = img_up.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(_x10, 0, _x18, _x18, 2, c_normal);
		gb.SetSmoothingMode(0);
		img_up.ReleaseGraphics(gb);
		var img_up_h = gdi.CreateImage(imgw, _imgh);
		gb = img_up_h.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(_x10, 0, _x18, _x18, 2, c_hover);
		gb.SetSmoothingMode(0);
		img_up_h.ReleaseGraphics(gb);
		var img_up_d = gdi.CreateImage(imgw, _imgh);
		gb = img_up_d.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(_x10, 0, _x18, _x18, 2, c_down);
		gb.SetSmoothingMode(0);
		img_up_d.ReleaseGraphics(gb);

		img_artist = gdi.CreateImage(imgw, imgh_p);
		gb = img_artist.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(_x14, _x6, _x10, _x10, 2, c_normal);
		gb.SetSmoothingMode(0);
		gb.DrawImage(img_up, 0, _x16, imgw, _x8, 0, 0, imgw, _imgh, 0, 255);
		gb.SetSmoothingMode(2);
		gb.FillEllipse(shadow_x, imgh, imgh, imgh, c_shadow_h);
		gb.DrawEllipse(_x14, _x6 + imgh, _x10, _x10, 2, c_hover);
		gb.SetSmoothingMode(0);
		gb.DrawImage(img_up_h, 0, _x16 + imgh, imgw, _x8, 0, 0, imgw, _imgh, 0, 255);
		gb.SetSmoothingMode(2);
		gb.FillEllipse(shadow_x, imgh2, imgh, imgh, c_shadow);
		gb.DrawEllipse(_x14, _x6 + imgh2, _x10, _x10, 2, c_down);
		gb.SetSmoothingMode(0);
		gb.DrawImage(img_up_d, 0, _x16 + imgh2, imgw, _x8, 0, 0, imgw, _imgh, 0, 255);
		img_artist.ReleaseGraphics(gb);

		img_album = gdi.CreateImage(imgw, imgh_p);
		gb = img_album.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(_x10, _x6, _x17, _x17, 2, c_normal);
		gb.DrawEllipse(_x16, _x12, _x5, _x5, 2, c_normal);
		gb.FillEllipse(shadow_x, imgh+zdpi, imgh-zdpi, imgh-zdpi, c_shadow_h);
		gb.DrawEllipse(_x10, _x6 + imgh, _x17, _x17, 2, c_hover);
		gb.DrawEllipse(_x16, _x12 + imgh, _x5, _x5, 2, c_hover);
		gb.FillEllipse(shadow_x, imgh2+zdpi, imgh-zdpi, imgh-zdpi, c_shadow);
		gb.DrawEllipse(_x10, _x6 + imgh2, _x17, _x17, 2, c_down);
		gb.DrawEllipse(_x16, _x12 + imgh2, _x5, _x5, 2, c_down);
		gb.SetSmoothingMode(0);
		img_album.ReleaseGraphics(gb);

		img_open = gdi.CreateImage(imgw, imgh_p);
		gb = img_open.GetGraphics();
		gb.DrawLine(_x15, 17.5*zdpi, _x23, 17.5*zdpi	, 2, c_normal)
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(_x10, _x5, _x18, _x18, 2, c_normal);
		var point_arr = new Array( 14.6*zdpi, _x13, _x19, _x9, 23.4*zdpi, _x13);
		gb.FillPolygon(c_normal, 0, point_arr);
		gb.FillEllipse(shadow_x, imgh, imgh, imgh, c_shadow_h);
		gb.SetSmoothingMode(0);
		gb.DrawLine(_x15, 17.5*zdpi+imgh, _x23, 17.5*zdpi+imgh, 2, c_hover)
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(_x10, _x5+imgh, _x18, _x18, 2, c_hover);
		point_arr = new Array( 14.6*zdpi, _x13+imgh, _x19, _x9+imgh, 23.4*zdpi, _x13+imgh);
		gb.FillPolygon(c_hover, 0, point_arr);
		gb.FillEllipse(shadow_x, imgh2, imgh, imgh, c_shadow);
		gb.SetSmoothingMode(0);
		gb.DrawLine(_x15, 17.5*zdpi+imgh2, _x23, 17.5*zdpi+imgh2, 2, c_down)
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(_x10, _x5+imgh2, _x18, _x18, 2, c_down);
		point_arr = new Array( 14.6*zdpi, _x13+imgh2, _x19, _x9+imgh2, 23.4*zdpi, _x13+imgh2);
		gb.FillPolygon(c_down, 0, point_arr);
		gb.SetSmoothingMode(0);
		img_open.ReleaseGraphics(gb);
	
		img_genre = gdi.CreateImage(imgw, imgh_p);
		gb = img_genre.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(_x10, _x6, _x17, _x17, 2, c_normal);
		gb.FillEllipse(_x16, _x12, 5.5*zdpi, 5.5*zdpi, c_normal);
		gb.DrawLine(21*zdpi, _x15, 24.5*zdpi, 9.5*zdpi, 2, c_normal);
		gb.FillEllipse(shadow_x, imgh+zdpi, imgh-zdpi, imgh-zdpi, c_shadow_h);
		gb.DrawEllipse(_x10, _x6 + imgh, _x17, _x17, 2, c_hover);
		gb.FillEllipse(_x16, _x12 + imgh, 5.5*zdpi, 5.5*zdpi, c_hover);
		gb.DrawLine(21*zdpi, _x15 + imgh, 24.5*zdpi, 9.5*zdpi + imgh, 2, c_hover);
		gb.FillEllipse(shadow_x, imgh2+zdpi, imgh-zdpi, imgh-zdpi, c_shadow);
		gb.DrawEllipse(_x10, _x6 + imgh2, _x17, _x17, 2, c_down);
		gb.FillEllipse(_x16, _x12 + imgh2, 5.5*zdpi, 5.5*zdpi, c_down);
		gb.DrawLine(21*zdpi, _x15 + imgh2, 24.5*zdpi, 9.5*zdpi + imgh2, 2, c_down);
		gb.SetSmoothingMode(0);
		img_genre.ReleaseGraphics(gb);
		
		img_shp = gdi.CreateImage(imgw, imgh_p);
		gb = img_shp.GetGraphics();
		gb.DrawLine(27*zdpi, _x23, 27*zdpi, _x12, 2, c_normal);
		gb.DrawLine(_x22, _x23, _x22, _x16, 2, c_normal);
		gb.DrawLine(_x17, _x23, _x17, _x8, 2, c_normal);
		gb.DrawLine(_x12, _x23, _x12, _x14, 2, c_normal);
		gb.SetSmoothingMode(2);
		gb.FillEllipse(shadow_x, imgh+zdpi, imgh-zdpi, imgh-zdpi, c_shadow_h);
		gb.SetSmoothingMode(0);
		gb.DrawLine(27*zdpi, _x23 + imgh, 27*zdpi, 12*zdpi + imgh, 2, c_hover);
		gb.DrawLine(_x22, _x23 + imgh, _x22, _x16 + imgh, 2, c_hover);
		gb.DrawLine(_x17, _x23 + imgh, _x17, _x8 + imgh, 2, c_hover);
		gb.DrawLine(_x12, _x23 + imgh, _x12, _x14 + imgh, 2, c_hover);
		gb.SetSmoothingMode(2);
		gb.FillEllipse(shadow_x, imgh2+zdpi, imgh-zdpi, imgh-zdpi, c_shadow);
		gb.SetSmoothingMode(0);
		gb.DrawLine(27*zdpi, _x23 + imgh2, 27*zdpi, _x12 + imgh2, 2, c_down);
		gb.DrawLine(_x22, _x23 + imgh2, _x22, _x16 + imgh2, 2, c_down);
		gb.DrawLine(_x17, _x23 + imgh2, _x17, _x8 + imgh2, 2, c_down);
		gb.DrawLine(_x12, _x23 + imgh2, _x12, _x14 + imgh2, 2, c_down);
		img_shp.ReleaseGraphics(gb);
		
		img_settings = gdi.CreateImage(imgw, imgh_p);
		gb = img_settings.GetGraphics();
		gb.DrawLine(_x10, _x9, _x28, _x9, 2, c_normal);
		gb.DrawLine(_x10, _x15, _x28, _x15, 2, c_normal);
		gb.DrawLine(_x10, 21*zdpi, _x28, 21*zdpi, 2, c_normal);
		gb.DrawLine(_x23, _x19, _x23, _x23, 3, c_normal);
		gb.DrawLine(_x14, _x13, _x14, _x17, 3, c_normal);
		gb.DrawLine(_x19, _x7, _x19, 11*zdpi, 3, c_normal);
		gb.SetSmoothingMode(2);
		gb.FillEllipse(shadow_x, imgh, imgh, imgh, c_shadow_h);
		gb.SetSmoothingMode(0);
		gb.DrawLine(_x10, _x9 + imgh, _x28, _x9 + imgh, 2, c_hover);
		gb.DrawLine(_x10, _x15 + imgh, _x28, _x15 + imgh, 2, c_hover);
		gb.DrawLine(_x10, 21*zdpi + imgh, _x28, 21*zdpi + imgh, 2, c_hover);
		gb.DrawLine(_x23, _x19 + imgh, _x23, _x23 + imgh, 3, c_hover);
		gb.DrawLine(_x14, _x13 + imgh, _x14, _x17 + imgh, 3, c_hover);
		gb.DrawLine(_x19, _x7 + imgh, _x19, 11*zdpi + imgh, 3, c_hover);
		gb.SetSmoothingMode(2);
		gb.FillEllipse(shadow_x, imgh2, imgh, imgh, c_shadow);
		gb.SetSmoothingMode(0);		
		gb.DrawLine(_x10, _x9 + imgh2, _x28, _x9 + imgh2, 2, c_down);
		gb.DrawLine(_x10, _x15 + imgh2, _x28, _x15 + imgh2, 2, c_down);
		gb.DrawLine(_x10, 21*zdpi + imgh2, _x28, 21*zdpi + imgh2, 2, c_down);
		gb.DrawLine(_x23, _x19 + imgh2, _x23, _x23 + imgh2, 3, c_down);
		gb.DrawLine(_x14, _x13 + imgh2, _x14, _x17 + imgh2, 3, c_down);
		gb.DrawLine(_x19, _x7 + imgh2, _x19, 11*zdpi + imgh2, 3, c_down);
		img_settings.ReleaseGraphics(gb);
		
		_x2 = 7 * zdpi;
		img_lrc = gdi.CreateImage(imgw, imgh_p);
		gb = img_lrc.GetGraphics();
		gb.DrawLine(19.7*zdpi, _x8, 19.7*zdpi, _x16, 2, c_normal);
		gb.SetSmoothingMode(2);
		gb.DrawLine(19.7*zdpi, 8.5*zdpi, 24*zdpi, 11.5*zdpi, 2, c_normal);
		gb.DrawEllipse(_x10, _x5, _x18, _x18, 2, c_normal);
		gb.DrawEllipse(_x15, 14*zdpi, 4.7*zdpi, 4.7*zdpi, 2, c_normal);
		gb.FillEllipse(shadow_x, imgh, imgh, imgh, c_shadow_h);
		gb.SetSmoothingMode(0);
		gb.DrawLine(19.7*zdpi, _x8+imgh, 19.7*zdpi, _x16+imgh, 2, c_hover);
		gb.SetSmoothingMode(2);
		gb.DrawLine(19.7*zdpi, 8.5*zdpi+imgh, 24*zdpi, 11.5*zdpi+imgh, 2, c_hover);
		gb.DrawEllipse(_x10, _x5+imgh, _x18, _x18, 2, c_hover);
		gb.DrawEllipse(_x15, 14*zdpi+imgh, 4.7*zdpi, 4.7*zdpi, 2, c_hover);
		gb.FillEllipse(shadow_x, imgh2, imgh, imgh, c_shadow)
		gb.SetSmoothingMode(0);
		gb.DrawLine(19.7*zdpi, _x8+imgh2, 19.7*zdpi, _x16+imgh2, 2, c_down);
		gb.SetSmoothingMode(2);
		gb.DrawLine(19.7*zdpi, 8.5*zdpi+imgh2, 24*zdpi, 11.5*zdpi+imgh2, 2, c_down);
		gb.DrawEllipse(_x10, _x5+imgh2, _x18, _x18, 2, c_down);
		gb.DrawEllipse(_x15, 14*zdpi+imgh2, 4.7*zdpi, 4.7*zdpi, 2, c_down);
		gb.SetSmoothingMode(0);
		img_lrc.ReleaseGraphics(gb);
		
		img_lib_2 = gdi.CreateImage(imgw, imgh_p);
		gb = img_lib_2.GetGraphics();
		gb.DrawLine(_x10, _x8, _x28, _x8, 2, c_normal);
		gb.DrawLine(_x28-1, _x8, _x28-1, _x22, 2, c_normal);
		gb.DrawLine(_x10+1, _x7+1, _x10+1, _x22 + 1, 2, c_normal);
		gb.DrawLine(_x10+2, _x22, _x28, _x22, 2, c_normal);
		gb.DrawLine(_x15, _x5, _x15, _x8, 2, c_normal);
		gb.DrawLine(_x23, _x5, _x23, _x8, 2, c_normal);
		gb.DrawLine(_x14, _x12+1, _x24, _x12+1, 2, c_normal);
		gb.DrawLine(_x14, _x17, _x24, _x17, 2, c_normal);
		gb.SetSmoothingMode(2);
		gb.FillEllipse(shadow_x, imgh, imgh, imgh, c_shadow_h);
		gb.SetSmoothingMode(0);
		gb.DrawLine(_x10, _x8 + imgh, _x28, _x8 + imgh, 2, c_hover);
		gb.DrawLine(_x28-1, _x8 + imgh, _x28-1, _x22 + imgh, 2, c_hover);
		gb.DrawLine(_x10+1, _x7+1 + imgh, _x10+1, _x22 + 1 + imgh, 2, c_hover);
		gb.DrawLine(_x10+2, _x22 + imgh, _x28, _x22 + imgh, 2, c_hover);
		gb.DrawLine(_x15, _x5 + imgh, _x15, _x8 + imgh, 2, c_hover);
		gb.DrawLine(_x23, _x5 + imgh, _x23, _x8 + imgh, 2, c_hover);
		gb.DrawLine(_x14, _x12+1 + imgh, _x24, _x12+1 + imgh, 2, c_hover);
		gb.DrawLine(_x14, _x17 + imgh, _x24, _x17 + imgh, 2, c_hover);
		gb.SetSmoothingMode(2);
		gb.FillEllipse(shadow_x, imgh2, imgh, imgh, c_shadow);
		gb.SetSmoothingMode(0);
		gb.DrawLine(_x10, _x8 + imgh2, _x28, _x8 + imgh2, 2, c_down);
		gb.DrawLine(_x28-1, _x8 + imgh2, _x28-1, _x22 + imgh2, 2, c_down);
		gb.DrawLine(_x10+1, _x7+1 + imgh2, _x10+1, _x22 + 1 + imgh2, 2, c_down);
		gb.DrawLine(_x10+2, _x22 + imgh2, _x28, _x22 + imgh2, 2, c_down);
		gb.DrawLine(_x15, _x5 + imgh2, _x15, _x8 + imgh2, 2, c_down);
		gb.DrawLine(_x23, _x5 + imgh2, _x23, _x8 + imgh2, 2, c_down);
		gb.DrawLine(_x14, _x12+1 + imgh2, _x24, _x12+1 + imgh2, 2, c_down);
		gb.DrawLine(_x14, _x17 + imgh2, _x24, _x17 + imgh2, 2, c_down);
		img_lib_2.ReleaseGraphics(gb);
		
		img_lib = gdi.CreateImage(imgw, imgh_p);
		gb = img_lib.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillEllipse(_x9, _x6, _x7, _x7, c_normal);
		gb.DrawEllipse(_x19, _x7, _x5, _x5, 2, c_normal);
		gb.DrawEllipse(_x10, _x16, _x5, _x5, 2, c_normal);
		gb.DrawEllipse(_x19, _x16, _x5, _x5, 2, c_normal);
		gb.FillEllipse(shadow_x-zdpi, imgh, imgh-zdpi, imgh-zdpi, c_shadow_h);
		gb.FillEllipse(_x9, _x6 + imgh, _x7, _x7, c_hover);
		gb.DrawEllipse(_x19, _x7 + imgh, _x5, _x5, 2, c_hover);
		gb.DrawEllipse(_x10, _x16 + imgh, _x5, _x5, 2, c_hover);
		gb.DrawEllipse(_x19, _x16 + imgh, _x5, _x5, 2, c_hover);
		gb.FillEllipse(shadow_x-zdpi, imgh2, imgh-zdpi, imgh-zdpi, c_shadow);
		gb.FillEllipse(_x9, _x6 + imgh2, _x7, _x7, c_down);
		gb.DrawEllipse(_x19, _x7 + imgh2, _x5, _x5, 2, c_down);
		gb.DrawEllipse(_x10, _x16 + imgh2, _x5, _x5, 2, c_down);
		gb.DrawEllipse(_x19, _x16 + imgh2, _x5, _x5, 2, c_down);
		gb.SetSmoothingMode(0);
		img_lib.ReleaseGraphics(gb);
		
		c_normal = RGB(225, 225, 225),
		_imgh =  Math.floor(26*zdpi);
		imgh2 = 2*_imgh;
		_y7 = Math.round(7*zdpi), _y9 = Math.round(9*zdpi);
		var _y8 = Math.round(8*zdpi), _y18 = Math.round(18*zdpi);
		img_close = gdi.CreateImage(_imgh, _imgh*3);
		gb = img_close.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawLine(_x8, _x8, _x17, _x17, 2, c_normal);
		gb.DrawLine(_x8, _x17, _x17, _x8, 2, c_normal);
		gb.FillEllipse(1, _imgh + 1, _imgh - 2, _imgh - 2, RGBA(225, 10, 20, 255));
		gb.DrawLine(_x8, _x8 + _imgh, _x17, _x17 + _imgh, 2, c_hover);
		gb.DrawLine(_x8, _x17 + _imgh, _x17, _x8 + _imgh, 2, c_hover);
		gb.FillEllipse(1, imgh2 + 1, _imgh - 2, _imgh - 2, RGBA(175, 5, 10, 255));
		gb.DrawLine(_x8, _x8 + imgh2, _x17, _x17 + imgh2, 2, c_down);
		gb.DrawLine(_x8, _x17 + imgh2, _x17, _x8 + imgh2, 2, c_down);
		gb.SetSmoothingMode(0);
		img_close.ReleaseGraphics(gb);
		
		img_max = gdi.CreateImage(_imgh, _imgh*3);
		gb = img_max.GetGraphics();
		gb.SetSmoothingMode(0);
		gb.DrawRect(_y8, _y8, _y9, _y9, 1, c_normal);
		gb.DrawLine(_y8+1, _y8+1, 2*_y9 - 2, _x8+1, 1, c_normal);
		gb.SetSmoothingMode(2);
		gb.FillEllipse(1, _imgh + 1, _imgh - 2, _imgh - 2, c_shadow_h);
		gb.SetSmoothingMode(0);
		gb.DrawRect(_y8, _y8+_imgh, _y9, _y9, 1, c_hover);
		gb.DrawLine(_y8+1, _y8+1+_imgh, 2*_y9 - 2, _x8+1+_imgh, 1, c_hover);
		gb.SetSmoothingMode(2);
		gb.FillEllipse(1, imgh2 + 1, _imgh - 2, _imgh - 2, c_shadow);
		gb.SetSmoothingMode(0);
		gb.DrawRect(_y8, _y8+imgh2, _y9, _y9, 1, c_down);
		gb.DrawLine(_y8+1, _y8+1+imgh2, 2*_y9 - 2, _x8+1+imgh2, 1, c_down)
		img_max.ReleaseGraphics(gb);
		
		img_min = gdi.CreateImage(_imgh, _imgh*3);
		gb = img_min.GetGraphics();
		gb.DrawLine(_x8, _x13, _x18, _x13, 2, c_normal);
		gb.SetSmoothingMode(2);
		gb.FillEllipse(1, _imgh + 1, _imgh - 2, _imgh - 2, c_shadow_h);
		gb.SetSmoothingMode(0);
		gb.DrawLine(_x8, _x13+_imgh, _x18, _x13+_imgh, 2, c_hover);
		gb.SetSmoothingMode(2);
		gb.FillEllipse(1, imgh2 + 1, _imgh - 2, _imgh - 2, c_shadow);
		gb.SetSmoothingMode(0);
		gb.DrawLine(_x8, _x13+imgh2, _x18, _x13+imgh2, 2, c_down);
		img_min.ReleaseGraphics(gb);

		img_fullscreen = gdi.CreateImage(_imgh, _imgh*3);
		gb = img_fullscreen.GetGraphics();
		gb.DrawLine(_y7, _y7, Math.round(_x10), _y7, 1, c_normal);
		gb.DrawLine(_y7, _y7+1, _y7, _y18, 1, c_normal);
		gb.DrawLine(_y7+1, _y18, _y18, _y18, 1, c_normal);
		gb.DrawLine(_y18, _y18-1, _y18, Math.round(_x15), 1, c_normal);
		gb.DrawLine(Math.round(_x14), _y7, _y18, _y7, 1, c_normal);
		gb.DrawLine(_y18, _y7+1, _y18, Math.round(11*zdpi), 1, c_normal);
		gb.DrawLine(_y18, _y7, _y7, _y18, 1, c_normal);
		gb.SetSmoothingMode(2);
		gb.FillEllipse(1, 1+_imgh, _imgh - 2, _imgh - 2, c_shadow_h);
		gb.SetSmoothingMode(0);
		gb.DrawLine(_y7, _y7+_imgh, Math.round(_x10), _y7+_imgh, 1, c_hover);
		gb.DrawLine(_y7, _y7+1+_imgh, _y7, _y18+_imgh, 1, c_hover);
		gb.DrawLine(_y7+1, _y18+_imgh, _y18, _y18+_imgh, 1, c_hover);
		gb.DrawLine(_y18, _y18-1+_imgh, _y18, Math.round(_x15)+_imgh, 1, c_hover);
		gb.DrawLine(Math.round(_x14), _y7+_imgh, _y18, _y7+_imgh, 1, c_hover);
		gb.DrawLine(_y18, _y7+1+_imgh, _y18, Math.round(11*zdpi)+_imgh, 1, c_hover);
		gb.DrawLine(_y18, _y7+_imgh, _y7, _y18+_imgh, 1, c_hover);
		gb.SetSmoothingMode(2);
		gb.FillEllipse(1, 1+imgh2, _imgh - 2, _imgh - 2, c_shadow);
		gb.SetSmoothingMode(0);
		gb.DrawLine(_y7, _y7+imgh2, Math.round(_x10), _y7+imgh2, 1, c_down);
		gb.DrawLine(_y7, _y7+1+imgh2, _y7, _y18+imgh2, 1, c_down);
		gb.DrawLine(_y7+1, _y18+imgh2, _y18, _y18+imgh2, 1, c_down);
		gb.DrawLine(_y18, _y18-1+imgh2, _y18, Math.round(_x15)+imgh2, 1, c_down);
		gb.DrawLine(Math.round(_x14), _y7+imgh2, _y18, _y7+imgh2, 1, c_down);
		gb.DrawLine(_y18, _y7+1+imgh2, _y18, Math.round(11*zdpi)+imgh2, 1, c_down);
		gb.DrawLine(_y18, _y7+imgh2, Math.round(7*zdpi), _y18+imgh2, 1, c_down);
		img_fullscreen.ReleaseGraphics(gb);
		
		img_menu = gdi.CreateImage(_imgh, _imgh*3);
		gb = img_menu.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawLine(_x8, _x9, _x13, _x16, 2, c_normal);
		gb.DrawLine(_x18, _x9, _x13, _x16, 2, c_normal);
		gb.FillEllipse(1, 1+_imgh, _imgh - 2, _imgh - 2, c_shadow_h);
		gb.DrawLine(_x8, _x9+_imgh, _x13, _x16+_imgh, 2, c_hover);
		gb.DrawLine(_x18, _x9+_imgh, _x13, _x16+_imgh, 2, c_hover);
		gb.FillEllipse(1, 1+imgh2, _imgh - 2, _imgh - 2, c_shadow);
		gb.DrawLine(_x8, _x9+imgh2, _x13, _x16+imgh2, 2, c_down);
		gb.DrawLine(_x18, _x9+imgh2, _x13, _x16+imgh2, 2, c_down);
		gb.SetSmoothingMode(0);
		img_menu.ReleaseGraphics(gb);
		
	} catch (e) {}
};
