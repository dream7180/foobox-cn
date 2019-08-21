//common script

function RGBA(r, g, b, a) {
	return ((a << 24) | (r << 16) | (g << 8) | (b));
}

function RGB(r, g, b) {
	return (0xff000000 | (r << 16) | (g << 8) | (b))
}

// Textformat
var DT_LEFT = 0x00000000;
var DT_CENTER = 0x00000001;
var DT_RIGHT = 0x00000002;
var DT_TOP = 0x00000000;
var DT_VCENTER = 0x00000004;
var DT_BOTTOM = 0x00000008;
var DT_SINGLELINE = 0x00000020;
var DT_NOCLIP = 0x00000100;
var DT_CALCRECT = 0x00000400;
var DT_END_ELLIPSIS = 0x00008000;
var DT_NOPREFIX = 0x00000800;
DT_PATH_ELLIPSIS = 0x00004000;
DT_WORD_ELLIPSIS = 0x00040000;

// Flags, used by Menu ----------------------
var MF_SEPARATOR = 0x00000800;
var MF_ENABLED = 0x00000000;
var MF_GRAYED = 0x00000001;
var MF_DISABLED = 0x00000002;
var MF_UNCHECKED = 0x00000000;
var MF_CHECKED = 0x00000008;
var MF_STRING = 0x00000000;
var MF_POPUP = 0x00000010;
var MF_RIGHTJUSTIFY = 0x00004000;

//DEFINE CLASS ButtonUI 
function ButtonUI(img, tooltipText) {
	this.x = null;
	this.y = null;
	this.img = img;
	this.width = img.Width;
	this.height = img.Height/3;
	this.state = 0; //0-normal ;1-hover ;2-down ;3-disable
	this.Tooltip = window.CreateTooltip("",g_fsize);
	this.Tooltip.Text = tooltipText;
}

ButtonUI.prototype.SetXY = function(x, y){
	this.x = x;
	this.y = y;
}

ButtonUI.prototype.Paint = function(gr) {
	gr.DrawImage(this.img, this.x, this.y, this.width, this.height, 0, this.state * this.height, this.width, this.height, 0);
}

ButtonUI.prototype.Repaint = function() {
	window.RepaintRect(this.x, this.y, this.width, this.height);
}

ButtonUI.prototype.MouseMove = function(x, y) {
	if (x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height) {
		if (this.state == 0) {
			this.state = 1;
			this.Tooltip.Activate();
			this.Repaint();
		}
		return true;
	} else {
		this.Reset();
		return false;
	}
}

ButtonUI.prototype.MouseDown = function(x, y) {
	if (this.state == 1) {
		this.state = 2;
		this.Repaint();
		return true;
	} else return false;
}

ButtonUI.prototype.MouseUp = function() {
	if (this.state == 2) {
		this.Reset();
		return true;
	} else return false;
}

ButtonUI.prototype.Reset = function() {
	if (this.state != 0) {
		this.state = 0;
		this.Tooltip.Deactivate();
		this.Repaint();
	}
}