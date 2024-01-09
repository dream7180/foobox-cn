'use strict';

class Buttons {
	constructor() {
		this.alpha = 255;
		this.btns = {};
		this.cur = null;
		this.Dn = false;
		this.fbv1 = fb.Version.startsWith('1');
		this.traceBtn = false;
		this.transition;
		
		this.flag = {
			x: panel.heading.x,
			h: Math.round(ui.font.heading_h * 0.56)
		}
		this.flag.y = panel.text.t - ui.heading.h + Math.round((ui.font.heading_h - this.flag.h) / 2);

		this.lookUp = {
			baseSize: 15 * $.scale,
			col: $.toRGB(ui.col.text),
			gap: 9,
			img: null,
			imgLock: null,
			pos: 1,
			x: 0,
			y: 0,
			w: 12,
			h: 12,
			sz: 12
		}

		this.rating = {
			h1: 0,
			h2: 0,
			hash: '',
			images: [],
			scale: 2,
			show: false,
			w1: 30,
			w2: 30
		}

		this.scr = {
			albBtns: ['alb_scrollDn', 'alb_scrollUp'],
			artBtns: ['art_scrollDn', 'art_scrollUp'],
			img: null,
			iconFontName: 'Segoe UI Symbol',
			iconFontStyle: 0,
			init: true,
			pad: $.clamp(ppt.sbarButPad / 100, -0.5, 0.3)
		}

		this.src = {
			amBio: '',
			amRev: '',
			allmusic: 0,
			bahn: 'Bahnschrift SemiBold SemiConden',
			bahnInstalled: utils.CheckFont('Bahnschrift SemiBold SemiConden'),
			col: {},
			font: gdi.Font('Segoe UI Symbol', 12, 1),
			h: 19,
			icon: false,
			item_w: {
				amBio: 30,
				amRev: 30,
				lfmBio: 30,
				lfmRev: 30,
				space: 4,
				spaceIconFont: 4,
				txtBio: 30,
				txtRev: 30,
				wikiBio: 30,
				wikiRev: 30
			},
			lfmBio: '',
			lfmRev: '',
			pxShift: false,
			name: '',
			name_w: 40,
			text: false,
			space: ' ',
			txtBio: '',
			txtRev: '',
			visible: false,
			w: 50,
			wikiBio: '',
			wikiRev: '',
			x: 0,
			y: 0
		}

		this.tooltip = {
			heading: '',
			name: false,
			show: true,
			start: Date.now() - 2000,
			x: 0,
			w: 100
		}

		this.lookUp.zoomSize = Math.max(Math.round(this.lookUp.baseSize * ppt.zoomLookUpBtn / 100), 7);
		this.lookUp.scale = Math.round(this.lookUp.zoomSize / this.lookUp.baseSize * 100);
		this.lookUp.font = gdi.Font('FontAwesome', 15 * this.lookUp.scale / 100, 0);
		this.lookUp.fontLock = gdi.Font('FontAwesome', 14 * this.lookUp.scale / 100, 0);

		this.scr.btns = this.scr.albBtns.concat(this.scr.artBtns);
		this.src.iconFont = this.src.font;
		if (ui.stars == 1 && ui.show.btnRedLastfm) this.rating.imagesLfm = [];

		ppt.zoomLookUpBtn = this.lookUp.scale;

		this.setSbarIcon();
		this.createImages('all');
	}

	// Methods

	check(refresh) {
		if (!refresh) {
			(ppt.sbarShow != 1 || !this.scr.init) && !txt.lyricsDisplayed() ? this.setScrollBtnsHide() : this.setScrollBtnsHide(true, 'both');
		}
		this.rating.show = ui.stars == 1 && !ppt.artistView && (txt.rev.loaded.am && txt.rating.am != -1 || txt.rev.loaded.lfm && txt.rating.lfm != -1);
		this.src.name = ui.show.btnBg ? ' ' : '';
		switch (true) {
			case !ppt.artistView: {
				const ix = txt.rev.loaded.ix == -1 ? ppt.sourcerev : txt.rev.loaded.ix;
				this.src.name += [this.src.amRev, this.src.lfmRev, this.src.wikiRev, this.src.txtRev][ix];
				break;
			}
			case ppt.artistView: {
				const ix = txt.bio.loaded.ix == -1 ? ppt.sourcebio : txt.bio.loaded.ix;
				this.src.name += [this.src.amBio, this.src.lfmBio, this.src.wikiBio, this.src.txtBio][ix];
				break;
			}
		}
		this.src.name += ui.show.btnBg || this.rating.show ? ' ' : '';
		this.src.text = ppt.heading && this.btns.heading && ppt.hdBtnShow && (this.src.icon || this.src.name.trim().length ? true : false);
		if (!this.btns.heading || !ppt.heading) return;
		this.src.visible = ppt.hdBtnShow && (this.rating.show || this.src.text) && ppt.hdPos != 2;
		if (!this.src.visible) this.src.w = 0;
		else {
			this.src.name_w = 0;
			if (this.rating.show) this.src.name_w = txt.rev.loaded.am ? this.src.item_w.amRev : this.src.item_w.lfmRev;
			this.src.name_w = this.src.name_w + this.src.item_w.space * (ui.show.btnBg ? (this.src.name_w ? 2 : 1) : 0);
			this.src.w = 0;
			switch (true) {
				case this.rating.show:
					this.src.w = this.src.name_w + this.rating.w2 + (this.src.text || ui.show.btnBg ? this.src.item_w.space : 0);
					break;
				case this.src.text:
					switch (true) {
						case !ppt.artistView: {
							const ix = txt.rev.loaded.ix == -1 ? ppt.sourcerev : txt.rev.loaded.ix;
							this.src.w = [this.src.item_w.amRev, this.src.item_w.lfmRev, this.src.item_w.wikiRev, this.src.item_w.txtRev][ix];
							break;
						}
						case ppt.artistView: {
							const ix = txt.bio.loaded.ix == -1 ? ppt.sourcebio : txt.bio.loaded.ix;
							this.src.w = [this.src.item_w.amBio, this.src.item_w.lfmBio, this.src.item_w.wikiBio, this.src.item_w.txtBio][ix];
							break
						}
					}
					this.src.w += this.src.item_w.space * (ui.show.btnBg ? 2 : 0);
					break;
			}
			if (!ui.show.btnBg) this.src.name_w += this.src.item_w.space * (this.src.text ? 2 : 0);
		}
	}

	checkScrollBtns(x, y, hover_btn) {
		const arr = alb_scrollbar.timer_but ? this.scr.albBtns : art_scrollbar.timer_but ? this.scr.artBtns : false;
		if (arr) {
			if ((this.btns[arr[0]].down || this.btns[arr[1]].down) && !this.btns[arr[0]].trace(x, y) && !this.btns[arr[1]].trace(x, y)) {
				this.btns[arr[0]].cs('normal');
				this.btns[arr[1]].cs('normal');
				if (alb_scrollbar.timer_but) {
					clearTimeout(alb_scrollbar.timer_but);
					alb_scrollbar.timer_but = null;
					alb_scrollbar.count = -1;
				}
				if (art_scrollbar.timer_but) {
					clearTimeout(art_scrollbar.timer_but);
					art_scrollbar.timer_but = null;
					art_scrollbar.count = -1;
				}
			}
		} else if (hover_btn) this.scr.btns.forEach(v => {
			if (hover_btn.name == v && hover_btn.down) {
				this.btns[v].cs('down');
				hover_btn.l_dn();
			}
		});
	}

	clear() {
		this.Dn = false;
		Object.values(this.btns).forEach(v => v.down = false);
	}

	clearTooltip() {
		if (!tooltip.Text || !this.btns['lookUp'].tt) return;
		this.btns['lookUp'].tt.stop();
	}

	createImages(n) {
		if (n == 'all') {
			const sz = this.scr.arrow == 0 ? Math.max(Math.round(ui.sbar.but_h * 1.666667), 1) : 100;
			const sc = sz / 100;
			const iconFont = gdi.Font(this.scr.iconFontName, sz, this.scr.iconFontStyle);
			this.alpha = !ui.sbar.col ? [75, 192, 228] : [68, 153, 255];
			const hovAlpha = (!ui.sbar.col ? 75 : (!ui.sbar.type ? 68 : 51)) * 0.4;
			this.scr.hover = ppt.sbarType == 3 ? RGBA(55, 55, 55, 255) : !ui.sbar.col ? RGBA(ui.col.t, ui.col.t, ui.col.t, hovAlpha) : ui.col.text & RGBA(255, 255, 255, hovAlpha);
			this.scr.img = $.gr(sz, sz, true, g => {
				g.SetTextRenderingHint(3);
				g.SetSmoothingMode(2);
				if (ppt.sbarType == 3) g.DrawString(this.scr.arrow, iconFont, RGBA(103, 103, 103, 255), 0, sz * this.scr.pad, sz, sz, StringFormat(1, 1));
				else {
					if (ppt.sbarCol) {
						this.scr.arrow == 0 ? g.FillPolygon(ui.col.text, 1, [50 * sc, 0, 100 * sc, 76 * sc, 0, 76 * sc]) : g.DrawString(this.scr.arrow, iconFont, ui.col.text, 0, sz * this.scr.pad, sz, sz, StringFormat(1, 1));
					} else {
						this.scr.arrow == 0 ? g.FillPolygon(RGBA(ui.col.t, ui.col.t, ui.col.t, 255), 1, [50 * sc, 0, 100 * sc, 76 * sc, 0, 76 * sc]) : g.DrawString(this.scr.arrow, iconFont, RGBA(ui.col.t, ui.col.t, ui.col.t, 255), 0, sz * this.scr.pad, sz, sz, StringFormat(1, 1));
					}
				}
				g.SetSmoothingMode(0);
			});
		}
		if (n == 'all' || n == 'lookUp') {
			this.lookUp.col = $.toRGB(ui.col.text);
			$.gr(1, 1, false, g => {
				this.lookUp.sz = Math.max(g.CalcTextWidth('\uF107', this.lookUp.font), g.CalcTextWidth('\uF023', this.lookUp.fontLock), g.CalcTextHeight('\uF107', this.lookUp.font), g.CalcTextHeight('\uF023', this.lookUp.fontLock));
			});
		}
	}

	createStars(force) {
		this.src.icon = ui.show.btnLabel == 2 ? 1 : 0;
		const hs = ui.font.heading.Size;
		const fs = ui.stars != 1 ? (this.src.icon ? (this.src.bahnInstalled ? 12 : 11) : 10) * $.scale : 12 * $.scale;
		const srcFontSize = this.src.fontSize; 
		this.src.fontSize = $.clamp(Math.round(hs * 0.47) + (ppt.zoomHeadBtn - 100) / 10, Math.min(fs, hs), Math.max(fs, hs));
		if (this.src.fontSize != srcFontSize || force) this.src.font = gdi.Font('Segoe UI', this.src.fontSize, 1);
		$.gr(1, 1, false, g => {
			this.src.h = g.CalcTextHeight('allmusic', this.src.font);
			switch (this.src.icon) {
				case 0:
					this.src.amBio = cfg.amDisplayName.toLowerCase() + (!ppt.sourceAll ? '' : '... ');
					this.src.amRev = cfg.amDisplayName.toLowerCase() + (!ppt.sourceAll ? '' : '... ');
					this.src.lfmBio = cfg.lfmDisplayName.toLowerCase() + (!ppt.sourceAll ? '' : '... ');
					this.src.lfmRev = cfg.lfmDisplayName.toLowerCase() + (!ppt.sourceAll ? '' : '... ');
					this.src.wikiBio = cfg.wikiDisplayName.toLowerCase() + (!ppt.sourceAll ? '' : '... ');
					this.src.wikiRev = cfg.wikiDisplayName.toLowerCase() + (!ppt.sourceAll ? '' : '... ');
					this.src.txtBio = (txt.bio.subhead.txt[0] || '').toLowerCase() + (!ppt.sourceAll ? '' : '... ');
					this.src.txtRev = (txt.rev.subhead.txt[0] || '').toLowerCase() + (!ppt.sourceAll ? '' : '... ');
					if (!ui.show.btnLabel) {
						this.src.amBio = '';
						this.src.amRev = '';
						this.src.lfmBio = '';
						this.src.lfmRev = '';
						this.src.wikiBio = '';
						this.src.wikiRev = '';
						this.src.txtBio = '';
						this.src.txtRev = '';
					}
					$.gr(1, 1, false, g => {
						['space', 'amRev', 'lfmRev', 'wikiRev', 'txtRev', 'amBio', 'lfmBio', 'wikiBio', 'txtBio'].forEach(v => this.src.item_w[v] = g.CalcTextWidth(this.src[v], this.src.font, true))
					});
					break;
				case 1: {
					this.src.amBio = this.src.amRev = cfg.amDisplayName.toLowerCase() + (!ppt.sourceAll ? '' : '... ');
					this.src.lfmBio = this.src.lfmRev = '\uF202' + (!ppt.sourceAll ? '' : '... ');
					this.src.wikiBio = this.src.wikiRev = '\uF266' + (!ppt.sourceAll ? '' : '... ');
					this.src.txtBio = (txt.bio.subhead.txt[0] || '').toLowerCase() + (!ppt.sourceAll ? '' : '... ');
					this.src.txtRev = (txt.rev.subhead.txt[0] || '').toLowerCase() + (!ppt.sourceAll ? '' : '... ');
					if (this.src.fontSize != srcFontSize || force) {
						this.src.font = gdi.Font(this.src.bahnInstalled ? this.src.bahn : 'Segoe UI Semibold', this.src.fontSize, 0);
						this.src.iconFont = gdi.Font('FontAwesome', Math.round(this.src.fontSize * (this.src.bahnInstalled ? 1.09 : 1.16)), 0);
					}
					const alt_w = [];
					alt_w[9] = ' ';
					const fonts = [this.src.font, this.src.font, this.src.iconFont, this.src.iconFont, this.src.font, this.src.font, this.src.iconFont, this.src.iconFont, this.src.font, this.src.iconFont];
					['space', 'amRev', 'lfmRev', 'wikiRev', 'txtRev', 'amBio', 'lfmBio', 'wikiBio', 'txtBio', 'spaceIconFont'].forEach((v, i) => {
						this.src.item_w[v] = g.CalcTextWidth(i < 9 ? this.src[v] : alt_w[i], fonts[i], true);
					});
					this.src.item_w.space = Math.max(this.src.item_w.space, this.src.item_w.spaceIconFont);
					const n = ppt.artistView ? 'bio' : 'rev';
					this.src.y = this.src.fontSize < 12 || txt[n].loaded.ix == 2 ? 1 : 0;
					break;
				}
			}
		});
		if (ui.stars == 1) this.setRatingImages(Math.round(this.src.h / 1.5) * 5, Math.round(this.src.h / 1.5), ui.col.starOn, ui.col.starOff, ui.col.starBor, false);
		else if (ui.stars == 2) {
			this.setRatingImages(Math.round(ui.font.main_h / 1.75) * 5, Math.round(ui.font.main_h / 1.75), ui.col.starOn, ui.col.starOff, ui.col.starBor, false);
		}
		if (ui.stars == 1 && ui.show.btnRedLastfm) this.setRatingImages(Math.round(this.src.h / 1.5) * 5, Math.round(this.src.h / 1.5), RGBA(225, 225, 245, 255), RGBA(225, 225, 245, 60), ui.col.starBor, true);
		this.src.pxShift = /[gjpqy]/.test(this.src.amRev + this.src.lfmRev + this.src.wikiRev + this.src.txtRev + this.src.amBio + this.src.lfmBio + this.src.wikiBio + this.src.txtBio);
	}

	draw(gr) {
		Object.values(this.btns).forEach(v => {
			if (!v.hide) v.draw(gr);
		});
	}

	drawStar(g, col, pts, line_thickness) {
		g.SetSmoothingMode(2);
		g.FillPolygon(col, 1, pts);
		if (line_thickness > 0) g.DrawPolygon(col, line_thickness, pts);
	}

	getStarPoints(star_size, star_padding, star_indent, star_vpadding, points, line_thickness) {
		const point_arr = [];
		let rr = 0;
		for (let i = 0; i != points; i++) {
			i % 2 ? rr = Math.round((star_size - line_thickness * 4) / 2) / star_indent : rr = Math.round((star_size - line_thickness * 4) / 2);
			const x_point = Math.floor(rr * Math.cos(Math.PI * i / points * 2 - Math.PI / 2));
			const y_point = Math.ceil(rr * Math.sin(Math.PI * i / points * 2 - Math.PI / 2));
			point_arr.push(x_point + star_size / 2);
			point_arr.push(y_point + star_size / 2);
		}
		const pts = [];
		for (let i = 0; i < 5; i++) {
			pts[i] = point_arr.map((v, j) => {
				if (j % 2 === 0) return v + i * (star_size + star_padding);
				else return v + star_vpadding;
			});
		}
		return pts;
	}

	isNextSourceAvailable() {
		let n = ppt.artistView ? 'Bio' : 'Rev';
		if (ppt.lockBio && !ppt.sourceAll) return true;
		n = ppt.artistView ? 'bio' : 'rev';
		const types = txt[n].reader && panel.stndItem() ? $.source.amLfmWikiTxt : $.source.amLfmWiki;
		let found = 0;
		return types.some(type => {
			if (txt[n][type]) found++;
			if (found == 2) return true;
		});
	}

	lbtn_dn(x, y) {
		this.move(x, y, true);
		if (!this.cur || this.cur.hide) {
			this.Dn = false;
			return false
		} else this.Dn = this.cur.name;
		this.cur.down = true;
		this.cur.cs('down');
		this.cur.lbtn_dn(x, y);
		return true;
	}

	lbtn_up(x, y) {
		if (!this.cur || this.cur.hide || this.Dn != this.cur.name) {
			this.clear();
			return false;
		}
		this.clear();
		if (this.cur.trace(x, y)) this.cur.cs('hover');
		this.cur.lbtn_up(x, y);
		return true;
	}

	leave() {
		if (this.cur) {
			this.cur.cs('normal');
			if (!this.cur.hide) this.transition.start();
		}
		this.cur = null;
	}

	move(x, y, lDn) {
		const hover_btn = Object.values(this.btns).find(v => {
			if (!this.Dn || this.Dn == v.name) return v.trace(x, y);
		});
		let hand = false;
		this.scr.init = false;
		this.checkScrollBtns(x, y, hover_btn);
		if (hover_btn) hand = hover_btn.hand;
		if (!resize.down) window.SetCursor(!hand && !seeker.hand && !filmStrip.hand ? 32512 : 32649);
		if (hover_btn && hover_btn.hide) {
			if (this.cur) {
				this.cur.cs('normal');
				this.transition.start();
			}
			this.cur = null;
			return null;
		} // btn hidden, ignore
		if (this.cur === hover_btn) {
			if (this.cur && this.cur.name == 'heading') {
				const new_tt = hover_btn.tiptext();
				if (this.tooltip.heading != new_tt) {
					if (this.tooltip.show && hover_btn.tiptext && !lDn) hover_btn.tt.show(new_tt);
					this.tooltip.heading = new_tt;
				}
			}
			return this.cur;
		}
		if (this.cur) {
			this.cur.cs('normal');
			this.transition.start();
		} // return prev btn to normal state
		if (hover_btn && !(hover_btn.down && hover_btn.type < 6)) {
			hover_btn.cs('hover');
			if (this.tooltip.show && hover_btn.tiptext && !lDn) hover_btn.tt.show(hover_btn.tiptext());
			this.transition.start();
		}
		this.cur = hover_btn;
		return this.cur;
	}

	on_script_unload() {
		this.tt('');
	}

	refresh(upd) {
		if (upd) {
			this.scr.x1 = panel.sbar.x;
			this.scr.yUp1 = Math.round(panel.sbar.y);
			this.scr.yDn1 = Math.round(panel.sbar.y + panel.sbar.h - ui.sbar.but_h);
				
			if (ppt.sbarType != 2) {
				this.scr.x1 -= 1;
				this.scr.x2 = (ui.sbar.but_h - ui.sbar.but_w) / 2;
				this.scr.yUp2 = -ui.sbar.arrowPad + this.scr.yUp1 + (ui.sbar.but_h - 1 - ui.sbar.but_w) / 2;
				this.scr.yDn2 = ui.sbar.arrowPad + this.scr.yDn1 + (ui.sbar.but_h - 1 - ui.sbar.but_w) / 2;
			}
			this.setLookUpPos();
		}
		this.check();
		const n = ppt.artistView ? 'bio' : 'rev';
		if (ppt.heading) {
			this.btns.heading = new Btn(panel.heading.x, panel.text.t - ui.heading.h, panel.heading.w - (this.lookUp.pos == 2 ? this.lookUp.sz + (ppt.hdPos != 2 ? this.lookUp.gap : 10) * $.scale : 0), ui.font.heading_h, 6, $.clamp(Math.round(panel.text.t - ui.heading.h + (ui.font.heading_h - this.src.h) / 2 + ppt.hdBtnPad), panel.text.t - ui.heading.h, panel.text.t - ui.heading.h + ui.font.heading_h - this.src.h), '', '', '', !ppt.heading || ppt.img_only, '', () => {
				if (this.isNextSourceAvailable()) {
					txt.na = '';
					men.toggle('', ppt.artistView ? 'Bio' : 'Rev', '', panel.m.x > panel.heading.x + panel.heading.w / 2 ? 1 : -1);
				} else {
					txt.na = panel.m.x > panel.heading.x + panel.heading.w / 2 ? '下一个不可用：' : '上一个不可用：';
					txt.paint();
					timer.clear(timer.source);
					timer.source.id = setTimeout(() => {
						txt.na = '';
						txt.paint();
						timer.source.id = null;
					}, 5000);
				}
				this.check(true);
				if (ui.style.isBlur) window.Repaint();
			}, () => this.srcTiptext(), true, 'heading');
			this.src.col = {
				normal: txt[n].loaded.ix != 1 || !ui.show.btnRedLastfm ? ui.style.bg || !ui.style.bg && !ui.style.trans || ui.blur.dark || ui.blur.light || ui.col.headingBtn !== '' ? ui.col.headBtn : RGB(255, 255, 255) : RGB(225, 225, 245),
				hover: txt[n].loaded.ix != 1 || !ui.show.btnRedLastfm ? ui.style.bg || !ui.style.bg && !ui.style.trans || ui.blur.dark || ui.blur.light || ui.col.headingBtn !== '' ? ui.col.text_h : RGB(255, 255, 255) : RGB(225, 225, 245)
			};
			if (!ppt.hdPos) {
				this.flag = {
					x: panel.heading.x,
					h: Math.round(ui.font.heading_h * 0.56)
				}
				this.flag.y = panel.text.t - ui.heading.h + Math.round((ui.font.heading_h - this.flag.h) / 2);
				if (ui.font.heading_h >= 28 && ui.font.heading_h % 2 == 0) this.flag.y++;
			} else this.flag.sp = 0;
		} else delete this.btns.heading;
		if (panel.id.lookUp) {
			this.btns.lookUp = new Btn(this.lookUp.x, this.lookUp.y, this.lookUp.w, this.lookUp.h, 7, this.lookUp.p1, this.lookUp.p2, '', {
				normal: RGBA(this.lookUp.col[0], this.lookUp.col[1], this.lookUp.col[2], this.lookUp.pos == 2 ? 100 : 50),
				hover: RGBA(this.lookUp.col[0], this.lookUp.col[1], this.lookUp.col[2], this.lookUp.pos == 2 ? 200 : this.alpha[1])
			}, !panel.id.lookUp, '', () => bMenu.load(this.lookUp.x + this.lookUp.p1, this.lookUp.y + this.lookUp.h), () => '单击：查找...\r\n' + (!panel.id.lyricsSource && !panel.id.nowplayingSource ? '中键单击：' + (!panel.lock ? '锁定：停止音轨变化更新' : '解锁') + '...' : '启用歌词或正在播放来源，锁定不可用'), true, 'lookUp');
		} else delete this.btns.lookUp;
		if (ppt.summaryShow) {
			const hide = txt[n].loaded.txt && (txt.reader[n].lyrics || txt.reader[n].props || txt.reader[n].nowplaying) || ppt.img_only;
			this.btns.summary = new Btn(panel.text.l, panel.text.t, panel.text.w, 
			ppt.artistView ? (txt.line.h.bio * txt.bio.summaryEnd) : (txt.line.h.rev * txt.rev.summaryEnd), 8, this.lookUp.p1, this.lookUp.p2, '', {
				normal: RGBA(this.lookUp.col[0], this.lookUp.col[1], this.lookUp.col[2], this.lookUp.pos == 2 ? 100 : 50),
				hover: RGBA(this.lookUp.col[0], this.lookUp.col[1], this.lookUp.col[2], this.lookUp.pos == 2 ? 200 : this.alpha[1])
			}, hide, '', () => {ppt.toggle('summaryCompact'); txt.refresh(1);}, '', false, 'summary');
		} else delete this.btns.summary;
		if (ppt.sbarShow) {
			switch (ppt.sbarType) {
				case 2:
					this.btns.alb_scrollUp = new Btn(this.scr.x1, this.scr.yUp1, ui.sbar.but_h, ui.sbar.but_h, 5, '', '', '', {
						normal: 1,
						hover: 2,
						down: 3
					}, ppt.sbarShow == 1 && alb_scrollbar.narrow.show || !this.scrollAlb(), () => alb_scrollbar.but(1), '', '', false, 'alb_scrollUp');
					this.btns.alb_scrollDn = new Btn(this.scr.x1, this.scr.yDn1, ui.sbar.but_h, ui.sbar.but_h, 5, '', '', '', {
						normal: 5,
						hover: 6,
						down: 7
					}, ppt.sbarShow == 1 && alb_scrollbar.narrow.show || !this.scrollAlb(), () => alb_scrollbar.but(-1), '', '', false, 'alb_scrollDn');
					this.btns.art_scrollUp = new Btn(this.scr.x1, this.scr.yUp1, ui.sbar.but_h, ui.sbar.but_h, 5, '', '', '', {
						normal: 1,
						hover: 2,
						down: 3
					}, ppt.sbarShow == 1 && art_scrollbar.narrow.show || !this.scrollArt(), () => art_scrollbar.but(1), '', '', false, 'art_scrollUp');
					this.btns.art_scrollDn = new Btn(this.scr.x1, this.scr.yDn1, ui.sbar.but_h, ui.sbar.but_h, 5, '', '', '', {
						normal: 5,
						hover: 6,
						down: 7
					}, ppt.sbarShow == 1 && art_scrollbar.narrow.show || !this.scrollArt(), () => art_scrollbar.but(-1), '', '', false, 'art_scrollDn');
					break;
				default:
					this.btns.alb_scrollUp = new Btn(this.scr.x1, this.scr.yUp1 - panel.sbar.top_corr, ui.sbar.but_h, ui.sbar.but_h + panel.sbar.top_corr, 1, this.scr.x2, this.scr.yUp2, ui.sbar.but_w, '', ppt.sbarShow == 1 && alb_scrollbar.narrow.show || !this.scrollAlb(), () => alb_scrollbar.but(1), '', '', false, 'alb_scrollUp');
					this.btns.alb_scrollDn = new Btn(this.scr.x1, this.scr.yDn1, ui.sbar.but_h, ui.sbar.but_h + panel.sbar.top_corr, 2, this.scr.x2, this.scr.yDn2, ui.sbar.but_w, '', ppt.sbarShow == 1 && alb_scrollbar.narrow.show || !this.scrollAlb(), () => alb_scrollbar.but(-1), '', '', false, 'alb_scrollDn');
					this.btns.art_scrollUp = new Btn(this.scr.x1, this.scr.yUp1 - panel.sbar.top_corr, ui.sbar.but_h, ui.sbar.but_h + panel.sbar.top_corr, 3, this.scr.x2, this.scr.yUp2, ui.sbar.but_w, '', ppt.sbarShow == 1 && art_scrollbar.narrow.show || !this.scrollArt(), () => art_scrollbar.but(1), '', '', false, 'art_scrollUp');
					this.btns.art_scrollDn = new Btn(this.scr.x1, this.scr.yDn1, ui.sbar.but_h, ui.sbar.but_h + panel.sbar.top_corr, 4, this.scr.x2, this.scr.yDn2, ui.sbar.but_w, '', ppt.sbarShow == 1 && art_scrollbar.narrow.show || !this.scrollArt(), () => art_scrollbar.but(-1), '', '', false, 'art_scrollDn');
					break;
			}
		}
		this.transition = new Transition(this.btns, v => v.state !== 'normal');
	}

	reset() {
		this.transition.stop();
	}

	resetZoom() {
		txt.bio.scrollPos = {};
		txt.rev.scrollPos = {};
		ppt.zoomFont = 100;
		ppt.zoomHead = 115;
		this.lookUp.zoomSize = this.lookUp.baseSize;
		this.lookUp.scale = ppt.zoomLookUpBtn = 100;
		this.lookUp.font = gdi.Font('FontAwesome', 15 * this.lookUp.scale / 100, 0);
		this.lookUp.fontLock = gdi.Font('FontAwesome', 14 * this.lookUp.scale / 100, 0);
		ppt.zoomHeadBtn = 100;
		ppt.zoomTooltip = 100;
		ui.getFont();
		this.createStars();
		this.createImages('lookUp');
		this.setTooltipFont();
		this.refresh(true);
		txt.refresh(2);
		const n = ppt.artistView ? 'bio' : 'rev';
		if (txt[n].loaded.txt && txt.reader[n].lyrics) txt.getText();
	}

	scrollAlb() {
		return ppt.sbarShow && !ppt.artistView && !ppt.img_only && txt.rev.text.length && alb_scrollbar.scrollable_lines > 0 && alb_scrollbar.active && !alb_scrollbar.narrow.show && !txt.lyricsDisplayed();
	}

	scrollArt() {
		return ppt.sbarShow && ppt.artistView && !ppt.img_only && txt.bio.text.length && art_scrollbar.scrollable_lines > 0 && art_scrollbar.active && !art_scrollbar.narrow.show && !txt.lyricsDisplayed();
	}

	setLookUpPos() {
		this.lookUp.pos = ppt.hdLine == 2 && ppt.hdPos == 2 ? 0 : ppt.heading ? panel.id.lookUp : 0;
		this.lookUp.x = [0, 1 * $.scale, (!ppt.heading || ppt.img_only ? panel.w - 1 * $.scale - this.lookUp.sz - 1 : panel.heading.x + panel.heading.w - this.lookUp.sz) - 9 * $.scale][this.lookUp.pos];
		this.lookUp.y = [0, 0, !ppt.heading || ppt.img_only ? 0 : panel.text.t - ui.heading.h + (ui.font.heading_h - this.lookUp.sz) / 2][this.lookUp.pos];
		this.lookUp.w = [12, this.lookUp.sz * 1.5, panel.w - this.lookUp.x][this.lookUp.pos];
		this.lookUp.h = [12, this.lookUp.sz * 1.5, Math.max(ui.font.heading_h, this.lookUp.sz)][this.lookUp.pos];
		this.lookUp.p1 = [12, this.lookUp.sz + 1, this.lookUp.sz + 1 + 9 * $.scale][this.lookUp.pos];
		this.lookUp.p2 = this.lookUp.sz + 1;
	}

	setRatingImages(w, h, onCol, offCol, borCol, lfm) {
		const hash = w + '-' + h + '-' + onCol + '-' + offCol + '-' + borCol + '-' + lfm;
		if (hash == this.rating.hash) return;
		else this.rating.hash = hash;
		if (lfm) this.rating.imagesLfm = [];
		if (this.src.icon && ui.stars == 1) onCol = onCol & 0xe0ffffff;
		w = w * this.rating.scale;
		h = h * this.rating.scale;
		const star_indent = 2;
		let img = null;
		let real_rating = -1;
		let star_height = h;
		let star_padding = -1;
		let star_size = h;
		while (star_padding <= 0) {
			star_size = star_height;
			star_padding = Math.round((w - 5 * star_size) / 4);
			star_height--;
		}
		const line_thickness = 0;
		const star_vpadding = star_height < h ? Math.floor((h - star_height) / 2) : 0;
		const pts = this.getStarPoints(star_size, star_padding, star_indent, star_vpadding, 10, line_thickness);
		for (let rating = 0; rating < 11; rating++) {
			real_rating = rating / 2;
			if (Math.round(real_rating) != real_rating) {
				const img_off = $.gr(w, h, true, g => {
					for (let i = 0; i < 5; i++) this.drawStar(g, offCol, pts[i], line_thickness)
				});
				const img_on = $.gr(w, h, true, g => {
					for (let i = 0; i < 5; i++) this.drawStar(g, onCol, pts[i], line_thickness);
				});
				const half_mask_left = $.gr(w, h, true, g => {
					g.FillSolidRect(0, 0, w, h, RGBA(255, 255, 255, 255));
					g.FillSolidRect(0, 0, Math.round(w * rating / 10), h, RGBA(0, 0, 0, 255));
				});
				const half_mask_right = $.gr(w, h, true, g => {
					g.FillSolidRect(0, 0, w, h, RGBA(255, 255, 255, 255));
					g.FillSolidRect(Math.round(w * rating / 10), 0, w - Math.round(w * rating / 10), h, RGBA(0, 0, 0, 255));
				});
				img_on.ApplyMask(half_mask_left);
				img_off.ApplyMask(half_mask_right);
				img = $.gr(w, h, true, g => {
					g.DrawImage(img_off, 0, 0, w, h, 0, 0, w, h);
					g.DrawImage(img_on, 0, 0, w, h, 0, 0, w, h);
				});
			} else img = $.gr(w, h, true, g => {
				for (let i = 0; i < 5; i++) this.drawStar(g, i < real_rating ? onCol : offCol, pts[i], line_thickness);

			});
			!lfm ? this.rating.images[rating] = img : this.rating.imagesLfm[rating] = img;
		}
		if (!lfm) {
			this.rating.w1 = this.rating.images[10].Width;
			this.rating.w2 = this.rating.w1 / this.rating.scale;
			this.rating.h1 = this.rating.images[10].Height;
			this.rating.h2 = this.rating.h1 / this.rating.scale;
		}
	}

	setSbarIcon() {
		if (ppt.sbarType == 3) {
			this.scr.arrow = ui.sbar.but_w < Math.round(14 * $.scale) ? '\uE018' : '\uE0A0';
			this.scr.pad = ui.sbar.but_w < Math.round(14 * $.scale) ? -0.26 : -0.22;
		} else {
			switch (ppt.sbarButType) {
				case 0:
					this.scr.iconFontName = 'Segoe UI Symbol';
					this.scr.iconFontStyle = 0;
					if (!ui.sbar.type) {
						this.scr.arrow = ui.sbar.but_w < Math.round(14 * $.scale) ? '\uE018' : '\uE0A0';
						this.scr.pad = ui.sbar.but_w < Math.round(15 * $.scale) ? -0.3 : -0.22;
					} else {
						this.scr.arrow = ui.sbar.but_w < Math.round(14 * $.scale) ? '\uE018' : '\uE0A0';
						this.scr.pad = ui.sbar.but_w < Math.round(14 * $.scale) ? -0.26 : -0.22;
					}
					break;
				case 1:
					this.scr.arrow = 0;
					break;
				case 2:
					this.scr.iconFontName = ppt.butCustIconFont;
					this.scr.iconFontStyle = 0;
					this.scr.arrow = ppt.arrowSymbol.charAt().trim();
					if (!this.scr.arrow.length) this.scr.arrow = 0;
					this.scr.pad = $.clamp(ppt.sbarButPad / 100, -0.5, 0.3);
					break;
			}
		}
	}

	setScrollBtnsHide(set, autoHide) {
		if (autoHide) {
			const arr = autoHide == 'both' ? this.scr.btns : autoHide == 'alb' ? this.scr.albBtns : this.scr.artBtns;
			arr.forEach(v => {
				if (this.btns[v]) this.btns[v].hide = set;
			});
			txt.paint();
		} else {
			if (!ppt.sbarShow && !set) return;
			this.scr.btns.forEach((v, i) => {
				if (this.btns[v]) this.btns[v].hide = i < 2 ? !this.scrollAlb() : !this.scrollArt();
			});
		}
	}

	setSrcFontSize(step) {
		this.src.fontSize += step;
		const fs = ui.stars != 1 ? (this.src.icon ? (this.src.bahnInstalled ? 12 : 11) : 10) * $.scale : 12 * $.scale;
		const hs = ui.font.heading.Size;
		this.src.fontSize = $.clamp(this.src.fontSize, Math.min(fs, hs), Math.max(fs, hs));
		ppt.zoomHeadBtn = (this.src.fontSize - Math.round(ui.font.heading.Size * 0.47)) * 10 + 100;
	}

	setTooltipFont() {
		tooltip.SetFont(ui.font.main.Name, ui.font.main.Size, ui.font.main.Style);
	}

	srcTiptext() {
		const n = ppt.artistView ? 'bio' : 'rev';
		const suffix = this.isNextSourceAvailable() ? '文本' : '不可用';
		const type = panel.m.x > panel.heading.x + panel.heading.w / 2 ? '下一个' + suffix : panel.m.x > panel.heading.x ? (txt[n].flag && txt[n].flagCountry && panel.m.x < panel.heading.x + but.flag.w ? txt[n].flagCountry : '上一个' + suffix) : '';
		return this.src.visible && this.trace_src(panel.m.x, panel.m.y) || !but.tooltip.name ? type : !this.fbv1 ? but.tooltip.name : but.tooltip.name.replace(/&/g, '&&');
	}

	trace(btn, x, y) {
		const o = this.btns[btn];
		return o && o.trace(x, y);
	}

	trace_src(x, y) {
		if (!ppt.hdBtnShow || ppt.hdPos == 2) return false;
		return x > this.src.x && x < this.src.x + this.src.w && y > panel.text.t - ui.heading.h && y < panel.text.t - ui.heading.h + ui.font.heading_h;
	}

	tt(n, force) {
		if (tooltip.Text !== n || force) {
			tooltip.Text = n;
			tooltip.SetMaxWidth(800);
			tooltip.Activate();
		}
	}

	wheel(step) {
		if (!this.trace('lookUp', panel.m.x, panel.m.y)) return;
		this.lookUp.zoomSize += step;
		this.lookUp.zoomSize = $.clamp(this.lookUp.zoomSize, 7, 100);
		const o = this.btns['lookUp'];
		window.RepaintRect(0, o.y, panel.w, o.h);
		this.lookUp.scale = Math.round(this.lookUp.zoomSize / this.lookUp.baseSize * 100);
		this.lookUp.font = gdi.Font('FontAwesome', 15 * this.lookUp.scale / 100, 0);
		this.lookUp.fontLock = gdi.Font('FontAwesome', 14 * this.lookUp.scale / 100, 0);
		this.createImages('lookUp');
		this.refresh(true);
		ppt.zoomLookUpBtn = this.lookUp.scale;
	}
}

class Btn {
	constructor(x, y, w, h, type, p1, p2, p3, item, hide, l_dn, l_up, tiptext, hand, name) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.type = type;
		this.p1 = p1;
		this.p2 = p2;
		this.p3 = p3;
		this.item = item;
		this.hide = hide;
		this.l_dn = l_dn;
		this.l_up = l_up;
		this.tt = new Tooltip;
		this.tiptext = tiptext;
		this.hand = hand;
		this.name = name;
		this.transition_factor = 0;
		this.state = 'normal';
	}

	// Methods

	cs(state) {
		this.state = state;
		if (state === 'down' || state === 'normal') this.tt.clear();
		this.repaint();
	}

	draw(gr) {
		switch (this.type) {
			case 5:
				ui.theme.SetPartAndStateID(1, this.item[this.state]);
				ui.theme.DrawThemeBackground(gr, this.x, this.y, this.w, this.h);
				break;
			case 6:
				this.drawHeading(gr);
				break;
			case 7:
				this.drawLookUp(gr);
				break;
			case 8: // summary doesn't draw
				break;
			default:
				this.drawScrollBtn(gr);
				break;
		}
	}

	drawHeading(gr) {
		const n = ppt.artistView ? 'bio' : 'rev';
		const flag = txt[n].flag;
		let dh, dx1, dx2;
		let dw = this.w + (but.lookUp.pos == 2 ? but.lookUp.sz + (ppt.hdLine != 2 ? but.lookUp.gap : 10) * $.scale : 0);
		let spacer = 0;
		if (ppt.hdPos != 2) {
			if (!ppt.hdBtnShow || ppt.hdPos == 1) {
				dh = ppt.hdPos == 1 ? (but.rating.show || but.src.text ? (ppt.hdPos != 1 && ui.show.btnBg ? '' : (ppt.hdLine != 2 ? '  ' : ' ')) : '') + txt.na + txt.heading : txt.na + txt.heading;
				dx1 = this.x + but.src.w;
				dx2 = but.src.x = this.x;
			} else {
				dh = txt.na + txt.heading;
				dx1 = this.x;
				dx2 = but.src.x = this.x + this.w - but.src.w;
			}
		} else dh = txt.na + txt.heading;
		dh = dh.trim();

		switch (true) {
			case ppt.hdLine == 1:
				gr.DrawLine(this.x, this.y + ui.heading.line_y, this.x + dw, this.y + ui.heading.line_y, ui.style.l_w, ui.col.bottomLine);
				break;
			case ppt.hdLine == 2:
				if (ppt.hdPos != 2) {
					const src_w = but.src.w + (but.lookUp.pos == 2 ? but.lookUp.sz + (ppt.hdBtnShow || ppt.hdPos == 1 ? 10 * $.scale : 0) : 0);
					let dh_w = gr.CalcTextWidth(dh, ui.font.heading) + but.src.item_w.space * (ppt.hdPos != 1 || dh ? 2 : 0) + (ppt.hdPos == 1 && but.lookUp.pos == 2 ? but.lookUp.sz + 10 * $.scale : 0);
					if (!ppt.hdPos && dh_w < dw - src_w - but.src.item_w.space * (ppt.hdPos != 2 || !but.src.visible ? 3 : 1)) {
						gr.DrawLine(this.x + dh_w + (flag ? but.flag.sp : 0), Math.round(this.y + this.h / 2), this.x + dw - src_w - but.src.item_w.space * 3, Math.round(this.y + this.h / 2), ui.style.l_w, ui.col.centerLine);
					}
					else if ((!ppt.hdBtnShow || ppt.hdPos != 0) && src_w + but.src.item_w.space * 2 + dh_w < dw) {
						gr.DrawLine(dx1 + (but.src.visible ? but.src.item_w.space * (!ui.show.btnBg ? 2 : 3) : ppt.hdPos == 1 ? 0 : dh_w), Math.ceil(this.y + this.h / 2), this.x + dw - (ppt.hdBtnShow ? dh_w : ppt.hdPos == 1 ? dh_w : 0), Math.ceil(this.y + this.h / 2), ui.style.l_w, ui.col.centerLine);
					} else if (but.src.visible) {
						spacer = but.src.item_w.space * (!ui.show.btnBg ? 2 : 3);
						dx1 += spacer;
					}
				} else {
					let dh_w = gr.CalcTextWidth(dh, ui.font.heading) + but.src.item_w.space * 4;
					let ln_l = (dw - dh_w) / 2;
					if (ln_l > 1) {
						gr.DrawLine(this.x, Math.ceil(this.y + this.h / 2), this.x + ln_l, Math.ceil(this.y + this.h / 2), ui.style.l_w, ui.col.centerLine);
						gr.DrawLine(this.x + ln_l + dh_w, Math.ceil(this.y + this.h / 2), this.x + dw, Math.ceil(this.y + this.h / 2), ui.style.l_w, ui.col.centerLine);
					}
				}
				break;
		}
		if (flag) {
			gr.SetInterpolationMode(7);
			if (!ppt.hdPos) {
				const w = ui.style.l_w;
				const o = Math.floor(w / 2);
				but.flag.w = Math.round(but.flag.h * flag.Width / flag.Height);
				but.flag.sp = Math.round(but.flag.h * 0.75 + but.flag.w);
				gr.DrawImage(flag, but.flag.x, but.flag.y, but.flag.w, but.flag.h, 0, 0, flag.Width, flag.Height, '', 212);
				gr.DrawRect(but.flag.x + o, but.flag.y + o, but.flag.w - w, but.flag.h - w + 1, w, ui.col.imgBor);
			}
			gr.SetInterpolationMode(0);
			const h_x = (ppt.hdPos != 2 ? dx1 : this.x) + but.flag.sp;
			const h_w = (ppt.hdPos != 2 ? this.w - spacer - but.src.w - (!ppt.hdPos ? 10 : 0) : this.w - spacer) - but.flag.sp;
			gr.GdiDrawText(dh, ui.font.heading, ui.col.headingText, h_x, this.y, h_w, this.h, ppt.hdPos != 2 ? txt.c[ppt.hdPos] : txt.cc);
			but.tooltip.name = gr.CalcTextWidth(dh, ui.font.heading) > h_w ? (!flag || !txt[n].flagCountry ? dh : `${txt[n].flagCountry} | ${dh}`): '';
			but.tooltip.x = h_x;
			but.tooltip.w = h_w;
		} else {
			const h_x = (ppt.hdPos != 2 ? dx1 : this.x);
			const h_w = ppt.hdPos != 2 ? this.w - spacer - but.src.w - (!ppt.hdPos ? 10 : 0) : this.w - spacer;
			gr.GdiDrawText(dh, ui.font.heading, ui.col.headingText, (ppt.hdPos != 2 ? dx1 : this.x), this.y, ppt.hdPos != 2 ? this.w - spacer - but.src.w - (!ppt.hdPos ? 10 : 0) : this.w - spacer, this.h, ppt.hdPos != 2 ? txt.c[ppt.hdPos] : txt.cc);
			but.tooltip.name = gr.CalcTextWidth(dh, ui.font.heading) > h_w ? dh : '';
			but.tooltip.x = h_x;
			but.tooltip.w = h_w;
		}
		if (!but.src.visible) return;
		let col;
		if (ui.show.btnBg) {
			gr.SetSmoothingMode(2);
			if (txt[n].loaded.ix != 1 || !ui.show.btnRedLastfm) {
				if (this.state !== 'down') gr.FillRoundRect(dx2, this.p1 - (but.src.pxShift ? 1 : 0), but.src.w, but.src.h + (but.src.pxShift ? 2 : 0), 2, 2, RGBA(ui.col.blend4[0], ui.col.blend4[1], ui.col.blend4[2], ui.col.blend4[3] * (1 - this.transition_factor)));
				col = this.state !== 'down' ? ui.getBlend(ui.col.blend2, ui.col.blend1, this.transition_factor) : ui.col.blend2;
				gr.FillRoundRect(dx2, this.p1 - (but.src.pxShift ? 1 : 0), but.src.w, but.src.h + (but.src.pxShift ? 2 : 0), 2, 2, col);
				gr.DrawRoundRect(dx2, this.p1 - (but.src.pxShift ? 1 : 0), but.src.w, but.src.h + (but.src.pxShift ? 2 : 0), 2, 2, ui.style.l_w, ui.col.blend3);
			} else {
				gr.FillRoundRect(dx2, this.p1 - (but.src.pxShift ? 1 : 0), but.src.w, but.src.h + (but.src.pxShift ? 2 : 0), 2, 2, RGBA(210, 19, 9, 114));
				col = this.state !== 'down' ? ui.getBlend(RGBA(244, 31, 19, 255), RGBA(210, 19, 9, 228), this.transition_factor) : RGBA(244, 31, 19, 255);
				gr.FillRoundRect(dx2, this.p1 - (but.src.pxShift ? 1 : 0), but.src.w, but.src.h + (but.src.pxShift ? 2 : 0), 2, 2, col);
			}
		}
		col = this.state !== 'down' ? ui.getBlend(but.src.col.hover, but.src.col.normal, this.transition_factor) : but.src.col.hover;
		switch (but.src.icon) {
			case 0:
				gr.GdiDrawText(but.src.name, but.src.font, col, dx2, this.p1, but.src.w, but.src.h, !but.rating.show ? txt.cc : txt.c[0]);
				break;
			case 1: {
				let iconFont = false;
				if (!ppt.lockBio || ppt.sourceAll) iconFont = txt[n].loaded.ix == 1 || txt[n].loaded.ix == 2;
				else iconFont = ppt[`source${n}`] == 1 || ppt[`source${n}`] == 2;
				gr.GdiDrawText(but.src.name, !iconFont ? but.src.font : but.src.iconFont, col, dx2, this.p1 + (!iconFont ? 0 : but.src.y), but.src.w, but.src.h, !but.rating.show ? txt.cc : txt.c[0]);
				break;
			}
		}
		if (but.rating.show) {
			const rating = txt.rev.loaded.am ? txt.rating.am : txt.rating.lfm;
			const ratingImg = !ui.show.btnRedLastfm || txt.rev.loaded.am ? but.rating.images[rating] : but.rating.imagesLfm[rating];
			if (ratingImg) gr.DrawImage(ratingImg, !ppt.hdPos ? this.x + this.w - spacer - but.rating.w2 - (ui.show.btnBg ? but.src.item_w.space : 0) : dx2 + but.src.name_w, this.p1 + (Math.round(but.src.h - but.rating.h2) / 2), but.rating.w2, but.rating.h2, 0, 0, but.rating.w1, but.rating.h1, 0, 255);
		}
	}

	drawLookUp(gr) {
		const col = this.state !== 'down' ? ui.getBlend(this.item.hover, this.item.normal, this.transition_factor) : this.item.hover;
		gr.SetTextRenderingHint(5);
		if (!panel.lock) {
			gr.DrawString(!panel.style.moreTags || !ppt.artistView ? '\uF107' : '\uF13A', but.lookUp.font, col, this.x, this.y, this.p1, this.p2, StringFormat(2, 0));
			if (this.state == 'hover') gr.DrawString(!panel.style.moreTags || !ppt.artistView ? '\uF107' : '\uF13A', but.lookUp.font, col, this.x, this.y + 1, this.p1, this.p2, StringFormat(2, 0));
		} else {
			gr.DrawString('\uF023', but.lookUp.fontLock, col, this.x, this.y + 2 * $.scale, this.p1, this.p2, StringFormat(2, 0));
		}
	}

	drawScrollBtn(gr) {
		gr.SetSmoothingMode(3);
		const type3 = ppt.sbarType == 3;
		const a = type3 ? 255 : this.state !== 'down' ? Math.min(but.alpha[0] + (but.alpha[1] - but.alpha[0]) * this.transition_factor, but.alpha[1]) : but.alpha[2];
		if (this.state !== 'normal' && (ui.sbar.type == 1 || type3)) gr.FillSolidRect(panel.sbar.x + (!type3 ?  0 : ui.style.l_w), this.y, ui.sbar.w - (!type3 ? 0 : ui.style.l_w * 2), this.h, but.scr.hover);
		if (but.scr.img) gr.DrawImage(but.scr.img, this.x + this.p1, this.p2, this.p3, this.p3, 0, 0, but.scr.img.Width, but.scr.img.Height, this.type == 1 || this.type == 3 ? 0 : 180, a);
		gr.SetSmoothingMode(0);
	}

	lbtn_dn(x, y) {
		if (!but.Dn) return;
		this.l_dn && this.l_dn(x, y);
	}

	lbtn_up(x, y) {
		if (panel.isTouchEvent(x, y)) return;
		if (this.l_up) this.l_up();
	}

	repaint() {
		const expXY = 2;
		const expWH = 4;
		window.RepaintRect(this.x - expXY, this.y - expXY, this.w + expWH, this.h + expWH);
	}

	trace(x, y) {
		but.traceBtn = !this.hide && x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
		if (this.name == 'summary' && (ppt.artistView && art_scrollbar.delta > txt.line.h.bio * txt.bio.summaryEnd || !ppt.artistView && alb_scrollbar.delta > txt.line.h.rev * txt.rev.summaryEnd)) but.traceBtn = false;
		return but.traceBtn;
	}
}

class Tooltip {
	constructor() {
		this.id = Math.ceil(Math.random().toFixed(8) * 1000);
		this.tt_timer = new TooltipTimer();
	}

	// Methods

	clear() {
		this.tt_timer.stop(this.id);
	}

	show(text) {
		if (Date.now() - but.tooltip.start > 2000) this.showDelayed(text);
		else this.showImmediate(text);
		but.tooltip.start = Date.now();
	}

	showDelayed(text) {
		this.tt_timer.start(this.id, text);
	}

	showImmediate(text) {
		this.tt_timer.set_id(this.id);
		this.tt_timer.stop(this.id);
		but.tt(text);
	}

	stop() {
		this.tt_timer.forceStop();
	}
}

class TooltipTimer {
	constructor() {
		this.delay_timer;
		this.tt_caller = undefined;
	}

	// Methods

	forceStop() {
		but.tt('');
		if (this.delay_timer) {
			clearTimeout(this.delay_timer);
			this.delay_timer = null;
		}
	}

	set_id(id) {
		this.tt_caller = id;
	}

	start(id, text) {
		const old_caller = this.tt_caller;
		this.tt_caller = id;
		if (!this.delay_timer && tooltip.Text) but.tt(text, old_caller !== this.tt_caller);
		else {
			this.forceStop();
			if (!this.delay_timer) {
				this.delay_timer = setTimeout(() => {
					but.tt(text);
					this.delay_timer = null;
				}, 500);
			}
		}
	}

	stop(id) {
		if (this.tt_caller === id) this.forceStop();
	}
}

class Transition {
	constructor(items, hover) {
		this.hover = hover;
		this.items = items;
		this.transition_timer = null;
	}

	// Methods

	start() {
		const hover_in_step = 0.2;
		const hover_out_step = 0.06;
		if (!this.transition_timer) {
			this.transition_timer = setInterval(() => {
				Object.values(this.items).forEach(v => {
					const saved = v.transition_factor;
					if (this.hover(v)) v.transition_factor = Math.min(1, v.transition_factor += hover_in_step);
					else v.transition_factor = Math.max(0, v.transition_factor -= hover_out_step);
					if (saved !== v.transition_factor) v.repaint();
				});
				const running = Object.values(this.items).some(v => v.transition_factor > 0 && v.transition_factor < 1);
				if (!running) this.stop();
			}, 25);
		}
	}

	stop() {
		if (this.transition_timer) {
			clearInterval(this.transition_timer);
			this.transition_timer = null;
		}
	}
}