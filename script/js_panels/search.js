//by Asion, mod for foobox https://github.com/dream7180
ppts = {
	source: window.GetProperty("Search Source", 1),
	autosearch: window.GetProperty("Search Box: Auto-validation", false),
	scope: window.GetProperty("Search Box: Scope", 0),
	multiple: window.GetProperty("Search Box: Keep Playlist", true),
	historymaxitems: 10,
	historytext: window.GetProperty("Search Box: Search History", ""),
	showreset: window.GetProperty("Search Box: Always Show Reset Button", false)
};
var oldsearch = oldpid = 0;
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
			x14 = z(14), x17 = 17 * zdpi, x18 = z(18);

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

		this.images.source_switch = gdi.CreateImage(z(20), x18);
		gb = this.images.source_switch.GetGraphics();
		this.images.source_switch.ReleaseGraphics(gb);
		
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
		gb.DrawImage(img_arc, 0, z(8), x14, z(8), 0, 0, x14, z(8), 0, 255);
		gb.DrawImage(img_arc, 0, z(11), x14, z(8), 0, 0, x14, z(8), 0, 255);
		gb.DrawLine(0, x4, 0, x11, 1, g_color_normal_txt);
		gb.DrawLine(x11, x4, x11, x11, 1, g_color_normal_txt);
		gb.SetSmoothingMode(0);
		this.images.source_lib.ReleaseGraphics(gb);
		this.src_btn = new button(this.images.source_switch, this.images.source_switch, this.images.source_switch, "");	
	}
	this.getImages();

	this.setSize = function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.inputbox.setSize(this.w - 40 * zdpi, this.h - 4);
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
		this.src_btn.draw(gr, this.x + 4 - 2*zdpi, Math.round(this.y + zdpi), 255);
		this.inputbox.draw(gr, this.x + this.images.source_pl.Width + 10, this.y + 2, 0, 0);
		if(ppts.source == 1){
			var src_img = this.images.source_pl;
		}else{
			var src_img = this.images.source_lib;
		}
		if ((this.inputbox.text.length > 0 || ppts.showreset) && this.inputbox.edit) this.reset_bt.draw(gr, Math.round(this.x + this.inputbox.w + 22 * zdpi), Math.round(this.y + zdpi), 255);
		gr.DrawImage(src_img, this.x + 5, Math.round(this.y + 3 * zdpi), src_img.Width, src_img.Height, 0, 0, src_img.Width, src_img.Height, 0, 255);
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
			this.inputbox.check("down", x, y);
			if (this.inputbox.text.length > 0 || ppts.showreset) this.reset_bt.checkstate("down", x, y);
			break;
		case "lbtn_up":
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
			if (this.inputbox.text.length > 0 || ppts.showreset) this.reset_bt.checkstate("move", x, y);
			break;
		case "leave":
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
			6: "%filename% HAS ",
			7: "%comment% HAS "
		};
		var s3 = "\"" + s1 + "\"";
		if (scopecases[ppts.scope]) {
			plman.CreateAutoPlaylist(plIndex, "搜索 | " + s1, scopecases[ppts.scope] + s3, "", 0);
		} else {
			plman.CreateAutoPlaylist(plIndex, "搜索 | " + s1, scopecases[1]+s3 + " OR " + scopecases[2]+s3 + " OR " + scopecases[3]+s3 + " OR " + scopecases[4]+s3 + " OR " + scopecases[5]+s3 + " OR " + scopecases[6]+s3, "", 0);
		};

		// 转换自动列表为普通列表
		//plman.DuplicatePlaylist(plIndex, "搜索 [" + s1 + "]");
		//plman.RemovePlaylist(plIndex);
		plman.ActivePlaylist = plIndex;
	}
}

//=================================================// 快速搜索

function quickSearch(metadb, search_function) {
	if(!metadb) return;
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

//=================================================//
function LoadRadio(listname, url){
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
	plman.AddLocations(plIndex, [url]);
	plman.ActivePlaylist = plIndex;
}