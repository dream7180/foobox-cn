'use strict';

window.DlgCode = 0x004;

class UserInterface {
	constructor() {
		this.dui = window.InstanceType;

		if (ppt.typeOverlay > 4 || ppt.typeOverlay < 0) ppt.typeOverlay = 0;
		ppt.sbarCol = $.clamp(ppt.sbarCol, 0, 1);

		this.blur = {
			level: 100
		}

		this.col = {
			headingBtn: '',
			headingText: '',
			line: '',
			stars: '',
			summary: '',
			txt: '',
			txt_h: ''
		}

		this.font = {
			boldAdjust: 1,
			heading: gdi.Font('Segoe UI', 16, 0),
			heading_h: 21,
			headingBaseSize: 16,
			headingCustom: false,
			headingStyle: 1,
			items: [['lyricsFontStyle', 'lyrics'], ['sourceStyle', 'subHeadSource'], ['summaryStyle', 'summary'], ['trackStyle', 'subHeadTrack'], ['wikiStyle', 'subHeadWiki']],
			lyrics: gdi.Font('Segoe UI', 16, 3),
			main_h: 21,
			small_h: 8,
			zoomSize: 16
		}

		this.heading = {
			h: 30,
			line_y: 0,
			linePad: ppt.hdLinePad,
			pad: ppt.hdPad
		}

		this.id = {
			local: typeof conf === 'undefined' ? false : true,
			touch_dn: -1
		}

		ppt.overlayStrength = $.clamp(ppt.overlayStrength, 0, 100);
		ppt.overlayGradient = $.clamp(ppt.overlayGradient, 0, 100);
		ppt.overlayBorderWidth = $.clamp(ppt.overlayBorderWidth, 1, 20);

		this.overlay = {
			gradient: ppt.overlayGradient / 10 - 1,
			borderWidth: ppt.typeOverlay != 2 && ppt.typeOverlay != 4 ? 0 : ppt.overlayBorderWidth,
			strength: $.clamp(255 * (100 - ppt.overlayStrength) / 100, 0, 255)
		}

		this.pss = {
			checkOnSize: false,
			installed: !this.dui && utils.CheckComponent('foo_uie_panel_splitter')
		}

		this.sbar = {
			arrowPad: ppt.sbarPad,
			but_h: 11,
			but_w: 11,
			col: ppt.sbarCol,
			narrowWidth: 2,
			sp: 12,
			type: 0,
			w: 11
		}			

		if (!ppt.butCustIconFont.length) ppt.butCustIconFont = 'Segoe UI Symbol';

		this.show = {
			btnBg: ppt.hdShowBtnBg,
			btnLabel: ppt.hdShowBtnLabel,
			btnRedLastfm: ppt.hdShowRedLfm,
			headingText: ppt.hdShowTitle
		}

		if (this.show.btnRedLastfm) this.show.btnBg = 1;

		this.style = {
			bg: false,
			isBlur: false,
			l_w: Math.round(1 * $.scale),
			trans: false
		}

		this.themeColour = {}

		if (ppt.narrowSbarWidth != 0) ppt.narrowSbarWidth = $.clamp(ppt.narrowSbarWidth, 2, 10);
		ppt.hdLine = $.value(ppt.hdLine, 1, 2);
		if (ppt.headFontStyle < 0 || ppt.headFontStyle > 5) ppt.headFontStyle = 2;
		this.id.c_c = this.id.local && typeof opt_c_c !== 'undefined';

		this.getColours();
		this.getFont(true);

		this.refresh = $.debounce(() => {
			txt.refresh(3);
		}, 100);

		this.setSbar();
	}

	// Methods

	assignColours() {
		const prop = ['text', 'text_h', 'headingBtn', 'headingText', 'stars', 'summary', 'rectOv', 'rectOvBor', 'line', 'bg', 'frame', 'bgTrans'];
		this.col.txt = '';
		this.col.txt_h = '';
		this.col.headingBtn = '';
		this.col.headingText = '';
		this.col.line = '';
		this.col.stars = '';
		this.col.summary = '';
		this.style.bg = false;
		this.style.trans = false;
		const set = (c, t) => {
			c = c.replace(/[^0-9.,-]/g, '').split(/[,-]/);
			let cc = '';
			if (c.length != 3 && c.length != 4) return '';
			for (let i = 0; i < c.length; i++) {
				c[i] = parseFloat(c[i]);
				if (i < 3) c[i] = $.clamp(Math.round(c[i]), 0, 255);
				else if (i == 3) {
					if (c[i] <= 1) c[i] = Math.round(255 * c[i]);
					else c[i] = $.clamp(Math.round(c[i]), 0, 255);
				}
			}
			switch (t) {
				case 0:
					cc = RGB(c[0], c[1], c[2]);
					break;
				case 1:
					switch (c.length) {
						case 3:
							cc = RGB(c[0], c[1], c[2]);
							break;
						case 4:
							cc = RGBA(c[0], c[1], c[2], c[3]);
							break;
					}
					break;
			}
			return cc;
		}

		prop.forEach((v, i) => {
			this.col[v] = set(ppt[v + 'Use'] ? ppt[v] : '', i < 8 ? 0 : 1);
		});
	}

	calcText() {
		ppt.textPad = Math.max(ppt.textPad, 1);
		ppt.textPad = Math.min(ppt.textPad, 4);
		$.gr(1, 1, false, g => {
			this.font.main_h = Math.round(g.CalcTextHeight('String', this.font.main) * ppt.textPad);
			this.font.lyrics_h = Math.round(g.CalcTextHeight('STRING', this.font.lyrics) * ppt.textPad);
			this.font.heading_h = g.CalcTextHeight('String', this.font.heading);
			this.font.small_h = Math.max(g.CalcTextHeight('0', this.font.small), 8);
		});
		const min_line_y = this.font.heading_h;
		const max_line_y = Math.round(this.font.heading_h * (ppt.hdLine == 1 ? 1.25 : 1.1) + (ppt.hdLine == 1 ? this.heading.linePad : 0));
		this.heading.line_y = ppt.heading ? Math.max(min_line_y, max_line_y) : 0;
		const min_h = ppt.hdLine == 1 ? this.heading.line_y : this.font.heading_h + (ppt.hdLine == 1 ? this.heading.linePad : 0);
		this.heading.h = ppt.heading ? Math.max(Math.round(this.heading.line_y + (ppt.gap * (ppt.hdLine == 1 ? 0.75 : 0.25)) + this.heading.pad), min_h) : 0;
	}

	dim(c, bg, alpha) {
		c = $.toRGB(c);
		bg = $.toRGB(bg);
		const r = c[0] / 255;
		const g = c[1] / 255;
		const b = c[2] / 255;
		const a = alpha / 255;
		const bgr = bg[0] / 255;
		const bgg = bg[1] / 255;
		const bgb = bg[2] / 255;
		let nR = ((1 - a) * bgr) + (a * r);
		let nG = ((1 - a) * bgg) + (a * g);
		let nB = ((1 - a) * bgb) + (a * b);
		nR = $.clamp(Math.round(nR * 255), 0, 255);
		nG = $.clamp(Math.round(nG * 255), 0, 255);
		nB = $.clamp(Math.round(nB * 255), 0, 255);
		return RGB(nR, nG, nB);
	}

	draw(gr) {
		if (this.style.bg) gr.FillSolidRect(0, 0, panel.w, panel.h, this.col.bg);
	}
	
	getAccentColour() {
		let valid = false;
		if (this.blur.dark && ppt.text_hUse) {
			const c = ppt.text_h.replace(/[^0-9.,-]/g, '').split(/[,-]/);
			if (c.length == 3 || c.length == 4) valid = true;
		}
		this.col.accent = !this.blur.dark || ppt.text_hUse && valid ? this.col.text_h : ppt.themed && ppt.theme == 9 ? RGB(104, 225, 255) : RGB(128, 228, 27);
	}

	getBlend(c1, c2, f) {
		const nf = 1 - f;
		let r, g, b, a;
		c1 = $.toRGBA(c1);
		c2 = $.toRGBA(c2);
		r = c1[0] * f + c2[0] * nf;
		g = c1[1] * f + c2[1] * nf;
		b = c1[2] * f + c2[2] * nf;
		a = c1[3] * f + c2[3] * nf;
		return RGBA(Math.round(r), Math.round(g), Math.round(b), Math.round(a));
	}

	getBlurColours() {
		switch (true) {
			case !ppt.themed: // has to be able to create image: uses original themes
				if (ppt.theme > 4) ppt.theme = 0; // reset if coming from themed & out of bounds
				this.style.isBlur = ppt.theme > 0;
				this.blur = {
					alpha: $.clamp(ppt.blurAlpha, 0, 100) / 30,
					blend: ppt.theme == 2,
					blendAlpha: $.clamp($.clamp(ppt.blurAlpha, 0, 100) * 105 / 30, 0, 255),
					dark: ppt.theme == 1 || ppt.theme == 4,
					level: ppt.theme == 2 ? 91.05 - $.clamp(ppt.blurTemp, 1.05, 90) : $.clamp(ppt.blurTemp * 2, 0, 254),
					light: ppt.theme == 3
				}
				if (this.blur.dark) {
					this.col.bg_light = RGBA(0, 0, 0, Math.min(160 / this.blur.alpha, 255));
					this.col.bg_dark = RGBA(0, 0, 0, Math.min(80 / this.blur.alpha, 255));
					if (ppt.typeOverlay) {
						if (!ppt.rectOvUse) this.col.rectOv = RGBA(0, 0, 0, 255 - this.overlay.strength);
					}
				}
				if (this.blur.light) {
					this.col.bg_light = RGBA(255, 255, 255, Math.min(160 / this.blur.alpha, 255));
					this.col.bg_dark = RGBA(255, 255, 255, Math.min(205 / this.blur.alpha, 255));
					if (ppt.typeOverlay) {
						if (!ppt.rectOvUse) this.col.rectOv = RGBA(255, 255, 255, 255 - this.overlay.strength);
					}
				}
				break;
			case ppt.themed: // sent image
				this.style.isBlur = ppt.theme || ppt.themeBgImage;
				this.blur.blend = ppt.theme == 6 || ppt.theme == 7;
				this.blur.dark = ppt.theme == 1 && !ppt.themeLight || ppt.theme == 2 && !ppt.themeLight || ppt.theme == 3 || ppt.theme == 4 || ppt.theme == 5 || ppt.theme == 9;
				this.blur.light = ppt.theme == 1 && ppt.themeLight || ppt.theme == 2 && ppt.themeLight || ppt.theme == 8;
				break;
		}
	}

	getButCol(c, bypass) {
		return this.getLuminance(c, bypass) > 0.35 ? 50 : 200;
	}

	getColours(highlight_new, bg_new) {
		this.assignColours();
		this.getBlurColours();
		this.setStarType();
		this.getUIColours(highlight_new, bg_new);
		this.getItemColours();
		if (ppt.themed) {
			if ((ppt.theme == 0 || ppt.theme == 6 || ppt.theme == 7) && this.themeColour && ppt.themeColour) {
				// nothing to do
			} else {
				this.themeColour = {
					name: 'User interface',
					text: this.col.text,
					background: this.col.bg,
					selection: this.col.bgSel,
					highlight: this.col.text_h,
					bar: RGBA(0, 0, 0, 63)
				}
			}
		}
		this.getAccentColour();
	}

	getColSat(c) {
		c = $.toRGB(c);
		return c[0] + c[1] + c[2];
	}

	getFont(init) {
		const DetectWine = () => { /*Detects if user is running Wine on Linux or MacOs, default Wine mount point is Z:\*/
			const diskLetters = Array.from(Array(26)).map((e, i) => i + 65).map((x) => `${String.fromCharCode(x)}:\\`);
			const paths = ['bin\\bash', 'bin\\ls', 'bin\\sh', 'etc\\fstab'];
			return diskLetters.some(d => {
				try { // Needed when permission error occurs and current SMP implementation is broken for some devices....
					return utils.IsDirectory(d) ? paths.some(p => utils.IsFile(d + p)) : false;
				} catch (e) {return false;}
			});
		}
		if (ppt.custFontUse && ppt.custFont.length) {
			const custFont = $.split(ppt.custFont, 1);
			this.font.main = gdi.Font(custFont[0], Math.max(Math.round($.value(custFont[1], 16, 0)), 1), Math.round($.value(custFont[2], 0, 0)));
		} else if (this.dui) this.font.main = window.GetFontDUI(3);
		else this.font.main = window.GetFontCUI(0);

		if (!this.font.main || /tahoma/i.test(this.font.main.Name) && DetectWine()) { // Windows: check still needed (test MS Serif or Modern, neither can be used); Wine: tahoma is default system font, but bold and some unicode characters don't work: if Wine + tahoma detected changed to Segoe UI (if that's not installed, tahoma is still used) 
			this.font.main = gdi.Font('Segoe UI', 16, 0);
			$.trace('Spider Monkey Panel 无法使用你的默认字体。使用默认大小和样式的 Segoe UI 来代替。');
		}
		if (this.font.main.Size != ppt.baseFontSize) ppt.zoomFont = 100;
		ppt.baseFontSize = this.font.headingBaseSize = this.font.main.Size;

		this.font.zoomSize = Math.max(Math.round(ppt.baseFontSize * ppt.zoomFont / 100), 1);

		if (ppt.custHeadFontUse && ppt.custHeadFont.length) {
			const custHeadFont = $.split(ppt.custHeadFont, 1);
			this.font.headingBaseSize = Math.max(Math.round($.value(custHeadFont[1], 16, 0)), 1);
			this.font.heading = gdi.Font(custHeadFont[0], this.font.headingBaseSize, this.font.headingStyle);
			this.font.headingStyle = Math.round($.value(custHeadFont[2], 3, 0));
			this.font.headingCustom = true;
		} else {
			this.font.headingStyle = ppt.headFontStyle < 4 ? ppt.headFontStyle : (ppt.headFontStyle - 4) * 2;
			this.font.heading = gdi.Font(ppt.headFontStyle < 4 ? this.font.main.Name : 'Segoe UI Semibold', this.font.main.Size, this.font.headingStyle);
		}
		this.font.boldAdjust = this.font.headingStyle != 1 && this.font.headingStyle != 4 && this.font.headingStyle != 5 ? 1 : 1.5;
		this.font.main = gdi.Font(this.font.main.Name, this.font.zoomSize, this.font.main.Style);
		this.font.lyrics = gdi.Font(this.font.main.Name, this.font.zoomSize, this.font.lyrics.Style);
		this.font.heading = gdi.Font(this.font.heading.Name, Math.max(Math.round(this.font.headingBaseSize * ppt.zoomFont / 100 * (100 + ((ppt.zoomHead - 100) / this.font.boldAdjust)) / 100), 6), this.font.headingStyle);
		this.heading.pad = $.clamp(this.heading.pad, -ppt.gap * 2, this.font.main.Size * 5);
		this.heading.linePad = $.clamp(this.heading.linePad, -ppt.gap, this.font.main.Size * 5);

		ppt.zoomFont = Math.round(this.font.zoomSize / ppt.baseFontSize * 100);
		
		this.font.items.forEach(v => {
			const style = ppt[v[0]] < 4 ? ppt[v[0]] : (ppt[v[0]] - 4) * 2
			this.font[v[1]] = gdi.Font(ppt[v[0]] < 4 ? this.font.main.Name : 'Segoe UI Semibold', this.font.main.Size, style);
		});

		this.font.message = gdi.Font(this.font.main.Name, this.font.main.Size * 1.5, 1);
		this.font.small = gdi.Font(this.font.main.Name, Math.round(this.font.main.Size * 12 / 14), this.font.main.Style);


		this.narrowSbarWidth = ppt.narrowSbarWidth == 0 ? $.clamp(Math.floor(this.font.main.Size / 7), 2, 10) : ppt.narrowSbarWidth;
		if (this.id.local) {
			this.font.main = c_font;
			this.font.items.forEach(v => this.font[v[1]] = gdi.Font(this.font.main.Name, this.font.main.Size, ppt[v[0]]));
			this.font.message = gdi.Font(this.font.main.Name, this.font.main.Size * 1.5, 1);
			if (ppt.sbarShow) {
				this.sbar.type = 0;
				this.sbar.w = c_scr_w;
				this.sbar.but_w = this.sbar.w + 1;
				this.sbar.but_h = this.sbar.w + 1;
				this.sbar.sp = this.sbar.w + 1;
			}
		}

		if (init) return;
		this.getParams();
	}

	getItemColours() {
		const lightBg = this.isLightBackground();
		let customColText = false;
		let customColText_h = false;

		if (this.col.text === '') this.col.txt = this.blur.blend ? this.setBrightness(this.col.txt, lightBg ? -10 : 10) : this.blur.dark ? RGB(255, 255, 255) : this.blur.light ? RGB(50, 50, 50) : this.col.txt;
		else {
			this.col.txt = this.col.text;
			customColText = true;
		}
		if (this.col.text_h === '') this.col.txt_h = ppt.themed && ppt.theme == 9 ? RGB(104, 225, 255) : this.blur.blend ? this.setBrightness(this.col.txt_h, lightBg ? -10 : 10) : this.blur.dark ? RGB(255, 255, 255) : this.blur.light ? (ppt.themed && (ppt.theme == 1 || ppt.themed == 2) ? RGB(25, 25, 25) : RGB(71, 129, 183)) : this.col.txt_h;
		else {
			this.col.txt_h = this.col.text_h;
			customColText_h = true;
		}
		if (window.IsTransparent && this.col.bgTrans) {
			this.style.bg = true;
			this.col.bg = this.col.bgTrans
		}
		if (!window.IsTransparent || this.dui) this.style.bg = true;

		if (this.id.local) {
			this.style.trans = c_trans;
			this.col.bg = c_backcol;
			this.col.txt = this.blur.blend ? this.setBrightness(c_textcol, this.isLightCol(c_backcol == 0 ? 0xff000000 : c_backcol) ? -10 : 10) : this.blur.dark ? RGB(255, 255, 255) : this.blur.light ? RGB(50, 50, 50) : c_textcol;
			this.col.txt_h = this.blur.blend ? this.setBrightness(c_textcol_h, this.isLightCol(c_backcol == 0 ? 0xff000000 : c_backcol) ? -10 : 10) : this.blur.dark || !this.style.bg && this.style.trans && !this.blur.light ? RGB(255, 255, 255) : this.blur.light ? RGB(71, 129, 183) : c_textcol_h;
		}

		this.col.bg1 = lightBg ? 0x08000000 : 0x08ffffff;
		this.col.bg2 = lightBg ? 0x04000000 : 0x04ffffff;
		this.col.bg3 = lightBg ? 0x04ffffff : 0x04000000;

		if (ppt.swapCol) {
			const colH = this.col.txt_h;
			this.col.txt_h = this.col.txt;
			this.col.txt = colH;
		}

		if (!customColText || ppt.swapCol) this.col.text = !ppt.highlightText ? this.col.txt : this.col.txt_h;
		if (!customColText_h || ppt.swapCol) this.col.text_h = !ppt.highlightText ? this.col.txt_h : this.col.txt;
		this.col.shadow = this.getSelTextCol(this.col.text_h);
		if (this.col.summary === '') this.col.summary = !ppt.highlightSummary ? this.col.txt : this.col.txt_h;
		this.col.t = this.style.bg ? this.getButCol(this.col.bg) : 200;

		if (this.stars) {
			['starOn', 'starOff', 'starBor'].forEach((v, i) => {
				this.col[v] = i < 2 ? (this.stars == 2 ? $.RGBtoRGBA(this.col.stars === '' ? ppt.highlightStars ? this.col.txt : this.col.txt_h : this.col.stars, !i ? 232 : 60) :
					this.style.bg || !this.style.bg && !this.style.trans || this.blur.dark || this.blur.light ? $.RGBtoRGBA(this.col.stars === '' ? ppt.highlightStars ? this.col.txt_h : this.col.txt : this.col.stars, !i ? 232 : 60) : (this.col.stars === '' ? RGBA(255, 255, 255, !i ? 232 : 60) : $.RGBtoRGBA(this.col.stars, !i ? 232 : 60))) : RGBA(0, 0, 0, 0);
			});
		}

		this.col.bottomLine = this.getLineCol('bottom');
		this.col.centerLine = this.getLineCol('center');
		this.col.sectionLine = this.col.line === '' && !ppt.colLineDark ? (ppt.highlightHdLine ? this.col.text_h : this.col.text) & 0x40ffffff : $.RGBAtoRGB(this.col.bottomLine, this.col.bg == 0 ? 0xff000000 : this.col.bg) & 0x56ffffff;
		this.col.edBg = (this.blur.dark ? RGB(0, 0, 0) : this.blur.light ? RGB(255, 255, 255) : this.col.bg) & 0x99ffffff;
		this.col.imgBor = this.col.text & 0x25ffffff;
		const col_txt = this.col.txt == -1 ? RGB(240, 240, 240) : this.col.txt;
		const col_txt_h = this.col.txt_h == -1 ? RGB(240, 240, 240) : this.col.txt_h;
		this.col.dropShadow = RGB(150, 150, 150);
		this.col.source = this.blur.dark ? (ppt.highlightSubHd ? col_txt_h : col_txt) : !this.blur.light && (ppt.sourceStyle == 1 || ppt.sourceStyle == 3) && (ppt.headFontStyle != 1 && ppt.headFontStyle != 3) ? this.dim(ppt.highlightSubHd ? this.col.txt_h : this.col.txt, !window.IsTransparent ? this.col.bg : 0xff000000, 240) : ppt.highlightSubHd ? this.col.txt_h : this.col.txt;
		this.col.track = this.blur.dark ? (ppt.highlightSubHd ? col_txt_h : col_txt) : !this.blur.light && (ppt.trackStyle == 1 || ppt.trackStyle == 3) && (ppt.headFontStyle != 1 && ppt.headFontStyle != 3) ? this.dim(ppt.highlightSubHd ? this.col.txt_h : this.col.txt, !window.IsTransparent ? this.col.bg : 0xff000000, 240) : ppt.highlightSubHd ? this.col.txt_h : this.col.txt;

		this.sbar.col = this.blur.dark || this.blur.light ? 1 : ppt.sbarCol;

		if (this.col.frame === '') this.col.frame = (this.blur.dark ? 0xff808080 : this.blur.light ? 0xA330AFED : this.col.bgSel) & 0xd0ffffff;
		if (this.col.rectOv === '') this.col.rectOv = this.col.bg;
		this.col.rectOv = $.RGBtoRGBA(this.col.rectOv, 255 - this.overlay.strength);
		if (this.col.rectOvBor === '') {
			this.col.rectOvBor = ppt.highlightOvBor ? this.col.txt_h : this.col.txt;
			this.col.rectOvBor = $.RGBtoRGBA(this.col.rectOvBor, 228);
		}

		if (!ppt.heading) return;
		this.col.headBtn = this.col.headingBtn === '' ? !ppt.highlightHdBtn ? this.col.txt : this.col.txt_h : this.col.headingBtn;
		if (this.col.headingText === '') this.col.headingText = !ppt.highlightHdText ? this.col.txt : this.col.txt_h;
		['blend1', 'blend2', 'blend3'].forEach((v, i) => {
			this.col[v] = 
			this.blur.blend ? this.col.headBtn & RGBA(255, 255, 255, i == 2 ? 40 : 12) : 
			this.blur.dark || !this.style.bg && this.style.trans && !this.blur.light ? (i == 2 ? RGBA(255, 255, 255, 50) : RGBA(0, 0, 0, 40)) : 
			this.blur.light ? RGBA(50, 50, 50, i == 2 ? 40 : 15) : 
			this.getBlend(this.col.bg == 0 ? 0xff000000 : this.col.bg, this.col.headBtn, !i ? 0.9 : i == 2 ? 0.87 : (this.style.isBlur ? 0.75 : 0.82));
		});
		this.col.blend4 = $.toRGBA(this.col.blend1);
	}

	getLineCol(type) {
		if (!ppt.colLineDark) return this.col.line === '' ? this.getBlend(this.blur.dark ? RGB(0, 0, 0) : this.blur.light ? RGB(255, 255, 255) : this.col.bg == 0 ? 0xff000000 : this.col.bg, ppt.highlightHdLine ? this.col.txt_h : this.col.txt, type == 'bottom' || this.style.isBlur ? 0.25 : 0.5) : this.col.line;
		const lightBg = this.isLightBackground();
		const nearBlack = ((ppt.theme == 1 || ppt.theme == 2) && !this.col.themeLight || (ppt.theme == 0 || ppt.theme == 6 || ppt.theme == 7) && !lightBg) && this.getColSat(this.col.bg) < 45;
		const alpha = !lightBg ? nearBlack ? 0x20ffffff : 0x50000000 : 0x30000000;
		return this.col.text & alpha;
	}

	getLuminance(c, bypass) {
		if (!bypass) c = $.toRGB(c);
		const cc = c.map(v => {
			v /= 255;
			return v <= 0.04045 ? v /= 12.92 : Math.pow(((v + 0.055) / 1.055), 2.4);
		});
		return 0.2126 * cc[0] + 0.7152 * cc[1] + 0.0722 * cc[2];
	}

	getParams() {
		this.calcText();
		panel.setStyle();
		but.createStars();
		but.setTooltipFont();
		txt.getSubHeadWidths();
		txt.artCalc();
		txt.albCalc();	
	}
	
	getSelTextCol(c, bypass) {
		return this.getLuminance(c, bypass) > 0.35 ? RGB(0, 0, 0) : RGB(255, 255, 255);
	}

	getUIColours(highlight_new, bg_new) {
		const colours = Object.keys(colourSelector);
		this.themeColour = ppt.themeColour && colours.length ? colourSelector[colours[ppt.themeColour]] : null;
		if (ppt.themed && (ppt.theme == 0 || ppt.theme == 6 || ppt.theme == 7) && this.themeColour && ppt.themeColour) {
			this.col.txt = this.themeColour.text;
			if (this.col.bg === '') this.col.bg = this.themeColour.background;
			if (this.col.bgSel === '') this.col.bgSel = this.img.blurDark ? RGBA(255, 255, 255, 36) : this.img.blurLight ? RGBA(50, 50, 50, 36) : this.themeColour.selection;
			this.col.txt_h = this.themeColour.highlight;
		} else {
			switch (this.dui) {
				case 0:
					if (this.col.bg === '') this.col.bg = this.blur.light ? RGB(245, 247, 255) : window.GetColourCUI(3);
					this.col.bgSel = this.blur.dark ? RGBA(255, 255, 255, 36) : this.blur.light ? RGBA(50, 50, 50, 36) : window.GetColourCUI(4);
					this.col.txt = window.GetColourCUI(0);
					this.col.txt_h = highlight_new ? highlight_new : window.GetColourCUI(2);
					break;
				case 1:
					if(bg_new) this.col.bg = bg_new;
					else if (this.col.bg === '') this.col.bg = this.blur.light ? RGB(245, 247, 255) : window.GetColourDUI(1);
					this.col.bgSel = this.blur.dark ? RGBA(255, 255, 255, 36) : this.blur.light ? RGBA(50, 50, 50, 36) : window.GetColourDUI(3);
					this.col.txt = window.GetColourDUI(0);
					this.col.txt_h = highlight_new ? highlight_new : window.GetColourDUI(2);
					break;
			}
		}
	}

	isLightBackground() {
		let isLightBg = this.isLightCol(this.col.bg == 0 ? 0xff000000 : this.col.bg);
		if (ppt.themed && (ppt.theme == 0 || ppt.theme == 6 || ppt.theme == 7) && this.themeColour && ppt.themeColour) {
			// do nothing
		} else {
			if (this.blur.light) isLightBg = true;
			else if (this.blur.dark) isLightBg = false;
		}
		return isLightBg;
	}

	isLightCol(c, bypass) {
		return this.getLuminance(c, bypass) > 0.35;
	}

	lines(gr) {
		if (!this.id.c_c) return;
		if (ppt.artistView && !ppt.img_only || !ppt.artistView && !ppt.img_only) {
			gr.DrawRect(0, 0, panel.w - 1, panel.h - 1, 1, RGB(155, 155, 155));
			gr.DrawRect(1, 1, panel.w - 3, panel.h - 3, 1, RGB(0, 0, 0));
		}
	}

	refreshProp() {
		this.heading.pad = ppt.hdPad;
		this.heading.linePad = ppt.hdLinePad;
		panel.style.fullWidthHeading = ppt.heading && ppt.fullWidthHeading;
		panel.id.focus = ppt.focus;
		panel.id.lyricsSource = false;
		panel.id.nowplayingSource = false;
		panel.id.propsSource = false;
		for (let i = 0; i < 8; i++) {
			if (ppt.txtReaderEnable && ppt[`useTxtReader${i}`] && ppt[`pthTxtReader${i}`] && ppt[`lyricsTxtReader${i}`] && !/item_properties/i.test(utils.SplitFilePath(ppt[`pthTxtReader${i}`])[1]) && !/nowplaying/i.test(utils.SplitFilePath(ppt[`pthTxtReader${i}`])[1])) {
				panel.id.lyricsSource = true;
				panel.id.focus = false;
				break;
			}
		}
	
		for (let i = 0; i < 8; i++) {
			if (ppt.txtReaderEnable && ppt[`useTxtReader${i}`] && /nowplaying/i.test(utils.SplitFilePath(ppt[`pthTxtReader${i}`])[1])) {
				panel.id.nowplayingSource = true;
				panel.id.focus = false;
				break;
			}
		}
		for (let i = 0; i < 8; i++) {
			if (ppt.txtReaderEnable && ppt[`useTxtReader${i}`] && /item_properties/i.test(utils.SplitFilePath(ppt[`pthTxtReader${i}`])[1])) {
				panel.id.propsSource = true;
				break;
			}
		}
		if (!lyrics && panel.id.lyricsSource) lyrics = new Lyrics;
		panel.id.lookUp = ppt.lookUp;

		this.show = {
			btnBg: ppt.hdShowBtnBg,
			btnLabel: ppt.hdShowBtnLabel,
			btnRedLastfm: ppt.hdShowRedLfm,
			headingText: ppt.hdShowTitle
		};
		if (this.show.btnRedLastfm) this.show.btnBg = 1;
		
		panel.checkRefreshRates();
		panel.setSummary();
		if (ppt.typeOverlay > 4 || ppt.typeOverlay < 0) ppt.typeOverlay = 0;

		ppt.overlayStrength = $.clamp(ppt.overlayStrength, 0, 100);
		ppt.overlayGradient = $.clamp(ppt.overlayGradient, 0, 100);
		ppt.overlayBorderWidth = $.clamp(ppt.overlayBorderWidth, 1, 20);
		this.overlay = {
			gradient: ppt.overlayGradient / 10 - 1,
			borderWidth: ppt.typeOverlay != 2 && ppt.typeOverlay != 4 ? 0 : ppt.overlayBorderWidth,
			strength: $.clamp(255 * (100 - ppt.overlayStrength) / 100, 0, 255)
		};
		ppt.reflStrength = $.clamp(ppt.reflStrength, 0, 100);
		ppt.reflGradient = $.clamp(ppt.reflGradient, 0, 100);
		ppt.reflSize = $.clamp(ppt.reflSize, 0, 100);
		img.refl = {
			adjust: false,
			gradient: ppt.reflGradient / 10 - 1,
			size: $.clamp(ppt.reflSize / 100, 0.1, 1),
			strength: $.clamp(255 * ppt.reflStrength / 100, 0, 255)
		};

		img.mask.reflection = false;
		if (!ppt.butCustIconFont.length) ppt.butCustIconFont = 'Segoe UI Symbol';
		this.getColours();
		this.blur.level = ppt.theme == 2 ? 91.05 - $.clamp(ppt.blurTemp, 1.05, 90) : $.clamp(ppt.blurTemp * 2, 0, 254);
		img.mask.reset = true;
		this.setSbar();
		but.setSbarIcon();
		alb_scrollbar.active = true;
		art_scrollbar.active = true;
		[alb_scrollbar, art_scrollbar].forEach(v => {
			v.duration = {
				drag: 200,
				inertia: ppt.durationTouchFlick,
				full: ppt.durationScroll
			};
			v.duration.scroll = Math.round(v.duration.full * 0.8);
			v.duration.step = Math.round(v.duration.full * 2 / 3);
			v.duration.bar = v.duration.full;
			v.duration.barFast = v.duration.step;
			v.setCol();
			v.resetAuto();
		});
		but.createImages('all');
		this.getFont();
		this.calcText();
		ppt.thumbNailGap = Math.max(ppt.thumbNailGap, 0);
		img.createImages();
		filmStrip.set('clear');
		filmStrip.style.image = [ppt.filmCoverStyle, ppt.filmPhotoStyle];
		filmStrip.createBorder();
		img.setCrop(true);
		panel.alb.ix = 0;
		panel.art.ix = 0;
		img.id.albCyc = img.id.curAlbCyc = txt.id.curAlb = txt.id.alb = '';

		but.createStars(true);

		txt.artistReset(true);
		txt.albumReset(true);
		txt.albumFlush();
		txt.artistFlush();
		txt.rev.cur = '';
		txt.bio.cur = '';
		
		txt.bio.loaded = {
			am: false,
			lfm: false,
			wiki: false,
			txt: false,
			ix: -1
		}
		txt.rev.loaded = {
			am: false,
			lfm: false,
			wiki: false,
			txt: false,
			ix: -1
		}

		txt.bio.fallback = ['未找到任何内容', '没有要显示的简介'];
		txt.rev.fallback = ['未找到任何内容', '没有要显示的评论'];
		txt.loadReader();
		txt.getText(true);
		but.refresh(true);
		img.processSizeFilter();
		img.art.done = false;
		img.art.allFilesLength = 0;
		img.updImages();
		seeker.upd();

		const origLock = panel.lock;
		if (txt.bio.reader || txt.rev.reader) {
			panel.lock = 0;
			if (origLock != panel.lock) panel.mbtn_up(0, 0, false, true)
		}

		if (!panel.lock) panel.getList(true, true);

		men.playlists_changed();
		panel.checkNumServers();

		if (ppt.showFilmStrip && ppt.autoFilm) txt.getScrollPos();
		if (ppt.filmStripOverlay && ppt.showFilmStrip) filmStrip.set(ppt.filmStripPos);
		if (ppt.text_only && !this.style.isBlur) txt.paint();
	}

	setBrightness(c, percent) {
		c = $.toRGB(c);
		return RGB($.clamp(c[0] + (256 - c[0]) * percent / 100, 0, 255), $.clamp(c[1] + (256 - c[1]) * percent / 100, 0, 255), $.clamp(c[2] + (256 - c[2]) * percent / 100, 0, 255));
	}

	setSbar() {
		ppt.durationTouchFlick = $.clamp($.value(ppt.durationTouchFlick, 3000, 0), 0, 5000);
		ppt.durationScroll = $.clamp($.value(ppt.durationScroll, 500, 0), 0, 5000);
		ppt.flickDistance = $.clamp(ppt.flickDistance, 0, 10);
		ppt.touchStep = $.clamp(ppt.touchStep, 1, 10);
		ppt.sbarType = $.value(ppt.sbarType, 0, 0);
		this.sbar.type = Math.min(ppt.sbarType, 2);
		if (ppt.sbarType == 2) { // light mode only
			this.theme = window.CreateThemeManager('scrollbar');
			$.gr(21, 21, false, g => {
				try {
					this.theme.SetPartAndStateID(6, 1);
					this.theme.DrawThemeBackground(g, 0, 0, 21, 50);
					for (let k = 0; k < 3; k++) {
						this.theme.SetPartAndStateID(3, k + 1);
						this.theme.DrawThemeBackground(g, 0, 0, 21, 50);
					}
					for (let k = 0; k < 3; k++) {
						this.theme.SetPartAndStateID(1, k + 1);
						this.theme.DrawThemeBackground(g, 0, 0, 21, 21);
					}
				} catch (e) {
					this.sbar.type = 1;
					ppt.sbarType = 1;
				}
			});
		}
		this.sbar.arrowPad = ppt.sbarPad;
		ppt.sbarWidth = $.clamp(ppt.sbarWidth, 0, 400);
		ppt.sbarBase_w = $.clamp(ppt.sbarBase_w, 0, 400);

		if (ppt.sbarWidth != ppt.sbarBase_w) {
			ppt.sbarArrowWidth = Math.min(ppt.sbarArrowWidth, ppt.sbarWidth, 400);
		} else {
			ppt.sbarArrowWidth = $.clamp(ppt.sbarArrowWidth, 0, 400);
			ppt.sbarWidth = $.clamp(ppt.sbarWidth, ppt.sbarArrowWidth, 400);
		}
		ppt.sbarBase_w = ppt.sbarWidth;
		this.sbar.w = ppt.sbarBase_w;
		this.sbar.but_w = ppt.sbarArrowWidth;
		let themed_w = 21;
		try {
			themed_w = utils.GetSystemMetrics(2);
		} catch (e) {}
		if (ppt.sbarWinMetrics) {
			this.sbar.w = themed_w;
			this.sbar.but_w = ppt.sbarType != 3 ? this.sbar.w : this.sbar.w * 10 / 18;
		}
		if (!ppt.sbarWinMetrics && this.sbar.type == 2) this.sbar.w = Math.max(this.sbar.w, 13);
		if (!ppt.sbarShow) this.sbar.w = 0;
		this.sbar.but_h = this.sbar.w + (ppt.sbarType != 2 ? 1 : 0);
		if (ppt.sbarType != 2) {
			if (ppt.sbarButType || !this.sbar.type && this.sbar.but_w < Math.round(15 * $.scale)) this.sbar.but_w += 1;
			else if (this.sbar.type == 1 && this.sbar.but_w < Math.round(14 * $.scale)) this.sbar.arrowPad += 1;
		}
		const sp = this.sbar.type == 2 || this.sbar.w - this.sbar.but_w > 4 ? 0 : Math.round(1 * $.scale);
		this.sbar.sp = this.sbar.w ? this.sbar.w + sp : 0;
		this.sbar.arrowPad = $.clamp(-this.sbar.but_h / 5, this.sbar.arrowPad, this.sbar.but_h / 5);
	}

	setStarType() {
		this.stars = $.value(ppt.star, 1, 1) + 1;
		if ((!ppt.heading || !ppt.hdBtnShow || ppt.hdPos == 2) && this.stars == 1) this.stars = 2;
		if (!ppt.amRating && !ppt.lfmRating) this.stars = 0;
	}

	updateProp(prop, value) {
		const serverName = ppt.serverName;
		Object.entries(prop).forEach(v => {
			ppt[v[0].replace('_internal', '')] = v[1][value]
		});
		this.refreshProp();
		if (serverName != ppt.serverName) {
			window.Reload();
			window.NotifyOthers('bio_refresh', 'bio_refresh');
		}
	}

	wheel(step) {
		if (!panel || but.trace('lookUp', panel.m.x, panel.m.y)) return;
		if (vk.k('ctrl')) {
			if (but.trace('heading', panel.m.x, panel.m.y)) {
				if (!but.trace_src(panel.m.x, panel.m.y)) {
					ppt.zoomHead = $.clamp(ppt.zoomHead += step * 5, 25, 400);
					this.font.heading = gdi.Font(this.font.heading.Name, Math.max(Math.round(this.font.headingBaseSize * this.font.zoomSize / ppt.baseFontSize * (100 + ((ppt.zoomHead - 100) / this.font.boldAdjust)) / 100), 6), this.font.headingStyle);
				} else but.setSrcFontSize(step);
			} else if (panel.trace.text) {
				this.font.zoomSize += step;
				this.font.zoomSize = Math.max(this.font.zoomSize, 1);
				this.font.main = gdi.Font(this.font.main.Name, this.font.zoomSize, this.font.main.Style);
				this.font.heading = gdi.Font(this.font.heading.Name, Math.max(Math.round(this.font.headingBaseSize * this.font.zoomSize / ppt.baseFontSize * (100 + ((ppt.zoomHead - 100) / this.font.boldAdjust)) / 100), 6), this.font.headingStyle);

				['lyrics', 'subHeadSource', 'summary', 'subHeadTrack', 'subHeadWiki'].forEach(v => {
					this.font[v] = gdi.Font(this.font[v].Name, this.font.zoomSize, this.font[v].Style);
				});

				this.font.message = gdi.Font(this.font.main.Name, this.font.zoomSize * 1.5, 1);
				this.font.small = gdi.Font(this.font.main.Name, Math.round(this.font.zoomSize * 12 / 14), this.font.main.Style);
				this.narrowSbarWidth = ppt.narrowSbarWidth == 0 ? $.clamp(Math.floor(this.font.zoomSize / 7), 2, 10) : ppt.narrowSbarWidth;
			}
			this.calcText();
			but.createStars();
			txt.getSubHeadWidths();
			window.Repaint();
			ppt.zoomFont = Math.round(this.font.zoomSize / ppt.baseFontSize * 100);
			this.refresh();
		}
		if (vk.k('shift') && ppt.style > 3 && panel.trace.text) {
			this.overlay.strength += (-step * 5);
			this.overlay.strength = $.clamp(this.overlay.strength, 0, 255);
			ppt.overlayStrength = Math.round((255 - this.overlay.strength) / 2.55);
			this.getColours();
			img.mask.reset = true;
			if (!ppt.typeOverlay) {
				img.refl.adjust = true;
				if (ppt.artistView && ppt.cycPhoto) img.clearArtCache();
				if (panel.stndItem()) img.getImages();
				else img.getItem(panel.art.ix, panel.alb.ix);
			} else txt.paint();
		}
	}
}

class Vkeys {
	k(n) {
		switch (n) {
			case 'shift':
				return utils.IsKeyPressed(0x10);
			case 'ctrl':
				return utils.IsKeyPressed(0x11);
			case 'alt':
				return utils.IsKeyPressed(0x12);
		}
	}
}

let colourSelector = {}
let sync = {image: () => {}}
const syncer = fb.ProfilePath + 'settings\\themed\\bioSyncTheme.js';
if (ppt.themed && $.file(syncer)) include(syncer);