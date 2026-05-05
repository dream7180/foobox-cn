//foobox https://github.com/dream7180
window.DefinePanel('foobox base panel', {author: 'dreamawake'});
include(fb.ProfilePath + 'foobox\\script\\js_common\\common.js');
include(fb.ProfilePath + 'foobox\\script\\js_common\\guiext.js');
include(fb.ProfilePath + 'foobox\\script\\js_common\\uicomposite.js');

var time_length = 0;
var zdpi, dark_mode;
var c_background, c_btmbg, c_font, c_seekoverlay, c_default_hl, c_shadow, c_shadow_h, c_tip_bg, c_seek_bg;
var img_play;

//play back order
var PBOTips = new Array("默认", "重复(列表)", "重复(音轨)", "随机", "乱序(音轨)", "乱序(专辑)", "乱序(目录)");
var PBOIcos = ["\uEFB7", "\uF072", "\uF076", "\uF124", "\uF09B", "\uECAD", "\uECA5"];
var hbtn = false;
var ww = 0, wh = 0, minw = 1, minh = 1;
var m_x = 0, m_y = 0;
var g_seconds = 0;
var seek_len, seek_start,seek_h, vol_start, vol_len, pbo_start, btn_y, win_y, topbarh, topbtnw, menuicow, menulibw, menubtnw, leftbarw, title_w, captionw, z4, z5, z8;
var PBOpen, PBPrevious, PBPlay, PBNext, PBStop;
var track_len = 0, PlaybackTimeText, PlaybackLengthText, TopTitle, TopSubTitle, top_addtext = "", RBtnTips, RTips_timer;
var VolumeBar, seekbar, TimeTip, VolumeTip, MuteBtn, PBOBtn, LibBtn, MenubarBtn = [];
var img_ico = gdi.Image(fb.ProfilePath + "foobox\\script\\images\\foobar2000.png");
var show_menu = 1, colorful_seek = 1, show_extrabtn = 1;
var btnall = true;
var fbver = Number(fb.Version.substr(0, 1));
var lib_albumlist = 1;
var lib_tooltip = "专辑列表";
var active_p, active_pid;
var allpanels = ['list', 'brw', 'bio', 'vis', 'video'];
panel = {
	p: [],
	ico: [],
	tip: [],
	icos: {
		"list": "\uF011",
		"brw": "\uF158",
		"bio": "\uF2EF",
		"vis": "\uEA96",
		"video": "\uEF7F"
	},
	tips: {
		"list": "播放列表",
		"brw": "封面浏览器",
		"bio": "简介",
		"vis": "可视化",
		"video": "视频"
	}
}

//=====================================================
oSwitchbar = function() {
	this.btw = z(28);
	this.h_space = z(38);
	this.x = 5;
	this.y = 5;
	this.w = this.h_space*(panel.p.length - 1) + this.btw + 2;
	this.h = this.btw + z(2);
	this.hover_tab = 0;
	this.tab_old = this.hover_tab;
	this.down = 0;
	this.tipw = z(80);
	this.tip_timer = false;
	this.tip_show = false;
	this.setSize= function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}
	this._isHover = function(x, y) {
		return (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h);
	}
	this.on_mouse = function(event, x, y) {
		var down_old = this.down;
		this.tab_old = this.hover_tab;
		this.ishover = this._isHover(x, y);
		switch (event) {
		case "move":
			if(this.ishover){
				let _x = Math.floor((x - this.x)/this.h_space);
				if(x < (this.x + this.h_space * _x + this.btw + 1)) this.hover_tab = _x + 1;
				else this.hover_tab = 0;
			}
			else this.hover_tab = 0;
			if(g_switchbar.hover_tab > 0){
				if(!g_switchbar.tip_timer){
					g_switchbar.tip_timer = window.SetTimeout(function() {
						if(g_switchbar.hover_tab == g_switchbar.tab_old){
							g_switchbar.tip_show = true;
							window.RepaintRect(g_switchbar.x+g_switchbar.w, g_switchbar.y, g_switchbar.tipw, g_switchbar.h);
						} else g_switchbar.tip_show = false;
						g_switchbar.tip_timer && window.ClearTimeout(g_switchbar.tip_timer);
						g_switchbar.tip_timer = false;
					}, 750);
				}
			} else {
				g_switchbar.deactivate_timer();
				if(g_switchbar.tip_show){
					g_switchbar.tip_show =false;
					window.RepaintRect(g_switchbar.x+g_switchbar.w, g_switchbar.y, g_switchbar.tipw, g_switchbar.h);
				}
			}
			break;
		case "lbtn_up":
			if (this.hover_tab > 0 && this.hover_tab-1 != active_pid){
				this.switch_panel(this.hover_tab);
				this.down = 0;
			}
			break;
		case "lbtn_down":
			if (this.hover_tab > 0 && this.hover_tab-1 != active_pid){
				this.down = 1;
			}
			break;
		case "leave":
			this.hover_tab = 0;
			g_switchbar.deactivate_timer();
			break;
		}
		if(this.hover_tab != this.tab_old || this.down != down_old) this.repaint();
	}
	this.deactivate_timer = function(){
		g_switchbar.tip_timer && window.ClearInterval(g_switchbar.tip_timer);
		g_switchbar.tip_timer = false;
	}
	this.switch_panel = function(id) {
		if(active_pid == panel.p.length - 1){
			window.NotifyOthers("foobox_setting", 0);
			if(id == 1) {
				active_pid = 0;
				return;
			} else if(active_pid == 0 && id == panel.p.length){
				window.NotifyOthers("foobox_setting", 1);
				active_pid = panel.p.length - 1;
				return;
			}			
		}
		active_p.Show(false);
		if(id == panel.p.length) {
			window.NotifyOthers("foobox_setting", 1);
			active_p = panel.p[0];
		} else active_p = panel.p[id - 1];
		active_pid = id - 1;
		active_p.Show(true);
		set_panel();
	}
	this.draw = function(gr){
		var ico_y = this.y + 1, hoverbg_offset = z(1);
		gr.SetSmoothingMode(4);
		gr.FillRoundRect(this.x + active_pid*this.h_space, this.y+hoverbg_offset, this.btw, this.btw, z4, z4, c_seek_bg);
		if(this.hover_tab && this.tip_show) gr.GdiDrawText(panel.tip[this.hover_tab - 1], g_font, c_font, this.x+this.w+z8, this.y+hoverbg_offset, this.tipw, this.btw, lc_txt);
		if(this.hover_tab && this.hover_tab-1 != active_pid){
			if(this.down) gr.FillRoundRect(this.x + (this.hover_tab-1)*this.h_space, this.y+hoverbg_offset, this.btw, this.btw, z4, z4, c_shadow);
			else gr.FillRoundRect(this.x + (this.hover_tab-1)*this.h_space, this.y+hoverbg_offset, this.btw, this.btw, z4, z4, c_shadow_h);
		}
		gr.SetSmoothingMode(0);
		for (let i = 0; i < panel.p.length; i++){
			gr.GdiDrawText(panel.ico[i], g_fnico1, c_normal, this.x + this.h_space*i, ico_y, this.btw, this.btw, cc_txt);
		}
	}
	this.repaint = function () {
		window.RepaintRect(this.x, this.y, this.w, this.h);
	};
}

function get_panel() {
	for(let i = 0; i < allpanels.length; i++){
		let _p = null;
		try {_p = window.GetPanel(allpanels[i]);}catch(e){}
		if(_p) {
			panel.p.push(_p);
			panel.ico.push(panel.icos[allpanels[i]]);
			panel.tip.push(panel.tips[allpanels[i]]);
			let id = panel.p.length - 1;
			panel.p[id].ShowCaption = false;
			if(!panel.p[id].Hidden) {active_p = panel.p[id]; active_pid = id;}
		}
	}
	if(!active_p) active_p = panel.p[0];
	panel.p.push("settings");
	panel.ico.push("\uF0E4");
	panel.tip.push("设置");
}

function set_panel() {
	var ph = win_y - topbarh;
	try{
		if(active_p.Width != ww || active_p.Height != ph)
		active_p.Move(0, topbarh, ww, ph);
	}catch(e){}
}

function TimeFmt(t) {
	if (t < 0) return "00:00:00";
	var zpad = function(n) {
			var str = n.toString();
			return (str.length < 2) ? "0" + str : str;
		}
	var h = Math.floor(t / 3600);
	t -= h * 3600;
	m = Math.floor(t / 60);
	t -= m * 60, s = Math.floor(t);
	return zpad(h) + ":" + zpad(m) + ":" + zpad(s);
}

function Format_hms(t) {
	if (t=="?") return "00:00:00";
	var hms;
	if (t) {
		switch (t.length) {
		case 4:
			hms = "00:0" + t;
			break;
		case 5:
			hms = "00:" + t;
			break;
		case 7:
			hms = "0" + t;
			break;
		default:
			hms = t;
			break;
		}
		return hms;
	} else {
		return "00:00:00";
	}
}

function pos2vol(p) {
	return (50 * Math.log(0.99 * (p / 100) + 0.01) / Math.log(10));
}

function vol2pos(v) {
	return Math.round(((Math.pow(10, v / 50) - 0.01) / 0.99) * 100);
}

function get_font() {
	g_font = window.GetFontDUI(FontTypeDUI.playlists);
	zdpi = g_font.Size / 12;
	g_fsize = g_font.Size;
	g_font_b = GdiFont(g_font.Name, g_fsize, 1);
	img_ico = img_ico.Resize(18*zdpi, 18*zdpi, 2);
	g_fnico1 = GdiFont("remixicon", z(20), 0);
	g_fnico2 = GdiFont("remixicon", z(22), 0);
	g_fnico3 = GdiFont("remixicon", z(12), 0);	
	topbarh = z(26) + 2;
	topbtnw = z(46);
	menuicow = z(28);
	menulibw = topbtnw;
	menubtnw = z(36);
	z4 = z(4);
	z5 = z(5);
	z8 = z(8);
	minw = z(350);
	minh = z(250);
}

function get_color() {
	c_background_default = window.GetColourDUI(ColorTypeDUI.background);
	c_font = window.GetColourDUI(ColorTypeDUI.text);
	c_default_hl = window.GetColourDUI(ColorTypeDUI.highlight);
	dark_mode = isDarkMode(c_background_default);
	if(dark_mode) {
		c_topbg = RGBA(0, 0, 0, 50);
		c_btmbg = RGBA(0, 0, 0, 50);
		c_tip_bg = RGBA(0, 0, 0, 200);
		c_menubar = RGBA(0, 0, 0, 20);
		c_gradline = RGBA(255, 255, 255, 25);
		c_subtitle = blendColors(c_black, c_font, 0.75);
		c_normal = blendColors(c_black, c_font, 0.8);
		if(colorful_seek) colors_seek = [RGB(255,124,176), RGB(255,217,88), RGB(108,209,248)];
	} else {
		c_topbg = RGBA(0, 0, 0, 32);
		c_btmbg = RGBA(0, 0, 0, 15);
		c_tip_bg = RGBA(255, 255, 255, 200);
		c_menubar = RGBA(0, 0, 0, 12);
		c_gradline = RGBA(255, 255, 255, 50); 
		c_subtitle = blendColors(c_white, c_font, 0.75);
		c_normal = blendColors(c_white, c_font, 0.8);
		if(colorful_seek) colors_seek = [RGB(248,70,145), RGB(248,190,40), RGB(30,180,248)];
	}
	c_background = c_background_default;
	c_topbtnhover = c_font & 0x18ffffff;
	c_topbtndown= c_font & 0x30ffffff;
	c_shadow_h =  c_normal & 0x25ffffff;
	c_shadow = c_normal & 0x45ffffff;
	c_seek_bg =  c_normal & 0x35ffffff;
	c_seekoverlay = c_default_hl;
}

PBO_Menu = function(x, y) {
	var PBOmenu = window.CreatePopupMenu();
	var menu_item_count = 0;
	for (var i = 0; i < PBOTips.length; i++)
		PBOmenu.AppendMenuItem(MF_STRING, ++menu_item_count, PBOTips[i]);
	PBOmenu.CheckMenuRadioItem(1, menu_item_count, plman.PlaybackOrder + 1);
	var ret = 0;
	ret = PBOmenu.TrackPopupMenu(x, y, 0x0020);
	if (ret) {
		switch (ret) {
		default:
			plman.PlaybackOrder = ret - 1;
			PBOmenu.CheckMenuRadioItem(1, menu_item_count, ret);
			break;
		}
	}
}

function initbuttons(){
	if(fb.IsPlaying) {
		track_len = fb.TitleFormat("%length%").EvalWithMetadb(fb.GetNowPlaying());
		track_len = Format_hms(track_len);
		var track_time = TimeFmt(fb.PlaybackTime);
	}else{
		var track_time = "00:00:00";
		track_len = "00:00:00";
	}
	TopTitle = new UITextView("foobar2000 v" + fb.Version, g_font, c_font, lc_txt);
	TopSubTitle = new UITextView("", g_font, c_subtitle, lc_txt);
	RBtnTips = new UITextView("", g_font, c_font, rc_txt);
	PlaybackTimeText = new UITextView(track_time, g_font, c_font, rc_txt);
	PlaybackLengthText = new UITextView(track_len, g_font, c_font, lc_txt);
	PBOpen = new ButtonUI(img_pbcontrol);
	PBPrevious = new ButtonUI(img_pbcontrol);
	PBPlay = new ButtonUI(img_play);
	PBNext = new ButtonUI(img_pbcontrol);
	PBStop = new ButtonUI(img_pbcontrol);
	MuteBtn = new ButtonUI(btn_img);
	LibBtn = new ButtonUI(btn_img);
	PBOBtn = new ButtonUI(btn_img);
	g_switchbar = new oSwitchbar();
	CloseBtn = new ButtonUI(img_close);
	MaxBtn = new ButtonUI(img_winbtn);
	MinBtn = new ButtonUI(img_winbtn);
	if(show_menu) {
		MenubarBtn = [];
		for(var i = 0; i < 6; i++){
			if(i == 4) MenubarBtn.push(new ButtonUI(img_winbtn.Resize(menulibw,img_winbtn.Height,2)));
			else MenubarBtn.push(new ButtonUI(img_winbtn.Resize(menubtnw,img_winbtn.Height,2)));
		}
	} else MenuBtn = new ButtonUI(img_winbtn.Resize(menubtnw,img_winbtn.Height,2));
}

function init_overlay_obj() {
	var gb;
	if(!colorful_seek){
		let seek_time = gdi.CreateImage(100, z(20));
		gb = seek_time.GetGraphics();
		gb.SetSmoothingMode(0);
		gb.FillSolidRect(0, z8, 100, z4, c_seekoverlay);
		seek_time.ReleaseGraphics(gb);
	
		let imgh = z(20);
		let seeker = gdi.CreateImage(imgh, imgh);
		gb = seeker.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillEllipse(z4, z8/2, z4*3-1, z4*3-1, c_seekoverlay);
		gb.FillEllipse(z4*2, z8, z4-1,z4-1, blendColors(c_normal, c_background, 0.88));
		gb.SetSmoothingMode(0);
		seeker.ReleaseGraphics(gb);
	
		seekbar = new UISlider(seek_frame, seek_time, seeker);
	}
	
	imgh = z(32);
	let imgh2 = imgh * 2;
	let ecr = imgh - 2;
	img_play = gdi.CreateImage(imgh, imgh * 3);
	gb = img_play.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillEllipse(0, 0, ecr, ecr, c_seekoverlay);
	gb.FillEllipse(0, imgh, ecr, ecr, c_seekoverlay);
	gb.FillEllipse(0, imgh, ecr, ecr, RGBA(255,255,255,25));
	gb.FillEllipse(0, imgh2, ecr, ecr, c_seekoverlay);
	gb.FillEllipse(0, imgh2, ecr, ecr, RGBA(0,0,0,25));
	gb.SetTextRenderingHint(0);
	gb.SetSmoothingMode(2);
	img_play.ReleaseGraphics(gb);
}

function init_obj() {
	vol_len = Math.round((z(70) - 9)/10) * 10 + 9;
	seek_h = z(20);
	win_y = wh - z(68);
	let btn_space = z(12) + 3;
	let imgh = img_pbcontrol.Width, imgh_b = img_play.Width;
	btn_y = win_y + z(27);
	var win_y2 = win_y + z(2);
	var btn_y2 = btn_y - z(1);
	var btn_x = Math.round((ww-imgh*4-imgh_b-btn_space*4)/2);
	PBOpen.SetXY(btn_x, btn_y2);
	PBPrevious.SetXY(btn_x+imgh+btn_space, btn_y2);
	PBPlay.SetXY(btn_x+imgh*2+btn_space*2, btn_y - z(2) + 1);
	PBNext.SetXY(btn_x+imgh*2+imgh_b+btn_space*3, btn_y2);
	var btn_end_x = btn_x+imgh*3+imgh_b+btn_space*4;
	PBStop.SetXY(btn_end_x, btn_y2);
	seek_start = 3*btn_space+time_length;
	vol_start = ww - vol_len - seek_start;
	var volbtn_x = vol_start - MuteBtn.width - z5;
	seek_len = Math.max(0, ww - seek_start*2);
	PlaybackTimeText.SetSize(btn_space*2, win_y2, time_length, seek_h);
	PlaybackLengthText.SetSize(seek_len + seek_start + btn_space, win_y2, time_length, seek_h);
	TimeTip = new UITooltip(seek_start + z(12), win_y2, "", g_font, c_font, tip_bg);
	VolumeTip = new UITooltip(ww - seek_start + z5 - 1, btn_y + z(2), "", g_font, c_font, false);
	MuteBtn.SetXY(volbtn_x, btn_y);
	pbo_start = volbtn_x - btn_img.Width - z5;
	PBOBtn.SetXY(pbo_start - z(2), btn_y);
	LibBtn.SetXY(pbo_start - btn_img.Width - z(10) + 1, btn_y);
	RBtnTips.SetSize(pbo_start - btn_img.Width*5 - z5, btn_y, z(100), btn_img.Height/3);
	g_switchbar.setSize(seek_start, btn_y - z(1), g_switchbar.w, g_switchbar.h);
	CloseBtn.SetXY(ww - topbtnw, 0);
	MaxBtn.SetXY(ww - 2*topbtnw, 0);
	MinBtn.SetXY(ww - 3*topbtnw, 0);
	if(show_menu) {
		var _btnx = menuicow;
		for(var i = 0; i < MenubarBtn.length; i++){
			MenubarBtn[i].SetXY(_btnx, 0);
			if(i == 4) _btnx += menulibw;
			else _btnx += menubtnw;
		}
		leftbarw = _btnx;
	} else {
		MenuBtn.SetXY(0, 0);
		leftbarw = menubtnw;
	}
	captionw = ww - 3*topbtnw - leftbarw;
}

function setSize(){
	seekbar.setSize(seek_start, win_y + z(2), seek_len, seek_h);
	seekbar.MaxValue = Math.max(0, fb.PlaybackLength);
	VolumeBar.setSize(vol_start, btn_y + z5, vol_len, z(18));
	VolumeBar.Value = vol2pos(fb.Volume) | 0;
}

function RTips_switch(tiptext){
	var tip_old = RBtnTips.Text;
	RBtnTips.Text = tiptext;
	if(RBtnTips.Text == tip_old) return;
	if(tiptext == ""){
		RTips_timer && window.ClearTimeout(RTips_timer);
		RTips_timer = false;
		RBtnTips.Repaint();
	} else if(!RTips_timer){
		RTips_timer = window.SetTimeout(function() {
			RBtnTips.Text = tiptext;
			RBtnTips.Repaint();
			RTips_timer && window.ClearTimeout(RTips_timer);
			RTips_timer = false;
		}, 750);
	}
}

function repaintWin(section){
	switch(section){
		case "B":
			window.RepaintRect(0, win_y, ww, wh - win_y);
			break;
		case "T":
			window.RepaintRect(0, 0, ww, topbarh);
			break;
		case "TX":
			window.RepaintRect(leftbarw, 0, captionw, topbarh);
			break;
		case "G":
			window.RepaintRect(0, 0, ww, topbarh);
			window.RepaintRect(0, win_y, ww, wh - win_y);
			break;
	}
}

function main_Menu(x, y) {
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
	menuman3.Init("view");
	menuman4.Init("playback");
	menuman5.Init("library");
	menuman6.Init("help");

	menuman1.BuildMenu(child1, 1, 200);
	menuman2.BuildMenu(child2, 201, 200);
	menuman3.BuildMenu(child3, 401, 200);
	menuman4.BuildMenu(child4, 601, 300);
	menuman5.BuildMenu(child5, 901, 300);
	menuman6.BuildMenu(child6, 1201, 100);

	var ret = basemenu.TrackPopupMenu(x, y);//, 0x0008);

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
	}
	MenuBtn.Reset();
}

function menu_bar(i) {
	var _menu = window.CreatePopupMenu();
	var menuman1 = fb.CreateMainMenuManager();
	var x = menuicow;
	switch (i) {
		case 0:
			menuman1.Init("file");
			menuman1.BuildMenu(_menu, 1, 200);
			break;
		case 1:
			menuman1.Init("edit");
			menuman1.BuildMenu(_menu, 1, 200);
			x = x + menubtnw;
			break;
		case 2:
			menuman1.Init("view");
			menuman1.BuildMenu(_menu, 1, 200);
			x = x + menubtnw * 2;
			break;
		case 3:
			menuman1.Init("playback");
			menuman1.BuildMenu(_menu, 1, 200);
			x = x + menubtnw * 3;
			break;
		case 4:
			menuman1.Init("library");
			menuman1.BuildMenu(_menu, 1, 200);
			x = x + menubtnw * 4;
			break;
		case 5:
			menuman1.Init("help");
			menuman1.BuildMenu(_menu, 1, 200);
			x = x + menubtnw * 4 + menulibw;
			break;
	}

	var ret = _menu.TrackPopupMenu(x, topbarh);//, 0x0008);

	switch (true) {
	case (ret >= 1 && ret < 201):
		menuman1.ExecuteByID(ret - 1);
		break;
	}
	MenubarBtn[i].Reset();
}

function get_images() {
	//creat static images
	var gb;
	let _x8 = 8*zdpi, _x9 = 9*zdpi, _x10 = 10*zdpi, x12 = z(12), _x18 = 18*zdpi, _x27 = 27*zdpi, x28 = z(28);
	
	let vol_active = gdi.CreateImage(100, z(18));
	gb = vol_active.GetGraphics();
	gb.FillSolidRect(0, z(7), 100, z4, c_normal);
	vol_active.ReleaseGraphics(gb);
	let vol_seeker = gdi.CreateImage(x12, x12);
	gb = vol_seeker.GetGraphics();
	vol_seeker.ReleaseGraphics(gb);
	
	let vol_frame = gdi.CreateImage(100, z(18));
	gb = vol_frame.GetGraphics();
	gb.SetSmoothingMode(0);
	gb.FillSolidRect(0, z(7), 100, z4, c_seek_bg);
	vol_frame.ReleaseGraphics(gb);
	
	VolumeBar = new UISlider(vol_frame, vol_active, vol_seeker, true);
	
	seek_frame = gdi.CreateImage(100, z(20));
	gb = seek_frame.GetGraphics();
	gb.SetSmoothingMode(0);
	gb.FillSolidRect(0, z8, 100, z4, c_seek_bg);
	seek_frame.ReleaseGraphics(gb);
	
	if(colorful_seek){
		let seek_time = gdi.CreateImage(100, z(20));
		gb = seek_time.GetGraphics();
		gb.SetSmoothingMode(0);
		gb.FillGradRectV2(0, z8, 100, z4, 0, [0, colors_seek[0], 0.5, colors_seek[1], 1.0, colors_seek[2]]);
		seek_time.ReleaseGraphics(gb);
		let imgh = z(20);
		let seeker = gdi.CreateImage(imgh, imgh);
		gb = seeker.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillEllipse(z4, z8/2, z4*3-1, z4*3-1, colors_seek[2]);
		gb.FillEllipse(z4*2, z8, z4-1,z4-1, blendColors(c_normal, c_background, 0.88));
		gb.SetSmoothingMode(0);
		seeker.ReleaseGraphics(gb);
	
		seekbar = new UISlider(seek_frame, seek_time, seeker);
	}
	
	let imgh = z(30), imgh2 = imgh * 2, hotdia = imgh-2;
	img_pbcontrol = gdi.CreateImage(imgh, imgh * 3);
	gb = img_pbcontrol.GetGraphics();
	time_length = gb.CalcTextWidth("00:00:00"+" ", g_font);
	gb.SetSmoothingMode(2);
	gb.FillEllipse(0, imgh, hotdia, hotdia, c_shadow_h);
	gb.FillEllipse(0, imgh2, hotdia, hotdia, c_shadow);
	gb.SetSmoothingMode(0);
	img_pbcontrol.ReleaseGraphics(gb);

	tip_bg = gdi.CreateImage(50, 22);
	gb = tip_bg.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillRoundRect(1, 1, 48, 20, 5, 5, c_tip_bg);
	gb.SetSmoothingMode(0);
	tip_bg.ReleaseGraphics(gb);

	btn_img = gdi.CreateImage(x28, z(84));
	gb = btn_img.GetGraphics();
	gb.SetSmoothingMode(4);
	gb.FillRoundRect(0, x28+1, x28-2, x28-2, z4, z4, c_shadow_h);
	gb.FillRoundRect(0, x28*2+1, x28-2, x28-2, z4, z4, c_shadow);
	gb.SetSmoothingMode(0);
	btn_img.ReleaseGraphics(gb);
	
	imgh = topbarh - 1;
	imgh2 = imgh*2;
	img_close = gdi.CreateImage(topbtnw, imgh*3);
	gb = img_close.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawLine(_x18, _x9, _x27, _x18, z(1), c_font);
	gb.DrawLine(_x18, _x18, _x27, _x9, z(1), c_font);
	gb.SetSmoothingMode(0);
	gb.FillSolidRect(0, imgh, topbtnw, imgh, RGB(232, 17, 35));
	gb.SetSmoothingMode(2);
	gb.DrawLine(_x18, _x9 + imgh, _x27, _x18 + imgh, z(1), c_white);
	gb.DrawLine(_x18, _x18 + imgh, _x27, _x9 + imgh, z(1),  c_white);
	gb.SetSmoothingMode(0);
	gb.FillSolidRect(0, imgh2, topbtnw, imgh, RGB(241, 112, 122));
	gb.SetSmoothingMode(2);
	gb.DrawLine(_x18, _x9 + imgh2, _x27, _x18 + imgh2, z(1),  c_white);
	gb.DrawLine(_x18, _x18 + imgh2, _x27, _x9 + imgh2, z(1),  c_white);
	gb.SetSmoothingMode(0);
	img_close.ReleaseGraphics(gb);
	
	img_winbtn = gdi.CreateImage(topbtnw, imgh*3);
	gb = img_winbtn.GetGraphics();
	gb.SetSmoothingMode(0);
	gb.FillSolidRect(0, imgh, topbtnw, imgh, c_topbtnhover);
	gb.SetSmoothingMode(0);
	gb.FillSolidRect(0, imgh2, topbtnw, imgh, c_topbtndown);
	img_winbtn.ReleaseGraphics(gb);
	
	imgh = z(26)
	img_max = gdi.CreateImage(imgh, imgh);
	gb = img_max.GetGraphics();
	gb.SetSmoothingMode(0);
	gb.DrawRect(_x8, _x8, _x10-1, _x10-1, z(1), c_font);
	img_max.ReleaseGraphics(gb);
	
	img_min = gdi.CreateImage(imgh, imgh);
	gb = img_min.GetGraphics();
	gb.SetSmoothingMode(0);
	gb.DrawLine(_x8, 13*zdpi, _x18, 13*zdpi, z(1), c_font);
	img_min.ReleaseGraphics(gb);
	
	imgh = x12;
	playing_ico = gdi.CreateImage(imgh, imgh);
	gb = playing_ico.GetGraphics();
	gb.SetTextRenderingHint(4);
	gb.DrawString("\uF00A", g_fnico3, c_normal, 0, 0, imgh, imgh, cc_stringformat);
	gb.SetTextRenderingHint(0);
	playing_ico.ReleaseGraphics(gb);
}

function on_init(){
	let _addtext;
	try{
		let _cfg = utils.ReadTextFile(fb.ProfilePath + "foobox\\config\\miscconf", 0);
		_cfg = _cfg.split("##");
		show_menu = Number(_cfg[0]);
		show_extrabtn = Number(_cfg[1]);
		if(fbver > 1){
			lib_albumlist = Number(_cfg[2]);
			lib_tooltip = lib_albumlist ? "专辑列表" : "分面查看器";
		}
		_addtext = _cfg[4];
		colorful_seek = Number(_cfg[5]);
	}catch(e){}
	if(_addtext && _addtext != "null") {
		top_addtext = _addtext;
	}
	get_font();
	UiCompInit();
	get_color();
	get_images();
	get_panel();
	init_overlay_obj();
	initbuttons();
}

//=============start=====================
window.DlgCode = 0x0004;
on_init();

function on_size() {
	ww = window.Width;
	wh = window.Height;
	if (!ww || !wh) return;
	window.MinWidth = minw;
	window.MinHeight = minh;
	init_obj();
	setSize();
	if(ww) set_panel();
	UiCompSetCaption();
}

function on_paint(gr) {
	let grey_1 = RGBA(0, 0, 0, 45);
	gr.FillSolidRect(0, 0, ww, wh, c_background);
	gr.FillGradRect(0, 0, ww, 1, 0, c_background, c_background, 1);//bug of win10 border
	gr.FillGradRect(0, 0, 1, topbarh, 0, c_background, c_background, 1);//bug of win10 border
	gr.FillGradRect(ww-1, 0, 1, topbarh, 0, c_background, c_background, 1);//bug of win10 border
	gr.FillSolidRect(0, 0, ww, topbarh, c_topbg);
	gr.DrawLine(0, topbarh-1, ww, topbarh-1, 1, grey_1);
	gr.FillGradRect(0, wh-2, ww, 2, 0, c_background, c_background, 1);//bug of win10 border
	gr.FillGradRect(0, win_y, 1, wh-win_y, 0, c_background, c_background, 1);//bug of win10 border
	gr.FillGradRect(ww-1, win_y, 1, wh-win_y, 0, c_background, c_background, 1);//bug of win10 border
	gr.FillSolidRect(0, win_y, ww, wh-win_y, c_btmbg);
	CloseBtn.Paint(gr);
	MaxBtn.Paint(gr);
	MinBtn.Paint(gr);
	title_w = gr.CalcTextWidth(TopTitle.Text+" ", g_font);
	if(show_menu) {
		gr.FillSolidRect(0, 0, leftbarw, topbarh - 1, c_menubar);
		gr.DrawImage(img_ico, Math.round((menuicow - img_ico.Width)/2), Math.round((topbarh-img_ico.Height)/2), img_ico.Width, img_ico.Height, 0, 0, img_ico.Width, img_ico.Height);
		for(var i = 0; i < MenubarBtn.length; i++){
			MenubarBtn[i].Paint(gr);
		}
		gr.GdiDrawText("文件", g_font, c_font, menuicow, 0, menubtnw, topbarh, cc_txt);
		gr.GdiDrawText("编辑", g_font, c_font, menuicow +  menubtnw, 0, menubtnw, topbarh, cc_txt);
		gr.GdiDrawText("视图", g_font, c_font, menuicow +  menubtnw*2, 0, menubtnw, topbarh, cc_txt);
		gr.GdiDrawText("播放", g_font, c_font, menuicow +  menubtnw*3, 0, menubtnw, topbarh, cc_txt);
		gr.GdiDrawText("媒体库", g_font, c_font, menuicow +  menubtnw*4, 0, menulibw, topbarh, cc_txt);
		gr.GdiDrawText("帮助", g_font, c_font, menuicow +  menubtnw*4 + menulibw, 0, menubtnw, topbarh, cc_txt);
		gr.FillGradRect(leftbarw, 0, 1,topbarh - 1, 90, RGBA(0, 0, 0, 3), grey_1, 0.5);
		gr.FillGradRect(leftbarw + 1, 0, 1,topbarh - 1, 90, c_background, c_gradline, 0.5);
		let space_1 = z8;
		let space_2 = 0;
		let _icow = playing_ico.Width;
		if(fb.IsPlaying) {
			space_2 = z(16);
			if (g_seconds / 2 == Math.floor(g_seconds / 2)) gr.DrawImage(playing_ico, leftbarw + space_1, Math.floor((topbarh - _icow)/2), _icow, _icow, 0, 0, _icow, _icow, 0, 100);
			else gr.DrawImage(playing_ico, leftbarw + space_1, Math.floor((topbarh - _icow)/2), _icow, _icow, 0, 0, _icow, _icow,0,255);
		}
		TopTitle.SetSize(leftbarw + space_1 + space_2, 0, title_w, topbarh);
		TopSubTitle.SetSize(leftbarw + title_w + space_1 + space_2, 0, ww - leftbarw - title_w - 3*topbtnw - g_fsize, topbarh);
	} else {
		gr.DrawImage(img_ico, Math.round((menubtnw - img_ico.Width)/2), Math.round((topbarh-img_ico.Height)/2), img_ico.Width, img_ico.Height, 0, 0, img_ico.Width, img_ico.Height);
		MenuBtn.Paint(gr);
		TopTitle.SetSize(leftbarw, 0, title_w, topbarh);
		TopSubTitle.SetSize(leftbarw + title_w, 0, captionw - title_w - g_fsize, topbarh);
	}
	gr.DrawImage(img_max, Math.round(ww - topbtnw*1.5 - img_max.Width/2), 1, img_max.Width, img_max.Height, 0, 0, img_max.Width, img_max.Height);
	gr.DrawImage(img_min, Math.round(ww - topbtnw*2.5 - img_min.Width/2), 1, img_min.Width, img_min.Height, 0, 0, img_min.Width, img_min.Height);
	
	TopTitle.Paint(gr);
	TopSubTitle.Paint(gr);
	PBPrevious.Paint(gr);
	PBPlay.Paint(gr);
	PBNext.Paint(gr);
	gr.GdiDrawText((fb.IsPlaying && !fb.IsPaused) ? "\uEFD8" : "\uF00A", g_fnico2, c_white, PBPlay.x, PBPlay.y, PBPlay.width, PBPlay.height-4, cc_txt);
	gr.GdiDrawText("\uF140", g_fnico2, c_normal, PBPrevious.x, PBPrevious.y, PBPrevious.width-2, PBPrevious.height-4, cc_txt);
	gr.GdiDrawText("\uF144", g_fnico2, c_normal, PBNext.x, PBNext.y, PBNext.width-2, PBNext.height-4, cc_txt);
	if(show_extrabtn){
		PBOpen.Paint(gr);
		PBStop.Paint(gr);
		gr.GdiDrawText("\uEC88", g_fnico2, c_normal, PBOpen.x, PBOpen.y, PBOpen.width-2, PBOpen.height-4, cc_txt);
		gr.GdiDrawText("\uF1A1", g_fnico2, c_normal, PBStop.x, PBStop.y, PBStop.width-2, PBStop.height-4, cc_txt);
	}
	PlaybackTimeText.Paint(gr);
	PlaybackLengthText.Paint(gr);
	seekbar.Paint(gr);
	TimeTip.Paint(gr);
	if(ww > 10.5*vol_len){
		btnall = true;
		VolumeBar.Paint(gr);
		VolumeTip.Paint(gr);
		LibBtn.Paint(gr);
		MuteBtn.Paint(gr);
		PBOBtn.Paint(gr);
		RBtnTips.Paint(gr);
		gr.GdiDrawText(fb.Volume == -100 ? "\uF29E" : "\uF2A2", g_fnico1, c_normal, MuteBtn.x, MuteBtn.y, MuteBtn.width-2, MuteBtn.height-2, cc_txt);
		gr.GdiDrawText(PBOIcos[plman.PlaybackOrder], g_fnico1, c_normal, PBOBtn.x, PBOBtn.y, PBOBtn.width-2, PBOBtn.height-2, cc_txt);
		gr.GdiDrawText("\uF44B", g_fnico1, c_normal, LibBtn.x, LibBtn.y, LibBtn.width-2, LibBtn.height-2, cc_txt);
		g_switchbar.draw(gr);
	} else btnall = false;
}

function on_mouse_move(x, y) {
	if(m_x == x && m_y == y) return;
	if (fb.IsPlaying && seekbar.MouseMove(x, y)) {
		TimeTip.Text = TimeFmt(seekbar.Value);
		if (x < seek_start) _x = seek_start;
		else if (x > seek_start + seek_len) _x = seek_start + seek_len;
		else _x = x;
		TimeTip.X = (x > seek_start + seek_len - TimeTip.Width - 12) ? _x - TimeTip.Width - 12 : _x + 6;
		TimeTip.Repaint();
	}
	if (VolumeBar.MouseMove(x, y)) {
		fb.Volume = pos2vol(VolumeBar.Value);
		VolumeTip.Text = (fb.Volume | 0).toString() + " dB  ";
		VolumeTip.Repaint();
	} else if(VolumeTip.Visible) VolumeTip.Deactivate();
	if(y < topbarh + 1) {
		if (CloseBtn.MouseMove(x, y)) hbtn = true;
		if (MaxBtn.MouseMove(x, y)) hbtn = true;
		if (MinBtn.MouseMove(x, y)) hbtn = true;
		if(show_menu) {
			for(var i = 0; i < MenubarBtn.length; i++){
				if (MenubarBtn[i].MouseMove(x, y)) hbtn = true;
			}
		} else {
			if (MenuBtn.MouseMove(x, y)) hbtn = true;
		}
	} else if(y > win_y - 1){
		var _x = 0;
		if(show_extrabtn){
			if (PBOpen.MouseMove(x, y)) hbtn = true;
			if (PBStop.MouseMove(x, y)) hbtn = true;
		}
		if (PBPrevious.MouseMove(x, y)) hbtn = true;
		if (PBPlay.MouseMove(x, y)) hbtn = true;
		if (PBNext.MouseMove(x, y)) hbtn = true;
		if(btnall){
			if (LibBtn.MouseMove(x, y)){
				hbtn = true;
				RTips_switch(lib_tooltip);
			} else if (PBOBtn.MouseMove(x, y)) {
				hbtn = true;
				RTips_switch(PBOTips[plman.PlaybackOrder]);
			} else RTips_switch("");
			if (MuteBtn.MouseMove(x, y)) hbtn = true;
			g_switchbar.on_mouse("move", x, y);
		}
	}
	m_x = x;
	m_y = y;
}

function on_mouse_lbtn_down(x, y) {
	if(y < topbarh + 1) {
		CloseBtn.MouseDown(x, y);
		MaxBtn.MouseDown(x, y);
		MinBtn.MouseDown(x, y);
		if(show_menu){
			for(var i = 0; i < MenubarBtn.length; i++){
				if(MenubarBtn[i].MouseDown(x, y)){
					hbtn = false;
					menu_bar(i);
				}
			}
		}else{
			if(MenuBtn.MouseDown(x, y)){
				hbtn = false;
				main_Menu(0, topbarh);
			}
		}
	} else if(y > win_y - 1){
		var _x = 0;
		if(show_extrabtn){
			PBOpen.MouseDown(x, y);
			PBStop.MouseDown(x, y);
		}
		PBPrevious.MouseDown(x, y);
		PBPlay.MouseDown(x, y);
		PBNext.MouseDown(x, y);
		if(btnall){
			LibBtn.MouseDown(x, y);
			MuteBtn.MouseDown(x, y);
			g_switchbar.on_mouse("lbtn_down", x, y);
			if (PBOBtn.MouseDown(x, y)) {
				hbtn = false;
				PBO_Menu(pbo_start - z(2), PBOBtn.y);
				PBOBtn.Reset();
			}
			if (VolumeBar.MouseDown(x, y)) {
				fb.Volume = pos2vol(VolumeBar.Value);
				VolumeTip.Text = (fb.Volume | 0).toString() + " dB";
				VolumeTip.Activate();
			}
		}
		if (seekbar.MouseDown(x, y)) {
			if (x < seek_start) _x = seek_start;
			else if (x > seek_start + seek_len) _x = seek_start + seek_len;
			else _x = x;
			TimeTip.X = (x > seek_start + seek_len - TimeTip.Width - 6) ? _x - TimeTip.Width - 6 : _x + 6;
			TimeTip.Activate();
		}
	}
}

function on_mouse_lbtn_up(x, y) {
	if (seekbar.MouseUp()) {
		PlaybackTimeText.ChangeText(TimeFmt(seekbar.Value));
		fb.PlaybackTime = seekbar.Value;
		TimeTip.Repaint();
		TimeTip.Deactivate();
	}
	if(btnall) VolumeBar.MouseUp();
	if(y < topbarh + 1) {
		if (CloseBtn.MouseUp()) fb.Exit();
		if (MaxBtn.MouseUp()) {
			if(UIComp.WindowState != 2) UIComp.WindowState = 2;//maximized
			else UIComp.WindowState = 0;// normal
		}
		if (MinBtn.MouseUp()) {
			UIComp.WindowState = 1;// minimized
		}
		if(show_menu){
			for(var i = 0; i < MenubarBtn.length; i++){
				MenubarBtn[i].MouseUp();
			}
		} else MenuBtn.MouseUp();
	} else if(y > win_y - 1){
		if(show_extrabtn){
			if (PBOpen.MouseUp()) fb.RunMainMenuCommand("打开...");
			if (PBStop.MouseUp()) fb.Stop();
		}
		if (PBPrevious.MouseUp()) fb.Prev();
		if (PBPlay.MouseUp()) fb.PlayOrPause();
		if (PBNext.MouseUp()) fb.Next();
		if(btnall){
			if (MuteBtn.MouseUp()) fb.VolumeMute();
			if (LibBtn.MouseUp()) {
				if(lib_albumlist) fb.RunMainMenuCommand("媒体库/专辑列表");
				else fb.RunMainMenuCommand("媒体库/分面查看器");
			}
			g_switchbar.on_mouse("lbtn_up", x, y);
			PBOBtn.MouseUp();
		}
	}
}

function on_mouse_leave() {
	seekbar.MouseLeave();
	if(btnall) {
		VolumeBar.MouseLeave();
		if(VolumeTip.Visible) VolumeTip.Deactivate();
		g_switchbar.on_mouse("leave");
		RTips_switch("");
	}
	if (!hbtn) return;
	else {
		if(show_extrabtn){
			PBOpen.Reset();
			PBStop.Reset();
		}
		PBPrevious.Reset();
		PBPlay.Reset();
		PBNext.Reset();
		if(btnall) {
			LibBtn.Reset();
			MuteBtn.Reset();
			PBOBtn.Reset();
		}
		CloseBtn.Reset();
		MaxBtn.Reset();
		MinBtn.Reset();
		if(show_menu){
			for(var i = 0; i < MenubarBtn.length; i++){
				MenubarBtn[i].Reset();
			}
		} else MenuBtn.Reset();
	}
}

function on_mouse_wheel(step) {
	if (seekbar.MouseWheel(step, 2)) {
		PlaybackTimeText.ChangeText(TimeFmt(seekbar.Value));
		fb.PlaybackTime = seekbar.Value;
	}
	if(btnall) {
		if (VolumeBar.MouseWheel(step, 2)) {
			fb.Volume = pos2vol(VolumeBar.Value);
			VolumeTip.Text = (fb.Volume | 0).toString() + " dB  ";
			VolumeTip.Activate();
		}
	}
}

function on_playback_pause(state) {
	PBPlay.Repaint();
}

function on_playback_new_track(info) {
	PBPlay.Repaint();
	seekbar.MaxValue = Math.max(0, fb.PlaybackLength);
	seekbar.ChangeValue(0);
	if(info){
		track_len = fb.TitleFormat("%length%").EvalWithMetadb(info);
		track_len = Format_hms(track_len);
		if(track_len) PlaybackLengthText.ChangeText(track_len);
	}
	
	TopTitle.Text = fb.TitleFormat("%title%").EvalWithMetadb(info);
	TopSubTitle.Text = fb.TitleFormat("$if2( - %album artist%,)$if2(\xa0 | \xa0%album%,)").EvalWithMetadb(info);
	if(top_addtext != "") TopSubTitle.Text = TopSubTitle.Text + "\xa0 | \xa0" + fb.TitleFormat(top_addtext).EvalWithMetadb(info);
	repaintWin("TX");
}

function on_metadb_changed(handles, fromhook) {
	if(!fromhook && fb.IsPlaying) {
		metadb = fb.GetNowPlaying();
		if(metadb && handles.Find(metadb) > -1){
			TopTitle.Text = fb.TitleFormat("%title%").EvalWithMetadb(metadb);
			TopSubTitle.Text = fb.TitleFormat("$if2( - %album artist%,)$if2(\xa0 | \xa0%album%,)").EvalWithMetadb(metadb);
			if(top_addtext != "") TopSubTitle.Text = TopSubTitle.Text + "\xa0 | \xa0" + fb.TitleFormat(top_addtext).EvalWithMetadb(metadb);
			repaintWin("TX");
		}
	}
}

function on_playback_stop(reason) {
	PBPlay.Repaint();
	if (reason != 2) {
		PlaybackTimeText.ChangeText("00:00:00");
		seekbar.MaxValue = 0;
		seekbar.ChangeValue(0);
	}
	
	TopTitle.Text = "foobar2000 v" + fb.Version;
	TopSubTitle.Text = "";
	repaintWin("TX");
}

function on_playback_time(time) {
	PlaybackTimeText.ChangeText(TimeFmt(time));
	if (seekbar.State != 2) seekbar.ChangeValue(time);
	if (show_menu) {
		g_seconds = time;
		window.RepaintRect(leftbarw, 0, menuicow, topbarh);
	}
}

function on_volume_change(v) {
	VolumeBar.ChangeValue(vol2pos(v) | 0);
}

function on_playback_order_changed() {
	PBOBtn.Repaint();
}

function on_font_changed() {
	get_font();
	get_images();
	init_overlay_obj();
	initbuttons();
	init_obj();
	setSize();
	set_panel();
	repaintWin("G");
};

function on_colours_changed() {
	get_color();
	get_images();
	init_overlay_obj();
	initbuttons();
	init_obj();
	setSize();
	repaintWin("G");
};

function on_mouse_rbtn_up() {
	return true;
}

function on_notify_data(name, info) {
	switch (name) {
	case "color_scheme_updated":
		let btm_only = false
		if(!info) {
			c_seekoverlay = c_default_hl;
			c_background = c_background_default;
		} else {
			c_seekoverlay = RGB(info[0], info[1], info[2]);
			if(info.length > 3) {
				c_background = RGB(info[3], info[4], info[5]);
			} else btm_only = true;
		}
		init_overlay_obj();
		PBPlay.img = img_play;
		setSize();
		if(btm_only) repaintWin("B");
		else repaintWin("G");
		break;
	case "Show_open_stop_buttons":
		show_extrabtn = info;
		repaintWin("B");
		break;
	case "Lib_button_function":
		if(fbver > 1){
			lib_albumlist = info;
			lib_tooltip = lib_albumlist ? "专辑列表" : "分面查看器";
		}
		break;
	case "titlebar_addinfo":
		top_addtext = info;
		break;
	case "panel_switch":
		if(info){
			active_pid = 3;
			g_switchbar.repaint();
		} else {
			active_pid = 0;
			g_switchbar.repaint();
		}
		break;
	case "colorful_seekbar":
		colorful_seek = info;
		if(colorful_seek) {
			if(dark_mode) colors_seek = [RGB(255,124,176), RGB(255,217,88), RGB(108,209,248)];
			else colors_seek = [RGB(248,70,145), RGB(248,190,40), RGB(30,180,248)];
			get_images();
		} else {
			init_overlay_obj();
		}
		setSize();
		repaintWin("B");
		break;
	case "Show_menubar":
		show_menu = info;
		if(show_menu) {
			MenubarBtn = [];
			for(var i = 0; i < 6; i++){
				if(i == 4) MenubarBtn.push(new ButtonUI(img_winbtn.Resize(menulibw,img_winbtn.Height,2)));
				else MenubarBtn.push(new ButtonUI(img_winbtn.Resize(menubtnw,img_winbtn.Height,2)));
			}
			var _btnx = menuicow;
			for(var i = 0; i < MenubarBtn.length; i++){
				MenubarBtn[i].SetXY(_btnx, 0);
				if(i == 4) _btnx += menulibw;
				else _btnx += menubtnw;
			}
			leftbarw = _btnx;
		} else {
			MenuBtn = new ButtonUI(img_winbtn.Resize(menubtnw,img_winbtn.Height,2));
			MenuBtn.SetXY(0, 0);
			leftbarw = menubtnw;
		}
		captionw = ww - 3*topbtnw - leftbarw;
		UiCompSetCaption();
		repaintWin("T");
		break;
	}
}

function on_key_down(vkey) {
	var mask = GetKeyboardMask();
	switch (mask) {
	case KMask.alt:
		if(vkey == 115) fb.RunMainMenuCommand("文件/退出");
		else if(show_menu){
			switch (vkey) {
			case 70:
				menu_bar(0);
				break;
			case 69:
				menu_bar(1);
				break;
			case 86:
				menu_bar(2);
				break;
			case 80:
				menu_bar(3);
				break;
			case 76:
				menu_bar(4);
				break;
			case 72:
				menu_bar(5);
				break;
			}
		}
		break;
	}
}