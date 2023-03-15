// *****************************************************************************************************************************************
// Common functions & flags by Br3tt aka Falstaff (c)2013-2015
// *****************************************************************************************************************************************

//=================================================// General declarations
SM_CXVSCROLL = 2;
SM_CYHSCROLL = 3;

DLGC_WANTALLKEYS = 0x0004; /* Control wants all keys */
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
var lc_stringformat = StringFormat(StringAlignment.Near, StringAlignment.Centre);
var cc_stringformat = StringFormat(StringAlignment.Centre, StringAlignment.Centre);

//}}
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
button = function (normal, hover, down ,tooltipText) {
	this.img = Array(normal, hover, down);
	this.w = this.img[0].Width;
	this.h = this.img[0].Height;
	if(tooltipText){
		this.Tooltip = window.CreateTooltip("",g_fsize);
		this.Tooltip.Text = tooltipText;
	}
	this.state = ButtonStates.normal;
	this.update = function (normal, hover, down, Tooltip) {
		this.img = Array(normal, hover, down);
		if(tooltipText)this.Tooltip.Text = Tooltip;
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
		if(tooltipText)this.Tooltip.Deactivate();
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

var g_drop_effect = {
    none: 0,
    copy: 1,
    move: 2,
    link: 4,
    scroll: 0x80000000
};