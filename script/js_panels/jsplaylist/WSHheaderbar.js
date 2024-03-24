// *****************************************************************************************************************************************
// headerBar object by Br3tt aka Falstaff (c)2015, mod for foobox https://github.com/dream7180
// *****************************************************************************************************************************************

oBorder = function() {
	this.leftId = arguments[0];
	this.rightId = arguments[1];
	this.percent = arguments[2];

	this.isHover = function(x, y) {
		return (x >= this.x - 3 && x <= this.x + this.w + 2 && y >= this.y && y <= this.y + this.h);
	};

	this.on_mouse = function(event, x, y) {
		this.ishover = (x >= this.x - 3 && x <= this.x + this.w + 2 && y >= this.y && y <= this.y + this.h);
		switch (event) {
		case "down":
			if (this.ishover) {
				this.sourceX = x;
				this.drag = true;
			};
			break;
		case "up":
			this.drag = false;
			break;
		case "move":
			if (this.drag) {
				this.delta = x - this.sourceX;
			};
			break;
		};
	};
};

oColumn = function() {
	this.label = arguments[0];
	this.tf = arguments[1];
	this.tf2 = arguments[2];
	this.ref = arguments[3];
	this.align = Math.round(arguments[4]);
	this.sortOrder = arguments[5];
	this.percent = arguments[6];
	this.DT_align = (this.align == 0 ? DT_LEFT : (this.align == 2 ? DT_RIGHT : DT_CENTER));
	this.minWidth = z(32);
	this.drag = false;

	this.isHover = function(x, y) {
		return (x > this.x && x < this.x + this.w && y >= this.y && y <= this.y + this.h);
	};

	this.on_mouse = function(event, x, y) {
		this.ishover = (x > this.x + 2 && x < this.x + this.w - 2 && y >= this.y && y <= this.y + this.h);
		switch (event) {
		case "down":
			if (this.ishover && this.percent > 0) {
				this.drag = true;
			};
			break;
		case "up":
			this.drag = false;
			break;
		};
	};
};

oHeaderBar = function() {
	//this.visible = true;
	this.columns = [];
	this.borders = [];
	this.totalColumns = 0;
	this.borderDragged = false;
	this.borderDraggedId = -1;
	this.columnDragged = 0;
	this.columnDraggedId = null;
	this.columnRightClicked = -1;
	this.resetSortIndicators = function() {
		this.sortedColumnId = -1;
		this.sortedColumnDirection = 1;
	};
	this.resetSortIndicators();
	this.buttonClicked = false;

	this.borderHover = false;
	this.clickX = 0;
	//font
	this.icoFont = GdiFont("Tahoma", g_fsize - 2, 1);

	this.setButtons = function() {
		var menu_ico = g_color_normal_txt&0x88ffffff;
		var btn_h = cHeaderBar.height;
		var add_h = Math.round(3*zdpi);
		var y_ini = Math.round((btn_h-add_h*2)/2);
		var x_ini =  cScrollBar.width / 4;

		this.slide_open_normal = gdi.CreateImage(cScrollBar.width, btn_h);
		var gb = this.slide_open_normal.GetGraphics();
		gb.FillSolidRect(0, 0, cScrollBar.width, btn_h, g_color_topbar);
		gb.SetSmoothingMode(2);
		gb.DrawLine(x_ini, y_ini, x_ini*3, y_ini, 1, menu_ico);
		gb.DrawLine(x_ini, y_ini+add_h, x_ini*3, y_ini+add_h, 1, menu_ico);
		gb.DrawLine(x_ini, y_ini+add_h*2, x_ini*3, y_ini+add_h*2, 1, menu_ico);	
		this.slide_open_normal.ReleaseGraphics(gb);

		this.slide_open_hover = gdi.CreateImage(cScrollBar.width, btn_h);
		gb = this.slide_open_hover.GetGraphics();
		gb.FillSolidRect(0, 0, cScrollBar.width, btn_h, RGBA(0,0,0,30));
		gb.SetSmoothingMode(2);
		gb.DrawLine(x_ini, y_ini, x_ini*3, y_ini, 1, g_color_normal_txt);
		gb.DrawLine(x_ini, y_ini+add_h, x_ini*3, y_ini+add_h, 1, g_color_normal_txt);
		gb.DrawLine(x_ini, y_ini+add_h*2, x_ini*3, y_ini+add_h*2, 1, g_color_normal_txt);	
		this.slide_open_hover.ReleaseGraphics(gb);

		this.slide_open_down = gdi.CreateImage(cScrollBar.width, btn_h);
		gb = this.slide_open_down.GetGraphics();
		gb.FillSolidRect(0, 0, cScrollBar.width, btn_h, RGBA(0,0,0,50));
		gb.SetSmoothingMode(2);
		gb.DrawLine(x_ini, y_ini, x_ini*3, y_ini, 1, g_color_normal_txt);
		gb.DrawLine(x_ini, y_ini+add_h, x_ini*3, y_ini+add_h, 1, g_color_normal_txt);
		gb.DrawLine(x_ini, y_ini+add_h*2, x_ini*3, y_ini+add_h*2, 1, g_color_normal_txt);	
		this.slide_open_down.ReleaseGraphics(gb);
		this.button = new button(this.slide_open_normal, this.slide_open_hover, this.slide_open_down, "");
	};
	this.setButtons();

	this.setSize = function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w - cScrollBar.width;
		this.h = cHeaderBar.height;
		this.borderWidth = cHeaderBar.borderWidth;
	};

	this.repaint = function() {
		full_repaint();
	};

	this.calculateColumns = function() {
		var tmp = this.x;

		// calc column metrics for calculating border metrics as well
		for (var i = 0; i < this.totalColumns; i++) {
			if (this.columns[i].percent > 0) {
				this.columns[i].x = tmp;
				this.columns[i].y = this.y;
				this.columns[i].w = Math.abs(this.w * this.columns[i].percent / 10000);
				this.columns[i].h = this.h;
				if (i != this.columnDraggedId || (this.columnDragged == 1)) {
					// start >> on last column, adjust width of last drawn column to fit headerbar width!
					if (this.columns[i].x + this.columns[i].w >= this.x + this.w) { // if last col width go ahead of the max width (1 pixel more!) downsize col width !
						this.columns[i].w = (this.x + this.w) - this.columns[i].x + 1; // +1 to fit the whole headerbar width due to the -1 in draw width of each column in DrawRect below
					};
					if (this.columns[i].x + this.columns[i].w < this.x + this.w && this.columns[i].x + this.columns[i].w > this.x + this.w - 4) { // if there is a gap of 1 pixel at the end, fill it!
						this.columns[i].w = (this.x + this.w) - this.columns[i].x + 1;
					};
					// end <<
				};
				tmp = this.columns[i].x + this.columns[i].w;
			}
			else {
				this.columns[i].x = tmp;
				this.columns[i].y = this.y;
				this.columns[i].w = 0;
				this.columns[i].h = this.h;
			};
		};
	};

	this.drawColumns = function(gr) {
		var j = 0,
			tmp = this.x,
			cx = 0,
			cy = 0,
			cw = 0,
			sx = 0,
			bx = 0;

		// tweak to only reset mouse cursor to arrowafter a column sorting
		if (this.columnDragged_saved == 3 && this.columnDragged == 0) {
			this.columnDragged_saved = 0;
		};

		// calc column metrics for calculating border metrics as well
		this.calculateColumns();

		// draw borders and left column from each one!
		tmp = this.x;
		for (var i = 0; i < this.borders.length; i++) {
			j = this.borders[i].leftId;
			this.borders[i].x = this.columns[j].x + this.columns[j].w - 1;
			this.borders[i].y = this.columns[j].y;
			this.borders[i].w = this.borderWidth;
			this.borders[i].h = this.columns[j].h;
			bx = Math.floor(this.borders[i].x - 1);

			if (this.columns[j].percent > 0) {
				cx = tmp;
				cy = this.y;
				cw = (bx - cx);
				var chh = cy + this.h/2;
				if (j != this.columnDraggedId || (this.columnDragged == 1)) {
					// draw column header bg
					if (this.columnRightClicked == j) {
						gr.FillSolidRect(cx, cy, cw, this.h, g_color_normal_txt & 0x30ffffff);
					}
					else { // normal box
						if (this.columnDragged == 1 && j == this.columnDraggedId) {
							gr.FillSolidRect(cx, cy, cw, this.h, g_color_normal_txt & 0x30ffffff);
						}
						else {
							gr.FillSolidRect(cx, cy, cw, this.h, g_color_topbar);
						};
					};
					gr.FillGradRect(cx + cw - 1, cy, 1, chh, 90, RGBA(0, 0, 0, 3), RGBA(0, 0, 0, 35));
					gr.FillGradRect(cx + cw - 1, chh, 1, chh, 270, RGBA(0, 0, 0, 3), RGBA(0, 0, 0, 35));
					// draw column header infos
					if (this.columns[j].tf != "null" || this.columns[j].sortOrder != "null") {
						// draw sort indicator (direction)
						if (j == this.sortedColumnId) {
							sx = Math.floor(cx + this.columns[j].w / 2 - 3);
							sh = cy + 1;
							images.sortdirection && gr.DrawImage(images.sortdirection, sx, sh, images.sortdirection.Width, images.sortdirection.Height, 0, 0, images.sortdirection.Width, images.sortdirection.Height, (this.sortedColumnDirection > 0 ? 180 : 0), 130);
						};
					};
					gr.GdiDrawText(this.columns[j].label, g_font_b, g_color_normal_txt, cx + (this.borderWidth * 2), cy + 1, cw - (this.borderWidth * 4) - 1, this.h, this.columns[j].DT_align | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX | DT_END_ELLIPSIS);
				}
			};

			if (this.borders[i].drag) {
				gr.FillSolidRect(Math.floor(bx - 0), this.y, this.borders[i].w, this.h, g_color_normal_txt);
			};
			tmp = bx + this.borderWidth;
		};

		// draw last colum at the right of the last border Object
		for (j = this.totalColumns - 1; j >= 0; j--) {
			if (this.columns[j].percent > 0) {
				cx = tmp;
				cy = this.y;
				cw = (this.w - this.borderWidth - cx);
				var chh = cy + this.h/2;
				if (j != this.columnDraggedId || (this.columnDragged == 1)) {
					// draw last column bg
					if (this.columnRightClicked == j) {
						gr.FillSolidRect(cx, cy, cw, this.h, g_color_normal_txt & 0x30ffffff);
					}
					else { // normal box
						if (this.columnDragged == 1 && j == this.columnDraggedId) {
							gr.FillSolidRect(cx, cy, cw, this.h, g_color_normal_txt & 0x30ffffff);
						}
						else {
							gr.FillSolidRect(cx, cy, cw, this.h, g_color_topbar);
						};
					};
					gr.FillGradRect(cx + cw - 1, cy, 1, chh, 90, RGBA(0, 0, 0, 3), RGBA(0, 0, 0, 35));
					gr.FillGradRect(cx + cw - 1, chh, 1, chh, 270, RGBA(0, 0, 0, 3), RGBA(0, 0, 0, 35));
					// draw last column header info
					if (this.columns[j].tf != "null" || this.columns[j].sortOrder != "null") {
						// draw sort indicator (direction)
						if (j == this.sortedColumnId) {
							sx = Math.floor(cx + this.columns[j].w / 2 - 3);
							sh = cy + 1;
							images.sortdirection && gr.DrawImage(images.sortdirection, sx, sh, images.sortdirection.Width, images.sortdirection.Height, 0, 0, images.sortdirection.Width, images.sortdirection.Height, (this.sortedColumnDirection > 0 ? 180 : 0), 130);
						};
					};
					gr.GdiDrawText(this.columns[j].label, g_font_b, g_color_normal_txt, cx + (this.borderWidth * 2), cy + 1, cw - (this.borderWidth * 4) - 1, this.h, this.columns[j].DT_align | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX | DT_END_ELLIPSIS);
				}
				break;
			};
		};

		// draw dragged column header (last item drawn to be always on the top)
		if (this.columnDragged > 1 && this.columnDraggedId != null) {
			cx = Math.floor(mouse_x - this.clickX) + 2;
			cy = this.y + 3;
			// header bg
			gr.FillSolidRect(cx, cy, Math.floor(this.columns[this.columnDraggedId].w - 2), this.h-2, g_color_normal_txt & 0x80ffffff);
			gr.DrawRect(cx, cy + 1, Math.floor(this.columns[this.columnDraggedId].w - 2), this.h - 2, 2.0, g_color_normal_txt);
			// header text info
			gr.GdiDrawText(this.columns[this.columnDraggedId].label, g_font_b, g_color_normal_bg, cx + (this.borderWidth * 2), cy + 1, this.columns[this.columnDraggedId].w - (this.borderWidth * 4) - 2, this.h, this.columns[this.columnDraggedId].DT_align | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX | DT_END_ELLIPSIS);
		};
		// draw settings button
		this.button.draw(gr, this.x + this.w, this.y, 255);
	};

	this.saveColumns = function(col_num_changed) {
		var tmp;
		var config_col = "";
		for (var j = 0; j < 6; j++) {
			tmp = "";
			for (var i = 0; i < this.columns.length; i++) {
				switch (j) {
				case 0:
					if(this.columns[i].label == "#") tmp = tmp + "#@";
					else tmp = tmp + this.columns[i].label;
					break;
				case 1:
					tmp = tmp + this.columns[i].tf;
					break;
				case 2:
					tmp = tmp + this.columns[i].tf2;
					break;
				case 3:
					tmp = tmp + this.columns[i].ref;
					break;
				case 4:
					tmp = tmp + this.columns[i].align;
					break;
				case 5:
					tmp = tmp + this.columns[i].sortOrder;
					break;
				};
				if (i < this.columns.length - 1) {
					tmp = tmp + "^^";
				};
			};
			switch (j) {
			case 0:
				config_col = tmp;
				break;
			case 1:
				config_col = config_col + "##" + tmp;
				break;
			case 2:
				config_col = config_col + "##" + tmp;
				break;
			case 3:
				config_col = config_col + "##" + tmp;
				break;
			case 4:
				config_col = config_col + "##" + tmp;
				break;
			case 5:
				config_col = config_col + "##" + tmp;
				break;
			};
		};
		utils.WriteTextFile(config_dir + "columns", config_col);
		if(col_num_changed) {
			tmp = "";
			layout.columnWidth.splice(0, layout.columnWidth.length);
			for (var j = 0; j < layout.ids.length - 1; j++){
				for (var i = 0; i < this.columns.length; i++) {
					tmp = tmp + this.columns[i].percent;
					if (i < this.columns.length - 1) tmp = tmp + "^^"
				}
			layout.columnWidth.push(tmp);
			}
			save_config("columnWidth");
		}
		this.initColumns();
	};

	this.saveColumnsWidth = function() {
		var tmp = "";
		for (var i = 0; i < this.columns.length; i++) {
			tmp = tmp + this.columns[i].percent;
			if (i < this.columns.length - 1)
				tmp = tmp + "^^";
		}
		layout.columnWidth[layout.index] = tmp;
		save_config("columnWidth");
	}

	this.initColumns = function() {
		var borderPercent = 0;
		var previousColumnToDrawId = -1;
		//var totalColumnsToDraw = 0;
		this.columns.splice(0, this.columns.length);
		this.borders.splice(0, this.borders.length);
		var config_col = "";
		try{
			config_col = utils.ReadTextFile(config_dir + "columns", 0);
		}catch(e){}
		if (config_col == "") {
			// INITIALIZE columns and Properties
			var fields = [];
			var tmp;
			for (var i = 0; i < 7; i++) {
				switch (i) {
				case 0:
					fields.push(new Array("封面", "状态", "索引", "#", "标题", "年份", "艺术家", "专辑艺术家", "专辑", "流派", "喜爱", "等级", "播放次数", "比特率", "编码", "采样率", "时间"));
					break;
				case 1:
					if(Number(fb.Version.substr(0, 1)) > 1) fields.push(new Array("null", "null", "$num(%list_index%,$len(%list_total%))", "$if2($num(%discnumber%,1)'.',)$if2($num(%tracknumber%,2),' ')", "$if2(%title%,%filename_ext%)", "$if(%year%,%year%,'-')", "$if2(%artist%,'未知艺术家')", "$if2(%album artist%,'未知艺术家')", "$if2(%album%,$if(%length%,'单曲','网络电台'))", "$if2(%genre%,'其他')", "$if(%mood%,1,0)", "$if2(%rating%,0)", "$if2(%play_count%,0)", "$if(%__bitrate_dynamic%, $if(%isplaying%,$select($add($mod(%_time_elapsed_seconds%,2),1),%__bitrate_dynamic%,%__bitrate_dynamic%)'K',$if($stricmp($left(%codec_profile%,3),'VBR'),%codec_profile%,%__bitrate%'K')),' '$if($stricmp($left(%codec_profile%,3),'VBR'),%codec_profile%,%__bitrate%'K'))", "%codec%", "$div(%samplerate%,1000).$sub($div(%samplerate%,100),$mul($div(%samplerate%,1000),10))kHz", "$if(%isplaying%,$if(%length%,-%playback_time_remaining%,'0:00'),$if2(%length%,'00:00'))"));
					else fields.push(new Array("null", "null", "$num(%list_index%,$len(%list_total%))", "$if2($num(%discnumber%,1)'.',)$if2($num(%tracknumber%,2),' ')", "$if2(%title%,%filename_ext%)", "$if(%date%,$year($replace(%date%,/,-,.,-)),'-')", "$if2(%artist%,'未知艺术家')", "$if2(%album artist%,'未知艺术家')", "$if2(%album%,$if(%length%,'单曲','网络电台'))", "$if2(%genre%,'其他')", "$if(%mood%,1,0)", "$if2(%rating%,0)", "$if2(%play_count%,0)", "$if(%__bitrate_dynamic%, $if(%isplaying%,$select($add($mod(%_time_elapsed_seconds%,2),1),%__bitrate_dynamic%,%__bitrate_dynamic%)'K',$if($stricmp($left(%codec_profile%,3),'VBR'),%codec_profile%,%__bitrate%'K')),' '$if($stricmp($left(%codec_profile%,3),'VBR'),%codec_profile%,%__bitrate%'K'))", "%codec%", "$div(%samplerate%,1000).$sub($div(%samplerate%,100),$mul($div(%samplerate%,1000),10))kHz", "$if(%isplaying%,$if(%length%,-%playback_time_remaining%,'0:00'),$if2(%length%,'00:00'))"));
					break;
				case 2:
					fields.push(new Array("null", "null", "null", "$if2(%play_count%,0)", "$if2(%album artist%,'未知艺术家')", "null", "null", "null", "$if2(%genre%,'其他')", "null", "null", "null", "null", "null", "null", "null", "$if(%__bitrate_dynamic%, $if(%isplaying%,$select($add($mod(%_time_elapsed_seconds%,2),1),%__bitrate_dynamic%,%__bitrate_dynamic%)'K',$if($stricmp($left(%codec_profile%,3),'VBR'),%codec_profile%,%__bitrate%'K')),$if($stricmp($left(%codec_profile%,3),'VBR'),%codec_profile%,%__bitrate%'K'))"));
					break;
				case 3:
					fields.push(new Array("封面", "状态", "索引", "音轨号", "标题", "日期", "艺术家", "专辑艺术家", "专辑", "流派", "喜爱", "等级", "播放次数", "比特率", "编码类型", "采样率", "持续时间"));
					break;
				case 4:
					fields.push(new Array("1", "1", "1", "2", "0", "2", "0", "0", "0", "0", "1", "1", "2", "1", "1", "1", "2"));
					break;
				case 5:
					fields.push(new Array("null", sort_pattern_queue, "null", sort_pattern_tracknumber, sort_pattern_title, sort_pattern_date, sort_pattern_artist, sort_pattern_albumartist, sort_pattern_album, sort_pattern_genre, "%mood% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", sort_pattern_rating, sort_pattern_playcount, sort_pattern_bitrate, sort_pattern_codec, "%samplerate% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", "$if2(%length%,' 0:00') | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%"));
					break;
				case 6:
					fields.push(new Array("1000", "500", "0", "500", "3700", "0", "2600", "0", "0", "0", "0", "1000", "0", "0", "0", "0", "700"));
					break;
				};
				// convert array to csv string
				tmp = "";
				for (var j = 0; j < fields[i].length; j++) {
					tmp = tmp + fields[i][j];
					if (j < fields[i].length - 1) {
						tmp = tmp + "^^";
					};
				};
				// save CSV string into window Properties
				switch (i) {
				case 0:
					config_col = tmp;
					break;
				case 1:
					config_col = config_col + "##" + tmp;
					break;
				case 2:
					config_col = config_col + "##" + tmp;
					break;
				case 3:
					config_col = config_col + "##" + tmp;
					break;
				case 4:
					config_col = config_col + "##" + tmp;
					break;
				case 5:
					config_col = config_col + "##" + tmp;
					break;
				case 6:
					layout.columnWidth[0] = tmp;
					utils.WriteTextFile(config_dir + "layout_columnWidth", tmp);
					break;
				};
			};
			// create column Objects
			utils.WriteTextFile(config_dir + "columns", config_col);
			this.totalColumns = fields[0].length;
			for (var k = 0; k < this.totalColumns; k++) {
				this.columns.push(new oColumn(fields[0][k], fields[1][k], fields[2][k], fields[3][k], fields[4][k], fields[5][k], fields[6][k]));
				if (this.columns[k].percent > 0) {
					if (previousColumnToDrawId >= 0) {
						this.borders.push(new oBorder(previousColumnToDrawId, k, borderPercent));
					};
					borderPercent += Math.round(this.columns[k].percent);
					previousColumnToDrawId = k;
				};
			};

		}
		else {
			var fields = [];
			var tmp;
			config_col = config_col.split("##");
			for (var i = 0; i < 7; i++) {
				switch (i) {
				case 0:
					tmp = config_col[0];
					break;
				case 1:
					tmp = config_col[1];
					break;
				case 2:
					tmp = config_col[2];
					break;
				case 3:
					tmp = config_col[3];
					break;
				case 4:
					tmp = config_col[4];
					break;
				case 5:
					tmp = config_col[5];
					break;
				case 6:
					tmp = layout.columnWidth[layout.index];
					if (!tmp) {
						tmp = "1000^^500^^0^^500^^3700^^0^^2600^^0^^0^^0^^0^^1000^^0^^0^^0^^0^^700";
						for (var j = 17; j < this.totalColumns; j++){
							tmp = tmp + "^^0";
						}
						var tmp2 = tmp;
						for (j = 0; j < layout.ids.length - 1; j++){
							tmp2 = tmp2 + "##" + tmp;
							layout.columnWidth[j] = tmp;
						}
						layout.columnWidth[layout.ids.length - 1] = tmp;
						utils.WriteTextFile(config_dir + "layout_columnWidth", tmp2);
					}
					break;
				};
				fields.push(tmp.split("^^"));
				if(i == 0) this.totalColumns =  fields[0].length;
			};
			for (var k = 0; k < this.totalColumns; k++) {
				if(fields[0][k] == "#@") fields[0][k] = "#";
				this.columns.push(new oColumn(fields[0][k], fields[1][k], fields[2][k], fields[3][k], fields[4][k], fields[5][k], fields[6][k]));
				if (this.columns[k].percent > 0) {
					if (previousColumnToDrawId >= 0) {
						this.borders.push(new oBorder(previousColumnToDrawId, k, borderPercent));
					};
					borderPercent += Math.round(this.columns[k].percent);
					previousColumnToDrawId = k;
				};
			};
			this.calculateColumns();
		};
	};

	this.buttonCheck = function(event, x, y) {
		if (!dragndrop.moved) {
			if (!this.columnDragged && !this.borderDragged) {
				var state = this.button.checkstate(event, x, y);
				switch (event) {
				case "down":
					if (state == ButtonStates.down) {
						this.buttonClicked = true;
						this.button.state = ButtonStates.hover;
					};
					break;
				case "up":
					if (this.buttonClicked && state == ButtonStates.hover) {
						this.contextMenu(ww, cHeaderBar.height, 0, true);
					};
					break;
					
				case "leave_menu":
					var _state = this.button.state;
					if(this.buttonClicked && state == ButtonStates.hover) {
						this.buttonClicked = false;
						
					} else this.button.state = ButtonStates.normal;
					if(this.button.state != _state) this.button.repaint();
					break;
				};
				return state;
			};
		};
	};

	this.on_mouse = function(event, x, y, delta) {
		var tmp = "",
			percents = [];

		if (!p.scrollbar.clicked) {

			this.ishover = (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h);

			// check settings button + toolbar if button not hover
			if (this.buttonCheck(event, x, y) != ButtonStates.hover) {
				switch (event) {
				case "down":
					if (this.ishover) {
						// check borders:
						for (var i = 0; i < this.borders.length; i++) {
							this.borders[i].on_mouse(event, x, y);
							if (this.borders[i].drag) {
								this.borderDragged = true;
								this.borderDraggedId = i;
								full_repaint();
							};
						};
						// if no click on a border (no border drag), check columns:
						if (!this.borderDragged) {
							for (var i = 0; i < this.columns.length; i++) {
								this.columns[i].on_mouse(event, x, y);
								if (this.columns[i].drag) {
									this.clickX = x - this.columns[i].x;
									if (this.columns[i].tf != "null" || this.columns[i].sortOrder != "null") {
										this.columnDragged = 1;
										window.SetCursor(IDC_ARROW);
									}
									else {
										this.columnDragged = 2;
										window.SetCursor(IDC_SIZEALL);
									};
									this.columnDraggedId = i;
									this.columnDraggedIdHistoric = i;
									this.repaint();
									break;
								};
							};
						};
					};
					break;
				case "up":
					if (this.borderDragged) {
						for (var i = 0; i < this.borders.length; i++) {
							if (this.borders[i].drag) {
								tmp = layout.columnWidth[layout.index];
								percents = tmp.split("^^");
								percents[Math.round(this.borders[i].leftId)] = this.columns[this.borders[i].leftId].percent.toString();
								percents[Math.round(this.borders[i].rightId)] = this.columns[this.borders[i].rightId].percent.toString();
								// save new percent CSV string to window Properties
								tmp = "";
								for (var j = 0; j < percents.length; j++) {
									tmp = tmp + percents[j];
									if (j < percents.length - 1) {
										tmp = tmp + "^^";
									};
								};
								layout.columnWidth[layout.index] = tmp;
								save_config("columnWidth");
								// update border object status
								this.borders[i].on_mouse(event, x, y);
								this.repaint();
							};
						};
						this.borderDragged = false;
						this.borderDraggedId = -1;
						this.on_mouse("move", x, y); // call "Move" to set mouse cursor if border hover
					}
					else if (this.columnDragged > 0) {
						if (this.columnDragged == 1) {
							if (this.columnDraggedId == 0) {
								this.columns[0].on_mouse(event, x, y);
							};
							if (this.columnDraggedId > 0 || (this.columnDraggedId == 0 && this.columns[this.columnDraggedId].isHover(x, y))) {
								window.SetCursor(IDC_WAIT);
								this.sortedColumnDirection = (this.columnDraggedId == this.sortedColumnId) ? (0 - this.sortedColumnDirection) : 1;
								this.sortedColumnId = this.columnDraggedId;
								this.columns[this.columnDraggedId].drag = false;
								this.columnDragged = 3;
								this.columnDragged_saved = 3;
								cHeaderBar.sortRequested = true;
								if (this.columns[this.columnDraggedId].sortOrder != "null") {
									plman.SortByFormatV2(plman.ActivePlaylist, this.columns[this.columnDraggedId].sortOrder, this.sortedColumnDirection);
								}
								else {
									plman.SortByFormatV2(plman.ActivePlaylist, this.columns[this.columnDraggedId].tf, this.sortedColumnDirection);
								};
								update_playlist(layout.collapseGroupsByDefault);
							}
							else {
								this.columns[this.columnDraggedId].drag = false;
								this.columnDragged = 0;
								this.columnDragged_saved = 0;
							};
						}
						else {
							for (var i = 0; i < this.columns.length; i++) {
								this.columns[i].on_mouse(event, x, y);
							};
							this.columnDragged = 0;
							this.on_mouse("move", x, y); // call "Move" to set mouse cursor if border hover
						};
						this.columnDraggedId = null;
						this.repaint();
					};
					this.columnRightClicked = -1;
					break;
				case "right":
					if (this.ishover) {
						this.columnRightClicked = -1;
						for (var i = 0; i < this.columns.length; i++) {
							if (this.columns[i].percent > 0 && this.columns[i].isHover(x, y)) {
								this.columnRightClicked = i;
								this.repaint();
								break;
							};
						};
						if (!utils.IsKeyPressed(VK_SHIFT)) {
						this.contextMenu(x, y, this.columnRightClicked);
						};
					};
					break;
				case "move":
					this.borderHover = false;
					for (var i = 0; i < this.borders.length; i++) {
						if (this.borders[i].isHover(x, y)) {
							this.borderHover = true;
							break;
						};
					};
					if (this.columnDragged < 1) {
						if (this.borderHover || this.borderDragged) {
							window.SetCursor(IDC_SIZEWE);
						} else {
							window.SetCursor(IDC_ARROW);
						};
					};
					if (this.borderDragged) {
						for (var i = 0; i < this.borders.length; i++) {
							this.borders[i].on_mouse(event, x, y);
							var d = this.borders[i].delta;
							if (this.borders[i].drag) {
								var toDoLeft = (this.columns[this.borders[i].leftId].w + d > this.columns[this.borders[i].leftId].minWidth);
								var toDoRight = (this.columns[this.borders[i].rightId].w - d > this.columns[this.borders[i].rightId].minWidth);
								if (toDoLeft && toDoRight) { // ok, we can resize the left and the right columns
									this.columns[this.borders[i].leftId].w += d;
									this.columns[this.borders[i].rightId].w -= d;
									var addedPercent = Math.round(Math.abs(this.columns[this.borders[i].leftId].percent) + Math.abs(this.columns[this.borders[i].rightId].percent));
									this.columns[this.borders[i].leftId].percent = Math.round(Math.abs(this.columns[this.borders[i].leftId].w / this.w * 10000));
									this.columns[this.borders[i].rightId].percent = addedPercent - this.columns[this.borders[i].leftId].percent;
									this.borders[i].sourceX = x;
									full_repaint();
								};
							};
						};
					}
					else if (this.columnDraggedId != 0 && (this.columnDragged == 1 || this.columnDragged == 2)) {
						this.columnDragged = 2;
						window.SetCursor(IDC_SIZEALL);
						for (var i = 1; i < this.columns.length; i++) {
							if (this.columns[i].percent > 0) {
								if (i != this.columnDraggedId) {
									if ((x > mouse_x && x > this.columns[i].x && i > this.columnDraggedId) || (x < mouse_x && x < this.columns[i].x + this.columns[i].w && i < this.columnDraggedId)) {
										var tmpCol = this.columns[this.columnDraggedId];
										this.columns[this.columnDraggedId] = this.columns[i];
										this.columns[i] = tmpCol;
										// move sortColumnId too !
										if (i == this.sortedColumnId) {
											this.sortedColumnId = this.columnDraggedId;
										}
										else if (this.columnDraggedId == this.sortedColumnId) {
											this.sortedColumnId = i;
										};
										this.columnDraggedId = i;
										break;
									};
								};
							};
						};
						this.saveColumnsWidth();
						this.saveColumns();
						full_repaint();
					};
					break;
				};
			};
		};
	};

	this.contextMenu = function(x, y, column_index, btnclk) {
		var idx;
		var _menu = window.CreatePopupMenu();
		var _this = window.CreatePopupMenu();
		var _groups = window.CreatePopupMenu();
		var _sorting = window.CreatePopupMenu();
		//var _cover = window.CreatePopupMenu();
		var _patterns = window.CreatePopupMenu();
		var _collapsed_height = window.CreatePopupMenu();
		var _expanded_height = window.CreatePopupMenu();
		var _columns = window.CreatePopupMenu();
		var tmp = "",
			percents = [];

		// main Menu entries
		_menu.AppendMenuItem(MF_STRING, 11, "转到当前播放 (F2)"); 	        
		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(MF_STRING, 12, "foobox 设置");
		_menu.AppendMenuSeparator();
		var _thislayout = "默认布局: ";
		if (layout.index != 0) _thislayout = "此布局: ";
		if(layout.uid == "默认布局") {
			_menu.AppendMenuItem(MF_STRING, 15, "为此播放列表创建新布局");
			//_menu.AppendMenuSeparator();
		}
		_menu.AppendMenuItem(MF_STRING, 18, _thislayout + "启用分组");
		_menu.CheckMenuItem(18, layout.showgroupheaders);
		if (layout.showgroupheaders) {
			_patterns.AppendTo(_menu, MF_STRING, _thislayout + "分组依据");
			var groupByMenuIdx = 20;
			var totalGroupBy = p.list.groupby.length;
			for (var i = 0; i < totalGroupBy; i++) {
				_patterns.AppendMenuItem(MF_STRING, groupByMenuIdx + i, p.list.groupby[i].label);
			};
			_patterns.CheckMenuRadioItem(groupByMenuIdx, groupByMenuIdx + totalGroupBy - 1, layout.pattern_idx + groupByMenuIdx);
		};
		// Columns submenu entries
		_columns.AppendTo(_menu, MF_STRING, _thislayout + "列");
		_columns.AppendMenuItem(MF_STRING, 99, "显示附加行信息");
		_columns.CheckMenuItem(99, layout.enableExtraLine ? 1 : 0);
		_columns.AppendMenuSeparator();
		var columnMenuIdx = 100;
		for (var i = 0; i < this.columns.length; i++) {
			if (i == column_index) {
				_columns.AppendMenuItem(MF_STRING, columnMenuIdx + i, "[" + this.columns[i].label + "]");
			}
			else {
				_columns.AppendMenuItem(MF_STRING, columnMenuIdx + i, this.columns[i].label);
			};
			_columns.CheckMenuItem(columnMenuIdx + i, this.columns[i].w > 0 ? 1 : 0);
		};
		_menu.AppendMenuSeparator();

		if (layout.showgroupheaders) {
			_groups.AppendTo(_menu, MF_STRING, "折叠与展开分组");
			_groups.AppendMenuItem(p.list.totalRows > 0 && !layout.autocollapse && cGroup.expanded_height > 0 && cGroup.collapsed_height > 0 ? MF_STRING : MF_GRAYED | MF_DISABLED, 80, "折叠全部 (Tab)");
			_groups.AppendMenuItem(p.list.totalRows > 0 && !layout.autocollapse && cGroup.expanded_height > 0 && cGroup.collapsed_height > 0 ? MF_STRING : MF_GRAYED | MF_DISABLED, 90, "展开全部 (Shift+Tab)");	
		};
		_sorting.AppendTo(_menu, MF_STRING, "排序");
		_sorting.AppendMenuItem(MF_STRING, 205, "专辑艺术家");
		_sorting.AppendMenuItem(MF_STRING, 219, "艺术家");
		_sorting.AppendMenuItem(MF_STRING, 206, "专辑");
		_sorting.AppendMenuItem(MF_STRING, 207, "音轨号");
		_sorting.AppendMenuItem(MF_STRING, 208, "标题");
		_sorting.AppendMenuItem(MF_STRING, 209, "路径");
		_sorting.AppendMenuItem(MF_STRING, 210, "日期");
		_sorting.AppendMenuItem(MF_STRING, 211, "流派");
		_sorting.AppendMenuItem(MF_STRING, 212, "等级");
		_sorting.AppendMenuItem(MF_STRING, 213, "比特率");
		_sorting.AppendMenuItem(MF_STRING, 214, "修改时间");
		_sorting.AppendMenuItem(MF_STRING, 215, "播放次数");
		_sorting.AppendMenuItem(MF_STRING, 216, "编码类型");
		_sorting.AppendMenuItem(MF_STRING, 217, "随机");
		_sorting.AppendMenuItem(MF_STRING, 218, "颠倒");

		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(MF_STRING, 16, "刷新封面 (F5)");
		_menu.AppendMenuItem(MF_STRING, 14, "面板属性");
		
		idx = _menu.TrackPopupMenu(x, y, btnclk ? 0x0008 : 0);
		switch (true) {
		case (idx == 11):
			p.list.showNowPlaying();
			p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
			break;
		case (idx == 12):
			show_setting(3, column_index);
			break;
		case (idx == 14):
			window.ShowProperties();
			break;
		case (idx == 15):
			layout.uid = layout.playlistName;
			layout.ids.push(layout.uid);
			layout.config.push(layout.config[layout.index]);
			layout.columnWidth.push(layout.columnWidth[layout.index]);
			layout.index = layout.ids.length - 1;
			save_config("ids");
			this.saveColumnsWidth();
			save_config("config");
			reinit_config();
			if(setting_init && p.settings.page_loaded[4]){
				var arr = [];
				fin = layout.ids.length;
				for (var i = 0; i < fin; i++) {
					arr.push(layout.ids[i]);
				};
				p.settings.pages[4].elements[0].reSet(arr);
				p.settings.pages[4].elements[0].showSelected(fin - 1);
			}
			break;
		case (idx == 16):
			refresh_cover();
			break;
		case (idx == 18):
			showhide_groupheader();
			break;
		case (idx >= 20 && idx < 50):
			layout.pattern_idx = idx - groupByMenuIdx;
			layout.config[layout.index][0] = layout.pattern_idx.toString();
			layout.gopts[0] = layout.pattern_idx.toString();
			save_config("config");
			get_covercahe_config();
			plman.SortByFormatV2(plman.ActivePlaylist, p.list.groupby[layout.pattern_idx].sortOrder, 1);
			p.list.updateHandleList(plman.ActivePlaylist, false);
			p.list.setItems(true);
			p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
			full_repaint();
			break;
		case (idx == 80):
			resize_panels();
			p.list.updateHandleList(plman.ActivePlaylist, true);
			p.list.setItems(true);
			p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
			break;
		case (idx == 90):
			resize_panels();
			p.list.updateHandleList(plman.ActivePlaylist, false);
			p.list.setItems(true);
			p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
			break;
		case (idx == 99):
			if(layout.enableExtraLine) layout.enableExtraLine = 0;
			else layout.enableExtraLine = 1;
			layout.config[layout.index][7] = layout.enableExtraLine.toString();
			layout.gopts[7] = layout.enableExtraLine.toString();
			save_config("config");
			resize_panels();
			p.list.updateHandleList(plman.ActivePlaylist, false);
			p.list.setItems(true);
			p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
			break;
		case (idx >= 100 && idx <= 200):
			// all size changes are in percent / ww
			if (this.columns[idx - 100].percent == 0) {
				var newColumnSize = 800;
				this.columns[idx - 100].percent = newColumnSize;
				var totalColsToResizeDown = 0;
				var last_idx = 0;
				for (var k = 0; k < this.columns.length; k++) {
					if (k != idx - 100 && this.columns[k].percent > newColumnSize) {
						totalColsToResizeDown++;
						last_idx = k;
					};
				};
				var minus_value = Math.floor(newColumnSize / totalColsToResizeDown);
				var reste = newColumnSize - (minus_value * totalColsToResizeDown);
				for (var k = 0; k < this.columns.length; k++) {
					if (k != idx - 100 && this.columns[k].percent > newColumnSize) {
						this.columns[k].percent = Math.abs(this.columns[k].percent) - minus_value;
						if (reste > 0 && k == last_idx) {
							this.columns[k].percent = Math.abs(this.columns[k].percent) - reste;
						};
					};
					this.columns[k].w = Math.abs(this.w * this.columns[k].percent / 10000);
				};
				this.saveColumnsWidth();
			}
			else {
				// check if it's not the last column visible, otherwise, we coundn't hide it!
				var nbvis = 0;
				for (var k = 0; k < this.columns.length; k++) {
					if (this.columns[k].percent > 0) {
						nbvis++;
					};
				};
				if (nbvis > 1) {
					var RemovedColumnSize = Math.abs(this.columns[idx - 100].percent);
					this.columns[idx - 100].percent = 0;
					var totalColsToResizeUp = 0;
					var last_idx = 0;
					for (var k = 0; k < this.columns.length; k++) {
						if (k != idx - 100 && this.columns[k].percent > 0) {
							totalColsToResizeUp++;
							last_idx = k;
						};
					};
					var add_value = Math.floor(RemovedColumnSize / totalColsToResizeUp);
					var reste = RemovedColumnSize - (add_value * totalColsToResizeUp);
					for (var k = 0; k < this.columns.length; k++) {
						if (k != idx - 100 && this.columns[k].percent > 0) {
							this.columns[k].percent = Math.abs(this.columns[k].percent) + add_value;
							if (reste > 0 && k == last_idx) {
								this.columns[k].percent = Math.abs(this.columns[k].percent) + reste;
							};
						};
						this.columns[k].w = Math.abs(this.w * this.columns[k].percent / 10000);
					};
					this.saveColumnsWidth();
				};
			};
			this.initColumns();

			// set minimum rows / cover column size
			get_grprow_minimum(this.columns[0].w, true);
			update_playlist(layout.collapseGroupsByDefault);
			break;
		case (idx == 205):
			plman.SortByFormatV2(plman.ActivePlaylist, sort_pattern_albumartist, 1);
            break;
		case (idx == 219):
			plman.SortByFormatV2(plman.ActivePlaylist, sort_pattern_artist, 1);
            break;
		case (idx == 206):
			plman.SortByFormatV2(plman.ActivePlaylist, sort_pattern_album, 1);
            break;
		case (idx == 207):
			plman.SortByFormatV2(plman.ActivePlaylist, sort_pattern_tracknumber);
            break;
		case (idx == 208):
			plman.SortByFormatV2(plman.ActivePlaylist, sort_pattern_title, 1);
            break;
		case (idx == 209):
			plman.SortByFormatV2(plman.ActivePlaylist, sort_pattern_path, 1);
            break;
		case (idx == 210):
			plman.SortByFormatV2(plman.ActivePlaylist, sort_pattern_date, -1);
            break;
		case (idx == 211):
			plman.SortByFormatV2(plman.ActivePlaylist, sort_pattern_genre, 1);
            break;
		case (idx == 212):
			plman.SortByFormatV2(plman.ActivePlaylist, sort_pattern_rating, -1);
            break;
		case (idx == 213):
			plman.SortByFormatV2(plman.ActivePlaylist, sort_pattern_bitrate, -1);
            break;
		case (idx == 214):
			plman.SortByFormatV2(plman.ActivePlaylist, sort_pattern_modified, -1);
            break;
		case (idx == 215):
			plman.SortByFormatV2(plman.ActivePlaylist, sort_pattern_playcount, -1);
            break;
		case (idx == 216):
			plman.SortByFormatV2(plman.ActivePlaylist, sort_pattern_codec, 1);
            break;
		case (idx == 217):
			plman.SortByFormat(plman.ActivePlaylist,"",false);
            break;
		case (idx == 218):
			fb.RunMainMenuCommand("编辑/排序/颠倒");
            break;
		};
		this.columnRightClicked = -1;
		full_repaint();
		return true;
	};
};