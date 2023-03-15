// *****************************************************************************************************************************************
// INPUT BOX by Br3tt aka Falstaff (c)2013-2015
// *****************************************************************************************************************************************
cInputbox = {
	temp_gr : gdi.CreateImage(1, 1).GetGraphics(),
	timer_cursor : false,
	cursor_state : true,
	doc : new ActiveXObject("htmlfile"),
	clipboard : null
}

oInputbox = function (w, h, default_text, empty_text, textcolor, backcolor, bordercolor, backselectioncolor, func, parentObjectName) {
	this.font = g_font;
	this.w = w;
	this.h = h;
	this.textcolor = textcolor;
	this.backcolor = backcolor;
	this.bordercolor = bordercolor;
	this.backselectioncolor = backselectioncolor;
	this.default_text = default_text;
	this.text = default_text;
	this.prev_text = "01234567890123456789";
	this.empty_text = empty_text;
	this.stext = "";
	this.prev_text = "";
	this.func = func;
	var gfunc = func;
	var gfunc_launch_timer = false;
	var g_parentObjectName = parentObjectName;
	this.autovalidation = false;
	//
	this.edit = false;
	this.select = false;
	this.hover = false;
	this.Cpos = 0;
	this.Cx = 0;
	this.offset = 0;
	this.right_margin = 2;
	this.drag = false;

	this.setSize = function (w, h) {
		this.w = w;
		this.h = h;
	};
	
	this.setfont = function (font_name, font_size, font_style) {
		this.font = GdiFont(font_name, font_size, font_style);
		//this.font_italic = this.font;
	};

	this.draw = function (gr, x, y) {
		this.x = x;
		this.y = y;
		if (this.edit) {
			var DT = DT_LEFT | DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX | DT_CALCRECT;
		} else {
			var DT = DT_LEFT | DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX | DT_CALCRECT | DT_END_ELLIPSIS;
		}
		// draw bg
		gr.SetSmoothingMode(0);
		if (this.bordercolor) gr.FillSolidRect(x - 2, y + 0, (this.w + 4), this.h - 0, this.bordercolor);
		gr.FillSolidRect(x - 1, y + 1, (this.w + 2), this.h - 2, this.backcolor);

		// adjust offset to always see the cursor
		if (!this.drag && !this.select) {
			this.Cx = cInputbox.temp_gr.CalcTextWidth(this.text.substr(this.offset, this.Cpos - this.offset), this.font);
			while (this.Cx >= this.w - this.right_margin) {
				this.offset++;
				this.Cx = cInputbox.temp_gr.CalcTextWidth(this.text.substr(this.offset, this.Cpos - this.offset), this.font);
			}
		}
		// draw selection
		if (this.SelBegin != this.SelEnd) {
			this.select = true;
			this.CalcText();
			if (this.SelBegin < this.SelEnd) {
				if (this.SelBegin < this.offset) {
					var px1 = this.x;
				} else {
					var px1 = this.x + this.GetCx(this.SelBegin);
				}
				var px1 = this.GetCx(this.SelBegin);
				var px2 = this.GetCx(this.SelEnd);
				this.text_selected = this.text.substring(this.SelBegin, this.SelEnd);
			} else {
				if (this.SelEnd < this.offset) {
					var px1 = this.x;
				} else {
					var px1 = this.x - this.GetCx(this.SelBegin);
				}
				var px2 = this.GetCx(this.SelBegin);
				var px1 = this.GetCx(this.SelEnd);
				this.text_selected = this.text.substring(this.SelEnd, this.SelBegin);
			}
			if ((this.x + px1 + (px2 - px1)) > this.x + this.w) {
				gr.FillSolidRect(this.x + px1, this.y + 1, this.w - px1, this.h - 3, this.backselectioncolor);
			} else {
				gr.FillSolidRect(this.x + px1, this.y + 1, px2 - px1, this.h - 3, this.backselectioncolor);
			}
		} else {
			this.select = false;
			this.text_selected = "";
		}

		// draw text
		if (this.text.length > 0) {
			gr.GdiDrawText(this.text.substr(this.offset), this.font, this.edit ? this.textcolor : blendColors(this.textcolor, (this.backcolor == 0 ? g_color_normal_bg : this.backcolor), 0.35), this.x, this.y, this.w, this.h, DT);
		} else {
			gr.GdiDrawText(this.empty_text, this.font, blendColors(this.textcolor, (this.backcolor == 0 ? g_color_normal_bg : this.backcolor), 0.35), this.x, this.y, this.w, this.h, DT);
		}
		// draw cursor
		if (this.edit && !this.select) this.drawcursor(gr);
	};

	this.drawcursor = function (gr) {
		if (cInputbox.cursor_state) {
			if (this.Cpos >= this.offset) {
				this.Cx = this.GetCx(this.Cpos);
				var x1 = this.x + this.Cx;
				var x2 = x1;
				var y1 = this.y + 1;
				var y2 = this.y + this.h - 2;
				var lt = 1;
				gr.DrawLine(x1, y1, x2, y2, lt, this.textcolor);
			}
		}
	}

	this.repaint = function () {
		//this.font = g_font;
		eval(g_parentObjectName + ".repaint()");
	}
	
	this.FontUpdte = function () {
		this.font = g_font;
	}

	this.CalcText = function () {
		this.TWidth = cInputbox.temp_gr.CalcTextWidth(this.text.substr(this.offset), this.font);
	}

	this.GetCx = function (pos) {
		if (pos >= this.offset) {
			var x = cInputbox.temp_gr.CalcTextWidth(this.text.substr(this.offset, pos - this.offset), this.font);
		} else {
			var x = 0;
		}
		return x;
	}

	this.GetCPos = function (x) {
		var tx = x - this.x;
		var pos = 0;
		for (var i = this.offset; i < this.text.length; i++) {
			pos += cInputbox.temp_gr.CalcTextWidth(this.text.substr(i, 1), this.font);
			if (pos >= tx + 3) {
				break;
			}
		}
		return i;
	}

	this.on_focus = function (is_focused) {
		if (!is_focused && this.edit) {
			if (this.text.length == 0) {
				this.text = this.default_text;
			};
			this.edit = false;
			// clear timer
			if (cInputbox.timer_cursor) {
				window.ClearInterval(cInputbox.timer_cursor);
				cInputbox.timer_cursor = false;
				cInputbox.cursor_state = true;
			}
			this.repaint();
		} else if (is_focused && this.edit) {
			this.resetCursorTimer();
		}
	}

	this.resetCursorTimer = function () {
		if (cInputbox.timer_cursor) {
			window.ClearInterval(cInputbox.timer_cursor);
			cInputbox.timer_cursor = false;
			cInputbox.cursor_state = true;
		}
		cInputbox.timer_cursor = window.SetInterval(function () {
				cInputbox.cursor_state = !cInputbox.cursor_state;
				eval(g_parentObjectName + ".repaint()");
			}, 500);
	}

	this.check = function (callback, x, y) {
		this.hover = (x >= this.x - 2 && x <= (this.x + this.w + 1) && y > this.y && y < (this.y + this.h)) ? true : false;
		switch (callback) {
		case "down":
			if (this.hover) {
				this.dblclk = false;
				this.drag = true;
				this.edit = true;
				this.Cpos = this.GetCPos(x);
				this.anchor = this.Cpos;
				this.SelBegin = this.Cpos;
				this.SelEnd = this.Cpos;
				this.resetCursorTimer();
			} else {
				this.edit = false;
				this.select = false;
				this.SelBegin = 0;
				this.SelEnd = 0;
				this.text_selected = "";
				if (cInputbox.timer_cursor) {
					window.ClearInterval(cInputbox.timer_cursor);
					cInputbox.timer_cursor = false;
					cInputbox.cursor_state = true;
				}
			}
			this.repaint();
			break;
		case "up":
			if (!this.dblclk && this.drag) {
				this.SelEnd = this.GetCPos(x);
				if (this.select) {
					if (this.SelBegin > this.SelEnd) {
						this.sBeginSel = this.SelBegin;
						this.SelBegin = this.SelEnd;
						this.SelEnd = this.sBeginSel;
					}
				}
			} else {
				this.dblclk = false;
			}
			this.drag = false;
			break;
		case "dblclk":
			if (this.hover) {
				this.dblclk = true;
				this.SelBegin = 0;
				this.SelEnd = this.text.length;
				this.text_selected = this.text;
				this.select = true;
				this.repaint();
			}
			break;
		case "move":
			if (this.drag) {
				this.CalcText();
				var tmp = this.GetCPos(x);
				var tmp_x = this.GetCx(tmp);
				if (tmp < this.SelBegin) {
					if (tmp < this.SelEnd) {
						if (tmp_x < this.x) {
							if (this.offset > 0) {
								this.offset--;
								this.repaint();
							}
						}
					} else if (tmp > this.SelEnd) {
						if (tmp_x + this.x > this.x + this.w) {
							var len = (this.TWidth > this.w) ? this.TWidth - this.w : 0;
							if (len > 0) {
								this.offset++;
								this.repaint();
							}
						}
					}
					this.SelEnd = tmp;
				} else if (tmp > this.SelBegin) {
					if (tmp_x + this.x > this.x + this.w) {
						var len = (this.TWidth > this.w) ? this.TWidth - this.w : 0;
						if (len > 0) {
							this.offset++;
							this.repaint();
						}
					}
					this.SelEnd = tmp;
				}
				this.Cpos = tmp;
				this.repaint();
			}
			// Set Mouse Cursor Style
			if (this.hover || this.drag) {
				window.SetCursor(IDC_IBEAM);
			} else if (this.ibeam_set) {
				window.SetCursor(IDC_ARROW);
			}
			this.ibeam_set = (this.hover || this.drag);
			break;
		case "right":
			if (this.hover) {
				this.edit = true;
				this.resetCursorTimer();
				this.repaint();
				this.show_context_menu(x, y);
			} else {
				this.edit = false;
				this.select = false;
				this.SelBegin = 0;
				this.SelEnd = 0;
				this.text_selected = "";
				if (cInputbox.timer_cursor) {
					window.ClearInterval(cInputbox.timer_cursor);
					cInputbox.timer_cursor = false;
					cInputbox.cursor_state = true;
				}
				this.repaint();
			}
			break;
		};
	};

	this.show_context_menu = function (x, y) {
		var idx;
		var _menu = window.CreatePopupMenu();
		cInputbox.clipboard = cInputbox.doc.parentWindow.clipboardData.getData("Text");
		_menu.AppendMenuItem(this.select ? MF_STRING : MF_GRAYED | MF_DISABLED, 1, "复制");
		_menu.AppendMenuItem(this.select ? MF_STRING : MF_GRAYED | MF_DISABLED, 2, "剪切");
		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(cInputbox.clipboard ? MF_STRING : MF_GRAYED | MF_DISABLED, 3, "粘贴");
		idx = _menu.TrackPopupMenu(x, y);
		switch (idx) {
		case 1:
			if (this.edit && this.select) {
				cInputbox.doc.parentWindow.clipboardData.setData("Text", this.text_selected);
			}
			break;
		case 2:
			if (this.edit && this.select) {
				cInputbox.doc.parentWindow.clipboardData.setData("Text", this.text_selected);
				var p1 = this.SelBegin;
				var p2 = this.SelEnd;
				this.offset = this.offset >= this.text_selected.length ? this.offset - this.text_selected.length : 0;
				this.select = false;
				this.text_selected = "";
				this.Cpos = this.SelBegin;
				this.SelEnd = this.SelBegin;
				this.text = this.text.slice(0, p1) + this.text.slice(p2);
				this.CalcText();
				this.repaint();
				this.autovalidation && gfunc();
			}
			break;
		case 3:
			if (this.edit && cInputbox.clipboard) {
				if (this.select) {
					var p1 = this.SelBegin;
					var p2 = this.SelEnd;
					this.select = false;
					this.text_selected = "";
					this.Cpos = this.SelBegin;
					this.SelEnd = this.SelBegin;

					if (this.Cpos < this.text.length) {
						this.text = this.text.slice(0, p1) + cInputbox.clipboard + this.text.slice(p2);
					} else {
						this.text = this.text + cInputbox.clipboard;
					}
					this.Cpos += cInputbox.clipboard.length;
					this.CalcText();
					this.repaint();
				} else {
					if (this.Cpos > 0) { // cursor pos > 0
						this.text = this.text.substring(0, this.Cpos) + cInputbox.clipboard + this.text.substring(this.Cpos, this.text.length);
					} else {
						this.text = cInputbox.clipboard + this.text.substring(this.Cpos, this.text.length);
					}
					this.Cpos += cInputbox.clipboard.length;
					this.CalcText();
					this.repaint();
				}
				this.autovalidation && gfunc();
			};
			break;
		}
	}

	this.on_key_down = function (vkey) {
		this.resetCursorTimer();
		var kmask = GetKeyboardMask();
		this.on_key(vkey, kmask);
	};

	this.on_key = function (vkey, mask) {
		if (mask == KMask.none) {
			switch (vkey) {
			case VK_SHIFT:
				break;
			case VK_BACK:
				//save text before update
				this.stext = this.text;
				if (this.edit) {
					if (this.select) {
						if (this.text_selected.length == this.text.length) {
							this.text = "";
							this.Cpos = 0;
						} else {
							if (this.SelBegin > 0) {
								this.text = this.text.substring(0, this.SelBegin) + this.text.substring(this.SelEnd, this.text.length);
								this.Cpos = this.SelBegin;
							} else {
								this.text = this.text.substring(this.SelEnd, this.text.length);
								this.Cpos = this.SelBegin;
							}
						}
					} else {
						if (this.Cpos > 0) {
							this.text = this.text.substr(0, this.Cpos - 1) + this.text.substr(this.Cpos, this.text.length - this.Cpos);
							if (this.offset > 0) {
								this.offset--;
							}
							this.Cpos--;
							this.repaint();
						}
					}
				}
				this.CalcText();
				this.offset = this.offset >= this.text_selected.length ? this.offset - this.text_selected.length : 0;
				this.text_selected = "";
				this.SelBegin = this.Cpos;
				this.SelEnd = this.SelBegin;
				this.select = false;
				this.repaint();
				break;
			case VK_DELETE:
				//save text before update
				this.stext = this.text;
				if (this.edit) {
					if (this.select) {
						if (this.text_selected.length == this.text.length) {
							this.text = "";
							this.Cpos = 0;
						} else {
							if (this.SelBegin > 0) {
								this.text = this.text.substring(0, this.SelBegin) + this.text.substring(this.SelEnd, this.text.length);
								this.Cpos = this.SelBegin;
							} else {
								this.text = this.text.substring(this.SelEnd, this.text.length);
								this.Cpos = this.SelBegin;
							}
						}
					} else {
						if (this.Cpos < this.text.length) {
							this.text = this.text.substr(0, this.Cpos) + this.text.substr(this.Cpos + 1, this.text.length - this.Cpos - 1);
							this.repaint();
						}
					}
				}
				this.CalcText();
				this.offset = this.offset >= this.text_selected.length ? this.offset - this.text_selected.length : 0;
				this.text_selected = "";
				this.SelBegin = this.Cpos;
				this.SelEnd = this.SelBegin;
				this.select = false;
				this.repaint();
				break;
			case VK_RETURN:
				if (this.edit && this.text.length >= 0) {
					try{this.func();}catch(e){eval(this.func);};
				} else {}
				break;
			case VK_ESCAPE:
				if (this.edit) {
					this.edit = false;
					this.text_selected = "";
					this.select = false;
					this.repaint();
				}
				break;
			case VK_END:
				if (this.edit) {
					this.Cpos = this.text.length;
					this.SelBegin = 0;
					this.SelEnd = 0;
					this.select = false;
					this.repaint();
				}
				break;
			case VK_HOME:
				if (this.edit) {
					this.Cpos = 0;
					this.SelBegin = 0;
					this.SelEnd = 0;
					this.select = false;
					this.offset = 0;
					this.repaint();
				}
				break;
			case VK_LEFT:
				if (this.edit) {
					if (this.offset > 0) {
						if (this.Cpos <= this.offset) {
							this.offset--;
							this.Cpos--;
						} else {
							this.Cpos--;
						}
					} else {
						if (this.Cpos > 0) this.Cpos--;
					}
					this.SelBegin = this.Cpos;
					this.SelEnd = this.Cpos;
					this.select = false;
					this.repaint();
				}
				break;
			case VK_RIGHT:
				if (this.edit) {
					if (this.Cpos < this.text.length) this.Cpos++;
					this.SelBegin = this.Cpos;
					this.SelEnd = this.Cpos;
					this.select = false;
					this.repaint();
				}
				break;
			}
			if (this.edit) this.repaint();
		} else {
			switch (mask) {
			case KMask.shift:
				if (vkey == VK_HOME) { // SHIFT + HOME
					if (this.edit) {
						if (!this.select) {
							this.anchor = this.Cpos;
							this.select = true;
							if (this.Cpos > 0) {
								this.SelEnd = this.Cpos;
								this.SelBegin = 0;
								this.select = true;
								this.Cpos = 0;
							}
						} else {
							if (this.Cpos > 0) {
								if (this.anchor < this.Cpos) {
									this.SelBegin = 0;
									this.SelEnd = this.anchor;
								} else if (this.anchor > this.Cpos) {
									this.SelBegin = 0;
								}
								this.Cpos = 0;
							}
						}
						if (this.offset > 0) {
							this.offset = 0;
						}
						this.repaint();
					}
				};
				if (vkey == VK_END) { // SHIFT + END
					if (this.edit) {
						if (!this.select) {
							this.anchor = this.Cpos;
							if (this.Cpos < this.text.length) {
								this.SelBegin = this.Cpos;
								this.SelEnd = this.text.length;
								this.Cpos = this.text.length;
								this.select = true;
							}
						} else {
							if (this.Cpos < this.text.length) {
								if (this.anchor < this.Cpos) {
									this.SelEnd = this.text.length;
								} else if (this.anchor > this.Cpos) {
									this.SelBegin = this.anchor;
									this.SelEnd = this.text.length;
								}
								this.Cpos = this.text.length;
							}
						}

						this.Cx = cInputbox.temp_gr.CalcTextWidth(this.text.substr(this.offset, this.Cpos - this.offset), this.font);
						while (this.Cx >= this.w - this.right_margin) {
							this.offset++;
							this.Cx = cInputbox.temp_gr.CalcTextWidth(this.text.substr(this.offset, this.Cpos - this.offset), this.font);
						}

						this.repaint();
					}
				};
				if (vkey == VK_LEFT) { // SHIFT + KEY LEFT
					if (this.edit) {
						if (!this.select) {
							this.anchor = this.Cpos;
							this.select = true;
							if (this.Cpos > 0) {
								this.SelEnd = this.Cpos;
								this.SelBegin = this.Cpos - 1;
								this.select = true;
								this.Cpos--;
							}
						} else {
							if (this.Cpos > 0) {
								if (this.anchor < this.Cpos) {
									this.SelEnd--;
								} else if (this.anchor > this.Cpos) {
									this.SelBegin--;
								}
								this.Cpos--;
							}
						}
						if (this.offset > 0) {
							var tmp = this.Cpos;
							var tmp_x = this.GetCx(tmp);
							if (tmp < this.offset) {
								this.offset--;
							}
						}
						this.repaint();
					}
				};
				if (vkey == VK_RIGHT) { // SHIFT + KEY RIGHT
					if (this.edit) {
						if (!this.select) {
							this.anchor = this.Cpos;
							if (this.Cpos < this.text.length) {
								this.SelBegin = this.Cpos;
								this.Cpos++;
								this.SelEnd = this.Cpos;
								this.select = true;
							}
						} else {
							if (this.Cpos < this.text.length) {
								if (this.anchor < this.Cpos) {
									this.SelEnd++;
								} else if (this.anchor > this.Cpos) {
									this.SelBegin++;
								}
								this.Cpos++;
							}
						}

						// handle scroll text on cursor selection
						var tmp_x = this.GetCx(this.Cpos);
						if (tmp_x > (this.w - this.right_margin)) {
							this.offset++;
						}
						this.repaint();
					}
				};
				break;
			case KMask.ctrl:
				if (vkey == 65) { // CTRL+A
					if (this.edit && this.text.length > 0) {
						this.SelBegin = 0;
						this.SelEnd = this.text.length;
						this.text_selected = this.text;
						this.select = true;
						this.repaint();
					}
				};
				if (vkey == 67) { // CTRL+C
					if (this.edit && this.select) {
						cInputbox.doc.parentWindow.clipboardData.setData("Text", this.text_selected);
					}
				};
				if (vkey == 88) { // CTRL+X
					if (this.edit && this.select) {
						//save text avant MAJ
						this.stext = this.text;
						//
						cInputbox.doc.parentWindow.clipboardData.setData("Text", this.text_selected);
						var p1 = this.SelBegin;
						var p2 = this.SelEnd;
						this.select = false;
						this.text_selected = "";
						this.Cpos = this.SelBegin;
						this.SelEnd = this.SelBegin;
						this.text = this.text.slice(0, p1) + this.text.slice(p2);
						this.CalcText();
						this.repaint();
					}
				};
				if (vkey == 90) { // CTRL+Z (annulation saisie)
					if (this.edit) {
						this.text = this.stext;
						this.repaint();
					}
				};
				if (vkey == 86) { // CTRL+V
					cInputbox.clipboard = cInputbox.doc.parentWindow.clipboardData.getData("Text");
					if (this.edit && cInputbox.clipboard) {
						//save text avant MAJ
						this.stext = this.text;
						//
						if (this.select) {
							var p1 = this.SelBegin;
							var p2 = this.SelEnd;
							this.select = false;
							this.text_selected = "";
							this.Cpos = this.SelBegin;
							this.SelEnd = this.SelBegin;
							if (this.Cpos < this.text.length) {
								this.text = this.text.slice(0, p1) + cInputbox.clipboard + this.text.slice(p2);
							} else {
								this.text = this.text + cInputbox.clipboard;
							}
							this.Cpos += cInputbox.clipboard.length;
							this.CalcText();
							this.repaint();
						} else {
							if (this.Cpos > 0) { // cursor pos > 0
								this.text = this.text.substring(0, this.Cpos) + cInputbox.clipboard + this.text.substring(this.Cpos, this.text.length);
							} else {
								this.text = cInputbox.clipboard + this.text.substring(this.Cpos, this.text.length);
							}
							this.Cpos += cInputbox.clipboard.length;
							this.CalcText();
							this.repaint();
						}
					};
				};
				break;
			}
		}

		// autosearch: has text changed after on_key or on_char ?
		if (this.autovalidation) {
			if (this.text != this.prev_text) {
				// launch timer to process the search
				gfunc_launch_timer && window.ClearTimeout(gfunc_launch_timer);
				gfunc_launch_timer = window.SetTimeout(function () {
						gfunc();
						gfunc_launch_timer && window.ClearTimeout(gfunc_launch_timer);
						gfunc_launch_timer = false;
					}, 500);
				this.prev_text = this.text;
			}
		}
	}

	this.on_char = function (code, mask) {
		if (code == 1 && this.edit && mask == KMask.ctrl) {
			this.Spos = 0;
			this.Cpos = this.text.length;
			this.select = true;
			this.repaint();
		}
		if (code > 31 && this.edit) {
			//save text before update
			this.stext = this.text;
			if (this.select) {
				var p1 = this.SelBegin;
				var p2 = this.SelEnd;
				this.text_selected = "";
				this.Cpos = this.SelBegin;
				this.SelEnd = this.SelBegin;
			} else {
				var p1 = this.Cpos;
				var p2 = (this.text.length - this.Cpos) * -1;
			}
			if (this.Cpos < this.text.length) {
				this.text = this.text.slice(0, p1) + String.fromCharCode(code) + this.text.slice(p2);
			} else {
				this.text = this.text + String.fromCharCode(code);
			}
			this.Cpos++;
			if (this.select) {
				this.CalcText();
				if (this.TWidth <= (this.w)) {
					this.offset = 0;
				} else {
					if (this.Cpos - this.offset < 0) {
						this.offset = this.offset > 0 ? this.Cpos - 1 : 0;
					}
				}
				this.select = false;
			}
			this.repaint();
		}

		// autosearch: has text changed after on_key or on_char ?
		if (this.autovalidation) {
			if (this.text != this.prev_text) {
				// launch timer to process the search
				gfunc_launch_timer && window.ClearTimeout(gfunc_launch_timer);
				gfunc_launch_timer = window.SetTimeout(function () {
						gfunc();
						gfunc_launch_timer && window.ClearTimeout(gfunc_launch_timer);
						gfunc_launch_timer = false;
					}, 500);
				this.prev_text = this.text;
			}
		}
	};
};
