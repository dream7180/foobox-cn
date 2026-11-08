// *****************************************************************************************************************************************
// Playlist object by Br3tt aka Falstaff (c)2015, mod for foobox https://github.com/dream7180
// *****************************************************************************************************************************************

// 常用 TitleFormat 缓存，避免每帧 / 每行重复创建
var tf_info_filename = fb.TitleFormat("%filename_ext%");
var tf_info_path = fb.TitleFormat("$directory_path(%path%)");
var tf_info_title = fb.TitleFormat("$if2(%title%,)");
var tf_info_artist = fb.TitleFormat("$if2(%artist%,)");
var tf_info_album = fb.TitleFormat("$if2(%album%,)");
var tf_info_codec = fb.TitleFormat("%codec% | $if2(%codec_profile% | ,)$info(encoding) | %channels% | $if2($info(bitspersample) bits | ,)%bitrate% kbps | %samplerate% Hz");
var tf_info_size = fb.TitleFormat("%filesize_natural%");
var tf_plain_title = fb.TitleFormat("%title%");
var tf_plain_album = fb.TitleFormat("%album%");

// 通用编译缓存：只缓存不含逐行变化字段的模板，避免每帧/每行重复编译 TitleFormat
var g_tf_cache = {};
var g_tf_cache_count = 0;
var G_TF_CACHE_MAX = 256;

function has_dynamic_tf(tf) {
	if (typeof tf != "string") return true; // 非字符串保持原有走逐行解析逻辑
	return tf.indexOf("%list_index%") > -1 || tf.indexOf("%list_total%") > -1 || tf.indexOf("%isplaying%") > -1;
}

function tf_cached(tf) {
	var obj = g_tf_cache[tf];
	if (obj) return obj;
	if (g_tf_cache_count >= G_TF_CACHE_MAX) {
		g_tf_cache = {};
		g_tf_cache_count = 0;
	};
	obj = g_tf_cache[tf] = fb.TitleFormat(tf);
	g_tf_cache_count++;
	return obj;
}

// 分组封面 cachekey 使用的 TF：按 pattern 只编译一次，不再每个分组重建
var tf_group_crc = null;
var tf_group_crc_idx = -1;

function get_group_crc_tf() {
	if (tf_group_crc && tf_group_crc_idx == layout.pattern_idx) return tf_group_crc;
	var tf;
	switch (layout.pattern_idx) {
		case 0:
			tf = "alb%album%";
			break;
		case 1:
			tf = "aa%album artist%-%album%";
			break;
		case 2:
			tf = "art%album artist%";
			break;
		case 3:
			tf = "art%artist%";
			break;
		case 4:
			tf = "gen%genre%";
			break;
		case 5:
			tf = "$directory_path(%path%)";
			break;
		default:
			tf = "alb%album%";
	};
	tf_group_crc = fb.TitleFormat(tf);
	tf_group_crc_idx = layout.pattern_idx;
	return tf_group_crc;
}

oGroup = function(index, start, count, total_time_length, focusedTrackId, iscollapsed, handle) {
	this.index = index;
	this.start = start;
	this.count = count;
	this.total_time_length = total_time_length;
	this.total_group_duration_txt = TimeFmt(total_time_length);
	this.load_requested = 0;
	this.cover_img = null;
	this.metadb = handle;

	if (count < cGroup.count_minimum) {
		this.rowsToAdd = cGroup.count_minimum - count;
	}
	else {
		this.rowsToAdd = 0;
	};
	this.rowCount = this.rowsToAdd + this.count;

	if (layout.autocollapse) {
		if (focusedTrackId >= this.start && focusedTrackId < this.start + this.count) { // focused track is in this group!
			this.collapsed = false;
			g_group_id_focused = this.index;
		}
		else {
			this.collapsed = true;
		};
	}
	else if (iscollapsed) {
		this.collapsed = true;
	}
	else {
		this.collapsed = false;
	};

	this.totalPreviousRows = 0;

	if (handle) {
		this.cachekey = utils.CRC32(get_group_crc_tf().EvalWithMetadb(handle));
	}
};

oItem = function(playlist, row_index, type, handle, track_index, group_index, track_index_in_group, heightInRow, groupRowDelta, obj, empty_row_index) {
	this.type = type;
	this.playlist = playlist;
	this.row_index = row_index;
	this.metadb = handle;
	this.track_index = track_index;
	this.track_index_in_group = track_index_in_group;
	this.group_index = group_index;
	this.heightInRow = heightInRow;
	this.groupRowDelta = groupRowDelta;
	this.obj = obj;
	this.empty_row_index = empty_row_index;
	this.tracktype = TrackType(this.metadb.RawPath.substring(0, 4));
	this.l_rating = 0;
	this.l_mood = 0;

	this.setGroupMeta = function() {
		if (this.type == 1) {
			if (this.metadb) {
				this.l1 = tf_cached(p.list.groupby[layout.pattern_idx].l1).EvalWithMetadb(this.metadb);
				this.r1 = tf_cached(p.list.groupby[layout.pattern_idx].r1).EvalWithMetadb(this.metadb);
				this.l2 = tf_cached(p.list.groupby[layout.pattern_idx].l2).EvalWithMetadb(this.metadb);
				this.r2 = tf_cached(p.list.groupby[layout.pattern_idx].r2).EvalWithMetadb(this.metadb);
			};
		};
	};
	this.setGroupMeta();

	this.parseTF = function(tf, default_color) {
		var result = Array(tf, default_color);
		var txt = "",
			i = 1,
			tmp = "";
		var pos = tf.indexOf(String.fromCharCode(3));
		if (pos > -1) {
			var tab = tf.split(String.fromCharCode(3));
			var fin = tab.length;
			// if first part is text (not a color)
			if (pos > 0) txt = tab[0];
			// get color and other text part
			tmp = tab[1];
			result[1] = eval("0xFF" + tmp.substr(4, 2) + tmp.substr(2, 2) + tmp.substr(0, 2));
			while (i < fin) {
				txt = txt + tab[i + 1];
				i += 2;
			};
			result[0] = txt;
		};
		return result;
	};

	this.drawRowContents = function(gr) {
		// Draw columns content
		var cx, cw, tf1, tf2;
		if (layout.enableExtraLine) {
			var tf1_y = this.y;
			var tf1_h = Math.round(0.62 * this.h);
			var tf2_y = Math.round(this.y + 0.82*tf1_h);
			var tf2_h = Math.round(this.h - 0.82*tf1_h);
		} else {
			var tf1_y = this.y;
			var tf1_h = this.h;
			var tf2_y = 0;
			var tf2_h = 0;
		}
		var _playing_idx = this._playing_idx;
		var fin = p.headerBar.columns.length;
		for (var j = 1; j < fin; j++) {
			tf1 = tf2 = null;
			if (p.headerBar.columns[j].w > 0) {
				cx = p.headerBar.columns[j].x + g_z4;
				cw = (Math.abs((p.headerBar.w - p.headerBar.columns[0].w)* p.headerBar.columns[j].percent / 10000)) - g_z10;
				switch (p.headerBar.columns[j].ref) {
				case "状态":
					if (p.headerBar.columns[j].tf == "null") {
						var columnColor = this.text_colour;
					}
					else {
						if (typeof(this.state_color) == "undefined" && p.headerBar.columns[j].tf != "null") {
							this.state_tf = tf_cached(p.headerBar.columns[j].tf).EvalWithMetadb(this.metadb);
							var stateArray = this.parseTF(this.state_tf, this.text_colour);
							this.state_tf = stateArray[0];
							this.state_color = stateArray[1];
						};
						var columnColor = this.state_color;
					};
					var imgw = images.playing_ico.Width;
					let icon_y = this.y + Math.round((cTrack.height - imgw)/2);
					let rectz = Math.round(cTrack.height*0.6);
					switch (p.headerBar.columns[j].align) {
					case 0:
						var icon_x = cx;
						var bg_x = cx;
						break;
					case 1:
						var icon_x = cx + Math.round((cw - imgw)/2);
						var bg_x = cx + Math.round((cw - rectz)/2);
						break;
					case 2:
						var icon_x = cx + cw - imgw;
						var bg_x = cx + cw - rectz;
						break;
					};
					var bgy = this.y + Math.round(rectz/3);
					if(_playing_idx){
						if (g_seconds / 2 == Math.floor(g_seconds / 2)) gr.DrawImage(images.playing_ico, icon_x, icon_y, imgw, imgw, 0, 0, imgw, imgw, 0, 100);
						else gr.DrawImage(images.playing_ico, icon_x, icon_y, imgw, imgw, 0, 0, imgw, imgw, 0, 255);
					} else if (this.queue_idx > 0) {
						gr.FillSolidRect(cx, bgy, cw, rectz, InfoPane.c_border);
						gr.GdiDrawText(num(this.queue_idx, 2), g_font_b, c_white, cx, this.y, cw, cTrack.height, cc_txt);
					} else {
						gr.FillSolidRect(bg_x, bgy, rectz, rectz, g_color_status);
						if (this._sel) gr.DrawImage(images.selected_ico, icon_x, icon_y, imgw, imgw, 0, 0, imgw, imgw, 0, 255);
					}
					break;
				case "喜爱":
					if (typeof(this.mood) == "undefined") {
						this.mood = tf_cached(p.headerBar.columns[j].tf).EvalWithMetadb(this.metadb);
						var moodArray = this.parseTF(this.mood, this.text_colour);
						this.mood = moodArray[0];
					};
					columns.mood = true;
					// column width
					var imgh = images.mood_ico.Height/2;
					var imgw = images.mood_ico.Width;
					columns.mood_w = imgw + 3;
					// for minimum width for this column
					p.headerBar.columns[j].minWidth = z(36);
					// column x
					switch (p.headerBar.columns[j].align) {
					case 0:
						columns.mood_x = cx - 2;
						break;
					case 1:
						columns.mood_x = Math.round(cx + (cw - columns.mood_w) / 2);
						break;
					case 2:
						columns.mood_x = cx + cw - columns.mood_w + 6;
						break;
					};
					if (_playing_idx) {
						gr.DrawImage(images.mood_ico_playing, columns.mood_x, Math.round(this.y + cTrack.height / 2 - imgh/2), imgw, imgh, 0, (this.mood != 0 ? imgh : 0), imgw, imgh, 0, 255);
					} else {
						gr.DrawImage(images.mood_ico, columns.mood_x, Math.round(this.y + cTrack.height / 2 - imgh/2), imgw, imgh, 0, (this.mood != 0 ? imgh : 0), imgw, imgh, 0, 255);
					}
					break;
				case "等级":
					cw = p.headerBar.columns[j].w - g_z6;
					if (typeof(this.rating) == "undefined") {
						this.rating = tf_cached(p.headerBar.columns[j].tf).EvalWithMetadb(this.metadb);
						var ratingArray = this.parseTF(this.rating, this.text_colour);
						this.rating = ratingArray[0];
					};
					imgh = images.star_playing.Height;
					columns.rating = true;
					// column width
					columns.rating_w = imgh * 5;
					// for minimum width for this column
					p.headerBar.columns[j].minWidth = columns.rating_w * 1.2;
					//
					var one_star_w = Math.round(columns.rating_w / 5);
					var total_stars_drawable = Math.floor((cw - 2) / one_star_w);
					if (total_stars_drawable > 5) total_stars_drawable = 5;
					// column x
					switch (p.headerBar.columns[j].align) {
					case 0:
						columns.rating_x = cx - 2 + 3;
						break;
					case 1:
						columns.rating_x = cx + 3 + Math.round((cw - 6 - one_star_w * total_stars_drawable) / 2) - 1;
						break;
					case 2:
						columns.rating_x = cx + 3 + cw - 6 - one_star_w * total_stars_drawable;
						break;
					};
					var active_star_num = Math.round(this.rating > total_stars_drawable ? total_stars_drawable : this.rating);
					if (_playing_idx) {
						for (var i = 0; i < total_stars_drawable; i++) {
							gr.DrawImage(images.star_playing, columns.rating_x - 3 + i * imgh, Math.round(this.y + cTrack.height / 2 - imgh/2), imgh, imgh, 0, 0, imgh, imgh, 0, 255);
						}
						for (var i = 0; i < active_star_num; i++) {
							gr.DrawImage(images.star_h_playing, columns.rating_x - 3 + i * imgh, Math.round(this.y + cTrack.height / 2 - imgh/2), imgh, imgh, 0, 0, imgh, imgh, 0, 255);
						}
					} else {
						for (var i = 0; i < total_stars_drawable; i++) {
							gr.DrawImage(images.star, columns.rating_x - 3 + i * imgh, Math.round(this.y + cTrack.height / 2 - imgh/2), imgh, imgh, 0, 0, imgh, imgh, 0, 255);
						}
						for (var i = 0; i < active_star_num; i++) {
							gr.DrawImage(images.star_h, columns.rating_x - 3 + i * imgh, Math.round(this.y + cTrack.height / 2 - imgh/2), imgh, imgh, 0, 0, imgh, imgh, 0, 255);
						}
					}
					if (total_stars_drawable < 5) {
						var drawn_star_w = total_stars_drawable * imgh;
						gr.GdiDrawText("...", g_font, this.text_colour_default, columns.rating_x - 6 + drawn_star_w, this.y, cw + 1, cTrack.height, lc_txt);
					};
					break;
				default:
					// Common TF parsing
					var eval_play = false;
					var col = p.headerBar.columns[j];
					var tf_raw = col.tf;
					// PARSING special TF fields in 1st TF line
					if (tf_raw != "null") {
						if (!has_dynamic_tf(tf_raw)) {
							// 静态模板直接复用已编译的 TitleFormat
							var tf1_obj = tf_cached(tf_raw);
							tf1 = _playing_idx ? tf1_obj.Eval(true) : tf1_obj.EvalWithMetadb(this.metadb);
						}
						else {
							var tf_prep = tf_raw;
							// %list_index%
							tf_prep = replaceAll(tf_prep, "%list_index%", (this.track_index + 1).toString());
							// %list_total%
							tf_prep = replaceAll(tf_prep, "%list_total%", p.list.count.toString());
							// %isplaying%
							if (_playing_idx) {
								tf_prep = replaceAll(tf_prep, "%isplaying%", "$greater(1,0)");
								eval_play = true;
							}
							else {
								tf_prep = replaceAll(tf_prep, "%isplaying%", "$greater(0,1)");
							};
							// Evaluate TF field after parsing
							if (eval_play) {
								tf1 = fb.TitleFormat(tf_prep).Eval(true);
							}
							else {
								tf1 = fb.TitleFormat(tf_prep).EvalWithMetadb(this.metadb);
							};
						};
					};
				};
				// draw the general field parsed above
				// ===================================
				if (j > 0 && tf1 && tf1 != "null") {
					//try {
					gr.GdiDrawText(tf1, g_font, this.text_colour, cx, tf1_y, cw, tf1_h, p.headerBar.columns[j].DT_align | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX | DT_END_ELLIPSIS);
					if (layout.enableExtraLine) {
						var tf2_raw = col.tf2;
						// PARSING special TF fields in extra TF line
						if (tf2_raw != "null") {
							if (!has_dynamic_tf(tf2_raw)) {
								var tf2_obj = tf_cached(tf2_raw);
								tf2 = _playing_idx ? tf2_obj.Eval(true) : tf2_obj.EvalWithMetadb(this.metadb);
							}
							else {
								var tf2_prep = tf2_raw;
								// %list_index%
								tf2_prep = replaceAll(tf2_prep, "%list_index%", (this.track_index + 1).toString());
								// %list_total%
								tf2_prep = replaceAll(tf2_prep, "%list_total%", p.list.count.toString());
								// %isplaying%
								if (_playing_idx) {
									tf2_prep = replaceAll(tf2_prep, "%isplaying%", "$greater(1,0)");
									eval_play = true;
								}
								else {
									tf2_prep = replaceAll(tf2_prep, "%isplaying%", "$greater(0,1)");
								};
								// Evaluate TF field after parsing
								if (eval_play) {
									tf2 = fb.TitleFormat(tf2_prep).Eval(true);
								}
								else {
									tf2 = fb.TitleFormat(tf2_prep).EvalWithMetadb(this.metadb);
								};
							};
						}
						else {
							tf2 = "";
						};
						gr.GdiDrawText(tf2, g_font_2, _playing_idx ? g_color_playing_txt : p.list.fontgrey, cx, tf2_y, cw, tf2_h, p.headerBar.columns[j].DT_align | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX | DT_END_ELLIPSIS);
					};
					//}; catch (e) {};
				};
			}
			else {
				switch (p.headerBar.columns[j].ref) {
				case "喜爱":
					columns.mood = false;
					break;
				case "等级":
					columns.rating = false;
					break;
				};
			};
		};
	};

	this.draw = function(gr, x, y, w, h) {
		this.x = x; // + 1;
		this.y = y;
		this.w = w; // - 2;
		this.h = h;
		this.cal_y1 = this.y + this.h - cList.borderWidth_half * 2;
		switch (this.type) {
		case 0:
			// ===============
			// draw track item
			// ===============
			if (p.headerBar.columns[0].w > 0) {
				cover.w = p.headerBar.columns[0].w;
				cover.h = cover.w;
			}
			else {
				cover.w = 0;
				cover.h = 0;
			};
			var tcolumn_x = this.x + Math.floor(cover.w);
			var line_width = this.w - cover.w + cScrollBar.width;
			var _playing_idx = (fb.IsPlaying && plman.PlayingPlaylist == this.playlist && this.track_index == p.list.nowplaying.PlaylistItemIndex);
			var _sel = false;
			if (this.empty_row_index == 0 && !_playing_idx) {
				// 每行每帧只查询一次选中状态，drawRowContents 里复用
				_sel = plman.IsPlaylistItemSelected(p.list.playlist, this.track_index);
			};
			if (this.empty_row_index == 0) {
				this._playing_idx = _playing_idx;
				this._sel = _sel;
				// 队列为空时不做原生查找（大列表滚动时每帧每行一次的开销）
				this.queue_idx = (p.list.queue_total > 0) ? plman.FindPlaybackQueueItemIndex(this.metadb, this.playlist, this.track_index) + 1 : 0;
				if (_playing_idx) {
					// playing track bg
					gr.FillSolidRect(tcolumn_x, this.y, line_width, this.h, g_color_highlight);
					this.text_colour = g_color_playing_txt;
					p.list.nowplaying_y = this.y;
				}
				else {
					// no playing track bg
					if (_sel) {
						if (p.list.focusedTrackId == this.track_index) {
							gr.FillSolidRect(tcolumn_x, this.y, line_width, this.h, g_color_selected_bg);
						}
						else {
							gr.FillSolidRect(tcolumn_x, this.y, line_width, this.h, g_color_selected_bg2);
						};
						this.text_colour = g_color_selected_txt;
					}
					else {
						// if row is focused, draw focused colors & style ELSE draw with normal colors
						if (p.list.focusedTrackId == this.track_index) {
							// frame on focused item
							gr.DrawRect(tcolumn_x + 1, this.y + 1, line_width - 2, this.h - 1, 2, g_color_selected_bg);
						};
						this.text_colour = g_color_normal_txt;
					};
				};
			};

			// Draw Track content
			// ==================
			if (this.empty_row_index == 0) {
				this.text_colour_default = this.text_colour;
				this.drawRowContents(gr);
			};

			// Draw cover art
			// ==============
			if (cover.w > 0) {
				if (this.row_index == 0 && this.track_index_in_group > 0 && this.track_index_in_group <= Math.ceil(cover.h / cTrack.height)) {
					var cover_draw_delta = this.track_index_in_group * cTrack.height;
				}
				else {
					var cover_draw_delta = 0;
				};
				if ((this.track_index_in_group == 0 || (this.row_index == 0 && cover_draw_delta > 0))) {
					// cover bg
					var cv_x = Math.floor(this.x);
					var cv_y = Math.floor(this.y - cover_draw_delta);
					var cv_w = Math.floor(cover.w) - 1;
					var cv_h = Math.floor(cover.h);

					if(p.list.groups[this.group_index].load_requested == 0)
						p.list.groups[this.group_index].cover_img = g_image_cache.hit(this.group_index);
					//
					if (typeof p.list.groups[this.group_index].cover_img != "undefined") {
						if (p.list.groups[this.group_index].cover_img == null) p.list.groups[this.group_index].cover_img = images.nocover;
						if (p.list.groups[this.group_index].cover_img) {
							if (cover.keepaspectratio) {
								// *** check aspect ratio *** //
								if (p.list.groups[this.group_index].cover_img.Height >= p.list.groups[this.group_index].cover_img.Width) {
									var ratio = p.list.groups[this.group_index].cover_img.Width / p.list.groups[this.group_index].cover_img.Height;
									var cv_offset = Math.floor((cv_h - cv_w * ratio) / 2);
									cv_x += cv_offset;
									cv_w = cv_w - cv_offset * 2;
									cv_h = cv_h;
								}
								else {
									var ratio = p.list.groups[this.group_index].cover_img.Height / p.list.groups[this.group_index].cover_img.Width;
									var cv_offset = Math.floor((cv_w - cv_h * ratio) / 2);
									cv_y += cv_offset;
									cv_w = cv_w;
									cv_h = cv_h - cv_offset * 2;
								};
								// *** check aspect ratio *** //
							};
							gr.DrawImage(p.list.groups[this.group_index].cover_img, cv_x, cv_y, cv_w, cv_h, 1, 1, p.list.groups[this.group_index].cover_img.Width-2, p.list.groups[this.group_index].cover_img.Height-2);
						};
					}
					else {
						var cv_resizew = Math.max(1, cv_w);
						gr.DrawImage(images.nocover, cv_x, cv_y, cv_resizew, cv_resizew, 0, 0, images.nocover.Width, images.nocover.Height);
					};
				};
			};
			if (this.empty_row_index == 0) {
				if (cover.w > 0) {
					if(layout.expandedHeight != 1 || !layout.showgroupheaders) gr.DrawLine(tcolumn_x - 1, this.y + 1, tcolumn_x - 1, this.y + this.h, 1, g_color_line);
					if(this.track_index_in_group == p.list.groups[this.group_index].rowCount -1){
						if(!layout.showgroupheaders) gr.FillSolidRect(this.x, this.y + this.h, this.w + cScrollBar.width, 1, g_color_line_div);
						else gr.FillSolidRect(this.x, this.y + this.h, this.w + cScrollBar.width, 1, g_color_line);
					} else gr.FillSolidRect(tcolumn_x, this.y + this.h, line_width, 1, g_color_line);
				} else gr.FillSolidRect(tcolumn_x, this.y + this.h, line_width, 1, g_color_line);
			}

			// if dragging items, draw line at top of the hover items to show where dragged items will be inserted on mouse button up
			if (!properties.enableTouchControl) {
				if (this.empty_row_index == 0) {
					if (g_dragndrop_status && dragndrop.drop_id == this.track_index && p.list.ishover && !g_dragndrop_bottom) {
						if (!plman.IsPlaylistItemSelected(p.list.playlist, this.track_index)) {
							if (this.track_index > dragndrop.drag_id) {
								gr.FillSolidRect(tcolumn_x, this.cal_y1, this.w - cover.w, cList.borderWidth, g_color_normal_txt);
								//dragndrop.drop_id = this.track_index;
							}
							else if (this.track_index < dragndrop.drag_id) {
								gr.FillSolidRect(tcolumn_x, this.y - cList.borderWidth_half, this.w - cover.w, cList.borderWidth, g_color_normal_txt);
								//dragndrop.drop_id = this.track_index;
							};
						}
						else {
							dragndrop.drop_id = -1;
						};
					};
				};
			};
			break;
		case 1:
			// ===============
			// draw group item
			// ===============
			if (this.obj) {
				if (p.headerBar.columns[0].w <= 0 || this.obj.collapsed) {
					if (this.heightInRow > 1 && cover.show) {
						cover.h = this.heightInRow * cTrack.height;
						cover.w = cover.h;
					}
					else {
						cover.h = g_z5;
						cover.w = cover.h;
					};
				}
				else {
					cover.h = g_z4;
					cover.w = cover.h;
				};
			}
			else {
				cover.h = g_z4;
				cover.w = cover.h;
			};
			var groupDelta = this.groupRowDelta * cTrack.height;

			// group header bg
			var line_width = this.w + cScrollBar.width;
			if(this.heightInRow == 1){
				gr.FillSolidRect(this.x, (this.y - groupDelta), line_width, 1, g_color_normal_bg);
				this.l1_color = p.list.lcolor_85;
				this.l2_color = p.list.lcolor_75;
			}else{
				gr.FillSolidRect(this.x, (this.y - groupDelta), line_width, this.h, g_group_header_bg);
				if(this.obj.collapsed){
					gr.FillSolidRect(this.x, (this.y + this.h - groupDelta)-2, line_width, 1, g_color_line);
					gr.FillSolidRect(this.x, (this.y + this.h - groupDelta)-1, line_width, 1, g_group_header_div);
				} else gr.FillSolidRect(this.x, (this.y + this.h - groupDelta)-1, line_width, 1, g_color_line);
				this.l1_color = g_color_normal_txt;
				this.l2_color = p.list.fontgrey;
			}
			// Draw Header content
			// ===================
			var line_x = this.x + cover.w + g_z2;
			var vpadding = g_z3;
			var l1_y = this.y - groupDelta;
			var r1_w = gr.CalcTextWidth(this.r1, g_font_group1) + g_z10;
			var w_l1 = this.w - r1_w;
			switch (this.heightInRow) {
			case 1:
				gr.GdiDrawText(this.l1, g_font_group1, this.l1_color, line_x, l1_y - 1, w_l1, this.h, lcs_txt);
				var l1_x1 = gr.CalcTextWidth(this.l1, g_font_group1);
				var txt_l2 = "";
				if(this.l2 != "" && !(layout.pattern_idx == 0 && this.l1 == "单曲" && this.obj.count > 1)) {
					txt_l2 = " | " + this.l2;
					var w_l2 = w_l1 - Math.min(l1_x1, w_l1);
					if(w_l2 > g_z30) gr.GdiDrawText(txt_l2, g_font_group2, this.l2_color, line_x + l1_x1, l1_y - 1, w_l2, this.h, lcs_txt);
				}
				gr.GdiDrawText(this.r1, g_font_group1, this.l1_color, line_x, l1_y - 1, this.w - g_z7, this.h, rcs_txt);
				l1_x1 = line_x + l1_x1 + gr.CalcTextWidth(txt_l2, g_font_group2) + g_z7;
				if(this.r1 == " ") var addon_w = 0;
				else var addon_w = r1_w;
				gr.FillSolidRect(l1_x1, (this.y + this.h/2 - groupDelta), this.w - l1_x1 - addon_w, 1, g_color_highlight);
				break;
			case 2:
				if(this.obj){
					this.r2 = this.obj.count + "首";
				}
				var r2_w = gr.CalcTextWidth(this.r2, g_font_group2) + g_z10;
				gr.GdiDrawText(this.l1, g_font_group1, this.l1_color, line_x, l1_y + vpadding, this.w - cover.w - r1_w, cTrack.height * 1.15, lcs_txt);
				gr.GdiDrawText(this.l2, g_font_group2, this.l2_color, line_x, l1_y + cTrack.height, this.w - cover.w - r2_w, cTrack.height, lcs_txt);
				gr.GdiDrawText(this.r1, g_font_group1, this.l1_color, line_x, l1_y + vpadding, this.w - cover.w - g_z7, cTrack.height * 1.15, rcs_txt);
				gr.GdiDrawText(this.r2, g_font_group2, this.l2_color, line_x, l1_y + cTrack.height, this.w - cover.w - g_z7, cTrack.height, rcs_txt);
				break;
			case 3:
				var r2_w = gr.CalcTextWidth(this.r2, g_font_group2) + g_z10;
				gr.GdiDrawText(this.l1, g_font_group1, this.l1_color, line_x, l1_y + vpadding, this.w - cover.w - r1_w, cTrack.height * 1.15, lcs_txt);
				gr.GdiDrawText(this.l2, g_font_group2, this.l2_color, line_x, l1_y + cTrack.height, this.w - cover.w - r2_w, cTrack.height, lcs_txt);
				gr.GdiDrawText(this.r1, g_font_group1, this.l1_color, line_x, l1_y + vpadding, this.w - cover.w - g_z7, cTrack.height * 1.15, rcs_txt);
				gr.GdiDrawText(this.r2, g_font_group2, this.l2_color, line_x, l1_y + cTrack.height, this.w - cover.w - g_z7, cTrack.height, rcs_txt);
				if (this.obj) {
					var lg3_left_field = this.obj.count + "首, " + this.obj.total_group_duration_txt;
				}
				else {
					var lg3_left_field = "";
				}
				var lg3_right_field = (this.group_index + 1) + " / " + p.list.groups.length;
				var r3_w = gr.CalcTextWidth(lg3_right_field, g_font) + g_z10;
				gr.GdiDrawText(lg3_left_field, g_font, p.list.fontgrey, line_x, l1_y + cTrack.height * 2 - vpadding, this.w - cover.w - r3_w, cTrack.height, lcs_txt);
				gr.GdiDrawText(lg3_right_field, g_font, p.list.fontgrey, line_x, l1_y + cTrack.height * 2 - vpadding, this.w - cover.w - g_z8, cTrack.height, rcs_txt);
				break;
			};

			// highlight group that contains a selected track（展开分组无需扫描曲目）
			var sel_found = false;
			if (this.obj && this.obj.collapsed) {
				for (var k = 0; k < this.obj.count; k++) {
					if (plman.IsPlaylistItemSelected(p.list.playlist, this.obj.start + k)) {
						gr.FillSolidRect(this.x, (this.y - groupDelta), this.w + cScrollBar.width, this.h - 2, g_color_selected_bg & 0x75ffffff);
						sel_found = true;
						break;
					};
				};
			};
		 // highlight the now playing group header（与曲目数无关，只判断一次）
			if (!sel_found && this.obj && this.obj.collapsed && fb.IsPlaying && plman.PlayingPlaylist == this.playlist && p.list.nowplaying.PlaylistItemIndex >= this.obj.start && p.list.nowplaying.PlaylistItemIndex < this.obj.start + this.obj.count) {
				gr.FillSolidRect(this.x, (this.y - groupDelta) - 1, this.w + cScrollBar.width, this.h, g_color_highlight & 0x75ffffff);
			};

			// Draw cover art
			// ==============
			if (this.obj) {
				if (p.headerBar.columns[0].w <= 0 || this.obj.collapsed) {
					if (this.heightInRow > 1 && cover.show) {
						// cover bg
						var cv_x = Math.floor(this.x + cover.margin);
						var cv_y = Math.floor((this.y - groupDelta) + cover.margin + 1);
						var cv_w = Math.floor(cover.w - cover.margin * 2);
						var cv_h = Math.floor(cover.h - cover.margin * 2);
						//
						if(p.list.groups[this.group_index].load_requested == 0)
							p.list.groups[this.group_index].cover_img = g_image_cache.hit(this.group_index);
						//
						if (typeof p.list.groups[this.group_index].cover_img != "undefined") {
							if (p.list.groups[this.group_index].cover_img == null) p.list.groups[this.group_index].cover_img = images.nocover;
							if (p.list.groups[this.group_index].cover_img) {
								if (cover.keepaspectratio) {
									// *** check aspect ratio *** //
									if (p.list.groups[this.group_index].cover_img.Height >= p.list.groups[this.group_index].cover_img.Width) {
										var ratio = p.list.groups[this.group_index].cover_img.Width / p.list.groups[this.group_index].cover_img.Height;
										var cv_offset = Math.floor((cv_h - cv_w * ratio) / 2);
										cv_x += cv_offset;
										cv_w = cv_w - cv_offset * 2 - 1;
										cv_h = cv_h - 1;
									}
									else {
										var ratio = p.list.groups[this.group_index].cover_img.Height / p.list.groups[this.group_index].cover_img.Width;
										var cv_offset = Math.floor((cv_w - cv_h * ratio) / 2);
										cv_y += cv_offset;
										cv_w = cv_w - 1;
										cv_h = cv_h - cv_offset * 2 - 1;
									};
									// *** check aspect ratio *** //
								};
								gr.DrawImage(p.list.groups[this.group_index].cover_img, cv_x, cv_y, cv_w, cv_h, 1, 1, p.list.groups[this.group_index].cover_img.Width-2, p.list.groups[this.group_index].cover_img.Height-2);
							};
						}
						else {
							var cv_resizew = Math.max(1, cv_w);
							gr.DrawImage(images.nocover, cv_x, cv_y, cv_resizew, cv_resizew, 0, 0, images.nocover.Width, images.nocover.Height);
						};
					};
				};
			};

			// if dragging items, draw line at top of the hover items to show where dragged items will be inserted on mouse button up
			if (this.obj) {
				if (!properties.enableTouchControl) {
					if (g_dragndrop_status && this.ishover && p.list.ishover && this.obj.collapsed) {
						if (!plman.IsPlaylistItemSelected(plman.ActivePlaylist, this.track_index)) {
							if (this.track_index <= dragndrop.drag_id  && !g_dragndrop_bottom) {
								if (this.groupRowDelta == 0) {
									gr.FillSolidRect(this.x, this.y - cList.borderWidth_half, this.w, cList.borderWidth, g_color_normal_txt);
								}
								//dragndrop.drop_id = this.track_index;
							}
							else {
								gr.FillSolidRect(this.x, this.cal_y1, this.w, cList.borderWidth, g_color_normal_txt);
								dragndrop.drop_id = this.track_index + this.obj.count - 1;
							};
						}
						else {
							dragndrop.drop_id = -1;
						};
					};
				};
			};
			break;
		};
	};

	this.dragndrop_check = function(x, y, id) {
		var groupDelta = this.groupRowDelta * cTrack.height;
		this.ishover = (x >= this.x + p.headerBar.columns[0].w * (1 - this.type) && x < this.x + this.w && y >= this.y && y < this.y + this.h - groupDelta);
		if(this.ishover) dragndrop.drop_id = this.track_index;
	};

	this.check = function(event, x, y) {
		var groupDelta = this.groupRowDelta * cTrack.height;
		this.ishover = (x >= this.x && x < this.x + this.w && y >= this.y && y < this.y + this.h - groupDelta);

		var prev_rating_hover = this.rating_hover;
		var prev_l_rating = this.l_rating;
		var prev_mood_hover = this.mood_hover;
		var prev_l_mood = this.l_mood;
		this.rating_hover = (this.type == 0 && this.empty_row_index == 0 && x >= columns.rating_x && x <= columns.rating_x + columns.rating_w && y > this.y + 2 && y < this.y + this.h - 2);
		this.mood_hover = (this.type == 0 && this.empty_row_index == 0 && x >= columns.mood_x && x <= columns.mood_x + columns.mood_w - 3 && y > this.y + 2 && y < this.y + this.h - 2);

		switch (event) {
		case "down":
			if (this.ishover) {
				if (cTouch.down) {
					cTouch.down_id = this.track_index;
				};
				if (!cTouch.down || (cTouch.down && cTouch.down_id == cTouch.up_id)) {
					p.list.item_clicked = true;
					if (this.type == 1) { // group header
						if (utils.IsKeyPressed(VK_SHIFT)) {
							if (this.obj && p.list.focusedTrackId != this.track_index) {
								if (p.list.SHIFT_start_id != null) {
									p.list.selectAtoB(p.list.SHIFT_start_id, this.track_index + this.obj.count - 1);
								}
								else {
									p.list.selectAtoB(p.list.focusedTrackId, this.track_index + this.obj.count - 1);
								};
							};
						}
						else if (utils.IsKeyPressed(VK_CONTROL)) {
							plman.SetPlaylistFocusItem(p.list.playlist, this.track_index);
							p.list.selectGroupTracks(this.group_index, true);
							p.list.SHIFT_start_id = null;
						}
						else {
							plman.SetPlaylistFocusItem(p.list.playlist, this.track_index);
							plman.ClearPlaylistSelection(p.list.playlist);
							if (this.obj) {
								if ((layout.autocollapse && !this.obj.collapsed) || !layout.autocollapse) {
									p.list.selectGroupTracks(this.group_index, true);
								};
							};
							p.list.SHIFT_start_id = null;
							if (p.list.metadblist_selection.Count >= 1) {
								dragndrop.clicked = true;
								dragndrop.drag_id = this.track_index;
							};
						};
						if (this.obj && layout.autocollapse) {
							if (this.obj.collapsed) {
								p.list.updateGroupStatus(this.group_index);
								full_repaint();
							};
						};
						p.list.metadblist_selection = plman.GetPlaylistSelectedItems(p.list.playlist);
					}
					else { // track
						if (this.rating_hover) {
							columns.rating_drag = true;
						}
						else if (this.mood_hover) {
							columns.mood_drag = true;
						}
						else {
							if (plman.IsPlaylistItemSelected(p.list.playlist, this.track_index)) {
								if (p.list.metadblist_selection.Count >= 1) {
									dragndrop.clicked = true;
									if (p.list.metadblist_selection.Count > 1) {
										// test if selection is contigus, if not, drag'n drop disable
										var first_item_selected_id = p.list.handleList.Find(p.list.metadblist_selection[0]);
										var last_item_selected_id = p.list.handleList.Find(p.list.metadblist_selection[p.list.metadblist_selection.Count - 1]);
										var contigus_count = (last_item_selected_id - first_item_selected_id) + 1;
									}
									else {
										var contigus_count = 0;
									};
									if (p.list.metadblist_selection.Count == 1 || (p.list.metadblist_selection.Count > 1 && p.list.metadblist_selection.Count == contigus_count)) {
										dragndrop.contigus_sel = true;
										dragndrop.drag_id = this.track_index;
									}
									else if (p.list.metadblist_selection.Count > 1) {
										dragndrop.contigus_sel = false;
										dragndrop.drag_id = this.track_index;
									};
								};
								if (utils.IsKeyPressed(VK_SHIFT)) {
									if (p.list.focusedTrackId != this.track_index) {
										if (p.list.SHIFT_start_id != null) {
											p.list.selectAtoB(p.list.SHIFT_start_id, this.track_index);
										}
										else {
											p.list.selectAtoB(p.list.focusedTrackId, this.track_index);
										};
									};
								}
								else if (utils.IsKeyPressed(VK_CONTROL)) {
									plman.SetPlaylistSelectionSingle(p.list.playlist, this.track_index, false);
								}
								else if (p.list.metadblist_selection.Count == 1) {
									plman.SetPlaylistFocusItem(p.list.playlist, this.track_index);
									plman.ClearPlaylistSelection(p.list.playlist);
									plman.SetPlaylistSelectionSingle(p.list.playlist, this.track_index, true);
								};
							}
							else { // click on a not selected track
								if (utils.IsKeyPressed(VK_SHIFT)) {
									if (p.list.focusedTrackId != this.track_index) {
										if (p.list.SHIFT_start_id != null) {
											p.list.selectAtoB(p.list.SHIFT_start_id, this.track_index);
										}
										else {
											p.list.selectAtoB(p.list.focusedTrackId, this.track_index);
										};
									};
								}
								else {
									if (!properties.enableTouchControl) {
										p.list.selX = x;
										p.list.selY = y;
										p.list.drawRectSel_click = true;
										p.list.selStartId = this.track_index;
										p.list.selStartOffset = p.list.offset;
										p.list.selEndOffset = p.list.offset;
										p.list.selDeltaRows = 0;
										p.list.selAffected.splice(0, p.list.selAffected.length);
									};
									plman.SetPlaylistFocusItem(p.list.playlist, this.track_index);
									if (!utils.IsKeyPressed(VK_CONTROL)) {
										plman.ClearPlaylistSelection(p.list.playlist);
									};
									plman.SetPlaylistSelectionSingle(p.list.playlist, this.track_index, true);
									p.list.SHIFT_start_id = null;
								};
							};
							p.list.metadblist_selection = plman.GetPlaylistSelectedItems(p.list.playlist);
						};
					};
				};
			};
			break;
		case "dblclk":
			if (this.ishover) {
				if (this.type == 1) { // group header
					if (!layout.autocollapse) {
						if (this.obj) {
							if (this.obj.collapsed) {
								p.list.updateGroupsOnExpand(this.group_index);
							}
							else {
								p.list.updateGroupsOnCollapse(this.group_index);
							};
						};
					};
					p.list.setItems(false);
					full_repaint();
				}
				else { // track
					if (properties.defaultPlaylistItemAction != 0) {
						plman.ExecutePlaylistDefaultAction(p.list.playlist, this.track_index);
					}
					else {
						fb.RunContextCommandWithMetadb("添加到播放队列", this.metadb, 0);
					};
				};
			};
			break;
		case "up":
			if (this.ishover) {
				if (cTouch.down) {
					cTouch.up_id = this.track_index;
					if (cTouch.down_id == cTouch.up_id) {
						this.check("down", x, y);
					};
				};
				if (!cTouch.down || (cTouch.down && cTouch.down_id == cTouch.up_id)) {
					if (this.rating_hover && this.metadb) {
						// Rating
						let handle_list = new FbMetadbHandleList(this.metadb);
						// Rate to database statistics brought by foo_playcount.dll
						if (this.l_rating != this.rating) {
							if (cfg_map.rating2tag && this.tracktype < 2) handle_list.UpdateFileInfoFromJSON(JSON.stringify({"RATING" : this.l_rating}));
							fb.RunContextCommandWithMetadb("播放统计信息/等级/" + ((this.l_rating == 0) ? "<未设置>" : this.l_rating), this.metadb) || fb.RunContextCommandWithMetadb("Playback Statistics/Rating/" + ((this.l_rating == 0) ? "<not set>" : this.l_rating), this.metadb);
							this.rating = this.l_rating;
						}
						else {
							if (cfg_map.rating2tag && this.tracktype < 2) handle_list.UpdateFileInfoFromJSON(JSON.stringify({"RATING" : ""}));
							fb.RunContextCommandWithMetadb("播放统计信息/等级/<未设置>", this.metadb) || fb.RunContextCommandWithMetadb("Playback Statistics/Rating/<not set>", this.metadb);
							this.rating = 0;
						};
					}
					else if (this.mood_hover) {
						// Mood
						if (this.tracktype < 2) {
							// tag to file
							let handle_list = new FbMetadbHandleList(this.metadb);
							if (this.l_mood != this.mood) {
								handle_list.UpdateFileInfoFromJSON(JSON.stringify({"MOOD" : getTimestamp()}));
								this.mood = this.l_mood;
							}
							else {
								handle_list.UpdateFileInfoFromJSON(JSON.stringify({"MOOD" : ""}));
								this.mood = 0;
							};
						};
					}
					else if (!cTouch.down) {
						if (!p.list.drawRectSel && plman.IsPlaylistItemSelected(p.list.playlist, this.track_index)) {
							if (!utils.IsKeyPressed(VK_SHIFT) && !utils.IsKeyPressed(VK_CONTROL)) {
								if (!g_dragndrop_status && !dragndrop.leave_flag) {
									if (this.type == 0) { // track
										plman.SetPlaylistFocusItem(p.list.playlist, this.track_index);
										plman.ClearPlaylistSelection(p.list.playlist);
										plman.SetPlaylistSelectionSingle(p.list.playlist, this.track_index, true);
									};
								};
							};
						};
					};
				};
			};
			this.drawRectSel_click = false;
			this.drawRectSel = false;
			dragndrop.clicked = false;
			columns.rating_drag = false;
			columns.mood_drag = false;
			break;
		case "right":
			if (this.ishover) {
				if (this.type == 1) { // group header
					if (!plman.IsPlaylistItemSelected(p.list.playlist, this.track_index)) {
						plman.ClearPlaylistSelection(p.list.playlist);
						plman.SetPlaylistFocusItem(p.list.playlist, this.track_index);
						p.list.selectGroupTracks(this.group_index, true);
						p.list.SHIFT_start_id = null;
					};
					if (!utils.IsKeyPressed(VK_SHIFT)) {
						if(this.tracktype < 2) g_track_type = -1;
						else g_track_type = this.tracktype;
						p.list.contextMenu(x, y, this.track_index, this.row_index);
					};
				}
				else { // track
					if (this.rating_hover) {

					}
					else if (this.mood_hover) {

					}
					else {
						if (plman.IsPlaylistItemSelected(p.list.playlist, this.track_index)) {

						}
						else {
							plman.SetPlaylistFocusItem(p.list.playlist, this.track_index);
							plman.ClearPlaylistSelection(p.list.playlist);
							plman.SetPlaylistSelectionSingle(p.list.playlist, this.track_index, true);
						};
						g_track_type = this.tracktype;//TrackType(fb.GetFocusItem().RawPath.substring(0, 4));
						p.list.contextMenu(x, y, this.track_index, this.row_index);
					};
				};
			};
			break;
		case "move":
			if (this.ishover) {
				var rowindex_pre = InfoPane.rowindex;
				InfoPane.rowindex = this.row_index;
				if(this.empty_row_index != 0 || this.type != 0 || !p.list.ishover) {
					InfoPane.metadb = null;
				}else {
					InfoPane.metadb = this.metadb;
					InfoPane.y = this.y;
				}
				if(InfoPane.show && (rowindex_pre != InfoPane.rowindex)) {
					InfoPane.show = false;
					full_repaint();
				}
			}
			if (columns.rating && !columns.rating_drag) {
				if (this.rating_hover) {
					var one_star_w = Math.round(columns.rating_w / 5);
					this.l_rating = Math.floor((x - columns.rating_x) / one_star_w) + 1;
					if (this.l_rating > 5) this.l_rating = 5;
				}
				else {
					this.l_rating = 0;
				};
			};
			if (columns.mood && !columns.mood_drag) {
				if (this.mood_hover) {
					this.l_mood = 1;
				}
				else {
					this.l_mood = 0;
				};
			};

			// update on mouse move to draw rect selection zone
			if (!this.drawRectSel) {
				this.drawRectSel = this.drawRectSel_click;
			};
			if (p.list.drawRectSel) {
				if (this.ishover) {
					if (this.type == 0) { // track
						p.list.selEndId = this.track_index;
					}
					else { // group header
						// 分组头行作为选区终点时始终取上一行（原三处恒假条件已合并）
						if (this.track_index > 0) {
							p.list.selEndId = this.track_index - 1;
						};
					};

					if (!cList.repaint_timer) {
						window.SetCursor(IDC_HAND);
						cList.repaint_timer = window.SetInterval(function() {
							if (mouse_y < p.list.y) {
								p.list.selEndId = p.list.selEndId > 0 ? p.list.items[0].track_index : 0;
								if (p.scrollbar.visible) on_mouse_wheel(1);
							}
							else if (mouse_y > p.list.y + p.list.h) {
								p.list.selEndId = p.list.selEndId < p.list.count - 1 ? p.list.items[p.list.items.length - 1].track_index : p.list.count - 1;
								if (p.scrollbar.visible) on_mouse_wheel(-1);
							};
							// set selection on items in the rect area drawn
							plman.SetPlaylistSelection(p.list.playlist, p.list.selAffected, false);
							p.list.selAffected.splice(0, p.list.selAffected.length);
							var deb = p.list.selStartId <= p.list.selEndId ? p.list.selStartId : p.list.selEndId;
							var fin = p.list.selStartId <= p.list.selEndId ? p.list.selEndId : p.list.selStartId;
							for (var i = deb; i <= fin; i++) {
								p.list.selAffected.push(i);
							};
							plman.SetPlaylistSelection(p.list.playlist, p.list.selAffected, true);
							p.list.metadblist_selection = plman.GetPlaylistSelectedItems(p.list.playlist);
							plman.SetPlaylistFocusItem(p.list.playlist, p.list.selEndId);
							p.list.selEndOffset = p.list.offset;
						}, 100);
					}
					else {
						window.SetCursor(IDC_ARROW);
					};
				};
			};
			if (dragndrop.clicked) {
				g_dragndrop_status = true;
				dragndrop.leave_flag = true;
				var items = plman.GetPlaylistSelectedItems(p.list.playlist);
				if(this.track_index > -1){
					var line1 = items.Count+" 音轨";
					var line2 = "拖放中";
				}
				var options = {
					show_text : false,
					use_album_art : false,
					use_theming : false,
					custom_image : createDragText(line1, line2)
				}
				var effect = fb.DoDragDrop(window.ID, items, g_drop_effect.copy | g_drop_effect.move | g_drop_effect.link, options);
				// nothing happens here until the mouse button is released
				on_mouse_lbtn_up(x, y);
				items = undefined;
				on_drag_leave();
			};
			break;
		};
	};
};

oGroupBy = function(label, tf, sortOrder, ref, l1, r1, l2, r2) {
	this.label = label;
	this.tf = tf;
	this.sortOrder = sortOrder;
	this.ref = ref;
	this.l1 = l1;
	this.r1 = r1;
	this.l2 = l2;
	this.r2 = r2;
};

oList = function(object_name, playlist) {
	this.objectName = object_name;
	this.playlist = playlist;
	this.focusedTrackId = plman.GetPlaylistFocusItemIndex(this.playlist);
	this.handleList = plman.GetPlaylistItems(this.playlist);
	this.count = this.handleList.Count;
	this.groups = [];
	this.crc_to_groups = {};
	this.items = [];
	this.groupby = [];
	this.totalGroupBy = 0;
	this.metadblist_selection = plman.GetPlaylistSelectedItems(this.playlist);
	this.SHIFT_start_id = null;
	this.SHIFT_count = 0;
	this.ishover = false;
	this.buttonclicked = false;
	this.selAffected = [];
	this.drawRectSel_click = false;
	this.drawRectSel = false;
	this.beam = 0;
	this.item_clicked = false;
	this.queue_total = 0;

	// items variables used in Item object (optimization)
	this.setItemColors = function() {
		this.lcolor_85 = blendColors(g_color_normal_txt, g_color_highlight, 0.85);
		if(dark_mode){
			this.fontgrey = blendColors(c_black, g_color_normal_txt, 0.7);
			this.lcolor_75 = blendColors(c_black, this.lcolor_85, 0.75);
		}
		else{
			this.fontgrey = blendColors(c_white, g_color_normal_txt, 0.7);
			this.lcolor_75 = blendColors(c_white, this.lcolor_85, 0.75);
		}
	};
	this.setItemColors();

	this.writeGroupTable = function() {
		// groupby 数据写入 pv.db 的 group 表：每行一个分组模板（idx 保序）
		try {
			var db = pv_db_open();
			db.Exec('CREATE TABLE IF NOT EXISTS "group" (idx INTEGER PRIMARY KEY, label TEXT, tf TEXT, sort_order TEXT, ref TEXT, l1 TEXT, r1 TEXT, l2 TEXT, r2 TEXT)');
			db.Exec('DELETE FROM "group"');
			for (var i = 0; i < this.groupby.length; i++) {
				db.Exec('INSERT OR REPLACE INTO "group" (idx, label, tf, sort_order, ref, l1, r1, l2, r2) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [i, this.groupby[i].label, this.groupby[i].tf, this.groupby[i].sortOrder, this.groupby[i].ref, this.groupby[i].l1, this.groupby[i].r1, this.groupby[i].l2, this.groupby[i].r2]);
			}
		} catch (e) {
			console.log('WSHplaylist: save group table failed: ' + e.message);
		}
	};

	this.saveGroupBy = function() {
		this.writeGroupTable();
		this.initGroupBy();
	};

	this.initGroupBy = function() {
		this.groupby.splice(0, this.groupby.length);
		var rows = [];
		try {
			if (utils.FileExists(pv_db_path)) {
				var db = utils.OpenDatabase(pv_db_path);
				rows = db.Query('SELECT label, tf, sort_order, ref, l1, r1, l2, r2 FROM "group" ORDER BY idx');
			}
		} catch (e) {
			console.log('WSHplaylist: read group table failed: ' + e.message);
			rows = [];
		}
		if (rows.length == 0) {
			// INITIALIZE GroupBy patterns
			var fields = [];

			for (var i = 0; i < 8; i++) {
				switch (i) {
				case 0:
					fields.push(new Array("专辑 (简单)", "专辑艺术家 | 专辑 | 光盘", "专辑艺术家", "艺术家", "流派", "目录结构"));
					break;
				case 1:
					fields.push(new Array("%album%", "%album artist%%album%%discnumber%", "%album artist%", "%artist%", "%genre%", "$directory_path(%path%)"));
					break;
				case 2:
					fields.push(new Array(sort_pattern_album, sort_pattern_albumartist, sort_pattern_albumartist, sort_pattern_artist, sort_pattern_genre, sort_pattern_path));
					break;
				case 3:
					fields.push(new Array("专辑 (简单)", "专辑", "专辑艺术家", "艺术家", "流派", "目录结构"));
					break;
				case 4:
					// l1
					fields.push(new Array("$if2(%album%,'单曲')", "$if(%album%,%album%$if(%discnumber%,$ifgreater(%totaldiscs%,1,' - [光盘 '%discnumber%$if(%totaldiscs%,'/'%totaldiscs%']',']'),),),$if(%length%,'单曲','网络电台'))", "$if2(%album artist%,'未知艺术家')", "$if2(%artist%,'未知艺术家')", "$if2(%genre%,'未知流派')", "$directory(%path%,1)"));
					break;
				case 5:
					// r1
					if(Number(fb.Version.substr(0, 1)) > 1) fields.push(new Array("$if(%year%,%year%,' ')", "$if(%year%,%year%,' ')", "$if2(%genre%,' ')", "$if2(%genre%,' ')", "", "$if(%year%,%year%,' ')"));
					else fields.push(new Array("$if(%date%,$year($replace(%date%,/,-,.,-)),' ')", "$if(%date%,$year($replace(%date%,/,-,.,-)),' ')", "$if2(%genre%,' ')", "$if2(%genre%,' ')", "", "$if(%date%,$year($replace(%date%,/,-,.,-)),' ')"));
					break;
				case 6:
					// l2
					fields.push(new Array("$if2(%album artist%,'未知艺术家')", "$if2(%album artist%,'未知艺术家')", "", "", "", "$directory(%path%,2)"));
					break;
				case 7:
					// r2
					fields.push(new Array("$if2(%genre%,' ')", "$if2(%genre%,' ')", "", "", "", "$if2(%genre%,' ')"));
					break;
				};
			};
			// create GroupBy Objects
			this.totalGroupBy = fields[0].length;
			for (var k = 0; k < this.totalGroupBy; k++) {
				this.groupby.push(new oGroupBy(fields[0][k], fields[1][k], fields[2][k], fields[3][k], fields[4][k], fields[5][k], fields[6][k], fields[7][k]));
			}
			this.writeGroupTable(); // 默认模板写入 group 表
		}
		else {
			// LOAD GroupBy patterns（group 表，按 idx 保序）
			for (var k = 0; k < rows.length; k++) {
				this.groupby.push(new oGroupBy(rows[k].label, rows[k].tf, rows[k].sort_order, rows[k].ref, rows[k].l1, rows[k].r1, rows[k].l2, rows[k].r2));
			}
			this.totalGroupBy = this.groupby.length;
		};
	};
	this.initGroupBy();

	this.getTotalRows = function() {
		var ct = 0;
		var fin = this.groups.length;
		for (var i = 0; i < fin; i++) {
			this.groups[i].totalPreviousRows += ct;
			if (this.groups[i].collapsed) {
				ct += cGroup.collapsed_height;
			}
			else {
				ct += this.groups[i].count + cGroup.expanded_height;
				ct += this.groups[i].rowsToAdd;
			};
		};
		return ct;
	};

	this.updateGroupsOnCollapse = function(group_id) {
		if (!this.groups[group_id].collapsed) {
			var delta = this.groups[group_id].rowCount + (cGroup.expanded_height - cGroup.collapsed_height);
			var fin = this.groups.length;
			for (var i = group_id + 1; i < fin; i++) {
				this.groups[i].totalPreviousRows -= delta;
			};
			this.totalRows -= delta;
			if (this.totalRows <= this.totalRowVisible) {
				this.offset = 0;
			}
			else {
				if (this.totalRows - this.offset < this.totalRowVisible) {
					this.offset = this.totalRows - this.totalRowVisible;
					if (this.offset < 0) this.offset = 0;
				};
			};
			this.groups[group_id].collapsed = true;
		};
	};

	this.updateGroupsOnExpand = function(group_id) {
		if (this.groups[group_id].collapsed) {
			var delta = this.groups[group_id].rowCount + (cGroup.expanded_height - cGroup.collapsed_height);
			var fin = this.groups.length;
			for (var i = group_id + 1; i < fin; i++) {
				this.groups[i].totalPreviousRows += delta;
			};
			this.totalRows += delta;
			if (this.totalRows <= this.totalRowVisible) {
				this.offset = 0;
			}
			else {
				if (this.totalRows - this.offset < this.totalRowVisible) {
					this.offset = this.totalRows - this.totalRowVisible;
					if (this.offset < 0) this.offset = 0;
				};
			};
			this.groups[group_id].collapsed = false;
		};
	};

	this.updateGroupStatus = function(group_id) {
		// collapse previous group of focused track
		if (layout.autocollapse) {
			this.updateGroupsOnCollapse(g_group_id_focused);
		};
		// expand new group of the current focused track (new one)
		this.updateGroupsOnExpand(group_id);
		// update current group id of focused track
		g_group_id_focused = group_id;
	};

	this.updateGroupByPattern = function(pattern_idx) {
		var m = pattern_idx;
		tf_group_key = tf_cached(this.groupby[m].tf);
		cover.show = (layout.showCover == "1" ? true : false);
		cGroup.collapsed_height = layout.collapsedHeight;
		cGroup.expanded_height = layout.expandedHeight;
	};

	this.add_group = function(start, count, total_time_length, handle, iscollapsed) {
		var grp = new oGroup(this.groups.length, start, count, total_time_length, this.focusedTrackId, iscollapsed, handle);
		this.groups.push(grp);
		if (grp.cachekey != undefined) {
			var arr = this.crc_to_groups[grp.cachekey];
			if (!arr) arr = this.crc_to_groups[grp.cachekey] = [];
			arr.push(grp.index);
		};
	};

	this.init_groups = function(iscollapsed) {
		var handle, _handle;
		var current, current_raw, previous, previous_raw;
		var count = 0;
		var start = 0;
		var total_time_length = 0;

		// update group key TF pattern
		if (layout.showgroupheaders) {
			this.updateGroupByPattern(layout.pattern_idx);
		}
		else {
			tf_group_key = tf_cached(this.groupby[layout.pattern_idx].tf);
		};

		// 重建分组时丢弃旧的预加载任务，避免访问已失效的分组索引
		if (cover.preload_timer) {
			clearInterval(cover.preload_timer);
			cover.preload_timer = null;
		};

		this.groups.splice(0, this.groups.length);
		this.crc_to_groups = {};
		for (var i = 0; i < this.count; i++) {
			handle = this.handleList[i];
			current_raw = tf_group_key.EvalWithMetadb(handle);
			// 连续曲目的分组键通常完全相同：先比较原串，命中就跳过大写转换
			current = (i > 0 && current_raw == previous_raw) ? previous : current_raw.toUpperCase();
			var track_len = handle.Length;
			if (i == 0) {
				if (this.count == 1) {
					count++;
					total_time_length += track_len;
					this.add_group(start, count, total_time_length, handle, iscollapsed);
				}
				else {
					previous = current;
					previous_raw = current_raw;
					_handle = handle;
				};
			}
			else {
				if (current != previous || i == this.count - 1) {
					if (current != previous) {
						if (i == this.count - 1) {
							this.add_group(start, count, total_time_length, _handle, iscollapsed);
							start = i;
							count = 1;
							total_time_length = track_len;
							this.add_group(start, count, total_time_length, handle, iscollapsed);
						}
						else {
							this.add_group(start, count, total_time_length, _handle, iscollapsed);
						};
					}
					else {
						total_time_length += track_len;
						count++;
						this.add_group(start, count, total_time_length, _handle, iscollapsed);
					};
					count = 0;
					total_time_length = 0;
					start = i;
					previous = current;
					previous_raw = current_raw;
					_handle = handle;
				};
			};
			if (this.count > 1) {
				count++;
				total_time_length += track_len;
			};
		};
		this.totalRows = this.getTotalRows();
	};

	// 只预加载当前可见分组附近的封面，避免大列表把全部分组的封面解码进内存
	this.preload_cover_window = function() {
		if (cover.preload_timer) return;
		if (!this.items.length || !this.groups.length) return;
		if (!(p.headerBar.columns[0].w > 0 || (layout.showgroupheaders && cGroup.expanded_height > 1))) return;
		var first = this.items[0].group_index;
		var last = this.items[this.items.length - 1].group_index;
		if (first < 0) return;
		var from = Math.max(0, first - 3);
		var to = Math.min(this.groups.length - 1, last + 6);
		if (to - from > 15) to = from + 15; // 单次最多预取 16 组
		var j = from;
		cover.preload_timer = setInterval(() => {
			if (j > to) {
				clearInterval(cover.preload_timer);
				cover.preload_timer = null;
				return;
			};
			try {
				var grp = this.groups[j];
				if (grp && grp.load_requested == 0) g_image_cache.preload(j);
			} catch (e) {
				clearInterval(cover.preload_timer);
				cover.preload_timer = null;
			};
			j++;
		}, 30);
	};

	this.updateHandleList = function(playlist, iscollapsed, listnochange) {
		if(!listnochange){
			this.playlist = playlist;
			if (plman.PlaylistItemCount(this.playlist) > 0) {
				this.focusedTrackId = plman.GetPlaylistFocusItemIndex(this.playlist);
			}
			else {
				this.focusedTrackId = -1;
			};
			this.handleList = plman.GetPlaylistItems(this.playlist);
			this.count = this.handleList.Count;
		}
		this.init_groups(iscollapsed);
		tab_collapse = iscollapsed;
	};

	this.setSize = function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.totalRowVisible = Math.floor(this.h / cTrack.height);
		this.totalRowToLoad = this.totalRowVisible + 1;
	};

	this.selectAtoB = function(start_id, end_id) {

		var affectedItems = Array();

		if (this.SHIFT_start_id == null) {
			this.SHIFT_start_id = start_id;
		};

		plman.ClearPlaylistSelection(this.playlist);

		var previous_focus_id = this.focusedTrackId;

		if (start_id < end_id) {
			var deb = start_id;
			var fin = end_id;
		}
		else {
			var deb = end_id;
			var fin = start_id;
		};

		for (var i = deb; i <= fin; i++) {
			affectedItems.push(i);
		};
		plman.SetPlaylistSelection(this.playlist, affectedItems, true);

		plman.SetPlaylistFocusItem(this.playlist, end_id);

		if (affectedItems.length > 1) {
			if (end_id > previous_focus_id) {
				var delta = end_id - previous_focus_id;
				this.SHIFT_count += delta;
			}
			else {
				var delta = previous_focus_id - end_id;
				this.SHIFT_count -= delta;
			};
		};
	};

	this.selectGroupTracks = function(gp_id, state) {
		var affectedItems = Array();
		var first_trk = this.groups[gp_id].start;
		var total_trks = this.groups[gp_id].count;
		for (var i = first_trk; i < first_trk + total_trks; i++) {
			affectedItems.push(i);
		};
		plman.SetPlaylistSelection(this.playlist, affectedItems, state);
	};

	this.showNowPlaying = function() {
		if (fb.IsPlaying && plman.PlayingPlaylist > -1) {
			if (plman.PlayingPlaylist != this.playlist) {
				plman.ActivePlaylist = plman.PlayingPlaylist;
				this.playlist = plman.ActivePlaylist;
				this.nowplaying = plman.GetPlayingItemLocation();
				// set focus on the now playing item
				plman.SetPlaylistFocusItem(this.playlist, this.nowplaying.PlaylistItemIndex);
			}
			else {
				this.nowplaying = plman.GetPlayingItemLocation();
				// set focus on the now playing item
				plman.SetPlaylistFocusItem(this.playlist, this.nowplaying.PlaylistItemIndex);
				this.setItems(!p.list.isFocusedItemVisible());
				full_repaint();
			};
		};
	};

	this.showFocusedItem = function() {
		this.setItems(true);
		full_repaint();
	};

	this.getStartOffsetFromFocusId = function() {
		var mid = Math.floor(this.totalRowToLoad / 2) - 1;
		if (plman.PlaylistItemCount(this.playlist) > 0) {
			this.focusedTrackId = plman.GetPlaylistFocusItemIndex(this.playlist);
		}
		else {
			this.focusedTrackId = -1;
		};
		if (this.focusedTrackId < 0) {
			this.offset = 0;
			return this.offset;
		};

		if (this.focusedTrackId < 0 || this.focusedTrackId > this.count) this.focusedTrackId = 0;
		this.focusedRowId = this.getRowId(this.focusedTrackId);

		if (this.totalRows > this.totalRowVisible) {
			if (this.focusedRowId <= mid) {
				this.offset = 0;
			}
			else {
				var d = this.totalRows - (this.focusedRowId + 1);
				if (d >= Math.floor(this.totalRowToLoad / 2)) {
					this.offset = this.focusedRowId - mid;
				}
				else {
					this.offset = this.totalRows - this.totalRowVisible;
				};
			};
			if (this.offset < 0) this.offset = 0;
		}
		else {
			this.offset = 0;
		};
		return this.offset;
	};
	
	this.getStartOffsetFromMid = function() {
		if(p.list.items.length == 0) {
			this.offset = 0;
			return this.offset;
		}
		var mid = Math.floor(this.totalRowToLoad / 2) - 1;
		var list_mid = Math.floor(p.list.items.length/2 - 1);
		list_mid = Math.max(0, list_mid);
		var mid_track = p.list.items[list_mid].track_index;

		var MidRowId = this.getRowId(mid_track);

		if (this.totalRows > this.totalRowVisible) {
			if (MidRowId <= mid) {
				this.offset = 0;
			}
			else {
				var d = this.totalRows - (MidRowId + 1);
				if (d >= Math.floor(this.totalRowToLoad / 2)) {
					this.offset = MidRowId - mid;
				}
				else {
					this.offset = this.totalRows - this.totalRowVisible;
				};
			};
			if (this.offset < 0) this.offset = 0;
		}
		else {
			this.offset = 0;
		};
		return this.offset;
	};

	this.getGroupIdfromTrackId = function(valeur) {
		var mediane = 0;
		var deb = 0;
		var fin = this.groups.length - 1;
		while (deb <= fin) {
			mediane = Math.floor((fin + deb) / 2);
			if (valeur >= this.groups[mediane].start && valeur < this.groups[mediane].start + this.groups[mediane].count) {
				return mediane;
			}
			else if (valeur < this.groups[mediane].start) {
				fin = mediane - 1;
			}
			else {
				deb = mediane + 1;
			};
		};
		return -1;
	};

	this.getGroupIdFromRowId = function(valeur) {
		var mediane = 0;
		var deb = 0;
		var fin = this.groups.length - 1;
		var grp_height, grp_size;
		while (deb <= fin) {
			mediane = Math.floor((fin + deb) / 2);
			grp_height = this.groups[mediane].collapsed ? cGroup.collapsed_height : cGroup.expanded_height;
			grp_size = this.groups[mediane].collapsed ? grp_height : grp_height + this.groups[mediane].rowCount;
			if (valeur >= this.groups[mediane].totalPreviousRows && valeur < this.groups[mediane].totalPreviousRows + grp_size) {
				return mediane;
			}
			else if (valeur < this.groups[mediane].totalPreviousRows) {
				fin = mediane - 1;
			}
			else {
				deb = mediane + 1;
			};
		};
		return -1;
	};

	this.getRowId = function(trackId) {
		var grp_id = this.getGroupIdfromTrackId(trackId);
		if(grp_id == -1) return grp_id;
		if (this.groups[grp_id].collapsed) { // track hidden in the collapsed group so return = -1 or we return the row id of the group it belongs to ?
			var row_index = this.groups[grp_id].totalPreviousRows + 1;
		}
		else { // group expanded so we can return a valid row_id for the track searched
			var row_index = this.groups[grp_id].totalPreviousRows + cGroup.expanded_height + (trackId - this.groups[grp_id].start);
		};
		return row_index;
	};

	this.getTrackId = function(rowId) {
		this.s_group_id = this.getGroupIdFromRowId(rowId);
		if (this.s_group_id >= 0) {
			this.s_group_height = this.groups[this.s_group_id].collapsed ? cGroup.collapsed_height : cGroup.expanded_height;
			if (this.groups[this.s_group_id].collapsed) {
				var a = rowId - this.groups[this.s_group_id].totalPreviousRows;
				this.s_groupheader_line_id = a;
				this.s_track_id = this.groups[this.s_group_id].start;
			}
			else {
				var a = rowId - this.groups[this.s_group_id].totalPreviousRows;
				if (a < this.s_group_height) { // row is in the group header
					this.s_groupheader_line_id = a;
					this.s_track_id = this.groups[this.s_group_id].start;
				}
				else { // row is a track
					this.s_groupheader_line_id = -1;
					this.s_track_id = (a - this.s_group_height) + this.groups[this.s_group_id].start;
					var track_index_in_group = this.s_track_id - this.groups[this.s_group_id].start;
					if (track_index_in_group >= this.groups[this.s_group_id].count) { // track is a copy of the last track of the group to fill the group with minimum track count in group feature!
						this.s_delta = (track_index_in_group - this.groups[this.s_group_id].count) + 1;
						this.s_track_id -= this.s_delta;
					}
					else {
						this.s_delta = 0;
					};
				};
			};
			return this.s_track_id;
		}
		else {
			return 0;
		};
	};

	this.scrollItems = function(delta, scrollstep) {
		cList.scroll_direction = (delta < 0 ? -1 : 1);
		if (delta > 0) { // scroll up
			this.offset -= scrollstep;
			if (this.offset < 0) this.offset = 0;
		}
		else { // scroll down
			this.offset += scrollstep;
			if (this.offset > this.totalRows - this.totalRowVisible) {
				this.offset = this.totalRows - this.totalRowVisible;
			};
			if (this.offset < 0) this.offset = 0;
		};
		this.setItems(false);
		p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
		if (properties.smoothscrolling) set_scroll_delta();
		if (!p.list.drawRectSel) full_repaint();
	};

	this.setItems = function(forceFocus) {
		InfoPane.metadb = null;
		InfoPane.ItemReset = true;
		InfoPane.show = false;
		var track_index_in_group = 0;
		var row_index = 0;
		if (this.totalRows > this.totalRowVisible) {
			if(!forceFocus) {
				if (typeof(this.offset) == "undefined") this.getStartOffsetFromFocusId();
				var i = this.offset;
			} else if (forceFocus == 2) var i = this.getStartOffsetFromMid();
			else var i = this.getStartOffsetFromFocusId();
			if (this.totalRows - this.offset <= this.totalRowVisible) {
				var total_rows_to_draw = this.totalRows < this.totalRowVisible ? this.totalRows : this.totalRowVisible;
			}
			else {
				var total_rows_to_draw = this.totalRows < this.totalRowToLoad ? this.totalRows : this.totalRowToLoad;
			};

			this.items.splice(0, this.items.length);
			while (i < this.offset + total_rows_to_draw) {
				this.getTrackId(i);
				if (this.s_groupheader_line_id >= 0) { // group header
					this.items.push(new oItem(this.playlist, row_index, 1, this.handleList[this.s_track_id], this.s_track_id, this.s_group_id, 0, this.s_group_height, this.s_groupheader_line_id, this.groups[this.s_group_id], 0));
					i += this.s_group_height - this.s_groupheader_line_id;
					row_index += this.s_group_height - this.s_groupheader_line_id;
				}
				else { // track row
					track_index_in_group = this.s_track_id - this.groups[this.s_group_id].start + this.s_delta;
					this.items.push(new oItem(this.playlist, row_index, 0, this.handleList[this.s_track_id], this.s_track_id, this.s_group_id, track_index_in_group, 1, 0, null, this.s_delta));
					i++;
					row_index++;
				};
			};
		}
		else {
			this.offset = 0;
			var i = 0; // offset = 0
			this.items.splice(0, this.items.length);
			while (i < this.totalRows) {
				this.getTrackId(i);
				if (this.s_groupheader_line_id >= 0) { // group header
					this.items.push(new oItem(this.playlist, row_index, 1, this.handleList[this.s_track_id], this.s_track_id, this.s_group_id, 0, this.s_group_height, this.s_groupheader_line_id, this.groups[this.s_group_id], 0));
					i += this.s_group_height - this.s_groupheader_line_id;
					row_index += this.s_group_height - this.s_groupheader_line_id;
				}
				else { // track row
					track_index_in_group = this.s_track_id - this.groups[this.s_group_id].start + this.s_delta;
					this.items.push(new oItem(this.playlist, row_index, 0, this.handleList[this.s_track_id], this.s_track_id, this.s_group_id, track_index_in_group, 1, 0, null, this.s_delta));
					i++;
					row_index++;
				};
			};
		};
		this.preload_cover_window();
	};

	this.isFocusedItemVisible = function() {
		if (this.totalRows <= this.totalRowVisible) {
			return true;
		}
		else {
			var fin = this.items.length;
			if(fin){
				for (var i = 0; i < fin; i++) {
					if (this.items[i].group_index >= 0) {
						if ((this.items[i].type == 0 && this.items[i].empty_row_index == 0) || this.groups[this.items[i].group_index].collapsed) {
							if (this.groups[this.items[i].group_index].collapsed) {
								if (this.focusedTrackId >= this.groups[this.items[i].group_index].start && this.focusedTrackId < this.groups[this.items[i].group_index].start + this.groups[this.items[i].group_index].count) {
									return true;
								};
							}
							else if (this.focusedTrackId == this.items[i].track_index && this.items[i].row_index < this.totalRowVisible) {
								return true;
							};
						};
					};
				};
			}
		};
		return false;
	};

	this.draw = function(gr) {
		var item_h = 0;

		if (cList.scroll_timer) {
			var row_top_y = this.y - (cList.scroll_delta * cList.scroll_direction);
		}
		else {
			var row_top_y = this.y;
		};
		var width = 0;

		if (fb.IsPlaying && plman.PlayingPlaylist == this.playlist) {
			this.nowplaying = plman.GetPlayingItemLocation();
		};

		// Draw items (tracks and group headers)
		var fin = this.items.length;
		if(fin){
			for (var i = 0; i < fin; i++) {
				item_h = this.items[i].heightInRow * cTrack.height;
				width = this.w - cScrollBar.width;
				this.items[i].draw(gr, this.x, row_top_y, width, item_h);
				row_top_y += item_h - (this.items[i].groupRowDelta * cTrack.height);
			};

			if (g_dragndrop_status && g_dragndrop_bottom) {
				var rowId = fin - 1;
				var item_height_row = (this.items[rowId].type == 0 ? 1 : this.items[rowId].heightInRow);
				var item_height = item_height_row * cTrack.height;
				var limit = this.items[rowId].y + item_height;
				var rx = this.items[rowId].x;
				var ry = this.items[rowId].y;
				var rw = this.items[rowId].w;

				gr.FillSolidRect(rx, ry + item_height - cList.borderWidth_half * 2, rw, cList.borderWidth, g_color_normal_txt);
			};
		}

		// Draw rect selection
		if (this.drawRectSel) {
			var rectSelColor = g_color_selected_bg;
			this.selDeltaRows = this.selEndOffset - this.selStartOffset;
			if (this.selX <= mouse_x) {
				if (this.selY - this.selDeltaRows * cTrack.height <= mouse_y) {
					gr.FillSolidRect(this.selX, (this.selY - this.selDeltaRows * cTrack.height), mouse_x - this.selX, mouse_y - (this.selY - this.selDeltaRows * cTrack.height), rectSelColor & 0x33ffffff);
					gr.DrawRect(this.selX, (this.selY - this.selDeltaRows * cTrack.height), mouse_x - this.selX - 1, mouse_y - (this.selY - this.selDeltaRows * cTrack.height) - 1, 1.0, rectSelColor & 0x66ffffff);
				}
				else {
					gr.FillSolidRect(this.selX, mouse_y, mouse_x - this.selX, this.selY - mouse_y - this.selDeltaRows * cTrack.height, rectSelColor & 0x33ffffff);
					gr.DrawRect(this.selX, mouse_y, mouse_x - this.selX - 1, this.selY - mouse_y - this.selDeltaRows * cTrack.height - 1, 1.0, rectSelColor & 0x66ffffff);
				};
			}
			else {
				if (this.selY - this.selDeltaRows * cTrack.height <= mouse_y) {
					gr.FillSolidRect(mouse_x, (this.selY - this.selDeltaRows * cTrack.height), this.selX - mouse_x, mouse_y - (this.selY - this.selDeltaRows * cTrack.height), rectSelColor & 0x33ffffff);
					gr.DrawRect(mouse_x, (this.selY - this.selDeltaRows * cTrack.height), this.selX - mouse_x - 1, mouse_y - (this.selY - this.selDeltaRows * cTrack.height) - 1, 1.0, rectSelColor & 0x66ffffff);
				}
				else {
					gr.FillSolidRect(mouse_x, mouse_y, this.selX - mouse_x, this.selY - mouse_y - this.selDeltaRows * cTrack.height, rectSelColor & 0x33ffffff);
					gr.DrawRect(mouse_x, mouse_y, this.selX - mouse_x - 1, this.selY - mouse_y - this.selDeltaRows * cTrack.height - 1, 1.0, rectSelColor & 0x66ffffff);
				};
			};
		};
		if(InfoPane.show && InfoPane.metadb) InfoPane.draw(gr);
	};

	this.repaint = function() {
		window.RepaintRect(this.x, this.y, this.w, this.h);
	};

	this.isHoverObject = function(x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
	};

	this.check = function(event, x, y, delta) {
		this.ishover = this.isHoverObject(x, y);
		switch (event) {
		case "down":
			this.mclicked = this.ishover;
			if (this.ishover) {
				this.item_clicked = false;
				var fin = this.items.length;
				if(fin){
					for (var i = 0; i < fin; i++) {
						this.items[i].check(event, x, y);
					};
				}
				if (!cTouch.down) {
					if (!p.scrollbar.isHoverObject(x, y) && x < p.scrollbar.x) { // if not hover the scrollbar
						if (this.items.length > 0 && !this.item_clicked) { // and if click on an empty area of the playlist (after the last item)
							if (!properties.enableTouchControl) {
								this.selX = x;
								this.selY = y;
								this.drawRectSel_click = true;
								this.selStartId = this.items[this.items.length - 1].track_index;
								this.selStartOffset = p.list.offset;
								this.selEndOffset = p.list.offset;
								this.selDeltaRows = 0;
								this.selAffected.splice(0, this.selAffected.length);
							};
							if (!utils.IsKeyPressed(VK_CONTROL)) {
								plman.ClearPlaylistSelection(this.playlist);
							};
							this.SHIFT_start_id = null;
							full_repaint();
						};
					};
				};
				//};
			};
			break;
		case "up":
			if (this.ishover) {
				var fin = this.items.length;
				if(fin){
					for (var i = 0; i < fin; i++) {
						this.items[i].check(event, x, y);
					};
				}
			};
			p.list.drawRectSel_click = false;
			p.list.drawRectSel = false;
			// kill timer on rect area refresh for "drawRectSel"
			cList.repaint_timer && window.ClearInterval(cList.repaint_timer);
			cList.repaint_timer = false;
			if (this.mclicked) window.SetCursor(IDC_ARROW);
			this.mclicked = false;
			break;
		case "drag_over":
			g_dragndrop_bottom = false;
			var fin = this.items.length;
			if (fin) {
				for (var i = 0; i < fin; i++) {
					this.items[i].dragndrop_check(x, y, i);
				};
				var rowId = fin - 1;
				var item_height_row = (this.items[rowId].type == 0 ? 1 : this.items[rowId].heightInRow);
				var limit = this.items[rowId].y + item_height_row * cTrack.height - cTrack.height/2;
				if (y > limit) {
					g_dragndrop_bottom = true;
				};
			}
			else {
				g_dragndrop_bottom = true;
			};
			break;
		case "move":
			InfoPane.mouse = [x, y];
			InfoPane.ItemReset = false;
			var fin = this.items.length;
			if (fin) {
				for (var i = 0; i < fin; i++) {
					this.items[i].check(event, x, y);
				};
			}
			if (!this.drawRectSel) {
				this.drawRectSel = this.drawRectSel_click;
			};
			if (!this.drawRectSel) {}
			else if (!this.item_clicked) {
				// if draw Selection Rect from an empty area, repaint on mouse move to show the rect
				full_repaint();
			};
			break;
		default:
			if (this.ishover && this.items.length) {
				for (var i = 0; i < this.items.length; i++) {
					this.items[i].check(event, x, y);
				};
			};
		};
	};

	this.incrementalSearch = function() {
		var count = 0;
		var albumartist, title, groupkey;
		var chr;
		var gstart;
		var pid = -1;

		// exit if no search string in cache
		if (cList.search_string.length <= 0) return true;

		// 1st char of the search string
		var first_chr = cList.search_string.substring(0, 1);
		var len = cList.search_string.length;

		// which start point for the search
		if (this.count > 1000) {
			albumartist = tf_albumartist.EvalWithMetadb(this.handleList[Math.floor(this.count / 2)]);
			chr = albumartist.substring(0, 1);
			if (first_chr.charCodeAt(0) > chr.charCodeAt(0)) {
				gstart = Math.floor(this.count / 2);
			}
			else {
				gstart = 0;
			};
		}
		else {
			gstart = 0;
		};
		
		var osearch_string = cList.search_string.toLowerCase();
		// 1st search on "album artist" TAG
		var format_str = "";
		for (var i = gstart; i < this.count; i++) {
			albumartist = tf_albumartist.EvalWithMetadb(this.handleList[i]);
			format_str = albumartist.substring(0, len).toLowerCase();
			if (format_str == osearch_string) {
				pid = i;
				break;
			};
		};
		// if not found, search in the first part (from 0 to gstart)
		if (pid < 0) {
			var format_str = "";
			for (var i = 0; i < gstart; i++) {
				albumartist = tf_albumartist.EvalWithMetadb(this.handleList[i]);
				format_str = albumartist.substring(0, len).toLowerCase();
				if (format_str == osearch_string) {
					pid = i;
					break;
				};
			};
		};

		if (pid < 0) {
			// 2nd search on "title" TAG
			var format_str = "";
			for (var i = gstart; i < this.count; i++) {
				title = tf_plain_title.EvalWithMetadb(this.handleList[i]);
				format_str = title.substring(0, len).toLowerCase();
				if (format_str == osearch_string) {
					pid = i;
					break;
				};
			};
		};
			
		if (pid < 0) {
			// from 0 to gstart
			var format_str = "";
			for (var i = 0; i < gstart; i++) {
				title = tf_plain_title.EvalWithMetadb(this.handleList[i]);
				format_str = title.substring(0, len).toLowerCase();
				if (format_str == osearch_string) {
					pid = i;
					break;
				};
			};
		};
			
		if (pid < 0) {
			// 3rd search on "album" TAG
			var format_str = "";
			for (var i = gstart; i < this.count; i++) {
				title = tf_plain_album.EvalWithMetadb(this.handleList[i]);
				format_str = title.substring(0, len).toLowerCase();
				if (format_str == osearch_string) {
					pid = i;
					break;
				};
			};
		};
			
		if (pid < 0) {
			// from 0 to gstart
			var format_str = "";
			for (var i = 0; i < gstart; i++) {
				title = tf_plain_album.EvalWithMetadb(this.handleList[i]);
				format_str = title.substring(0, len).toLowerCase();
				if (format_str == osearch_string) {
					pid = i;
					break;
				};
			};
		};

		if (pid >= 0) { // found
			this.focusedTrackId = pid;
			plman.ClearPlaylistSelection(this.playlist);
			plman.SetPlaylistSelectionSingle(this.playlist, this.focusedTrackId, true);
			plman.SetPlaylistFocusItem(this.playlist, this.focusedTrackId);
			this.showFocusedItem();
		}
		else { // not found on "album artist" TAG, new search on "artist" TAG
			cList.inc_search_noresult = true;
			full_repaint();
		};

		cList.clear_incsearch_timer && window.ClearTimeout(cList.clear_incsearch_timer);
		cList.clear_incsearch_timer = window.SetTimeout(function() {
			// reset incremental search string after 1 seconds without any key pressed
			cList.search_string = "";
			cList.inc_search_noresult = false;
			full_repaint();
			window.ClearInterval(cList.clear_incsearch_timer);
			cList.clear_incsearch_timer = false;
		}, 1000);
	};

	this.contextMenu = function(x, y, id, row_id) {
		var _menu = window.CreatePopupMenu();
		var Context = fb.CreateContextMenuManager();
		var _child01 = window.CreatePopupMenu();
		var _child02 = window.CreatePopupMenu();
		var _child03 = window.CreatePopupMenu();
		var _child04 = window.CreatePopupMenu();
		var _apps = [];

		this.metadblist_selection = plman.GetPlaylistSelectedItems(this.playlist);
		Context.InitContext(this.metadblist_selection);
		var o_title = fb.TitleFormat("$ifequal($stricmp(%title%,?),1,%filename%,%title%)");
		var o_artist = fb.TitleFormat("$ifequal($stricmp(%artist%,?),1,,%artist%)");
		var o_album = fb.TitleFormat("$ifequal($stricmp(%album%,?),1,,%album%)");
		var o_genre = fb.TitleFormat("$ifequal($stricmp(%genre%,?),1,,%genre%)");

		_menu.AppendMenuItem(plman.IsAutoPlaylist(this.playlist) ? MF_DISABLED | MF_GRAYED : MF_STRING, 1011, "移除");
		_menu.AppendMenuSeparator();
		Context.BuildMenu(_menu, 3, -1);
		if(cfg_map.track_edit_app != ""){
			if(g_track_type < 2){
				_apps = cfg_map.track_edit_app.split("; ");
				if(_apps.length == 1){
					_menu.AppendMenuSeparator();
					let arr = utils.SplitFilePath(cfg_map.track_edit_app);
					_menu.AppendMenuItem(MF_STRING, 1012, "用 "+arr[1]+" 打开");
				} else {
					_child04.AppendTo(_menu, MF_STRING, "用外部程序打开...");
					for (var i = 0; i < _apps.length; i++) {
						let arr = utils.SplitFilePath(_apps[i]);
						_child04.AppendMenuItem(MF_STRING, 1012 + i, arr[1]);
					}
				}
			}
		}
		if (p.list.queue_total > 0) {
			if (layout.playlistName != "播放队列") {
				_menu.AppendMenuItem(MF_STRING, 2, "显示播放队列");
			};
		};
		if(properties.selectionmenu){
			var pl_count = plman.PlaylistCount;
			_child01.AppendTo(_menu, MF_STRING, "选择...");
			_child01.AppendMenuItem(MF_STRING, 1200, "重置封面缓存");
			_child01.AppendMenuSeparator();
			_child01.AppendMenuItem(plman.IsAutoPlaylist(this.playlist) ? MF_DISABLED | MF_GRAYED : MF_STRING, 1010, "移除列表其他项");
			if(pl_count > 1 && pl_count < 51){
				let addSep = true;
				for (var i = 0; i < pl_count; i++) {
					if (i != this.playlist && !plman.IsAutoPlaylist(i)) {
						if(addSep) {
							_child02.AppendTo(_child01, MF_STRING, "添加到...");
							_child03.AppendTo(_child01, MF_STRING, "发送到...");
							_child03.AppendMenuItem(MF_STRING, 4000, "新建播放列表");
							_child03.AppendMenuItem(MF_SEPARATOR, 0, "");
							addSep = false;
						}
						_child02.AppendMenuItem(MF_STRING, 2001 + i, plman.GetPlaylistName(i));
						_child03.AppendMenuItem(MF_STRING, 4001 + i, plman.GetPlaylistName(i));
					}
				}
				if(addSep) _child01.AppendMenuItem(MF_STRING, 4000, "发送到新建播放列表");
			} else _child01.AppendMenuItem(MF_STRING, 4000, "发送到新建播放列表");
			_child01.AppendMenuSeparator();
			_child01.AppendMenuItem(MF_STRING, 7000, "标签繁转简");
			_child01.AppendMenuItem(MF_STRING, 7001, "标签简转繁");
		}
		var ret = _menu.TrackPopupMenu(x, y);
		if (ret > 2 && ret < 800) {
			Context.ExecuteByID(ret - 3);
		}
		else if (ret < 3) {
			switch (ret) {
			case 2:
				CheckPlaylistQueue();
				break;
			};
		}
		else {
			switch (true) {
			case (ret == 1010):
				plman.RemovePlaylistSelection(this.playlist, true);
				break;
			case (ret == 1011):
				plman.RemovePlaylistSelection(this.playlist, false);
				break;
			case (ret > 1011 && ret < 1111):
				if (g_track_type > -1) {
					var obj_file = fb.TitleFormat("%path%").EvalWithMetadb(fb.GetFocusItem());
				} else{
					var obj_file = fb.TitleFormat("$directory_path(%path%)").EvalWithMetadb(fb.GetFocusItem());
				}
				utils.Run(_apps[ret - 1012], [obj_file]);
				break;
			case (ret == 1200):
				// 刷新所选曲目所在分组的封面缓存（多选自动去重，支持跨分组）
				reset_cover_from_selection(this.metadblist_selection);
				break;
			case (ret == 4000):
				fb.RunMainMenuCommand("文件/新建播放列表");
				plman.InsertPlaylistItems(plman.PlaylistCount - 1, 0, this.metadblist_selection, false);
				break;
			case (ret > 2000 && ret < 4000):
				var insert_index = plman.PlaylistItemCount(ret - 2001);
				plman.InsertPlaylistItems((ret - 2001), insert_index, this.metadblist_selection, false);
				break;
			case (ret > 4000 && ret < 6000):
				var insert_index = 0;
				var pl_name = plman.GetPlaylistName(ret - 4001);
				g_avoid_on_playlists_changed = true;
				plman.RemovePlaylist(ret - 4001);
				plman.CreatePlaylist(ret - 4001, pl_name);
				g_avoid_on_playlists_changed = false;
				plman.InsertPlaylistItems((ret - 4001), insert_index, this.metadblist_selection, false);
				break;
			case (ret == 7000):
				var arr = [];
				for (let i = 0; i < this.metadblist_selection.Count; ++i) {
					arr.push({
						'title' : utils.MapString(o_title.EvalWithMetadb(this.metadblist_selection[i]), 0x0804, 0x02000000),
						'artist' : utils.MapString(o_artist.EvalWithMetadb(this.metadblist_selection[i]), 0x0804, 0x02000000),
						'album' : utils.MapString(o_album.EvalWithMetadb(this.metadblist_selection[i]), 0x0804, 0x02000000),
						'genre' : utils.MapString(o_genre.EvalWithMetadb(this.metadblist_selection[i]), 0x0804, 0x02000000)
					});
				}
				this.metadblist_selection.UpdateFileInfoFromJSON(JSON.stringify(arr));
				break;
			case (ret == 7001):
				var arr = [];
				for (let i = 0; i < this.metadblist_selection.Count; ++i) {
					arr.push({
						'title' : utils.MapString(o_title.EvalWithMetadb(this.metadblist_selection[i]), 0x0804, 0x04000000),
						'artist' : utils.MapString(o_artist.EvalWithMetadb(this.metadblist_selection[i]), 0x0804, 0x04000000),
						'album' : utils.MapString(o_album.EvalWithMetadb(this.metadblist_selection[i]), 0x0804, 0x04000000),
						'genre' : utils.MapString(o_genre.EvalWithMetadb(this.metadblist_selection[i]), 0x0804, 0x04000000)
					});
				}
				this.metadblist_selection.UpdateFileInfoFromJSON(JSON.stringify(arr));
				break;
			};
		};
		return true;
	};
};

oInfoPane = function(){
	this.show = false;
	this.rowindex = -1;
	this.metadb = null;
	this.y = 0;
	this.mouse = [-1, -1];
	this.ItemReset = false;
	this.rowh = g_fsize*1.8;
	this.h = 0;
	this.c_border = RGBA(0, 0, 0, 120);
	this.draw = function(gr){
		var l=[];
		l.push(tf_info_filename.EvalWithMetadb(this.metadb));
		l.push(tf_info_path.EvalWithMetadb(this.metadb));
		l.push(tf_info_title.EvalWithMetadb(this.metadb));
		l.push(tf_info_artist.EvalWithMetadb(this.metadb));
		l.push(tf_info_album.EvalWithMetadb(this.metadb));
		l.push(tf_info_codec.EvalWithMetadb(this.metadb));
		l.push(tf_info_size.EvalWithMetadb(this.metadb));
		var clw = gr.CalcTextWidth("所在文件夹: ", g_font);
		var maxl = gr.CalcTextWidth(l[0], g_font);
		for(var i = 1; i < 6; i++) {
			var j = gr.CalcTextWidth(l[i], g_font);
			if(j > maxl) maxl = j;
		}
		maxl = maxl + 3*g_z10 + clw;
		this.h = this.rowh * 7 + g_z10 * 2;
		var panew = Math.min(window.Width*0.85, maxl);
		var x0 = Math.round((window.Width - panew)/2);
		var sety = this.y + cTrack.height*0.8;
		var upset = false;
		if((sety + this.h) > window.Height){
			upset = true;
			sety = Math.round(sety - this.h - cTrack.height*0.6);
		}
		gr.SetSmoothingMode(2);
		gr.DrawRoundRect(x0, sety, panew, this.h, g_z10, g_z10, 1, this.c_border);
		gr.FillRoundRect(x0, sety, panew, this.h-0.5, g_z10, g_z10, g_color_infopanebg);
		if(upset){
			if(x0 > p.headerBar.columns[0].w){
				gr.DrawPolygon(this.c_border, 1, [x0,sety+this.h-g_z10, x0+g_z10,sety+this.h, x0,sety+this.h+g_z10/1.25]);
				gr.FillPolygon(g_color_infopanebg, 1, [x0,sety+this.h-g_z10-1, x0+g_z10+1,sety+this.h-1, x0,sety+this.h+g_z10/1.25]);
			}else{
				gr.DrawPolygon(this.c_border, 1, [x0+panew,sety+this.h-g_z10, x0-g_z10+panew,sety+this.h, x0+panew,sety+this.h+g_z10/1.25]);
				gr.FillPolygon(g_color_infopanebg, 1, [x0+panew,sety+this.h-g_z10-1, x0-g_z10-1+panew,sety+this.h-1, x0+panew,sety+this.h+g_z10/1.25]);
			}
		}else{
			if(x0 > p.headerBar.columns[0].w){
				gr.DrawPolygon(this.c_border, 1, [x0, sety+g_z10, x0+g_z10,sety, x0,sety-g_z10/1.25]);
				gr.FillPolygon(g_color_infopanebg, 1, [x0, sety+g_z10+1, x0+g_z10+1, sety+1,x0,sety-g_z10/1.25]);
			}else{
				gr.DrawPolygon(this.c_border, 1, [x0+panew, sety+g_z10, x0-g_z10+panew,sety, x0+panew,sety-g_z10/1.25]);
				gr.FillPolygon(g_color_infopanebg, 1, [x0+panew, sety+g_z10+1, x0-g_z10-1+panew,sety+1, x0+panew,sety-g_z10/1.25]);
			}
		}
		gr.SetSmoothingMode(0);
		
		x0 = x0 + g_z10;
		var y0 = sety + g_z10;
		var lx = x0+clw+g_z10;
		var lw = panew-clw-g_z10*3;
		gr.GdiDrawText("文件名: ", g_font,  p.list.lcolor_85, x0, y0, clw, this.rowh, rcs_txt);
		gr.GdiDrawText("所在文件夹: ", g_font,  p.list.lcolor_85, x0, y0+this.rowh, clw, this.rowh, rcs_txt);
		gr.GdiDrawText("大  小: ", g_font,  p.list.lcolor_85, x0, y0+this.rowh*2, clw, this.rowh, rcs_txt);
		gr.GdiDrawText("标  题: ", g_font,  p.list.lcolor_85, x0, y0+this.rowh*3, clw, this.rowh, rcs_txt);
		gr.GdiDrawText("艺术家: ", g_font,  p.list.lcolor_85, x0, y0+this.rowh*4, clw, this.rowh, rcs_txt);
		gr.GdiDrawText("专  辑: ", g_font,  p.list.lcolor_85, x0, y0+this.rowh*5, clw, this.rowh, rcs_txt);
		gr.GdiDrawText("音频信息: ", g_font,  p.list.lcolor_85, x0, y0+this.rowh*6, clw, this.rowh, rcs_txt);
		
		gr.GdiDrawText(l[0], g_font, g_color_normal_txt, lx, y0, lw, this.rowh, lcs_txt);
		gr.GdiDrawText(l[1], g_font, g_color_normal_txt, lx, y0+this.rowh, lw, this.rowh, lcs_txt);
		gr.GdiDrawText(l[6], g_font, g_color_normal_txt, lx, y0+this.rowh*2, lw, this.rowh, lcs_txt);
		gr.GdiDrawText(l[2], g_font, g_color_normal_txt, lx, y0+this.rowh*3, lw, this.rowh, lcs_txt);
		gr.GdiDrawText(l[3], g_font, g_color_normal_txt, lx, y0+this.rowh*4, lw, this.rowh, lcs_txt);
		gr.GdiDrawText(l[4], g_font, g_color_normal_txt, lx, y0+this.rowh*5, lw, this.rowh, lcs_txt);
		gr.GdiDrawText(l[5], g_font, g_color_normal_txt, lx, y0+this.rowh*6, lw, this.rowh, lcs_txt);
	}
}