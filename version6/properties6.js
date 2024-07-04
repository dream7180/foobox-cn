'use strict';
window.DefinePanel('Track properties', {author:'marc2003, dreamawake'});
include(fb.ProfilePath + 'foobox\\script\\js_common\\common.js');
window.DlgCode = DLGC_WANTALLKEYS;
let g_font, zdpi;
const IDC_ARROW = 32512;
const IDC_HAND = 32649;
let margin_L, margin_T, z12, sb_font, tooltip;
let showheader = window.GetProperty('List.show.header', false);
let _bmp = gdi.CreateImage(1, 1);
let _gr = _bmp.GetGraphics();

let lang_meta = {
	"TITLE" : "标题",
	"ALBUM" : "专辑",
	"ARTIST" : "艺术家",
	"ALBUM ARTIST" : "专辑艺术家",
	"TRACKNUMBER" : "音轨号",
	"DISCNUMBER" : "碟片编号",
	"DATE" : "日期",
	"RATING" : "等级",
	"GENRE" : "流派",
	"COMMENT" : "注释",
	"COMPOSER" : "作曲",
	"PERFORMER" : "指挥",
	"MOOD" : "喜爱",
	"TOTALTRACKS" : "合计音轨",
	"TOTALDISCS" : "合计碟片"
}

let lang_tech = {
	"bitrate" : "比特率",
	"bitspersample" : "采样比特",
	"channels" : "声道",
	"codec" : "编解码",
	"encoding" : "编码类型",
	"cue_embedded" : "内嵌 CUE",
	"samplerate" : "采样率",
	"tool" : "工具",
	"codec_profile" : "编解码配置",
	"tagtype" : "标签类型",
	"COMPOSER" : "作曲",
	"PERFORMER" : "指挥",
	"TOTALTRACKS" : "合计音轨"
}

//main
get_font();
let panel = new _panel();
let list = new _list();
panel.item_focus_change();

//callback function
function on_size() {
	panel.size();
	list.size();
}

function on_paint(gr) {
	panel.paint(gr);
	if(showheader){
		var line_w = Math.round(list.w/2);
		gr.GdiDrawText(list.header_text(), panel.fonts.title, panel.colours.text, margin_L, 0, panel.w - (margin_L * 2), margin_T, cc_txt);
		gr.FillGradRect(list.x, list.y + 1, line_w, 1, 0, panel.colours.background, panel.colours.line, 1.0);
		gr.FillGradRect(line_w, list.y + 1, line_w, 1, 0, panel.colours.line, panel.colours.background, 1.0);
		gr.FillSolidRect(line_w, list.y + 1, 1, 1, panel.colours.line);
	}
	list.paint(gr);
}

function on_metadb_changed() {
	list.metadb_changed();
}
function on_mouse_wheel(s) {
	list.wheel(s);
}

function on_mouse_move(x, y) {
	list.move(x, y);
}

function on_mouse_lbtn_up(x, y) {
	list.lbtn_up(x, y);
}

function on_mouse_rbtn_up(x, y) {
	return panel.rbtn_up(x, y, list);
}

function on_key_down(k) {
	list.key_down(k);
}

function on_colours_changed() {
	panel.colours_changed();
	window.Repaint();
}

function on_font_changed() {
	get_font();
	list.size();
	panel.font_changed();
	window.Repaint();
}

function on_item_focus_change() {
	panel.item_focus_change();
}

function on_playback_dynamic_info_track() {
	panel.item_focus_change();
}

function on_playback_new_track() {
	panel.item_focus_change();
}

function on_playback_stop(reason) {
	if (reason != 2) {
		panel.item_focus_change();
	}
}

function on_playlist_switch() {
	panel.item_focus_change();
}

function on_notify_data(name, info) {
	switch (name) {
	case "MetadataInfo":
		showheader = !info;
		window.SetProperty('List.show.header', showheader);
		list.size();
		window.Repaint();
		break;
	case "foobox_infoArt_followcursor":
		panel.selection.value = info * 1;
		panel.item_focus_change();
		break;
	case "color_scheme_updated":
		var c_hl_tmp = panel.colours.highlight;
		if(info) panel.colours.highlight = RGB(info[0], info[1], info[2]);
		else {
			panel.colours.highlight = panel.colours.hl_default;
			panel.colours.background = panel.colours.background_default;
		}
		if(panel.colours.highlight != c_hl_tmp){
			if(info){
				if(panel.dark_mode){
					if(info.length == 3) panel.colours.background = blendColors(panel.colours.background_default, RGB(info[0], info[1], info[2]), 0.24);
					else panel.colours.background = blendColors(panel.colours.background_default, RGB(info[3], info[4], info[5]), 0.24);
					panel.colours.line = blendColors(panel.colours.background, RGB(0,0,0), 0.45);
					panel.colours.tagtext = blendColors(panel.colours.background, panel.colours.text, 0.65);
				} else{
					if(panel.colours.background_default != 4294967295) {
						panel.colours.background = blendColors(panel.colours.background_default, RGB(info[0], info[1], info[2]), 0.24);
						panel.colours.line = blendColors(panel.colours.background, RGB(0,0,0), 0.3);
						panel.colours.tagtext = blendColors(panel.colours.background, panel.colours.text, 0.65);
					}
				}
			}
			window.Repaint();
		}
		break;
	}
}

function on_script_unload() {
	_tt('');
	if (_bmp) {
		_bmp.ReleaseGraphics(_gr);
	}
	_gr = null;
	_bmp = null;
}

function get_font() {
	g_font = window.GetFontDUI(FontTypeDUI.playlists);
	zdpi = g_font.Size / 12;
	margin_L = z(5);
	margin_T = z(20);
	z12 = z(12);
	sb_font = GdiFont('FontAwesome', margin_L*2, 0);
	tooltip = window.CreateTooltip(g_font.Name, g_font.Size);
	tooltip.SetMaxWidth(z(1200));
}

function _cc(name) {
	return utils.CheckComponent(name, true);
}

function _formatNumber(number, separator) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

function _p(a, b) {
		Object.defineProperty(this, typeof b == 'boolean' ? 'enabled' : 'value', {
		get() {
			return this.b;
		},
		set(value) {
			this.b = value;
			window.SetProperty(this.a, this.b);
		}
	});

	this.toggle = () => {
		this.b = !this.b;
		window.SetProperty(this.a, this.b);
	}

	this.a = a;
	this.b = window.GetProperty(a, b);
}

function _sb(t, v, fn) {
	this.paint = (gr, colour) => {
		if (this.v()) {
			gr.GdiDrawText(this.t, sb_font, colour, this.x, this.y, this.w, this.h, cc_txt);
		}
	}
	
	this.size = (x, y, w, h) => {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}
	
	this.trace = (x, y) => {
		return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h && this.v();
	}
	
	this.move = (x, y) => {
		if (this.trace(x, y)) {
			window.SetCursor(IDC_HAND);
			return true;
		} else {
			//window.SetCursor(IDC_ARROW);
			return false;
		}
	}
	
	this.lbtn_up = (x, y) => {
		if (this.trace(x, y)) {
			if (this.fn) {
				this.fn(x, y);
			}
			return true;
		} else {
			return false;
		}
	}
	
	this.t = t;
	this.v = v;
	this.fn = fn;
}

function _textWidth(value, font) {
	return _gr.CalcTextWidth(value, font);
}

function _toRGB(a) {
	const b = a - 0xFF000000;
	return [b >> 16, b >> 8 & 0xFF, b & 0xFF];
}

function _tt(value) {
	if (tooltip.Text != value) {
		tooltip.Text = value;
		tooltip.Activate();
	}
}

function getstr(langpack, name){
	var str = eval(langpack)[name];
	if(!str) str = name;
	return str;
}

function _panel() {
	this.item_focus_change = () => {
		if (this.selection.value == 0) {
			this.metadb = fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem();
		} else {
			this.metadb = fb.GetFocusItem();
		}
		on_metadb_changed();
		if (!this.metadb) {
			_tt('');
		}
	}
	
	this.colours_changed = () => {
		this.colours.background_default = window.GetColourDUI(ColorTypeDUI.background);
		this.colours.background = this.colours.background_default;
		this.dark_mode = isDarkMode(this.colours.background);
		this.colours.text = window.GetColourDUI(0);
		this.colours.line = blendColors(this.colours.background, RGB(0,0,0), this.dark_mode ? 0.45 : 0.3);
		this.colours.tagtext = blendColors(this.colours.background, this.colours.text, 0.65);
		this.colours.hl_default = window.GetColourDUI(ColorTypeDUI.highlight);
		this.colours.highlight = this.colours.hl_default;
	}
	
	this.font_changed = () => {
		let name, size;
		name = g_font.Name;
		size = g_font.Size;
		this.fonts.title = GdiFont(name, size + 1, 1);
		this.fonts.normal = GdiFont(name, size, 0);
		this.row_height = this.fonts.normal.Height;
		this.list_objects.forEach((item) => {
			item.size();
			item.update();
		});
	}
	
	this.size = () => {
		this.w = window.Width;
		this.h = window.Height;
	}
	
	this.paint = (gr) => {
		gr.FillSolidRect(0, 0, this.w, this.h, this.colours.background);
	}
	
	this.rbtn_up = (x, y, object) => {
		this.m = window.CreatePopupMenu();
		// panel 1-999
		// object 1000+
		if (object) {
			object.rbtn_up(x, y);
		}
		this.m.AppendMenuItem(MF_STRING, 112, '单击创建智能播放列表');
		this.m.CheckMenuItem(112, this.click_plfunc.enabled);
		const idx = this.m.TrackPopupMenu(x, y);
		switch (true) {
		case idx == 0:
			break;
		case idx == 112:
			this.click_plfunc.toggle();
			break;
		case idx > 999:
			if (object) {
				object.rbtn_up_done(idx);
			}
			break;
		}
		return true;
	}
	
	this.tf = (t) => {
		if (!this.metadb) {
			return '';
		}
		if (!this.tfo[t]) {
			this.tfo[t] = fb.TitleFormat(t);
		}
		const path = this.tfo['$if2(%__@%,%path%)'].EvalWithMetadb(this.metadb);
		if (fb.IsPlaying && (path.startsWith('http') || path.startsWith('mms'))) {
			return this.tfo[t].Eval();
		} else {
			return this.tfo[t].EvalWithMetadb(this.metadb);
		}
	}
	
	this.fonts = {};
	this.colours = {};
	this.w = 0;
	this.h = 0;
	this.metadb = fb.GetFocusItem();
	this.selection = new _p('Panel.Selection', 0);
	this.click_plfunc = new _p('Panel.click.autoplaylist', true);
	this.list_objects = [];
	this.tfo = {
		'$if2(%__@%,%path%)' : fb.TitleFormat('$if2(%__@%,%path%)')
	};
	this.font_changed();
	this.colours_changed();
}

function _list() {
	this.size = () => {
		this.index = 0;
		this.offset = 0;
		this.x = margin_L;
		this.y = margin_T*showheader;
		this.w = panel.w - (margin_L * 2);
		this.h = panel.h - margin_T * showheader;
		this.rows = Math.floor((this.h - z(24)) / panel.row_height);
		this.up_btn.size(this.x + Math.round((this.w - z12) / 2), this.y, z12, z12);
		this.down_btn.size(this.up_btn.x, this.y + this.h - z12, z12, z12);
	}
	
	this.paint = (gr) => {
		if (this.items == 0) {
			return;
		}
		this.text_width = this.w - this.text_x;
		for (let i = 0; i < Math.min(this.items, this.rows); i++) {
			gr.GdiDrawText(this.data[i + this.offset].name, panel.fonts.normal, panel.colours.tagtext, this.x, this.y + z12 + (i * panel.row_height), this.text_x - 10, panel.row_height, lc_txt);
			gr.GdiDrawText(this.data[i + this.offset].value, panel.fonts.normal, panel.colours.text, this.x + this.text_x, this.y + z12 + (i * panel.row_height), this.text_width, panel.row_height, lc_txt);
		}
		this.up_btn.paint(gr, panel.colours.text);
		this.down_btn.paint(gr, panel.colours.text);
	}
	
	this.metadb_changed = () => {
		if(!panel.metadb){
			this.artist = '';
			this.data = [];
			this.items = 0;
			window.Repaint();
		} else this.update();
	}
	
	this.playback_new_track = () => {
		panel.item_focus_change();
	}
	
	this.trace = (x, y) => {
		return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
	}
	
	this.wheel = (s) => {
		if (this.trace(this.mx, this.my)) {
			if (this.items > this.rows) {
				let offset = this.offset - (s * 3);
				if (offset < 0) {
					offset = 0;
				}
				if (offset + this.rows > this.items) {
					offset = this.items - this.rows;
				}
				if (this.offset != offset) {
					this.offset = offset;
					window.RepaintRect(this.x, this.y, this.w, this.h);
				}
			}
			return true;
		} else {
			return false;
		}
	}
	
	this.move = (x, y) => {
		this.mx = x;
		this.my = y;
		window.SetCursor(IDC_ARROW);
		if (this.trace(x, y)) {
			this.index = Math.floor((y - this.y - z12) / panel.row_height) + this.offset;
			this.in_range = this.index >= this.offset && this.index < this.offset + Math.min(this.rows, this.items);
			switch (true) {
			case this.up_btn.move(x, y):
			case this.down_btn.move(x, y):
				break;
			case !this.in_range:
				break;
			case x > this.x + this.text_x && x < this.x + this.text_x + Math.min(this.data[this.index].width, this.text_width):
				if(panel.click_plfunc.enabled) window.SetCursor(IDC_HAND);
				if (this.data[this.index].width > this.text_width) {
					_tt(this.data[this.index].value);
				} else _tt('');
				break;
			default:
				_tt('');
				break;
			}
			return true;
		} else {
			return false;
		}
	}
	
	this.lbtn_up = (x, y) => {
		if (this.trace(x, y)) {
			switch (true) {
			case this.up_btn.lbtn_up(x, y):
			case this.down_btn.lbtn_up(x, y):
			case !this.in_range:
				break;
			case !panel.click_plfunc.enabled:
				break;
			case x > this.x + this.text_x && x < this.x + this.text_x + Math.min(this.data[this.index].width, this.text_width):
				plman.CreateAutoPlaylist(plman.PlaylistCount, this.data[this.index].value, this.data[this.index].url);
				plman.ActivePlaylist = plman.PlaylistCount - 1;
				break;
			}
			return true;
		} else {
			return false;
		}
	}
	
	this.rbtn_up = (x, y) => {
		panel.m.AppendMenuItem(MF_STRING, 1300, '元数据');
		panel.m.CheckMenuItem(1300, this.properties.meta.enabled);
		panel.m.AppendMenuItem(MF_STRING, 1301, '位置');
		panel.m.CheckMenuItem(1301, this.properties.location.enabled);
		panel.m.AppendMenuItem(MF_STRING, 1302, '常规');
		panel.m.CheckMenuItem(1302, this.properties.tech.enabled);
		panel.m.AppendMenuItem(this.foo_playcount ? MF_STRING : MF_GRAYED, 1303, '播放统计信息');
		panel.m.CheckMenuItem(1303, this.foo_playcount && this.properties.playcount.enabled);
		panel.m.AppendMenuItem(MF_STRING, 1304, '播放增益');
		panel.m.CheckMenuItem(1304, this.properties.rg.enabled);
		panel.m.AppendMenuSeparator();
	}
	
	this.rbtn_up_done = (idx) => {
		switch (idx) {
		case 1300:
			this.properties.meta.toggle();
			panel.item_focus_change();
			break;
		case 1301:
			this.properties.location.toggle();
			panel.item_focus_change();
			break;
		case 1302:
			this.properties.tech.toggle();
			panel.item_focus_change();
			break;
		case 1303:
			this.properties.playcount.toggle();
			panel.item_focus_change();
			break;
		case 1304:
			this.properties.rg.toggle();
			panel.item_focus_change();
			break;
		}
	}
	
	this.key_down = (k) => {
		switch (k) {
		case VK_UP:
			this.wheel(1);
			return true;
		case VK_DOWN:
			this.wheel(-1);
			return true;
		default:
			return false;
		}
	}
	
	this.update = () => {
		this.data = [];
		this.spacer_w = _textWidth('0000', panel.fonts.normal);
		this.text_x = 0;
		this.filename = panel.metadb.Path;
		let fileinfo = panel.metadb.GetFileInfo();
		if (this.properties.meta.enabled) {
			this.add_meta(fileinfo);
		}
		if (this.properties.location.enabled) {
			this.add_location();
		}
		if (this.properties.tech.enabled) {
			this.add_tech(fileinfo);
		}
		if (this.custom_fields) {
			this.add_custom();
		}
		if (this.foo_playcount && this.properties.playcount.enabled) {
			this.add_playcount();
		}
		if (this.properties.rg.enabled) {
			this.add_rg();
		}
		this.data.pop();
		this.data.forEach((item) => {
			item.width = _textWidth(item.value, panel.fonts.normal);
			this.text_x = Math.max(this.text_x, _textWidth(item.name, panel.fonts.normal) + 20);
		});
		this.items = this.data.length;
		this.offset = 0;
		this.index = 0;
		window.Repaint();
	}

	this.header_text = () => {
		return panel.tf('%artist% - %title%');
	}
	
	this.reset = () => {
		this.items = 0;
		this.data = [];
		this.artist = '';
		panel.item_focus_change();
	}
	
	this.init = () => {
		this.add_meta = (f) => {
			for (let i = 0; i < f.MetaCount; i++) {
				let name = f.MetaName(i);
				let num = f.MetaValueCount(i);
				for (let j = 0; j < num; j++) {
					let url, _add = true;
					let value = f.MetaValue(i, j).replace(/\s{2,}/g, ' ');
					let _name = name.toUpperCase();
					if(_name.indexOf('LYRICS') > -1) _add = false;
					if(_name.startsWith('MUSICBRAINZ')) _add = false;
					url = name.toLowerCase() + (num == 1 ? ' IS ' : ' HAS ') + '\"' + value + '\"';
					if(_add){
						this.data.push({
							name : getstr("lang_meta", _name),
							value : value,
							url : url
						});
					}
				}
			}
			if (this.data.length) { // only add blank line if there is some metadata
				this.add();
			}
		}
			
		this.add_location = () => {
			let names = ['文件名', '文件夹名', '文件路径', '子曲目索引', '文件大小', '修改日期'];
			let values = [panel.tf('%filename_ext%'), panel.tf('$directory_path(%path%)'), this.filename, panel.metadb.SubSong, panel.tf('[%filesize_natural%]'), panel.tf('[%last_modified%]')];
			let urls = ['%filename_ext% IS ', '"$directory_path(%path%)" IS ', '%path% IS ', '%subsong% IS ', '%filesize_natural% IS ', '%last_modified% IS '];
			for (let i = 0; i < 6; i++) {
				this.data.push({
					name : names[i],
					value : values[i],
					url : urls[i] + '\"' + values[i] + '\"'
				});
			}
			this.add();
		}
			
		this.add_tech = (f) => {
			const duration = utils.FormatDuration(Math.max(0, panel.metadb.Length));
			const samples = _formatNumber(panel.tf('%length_samples%'), ' ');
			this.data.push({
				name : '持续时间',
				value : duration + ' (' + samples + ' samples)',
				url : '%length% IS ' + duration
			});
			let tmp = [];
			for (let i = 0; i < f.InfoCount; i++) {
				const name = f.InfoName(i);
				let _name = name.toLowerCase();
				const value = f.InfoValue(i).replace(/\s{2,}/g, ' ');
				if(name != "md5"){
					tmp.push({
						name : getstr("lang_tech", _name),
						value : value,
						url : '%__' + _name + '% IS ' + value
					});
				}
			}
			this.data = [...this.data, ...tmp];
			this.add();
		}
			
		this.add_custom = () => {
			this.add(this.custom_fields);
			this.add();
		}
			
		this.add_playcount = () => {
			this.add(['PLAY_COUNT', 'FIRST_PLAYED', 'LAST_PLAYED', 'ADDED', 'RATING']);
			this.add();
		}

		this.add_rg = () => {
			this.add(['REPLAYGAIN_ALBUM_GAIN', 'REPLAYGAIN_ALBUM_PEAK', 'REPLAYGAIN_TRACK_GAIN', 'REPLAYGAIN_TRACK_PEAK']);
			this.add();
		}
		
		this.add = (names) => {
			if (names) {
				let _names = [];
				if(names[0] == "PLAY_COUNT") _names = ['已播放', '首次播放于', '最后播放于', '添加日期', '等级'];
				else _names = ['专辑增益', '专辑峰值', '音轨增益', '音轨峰值'];
				names.forEach((item, i) => {
					this.data.push({name : _names[i], value : panel.tf('[%' + item + '%]'), url : '%' + item + '% IS ' + panel.tf('[%' + item + '%]')});
				});
			} else {
				this.data.push({name : '', value : '', url : ''});
			}
		}
			
		this.properties = {
			meta : new _p('List.properties.meta', true),
			location : new _p('List.properties.location', true),
			tech : new _p('List.properties.tech', true),
			playcount : new _p('List.properties.playcount', true),
			rg : new _p('List.properties.rg', false)
		};
	
		this.foo_playcount = _cc('foo_playcount');
	}
	
	panel.list_objects.push(this);
	this.mx = 0;
	this.my = 0;
	this.index = 0;
	this.offset = 0;
	this.items = 0;
	this.text_x = 0;
	this.spacer_w = 0;
	this.artist = '';
	this.filename = '';
	this.up_btn = new _sb('\uF077', () => { return this.offset > 0; }, () => { this.wheel(1); });
	this.down_btn = new _sb('\uF078', () => { return this.offset < this.items - this.rows; }, () => { this.wheel(-1); });
	this.init();
}
