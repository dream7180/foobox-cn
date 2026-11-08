'use strict';

class Setting {
	constructor(key, default_value, type) {
		this.key = key;
		this.default_value = default_value;
		this.type = type;
		this.value = cfg.get(this.key, this.default_value, this.type);
	}

	// Methods

	get() {
		return this.value;
	}
	set(new_value) {
		if (this.value !== new_value) {
			switch (this.type) {
				case 'text':
					if (!new_value && new_value != this.default_value) {
						new_value = this.default_value;
					}
					break;
				case 'boolean':
					if (new_value !== true && new_value !== false) new_value = this.default_value;
					break;
				case 'num':
					new_value = parseInt(new_value);
					if (isNaN(new_value)) {
						new_value = this.default_value;
					}
					break;
			}
			cfg.set(this.key, new_value);
			this.value = new_value;
		}
	}
}

class Settings {
	constructor() {
		// this.key_list = {}; debug

		this.subPth = 'foobox\\data\\biography\\';
		this.storageFolder = bioDataPth;
		$.buildPth(this.storageFolder);
		this.cfgFile = `${this.storageFolder}server.cfg`;
		this.item_properties = `${this.storageFolder}item_properties.json`;
		this.nowplaying = `${this.storageFolder}nowplaying.txt`;

		this.cfg = $.jsonParse(this.cfgFile, {}, 'file-utf8'); // Regorxxx <- Force UTF-8 ->
		this.lfmSim = true;
		this.lang = {
			arr: ['EN', 'DE', 'ES', 'FR', 'IT', 'JA', 'PL', 'PT', 'RU', 'SV', 'TR', 'ZH'],
			ix: 0,
			ok: false
		}
		this.remap = {}
		this.pth = {}
		this.tf = {}
		this.dispPth = {} // 设置页"当前实际使用路径"提示用的路径（值为空时显示，不写入配置）
		this.caPath = `${this.storageFolder}biography-cache`;
		this.cachePath = `${this.caPath}\\`;
		this.cacheRootDefaultDisp = `%profile%\\${this.subPth}biography-cache`; // 根路径编辑框的默认显示（无尾斜杠）
		this.tails = {
			foLfmRev: 'review\\lastfm\\$lower($cut(%BIO_ALBUMARTIST%,1))',
			foLfmBio: 'biography\\lastfm\\$lower($cut(%BIO_ARTIST%,1))',
			foWikiRev: 'review\\wikipedia\\$lower($cut(%BIO_ALBUMARTIST%,1))',
			foWikiBio: 'biography\\wikipedia\\$lower($cut(%BIO_ARTIST%,1))',
			foImgArt: 'art_img\\$lower($cut(%BIO_ARTIST%,1))\\%BIO_ARTIST%',
			foImgRev: 'rev_img\\$lower($cut(%BIO_ALBUMARTIST%,1))\\%BIO_ALBUMARTIST%',
			foLfmSim: 'lastfm\\$lower($cut(%BIO_ARTIST%,1))'
		};
		this.cycDefault = '%storage_folder%\\biography-cache\\' + this.tails.foImgArt; // 照片循环文件夹的内置默认（封面循环固定同此路径）
		this.defPth = {}; // 运行期实际取用的默认路径
		this.defPthDisp = {}; // 同一路径的 %profile% 提示形式（仅用于设置页占位提示）
		this.rootPth = this.cachePath;
		this.rootDisp = `%profile%\\${this.subPth}biography-cache\\`;
		this.dispCacheRoot = this.cacheRootDefaultDisp;
		this.buildDefPth();

		this.photoRecycler = `${this.storageFolder}oldPhotosForDeletion\\`;
		this.settingsKeys = [];
		this.writeDefer = 0; // > 0: 变更只留在内存，批次结束时统一写盘一次
		this.writeDirty = false;
		
		this.suffix = {
			foLfmRev: ' [Lastfm Review]',
			foLfmBio: ' [Lastfm Biography]',
			foWikiRev: ' [Wikipedia Review]',
			foWikiBio: ' [Wikipedia Biography]'
		}
		this.lfmDisplayName = 'Last.fm';
		this.wikiDisplayName = '维基百科';
	}

	// Methods

	init(settings) {
		// 启动时按默认值补齐的设置可能有几十项，合并为一次写盘
		this.beginBatch();
		try {
			this.build(settings);
		} finally {
			this.endBatch();
		}
	}

	build(settings) {
		this.checkCfg(settings);
		this.settingsKeys = settings.map(v => v[3]);
		settings.forEach(v => {
			// this.validate(v); debug
			this.add(v);
		});
		this.parse();
	}

	validate(item) {
		if (!$.isArray(item) || item.length !== 4 || typeof item[3] !== 'string') {
			throw ('invalid settings: requires array: [string, any, string, string, string]: ' + item[3]);
		}

		if (item[3] === 'add') {
			throw ('settings_id: ' + item[3] + '\n此 ID 已被保留');
		}

		if (this[item[3]] != null || this[item[3] + '_internal'] != null) {
			throw ('settings_id: ' + item[3] + '\n此 ID 已被占用');
		}

		if (this.key_list[item[3]] != null) {
			throw ('settings_key: ' + item[3] + '\\n此 key 已被占用');
		}
	}

	add(item) {
		// this.key_list[item[3]] = 1; debug
		this[item[3] + '_internal'] = new Setting(item[3], item[1], item[2]);

		Object.defineProperty(this, item[3], {
			get() {
				return this[item[3] + '_internal'].get();
			},
			set(new_value) {
				this[item[3] + '_internal'].set(new_value);
			}
		});
	}

	get(key, default_value, type) { // initialisation
		let saved_value = this.cfg[key];
		switch (type) { // guard check against users directly editing file erroneously
			case 'text':
				if (!saved_value && saved_value != default_value) {
					this.set(key, default_value);
					return default_value;
				}
				break;
			case 'boolean':
				if (saved_value !== true && saved_value !== false) {
					this.set(key, default_value);
					return default_value;
				}
				break;
			case 'num':
				saved_value = parseInt(saved_value);
				if (isNaN(saved_value)) {
					this.set(key, default_value);
					return default_value;
				}
				break;
		}
		return saved_value;
	}

	set(key, new_value) {
		this.cfg[key] = new_value;
		if (this.writeDefer) { // 批次内：只标记，不落盘
			this.writeDirty = true;
			return;
		}
		this.writeCfg();
	}

	// 批量写：begin/end 之间的所有变更（含 parse() 里的夹取修正）只在内存中生效，
	// 结束时整文件写一次，替代原先"每改一个 key 就整文件重写"的做法。
	beginBatch() {
		this.writeDefer++;
	}

	endBatch() {
		if (this.writeDefer > 0) this.writeDefer--;
		if (!this.writeDefer && this.writeDirty) this.writeCfg();
	}

	writeCfg() {
		this.writeDirty = false;
		$.save(this.cfgFile, JSON.stringify($.sortKeys(this.cfg), null, 3), true);
	}

	toggle(name) {
		this[name] = !this[name];
	}

	checkCfg(settings) {
		if (!$.file(this.item_properties)) $.save(this.item_properties, item_properties, true);
		if (!$.file(this.nowplaying)) $.save(this.nowplaying, nowplaying, true);
		if ($.file(this.cfgFile)) return;
		// 首次运行：按默认值建立配置文件
		settings.forEach(v => {
			this.cfg[v[3]] = v[1];
		});
		$.save(this.cfgFile, JSON.stringify($.sortKeys(this.cfg), null, 3), true);
	}

	getLangIndex(n) {
		if (n) this.language = n;
		this.lang.arr.some((v, i) => {
			if (v.toLowerCase() == this.language.toLowerCase()) {
				this.lang.ix = i;
				return this.lang.ok = true;
			}
		});
	}

	open() {
		const ok_callback = (new_ppt, new_cfg, type, new_dialogWindow) => {
			if (new_dialogWindow) ppt.set('Biography Dialog Box', new_dialogWindow);
			if (new_ppt) ui.updateProp($.jsonParse(new_ppt, {}), 'value');
			if (new_cfg) {
				const lang_ix = this.lang.ix;
				const cache_type = this.autoCache;
				this.updateCfg($.jsonParse(new_cfg, {}));
				if (cache_type != this.autoCache) this.setCacheMode();
				if (lang_ix != this.lang.ix) this.setLanguage(this.lang.ix);
			}
			if (new_ppt || new_cfg) return;
			switch (type) {
				case 'resetPanelCfg':
					ui.updateProp(ppt, 'default_value');
					panelCfg.reset();
					break;
				case 'resetServerCfg':
					this.resetCfg();
					break;
				case 'empty': {
					try {
						const app = new ActiveXObject('Shell.Application');
						app.NameSpace(10).MoveHere(this.photoRecycler);
					} catch (e) {
						$.trace('无法清空照片回收器：可以使用 Windows 资源管理器清空');
					}
					break;
				}
				case 'open':
					$.browser(this.photoRecycler, false);
					break;
			}
		}
		let dialogWindow = ppt.get('Biography Dialog Box', JSON.stringify({
			w: 85,
			h: 60,
			def_w: 85,
			def_h: 60,
			tab: 'PanelCfg',
			panelPage: 'display',
			serverPage: 'download',
			displaySaveFolders: false,
			version: `v${window.ScriptInfo.Version}`
		}));
		dialogWindow = $.jsonParse(dialogWindow);
		dialogWindow.version = `v${window.ScriptInfo.Version}`;
		dialogWindow = JSON.stringify(dialogWindow);
		popUpBox.config(JSON.stringify(ppt), JSON.stringify(cfg), dialogWindow, ok_callback, this.lang.ix, $.folder(cfg.photoRecycler));
	}

	// 缓存根路径：设置里填了就用它（去掉尾部斜杠），否则用内置的 %profile%\\foobox\\data\\biography\\biography-cache\\
	// 7 项详细路径的默认值全部由它派生，所以改根路径不需要逐项维护
	buildDefPth() {
		// 只有"自定义"模式才用根路径；选"默认"时一律用内置缓存目录，配置里残留的旧根路径不再生效
		const raw = this.autoCache ? (this.cacheRoot || '').trim().replace(/\//g, '\\').replace(/\\+$/, '') : '';
		this.dispCacheRoot = raw || this.cacheRootDefaultDisp;
		// %profile% / %storage_folder% 写法先展开成绝对路径，最后整体只做一次 tf 转义（不能双重转义）
		const abs = raw.replace(/^%profile%\\?/i, () => fb.ProfilePath).replace(/^%storage_folder%\\?/i, () => this.storageFolder).replace(/\\+$/, '');
		this.rootPth = raw ? abs + '\\' : this.cachePath;
		this.rootDisp = raw ? raw + '\\' : `%profile%\\${this.subPth}biography-cache\\`;
		const caPth = $.tfEscape(this.rootPth); // 运行期前缀做一次 tf 转义（' ( ) [ ] , % $）
		Object.keys(this.tails).forEach(k => {
			this.defPth[k] = caPth + this.tails[k];
			this.defPthDisp[k] = this.rootDisp + this.tails[k];
		});
	}

	parse() {
		this.buildDefPth(); // 缓存根路径可能改过：7 项详细路径的默认值跟着重算
		const items = ['foLfmRev', 'foLfmBio', 'foImgArt', 'foLfmSim', 'foWikiRev', 'foWikiBio', 'foImgCov', 'fnImgCov'];
		const tfIni = ['tfAlbumArtist', 'tfArtist', 'tfAlbum', 'tfTitle', 'tfComposition'];
		const tfItems = ['albumArtist', 'artist', 'album', 'title', 'composition'];
		const tfNames = ['%BIO_ALBUMARTIST%', '%BIO_ARTIST%', '%BIO_ALBUM%', '%BIO_TITLE%', '%BIO_COMPOSITION%'];

		tfNames.forEach((v, i) => { // remove self
			this.tf[tfItems[i]] = this[tfIni[i]].replace(RegExp(v, 'gi'), '');
		});

		this.substituteTf = n => {
			tfNames.forEach((v, i) => {
				n = n.replace(RegExp(v, 'gi'), this.tf[tfItems[i]]);
			})
			return n;
		}

		tfItems.forEach(v => this.tf[v] = this.substituteTf(this.tf[v]));

		this.dispPth = {};
		items.forEach(v => {
			const def = this.defPth[v]; // 7 项路径一律由根路径派生，不读设置值；foImgCov/fnImgCov 无内置默认
			if (!def) {
				this.pth[v] = this.substituteTf(this[v]); // 自动保存封面：仍按设置值
				return;
			}
			this.pth[v] = this.substituteTf(def);
			// remap 保留原始 tf 形式供流媒体等场景逐项替换，%BIO_* 按用途归一（对内置尾部本就是恒等替换）
			this.remap[v] = v.endsWith('Rev')
				? def.replace(/%BIO_ALBUMARTIST%|%BIO_ARTIST%/gi, '%BIO_ALBUMARTIST%')
				: def.replace(/%BIO_ARTIST%|%BIO_ALBUMARTIST%/gi, '%BIO_ARTIST%');
		});
		// 设置页提示：7 项路径一律显示由根路径派生的当前实际路径（foImgRev 只用 remap，不在 items 里）
		Object.keys(this.defPth).forEach(v => {
			this.dispPth[v] = this.defPthDisp[v];
		});
		// foImgRev 不在 items 里（它没有对应的设置项），但评论图片的下载与读取全走 remap：同样由根路径派生，
		// 漏掉会得到空路径 -> 下载的图片按相对文件名落到脚本目录
		this.remap.foImgRev = this.defPth.foImgRev.replace(/%BIO_ALBUMARTIST%|%BIO_ARTIST%/gi, '%BIO_ALBUMARTIST%');

		if (!this.classicalModeEnable) {
			ppt.classicalMusicMode = false;
			ppt.classicalAlbFallback = false;
		}

		this.suffix = {
			foLfmRev: ' [Lastfm Review]',
			foLfmBio: ' [Lastfm Biography]',
			foWikiRev: ' [Wikipedia Review]',
			foWikiBio: ' [Wikipedia Biography]'
		}

		const needRevSuffix = [...new Set([this.pth.foLfmRev, this.pth.foWikiRev])].length != 2;
		if (!needRevSuffix) {
			this.suffix.foLfmRev = this.suffix.foWikiRev = '';
		}

		const needBioSuffix = [...new Set([this.pth.foLfmBio, this.pth.foWikiBio])].length != 2;
		if (!needBioSuffix) {
			this.suffix.foLfmBio = this.suffix.foWikiBio = '';
		}

		// 封面的循环文件夹不再可自定义：固定为艺术家照片文件夹（菜单>来源>封面>从艺术家照片循环）
		this.albCovFolder = this.substituteTf(this.expandPath(this.autoCache && this.cacheRoot ? this.rootDisp + this.tails.foImgArt : this.cycDefault));

		this.exp = this.exp > 0 ? Math.max(this.exp, 30) : 0; // 0: 禁止自动更新；否则最小 30 天
		this.getLangIndex();
		if (!this.lang.ok) this.language = 'EN';
		this.menuSimilarNum = $.clamp(this.menuSimilarNum, 0, 10);
		this.lfmSim = this.dlLfmSim;
		if (this.lfmSim && this.menuSimilarNum < 7 && (!this.tagEnabled5 || this.tagEnabled8 < 7)) this.lfmSim = false;
		this.photoNum = $.clamp(this.photoNum, 1, 40);
		this.photoLimit = this.photoLimit ? Math.max(this.photoLimit, this.photoNum, this.photoAutoAdd * 5) : 0;
		
		this.fuzzyMatchReview = $.clamp(this.fuzzyMatchReview, 0, 100);
		this.fuzzyMatchTrack = $.clamp(this.fuzzyMatchTrack, 0, 100);
		this.fuzzyMatchComposition = $.clamp(this.fuzzyMatchComposition, 0, 100);
		this.partialMatch = this.partialMatchEnabled + '-' + this.fuzzyMatchReview + '-' + this.fuzzyMatchTrack + '-' + this.fuzzyMatchComposition;
		this.tagEnabled8 = $.clamp(this.tagEnabled8, 1, 6);

		// 群星（合辑）判定表：va 支持多值，用分号或逗号分隔（默认 "Various Artists; 群星"）。
		// 任一值命中即视为合辑标注：不进「更多标签」，Wiki 检索也统一换成 'Various Artists'。
		this.vaList = ('' + (this.va || '')).split(/[;,，；、]/).map(v => v.trim().toLowerCase()).filter(v => v);

		const fields = n => n.replace(/\$.*?\(/gi, '').replace(/(,(|\s+)\d+)/gi, '').replace(/[,()[\]%]/gi, '|').split('|');
		this.albartFields = fields(this.tf.albumArtist).filter(v => v.trim());
		this.artFields = fields(this.tf.artist).filter(v => v.trim());
		this.albFields = fields(this.tf.album).filter(v => v.trim());

		if (this.cusCov) { // custom covers
			this.cusCovPaths = [];
			const nm = this.cusCov0;
			if (nm && nm.length) this.cusCovPaths.push(this.substituteTf(this.expandPath(nm)));
		}
	}

	// 群星（合辑）判定：值命中 va 的任一项（多值，见 parse 里的 vaList）即 true，忽略大小写与首尾空格。
	// 供「更多标签」过滤与 Wiki 检索（命中时按 'Various Artists' 去查）共用。
	isVA(n) {
		if (!n) return false;
		return (this.vaList || []).indexOf(('' + n).trim().toLowerCase()) != -1;
	}

	expandPath(pth) {
		if (/%profile%\\/i.test(pth) && /%storage_folder%\\/i.test(pth)) pth = pth.replace(/%profile%\\/gi, '');
		return pth.replace(/^%profile%\\?/i, $.tfEscape(fb.ProfilePath)).replace(/^%storage_folder%\\?/i, $.tfEscape(cfg.storageFolder));
	}

	preview(n, tfAll, excludeStream, artistView, trackReview) {
		if (!tfAll) return txt.tf(n, artistView, trackReview); // heading
		if (excludeStream) {
			const handle = $.handle(panel.id.focus, true);
			if (!handle) return;
			const covCanBeSaved = !handle.RawPath.startsWith('fy+') && !handle.RawPath.startsWith('3dydfy:') && !handle.RawPath.startsWith('http');
			if (!covCanBeSaved) return '流媒体：未保存封面';
		}
		n = this.expandPath(n);
		const tf = tfAll.split('~#~');
		const tfNames = ['%BIO_ALBUMARTIST%', '%BIO_ARTIST%', '%BIO_ALBUM%', '%BIO_TITLE%'];

		tfNames.forEach((v, i) => n = n.replace(RegExp(v, 'gi'), tf[i]));

		const wildCard = /[*?]/.test(n);
		return !wildCard ? panel.cleanPth(n, false) : panel.cleanPth(n.replace(/\*/g, '@!@').replace(/\?/g, '!@!'), false).replace(/@!@/g, '*').replace(/!@!/g, '?');
	}

	resetCfg() { // 服务器设置被重置：直接删除 server.cfg，下次加载时按默认值重建（不做备份）
		try {
			fso.DeleteFile(this.cfgFile);
		} catch (e) {
			fb.ShowPopupMessage(`无法重置服务器设置。\n\nserver.cfg 正被另一个程序使用。`, '简介');
			return;
		}
		window.Reload();
	}

	setCacheMode() {
		// 缓存模式变化：updateCfg 已重算全部路径，不再整体 Reload（那会使设置对话框的回调失效，对话框被迫关闭）。
		// 只强制刷新当前曲目的文本与图像，让新路径立即生效；其余在下一次曲目 / 刷新事件自然更新。
		txt.rev.amFallback = true;
		txt.rev.wikiFallback = true;
		txt.on_playback_new_track(true);
		img.on_playback_new_track(true);
	}

	setLanguage(i) {
		if (i < this.lang.arr.length) {
			this.lang.ix = i;
			this.language = this.lang.arr[this.lang.ix];
		} else this.toggle('languageFallback');
		txt.bio.subhead = {
			lfm: [this.lfmDisplayName, `${this.lfmDisplayName} ${txt.bio.lang[this.lang.ix]}`],
			wiki: [this.wikiDisplayName, `${this.wikiDisplayName} ${txt.bio.lang[this.lang.ix]}`],
			txt: ['', '']
		}
		txt.rev.subhead = {
			lfm: [this.lfmDisplayName, `${this.lfmDisplayName} ${txt.rev.lang[this.lang.ix]}`],
			wiki: [this.wikiDisplayName, `${this.wikiDisplayName} ${txt.rev.lang[this.lang.ix]}`],
			txt: ['', '']
		}
		txt.artistReset(true);
		txt.albumReset(true);
		txt.albumFlush();
		txt.artistFlush();
		txt.rev.cur = -1;
		txt.bio.cur = -1;
		
		txt.bio.loaded = {
			lfm: false,
			wiki: false,
			txt: false,
			ix: -1
		}
		txt.rev.loaded = {
			lfm: false,
			wiki: false,
			txt: false,
			ix: -1
		}
		
		txt.loadReader();
		txt.getText(true);
		but.createStars();
		txt.getSubHeadWidths();
		txt.artCalc();
		txt.albCalc();
		server.setLanguage(this.language);
		panel.callServer(2, panel.id.focus, '', 1);
	}

	setTag(i, handles) {
		switch (true) {
			case i && i < 9:
				this.toggle(`tagEnabled${i - 1}`);
				break;
			case i == 9: {
				const cur = $.jsonParse(ppt.get('Biography Dialog Box'), {});
				ppt.set('Biography Dialog Box', JSON.stringify({
					w: cur.w,
					h: cur.h,
					def_w: 85,
					def_h: 60,
					tab: 'ServerCfg',
					panelPage: cur.panelPage,
					serverPage: 'tagger'
				}));
				this.open();
				break;
			}
			case i == 10: {
				if (!this.taggerConfirm) {
					if (this.tagEnabled5 && this.tagEnabled8 < 7) tag.check(handles);
					else tag.write(handles);
					break;
				}
				const continue_confirmation = (status, confirmed) => {
					if (confirmed) {
						if (this.tagEnabled5 && this.tagEnabled8 < 7) tag.check(handles);
						else tag.write(handles);
					}
				}
				const caption = '写入文件标签：';
				const prompt = handles.Count < 2000 ? `更新 ${handles.Count} 首音轨。\n\n继续？` : `更新 ${handles.Count} 首音轨。\n\n提示：此操作会分析大量数据。\n\n继续？`;
				const wsh = popUpBox.confirm(caption, prompt, '确定', '取消', '', '', continue_confirmation);
				if (wsh) continue_confirmation('ok', $.wshPopup(prompt, caption));
				break;
			}
		}
	}

	updateCfg(new_cfg) {
		this.beginBatch();
		try {
			this.settingsKeys.forEach(v => cfg[v] = this.cfg[v] = new_cfg[v + '_internal'].value);
			tag.setGenres();
			this.parse();
		} finally {
			this.endBatch();
		}
	}
}
const cfg = new Settings();

let settings = [
	['Album Review [Lastfm] Auto-Download', false, 'boolean', 'dlLfmRev'],
	['Biography [Lastfm] Auto-Download', true, 'boolean', 'dlLfmBio'],
	['Album Review [Wikipedia] Auto-Download', false, 'boolean', 'dlWikiRev'],
	['Biography [Wikipedia] Auto-Download', false, 'boolean', 'dlWikiBio'],
	['Image [Artist] Auto-Download', true, 'boolean', 'dlArtImg'],
	['Image [Review] Auto-Download', true, 'boolean', 'dlRevImg'],
	['Save List 0-Never 1-Auto', true, 'boolean', 'dlLfmSim'],

	['%BIO_ALBUMARTIST%', '$if3($meta(album artist,0),$meta(artist,0),$meta(composer,0),$meta(performer,0))', 'text', 'tfAlbumArtist'],
	['%BIO_ARTIST%', '$if3($meta(artist,0),$meta(album artist,0),$meta(composer,0),$meta(performer,0))', 'text', 'tfArtist'],
	['%BIO_ALBUM%', '$meta(album,0)', 'text', 'tfAlbum'],
	['%BIO_TITLE%', '$meta(title,0)', 'text', 'tfTitle'],
	['%BIO_COMPOSITION%', '$if2($meta(work,0),$meta(group,0))', 'text', 'tfComposition'],

	['Classical Music Mode Enable', false, 'boolean', 'classicalModeEnable'],

	['Lastfm & Wikipedia Language', 'ZH', 'text', 'language'],
	['Lastfm & Wikipedia Language Fallback To English', false, 'boolean', 'languageFallback'],
	['Wikipedia English Genres', true, 'boolean', 'wikipediaEnGenres'],

	['Cache Root', '', 'text', 'cacheRoot'],
	['Auto Cache', 0, 'num', 'autoCache'], // 0 = 默认（内置缓存目录），1 = 自定义

	['Image [Artist] Initial Download Number (1-20)', 5, 'num', 'photoNum'],
	['Image [Artist] Auto-Add New', true, 'boolean', 'photoAutoAdd'],
	['Image [Artist] Cache Limit', 0, 'num', 'photoLimit'],

	['Auto-Save', false, 'boolean',  'dlLfmCov'],
	['Auto-Save Folder', '$directory_path(%path%)', 'text', 'foImgCov'],
	['Auto-Save File Name', 'cover', 'text', 'fnImgCov'],

	['Album Name Auto-Clean', false, 'boolean', 'albStrip'],
	['Auto-Update Interval (days: min 30, 0 disables auto-update)', 0, 'num', 'exp'],

	['Review Image Quality 0-Medium 1-High', true, 'boolean', 'imgRevHQ'],
	['Search: Include Partial Matches', true, 'boolean',  'partialMatchEnabled'],
	['Search: Fuzzy Match Level Review', 80, 'num',  'fuzzyMatchReview'],
	['Search: Fuzzy Match Level Track', 80, 'num',  'fuzzyMatchTrack'],
	['Search: Fuzzy Match Level Composition', 66, 'num',  'fuzzyMatchComposition'],
	['Similar Artists: Number to Display(0-10)', 6, 'num', 'menuSimilarNum'],
	['Various Artists', 'Various Artists; 群星', 'text', 'va'],

	['Write Tag: Album Genre Last.fm', true, 'boolean', 'tagEnabled0'],
	['Write Tag: Album Statistics Last.fm', false, 'boolean', 'tagEnabled1'],
	['Write Tag: Artist Genre Last.fm', true, 'boolean', 'tagEnabled2'],
	['Write Tag: Artist Statistics Last.fm', false, 'boolean', 'tagEnabled3'],
	['Write Tag: Locale Last.fm', true, 'boolean', 'tagEnabled4'],
	['Write Tag: Similar Artists Last.fm', false, 'boolean', 'tagEnabled5'],
	['Write Tag: Album Genre Wikipedia', true, 'boolean', 'tagEnabled6'],
	['Write Tag: Artist Genre Wikipedia', true, 'boolean', 'tagEnabled7'],
	['Write Tag: Similar Artists Last.fm: Number to Write (0-100)', 5, 'num', 'tagEnabled8'],

	['Tag Name: Album Genre Last.fm', 'Album Genre Last.fm', 'text', 'tagName0'],
	['Tag Name: Album Statistics Last.fm', 'Album Statistics Last.fm', 'text', 'tagName1'],
	['Tag Name: Artist Genre Last.fm', 'Artist Genre Last.fm', 'text', 'tagName2'],
	['Tag Name: Artist Statistics Last.fm', 'Artist Statistics Last.fm', 'text', 'tagName3'],
	['Tag Name: Locale Last.fm', 'Locale Last.fm', 'text', 'tagName4'],
	['Tag Name: Similar Artists Last.fm', 'Similar Artists Last.fm', 'text', 'tagName5'],

	['Tag Name: Album Genre Wikipedia', 'Album Genre Wikipedia', 'text', 'tagName6'],
	['Tag Name: Artist Genre Wikipedia', 'Artist Genre Wikipedia', 'text', 'tagName7'],

	['Tagger Show Confirm PopUp Box', true, 'boolean', 'taggerConfirm'],
	['Tagger Last.fm Genre Use Whitelist', 1, 'num', 'useWhitelist'],
	['Tagger Last.fm Genre Custom Genres', '', 'text', 'customGenres'],
	['Tagger Last.fm Genre Translate', 'alt country>alternative country, canterbury>canterbury scene, chanson francaise>chanson fran\u00e7aise, christmas>christmas music, christmas songs>christmas music, eletronica>electronica, motown soul>motown, musicals>musical, neoclassical>neoclassicism, orchestra>orchestral, popular>pop, prog>progressive, rnb>r&b, rhythm and blues>r&b, rb>r&b, relaxing>relaxation, relax>relaxation, rock & roll>rock and roll, rock n roll>rock and roll, tropicalia>tropic\u00e1lia, xmas>christmas music, ye ye>y\u00e9-y\u00e9', 'text', 'translate'],

	['Image [Cover] Check Custom Paths', false, 'boolean', 'cusCov'],
	['Image [Cover] Custom Path [Full Path Minus Extension]', '', 'text', 'cusCov0'],

	['Show console messages', true, 'boolean', 'showConsoleMessages']
];

let item_properties =

`{
	"*****帮助*****": [
		"将 show 设置为 false 以隐藏组",
		"可以编辑除常规*、元数据*和其它*之外的所有组，即添加、删除或更改属性（保留属性键）",
		"可以删除或移动所有组",
		"可以添加新组",
		"可以更改组名称，但自动扩展的组名称*除外",
		"如果进行编辑，请保持常规格式。如果无法解析文件，则不会显示项目属性，并且控制台将报告 “项目属性：无效的 JSON”",
		"可以使用在线 JSON 验证器检查完整性并定位错误",
		"保存文件名必须包含用于识别的 item_properties，例如 my_item_properties 可以使用",
		"如果需要，请在末尾调整大写字母列表（|分隔符：全词匹配；适用于自动扩展的名称）"
	],
	"showEmpty": false,
	"元数据": {
		"show": true,
		"properties": [
			{"name": "艺术家", "titleformat": "[$meta(artist)]"},
			{"name": "标题", "titleformat": "[$meta(title)]"},
			{"name": "专辑", "titleformat": "[$meta(album)]"},
			{"name": "日期", "titleformat": "[%date%]"},
			{"name": "流派", "titleformat": "[%genre%]"},
			{"name": "音轨号", "titleformat": "[%tracknumber%]"},
			{"name": "作曲", "titleformat": "[%composer%]"},
			{"name": "表演者", "titleformat": "[%performer%]"},
			{"name": "专辑艺术家", "titleformat": "[$meta(album artist)]"},
			{"name": "合计音轨", "titleformat": "[%totaltracks%]"},
			{"name": "碟片编号", "titleformat": "[$if2($meta(discnumber),$meta(disc))]"},
			{"name": "合计碟片", "titleformat": "[%totaldiscs%]"},
			{"name": "注释", "titleformat": "[%comment%]"}
		]
	},
	"元数据*": {
		"show": false,
		"properties": [
			"此组项目不可配置：项目自动扩展。它只能通过设置为 false 来删除、移动或隐藏。不要更改组名称。",
			"用于替代分组（an alternative grouping）。它将按字母顺序显示所有元数据，而不是默认使用的分组。",
			"要使用，将 show 设置为 true。如果使用，最好将上述元数据，Popularity，Last.fm 和维基百科组的 show 设置为 false。"
		]
	},
	"人气": {
		"show": true,
		"properties": [
			{"name": "艺术家", "titleformat": "[$meta(artist statistics last.fm,5[score])]"},
			{"name": "专辑", "titleformat": "[$meta(album statistics last.fm,5[score])]"},
			{"name": "单曲", "titleformat": "[$meta(track statistics last.fm,5[score])]"}
		]
	},
	"Last.fm": {
		"show": true,
		"properties": [
			{"name": "艺术家流派", "titleformat": "[%artist genre last.fm%]"},
			{"name": "专辑流派", "titleformat": "[%album genre last.fm%]"},
			{"name": "区域", "titleformat": "[%locale last.fm%]"},
			{"name": "相似艺术家", "titleformat": "[%similar artists last.fm%]"}
		]
	},
	"维基百科": {
		"show": true,
		"properties": [
			{"name": "艺术家流派", "titleformat": "[%artist genre wikipedia%]"},
			{"name": "专辑流派", "titleformat": "[%album genre wikipedia%]"}
		]
	},
	"YouTube": {
		"show": true,
		"properties": [
			{"name": "Channel title", "titleformat": "[%fy_channel_title%]"},
			{"name": "Channel url", "titleformat": "[%fy_channel_url%]"},
			{"name": "Description", "titleformat": "[%fy_description%]"},
			{"name": "Like count", "titleformat": "[%fy_like_count%]"},
			{"name": "Dislike count", "titleformat": "[%fy_dislike_count%]"},
			{"name": "Search title", "titleformat": "[%search_title%]"},
			{"name": "Thumbnail url", "titleformat": "[%fy_thumbnail_url%]"},
			{"name": "Title", "titleformat": "[%fy_title%]"},
			{"name": "Upload date", "titleformat": "[%fy_upload_date%]"},
			{"name": "View count", "titleformat": "[%fy_view_count%]"}
		]
	},
	"播放统计信息": {
		"show": true,
		"properties": [
			{"name": "播放次数", "titleformat": "[%play_count%]"},
			{"name": "首次播放", "titleformat": "[%first_played%]"},
			{"name": "最近播放", "titleformat": "[%last_played%]"},
			{"name": "添加时间", "titleformat": "[%added%]"},
			{"name": "等级", "titleformat": "[$if3(%_Autorating%,%rating%,$meta(rating))]"}
		]
	},
	"位置": {
	"show": true,
		"properties": [
			{"name": "文件名", "titleformat": "[%filename_ext%]"},
			{"name": "文件夹名", "titleformat": "[$directory_path(%path%)]"},
			{"name": "文件路径", "titleformat": "[%path%]"},
			{"name": "子曲目索引", "titleformat": "[%subsong%]"},
			{"name": "文件大小", "titleformat": "[%filesize_natural%]"},
			{"name": "修改时间", "titleformat": "[%last_modified%]"},
			{"name": "创建时间", "titleformat": "[%file_created%]"}
		]
	},
	"常规*": {
		"show": true,
		"properties": ["此组项目不可配置：项目自动扩展。它只能通过设置为 false 来删除、移动或隐藏。不要更改组名称。"]
	},
	"播放增益": {
		"show": true,
		"properties": [
			{"name": "音轨增益", "titleformat": "[%replaygain_track_gain%]"},
			{"name": "音轨峰值", "titleformat": "[%replaygain_track_peak%]"},
			{"name": "专辑增益", "titleformat": "[%replaygain_album_gain%]"},
			{"name": "专辑峰值", "titleformat": "[%replaygain_album_peak%]"}
		]
	},
	"其它*": {
		"show": true,
		"properties": ["此组项目不可配置：项目自动扩展。它只能通过设置为 false 来删除、移动或隐藏。不要更改组名称。"]
	},
	"uppercase": "ANV|MB"
}`

let nowplaying = `艺术家: %BIO_ARTIST%$crlf()
$crlf()
标题: %BIO_TITLE%$crlf()
$crlf()
[专辑: %BIO_ALBUM%$crlf()
$crlf()]
$if2(%playback_time%,0:00)[ / %length%]`;

cfg.init(settings);
settings = undefined;
item_properties = undefined;
nowplaying = undefined;