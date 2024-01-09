'use strict';

class ResizeHandler {
	constructor() {
		this.down = false;
		this.editorFont = gdi.Font('Microsoft Yahei UI', 15 * $.scale, 1);
		this.focus = true;
		this.lc = StringFormat(0, 1);
		this.init_x = 0;
		this.init_y = 0;
		this.updFilm = false;
		this.x_init = 0;
		this.y_init = 0;
		this.x_start = 0;
		this.y_start = 0;
		this.sf = '';
		this.si = '';
		this.st = ''

		this.cursorId = {
			all: 32646,
			left: 32644,
			right: 32644,
			ne: 32643,
			sw: 32643,
			nw: 32642,
			se: 32642,
			top: 32645,
			bottom: 32645
		}
	}

	// Methods

	drawEd(gr) {
		if (vk.k('ctrl') && this.focus && panel.m.y != -1 || panel.style.new) {
			const ed = gr.MeasureString(this.editText(), this.editorFont, 15, 15, panel.w - 15, panel.h - 15, this.lc);
			gr.FillSolidRect(10, 10, ed.Width + 10, ed.Height + 10, ui.col.edBg);
			if (!ppt.text_only && !ppt.img_only) {
				if (ppt.style > 4) {
					if (!vk.k('shift')) gr.DrawRect(panel.ibox.l + 2, panel.ibox.t + 2, panel.ibox.w - 4, panel.ibox.h - 4, 5, RGB(0, 255, 0));
					if (!vk.k('alt')) gr.DrawRect(panel.tbox.l + 2, panel.tbox.t + 2, panel.tbox.w - 4, panel.tbox.h - 4, 5, RGB(255, 0, 0));
				} else if (ppt.style < 4) {
					switch (ppt.style) {
						case 0:
							gr.FillSolidRect(0, panel.img.t + panel.style.imgSize, panel.w, 5, RGB(255, 128, 0));
							break;
						case 1:
							gr.FillSolidRect(panel.img.l - 5, 0, 5, panel.h, RGB(255, 128, 0));
							break;
						case 2:
							gr.FillSolidRect(0, panel.img.t - 5, panel.w, 5, RGB(255, 128, 0));
							break;
						case 3:
							gr.FillSolidRect(panel.img.l + panel.style.imgSize, 0, 5, panel.h, RGB(255, 128, 0));
							break;
					}
				}
			}
			if (panel.style.showFilmStrip) {
				switch (ppt.filmStripPos) {
					case 0:
						gr.FillSolidRect(0, filmStrip.y + filmStrip.h, panel.w, 5, RGB(0, 255, 255));
						break;
					case 1:
						gr.FillSolidRect(filmStrip.x - 5, 0, 5, panel.h, RGB(0, 255, 255));
						break;
					case 2:
						gr.FillSolidRect(0, filmStrip.y - 5, panel.w, 5, RGB(0, 255, 255));
						break;
					case 3:
						gr.FillSolidRect(filmStrip.x + filmStrip.w, 0, 5, panel.h, RGB(0, 255, 255));
						break;
				}
			}
			gr.SetTextRenderingHint(5);
			gr.DrawString(this.editText(), this.editorFont, ui.col.shadow, 16, 16, ed.Width, ed.Height, this.lc);
			gr.DrawString(this.editText(), this.editorFont, ui.col.text_h, 15, 15, ed.Width, ed.Height, this.lc);
		}
	}

	editText() {
		return (ppt.text_only ? '样式：仅文本' + (panel.style.showFilmStrip ? '\n - 布局调整：拖动线条' : '') : (ppt.img_only ? '样式：仅图像' + (panel.style.showFilmStrip ? '\n - 布局调整：拖动线条' : '') : '名称：' + panel.style.name[ppt.style] + (ppt.style < 4 ? '\n\n样式：自动\n - 布局调整：拖动线条' + (panel.style.showFilmStrip && !ppt.img_only && ppt.style != 4 ? 's' : '') + '\n - 图像强度：在文本上 Shift + 滚轮' : ppt.style == 4 ? '\n\n样式：自动' + (panel.style.showFilmStrip && !ppt.img_only ? '\n - 布局调整：拖动线条' : '') + '\n - 图像强度：在文本上 Shift + 滚轮' : '\n\n样式：自由式\n - 布局调整：拖动线条或方框：Ctrl（任意），Ctrl + Alt（图像），Ctrl + Shift（文本）或 Ctrl + Alt + Shift（幻灯片）\n - 叠加强度：在文本上 Shift + 滚轮'))) + (img.isType('Refl') && !ppt.text_only && ppt.style != 4 ? '\n - 倒影强度：在主图像上 Shift + 滚轮' : '') + (!ppt.img_only ? '\n - 文本大小：在文本上 Ctrl + 滚轮' : '') + '\n - ' + (ppt.style != 4 ? '' : '文本') +'填充：面板设置>显示';
	}

	filmMove(x, y) {
		if (!this.focus || !panel.style.showFilmStrip || !vk.k('ctrl')) return;
		if (!this.down) {
			switch (ppt.filmStripPos) {
				case 0:
					this.sf = y > filmStrip.y + filmStrip.h && y < filmStrip.y + filmStrip.h + 5;
					if (this.sf) window.SetCursor(32645);
					break;
				case 1:
					this.sf = x > filmStrip.x - 5 && x < filmStrip.x;
					if (this.sf) window.SetCursor(32644);
					break;
				case 2:
					this.sf = y > filmStrip.y - 5 && y < filmStrip.y;
					if (this.sf) window.SetCursor(32645);
					break;
				case 3:
					this.sf = x > filmStrip.x + filmStrip.w && x < filmStrip.x + filmStrip.w + 5;
					if (this.sf) window.SetCursor(32644);
					break;
			}
		}
		if (!this.down || !this.sf) return;
		switch (ppt.filmStripPos) {
			case 0:
				ppt.filmStripSize = (ppt.filmStripSize * panel.h + y - this.y_start) / panel.h;
				ppt.filmStripSize = $.clamp(parseFloat(ppt.filmStripSize.toFixed(15)), 0.02, filmStrip.max_sz / panel.h);
				break;
			case 1:
				ppt.filmStripSize = (ppt.filmStripSize * panel.w + this.x_start - x) / panel.w;
				ppt.filmStripSize = $.clamp(parseFloat(ppt.filmStripSize.toFixed(15)), 0.02, filmStrip.max_sz / panel.w);
				break;
			case 2:
				ppt.filmStripSize = (ppt.filmStripSize * panel.h + this.y_start - y) / panel.h;
				ppt.filmStripSize = $.clamp(parseFloat(ppt.filmStripSize.toFixed(15)), 0.02, filmStrip.max_sz / panel.h);
				break;
			case 3:
				ppt.filmStripSize = (ppt.filmStripSize * panel.w + x - this.x_start) / panel.w;
				ppt.filmStripSize = $.clamp(parseFloat(ppt.filmStripSize.toFixed(15)), 0.02, filmStrip.max_sz / panel.w);
				break;
		}
		filmStrip.logScrollPos();
		filmStrip.setSize();
		window.Repaint();
		this.updFilm = true;
		this.x_start = x;
		this.y_start = y;
	}

	lbtn_dn(x, y) {
		panel.style.new = false;
		if (!vk.k('ctrl')) return;
		this.down = true;
		this.updFilm = false;
		this.init_x = x;
		this.init_y = y;
		this.x_init = x;
		this.y_init = y;
		this.x_start = x;
		this.y_start = y;
	}

	lbtn_up() {
		if (!this.down || !this.focus) return;
		window.SetCursor(32512);
		this.down = false;
		img.mask.reset = true;
		if (ppt.style > 3) {
			const obj = ppt.style == 4 || ppt.style == 5 ? panel.style.overlay : panel.style.free[ppt.style - 6];
			const imL = Math.round(panel.im.l * panel.w);
			const imR = Math.round(panel.im.r * panel.w);
			const imT = Math.round(panel.im.t * panel.h);
			const imB = Math.round(panel.im.b * panel.h);
			const txL = Math.round(panel.tx.l * panel.w);
			const txR = Math.round(panel.tx.r * panel.w);
			const txT = Math.round(panel.tx.t * panel.h);
			const txB = Math.round(panel.tx.b * panel.h);
			let sv = false;
			if (panel.h > txB + txT + ppt.textT + ppt.textB + 10 && panel.w > txR + txL + ppt.textL + ppt.textR + 10) {
				obj.txL = panel.tx.l;
				obj.txR = panel.tx.r;
				obj.txT = panel.tx.t;
				obj.txB = panel.tx.b;
				sv = true;
			}
			if (panel.h > imB + imT + panel.bor.t + panel.bor.b + 10 && panel.w > imR + imL + panel.bor.l + panel.bor.r + 10) {
				obj.imL = panel.im.l;
				obj.imR = panel.im.r;
				obj.imT = panel.im.t;
				obj.imB = panel.im.b;
				sv = true;
			}
			if (sv) {
				ppt.style == 4 ? ppt.styleOverlay = JSON.stringify(panel.style.overlay) : ppt.styleFree = JSON.stringify(panel.style.free);
			} else {
				panel.im.l = $.clamp(obj.imL, 0, 1);
				panel.im.r = $.clamp(obj.imR, 0, 1);
				panel.im.t = $.clamp(obj.imT, 0, 1);
				panel.im.b = $.clamp(obj.imB, 0, 1);
				panel.tx.l = $.clamp(obj.txL, 0, 1);
				panel.tx.r = $.clamp(obj.txR, 0, 1);
				panel.tx.t = $.clamp(obj.txT, 0, 1);
				panel.tx.b = $.clamp(obj.txB, 0, 1);
			}
		}
		filmStrip.clearCache();
		if (panel.style.showFilmStrip && ppt.filmStripOverlay) filmStrip.set(ppt.filmStripPos);
		txt.refresh(this.updFilm ? 0 : 3);
		filmStrip.paint();
	}

	imgMove(x, y) {
		if (!this.focus || ppt.img_only || ppt.text_only || ppt.style == 4) return;
		switch (true) {
			case ppt.style > 3: {
				if (!vk.k('ctrl') || vk.k('shift')) break;
				if (!this.down) {
					this.si = y > panel.ibox.t - 5 && y < panel.ibox.t + 5 && x > panel.ibox.l + 10 && x < panel.ibox.l + panel.ibox.w - 10 ? 'top' :
						y > panel.ibox.t - 5 && y < panel.ibox.t + 15 && x > panel.ibox.l && x < panel.ibox.l + 10 ? 'nw' :
						y > panel.ibox.t - 5 && y < panel.ibox.t + 15 && x > panel.ibox.l + panel.ibox.w - 10 && x < panel.ibox.l + panel.ibox.w ? 'ne' :
						y > panel.ibox.t + panel.ibox.h - 5 && y < panel.ibox.t + panel.ibox.h + 5 && x > panel.ibox.l + 10 && x < panel.ibox.l + panel.ibox.w - 5 ? 'bottom' :
						y > panel.ibox.t + panel.ibox.h - 15 && y < panel.ibox.t + panel.ibox.h + 5 && x > panel.ibox.l && x < panel.ibox.l + 10 ? 'sw' :
						y > panel.ibox.t + panel.ibox.h - 15 && y < panel.ibox.t + panel.ibox.h + 5 && x > panel.ibox.l + panel.ibox.w - 10 && x < panel.ibox.l + panel.ibox.w ? 'se' :
						y > panel.ibox.t && y < panel.ibox.t + panel.ibox.h && x > panel.ibox.l - 5 && x < panel.ibox.l + 5 ? 'left' :
						y > panel.ibox.t && y < panel.ibox.t + panel.ibox.h && x > panel.ibox.l + panel.ibox.w - 5 && x < panel.ibox.l + panel.ibox.w + 5 ? 'right' :
						y > panel.ibox.t + 20 && y < panel.ibox.t + panel.ibox.h - 20 && x > panel.ibox.l + 20 && x < panel.ibox.l + panel.ibox.w - 20 ? 'all' : '';
					this.setCursor(this.si);
				}
				if (!this.down || !this.si) return;
				const filmStrip = {
					t: !ppt.filmStripOverlay ? panel.filmStripSize.t : 0,
					b: !ppt.filmStripOverlay ? panel.filmStripSize.b : 0,
					l: !ppt.filmStripOverlay ? panel.filmStripSize.l : 0,
					r: !ppt.filmStripOverlay ? panel.filmStripSize.r : 0
				}
				let imT = Math.round(panel.im.t * panel.h) + filmStrip.t;
				let imB = Math.round(panel.im.b * panel.h) + filmStrip.b;
				let imL = Math.round(panel.im.l * panel.w) + filmStrip.l;
				let imR = Math.round(panel.im.r * panel.w) + filmStrip.r;
				switch (this.si) {
					case 'top':
						if (y > panel.h - imB - 30) break;
						panel.im.t = $.clamp((y - filmStrip.t) / panel.h, 0, 1);
						break;
					case 'nw':
						if (y < panel.h - imB - 30) panel.im.t = $.clamp((y - filmStrip.t) / panel.h, 0, 1);
						if (x > panel.w - imR - 30) break;
						panel.im.l = $.clamp((x - filmStrip.l) / panel.w, 0, 1);
						break;
					case 'ne':
						if (y < panel.h - imB - 30) panel.im.t = $.clamp((y - filmStrip.t) / panel.h, 0, 1);
						if (x < imL + 30) break;
						panel.im.r = $.clamp((panel.w - x - filmStrip.r) / panel.w, 0, 1);
						break;
					case 'left':
						if (x > panel.w - imR - 30) break;
						panel.im.l = $.clamp((x - filmStrip.l) / panel.w, 0, 1);
						break;
					case 'bottom':
						if (y < imT + 30) break;
						panel.im.b = $.clamp((panel.h - y - filmStrip.b) / panel.h, 0, 1);
						break;
					case 'sw':
						if (x < panel.w - imR - 30) panel.im.l = $.clamp((x - filmStrip.l) / panel.w, 0, 1);
						if (y < imT + 30) break;
						panel.im.b = $.clamp((panel.h - y - filmStrip.b) / panel.h, 0, 1);
						break;
					case 'se':
						if (y > imT + 30) panel.im.b = $.clamp((panel.h - y - filmStrip.b) / panel.h, 0, 1);
						if (x < imL + 30) break;
						panel.im.r = $.clamp((panel.w - x - filmStrip.r) / panel.w, 0, 1);
						break;
					case 'right':
						if (x < imL + 30) break;
						panel.im.r = $.clamp((panel.w - x - filmStrip.r) / panel.w, 0, 1);
						break;
					case 'all':
						if (imT <= filmStrip.t && y - this.init_y < 0 || imB <= filmStrip.b && y - this.init_y > 0 || imL <= filmStrip.l && x - this.init_x < 0 || imR <= filmStrip.r && x - this.init_x > 0) break;
						imT += (y - this.y_init);
						panel.im.t = $.clamp((imT - filmStrip.t) / panel.h, 0, 1);
						imB = panel.h - Math.max(imT, 0) - panel.ibox.h;
						panel.im.b = $.clamp((imB - filmStrip.b) / panel.h, 0, 1);
						imL += (x - this.x_init);
						panel.im.l = $.clamp((imL - filmStrip.l) / panel.w, 0, 1);
						imR = panel.w - Math.max(imL, 0) - panel.ibox.w;
						panel.im.r = $.clamp((imR - filmStrip.r) / panel.w, 0, 1);
						break;
				}
				this.sizes(true);
				break;
			}
			case ppt.style < 4: {
				if (!vk.k('ctrl')) break;
				if (!this.down) {
					switch (ppt.style) {
						case 0:
							this.si = y > panel.img.t + panel.style.imgSize && y < panel.img.t + panel.style.imgSize + 5;
							if (this.si) window.SetCursor(32645);
							break;
						case 1:
							this.si = x > panel.img.l - 5 && x < panel.img.l;
							if (this.si) window.SetCursor(32644);
							break;
						case 2:
							this.si = y > panel.img.t - 5 && y < panel.img.t;
							if (this.si) window.SetCursor(32645);
							break;
						case 3:
							this.si = x > panel.img.l + panel.style.imgSize && x < panel.img.l + panel.style.imgSize + 5;
							if (this.si) window.SetCursor(32644);
							break;
					}
				}
				if (!this.down || !this.si) return;
				const filmStrip = {
					t: !ppt.filmStripOverlay ? panel.filmStripSize.t : 0,
					b: !ppt.filmStripOverlay ? panel.filmStripSize.b : 0,
					l: !ppt.filmStripOverlay ? panel.filmStripSize.l : 0,
					r: !ppt.filmStripOverlay ? panel.filmStripSize.r : 0
				}
				const ph = panel.h - filmStrip.t - filmStrip.b;
				const pw = panel.w - filmStrip.l - filmStrip.r;
				switch (ppt.style) {
					case 0:
						ppt.rel_imgs = (ppt.rel_imgs * ph + y - this.y_init) / ph;
						break;
					case 1:
						ppt.rel_imgs = (ppt.rel_imgs * pw + this.x_init - x) / pw;
						break;
					case 2:
						ppt.rel_imgs = (ppt.rel_imgs * ph + this.y_init - y) / ph;
						break;
					case 3:
						ppt.rel_imgs = (ppt.rel_imgs * pw + x - this.x_init) / pw;
						break;
				}
				ppt.rel_imgs = $.clamp(parseFloat(ppt.rel_imgs.toFixed(15)), 0.1, 0.9);
				this.sizes();
				break;
			}
		}
		this.x_init = x;
		this.y_init = y;
	}

	move(x, y) {
		if (ppt.style < 4 || ppt.img_only || ppt.text_only || !vk.k('ctrl') || vk.k('alt') || !this.focus || ppt.style == 4) return;
		if (!this.down) {
			this.st = y > panel.tbox.t - 5 && y < panel.tbox.t + 5 && x > panel.tbox.l + 10 && x < panel.tbox.l + panel.tbox.w - 10 ? 'top' :
				y > panel.tbox.t - 5 && y < panel.tbox.t + 15 && x > panel.tbox.l && x < panel.tbox.l + 10 ? 'nw' :
				y > panel.tbox.t - 5 && y < panel.tbox.t + 15 && x > panel.tbox.l + panel.tbox.w - 10 && x < panel.tbox.l + panel.tbox.w ? 'ne' :
				y > panel.tbox.t + panel.tbox.h - 5 && y < panel.tbox.t + panel.tbox.h + 5 && x > panel.tbox.l + 10 && x < panel.tbox.l + panel.tbox.w - 10 ? 'bottom' :
				y > panel.tbox.t + panel.tbox.h - 15 && y < panel.tbox.t + panel.tbox.h + 5 && x > panel.tbox.l && x < panel.tbox.l + 10 ? 'sw' :
				y > panel.tbox.t + panel.tbox.h - 15 && y < panel.tbox.t + panel.tbox.h + 5 && x > panel.tbox.l + panel.tbox.w - 10 && x < panel.tbox.l + panel.tbox.w ? 'se' :
				y > panel.tbox.t + 10 && y < panel.tbox.t + panel.tbox.h && x > panel.tbox.l - 5 && x < panel.tbox.l + 5 ? 'left' :
				y > panel.tbox.t + 10 && y < panel.tbox.t + panel.tbox.h && x > panel.tbox.l + panel.tbox.w - 5 && x < panel.tbox.l + panel.tbox.w + 5 ? 'right' :
				y > panel.tbox.t + 20 && y < panel.tbox.t + panel.tbox.h - 20 && x > panel.tbox.l + 20 && x < panel.tbox.l + panel.tbox.w - 20 ? 'all' : '';
			this.setCursor(this.st);
		}
		if (!this.down || !this.st) return;
		const filmStrip = {
			t: !ppt.filmStripOverlay ? panel.filmStripSize.t : 0,
			b: !ppt.filmStripOverlay ? panel.filmStripSize.b : 0,
			l: !ppt.filmStripOverlay ? panel.filmStripSize.l : 0,
			r: !ppt.filmStripOverlay ? panel.filmStripSize.r : 0
		}
		let txT = Math.round(panel.tx.t * panel.h) + filmStrip.t;
		let txB = Math.round(panel.tx.b * panel.h) + filmStrip.b;
		let txL = Math.round(panel.tx.l * panel.w) + filmStrip.l;
		let txR = Math.round(panel.tx.r * panel.w) + filmStrip.r;
		switch (this.st) {
			case 'top':
				if (y > panel.h - txB - panel.style.minH) break;
				panel.tx.t = $.clamp((y - filmStrip.t) / panel.h, 0, 1);
				break;
			case 'nw':
				if (y < panel.h - txB - panel.style.minH) panel.tx.t = $.clamp((y - filmStrip.t) / panel.h, 0, 1);
				if (x > panel.w - txR - 30) break;
				panel.tx.l = $.clamp((x - filmStrip.l) / panel.w, 0, 1);
				break;
			case 'ne':
				if (y < panel.h - txB - panel.style.minH) panel.tx.t = $.clamp((y - filmStrip.t) / panel.h, 0, 1);
				if (x < txL + 30) break;
				panel.tx.r = $.clamp((panel.w - x - filmStrip.r) / panel.w, 0, 1);
				break;
			case 'left':
				if (x > panel.w - txR - 30) break;
				panel.tx.l = $.clamp((x - filmStrip.l) / panel.w, 0, 1);
				break;
			case 'bottom':
				if (y < txT + panel.style.minH) break;
				panel.tx.b = $.clamp((panel.h - y - filmStrip.b) / panel.h, 0, 1);
				break;
			case 'sw':
				if (x < panel.w - txR - 30) panel.tx.l = $.clamp((x - filmStrip.l) / panel.w, 0, 1);
				if (y < txT + panel.style.minH) break;
				panel.tx.b = $.clamp((panel.h - y - filmStrip.b) / panel.h, 0, 1);
				break;
			case 'se':
				if (y > txT + panel.style.minH) panel.tx.b = $.clamp((panel.h - y - filmStrip.b) / panel.h, 0, 1);
				if (x < txL + 30) break;
				panel.tx.r = $.clamp((panel.w - x - filmStrip.r) / panel.w, 0, 1);
				break;
			case 'right':
				if (x < txL + 30) break;
				panel.tx.r = $.clamp((panel.w - x - filmStrip.r) / panel.w, 0, 1);
				break;
			case 'all':
				if (txT <= filmStrip.t && y - this.init_y < 0 || txB <= filmStrip.b && y - this.init_y > 0 || txL <= filmStrip.l && x - this.init_x < 0 || txR <= filmStrip.r && x - this.init_x > 0) break;
				txT += (y - this.init_y);
				panel.tx.t = $.clamp((txT - filmStrip.t) / panel.h, 0, 1);
				txL += (x - this.init_x);
				panel.tx.l = $.clamp((txL - filmStrip.l) / panel.w, 0, 1);
				txB = panel.h - Math.max(txT, 0) - panel.tbox.h;
				panel.tx.b = $.clamp((txB - filmStrip.b) / panel.h, 0, 1);
				txR = panel.w - Math.max(txL, 0) - panel.tbox.w;
				panel.tx.r = $.clamp((txR - filmStrip.r) / panel.w, 0, 1);
				break;
		}
		this.sizes(true);
		this.init_x = x;
		this.init_y = y;
	}

	setCursor(n) {
		const c = this.cursorId[n] || 0;
		if (c) window.SetCursor(c);
	}

	sizes(bypass) {
		panel.setStyle(bypass);
		but.check();
		txt.paint();
	}
}