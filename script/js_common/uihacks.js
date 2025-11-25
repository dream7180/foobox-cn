var UIHacks;
var uiHacks = utils.CheckComponent("foo_ui_hacks");
if (uiHacks) UIHacks = new ActiveXObject("UIHacks");
var pseudoCaption;
var pseudoCaptionWidth;
var mouseInControl = false;

function uiHacksInit() {
	if (!uiHacks) return;
	UIHacks.FrameStyle = 3;//noboarder
	UIHacks.MainMenuState = 1;//hide
	UIHacks.StatusBarState = 0;//hide
	UIHacks.MoveStyle = 0;//caption only
	UIHacks.Aero.Effect = 2;//GlassFrame
	UIHacks.Aero.Bottom = 1;
	UIHacks.Aero.Left = UIHacks.Aero.Right = UIHacks.Aero.Top = 0;
	if(UIHacks.MainWindowState == 2) UIHacks.DisableSizing = true; //maximized
	else UIHacks.DisableSizing = false;
}

function uiHacksResetCaption(){
	if (!uiHacks) return;
	UIHacks.SetPseudoCaption(leftbarw, 0, ww - 3*topbtnw - leftbarw, topbarh);
	if(UIHacks.MainWindowState == 2) UIHacks.DisableSizing = true; //maximized
	else UIHacks.DisableSizing = false;
}