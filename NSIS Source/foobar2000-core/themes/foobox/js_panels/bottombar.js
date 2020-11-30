//foobox http://blog.sina.com.cn/dream7180
var time_length = 0;
var fbx_set = [];
window.NotifyOthers("get_fbx_set", fbx_set);
var ui_mode = fbx_set[11],
	zdpi = fbx_set[9],
	img_play, img_pause, img_next, img_previous, img_vol, img_pbo = [],
	align_center = 1;

var fontcolor = RGB(235, 235, 235);

//play back order
var MF_STRING = 0x00000000;
var MF_DISABLED = 0x00000002;
var PBOTips = new Array("默认", "重复(列表)", "重复(音轨)", "随机", "乱序(音轨)", "乱序(专辑)", "乱序(目录)");
var hbtn = false;
var ww = 0,
	wh = 0;
var seek_len, seek_start,
	vol_start, vol_len = 150,
	pbo_start;
var PBPrevious, PBPlay, PBNext, PBStop;
var track_len = false, PlaybackTimeText, PlaybackLengthText;
var track_time = fb.IsPlaying ? TimeFmt(fb.PlaybackTime) : "00:00:00";
var VolumeBar, seekbar, TimeTip, VolumeTip, MuteBtn, PBOBtn; // vol_flag = (fb.Volume == -100)? 1 : 0;
//
get_font();
get_images();
initbuttons();
init_overlay_imgs(fbx_set[7], fbx_set[5]);
init_overlay_obj();

function on_size() {
	ww = window.Width;
	wh = window.Height;
	init_obj();
	setSize();
}

function on_paint(gr) {
	var bg_color = ui_mode == 2 ? fbx_set[1] : fbx_set[0];
	gr.FillSolidRect(0, 0, ww, wh, bg_color);
	PBPrevious.Paint(gr);
	PBPlay.Paint(gr);
	PBNext.Paint(gr);
	PBStop.Paint(gr);
	PlaybackTimeText.Paint(gr);
	PlaybackLengthText.Paint(gr);
	seekbar.Paint(gr);
	TimeTip.Paint(gr);
	VolumeBar.Paint(gr);
	VolumeTip.Paint(gr);
	MuteBtn.Paint(gr);
	PBOBtn.Paint(gr);
	gr.DrawImage(img_pbo[fb.PlaybackOrder], pbo_start + 1, Math.max(0, wh / 2 - pbo_btn_img.Width/2 + 2*zdpi), pbo_btn_img.Width, pbo_btn_img.Width, 0, 0, pbo_btn_img.Width, pbo_btn_img.Width, 0);
}

function on_mouse_move(x, y) {
	var _x = 0;
	if (PBPrevious.MouseMove(x, y)) hbtn = true;
	if (PBPlay.MouseMove(x, y)) hbtn = true;
	if (PBNext.MouseMove(x, y)) hbtn = true;
	if (PBStop.MouseMove(x, y)) hbtn = true;
	if (MuteBtn.MouseMove(x, y)) hbtn = true;
	if (PBOBtn.MouseMove(x, y)) hbtn = true;
	if (fb.IsPlaying && seekbar.MouseMove(x, y)) {
		TimeTip.Text = TimeFmt(seekbar.Value);
		if (x < seek_start) _x = seek_start;
		else if (x > seek_start + seek_len) _x = seek_start + seek_len;
		else _x = x;
		TimeTip.X = (x > seek_start + seek_len - TimeTip.Width - 12) ? _x - TimeTip.Width - 12 : _x + 6;
		window.RepaintRect(seek_start, TimeTip.Y, seek_start + seek_len, TimeTip.Height);
	}
	if (VolumeBar.MouseMove(x, y)) {
		fb.Volume = pos2vol(VolumeBar.Value);
		VolumeTip.Text = (fb.Volume | 0).toString() + " dB";
		if (x < vol_start) _x = vol_start;
		else if (x > vol_start + vol_len) _x = vol_start + vol_len;
		else _x = x;
		VolumeTip.X = (x > vol_start + vol_len - VolumeTip.Width - 10) ? _x - VolumeTip.Width - 10 : _x + 6;
		window.RepaintRect(vol_start, VolumeTip.Y, vol_len, VolumeTip.Height);
	}
}

function on_mouse_lbtn_down(x, y) {
	var _x = 0;
	PBPrevious.MouseDown(x, y);
	PBPlay.MouseDown(x, y);
	PBNext.MouseDown(x, y);
	PBStop.MouseDown(x, y);
	MuteBtn.MouseDown(x, y);
	if (PBOBtn.MouseDown(x, y)) {
		hbtn = false;
		PBO_Menu(pbo_start + pbo_btn_img.Width - 144, PBOBtn.y);
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
		if (x < vol_start) _x = vol_start;
		else if (x > vol_start + vol_len) _x = vol_start + vol_len;
		else _x = x;
		VolumeTip.X = (x > vol_start + vol_len - VolumeTip.Width - 6) ? _x - VolumeTip.Width - 6 : _x + 6;
		VolumeTip.Activate();
	}
}

function on_mouse_lbtn_up(x, y) {
	if (PBPrevious.MouseUp()) fb.Prev();
	if (PBPlay.MouseUp()) fb.PlayOrPause();
	if (PBNext.MouseUp()) fb.Next();
	if (PBStop.MouseUp()) fb.Stop();
	if (MuteBtn.MouseUp()) fb.VolumeMute();
	PBOBtn.MouseUp();
	if (seekbar.MouseUp()) {
		PlaybackTimeText.ChangeText(TimeFmt(seekbar.Value));
		fb.PlaybackTime = seekbar.Value;
		window.RepaintRect(seek_start, TimeTip.Y, seek_start + seek_len, TimeTip.Height);
		TimeTip.Deactivate();
	}
	if (VolumeBar.MouseUp()) {
		VolumeTip.Deactivate();
	}
}

function on_mouse_leave() {
	if (!hbtn) return;
	else {
		PBPrevious.Reset();
		PBPlay.Reset();
		PBNext.Reset();
		PBStop.Reset();
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
	window.RepaintRect(PBPlay.x, PBPlay.y, PBPlay.width, PBPlay.height);
}

function on_playback_new_track(info) {
	PBPlay.img = (fb.IsPlaying && !fb.IsPaused) ? img_pause : img_play;
	window.RepaintRect(PBPlay.x, PBPlay.y, PBPlay.width, PBPlay.height);
	//PlaybackLengthText.ChangeText(TimeFmt(fb.PlaybackLength));
	seekbar.MaxValue = Math.max(0, fb.PlaybackLength);
	seekbar.ChangeValue(0);
}

function on_playback_stop(reason) {
	if (PBPlay.img != img_play) {
		PBPlay.img = img_play;
		window.RepaintRect(PBPlay.x, PBPlay.y, PBPlay.width, PBPlay.height);
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
	//repaint_mutebtn();
}

function on_playback_order_changed() {
	PBOBtn.Tooltip.Text = PBOTips[fb.PlaybackOrder];
	window.RepaintRect(pbo_start, 0, pbo_btn_img.Width, wh);
}

function on_notify_data(name, info) {
	switch (name) {
	case "set_font":
		fbx_set[13] = info[0];
		fbx_set[14] = info[1];
		fbx_set[15] = info[2];
		window.Reload();
		//get_font();
		//init_obj();
		//PlaybackTimeText.Repaint();
		//PlaybackLengthText.Repaint();
		break;
	case "g_track_len":
		track_len = Format_hms(info);
		PlaybackLengthText.ChangeText(track_len);
		break;
	case "set_ui_mode":
		ui_mode = info;
		window.Repaint();
		break;
	case "set_random_color":
		fbx_set[0] = info[0];
		fbx_set[1] = info[1];
		fbx_set[2] = info[2];
		fbx_set[3] = info[3];
		fbx_set[4] = info[4];
		fbx_set[5] = info[5];
		fbx_set[6] = info[6];
		fbx_set[7] = info[7];
		init_overlay_imgs(fbx_set[7], fbx_set[5]);
		init_overlay_obj();
		setSize();
		window.Repaint();
		break;
	}
}

//var rbtnDown;

//function on_mouse_rbtn_down(x, y, vkey) {
//	rbtnDown = vkey == 6 ? true : false;
//}

function on_mouse_rbtn_up() {
	//if (rbtnDown) {
	//	rbtnDown = false;
	//	return vkey == 4 ? false : true;
	//} else 
	return true;
}

function StrFmt(alignH, alignV, trim, flag) {
	return ((alignH << 28) | (alignV << 24) | (trim << 20) | flag);
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
	g_fname = fbx_set[13];
	g_fsize = fbx_set[14];
	g_fstyle = fbx_set[15];
	g_font = GdiFont(g_fname, g_fsize, g_fstyle);
}

PBO_Menu = function(x, y) {
	var PBOmenu = window.CreatePopupMenu();
	var menu_item_count = 0;
	for (var i = 0; i < PBOTips.length; i++)
	PBOmenu.AppendMenuItem(MF_STRING, ++menu_item_count, PBOTips[i]);
	PBOmenu.CheckMenuRadioItem(1, menu_item_count, fb.PlayBackOrder + 1);
	var ret = 0;
	ret = PBOmenu.TrackPopupMenu(x, y, 0x0020);
	if (ret) {
		switch (ret) {
		default:
			fb.PlaybackOrder = ret - 1;
			PBOmenu.CheckMenuRadioItem(1, menu_item_count, ret);
			break;
		}
	}
	PBOmenu.Dispose();
}

function initbuttons(){
	PBPrevious = new ButtonUI(img_previous, "");
	PBPlay = new ButtonUI((fb.IsPlaying && !fb.IsPaused) ? img_pause : img_play, "");
	PBNext = new ButtonUI(img_next, "");
	PBStop = new ButtonUI(img_stop, "");
	MuteBtn = new ButtonUI(img_vol, ""); //vol_flag*20);
	PBOBtn = new ButtonUI(pbo_btn_img, PBOTips[fb.PlaybackOrder]);
}

function init_overlay_imgs(overlay_frame, overlay_seek){
	var gb;
	seek_frame = gdi.CreateImage(100, 22);
	gb = seek_frame.GetGraphics();
	gb.FillSolidRect(0, 8, 100, 5, RGB(90, 90, 90));
	gb.FillSolidRect(0, 8, 100, 5, overlay_frame);
	seek_frame.ReleaseGraphics(gb);
	seek_time = gdi.CreateImage(100, 22);
	gb = seek_time.GetGraphics();
	gb.FillSolidRect(0, 8, 100, 5, RGB(41, 138, 190));
	gb.FillSolidRect(0, 8, 100, 5, overlay_seek);
	seek_time.ReleaseGraphics(gb);
	vol_frame = gdi.CreateImage(100, 18);
	gb = vol_frame.GetGraphics();
	gb.FillSolidRect(0, 7, 100, 3, RGB(80, 80, 80));
	gb.FillSolidRect(0, 7, 100, 3, overlay_frame);
	vol_frame.ReleaseGraphics(gb);
	CollectGarbage();
}

function init_overlay_obj() {
	seekbar = new UISlider(seek_frame, seek_time, seeker, 2, 2);
	VolumeBar = new UISlider(vol_frame, vol_active, vol_seeker, 2, 2);
}

function init_obj() {
	var btn_space = Math.floor(12*zdpi)+3;
	var imgh = img_stop.Width, imgh_b = img_play.Width;
	var btn_y = Math.max(0, wh/2 - imgh/2), btn_y2 = Math.max(0, wh/2 - imgh_b/2);
	PBPrevious.SetXY(40, btn_y);
	PBPlay.SetXY(40+imgh+btn_space, btn_y2);
	PBNext.SetXY(40+imgh+imgh_b+btn_space*2, btn_y);
	var btn_end_x = 40+imgh*2+imgh_b+btn_space*3;
	PBStop.SetXY(btn_end_x, btn_y);
	btn_end_x += imgh;
	//init
	seek_start = btn_end_x+2*btn_space+time_length;
	vol_start = ww - vol_len - 50;
	var volbtn_x = vol_start - 32*zdpi;
	pbo_start = volbtn_x - 28*zdpi - btn_space;
	var time_len_x = pbo_start - time_length -btn_space - 6*zdpi;
	seek_len = time_len_x - seek_start - btn_space - 6*zdpi;
	PlaybackTimeText = new UITextView(btn_end_x+btn_space, 0, time_length, wh, track_time, g_font, fontcolor, DT_CALCRECT | DT_VCENTER | DT_RIGHT);
	PlaybackLengthText = new UITextView(time_len_x, 0, time_length, wh, (track_len ? track_len : "00:00:00"), g_font, fontcolor, DT_CALCRECT | DT_VCENTER | DT_LEFT);
	TimeTip = new UITooltip(seek_start + 12*zdpi, Math.max(0,  wh / 2 - 11*zdpi), "", g_font, fontcolor, tip_bg);
	VolumeTip = new UITooltip(vol_start + 6*zdpi, Math.max(0, wh / 2 - 11*zdpi), (fb.Volume | 0).toString() + " dB", g_font, fontcolor, tip_bg);
	MuteBtn.SetXY(volbtn_x, Math.max(0, wh / 2 - img_vol.Width/2)); //vol_flag*20);
	PBOBtn.SetXY(pbo_start, Math.max(0, wh / 2 - pbo_btn_img.Width/2));
}

function setSize(){
	seekbar.setSize(seek_start, Math.max(0, wh / 2 - 11*zdpi), seek_len, Math.floor(22*zdpi));
	seekbar.MaxValue = Math.max(0, fb.PlaybackLength);
	VolumeBar.setSize(vol_start, Math.max(0,  wh / 2 - 9*zdpi), vol_len, Math.floor(18*zdpi));
	VolumeBar.Value = vol2pos(fb.Volume) | 0;
}

function get_images() {
	//creat static images
	var gb;
	var imgh = Math.floor(36*zdpi), imgh2 = imgh * 2;
	var c_normal = RGB(240, 240, 240),
		c_hover = RGB(255, 255, 255),
		c_down = RGB(200, 200, 200),
		c_shadow_h = RGBA(0, 0, 0, 70),
		c_shadow = RGBA(0, 0, 0, 90);
	var _x1 = 1*zdpi, _x13 = 13*zdpi, _x9 = 9*zdpi, _x12 = 12*zdpi, _x18 = 18*zdpi, _x22 = 22*zdpi, _x25 = 25*zdpi, _x32 = 32*zdpi;
	img_play = gdi.CreateImage(imgh, imgh * 3);
	gb = img_play.GetGraphics();
	time_length = gb.CalcTextWidth("00:00:00", g_font);
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(_x1, _x1, _x32, _x32, 2, c_normal);
	gb.Drawline(_x13, _x9, 26*zdpi, 17*zdpi, 2, c_normal);
	gb.Drawline(_x13, _x9, _x13, _x25, 2, c_normal);
	gb.Drawline(26*zdpi, 17*zdpi, 17*zdpi, 23*zdpi, 2, c_normal);
	gb.FillEllipse(0, imgh, imgh-_x1, imgh-_x1, c_shadow_h);
	gb.DrawEllipse(_x1, _x1 + imgh, _x32, _x32, 2, c_hover);
	gb.Drawline(_x13, _x9 + imgh, 26*zdpi, 17*zdpi + imgh, 2, c_hover);
	gb.Drawline(_x13, _x9 + imgh, _x13, _x25 + imgh, 2, c_hover);
	gb.Drawline(26*zdpi, 17*zdpi + imgh, 17*zdpi, 23*zdpi + imgh, 2, c_hover);
	gb.FillEllipse(0, imgh2, imgh-_x1, imgh-_x1, c_shadow);
	gb.DrawEllipse(_x1, _x1 + imgh2, _x32, _x32, 2, c_down);
	gb.Drawline(_x13, _x9 + imgh2, 26*zdpi, 17*zdpi + imgh2, 2, c_down);
	gb.Drawline(_x13, _x9 + imgh2, _x13, _x25 + imgh2, 2, c_down);
	gb.Drawline(26*zdpi, 17*zdpi + imgh2, 17*zdpi, 23*zdpi + imgh2, 2, c_down);
	gb.SetSmoothingMode(0);
	img_play.ReleaseGraphics(gb);
	
	var _x13m = Math.floor(_x13);
	img_pause = gdi.CreateImage(imgh, imgh * 3);
	gb = img_pause.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawEllipse(_x1, _x1, _x32, _x32, 2, c_normal);
	gb.SetSmoothingMode(0);
	gb.Drawline(_x13m, 10*zdpi, _x13m, _x25, 2, c_normal);
	gb.Drawline(_x22, 10*zdpi, _x22, _x25, 2, c_normal);
	gb.SetSmoothingMode(2);
	gb.FillEllipse(0, imgh, imgh-_x1, imgh-_x1, c_shadow_h);
	gb.DrawEllipse(_x1, _x1 + imgh, _x32, _x32, 2, c_hover);
	gb.SetSmoothingMode(0);
	gb.Drawline(_x13m, 10*zdpi + imgh, _x13m, _x25 + imgh, 2, c_hover);
	gb.Drawline(_x22, 10*zdpi + imgh, _x22, _x25 + imgh, 2, c_hover);
	gb.SetSmoothingMode(2);
	gb.FillEllipse(0, imgh2, imgh-_x1, imgh-_x1, c_shadow);
	gb.DrawEllipse(_x1, _x1 + imgh2, _x32, _x32, 2, c_down);
	gb.SetSmoothingMode(0);
	gb.Drawline(_x13m, 10*zdpi + imgh2, _x13m, _x25 + imgh2, 2, c_down);
	gb.Drawline(_x22, 10*zdpi + imgh2, _x22, _x25 + imgh2, 2, c_down);
	img_pause.ReleaseGraphics(gb);

	imgh = Math.floor(28*zdpi), imgh2 = imgh * 2;
	img_stop = gdi.CreateImage(imgh, imgh * 3);
	gb = img_stop.GetGraphics();
	var _x7 = 7*zdpi, _x6 = 6*zdpi, _x20 = 20*zdpi, _x21 = 21*zdpi;
	gb.Drawline(_x6, _x6, _x21+1, _x6, 2, c_normal);
	gb.Drawline(_x21, _x6+1, _x21, _x21, 2, c_normal);
	gb.Drawline(_x6+1, _x6+1, _x6+1, _x21, 2, c_normal);
	gb.Drawline(11*zdpi, _x21-1, _x21-1, _x21-1, 2, c_normal);
	gb.SetSmoothingMode(2);
	gb.FillEllipse(0, imgh, imgh, imgh, c_shadow_h);
	gb.SetSmoothingMode(0);
	gb.Drawline(_x6, _x6 + imgh, _x21+1, _x6 + imgh, 2, c_hover);
	gb.Drawline(_x21, _x6+1 + imgh, _x21, _x21 + imgh, 2, c_hover);
	gb.Drawline(_x6+1, _x6+1 + imgh, _x6+1, _x21 + imgh, 2, c_hover);
	gb.Drawline(11*zdpi, _x21-1 + imgh, _x21-1, _x21-1 + imgh, 2, c_hover);
	gb.SetSmoothingMode(2);
	gb.FillEllipse(0, imgh2, imgh, imgh, c_shadow);
	gb.SetSmoothingMode(0);
	gb.Drawline(_x6, _x6 + imgh2, _x21+1, _x6 + imgh2, 2, c_down);
	gb.Drawline(_x21, _x6+1 + imgh2, _x21, _x21 + imgh2, 2, c_down);
	gb.Drawline(_x6+1, _x6+1 + imgh2, _x6+1, _x21 + imgh2, 2, c_down);
	gb.Drawline(11*zdpi, _x21-1 + imgh2, _x21-1, _x21-1 + imgh2, 2, c_down);
	img_stop.ReleaseGraphics(gb);

	var _x5 = 5*zdpi;
	img_next = gdi.CreateImage(imgh, imgh * 3);
	gb = img_next.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.Drawline(_x7, _x5, 19*zdpi, _x13, 2, c_normal);
	gb.Drawline(_x7, _x5, _x7, _x21, 2, c_normal);
	gb.Drawline(_x7, _x21, 19*zdpi, _x13, 2, c_normal);
	gb.SetSmoothingMode(0);
	gb.Drawline(_x21, _x6, _x21, _x21, 2, c_normal);
	gb.SetSmoothingMode(2);
	gb.FillEllipse(0, imgh, imgh, imgh, c_shadow_h);
	gb.Drawline(_x7, _x5 + imgh, 19*zdpi, _x13 + imgh, 2, c_hover);
	gb.Drawline(_x7, _x5 + imgh, _x7, _x21 + imgh, 2, c_hover);
	gb.Drawline(_x7, _x21 + imgh, 19*zdpi, _x13 + imgh, 2, c_hover);
	gb.SetSmoothingMode(0);
	gb.Drawline(_x21, _x6 + imgh, _x21, _x21 + imgh, 2, c_hover);
	gb.SetSmoothingMode(2);
	gb.FillEllipse(0, imgh2, imgh, imgh, c_shadow);
	gb.Drawline(_x7, _x5 + imgh2, 19*zdpi, _x13 + imgh2, 2, c_down);
	gb.Drawline(_x7, _x5 + imgh2, _x7, _x21 + imgh2, 2, c_down);
	gb.Drawline(_x7, _x21 + imgh2, 19*zdpi, _x13 + imgh2, 2, c_down);
	gb.SetSmoothingMode(0);
	gb.Drawline(_x21, _x6 + imgh2, _x21, _x21 + imgh2, 2, c_down);
	img_next.ReleaseGraphics(gb);

	img_previous = gdi.CreateImage(imgh, imgh * 3);
	gb = img_previous.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.Drawline(_x20, _x5, 8*zdpi, _x13, 2, c_normal);
	gb.Drawline(_x20, _x5, _x20, _x21, 2, c_normal);
	gb.Drawline(_x20, _x21, _x9, _x13, 2, c_normal);
	gb.SetSmoothingMode(0);
	gb.Drawline(_x7, _x6, _x7, _x21, 2, c_normal);
	gb.SetSmoothingMode(2);
	gb.FillEllipse(0, imgh, imgh, imgh, c_shadow_h);
	gb.Drawline(_x20, _x5 + imgh, 8*zdpi, _x13 + imgh, 2, c_hover);
	gb.Drawline(_x20, _x5 + imgh, _x20, _x21 + imgh, 2, c_hover);
	gb.Drawline(_x20, _x21 + imgh, _x9, _x13 + imgh, 2, c_hover);
	gb.SetSmoothingMode(0);
	gb.Drawline(_x7, _x6 + imgh, _x7, _x21 + imgh, 2, c_hover);
	gb.SetSmoothingMode(2);
	gb.FillEllipse(0, imgh2, imgh, imgh, c_shadow);
	gb.Drawline(_x20, _x5 + imgh2, 8*zdpi, _x13 + imgh2, 2, c_down);
	gb.Drawline(_x20, _x5 + imgh2, _x20, _x21 + imgh2, 2, c_down);
	gb.Drawline(_x20, _x21 + imgh2, _x9, _x13 + imgh2, 2, c_down);
	gb.SetSmoothingMode(0);
	gb.Drawline(_x7, _x6 + imgh2, _x7, _x21 + imgh2, 2, c_down);
	img_previous.ReleaseGraphics(gb);

	imgh = Math.floor(24*zdpi);
	imgh2 = imgh * 2;
	img_vol = gdi.CreateImage(imgh, imgh * 3);
	gb = img_vol.GetGraphics();
	gb.Drawline(_x6, _x9-1, _x12, _x9-1, 2, c_normal);
	gb.Drawline(_x18, 4*zdpi, _x18, _x18, 2, c_normal);
	gb.Drawline(_x6, _x9-2, _x6, 16*zdpi, 2, c_normal);
	gb.Drawline(_x6, 16*zdpi-1, _x9-1, 16*zdpi-1, 2, c_normal);
	gb.SetSmoothingMode(2);
	gb.Drawline(_x12-1, _x9-1, _x18, 4*zdpi, 2, c_normal);
	gb.Drawline(_x18, _x18, _x12-1, 16*zdpi-1, 2, c_normal);
	gb.FillEllipse(1, imgh+1, imgh-2, imgh-2, c_shadow_h);
	gb.SetSmoothingMode(0);
	gb.Drawline(_x6, _x9-1 + imgh, _x12, _x9-1 + imgh, 2, c_hover);
	gb.Drawline(_x18, 4*zdpi + imgh, _x18, _x18 + imgh, 2, c_hover);
	gb.Drawline(_x6, _x9-2 + imgh, _x6, 16*zdpi + imgh, 2, c_hover);
	gb.Drawline(_x6, 16*zdpi-1 + imgh, _x9-1, 16*zdpi-1 + imgh, 2, c_hover);
	gb.SetSmoothingMode(2);
	gb.Drawline(_x12-1, _x9-1 + imgh, _x18, 4*zdpi + imgh, 2, c_hover);
	gb.Drawline(_x18, _x18 + imgh, _x12-1, 16*zdpi-1 + imgh, 2, c_hover);
	gb.FillEllipse(1, imgh2+1, imgh-2, imgh-2, c_shadow);
	gb.SetSmoothingMode(0);
	gb.Drawline(_x6, _x9-1 + imgh2, _x12, _x9-1 + imgh2, 2, c_down);
	gb.Drawline(_x18, 4*zdpi + imgh2, _x18, _x18 + imgh2, 2, c_down);
	gb.Drawline(_x6, _x9-2 + imgh2, _x6, 16*zdpi + imgh2, 2, c_down);
	gb.Drawline(_x6, 16*zdpi-1 + imgh2, _x9-1, 16*zdpi-1 + imgh2, 2, c_down);
	gb.SetSmoothingMode(2);
	gb.Drawline(_x12-1, _x9-1 + imgh2, _x18, 4*zdpi + imgh2, 2, c_down);
	gb.Drawline(_x18, _x18 + imgh2, _x12-1, 16*zdpi-1 + imgh2, 2, c_down);
	gb.SetSmoothingMode(0);
	img_vol.ReleaseGraphics(gb);

	img_pbo[0] = gdi.CreateImage(imgh, imgh);
	gb = img_pbo[0].GetGraphics();
	gb.DrawLine(2*zdpi, _x6, 17*zdpi, _x6, 2, c_normal);
	gb.DrawLine(2*zdpi, _x18, 17*zdpi, _x18, 2, c_normal);
	gb.SetSmoothingMode(2);
	var point_arr = new Array(16*zdpi, 2*zdpi, 16*zdpi, 9*zdpi, _x22, 5.5*zdpi);
	gb.FillPolygon(c_normal, 0, point_arr);
	var point_arr = new Array(16*zdpi, 14*zdpi, 16*zdpi, 21*zdpi, _x22, 17.5*zdpi);
	gb.FillPolygon(c_normal, 0, point_arr);
	gb.SetSmoothingMode(0);
	img_pbo[0].ReleaseGraphics(gb);

	img_pbo[1] = gdi.CreateImage(imgh, imgh);
	gb = img_pbo[1].GetGraphics();
	gb.DrawLine(2*zdpi, _x6, 17*zdpi, _x6, 2, c_normal);
	gb.DrawLine(3*zdpi, _x6+1, 3*zdpi, _x12, 2, c_normal);
	gb.DrawLine(_x7, _x18, _x22, _x18, 2, c_normal);
	gb.DrawLine(_x22-1, 13*zdpi, _x22-1, _x18-1, 2, c_normal);
	gb.SetSmoothingMode(2);
	var point_arr = new Array(16*zdpi, 2*zdpi, 16*zdpi, 9*zdpi, _x22, 5.5*zdpi);
	gb.FillPolygon(c_normal, 0, point_arr);
	var point_arr = new Array(8*zdpi, 14*zdpi, 8*zdpi, 21*zdpi, 2*zdpi, 17.5*zdpi);
	gb.FillPolygon(c_normal, 0, point_arr);
	gb.SetSmoothingMode(0);
	img_pbo[1].ReleaseGraphics(gb);

	img_pbo[2] = gdi.CreateImage(imgh, imgh);
	gb = img_pbo[2].GetGraphics();
	gb.DrawLine(2*zdpi, _x6, 17*zdpi, _x6, 2, c_normal);
	gb.DrawLine(3*zdpi, _x6+1, 3*zdpi, _x12, 2, c_normal);
	gb.DrawLine(_x7, _x18, _x22, _x18, 2, c_normal);
	gb.DrawLine(_x22-1, 13*zdpi, _x22-1, _x18-1, 2, c_normal);
	gb.SetSmoothingMode(2);
	var point_arr = new Array(16*zdpi, 2*zdpi, 16*zdpi, 9*zdpi, _x22, 5.5*zdpi);
	gb.FillPolygon(c_normal, 0, point_arr);
	var point_arr = new Array(8*zdpi, 14*zdpi, 8*zdpi, 21*zdpi, 2*zdpi, 17.5*zdpi);
	gb.FillPolygon(c_normal, 0, point_arr);
	gb.SetSmoothingMode(0);
	gb.SetTextRenderingHint(4);
	gb.DrawString("1", GdiFont("Tahoma", Math.floor(10*zdpi), 1), c_normal, _x7, 5*zdpi, _x12, _x12, StrFmt(align_center));
	gb.SetTextRenderingHint(0);
	img_pbo[2].ReleaseGraphics(gb);

	img_pbo[3] = gdi.CreateImage(imgh, imgh);
	gb = img_pbo[3].GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawLine(2*zdpi, _x20, 16*zdpi, _x7, 2, c_normal);
	gb.DrawLine(3.5*zdpi, 3.5*zdpi, 9.5*zdpi, 10*zdpi, 2, c_normal);
	gb.DrawLine(12.5*zdpi, 13*zdpi, 16.5*zdpi, 18*zdpi, 2, c_normal);
	var point_arr_1 = new Array(13.5*zdpi, 4.5*zdpi, 19*zdpi, 9.5*zdpi, 20.5*zdpi, 2.5*zdpi);
	gb.FillPolygon(c_normal, 0, point_arr_1);
	var point_arr_2 = new Array(18.5*zdpi, 14*zdpi, 13*zdpi, 19.5*zdpi, _x20, 21*zdpi);
	gb.FillPolygon(c_normal, 0, point_arr_2);
	img_pbo[3].ReleaseGraphics(gb);

	img_pbo[4] = gdi.CreateImage(imgh, imgh);
	gb = img_pbo[4].GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawLine(2*zdpi, _x20, 16*zdpi, _x7, 2, c_normal);
	gb.SetTextRenderingHint(4);
	gb.DrawString("x", GdiFont("Tahoma", Math.floor(_x12), 1), c_normal, 0, 0, _x12, _x12, StrFmt(align_center));
	gb.SetTextRenderingHint(0);
	gb.DrawLine(12.5*zdpi, 13*zdpi, 16.5*zdpi, 18*zdpi, 2, c_normal);
	//var point_arr = new Array(13.5, 4.5, 19, 9.5, 20.5, 2.5);
	gb.FillPolygon(c_normal, 0, point_arr_1);
	//var point_arr = new Array(18.5, 14, 13, 19.5, _x20, 21);
	gb.FillPolygon(c_normal, 0, point_arr_2);
	img_pbo[4].ReleaseGraphics(gb);

	img_pbo[5] = gdi.CreateImage(imgh, imgh);
	gb = img_pbo[5].GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawLine(2*zdpi, _x20, 16*zdpi, _x7, 2, c_normal);
	gb.DrawEllipse(_x1, 3*zdpi, _x7, _x7, 2, c_normal);
	gb.DrawLine(12.5*zdpi, 13*zdpi, 16.5*zdpi, 18*zdpi, 2, c_normal);
	//var point_arr = new Array(13.5, 4.5, 19, 9.5, 20.5, 2.5);
	gb.FillPolygon(c_normal, 0, point_arr_1);
	//var point_arr = new Array(18.5, 14, 13, 19.5, _x20, 21);
	gb.FillPolygon(c_normal, 0, point_arr_2);
	gb = img_pbo[5].ReleaseGraphics(gb);

	img_pbo[6] = gdi.CreateImage(imgh, imgh);
	gb = img_pbo[6].GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawLine(2*zdpi, _x20, 16*zdpi, 7*zdpi, 2, c_normal);
	gb.SetTextRenderingHint(4);
	gb.DrawString("F", GdiFont("Tahoma", Math.floor(_x12), 1), c_normal, _x1, _x1, _x12, _x12, StrFmt(align_center));
	gb.SetTextRenderingHint(0);
	gb.DrawLine(12.5*zdpi, 13*zdpi, 16.5*zdpi, 18*zdpi, 2, c_normal);
	//var point_arr = new Array(13.5, 4.5, 19, 9.5, 20.5, 2.5);
	gb.FillPolygon(c_normal, 0, point_arr_1);
	//var point_arr = new Array(18.5, 14, 13, 19.5, _x20, 21);
	gb.FillPolygon(c_normal, 0, point_arr_2);
	img_pbo[6].ReleaseGraphics(gb);
	
	imgh = Math.floor(22*zdpi);
	seeker = gdi.CreateImage(imgh, imgh);
	gb = seeker.GetGraphics();
	gb.SetSmoothingMode(4);
	gb.FillEllipse(0, 0, 20*zdpi, 20*zdpi, RGBA(255, 255, 255, 40));
	gb.FillEllipse(5*zdpi, 5*zdpi, 10*zdpi, 10*zdpi, fontcolor);
	gb.SetSmoothingMode(0);
	seeker.ReleaseGraphics(gb);

	tip_bg = gdi.CreateImage(50, 22);
	gb = tip_bg.GetGraphics();
	gb.SetSmoothingMode(4);
	gb.FillRoundRect(1, 1, 48, 20, 5, 5, RGBA(0, 0, 0, 120));
	gb.SetSmoothingMode(0);
	tip_bg.ReleaseGraphics(gb);

	vol_active = gdi.CreateImage(100, 18);
	gb = vol_active.GetGraphics();
	gb.FillSolidRect(0, 7, 100, 3, RGB(240, 240, 240));
	vol_active.ReleaseGraphics(gb);
	imgh = Math.floor(18*zdpi);
	vol_seeker = gdi.CreateImage(imgh, imgh);
	gb = vol_seeker.GetGraphics();
	gb.SetSmoothingMode(4);
	gb.FillEllipse(0, 0, 16*zdpi, 16*zdpi, RGBA(225, 225, 225, 40));
	gb.FillEllipse(4*zdpi, 4*zdpi, 8*zdpi, 8*zdpi, fontcolor);
	gb.SetSmoothingMode(0);
	vol_seeker.ReleaseGraphics(gb);

	pbo_btn_img = gdi.CreateImage(Math.floor(28*zdpi), Math.floor(84*zdpi));
	gb = pbo_btn_img.GetGraphics();
	gb.SetSmoothingMode(4);
	gb.FillRoundRect(0, 28*zdpi, 26*zdpi, 26*zdpi, 6, 6, c_shadow_h);
	gb.FillRoundRect(0, 56*zdpi, 26*zdpi, 26*zdpi, 6, 6, c_shadow);
	gb.SetSmoothingMode(0);
	pbo_btn_img.ReleaseGraphics(gb);

	CollectGarbage();
}