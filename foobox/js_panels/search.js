//by Asion, mod for foobox https://github.com/dream7180
ppts = {
	source: window.GetProperty("Search Source", 1),
	autosearch: window.GetProperty("Search Box: Auto-validation", false),
	scope: window.GetProperty("Search Box: Scope", 0),
	multiple: window.GetProperty("Search Box: Keep Playlist", true),
	historymaxitems: 10,
	historytext: window.GetProperty("Search Box: Search History", ""),
	showreset: window.GetProperty("Search Box: Always Show Reset Button", false),
	webkqtradioarr: "",
};

//=================================================// 定义变量
var fso = new ActiveXObject("Scripting.FileSystemObject");
var xmlHttp = new ActiveXObject("Msxml2.XMLHTTP.6.0"),
xmlHttp2 = new ActiveXObject("Msxml2.XMLHTTP.6.0");
var debug = false;
var oldsearch = oldpid = 0;
var SearchListName, cachefile;
var qtfm_arr = fb.ProfilePath + "\\cache\\qtfm.arr";
if (fso.FileExists(qtfm_arr))
	ppts.webkqtradioarr = utils.ReadTextFile(qtfm_arr).split("|");
//=================================================// 搜索框
var g_searchbox = null;
searchbox = function() {
	var temp_bmp = gdi.CreateImage(1, 1);
	var temp_gr = temp_bmp.GetGraphics();
	var g_timer_cursor = false;
	var g_cursor_state = true;
	clipboard = {
		text: null
	};
	this.images = {
		resetIcon_off: null,
		resetIcon_ov: null,
		loupe_off: null,
		loupe_ov: null
	}

	this.repaint = function() {
		window.RepaintRect(this.x, this.y, this.w, this.h);
	}

	this.getImages = function() {
		var gb;
		var x2 = 2 * zdpi, x4 = 4 * zdpi, x5 = 5 * zdpi, x11 = 11 * zdpi, x12 = 12 * zdpi, 
			x14 = Math.ceil(14 * zdpi), x17 = 17 * zdpi, x18 = Math.ceil(18 * zdpi);

		this.images.resetIcon_off = gdi.CreateImage(x18, x18);
		gb = this.images.resetIcon_off.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawLine(x5, x5, x12, x12, 1, g_color_normal_txt);
		gb.DrawLine(x5, x12, x12, x5, 1, g_color_normal_txt);
		gb.SetSmoothingMode(0);
		this.images.resetIcon_off.ReleaseGraphics(gb);

		this.images.resetIcon_ov = gdi.CreateImage(x18, x18);
		gb = this.images.resetIcon_ov.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillEllipse(0, 0, x17, x17, g_color_bt_overlay);
		gb.DrawLine(x5, x5, x12, x12, 1, g_color_normal_txt);
		gb.DrawLine(x5, x12, x12, x5, 1, g_color_normal_txt);
		gb.SetSmoothingMode(0);
		this.images.resetIcon_ov.ReleaseGraphics(gb);

		this.reset_bt = new button(this.images.resetIcon_off, this.images.resetIcon_ov, this.images.resetIcon_ov);

		this.images.source_switch = gdi.CreateImage(Math.ceil(20 * zdpi), x18);
		gb = this.images.source_switch.GetGraphics();
		this.images.source_switch.ReleaseGraphics(gb);
		
		this.images.source_switch_ov = gdi.CreateImage(Math.ceil(20 * zdpi), x18);
		gb = this.images.source_switch_ov.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillRoundRect(zdpi, zdpi, z(18), z(16), x2, x2, g_color_bt_overlay);
		this.images.source_switch_ov.ReleaseGraphics(gb);
		
		this.images.source_pl = gdi.CreateImage(x14, x14);
		gb = this.images.source_pl.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(x2, x2, x2, x2, 1, g_color_normal_txt);
		gb.DrawEllipse(x2, 6*zdpi, x2, x2, 1, g_color_normal_txt);
		gb.DrawEllipse(x2, 10*zdpi, x2, x2, 1, g_color_normal_txt);
		
		gb.SetSmoothingMode(0);
		gb.DrawLine(6*zdpi, 3*zdpi, x12, 3*zdpi, 1, g_color_normal_txt);
		gb.DrawLine(6*zdpi, 7*zdpi, x12, 7*zdpi, 1, g_color_normal_txt);
		gb.DrawLine(6*zdpi, x11, x12, x11, 1, g_color_normal_txt);
		this.images.source_pl.ReleaseGraphics(gb);
		
		var img_arc = gdi.CreateImage(x14, x14);
		gb = img_arc.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(0, -3*zdpi, x11, x5, 1, g_color_normal_txt);
		gb.SetSmoothingMode(0);
		img_arc.ReleaseGraphics(gb);
		
		this.images.source_lib = gdi.CreateImage(x14, x14);
		gb = this.images.source_lib.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(0, x2, x11, x5, 1, g_color_normal_txt);
		gb.DrawImage(img_arc, 0, 8*zdpi, x14, zoom(8,zdpi), 0, 0, x14, zoom(8,zdpi), 0, 255);
		gb.DrawImage(img_arc, 0, x11, x14, zoom(8,zdpi), 0, 0, x14, zoom(8,zdpi), 0, 255);
		gb.DrawLine(0, x4, 0, x11, 1, g_color_normal_txt);
		gb.DrawLine(x11, x4, x11, x11, 1, g_color_normal_txt);
		gb.SetSmoothingMode(0);
		this.images.source_lib.ReleaseGraphics(gb);
		this.menu_btn = new button(this.images.source_switch, this.images.source_switch_ov, this.images.source_switch_ov, "");
		this.src_btn = new button(this.images.source_switch, this.images.source_switch, this.images.source_switch, "");
		
		this.images.ico_menu = gdi.CreateImage(x14, x14);
		gb = this.images.ico_menu.GetGraphics();
		var point_arr = new Array(3*zdpi,Math.floor(5*zdpi),11*zdpi,Math.floor(5*zdpi),7*zdpi,10*zdpi);
		gb.SetSmoothingMode(2);
		gb.DrawPolygon(g_color_normal_txt,1,point_arr);
		gb.SetSmoothingMode(0);
		this.images.ico_menu.ReleaseGraphics(gb);
		
	}
	this.getImages();

	this.setSize = function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.inputbox.setSize(this.w - 45 * zdpi, this.h - 4);
	};

	this.on_init = function() {
		this.inputbox = new oInputbox(0, 0, "", (ppts.source == 1) ? "搜索当前列表" : "搜索媒体库", g_color_normal_txt, 0, 0, g_color_selected_bg, g_onSearch, "g_searchbox");
		this.inputbox.autovalidation = (ppts.source > 1) ? false : ppts.autosearch;
	}

	this.reset_colors = function() {
		this.inputbox.textcolor = g_color_normal_txt;
		this.inputbox.backselectioncolor = g_color_selected_bg;
	};

	this.draw = function(gr) {
		// 绘制搜索框背景
		this.menu_btn.draw(gr, Math.round(ww - this.images.ico_menu.Width - cScrollBar.width - 2*zdpi), Math.round(this.y + 2 * zdpi), 255);
		this.src_btn.draw(gr, this.x + 4 - 2*zdpi, Math.round(this.y + zdpi), 255);
		this.inputbox.draw(gr, this.x + this.images.source_pl.Width + 10, this.y + 2, 0, 0);
		if(ppts.source == 1){
			var src_img = this.images.source_pl;
		}else{
			var src_img = this.images.source_lib;
		}
		if ((this.inputbox.text.length > 0 || ppts.showreset) && this.inputbox.edit) this.reset_bt.draw(gr, this.x + this.inputbox.w + 22 * zdpi, this.y + 3 * zdpi, 255);
		gr.DrawImage(src_img, this.x + 5, Math.round(this.y + 3 * zdpi), src_img.Width, src_img.Height, 0, 0, src_img.Width, src_img.Height, 0, 255);
		gr.DrawImage(this.images.ico_menu, Math.round(ww - this.images.ico_menu.Width - cScrollBar.width + zdpi), Math.round(this.y + 3 * zdpi + 1), this.images.ico_menu.Width, this.images.ico_menu.Height, 0, 0, this.images.ico_menu.Width, this.images.ico_menu.Height, 0, 255);
	}

	this.historylist = Array();

	this.searchExist = function(search_item) {
		for (var i = 0; i < this.historylist.length; i++) {
			if (this.historylist[i][0] == search_item) return true;
		}
		return false;
	};

	this.historyadd = function(search_item, datetime) {
		if (!this.searchExist(search_item)) {
			var currentdate = new Date();
			datetime = typeof datetime !== 'undefined' ? datetime : currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getFullYear() + " @ " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
			this.historylist[this.historylist.length] = Array(search_item, datetime);
			if (this.historylist.length > ppts.historymaxitems) this.historylist.shift();
			return true;
		}
		return false;
	};

	this.historyreset = function() {
		this.historylist = Array();
		window.SetProperty("Search Box: Search History", "")
	}

	this.save_searchhistory = function(argSearchHistory) {
		var SearchHistory = "";
		if (argSearchHistory.length > 0) {
			try {
				for (var i = 0; i < argSearchHistory.length; i++) {
					if (i > 0) SearchHistory += " $$ ";
					SearchHistory += argSearchHistory[i][0] + " ## " + argSearchHistory[i][1];
					if (i == ppts.historymaxitems) break;
				}
				window.SetProperty("Search Box: Search History", SearchHistory)
			} catch (e) {}
		}
	}

	this.get_searchhistory = function() {
		if (ppts.historytext.length > 0) {
			historytext = ppts.historytext.split(" $$ ");
			try {
				for (var i = 0; i < historytext.length; i++) {
					arguments = historytext[i].split(" ## ");
					this.historyadd(arguments[0], arguments[1]);
				}
			} catch (e) {}
		}
		return this.historylist;
	}

	this.historylist = this.get_searchhistory();
	
	this.on_mouse = function(event, x, y, delta) {
		switch (event) {
		case "lbtn_down":
			//this.src_switch.checkstate("down", x, y);
			if (this.menu_btn.checkstate("down", x, y) == ButtonStates.down) {
				this.buttonClicked = true;
				this.menu_btn.state = ButtonStates.hover;
			};
			this.inputbox.check("down", x, y);
			if (this.inputbox.text.length > 0 || ppts.showreset) this.reset_bt.checkstate("down", x, y);
			break;
		case "lbtn_up":
			if (this.buttonClicked && this.menu_btn.checkstate("up", x, y) == ButtonStates.hover) {
				Show_Menu_Searchbox(Math.round(ww - this.images.ico_menu.Width - cScrollBar.width - 2*zdpi),  Math.round(cSearchBox.y + cSearchBox.h - 2*zdpi));
				this.menu_btn.state = ButtonStates.normal;
				this.menu_btn.repaint();
			}
			this.buttonClicked = false;
			if (this.src_btn.checkstate("up", x, y) == ButtonStates.hover) {
				ppts.source = 3 - ppts.source;
				if (ppts.source > 2 || ppts.source < 1) ppts.source = 1;
				window.SetProperty("Search Source", ppts.source);
				this.inputbox.autovalidation = (ppts.source > 1) ? false : ppts.autosearch;
				this.inputbox.empty_text = (ppts.source == 1) ? "搜索当前列表" : "搜索媒体库";
				this.repaint();
			}
			this.inputbox.check("up", x, y);
			if (this.inputbox.text.length > 0 || ppts.showreset) {
				if (this.reset_bt.checkstate("up", x, y) == ButtonStates.hover) {
					this.inputbox.text = "";
					this.inputbox.offset = 0;
					g_onSearch();
					this.reset_bt.state = ButtonStates.normal;
					this.repaint();
				}
			}
			break;
		case "lbtn_dblclk":
			this.inputbox.check("dblclk", x, y);
			break;
		case "rbtn_down":
			this.inputbox.check("right", x, y);
			break;
		case "move":
			this.inputbox.check("move", x, y);
			this.menu_btn.checkstate("move", x, y);
			if (!this.inputbox.hover && (this.inputbox.text.length > 0 || ppts.showreset)) this.reset_bt.checkstate("move", x, y);
			break;
		case "leave":
			this.inputbox.check("leave", 0, 0);
			this.reset_bt.checkstate("leave", 0, 0);
		}
	}

	this.on_key = function(event, vkey) {
		switch (event) {
		case "down":
			this.inputbox.on_key_down(vkey);
			break;
		}
	}

	this.on_char = function(code) {
		this.inputbox.on_char(code);
	}

	this.on_focus = function(is_focused) {
		this.inputbox.on_focus(is_focused);
	}
}

function g_onSearch() {
	var s1 = g_searchbox.inputbox.text;
	var s2 = s1.toLowerCase();
	var pl_to_remove = new Array;

	// 空文本直接返回
	if (s2.length <= 0) return true;
	// 保存搜索记录
	g_searchbox.historyadd(s1);
	g_searchbox.save_searchhistory(g_searchbox.historylist);

	if (ppts.source == 1) {

		var handle_list = plman.GetPlaylistItems(plman.ActivePlaylist);
		var count = handle_list.Count;
		var pid = -1;
		var tf_artist = fb.TitleFormat("%artist%");
		var tf_album = fb.TitleFormat("%album%");
		var tf_title = fb.TitleFormat("%title%");
		var tf_genre = fb.TitleFormat("%genre%");
		var tf_date = fb.TitleFormat("%date%");
		var tf_comment = fb.TitleFormat("%comment%");
		var start = 0;

		if (oldsearch == s2) {
			start = oldpid;
		} else {
			oldsearch = s2;
			oldpid = 0;
		}

		for (var i = start; i < count; i++) {
			if ((ppts.scope == 0 || ppts.scope == 1) && tf_artist.EvalWithMetadb(handle_list[i]).toLowerCase().search(s2) > -1) {
				pid = i;
				(i == count - 1) ? oldpid = 0 : oldpid = i + 1;
				break;
			};
			if ((ppts.scope == 0 || ppts.scope == 2) && tf_title.EvalWithMetadb(handle_list[i]).toLowerCase().search(s2) > -1) {
				pid = i;
				(i == count - 1) ? oldpid = 0 : oldpid = i + 1;
				break;
			};
			if ((ppts.scope == 0 || ppts.scope == 3) && tf_album.EvalWithMetadb(handle_list[i]).toLowerCase().search(s2) > -1) {
				pid = i;
				(i == count - 1) ? oldpid = 0 : oldpid = i + 1;
				break;
			};
			if ((ppts.scope == 0 || ppts.scope == 4) && tf_genre.EvalWithMetadb(handle_list[i]).toLowerCase().search(s2) > -1) {
				pid = i;
				(i == count - 1) ? oldpid = 0 : oldpid = i + 1;
				break;
			};
			if ((ppts.scope == 0 || ppts.scope == 5) && tf_date.EvalWithMetadb(handle_list[i]).toLowerCase().search(s2) > -1) {
				pid = i;
				(i == count - 1) ? oldpid = 0 : oldpid = i + 1;
				break;
			};
			if (ppts.scope == 6 && tf_comment.EvalWithMetadb(handle_list[i]).toLowerCase().search(s2) > -1) {
				pid = i;
				(i == count - 1) ? oldpid = 0 : oldpid = i + 1;
				break;
			};
			if (i == count - 1) {
				oldpid = 0;
			}
		}

		// 找到后选定项目
		if (pid >= 0) {
			var focusedTrackId = pid;
			plman.ClearPlaylistSelection(plman.ActivePlaylist);
			plman.SetPlaylistSelectionSingle(plman.ActivePlaylist, focusedTrackId, true);
			plman.SetPlaylistFocusItem(plman.ActivePlaylist, focusedTrackId);
		};

	} else{
		// 搜索列表索引
		var isFound = false;
		var total = plman.PlaylistCount;
		for (var i = 0; i < total; i++) {
			if (plman.GetPlaylistName(i).substr(0, 4) == "搜索 |") {
				if (!ppts.multiple) {
					if (!isFound) {
						var plIndex = i;
						isFound = true;
					};
					pl_to_remove.push(i);
				}
			}
		}

		if (isFound && !ppts.multiple) {
			var r = pl_to_remove.length - 1;
			while (r >= 0) {
				plman.RemovePlaylist(pl_to_remove[r]);
				r--;
			}
			plIndex = plman.PlaylistCount;
		} else {
			plIndex = total;
		}

		var scopecases = {
			0: "",
			1: "%artist% HAS ",
			2: "%album% HAS ",
			3: "%title% HAS ",
			4: "%genre% HAS ",
			5: "%date% HAS ",
			6: "%comment% HAS "
		};
		if (scopecases[ppts.scope]) {
			plman.CreateAutoPlaylist(plIndex, "搜索 | " + s1, scopecases[ppts.scope] + s1, "", 0);
		} else {
			plman.CreateAutoPlaylist(plIndex, "搜索 | " + s1, scopecases[1]+s1 + " OR " + scopecases[2]+s1 + " OR " + scopecases[3]+s1 + " OR " + scopecases[4]+s1 + " OR " + scopecases[5]+s1, "", 0);
		};

		// 转换自动列表为普通列表
		//plman.DuplicatePlaylist(plIndex, "搜索 [" + s1 + "]");
		//plman.RemovePlaylist(plIndex);
		plman.ActivePlaylist = plIndex;
	}
}

//=================================================// 搜索框菜单

function Show_Menu_Searchbox(x, y) {
	var idx;

	var _menu = window.CreatePopupMenu();
	
	_menu.AppendMenuItem(MF_STRING, 21, "列表中搜索");
	_menu.AppendMenuItem(MF_STRING, 22, "媒体库搜索");
	_menu.CheckMenuRadioItem(21, 22, ppts.source + 20);
	_menu.AppendMenuSeparator();
	var WebQTRadioMenu = window.CreatePopupMenu();
	if(ppts.webkqtradioarr.length > 1){
		for (var k = 0; k < ppts.webkqtradioarr.length; k++) {
			WebQTRadioMenu.AppendMenuItem(MF_STRING, 501+k, ppts.webkqtradioarr[k].split(":")[0]);
		}
		WebQTRadioMenu.AppendMenuSeparator();
	}
	WebQTRadioMenu.AppendMenuItem(MF_STRING, 500, "更新蜻蜓FM菜单");
	WebQTRadioMenu.AppendTo(_menu, MF_STRING, "蜻蜓FM");
	_menu.AppendMenuSeparator();
	
	var SearchHistoryMenu = window.CreatePopupMenu();

	for (var i = g_searchbox.historylist.length - 1; i >= 0; i--) {
		SearchHistoryMenu.AppendMenuItem(MF_STRING, i + 51, g_searchbox.historylist[i][0].replace("&", "&&"));
	}
	if (g_searchbox.historylist.length == 0) {
		SearchHistoryMenu.AppendMenuItem(MF_GRAYED, 40, "无记录");
	} else {
		SearchHistoryMenu.AppendMenuSeparator();
		SearchHistoryMenu.AppendMenuItem(MF_STRING, ppts.historymaxitems + 60, "清除记录");
	}

	SearchHistoryMenu.AppendTo(_menu, MF_STRING, "搜索记录");

	if (ppts.source == 1) {
		_menu.AppendMenuItem(MF_STRING, 1, "启用自动搜索");
		_menu.CheckMenuItem(1, ppts.autosearch ? 1 : 0);
		_menu.AppendMenuItem(MF_SEPARATOR, 0, "");
		_menu.AppendMenuItem(MF_STRING, 2, "搜索:智能");
		_menu.AppendMenuItem(MF_STRING, 3, "搜索:艺术家");
		_menu.AppendMenuItem(MF_STRING, 4, "搜索:专辑");
		_menu.AppendMenuItem(MF_STRING, 5, "搜索:标题");
		_menu.AppendMenuItem(MF_STRING, 6, "搜索:流派");
		_menu.AppendMenuItem(MF_STRING, 7, "搜索:日期");
		_menu.AppendMenuItem(MF_SEPARATOR, 0, "");
		_menu.AppendMenuItem(MF_STRING, 8, "搜索:注释");
		_menu.CheckMenuRadioItem(2, 8, ppts.scope + 2);

	} else if (ppts.source == 2) {
		var now_playing_track = fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem();
		var quickSearchMenu = window.CreatePopupMenu();
		quickSearchMenu.AppendMenuItem(MF_STRING, 36, "相同艺术家");
		quickSearchMenu.AppendMenuItem(MF_STRING, 37, "相同专辑");
		quickSearchMenu.AppendMenuItem(MF_STRING, 38, "相同流派");
		quickSearchMenu.AppendMenuItem(MF_STRING, 39, "相同日期");
		quickSearchMenu.AppendTo(_menu, MF_STRING, "快速搜索...");
		_menu.AppendMenuItem(MF_STRING, 9, "保留之前的搜索列表");
		_menu.CheckMenuItem(9, ppts.multiple ? 1 : 0);
		_menu.AppendMenuItem(MF_SEPARATOR, 0, "");
		_menu.AppendMenuItem(MF_STRING, 2, "搜索:智能");
		_menu.AppendMenuItem(MF_STRING, 3, "搜索:艺术家");
		_menu.AppendMenuItem(MF_STRING, 4, "搜索:专辑");
		_menu.AppendMenuItem(MF_STRING, 5, "搜索:标题");
		_menu.AppendMenuItem(MF_STRING, 6, "搜索:流派");
		_menu.AppendMenuItem(MF_STRING, 7, "搜索:日期");
		_menu.AppendMenuItem(MF_SEPARATOR, 0, "");
		_menu.AppendMenuItem(MF_STRING, 8, "搜索:注释");
		_menu.CheckMenuRadioItem(2, 8, ppts.scope + 2);
	}

	idx = _menu.TrackPopupMenu(x, y);
	switch (true) {
	case (idx == 1):
		ppts.autosearch = !ppts.autosearch;
		g_searchbox.inputbox.autovalidation = ppts.autosearch;
		window.SetProperty("Search Box: Auto-validation", ppts.autosearch);
		break;
	case (idx >= 2 && idx <= 8):
		ppts.scope = idx - 2;
		window.SetProperty("Search Box: Scope", ppts.scope);
		break;
	case (idx == 9):
		ppts.multiple = !ppts.multiple;
		window.SetProperty("Search Box: Keep Playlist", ppts.multiple);
		break;

	case (idx >= 21 && idx <= 22):
		window.SetProperty("Search Source", ppts.source = idx - 20);
		g_searchbox.inputbox.autovalidation = (ppts.source > 1) ? false : ppts.autosearch;
		g_searchbox.inputbox.empty_text = (ppts.source == 1) ? "搜索当前列表" : "搜索媒体库";;
		g_searchbox.repaint();
		break;
	case (idx == 36):
		quickSearch(now_playing_track, "artist");
		break;
	case (idx == 37):
		quickSearch(now_playing_track, "album");
		break;
	case (idx == 38):
		quickSearch(now_playing_track, "genre");
		break;
	case (idx == 39):
		quickSearch(now_playing_track, "date");
		break;
	case (idx >= 51 && idx <= ppts.historymaxitems + 51):
		g_searchbox.inputbox.text = g_searchbox.historylist[idx - 51][0];
		g_searchbox.on_char();
		g_searchbox.repaint();
		break;
	case (idx == ppts.historymaxitems + 60):
		g_searchbox.historyreset();
		break;
	case (idx == 500):
		GetQTFMRadiolist();
		break;
	case ((idx >= 501 && idx <= 501+ppts.webkqtradioarr.length)):
		QTFMRadiolist(ppts.webkqtradioarr[idx-501].split(";"),ppts.webkqtradioarr[idx-501].split(":")[0]);
		break;
	}
}

//=================================================// 快速搜索

function quickSearch(metadb, search_function) {
	var playlist_index = -1;
	for (i = 0; i < plman.PlaylistCount; i++) {
		if (plman.GetPlaylistName(i) == "搜索结果") {
			playlist_index = i;
			break;
		}
	}
	if (playlist_index < 0) {
		plman.CreatePlaylist(plman.PlaylistCount, "搜索结果");
		playlist_index = plman.PlaylistCount - 1
	}
	plman.ActivePlaylist = playlist_index;
	plman.ClearPlaylist(playlist_index);


	var album_items = str = "";
	var tfo = fb.TitleFormat("%album artist%|%date%|%album%|%discnumber%|%tracknumber%");

	switch (search_function) {
	case 'artist':
		str = fb.TitleFormat("%artist%").EvalWithMetadb(metadb);
		album_items = fb.GetQueryItems(fb.GetLibraryItems(), "%artist% IS " + trimstr(str));
		break;
	case 'album':
		str = fb.TitleFormat("%album%").EvalWithMetadb(metadb);
		album_items = fb.GetQueryItems(fb.GetLibraryItems(), "%album% IS " + trimstr(str));
		break;
	case 'genre':
		str = fb.TitleFormat("%genre%").EvalWithMetadb(metadb);
		album_items = fb.GetQueryItems(fb.GetLibraryItems(), "%genre% IS " + trimstr(str));
		break;
	case 'date':
		str = fb.TitleFormat("%date%").EvalWithMetadb(metadb);
		album_items = fb.GetQueryItems(fb.GetLibraryItems(), "%date% IS " + trimstr(str));
		break;
	}
	album_items.OrderByFormat(tfo, 1);
	plman.InsertPlaylistItems(playlist_index, 0, album_items);
}

function trimstr(str) {
	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

//=================================================// 蜻蜓FM

function GetQTFMRadiolist(){
	g_searchbox.inputbox.edit = false;
	SetBoxText("正在更新电台菜单...");
	var qtlistid = "";
	var listid = "";
	var ret = {
		id: [433,442,429,439,432,441,430,431,440,438,435,436,434],
		title: ["资讯台","音乐台","交通台","经济台","文艺台","都市台","体育台","双语台","综合台","生活台","旅游台","曲艺台","方言台"],
		count:[300,300,300,100,100,100,20,20,500,100,50,20,50]
	};
	var c = ret.id.length;
	var l = 0;
	url = "http://rapi.qingting.fm/categories/" + ret.id[l] + "/channels?page=1&pagesize="+ret.count[l];
	try{
		xmlHttp2.open("GET", url, true);
		xmlHttp2.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
		xmlHttp2.send(null);
		xmlHttp2.onreadystatechange = function() {
			if (xmlHttp2.readyState == 4) {
				if (xmlHttp2.status == 200) {
					var ret1 = json(xmlHttp2.responseText)["Data"];
					listid = ret.title[l] + ": g;";
					if(ret1 != null){
						for (var k = 0; k < ret1.length; k++) {
							listid += ret1[k].title + ":" + ret1[k].content_id + ";"
						}
						if(listid.charAt(listid.length-1) == ";") qtlistid += listid.slice(0,listid.length-1) + "|";
						if(l+1==c) {
							try {fso.DeleteFile(qtfm_arr);}catch(e) {};
							qtlistid = qtlistid.slice(0,qtlistid.length-1);
							SaveAs(qtlistid, qtfm_arr);
							ppts.webkqtradioarr = qtlistid.split("|");
						};
					}
				}
				l++;
				if (l < c){
					var URL_Timer = window.SetTimeout(function () {
						url = "http://rapi.qingting.fm/categories/" + ret.id[l] + "/channels?page=1&pagesize="+ret.count[l];
						xmlHttp2.open("GET", url, true);
						xmlHttp2.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
						xmlHttp2.send(null);
						URL_Timer && window.ClearTimeout(URL_Timer);
					}, 5);
				}
			}
		}
		UpdateDone("电台更新成功!");
	} catch(e) {
		console.log("更新失败");
		return;
	}
}

function QTFMRadiolist(id, listname){
	g_searchbox.inputbox.edit = false;
	SetBoxText("正在获取电台列表...");
	cachefile = fb.ProfilePath + "\\cache\\" + listname + ".asx";
	try {
		var filedata = '<asx version="3.0">\r\n\r\n';
		for (var i = 1; i < id.length; i++) {
			filedata = filedata + '<entry>\r\n'
			 + '<title>' + id[i].split(":")[0] + '</title>\r\n'
			 + '<author>' + listname + '</author>\r\n'
			 + '<ref href="' + "http://lhttp.qingting.fm/live/" + id[i].split(":")[1] + "/64k.mp3" + '"/>\r\n'
			 + '</entry>\r\n\r\n';
		}
		filedata = filedata + "</asx>";
		SaveAs(filedata, cachefile);
		UpdateList("电台 | " + listname);
		SetBoxText(null);
	} catch(e) {
		console.log("获取电台失败");
		return;
	}
	Deltempfile(cachefile);
}

function SetBoxText(text){
	if(text == null) text ="";
	g_searchbox.inputbox.text = text;
	g_searchbox.repaint();
}

function UpdateDone(text){
	SetBoxText(text);
	var Done = window.SetTimeout(function() {
		SetBoxText(null);
		Done && window.ClearTimeout(Done);
		Done = false;
	}, 4000);
}

function UpdateList(listname){
	var isFound = false;
	var total = plman.PlaylistCount;
	for (var i = 0; i < total; i++) {
		if (plman.GetPlaylistName(i).substr(0, listname.length) == listname) {
			if (!isFound) {
				var plIndex = i;
				isFound = true;
			}
			break;
		}
	}
	if (isFound) {
		plman.ClearPlaylist(plIndex);
	} else {
		plIndex = total;
		plman.CreatePlaylist(plIndex, listname);
	}
	plman.AddLocations(plIndex, [cachefile]);
	plman.ActivePlaylist = plIndex;
}

function Deltempfile(tmpfile){
	var DelFile = window.SetTimeout(function() {
		try {
			fso.DeleteFile(tmpfile);
		} catch(e) {};
		DelFile && window.ClearTimeout(DelFile);
		DelFile = false;
	}, 6000);
}

function SaveAs(str, file) {
	var ado = new ActiveXObject("ADODB.Stream");
	ado.Type = 2;
	ado.Mode = 3;
	ado.Charset = "UTF-8";
	ado.Open();
	try {
		ado.WriteText(str);
		ado.SaveToFile(file);
	} catch (e) {
		console.log("ADODB.Stream:写入文件失败。");
	}
	ado.Flush();
	ado.Close();
}

function json(text) {
	try {
		var data = JSON.parse(text);
		return data;
	} catch (e) {
		return false;
	}
}