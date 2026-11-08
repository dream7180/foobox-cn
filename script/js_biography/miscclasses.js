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
		['dl', 'img', 'lyrics', 'sim1', 'sim2', 'size', 'source', 'transition', 'tt', 'zSearch'].forEach(v => this[v] = {
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
		this.clear(this.img);
		this.img.id = setInterval(() => {
			img.fresh();
			men.fresh();
		}, 2000);
	}

	res(force) {
		img.grab(force);
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
	}

	// Methods

	confirm(msg_title, msg_content, btn_yes_label, btn_no_label, height_adjust, h_center, confirm_callback) {
		utils.ShowHtmlDialog(0, this.confirmHtmlCode, {
			data: [msg_title, msg_content, btn_yes_label, btn_no_label, height_adjust, h_center, confirm_callback]
		});
	}

	getHtmlCode() {
		let cssPath = `file://${fb.ProfilePath}foobox/js_biography/html/styles.css`;
		const dpiFontScript = this.getDpiFontScript();
		this.configHtmlCode = utils.ReadTextFile(fb.ProfilePath + 'foobox\\js_biography\\html\\config.html').replace(/href="styles.css"/i, `href="${cssPath}"`).replace(/<\/head>/i, dpiFontScript + '</head>');
		this.inputHtmlCode = utils.ReadTextFile(fb.ProfilePath + 'foobox\\js_biography\\html\\input.html').replace(/href="styles.css"/i, `href="${cssPath}"`).replace(/<\/head>/i, dpiFontScript + '</head>');
		this.confirmHtmlCode = utils.ReadTextFile(fb.ProfilePath + 'foobox\\js_biography\\html\\confirm.html').replace(/href="styles.css"/i, `href="${cssPath}"`).replace(/<\/head>/i, dpiFontScript + '</head>');
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
	
	tf_callback(tf, tfAll, type, artistView, trackReview) {
		return cfg.preview(tf, tfAll, type, artistView, trackReview);
	}
}