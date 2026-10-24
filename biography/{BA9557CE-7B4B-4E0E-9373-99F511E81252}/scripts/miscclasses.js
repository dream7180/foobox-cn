'use strict';
//class includes names, popupbox, Library, timers
class Names {
	constructor() {
		this.cur_artist = '';
		this.lfmUID = '_[a-f0-9]{32}\\.jpg$';
	}

	// Methods

	alb(focus) {
		return $.eval('[$trim(' + cfg.tf.album + ')]', focus);
	}

	albID(focus, n) {
		if (!this.alb(focus)) return $.eval(cfg.tf.artist + cfg.tf.albumArtist + '%path%', focus);
		else switch (n) {
			case 'simple':
				return $.eval(cfg.tf.artist + cfg.tf.albumArtist + cfg.tf.album, focus);
			case 'stnd':
				return $.eval(cfg.tf.albumArtist + cfg.tf.album + '%discnumber%%date%', focus);
			case 'full':
				return $.eval(cfg.tf.artist + cfg.tf.albumArtist + cfg.tf.album + '%discnumber%%date%', focus);
		}
	}

	albm(focus, ignoreLock) {
		return this.albumTidy($.eval('[' + cfg.tf.album + ']', focus, ignoreLock));
	}

	album(focus, ignoreLock) {
		if (!cfg.albStrip) return this.albm(focus);
		return this.albumClean($.eval('[' + cfg.tf.album + ']', focus, ignoreLock));

	}

	albumArtist(focus, ignoreLock) {
		let albumArtist = $.eval('[$trim(' + cfg.tf.albumArtist + ')]', focus, ignoreLock);
		return albumArtist;
	}

	albumClean(n) {
		return n.replace(/CD(\s*\d|\.0\d)|CD\s*(One|Two|Three)|Dis(c|k)\s*\d|Dis(c|k)\s*(III|II|I|One|Two|Three)\b|(Bonus\s*Track|Collector's|(Digital\s*|Super\s*|)Deluxe|Digital|Expanded|Limited|Platinum|Reissue|Special)\s*(Edition|Version)|(Bonus\s*(CD|Disc))|\d\d\w\w\s*Anniversary\s*(Expanded\s*|Re(-|)master\s*|)(Edition|Re(-|)master|Version)|((19|20)\d\d(\s*|\s*-\s*)|)(Digital(ly|)\s*|)(Re(-|)master(ed|)|Re(-|)recorded)(\s*Edition|\s*Version|)|\(Deluxe\)|\(Mono\)|\(Reissue\)|\(Revisited\)|\(Stereo\)|\(Web\)|\[Deluxe\]|\[Mono\]|\[Reissue\]|\[Revisited\]|\[Stereo\]|\[Web\]/gi, '').replace(/\(\s*\)|\[\s*\]/g, ' ').replace(/\s\s+/g, ' ').replace(/-\s*$/g, ' ').trim();
	}

	albumTidy(n) {
		return n.replace(/CD(\s*\d|\.0\d)|CD\s*(One|Two|Three)|Dis(c|k)\s*\d|Dis(c|k)\s*(III|II|I|One|Two|Three)\b/gi, '').replace(/\(\s*\)|\[\s*\]/g, ' ').replace(/\s\s+/g, ' ').replace(/-\s*$/g, ' ').trim();
	}

	artist(focus, ignoreLock) {
		let artist = $.eval('[$trim(' + cfg.tf.artist + ')]', focus, ignoreLock);
		return artist;
	}

	composition(focus, ignoreLock) {
		return $.eval('[' + cfg.tf.composition + ']', focus, ignoreLock);
	}

	isLfmImg(fn, artist) {
		if (artist) {
			if (artist != this.cur_artist) {
				artist = $.regexEscape($.clean(artist));
				this.cur_artist = artist;
			}
			return RegExp(`^${artist + this.lfmUID}`, 'i').test(fn);
		} else return RegExp(this.lfmUID, 'i').test(fn);
	}

	title(focus, ignoreLock) {
		let title = $.eval('[$trim(' + cfg.tf.title + ')]', focus, ignoreLock);
		return title;
	}

	trackID(focus) {
		return $.eval(cfg.tf.artist + cfg.tf.title, focus);
	}
}

class Library {
	constructor() {
		this.db_lib;
		this.update = true;
	}

	// Methods

	getLibItems() {
		if (!this.update) return this.db_lib;
		this.update = false;
		this.db_lib = fb.GetLibraryItems();
		return this.db_lib;
	}

	inLibrary(type, a, l) {
		if (a) a = a.toLowerCase();
		if (l) l = l.toLowerCase();
		switch (type) {
			case 1: {
				let q = '';
				let ql = '';
				cfg.albartFields.forEach((v, i) => q += (i ? ' OR ' : '') + v + ' IS ' + a);
				cfg.albFields.forEach((v, i) => ql += (i ? ' OR ' : '') + v + ' IS ' + l);
				const items = $.query(this.getLibItems(), '(' + q + ') AND (' + ql + ')');
				if (!items.Count) return false;
				return items.Count;
			}
			case 2: {
				const q = '(' + '"' + cfg.tf.albumArtist + '"' + ' IS ' + a + ') AND ((' + '"' + cfg.tf.album + '"' + ' IS ' + l + ') OR (' + '"' + '$trim($replace($replace(' + cfg.tf.album + ",CD1,,CD2,,CD3,,CD 1,,CD 2,,CD 3,,CD.01,,CD.02,,CD.03,,CD One,,CD Two,,CD Three,,Disc1,,Disc2,,Disc3,,Disc 1,,Disc 2,,Disc 3,,Disc One,,Disc Two,,Disc Three,,Disc I,,Disc II,,Disc III,,'()',,'[]',),  , ,'()',,'[]',))" + '"' + ' IS ' + l + '))';
				const items = $.query(this.getLibItems(), q);
				if (!items.Count) return false;
				return items[0];
			}
			default: {
				let q = '';
				cfg.artFields.forEach((v, i) => q += (i ? ' OR ' : '') + v + ' IS ' + a);
				const items = $.query(this.getLibItems(), q);
				if (!items.Count) return false;
				return !type ? true : items[0];
			}
		}
	}
}

class Timers {
	constructor() {
		['dl', 'img', 'lyrics', 'sim1', 'sim2', 'source', 'transition', 'tt', 'zSearch'].forEach(v => this[v] = {
			id: null
		});

		this.times = [1000, 1000, 1000, 1000, 2000, 4000, 5000, 6000, 7000];
	}

	// Methods

	clear(timer) {
		if (timer) clearTimeout(timer.id);
		timer.id = null;
	}

	decelerating(p_force) {
		let counter = 0;
		this.clear(this.dl);
		const func = () => {
			this.res(p_force);
			counter++;
			if (counter < this.times.length) timer_dl();
			else this.clear(this.dl);
		}
		const timer_dl = () => {
			this.dl.id = setTimeout(func, this.times[counter]);
		}
		timer_dl();
	}
	
	image() {
		if (!$.server) return;
		this.clear(this.img);
		this.img.id = setInterval(() => {
			img.fresh();
			men.fresh();
			window.NotifyOthers('bio_imgChange', 0);
		}, 1000);
	}

	res(force) {
		window.NotifyOthers('bio_getImg', force);
		if ($.server) img.grab(force);
	}
	
	tooltip() {
		this.clear(this.tt);
		this.tt.id = setTimeout(() => {
			txt.deactivateTooltip();
			this.tt.id = null;
		}, 5000);
	}
}

class PopUpBox {
	constructor() {
		this.getHtmlCode();
		this.ok = true;
		this.soFeat = {clipboard: true, gecko: true}
	}

	// Methods

	confirm(msg_title, msg_content, btn_yes_label, btn_no_label, height_adjust, h_center, confirm_callback) {
		utils.ShowHtmlDialog(0, this.confirmHtmlCode, {
			data: [msg_title, msg_content, btn_yes_label, btn_no_label, height_adjust, h_center, confirm_callback]
		});
	}

	getHtmlCode() {
		//let cssPath = `${my_utils.packagePath}/assets/html/`;
		//if (this.getWindowsVersion() === '6.1') {
		//	cssPath += 'styles7.css';
		//} else {
		//	cssPath += 'styles10.css';
		//}
		let cssPath = `${my_utils.packagePath}/assets/html/styles.css`;
		const dpiFontScript = this.getDpiFontScript();
		this.configHtmlCode = my_utils.getAsset('\\html\\config.html').replace(/href="styles.css"/i, `href="${cssPath}"`).replace(/<\/head>/i, dpiFontScript + '</head>');
		this.inputHtmlCode = my_utils.getAsset('\\html\\input.html').replace(/href="styles.css"/i, `href="${cssPath}"`).replace(/<\/head>/i, dpiFontScript + '</head>');
		this.confirmHtmlCode = my_utils.getAsset('\\html\\confirm.html').replace(/href="styles.css"/i, `href="${cssPath}"`).replace(/<\/head>/i, dpiFontScript + '</head>');
	}

	// Embedded MSHTML (IE=edge) renders explicit px sizes at 96dpi without DPI
	// scaling, so the dialog font size must be pre-multiplied by the system DPI
	// scale. JSplitter exposes window.DPI in the panel context (96 = 100%), so we
	// compute the final size here and inject it into the dialog HTML as a constant.
	// Note: DPI is read at panel init; if the window is later moved to a monitor
	// with different scaling, dialogs keep the init-time size until panel reload.
	// FONT_BASE: px at 96dpi (equivalent to the old probe constant: 0.5 x ~17px
	// caption line height). Increase/decrease to adjust the overall dialog font.
	getDpiFontScript() {
		let dpi = 96;
		try {
			if (typeof window.DPI === 'number' && window.DPI > 0) dpi = window.DPI;
		} catch (e) {}
		// Some forks report a scale multiplier (1.0/1.25/1.5) instead of 96-based DPI
		const scale = dpi < 10 ? dpi : dpi / 96;
		const FONT_BASE = 12;
		const fontSize = Math.round(FONT_BASE * scale);
		return `<script>(function(){var fs=${fontSize};function addStyle(f){try{var st=document.createElement('style');var rule='body,input,label,button,textarea,select,.container{font-size:'+f+'px !important;}';if(st.styleSheet){st.styleSheet.cssText=rule;}else{st.appendChild(document.createTextNode(rule));}document.getElementsByTagName('head')[0].appendChild(st);}catch(e){}}addStyle(fs);})();</script>`;
	}
	/*
	getWindowsVersion() {
		let version = '';

		try {
			version = (WshShell.RegRead('HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\CurrentMajorVersionNumber')).toString();
			version += '.';
			version += (WshShell.RegRead('HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\CurrentMinorVersionNumber')).toString();
			return version;
		} catch (e) {}
		try {
			version = WshShell.RegRead('HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\CurrentVersion');
			return version;
		} catch (e) {}
		return '6.1';
	}
	*/
	config(ppt, cfg, dialogWindow, ok_callback, lang, recycler) {
		utils.ShowHtmlDialog(0, this.configHtmlCode, {
			data: [ppt, cfg, dialogWindow, window.IsTransparent, ok_callback, this.tf_callback, lang, recycler],
			resizable: true
		});
	}

	input(title, msg, ok_callback, input, def) {
		utils.ShowHtmlDialog(0, this.inputHtmlCode, {
			data: [title, msg, '取消', ok_callback, input, def]
		});
	}
	
	isHtmlDialogSupported() {
		if (ppt.isHtmlDialogSupported != 2) return ppt.isHtmlDialogSupported;

		if (typeof doc === 'undefined' || !doc) {
			this.soFeat.gecko = false;
		}
		if (this.soFeat.gecko) {
			let cache = null;
			let clText = 'test';
			try {
				cache = doc.parentWindow.clipboardData.getData('Text');
			} catch (e) {}
			try {
				doc.parentWindow.clipboardData.setData('Text', clText); 
				clText = doc.parentWindow.clipboardData.getData('Text');
			} catch (e) {
				this.soFeat.clipboard = false;
			}
			if (cache) { // Just in case previous clipboard data is needed
				try {
					doc.parentWindow.clipboardData.setData('Text', cache);
				} catch (e) {}
			} 
			if (clText !== 'test') {
				this.soFeat.clipboard = false;
			}
		} else {
			this.soFeat.clipboard = false;
		}

		ppt.isHtmlDialogSupported = this.soFeat.gecko && this.soFeat.clipboard || this.isIEInstalled() ? 1 : 0;
		if (!ppt.isHtmlDialogSupported) {
		const caption = '显示 HTML 对话框';
			const prompt = 
`功能检查表明，当前操作系统不支持 Spider Monkey Panel 显示 Html 对话框。

这用于显示选项。关闭此对话框时，控制台将显示替代方案。

有时，功能检查可能会给出错误的答案。

如果你使用的是 Windows 系统，并且支持 Internet Explorer，应该可以工作，请输入 1，然后点击确定。

该设置将作为第一项保存在面板属性中，以后可以在那里进行更改。

支持-1；不支持-0`;
			let ns = '';
			let status = 'ok'
			try {
				ns = utils.InputBox(0, prompt, caption, ppt.isHtmlDialogSupported, true);
			} catch(e) {
				status = 'cancel';
			}
			if (status != 'cancel') {
				ppt.isHtmlDialogSupported = ns == 0 ? 0 : 1;
			}
		}
		return ppt.isHtmlDialogSupported;
	}

	isIEInstalled() {
		const diskLetters = Array.from(Array(26)).map((e, i) => i + 65).map((x) => `${String.fromCharCode(x)}:\\`);
		const paths = ['Program Files\\Internet Explorer\\ieinstal.exe', 'Program Files (x86)\\Internet Explorer\\ieinstal.exe'];
		return diskLetters.some(d => {
			try { // Needed when permission error occurs and current SMP implementation is broken for some devices....
				return utils.IsDirectory(d) ? paths.some(p => utils.IsFile(d + p)) : false;
			} catch (e) {return false;}
		});
	}

	tf_callback(tf, tfAll, type, sFind, sReplace) {
		return cfg.preview(tf, tfAll, type, sFind, sReplace);
	}
}