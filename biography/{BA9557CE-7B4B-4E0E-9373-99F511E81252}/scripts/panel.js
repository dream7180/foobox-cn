'use strict';

class Panel {
	constructor() {
		this.arc = 10;
		this.calc = true;
		this.calcText = false;
		this.clicked = false;
		this.clip = false;
		this.h = 0;
		this.lock = 0;
		this.lockHandle = null;

		this.m = {
			x: -1,
			y: -1
		}

		this.notifyTimestamp = Date.now();
		window.NotifyOthers(`bio_notServer${ppt.serverName}`, this.notifyTimestamp);
		this.tf = {};
		this.w = 0;

		this.alb = {
			cur: '',
			init: [],
			ix: 0,
			list: [],
			uniq: []
		}

		this.art = {
			cur: '',
			fields: cfg.artFields.map(v => '%' + v + '%'),
			init: [],
			ix: 0,
			list: [],
			similar: [],
			topAlbums: [],
			uniq: []
		}

		this.bor = {
			t: ppt.borL,
			r: ppt.borR,
			b: ppt.borB,
			l: ppt.borL
		}

		this.filmStripSize = {
			t: 0,
			r: 0,
			b: 0,
			l: 0
		}

		this.heading = {
			x: 0,
			w: 200
		}

		this.ibox = {
			l: 0,
			t: 0,
			w: 100,
			h: 100
		}

		this.id = {
			alb: '',
			curAlb: '',
			artist: '',
			curArtist: '',
			focus: ppt.focus,
			last_pressed_coord: {
				x: -1,
				y: -1
			},
			init: true,
			lockAlb: '',
			lockArt: '',
			loadTimestamp: Date.now(),
			lyricsSource: false,
			nowplayingSource: false,
			numServersChecked: false,
			propsSource: false,
			tr: '',
			curTr: ''
		}

		for (let i = 0; i < 8; i++) {
			if (ppt.txtReaderEnable && ppt[`useTxtReader${i}`] && ppt[`pthTxtReader${i}`] && ppt[`lyricsTxtReader${i}`] && !/item_properties/i.test(utils.SplitFilePath(ppt[`pthTxtReader${i}`])[1]) && !/nowplaying/i.test(utils.SplitFilePath(ppt[`pthTxtReader${i}`])[1])) {
				this.id.lyricsSource = true;
				this.id.focus = false;
				break;
			}
		}
	
		for (let i = 0; i < 8; i++) {
			if (ppt.txtReaderEnable && ppt[`useTxtReader${i}`] && /nowplaying/i.test(utils.SplitFilePath(ppt[`pthTxtReader${i}`])[1])) {
				this.id.nowplayingSource = true;
				this.id.focus = false;
				break;
			}
		}

		for (let i = 0; i < 8; i++) {
			if (ppt.txtReaderEnable && ppt[`useTxtReader${i}`] && /item_properties/i.test(utils.SplitFilePath(ppt[`pthTxtReader${i}`])[1])) {
				this.id.propsSource = true;
				break;
			}
		}

		this.id.lookUp = ppt.lookUp;

		this.im = {
			t: 0,
			r: 100,
			b: 100,
			l: 0
		}

		this.img = {
			t: 0,
			r: 20,
			b: 0,
			l: 20
		}

		this.logo = {
			img: my_utils.getImageAsset('Logo.png')
		}

		this.repaint = {
			x: 0,
			y: 0,
			w: 100,
			h: 100
		}

		this.sbar = {
			offset: 0,
			x: 0,
			y: 0,
			h: 100,
			style: !ppt.sbarFullHeight ? 2 : 0,
			top_corr: 0
		}

		this.style = {
			cycTimeItem: Math.max(ppt.cycTimeItem, 30),
			enlarged_img: false,
			free: $.jsonParse(ppt.styleFree, false),
			fullWidthHeading: ppt.heading && ppt.fullWidthHeading,
			gap: ppt.gap,
			imgSize: 0,
			inclTrackRev: ppt.inclTrackRev,
			max_y: 0,
			minH: 50,
			moreTags: false,
			name: [],
			new: false,
			overlay: $.jsonParse(ppt.styleOverlay, false),
			showFilmStrip: false
		}

		this.tbox = {
			l: 0,
			t: 0,
			w: 100,
			h: 100
		}

		this.text = {
			l: 20,
			t: 20,
			r: 20,
			w: 100,
			h: 100
		}

		this.trace = {
			film: false,
			image: false,
			text: false
		}

		this.tx = {
			t: 0,
			r: 100,
			b: 100,
			l: 0
		}

		this.checkRefreshRates();
		this.setSummary();
		this.similarArtistsKey = 'Similar Artists: |\\u00c4hnliche K\\u00fcnstler: |Artistas Similares: |Artistes Similaires: |Artisti Simili: |\\u4f3c\\u3066\\u3044\\u308b\\u30a2\\u30fc\\u30c6\\u30a3\\u30b9\\u30c8: |Podobni Wykonawcy: |Artistas Parecidos: |\\u041f\\u043e\\u0445\\u043e\\u0436\\u0438\\u0435 \\u0438\\u0441\\u043f\\u043e\\u043b\\u043d\\u0438\\u0442\\u0435\\u043b\\u0438: |Liknande Artister: |Benzer Sanat\\u00e7\\u0131lar: |\\u76f8\\u4f3c\\u827a\\u672f\\u5bb6: '; this.d = parseFloat(this.q('0000029142')); this.lfm = this.q($.s);
		this.topAlbumsKey = 'Top Albums: |Top-Alben: |\\u00c1lbumes M\\u00e1s Escuchados: |Top Albums: |Album Pi\\u00f9 Ascoltati: |\\u4eba\\u6c17\\u30a2\\u30eb\\u30d0\\u30e0: |Najpopularniejsze Albumy: |\\u00c1lbuns Principais: |\\u041f\\u043e\\u043f\\u0443\\u043b\\u044f\\u0440\\u043d\\u044b\\u0435 \\u0430\\u043b\\u044c\\u0431\\u043e\\u043c\\u044b: |Toppalbum: |En Sevilen Alb\\u00fcmler: |\\u6700\\u4f73\\u4e13\\u8f91: ';

		if (!this.style.free || !$.isArray(this.style.free)) {
			ppt.set('SYSTEM.Freestyle Custom BackUp', ppt.styleFree);
			this.style.free = [];
			ppt.styleFree = JSON.stringify(this.style.free);
			fb.ShowPopupMessage('无法加载自定义样式。\n\n保存位置已损坏。自定义样式已重置。\n\n原始样式应该备份在面板属性中的 "SYSTEM.Freestyle Custom BackUp" 里。', '简介');
		} else {
			let valid = true;
			this.style.free.forEach(v => {
				if (!$.objHasOwnProperty(v, 'name') || isNaN(v.imL) || isNaN(v.imR) || isNaN(v.imT) || isNaN(v.imB) || isNaN(v.txL) || isNaN(v.txR) || isNaN(v.txT) || isNaN(v.txB)) valid = false;
			});
			if (!valid) {
				ppt.set('SYSTEM.Freestyle Custom BackUp', ppt.styleFree);
				this.style.free = [];
				ppt.styleFree = JSON.stringify(this.style.free);
				fb.ShowPopupMessage('无法加载自定义样式。\n\n保存位置已损坏。自定义样式已重置。\n\n原始样式应该备份在面板属性中的 "SYSTEM.Freestyle Custom BackUp" 里。', '简介');
			}
		}
		if (!this.style.overlay || !$.objHasOwnProperty(this.style.overlay, 'name') || isNaN(this.style.overlay.imL) || isNaN(this.style.overlay.imR) || isNaN(this.style.overlay.imT) || isNaN(this.style.overlay.imB) || isNaN(this.style.overlay.txL) || isNaN(this.style.overlay.txR) || isNaN(this.style.overlay.txT) || isNaN(this.style.overlay.txB)) {
			ppt.set('SYSTEM.Overlay BackUp', ppt.styleOverlay);

			this.style.overlay = {
				'name': 'Overlay',
				'imL': 0,
				'imR': 0,
				'imT': 0,
				'imB': 0,
				'txL': 0,
				'txR': 0,
				'txT': 0.632,
				'txB': 0
			};

			ppt.styleOverlay = JSON.stringify(this.style.overlay);
			fb.ShowPopupMessage('无法加载 "SYSTEM.Overlay"。\n\n保存位置已损坏。叠加样式已重置为默认值。\n\n原始样式应该备份在面板属性中的 "SYSTEM.Overlay BackUp" 里。', '简介');
		}

		this.getStyleNames();
	}

	// Methods

	albumsSame() {
		if (this.id.lookUp && this.alb.ix && this.alb.list.length && JSON.stringify(this.alb.init) === JSON.stringify(this.alb.list)) return true;
		return false;
	}

	artistsSame() {
		if (this.id.lookUp && this.art.ix && this.art.list.length && JSON.stringify(this.art.init) === JSON.stringify(this.art.list)) return true;
		return false;
	}

	block() {
		return this.w <= 10 || this.h <= 10 || !window.IsVisible;
	}

	callServer(force, focus, notify, type) {
		if (!this.id.numServersChecked) this.checkNumServers();
		switch (type) {
			case 0:
				if ($.server) server.download(force, {
					ix: this.art.ix,
					focus: focus,
					arr: this.art.list.slice(0)
				}, {
					ix: this.alb.ix,
					focus: focus,
					arr: this.alb.list.slice(0)
				}, notify);
				if (!$.server || ppt.multiServer) window.NotifyOthers(notify, [{
					ix: this.art.ix,
					focus: focus,
					arr: this.art.list.slice(0)
				}, {
					ix: this.alb.ix,
					focus: focus,
					arr: this.alb.list.slice(0)
				}]);
				break;
			case 1:
				server.download(force, {
					ix: this.art.ix,
					focus: focus,
					arr: this.art.list.slice(0)
				}, {
					ix: this.alb.ix,
					focus: focus,
					arr: this.alb.list.slice(0)
				});
				break;
		}
	}

	changed() {
		if (this.id.focus || !fb.IsPlaying) this.callServer(false, this.id.focus, 'bio_lookUpItem', 0);
		else if ($.server) this.callServer(false, this.id.focus, '', 1);
	}
	
	checkRefreshRates() {
		[
			{key: 'focusLoadRate', descr: 'Panel Focus Load Refresh Rate', min: 200, max: 3000, oldDef: 250, newDef: 250},
			{key: 'focusServerRate', descr: 'Panel Focus Server Refresh Rate', min: 1500, max: 15000, oldDef: 5000, newDef: 5000},
			{key: 'lookUpServerRate', descr: 'Panel Lookup Refresh Rate', min: 1500, max: 15000, oldDef: 1500, newDef: 1500}
		].forEach((rate) => {
			const name = `${rate.descr} ${rate.min}-${rate.max} msec (Max)`;
			const value = ppt.get(name, null);
			if (value === null) {throw ('property_name: ' + name + '\nPanel\'s rate property name does not match range checked');}
			else {
				if (ppt[rate.key] === rate.oldDef && ppt[rate.key] !== rate.newDef) {ppt[rate.key] = rate.newDef;}
				ppt[rate.key] = $.clamp(ppt[rate.key], rate.min, rate.max);
				if (ppt[rate.key] !== Number(value)) {
					ppt.set(name, ppt[rate.key]);
				}
			}
		});

		this.focusLoad = $.debounce(() => {
			if (!ppt.img_only) txt.on_playback_new_track();
			if (!ppt.text_only || ui.style.isBlur || ppt.showFilmStrip) img.on_playback_new_track();
		}, ppt.focusLoadRate, {
			leading: ppt.focusLoadImmediate,
			trailing: true
		});

		this.focusServer = $.debounce(() => {
			this.changed();
		}, ppt.focusServerRate);

		this.lookUpServer = $.debounce(() => {
			this.callServer(false, this.id.focus, 'bio_lookUpItem', 0);
		}, ppt.lookUpServerRate);
	}

	checkNumServers() {
		ppt.multiServer = false;
		window.NotifyOthers('bio_checkNumServers', 0);
		this.id.numServersChecked = true;
	}

	changeView(x, y, menu) {
		if (!menu && (this.zoom() || vk.k('alt') || x < 0 || y < 0 || x > this.w || y > this.h || but.Dn)) return false;
		if (!menu && !ppt.dblClickToggle && this.isTouchEvent(x, y)) return false;
		if (!menu && !ppt.img_only && (txt.scrollbar_type().onSbar && !txt.lyricsDisplayed())  || but.trace('heading', x, y) || but.trace('lookUp', x, y)) return false;
		return true;
	}

	checkFilm() {
		if (!ppt.showFilmStrip) return;
		const item = this.getItem();
		if (Date.now() - this.id.loadTimestamp > 1500) { // delay needed for correct sizing on init; ignored by click (sets loadTimestamp = 0); 
			switch (item) {
				case 'stndArtist':
					!this.id.lookUp ? txt.getText(true) : txt.getItem(true, this.art.ix, this.alb.ix);
					img.getImages();
					break;
				case 'stndAlbum':
					this.style.inclTrackRev != 1 || !this.id.lookUp ? txt.getText(true) : txt.getItem(true, this.art.ix, this.alb.ix);
					img.getImages();
					break;
				case 'lookUp':
					txt.getItem(true, this.art.ix, this.alb.ix);
					img.getItem(this.art.ix, this.alb.ix);
					break;
			}
			but.refresh(true);
			txt.getScrollPos();
			txt.paint();
		}	
	}

	cleanPth(pth, item, type, artist, album, bio) {
		if (!pth) return '';
		pth = pth.trim().replace(/\//g, '\\');
		pth = cfg.expandPath(pth);
		switch (type) {
			case 'remap':
				pth = bio ? this.tfBio(pth, artist, item) : this.tfRev(pth, artist, album, item);
				break;
			case 'server':
				pth = $.eval(pth, item, true);
				break;
			case 'tag': {
				const tf_p = FbTitleFormat(pth);
				pth = tf_p.EvalWithMetadb(item);
				break;
			}
			default:
				pth = $.eval(pth, item);
				break;
		}
		if (!pth) return '';

		let UNC = pth.startsWith('\\\\');
		if (UNC) pth = pth.replace('\\\\', '');
		if (!pth.endsWith('\\')) pth += '\\';

		const c_pos = pth.indexOf(':');
		// Regorxxx <- Dots on paths not working (.local, .cache, .foobar2000* or .fb2k* work now)
		const dotPathRegEx = /([/\\]).((?:foobar2000|fb2k)[^/\\]*|cache|local)([/\\])/g;
		const bDotPath = dotPathRegEx.test(pth);
		// Regorxxx ->
		pth = type != 'lyr' ? 
			pth.replace(/[/|:]/g, '-').replace(/\*/g, 'x').replace(/"/g, "''").replace(/[<>]/g, '_').replace(/\?/g, '').replace(/\\\./g, '\\_').replace(/\.+\\/, '\\').replace(/\s*\\\s*/g, '\\') :
			pth.replace(/[/|:*"<>?]/g, '_');
		if (c_pos < 3 && c_pos != -1) pth = $.replaceAt(pth, c_pos, ':');
		// Regorxxx <- Dots on paths not working (.local, .cache, .foobar2000* or .fb2k* work now)
		if (bDotPath) { // Allow some special folders with dots
			pth = pth.replace(dotPathRegEx, (_, p1, p2, p3) => p1 + '.' + p2 + p3);
		}
		// Regorxxx ->
		while (pth.includes('\\\\')) pth = pth.replace(/\\\\/g, '\\_\\');
		if (UNC) pth = `\\\\${pth}`;
		return pth.trim();
	}

	click(x, y, menu) {
		this.clicked = this.changeView(x, y, menu);
		if (!this.clicked) return;
		this.id.loadTimestamp = 0;
		filmStrip.logScrollPos();
		ppt.toggle('artistView');
		img.resetTimestamps();
		const sameStyle = this.sameStyle();
		if (!sameStyle) this.setStyle();
		txt.na = '';
		timer.clear(timer.source);
		if (!this.lock && this.updateNeeded()) {
			this.getList(true, true);
			if (!ppt.artistView) txt.albumReset();
		}
		const item = this.getItem();
		switch (item) {
			case 'stndArtist':
				!this.id.lookUp ? txt.getText(this.calc) : txt.getItem(this.calc, this.art.ix, this.alb.ix);
				img.getImages();
				break;
			case 'stndAlbum':
				this.style.inclTrackRev != 1 || !this.id.lookUp ? txt.getText(this.calc) : txt.getItem(this.calc, this.art.ix, this.alb.ix);
				img.getImages();
				break;
			case 'lookUp':
				txt.getItem(this.calc, this.art.ix, this.alb.ix);
				img.getItem(this.art.ix, this.alb.ix);
				break;
		}
		if (ppt.img_only) img.setCrop(true);
		but.refresh(true);
		if (!sameStyle && ppt.filmStripOverlay && ppt.showFilmStrip) filmStrip.set(ppt.filmStripPos);
		if (!ppt.artistView) img.setCheckArr(null);
		this.move(x, y, true);
		txt.getScrollPos();
		this.calc = false;
	}

	createStyle() {
		let ns;
		const ok_callback = (status, input) => {
			if (status != 'cancel') {
				ns = input;
			}
		}
		const caption = '创建新的布局';
		const prompt = '这将复制当前布局样式并将其保存到输入的名称\n\n副本采用自由式格式，可提供完全灵活的图像和文本框拖动样式定位 + 叠加效果\n\n是否继续？';
		const fallback = popUpBox.isHtmlDialogSupported() ? popUpBox.input(caption, prompt, ok_callback, '', '我的样式') : true;
		if (fallback) {
			try {
				ns = utils.InputBox(0, prompt, caption, '我的样式', true);
			} catch(e) {
			}
		}
		if (!ns) return false;
		let lines_drawn, imgs, te_t;
		switch (ppt.style) {
			case 0: {
				let txt_h = Math.round((this.h - this.bor.t - ppt.textB) * (1 - ppt.rel_imgs));
				lines_drawn = Math.max(Math.floor((txt_h - ui.heading.h) / ui.font.main_h), 0);
				txt_h = lines_drawn * ui.font.main_h + this.style.gap;
				imgs = Math.max(this.h - txt_h - this.bor.t - ppt.textB - ui.heading.h, 10);
				this.im.b = (this.h - this.bor.t - imgs - this.bor.b) / this.h;
				this.tx.t = (this.bor.t + imgs - ppt.textT + this.style.gap) / this.h;
				this.im.l = 0;
				this.im.r = 0;
				this.im.t = 0;
				this.tx.l = 0;
				this.tx.r = 0;
				this.tx.b = 0;
				break;
			}
			case 1: {
				const txt_sp = Math.round((this.w - ppt.textL - this.bor.r) * (1 - ppt.rel_imgs));
				lines_drawn = Math.max(Math.floor((this.h - ppt.textT - ppt.textB - ui.heading.h) / ui.font.main_h), 0);
				te_t = !ppt.topAlign ? ppt.textT + (this.h - ppt.textT - ppt.textB - lines_drawn * ui.font.main_h + ui.heading.h) / 2 : ppt.textT + ui.heading.h;
				this.im.l = (txt_sp + this.style.gap + (ppt.sbarShow ? ui.sbar.sp + 10 : 0)) / this.w;
				this.tx.r = (this.w - (txt_sp + ppt.textR)) / this.w;
				this.tx.t = (te_t - ui.heading.h - ppt.textT) / this.h;
				this.im.r = 0;
				this.im.t = 0;
				this.im.b = 0;
				this.tx.l = 0;
				this.tx.b = 0;
				break;
			}
			case 2: {
				let txt_h = Math.round((this.h - ppt.textT - this.bor.b) * (1 - ppt.rel_imgs));
				lines_drawn = Math.max(Math.floor((txt_h - ui.heading.h) / ui.font.main_h), 0);
				txt_h = lines_drawn * ui.font.main_h + this.style.gap;
				imgs = Math.max(this.h - txt_h - this.bor.b - ppt.textT - ui.heading.h, 10);
				const img_t = this.h - this.bor.b - imgs;
				this.im.t = img_t / this.h;
				this.tx.b = (this.h - img_t - ppt.textB + this.style.gap) / this.h;
				this.im.l = 0;
				this.im.r = 0;
				this.im.b = 0;
				this.tx.l = 0;
				this.tx.r = 0;
				this.tx.t = 0;
				break;
			}
			case 3: {
				const te_r = ppt.sbarShow ? Math.max(ppt.textR, ui.sbar.sp + 10) : ppt.textR;
				const txt_sp = Math.round((this.w - this.bor.l - te_r) * (1 - ppt.rel_imgs));
				imgs = Math.max(this.w - txt_sp - this.bor.l - te_r - this.style.gap, 10);
				lines_drawn = Math.max(Math.floor((this.h - ppt.textT - ppt.textB - ui.heading.h) / ui.font.main_h), 0);
				te_t = !ppt.topAlign ? ppt.textT + (this.h - ppt.textT - ppt.textB - lines_drawn * ui.font.main_h + ui.heading.h) / 2 : ppt.textT + ui.heading.h;
				this.im.r = (this.w - this.bor.l - imgs - this.bor.r) / this.w;
				this.tx.l = (this.bor.l + imgs - ppt.textL + this.style.gap) / this.w;
				this.tx.t = (te_t - ui.heading.h - ppt.textT) / this.h;
				this.im.l = 0;
				this.im.t = 0;
				this.im.b = 0;
				this.tx.r = 0;
				this.tx.b = 0;
				break;
			}
		}
		this.style.free.forEach(v => {
			if (v.name == ns) ns = ns + ' 新';
		});
		if (ppt.style > 3 && (ppt.img_only || ppt.text_only)) {
			if (ppt.style - 6 >= this.style.free.length) this.getStyleFallback();
			const obj = ppt.style == 4 || ppt.style == 5 ? this.style.overlay : this.style.free[ppt.style - 6];
			this.im.l = $.clamp(obj.imL, 0, 1);
			this.im.r = $.clamp(obj.imR, 0, 1);
			this.im.t = $.clamp(obj.imT, 0, 1);
			this.im.b = $.clamp(obj.imB, 0, 1);
			this.tx.l = $.clamp(obj.txL, 0, 1);
			this.tx.r = $.clamp(obj.txR, 0, 1);
			this.tx.t = $.clamp(obj.txT, 0, 1);
			this.tx.b = $.clamp(obj.txB, 0, 1);
		}
		this.style.free.push({
			'name': ns,
			'imL': this.im.l,
			'imR': this.im.r,
			'imT': this.im.t,
			'imB': this.im.b,
			'txL': this.tx.l,
			'txR': this.tx.r,
			'txT': this.tx.t,
			'txB': this.tx.b
		})
		this.sort(this.style.free, 'name');
		ppt.styleFree = JSON.stringify(this.style.free);
		this.style.free.some((v, i) => {
			if (v.name == ns) {
				if (ppt.sameStyle) ppt.style = i + 6;
				else if (ppt.artistView) ppt.bioStyle = i + 6;
				else ppt.revStyle = i + 6;
				return true;
			}
		})
		this.getStyleNames();
		txt.refresh(0);
		timer.clear(timer.source);
		timer.source.id = setTimeout(() => {
			this.style.new = false;
			window.Repaint();
			timer.source.id = null;
		}, 10000);
		if (timer.source.id !== 0) {
			this.style.new = true;
			window.Repaint();
		}
	}

	deleteStyle(n) {
		const continue_confirmation = (status, confirmed) => {
			if (confirmed) {
				this.style.free.splice(n - 6, 1);
				ppt.styleFree = JSON.stringify(this.style.free);
				ppt.style = 0;
				if (!ppt.sameStyle) {
					if (ppt.artistView) ppt.bioStyle = 0;
					else ppt.revStyle = 0;
				}
				this.getStyleNames();
				if (!ppt.showFilmStrip) txt.refresh(0);
				else filmStrip.set(ppt.filmStripPos);
			}
		}
		const caption = '删除当前样式';
		const prompt = '删除：' + this.style.name[n] + '\n\n样式将设置为 “上”';
		const wsh = popUpBox.isHtmlDialogSupported() ? popUpBox.confirm(caption, prompt, '确定', '取消', '', '', continue_confirmation) : true;
		if (wsh) continue_confirmation('ok', $.wshPopup(prompt, caption));
	}

	draw(gr) {
		let font = ui.font.main;
		let str = '由 AllMusic、Last.fm 和维基百科提供数据支持。\r\n\r\nShift+中键单击以激活/停用。';
		let textHeight2;
		
		const textHeight1 = Math.round(gr.MeasureString(str, font, 10, 0, this.w - 20, 1000, StringFormat(1, 1)).Height);
		const version = `  ${window.ScriptInfo.Name}: v${window.ScriptInfo.Version}`;
		const versionHeight = gr.CalcTextHeight(version, ui.font.small);
		const txtSp = this.h * 0.37;
		
		if (textHeight1 > txtSp) {
			str = str.replace('\r\n\r\n', ' ');
			textHeight2 = Math.round(gr.MeasureString(str, font, 10, 0, this.w - 20, 1000, StringFormat(1, 1)).Height);
			if (textHeight2 > txtSp) font = ui.font.small;
		}

		const textHeight3 = Math.round(gr.MeasureString(str, font, 10, 0, this.w - 20, 1000, StringFormat(1, 1)).Height);
		if (textHeight3 > txtSp) str = 'Shift+中键单击激活。';

		let textCol = ui.col.text;
		let textCol_h = ui.col.text_h;
		if (ppt.theme > 0) {
			textCol = ui.dui ? window.GetColourDUI(0) : window.GetColourCUI(0);
			textCol_h = ui.dui ? window.GetColourDUI(2) : window.GetColourCUI(2);
		}
		const hAvail = (this.h - txtSp - versionHeight) * 0.9;
		const wAvail = this.w * 0.9;
		let scale = this.getScale(this.logo.img, wAvail, hAvail);
		this.logo.w = scale[0];
		this.logo.h = scale[1];
		this.logo.x = (this.w - this.logo.w) / 2;
		this.logo.y =  hAvail - this.logo.h + versionHeight + hAvail * 0.145;

		gr.SetInterpolationMode(7);
		if (this.logo.img) gr.DrawImage(this.logo.img, this.logo.x, this.logo.y, this.logo.w, this.logo.h, 0, 0, this.logo.img.Width, this.logo.img.Height);
		gr.SetInterpolationMode(0);
		gr.GdiDrawText(version, ui.font.small, textCol_h, 0, 0, this.w, this.h, 0x00000800);
		gr.GdiDrawText(str, font, textCol, 10, this.h - txtSp, this.w - 20, txtSp, txt.ncc);
	}

	exportStyle(n) {
		const continue_confirmation = (status, confirmed) => {
			if (confirmed) {
				window.NotifyOthers('bio_customStyle', JSON.stringify(this.style.free[n - 6]));
			}
		}
		const caption = '导出当前样式至其它简介面板';
		const prompt = '导出：' + this.style.name[n];
		const wsh = popUpBox.isHtmlDialogSupported() ? popUpBox.confirm(caption, prompt, '确定', '取消', '', '', continue_confirmation) : true;
		if (wsh) continue_confirmation('ok', $.wshPopup(prompt, caption));
	}

	getItem() {
		if (!this.art.ix && ppt.artistView) return 'stndArtist';
		if (!this.alb.ix && !ppt.artistView) return 'stndAlbum';
		else return 'lookUp';
	}

	getList(p_clear, isAlbum) {
		if (!this.id.lookUp) return;
		const artist = name.artist(this.id.focus, true) || lg['Artist Unknown'];
		const albumArtist = (!panel.isRadio(this.id.focus) ? name.albumArtist(this.id.focus, true) : artist) || lg['Artist Unknown'];
		const composition = isAlbum ? false : ppt.classicalMusicMode && (txt.rev.loaded.am && !txt.rev.amFallback || txt.rev.loaded.wiki && !txt.rev.wikiFallback);
		const album = !composition ? name.album(this.id.focus, true) || lg['Album Unknown'] : name.composition(this.id.focus, true) || lg['Composition Unknown'];
		if (this.lock) {
			//this.logArtistHistory(artist);
			//this.logAlbumHistory(albumArtist, album, composition);
			return;
		}

		let k = 0;
		const lfmBio = (!panel.isRadio(this.id.focus) ? this.cleanPth(cfg.pth.foLfmBio, this.id.focus) : this.cleanPth(cfg.remap.foLfmBio, this.id.focus, 'remap', artist, '', 1)) + $.clean(artist) + cfg.suffix.foLfmBio + '.txt';
		const lBio = $.open(lfmBio);
		const lfmSim = (!panel.isRadio(this.id.focus) ? this.cleanPth(cfg.pth.foLfmSim, this.id.focus) : this.cleanPth(cfg.remap.foLfmSim, this.id.focus, 'remap', artist, '', 1)) + $.clean(artist) + ' And Similar Artists.json';
		const mult_arr = [];
		let mn = '';
		let nm = '';
		let sa = '';
		let ta = '';
		this.alb.init = this.alb.list.slice(0);
		this.alb.list = [];
		this.art.init = this.art.list.slice(0);
		this.art.list = [];
		this.art.list.push({
			name: artist,
			field: '',
			type: 'Artist'
		});
		if (ppt.showSimilarArtists) {
			if ($.file(lfmSim)) {
				const lSim = $.jsonParse(lfmSim, false, 'file-utf8'); // Regorxxx <- Force UTF-8 ->
				let newStyle = false;
				if (lSim) {
					if ($.objHasOwnProperty(lSim[0], 'name')) newStyle = true;
					lSim.shift();
					$.take(lSim, cfg.menuSimilarNum);
					if (lSim.length) {
						this.art.list.push({
							name: lg['Similar Artists:'],
							field: '',
							type: 'label'
						});
						lSim.forEach((v, i, arr) => this.art.list.push({
							name: newStyle ? v.name : v,
							field: '',
							type: i != arr.length - 1 ? 'similar' : 'similarend'
						}));
					}
				}
			} else {
				if ($.file(lfmBio)) {
					let found = false;
					sa = tag.getTag(lBio, this.similarArtistsKey).tag;
					if (sa.length < 7 && sa) {
						$.take(sa, cfg.menuSimilarNum);
						found = true;
					}
					if (!found) {
						this.art.similar.some(v => {
							if (v.name == artist) {
								sa = $.take(v.similar, cfg.menuSimilarNum);
								return found = true;
							}
						});
						if (!found) {
							const getSimilar = new LfmSimilarArtists(() => getSimilar.onStateChange(), this.getSimilar_search_done.bind(this));
							getSimilar.search(artist, '', '', 6);
						}
					}
					if (found && $.isArray(sa) && sa.length) {
						this.art.list.push({
							name: lg['Similar Artists:'],
							field: '',
							type: 'label'
						});
						sa.forEach((v, i) => this.art.list.push({
							name: v,
							field: '',
							type: i != sa.length - 1 ? 'similar' : 'similarend'
						}));
					}
				}
			}
		}

		if (ppt.showMoreTags) {
			this.style.moreTags = false;
			this.art.fields.forEach(v => {
				nm = v.replace(/%/g, '');
				for (let h = 0; h < $.eval('$meta_num(' + nm + ')', this.id.focus); h++) {
					mn = '$trim($meta(' + nm + ',' + h + '))';
					const name = $.eval(mn, this.id.focus);
					if (this.art.list.every(v => v.name !== name) && name.toLowerCase() != cfg.va.toLowerCase()) mult_arr.push({
						name: name,
						field: ' ~ ' + $.titlecase(nm),
						type: 'tag'
					});
				}
			});
			if (mult_arr.length > 1) {
				this.sort(mult_arr, 'name');
				k = mult_arr.length;
				while (k--)
					if (k != 0 && mult_arr[k].name.toLowerCase() == mult_arr[k - 1].name.toLowerCase()) {
						if (!mult_arr[k - 1].field.toLowerCase().includes(mult_arr[k].field.toLowerCase())) mult_arr[k - 1].field += mult_arr[k].field;
						mult_arr.splice(k, 1);
					}
			}
			if (mult_arr.length) {
				this.style.moreTags = true;
				this.art.list.push({
					name: lg['More Tags:'],
					field: '',
					type: 'label'
				});
				this.art.list = this.art.list.concat(mult_arr);
				this.art.list[this.art.list.length - 1].type = 'tagend';
			}
		}

		if (!artist || !this.art.cur || artist != this.art.cur) {
			//this.logArtistHistory(artist);
			this.art.cur = artist;
		}

		if (!(albumArtist + album) || !this.alb.cur || albumArtist + album != this.alb.cur) {
			//this.logAlbumHistory(albumArtist, album, composition);
			this.style.inclTrackRev = ppt.inclTrackRev;
			this.alb.cur = albumArtist + album;
		}

		this.art.list.forEach((v, i) => v.ix = i);
		this.art.uniq = this.art.list.filter(v => v.type != 'label');

		if (ppt.showTopAlbums && $.file(lfmBio)) {
			let found = false;
			ta = tag.getTag(lBio, this.topAlbumsKey).tag;
			if (ta.length < 7 && ta) found = true;
			if (!found) {
				this.art.topAlbums.some(v => {
					if (v.name == artist) {
						ta = $.take(v.album, 6);
						return found = true;
					}
				});
				if (!found) {
					const getTopAlb = new LfmTopAlbums(() => getTopAlb.onStateChange(), this.getTopAlb_search_done.bind(this));
					getTopAlb.search(artist);
				}
			}
			this.alb.list = [];
			this.alb.list.push({
				artist: albumArtist,
				album: album,
				composition: composition,
				type: 'Current Album'
			});
			if (found && $.isArray(ta) && ta.length) {
				this.alb.list.push({
					artist: lg['Last.fm Top Albums: '] + artist + ':',
					album: lg['Last.fm Top Albums: '] + artist + ':',
					type: 'label'
				});
				ta.forEach((v, i) => this.alb.list.push({
					artist: artist,
					album: v,
					type: i != ta.length - 1 ? 'album' : 'albumend'
				}));
			}
		} else {
			this.alb.list = [];
			this.alb.list.push({
				artist: albumArtist,
				album: album,
				composition: composition,
				type: 'Current Album'
			});
		}

		this.alb.list.forEach((v, i) => v.ix = i);
		this.alb.uniq = this.uniqAlbum(this.alb.list);
		if (!this.artistsSame() && p_clear) this.art.ix = 0;
		if (!this.albumsSame() && p_clear) this.alb.ix = 0;
	}

	getPth(sw, focus, artist, album, stnd, supCache, cleanArtist, cleanAlbumArtist, cleanAlbum, folder, basic, server) {
		let fo, pth;
		switch (sw) {
			case 'bio':
				if (panel.isRadio(ppt.focus)) stnd = false; else if(stnd === '') stnd = this.stnd(this.art.ix, this.art.list);
				if (server) fo = stnd ? this.cleanPth(cfg.pth[folder], focus, 'server') : this.cleanPth(cfg.remap[folder], focus, 'remap', artist, '', 1);
				else fo = stnd && !this.lock ? this.cleanPth(cfg.pth[folder], focus) : this.cleanPth(cfg.remap[folder], focus, 'remap', artist, '', 1);
				pth = fo + cleanArtist + cfg.suffix[folder] + '.txt';
				if (!stnd && supCache && !$.file(pth)) fo = this.cleanPth(cfg.sup[folder], focus, 'remap', artist, '', 1);
				pth = fo + cleanArtist + cfg.suffix[folder] + '.txt';
				if (basic) return {
					fo: fo,
					pth: pth
				};
				else return [fo, pth, cleanArtist ? true : false, $.file(pth)];
			case 'rev':
				if (stnd === '') stnd = this.stnd(this.alb.ix, this.alb.list);
				if (!stnd) cleanAlbumArtist = cleanArtist;
				if (server) fo = stnd ? this.cleanPth(cfg.pth[folder], focus, 'server') : this.cleanPth(cfg.remap[folder], focus, 'remap', artist, album, 0);
				else fo = stnd && !this.lock ? this.cleanPth(cfg.pth[folder], focus) : this.cleanPth(cfg.remap[folder], focus, 'remap', artist, album, 0);
				pth = fo + cleanAlbumArtist + ' - ' + cleanAlbum + cfg.suffix[folder] + '.txt';
				if (!stnd && supCache && !$.file(pth)) fo = this.cleanPth(cfg.sup[folder], focus, 'remap', artist, album, 0);
				pth = fo + cleanAlbumArtist + ' - ' + cleanAlbum + cfg.suffix[folder] + '.txt';
				if (pth.length > 259) {
					cleanAlbum = $.abbreviate(cleanAlbum);
					pth = fo + cleanAlbumArtist + ' - ' + cleanAlbum + cfg.suffix[folder] + '.txt';
				}
				if (basic) return {
					fo: fo,
					pth: pth
				};
				else return [fo, pth, cleanAlbumArtist && cleanAlbum ? true : false, $.file(pth)];
			case 'track':
				fo = this.cleanPth(cfg.remap[folder], focus, 'remap', artist, album, 0);
				pth = fo + cleanArtist + ' - ' + cleanAlbum + cfg.suffix[folder].replace(' Review', '') + '.json';
				if (basic) return {
					fo: fo,
					pth: pth
				};
				else return [fo, pth, cleanArtist ? true : false, $.file(pth)];
			case 'cov':
				fo = this.cleanPth(cfg.pth.foImgCov, focus, 'server');
				pth = fo + $.clean($.eval(cfg.pth.fnImgCov, focus, true));
				return {
					fo: fo, pth: pth
				};
			case 'img': {
				fo = this.cleanPth(cfg.remap.foImgRev, focus, 'remap', artist, album, 0);
				let fn = $.clean(artist + ' - ' + album);
				pth = fo + fn;
				if (pth.length > 259) {
					album = $.abbreviate(album);
					fn = $.clean(artist + ' - ' + album);
					pth = fo + fn;
				}
				if (supCache === undefined) return {
					fo: fo,
					fn: fn,
					pth: pth
				};
				const pe = [fo];
				if (supCache) pe.push(this.cleanPth(cfg.sup.foImgRev, focus, 'remap', artist, album, 0));
				// fn long file path done above
				return {
					pe: pe,
					fe: fn
				}
			}
		}
	}

	getScale(image, w, h) {
		const sc = Math.min(h / image.Height, w / image.Width);
		return [Math.round(image.Width * sc), Math.round(image.Height * sc)];
	}

	getSimilar_search_done(artist, list) {
		this.art.similar.push({
			name: artist,
			similar: list
		});
		this.getList(true);
	}

	getStyleFallback() {
		ppt.style = 4;
		if (!ppt.sameStyle) {
			if (ppt.artistView) ppt.bioStyle = 4;
			else ppt.revStyle = 4;
		}
		fb.ShowPopupMessage('找不到样式。使用叠加布局代替。', '简介');
	}

	getTopAlb_search_done(artist, list) {
		this.art.topAlbums.push({
			name: artist,
			album: list
		});
		this.getList(true, true);
	}

	getStyleNames() {
		this.style.name = [lg['Top'], lg['Right'], lg['Bottom'], lg['Left'], lg['Full overlay'], lg['Part overlay']];
		this.style.free.forEach(v => this.style.name.push(v.name));
	}

	imgBoxTrace(x, y) {
		if (this.trace.film || this.m.y == -1) return false;
		if (ppt.img_only) return true;
		if (ppt.style < 4) {
			switch (ppt.style) {
				case 0:
				case 2:
					return y > this.img.t && y < this.img.t + this.style.imgSize;
				case 1:
				case 3:
					return x > this.img.l && x < this.img.l + this.style.imgSize;
			}
		} else return y > this.ibox.t && y < this.ibox.t + this.ibox.h && x > this.ibox.l && x < this.ibox.l + this.ibox.w;
	}

	inactivate() {
		ppt.toggle('panelActive');
		window.NotifyOthers('bio_status', ppt.panelActive);
		window.Reload();
	}

	isRadio(focus) {
		return fb.IsPlaying && fb.PlaybackLength <= 0 && (!focus || this.isRadioFocused());
	}

	isRadioFocused() {
		if (this.lock) return true;
		const fid = plman.ActivePlaylist.toString() + plman.GetPlaylistFocusItemIndex(plman.ActivePlaylist).toString();
		const np = plman.GetPlayingItemLocation();
		let pid = -2;
		if (np.IsValid) pid = plman.PlayingPlaylist.toString() + np.PlaylistItemIndex.toString();
		return fid == pid;
	}

	isTouchEvent(x, y) {
		return ppt.touchControl && Math.sqrt((Math.pow(this.id.last_pressed_coord.x - x, 2) + Math.pow(this.id.last_pressed_coord.y - y, 2))) > 3 * $.scale;
	}

	leave() {
		if (!ppt.autoEnlarge || men.right_up) return;
		if (ppt.img_only) {
			this.mode(0);
			this.style.enlarged_img = false;
		}
	}

	mbtn_up(x, y, menuLock, bypass) {
		if ((x < 0 || y < 0 || x > this.w || y > this.h) && !bypass) return;
		if (this.id.lookUp && (but.btns['lookUp'].trace(x, y) || menuLock || bypass)) {
			if (this.id.lyricsSource || this.id.nowplayingSource) {
				this.lock = 0;
				return;
			}
			let mArtist = ppt.artistView && this.art.ix;
			if (!this.lock && !mArtist) img.artistReset();
			if (!this.lock) {
				this.id.lockArt = $.eval(this.art.fields, this.id.focus);
				this.id.lockAlb = name.albID(this.id.focus, 'full') + (this.style.inclTrackRev ? name.trackID(this.id.focus) : '');
				this.lockHandle = $.handle(this.id.focus);
				img.setAlbID();
				img.cov.folder = this.cleanPth(cfg.albCovFolder, this.id.focus);
			}
			if (!bypass) this.lock = this.lock == 0 || menuLock ? 1 : 0;
			txt.curHeadingID = this.lock ? txt.headingID() : '';
			if (!this.lock && (ppt.artistView && this.id.lockArt != $.eval(this.art.fields, this.id.focus) || !ppt.artistView && this.id.lockAlb != name.albID(this.id.focus, 'full') + (this.style.inclTrackRev ? name.trackID(this.id.focus) : ''))) {
				txt.on_playback_new_track(true);
				img.on_playback_new_track(true);
			}
			but.check();
			window.Repaint();
			return;
		}
		switch (true) {
			case ((ppt.img_only || ppt.text_only) && !this.trace.film):
				this.mode(0);
				break;
			case this.trace.image:
				this.mode(!ppt.img_only ? 1 : 2);
				break;
			case this.trace.text:
				this.mode(2);
				break;
		}
		this.move(x, y, true);
	}

	mode(n) {
		if (!ppt.sameStyle) ppt.artistView ? ppt.bioMode = n : ppt.revMode = n;
		let calcText = true;
		this.calc = true;
		filmStrip.logScrollPos();
		switch (n) {
			case 0: {
				calcText = this.calcText || ppt.text_only;
				ppt.img_only = false;
				ppt.text_only = false;
				this.setStyle();
				img.clearCache();
				if (!this.art.ix && ppt.artistView && !txt.bio.lookUp || !this.alb.ix && !ppt.artistView && !txt.rev.lookUp) {
					txt.albumReset();
					txt.artistReset();
					txt.getText(calcText);
					img.getImages();
				} else {
					txt.getItem(calcText, this.art.ix, this.alb.ix);
					img.getItem(this.art.ix, this.alb.ix);
				}
				this.calcText = false;
				break;
			}
			case 1:
				ppt.img_only = true;
				ppt.text_only = false;
				img.setCrop();
				this.setStyle();
				img.clearCache();
				img.getImages();
				break;
			case 2:
				ppt.img_only = false;
				ppt.text_only = true;
				this.setStyle();
				if (ui.style.isBlur) img.clearCache();
				if (!ppt.sameStyle && (ppt.bioMode != ppt.revMode || ppt.bioStyle != ppt.revStyle)) calcText = true;
				if (!this.art.ix && ppt.artistView && !txt.bio.lookUp || !this.alb.ix && !ppt.artistView && !txt.rev.lookUp) {
					txt.albumReset();
					txt.artistReset();
					txt.getText(calcText);
					if (ui.style.isBlur) img.getImages();
				} else {
					txt.getItem(calcText, this.art.ix, this.alb.ix);
					if (ui.style.isBlur) img.getItem(this.art.ix, this.alb.ix);
					img.setCheckArr(null);
				}
				this.calcText = true;
				break;
		}
		if (ppt.text_only) seeker.upd(true);
		if (ppt.filmStripOverlay && ppt.showFilmStrip) filmStrip.set(ppt.filmStripPos);
		but.refresh(true);
	}

	move(x, y, click) {
		this.trace.film = false;
		this.trace.text = false;
		this.trace.image = false;
		if (filmStrip.trace(x, y)) this.trace.film = true;
		else if (ppt.text_only) this.trace.text = true;
		else if (ppt.img_only) this.trace.text = false;
		else if (ppt.style < 4) {
			switch (ppt.style) {
				case 0:
					this.trace.text = y > this.img.t + this.style.imgSize;
					break;
				case 1:
					this.trace.text = x < this.w - this.style.imgSize - this.img.r;
					break;
				case 2:
					this.trace.text = y < this.img.t;
					break;
				case 3:
					this.trace.text = x > this.img.l + this.style.imgSize;
					break;
			}
		} else this.trace.text = y > this.tbox.t && y < this.tbox.t + this.tbox.h && x > this.tbox.l && x < this.tbox.l + this.tbox.w;
		if (!this.trace.text && !this.trace.film) this.trace.image = img.trace(x, y);
		if (!ppt.autoEnlarge || click || this.zoom() || seeker.dn) return;
		const enlarged_img_o = this.style.enlarged_img;
		this.style.enlarged_img = !this.trace.text && this.trace.image;
		if (this.style.enlarged_img && !ppt.text_only && !ppt.img_only && !enlarged_img_o) this.mode(1);
	}

	on_notify(info) {
		const rec = $.jsonParse(info, false);
		this.style.free.forEach(v => {
			if (v.name == rec.name) rec.name = rec.name + ' 新';
		});
		this.style.free.push(rec);
		this.sort(this.style.free, 'name');
		ppt.styleFree = JSON.stringify(this.style.free);
		this.getStyleNames();
	}

	q(n) {
		return n.split('').reverse().join('');
	}

	renameStyle(n) {
		const ok_callback = (status, input) => {
			if (status != 'cancel') {
				if (!input || input == this.style.name[n]) return false;
				this.style.free.forEach(v => {
					if (v.name == input) input = input + ' 新';
				});
				this.style.free[n - 6].name = input;
				this.sort(this.style.free, 'name');
				ppt.styleFree = JSON.stringify(this.style.free);
				this.style.free.some((v, i) => {
					if (v.name == input) {
						ppt.style = i + 5;
						return true;
					}
				});
				this.getStyleNames();
				window.Repaint();
			}
		}
		const caption = '重命名当前样式';
		const prompt = '重命名样式：' + this.style.name[n] + '\n\n输入新名称\n\n继续？';
		const fallback = popUpBox.isHtmlDialogSupported() ? popUpBox.input(caption, prompt, ok_callback, '', this.style.name[n]) : true;
		if (fallback) {
			let ns = '';
			let status = 'ok'
			try {
				ns = utils.InputBox(0, prompt, caption, this.style.name[n], true);
			} catch(e) {
				status = 'cancel'
			}
			ok_callback(status, ns);
		}
	}

	resetStyle(n) {
		const continue_confirmation = (status, confirmed) => {
			if (confirmed) {
				if (ppt.style < 4) ppt.rel_imgs = 0.65;
				else {
					const obj = ppt.style == 4 || ppt.style == 5 ? this.style.overlay : this.style.free[ppt.style - 6];
					obj.name = this.style.name[n];
					obj.imL = 0;
					obj.imR = 0;
					obj.imT = 0;
					obj.imB = 0;
					obj.txL = 0;
					obj.txR = 0;
					obj.txT = 0.632;
					obj.txB = 0;
					ppt.style == 4 || ppt.style == 5 ? ppt.styleOverlay = JSON.stringify(this.style.overlay) : ppt.styleFree = JSON.stringify(this.style.free);
				}
				txt.refresh(3);
			}
		}
		const caption = '重置当前样式';
		const prompt = '重置为默认值' + (ppt.style < 5 ? this.style.name[n] : '叠加') + '样式。\n\n继续？'
		const wsh = popUpBox.isHtmlDialogSupported() ? popUpBox.confirm(caption, prompt, '确定', '取消', '', '', continue_confirmation) : true;
		if (wsh) continue_confirmation('ok', $.wshPopup(prompt, caption));
	}

	sameStyle() {
		return ppt.sameStyle || (ppt.bioMode == ppt.revMode && ppt.bioStyle == ppt.revStyle);
	}

	setBorder(imgFull, bor, refl) {
		if (imgFull) {
			const value = bor > 1 && !refl ? 10 * $.scale : 0;
			$.key.forEach(v => this.bor[v] = value);
		} else {
			$.key.forEach(v => this.bor[v] = bor < 2 || refl ? ppt[`bor${v.toUpperCase()}`] : Math.max(ppt[`bor${v.toUpperCase()}`], 10 * $.scale));
			this.style.gap = bor < 2 || refl ? ppt.gap : Math.max(ppt.gap, 10 * $.scale);
		}
	}

	setStyle(bypass) {
		this.sbar.offset = [2 + ui.sbar.arrowPad, Math.max(Math.floor(ui.sbar.but_w * 0.2), 2) + ui.sbar.arrowPad * 2, 0][ui.sbar.type];
		this.sbar.top_corr = [this.sbar.offset - (ui.sbar.but_h - ui.sbar.but_w) / 2, this.sbar.offset, 0][ui.sbar.type];
		const bot_corr = [(ui.sbar.but_h - ui.sbar.but_w) / 2 - this.sbar.offset, -this.sbar.offset, 0][ui.sbar.type];
		this.clip = false;
		if (!ppt.sameStyle) {
			switch (true) {
				case ppt.artistView:
					if (ppt.bioMode == 1) {
						ppt.img_only = true;
						ppt.text_only = false;
					} else if (ppt.bioMode == 2) {
						ppt.img_only = false;
						ppt.text_only = true;
					} else {
						ppt.img_only = false;
						ppt.text_only = false;
						ppt.style = ppt.bioStyle;
					}
					break;
				case !ppt.artistView:
					if (ppt.revMode == 1) {
						ppt.img_only = true;
						ppt.text_only = false;
					} else if (ppt.revMode == 2) {
						ppt.img_only = false;
						ppt.text_only = true;
					} else {
						ppt.img_only = false;
						ppt.text_only = false;
						ppt.style = ppt.revStyle;
					}
					break;
			}
			if (ppt.text_only) seeker.upd(true);
		}

		const sp1 = 10 * $.scale;
		const sp2 = sp1 + (this.filmStripSize.r && !ppt.filmStripOverlay ? 9 * $.scale : 0);

		switch (true) {
			case ppt.img_only: { // img_only
				$.key.forEach(v => this.img[v] = this.bor[v]);
				const autoFill = ppt.artistView && ppt.artStyleImgOnly == 1 || !ppt.artistView && ppt.covStyleImgOnly == 1;
				if (!autoFill && !ppt.filmStripOverlay) {
					const v = $.key[ppt.filmStripPos];
					this.img[v] += this.filmStripSize[v];
					this.style.imgSize = $.clamp(this.h - this.img.t - this.img.b, 10, this.w - this.img.l - this.img.r);
				} else this.style.imgSize = $.clamp(this.h - this.bor.t - this.bor.b, 10, this.w - this.bor.l - this.bor.r);
				break;
			}

			case ppt.text_only: // text_only
				this.lines_drawn = Math.max(Math.floor((this.h - ppt.textT - ppt.textB - ui.heading.h - this.filmStripSize.t - this.filmStripSize.b) / ui.font.main_h), 0);
				this.text.l = ppt.textL + this.filmStripSize.l;
				this.text.r = (ppt.sbarShow ? Math.max(ppt.textR, ui.sbar.sp + sp2) : ppt.textR) + this.filmStripSize.r;
				this.text.t = !ppt.topAlign ? ppt.textT + (this.h - ppt.textT + this.filmStripSize.t - ppt.textB - this.filmStripSize.b - this.lines_drawn * ui.font.main_h + ui.heading.h) / 2 : ppt.textT + ui.heading.h + this.filmStripSize.t;
				this.text.w = this.w - this.text.l - this.text.r;
				this.text.h = this.lines_drawn * ui.font.main_h;
				this.heading.x = !this.style.fullWidthHeading ? this.text.l : ppt.textL;
				this.heading.w = !this.style.fullWidthHeading ? this.text.w : this.w - this.heading.x - ppt.textR;
				if (ppt.sbarShow) {
					if (!this.filmStripSize.r) this.sbar.x = this.w - ui.sbar.sp;
					else this.sbar.x = this.text.l + this.text.w + sp1;
					this.sbar.y = (ui.sbar.type < this.sbar.style || this.filmStripSize.t || this.filmStripSize.r || this.filmStripSize.b ? this.text.t : 0) + this.sbar.top_corr;
					this.sbar.h = (ui.sbar.type < this.sbar.style || this.filmStripSize.t || this.filmStripSize.r || this.filmStripSize.b ? ui.font.main_h * this.lines_drawn + bot_corr : this.h - this.sbar.y) + bot_corr;
				}
				this.repaint.x = this.text.l;
				this.repaint.y = 0;
				this.repaint.w = this.w - this.repaint.x - this.filmStripSize.r, this.repaint.h = this.h - this.filmStripSize.b;
				break;

			case ppt.style == 0: { // top
				$.key.forEach(v => this.img[v] = this.bor[v] + (v != 'b' ? (!ppt.filmStripOverlay ? this.filmStripSize[v] : 0) : 0));
				let txt_h = Math.round((this.h - this.img.t - ppt.textB - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0)) * (1 - ppt.rel_imgs));
				this.lines_drawn = Math.max(Math.floor((txt_h - ui.heading.h) / ui.font.main_h), 0);
				this.text.h = this.lines_drawn * ui.font.main_h;
				txt_h = this.text.h + this.style.gap;
				this.style.imgSize = Math.max(this.h - txt_h - this.img.t - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0) - ppt.textB - ui.heading.h, 10);
				this.text.l = ppt.textL + (!ppt.filmStripOverlay ? this.filmStripSize.l : 0);
				this.text.r = (ppt.sbarShow ? Math.max(ppt.textR, ui.sbar.sp + sp2) : ppt.textR) + (!ppt.filmStripOverlay ? this.filmStripSize.r : 0);
				this.text.t = this.img.t + this.style.imgSize + this.style.gap + ui.heading.h;
				this.text.w = this.w - this.text.l - this.text.r;
				this.heading.x = (!this.style.fullWidthHeading ? this.text.l : ppt.textL);
				this.heading.w = !this.style.fullWidthHeading ? this.text.w : this.w - ppt.textL - ppt.textR;
				if (!this.filmStripSize.r) this.sbar.x = this.w - ui.sbar.sp;
				else this.sbar.x = this.text.l + this.text.w + sp1;
				this.sbar.y = (ui.sbar.type < this.sbar.style || ppt.heading || this.filmStripSize.b ? this.text.t : this.img.t + this.style.imgSize) + this.sbar.top_corr;
				this.sbar.h = (ui.sbar.type < this.sbar.style || this.filmStripSize.b ? ui.font.main_h * this.lines_drawn + bot_corr : this.h - this.sbar.y) + bot_corr;
				this.repaint.x = this.text.l;
				this.repaint.y = this.text.t;
				this.repaint.w = this.w - this.repaint.x - (!ppt.filmStripOverlay ? this.filmStripSize.r : 0);
				this.repaint.h = this.h - this.repaint.y - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0);
				break;
			}
			case ppt.style == 1: { // right
				$.key.forEach(v => this.img[v] = this.bor[v] + (v != 'l' ? (!ppt.filmStripOverlay ? this.filmStripSize[v] : 0) : 0));
				let txt_sp = Math.round((this.w - ppt.textL - (!ppt.filmStripOverlay ? this.filmStripSize.l : 0) - this.img.r) * (1 - ppt.rel_imgs));
				let txt_h = this.h - ppt.textT - ppt.textB - (!ppt.filmStripOverlay ? this.filmStripSize.t : 0) - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0);
				this.lines_drawn = Math.max(Math.floor((txt_h - ui.heading.h) / ui.font.main_h), 0);
				this.style.imgSize = Math.max(this.w - txt_sp - this.img.r - ppt.textL - (!ppt.filmStripOverlay ? this.filmStripSize.l : 0) - this.style.gap, 10);
				if (ppt.sbarShow) txt_sp -= (ui.sbar.sp + sp1);
				this.text.l = ppt.textL + (!ppt.filmStripOverlay ? (!ppt.filmStripOverlay ? this.filmStripSize.l : 0) : 0);
				this.text.r = ppt.sbarShow ? Math.max(ppt.textR + (!ppt.filmStripOverlay ? this.filmStripSize.r : 0), ui.sbar.sp + sp1) : ppt.textR + (!ppt.filmStripOverlay ? this.filmStripSize.r : 0);
				this.text.t = !ppt.topAlign ? ppt.textT + (this.h - ppt.textT - ppt.textB + (!ppt.filmStripOverlay ? this.filmStripSize.t: 0) - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0) - this.lines_drawn * ui.font.main_h + ui.heading.h) / 2 : ppt.textT + ui.heading.h + (!ppt.filmStripOverlay ? this.filmStripSize.t : 0);
				this.text.w = txt_sp;
				this.text.h = this.lines_drawn * ui.font.main_h;
				this.heading.x = !this.style.fullWidthHeading ? this.text.l : ppt.textL;
				this.heading.w = !this.style.fullWidthHeading ? this.text.w : this.w - this.heading.x - this.bor.r;
				if (this.style.fullWidthHeading) this.img.t = this.text.t;
				this.img.l = ppt.textL + txt_sp + (!ppt.filmStripOverlay ? this.filmStripSize.l : 0) + this.style.gap + (ppt.sbarShow ? ui.sbar.sp + sp1 : 0);
				this.sbar.x = this.text.l + this.text.w + sp1;
				this.sbar.y = (ui.sbar.type < this.sbar.style || ppt.heading || this.filmStripSize.t || this.filmStripSize.b ? this.text.t : 0) + this.sbar.top_corr;
				this.sbar.h = ui.sbar.type < this.sbar.style || this.filmStripSize.t || this.filmStripSize.b ? ui.font.main_h * this.lines_drawn + bot_corr * 2 : this.h - this.sbar.y + bot_corr;
				this.repaint.x = this.text.l;
				this.repaint.y = this.text.t;
				this.repaint.w = this.img.l - this.repaint.x - this.style.gap;
				this.repaint.h = this.h - this.repaint.y - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0);
				break;
			}

			case ppt.style == 2: { // bottom
				$.key.forEach(v => this.img[v] = this.bor[v] + (v != 't' && v != 'b' ? (!ppt.filmStripOverlay ? this.filmStripSize[v] : 0) : 0));
				let txt_h = Math.round((this.h - ppt.textT - this.img.b - (!ppt.filmStripOverlay ? this.filmStripSize.t : 0) - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0)) * (1 - ppt.rel_imgs));
				this.lines_drawn = Math.max(Math.floor((txt_h - ui.heading.h) / ui.font.main_h), 0);
				this.text.h = this.lines_drawn * ui.font.main_h;
				txt_h = this.text.h + this.style.gap;
				this.style.imgSize = Math.max(this.h - txt_h - ppt.textT - this.img.b - (!ppt.filmStripOverlay ? this.filmStripSize.t : 0) - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0) - ui.heading.h, 10);
				this.img.t = this.h - this.bor.b - this.style.imgSize - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0);
				this.text.l = ppt.textL + (!ppt.filmStripOverlay ? this.filmStripSize.l : 0);
				this.text.r = (ppt.sbarShow ? Math.max(ppt.textR, ui.sbar.sp + sp2) : ppt.textR) + (!ppt.filmStripOverlay ? this.filmStripSize.r : 0);
				this.text.t = this.img.t - txt_h;
				this.text.w = this.w - this.text.l - this.text.r;
				this.heading.x = (!this.style.fullWidthHeading ? this.text.l : ppt.textL);
				this.heading.w = !this.style.fullWidthHeading ? this.text.w : this.w - ppt.textL - ppt.textR;
				if (!this.filmStripSize.r) this.sbar.x = this.w - ui.sbar.sp;
				else this.sbar.x = this.text.l + this.text.w + sp1;
				this.sbar.y = (ui.sbar.type < this.sbar.style || ppt.heading ? this.text.t : 0) + this.sbar.top_corr;
				this.sbar.h = ui.sbar.type < this.sbar.style ? ui.font.main_h * this.lines_drawn + bot_corr * 2 : this.img.t - this.sbar.y + bot_corr;
				this.repaint.x = this.text.l;
				this.repaint.y = this.text.t;
				this.repaint.w = this.w - this.repaint.x - (!ppt.filmStripOverlay ? this.filmStripSize.r : 0);
				this.repaint.h = this.img.t - this.repaint.y;
				break;
			}

			case ppt.style == 3: { // left
				$.key.forEach(v => this.img[v] = this.bor[v] + (v != 'r' ? (!ppt.filmStripOverlay ? this.filmStripSize[v] : 0) : 0));
				this.text.r = (ppt.sbarShow ? Math.max(ppt.textR, ui.sbar.sp + sp2) : ppt.textR) + (!ppt.filmStripOverlay ? this.filmStripSize.r : 0);
				const txt_sp = Math.round((this.w - this.img.l - this.text.r) * (1 - ppt.rel_imgs));
				let txt_h = this.h - ppt.textT - ppt.textB - (!ppt.filmStripOverlay ? this.filmStripSize.t : 0) - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0);
				this.lines_drawn = Math.max(Math.floor((txt_h - ui.heading.h) / ui.font.main_h), 0);
				this.style.imgSize = Math.max(this.w - txt_sp - this.img.l - this.text.r - this.style.gap, 10);
				this.text.l = this.img.l + this.style.imgSize + this.style.gap;
				this.text.t = !ppt.topAlign ? ppt.textT + (this.h - ppt.textT - ppt.textB + (!ppt.filmStripOverlay ? this.filmStripSize.t : 0) - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0) - this.lines_drawn * ui.font.main_h + ui.heading.h) / 2 : ppt.textT + ui.heading.h + (!ppt.filmStripOverlay ? this.filmStripSize.t : 0);
				this.text.w = txt_sp;
				this.text.h = this.lines_drawn * ui.font.main_h;
				this.heading.x = !this.style.fullWidthHeading ? this.text.l : this.bor.l;
				this.heading.w = !this.style.fullWidthHeading ? this.text.w : this.w - this.heading.x - ppt.textR;
				if (this.style.fullWidthHeading) this.img.t = this.text.t;
				if (!this.filmStripSize.r) this.sbar.x = this.w - ui.sbar.sp;
				else this.sbar.x = this.text.l + this.text.w + sp1;
				this.sbar.y = (ui.sbar.type < this.sbar.style || ppt.heading || this.filmStripSize.t || this.filmStripSize.b ? this.text.t : 0) + this.sbar.top_corr;
				this.sbar.h = ui.sbar.type < this.sbar.style || this.filmStripSize.t || this.filmStripSize.b ? ui.font.main_h * this.lines_drawn + bot_corr * 2 : this.h - this.sbar.y + bot_corr;
				this.repaint.x = this.text.l;
				this.repaint.y = this.text.t;
				this.repaint.w = this.w - this.repaint.x - (!ppt.filmStripOverlay ? this.filmStripSize.r : 0);
				this.repaint.h = this.h - this.repaint.y - (!ppt.filmStripOverlay ? this.filmStripSize.b : 0);
				break;
			}

			case ppt.style > 3: {
				if (ppt.style - 6 >= this.style.free.length) this.getStyleFallback();
				const obj = ppt.style == 4 || ppt.style == 5 ? this.style.overlay : this.style.free[ppt.style - 6];
				if (!bypass) {
					this.im.l = $.clamp(obj.imL, 0, 1);
					this.im.r = $.clamp(obj.imR, 0, 1);
					this.im.t = $.clamp(obj.imT, 0, 1);
					this.im.b = $.clamp(obj.imB, 0, 1);
					this.tx.l = $.clamp(obj.txL, 0, 1);
					this.tx.r = $.clamp(obj.txR, 0, 1);
					this.tx.t = $.clamp(obj.txT, 0, 1);
					this.tx.b = $.clamp(obj.txB, 0, 1);
				}
				const imL = Math.round(this.im.l * this.w) + (!ppt.filmStripOverlay ? this.filmStripSize.l : 0);
				const imR = Math.round(this.im.r * this.w) + (!ppt.filmStripOverlay ? this.filmStripSize.r : 0);
				const imT = Math.round(this.im.t * this.h) + (!ppt.filmStripOverlay ? this.filmStripSize.t : 0);
				const imB = Math.round(this.im.b * this.h) + (!ppt.filmStripOverlay ? this.filmStripSize.b : 0);
				const txL = ppt.style == 4 ? 0 : Math.round(this.tx.l * this.w) + (!ppt.filmStripOverlay ? this.filmStripSize.l : 0);
				const txR = ppt.style == 4 ? 0 : Math.round(this.tx.r * this.w) + (!ppt.filmStripOverlay ? this.filmStripSize.r : 0);
				const txT = ppt.style == 4 ? 0 : Math.round(this.tx.t * this.h) + (!ppt.filmStripOverlay ? this.filmStripSize.t : 0);
				const txB = ppt.style == 4 ? 0 : Math.round(this.tx.b * this.h) + (!ppt.filmStripOverlay ? this.filmStripSize.b : 0);
				this.ibox.l = Math.max(imL, 0);
				this.ibox.t = Math.max(imT, 0);
				this.ibox.w = this.w - imL - imR;
				this.ibox.h = this.h - imT - imB;
				this.img.l = ppt.style == 4 ? 0 : imL + this.bor.l;
				this.img.r = ppt.style == 4 ? 0 : imR + this.bor.r;
				this.img.t = ppt.style == 4 ? 0 : imT + this.bor.t;
				this.img.b = ppt.style == 4 ? 0 : imB + this.bor.b;
				const t_l = (ppt.style == 4 ? this.filmStripSize.l : 0) + ppt.textL + ui.overlay.borderWidth;
				const t_t = (ppt.style == 4 ? this.filmStripSize.t : 0) + ppt.textT + ui.overlay.borderWidth;
				let t_r = (ppt.style == 4 ? this.filmStripSize.r : 0) + ppt.textR + ui.overlay.borderWidth;
				let t_b = (ppt.style == 4 ? this.filmStripSize.b : 0) + ppt.textB + ui.overlay.borderWidth;
				if ((ppt.typeOverlay == 2 || ppt.typeOverlay == 4) && ppt.style != 4) {
					t_r += 1;
					t_b += 1;
				}

				let txt_h = Math.round((this.h - txT - txB - t_t - t_b));
				this.lines_drawn = Math.max(Math.floor((txt_h - ui.heading.h) / ui.font.main_h), 0);
				this.text.l = txL + t_l;
				this.text.r = txR + (ppt.sbarShow ? Math.max(t_r, ui.sbar.sp + sp1) : t_r);
				this.text.t = txT + ui.heading.h + t_t;
				this.text.w = this.w - this.text.l - this.text.r;
				this.text.h = this.lines_drawn * ui.font.main_h;
				this.heading.x = !this.style.fullWidthHeading ? this.text.l : ppt.style == 4 ? ppt.textL : Math.min(this.img.l, this.text.l, (!ppt.filmStripOverlay ? this.filmStripSize.l : 0) ? filmStrip.x : this.w);
				this.heading.w = !this.style.fullWidthHeading ? this.text.w : ppt.style == 4 ? this.w - this.heading.x * 2 : this.w - this.heading.x - Math.min(this.img.r, this.text.r, (!ppt.filmStripOverlay ? this.filmStripSize.r : 0) ? this.w - filmStrip.x - filmStrip.w : this.w);
				this.tbox.l = Math.max(txL, 0);
				this.tbox.t = Math.max(txT, 0);
				this.tbox.w = this.w - Math.max(txL, 0) - Math.max(txR, 0);
				this.tbox.h = this.h - Math.max(txT, 0) - Math.max(txB, 0);
				this.style.minH = ui.font.main_h + ui.heading.h + t_t + t_b;
				if (ppt.typeOverlay == 2 && ppt.style != 4) ui.overlay.borderWidth = Math.max(Math.min(ui.overlay.borderWidth, this.tbox.w / 3, this.tbox.h / 3), 1);
				if (ppt.typeOverlay && ppt.style != 4) this.arc = Math.max(Math.min(ui.font.main_h / 1.5, this.tbox.w / 3, this.tbox.h / 3), 1);
				this.clip = this.ibox.t + 100 < this.tbox.t && this.tbox.t < this.ibox.t + this.ibox.h && (this.tbox.l < this.ibox.l + this.ibox.w || this.tbox.l + this.tbox.w < this.ibox.l + this.ibox.w);
				this.style.imgSize = this.clip ? this.tbox.t - this.ibox.t : Math.min(this.h - imT - imB - this.bor.t - this.bor.b, this.w - imL - imR - this.bor.l - this.bor.r);
				this.sbar.x = this.tbox.l + this.tbox.w - ui.sbar.sp - ui.overlay.borderWidth;
				this.sbar.y = this.text.t + this.sbar.top_corr;
				this.sbar.h = ui.font.main_h * this.lines_drawn + bot_corr * 2;
				this.repaint.x = this.tbox.l;
				this.repaint.y = this.tbox.t;
				this.repaint.w = this.tbox.w;
				this.repaint.h = this.tbox.h;
				break;
			}
		}
		if (ui.sbar.type == 2) {
			this.sbar.y += 1;
			this.sbar.h -= 2;
		}
		this.text.w = Math.max(this.text.w, 10);
		this.style.max_y = this.lines_drawn * ui.font.main_h + this.text.t - ui.font.main_h * 0.9;
		if (!this.id.init) filmStrip.check();
		this.id.init = false;
	}

	setSummary() {
		this.summary = {
			date: ppt.summaryShow && ppt.summaryDate,
			genre: ppt.summaryShow && ppt.summaryGenre,
			latest: ppt.summaryShow && ppt.summaryLatest,
			locale: ppt.summaryShow && ppt.summaryLocale,
			other: ppt.summaryShow && ppt.summaryOther,
			popNow: ppt.summaryShow && ppt.summaryPopNow,
			show: ppt.summaryShow
		}
	}

	sort(data, prop) {
		data.sort((artist, b) => {
			artist = artist[prop].toLowerCase();
			b = b[prop].toLowerCase();
			return artist.localeCompare(b);
		});
		return data;
	}

	stnd(artist, b) {
		return !artist || artist + 1 > b.length;
	}

	simTagTopLookUp() {
		const li = ppt.artistView ? this.art : this.alb;
		return li.ix && li.list[li.ix];
	}

	stndItem() {
		return !this.art.ix && ppt.artistView || !this.alb.ix && !ppt.artistView;
	}

	tfBio(n, artist, focus) {
		n = n.replace(/((\$if|\$and|\$or|\$not|\$xor)(|\d)\(|\[)[^$%]*%bio_artist%/gi, '$&#@!%path%#@!').replace(/%bio_artist%/gi, $.tfEscape(artist)).replace(/%bio_album%/gi, cfg.tf.album).replace(/%bio_title%/gi, cfg.tf.title);
		n = $.eval(n, focus);
		n = n.replace(/#@!.*?#@!/g, '');
		return n;
	}

	tfRev(n, albumArtist, album, focus) {
		n = n.replace(/((\$if|\$and|\$or|\$not|\$xor)(|\d)\(|\[)[^$%]*(%bio_albumartist%|%bio_album%)/gi, '$&#@!%path%#@!').replace(/%bio_albumartist%/gi, $.tfEscape(albumArtist)).replace(/%bio_album%/gi, $.tfEscape(album)).replace(/%bio_title%/gi, cfg.tf.title);
		n = $.eval(n, focus);
		n = n.replace(/#@!.*?#@!/g, '');
		return n;
	}

	text_paint() {
		window.RepaintRect(this.repaint.x, this.repaint.y, this.repaint.w, this.repaint.h);
	}

	uniqAlbum(artist) {
		const flags = [];
		let result = [];
		artist.forEach(v => {
			const name = v.artist.toLowerCase() + ' - ' + v.album.toLowerCase();
			if (flags[name]) return;
			result.push(v);
			flags[name] = true;
		});
		return result = result.filter(v => v.type != 'label');
	}

	uniqArtist(artist) {
		const flags = [];
		let result = [];
		artist.forEach(v => {
			if (flags[v.name]) return;
			result.push(v);
			flags[v.name] = true;
		});
		return result;
	}

	updateNeeded() {
		switch (true) {
			case ppt.artistView:
				this.id.curArtist = this.id.artist;
				this.id.artist = $.eval(this.art.fields, this.id.focus);
				if (!this.id.lookUp) return true;
				else return this.id.artist != this.id.curArtist || !this.art.list.length || !this.art.ix;
			case !ppt.artistView:
				this.id.curAlb = this.id.alb;
				this.id.alb = name.albID(this.id.focus, 'simple');
				if (this.style.inclTrackRev) {
					this.id.curTr = this.id.tr;
					this.id.tr = name.trackID(this.id.focus);
				} else this.id.curTr = this.id.tr = '';
				if (!this.id.lookUp) return true;
				else return this.id.alb != this.id.curAlb || this.id.tr != this.id.curTr || !this.alb.list.length || !this.alb.ix;
		}
	}

	zoom() {
		return vk.k('shift') || vk.k('ctrl');
	}
}
