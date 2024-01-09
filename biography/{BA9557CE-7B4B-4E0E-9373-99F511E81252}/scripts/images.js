'use strict';

class Images {
	constructor() {
		this.artist = '';
		this.blur = null;
		this.counter = 0;
		this.cur = null;
		this.cur_artist = '';
		this.cur_handle = null;
		this.get = true;
		this.init = true;
		this.nh = 10;
		this.nw = 10;
		this.removed = 0;
		this.themed = null;
		this.x = 0;
		this.y = 0;
		this.exclArr = [6467, 6473, 6500, 24104, 24121, 34738, 29520, 35875, 37235, 47700, 52526, 68626, 86884, 92172];
		this.ext = ['.jpg', '.png', 'webp', '.gif', '.bmp', '.jpeg'];

		this.art = {
			allFilesLength: 0,
			checkArr: [],
			checkNo: 0,
			displayedOtherPanel: null,
			done: false,
			folder: '',
			folderSup: '',
			images: [],
			ix: 0,
			list: [],
			cusPhotoLocation: false,
			validate: []
		}

		this.blackList = {
			file: `${cfg.storageFolder}blacklist_image.json`,
			artist: '',
			cur: '',
			item: [],
			undo: []
		}

		this.bor = {
			w1: 0,
			w2: 0
		}

		this.cov = {
			counter: 0,
			cycle: ppt.loadCovAllFb || ppt.loadCovFolder,
			cycle_ix: 0,
			done: '',
			folder: '',
			folderSameAsArt: cfg.albCovFolder.toUpperCase() == cfg.pth.foImgArt.toUpperCase(),
			ix: 0,
			images: [],
			list: [],
			newBlur: false,
			blur: null,
			selection: $.jsonParse(ppt.loadCovSelFb, [0, 1, 2, 3, 4])
		}

		this.filter = {
			maxSz: 12582912,
			minSz: 51200,
			minPx: 500,
			minNo: 3,
			size: false
		}

		this.id = {
			albCounter: '',
			curAlbCounter: '',
			albCyc: '',
			curAlbCyc: '',
			album: '',
			curAlbum: '',
			artCounter: '',
			curArtCounter: '',
			blur: '',
			curBlur: '',
			img: '',
			curImg: '',
			w1: 0,
			w2: 0
		}

		this.im = {
			t: 0,
			r: 0,
			b: 0,
			l: 0,
			w: 100,
			h: 100
		}

		this.mask = {
			circular: null,
			fade: null,
			reflection: null,
			reset: false
		}

		ppt.reflStrength = $.clamp(ppt.reflStrength, 0, 100);
		ppt.reflGradient = $.clamp(ppt.reflGradient, 0, 100);
		ppt.reflSize = $.clamp(ppt.reflSize, 0, 100);

		this.refl = {
			adjust: false,
			gradient: ppt.reflGradient / 10 - 1,
			size: $.clamp(ppt.reflSize / 100, 0.1, 1),
			strength: $.clamp(255 * ppt.reflStrength / 100, 0, 255)
		}

		this.stub = {
			0: {
				panel: false,
				path: '',
				user: null
			},
			1: {
				panel: false,
				path: '',
				user: null
			},
			2: {
				path: '',
				user: null
			},
			3: {
				panel: false,
				path: '',
				user: null
			},
			4: {
				panel: false,
				path: '',
				user: null
			},
			art: {
				file: `${cfg.storageFolder}artist_stub_user.png`,
				folder: `${cfg.storageFolder}artist_stub_user`,
				path: '',
				user: null
			},
			cov: {
				file: `${cfg.storageFolder}front_cover_stub_user.png`,
				folder: `${cfg.storageFolder}front_cover_stub_user`,
				path: '',
				user: null
			},
			default: []
		}

		this.style = {
			alpha: 255,
			blur: null,
			circular: false,
			crop: false,
			border: 0,
			delay: Math.min(ppt.cycTimePic, 7) * 1000,
			fade: false,
			horizontal: true,
			overlay: false,
			reflection: false,
			vertical: false
		}

		this.timeStamp = {
			cov: Date.now(),
			photo: Date.now()
		}

		this.touch = {
			dn: false,
			end: 0,
			start: 0
		}

		this.transition = {
			level: $.clamp(100 - ppt.transLevel, 0.1, 100)
		}

		this.transition.incr = Math.pow(284.2171 / this.transition.level, 0.0625);
		if (this.transition.level == 100) this.transition.level = 255;
		this.cycImages = this.cov.folderSameAsArt ? this.artImages : v => {
			if (!$.file(v)) return false;
			return /(?:jpe?g|png|webp|gif|bmp)$/i.test(fso.GetExtensionName(v));
		}

		['Front', 'Back', 'Disc', 'Icon', 'Art'].forEach((v, i) => {
			const f = cfg.expandPath(ppt[`panel${v}Stub`]);
			if ($.file(f)) {
				this.stub[i].panel = true;
				this.stub[i].path = f;
				this.stub[i].user = gdi.Image(this.stub[i].path);
			}
		});

		for (let i = 0; i < 5; i++) {
			if (!this.stub[i].user) {
				const pth = i != 4 ? 'cov' : 'art';
				this.ext.some(v => {
					this.stub[i].path = this.stub[pth].folder + v;
					if ($.file(this.stub[i].path)) {
						this.stub[i].user = gdi.Image(this.stub[i].path);
						return true;
					}
				});
			}
		}

		this.setCov = $.debounce(() => {
			filmStrip.logScrollPos();
			if (this.cov.ix < 0) this.cov.ix = this.cov.images.length - 1;
			else if (this.cov.ix >= this.cov.images.length) this.cov.ix = 0;
			this.cov.cycle_ix = this.cov.ix;
			const key = this.cov.images[this.cov.ix];
			this.loadImg(cov, key, true, this.cov.ix, this.isEmbedded('stnd', this.cov.ix));
			this.timeStamp.cov = Date.now();
		}, 100);

		this.setPhoto = $.debounce(() => {
			filmStrip.logScrollPos();
			if (this.art.ix < 0) this.art.ix = this.art.images.length - 1;
			else if (this.art.ix >= this.art.images.length) this.art.ix = 0;
			this.loadArtImage();
			this.timeStamp.photo = Date.now();
		}, 100);

		this.createImages();
		if (ppt.img_only) this.setCrop(true);
		this.processSizeFilter();

		this.cov.selFiltered = this.cov.selection.filter(v => v != -1);
	}

	// Methods

	artImages(v) {
		if (!$.file(v)) return false;
		const fileSize = utils.GetFileSize(v);
		return (name.isLfmImg(fso.GetFileName(v)) || !ppt.imgFilterLfm && /(?:jpe?g|png|webp|gif|bmp)$/i.test(fso.GetExtensionName(v)) && !/ - /.test(fso.GetBaseName(v))) && !this.exclArr.includes(fileSize) && !this.blackListed(v);
	}

	artistReset(force) {
		if (panel.lock) return;
		this.blurCheck();
		this.cur_artist = this.artist;
		this.artist = name.artist(panel.id.focus);
		const new_artist = this.artist && this.artist != this.cur_artist || !this.artist || ppt.covBlur && ui.style.isBlur && this.id.blur != this.id.curBlur || force;
		if (new_artist) {
			this.art.folderSup = '';
			let files = [];
			if (ppt.cycPhotoLocation == 1) {
				this.art.folder = !panel.isRadio(panel.id.focus) ? panel.cleanPth(cfg.artCusImgFolder, panel.id.focus) : panel.cleanPth(cfg.remap.foCycPhoto, panel.id.focus, 'remap', this.artist, '', 1);
				files = utils.Glob(this.art.folder + '*');
			}
			if (files.length && files.some(v => /(?:jpe?g|png|webp|gif|bmp)$/i.test(fso.GetExtensionName(v)))) {
				this.art.cusPhotoLocation = true;
			} else {
				this.art.folder = !panel.isRadio(panel.id.focus) ? panel.cleanPth(cfg.pth.foImgArt, panel.id.focus) : panel.cleanPth(cfg.remap.foImgArt, panel.id.focus, 'remap', this.artist, '', 1);
				this.art.cusPhotoLocation = false;
			}
			this.clearArtCache(true);
			if (ppt.cycPhoto) this.art.done = false;
			if (!this.art.images.length) {
				this.art.allFilesLength = 0;
				this.art.ix = 0;
			}
		}
	}

	async load_image_async(image_path) {
		const image = await gdi.LoadImageAsyncV2(0, image_path);
		const caller = this.getCallerId(image_path);
		if (caller.art_id === this.art.ix) {
			if (!image) {
				this.art.images.splice(this.art.ix, 1);
				if (this.art.images.length > 1) this.changePhoto(1);
				filmStrip.check('imgUpd');
				return;
			}
			this.processArtImg(image, image_path);	
		}
    }

	blacklist(clean_artist) {
		let black_list = [];
		if (!$.file(this.blackList.file)) return black_list;
		const list = $.jsonParse(this.blackList.file, false, 'file');
		return list.blacklist[clean_artist] || black_list;
	}

	blackListed(v) {
		img.blackList.cur = this.blackList.artist;
		this.blackList.artist = this.artist || name.artist(panel.id.focus);
		if (this.blackList.artist && this.blackList.artist != img.blackList.cur) {
			img.blackList.item = this.blacklist($.clean(this.blackList.artist).toLowerCase());
		}
		return img.blackList.item.includes(v.slice(v.lastIndexOf('_') + 1));
	}

	blurCheck() {
		if (!(ppt.covBlur && ui.style.isBlur) && !ppt.imgSmoothTrans || ppt.themed) return;
		this.id.curBlur = this.id.blur;
		this.id.blur = name.albID(panel.id.focus, 'stnd');
		this.id.blur += ppt.covType;
		if (this.id.blur != this.id.curBlur) {
			this.cov.newBlur = true;
			txt.rev.lookUp = false;
		}
	}

	blurImage(image, o) {
		if (!image || !panel.w || !panel.h) return;
		if (this.covBlur() && this.cov.newBlur) {
			let handle = null;
			this.cov.blur = null;
			if (cfg.cusCov && !ppt.covType) {
				this.chkPths(cfg.cusCovPaths, '', 1, true);
			}
			if (!this.cov.blur) {
				handle = $.handle(panel.id.focus);
				if (handle) this.cov.blur = utils.GetAlbumArtV2(handle, ppt.covType, !ppt.covType ? false : true);
			}
			if (!this.cov.blur && !ppt.covType) {
				const pth_cov = panel.getPth('cov', panel.id.focus).pth;
				this.ext.some(v => {
					if ($.file(pth_cov + v)) {
						this.cov.blur = gdi.Image(pth_cov + v);
						return true;
					}
				});
			}
			if (!this.cov.blur && !ppt.covType) {
				const a = name.albumArtist(panel.id.focus);
				const l = name.album(panel.id.focus);
				const pth_cov = [panel.getPth('cov', panel.id.focus).pth, panel.getPth('img', panel.id.focus, a, l).pth];
				this.chkPths(pth_cov, '', 1);
			}
			if (!this.cov.blur && !ppt.covType)
				if (handle) this.cov.blur = utils.GetAlbumArtV2(handle, 0);
			if (!this.cov.blur) this.cov.blur = this.stub.default[0].Clone(0, 0, this.stub.default[0].Width, this.stub.default[0].Height);
			this.cov.newBlur = false;
			if (this.cov.blur && !ppt.blurAutofill) this.cov.blur = this.cov.blur.Resize(panel.w, panel.h);
		}
		if (this.covBlur() && this.cov.blur) image = this.cov.blur.Clone(0, 0, this.cov.blur.Width, this.cov.blur.Height); // clone to stop blurring same img more than once
		image = ppt.blurAutofill ? this.format(image, 1, 'crop', panel.w, panel.h, 'blurAutofill', o) : this.format(image, 1, 'stretch', panel.w, panel.h, 'blurStretch', o);
		const i = $.gr(panel.w, panel.h, true, (g, gi) => {
			g.SetInterpolationMode(0);
			if (ui.blur.blend) {
				if (ppt.blurTemp) {
					const iSmall = image.Resize(Math.max(panel.w * ui.blur.level / 100, 1), Math.max(panel.h * ui.blur.level / 100, 2, 1), 2);
					const iFull = iSmall.Resize(panel.w, panel.h, 2);
					const offset = 90 - ui.blur.level;
					g.DrawImage(iFull, 0 - offset, 0 - offset, panel.w + offset * 2, panel.h + offset * 2, 0, 0, iFull.Width, iFull.Height, 0, ui.blur.blendAlpha);
				} else g.DrawImage(image, 0, 0, panel.w, panel.h, 0, 0, image.Width, image.Height, 0, ui.blur.blendAlpha); // no blur
			} else {
				if (ppt.theme == 1 || ppt.theme == 3) {
					g.DrawImage(image, 0, 0, panel.w, panel.h, 0, 0, image.Width, image.Height);
					if (ui.blur.level > 1) gi.StackBlur(ui.blur.level);
					g.FillSolidRect(0, 0, panel.w, panel.h, this.isImageLight(gi) ? ui.col.bg_light : ui.col.bg_dark);
				}
				if (ppt.theme == 4) {
					g.FillSolidRect(0, 0, panel.w, panel.h, this.getRandomCol());
					g.DrawImage(image, 0, 0, panel.w, panel.h, 0, 0, image.Width, image.Height, 0, this.getImgAlpha(image));
					if (ui.blur.level > 1) gi.StackBlur(ui.blur.level);
				}
			}
		});
		return i;
	}

	cache() {
		return ppt.artistView ? art : cov;
	}

	changeCov(incr) {
		filmStrip.logScrollPos();
		this.cov.cycle_ix += incr;
		if (this.cov.cycle_ix < 0) this.cov.cycle_ix = this.cov.images.length - 1;
		else if (this.cov.cycle_ix >= this.cov.images.length) this.cov.cycle_ix = 0;
		this.cov.ix = this.cov.cycle_ix;
		const key = this.cov.images[this.cov.ix];
		this.loadImg(cov, key, true, this.cov.ix, this.isEmbedded('stnd', this.cov.ix));
	}

	changePhoto(incr) {
		filmStrip.logScrollPos();
		this.art.ix += incr;
		if (this.art.ix < 0) this.art.ix = this.art.images.length - 1;
		else if (this.art.ix >= this.art.images.length) this.art.ix = 0;
		let i = 0;
		while (this.art.displayedOtherPanel == this.art.images[this.art.ix] && i < this.art.images.length) {
			this.art.ix += incr;
			if (this.art.ix < 0) this.art.ix = this.art.images.length - 1;
			else if (this.art.ix >= this.art.images.length) this.art.ix = 0;
			i++;
		}
		this.setCheckArr(this.art.images[this.art.ix]);
		this.loadArtImage();
	}

	check() {
		filmStrip.logScrollPos();
		this.id.albCyc = '';
		this.id.curAlbCyc = '';
		this.clearArtCache(true);
		if (panel.stndItem()) {
			this.art.done = false;
			if (!this.art.images.length) {
				this.art.allFilesLength = 0;
				this.art.ix = 0;
			}
			if (ppt.artistView && ppt.cycPhoto) this.getArtImg();
			else this.getFbImg();
		} else this.getItem(panel.art.ix, panel.alb.ix, true);
	}

	checkArr(info) {
		if (panel.block()) return;
		if (this.art.images.length < 2 || !ppt.artistView || ppt.text_only || !ppt.cycPhoto) return;
		if (!this.art.validate.includes(info[0])) this.art.validate.push(info[0]);
		this.art.displayedOtherPanel = info[1];
		if (!this.id.w1) this.id.w1 = info[0];
		this.id.w2 = (this.id.w1 == info[0]) ? 0 : info[0];
		if (this.art.images[this.art.ix] != info[2] && !this.id.w2 && this.art.checkNo < 10) {
			this.art.checkNo++;
			this.art.checkArr = [window.ID, this.art.images[this.art.ix], this.art.displayedOtherPanel];
			window.NotifyOthers('bio_checkImgArr', this.art.checkArr);
		}
		if (window.ID > info[0]) return;
		if (this.art.images[this.art.ix] == this.art.displayedOtherPanel && this.art.validate.length < 2) this.changePhoto(1);
	}

	checkUserStub(type, handle) {
		switch (type) {
			case 'art': {
				if (this.stub[4].user) break;
				const stubArtUser = utils.GetAlbumArtV2(handle, 4);
				if (stubArtUser) stubArtUser.SaveAs(this.stub.art.file);
				if ($.file(this.stub.art.file)) {
					this.stub[4].user = gdi.Image(this.stub.art.file);
					this.stub[4].path = this.stub.art.file;
				}
				break;
			}
			case 'cov': {
				if (this.stub[0].user) break;
				const stubCovUser = utils.GetAlbumArtV2(handle, 0);
				if (stubCovUser) stubCovUser.SaveAs(this.stub.cov.file);
				if ($.file(this.stub.cov.file)) {
					this.stub[0].user = gdi.Image(this.stub.cov.file);
					this.stub[0].path = this.stub.cov.file;
				}
				break;
			}
		}
	}

	chkPths(pths, fn, type, cusCovPaths) {
		let h = false;
		pths.some(v => {
			if (h) return true;
			const ph = !cusCovPaths ? v + fn : $.eval(v + fn, panel.id.focus);
			this.ext.some(w => {
				const ep = ph + w;
				if ($.file(ep)) {
					h = true;
					switch (type) {
						case 0:
							this.loadImg(cov, ep, true, this.cov.ix);
							return true;
						case 1:
							this.cov.blur = gdi.Image(ep);
							return true;
						case 2:
							return true;
						case 3:
							h = ep;
							return true;
					}
				}
			});
		});
		return h;
	}

	circularMask(image, tw, th) {
		image.ApplyMask(this.mask.circular.Resize(tw, th));
	}

	clearArtCache(fullClear) {
		if (fullClear) {
			this.art.images = [];
			this.art.validate = [];
			this.art.checkNo = 0;
		}
		art.cache = {};
	}

	clearCovCache() {
		cov.cache = {};
	}

	clearCache() {
		this.clearCovCache();
		this.clearArtCache();
	}

	covBlur() {
		return ppt.covBlur && ui.style.isBlur && (ppt.artistView || this.cov.cycle || ppt.text_only || panel.alb.ix);
	}

	createImages() {
		const bg = this.isType('AnyBorShadow') || !ui.blur.dark && !ui.blur.light;
		const cc = StringFormat(1, 1);
		const font1 = gdi.Font('Segoe UI', 230, 1);
		const font2 = gdi.Font('Segoe UI', 120, 1);
		const font3 = gdi.Font('Segoe UI', 200, 1);
		const font4 = gdi.Font('Segoe UI', 90, 1);
		const tcol = ui.col.text;
		const sz = 600;
		for (let i = 0; i < 3; i++) {
			this.stub.default[i] = $.gr(sz, sz, true, g => {
				g.SetSmoothingMode(2);
				if (bg) {
					g.FillSolidRect(0, 0, sz, sz, tcol & 0x08ffffff);
				}
				g.SetSmoothingMode(2);
				g.DrawEllipse(100, 100, 400, 400, 2, tcol & 0x16ffffff);
				g.DrawEllipse(220, 220, 160, 160, 2, tcol & 0x16ffffff);
				g.SetSmoothingMode(0);
			});
			this.mask.circular = $.gr(500, 500, true, g => {
				g.FillSolidRect(0, 0, 500, 500, RGB(255, 255, 255));
				g.SetSmoothingMode(2);
				g.FillEllipse(1, 1, 498, 498, RGBA(0, 0, 0, 255));
			});
		}
		this.get = true;
	}

	cur_pth() {
		return this.cache().pth;
	}

	draw(gr) {
		if (sync.get && sync.img) {
			sync.image(sync.img.image, sync.img.id);
			sync.get = false;
		}
		if (ppt.text_only && !ui.style.isBlur) {
			if (ppt.showFilmStrip && this.get) this.getImgFallback();
			return;
		}
		if (ui.style.isBlur) {
			const bImg = !this.themed ? this.blur : this.themed;
			if (bImg) gr.DrawImage(bImg, 0, 0, panel.w, panel.h, 0, 0, bImg.Width, bImg.Height);
		}
		if (this.get) return this.getImgFallback();
		if (!ppt.text_only && this.cur) {
			gr.DrawImage(this.cur, this.x, this.y, this.cur.Width, this.cur.Height, 0, 0, this.cur.Width, this.cur.Height, 0, this.style.alpha);
		}
	}

	fadeMask(image, x, y, w, h) {
		const xl = Math.max(0, panel.tbox.l - x);
		let f = Math.min(w, panel.tbox.l - x + panel.tbox.w);
		this.refl.adjust = false;
		if (xl >= f) return image;
		const wl = f - xl;
		const yl = Math.max(0, panel.tbox.t - y);
		f = Math.min(h, panel.tbox.t - y + panel.tbox.h);
		if (yl >= f) return image;
		const hl = f - yl;
		if (!this.mask.fade || this.mask.reset) {
			const km = ui.overlay.gradient != -1 && panel.img.t <= panel.text.t - ui.heading.h ? ui.overlay.strength / 500 + ui.overlay.gradient / 10 : 0;
			this.mask.fade = $.gr(500, 500, true, g => {
				for (let k = 0; k < 500; k++) {
					const c = 255 - $.clamp(ui.overlay.strength - k * km, 0, 255);
					g.FillSolidRect(0, k, 500, 1, RGB(c, c, c));
				}
			});
			this.mask.reset = false;
			if (ppt.style == 4 && panel.style.showFilmStrip) {
				const rotate = [2, 3, 0, 1][ppt.filmStripPos];
				this.mask.fade.RotateFlip(rotate);
			}
		}
		const mask = $.gr(w, h, true, g => g.DrawImage(this.mask.fade, xl, yl, wl, hl, 0, 0, this.mask.fade.Width, this.mask.fade.Height));
		image.ApplyMask(mask);
	}

	filmOK(newArr) {
		return newArr && this.art.list.length && ppt.showFilmStrip && filmStrip.scroll.pos.art[this.artist] && filmStrip.scroll.pos.art[this.artist].arr && filmStrip.scroll.pos.art[this.artist].arr.length;
	}

	forceStnd() {
		const n = ppt.artistView ? 'bio' : 'rev';
		return !ppt.sourceAll && txt[n].loaded.txt && (txt.reader[n].props || txt.reader[n].lyrics) && (ppt.artistView && panel.art.ix || !ppt.artistView && panel.alb.ix);
	}

	format(image, n, type, w, h, caller, o, blur, border, fade, reflection) {
		let ix = 0;
		let iy = 0;
		let iw = image.Width;
		let ih = image.Height;
		switch (type) {
			case 'crop':
			case 'circular': {
				const s1 = iw / w;
				const s2 = ih / h;
				const r = s1 / s2;
				if (this.needTrim(n, r)) {
					if (s1 > s2) {
						iw = Math.round(w * s2);
						ix = Math.round((image.Width - iw) / 2);
					} else {
						ih = Math.round(h * s1);
						iy = Math.round((image.Height - ih) / 8);
					}
					image = image.Clone(ix, iy, iw, ih);
				}
				if (caller == 'blurAutofill') return image;
				if (type == 'circular') this.circularMask(image, image.Width, image.Height);
				if (!border) image = image.Resize(w, h, 2);
				if (caller == 'filmStrip') return image;
				break;
			}
			case 'stretch':
				image = image.Resize(w, h, 2);
				if (caller == 'blurStretch') return image;
				break;
			default: {
				const sc = Math.min(h / ih, w / iw);
				this.im.w = Math.round(iw * sc);
				this.im.h = Math.round(ih * sc);
				if (!border) image = image.Resize(this.im.w, this.im.h, 2);
				if (caller != 'img') return image;
				break;
			}
		}

		this.setAlignment();

		if (border) image = this.getBorder(image, this.im.w, this.im.h, this.bor.w1, this.bor.w2);
		if (fade) this.fadeMask(image, this.im.l, this.im.t, image.Width, image.Height);
		o.x = o.counter_x = seeker.counter.x = this.x = this.im.l;
		o.y = o.counter_y = seeker.counter.y = this.y = this.im.t;
		o.w = this.im.w;
		o.h = this.im.h;
		if (reflection) image = this.reflImage(image, this.im.l, this.im.t, image.Width, image.Height, o);
		if (blur) {
			o.blur = this.blurImage(blur, o);
			this.blur = o.blur;
		}
		return image;
	}

	fresh() {
		this.counter++;
		if (this.counter < ppt.cycTimePic || panel.id.lyricsSource && lyrics.display() && lyrics.scroll) return;
		this.counter = 0;
		if (panel.block() || !ppt.cycPic || ppt.text_only || seeker.dn || panel.zoom()) return;
		if (ppt.artistView) {
			if (this.art.images.length < 2 || Date.now() - this.timeStamp.photo < this.style.delay || !ppt.cycPhoto) return;
			this.changePhoto(1);
		} else if (this.cov.cycle) {
			if (this.cov.images.length < 2 || Date.now() - this.timeStamp.cov < this.style.delay || panel.alb.ix) return;
			this.changeCov(1);
		}
	}

	getImgAlpha(image) {
		const colorSchemeArray = JSON.parse(image.GetColourSchemeJSON(15));
		let rTot = 0;
		let gTot = 0;
		let bTot = 0;
		let freqTot = 0;
		colorSchemeArray.forEach(v => {
			const col = $.toRGB(v.col);
			rTot += col[0] ** 2 * v.freq;
			gTot += col[1] ** 2 * v.freq;
			bTot += col[2] ** 2 * v.freq;
			freqTot += v.freq;
		});
		const avgCol = ($.clamp(Math.round(Math.sqrt(rTot / freqTot)), 0, 255) + $.clamp(Math.round(Math.sqrt(gTot / freqTot)), 0, 255) + $.clamp(Math.round(Math.sqrt(bTot / freqTot)), 0, 255)) / 3;
		return $.clamp(avgCol * -0.32 +  128, 64, 128);
	}

	getArtImages() {
		let allFiles = this.art.folder ? utils.Glob(this.art.folder + '*') : [];
		if (!allFiles.length && this.art.folderSup) allFiles = utils.Glob(this.art.folderSup + '*');
		if (allFiles.length == this.art.allFilesLength) return;
		let newArr = false;
		if (!this.art.images.length) {
			newArr = true;
			art.cache = {};
		}
		this.art.allFilesLength = allFiles.length;
		this.removed = 0;
		this.art.list = allFiles.filter(this.images.bind(this));
		if (this.filmOK(newArr)) {
			if ($.equal(this.art.list, filmStrip.scroll.pos.art[this.artist].images)) {
				this.art.images = filmStrip.scroll.pos.art[this.artist].arr;
				this.art.ix = filmStrip.scroll.pos.art[this.artist].ix || 0;
				return;
			}
		} else filmStrip.logScrollPos(this.art.list);
		let arr = this.art.list.slice();
		if (this.filter.size) arr = arr.filter(this.sizeFilter.bind(this));
		this.art.images = this.art.images.concat(arr);
		if (this.art.images.length > 1) {
			this.art.images = this.uniq(this.art.images);
			if (newArr) this.art.images = $.shuffle(this.art.images);
		}
		if (!newArr) seeker.upd();
		filmStrip.check(newArr);
	}

	getArtImg(update, bypass) {
		if (!ppt.artistView || ppt.text_only && !ui.style.isBlur && !ppt.showFilmStrip) return;
		if (!bypass && (panel.id.lyricsSource || panel.id.nowplayingSource || panel.id.propsSource)) {
			this.getItem(panel.art.ix, panel.alb.ix);
			this.init = false;
		}
		if (!this.art.done || update) {
			this.art.done = true;
			if (this.artist) this.getArtImages();
		}
		this.setCheckArr(ppt.cycPhoto ? this.art.images[this.art.ix] : null);
		this.loadArtImage();
	}

	getBorder(image, w, h, bor_w1, bor_w2) {
		const imgo = 7;
		const dpiCorr = ($.scale - 1) * imgo;
		const imb = imgo - dpiCorr;
		let imgb = 0;
		let sh_img = null;
		if (this.style.border > 1 && !this.style.reflection) {
			imgb = 15 + dpiCorr;
			sh_img = $.gr(Math.floor(w + bor_w2 + imb), Math.floor(h + bor_w2 + imb), true, g => !this.style.circular ? g.FillSolidRect(imgo, imgo, w + bor_w2 - imgb, h + bor_w2 - imgb, RGBA(0, 0, 0, 185)) : g.FillEllipse(imgo, imgo, w + bor_w2 - imgb, h + bor_w2 - imgb, RGBA(0, 0, 0, 185)));
			sh_img.StackBlur(12);
		}
		let bor_img = $.gr(Math.floor(w + bor_w2 + imgb), Math.floor(h + bor_w2 + imgb), true, g => {
			if (this.style.border > 1 && !this.style.reflection) g.DrawImage(sh_img, 0, 0, Math.floor(w + bor_w2 + imgb), Math.floor(h + bor_w2 + imgb), 0, 0, sh_img.Width, sh_img.Height);
			if (this.style.border == 1 || this.style.border == 3) {
				if (!this.style.circular) g.FillSolidRect(0, 0, w + bor_w2, h + bor_w2, !ppt.highlightImgBor ? RGB(255, 255, 255) : ui.col.text_h);
				else {
					g.SetSmoothingMode(2);
					g.FillEllipse(0, 0, w + bor_w2, h + bor_w2, !ppt.highlightImgBor ? RGB(255, 255, 255) : ui.col.text_h);
				}
			}
			g.DrawImage(image, bor_w1, bor_w1, w, h, 0, 0, image.Width, image.Height);
		});
		sh_img = null;
		return bor_img;
	}

	getCallerId(key) {
		const a = art.cache[key];
		const c = cov.cache[key];
		return {
			art_id: a && a.id,
			cov_id: c && c.id
		};
	}

	getCovImages() {
		if (ppt.artistView || !this.cov.cycle || panel.alb.ix) return false;
		if (!panel.lock) this.setAlbID();
		const new_album = this.id.albCyc != this.id.curAlbCyc || !this.id.albCyc;
		if (ppt.loadCovFolder && !panel.lock) this.cov.folder = panel.cleanPth(cfg.albCovFolder, panel.id.focus);
		if (new_album) {
			this.clearCovCache();
			this.cov.counter = 0;
			this.cov.list = [];
			this.cov.images = [];
			cov_scroller.reset();
			filmStrip.scroll.pos.cov = {};
			this.cov.ix = this.cov.cycle_ix = 0;
			if (ppt.loadCovFolder) {
				this.cov.images = this.cov.folder ? utils.Glob(this.cov.folder + '*') : [];
				this.removed = 0;
				this.cov.images = this.cov.images.filter(this.cycImages.bind(this));
				if (this.cov.folderSameAsArt) {
					if (this.filter.size) this.cov.images = this.cov.images.filter(this.sizeFilter.bind(this));
					this.cov.images = $.shuffle(this.cov.images);
				}
				for (let i = 0; i < this.cov.images.length; i++) {
					this.cov.list[i + 10] = {}
					this.cov.list[i + 10].id = i + 10;
					this.cov.list[i + 10].pth = this.cov.images[i];
				}
				this.cov.list = this.cov.list.filter(Boolean);
				this.cov.images = this.cov.list.map(v => v.pth);
				filmStrip.check();
			}
			if (ppt.loadCovAllFb) {
				const handle = $.handle(panel.id.focus);
				if (handle) this.cov.selFiltered.forEach(v => this.getImg(handle, v, false));
				else if (!ppt.loadCovFolder || !this.cov.images.length) return false;
			}
		}
		if (!new_album || !ppt.loadCovAllFb) {
			const key = this.cov.images[this.cov.ix];
			if (!key) return false;
			this.loadImg(cov, key, true, this.cov.ix, this.isEmbedded('stnd', this.cov.ix));
		}
		return true;
	}

	getFbImg() {
		if (ppt.artistView && this.art.images.length && ppt.cycPhoto) return;
		const forceStnd = this.forceStnd();
		this.cov.ix = this.cov.cycle && !panel.alb.ix ? this.cov.cycle_ix : panel.alb.ix + 1000000;
		this.blurCheck();
		if (this.getCovImages()) return;
		if (!forceStnd && (panel.alb.ix && panel.alb.ix < panel.alb.list.length && !ppt.artistView)) { // !stndAlb
			const a = panel.alb.list[panel.alb.ix].artist;
			const l = panel.alb.list[panel.alb.ix].album;
			const l_handle = lib.inLibrary(2, a, l);
			if (l_handle) { // check local
				this.getImg(l_handle, 0, false);
				return;
			}
			else {
				const pth = panel.getPth('img', panel.id.focus, a, l, '', cfg.supCache);
				if (this.chkPths(pth.pe, pth.fe, 0)) return;
				if (pth.fe != this.cov.done && cfg.dlRevImg) {
					const pth_cov = pth.pe[!cfg.supCache ? 0 : 1];
					const fn_cov = pth_cov + pth.fe;
					if ($.server) server.getRevImg(a, l, pth_cov, fn_cov, false);
					else window.NotifyOthers('bio_getRevImg', [a, l, pth_cov, fn_cov]);
					this.cov.done = pth.fe;
				}
				this.setStub(cov, this.stub[0].path, false, 0, this.stub[0].user);
				return;
			}
		}
		if ((forceStnd || !panel.alb.ix) && cfg.cusCov && !ppt.artistView && !ppt.covType) {
			if (this.chkPths(cfg.cusCovPaths, '', 0, true)) return;
		}
		if (!forceStnd && (panel.art.ix && panel.art.ix < panel.art.list.length && ppt.artistView)) { // !stndBio
			const a_handle = lib.inLibrary(3, this.artist);
			if (a_handle) {
				this.getImg(a_handle, 4, false);
				return;
			}
			this.setStub(art, this.stub[4].path, false, 1, this.stub[4].user);
			return;
		}
		// stndAlb
		const handle = $.handle(panel.id.focus);
		if (handle) {
			let id = ppt.artistView ? 4 : ppt.covType;
			if (!ppt.loadCovAllFb || forceStnd || ppt.artistView) this.getImg(handle, id, this.stub[id].panel ? false : !ppt.covType || ppt.artistView ? false : true);
			else {
				id = this.cov.selFiltered[0];
				let image = null;
				if (cov.cacheHit(this.stub[id].path)) return;
				if (this.stub[id].user) {
					image = this.stub[id].user;
					if (image) this.cache().cacheIt(image, this.stub[id].path);
				}
				if (!image) this.setStub(this.cache(), 'cover', true, 0);
			}
			return;
		}
		if (fb.IsPlaying && handle) return;
		this.setStub(this.cache(), 'noitem', true, 2);
	}

	getImages(force) {
		if (ppt.text_only && !ui.style.isBlur && !ppt.showFilmStrip) return;
		if (ppt.artistView && ppt.cycPhoto) {
			if (!panel.art.ix) this.artistReset(force);
			this.getArtImg();
		} else this.getFbImg();
	}

	getImg(handle, id, needStub) {
		this.cur_handle = handle;
		utils.GetAlbumArtAsync(0, handle, id, needStub);
	}

	getImgFallback() {
		if (txt.scrollbar_type().draw_timer) return;
		if (!panel.updateNeeded()) {
			this.paint();
			this.get = false;
			return;
		}
		this.getImages();
		this.get = false;
	}

	getItem(art_ix, alb_ix, force) {
		if (this.forceStnd()) {
			art_ix = 0;
			alb_ix = 0;
		}
		switch (true) {
			case ppt.artistView: {
				if (ppt.text_only && !ui.style.isBlur && !ppt.showFilmStrip) return;
				this.cur_artist = this.artist;
				const stndBio = panel.stnd(art_ix, panel.art.list);
				this.artist = !stndBio ? panel.art.list[art_ix].name : !panel.lock ? name.artist(panel.id.focus) : panel.art.list.length ? panel.art.list[0].name : this.artist;
				const new_artist = this.artist && this.artist != this.cur_artist || !this.artist || force;
				if (new_artist) {
					men.counter.bio = 0;
					art_scroller.reset();
				}
				if (ppt.cycPhoto) {
					if (new_artist) {
						this.counter = 0;
						this.art.folder = panel.lock || panel.isRadio(panel.id.focus) ? panel.cleanPth(cfg.remap.foImgArt, panel.id.focus, 'remap', this.artist, '', 1) : stndBio ? panel.cleanPth(cfg.pth.foImgArt, panel.id.focus) : panel.cleanPth(cfg.remap.foImgArt, panel.id.focus, 'remap', this.artist, '', 1);
						this.art.folderSup = '';
						if (!stndBio && cfg.supCache && !$.folder(this.art.folder)) this.art.folderSup = panel.cleanPth(cfg.sup.foImgArt, panel.id.focus, 'remap', this.artist, '', 1);
						this.clearArtCache(true);
						this.art.done = false;
						if (!this.art.images.length) this.art.allFilesLength = 0;
						this.art.ix = 0;
					}
					this.getArtImg(false, true);
				} else this.getFbImg();
				this.get = false;
				break;
			}
			case !ppt.artistView: {
				const stndAlb = !alb_ix || alb_ix + 1 > panel.alb.list.length;
				if (stndAlb) this.resetCounters();
				else if (!panel.lock) {
					this.id.curAlbum = this.id.album;
					this.id.album = (!panel.art.ix ? this.artist : panel.art.list[0].name) + panel.alb.list[alb_ix].name;
					if (this.id.album != this.id.curAlbum || force) {
						this.counter = 0;
						men.counter.rev = 0;
					}
				}
				txt.rev.lookUp = true;
				this.getFbImg();
				this.get = false;
				break;
			}
		}
	}

	getOrientation() {
		this.style.horizontal = (ppt.style == 0 || ppt.style == 2 || ppt.style > 3) && !ppt.img_only;
		this.style.vertical = (ppt.style == 1 || ppt.style == 3 || ppt.style > 3 && !ppt.alignAuto) && !ppt.img_only;
		this.style.circular = this.isType('Circ');
		this.style.reflection = this.isType('Refl');
	}

	getOverlayMetrics(image) {
		const s1 = image.Width / image.Height;
		const s2 = this.nw / this.nh;
		if (s1 > s2) {
			const sc = Math.min(this.nh / image.Height, this.nw / image.Width);
			this.im.h = Math.round(image.Height * sc);
			this.im.t = Math.round((this.nh - this.im.h) / 2 + this.im.t);
		} else {
			this.im.t = panel.img.t;
			this.nh = Math.max(panel.h - panel.img.t - panel.img.b - this.bor.w2, 10);
		}
	}

	getRandomCol() {
		const rc = () => {
			return Math.floor(Math.random() * 256);
		};
		let c = [rc(), rc(), rc()];
		while (!this.isColOk(c)) c = [rc(), rc(), rc()];
		return $.RGBAtoRGB(RGBA(c[0], c[1], c[2], Math.min(80 / ui.blur.alpha, 255)), RGB(0, 0, 0));
	}

	grab(force) {
		if (panel.block()) return this.get = true;
		this.getArtImg(true);
		if (force) this.getFbImg();
	}

	images(v) {
		if (!$.file(v)) return false;
		if (this.art.cusPhotoLocation) return /(?:jpe?g|png|webp|gif|bmp)$/i.test(fso.GetExtensionName(v));
		const fileSize = utils.GetFileSize(v);
		return (name.isLfmImg(fso.GetFileName(v), this.artist) || !ppt.imgFilterLfm && /(?:jpe?g|png|webp|gif|bmp)$/i.test(fso.GetExtensionName(v)) && !/ - /.test(fso.GetBaseName(v))) && !this.exclArr.includes(fileSize) && !this.blackListed(v);
	}

	isColOk(c) {
		const brightness = Math.sqrt(
			0.299 * (c[0] * c[0]) +
			0.587 * (c[1] * c[1]) +
			0.114 * (c[2] * c[2])
		);
		return brightness > 55;
	}

	isEmbedded(type, ix) { // also identifies yt etc
		switch (type) {
			case 'stnd':
				if (ppt.artistView || !this.cov.list[ix]) return null;
				else return this.cov.list[ix].embedded;
			case 'thumb':
				if (this.cache().embedded) return this.cache().embedded;
				else if (ppt.artistView || !this.cov.list[ix]) return null;
				else return this.cov.list[ix].embedded;
		}
	}

	isImageLight(image) {
		const colorSchemeArray = JSON.parse(image.GetColourSchemeJSON(15));
		let rTot = 0;
		let gTot = 0;
		let bTot = 0;
		let freqTot = 0;
		colorSchemeArray.forEach(v => {
			const col = $.toRGB(v.col);
			rTot += col[0] ** 2 * v.freq;
			gTot += col[1] ** 2 * v.freq;
			bTot += col[2] ** 2 * v.freq;
			freqTot += v.freq;
		});
		const avgCol = [$.clamp(Math.round(Math.sqrt(rTot / freqTot)), 0, 255), $.clamp(Math.round(Math.sqrt(gTot / freqTot)), 0, 255), $.clamp(Math.round(Math.sqrt(bTot / freqTot)), 0, 255)];
		return ui.isLightCol(avgCol, true) ? true : false;
	}

	isType(n, image) {
		switch (n) { // init before createImages & this.setCrop
			case 'AnyBorShadow':
				return ['artBorderImgOnly', 'artShadowImgOnly', 'artBorderDual', 'artShadowDual', 'covBorderImgOnly', 'covShadowImgOnly', 'covBorderDual', 'covShadowDual'].some(v => ppt[v]);
			case 'Blur':
				return ui.style.isBlur && !(ppt.img_only && this.style.crop && this.style.border < 2) ? image.Clone(0, 0, image.Width, image.Height) : null;
			case 'AnyBor':
				return ['artBorderImgOnly', 'artBorderDual', 'covBorderImgOnly', 'covBorderDual'].some(v => ppt[v]);
			case 'Fade':
				return (!ppt.typeOverlay || ppt.style == 4 && !ppt.typeOverlay) && ppt.style > 3 && !ppt.img_only;
			case 'Overlay':
				return ppt.style > 3 && ppt.alignAuto && !ppt.img_only;
			case 'Circ':
			if (ppt.style == 4) return false;
				switch (ppt.artistView) {
					case true:
						return !ppt.img_only ? ppt.artStyleDual == 2 : ppt.artStyleImgOnly == 2;
					case false:
						return !ppt.img_only ? ppt.covStyleDual == 2 : ppt.covStyleImgOnly == 2;
				}
				break;
			case 'Border':
				switch (ppt.artistView) {
					case true:
						return !ppt.img_only && ppt.artBorderDual && ppt.artShadowDual || ppt.img_only && ppt.artBorderImgOnly && ppt.artShadowImgOnly ? 3 : !ppt.img_only && ppt.artShadowDual || ppt.img_only && ppt.artShadowImgOnly ? 2 : !ppt.img_only && ppt.artBorderDual || ppt.img_only && ppt.artBorderImgOnly ? 1 : 0;
					case false:
						return !ppt.img_only && ppt.covBorderDual && ppt.covShadowDual || ppt.img_only && ppt.covBorderImgOnly && ppt.covShadowImgOnly ? 3 : !ppt.img_only && ppt.covShadowDual || ppt.img_only && ppt.covShadowImgOnly ? 2 : !ppt.img_only && ppt.covBorderDual || ppt.img_only && ppt.covBorderImgOnly ? 1 : 0;
				}
				break;
			default:
				switch (ppt.artistView) {
					case true:
						return !ppt.img_only ? ppt[`art${n}Dual`] : ppt[`art${n}ImgOnly`];
					case false:
						return !ppt.img_only ? ppt[`cov${n}Dual`] : ppt[`cov${n}ImgOnly`];
				}
		}
	}

	lbtn_dn(p_x) {
		if (!ppt.touchControl || panel.trace.text || this.dn) return;
		this.touch.dn = true;
		this.touch.start = p_x;
	}

	lbtn_up() {
		if (this.touch.dn) this.touch.dn = false;
	}

	leave() {
		if (this.touch.dn) {
			this.touch.dn = false;
			this.touch.start = 0;
		}
	}

	loadAltCov(handle, n) {
		let a, l;
		switch (n) {
			case 0: // stndAlb !fbImg: chkCov save pths: if !found chk/save stubCovUser
				a = name.albumArtist(panel.id.focus);
				l = name.album(panel.id.focus);
				if (this.chkPths([panel.getPth('cov', panel.id.focus).pth, panel.getPth('img', panel.id.focus, a, l).pth], '', 0)) return true;
				if (cov.cacheHit(this.stub.cov.path)) return true;
				this.checkUserStub('cov', handle);
				return false;
			case 1: { // !stndAlb inLib !fbImg: chkCov save pths: if !found getRevImg else load stub || metadb
				a = panel.alb.list[panel.alb.ix].artist;
				l = panel.alb.list[panel.alb.ix].album;
				const pth = panel.getPth('img', panel.id.focus, a, l, '', cfg.supCache);
				if (this.chkPths(pth.pe, pth.fe, 0)) return;
				if (pth.fe != this.cov.done && cfg.dlRevImg) {
					const pth_cov = pth.pe[!cfg.supCache ? 0 : 1];
					const fn_cov = pth_cov + pth.fe;
					if ($.server) server.getRevImg(a, l, pth_cov, fn_cov, false);
					else window.NotifyOthers('bio_getRevImg', [a, l, pth_cov, fn_cov]);
					this.cov.done = pth.fe;
				}
				this.setStub(cov, this.stub[0].path, false, 0, this.stub[0].user);
				return;
			}
		}
	}

	loadArtImage() {
		if (this.art.images.length && ppt.cycPhoto) this.loadImg(art, this.art.images[this.art.ix], true, this.art.ix);
		else if (!this.init) this.getFbImg();
	}

	loadCycCov(handle, art_id, image, image_path) { // stndAlb
		if (!this.cov.cycle) return false;
		if (this.blackListed(image_path)) image_path = '';
		if ($.file(image_path)) {
			const fileSize = utils.GetFileSize(image_path);
			if (this.exclArr.includes(fileSize)) image_path = '';
		}
		if (ppt.loadCovAllFb) {
			if (this.cov.list.every(v => {
					return v.id !== art_id
				})) {
				this.cov.counter++;
				if (!art_id) {
					let path = '';
					if (cfg.cusCov) path = this.chkPths(cfg.cusCovPaths, '', 3, true);
					if (image_path && !cfg.cusCov || !path) path = image_path;
					if (!path) path = this.chkPths([panel.getPth('cov', panel.id.focus).pth, panel.getPth('img', panel.id.focus, name.albumArtist(panel.id.focus), name.album(panel.id.focus)).pth], '', 3);
					if (path) {
						const ln = this.cov.list.length;
						this.cov.list[ln] = {};
						this.cov.list[ln].id = art_id;
						const embedded = handle.Path == path;
						this.cov.list[ln].embedded = embedded ? image : null;
						if (embedded) path += art_id;
						this.cov.list[ln].pth = path;
					}
				} else if (image_path) {
					const ln = this.cov.list.length;
					this.cov.list[ln] = {};
					this.cov.list[ln].id = art_id;
					const embedded = handle.Path == image_path;
					this.cov.list[ln].embedded = embedded ? image : null;
					if (embedded) image_path += art_id;
					this.cov.list[ln].pth = image_path;
				}
				this.cov.list = this.cov.list.filter(Boolean);
				$.sort(this.cov.list, 'id', 'num');
				this.cov.list = this.uniqPth(this.cov.list);
				this.cov.images = this.cov.list.map(v => v.pth);
				filmStrip.check();
			}
		}

		if (!ppt.artistView && !panel.alb.ix) {
			const key = this.cov.images[this.cov.ix];
			if (this.cov.counter > (ppt.loadCovAllFb ? img.cov.selFiltered.length : 0) - 1) {
				if (key) this.loadImg(cov, key, false, this.cov.ix, this.isEmbedded('stnd', this.cov.ix));
				seeker.metrics(this.style.circular, this.style.crop, this.style.horizontal, this.style.reflection, this.style.vertical);
				if (!this.cov.list.length) return false; // load stub
			}
			return true;
		}
	}

	loadImg(ca, key, chkCache, id, embeddedImg) {
		if (chkCache && ca.cacheHit(key)) return;
		if (!embeddedImg) {
			ca.cache[key] = {
				id: id
			};
			gdi.LoadImageAsync(0, key);
		} else cov.cacheIt(embeddedImg, key);

	}

	loadStndCov(handle, art_id, image, image_path, embedded) { // stndAlb load fbImg else stub
		if (this.blackListed(image_path)) {
			image = null;
			image_path = '';
		}
		if (!image) {
			if (ppt.artistView) {
				if (art.cacheHit(this.stub[art_id].path)) return;
				this.checkUserStub('art', handle);
				if (this.stub[art_id].user) {
					image = this.stub[art_id].user;
					image_path = this.stub[art_id].path;
				}
			} else {
				if (ppt.loadCovAllFb) art_id = this.cov.selFiltered[0];
				if (cov.cacheHit(this.stub[art_id].path)) return;
				this.checkUserStub('cov', handle);
				if (this.stub[art_id].user) {
					image = this.stub[art_id].user;
					image_path = this.stub[art_id].path;
				}
			}
		}
		if (!image) {
			this.setStub(this.cache(), 'stub' + art_id, true, ppt.artistView || art_id == 4 ? 1 : 0);
			return;
		}
		if (!txt.rev.lookUp) this.clearCovCache();
		this.cache().cacheIt(image, image_path + (!embedded ? '' : art_id), embedded);
	}

	memoryLimit() {
		if (!window.JsMemoryStats) return;
		return window.JsMemoryStats.MemoryUsage / window.JsMemoryStats.TotalMemoryLimit > 0.4 || window.JsMemoryStats.TotalMemoryUsage / window.JsMemoryStats.TotalMemoryLimit > 0.8;
	}

	metrics() {
		this.setAutoDisplayVariables();
		this.getOrientation();
		seeker.metrics(this.style.circular, this.style.crop, this.style.horizontal, this.style.reflection, this.style.vertical);
	}

	move(p_x, p_y) {
		if (this.touch.dn) {
			if (!panel.imgBoxTrace(p_x, p_y)) return;
			this.touch.end = p_x;
			const x_delta = this.touch.end - this.touch.start;
			if (x_delta > panel.style.imgSize / 5) {
				this.wheel(1);
				this.touch.start = this.touch.end;
			}
			if (x_delta < -panel.style.imgSize / 5) {
				this.wheel(-1);
				this.touch.start = this.touch.end;
			}
		}
	}

	needTrim(n, ratio) {
		return n || Math.abs(ratio - 1) >= 0.05;
	}

	on_get_album_art_done(handle, art_id, image, image_path) {
		const embedded = handle.Path == image_path;
		const forceStnd = this.forceStnd();
		if (!this.cur_handle || !this.cur_handle.Compare(handle) || image && this.cache().cacheHit(image_path + (!embedded ? '' : art_id))) return;
		if (!forceStnd && this.loadCycCov(handle, art_id, image, image_path)) return;
		if (!forceStnd && panel.alb.ix && panel.alb.ix < panel.alb.list.length && !image && !ppt.artistView) return this.loadAltCov(handle, 1);
		if (!image && !ppt.artistView && (!art_id || ppt.loadCovAllFb) && (!panel.alb.ix || forceStnd)) {
			if (this.loadAltCov(handle, 0)) return;
			if (ppt.loadCovAllFb) art_id = this.cov.selFiltered[0];
			if (this.stub[art_id].user) {
				image = this.stub[art_id].user;
				image_path = this.stub[art_id].path;
			}
		}
		this.loadStndCov(handle, art_id, image, image_path, embedded);
	}

	on_load_image_done(image, image_path) {
		const caller = this.getCallerId(image_path);
		if (caller.art_id === this.art.ix) {
			if (!image) {
				setTimeout(() => {
					this.load_image_async(image_path); // try again in case dnlded fails to load: folder temp locked?
				}, 1000);
				return;
			}
			
			this.processArtImg(image, image_path);
		}
		if (caller.cov_id === this.cov.ix) {
			if (!txt.rev.lookUp && !this.cov.cycle) this.clearCovCache();
			if (!image) return;
			if (this.filter.size && this.cov.folderSameAsArt && this.cov.images.includes(image_path) && (!ppt.imgFilterBothPx ? image.Width < this.filter.minPx && image.Height < this.filter.minPx : image.Width < this.filter.minPx || image.Height < this.filter.minPx) && this.cov.images.length > this.filter.minNo) {
				this.cov.list.splice(this.cov.ix, 1);
				this.cov.images.splice(this.cov.ix, 1);
				seeker.upd(false, false, true);
				if (ppt.showFilmStrip) filmStrip.trimCache(image_path);
				this.changeCov(1);
				filmStrip.check('imgUpd');
				return;
			}
			cov.cacheIt(image, image_path);
		}
	}
	
	processArtImg(image, image_path) {
		const caller = this.getCallerId(image_path);
		if (caller.art_id === this.art.ix) {
			if (this.filter.size && (!ppt.imgFilterBothPx ? image.Width < this.filter.minPx && image.Height < this.filter.minPx : image.Width < this.filter.minPx || image.Height < this.filter.minPx) && this.art.images.length > this.filter.minNo) {
				this.art.images.splice(this.art.ix, 1);
				seeker.upd(false, false, true);
				if (ppt.showFilmStrip) filmStrip.trimCache(image_path);
				this.changePhoto(1);
				filmStrip.check('imgUpd');
				return;
			}
			art.cacheIt(image, image_path);
		}
	}

	on_playback_new_track(force) {
		this.resetCounters();
		if (!panel.updateNeeded() && !force) return;
		if (panel.block()) {
			this.get = true;
			filmStrip.logScrollPos();
			this.artistReset();
		} else {
			if (ppt.artistView && ppt.cycPhoto) {
				filmStrip.logScrollPos();
				this.artistReset();
				this.getArtImg();
			} else this.getFbImg();
			this.get = false;
		}
	}

	on_size() {
		if (ppt.text_only) {
			this.clearCovCache();
			this.getFbImg();
		}
		if (ppt.text_only && !ui.style.isBlur && !ppt.showFilmStrip) return this.init = false;
		filmStrip.logScrollPos();
		this.clearCache();
		if (ppt.artistView) {
			if (this.init) this.artistReset();
			this.getArtImg();
		} else {
			this.getFbImg();
			if (this.init) {
				this.id.albCyc = '';
				this.id.curAlbCyc = '';
			}
		}
		this.init = false;
		if (ppt.img_only) panel.getList(true, true);
		but.refresh(true);
	}

	paint() {
		if (!ppt.imgSmoothTrans) {
			this.style.alpha = 255;
			txt.paint();
			return;
		}
		this.id.curImg = this.id.img;
		this.id.img = this.cur_pth();
		if (this.id.curImg != this.id.img) this.style.alpha = this.transition.level;
		else this.style.alpha = 255;
		timer.clear(timer.transition);
		timer.transition.id = setInterval(() => {
			this.style.alpha = Math.min(this.style.alpha *= this.transition.incr, 255);
			txt.paint();
			if (this.style.alpha == 255) timer.clear(timer.transition);
		}, 12);
	}

	pth() {
		const cur_pth = this.cur_pth();
		return {
			imgPth: (ppt.text_only && !panel.style.showFilmStrip) || !$.file(cur_pth) ? '' : cur_pth,
			artist: this.artist || name.artist(panel.id.focus),
			blk: name.isLfmImg(fso.GetFileName(cur_pth))
		};
	}

	process(image, n, o) {
		this.metrics();
		this.style.blur = this.isType('Blur', image);
		this.style.fade = this.isType('Fade');
		this.style.overlay = this.isType('Overlay');
		let type = this.style.circular ? 'circular' : !this.style.crop ? 'default' : 'crop';
		switch (type) {
			case 'circular':
				if (this.style.overlay) this.nh = Math.max(panel.h - panel.img.t - panel.img.b - this.bor.w2, 10);
				this.im.w = this.im.h = Math.min(this.nw, this.nh);
				break;
			case 'default':
				if (this.style.overlay) this.getOverlayMetrics(image);
				this.im.w = this.nw;
				this.im.h = this.nh;
				break;
			case 'crop':
				if (ppt.style > 3 && !ppt.img_only) this.nh = Math.max(panel.h - panel.img.t - panel.img.b - this.bor.w2, 10);
				this.im.w = this.nw;
				this.im.h = this.nh;
				break;
		}
		return this.format(image, n, type, this.im.w, this.im.h, 'img', o, !ppt.themed ? this.style.blur : false, this.style.border, this.style.fade, this.style.reflection);
	}

	processSizeFilter() {
		ppt.imgFilterMinNo = Math.round(Math.max($.value(ppt.imgFilterMinNo, 3, 0), 1));
		ppt.imgFilterMaxSz = Math.round(Math.max($.value(ppt.imgFilterMaxSz, 12000, 0), 50));
		ppt.imgFilterMinSz = Math.round(Math.max($.value(ppt.imgFilterMinSz, 50, 0), 0));
		ppt.imgFilterMinPx = Math.round(Math.max($.value(ppt.imgFilterMinPx, 500, 0), 0));
		this.filter.size = ppt.imgFilterMaxSzEnabled || ppt.imgFilterMinSzEnabled || ppt.imgFilterMinPxEnabled;
		if (this.filter.size) {
			this.filter.minNo = ppt.imgFilterMinNo;
			this.filter.maxSz = ppt.imgFilterMaxSzEnabled ? ppt.imgFilterMaxSz * 1024 : Infinity;
			this.filter.minSz = ppt.imgFilterMinSzEnabled ? ppt.imgFilterMinSz * 1024 : 0;
			this.filter.minPx = ppt.imgFilterMinPxEnabled ? ppt.imgFilterMinPx : 0;
		}
	}

	reflImage(image, x, y, w, h, o) {
		if (!this.mask.reflection) {
			const km = this.refl.gradient != -1 ? this.refl.strength / 500 + this.refl.gradient / 10 : 0;
			this.mask.reflection = $.gr(500, 500, true, g => {
				for (let k = 0; k < 500; k++) {
					const c = 255 - $.clamp(this.refl.strength - k * km, 0, 255);
					g.FillSolidRect(0, k, 500, 1, RGB(c, c, c));
				}
			});
		}
		let r_mask, refl, reflImg, ref_sz, sw = 0;
		if (!ppt.imgReflType) { // auto
			switch (ppt.style) {
				case 0:
				case 2:
					sw = ppt.alignH == 1 ? ppt.style : ppt.alignH == 0 ? 3 : 1;
					break;
				case 1:
				case 3:
					sw = ppt.alignV == 1 ? ppt.style : ppt.alignV == 0 ? 0 : 2;
					break;
				default:
					sw = ppt.alignH == 1 ? 0 : 3 - ppt.alignH;
					break;
			}
		} else sw = [2, 3, 0, 1][ppt.imgReflType - 1];
		this.refl.adjust = false;
		switch (sw) {
			case 0: // bottom
				ref_sz = Math.round(Math.min(panel.h - y - h, image.Height * this.refl.size));
				if (ref_sz <= 0) return image;
				refl = image.Clone(0, image.Height - ref_sz, image.Width, ref_sz);
				r_mask = this.mask.reflection.Clone(0, 0, this.mask.reflection.Width, this.mask.reflection.Height);
				if (refl) {
					r_mask = r_mask.Resize(refl.Width, refl.Height);
					refl.RotateFlip(6);
					refl.ApplyMask(r_mask);
				}
				reflImg = $.gr(w, h + ref_sz, true, g => {
					g.DrawImage(image, 0, 0, w, h, 0, 0, w, h);
					g.DrawImage(refl, 0, h, w, h, 0, 0, w, h);
				});
				o.h = h + ref_sz;
				break;
			case 1: // left
				ref_sz = Math.round(Math.min(x, image.Width * this.refl.size));
				if (ref_sz <= 0) return image;
				refl = image.Clone(0, 0, ref_sz, image.Height);
				r_mask = this.mask.reflection.Clone(0, 0, this.mask.reflection.Width, this.mask.reflection.Height);
				r_mask.RotateFlip(1);
				if (refl) {
					r_mask = r_mask.Resize(refl.Width, refl.Height);
					refl.RotateFlip(4);
					refl.ApplyMask(r_mask);
				}
				reflImg = $.gr(ref_sz + w, h, true, g => {
					g.DrawImage(image, ref_sz, 0, w, h, 0, 0, w, h);
					g.DrawImage(refl, 0, 0, ref_sz, h, 0, 0, ref_sz, h);
				});
				o.x = this.x = x - ref_sz;
				o.w = w + ref_sz;
				break;
			case 2: // top
				ref_sz = Math.round(Math.min(y, image.Height * this.refl.size));
				if (ref_sz <= 0) return image;
				refl = image.Clone(0, 0, image.Width, ref_sz);
				r_mask = this.mask.reflection.Clone(0, 0, this.mask.reflection.Width, this.mask.reflection.Height);
				r_mask.RotateFlip(2);
				if (refl) {
					r_mask = r_mask.Resize(refl.Width, refl.Height);
					refl.RotateFlip(6);
					refl.ApplyMask(r_mask);
				}
				reflImg = $.gr(w, ref_sz + h, true, g => {
					g.DrawImage(image, 0, ref_sz, w, h, 0, 0, w, h);
					g.DrawImage(refl, 0, 0, w, ref_sz, 0, 0, w, ref_sz);
				});
				o.y = this.y = y - ref_sz;
				o.h = ref_sz + h;
				break;
			case 3: // right
				ref_sz = Math.round(Math.min(panel.w - x - w, image.Width * this.refl.size));
				if (ref_sz <= 0) return image;
				refl = image.Clone(image.Width - ref_sz, 0, ref_sz, image.Height);
				r_mask = this.mask.reflection.Clone(0, 0, this.mask.reflection.Width, this.mask.reflection.Height);
				r_mask.RotateFlip(3);
				if (refl) {
					r_mask = r_mask.Resize(refl.Width, refl.Height);
					refl.RotateFlip(4);
					refl.ApplyMask(r_mask);
				}
				reflImg = $.gr(w + ref_sz, h, true, g => {
					g.DrawImage(image, 0, 0, w, h, 0, 0, w, h);
					g.DrawImage(refl, w, 0, ref_sz, h, 0, 0, ref_sz, h);
				});
				o.w = w + ref_sz;
				break;
		}
		return reflImg;
	}

	resetCounters() {
		if (panel.lock) return;
		this.id.curAlbCounter = this.id.albCounter;
		this.id.albCounter = name.albID(panel.id.focus, 'full');
		if (this.id.albCounter != this.id.curAlbCounter || !this.id.albCounter) {
			this.counter = 0;
			men.counter.rev = 0;
		}
		this.id.curArtCounter = this.id.artCounter;
		this.id.artCounter = name.artist(panel.id.focus);
		if (this.id.artCounter && this.id.artCounter != this.id.curArtCounter || !this.id.artCounter) {
			this.counter = 0;
			men.counter.bio = 0;
		}
	}

	resetTimestamps() {
		if (!ppt.cycPic) return;
		ppt.artistView ? this.timeStamp.photo = Date.now() : this.timeStamp.cov = Date.now();
	}

	setAlbID() {
		this.id.curAlbCyc = this.id.albCyc;
		this.id.albCyc = name.albID(panel.id.focus, 'full');
	}

	setAlignment() {
		if (this.style.horizontal && ppt.alignH != 1) {
			if (ppt.alignH == 2) this.im.l = Math.round(panel.w - panel.img.r - this.im.w - this.bor.w2);
		} else this.im.l = Math.round((this.nw - this.im.w) / 2 + this.im.l);
		if (this.style.vertical && ppt.alignV != 1) {
			if (ppt.alignV == 2) this.im.t = Math.round(panel.h - panel.img.b - this.im.h - this.bor.w2);
		} else if (ppt.style < 4 || !ppt.alignAuto || ppt.img_only) this.im.t = Math.round((this.nh - this.im.h) / 2 + this.im.t);
	}

	setAutoDisplayVariables() {
		if (!ppt.img_only && ppt.textAlign && ppt.style < 4) {
			if (ppt.style == 0) {
				panel.img.l = panel.heading.x;
				panel.img.r = panel.w - panel.heading.x - panel.heading.w;
			}
			if (ppt.style == 2) {
				panel.img.l = !panel.style.fullWidthHeading ? panel.heading.x : panel.heading.x + (!ppt.filmStripOverlay ? panel.filmStripSize.l : 0);
				panel.img.r = !panel.style.fullWidthHeading ? panel.w - panel.heading.x - panel.heading.w : panel.w - panel.img.l - panel.heading.w + (!ppt.filmStripOverlay ? panel.filmStripSize.r : 0);
			}
			if ((ppt.style == 1 || ppt.style == 3)) {
				panel.img.t = !panel.style.fullWidthHeading ? ppt.textT + (!ppt.filmStripOverlay ? panel.filmStripSize.t : 0) : panel.text.t;
				panel.img.b = !panel.style.fullWidthHeading ? ppt.textB + (!ppt.filmStripOverlay ? panel.filmStripSize.b : 0) : panel.h - panel.text.t - panel.text.h;
			}
		}
		if (!ppt.img_only && ppt.style == 0 && panel.style.fullWidthHeading) {
			if (panel.filmStripSize.l && !ppt.filmStripOverlay) panel.img.l = panel.bor.l;
			if (panel.filmStripSize.r && !ppt.filmStripOverlay) panel.img.r = panel.bor.r;
		}

		$.key.forEach(v => {
			this.im[v] = ppt.img_only ? panel.bor[v] + (!this.style.crop ? (!ppt.filmStripOverlay ? panel.filmStripSize[v] : 0) : 0) : panel.img[v]
		});

		this.nw = !ppt.img_only && (!ppt.style || ppt.style == 2 || ppt.style > 3) ? panel.w - panel.img.l - panel.img.r : !ppt.img_only ? panel.style.imgSize : panel.w - this.im.l - this.im.r;
		this.nh = !ppt.img_only && (ppt.style == 1 || ppt.style == 3 || ppt.style > 3 && !ppt.alignAuto) ? panel.h - panel.img.t - panel.img.b : !ppt.img_only ? panel.style.imgSize : panel.h - this.im.t - this.im.b;

		this.style.border = this.isType('Border');
		if (this.style.border == 1 || this.style.border == 3) {
			const i_sz = $.clamp(this.nh, 0, this.nw) / $.scale;
			this.bor.w1 = !i_sz || i_sz > 500 ? 5 * $.scale : Math.max(Math.ceil(5 * $.scale * i_sz / 500), 3);
		} else this.bor.w1 = 0;
		this.bor.w2 = this.bor.w1 * 2;
		this.nw = Math.max(this.nw - this.bor.w2, 10);
		this.nh = Math.max(this.nh - this.bor.w2, 10);
	}

	setCheckArr(arr_ix) {
		this.art.checkArr = [window.ID, arr_ix, this.art.displayedOtherPanel];
		window.NotifyOthers('bio_checkImgArr', this.art.checkArr);
	}

	setCrop(sz) {
		const imgRefresh = ppt.img_only;
		this.style.crop = this.isType('Circ') ? false :
			ppt.artistView && (ppt.artStyleImgOnly == 1 && imgRefresh || (ppt.artStyleDual == 1 || ppt.style == 4) && !ppt.img_only) || !ppt.artistView && (ppt.covStyleImgOnly == 1 && imgRefresh || (ppt.covStyleDual == 1 || ppt.style == 4) && !ppt.img_only);
		panel.setBorder(imgRefresh && this.style.crop, this.isType('Border'), this.isType('Refl'));
		if (sz) {
			panel.setStyle();
			if (ppt.heading && !ppt.img_only) but.check();
		}
	}

	setReflStrength(n) {
		this.refl.strength += n;
		this.refl.strength = $.clamp(this.refl.strength, 0, 255);
		ppt.reflStrength = Math.round(this.refl.strength / 2.55);
		this.mask.reflection = false;
		this.refl.adjust = true;
		if (ppt.artistView && ppt.cycPhoto) this.clearArtCache();
		if (panel.stndItem()) this.getImages();
		else this.getItem(panel.art.ix, panel.alb.ix);
	}

	setStub(ca, key, def, n, userStub) {
		if (ca.cacheHit(key)) return;
		switch (def) {
			case false:
				if (userStub) ca.cacheIt(userStub, key);
				else this.setStub(ca, 'stub', true, n);
				break;
			case true:
				ca.cacheIt(this.stub.default[n].Clone(0, 0, this.stub.default[n].Width, this.stub.default[n].Height), key);
				break;
		}
	}

	sizeFilter(v, i, arr) {
		const fileSize = utils.GetFileSize(v);
		if (arr.length - this.removed <= this.filter.minNo || fileSize <= this.filter.maxSz && fileSize > this.filter.minSz) return true;
		this.removed++;
	}

	sortCache(o, prop) {
		const sorted = {};
		Object.keys(o).sort((a, b) => o[a][prop] - o[b][prop]).forEach(key => sorted[key] = o[key]);
		return sorted;
	}

	toggle(n) {
		ppt.toggle(n);
		this.cov.cycle = ppt.loadCovAllFb || ppt.loadCovFolder;
		this.cov.cycle_ix = 0;
		if (n == 'loadCovFolder' && ppt.loadCovFolder && !ppt.get('SYSTEM.Cover Folder Checked', false)) {
			fb.ShowPopupMessage("在选项中输入文件夹：服务器设置（所有面板）>封面>封面：循环文件夹。\n\n默认：艺术家照片文件夹。\n\n当专辑改变时，图像会更新。任何在选择当前专辑后出现的图像都不包括在内。", '简介：用于封面循环的加载文件夹');
			ppt.set('SYSTEM.Cover Folder Checked', true);
		}
		this.id.albCyc = '';
		this.id.curAlbCyc = '';
		if (ppt.artistView) {
			seeker.upd(false, !this.cov.cycle);
			return;
		}
		if (this.cov.cycle) this.getCovImages();
		else this.getImages();
		seeker.upd(false, !this.cov.cycle);
	}

	trace(x, y) {
		if (!ppt.autoEnlarge) return true;
		const o = this.cache().cache[this.cur_pth()];
		if (!o) return false;
		return x > o.x && x < o.x + o.w && y > o.y && y < o.y + o.h;
	}

	uniq(a) {
		return [...new Set(a)];
	}

	uniqPth(a) {
		const flags = [];
		let result = [];
		a.forEach(v => {
			const vpth = v.pth.toLowerCase();
			if (flags[vpth]) return;
			result.push(v);
			flags[vpth] = true;
		});
		return result;
	}

	updImages() {
		this.id.albCyc = '';
		this.id.curAlbCyc = '';
		this.clearArtCache(true);
		this.clearCovCache();
		filmStrip.scroll.pos.art = {};
		if (panel.stndItem()) this.getImages(true);
		else this.getItem(panel.art.ix, panel.alb.ix, true);
	}

	wheel(step) {
		switch (vk.k('shift')) {
			case false:
				if (this.art.images.length > 1 && ppt.artistView && !ppt.text_only && ppt.cycPhoto) {
					this.changePhoto(-step);
					if (ppt.cycPic) this.timeStamp.photo = Date.now();
				}
				if (this.cov.cycle && this.cov.images.length > 1 && !ppt.artistView && !ppt.text_only && !panel.alb.ix) {
					this.changeCov(-step);
					if (this.cov.cycle) this.timeStamp.cov = Date.now();
				}
				seeker.debounce();
				break;
			case true:
				if (!panel || but.trace('lookUp', panel.m.x, panel.m.y) || panel.trace.text || panel.trace.film || !this.isType('Refl')) break;
				this.setReflStrength(-step * 5);
				break;
		}
	}
}

class ImageCache {
	constructor(type) {
		this.cache = {};
		this.pth = '';
		this.type = type;
	}

	// Methods

	checkCache() {
		let keys = Object.keys(this.cache);
		const cacheLength = keys.length;
		const minCacheSize = 5;
		if (cacheLength > minCacheSize) {
			this.cache = img.sortCache(this.cache, 'time');
			keys = Object.keys(this.cache);
			const numToRemove = Math.round((cacheLength - minCacheSize) / 5);
			if (numToRemove > 0)
				for (let i = 0; i < numToRemove; i++) this.trimCache(keys[i]);
		}
	}

	cacheIt(image, key, embedded) {
		try {
			if (!image || this.type != ppt.artistView) return img.paint();
			if (img.memoryLimit()) this.checkCache();
			if (!ppt.text_only || ui.style.isBlur) {
				const start = Date.now();
				const o = this.cache[key] = {};
				o.img = img.cur = img.process(image, this.type, o);
				o.filmID = filmStrip.id();
				o.time = Date.now() - start;
			}
			this.pth = key;
			this.embedded = embedded && ppt.showFilmStrip && !filmStrip.style.auto ? image : null;
			filmStrip.check();
			img.paint();
		} catch (e) {
			this.pth = '';
			img.paint();
			$.trace('无法加载图像：' + key);
		}
	}

	cacheHit(key) {
		if (ppt.text_only && !ui.style.isBlur) {
			this.pth = key;
			return;
		}
		const o = this.cache[key];
		const id = filmStrip.id();
		if (!o || !o.img || o.filmID.id != id.id || o.filmID.bor != id.bor || img.refl.adjust) return false;
		img.x = o.x;
		seeker.counter.x = o.counter_x;
		img.y = o.y;
		seeker.counter.y = o.counter_y;
		if (ui.style.isBlur && o.blur && !(ppt.img_only && img.style.crop)) img.blur = o.blur;
		img.cur = o.img;
		this.pth = key;
		if (this.type && !img.art.images.length || !this.type && !img.cov.images.length) filmStrip.check();
		else filmStrip.paint();
		img.paint();
		return true;
	}

	trimCache(key) {
		delete this.cache[key];
	}
}

const art = new ImageCache(true);
const cov = new ImageCache(false);

class Seeker {
	constructor() {
		this.dn = false;
		this.hand = false;
		this.l_dn = false;
		this.imgNo = 0;
		ppt.imgSeekerShow = $.clamp(ppt.imgSeekerShow, 0, 2);
		this.imgSeeker = (!ppt.imgSeeker && !ppt.imgCounter) ? 0 : ppt.imgSeekerShow;
		this.nh = 10;
		this.nw = 10;
		this.overlap = false;
		this.seekerBelowImg = false;
		this.show = this.imgSeeker == 2 ? true : false;
		this.bar = {
			dot_w: 4,
			grip_h: 10 * $.scale,
			gripOffset: 2,
			h: 6 * $.scale,
			l: 0,
			offset: 18,
			overlapCorr: 0,
			reflCorr: 0,
			x1: 25,
			x2: 26,
			x3: 25,
			y1: 25,
			y2: 200,
			y3: 201,
			y4: 200,
			y5: 200,
			w1: 100,
			w2: 110
		}

		this.counter = {
			h: 8,
			x: 0,
			y: 0
		}

		this.prog = {
			min: 0,
			max: 200
		}

		this.debounce = $.debounce(() => {
			if (panel.imgBoxTrace(panel.m.x, panel.m.y) || this.imgSeeker == 2) return;
			this.show = false;
			img.paint();
			filmStrip.paint();
		}, 3000);
	}

	draw(gr) {
		if (this.imgNo < 2 || !this.show) return;
		let prog = 0;
		if (this.seekerBelowImg && img.cur) {
			this.bar.y2 = Math.round(Math.min(img.y + img.cur.Height / (1 + this.bar.reflCorr) + this.bar.offset, (panel.h - panel.filmStripSize.b) * 0.9) - this.bar.h / 2);
			this.bar.y3 = this.bar.y2 + Math.ceil(ui.style.l_w / 2);
			this.bar.y5 = (panel.h - panel.filmStripSize.b) * 0.97;
		}
		if (ppt.imgSeeker && ppt.imgSeekerDots == 1) { // dots
			gr.SetSmoothingMode(2);
			prog = this.dn ? $.clamp(panel.m.x - this.bar.x2 - this.bar.grip_h / 2, this.prog.min, this.prog.max) : (ppt.artistView ? img.art.ix + 0.5 : img.cov.ix + 0.5) * this.bar.w1 / this.imgNo - (this.bar.grip_h - this.bar.dot_w) / 2;
			for (let i = 0; i < this.imgNo; i++) {
				gr.FillEllipse(this.bar.x2 + ((i + 0.5) / this.imgNo) * this.bar.w1, this.bar.y2, this.bar.dot_w, this.bar.h, RGB(245, 245, 245));
				gr.DrawEllipse(this.bar.x2 + ((i + 0.5) / this.imgNo) * this.bar.w1, this.bar.y2, this.bar.dot_w, this.bar.h, ui.style.l_w, RGB(128, 128, 128));
			}
			gr.FillEllipse(this.bar.x2 + prog, this.bar.y3 - this.bar.gripOffset, this.bar.grip_h, this.bar.grip_h, RGB(245, 245, 245));
			gr.DrawEllipse(this.bar.x2 + prog, this.bar.y3 - this.bar.gripOffset, this.bar.grip_h, this.bar.grip_h, ui.style.l_w, RGB(128, 128, 128));
			gr.SetSmoothingMode(0);
		}
		
		if (ppt.imgSeeker && ppt.imgSeekerDots == 0) { // bar
			prog = this.dn ? $.clamp(panel.m.x - this.bar.x1, 0, this.bar.w1) : (ppt.artistView ? img.art.ix + 0.5 : img.cov.ix + 0.5) * this.bar.w1 / this.imgNo;
			gr.DrawRect(this.bar.x1, this.bar.y2, this.bar.w1, this.bar.h, ui.style.l_w, RGB(128, 128, 128));
			gr.FillSolidRect(this.bar.x2, this.bar.y3, this.bar.w1 - ui.style.l_w, this.bar.h - ui.style.l_w, RGBA(0, 0, 0, 75));
			gr.FillSolidRect(this.bar.x2, this.bar.y3, prog - ui.style.l_w, this.bar.h - ui.style.l_w, RGB(245, 245, 245));
			gr.SetSmoothingMode(2);
			gr.FillEllipse(this.bar.x2 + prog - Math.round((this.bar.grip_h) / 2), this.bar.y3 - this.bar.gripOffset, this.bar.grip_h, this.bar.grip_h, RGB(245, 245, 245));
			gr.DrawEllipse(this.bar.x2 + prog - Math.round((this.bar.grip_h) / 2), this.bar.y3 - this.bar.gripOffset, this.bar.grip_h, this.bar.grip_h, ui.style.l_w, RGB(128, 128, 128));
			gr.SetSmoothingMode(0);
		}

		if (ppt.imgCounter) { // counter
			if (ppt.imgSeekerDots == 1) prog += Math.round(this.bar.grip_h / 2 - this.bar.dot_w / 2);
			const count = (ppt.artistView ? img.art.ix + 1 : img.cov.ix + 1) + (' / ' + this.imgNo);
			const count_m = (this.imgNo + (' / ' + this.imgNo)) + ' ';
			if (count) {
				const count_w = Math.max(gr.CalcTextWidth(count_m, ui.font.small), 8);
				const count_x = ppt.imgSeeker ? Math.round($.clamp(this.bar.x1 - count_w / 2 + prog, this.bar.l + 2, this.bar.l + this.nw - count_w - 4)) : this.counter.x + ui.style.l_w * 2 + img.bor.w1;
				const count_y = ppt.imgSeeker ? Math.round(this.bar.y2 - this.bar.gripOffset - ui.font.small_h * 1.5) : this.counter.y + ui.style.l_w * 2 + img.bor.w1;
				gr.FillRoundRect(count_x, count_y, count_w + 2, ui.font.small_h + 2, 3, 3, RGBA(0, 0, 0, 210));
				gr.DrawRoundRect(count_x + 1, count_y + 1, count_w, ui.font.small_h, 1, 1, 1, RGBA(255, 255, 255, 60));
				gr.DrawRoundRect(count_x, count_y, count_w + 2, ui.font.small_h + 2, 1, 1, 1, RGBA(0, 0, 0, 200));
				gr.GdiDrawText(count, ui.font.small, RGB(250, 250, 250), count_x + 1, count_y, count_w, ui.font.small_h + 2, txt.cc);
			}
		}
	}

	intersectRect() {
		return !(panel.tbox.l > panel.ibox.l + panel.ibox.w || panel.tbox.l + panel.tbox.w < panel.ibox.l || panel.tbox.t > panel.ibox.t + panel.ibox.h || panel.tbox.t + panel.tbox.h < panel.ibox.t);
	}

	lbtn_dn(p_x, p_y) {
		this.dn = false;
		this.l_dn = true;
		if (ppt.touchControl) {
			ui.id.touch_dn = filmStrip.get_ix(p_x, p_y);
		}
		if (this.imgSeeker) {
			if (this.imgNo > 1) this.dn = this.hand;
			if (this.dn) {
				const prog = $.clamp(p_x - this.bar.x1, 0, this.bar.w1);
				if (ppt.artistView) {
					const new_ix = Math.min(Math.floor(prog / this.bar.w1 * img.art.images.length), img.art.images.length - 1);
					if (new_ix != img.art.ix) {
						img.art.ix = new_ix;
						img.setPhoto();
					}
				} else {
					const new_i_x = Math.min(Math.floor(prog / this.bar.w1 * img.cov.images.length), img.cov.images.length - 1);
					if (new_i_x != img.cov.ix) {
						img.cov.ix = new_i_x;
						img.setCov();
					}
				}
				img.paint();
				filmStrip.paint();
			}
		}
	}

	lbtn_up() {
		this.upd();
		this.dn = false;
		this.l_dn = false;
		if (this.imgSeeker) img.paint();
		filmStrip.paint();
	}

	metrics(circular, crop, horizontal, reflection, vertical) {
		ppt.imgSeekerDisabled = ppt.style > 3 && !ppt.img_only && !panel.clip && this.intersectRect() || (ppt.filmStripOverlay && !ppt.text_only);
		this.imgSeeker = !ppt.imgSeekerDisabled ? ((!ppt.imgSeeker && !ppt.imgCounter) ? 0 : ppt.imgSeekerShow) : 0;
		if (!this.imgSeeker) {
			this.show = false;
			img.paint();
			filmStrip.paint();
			return;
		} else if (this.imgSeeker == 2) this.show = true;

		this.imgNo = ppt.text_only ? 0 : ppt.cycPhoto && ppt.artistView ? img.art.images.length : img.cov.cycle && !ppt.artistView && !panel.alb.ix ? img.cov.images.length : 0;
		if (this.imgNo < 2) return;

		this.overlap = ppt.style > 3 && !ppt.img_only && panel.clip;
		this.bar.overlapCorr = this.overlap ? panel.bor.t : 0;

		const alignBottom = vertical && !crop && ppt.alignV == 2 && !this.overlap;
		const alignCenter = vertical && !crop && ppt.alignV == 1 && !this.overlap;
		const alignLeft = horizontal && !crop && ppt.alignH == 0;
		const alignRight = horizontal && !crop && ppt.alignH == 2;

		this.nw = ppt.img_only && crop ? img.nw - panel.filmStripSize.l - panel.filmStripSize.r : img.nw;
		this.nh = ppt.img_only ? img.nh - (!crop ? 0 : panel.filmStripSize.b) : ppt.style < 4 ? Math.min(!crop ? this.nw : img.nh, img.nh) : this.overlap ? panel.style.imgSize : Math.min(!crop ? (panel.ibox.w - panel.bor.l - panel.bor.r) : panel.ibox.h - panel.bor.t - panel.bor.b, panel.ibox.h - panel.bor.t - panel.bor.b);
		const seeker_img_t = !alignBottom || this.nw >= img.nh ? 0 : img.nh - this.nw;

		this.bar.h = (ppt.imgSeekerDots == 1 ? 6 : 5) * $.scale;
		this.bar.grip_h = (ppt.imgSeekerDots == 1 ? 10 : 9) * $.scale;
		this.bar.gripOffset = Math.round((this.bar.grip_h - this.bar.h) / 2) + Math.ceil(ui.style.l_w / 2);
		const circ_sz = ppt.style < 4 ? Math.min(this.nw, this.nh) : Math.min(panel.ibox.w - panel.bor.l - panel.bor.r, panel.ibox.h - panel.bor.t - panel.bor.b);
		this.bar.w1 = circular && (alignLeft || alignRight) ? Math.min(this.imgNo * 30 * $.scale, circ_sz) : Math.min(this.imgNo * 30 * $.scale, (!img.style.crop ? Math.min(this.nw, this.nh) : this.nw) - 30 * $.scale);
		this.bar.w2 = this.bar.w1 + Math.round(this.bar.grip_h);
		this.bar.l = ppt.img_only ? panel.bor.l + panel.filmStripSize.l : panel.img.l;
		this.bar.x1 = circular ? (alignLeft ? this.bar.l + (circ_sz - this.bar.w1) / 2 : alignRight ? this.bar.l + this.nw - circ_sz + (circ_sz - this.bar.w1) / 2 : Math.round(this.bar.l + (this.nw - this.bar.w1) / 2)) : (alignLeft ? Math.round(this.bar.l + 15 * $.scale) : alignRight ? Math.round(panel.w - (ppt.img_only ? panel.bor.r : panel.img.r) - 15 * $.scale - this.bar.w1) : Math.round(this.bar.l + (this.nw - this.bar.w1) / 2));
		this.bar.x3 = this.bar.x1 - Math.round(this.bar.grip_h / 2);
		this.bar.y1 = ppt.img_only ? panel.bor.t + seeker_img_t + panel.filmStripSize.t : panel.img.t + seeker_img_t;
		this.bar.y2 = Math.round(this.bar.y1 + this.nh * 0.9 - this.bar.h / 2) - this.bar.overlapCorr;
		this.bar.y3 = this.bar.y2 + Math.ceil(ui.style.l_w / 2);
		this.bar.y4 = this.nh * 0.8 - this.bar.overlapCorr;
		this.bar.y5 = this.nh - this.bar.overlapCorr;

		this.seekerBelowImg = ppt.imgSeeker && this.nh < 0.8 * panel.h - panel.filmStripSize.b && (vertical && !crop && ppt.alignV == 0 && !this.overlap || alignCenter);
		this.bar.reflCorr = this.seekerBelowImg && reflection ? ppt.reflSize / 100 : 0;
		this.bar.offset = ppt.imgCounter ? ui.font.small_h * 2 + this.bar.gripOffset + 2 : ui.font.small_h * 1.5 + this.bar.gripOffset;

		if (ppt.imgSeekerDots == 1) {
			this.bar.dot_w = Math.floor($.clamp(this.bar.w1 / this.imgNo, 2, this.bar.h));
			this.bar.x2 = this.bar.x1 - Math.round(this.bar.dot_w / 2);
			this.prog.min = 0.5 / this.imgNo * this.bar.w1 - (this.bar.grip_h - this.bar.dot_w) / 2;
			this.prog.max = ((this.imgNo - 0.5) / this.imgNo) * this.bar.w1 - (this.bar.grip_h - this.bar.dot_w) / 2;
		} else {
			this.bar.x2 = this.bar.x1 + Math.ceil(ui.style.l_w / 2);
		}
	}

	move(p_x, p_y) {
		this.hand = false;
		if (this.imgSeeker) {
			const trace = panel.imgBoxTrace(p_x, p_y);
			const show = !ppt.text_only && (ppt.artistView || !panel.alb.ix) && (this.imgSeeker == 2 || trace);
			if (this.imgNo > 1 && (!this.l_dn || this.dn)) {
				if (!this.seekerBelowImg) this.hand = p_x > this.bar.x3 && p_x < this.bar.x3 + this.bar.w2 && p_y > this.bar.y1 + this.bar.y4 && p_y < this.bar.y1 + this.bar.y5;
				else this.hand = p_x > this.bar.x3 && p_x < this.bar.x3 + this.bar.w2 && p_y > this.bar.y2 - ui.font.small_h && p_y < this.bar.y5;
			}
			if (show != this.show && !ppt.text_only && trace) {
				img.paint();
				filmStrip.paint();
			}
			if (show) this.show = true;
			this.debounce();
		}

		if (this.dn) {
			const prog = $.clamp(p_x - this.bar.x1, 0, this.bar.w1);
			if (ppt.artistView) {
				const new_ix = Math.min(Math.floor(prog / this.bar.w1 * img.art.images.length), img.art.images.length - 1);
				if (new_ix != img.art.ix) {
					img.art.ix = new_ix;
					img.setPhoto();
				}
			} else {
				const new_i_x = Math.min(Math.floor(prog / this.bar.w1 * img.cov.images.length), img.cov.images.length - 1);
				if (new_i_x != img.cov.ix) {
					img.cov.ix = new_i_x;
					img.setCov();
				}
			}
			img.paint();
			filmStrip.paint();
		}
	}

	upd(force, clearCov, repaint) {
		if ((ppt.imgSeeker || ppt.imgCounter) && ppt.imgSeekerShow && (!this.dn && (!ppt.text_only || ui.style.isBlur || force))) {
			if (clearCov) img.cov.images = [];
			img.metrics();
			if (repaint) txt.paint();
		}
	}
}