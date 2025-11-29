'use strict';

class Tagger {
	constructor() {
		this.arr1 = [];
		this.arr2 = [];
		this.force = false;
		this.genres = [];
		this.simList = [];
		this.setGenres();

		this.score = { // version 30 May 2023; excel generated values for full precision
			artist: {
				pc: {
					baseLog: 1 / Math.log(2.1197528928493),
					scale: 306607.737952692,
					threshold: 649932.639495198
				},
				lis: {
					baseLog: 1 / Math.log(1.54156558875185),
					scale: 88645.743327167,
					threshold: 136653.22750249
				}
			},
			album: {
				pc: {
					baseLog: 1 / Math.log(2.325),
					scale: 19413.6069739138,
					threshold: 45136.6362143495
				},
				lis: {
					baseLog: 1 / Math.log(2.0205),
					scale: 3190.55694311404,
					threshold: 6446.52030356192
				}
			}
		}
	}

	// Methods

	check(handles) {
		if (!handles) return;
		let artist = '';
		let cur_artist = '####';
		let rec = 0;
		let writeSent = false;
		const tf_artist = FbTitleFormat(`$upper(${cfg.tf.artist})`);
		const artists = tf_artist.EvalWithMetadbs(handles);
		const similarArtists = [];
		const similarArr = [];

		for (let i = 0; i < handles.Count; i++) {
			artist = artists[i];
			if (artist != cur_artist) {
				cur_artist = artist;
				similarArtists[i] = '';
				const lfmBio = panel.cleanPth(cfg.pth.foLfmBio, handles[i], 'tag') + $.clean(artist) + cfg.suffix.foLfmBio + '.txt';
				if ($.file(lfmBio)) {
					const lBio = $.open(lfmBio);
					similarArtists[i] = this.getTag(lBio, panel.similarArtistsKey).tag
					if (similarArtists[i].length > 6) similarArr.push(artist);
				}
			}
		}

		if (similarArr.length) {
			let i = 0;
			timer.clear(timer.sim1);
			timer.sim1.id = setInterval(() => {
				if (i < similarArr.length) {
					const lfm_similar = new LfmSimilarArtists(() => lfm_similar.onStateChange(), lfm_similar_search_done.bind(this));
					lfm_similar.search(similarArr[i], similarArr.length, handles, 6);
					i++;
				} else timer.clear(timer.sim1);
			}, similarArr.length < 100 ? 20 : 300);
		} else this.write(handles);

		const lfm_similar_search_done = (res1, res2, p_done, p_handles) => {
			rec++;
			if (!timer.sim2.id) timer.sim2.id = setTimeout(() => {
				writeSent = true;
				this.write(p_handles);
				timer.sim2.id = null;
			}, 60000);
			this.simList.push({
				name: res1,
				similar: res2
			});
			if (p_done == rec && !writeSent) {
				timer.clear(timer.sim2);
				this.write(p_handles);
			}
		};
	}

	getScore(pc, lis, type) {
		const score = ['pc', 'lis'].map((v, i) => {
			const n = !i ? pc : lis;
			return n >= this.score[type][v].threshold ? (Math.log(n / this.score[type][v].scale) * this.score[type][v].baseLog) * 10 : (n * 0.9 / this.score[type][v].threshold + 0.1) * 10;
		});
		const pcScore = $.clamp(Math.floor(score[0]), 1, 105);
		const lisScore =  $.clamp(Math.floor(score[1]), 1, 105);
		return type == 'album' && lisScore > 99 ? 100 : $.clamp(Math.floor((pcScore + lisScore) / 2), 1, 100);
	}

	getTag(text, keywords, simple, listeners, type) {
		let ix = -1;
		let match = null;
		let v = '';
		match = text.match(RegExp(keywords));
		const correction = listeners || 0;

		if (match) {
			match = match[0];
			ix = text.lastIndexOf(match);
			if (ix != -1) {
				v = text.substring(ix + match.length - correction);
				v = v.split('\n')[0].trim();
				if (simple) return {
					tag: v,
					label: match,
					ix: ix
				};
				if (listeners) {
					const m1 = v.match(/\u200b\|[\d.,\s]*;/g);
					const m2 = v.match(/\u200b\|[\d.,\s]*$/gm);
					const playcount = m1 ? m1[0].replace(/\u200b\|/, '').slice(0, -1).trim() : '';
					const lis = m2 ? m2[0].replace(/\u200b\|/, '').trim() : '';
					const pcNum = parseInt(playcount.replace(/[,.\s]/g, ''));
					const lisNum = parseInt(lis.replace(/[,.\s]/g, ''));
					v = pcNum && lisNum ? ['Playcount', playcount, 'Listeners', lis, 'Score', this.getScore(pcNum, lisNum, type)] : '';
				} else {
					v = v.includes('\u200b') ? v.split(/\u200b,\s/) : v.split(/,\s/);
				}
			}
		}
		return {
			tag: v,
			label: match,
			ix: ix
		};
	}

	lfmTidy(n) {
		if (!cfg.useWhitelist || this.genres.length < 701) return n;
		n.forEach((v, i) => {
			this.arr1.forEach((w, j) => {
				if (!w.includes('\\b')) {
					if ($.strip(v) == w) n[i] = this.arr2[j];
				} else if (RegExp(w, 'i').test(v)) {
					n[i] = this.arr2[j]; // translate: includes is supported by regex test (regex should be 1st item of pair & must contain a word boundary marker [\b] for recognition); if test is true, 2nd item of pair is returned
				}
			});
		});
		n.forEach((v, i) => {
			const j = this.genresStripped.indexOf($.strip(v));
			n[i] = j != -1 ? this.genres[j] : ''; 
		});
		n = n.filter(v => v);
		n = this.uniq(n);
		return n;
	}

	setGenres() {
		this.genres = $.jsonParse(`${cfg.storageFolder}lastfm_genre_whitelist.json`, [], 'file-utf8'); // Regorxxx <- Force UTF-8 ->
		if (cfg.customGenres.length) {
			this.customGenres = cfg.customGenres.split(',');
			this.customGenres = this.customGenres.map(v => v.trim());
			this.genres = [...new Set(this.genres.concat(this.customGenres))];
		}
		this.genresStripped = this.genres.map(v => $.strip(v));

		this.arr1 = [];
		this.arr2 = [];
		const items = cfg.translate.split(',');
		items.forEach(v =>{
			const w = v.split('>');
			this.arr1.push($.strip(w[0]));
			this.arr2.push(w[1] ? $.strip(w[1]) : '');
		});
	}

	uniq(n) {
		const out = [];
		const seen = {};
		let j = 0;
		n.forEach(v => {
			const item = v.toLowerCase();
			if (seen[item] !== 1) {
				seen[item] = 1;
				out[j++] = $.titlecase(v).replace(/\bAor\b/g, 'AOR').replace(/\bDj\b/g, 'DJ').replace(/\bFc\b/g, 'FC').replace(/\bIdm\b/g, 'IDM').replace(/\bNwobhm\b/g, 'NWOBHM').replace(/\bR&b\b/g, 'R&B').replace(/\bRnb\b/g, 'RnB').replace(/\bUsa\b/g, 'USA').replace(/\bUs\b/g, 'US').replace(/\bUk\b/g, 'UK');
			}
		});
		return out;
	}

	write(handles, notify, notifyFocus) {
		if (!handles) return;
		const kww = 'Founded In: |Born In: |Gegr\\u00fcndet: |Formado en: |Fond\\u00e9 en: |Luogo di fondazione: |\\u51fa\\u8eab\\u5730: |Za\\u0142o\\u017cono w: |Local de funda\\u00e7\\u00e3o: |\\u041c\\u0435\\u0441\\u0442\\u043e \\u043e\\u0441\\u043d\\u043e\\u0432\\u0430\\u043d\\u0438\\u044f: |Grundat \\u00e5r: |Kuruldu\\u011fu tarih: |\\u521b\\u5efa\\u4e8e: |Geboren in: |Lugar de nacimiento: |N\\u00e9\\(e\\) en: |Luogo di nascita: |\\u51fa\\u8eab\\u5730: |Urodzony w: |Local de nascimento: |\\u041c\\u0435\\u0441\\u0442\\u043e \\u0440\\u043e\\u0436\\u0434\\u0435\\u043d\\u0438\\u044f: |F\\u00f6dd: |Do\\u011fum yeri: |\\u751f\\u4e8e: ';
		const lkw = 'Last.fm: ';
		let artist = '';
		let albumArtist = '';
		let cur_artist = '####';
		let cur_albumArtist = '####';
		let cur_album = '####';
		let album = '';
		const albGenre_am = [];
		const albGenre_w = [];
		const albListeners = [];
		const albTags = [];
		const amMoods = [];
		const amRating = [];
		const amThemes = [];
		const artGenre_am = [];
		const artGenre_w = [];
		const artListeners = [];
		const artTags = [];
		const cue = [];
		const force = this.force && notify;
		const locale = [];
		const radioStream = notify && panel.isRadio(panel.id.focus);
		const rem = [];
		const similarArtists = [];
		const tags = [];
		const tf_artist = FbTitleFormat(`$upper(${cfg.tf.artist})`);
		const tf_albumArtist = FbTitleFormat(`$upper(${cfg.tf.albumArtist})`);
		const tf_cue = FbTitleFormat('$ext(%path%)');
		const tf_l = FbTitleFormat(`$upper(${cfg.tf.album})`);
		const artists = !radioStream ? tf_artist.EvalWithMetadbs(handles) : [tf_artist.Eval()];
		const albumArtists = tf_albumArtist.EvalWithMetadbs(handles);
		const cues = tf_cue.EvalWithMetadbs(handles);
		const albums = tf_l.EvalWithMetadbs(handles);

		this.setGenres();

		for (let i = 0; i < handles.Count; i++) {
			artist = artists[i];
			albumArtist = albumArtists[i];
			cue[i] = cues[i].toLowerCase() == 'cue';
			album = albums[i];
			album = !cfg.albStrip ? name.albumTidy(album) : name.albumClean(album);
			if (artist != cur_artist) {
				cur_artist = artist;
				similarArtists[i] = '';
				if (cfg.tagEnabled7 || cfg.tagEnabled8 || cfg.tagEnabled9 || cfg.tagEnabled10 && cfg.tagEnabled13 < 7 || force) {
					artTags[i] = '';
					artListeners[i] = '';
					locale[i] = '';
					const lfmBio = panel.cleanPth(cfg.pth.foLfmBio, !radioStream ? handles[i] : panel.id.focus, !radioStream ? 'tag' : 'notifyRadioStream') + $.clean(artist) + cfg.suffix.foLfmBio + '.txt';
					if ($.file(lfmBio)) {
						const lBio = $.open(lfmBio);
						if (cfg.tagEnabled7 || force) {
							artTags[i] = this.getTag(lBio, 'Top Tags: ').tag;
							if (artTags[i]) artTags[i] = this.lfmTidy(artTags[i]);
						}
						if (cfg.tagEnabled8) artListeners[i] = this.getTag(lBio, lkw, false, 1, 'artist').tag;
						if (cfg.tagEnabled9 || force) locale[i] = this.getTag(lBio, kww).tag;
						if ((cfg.tagEnabled10 || force) && cfg.tagEnabled13 < 7) {
							similarArtists[i] = this.getTag(lBio, panel.similarArtistsKey).tag;
							if (similarArtists[i].length > 6) {
								similarArtists[i] = '';
								this.simList.some(v => {
									if (v.name == artist && v.similar.length) {
										similarArtists[i] = v.similar;
										return true;
									}
								});
							}
							if (similarArtists[i]) $.take(similarArtists[i], cfg.tagEnabled13);
						}
					}
				}
				if (!similarArtists[i].length) similarArtists[i] = '';
				if (cfg.tagEnabled12 || !locale[i] && notify || force) {
					artGenre_w[i] = '';
					const wikiBio = panel.cleanPth(cfg.pth.foWikiBio, !radioStream ? handles[i] : panel.id.focus, !radioStream ? 'tag' : 'notifyRadioStream') + $.clean(artist) + cfg.suffix.foWikiBio + '.txt';
					if ($.file(wikiBio)) {
						const wBio = $.open(wikiBio);
						artGenre_w[i] = this.getTag(wBio, 'Genre: ').tag;
						if (!locale[i] && notify) locale[i] = this.getTag(wBio, kww).tag;
					}
				}
				if (cfg.tagEnabled4 || !locale[i] && notify || force) {
					artGenre_am[i] = '';
					const amBio = panel.cleanPth(cfg.pth.foAmBio, !radioStream ? handles[i] : panel.id.focus, !radioStream ? 'tag' : 'notifyRadioStream') + $.clean(artist) + cfg.suffix.foAmBio + '.txt';
					if ($.file(amBio)) {
						const aBio = $.open(amBio);
						artGenre_am[i] = this.getTag(aBio, 'Genre: ').tag;
						const localeTag = this.getTag(aBio, 'Formed: |Born: ').tag;
						if (localeTag.length && !/\s*in\s/.test(localeTag[0])) localeTag.shift();
						if (localeTag.length && /\s*in\s/.test(localeTag[0])) localeTag[0] = localeTag[0].split(/\s*in\s/)[1].trim();
						if (!locale[i] && notify) locale[i] = localeTag;
						if (!locale[i] || !locale[i].length) locale[i] = ''; // Regorxxx <- Fix tagging crash ->
					}
				}
				// Regorxxx <- Fix country retrieval if flag is available with other methods
				if (!locale[i] && (notify || cfg.tagEnabled9 || force)) {
					let code = (txt.countryCodesDic[artist.toLowerCase()] || '').slice(0, 2);
					let country = '';
					if (code) { country = codeToCountry[code] || ''; }
					else { country = FbTitleFormat('[$meta(artistcountry,0)]').EvalWithMetadb(handles[i]); }
					if (country.length) { locale[i] = [country]; }
					if (!locale[i] || !locale[i].length) { locale[i] = ''; }
				}
				// Regorxxx ->
			} else {
				artGenre_am[i] = artGenre_am[i - 1];
				artGenre_w[i] = artGenre_w[i - 1];
				artListeners[i] = artListeners[i - 1];
				artTags[i] = artTags[i - 1];
				locale[i] = locale[i - 1];
				similarArtists[i] = similarArtists[i - 1];
			}
			if (albumArtist + album != cur_albumArtist + cur_album) {
				cur_albumArtist = albumArtist;
				cur_album = album;
				if (cfg.tagEnabled0 || cfg.tagEnabled1 || cfg.tagEnabled2 || cfg.tagEnabled3 || force) {
					albGenre_am[i] = '';
					amMoods[i] = '';
					amRating[i] = '';
					amThemes[i] = '';
					let amRev = panel.cleanPth(cfg.pth.foAmRev, handles[i], 'tag') + $.clean(albumArtist) + ' - ' + $.clean(album) + cfg.suffix.foAmRev + '.txt';
					if (amRev.length > 259) {
						album = $.abbreviate(album);
						amRev = panel.cleanPth(cfg.pth.foAmRev, handles[i], 'tag') + $.clean(albumArtist) + ' - ' + $.clean(album) + cfg.suffix.foAmRev + '.txt';
					}
					if ($.file(amRev)) {
						const aRev = $.open(amRev);
						if (cfg.tagEnabled0 || force) albGenre_am[i] = this.getTag(aRev, 'Genre: ').tag;
						if (cfg.tagEnabled1 || force) amMoods[i] = this.getTag(aRev, 'Album Moods: ').tag;
						if (cfg.tagEnabled2) {
							const b = aRev.indexOf('>> Album rating: ') + 17;
							const f = aRev.indexOf(' <<');
							if (b != -1 && f != -1 && f > b) {
								amRating[i] = aRev.substring(b, f).trim() * 2;
								if (amRating[i] == 0) amRating[i] = '';
							}
						}
						if (cfg.tagEnabled3 || force) amThemes[i] = this.getTag(aRev, 'Album Themes: ').tag;
					}
				}
				if (cfg.tagEnabled5 || cfg.tagEnabled6 || force) {
					albTags[i] = '';
					albListeners[i] = '';
					let lfmRev = panel.cleanPth(cfg.pth.foLfmRev, handles[i], 'tag') + $.clean(albumArtist) + ' - ' + $.clean(album) + cfg.suffix.foLfmRev + '.txt';
					if (lfmRev.length > 259) {
						album = $.abbreviate(album);
						lfmRev = panel.cleanPth(cfg.pth.foLfmRev, handles[i], 'tag') + $.clean(albumArtist) + ' - ' + $.clean(album) + cfg.suffix.foLfmRev + '.txt';
					}
					if ($.file(lfmRev)) {
						const lRev = $.open(lfmRev);
						if (cfg.tagEnabled5 || force) {
							albTags[i] = this.getTag(lRev, 'Top Tags: ').tag;
							if (albTags[i]) albTags[i] = this.lfmTidy(albTags[i]);
						}
						if (cfg.tagEnabled6) albListeners[i] = this.getTag(lRev, lkw, false, 1, 'album').tag;
					}
				}
				if (cfg.tagEnabled11 || force) {
					albGenre_w[i] = '';
					let wikiRev = panel.cleanPth(cfg.pth.foWikiRev, handles[i], 'tag') + $.clean(albumArtist) + ' - ' + $.clean(album) + cfg.suffix.foWikiRev + '.txt';
					if (wikiRev.length > 259) {
						album = $.abbreviate(album);
						wikiRev = panel.cleanPth(cfg.pth.foWikiRev, handles[i], 'tag') + $.clean(albumArtist) + ' - ' + $.clean(album) + cfg.suffix.foWikiRev + '.txt';
					}
					if ($.file(wikiRev)) {
						const wRev = $.open(wikiRev);
						albGenre_w[i] = this.getTag(wRev, 'Genre: ').tag;
					}
				}
			} else {
				albGenre_am[i] = albGenre_am[i - 1];
				albGenre_w[i] = albGenre_w[i - 1];
				albListeners[i] = albListeners[i - 1];
				amMoods[i] = amMoods[i - 1];
				amRating[i] = amRating[i - 1];
				amThemes[i] = amThemes[i - 1];
				albTags[i] = albTags[i - 1];
			}
		}

		for (let j = 0; j < 13; j++) this[`tagName${j}`] = !notify ? cfg[`tagName${j}`] : cfg[`tagName${j}_internal`].default_value;

		for (let i = 0; i < handles.Count; i++) {
			if (!cue[i] && (albGenre_am[i] || amMoods[i] || amRating[i] || amThemes[i] || artGenre_am[i] || albTags[i] || albListeners[i] || artTags[i] || artListeners[i] || locale[i] || similarArtists[i] || albGenre_w[i] || artGenre_w[i])) {
				const tg = {};
				if (albGenre_am[i]) tg[this.tagName0] = albGenre_am[i];
				if (amMoods[i]) tg[this.tagName1] = amMoods[i];
				if (amRating[i]) tg[this.tagName2] = amRating[i];
				if (amThemes[i]) tg[ this.tagName3] = amThemes[i];
				if (artGenre_am[i]) tg[this.tagName4] = artGenre_am[i];
				if (albTags[i]) tg[this.tagName5] = albTags[i];
				if (albListeners[i]) tg[this.tagName6] = albListeners[i];
				if (artTags[i]) tg[this.tagName7] = artTags[i];
				if (artListeners[i]) tg[this.tagName8] = artListeners[i];
				if (locale[i]) tg[this.tagName9] = locale[i];
				if (similarArtists[i]) tg[this.tagName10] = similarArtists[i];
				if (albGenre_w[i]) tg[this.tagName11] = albGenre_w[i];
				if (artGenre_w[i]) tg[this.tagName12] = artGenre_w[i];
				tags.push(tg);
			} else rem.push(i);
		}
		let i = rem.length;
		while (i--) handles.RemoveById(rem[i]);
		if (handles.Count && tags.length && notify) {
			window.NotifyOthers('biographyTags', {
				artist: artists[0],
				album: albums[0],
				handle: handles[0],
				selectionMode: !panel.id.focus ? '首选正在播放项' : '跟随所选音轨（播放列表）',// Regorxxx <- Fix bugged notification of selection mode ->
				tags: tags[0]
			});
		}
		if (notify) return;
		if (handles.Count) handles.UpdateFileInfoFromJSON(JSON.stringify(tags));
	}
}