// Common functions & flags by Br3tt aka Falstaff (c)2013-2015
// ***********************************************************
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

// {{
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

//}}

//=================================================// Button object
ButtonStates = {normal: 0, hover: 1, down: 2};
button = function (normal, hover, down, tooltipText) {
	this.img = Array(normal, hover, down);
	this.w = this.img[1].Width;
	this.h = this.img[1].Height;
	if(tooltipText){
		this.Tooltip = window.CreateTooltip("", g_fsize);
		this.Tooltip.Text = tooltipText;
	}
	this.state = ButtonStates.normal;
	this.update = function (normal, hover, down, Tooltip) {
		this.img = Array(normal, hover, down);
		if(tooltipText)this.Tooltip.Text = Tooltip;
		this.w = this.img[1].Width;
		this.h = this.img[1].Height;
	};
	this.draw = function (gr, x, y, alpha) {
		this.x = x;
		this.y = y;
		this.img[this.state] && gr.DrawImage(this.img[this.state], this.x, this.y, this.w, this.h, 0, 0, this.w, this.h, 0, alpha);
	};

	this.repaint = function () {
		if(tooltipText)this.Tooltip.Deactivate();
		window.RepaintRect(this.x, this.y, this.w, this.h);
	};
	
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
			 this.state = this.ishover ? ButtonStates.hover : ButtonStates.normal;
			 break;
		 case "move":
			switch(this.state) {
			case ButtonStates.normal:
			case ButtonStates.hover:
				if(this.ishover){
					if(tooltipText)this.Tooltip.Activate();
					this.state = ButtonStates.hover
				} else{
					this.state = ButtonStates.normal;
					if (tooltipText && this.old != ButtonStates.normal){
						this.Tooltip.Deactivate();
						//window.SetCursor(32512);
					}
				}
				break;
			};
			break;
		 case "leave":
			if(tooltipText)this.Tooltip.Deactivate();
			//window.SetCursor(32512);
			this.state = this.isdown ? ButtonStates.down : ButtonStates.normal;
			break;
		};
		if(this.state!=this.old) this.repaint();
		return this.state;
	};
};

function get_system_scrollbar_width() {
	var tmp = utils.GetSystemMetrics(2);//2-SM_CXVSCROLL
	return tmp;
};

String.prototype.repeat = function(num) {
	if(num>=0 && num<=5) {
		var g = Math.round(num);
	} else {
		return "";
	};
	return new Array(g+1).join(this);
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
		} else if((c > 127) && (c < 2048)) {
			utftext += String.fromCharCode((c >> 6) | 192);
			utftext += String.fromCharCode((c & 63) | 128);
		} else {
			utftext += String.fromCharCode((c >> 12) | 224);
			utftext += String.fromCharCode(((c >> 6) & 63) | 128);
			utftext += String.fromCharCode((c & 63) | 128);
		};
	};
	return utftext;
};

var g_drop_effect = {
    none: 0,
    copy: 1,
    move: 2,
    link: 4,
    scroll: 0x80000000
};