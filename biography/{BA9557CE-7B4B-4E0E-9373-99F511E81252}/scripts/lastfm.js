'use strict';

class DldLastfmBio {
	constructor(state_callback) {
		this.artist;
		this.con = '';
		this.counts = ['', ''];
		this.fo_bio;
		this.func = null;
		this.itemDate = '';
		this.itemValue = ['', '', ''];
		this.pop = '';
		this.pth_bio;
		this.ready_callback = state_callback;
		this.retry = false;
		this.scrobbles = ['', ''];
		this.searchBio = 0;
		this.simArtists = [];
		this.tags = [];
		this.timer = null;
		this.topAlbums = [];
		this.topTracks = [];
		this.xmlhttp = null;
	}

	onStateChange() {
		if (this.xmlhttp != null && this.func != null)
			if (this.xmlhttp.readyState == 4) {
				clearTimeout(this.timer);
				this.timer = null;
				if (this.xmlhttp.status == 200) this.func();
				else {
					if (this.searchBio < 2 || this.searchBio == 2 && this.itemValue[0]) {
						this.searchBio++;
						this.search(this.artist, this.fo_bio, this.pth_bio);
					}
					if (this.searchBio == 3) this.func(true);
				}
			}
	}

	search(p_artist, p_fo_bio, p_pth_bio, force) {
		this.artist = p_artist;
		this.fo_bio = p_fo_bio;
		this.pth_bio = p_pth_bio;
		this.func = null;
		this.xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
		const URL = this.searchBio == 3 ? 'https://' + server.lfm.server + '/music/' + encodeURIComponent(this.artist) + '/' + encodeURIComponent(this.itemValue[0]) : this.searchBio == 2 ? 'https://www.last.fm/music/' + encodeURIComponent(this.artist) + '/+albums' : 'https://' + (!this.retry ? server.lfm.server : 'www.last.fm') + '/music/' + encodeURIComponent(this.artist) + (this.searchBio ? '/+wiki' : '');
		this.func = this.analyse;
		if (ppt.multiServer && !force && server.urlDone(md5.hashStr(this.artist + this.pth_bio + URL))) return;
		try{
			this.xmlhttp.open('GET', URL);
			this.xmlhttp.onreadystatechange = this.ready_callback;
			if (force) this.xmlhttp.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
			if (!this.timer) {
				const a = this.xmlhttp;
				this.timer = setTimeout(() => {
					a.abort();
					this.timer = null;
				}, 30000);
			}
			this.xmlhttp.send();
		}catch(e){}
	}

	analyse(saveOnly) {
		const noWiki = n => /wiki|vikimiz|\u0412\u0438\u043A\u0438|\u7EF4\u57FA/i.test(n);
		if (!saveOnly) {
			doc.open();
			const div = doc.createElement('div');
		try{
			div.innerHTML = this.xmlhttp.responseText;
			const r1 = ['Popular this week', 'Beliebt diese Woche', 'Popular esta semana', 'Populaire cette semaine', 'Popolare questa settimana', '\u4eca\u9031\u306e\u4eba\u6c17\u97f3\u697d', 'Popularne w tym tygodniu', 'Mais ouvida na semana', '\u041f\u043e\u043f\u0443\u043b\u044f\u0440\u043d\u043e \u043d\u0430 \u044d\u0442\u043e\u0439 \u043d\u0435\u0434\u0435\u043b\u0435', 'Popul\u00e4rt denna vecka', 'Bu hafta pop\u00fcler olanlar', '\u672c\u5468\u70ed\u95e8'];
			const r2 = ['Popular Now', 'Beliebt Jetzt', 'Popular Ahora', 'Populaire Maintenant', 'Popolare Ora', '\u4eca\u4eba\u6c17', 'Popularne Teraz', 'Popular Agora', '\u041f\u043e\u043f\u0443\u043b\u044f\u0440\u043d\u044b\u0435 \u0441\u0435\u0439\u0447\u0430\u0441', 'Popul\u00e4r Nu', '\u015eimdi Pop\u00fcler', '\u70ed\u95e8 \u73b0\u5728'];
			const topAlb = ['Top Albums: ', 'Top-Alben: ', '\u00c1lbumes M\u00e1s Escuchados: ', 'Top Albums: ', 'Album Pi\u00f9 Ascoltati: ', '\u4eba\u6c17\u30a2\u30eb\u30d0\u30e0: ', 'Najpopularniejsze Albumy: ', '\u00c1lbuns Principais: ', '\u041f\u043e\u043f\u0443\u043b\u044f\u0440\u043d\u044b\u0435 \u0430\u043b\u044c\u0431\u043e\u043c\u044b: ', 'Toppalbum: ', 'En Sevilen Alb\u00fcmler: ', '\u6700\u4f73\u4e13\u8f91: '];
			const topTracks = ['Top Tracks: ', 'Top-Titel: ', 'Temas m\u00e1s escuchados: ', 'Top titres: ', 'Brani pi\u00f9 ascoltati: ', '\u4eba\u6c17\u30c8\u30e9\u30c3\u30af: ', 'Najpopularniejsze utwory: ', 'Faixas principais: ', '\u041b\u0443\u0447\u0448\u0438\u0435 \u043a\u043e\u043c\u043f\u043e\u0437\u0438\u0446\u0438\u0438: ', 'Toppl\u00e5tar: ', 'Pop\u00fcler Par\u00e7alar: ', '\u6700\u4f73\u5355\u66f2: ']
			let i = 0;
			switch (this.searchBio) {
				case 0: {
					const h3 = div.getElementsByTagName('h3');
					const h4 = div.getElementsByTagName('h4');
					const itemName = ['', ''];
					let j = 0;
					$.htmlParse(div.getElementsByTagName('li'), 'className', 'tag', v => this.tags.push($.titlecase(v.innerText.trim()).replace(/\bAor\b/g, 'AOR').replace(/\bDj\b/g, 'DJ').replace(/\bFc\b/g, 'FC').replace(/\bIdm\b/g, 'IDM').replace(/\bNwobhm\b/g, 'NWOBHM').replace(/\bR&b\b/g, 'R&B').replace(/\bRnb\b/g, 'RnB').replace(/\bUsa\b/g, 'USA').replace(/\bUs\b/g, 'US').replace(/\bUk\b/g, 'UK')));
					$.htmlParse(h4, 'className', 'artist-header-featured-items-item-header', v => {
						itemName[j] = v.innerText.trim();
						j++;
					});
					j = 0;
					$.htmlParse(h3, 'className', 'artist-header-featured-items-item-name', v => {
						this.itemValue[j] = v.innerText.trim();
						j++;
					});
					j = 0;
					$.htmlParse(div.getElementsByTagName('p'), 'className', 'artist-header-featured-items-item-aux-text artist-header-featured-items-item-date', v => {
						this.itemDate = v.innerText.trim();
						return true;
					});
					$.htmlParse(h3, 'className', 'catalogue-overview-similar-artists-full-width-item-name', v => {
						this.simArtists.push($.titlecase(v.innerText.trim()))
					});
					$.htmlParse(h4, 'className', 'header-metadata-tnew-title', v => {
						this.scrobbles[j] = $.titlecase(v.innerText.trim());
						j++;
					});
					j = 0;
					$.htmlParse(div.getElementsByTagName('abbr'), 'className', 'intabbr js-abbreviated-counter', v => {
						this.counts[j] = $.titlecase(v.innerText.trim()) + ' \u200b| ' + v.title.trim();
						j++;
					});
					i = 0;
					$.htmlParse(div.getElementsByTagName('td'), 'className', 'chartlist-name', v => {
						this.topTracks.push($.titlecase(v.innerText.trim()));
						i++;
					});
					this.topTracks = this.topTracks.length ? topTracks[cfg.lang.ix] + this.topTracks.join('\u200b, ') : '';
					this.tags = this.tags.length ? 'Top Tags: ' + this.tags.join('\u200b, ') : '';
					if (this.itemValue[1].length) {
						r1.forEach((v, i) => itemName[1] = itemName[1].replace(RegExp(v, 'i'), r2[i]));
						this.pop = '\r\n\r\n' + itemName[1] + ': ' + this.itemValue[1];
					}
					if (this.itemValue[0].length) {
						if (!this.itemValue[1].length) {
							r1.forEach((v, i) => itemName[0] = itemName[0].replace(RegExp(v, 'i'), r2[i]));
						}
						this.pop += (this.itemValue[1].length ? '; ' : '\r\n\r\n') + $.titlecase(itemName[0]) + ': ' + this.itemValue[0];
					}
					this.simArtists = this.simArtists.length ? server.similar[cfg.lang.ix] + this.simArtists.join('\u200b, ') : '';
					doc.close();
					this.searchBio = 1;
					return this.search(this.artist, this.fo_bio, this.pth_bio);
				}
				case 1: {
					let factbox = '';
					this.con = '';
					$.htmlParse(div.getElementsByTagName('div'), 'className', 'wiki-content', v => {
						this.con = server.format(v.innerHTML);
						return true;
					});
					$.htmlParse(div.getElementsByTagName('li'), 'className', 'factbox-item', v => {
						factbox = '';
						factbox = server.format(v.innerHTML.replace(/<\/H4>/gi, ': ').replace(/\s*<\/LI>\s*/gi, ', ').replace(/\s*Show all members\u2026\s*/gi, '')).replace(/\s+/g, ' ').replace(/,$/, '');
						this.con = txt.add([factbox], this.con);
					});
					doc.close();
					if (!this.retry) {
						this.searchBio = 2;
						return this.search(this.artist, this.fo_bio, this.pth_bio);
					}
					break;
				}
				case 2: {
					const popAlbums = [];
					this.topAlbums = [];
					i = 0;
					$.htmlParse(div.getElementsByTagName('h3'), 'className', 'resource-list--release-list-item-name', v => {
						i < 4 ? popAlbums.push($.titlecase(v.innerText.trim())) : this.topAlbums.push($.titlecase(v.innerText.trim()));
						i++;
						if (i == 10) return true;
					});
					doc.close();
					if (popAlbums.length) {
						const mapAlbums = this.topAlbums.map(v => $.cut(v));
						const match = mapAlbums.includes($.cut(popAlbums[0]));
						if (this.topAlbums.length > 5 && !match) this.topAlbums.splice(5, 0, popAlbums[0]);
						else this.topAlbums = this.topAlbums.concat(popAlbums);
					}
					this.topAlbums = [...new Set(this.topAlbums)];
					this.topAlbums.length = Math.min(6, this.topAlbums.length);
					this.topAlbums = this.topAlbums.length ? topAlb[cfg.lang.ix] + this.topAlbums.join('\u200b, ') : '';
					if (this.itemValue[0]) {
						this.searchBio = 3;
						return this.search(this.artist, this.fo_bio, this.pth_bio);
					}
					break;
				}
				case 3:
					$.htmlParse(div.getElementsByTagName('dd'), 'className', 'catalogue-metadata-description', v => {
						this.itemValue[2] = v.innerText.trim().split(',')[0];
						return true
					});
					doc.close();
					if (this.itemValue[0].length) {
						const item = this.itemDate.length && this.itemValue[2].length && this.itemDate.length != this.itemValue[2].length ? ' (' + this.itemDate + ' - ' + this.itemValue[2] + ')' : this.itemValue[2].length ? ' (' + this.itemValue[2] + ')' : this.itemDate.length ? ' (' + this.itemDate + ')' : '';
						if (item) this.pop += item;
					}
					break;
			}
		} catch (e) {doc.close();}
		}
		if ((!this.con.length || this.con.length < 45 && noWiki(this.con)) && server.langFallback && !this.retry) {
			this.retry = true;
			this.searchBio = 1;
			return this.search(this.artist, this.fo_bio, this.pth_bio);
		}
		if (this.con.length < 45 && noWiki(this.con)) this.con = '';
		this.con = txt.add([this.tags, this.topAlbums, this.topTracks], this.con);
		this.con += this.pop;
		this.con = txt.add([this.simArtists], this.con);
		if (this.scrobbles[1].length && this.counts[1].length || this.scrobbles[0].length && this.counts[0].length) this.con += ('\r\n\r\nLast.fm: ' + (this.counts[1].length ? this.scrobbles[1] + ' ' + this.counts[1] + '; ' : '') + (this.counts[0].length ? this.scrobbles[0] + ' ' + this.counts[0] : ''));
		this.con = this.con.trim();
		if (!this.con.length) {
			$.trace('Last.fm 简介：' + this.artist + '：未找到', true);
			return;
		}
		if (!this.fo_bio) return;
		$.buildPth(this.fo_bio);
		$.save(this.pth_bio, this.con, true);
		server.res();
		panel.getList();
		window.NotifyOthers('bio_getLookUpList', 'bio_getLookUpList');
	}
}

class DldArtImages {
	img_exp(p_dl_ar, imgFolder, ex) {
		const f = imgFolder + 'update.txt';
		const imgExisting = [];
		let allFiles = [];
		if (!$.file(f)) return [cfg.photoNum, 0, allFiles];
		const getNew = Date.now() - $.lastModified(f) > ex;
		if (!getNew) return [0, cfg.photoAutoAdd, allFiles];
		allFiles = utils.Glob(imgFolder + '*');
		let imNo = 0;
		allFiles.forEach(v => {
			if (name.isLfmImg(fso.GetFileName(v), p_dl_ar)) {
				imNo++;
				if (cfg.photoLimit) imgExisting.push({
					p: v,
					m: $.lastModified(v)
				});
			}
		});

		if (cfg.photoLimit) imgExisting.sort((a, b) => a.m - b.m);
		const newImgNo = cfg.photoNum - imNo
		if (newImgNo > 0) return [newImgNo, 0, allFiles];
		else if (!cfg.photoAutoAdd) {
			if (cfg.photoLimit) {
				const remove = imgExisting.length - cfg.photoLimit;
				if (remove > 0) {
					for (let j = 0; j < remove; j++) server.imgToRecycle.push({
						a: p_dl_ar,
						p: imgExisting[j].p
					});
					server.setImgRecycler(true);
				}
			}
			return [0, cfg.photoAutoAdd, allFiles];
		} else return [5, cfg.photoAutoAdd, allFiles, imgExisting];
	}

	run(dl_ar, force, art, p_stndBio, p_supCache) {
		if (!$.file(`${cfg.storageFolder}foo_lastfm_img.vbs`)) return;
		let img_folder = p_stndBio && !panel.isRadio(art.focus) ? panel.cleanPth(cfg.pth.foImgArt, art.focus, 'server') : panel.cleanPth(cfg.remap.foImgArt, art.focus, 'remap', dl_ar, '', 1);
		if (p_supCache && !$.folder(img_folder)) img_folder = panel.cleanPth(cfg.sup.foImgArt, art.focus, 'remap', dl_ar, '', 1);
		const getNo = this.img_exp(dl_ar, img_folder, !force ? server.exp : 0);
		if (!getNo[0]) return;
		const lfm_art = new LfmArtImg(() => lfm_art.onStateChange());
		lfm_art.search(dl_ar, img_folder, getNo[0], getNo[1], getNo[2], getNo[3], force);
	}
}

class LfmArtImg {
	constructor(state_callback) {
		this.allFiles;
		this.autoAdd;
		this.dl_ar;
		this.func = null;
		this.getNo;
		this.imgExisting;
		this.img_folder;
		this.ready_callback = state_callback;
		this.retry = false;
		this.timer = null;
		this.xmlhttp = null;
	}

	onStateChange() {
		if (this.xmlhttp != null && this.func != null)
			if (this.xmlhttp.readyState == 4) {
				clearTimeout(this.timer);
				this.timer = null;
				if (this.xmlhttp.status == 200) this.func();
				else $.trace('Last.fm 艺术家照片：' + this.dl_ar + '：未找到' + ' 错误状态：' + this.xmlhttp.status, true);
			}
	}

	search(p_dl_ar, p_img_folder, p_getNo, p_autoAdd, p_allFiles, p_imgExisting, force) {
		this.dl_ar = p_dl_ar;
		this.img_folder = p_img_folder;
		this.getNo = p_getNo;
		this.autoAdd = p_autoAdd;
		this.allFiles = p_allFiles;
		this.imgExisting = p_imgExisting;
		this.func = null;
		this.xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
		const URL = 'https://' + (!this.retry ? server.lfm.server : 'www.last.fm') + '/music/' + encodeURIComponent(this.dl_ar) + '/+images';
		this.func = this.analyse;
		if (ppt.multiServer && !force && server.urlDone(md5.hashStr(this.dl_ar + this.getNo + this.autoAdd + this.img_folder + URL))) return;
		try{
			this.xmlhttp.open('GET', URL);
			this.xmlhttp.onreadystatechange = this.ready_callback;
			if (force) this.xmlhttp.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
			if (!this.timer) {
				const a = this.xmlhttp;
				this.timer = setTimeout(() => {
					a.abort();
					this.timer = null;
				}, 30000);
			}
			this.xmlhttp.send();
		}catch(e){}
	}

	analyse() {
		const a = $.clean(this.dl_ar);
		doc.open();
		const div = doc.createElement('div');
		try{
		div.innerHTML = this.xmlhttp.responseText;
		const list = div.getElementsByTagName('img');
		let links = [];
		if (!list) {
			if (server.langFallback && !this.retry) {
				this.retry = true;
				doc.close();
				return this.search(this.dl_ar, this.img_folder);
			}
			doc.close();
			return $.trace('Last.fm 艺术家照片：' + this.dl_ar + '：未找到', true);
		}
		$.htmlParse(list, false, false, v => {
			const attr = v.src || '';
			if (attr.includes('avatar170s/')) links.push(attr.replace('avatar170s/', ''));
		});
		doc.close();
		const blacklist = img.blacklist(a.toLowerCase());
		links = links.filter(v => !blacklist.includes(v.substring(v.lastIndexOf('/') + 1) + '.jpg'));
		if (links.length) {
			$.buildPth(this.img_folder);
			if ($.folder(this.img_folder)) {
				if (this.autoAdd && cfg.photoLimit) {
					let k = 0;
					let noNewLinks = 0;
					for (k = 0; k < Math.min(links.length, 5); k++) {
						const iPth = this.img_folder + a + '_' + links[k].substring(links[k].lastIndexOf('/') + 1) + '.jpg';
						if (this.imgExisting.every(v => v.p !== iPth)) noNewLinks++;
						if (noNewLinks == 5) break;
					}
					let remove = this.imgExisting.length + noNewLinks - cfg.photoLimit;
					remove = Math.min(remove, this.imgExisting.length);
					if (remove > 0) {
						for (k = 0; k < remove; k++) server.imgToRecycle.push({
							a: a,
							p: this.imgExisting[k].p
						});
						server.setImgRecycler(true);
					}
				}
				$.save(this.img_folder + 'update.txt', '', true);
				timer.decelerating();
				if (this.autoAdd) {
					$.take(links, this.getNo).forEach(v => $.run(`cscript //nologo "${cfg.storageFolder}foo_lastfm_img.vbs" "${v}" "${this.img_folder + a}_${v.substring(v.lastIndexOf('/') + 1)}.jpg"`, 0));
				} else {
					let c = 0;
					$.take(links, cfg.photoNum).some(v => {
						const imPth = `${this.img_folder + a}_${v.substring(v.lastIndexOf('/') + 1)}.jpg`;
						if (!this.allFiles.includes(imPth)) {
							$.run(`cscript //nologo "${cfg.storageFolder}foo_lastfm_img.vbs" "${v}" "${imPth}"`, 0);
							c++;
							return c == this.getNo;
						}
					});
				}
			}
		}
		} catch (e) {doc.close();}
	}
}

class LfmAlbum {
	constructor(state_callback) {
		this.albumArtist;
		this.albm;
		this.album;
		this.fo;
		this.func = null;
		this.getStats = true;
		this.pth;
		this.ready_callback = state_callback;
		this.retry = false;
		this.rev;
		this.rev_img;
		this.stats = '';
		this.tags = [];
		this.timer = null;
		this.xmlhttp = null;
	}

	onStateChange() {
		if (this.xmlhttp != null && this.func != null)
			if (this.xmlhttp.readyState == 4) {
				clearTimeout(this.timer);
				this.timer = null;
				if (this.xmlhttp.status == 200) this.func();
				else {
					if (this.getStats && this.rev) {
						this.getStats = false;
						return this.search(this.albumArtist, this.album, this.rev, this.fo, this.pth);
					}
					$.trace('Last.fm 专辑' + (this.rev ? '评论：' : '封面：') + this.album + ' / ' + this.albumArtist + '：未找到' + ' 错误状态：' + this.xmlhttp.status, true);
				}
			}
	}

	search(p_alb_artist, p_album, p_rev, p_fo, p_pth, p_albm, force, p_rev_img) {
		let URL = '';
		this.albumArtist = p_alb_artist;
		this.album = p_album;
		this.rev = p_rev;
		this.fo = p_fo;
		this.pth = p_pth;
		this.albm = p_albm;
		this.rev_img = p_rev_img;
		if (!this.getStats && this.rev || !this.rev) {
			URL = server.url.lfm;
			if (this.rev && !server.lfm.def_EN && !this.retry) URL += '&lang=' + cfg.language.toLowerCase();
			URL += '&method=album.getInfo&artist=' + encodeURIComponent(this.albumArtist) + '&album=' + encodeURIComponent(this.rev || this.retry ? this.album : this.albm) + '&autocorrect=' + server.auto_corr;
		} else URL = 'https://' + server.lfm.server + '/music/' + encodeURIComponent(this.albumArtist) + '/' + encodeURIComponent(this.album.replace(/\+/g, '%2B'));
		this.func = null;
		this.xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
		this.func = this.analyse;
		if (ppt.multiServer && !force && server.urlDone(md5.hashStr(this.albumArtist + this.album + this.albm + this.rev + this.rev_img + (cfg.imgRevHQ || !this.rev_img) + this.pth + URL))) return;
		try{
			this.xmlhttp.open('GET', URL);
			this.xmlhttp.onreadystatechange = this.ready_callback;
			if (!this.getStats && this.rev || !this.rev) this.xmlhttp.setRequestHeader('User-Agent', 'foobar2000_script');
			if (force) this.xmlhttp.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
			if (!this.timer) {
				const a = this.xmlhttp;
				this.timer = setTimeout(() => {
					a.abort();
					this.timer = null;
				}, 30000);
			}
			this.xmlhttp.send();
		}catch(e){}
	}

	analyse() {
		if (!this.getStats && this.rev) {
			let wiki = $.jsonParse(this.xmlhttp.responseText, '', 'get', 'album.wiki.content');
			if (!wiki) {
				if (server.langFallback && !this.retry) {
					this.retry = true;
					return this.search(this.albumArtist, this.album, this.rev, this.fo, this.pth);
				}
				if (!this.stats.length) return $.trace('Last.fm 专辑评论：' + this.album + ' / ' + this.albumArtist + '：未找到', true);
			} else {
				wiki = wiki.replace(/<[^>]+>/ig, '');
				const f = wiki.indexOf(' Read more on Last.fm');
				if (f != -1) wiki = wiki.slice(0, f);
				wiki = wiki.replace(/\n/g, '\r\n').replace(/(\r\n)(\r\n)+/g, '\r\n\r\n').trim();
			}
			wiki = wiki ? wiki + this.tags + this.stats : this.tags + this.stats;
			wiki = wiki.trim();
			if (this.fo) {
				$.buildPth(this.fo);
				$.save(this.pth, wiki, true);
				server.res();
			}
		} else if (this.rev) {
			doc.open();
			const counts = ['', '', ''];
			const div = doc.createElement('div');
			const scrobbles = ['', '', ''];
			try{
			div.innerHTML = this.xmlhttp.responseText;
			let j = 0;
			let length = '';
			let length_n = '';
			let rd = '';
			let rd_n = '';
			let tr = '';
			$.htmlParse(div.getElementsByTagName('li'), 'className', 'tag', v => this.tags.push($.titlecase(v.innerText.trim()).replace(/\bAor\b/g, 'AOR').replace(/\bDj\b/g, 'DJ').replace(/\bFc\b/g, 'FC').replace(/\bIdm\b/g, 'IDM').replace(/\bNwobhm\b/g, 'NWOBHM').replace(/\bR&b\b/g, 'R&B').replace(/\bRnb\b/g, 'RnB').replace(/\bUsa\b/g, 'USA').replace(/\bUs\b/g, 'US').replace(/\bUk\b/g, 'UK')));
			$.htmlParse(div.getElementsByTagName('dt'), 'className', 'catalogue-metadata-heading', v => {
				if (!j) length_n = v.innerText.trim();
				else rd_n = $.titlecase(v.innerText.trim());
				if (j == 1) return true;
				j++;
			});
			j = 0;
			$.htmlParse(div.getElementsByTagName('dd'), 'className', 'catalogue-metadata-description', v => {
				if (!j) {
					const trck = v.innerText.split(',');
					if (trck[0] && !/\d\d\d\d/.test(trck[0])) tr = trck[0].trim().replace(/\b1 tracks/, '1 track');
					if (trck[1]) length = trck[1].trim();
				}
				else {
					rd = v.innerText.trim();
					return true;
				}
				j++;
			});
			j = 0;
			$.htmlParse(div.getElementsByTagName('h4'), 'className', 'header-metadata-tnew-title', v => {
				scrobbles[j] = $.titlecase(v.innerText.trim());
				j++
			});
			j = 0;
			$.htmlParse(div.getElementsByTagName('abbr'), 'className', 'intabbr js-abbreviated-counter', v => {
				counts[j] = j != 2 ? $.titlecase(v.innerText.trim()) + ' \u200b| ' + v.title.trim() : $.titlecase(v.innerText.trim());
				j++
			});
			doc.close();
			if (this.tags.length) {
				this.tags = [...new Set(this.tags)];
				this.tags.length = Math.min(5, this.tags.length);
				this.tags = '\r\n\r\n' + 'Top Tags: ' + this.tags.join('\u200b, ');
			} else this.tags = '';

			if (rd_n && rd && /\d\d\d\d/.test(rd)) this.stats += ('\r\n\r\n' + rd_n + ': ' + rd + (tr ? ' | ' + tr : ''));
			if (length_n && length && /\d+:\d+/.test(length)) this.stats += ('\r\n\r\n' + length_n + ': ' + length);
			if (scrobbles[1].length && counts[1].length || scrobbles[0].length && counts[0].length) this.stats += ('\r\n\r\nLast.fm: ' + (counts[1].length ? scrobbles[1] + ' ' + counts[1] + '; ' : '') + (counts[1].length ? scrobbles[0] + ' ' + counts[0] : ''));
			if (scrobbles[2] && counts[2] && scrobbles[2] != scrobbles[0] && scrobbles[1] != scrobbles[0]) this.stats += ('\r\n\r\n' + 'Rating: ' + scrobbles[2] + ': ' + counts[2]);

			this.getStats = false;
			return this.search(this.albumArtist, this.album, this.rev, this.fo, this.pth);
			} catch (e) {doc.close();}
		} else {
			if (!$.file(`${cfg.storageFolder}foo_lastfm_img.vbs`)) return;
			const data = $.jsonParse(this.xmlhttp.responseText, [], 'get', 'album.image');
			if (data.length < 5) {
				server.updateNotFound(this.albumArtist + ' - ' + (this.retry ? this.album : this.albm) + ' ' + server.auto_corr + ' ' + this.pth);
				if (!this.retry && cfg.albStrip && this.album != this.albm) {
					this.retry = true;
					return this.search(this.albumArtist, this.album, this.rev, this.fo, this.pth, this.albm);
				}
				return $.trace('Last.fm 专辑封面：' + this.album + ' / ' + this.albumArtist + '：未找到', true);
			}
			let link = data[cfg.imgRevHQ || !this.rev_img ? 4 : 3]['#text'];
			if (link && (cfg.imgRevHQ || !this.rev_img)) {
				const linkSplit = link.split('/');
				linkSplit.splice(linkSplit.length - 2, 1);
				link = linkSplit.join('/');
			}
			if (!link) {
				server.updateNotFound(this.albumArtist + ' - ' + (this.retry ? this.album : this.albm) + ' ' + server.auto_corr + ' ' + this.pth);
				if (!this.retry && cfg.albStrip && this.album != this.albm) {
					this.retry = true;
					return this.search(this.albumArtist, this.album, this.rev, this.fo, this.pth, this.albm);
				}
				return $.trace('Last.fm 专辑封面：' + this.album + ' / ' + this.albumArtist + '：未找到', true);
			}
			timer.decelerating(true);
			$.buildPth(this.fo);
			$.run(`cscript //nologo "${cfg.storageFolder}foo_lastfm_img.vbs" "${link}" "${this.pth + link.slice(-4)}"`, 0);
		}
	}
}

class LfmTrack {
	constructor(state_callback) {
		this.album = [];
		this.artist;
		this.fo;
		this.force = false;
		this.func = null;
		this.getIDs = true;
		this.getStats = true;
		this.length = '';
		this.lfm_done = false;
		this.pth;
		this.ready_callback = state_callback;
		this.releases = '';
		this.retry = false;
		this.src = 0;
		this.stats = '';
		this.tags = [];
		this.text = {
			ids: {}
		};
		this.timer = null;
		this.track;
		this.wiki = '';
		this.xmlhttp = null;
	}

	onStateChange() {
		if (this.xmlhttp != null && this.func != null)
			if (this.xmlhttp.readyState == 4) {
				clearTimeout(this.timer);
				this.timer = null;
				if (this.xmlhttp.status == 200) this.func();
				else {
					if (this.getStats) {
						this.getStats = false;
						return this.search(this.artist, this.track, this.fo, this.pth, this.force);
					}
					if (this.lfm_done) this.revSave(this.releases || this.stats.length ? false : true);
				}
			}
	}

	search(p_artist, p_track, p_fo, p_pth, p_force) {
		let URL = '';
		this.artist = p_artist;
		this.track = p_track;
		this.fo = p_fo;
		this.pth = p_pth;
		this.force = p_force;
		if (!this.lfm_done) {
			if (!this.getStats) {
				URL = server.url.lfm;
				if (!server.lfm.def_EN && !this.retry) URL += '&lang=' + cfg.language.toLowerCase();
				URL += '&method=track.getInfo&artist=' + encodeURIComponent(this.artist) + '&track=' + encodeURIComponent(this.track) + '&autocorrect=' + server.auto_corr;
			} else {
				this.text = $.jsonParse(this.pth, false, 'file');
				if (!this.text) this.text = {
					ids: {}
				}
				URL = 'https://' + server.lfm.server + '/music/' + encodeURIComponent(this.artist) + '/_/' + encodeURIComponent(this.track);
			}
		} else {
			if (this.text[this.track] && this.text[this.track].wiki && !this.force) {
				this.wiki = this.text[this.track].wiki;
				if (this.text[this.track].s) this.src = this.text[this.track].s;
				return this.revSave();
			}
			const formatName = n => n.replace(/[\s/]/g, '-').replace(/[.,!?:;'\u2019"_\u2010+()[\]&]/g, '').replace(/\$/g, 's').replace(/-+/g, '-').toLowerCase();
			if (this.getIDs && (!this.text.ids['ids_update'] || this.text.ids['ids_update'] < Date.now() - server.exp * 3 || this.force)) URL = server.url.lfm_sf + 'songs/' + formatName(this.artist);
			else if (this.text.ids[server.tidy(this.track)]) {
				this.getIDs = false;
				URL = server.url.lfm_sf + this.text.ids[server.tidy(this.track)];
			} else return this.revSave();
		}
		this.func = null;
		this.xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
		this.func = this.analyse;
		if (ppt.multiServer && !this.force && server.urlDone(md5.hashStr(this.artist + this.track + this.pth + URL))) return;
		try{
			this.xmlhttp.open('GET', URL);
			this.xmlhttp.onreadystatechange = this.ready_callback;
			if (!this.getStats && !this.lfm_done) this.xmlhttp.setRequestHeader('User-Agent', 'foobar2000_script');
			if (this.force) this.xmlhttp.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
			if (!this.timer) {
				const a = this.xmlhttp;
				this.timer = setTimeout(() => {
					a.abort();
					this.timer = null;
				}, 30000);
			}
		}catch(e){}
		try {
			this.xmlhttp.send();
		} catch (e) {
			this.revSave();
		}
	}

	analyse() {
		if (!this.lfm_done) {
			if (!this.getStats) {
				this.wiki = $.jsonParse(this.xmlhttp.responseText, '', 'get', 'track.wiki.content');
				if (this.wiki) {
					this.wiki = this.wiki.replace(/<[^>]+>/ig, '');
					const f = this.wiki.indexOf(' Read more on Last.fm');
					if (f != -1) this.wiki = this.wiki.slice(0, f);
					this.wiki = this.wiki.replace(/\n/g, '\r\n').replace(/(\r\n)(\r\n)+/g, '\r\n\r\n').replace(/\[edit\]\s*$/i, '').trim();
				}
				const tags = $.jsonParse(this.xmlhttp.responseText, [], 'get', 'track.toptags.tag');
				this.tags = tags.map( v => $.titlecase(v.name));
				this.tags.length = Math.min(5, this.tags.length);
				this.length = this.convertDuration($.jsonParse(this.xmlhttp.responseText, '', 'get', 'track.duration'));
				if (!this.wiki) {
					if (server.langFallback && !this.retry) {
						this.retry = true;
						return this.search(this.artist, this.track, this.fo, this.pth, this.force);
					}
					if (!this.lfm_done && (cfg.language == 'EN' || server.langFallback)) {
						this.lfm_done = true;
						return this.search(this.artist, this.track, this.fo, this.pth, this.force);
					}
					if (!this.releases && !this.stats.length) return this.revSave(true);
				} else this.src = 1;
				this.revSave();
			} else {
				doc.open();
				const counts = ['', ''];
				const div = doc.createElement('div');
				const scrobbles = ['', ''];
				try{
				div.innerHTML = this.xmlhttp.responseText;
				let from = '';
				let j = 0;
				let feat = '';
				$.htmlParse(div.getElementsByTagName('h3'), 'className', 'text-18', v => {
					if (v.parentNode && v.parentNode.className && v.parentNode.className == 'visible-xs') {
						from = v.innerText.trim();
						return true;
					}
				});
				$.htmlParse(div.getElementsByTagName('h4'), 'className', 'source-album-name', v => {
					this.album[j] = v.innerText.trim();
					if (j == 1) return true;
					j++;
				});
				if (!cfg.lang.ix && !feat) $.htmlParse(div.getElementsByTagName('p'), 'className', 'more-link-fullwidth-right', v => {
					feat = v.innerText.trim();
					if (/^\d+/.test(feat)) {
						feat = feat.replace(/\D/g, '');
					} else feat = '';
					return true;
				});
				j = 0;
				$.htmlParse(div.getElementsByTagName('h4'), 'className', 'header-metadata-tnew-title', v => {
					scrobbles[j] = $.titlecase(v.innerText.trim());
					j++
				});
				j = 0;
				$.htmlParse(div.getElementsByTagName('abbr'), 'className', 'intabbr js-abbreviated-counter', v => {
					counts[j] = $.titlecase(v.innerText.trim());
					j++
				});
				doc.close();
				if (from && this.album.length) {
					this.album = [...new Set(this.album)].join('\u200b, ');
					
					this.releases += from + '\u200b: ' + this.album;
				}
				if (feat) {
					const rel = feat != '1' ? 'releases' : 'release';
					feat = ` \u200band ${feat} other ${rel}`;
					this.releases += feat;
				}
				if (this.releases) this.releases += '.';
				if (scrobbles[1].length && counts[1].length || scrobbles[0].length && counts[0].length) this.stats += ('Last.fm: ' + (counts[1].length ? scrobbles[1] + ' ' + counts[1] + '; ' : '') + (counts[0].length ? scrobbles[0] + ' ' + counts[0] : ''));
				this.getStats = false;
				return this.search(this.artist, this.track, this.fo, this.pth, this.force);
				} catch (e) {doc.close();}
			}
		} else {
			doc.open();
			const div = doc.createElement('div');
			try{
			div.innerHTML = this.xmlhttp.responseText;
			if (!this.getIDs) {
				let j = 0;
				div.innerHTML = this.xmlhttp.responseText;
				$.htmlParse(div.getElementsByTagName('div'), 'className', 'inner', v => {
					let tx = v.innerText;
					if (tx && tx.includes(' >>')) tx = tx.split(' >>')[0];
					if (tx) {
						if (!j) this.wiki = tx;
						else this.wiki += '\r\n\r\n' + tx;
						j++;
					}
				});
				this.wiki = this.wiki.trim();
				doc.close();
				if (!this.wiki) {
					if (!this.releases && !this.stats.length) return this.revSave(true);
				} else this.src = 2;
				this.revSave();
			} else {
				this.text.ids = {}
				$.htmlParse(div.getElementsByTagName('li'), false, false, v => {
					const a = v.getElementsByTagName('a');
					if (a.length && a[0].href && a[0].href.includes('/facts/')) this.text.ids[server.tidy(a[0].innerText)] = a[0].href.replace('about:/', '');
				});
				this.text.ids['ids_update'] = Date.now();
				doc.close();
				this.getIDs = false;
				this.search(this.artist, this.track, this.fo, this.pth, this.force);
			}
			} catch (e) {doc.close();}
		}
	}

	convertDuration(duration) {
		duration /= 1000;
		if (!duration) return '';
		const convert = (x, sec) => {
			return x || sec ? (x < 10 && sec ? `0${x}` : sec ? `${x}` : `${x}:`) : '';
		}
		return convert(parseInt(duration / (60*60))) +
		convert(parseInt(duration / 60 % 60)) +
		convert(duration % 60, true)
	}

	revSave(ret) {
		if (this.text[this.track] && this.text[this.track].lang == cfg.language) {
			if (!this.releases) this.releases = this.text[this.track].releases;
			if (!this.wiki && !this.force) {
				this.wiki = this.text[this.track].wiki;
				if (this.wiki) this.src = this.text[this.track].s;
			}
			if (!this.stats) this.stats = this.text[this.track].stats;
		}
		this.text[this.track] = {
			length: this.length,
			releases: this.releases,
			stats: this.stats,
			tags: this.tags,
			wiki: this.wiki || '',
			s: this.src,
			lang: this.retry ? 'EN' : cfg.language,
			update: Date.now()
		};
		if (this.fo) {
			$.buildPth(this.fo);
			$.save(this.pth, JSON.stringify($.sortKeys(this.text), null, 3), true);
		}
		if (ret) return $.trace('last.fm 音轨评论：' + $.titlecase(this.track) + ' / ' + this.artist + '：未找到', true);
		server.res();
	}
}

class LfmSimilarArtists {
	constructor(state_callback, on_search_done_callback) {
		this.artist;
		this.done;
		this.fn_sim;
		this.func = null;
		this.handles;
		this.lmt;
		this.on_search_done_callback = on_search_done_callback;
		this.pth_sim;
		this.ready_callback = state_callback;
		this.retry = false;
		this.xmlhttp = null;
	}

	onStateChange() {
		if (this.xmlhttp != null && this.func != null)
			if (this.xmlhttp.readyState == 4) {
				if (this.xmlhttp.status == 200) this.func();
				else if (this.on_search_done_callback) this.on_search_done_callback(this.artist, [], this.done, this.handles);
			}
	}

	search(p_artist, p_done, p_handles, p_lmt, p_pth_sim, p_fn_sim) {
		this.artist = p_artist;
		this.done = p_done;
		this.handles = p_handles;
		this.lmt = p_lmt;
		this.pth_sim = p_pth_sim;
		this.fn_sim = p_fn_sim;
		if (this.retry) this.lmt = this.lmt == 249 ? 235 + Math.floor(Math.random() * 14) : this.lmt + 10;
		this.func = null;
		this.xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
		const URL = 'http://ws.audioscrobbler.com/2.0/?format=json' + panel.lfm + '&method=artist.getSimilar&artist=' + encodeURIComponent(this.artist) + '&limit=' + this.lmt + '&autocorrect=1';
		this.func = this.analyse;
		try{
			this.xmlhttp.open('GET', URL);
			this.xmlhttp.onreadystatechange = this.ready_callback;
			this.xmlhttp.setRequestHeader('User-Agent', 'foobar2000_script');
			if (this.retry) this.xmlhttp.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
			this.xmlhttp.send();
		}catch(e){}
	}

	analyse() {
		const data = $.jsonParse(this.xmlhttp.responseText, [], 'get', 'similarartists.artist');
		let list = [];
		if ((data.length < this.lmt) && !this.retry) {
			this.retry = true;
			return this.search(this.artist, this.done, this.handles, this.lmt, this.pth_sim, this.fn_sim);
		}
		switch (true) {
			case this.lmt < 17:
				$.take(data, 6);
				list = data.map(v => v.name);
				if (data.length || this.retry) this.on_search_done_callback(this.artist, list, this.done, this.handles);
				break;
			case this.lmt > 99:
				if (data.length) {
					list = data.map(v => ({
						name: v.name,
						score: Math.round(v.match * 100)
					}));
					list.unshift({
						name: this.artist,
						score: 100
					});
					if (!this.pth_sim) break;
					$.buildPth(this.pth_sim);
					$.save(this.fn_sim, JSON.stringify(list), true);
					if (cfg.lfmSim) {
						panel.getList();
						window.NotifyOthers('bio_getLookUpList', 'bio_getLookUpList');
					}
				}
				break;
		}
	}
}

class LfmTopAlbums {
	constructor(state_callback, on_search_done_callback) {
		this.artist;
		this.func = null;
		this.on_search_done_callback = on_search_done_callback;
		this.ready_callback = state_callback;
		this.xmlhttp = null;
	}

	onStateChange() {
		if (this.xmlhttp != null && this.func != null)
			if (this.xmlhttp.readyState == 4) {
				if (this.xmlhttp.status == 200) this.func();
				else this.on_search_done_callback(this.artist, []);
			}
	}

	search(p_artist) {
		this.artist = p_artist;
		this.func = null;
		this.xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
		const URL = 'https://www.last.fm/music/' + encodeURIComponent(this.artist) + '/+albums';
		this.func = this.analyse;
		try{
			this.xmlhttp.open('GET', URL);
			this.xmlhttp.onreadystatechange = this.ready_callback;
			this.xmlhttp.send();
		}catch(e){}
	}

	analyse() {
		doc.open();
		const div = doc.createElement('div');
		const popAlbums = [];
		let i = 0;
		let topAlbums = [];
		try{
		div.innerHTML = this.xmlhttp.responseText;
		$.htmlParse(div.getElementsByTagName('h3'), 'className', 'resource-list--release-list-item-name', v => {
			i < 4 ? popAlbums.push($.titlecase(v.innerText.trim())) : topAlbums.push($.titlecase(v.innerText.trim()));
			i++;
			if (i == 10) return true;
		});
		doc.close();
		if (popAlbums.length) {
			const mapAlbums = topAlbums.map(v => $.cut(v));
			const match = mapAlbums.includes($.cut(popAlbums[0]));
			if (topAlbums.length > 5 && !match) topAlbums.splice(5, 0, popAlbums[0]);
			else topAlbums = topAlbums.concat(popAlbums);
		}
		topAlbums = [...new Set(topAlbums)];
		topAlbums.length = Math.min(6, topAlbums.length);
		this.on_search_done_callback(this.artist, topAlbums);
		} catch (e) {doc.close();}
	}
}

class DldLastfmGenresWhitelist {
	constructor(state_callback) {
		this.func = null;
		this.ready_callback = state_callback;
		this.timer = null;
		this.xmlhttp = null;
	}

	onStateChange() {
		if (this.xmlhttp != null && this.func != null)
			if (this.xmlhttp.readyState == 4) {
				clearTimeout(this.timer);
				this.timer = null;
				if (this.xmlhttp.status == 200) this.func();
				else $.trace('无法更新 Last.fm 流派白名单' + ' 错误状态：' + this.xmlhttp.status, true);
			}
	}

	search() {
		this.func = null;
		this.xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
		const URL = 'https://musicbrainz.org/genres';
		this.func = this.analyse;
		try{
			this.xmlhttp.open('GET', URL);
			this.xmlhttp.onreadystatechange = this.ready_callback;
			if (!this.timer) {
				const a = this.xmlhttp;
				this.timer = setTimeout(() => {
					a.abort();
					this.timer = null;
				}, 30000);
			}
			this.xmlhttp.send();
		}catch(e){}
	}

	analyse() {
		doc.open();
		const div = doc.createElement('div');
		try{
		div.innerHTML = this.xmlhttp.responseText;
		const a = div.getElementsByTagName('a');
		let genres = [];
		for (let i = 0; i < a.length; i++) {
			if (a[i].href.includes('/genre/')) {
				genres.push(a[i].innerText.trim());
			}
		}

		if (genres.length > 860) {
			const pth = `${cfg.storageFolder}lastfm_genre_whitelist.json`;
			const existingGenres = $.jsonParse(pth, [], 'file');
			if (genres.length > existingGenres.length) {
				$.buildPth(pth);
				$.save(pth, JSON.stringify(genres), true);
			}
		}
		} catch (e) {doc.close();}
	}
}