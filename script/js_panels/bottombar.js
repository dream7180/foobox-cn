//foobox https://github.com/dream7180
var time_length = 0;
var zdpi, c_background, c_font, c_normal, c_shadow, c_shadow_h, c_seek_bg, c_tip_bg, c_seekoverlay, c_default_hl, c_seeker_core, c_pb_ov, c_pb_down,
	img_play, img_pause, img_next, img_previous, img_vol, img_pbo = [], img_list, img_cover, img_lib, img_bio, img_vis, img_video;

//play back order
var PBOTips = new Array("默认", "重复(列表)", "重复(音轨)", "随机", "乱序(音轨)", "乱序(专辑)", "乱序(目录)");
var hbtn = false;
var ww = 0,
	wh = 0;
var seek_len, seek_start,seek_h, vol_start, vol_len, pbo_start, btn_y, win_y, rec_r;
var PBOpen, PBPrevious, PBPlay, PBNext, PBStop;
var track_len = 0, PlaybackTimeText, PlaybackLengthText;
var VolumeBar, seekbar, TimeTip, VolumeTip, MuteBtn, PBOBtn, LibBtn;
var show_extrabtn = window.GetProperty("foobox.show.Open.Stop.buttons", true);
var lib_albumlist = Number(fb.Version.substr(0, 1)) == 1 ? true : window.GetProperty("Library.button: Show.Albumlist", true);
var lib_tooltip = lib_albumlist ? "专辑列表" : "分面";
var LIST = window.GetPanel('list'),
	BRW = window.GetPanel('brw'),
	BIO = window.GetPanel('bio'),
	VIS = window.GetPanel('vis'),
	VIDEO = window.GetPanel('video'),
	active_p = LIST,
	active_pid = 0,
	bio_panel, video_panel;
var p_tips = ['播放列表', '封面浏览器'];
LIST.ShowCaption = BRW.ShowCaption = VIS.ShowCaption = false;
	
//=====================================================
oSwitchbar = function() {
	this.btw = z(28);
	this.bth = z(24);
	this.h_space = z(41) - (bio_panel + video_panel)*z(3);
	this.x = 5;
	this.y = 5;
	this.w = this.h_space*(2 + bio_panel + video_panel) + this.btw + 2;
	this.h = this.bth + z(2);
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
	};
	this.on_mouse = function(event, x, y) {
		var down_old = this.down;
		this.tab_old = this.hover_tab;
		var tip_old = g_switchbar.tip_timer;
		this.ishover = this._isHover(x, y);
		switch (event) {
		case "move":
			if(this.ishover){
				if(x > this.x && x < this.x + this.btw) this.hover_tab = 1;
				else if (x > this.x + this.h_space && x < this.x + this.h_space + this.btw) this.hover_tab = 2;
				else if (x > this.x + this.h_space*2 && x < this.x + this.h_space*2 + this.btw) this.hover_tab = 3;
				else if ((bio_panel + video_panel) && x > this.x + this.h_space*3 && x < this.x + this.h_space*3 + this.btw) this.hover_tab = 4;
				else if ((bio_panel + video_panel == 2) && x > this.x + this.h_space*4 && x < this.x + this.h_space*4 + this.btw) this.hover_tab = 5;
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
						}, 800);
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
				this.swith_panel(this.hover_tab);
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
	this.swith_panel = function(id) {
		active_p.Show(false);
		active_pid = id - 1;
		switch(active_pid){
			default:
			case 0:
				active_p = LIST;
			break;
			case 1:
				active_p = BRW;
			break;
			case 2:
				if(bio_panel) active_p = BIO;
				else active_p = VIS;
			break;
			case 3:
				if(bio_panel) active_p = VIS;
				else if(video_panel) active_p = VIDEO;
			break;
			case 4:
				if(bio_panel + video_panel) active_p = VIDEO;
			break;
		}
		active_p.Show(true);
		set_panel();
	}
	this.draw = function(gr){
		var ico_y = this.y + Math.floor(6*zdpi) + 1, hoverbg_offset = z(1), imgw = img_list.Width, imgh = img_list.Height;
		gr.SetSmoothingMode(4);
		gr.FillRoundRect(this.x + active_pid*this.h_space, this.y+hoverbg_offset, this.btw, this.bth, rec_r, rec_r, c_normal & 0x30ffffff);
		if(this.hover_tab && this.tip_show) gr.GdiDrawText(p_tips[this.hover_tab-1], g_font, c_font, this.x+this.w+z(8), this.y+hoverbg_offset, this.tipw, this.bth, lc_txt);
		if(this.hover_tab && this.hover_tab-1 != active_pid){
			if(this.down) gr.FillRoundRect(this.x + (this.hover_tab-1)*this.h_space, this.y+hoverbg_offset, this.btw, this.bth, rec_r, rec_r, c_shadow);
			else gr.FillRoundRect(this.x + (this.hover_tab-1)*this.h_space, this.y+hoverbg_offset, this.btw, this.bth, rec_r, rec_r, c_shadow_h);
		}
		gr.SetSmoothingMode(0);
		gr.DrawImage(img_list, this.x + z(5), ico_y, imgw, imgh, 0, 0, imgw, imgh,0,255);
		gr.DrawImage(img_cover, this.x + this.h_space + z(5), ico_y, imgw, imgh, 0, 0, imgw, imgh,0,255);
		if(bio_panel) gr.DrawImage(img_bio, this.x + this.h_space*2 + z(5), ico_y-1, imgw, imgh, 0, 0, imgw, imgh,0,255);
		gr.DrawImage(img_vis, this.x + this.h_space*(2+bio_panel) + z(5), ico_y-1, imgw, imgh, 0, 0, imgw, imgh,0,255);
		if(video_panel) gr.DrawImage(img_video, this.x + this.h_space*(3+bio_panel) + z(5), ico_y-1, imgw, imgh, 0, 0, imgw, imgh,0,255);
	}
	this.repaint = function () {
		window.RepaintRect(this.x, this.y, this.w, this.h);
	};
}

function detect_panel(){
	try{
		bio_panel = BIO.Name;
		bio_panel = 1;
		p_tips.push("简介");
	} catch(e) {bio_panel = 0;}
	p_tips.push("可视化");
	try{
		video_panel = VIDEO.Name;
		video_panel = 1;
		p_tips.push("视频");
	} catch(e) {video_panel = 0;}
}

function get_panel() {
	if(!LIST.Hidden) {active_p = LIST; active_pid = 0;}
	else if(!BRW.Hidden) {active_p = BRW; active_pid = 1;}
	else if(bio_panel && !BIO.Hidden) {active_p = BIO; active_pid = 2;}
	else if(!VIS.Hidden) {active_p = VIS; active_pid = 2 + bio_panel;}
	else if(video_panel) {active_p = VIDEO; active_pid = 3 + bio_panel;}
}

function set_panel() {
	var ph = win_y - z(2);
	try{
		if(active_p.Width != ww || active_p.Height != ph)
		active_p.Move(0, 0, ww, ph);
	} catch(e){//快速设置布局的bug
		LIST = window.GetPanel('list');
		BRW = window.GetPanel('brw');
		BIO = window.GetPanel('bio');
		VIS = window.GetPanel('vis');
		VIDEO = window.GetPanel('video');
		active_p = LIST;
		active_pid = 0;
		active_p.Move(0, 0, ww, ph);
		var tmp_biopanel = bio_panel;
		var tmp_videopanel = video_panel;
		var getbio_timer = false;
		if(!getbio_timer){
			getbio_timer = window.SetTimeout(function() {
				 detect_panel();
				if(bio_panel != tmp_biopanel || video_panel != tmp_videopanel) {
					g_switchbar = new oSwitchbar();
					g_switchbar.setSize(seek_start -z(5), btn_y, g_switchbar.w, g_switchbar.h);
					window.Repaint();
				}
				g_switchbar.tip_timer && window.ClearTimeout(g_switchbar.tip_timer);
				g_switchbar.tip_timer = false;
			}, 250);
		}
	}
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
	rec_r = z(4);
}

function get_color() {
	c_background = utils.GetSysColour(COLOR_3DFACE);
	c_font= window.GetColourDUI(ColorTypeDUI.text);
	var light_mode = isDarkMode(c_font);
	if(!isDarkMode(c_background) && !light_mode){
		c_background = RGB(32, 32, 32);//window.GetColourDUI(ColorTypeDUI.background);
		
	}
	c_normal = blendColors(c_background, c_font, 0.75);
	c_default_hl = window.GetColourDUI(ColorTypeDUI.highlight);
	c_seekoverlay = c_default_hl;
	c_shadow_h =  c_normal & 0x25ffffff;
	c_shadow = c_normal & 0x45ffffff;
	c_seek_bg =  c_normal & 0x35ffffff;
	if (light_mode){
		c_tip_bg = RGBA(255, 255, 255, 200);
		c_seeker_core = RGB(255, 255, 255);
	} else {
		c_tip_bg = RGBA(0, 0, 0, 200);
		c_seeker_core = RGB(0, 0, 0);
	}
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
	PlaybackTimeText = new UITextView(track_time, g_font, c_font, rc_txt);
	PlaybackLengthText = new UITextView(track_len, g_font, c_font, lc_txt);
	PBOpen = new ButtonUI(img_open, null);
	PBPrevious = new ButtonUI(img_previous, null);
	PBPlay = new ButtonUI((fb.IsPlaying && !fb.IsPaused) ? img_pause : img_play, null);
	PBNext = new ButtonUI(img_next, null);
	PBStop = new ButtonUI(img_stop, null);
	MuteBtn = new ButtonUI(btn_img, null);
	LibBtn = new ButtonUI(btn_img, lib_tooltip);
	PBOBtn = new ButtonUI(btn_img, PBOTips[plman.PlaybackOrder]);
	g_switchbar = new oSwitchbar();
}

function init_overlay_obj(overlay_frame, overlay_seek) {
	var gb;
	let _x1 = zdpi, _x12 = 12*zdpi, _x30 = 30*zdpi;
	seek_frame = gdi.CreateImage(100, z(20));
	gb = seek_frame.GetGraphics();
	gb.SetSmoothingMode(0);
	gb.FillSolidRect(0, z(8), 100, z(4), overlay_frame);
	seek_frame.ReleaseGraphics(gb);
	seek_time = gdi.CreateImage(100, z(20));
	gb = seek_time.GetGraphics();
	gb.SetSmoothingMode(0);
	gb.FillSolidRect(0, z(8), 100, z(4), overlay_seek);
	seek_time.ReleaseGraphics(gb);
	vol_frame = gdi.CreateImage(100, z(18));
	gb = vol_frame.GetGraphics();
	gb.SetSmoothingMode(0);
	gb.FillSolidRect(0, z(7), 100, z(4), overlay_frame);
	vol_frame.ReleaseGraphics(gb);
	
	let imgh = Math.floor(18*zdpi);
	seeker = gdi.CreateImage(imgh, imgh);
	gb = seeker.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillEllipse(3*zdpi, 3*zdpi, _x12, _x12, overlay_seek);
	gb.FillEllipse(7*zdpi, 7*zdpi, 4*zdpi, 4*zdpi, c_seeker_core);
	gb.SetSmoothingMode(0);
	seeker.ReleaseGraphics(gb);
	
	seekbar = new UISlider(seek_frame, seek_time, seeker);
	VolumeBar = new UISlider(vol_frame, vol_active, vol_seeker, vol_div);
	
	let c_pb_ov = blendColors(RGB(255,255,255), c_seekoverlay, 0.85);
	let c_pb_down = blendColors(RGB(0,0,0), c_seekoverlay, 0.85);
	imgh = z(34);
	let imgh2 = imgh * 2;
	let point_arr = new Array(_x12, 9*zdpi, _x12, 23*zdpi,22*zdpi, 16*zdpi);
		
	let im_bg = gdi.CreateImage(imgh, imgh);
	gb = im_bg.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillEllipse(_x1, _x1, _x30, _x30, overlay_seek);
	gb.SetSmoothingMode(0);
	im_bg.ReleaseGraphics(gb);
		
	let im_bgov = gdi.CreateImage(imgh, imgh);
	gb = im_bgov.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillEllipse(_x1, _x1, _x30, _x30, c_pb_ov);
	gb.SetSmoothingMode(0);
	im_bgov.ReleaseGraphics(gb);
		
	let im_bgdown = gdi.CreateImage(imgh, imgh);
	gb = im_bgdown.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillEllipse(_x1, _x1, _x30, _x30, c_pb_down);
	gb.SetSmoothingMode(0);
	im_bgdown.ReleaseGraphics(gb);
		
	let im_playico = gdi.CreateImage(imgh, imgh);
	gb = im_playico.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillPolygon(RGB(255,255,255), 0, point_arr);
	gb.SetSmoothingMode(0);
	im_playico.ReleaseGraphics(gb);
		
	let im_pauseico = gdi.CreateImage(imgh, imgh);
	gb = im_pauseico.GetGraphics();
	gb.SetSmoothingMode(0);
	gb.DrawLine(_x12, 10*zdpi, _x12, Math.floor(22*zdpi)+1, Math.floor(3*zdpi), RGB(255,255,255));
	gb.DrawLine(22*zdpi-2, 10*zdpi, 22*zdpi-2, Math.floor(22*zdpi)+1,  Math.floor(3*zdpi), RGB(255,255,255));
	im_pauseico.ReleaseGraphics(gb);
		
	img_play = gdi.CreateImage(imgh, imgh * 3);
	gb = img_play.GetGraphics();
	gb.DrawImage(im_bg, 0, 0, imgh, imgh, 0, 0, imgh, imgh, 0, 255);
	gb.DrawImage(im_playico, 0, 0, imgh, imgh, 0, 0, imgh, imgh, 0, 255);
	gb.DrawImage(im_bgov, 0, imgh, imgh, imgh, 0, 0, imgh, imgh, 0, 255);
	gb.DrawImage(im_playico, 0, imgh, imgh, imgh, 0, 0, imgh, imgh, 0, 255);
	gb.DrawImage(im_bgdown, 0, imgh2, imgh, imgh, 0, 0, imgh, imgh, 0, 255);
	gb.DrawImage(im_playico, 0, imgh2, imgh, imgh, 0, 0, imgh, imgh, 0, 255);
	img_play.ReleaseGraphics(gb);
		
	img_pause = gdi.CreateImage(imgh, imgh * 3);
	gb = img_pause.GetGraphics();
	gb.DrawImage(im_bg, 0, 0, imgh, imgh, 0, 0, imgh, imgh, 0, 255);
	gb.DrawImage(im_pauseico, 0, 0, imgh, imgh, 0, 0, imgh, imgh, 0, 255);
	gb.DrawImage(im_bgov, 0, imgh, imgh, imgh, 0, 0, imgh, imgh, 0, 255);
	gb.DrawImage(im_pauseico, 0, imgh, imgh, imgh, 0, 0, imgh, imgh, 0, 255);
	gb.DrawImage(im_bgdown, 0, imgh2, imgh, imgh, 0, 0, imgh, imgh, 0, 255);
	gb.DrawImage(im_pauseico, 0, imgh2, imgh, imgh, 0, 0, imgh, imgh, 0, 255);
	img_pause.ReleaseGraphics(gb);
}

function init_obj() {
	vol_len = z(70);
	seek_h = z(20);
	win_y = wh - z(58);
	let btn_space = z(12) + 3;
	let imgh = img_stop.Width, imgh_b = img_play.Width;
	btn_y = win_y + z(23);
	var btn_y2 = Math.round(btn_y - z(3));
	var btn_y3 = Math.round(btn_y - z(1));
	var btn_x = Math.round((ww-imgh*4-imgh_b-btn_space*4)/2);
	PBOpen.SetXY(btn_x, btn_y3);
	PBPrevious.SetXY(btn_x+imgh+btn_space, btn_y3);
	PBPlay.SetXY(btn_x+imgh*2+btn_space*2, btn_y2);
	PBNext.SetXY(btn_x+imgh*2+imgh_b+btn_space*3, btn_y3);
	var btn_end_x = btn_x+imgh*3+imgh_b+btn_space*4;
	PBStop.SetXY(btn_end_x, btn_y3);
	seek_start = 3*btn_space+time_length;
	vol_start = ww - vol_len - seek_start;
	var volbtn_x = vol_start - img_vol.Width - z(9);
	seek_len = ww - seek_start*2;
	PlaybackTimeText.SetSize(btn_space*2, win_y, time_length, seek_h);
	PlaybackLengthText.SetSize(seek_len + seek_start + btn_space, win_y, time_length, seek_h);
	TimeTip = new UITooltip(seek_start + z(12), win_y, "", g_font, c_font, tip_bg);
	VolumeTip = new UITooltip(ww - seek_start + z(5) - 1, btn_y + z(2), "", g_font, c_font, false);
	MuteBtn.SetXY(volbtn_x, btn_y + z(1) - 1);
	pbo_start = volbtn_x - btn_img.Width - z(5);
	PBOBtn.SetXY(pbo_start - z(2), btn_y + z(1) - 1);
	LibBtn.SetXY(pbo_start - btn_img.Width - z(10) + 1, btn_y + z(1) - 1);
	g_switchbar.setSize(seek_start -z(5), btn_y, g_switchbar.w, g_switchbar.h);
}

function setSize(){
	seekbar.setSize(seek_start, win_y, seek_len, seek_h);
	seekbar.MaxValue = Math.max(0, fb.PlaybackLength);
	VolumeBar.setSize(vol_start, btn_y + Math.floor(4*zdpi)+1, vol_len, z(18));
	VolumeBar.Value = vol2pos(fb.Volume) | 0;
}

function get_images() {
	//creat static images
	var gb;
	let _x2 = 2*zdpi, _x3 = 3*zdpi, _x4 = 4*zdpi, _x5 = 5*zdpi, _x6 = 6*zdpi,  _x7 = 7*zdpi, _x8 = 8*zdpi, _x9 = 9*zdpi, _x10 = 10*zdpi, _x11 = 11*zdpi,
		_x12 = 12*zdpi, _x13 = 13*zdpi, _x14 = 14*zdpi, _x15 = 15*zdpi, _x16 = 16*zdpi, _x17 = 17*zdpi, _x18 = 18*zdpi, _x20 = 20*zdpi;

	let imgh = z(30), imgh2 = imgh * 2, hotdia = 28*zdpi;
	img_stop = gdi.CreateImage(imgh, imgh * 3);
	gb = img_stop.GetGraphics();
	time_length = gb.CalcTextWidth("00:00:00", g_font);
	gb.SetSmoothingMode(0);
	gb.DrawRect(_x7, _x7, Math.floor(_x14)+1, Math.floor(_x14)+1, 2, c_normal);
	gb.SetSmoothingMode(2);
	gb.FillEllipse(0, imgh, hotdia, hotdia, c_shadow_h);
	gb.FillEllipse(0, imgh2, hotdia, hotdia, c_shadow);
	gb.SetSmoothingMode(0);
	img_stop.ReleaseGraphics(gb);

	var point_arr = new Array(_x8, _x6, _x20, _x14, _x8, 22*zdpi);
	var _x221 = Math.floor(22*zdpi) + 1;
	img_next = gdi.CreateImage(imgh, imgh * 3);
	gb = img_next.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawPolygon(c_normal,2,point_arr);
	gb.SetSmoothingMode(0);
	gb.DrawLine(_x221, _x7, _x221, 21*zdpi, 2, c_normal);
	gb.SetSmoothingMode(2);
	gb.FillEllipse(0, imgh, hotdia, hotdia, c_shadow_h);
	gb.FillEllipse(0, imgh2, hotdia, hotdia, c_shadow);
	gb.SetSmoothingMode(0);
	img_next.ReleaseGraphics(gb);
	
	point_arr = new Array(14*zdpi, _x6, 22*zdpi, _x17, _x6, _x17);
	img_open = gdi.CreateImage(imgh, imgh * 3);
	gb = img_open.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawPolygon(c_normal,2,point_arr);
	gb.SetSmoothingMode(0);
	gb.DrawLine(_x6, _x221, _x221, _x221, 2, c_normal);
	gb.SetSmoothingMode(2);
	gb.FillEllipse(0, imgh, hotdia, hotdia, c_shadow_h);
	gb.FillEllipse(0, imgh2, hotdia, hotdia, c_shadow);
	gb.SetSmoothingMode(0);
	img_open.ReleaseGraphics(gb);

	point_arr = new Array(21*zdpi, _x6, _x9, _x14, 21*zdpi, 22*zdpi);
	img_previous = gdi.CreateImage(imgh, imgh * 3);
	gb = img_previous.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawPolygon(c_normal,2,point_arr);
	gb.SetSmoothingMode(0);
	gb.DrawLine(_x7, _x7, _x7, 21*zdpi, 2, c_normal);
	gb.SetSmoothingMode(2);
	gb.FillEllipse(0, imgh, hotdia, hotdia, c_shadow_h);
	gb.FillEllipse(0, imgh2, hotdia, hotdia, c_shadow);
	gb.SetSmoothingMode(0);
	img_previous.ReleaseGraphics(gb);
	
	let imgw = z(20);
	imgh = z(20);

	img_vol = gdi.CreateImage(imgw, imgh);
	gb = img_vol.GetGraphics();
	gb.SetSmoothingMode(0);
	gb.DrawLine(zdpi, z(8)+1, _x4+1, z(8)+1, 2, c_normal);
	gb.DrawLine(_x10, z(5)+1, _x10, z(18), 2, c_normal);
	gb.DrawLine(zdpi, z(8), zdpi, z(15)+1, 2, c_normal);
	gb.DrawLine(zdpi, z(15), _x4+1, z(15), 2, c_normal);
	gb.DrawLine(Math.floor(_x14), _x9+1, Math.floor(_x14), _x13+1, 2, c_normal);
	gb.DrawLine(Math.floor(_x17+1), _x7+1, Math.floor(_x17+1), _x15+1, 2, c_normal);
	gb.SetSmoothingMode(2);
	gb.DrawLine(_x4, z(8)+1, _x10, z(5)+1, 2, c_normal);
	gb.DrawLine(_x4, z(15)-1, _x10, z(18)-1, 2, c_normal);
	gb.SetSmoothingMode(0);
	img_vol.ReleaseGraphics(gb);

	img_pbo[0] = gdi.CreateImage(imgw, imgh);
	gb = img_pbo[0].GetGraphics();
	gb.DrawLine(_x2, _x7, _x16, _x7, 2, c_normal);
	gb.DrawLine(_x2, _x15, _x16, _x15, 2, c_normal);
	gb.SetSmoothingMode(2);
	var point_arr = new Array(_x14, _x4-0.5, _x14, _x10, _x20, 6.5*zdpi);
	gb.FillPolygon(c_normal, 0, point_arr);
	var point_arr_2 = new Array(_x14, _x12-0.5, _x14, _x18, _x20, 14.5*zdpi);
	gb.FillPolygon(c_normal, 0, point_arr_2);
	gb.SetSmoothingMode(0);
	img_pbo[0].ReleaseGraphics(gb);
	
	img_pbo[3] = gdi.CreateImage(imgw, imgh);
	gb = img_pbo[3].GetGraphics();
	gb.DrawLine(_x2, _x7, 7.5*zdpi, _x7, 2, c_normal);
	gb.DrawLine(_x2, _x15, 7.5*zdpi, _x15, 2, c_normal);
	gb.DrawLine(_x12, _x15, _x16, _x15, 2, c_normal);
	gb.DrawLine(_x12, _x7, _x16, _x7, 2, c_normal);
	gb.SetSmoothingMode(2);
	gb.DrawLine(_x7, _x7, _x12, _x15, 2, c_normal);
	gb.DrawLine(_x12, _x7, _x7, _x15, 2, c_normal);
	gb.FillPolygon(c_normal, 0, point_arr);
	gb.FillPolygon(c_normal, 0, point_arr_2);
	gb.SetSmoothingMode(0);
	img_pbo[3].ReleaseGraphics(gb);
	
	img_pbo[4] = gdi.CreateImage(imgw, imgh);
	gb = img_pbo[4].GetGraphics();
	gb.SetSmoothingMode(0);
	gb.DrawLine(_x2, _x7, 7.5*zdpi, _x7, 2, c_normal);
	gb.DrawLine(_x12, _x15, _x15, _x15, 2, c_normal);
	gb.DrawLine(_x12, _x7, _x18, _x7, 2, c_normal);
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(_x2, _x12-1, _x5, _x5, 2, c_normal);
	gb.DrawLine(_x7, _x7, _x12, _x15, 2, c_normal);
	gb.DrawLine(_x12, _x7, _x7, _x15, 2, c_normal);
	gb.FillPolygon(c_normal, 0, point_arr_2);
	gb.SetSmoothingMode(0);
	img_pbo[4].ReleaseGraphics(gb);
	
	img_pbo[1] = gdi.CreateImage(imgw, imgh);
	gb = img_pbo[1].GetGraphics();
	gb.DrawLine(_x2, _x7, _x16, _x7, 2, c_normal);
	gb.DrawLine(_x2+1, _x6+1, _x2+1, _x12, 2, c_normal);
	gb.DrawLine(_x7, _x15, _x20, _x15, 2, c_normal);
	gb.DrawLine(Math.floor(_x20-1), _x10, Math.floor(_x20-1), _x15-1, 2, c_normal);
	gb.SetSmoothingMode(2);
	gb.FillPolygon(c_normal, 0, point_arr);
	point_arr_2 = new Array(_x7, _x12-0.5, _x7, _x18, zdpi, 14.5*zdpi);
	gb.FillPolygon(c_normal, 0, point_arr_2);
	gb.SetSmoothingMode(0);
	img_pbo[1].ReleaseGraphics(gb);
	
	img_pbo[2] = gdi.CreateImage(imgw, imgh);
	gb = img_pbo[2].GetGraphics();
	gb.DrawLine(_x2, _x7, _x16, _x7, 2, c_normal);
	gb.DrawLine(_x2+1, _x6+1, _x2+1, _x12, 2, c_normal);
	gb.DrawLine(_x7, _x15, _x20, _x15, 2, c_normal);
	gb.DrawLine(Math.floor(_x20-1), _x10, Math.floor(_x20-1), _x15-1, 2, c_normal);
	gb.SetSmoothingMode(2);
	gb.FillPolygon(c_normal, 0, point_arr);
	gb.FillPolygon(c_normal, 0, point_arr_2);
	gb.SetSmoothingMode(0);
	gb.SetTextRenderingHint(4);
	gb.DrawString("1", GdiFont("Segoe UI Black", Math.floor(_x7), 1), c_normal, _x5, Math.floor(_x5), _x12, _x12, cc_stringformat);
	gb.SetTextRenderingHint(0);
	img_pbo[2].ReleaseGraphics(gb);

	img_pbo[5] = gdi.CreateImage(imgw, imgh);
	gb = img_pbo[5].GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(_x2, _x6, _x12, _x12, 2, c_normal);
	gb.DrawEllipse(_x6, _x10, _x4, _x4, 2, c_normal);
	gb.DrawLine(_x15, _x4, _x10, _x14, 2, c_normal);
	gb.DrawLine(_x15-1, _x4, 19*zdpi, _x10, 2, c_normal);
	gb.SetSmoothingMode(0);
	gb = img_pbo[5].ReleaseGraphics(gb);

	img_pbo[6] = gdi.CreateImage(imgw, imgh);
	gb = img_pbo[6].GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawRoundRect(_x2, _x6, _x12, _x12, Math.round(rec_r/2), Math.round(rec_r/2), 2, c_normal);
	gb.DrawEllipse(_x6, _x10, _x4, _x4, 2, c_normal);
	gb.DrawLine(_x15, _x4, _x10, _x14, 2, c_normal);
	gb.DrawLine(_x15-1, _x4, 19*zdpi, _x10, 2, c_normal);
	gb.SetSmoothingMode(0);
	img_pbo[6].ReleaseGraphics(gb);

	tip_bg = gdi.CreateImage(50, 22);
	gb = tip_bg.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillRoundRect(1, 1, 48, 20, 5, 5, c_tip_bg);
	gb.SetSmoothingMode(0);
	tip_bg.ReleaseGraphics(gb);
	
	vol_div = gdi.CreateImage(1, 4);
	gb = vol_div.GetGraphics();
	gb.SetSmoothingMode(0);
	gb.FillSolidRect(0, 0, 1, 4, c_background);
	vol_div.ReleaseGraphics(gb);

	vol_active = gdi.CreateImage(100, z(18));
	gb = vol_active.GetGraphics();
	gb.FillSolidRect(0, z(7), 100, z(4), c_normal);
	vol_active.ReleaseGraphics(gb);
	vol_seeker = gdi.CreateImage(_x12, _x12);
	gb = vol_seeker.GetGraphics();
	vol_seeker.ReleaseGraphics(gb);

	btn_img = gdi.CreateImage(z(28), z(78));
	gb = btn_img.GetGraphics();
	gb.SetSmoothingMode(4);
	gb.FillRoundRect(0, z(26)+1, 26*zdpi, 24*zdpi, rec_r, rec_r, c_shadow_h);
	gb.FillRoundRect(0, z(52)+1, 26*zdpi, 24*zdpi, rec_r, rec_r, c_shadow);
	gb.SetSmoothingMode(0);
	btn_img.ReleaseGraphics(gb);
	
	let floor_x6 = Math.floor(_x6);
	let floor_x62 = zdpi+floor_x6*2;
	point_arr = new Array(zdpi, _x2, zdpi, floor_x6*2-1,  _x7, (floor_x6*2+_x2-1)/2);
	img_list = gdi.CreateImage(imgw, imgh);
	gb = img_list.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawPolygon(c_normal,2,point_arr);
	gb.SetSmoothingMode(0);
	gb.DrawLine(_x6, zdpi, Math.floor(19*zdpi),  zdpi, 2, c_normal);
	gb.DrawLine(9.5*zdpi, zdpi+floor_x6, Math.floor(19*zdpi),  zdpi+floor_x6, 2, c_normal);
	gb.DrawLine(_x6, floor_x62, Math.floor(19*zdpi),  floor_x62, 2, c_normal);
	img_list.ReleaseGraphics(gb);
	
	point_arr = new Array(zdpi,zdpi, _x14, zdpi, zdpi, _x13, _x14, 3*zdpi);
	img_cover = gdi.CreateImage(imgw, imgh);
	gb = img_cover.GetGraphics();
	gb.SetSmoothingMode(0);
	gb.DrawLine(zdpi, zdpi,_x13+1, zdpi, 2, c_normal);
	gb.DrawLine(zdpi, zdpi-1,zdpi, floor_x62+1, 2, c_normal);
	gb.DrawLine(_x4, zdpi, _x4, floor_x62+1, 2, c_normal);
	gb.DrawLine(zdpi, floor_x62, _x13, floor_x62, 2, c_normal);
	gb.DrawLine(_x13, zdpi, _x13, floor_x62 - _x8 - 0.5, 2, c_normal);
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(_x9, floor_x62 - _x8 - 0.5, _x8, _x8, 2, c_normal);
	gb.FillEllipse(_x11, floor_x62 - _x6 - 0.5, _x4, _x4, c_normal);
	gb.SetSmoothingMode(0);
	img_cover.ReleaseGraphics(gb);

	img_bio = gdi.CreateImage(imgw, imgh);
	gb = img_bio.GetGraphics();
	gb.SetSmoothingMode(0);
	gb.DrawRect(Math.floor(_x4), zdpi+1, z(14), floor_x62-1, 2, c_normal);
	gb.DrawLine(zdpi, _x5, Math.floor(_x6), _x5, 2, c_normal);
	gb.DrawLine(zdpi, floor_x62-_x3, Math.floor(_x6), floor_x62-_x3, 2, c_normal);
	gb.SetTextRenderingHint(4);
	gb.DrawString("B", GdiFont("Tahoma", Math.floor(_x11), 1), c_normal, _x2, zdpi, _x18, _x13, cc_stringformat);
	gb.SetTextRenderingHint(0);
	img_bio.ReleaseGraphics(gb);

	img_vis = gdi.CreateImage(imgw, imgh);
	gb = img_vis.GetGraphics();
	gb.DrawLine(zdpi+1, _x13+1, zdpi+1, _x5, 2, c_normal);
	gb.DrawLine(_x6+1, _x13+1, _x6+1, zdpi, 2, c_normal);
	gb.DrawLine(_x11+1, _x13+1, _x11+1, _x7, 2, c_normal);
	gb.DrawLine(_x16+1, _x13+1, _x16+1, _x4, 2, c_normal);
	img_vis.ReleaseGraphics(gb);

	img_video = gdi.CreateImage(imgw, imgh);
	gb = img_video.GetGraphics();
	gb.SetSmoothingMode(0);
	gb.DrawRect(zdpi+1, _x7+1, _x9, Math.floor(_x6), 2, c_normal);
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(zdpi, zdpi, _x5, _x5, 2,c_normal);
	gb.DrawEllipse(_x7, zdpi, _x5, _x5, 2,c_normal);
	let pointArr = Array(Math.floor(_x17), _x5+1, Math.floor(_x17), floor_x62, _x12-1, (_x5+floor_x62 + 1)/2);
	gb.DrawPolygon(c_normal, 2, pointArr);
	gb.SetSmoothingMode(0);
	img_video.ReleaseGraphics(gb);
	
	img_lib = gdi.CreateImage(imgw, imgh);
	gb = img_lib.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.FillEllipse(0, zdpi, _x4, _x4, c_normal);
	gb.FillEllipse(0, _x10, _x4, _x4, c_normal);
	gb.FillEllipse(6.5*zdpi, zdpi, _x4, _x4, c_normal);
	gb.FillEllipse(6.5*zdpi, _x10, _x4, _x4, c_normal);
	gb.FillEllipse(_x13, zdpi, _x4, _x4, c_normal);
	gb.FillEllipse(_x13, _x10, _x4, _x4, c_normal);
	gb.SetSmoothingMode(0);
	gb.DrawLine(_x2, _x2, _x2, _x11, 1, c_normal);
	gb.DrawLine(8.75*zdpi, _x3, 8.75*zdpi, _x11, 1, c_normal);
	gb.DrawLine(15.5*zdpi, _x2, 15.5*zdpi, _x10, 1, c_normal);
	gb.DrawLine(_x2, _x3, _x7, _x3, 1, c_normal);
	gb.DrawLine(_x11, _x12, 15*zdpi, _x12, 1, c_normal);
	gb.SetSmoothingMode(0);
	img_lib.ReleaseGraphics(gb);
}

//=============start=====================
detect_panel();
if(bio_panel) BIO.ShowCaption = false; 
if(video_panel) VIDEO.ShowCaption = false;
get_font();
get_color();
get_images();
get_panel();
init_overlay_obj(c_seek_bg, c_seekoverlay);
initbuttons();

function on_size() {
	ww = window.Width;
	wh = window.Height;
	init_obj();
	setSize();
	set_panel();
}

if(!ww) on_size(); //panel locked, has to manually get size, 快速设置布局的bug

function on_paint(gr) {
	gr.FillSolidRect(0, 0, ww, wh, c_background);
	PBPrevious.Paint(gr);
	PBPlay.Paint(gr);
	PBNext.Paint(gr);
	if(show_extrabtn){
		PBOpen.Paint(gr);
		PBStop.Paint(gr);
	}
	PlaybackTimeText.Paint(gr);
	PlaybackLengthText.Paint(gr);
	seekbar.Paint(gr);
	TimeTip.Paint(gr);
	if(ww > (11.5 - (bio_panel+video_panel)/2)*vol_len){
		VolumeBar.Paint(gr);
		VolumeTip.Paint(gr);
		LibBtn.Paint(gr);
		MuteBtn.Paint(gr);
		PBOBtn.Paint(gr);
		gr.DrawImage(img_vol, vol_start - img_vol.Width - z(5), Math.round(btn_y + Math.floor(2*zdpi)), img_vol.Width, img_vol.Width, 0, 0, img_vol.Width, img_vol.Width, 0);
		gr.DrawImage(img_pbo[plman.PlaybackOrder], pbo_start, btn_y + Math.floor(2*zdpi)+1, img_pbo[0].Width, img_pbo[0].Width, 0, 0, img_pbo[0].Width, img_pbo[0].Width, 0);
		gr.DrawImage(img_lib, vol_start - img_vol.Width*4 - z(15), Math.round(btn_y + Math.floor(6*zdpi)), img_lib.Width, img_lib.Width, 0, 0, img_lib.Width, img_lib.Width, 0);
		g_switchbar.draw(gr);
	}
}

function on_mouse_move(x, y) {
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
	}
	if(y < win_y) return;
	var _x = 0;
	if(show_extrabtn){
		if (PBOpen.MouseMove(x, y)) hbtn = true;
		if (PBStop.MouseMove(x, y)) hbtn = true;
	}
	if (PBPrevious.MouseMove(x, y)) hbtn = true;
	if (PBPlay.MouseMove(x, y)) hbtn = true;
	if (PBNext.MouseMove(x, y)) hbtn = true;
	if (LibBtn.MouseMove(x, y)){
		hbtn = true;
		LibBtn.Tooltip.Text = lib_tooltip;
	}
	if (MuteBtn.MouseMove(x, y)) hbtn = true;
	if (PBOBtn.MouseMove(x, y)) {
		hbtn = true;
		on_playback_order_changed();
	}
	g_switchbar.on_mouse("move", x, y);
}

function on_mouse_lbtn_down(x, y) {
	if(y < win_y) return;
	var _x = 0;
	if(show_extrabtn){
		PBOpen.MouseDown(x, y);
		PBStop.MouseDown(x, y);
	}
	PBPrevious.MouseDown(x, y);
	PBPlay.MouseDown(x, y);
	PBNext.MouseDown(x, y);
	LibBtn.MouseDown(x, y);
	MuteBtn.MouseDown(x, y);
	g_switchbar.on_mouse("lbtn_down", x, y);
	if (PBOBtn.MouseDown(x, y)) {
		hbtn = false;
		PBO_Menu(pbo_start - z(2), PBOBtn.y);
		PBOBtn.Reset();
	}
	if (seekbar.MouseDown(x, y)) {
		if (x < seek_start) _x = seek_start;
		else if (x > seek_start + seek_len) _x = seek_start + seek_len;
		else _x = x;
		TimeTip.X = (x > seek_start + seek_len - TimeTip.Width - 6) ? _x - TimeTip.Width - 6 : _x + 6;
		TimeTip.Activate();
	}
	if (VolumeBar.MouseDown(x, y)) {
		fb.Volume = pos2vol(VolumeBar.Value);
		VolumeTip.Text = (fb.Volume | 0).toString() + " dB";
		VolumeTip.Activate();
	}
}

function on_mouse_lbtn_up(x, y) {
	if (seekbar.MouseUp()) {
		PlaybackTimeText.ChangeText(TimeFmt(seekbar.Value));
		fb.PlaybackTime = seekbar.Value;
		TimeTip.Repaint();
		TimeTip.Deactivate();
	}
	if (VolumeBar.MouseUp()) {
		VolumeTip.Deactivate();
	}
	if(y < win_y) return;
	if(show_extrabtn){
		if (PBOpen.MouseUp()) fb.RunMainMenuCommand("打开...");
		if (PBStop.MouseUp()) fb.Stop();
	}
	if (PBPrevious.MouseUp()) fb.Prev();
	if (PBPlay.MouseUp()) fb.PlayOrPause();
	if (PBNext.MouseUp()) fb.Next();
	if (MuteBtn.MouseUp()) fb.VolumeMute();
	if (LibBtn.MouseUp()) {
		if(lib_albumlist) fb.RunMainMenuCommand("媒体库/专辑列表");
		else fb.RunMainMenuCommand("媒体库/分面");
	}
	g_switchbar.on_mouse("lbtn_up", x, y);
	PBOBtn.MouseUp();
}

function on_mouse_leave() {
	seekbar.MouseLeave();
	VolumeBar.MouseLeave();
	g_switchbar.on_mouse("leave");
	if (!hbtn) return;
	else {
		if(show_extrabtn){
			PBOpen.Reset();
			PBStop.Reset();
		}
		PBPrevious.Reset();
		PBPlay.Reset();
		PBNext.Reset();
		LibBtn.Reset();
		MuteBtn.Reset();
		PBOBtn.Reset();
	}
}

function on_mouse_wheel(step) {
	if (seekbar.MouseWheel(step, 2)) {
		PlaybackTimeText.ChangeText(TimeFmt(seekbar.Value));
		fb.PlaybackTime = seekbar.Value;
	}
	if (VolumeBar.MouseWheel(step, 2)) {
		fb.Volume = pos2vol(VolumeBar.Value)
	}
}

function on_playback_pause(state) {
	PBPlay.img = state ? img_play : img_pause;
	PBPlay.Repaint();
}

function on_playback_new_track(info) {
	PBPlay.img = (fb.IsPlaying && !fb.IsPaused) ? img_pause : img_play;
	PBPlay.Repaint();
	seekbar.MaxValue = Math.max(0, fb.PlaybackLength);
	seekbar.ChangeValue(0);
	if(info){
		track_len = fb.TitleFormat("%length%").EvalWithMetadb(info);//fb.GetNowPlaying());
		track_len = Format_hms(track_len);
		if(track_len) PlaybackLengthText.ChangeText(track_len);
	}
}

function on_playback_stop(reason) {
	if (PBPlay.img != img_play) {
		PBPlay.img = img_play;
		PBPlay.Repaint();
	}
	if (reason != 2) {
		PlaybackTimeText.ChangeText("00:00:00");
		seekbar.MaxValue = 0;
		seekbar.ChangeValue(0);
	}
}

function on_playback_time(time) {
	PlaybackTimeText.ChangeText(TimeFmt(time));
	if (seekbar.State != 2) seekbar.ChangeValue(time);
}

function on_volume_change(v) {
	VolumeBar.ChangeValue(vol2pos(v) | 0);
}

function on_playback_order_changed() {
	PBOBtn.Tooltip.Text = PBOTips[plman.PlaybackOrder];
	PBOBtn.Repaint();
}

function on_font_changed() {
	get_font();
	get_images();
	init_overlay_obj(c_seek_bg, c_seekoverlay);
	initbuttons();
	init_obj();
	setSize();
	set_panel();
	window.Repaint();
};

function on_colours_changed() {
	get_color();
	get_images();
	init_overlay_obj(c_seek_bg, c_seekoverlay);
	initbuttons();
	init_obj();
	setSize();
	window.Repaint();
};

function on_mouse_rbtn_up() {
	return true;
}

function on_notify_data(name, info) {
	switch (name) {
	case "color_scheme_updated":
		var c_ol_tmp = c_seekoverlay;
		if(info) c_seekoverlay = RGB(info[0], info[1], info[2]);
		else c_seekoverlay = c_default_hl;
		if(c_seekoverlay != c_ol_tmp){
			init_overlay_obj(c_seek_bg, c_seekoverlay);
			PBPlay.img = (fb.IsPlaying && !fb.IsPaused) ? img_pause : img_play;
			setSize();
			window.Repaint();
		}
		break;
	case "Show_open_stop_buttons":
		show_extrabtn = info;
		window.SetProperty("foobox.show.Open.Stop.buttons", show_extrabtn);
		window.Repaint();
		break;
	case "Lib_button_function":
		if(Number(fb.Version.substr(0, 1)) > 1){
			lib_albumlist = info;
			window.SetProperty("Library.button: Show.Albumlist", lib_albumlist);
			lib_tooltip = lib_albumlist ? "专辑列表" : "分面";
			window.Repaint();
		}
		break;
	}
}

function on_key_down(vkey) {
	var mask = GetKeyboardMask();
	switch (mask) {
	case KMask.ctrl:
		switch (vkey) {
		case 80:// CTRL+P
			fb.RunMainMenuCommand("文件/参数选项");
			break;
		case 70:// CTRL+F
			fb.RunMainMenuCommand("编辑/搜索");
			break;
		case 78:// CTRL+N
			fb.RunMainMenuCommand("文件/新建播放列表");
			break;
		case 83:// CTRL+S
			fb.RunMainMenuCommand("文件/保存播放列表...");
			break;
		case 87:// CTRL+W
			fb.RunMainMenuCommand("文件/移除播放列表");
			break;
		case 79:// CTRL+O
			fb.RunMainMenuCommand("文件/打开...");
			break;
		case 85:// CTRL+U
			fb.RunMainMenuCommand("文件/添加位置...");
			break;
		case 65:// CTRL+A
			fb.RunMainMenuCommand("编辑/全选");
			break;
		}
		break;
	case KMask.alt:
		switch (vkey) {
		case 65:// ALT+A
			fb.RunMainMenuCommand("视图/总在最上面");
			break;
		case 115://Alt+F4
			fb.RunMainMenuCommand("文件/退出");
			break;
		case 13://Alt+Enter
			fb.RunMainMenuCommand("属性");
			break;
		};
		break;
	}
}