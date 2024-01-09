'use strict';

class Server {
	constructor() {
		if (!$.server) return;
		this.albm = '';
		this.album = '';
		this.albumArtist = '';
		this.artist = '';
		this.artistMbid = {};
		this.artistQid = {};
		this.auto_corr = 1;
		this.bioCache = `${cfg.storageFolder}cache_bio.json`;
		this.disambig = '';
		this.exp = Math.max(panel.d * cfg.exp / 28, panel.d);
		if (!this.exp || isNaN(this.exp)) this.exp = panel.d;
		this.imgToRecycle = [];
		if ($.file(this.bioCache)) this.imgToRecycle = $.jsonParse(this.bioCache, false, 'file');
		this.langFallback = false;
		this.lastGetTrack = Date.now();
		this.notFound = `${cfg.storageFolder}update_bio.json`;
		if (ppt.updateNotFound) {
			$.save(this.notFound, JSON.stringify([{
				'name': 'update',
				'time': Date.now()
			}], null, 3), true);
			ppt.updateNotFound = false;
		}
		this.similar = ['Similar Artists: ', '\u00c4hnliche K\u00fcnstler: ', 'Artistas Similares: ', 'Artistes Similaires: ', 'Artisti Simili: ', '\u4f3c\u3066\u3044\u308b\u30a2\u30fc\u30c6\u30a3\u30b9\u30c8: ', 'Podobni Wykonawcy: ', 'Artistas Parecidos: ', '\u041f\u043e\u0445\u043e\u0436\u0438\u0435 \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u0438: ', 'Liknande Artister: ', 'Benzer Sanat\u00e7\u0131lar: ', '\u76f8\u4f3c\u827a\u672f\u5bb6: '];
		this.urlRequested = {};

		this.id = {
			album: '',
			title: '',
			track_1: '',
			track_2: ''
		};
		this.lfm = {
			def_EN: false,
			server: cfg.language.toLowerCase()
		};
		this.url = {
			am: 'https://www.allmusic.com/search/',
			lfm: 'https://ws.audioscrobbler.com/2.0/?format=json' + panel.lfm,
			lfm_sf: 'https://www.songfacts.com/',
			mb: 'https://musicbrainz.org/ws/2/',
			wikidata: 'https://www.wikidata.org/w/api.php?action=wbgetentities&utf8&format=json&props=claims|sitelinks/urls&ids=',
			wikiinfo: 'https://lang.wikipedia.org/w/api.php?format=json&action=query&prop=revisions&rvprop=content&rvsection=0&rvslots=main&utf8&titles=',
			wikipedia: 'https://lang.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&explaintext&utf8&titles=',
			wikisearch: 'https://www.wikidata.org/w/api.php?action=query&list=search&srprop=snippet|titlesnippet&srlimit=100&utf8&format=json&srsearch='
		}

		this.call = $.debounce(focus => {
			this.download(false, {
				ix: 0,
				focus: focus || false,
				arr: []
			},
			{
				ix: 0,
				focus: focus || false,
				arr: []
			});
		}, 2000, {
			'leading': true,
			'trailing': true
		});

		this.createImgDlFile();
		this.checkNotFound();
		this.setImgRecycler();
		this.setLanguage();
	}

	// Methods

	checkNotFound() {
		if (!$.file(this.notFound)) $.save(this.notFound, JSON.stringify([{
			'name': 'update',
			'time': Date.now()
		}], null, 3), true);
		let m = $.jsonParse(this.notFound, false, 'file');
		if (!$.isArray(m)) {
			m = [{
				'name': 'update',
				'time': Date.now()
			}];
			$.save(this.notFound, JSON.stringify(m, null, 3), true);
		}
		if (m[0].name != 'update') {
			m.unshift({
				'name': 'update',
				'time': Date.now()
			});
			$.save(this.notFound, JSON.stringify(m, null, 3), true);
		}
	}

	checkTrack(tr) {
		let track_done = false;
		if (tr.artist + tr.title == this.id.track_1 && !tr.force && !tr.menu || tr.artist == '' || tr.title == '') track_done = true;
		else this.id.track_1 = tr.artist + tr.title;

		if ((cfg.dlAmRev || cfg.dlLfmRev || cfg.dlWikiRev) && !track_done) {
			if (ppt.showTrackRevOptions) this.getTrack(tr);
			else window.NotifyOthers('bio_chkTrackRev', tr);
		}
	}

	createImgDlFile() {
		const n = `${cfg.storageFolder}foo_lastfm_img.vbs`
		
		if (!$.file(n)) {
			const dl_im = 'If (WScript.Arguments.Count <> 2) Then\r\nWScript.Quit\r\nEnd If\r\n\r\nurl = WScript.Arguments(0)\r\nfile = WScript.Arguments(1)\r\n\r\nSet objFSO = Createobject("Scripting.FileSystemObject")\r\nIf objFSO.Fileexists(file) Then\r\nSet objFSO = Nothing\r\nWScript.Quit\r\nEnd If\r\n\r\nSet objXMLHTTP = CreateObject("MSXML2.XMLHTTP")\r\nobjXMLHTTP.open "GET", url, false\r\nobjXMLHTTP.send()\r\n\r\nIf objXMLHTTP.Status = 200 Then\r\nSet objADOStream = CreateObject("ADODB.Stream")\r\nobjADOStream.Open\r\nobjADOStream.Type = 1\r\nobjADOStream.Write objXMLHTTP.ResponseBody\r\nobjADOStream.Position = 0\r\nobjADOStream.SaveToFile file\r\nobjADOStream.Close\r\nSet objADOStream = Nothing\r\nEnd If\r\n\r\nSet objFSO = Nothing\r\nSet objXMLHTTP = Nothing';
			$.save(n, dl_im, false);
		}
	}

	done(f, exp) {
		if (!$.file(this.notFound)) return false;
		const m = $.jsonParse(this.notFound, false, 'file');
		const n = Date.now();
		const r = n - exp;
		const u = n - panel.d / 28;
		let k = m.length;
		if (m.length && m[0].time < u) {
			while (k--)
				if (m[k].time < r && k) m.splice(k, 1);
			m[0].time = n;
			$.save(this.notFound, JSON.stringify(m, null, 3), true);
		}
		for (k = 0; k < m.length; k++)
			if (m[k].name == f) return true;
		return false;
	}

	expired(f, exp, f_done, langCheck, type) {
		if (langCheck) {
			const listeners = ['Listeners', 'H\u00f6rer', 'Oyentes', 'Auditeurs', 'Ascoltatori', '\u30ea\u30b9\u30ca\u30fc', 'S\u0142uchaczy', 'Ouvintes', '\u0421\u043b\u0443\u0448\u0430\u0442\u0435\u043b\u0438', 'Lyssnare', 'Dinleyiciler', '\u542c\u4f17']
			const releaseDate = ['Release Date: ', 'Ver\u00f6ffentlichungsdatum: ', 'Fecha De Lanzamiento: ', 'Date De Sortie: ', 'Data Di Pubblicazione: ', '\u30ea\u30ea\u30fc\u30b9\u65e5: ', 'Data Wydania: ', 'Data De Lan\u00e7amento: ', '\u0414\u0430\u0442\u0430 \u0440\u0435\u043b\u0438\u0437\u0430: ', 'Utgivningsdatum: ', 'Yay\u0131nlanma Tarihi: ', '\u53d1\u5e03\u65e5\u671f: '];
			let i = 0;
			switch (type) {
				case 0: {
					let langOK = false;
					for (i = 0; i < this.similar.length; i++) {
						if (langCheck.includes(this.similar[i])) {
							if (i == cfg.lang.ix) langOK = true;
							else if (this.langFallback && !i) langOK = true;
							if (!langOK) return true;
							break;
						}
					}
					for (i = 0; i < listeners.length; i++) {
						if (langCheck.includes(listeners[i])) {
							if (i == cfg.lang.ix) langOK = true;
							else if (this.langFallback && !i) langOK = true;
							if (!langOK) return true;
							break;
						}
					}
					break;
				}
				case 1: {
					let langOK = false;
					for (i = 0; i < releaseDate.length; i++) {
						if (langCheck.includes(releaseDate[i])) {
							if (i == cfg.lang.ix) langOK = true;
							else if (this.langFallback && !i) langOK = true;
							if (!langOK) return true;
							break;
						}
					}
					for (i = 0; i < listeners.length; i++) {
						if (langCheck.includes(listeners[i])) {
							if (i == cfg.lang.ix) langOK = true;
							else if (this.langFallback && !i) langOK = true;
							if (!langOK) return true;
							break;
						}
					}
					break;
				}
				case 2: {
					let langOK = false;
					if (langCheck.includes(`Wikipedia language: ${cfg.language}`)) langOK = true;
					else if (this.langFallback && langCheck.includes(`Wikipedia language: EN`)) langOK = true;
					if (!langOK) return true;
					break;
				}
			}
		}
		if (f_done && this.done(f_done, exp)) return false;
		if (!$.file(f)) return true;
		return Date.now() - $.lastModified(f) > exp;
	}

	download(force, art, alb, name) {
		this.getBio(force, art, 0);
		if (name == 'bio_lookUpItem') this.getBio(force, art, 1); // am bio direct
		this.getRev(force, art, alb, force == 2 ? true : false);
	}

	downloadDynamic() {
		this.getBio(false, {
			ix: 0,
			focus: false,
			arr: []
		}, 0);
		this.getBio(false, {
			ix: 0,
			focus: false,
			arr: []
		}, 1);
	}

	format(n) {
		n = n.replace(/<P><\/P>/gi, '').replace(/<p[^>]*>/gi, '').replace(/\r/g, '').replace(/\n/g, '').replace(/<\/p>/gi, '\r\n\r\n').replace(/<br>/gi, '\r\n');
		while (n != (n = n.replace(/<[^<>]*>/g, ''))); // handle nested tags: https://blog.stevenlevithan.com/archives/reverse-recursive-pattern (works with abc test in post)
		return n.replace(/&amp(;|)/g, '&').replace(/&quot(;|)/g, '"').replace(/&#39(;|)/g, "'").replace(/&gt(;|)/g, '>').replace(/&nbsp(;|)/g, '').replace(/^ +/gm, '').replace(/^\s+|\s+$/g, '');
	}

	getBio(force, art, type) {
		const stndBio = !art.ix || art.ix + 1 > art.arr.length;
		let artist_done = false;
		let new_artist = stndBio ? name.artist(art.focus, true) : art.arr[art.ix].name;
		if (new_artist == this.artist && !force || new_artist == '') artist_done = true; else this.artist = new_artist;
		
		const album = name.album(art.focus, true);
		let title = name.title(art.focus, true);
		
		let supCache = false;
		if (!stndBio) supCache = cfg.supCache && !lib.inLibrary(0, this.artist);

		if (this.expired(`${cfg.storageFolder}lastfm_genre_whitelist.json`, this.exp) || tag.genres.length < 701 || force) {
			const lfm_genres = new DldLastfmGenresWhitelist(() => lfm_genres.onStateChange());
			lfm_genres.search();
		}

		switch (type) {
			case 0: {
				if (cfg.dlLfmBio && !artist_done) {
					const lfm_bio = panel.getPth('bio', art.focus, this.artist, '', stndBio, supCache, $.clean(this.artist), '', '', 'foLfmBio', true, true);
					const text = $.open(lfm_bio.pth);
					const custBio = text.includes('Custom Biography');

					if (this.expired(lfm_bio.pth, this.exp, '', text, 0) && !custBio || force == 2 && !custBio || force == 1) {
						const dl_lfm_bio = new DldLastfmBio(() => dl_lfm_bio.onStateChange());
						dl_lfm_bio.search(this.artist, lfm_bio.fo, lfm_bio.pth, force);
					}
				}

				if (cfg.dlWikiBio) {
					const new_disambig = `${title} - ${album}`;
					let disambig_done = false;
					if (new_disambig == this.disambig && !force || new_disambig == '') disambig_done = true;
					else this.disambig = new_disambig;

					if (stndBio && (!artist_done || !disambig_done) || !stndBio && !artist_done) {
						const wiki_bio = panel.getPth('bio', art.focus, this.artist, '', stndBio, supCache, $.clean(this.artist), '', '', 'foWikiBio', true, true);
						const text = $.open(wiki_bio.pth);
						const custBio = text.includes('Custom Biography');

						if (this.expired(wiki_bio.pth, this.exp, '', text, 2) && !custBio || force == 2 && !custBio || force == 1) {
							const dl_wiki_bio = new DldWikipedia(() => dl_wiki_bio.onStateChange());
							dl_wiki_bio.search(0, this.artist, '', album, title, stndBio ? 0 : '!stndBio', wiki_bio.fo, wiki_bio.pth, art.focus, force);
						}
					}
				}

				this.checkTrack({
					focus: art.focus,
					force: force,
					menu: false,
					artist: this.artist,
					title: title
				});

				if (!artist_done) {
					if (cfg.dlArtImg) {
						const dl_art = new DldArtImages;
						dl_art.run(this.artist, force, art, stndBio, supCache);
					} else timer.decelerating();

					if (cfg.lfmSim && stndBio) {
						const fo_sim = !panel.isRadio(art.focus) ? panel.cleanPth(cfg.pth.foLfmSim, art.focus, 'server') : panel.cleanPth(cfg.remap.foLfmSim, art.focus, 'remap', this.artist, '', 1);
						const pth_sim = fo_sim + $.clean(this.artist) + ' And Similar Artists.json';
						let len = 0;
						let valid = false;
						if ($.file(pth_sim)) {
							const list = $.jsonParse(pth_sim, false, 'file');
							if (list) {
								valid = $.objHasOwnProperty(list[0], 'name');
								len = list.length;
							}
						}

						if (this.expired(pth_sim, this.exp) || !valid || force) {
							const dl_lfm_sim = new LfmSimilarArtists(() => dl_lfm_sim.onStateChange());
							dl_lfm_sim.search(this.artist, '', '', len > 115 ? 249 : 100, fo_sim, pth_sim);
						}
					}

					if (stndBio && cfg.photoLimit && !panel.lock) { // purge imgToRecycle
						let j = this.imgToRecycle.length;
						while (j--) {
							if (this.imgToRecycle[j].a != name.artist(true) && this.imgToRecycle[j].a != name.artist(false)) {
								try {
									if ($.file(this.imgToRecycle[j].p)) {
										$.create(cfg.photoRecycler);
										const fn = fso.GetBaseName(this.imgToRecycle[j].p) + '.jpg'
										if (!$.file(cfg.photoRecycler + fn)) fso.MoveFile(this.imgToRecycle[j].p, cfg.photoRecycler);
										else
											for (let i = 0; i < 100; i++) {
												const new_fn = fn.replace('.jpg', '_' + i + '.jpg');
												if (!$.file(cfg.photoRecycler + new_fn)) {
													fso.MoveFile(this.imgToRecycle[j].p, cfg.photoRecycler + new_fn);
													break;
												}
											}
									}
								} catch (e) {}
								if (!$.file(this.imgToRecycle[j].p)) this.imgToRecycle.splice(j, 1)
							}
						}
						this.setImgRecycler(true);
					}
				}
				break;
			}
			case 1: {
				if (!cfg.dlAmBio || !this.artist) return;
				if (!stndBio) title = '';
				const am_bio = panel.getPth('bio', art.focus, this.artist, '', stndBio, supCache, $.clean(this.artist), '', '', 'foAmBio', true, true);

				if (force || this.expired(am_bio.pth, this.exp, 'Bio ' + cfg.partialMatch + ' ' + this.artist + ' - ' + title, false) && !$.open(am_bio.pth).includes('Custom Biography')) {
          setTimeout(() => {
  					const dl_am_bio = new DldAllmusicBio;
  					const url = title ? server.url.am + 'songs/' + encodeURIComponent(title + ' ' + this.artist) : server.url.am + 'artists/' + encodeURIComponent(this.artist);
  					dl_am_bio.initbio(url, 'https://allmusic.com', title, this.artist, am_bio.fo, am_bio.pth, force);
          }, 2000); // throttle
				}
				break;
			}
		}
	}

	getCover(force, alb) { // stndAlb
		const handle = $.handle(alb.focus, true);
		if (!handle) return;
		const g_img = utils.GetAlbumArtV2(handle, 0, false);
		if (g_img) return;
		const covCanBeSaved = !handle.RawPath.startsWith('fy+') && !handle.RawPath.startsWith('3dydfy:') && !handle.RawPath.startsWith('http');
		const sw = cfg.dlLfmCov && covCanBeSaved ? 1 : cfg.dlRevImg ? 0 : 2;
		let lfm_cov;

		switch (sw) {
			case 1: { // cover
				const cov = panel.getPth('cov', alb.focus, 'server');
				if (this.done(this.albumArtist + ' - ' + this.album + ' ' + this.auto_corr + ' ' + cov.pth, this.exp) && !force) return;
				if (img.chkPths([cov.pth], '', 2)) return;
				if (cfg.cusCov && img.chkPths(cfg.cusCovPaths, '', 2, true)) return;
				lfm_cov = new LfmAlbum(() => lfm_cov.onStateChange());
				lfm_cov.search(this.albumArtist, this.album, false, cov.fo, cov.pth, this.albm, force, false);
				break;
			}
			case 0: { // rev_img
				const rev_img = panel.getPth('img', alb.focus, this.albumArtist, this.album);
				if (this.done(this.albumArtist + ' - ' + this.album + ' ' + this.auto_corr + ' ' + rev_img.pth, this.exp) && !force) return;
				if (img.chkPths([rev_img.pth, panel.getPth('cov', alb.focus).pth], '', 2)) return;
				if (cfg.cusCov && img.chkPths(cfg.cusCovPaths, '', 2, true)) return;
				lfm_cov = new LfmAlbum(() => lfm_cov.onStateChange());
				lfm_cov.search(this.albumArtist, this.album, false, rev_img.fo, rev_img.pth, this.albm, force, true);
				break;
			}
		}
	}

	getObjKeyValue(obj, searchKey, results = []) {
		const r = results;
		Object.keys(obj).forEach(key => {
			const value = obj[key];
			if (key === searchKey && !$.isObject(value)) {
				r.push(value);
			} else if ($.isObject(value)) {
				this.getObjKeyValue(value, searchKey, r);
			}
		});
		return r;
	}

	getRev(force, art, alb, onlyForceLfm) { // also gets bios that depend on rev
		const stndAlb = !alb.ix || alb.ix + 1 > alb.arr.length;
		const new_album_id = stndAlb ? $.eval(cfg.tf.albumArtist + cfg.tf.album, alb.focus, true) : alb.arr[alb.ix].artist + alb.arr[alb.ix].album;
		const new_composition_id = stndAlb ? $.eval(cfg.tf.albumArtist + cfg.tf.composition, alb.focus, true) : '';
		const new_title_id = name.title(art.focus, true);
		let supCache = false;

		let title_done = false;
		if (new_title_id == this.id.title) title_done = true; else this.id.title = new_title_id;

		let sameComposition = true;
		if (cfg.classicalModeEnable && !alb.ix) {
			sameComposition = new_composition_id == this.id.composition;
		}

		if (new_album_id == this.id.album && sameComposition && !force) {
			if (!title_done) {
				this.getBio(force, art, 1);
			}
			return;
		}
		this.id.album = new_album_id;
		this.id.composition = new_composition_id;

		this.album = stndAlb ? name.album(alb.focus, true) : alb.arr[alb.ix].album;
		this.albm = stndAlb ? name.albm(alb.focus, true) : alb.arr[alb.ix].album;
		this.albumArtist = stndAlb ? name.albumArtist(alb.focus, true) : alb.arr[alb.ix].artist;
		this.composition = cfg.classicalModeEnable && stndAlb ? name.composition(alb.focus, true) : '';

		if ((!this.album && !this.composition) || !this.albumArtist) return this.getBio(force, art, 1);

		if (!stndAlb) supCache = cfg.supCache && !lib.inLibrary(1, this.albumArtist, this.album);
		if (stndAlb) {
			if (this.albm) this.getCover(force, alb);
		} else if (force && cfg.dlRevImg) this.getRevImg(this.albumArtist, this.album, '', '', force);

		const am_rev = panel.getPth('rev', alb.focus, this.albumArtist, this.album, stndAlb, supCache, $.clean(this.albumArtist), $.clean(this.albumArtist), $.clean(this.album), 'foAmRev', true, true);
		const artiste = stndAlb ? name.artist(alb.focus, true) : this.albumArtist;
		const am_bio = panel.getPth('bio', alb.focus, artiste, '', stndAlb, cfg.supCache && !lib.inLibrary(0, artiste), $.clean(artiste), '', '', 'foAmBio', true, true);
		const va = this.albumArtist.toLowerCase() == cfg.va.toLowerCase() || this.albumArtist.toLowerCase() != artiste.toLowerCase();

		if (this.album) {
			if (!onlyForceLfm) {
				const art_upd = cfg.dlAmBio && (force || this.expired(am_bio.pth, this.exp, 'Bio ' + cfg.partialMatch + ' ' + am_rev.pth, false) && !$.open(am_bio.pth).includes('Custom Biography'));
				let rev_upd = false;
				if (cfg.dlAmRev) {
					rev_upd = force;
					if (!rev_upd) {
						rev_upd = !$.file(am_rev.pth) && !this.done('Rev ' + cfg.partialMatch + ' ' + am_rev.pth, this.exp);
					}
				}
				let dn_type = '';
				if (rev_upd || art_upd) {
					if (rev_upd && art_upd) dn_type = 'review+biography';
					else if (rev_upd) dn_type = 'review';
					else if (art_upd) dn_type = 'biography';
          setTimeout(() => {
					const dl_am_rev = new DldAllmusicRev(() => dl_am_rev.onStateChange());
					dl_am_rev.search(0, server.url.am + 'albums/' + encodeURIComponent(this.album + (!va ? ' ' + this.albumArtist : '')), this.album, this.albumArtist, artiste, va, dn_type, am_rev.fo, am_rev.pth, am_bio.fo, am_bio.pth, art, force);
          }, 2000); // throttle
				}
			}
		} else this.getBio(force, art, 1);

		if (cfg.dlAmRev && this.composition && !onlyForceLfm) {
			const am_comp = panel.getPth('rev', alb.focus, this.albumArtist, this.composition, stndAlb, supCache, $.clean(this.albumArtist), $.clean(this.albumArtist), $.clean(this.composition), 'foAmRev', true, true);	
			const comp_upd = !alb.ix && (force || !$.file(am_comp.pth) && !this.done('Rev ' + cfg.partialMatch + ' ' + am_comp.pth, this.exp));

			if (comp_upd) {
				const artUpd = cfg.dlAmBio && (force || this.expired(am_bio.pth, this.exp, 'Bio ' + cfg.partialMatch + ' ' + am_comp.pth, false) && !$.open(am_bio.pth).includes('Custom Biography'));
				const dn_type = comp_upd && artUpd ? 'composition+biography' : 'composition';
				const amAlbumArtist = this.albumArtist;
				const amWork = this.composition;
				setTimeout(() => {
				const dl_am_comp = new DldAllmusicRev;
					dl_am_comp.initrev(server.url.am + 'compositions/' + encodeURIComponent(amWork + (!va ? ' ' + amAlbumArtist : '')), 'https://allmusic.com', amWork, amAlbumArtist, artiste, va, dn_type, am_rev.fo, am_comp.pth, am_bio.fo, am_bio.pth, art, force);
				}, 2000); // throttle
			}
		}

		if (cfg.dlLfmRev && this.album) {
			const lfm_rev = panel.getPth('rev', alb.focus, this.albumArtist, this.album, stndAlb, supCache, $.clean(this.albumArtist), $.clean(this.albumArtist), $.clean(this.album), 'foLfmRev', true, true);
			const lfmRev = $.open(lfm_rev.pth);
			const custRev = lfmRev.includes('Custom Review');

			if (this.expired(lfm_rev.pth, this.exp, '', lfmRev, 1) && !custRev || force == 2 && !custRev || force == 1) { // force == 2: identifies newlang: upd if !custRev; force == 1: user force from menu
				const lfm_alb = new LfmAlbum(() => lfm_alb.onStateChange());
				lfm_alb.search(this.albumArtist, this.album, true, lfm_rev.fo, lfm_rev.pth, '', force, false);
			}
		}

		if (cfg.dlWikiRev) {
			if (this.album) {
				const wiki_rev = panel.getPth('rev', alb.focus, this.albumArtist, this.album, stndAlb, supCache, $.clean(this.albumArtist), $.clean(this.albumArtist), $.clean(this.album), 'foWikiRev', true, true);
				const wikiRev = $.open(wiki_rev.pth);
				const custRev = wikiRev.includes('Custom Review');
				const wikiAlbum = this.album;
				const wikiAlbumArtist = this.albumArtist;
				const wikiStnd = stndAlb;
				const wikiTitle = name.title(alb.focus, true);

				if (this.expired(wiki_rev.pth, this.exp, '', wikiRev, 2) && !custRev || force == 2 && !custRev || force == 1) {
					setTimeout(() => {
						const wiki_alb = new DldWikipedia(() => wiki_alb.onStateChange());
						wiki_alb.search(0, wikiAlbumArtist.toLowerCase() != cfg.va.toLowerCase() ? wikiAlbumArtist : 'Various Artists', wikiAlbum, wikiAlbum, wikiTitle, wikiStnd ? 1 : '!stndAlb', wiki_rev.fo, wiki_rev.pth, alb.focus, force);
					}, 1200); // wait for mbid & Qid
				}
			}

			if (this.composition) {
				const wiki_comp = panel.getPth('rev', alb.focus, this.albumArtist, this.composition, stndAlb, supCache, $.clean(this.albumArtist), $.clean(this.albumArtist), $.clean(this.composition), 'foWikiRev', true, true);
				const wikiAlbum = name.album(alb.focus, true);
				const wikiAlbumArtist = this.albumArtist;
				const wikiComp = $.open(wiki_comp.pth);
				const wikiStnd = stndAlb;
				const wikiTitle = name.title(alb.focus, true);
				const wikiWork = this.composition;
				const custRev = wikiComp.includes('Custom Review');

				if ((!this.expired(wiki_comp.pth, this.exp, '', wikiComp, 2) || custRev) && !force || custRev && force == 2) return;
				setTimeout(() => {
					const wk_comp = new DldWikipedia(() => wk_comp.onStateChange());
					wk_comp.search(0, wikiAlbumArtist.toLowerCase() != cfg.va.toLowerCase() ? wikiAlbumArtist : 'Various Artists', wikiWork, wikiAlbum, wikiTitle, wikiStnd ? 2 : '!stndComp', wiki_comp.fo, wiki_comp.pth, alb.focus, force);
				}, 2000); // wait for mbid & Qid & limit call frequency
			}
		}
	}

	getRevImg(a, l, pe, fe, force) { // !stndAlb
		if (!force) {
			if (this.done(a + ' - ' + l + ' ' + this.auto_corr + ' ' + fe, this.exp)) return;
			const lfm_cov = new LfmAlbum(() => lfm_cov.onStateChange());
			lfm_cov.search(a, l, false, pe, fe, l, false, true);
		} else {
			const metadb = lib.inLibrary(2, a, l);
			if (metadb) {
				const g_img = utils.GetAlbumArtV2(metadb, 0, false);
				if (g_img) return;
			} else {
				const pth = panel.getPth('img', panel.id.focus, a, l, '', cfg.supCache);
				if (img.chkPths(pth.pe, pth.fe, 2)) return;
				const lfm_cov = new LfmAlbum(() => lfm_cov.onStateChange());
				lfm_cov.search(a, l, false, pth.pe[cfg.supCache], pth.pe[cfg.supCache] + pth.fe, l, true, true);
			}
		}
	}

	getSortedScores(li, item, prop, type) {
		switch (type) {
			case 'damerauLevenshtein':
				li.forEach(v => {
					v.score = damerauLevenshtein(item, v[prop]);
				});
				break;
			case 'fuzzyset':
				li.forEach(v => {
					const fuzzySet = FuzzySet([v[prop]], false); // (arr, [useLevenshtein])
					v.score = fuzzySet.get(item, 0, 0) ? fuzzySet.get(item, 0, 0)[0][0] : 0;  // (value, [default], [minScore]) [0][0]: [0] arr of results for 1st item -> [0] index of score in arr
				});
				break;
			case 'levenshtein':
				li.forEach(v => {
					v.score = levenshtein.get(item, v[prop]);
				});
				break;
		}
		$.sort(li, 'score', true, 'numRev');
	}

	getTrack(tr) {
		if (Date.now() - this.lastGetTrack < 500) {
			tr.force = false;
			tr.menu = false;
		} else this.lastGetTrack = Date.now();

		if (this.id.track_2 == tr.artist + tr.title && !tr.force && !tr.menu) return;
		this.id.track_2 = tr.artist + tr.title;
		const trk = tr.title.toLowerCase();

		if (cfg.dlAmRev) {
			const amTracks = panel.getPth('track', tr.focus, tr.artist, 'Track Reviews', '', '', $.clean(tr.artist), '', 'Track Reviews', 'foAmRev', true, true);
			const am_bio = panel.getPth('bio', tr.focus, tr.artist, '', true, cfg.supCache && !lib.inLibrary(0, tr.artist), $.clean(tr.artist), '', '', 'foAmBio', true, true);
			const amText = $.jsonParse(amTracks.pth, false, 'file');
			const amArtist = tr.artist;
			const amTrk = trk;

			let track_upd = !this.done('Rev ' + cfg.partialMatch + ' ' + amTracks.pth + ' ' + trk + ' ' + tr.artist, this.exp * 6);
			track_upd = track_upd && (!amText || !amText[trk] || !amText[trk].wiki && amText[trk].update < Date.now() - this.exp * 6) || tr.force;
			if (track_upd) {
				setTimeout(() => {
					const dl_am_trk = new DldAllmusicRev;
					dl_am_trk.initrev(server.url.am + 'songs/' + encodeURIComponent(amTrk + ' ' + amArtist), 'https://allmusic.com', amTrk, amArtist, amArtist, false, 'track', amTracks.fo, amTracks.pth, am_bio.fo, am_bio.pth, [], tr.force);
				}, 1600); // throttle
			}
		}

		if (cfg.dlLfmRev) {
			const lfmTracks = panel.getPth('track', tr.focus, tr.artist, 'Track Reviews', '', '', $.clean(tr.artist), '', 'Track Reviews', 'foLfmRev', true, true);
			const lfmText = $.jsonParse(lfmTracks.pth, false, 'file');

			if (!lfmText || !lfmText[trk] || lfmText[trk].update < Date.now() - this.exp || lfmText[trk].lang != cfg.language || tr.force) {
				const dl_lfm_track = new LfmTrack(() => dl_lfm_track.onStateChange());
				dl_lfm_track.search(tr.artist, trk, lfmTracks.fo, lfmTracks.pth, tr.force);
			}
		}

		if (cfg.dlWikiRev) {
			const wikiTracks = panel.getPth('track', tr.focus, tr.artist, 'Track Reviews', '', '', $.clean(tr.artist), '', 'Track Reviews', 'foWikiRev', true, true);
			const wikiText = $.jsonParse(wikiTracks.pth, false, 'file');
			const wikiAlbum = name.album(tr.focus, true);
			const wikiArtist = tr.artist;
			const wikiTrk = trk;

			if (!wikiText || !wikiText[wikiTrk] || wikiText[wikiTrk].update < Date.now() - this.exp * 6 || wikiText[wikiTrk].lang != cfg.language || tr.force) {
				setTimeout(() => {
					const dl_wiki_track = new DldWikipedia(() => dl_wiki_track.onStateChange());
					dl_wiki_track.search(0, wikiArtist, wikiTrk, wikiAlbum, wikiTrk, 3, wikiTracks.fo, wikiTracks.pth, tr.focus, tr.force);
				}, 2400); // wait for mbid & Qid & limit call frequency
			}
		}
	}
	
	match(p_a, p_release, list, type, wikipedia, force) {
		let a = p_a.toLowerCase();
		let i = 0;
		let rel = p_release.toLowerCase();
		for (i = 0; i < list.length; i++) { // simple match
			if (rel == (list[i].title || 'N/A').toLowerCase() && a == (list[i].artist || 'N/A').toLowerCase()) return i;
		}

		a = $.removeDiacritics(this.tidy(p_a, true));
		rel = $.removeDiacritics(this.tidy(p_release, true));
		for (i = 0; i < list.length; i++) { // strip match
			list[i].rel = $.removeDiacritics(this.tidy(list[i].title || 'N/A', true));
			list[i].art = $.removeDiacritics(this.tidy(list[i].artist || 'N/A', true));
			if (rel == list[i].rel && a == list[i].art) return i;
		}
		if (!cfg.partialMatchEnabled && !force) return -1;

		switch (true) {
			case type == 'review': {
				if (!wikipedia) {
					for (i = 0; i < list.length; i++)
						if (list[i].rel.includes(rel) && list[i].art.includes(a)) return i;
				}
				const stripAmp = n => n.replace(/&/g, '') || n;
				a = stripAmp(a);
				rel = stripAmp(rel);
				list.forEach(v => v.rel = stripAmp(v.rel));
				server.getSortedScores(list, rel, 'rel', 'damerauLevenshtein');
				const pm = !force ? cfg.fuzzyMatchReview : Math.min(force, cfg.fuzzyMatchReview);
				for (i = 0; i < list.length; i++)
					if (list[i].score * 100 >= pm && a == list[i].art) return i;
				break;
			}
			case type == 'song': {
				server.getSortedScores(list, rel, 'rel', 'damerauLevenshtein');
				const pm = !force ? cfg.fuzzyMatchTrack : Math.min(force, cfg.fuzzyMatchTrack);
				for (i = 0; i < list.length; i++)
					if (list[i].score * 100 >= pm && a == list[i].art) return i;
				break;
			}
			case type == 'composition': {
				server.getSortedScores(list, p_release, 'title', 'fuzzyset');
				const pm = !force ? cfg.fuzzyMatchComposition : Math.min(force, cfg.fuzzyMatchComposition);
				for (i = 0; i < list.length; i++)
					if (list[i].score * 100 >= pm && a == list[i].art) return i;
				break;
			}
		}
		return -1;
	}

	res() {
		window.NotifyOthers('bio_getText', 'bio_getText');
		txt.grab();
	}

	setImgRecycler(n) {
		if (!$.isArray(this.imgToRecycle)) {
			this.imgToRecycle = [];
			n = true;
		}
		if (n) $.save(this.bioCache, JSON.stringify(this.imgToRecycle, null, 3), true);
	}

	setLanguage(lang) {
		if (lang) this.lfm.server = lang.toLowerCase();
		this.lfm.server = this.lfm.server == 'en' ? 'www.last.fm' : 'www.last.fm/' + this.lfm.server;
		this.lfm.def_EN = this.lfm.server == 'www.last.fm';
		this.langFallback = cfg.languageFallback && !this.lfm.def_EN;
	}

	tidy(n, cutLeadThe) {
		const nn = cutLeadThe ? n.replace(/^The /i, '') : n;
		return nn.replace(/&amp(;|)/g, '&').replace(/&quot(;|)/g, '"').replace(/&#39(;|)/g, "'").replace(/&gt(;|)/g, '>').replace(/&nbsp(;|)/g, '').replace(/\band\b|\//gi, '&').replace(/[.,!?:;'\u2019"\u201C\u201D\-_()[\]\u2010\s+]/g, '').replace(/\u00D7/g, 'x').replace(/\$/g, 's').toLowerCase() || n.trim();
	}

	updateNotFound(f) {
		if (!$.file(this.notFound)) return;
		const m = $.jsonParse(this.notFound, false, 'file');
		for (let k = 0; k < m.length; k++)
			if (m[k].name == f) return;
		m.push({
			'name': f,
			'time': Date.now()
		});
		$.save(this.notFound, JSON.stringify(m, null, 3), true);
	}

	urlDone(n) {
		const keys = Object.keys(this.urlRequested);
		const now = Date.now();
		keys.forEach(v => {
			if (now - this.urlRequested[v] > 300000) { // keep for 5 min
				delete this.urlRequested[v];
			}
		});
		const done = this.urlRequested[n] ? true : false;
		if (!done) {
			this.urlRequested[n] = now;
			window.NotifyOthers('bio_webRequest', n);
		}
		return done;
	}
}

const damerauLevenshtein=(t,e,n={})=>{const h='insWeight'in n?n.insWeight:1,l='delWeight'in n?n.delWeight:1,g='subWeight'in n?n.subWeight:1,r=!('useDamerau'in n)||n.useDamerau;let i=[];if(0===t.length)return e.length*h;if(0===e.length)return t.length*l;for(let e=0;e<=t.length;e+=1)i[e]=[],i[e][0]=e*l;for(let t=0;t<=e.length;t+=1)i[0][t]=t*h;for(let n=1;n<=t.length;n+=1)for(let s=1;s<=e.length;s+=1){let a=g;t.charAt(n-1)===e.charAt(s-1)&&(a=0);const c=i[n-1][s]+l,u=i[n][s-1]+h,o=i[n-1][s-1]+a;let f=c;if(u<f&&(f=u),o<f&&(f=o),r&&n>1&&s>1&&t.charAt(n-1)===e.charAt(s-2)&&t.charAt(n-2)===e.charAt(s-1)){const t=i[n-2][s-2]+a;t<f&&(f=t)}i[n][s]=f}return 1-i[t.length][e.length]/(t.length>e.length?t.length:e.length)} // handles tranpositions (most noticeable on short items) else same as levenshtein (5 * faster than FuzzySet ~0.005ms/run) https://github.com/mrshu/node-weighted-damerau-levenshtein

const FuzzySet=(t,e,r,n)=>{const i={};t=t||[],i.gramSizeLower=r||2,i.gramSizeUpper=n||3,i.useLevenshtein='boolean'!=typeof e||e,i.exactSet={},i.matchDict={},i.items={};const h=(t,e)=>{if(null===t&&null===e)throw'Trying to compare two null values';if(null===t||null===e)return 0;const r=((t,e)=>{const r=[];let n,i;for(let h=0;h<=e.length;h++)for(let o=0;o<=t.length;o++)i=h&&o?t.charAt(o-1)===e.charAt(h-1)?n:Math.min(r[o],r[o-1],n)+1:h+o,n=r[o],r[o]=i;return r.pop()})(t=String(t),e=String(e));return t.length>e.length?1-r/t.length:1-r/e.length},o=/[^a-zA-Z0-9\u00C0-\u00FF, ]+/g,s=(t,e)=>{const r={},n=function(t,e){e=e||2;let r='-'+t.toLowerCase().replace(o,'')+'-',n=e-r.length,i=[];if(n>0)for(let t=0;t<n;++t)r+='-';for(let t=0;t<r.length-e+1;++t)i.push(r.slice(t,t+e));return i}(t,e=e||2);let i=0;for(;i<n.length;++i)n[i]in r?r[n[i]]+=1:r[n[i]]=1;return r};i.get=function(t,e,r){void 0===r&&(r=.33);const n=this._get(t,r);return n||void 0===e?n:e},i._get=function(t,e){for(let r=this.gramSizeUpper;r>=this.gramSizeLower;--r){const n=this.__get(t,r,e);if(n&&n.length>0)return n}return null},i.__get=function(t,e,r){let n,i,o,a,c,l=this._normalizeStr(t),u={},f=s(l,e),g=this.items[e],m=0;for(n in f)if(i=f[n],m+=Math.pow(i,2),n in this.matchDict)for(o=0;o<this.matchDict[n].length;++o)a=this.matchDict[n][o][0],c=this.matchDict[n][o][1],a in u?u[a]+=i*c:u[a]=i*c;if((t=>{for(let e in t)if(t.hasOwnProperty(e))return!1;return!0})(u))return null;let p,S=Math.sqrt(m),z=[];for(let t in u)p=u[t],z.push([p/(S*g[t][0]),g[t][1]]);const w=function(t,e){return t[0]<e[0]?1:t[0]>e[0]?-1:0};if(z.sort(w),this.useLevenshtein){var _=[],x=Math.min(50,z.length);for(o=0;o<x;++o)_.push([h(z[o][1],l),z[o][1]]);(z=_).sort(w)}return _=[],z.forEach(t=>{t[0]>=r&&_.push([t[0],this.exactSet[t[1]]])}),_},i.add=function(t){if(this._normalizeStr(t)in this.exactSet)return!1;let e=this.gramSizeLower;for(;e<this.gramSizeUpper+1;++e)this._add(t,e)},i._add=function(t,e){const r=this._normalizeStr(t),n=this.items[e]||[],i=n.length;n.push(0);let h,o,a=s(r,e),c=0;for(h in a)o=a[h],c+=Math.pow(o,2),h in this.matchDict?this.matchDict[h].push([i,o]):this.matchDict[h]=[[i,o]];const l=Math.sqrt(c);n[i]=[l,r],this.items[e]=n,this.exactSet[r]=t},i._normalizeStr=function(t){if('[object String]'!==Object.prototype.toString.call(t))throw'Must use a string as argument to FuzzySet functions';return t.toLowerCase()},i.length=function(){let t,e=0;for(t in this.exactSet)this.exactSet.hasOwnProperty(t)&&(e+=1);return e},i.isEmpty=function(){for(let t in this.exactSet)if(this.exactSet.hasOwnProperty(t))return!1;return!0},i.values=function(){let t,e=[];for(t in this.exactSet)this.exactSet.hasOwnProperty(t)&&e.push(this.exactSet[t]);return e};let a=i.gramSizeLower;for(;a<i.gramSizeUpper+1;++a)i.items[a]=[];for(a=0;a<t.length;++a)i.add(t[a]);return i} // best for items longer than a few words: used w/o levenshtein to help identify similar words and handle variously named compositions: may perform less well than other methods if few words (0.025ms/run) https://github.com/Glench/fuzzyset.js

class Levenshtein{constructor(){this.peq=new Uint32Array(65536)}myers_32(t,e){const h=t.length,r=e.length,n=1<<h-1;let o=-1,l=0,s=h,c=r;for(;c--;)this.peq[e.charCodeAt(c)]=0;for(c=h;c--;)this.peq[t.charCodeAt(c)]|=1<<c;for(c=0;c<r;c++){let t=this.peq[e.charCodeAt(c)];const h=t|l;(l|=~((t|=(t&o)+o^o)|o))&n&&s++,(o&=t)&n&&s--,o=o<<1|~(h|(l=l<<1|1)),l&=h}return s}myers_x(t,e){const h=e.length,r=t.length,n=[],o=[],l=Math.ceil(h/32),s=Math.ceil(r/32);let c=r;for(let t=0;t<l;t++)o[t]=-1,n[t]=0;let i=0;for(;i<s-1;i++){let l=0,s=-1;const a=32*i,g=Math.min(32,r-a);let f=h;for(;f--;)this.peq[e.charCodeAt(f)]=0;for(f=a;f<a+g;f++)this.peq[t.charCodeAt(f)]|=1<<f;c=r;for(let t=0;t<h;t++){const h=this.peq[e.charCodeAt(t)],r=o[t/32|0]>>>t%32&1,c=n[t/32|0]>>>t%32&1,i=h|l,a=((h|c)&s)+s^s|h|c;let g=l|~(a|s),f=s&a;g>>>31^r&&(o[t/32|0]^=1<<t%32),f>>>31^c&&(n[t/32|0]^=1<<t%32),s=(f=f<<1|c)|~(i|(g=g<<1|r)),l=g&i}}let a=0,g=-1;const f=32*i,p=Math.min(32,r-f);let q=h;for(;q--;)this.peq[e.charCodeAt(q)]=0;for(q=f;q<f+p;q++)this.peq[t.charCodeAt(q)]|=1<<q;c=r;for(let t=0;t<h;t++){const h=this.peq[e.charCodeAt(t)],l=o[t/32|0]>>>t%32&1,s=n[t/32|0]>>>t%32&1,i=h|a,f=((h|s)&g)+g^g|h|s;let p=a|~(f|g),q=g&f;c+=p>>>r%32-1&1,c-=q>>>r%32-1&1,p>>>31^l&&(o[t/32|0]^=1<<t%32),q>>>31^s&&(n[t/32|0]^=1<<t%32),g=(q=q<<1|s)|~(i|(p=p<<1|l)),a=p&i}return c}get(t,e){if(t.length<e.length){const h=e;e=t,t=h}return 1-(0===e.length?t.length:t.length<=32?this.myers_32(t,e):this.myers_x(t,e))/(t.length>e.length?t.length:e.length)}} // fastest (12 * faster than FuzzySet ~0.002ms/run) https://github.com/ka-weihe/fastest-levenshtein
const levenshtein = new Levenshtein;