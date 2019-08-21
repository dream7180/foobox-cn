// *****************************************************************************************************************************************
// Common functions & flags by Br3tt aka Falstaff (c)2013-2015
// *****************************************************************************************************************************************

//=================================================// General declarations
SM_CXVSCROLL = 2;
SM_CYHSCROLL = 3;

DLGC_WANTARROWS = 0x0001; /* Control wants arrow keys */
DLGC_WANTTAB = 0x0002; /* Control wants tab keys */
DLGC_WANTALLKEYS = 0x0004; /* Control wants all keys */
DLGC_WANTMESSAGE = 0x0004; /* Pass message to control */
DLGC_HASSETSEL = 0x0008; /* Understands EM_SETSEL message */
DLGC_DEFPUSHBUTTON = 0x0010; /* Default pushbutton */
DLGC_UNDEFPUSHBUTTON = 0x0020; /* Non-default pushbutton */
DLGC_RADIOBUTTON = 0x0040; /* Radio button */
DLGC_WANTCHARS = 0x0080; /* Want WM_CHAR messages */
DLGC_STATIC = 0x0100; /* Static item: don't include */
DLGC_BUTTON = 0x2000; /* Button item: can be checked */

// Used in utils.Glob()
// For more information, see: http://msdn.microsoft.com/en-us/library/ee332330%28VS.85%29.aspx
FILE_ATTRIBUTE_READONLY = 0x00000001;
FILE_ATTRIBUTE_HIDDEN = 0x00000002;
FILE_ATTRIBUTE_SYSTEM = 0x00000004;
FILE_ATTRIBUTE_DIRECTORY = 0x00000010;
FILE_ATTRIBUTE_ARCHIVE = 0x00000020;
//FILE_ATTRIBUTE_DEVICE = 0x00000040; // do not use
FILE_ATTRIBUTE_NORMAL = 0x00000080;
FILE_ATTRIBUTE_TEMPORARY = 0x00000100;
FILE_ATTRIBUTE_SPARSE_FILE = 0x00000200;
FILE_ATTRIBUTE_REPARSE_POINT = 0x00000400;
FILE_ATTRIBUTE_COMPRESSED = 0x00000800;
FILE_ATTRIBUTE_OFFLINE = 0x00001000;
FILE_ATTRIBUTE_NOT_CONTENT_INDEXED = 0x00002000;
FILE_ATTRIBUTE_ENCRYPTED = 0x00004000;
//FILE_ATTRIBUTE_VIRTUAL = 0x00010000; // do not use

// }}
// Use with MenuManager() 
// {{
MF_STRING = 0x00000000;
MF_SEPARATOR = 0x00000800;
MF_GRAYED = 0x00000001;
MF_DISABLED = 0x00000002;
MF_POPUP = 0x00000010;
// }}
// Used in get_colors()
// {{
COLOR_WINDOW = 5;
COLOR_HIGHLIGHT = 13;
COLOR_BTNFACE = 15;
COLOR_BTNTEXT = 18;
// }}
// Used in window.SetCursor()
// {{
IDC_ARROW = 32512;
IDC_IBEAM = 32513;
IDC_WAIT = 32514;
IDC_CROSS = 32515;
IDC_UPARROW = 32516;
IDC_SIZE = 32640;
IDC_ICON = 32641;
IDC_SIZENWSE = 32642;
IDC_SIZENESW = 32643;
IDC_SIZEWE = 32644;
IDC_SIZENS = 32645;
IDC_SIZEALL = 32646;
IDC_NO = 32648;
IDC_APPSTARTING = 32650;
IDC_HAND = 32649;
IDC_HELP = 32651;
// }}
// Use with GdiDrawText() 
// {{
var DT_LEFT = 0x00000000;
var DT_RIGHT = 0x00000002;
var DT_TOP = 0x00000000;
var DT_BOTTOM = 0x00000008;
var DT_CENTER = 0x00000001;
var DT_VCENTER = 0x00000004;
var DT_WORDBREAK = 0x00000010;
var DT_SINGLELINE = 0x00000020;
var DT_CALCRECT = 0x00000400;
var DT_NOPREFIX = 0x00000800;
var DT_EDITCONTROL = 0x00002000;
var DT_END_ELLIPSIS = 0x00008000;
// }}
// Keyboard Flags & Tools
// {{
var VK_F1 = 0x70;
var VK_F2 = 0x71;
var VK_F3 = 0x72;
var VK_F4 = 0x73;
var VK_F5 = 0x74;
var VK_F6 = 0x75;
var VK_BACK = 0x08;
var VK_TAB = 0x09;
var VK_RETURN = 0x0D;
var VK_SHIFT = 0x10;
var VK_CONTROL = 0x11;
var VK_ALT = 0x12;
var VK_ESCAPE = 0x1B;
var VK_PGUP = 0x21;
var VK_PGDN = 0x22;
var VK_END = 0x23;
var VK_HOME = 0x24;
var VK_LEFT = 0x25;
var VK_UP = 0x26;
var VK_RIGHT = 0x27;
var VK_DOWN = 0x28;
var VK_INSERT = 0x2D;
var VK_DELETE = 0x2E;
var VK_SPACEBAR = 0x20;
var VK_LWIN = 0x5B;
var KMask = {
	none: 0,
	ctrl: 1,
	shift: 2,
	ctrlshift: 3,
	ctrlalt: 4,
	ctrlaltshift: 5,
	alt: 6
};

var vb = {};
vb.Function = function (func) {
	return function () {
		return vb.Function.eval.call(this, func, arguments);
	};
};

vb.Function.eval = function (func) {
	var args = Array.prototype.slice.call(arguments[1]);
	for (var i = 0;
	i < args.length;
	i++) {
		if (typeof args[i] != 'string') {
			continue;
		};
		args[i] = '"' + args[i].replace(/"/g, '" + Chr(34) + "') + '"';
	};
	var vbe;
	vbe = new ActiveXObject('ScriptControl');
	vbe.Language = 'VBScript';
	return vbe.eval(func + '(' + args.join(', ') + ')');
};

var InputBox = vb.Function('InputBox');
var MsgBox = vb.Function('MsgBox');
vb.OKOnly = 0;
vb.OKCancel = 1;
vb.AbortRetryIgnore = 2;
vb.YesNoCancel = 3;
vb.YesNo = 4;
vb.RetryCancel = 5;
vb.Critical = 16;
vb.Question = 32;
vb.Exclamation = 48;
vb.Information = 64;
vb.DefaultButton1 = 0;
vb.DefaultButton2 = 256;
vb.DefaultButton3 = 512;
vb.DefaultButton4 = 768;
vb.ApplicationModal = 0;
vb.SystemModal = 4096;
vb.OK = 1;
vb.Cancel = 2;
vb.Abort = 3;
vb.Retry = 4;
vb.Ignore = 5;
vb.Yes = 6;
vb.No = 7;

function GetKeyboardMask() {
	var c = utils.IsKeyPressed(VK_CONTROL) ? true : false;
	var a = utils.IsKeyPressed(VK_ALT) ? true : false;
	var s = utils.IsKeyPressed(VK_SHIFT) ? true : false;
	var ret = KMask.none;
	if (c && !a && !s) ret = KMask.ctrl;
	if (!c && !a && s) ret = KMask.shift;
	if (c && !a && s) ret = KMask.ctrlshift;
	if (c && a && !s) ret = KMask.ctrlalt;
	if (c && a && s) ret = KMask.ctrlaltshift;
	if (!c && a && !s) ret = KMask.alt;
	return ret;
};
// }}
// {{
// Used in window.GetColorCUI()
ColorTypeCUI = {
	text: 0,
	selection_text: 1,
	inactive_selection_text: 2,
	background: 3,
	selection_background: 4,
	inactive_selection_background: 5,
	active_item_frame: 6
};
// Used in window.GetFontCUI()
FontTypeCUI = {
	items: 0,
	labels: 1
};
// Used in window.GetColorDUI()
ColorTypeDUI = {
	text: 0,
	background: 1,
	highlight: 2,
	selection: 3
};
// Used in window.GetFontDUI()
FontTypeDUI = {
	defaults: 0,
	tabs: 1,
	lists: 2,
	playlists: 3,
	statusbar: 4,
	console: 5
};
//}}
// {{
// Used in gr.DrawString()
function StringFormat() {
	var h_align = 0,
	v_align = 0,
	trimming = 0,
	flags = 0;
	switch (arguments.length) {
		case 3:
		trimming = arguments[2];
		case 2:
		v_align = arguments[1];
		case 1:
		h_align = arguments[0];
		break;
		default:
		return 0;
	};
	return ((h_align << 28) | (v_align << 24) | (trimming << 20) | flags);
};
StringAlignment = {
	Near: 0,
	Centre: 1,
	Far: 2
};
var lt_stringformat = StringFormat(StringAlignment.Near, StringAlignment.Near);
var ct_stringformat = StringFormat(StringAlignment.Centre, StringAlignment.Near);
var rt_stringformat = StringFormat(StringAlignment.Far, StringAlignment.Near);
var lc_stringformat = StringFormat(StringAlignment.Near, StringAlignment.Centre);
var cc_stringformat = StringFormat(StringAlignment.Centre, StringAlignment.Centre);
var rc_stringformat = StringFormat(StringAlignment.Far, StringAlignment.Centre);
var lb_stringformat = StringFormat(StringAlignment.Near, StringAlignment.Far);
var cb_stringformat = StringFormat(StringAlignment.Centre, StringAlignment.Far);
var rb_stringformat = StringFormat(StringAlignment.Far, StringAlignment.Far);

var lc_txt = DT_LEFT | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX | DT_END_ELLIPSIS;
var rc_txt = DT_RIGHT | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX | DT_END_ELLIPSIS;
var lt_txt = DT_LEFT | DT_TOP | DT_CALCRECT | DT_NOPREFIX | DT_END_ELLIPSIS;
var cc_txt = DT_CENTER | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX | DT_END_ELLIPSIS;
var ccf_txt = DT_CENTER | DT_NOPREFIX | DT_CALCRECT | DT_VCENTER;
var lcs_txt = DT_LEFT | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX | DT_SINGLELINE | DT_END_ELLIPSIS;
var rcs_txt = DT_RIGHT | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX | DT_SINGLELINE | DT_END_ELLIPSIS;
var ccs_txt = DT_CENTER | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX | DT_SINGLELINE | DT_END_ELLIPSIS;
//}}
// {{
// Used in utils.GetAlbumArt()
AlbumArtId = {
	front: 0,
	back: 1,
	disc: 2,
	icon: 3,
	artist: 4
};
//}}
// {{
// Used everywhere!
function RGB(r, g, b) {
	return (0xff000000 | (r << 16) | (g << 8) | (b));
};
function RGBA(r, g, b, a) {
	return ((a << 24) | (r << 16) | (g << 8) | (b));
};
function getAlpha(color) {
	return ((color >> 24) & 0xff);
};

function getRed(color) {
	return ((color >> 16) & 0xff);
};

function getGreen(color) {
	return ((color >> 8) & 0xff);
};

function getBlue(color) {
	return (color & 0xff);
};

function negative(colour) {
	var R = getRed(colour);
	var G = getGreen(colour);	
	var B = getBlue(colour);
	return RGB(Math.abs(R-255), Math.abs(G-255), Math.abs(B-255));
};

function toRGB(d){ // convert back to RGB values
	var d = d - 0xff000000;
	var r = d >> 16;
	var g = d >> 8 & 0xFF;
	var b = d & 0xFF;
	return [r,g,b];
};

function blendColors(c1, c2, factor) {
	// When factor is 0, result is 100% color1, when factor is 1, result is 100% color2.
	var c1 = toRGB(c1);
	var c2 = toRGB(c2);
	var r = Math.round(c1[0] + factor * (c2[0] - c1[0]));
	var g = Math.round(c1[1] + factor * (c2[1] - c1[1]));
	var b = Math.round(c1[2] + factor * (c2[2] - c1[2]));
	return (0xff000000 | (r << 16) | (g << 8) | (b));
};

function draw_glass_reflect(w, h) {
	// Mask for glass effect
	var Mask_img = gdi.CreateImage(w, h);
	var gb = Mask_img.GetGraphics();
	gb.FillSolidRect(0,0,w,h,0xffffffff);
	gb.FillGradRect(0,0,w-20,h,0,0xaa000000,0,1.0);
	gb.SetSmoothingMode(2);
	gb.FillEllipse(-20, 25, w*2+40, h*2, 0xffffffff);
	Mask_img.ReleaseGraphics(gb);
	// drawing the white rect
	var glass_img = gdi.CreateImage(w, h);
	gb = glass_img.GetGraphics();
	gb.FillSolidRect(0, 0, w, h, 0xffffffff);
	glass_img.ReleaseGraphics(gb);
	// resizing and applying the mask
	var Mask = Mask_img.Resize(w, h);
	glass_img.ApplyMask(Mask);
	Mask.Dispose();
	return glass_img;
};

function drawBlurbox(w, h, bgcolor, boxcolor, radius, iteration) {
	// Create a image which background is true transparent
	var g_blurbox = gdi.CreateImage(w+40, h+40);
	// Get graphics interface like "gr" in on_paint
	var gb = g_blurbox.GetGraphics();
	gb.FillSolidRect(20, 20, w, h, boxcolor);
	g_blurbox.ReleaseGraphics(gb);
	// Make box blur, radius = 2, iteration = 2
	g_blurbox.BoxBlur(radius, iteration);
	var g_blurbox_main = gdi.CreateImage(w+40, h+40);
	gb = g_blurbox_main.GetGraphics();
	gb.FillSolidRect(0, 0, w+40, h+40, bgcolor);
	gb.DrawImage(g_blurbox, 0, -10, w+40, h+40, 0, 0, w+40, h+40, 0, 255);
	g_blurbox_main.ReleaseGraphics(gb);	
	return g_blurbox_main;
};

function num(strg, nb) {
	var i;
	var str = strg.toString();
	var k = nb - str.length;
	if (k > 0) {
		for (i=0;i<k;i++) {
			str = "0" + str;
		};
	};
	return str.toString();
};
/*
//Time formatting secondes -> 0:00
function TimeFromSeconds(t){
	var zpad = function(n){
	var str = n.toString();
		return (str.length<2) ? "0"+str : str;
	};
	var h = Math.floor(t/3600); t-=h*3600;
	var m = Math.floor(t/60); t-=m*60;
	var s = Math.floor(t);
	if(h>0) return h.toString()+":"+zpad(m)+":"+zpad(s);
	return m.toString()+":"+zpad(s);
};
*/
function TrackType(trkpath) {
	var taggable;
	var type;
	switch (trkpath) {
		case "file":
		taggable = 1;
		type = 0;
		break;
		case "cdda":
		taggable = 1;
		type = 1;
		break;
		case "FOO_":
		taggable = 0;
		type = 2;
		break;
		case "http":
		taggable = 0;
		type = 3;
		break;
		case "mms:":
		taggable = 0;
		type = 3;
		break;
		case "unpa":
		taggable = 0;
		type = 4;
		break;
		default:
		taggable = 0;
		type = 5;
	};
	return type;
};
function replaceAll(str, search, repl) {
	while (str.indexOf(search) != -1) {
		str = str.replace(search, repl);
	};
	return str;
};
function removeAccents(str) {
	/*
	var norm = new Array('À','Á','Â','Ã','Ä','Å','Æ','Ç','È','É','Ê','Ë',
	'Ì','Í','Î','Ï', 'Ð','Ñ','Ò','Ó','Ô','Õ','Ö','Ø','Ù','Ú','Û','Ü','Ý',
	'Þ','ß');
	var spec = new Array('A','A','A','A','A','A','AE','C','E','E','E','E',
	'I','I','I','I', 'D','N','O','O','O','O','O','O','U','U','U','U','Y',
	'b','SS');
	for (var i = 0; i < spec.length; i++) {
		str = replaceAll(str, norm[i], spec[i]);
	};
	*/
	return str;
};
//}}

//=================================================// Button object
ButtonStates = {normal: 0, hover: 1, down: 2};
button = function (normal, hover, down ,tooltipText) {
	this.img = Array(normal, hover, down);
	this.w = this.img[0].Width;
	this.h = this.img[0].Height;
	this.Tooltip = window.CreateTooltip("",g_fsize);
	this.Tooltip.Text = tooltipText;
	this.state = ButtonStates.normal;
	this.update = function (normal, hover, down, Tooltip) {
		this.img = Array(normal, hover, down);
		this.Tooltip.Text = Tooltip;
		this.w = this.img[0].Width;
		this.h = this.img[0].Height;
	};
	this.draw = function (gr, x, y, alpha) {
		this.x = x;
		this.y = y;
		this.img[this.state] && gr.DrawImage(this.img[this.state], this.x, this.y, this.w, this.h, 0, 0, this.w, this.h, 0, alpha);
	};
	this.display_context_menu = function (x, y, id) {}
	this.repaint = function () {
		this.Tooltip.Deactivate();
		window.RepaintRect(this.x, this.y, this.w, this.h);
	};
	this.changeTooltip = function (newTooltip){
		this.Tooltip.Text = newTooltip;
	}
	
	this.checkstate = function (event, x, y) {
		this.ishover = (x > this.x && x < this.x + this.w - 1 && y > this.y && y < this.y + this.h - 1);
		this.old = this.state;
		switch (event) {
		 case "down":
			switch(this.state) {
			case ButtonStates.normal:
			 case ButtonStates.hover:
				this.state = this.ishover ? ButtonStates.down : ButtonStates.normal;
				this.isdown = true;
				break;
			};
			break;
		 case "up":
			this.state = this.ishover ? ButtonStates.hover : ButtonStates.normal;
			this.isdown = false;
			//window.SetCursor(32512);
			break;
		 case "right":
			 //if(this.ishover) this.display_context_menu(x, y, id);
			 this.state = this.ishover ? ButtonStates.hover : ButtonStates.normal;
			 break;
		 case "move":
			switch(this.state) {
			case ButtonStates.normal:
			case ButtonStates.hover:
				if(this.ishover){
					this.Tooltip.Activate();
					//window.SetCursor(32649);
				}
				this.state = this.ishover ? ButtonStates.hover : ButtonStates.normal;
				if (this.state == ButtonStates.normal && this.old != ButtonStates.normal){
					this.Tooltip.Deactivate();
					//window.SetCursor(32512);
				}
				break;
			};
			break;
		 case "leave":
			this.Tooltip.Deactivate();
			//window.SetCursor(32512);
			this.state = this.isdown ? ButtonStates.down : ButtonStates.normal;
			break;
		};
		if(this.state!=this.old) this.repaint();
		return this.state;
	};
};

//=================================================// Tools (general)
function decode_colour(opt_colour, resultype) {
	var XYZ_colour = {
		RGBcolour: 0,
		H: 0,
		S: 0,
		L: 0
	};
	var R_read, G_read, B_read;
	switch (resultype) {
		case 1:
			switch (opt_colour.length) {
				case 23:
					XYZ_colour.H = Math.round(opt_colour.substring(0, 3));
					XYZ_colour.S = Math.round(opt_colour.substring(4, 7));
					XYZ_colour.L = Math.round(opt_colour.substring(8, 11));
					XYZ_colour.RGBcolour = HSL2RGB(XYZ_colour.H, XYZ_colour.S, XYZ_colour.L, "RGB");
					break;
				default:
					XYZ_colour.H = 0;
					XYZ_colour.S = 0;
					XYZ_colour.L = 0;
					XYZ_colour.RGBcolour = RGB(0, 0, 0)
			};
			return XYZ_colour;
			break;
		default:
			switch (opt_colour.length) {
				case 23:
					R_read = Math.round(opt_colour.substring(12, 15));
					G_read = Math.round(opt_colour.substring(16, 19));
					B_read = Math.round(opt_colour.substring(20, 23));
					break;
				default:
					R_read = 0;
					G_read = 0;
					B_read = 0
			};
			return RGB(R_read, G_read, B_read);
	};
};

function HSL2RGB(zH, zS, zL, result) {
	var L = zL / 100;
	var S = zS / 100;
	var H = zH / 100;
	var R, G, B, var_1, var_2;
	if (S==0) {			 //HSL from 0 to 1
	   R = L * 255;		 //RGB results from 0 to 255
	   G = L * 255;
	   B = L * 255;
	}; else {
	   if (L<0.5) var_2 = L * (1 + S);
	   else var_2 = (L + S) - (S * L);

	   var_1 = 2 * L - var_2;

	   R = 255 * Hue2RGB(var_1, var_2, H + ( 1 / 3 ));
	   G = 255 * Hue2RGB(var_1, var_2, H );
	   B = 255 * Hue2RGB(var_1, var_2, H - ( 1 / 3 ));
	};
	switch(result) {
		case "R":
			return Math.round(R);
			break;
		case "G":
			return Math.round(G);
			break;
		case "B":
			return Math.round(B);
			break;
		default:
			return RGB(Math.round(R), Math.round(G), Math.round(B));
	};
};

function Hue2RGB(v1, v2, vH) {
	if (vH < 0) vH += 1;
	if (vH > 1) vH -= 1;
	if ((6 * vH) < 1) return (v1 + ( v2 - v1 ) * 6 * vH);
	if ((2 * vH) < 1) return (v2);
	if ((3 * vH) < 2) return (v1 + ( v2 - v1 ) * ( ( 2 / 3 ) - vH ) * 6);
	return (v1);
};

function RGB2HSL(RGB_colour) {
	var R = (getRed(RGB_colour) / 255);
	var G = (getGreen(RGB_colour) / 255);
	var B = (getBlue(RGB_colour) / 255);
	var HSL_colour = {RGB:0, H:0, S:0, L:0};
	
	var_Min = Math.min(R, G, B);	//Min. value of RGB
	var_Max = Math.max(R, G, B);	//Max. value of RGB
	del_Max = var_Max - var_Min;	//Delta RGB value

	L = ( var_Max + var_Min ) / 2;

	if ( del_Max == 0 ) {		   //This is a gray, no chroma...
	   H = 0;					   //HSL results from 0 to 1
	   S = 0;
	};
	else {						  //Chromatic data...
	   if ( L < 0.5 ) S = del_Max / ( var_Max + var_Min );
	   else		   S = del_Max / ( 2 - var_Max - var_Min );

	   del_R = ( ( ( var_Max - R ) / 6 ) + ( del_Max / 2 ) ) / del_Max;
	   del_G = ( ( ( var_Max - G ) / 6 ) + ( del_Max / 2 ) ) / del_Max;
	   del_B = ( ( ( var_Max - B ) / 6 ) + ( del_Max / 2 ) ) / del_Max;

	   if	  ( R == var_Max ) H = del_B - del_G;
	   else if ( G == var_Max ) H = ( 1 / 3 ) + del_R - del_B;
	   else if ( B == var_Max ) H = ( 2 / 3 ) + del_G - del_R;

	   if ( H < 0 ) H += 1;
	   if ( H > 1 ) H -= 1;
	};
	HSL_colour.RGB = RGB_colour;
	HSL_colour.H = Math.round(H * 100);
	HSL_colour.S = Math.round(S * 100);
	HSL_colour.L = Math.round(L * 100);
	return HSL_colour;
};

function DrawColoredText(gr, text, font, default_color, x, y, w, h, alignment, force_default_color) {
	var txt = "", color = default_color, lg = 0, i = 1, z = 0, tmp = "";
	var pos = text.indexOf(String.fromCharCode(3));
	if(pos < 0) { // no specific color
		gr.GdiDrawText(text, font, default_color, x, y, w, h, alignment | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
	}; else {
		var tab = text.split(String.fromCharCode(3));
		var fin = tab.length;

		switch(alignment) {
			case DT_CENTER:
				var full_lg = gr.CalcTextWidth(tab[0], font);
				for(var m = i; m < fin; m+=2){
					full_lg += gr.CalcTextWidth(tab[m+1], font);
				};
				if(full_lg > w) full_lg = w;
				var delta_align = ((w - full_lg) / 2);
				break;
			case DT_RIGHT:
				var full_lg = gr.CalcTextWidth(tab[0], font);
				for(var m = i; m < fin; m+=2){
					full_lg += gr.CalcTextWidth(tab[m+1], font);
				};
				if(full_lg > w) full_lg = w;
				var delta_align = (w - full_lg);
				break;
			default:
				var delta_align = 0;
		};

		// if first part is default color
		if(pos > 0) { 
			txt = tab[0];
			lg = gr.CalcTextWidth(txt, font);
			gr.GdiDrawText(txt, font, color, x + delta_align + z, y, w-z, h, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
			z += lg;
		};

		// draw all other colored parts
		while(i < fin && z < w) {
			if(!force_default_color) {
				tmp = tab[i];
				color = eval("0xFF"+tmp.substr(4,2)+tmp.substr(2,2)+tmp.substr(0,2));
			};
			//color = RGB(parseInt(tmp.substr(0,2),16), parseInt(tmp.substr(2,2),16), parseInt(tmp.substr(4,2),16));
			txt = tab[i+1];
			lg = gr.CalcTextWidth(txt, font);
			gr.GdiDrawText(txt, font, color, x + delta_align + z, y, w-z, h, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
			z += lg;
			i += 2;
		};
	};
};

function DrawPolyStar(gr, x, y, out_radius, in_radius, points, line_thickness, line_color, fill_color, angle, opacity){
	// ---------------------
	// code by ExtremeHunter
	// ---------------------

	if(!opacity && opacity != 0) opacity = 255;

	//---> Create points
	var point_arr = [];
	for (var i = 0; i != points; i++) {
		i % 2 ? r = Math.round((out_radius-line_thickness*4)/2) / in_radius : r = Math.round((out_radius-line_thickness*4)/2);
		var x_point = Math.floor(r * Math.cos(Math.PI * i / points * 2 - Math.PI / 2));
		var y_point = Math.ceil(r * Math.sin(Math.PI * i / points * 2 - Math.PI / 2));
		point_arr.push(x_point + out_radius/2);
		point_arr.push(y_point + out_radius/2);
	};

	//---> Crate poligon image
	var img = gdi.CreateImage(out_radius, out_radius);
	var _gr = img.GetGraphics();
	_gr.SetSmoothingMode(2);
	_gr.FillPolygon(fill_color, 1, point_arr);
	if(line_thickness > 0)
	_gr.DrawPolygon(line_color, line_thickness, point_arr);
	img.ReleaseGraphics(_gr);

	//---> Draw image
	gr.DrawImage(img, x, y, out_radius, out_radius, 0, 0, out_radius, out_radius, angle, opacity);
};

function zoom(value, factor) {
	return Math.ceil(value * factor);
};
/*
function Syscolor(color_n) {
	var Shell = new ActiveXObject("WScript.Shell");
	var tempc;
	tempc = Shell.RegRead("HKEY_CURRENT_USER\\Control Panel\\Colors\\" + color_n).split(" ");
	return (0xff000000|(tempc[0]<<16)|(tempc[1]<<8)|(tempc[2]));
};

function get_system_dpi_percent() {
	// get windows version
	var wbemFlagReturnImmediately = 0x10;
	var wbemFlagForwardOnly = 0x20;
	var objWMIService = GetObject("winmgmts:\\\\.\\root\\CIMV2");
	var colItems = objWMIService.ExecQuery("SELECT * FROM Win32_OperatingSystem", "WQL", wbemFlagReturnImmediately | wbemFlagForwardOnly);
	var enumItems = new Enumerator(colItems);
	var objItem = enumItems.item();
	var version_number = 0;
	if(objItem.Caption.toUpperCase().indexOf("XP")!=-1) version_number = 5;
	if(objItem.Caption.toUpperCase().indexOf("VISTA")!=-1) version_number = 6;
	if(objItem.Caption.toUpperCase().indexOf("7")!=-1) version_number = 7;
	if(objItem.Caption.toUpperCase().indexOf("8")!=-1) version_number = 8;

	if(version_number==8) {
		var Shell = new ActiveXObject("WScript.Shell");
		var tmp;
		tmp = Shell.RegRead("HKEY_CURRENT_USER\\Control Panel\\Desktop\\Win8DpiScaling");
		if(tmp==1) {
			tmp = Shell.RegRead("HKEY_CURRENT_USER\\Control Panel\\Desktop\\WindowMetrics\\AppliedDPI");
		}; else {
			//tmp = 100;
			tmp = Shell.RegRead("HKEY_CURRENT_USER\\Control Panel\\Desktop\\WindowMetrics\\AppliedDPI");
			if(tmp < 100) tmp = 100;
		};
	}; else {
		tmp = 100;
	};
	//tmp = Math.ceil(tmp/10)*10;
	return tmp;
};
*/
function get_system_scrollbar_width() {
	var tmp = utils.GetSystemMetrics(SM_CXVSCROLL);
	return tmp;
};

function get_system_scrollbar_height() {
	var tmp = utils.GetSystemMetrics(SM_CYHSCROLL);
	return tmp;
};

String.prototype.repeat = function(num) {
	if(num>=0 && num<=5) {
		var g = Math.round(num);
	}; else {
		return "";
	};
	return new Array(g+1).join(this);
};

function cloneObject(obj) {
	var clone = {};
	for(var i in obj) {
		if(typeof(obj[i])=="object" && obj[i] != null)
			clone[i] = cloneObject(obj[i]);
		else
			clone[i] = obj[i];
	};
	return clone;
};

function compareObject(o1, o2){
	for(var p in o1){
		if(o1[p] != o2[p]) {
			return false;
		};
	};
	for(var p in o2){
		if(o1[p] != o2[p]) {
			return false;
		};
	};
	return true;
};

function getTimestamp() {
	var d, s1, s2, s3, hh, min, sec, timestamp;
	d = new Date();
	s1 = d.getFullYear();
	s2 = (d.getMonth() + 1);
	s3 = d.getDate();
	hh = d.getHours();
	min = d.getMinutes();
	sec = d.getSeconds();
	if(s3.length == 1) s3 = "0" + s3;
	timestamp = s1 + ((s2 < 10) ? "-0" : "-") + s2 + ((s3 < 10) ? "-0" : "-" ) + s3 + ((hh < 10) ? " 0" : " ") + hh + ((min < 10) ? ":0" : ":") + min + ((sec < 10) ? ":0" : ":") + sec;
	return timestamp;
};

function TimeFmt(t) {
	if (t < 0) return "00:00";
	var zpad = function(n) {
		var str = n.toString();
		return (str.length < 2) ? "0" + str : str;
		//return str;
	}
	if (t > 3600){
		var h = Math.floor(t / 3600);
		t -= h * 3600;
		m = Math.floor(t / 60);
		t -= m * 60, s = Math.floor(t);
		return h.toString() + "小时" + m.toString() + "分" + zpad(s) + "秒";	
	}
	else{
		m = Math.floor(t / 60);
		t -= m * 60, s = Math.floor(t);
		return m.toString() + "分" + zpad(s)+ "秒";	
	}
}

function Utf8Encode(string) {
	string = string.replace(/\r\n/g,"\n");
	var utftext = "";
	for (var n = 0; n < string.length; n++) {
		var c = string.charCodeAt(n);
		if (c < 128) {
			utftext += String.fromCharCode(c);
		}; else if((c > 127) && (c < 2048)) {
			utftext += String.fromCharCode((c >> 6) | 192);
			utftext += String.fromCharCode((c & 63) | 128);
		}; else {
			utftext += String.fromCharCode((c >> 12) | 224);
			utftext += String.fromCharCode(((c >> 6) & 63) | 128);
			utftext += String.fromCharCode((c & 63) | 128);
		};
	};
	return utftext;
};

function crc32(str) {
//  discuss at: http://phpjs.org/functions/crc32/
// original by: Webtoolkit.info (http://www.webtoolkit.info/)
// improved by: T0bsn
// depends on: utf8_encode
// example 1: crc32('Kevin van Zonneveld');
// returns 1: 1249991249

	str = Utf8Encode(str);
	var table =
	'00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D';

	var crc = 0;
	var x = 0;
	var y = 0;

	crc = crc ^ (-1);
	for (var i = 0, iTop = str.length; i < iTop; i++) {
		y = (crc ^ str.charCodeAt(i)) & 0xFF;
		x = '0x' + table.substr(y * 9, 8);
		crc = (crc >>> 8) ^ x;
	};

	return crc ^ (-1);
};
/* 
function RefreshBG() {
	if(fb.IsPlaying||fb.IsPaused) {
		fb.RunMainMenuCommand("Playback/Play or Pause");
		fb.RunMainMenuCommand("Playback/Play or Pause");
	}; else {
		fb.RunMainMenuCommand("Playback/Play");
		fb.Stop()
	};
};
*/
// --- UIHacks

MainMenuState = {
	Show: 0,
	Hide: 1,
	Auto: 2
};

FrameStyle = {
	Default: 0,
	SmallCaption: 1,
	NoCaption: 2,
	NoBorder: 3
};

MoveStyle = {
	Default: 0,
	Middle: 1,
	Left: 2,
	Both: 3
};

AeroEffect = {
	Default: 0,
	Disabled: 1,
	GlassFrame: 2,
	SheetOfGlass: 3
};

WindowState = {
	Normal: 0,
	Minimized: 1,
	Maximized: 2
};
