WindowState = {
	Normal: 0,
	Minimized: 1,
	Maximized: 2
}
var FrameStyle = {
	Default: 0,
	SmallCaption: 1,
	NoCaption: 2,
	NoBorder: 3
}
var MoveStyle = {
	Default: 0,
	Middle: 1,
	Left: 2,
	Both: 3
}
var safeMode = uiHacks = false;
var UIHacks;
try {
	WshShell = new ActiveXObject("WScript.Shell");
} catch (e) {
	fb.trace("----------------------------------------------------------------------");
	fb.trace(e + "\n修正: 在参数选项 > 工具 > WSH 面板增强版中禁用安全模式");
	fb.trace("----------------------------------------------------------------------");
	safeMode = true;
}

if (!safeMode) {
	uiHacks = utils.CheckComponent("foo_ui_hacks");
	if (uiHacks) {
		UIHacks = new ActiveXObject("UIHacks");
	}
}
var pseudoCaption;
var pseudoCaptionWidth;
var mouseInControl = false;

function caption_n_full(ui_no_border) {
	if (!uiHacks) return;
	if (!ui_no_border) return;
	try { // needed when doble clicking on caption and UIHacks.FullScreen == true;
		if (!utils.IsKeyPressed(VK_CONTROL) && UIHacks.FullScreen && UIHacks.MainWindowState == 0) {
			UIHacks.MainWindowState = 0;
		}
	} catch (e) {};
}

function set_uihacks_caption(ui_no_border) {
	if (!uiHacks) return;
	if (!ui_no_border) return;
	try {
		if (mouseInControl) {
			UIHacks.SetPseudoCaption(0, 0, 0, 0);
			pseudoCaption = false;
		} else if (!pseudoCaption || pseudoCaptionWidth != 4086) {
			UIHacks.SetPseudoCaption(5, 5, 4086, Math.floor(40*zdpi)-5);
			pseudoCaption = true;
			pseudoCaptionWidth = 4086;
		}
	} catch (e) {};
}

function uihacks_settings(ui_no_border) {
	if (!uiHacks) return;
	if (ui_no_border) {
		UIHacks.FrameStyle = FrameStyle.NoBorder;
		UIHacks.MoveStyle = MoveStyle.Both;
		UIHacks.Aero.Effect = 2;
		UIHacks.Aero.Top = 1;
		UIHacks.Aero.Left = UIHacks.Aero.Right = UIHacks.Aero.Bottom = 0;
	} else {
		UIHacks.FrameStyle = FrameStyle.Default;
		UIHacks.MoveStyle = MoveStyle.Default;
		UIHacks.Aero.Effect = 0;
	}
}
