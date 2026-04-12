var UIComp = new ActiveXObject("OpenHacksMod");
var setCaption_timer = false;
var upper_border = 0;

function UiCompInit() {
	window.SetTimeout(function() {
		if(UIComp.WindowFrameStyle == 0) UIComp.WindowFrameStyle = 2;//noboarder
		else if(UIComp.WindowFrameStyle == 1) upper_border = Math.ceil(zdpi*6);
		if(UIComp.MenuBarVisible) UIComp.MenuBarVisible = false;
		UIComp.PseudoCaptionTopEnabled = true;
		UIComp.PseudoCaptionLeftEnabled = true;
		UIComp.PseudoCaptionRightEnabled = false;
		UIComp.PseudoCaptionBottomEnabled = false;
	}, 100);
}

function UiCompSetCaption(){
	if(!ww) return;
	if(!setCaption_timer){
		setCaption_timer = window.SetTimeout(function() {
			UIComp.PseudoCaptionTop = 0;
			UIComp.PseudoCaptionLeft = leftbarw;
			UIComp.PseudoCaptionWidth = captionw;
			UIComp.PseudoCaptionHeight = topbarh + upper_border;		
			setCaption_timer && window.ClearTimeout(setCaption_timer);
			setCaption_timer = false;
		}, 200);
	}
}