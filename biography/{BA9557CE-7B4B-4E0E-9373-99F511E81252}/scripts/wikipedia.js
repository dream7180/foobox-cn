'use strict';

class DldWikipedia {
	constructor(state_callback) {
		this.alias = '';
		this.alwaysCheckArtistInWiki = true;
		this.album;
		this.ar_mbid = '';
		this.aridType = 0;
		this.artist;
		this.artistValidated = false;
		this.fallBackDone = false;
		this.fo;
		this.focus = false;
		this.force;
		this.func = null;
		this.genres = [];
		this.init = true;
		this.lookUpArt = false;
		this.lookUpAlb = false;
		this.lookUpComp = false;
		this.name = '';
		this.offset = 0;
		this.pth;		
		this.ready_callback = state_callback;
		this.recording;
		this.related_artist = '';
		this.releases = 0;
		this.rg_mbid = '';
		this.artistWorksChecked = false;
		this.searchItem = 0;
		this.site = cfg.language.toLowerCase();
		this.tagChecked = false;
		this.timer = null;
		this.title;
		this.type;
		this.user_mbid = false
		this.wiki = '';
		this.wikidata = '';
		this.wikidataArtist = '';
		this.wikidataFirst = '';
		this.wikititle = '';
		this.xmlhttp = null;

		this.info = {
			active: '',
			bornIn: '',
			composer: [],
			end: '',
			foundedIn: '',
			genre: [],
			length: '',
			released: '',
			start: ''
		}
	}

	onStateChange() {
		if (this.xmlhttp != null && this.func != null)
			if (this.xmlhttp.readyState == 4) {
				clearTimeout(this.timer);
				this.timer = null;
				if (this.xmlhttp.status == 200) this.func();
				else {
					this.save();
				}
			}
	}

	search(p_searchItem, p_artist, p_title, p_album, p_recording, p_type, p_fo, p_pth, p_focus, p_force) {
		let URL = '';
		this.searchItem = p_searchItem;
		if (this.init) {
			this.album = p_album;
			if (p_type == '!stndBio') this.aridType = 2; // !stndBio recording or release methods can't be used
			this.artist = p_artist;
			this.focus = p_focus;
			this.force = p_force;
			this.lookUpArt = p_type == '!stndBio';
			this.lookUpAlb = p_type == '!stndAlb';
			this.lookUpComp = p_type == '!stndComp';
			this.recording = p_recording;
			this.title = p_title;
			this.name = this.artist + (this.title ? ` - ${$.titlecase(this.title)}` : ``);
			this.type = p_type == '!stndBio' ? 0 : p_type == '!stndAlb' ? 1 : p_type == '!stndComp' ? 2 : p_type;
			this.fo = p_fo;
			this.pth = p_pth;
			this.init = false;
		}

		if (!this.tagChecked) {
			this.getRgMbid();
			if (this.lookUpArt || this.lookUpAlb || this.lookUpComp) {
				this.ar_mbid = '';
				this.tagChecked = true;
			} else {
				this.ar_mbid = $.eval('$trim($if3(%musicbrainz_artistid%,%musicbrainz artist id%,))', this.focus);
				if (!this.ar_mbid || this.ar_mbid.length != 36) {
					const related_artists = $.jsonParse(`${cfg.storageFolder.replace('{BA9557CE-7B4B-4E0E-9373-99F511E81252}', '{F5E9D9EB-42AD-4A47-B8EE-C9877A8E7851}')}related_artists.json`, {}, 'file');
					this.ar_mbid = related_artists[this.artist.toUpperCase()]; // f&p says if it's a tag read
				}
				if ((!this.ar_mbid || this.ar_mbid.length != 36) && !this.force) this.ar_mbid = server.artistMbid[this.artist];
				if (!this.ar_mbid || this.ar_mbid.length != 36) this.ar_mbid = '';
				this.tagChecked = true;
			}
		}

		this.func = null;
		this.xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
		
		switch (this.searchItem) {
			case 0:
				if (this.ar_mbid) return this.search(1);
				switch (this.aridType) {
					case 0:
						URL = server.url.mb + 'recording/?query=' + encodeURIComponent($.regexEscape(this.recording.toLowerCase())) + ' AND artist:' + encodeURIComponent($.regexEscape(this.artist.toLowerCase())) + '&fmt=json';
						break;
					case 1:
						URL = server.url.mb + 'release-group/?query=' + encodeURIComponent($.regexEscape(this.album.toLowerCase())) + ' AND artist:' + encodeURIComponent($.regexEscape(this.artist.toLowerCase())) + ' AND  (primarytype:Album OR primarytype:EP)&fmt=json';
						break;
					case 2:
						URL = server.url.mb + 'artist/?query=' + encodeURIComponent($.regexEscape(this.artist.toLowerCase())) + '&fmt=json';
						break;
				}
				break;
			case 1:
				if (this.type && !this.force) {
					this.wikidataArtist = $.getProp(server.artistQid, `${this.artist}.code`, '');
					this.alias = $.getProp(server.artistQid, `${this.artist}.alias`, '');
				}
				if (!this.type || !this.wikidataArtist) {
					URL = server.url.mb + 'artist/' + this.ar_mbid + '?inc=genres+url-rels&fmt=json';
				}
				if (this.type && this.wikidataArtist) {
					return this.search(2);
				}
				break;
			case 2: {
				if (this.rg_mbid) {
					return this.search(3);
				}
				let params = '';
				if (this.type == 1 || this.type == 3) params = ' AND arid:' + this.ar_mbid + ' AND ' + (this.type == 1 ? '(primarytype:Album OR primarytype:EP)' : 'primarytype:Single');
				const type = this.type == 2 || this.type == 4 ? 'work' : 'release-group';
				URL = server.url.mb + type + '?query='+ encodeURIComponent($.regexEscape(this.title.toLowerCase()) + params) + '&fmt=json';
				break;
			}
			case 3:
				URL = server.url.mb + (this.type == 2 || this.type == 4 ? 'work/' : 'release-group/') + this.rg_mbid + '?inc=genres+url-rels&fmt=json';
				break;
			case 4: {
				let lang = cfg.language == 'EN' ? 'enwiki' : `${cfg.language.toLowerCase()}wiki`;
				if (server.langFallback) lang += '|enwiki';
				URL = server.url.wikidata + this.wikidata + '&sitefilter=' + lang;
				break;
			}
			case 5:
				URL = server.url.wikipedia.replace(`//lang`, `//${this.site}`) + this.wikititle; // encodeURIComponent broke Y Viva España
				break;
			case 6: {
				this.artistValidated = true;
				setTimeout(() => {
					URL = server.url.mb + 'work?artist=' + this.ar_mbid + '&limit=100&offset=' + this.offset + '&fmt=json';
					this.get(URL, this.force);
				}, 1200);
				break;
			}
			case 7:
				setTimeout(() => {
					URL = server.url.wikisearch + encodeURIComponent(this.title + (this.type == 1 ? ' ' + this.artist : ''));
					this.get(URL, this.force);
				}, 1200);
				break;
			case 8: {
				const site = this.site == 'en' || cfg.wikipediaEnGenres ? 'en' : this.site;
				URL = server.url.wikiinfo.replace(`//lang`, `//${site}`) + this.wikititle;
				break;
			}
		}
		if (this.searchItem != 6 && this.searchItem != 7) this.get(URL, this.force);
	}

	analyse() {
		switch (this.searchItem) {
			case 0: // getArtistMbid
				switch (this.aridType) {
					case 0: case 1: { // recording or release-group match
						const data = $.jsonParse(this.xmlhttp.responseText, [], 'get', !this.aridType ? 'recordings' : 'release-groups');
						if (!data.length) {
							this.aridType = !this.aridType && this.album ? 1 : 2;
							return this.search(0);
						}
						const list = [];
						data.forEach(v => {
							const i = server.match(this.artist, !this.aridType ? this.recording : this.album, [{artist: this.artist, title: v.title}], this.type != 2 ? (!this.aridType ? 'song' : 'album') : 'composition', true, 80);
							if (i != -1) list.push(v);
						});
						const artist = $.strip(this.artist);
						list.some(v => {
							if (this.ar_mbid) return true;
							v['artist-credit'].some(w => {
								if (artist == $.strip(w.artist.name)) {
									server.artistMbid[this.artist] = this.ar_mbid = w.artist.id;
									return true;
								}
							});
						});	
						list.some(v => {
							if (this.ar_mbid) return true;
							v['artist-credit'].some(w => {
								if (this.ar_mbid) return true;
								if (w.artist.aliases) {
									w.artist.aliases.some(u => {
										if (artist == $.strip(u.name)) {
											this.alias = u.name;
											server.artistMbid[this.artist] = this.ar_mbid = w.artist.id;
											return true;
										}
									});
								}
							});
						});
						if (!this.ar_mbid && cfg.partialMatchEnabled) {
							let alias = server.tidy(this.artist, true);
							if (alias) {
								list.some(v => {
									if (this.ar_mbid) return true;
									v['artist-credit'].some(w => {
										if (alias == server.tidy(w.artist.name, true)) {
											this.alias = w.artist.name;
											server.artistMbid[this.artist] = this.ar_mbid = w.artist.id;
											return true;
										}
									});
								});
							}
						}
						this.aridType = !this.aridType && this.album ? 1 : 2;
						return this.search(this.ar_mbid ? 1 : 0);
					}
					case 2: { // artist name match: type 0: only accepted if single name match: others try wikipedia direct as can validate then
						const data = $.jsonParse(this.xmlhttp.responseText, [], 'get', 'artists');
						if (!data.length) {
							if (this.doFallbackSearch()) return;
							if (this.type || !$.file(this.pth)) return $.trace('维基百科：' + this.artist + '：在 musicbrainz 上名称不匹配', true);
						}
						const artist = $.strip(this.artist);
						const aliases = [];
						let items = [];
						items = data.filter(v => artist == $.strip(v.name));
						if (items.length == 1 || this.type == 2) server.artistMbid[this.artist] = this.ar_mbid = items[0].id;
						if (!items.length) {
							data.forEach(v => {
								if (v.aliases) {
									v.aliases.forEach(w => {
										if (artist == $.strip(w.name)) {
											aliases.push({name: w.name, id: v.id});
										}
									});
								}
							});	
							if (aliases.length == 1 || this.type == 2) {
								server.artistMbid[this.artist] = this.ar_mbid = aliases[0].id;
								this.alias = aliases[0].name;
							}
							
						}
						if (!this.ar_mbid) {
							if (this.doFallbackSearch()) return; // type 1-4
							if (this.type || !$.file(this.pth)) return $.trace('维基百科：' + this.artist + (items.length > 1 || aliases.length > 1 ? '：无法消除多个同名艺术家的歧义：鉴别器' + (!this.lookUpArt ? '，专辑名称或音轨标题，不匹配' : ' 查找菜单不可用') : '：在 musicbrainz 上名称不匹配'), true); // type 0 only
						}
						return this.search(1);
					}
				}
				break;
			case 1: { // extractMbArtistLinks
				let data;
				data = $.jsonParse(this.xmlhttp.responseText, []);
				this.related_artist = data.name != this.artist ? data.name : ''; // name could differ if related_artist or tag mbid; needed for direct en wikipedia validation
				if (!this.type) {
					this.genres = data['genres'].filter(v => v.count > 0).sort((a, b) => b.count - a.count);
					$.take(this.genres, 5);
					this.genres = this.genres.map(v => $.titlecase(v.name));
				}
				
				let countryCode = '';
				['area.iso-3166-1-codes.0', 'area.iso-3166-2-codes.0', 'begin-area.iso-3166-1-codes.0', 'begin-area.iso-3166-2-codes.0'].some(v => countryCode = $.jsonParse(this.xmlhttp.responseText, '', 'get', v));
				this.saveCountryCode(countryCode, this.force);

				data = $.jsonParse(this.xmlhttp.responseText, [], 'get', 'relations');
				this.wikidata = '';
				this.wikititle = '';
				let wikidataCount = 0;

				data.forEach(v => {
					if (v.type == 'wikidata') wikidataCount++;
				});
				if (wikidataCount == 1) {
					data.some(v => {
						if (v.type == 'wikidata') { 
							return this.wikidata = v.url.resource;
						}
					});
				} else if (wikidataCount > 1) {
					data.some(v => {
							if (v.type == 'wikidata' && (!v['source-credit'] || $.strip(v['source-credit']).includes($.strip(this.artist)))) {
							return this.wikidata = v.url.resource;
						}
					});
				}
				this.wikidataArtist = this.wikidata = this.wikidata.split('/').pop();
				server.artistQid[this.artist] = {
					alias: this.alias,
					code: this.wikidata
				}
				if (this.wikidata) {
					return this.search(!this.type ? 4 : 2);
				}
				let wikidata = '';
				if (!this.type && cfg.language == 'EN') {
					data.some(v => {
						if (v.type == 'wikipedia' && v.url.resource && v.url.resource.includes('//en.') && !v.url.resource.includes(`disambiguation`)) return wikidata = v.url.resource;
					});
					this.wikititle = wikidata.split('/').pop();
					if (this.wikititle) {
						this.site = 'en'
						return this.search(5);
					}
				}
				this.save();
				break;
			}
			case 2: { // getItemMbid
				let data = $.jsonParse(this.xmlhttp.responseText, [], 'get', this.type != 2 && this.type != 4 ? 'release-groups' : 'works');
				let list = [];
				const filteredList = []; // check work disambiguation
				const ar = $.strip(this.related_artist || this.artist);
				data.forEach(v => {
					list.push({artist: this.artist, date: Date.parse(v['first-release-date']) || 0, rg_mbid: v.id, title: v.title, type: v['primary-type']});
					if (this.type == 2 || this.type == 4) {
						const name = v.relations;
						let disamb = '';
						let nm = '';
						if (name.length && name[0].artist) {
							nm = name[0].artist.name || '';
							disamb = name[0].artist.disambiguation || '';
						}
						if (levenshtein.get($.strip(nm), ar) > 0.8 || levenshtein.get($.strip(disamb), ar) > 0.8) filteredList.push({artist: this.artist, date: Date.parse(v['first-release-date']) || 0, rg_mbid: v.id, title: v.title});
					}
				});
				$.sort(list, 'date', 'num');
				$.sort(list, 'type');
				let i = -1;
				if (this.type == 2 || this.type == 4) {
					i = server.match(this.artist, this.title, filteredList, ['', 'review', 'composition', 'song', 'song'][this.type], true);
					if (i != -1) this.rg_mbid = filteredList[i].rg_mbid;
				}
				if (i == -1) {
					i = server.match(this.artist, this.title, list, ['', 'review', 'composition', 'song', 'song'][this.type], true);
					if (i != -1) this.rg_mbid = list[i].rg_mbid;
				}
				if (i == -1) {
					if (this.type == 1) {
						return this.save();
					}
					if ((this.type == 2 || this.type == 4) && !this.artistWorksChecked) {
						this.artistWorksChecked = true;
						return this.search(6);
					}
					if (this.type == 3) { // try song via works
						this.type = 4;
						this.getRgMbid();
						return this.search(2);
					}
				}
				return this.search(3);
			}
			case 3: { // extractMbItemLinks
				let data;
				if (this.type != 4) {
					data = $.jsonParse(this.xmlhttp.responseText, []);
					this.genres = data['genres'].filter(v => v.count > 0).sort((a, b) => b.count - a.count);
					$.take(this.genres, 5);
					this.genres = this.genres.map(v => $.titlecase(v.name));
				}

				data = $.jsonParse(this.xmlhttp.responseText, [], 'get', 'relations');
				this.wikidata = '';
				data.forEach(v => { // occasionally > 1 link: no obvious discriminators: use earliest: more likely to be main one (less likely to be a video etc)
					if (v.type == 'wikidata') {
						const newId = v.url.resource.split('/').pop();
						const curId = this.wikidata.replace('Q', '');
						if (!this.wikidata || parseInt(newId.replace('Q', '')) < parseInt(curId)) this.wikidata = newId;
					}
				});
				this.wikidata = this.wikidata.split('/').pop();
				if (this.wikidata) {
					return this.search(4);
				}
				this.wikidata = '';
				this.wikititle = '';
				if (cfg.language == 'EN') {
					data.some(v => {
						if (v.type == 'wikipedia' && v.url.resource && v.url.resource.includes('//en.') && !v.url.resource.includes(`disambiguation`)) return this.wikidata = v.url.resource;
					});
					this.wikititle = this.wikidata.split('/').pop();
					if (this.wikititle) {
						this.site = 'en'
						return this.search(5);
					}
				}
				if ((this.type == 2 || this.type == 4) && !this.artistWorksChecked) { // try all artist works if query doesn't yield correct match
					this.artistWorksChecked = true;
					return this.search(6);
				}
				if (this.type == 3) { // try song via works
					this.type = 4;
					this.getRgMbid();
					return this.search(2);
				}
				this.save();
				break;
			}
			case 4:	{ // parseWikidata
				const data = $.jsonParse(this.xmlhttp.responseText, {});
				if (this.alwaysCheckArtistInWiki && this.type || !this.artistValidated && (this.type == 2 || this.type == 4 || this.fallBackDone)) this.artistValidated = this.wikidataArtist ? this.xmlhttp.responseText.includes(`${this.wikidataArtist}`) : false;
				const wikititles = server.getObjKeyValue(data, 'title');
				const wikiurls = server.getObjKeyValue(data, 'url');
				this.wikititle = '';
				wikiurls.some((v, i) => {
					if (v.includes(`${cfg.language.toLowerCase()}.wikipedia`) && !v.includes(`disambiguation`)) {
						this.site = cfg.language.toLowerCase();
						this.wikititle = encodeURIComponent(wikititles[i]);
						return true;
					}
				});
				if (!this.wikititle && server.langFallback) {
					wikiurls.some((v, i) => {
						if (v.includes(`en.wikipedia`) && !v.includes(`disambiguation`)) {
							this.site = 'en';
							this.wikititle = wikititles[i];
							return true;
						}
					});
				}
				if (this.wikititle) {
					return this.search(5);
				}
				if ((this.type == 2 || this.type == 4) && !this.artistWorksChecked) {
					this.artistWorksChecked = true;
					return this.search(6);
				}
				if (this.type == 3) { // try song via works
					this.type = 4;
					this.getRgMbid();
					return this.search(2);
				}
				this.save();
				break;
			}
			case 5:	{ // parseWikipediaResponse
				const data = $.jsonParse(this.xmlhttp.responseText, {});
				this.wiki = server.getObjKeyValue(data, 'extract')[0] || '';
				const needArtistCheck = this.alwaysCheckArtistInWiki && this.type || this.type == 2 || this.type == 4 || this.fallBackDone;
				
				if (!this.artistValidated && needArtistCheck) {
					this.artistValidated = this.includesArtist(this.wiki);
				}

				if (needArtistCheck && !this.artistValidated) {
					this.wiki = '';
					if ((this.type == 2 || this.type == 4) && !this.artistWorksChecked) { // try all artist works if query doesn't yield correct match
						this.artistWorksChecked = true;
						return this.search(6);
					}
				}
				this.formatWiki(this.wiki);
				if (this.wiki) return this.search(8);
				this.save();
				break;
			}
			case 6: { // artistWorks
				const response = $.jsonParse(this.xmlhttp.responseText, [], 'get', 'works');
				if (!this.offset) this.releases = $.jsonParse(this.xmlhttp.responseText, 0, 'get', 'work-count');
				let list = [];
				response.forEach(v => {
					list.push({artist: this.artist, rg_mbid: v.id, title: v.title});
				});
				const i = server.match(this.artist, this.title, list, ['', 'review', 'composition', 'song', 'song'][this.type], true);
				if (i == -1) {
					this.offset += 100;
					if (this.releases > this.offset) {
						return this.search(6);
					} else {
						if (this.doFallbackSearch()) return;
						return $.trace('维基百科：' + this.name + '：未找到', true);
					}
				}
				this.rg_mbid = list[i].rg_mbid;
				return this.search(2);
			}
			case 7: { // directSearch
				const data = $.jsonParse(this.xmlhttp.responseText, [], 'get', 'query.search');
				const al = '\\balbum\\b|\\bep\\b';
				const tr = '\\bsong\\b|\\bsingle\\b|\\binstrumental\\b';
				const disambig = ['', al, '', tr, tr][this.type];
				this.wikidata = ''
				this.artistValidated = false;
				const list = []
				data.forEach(v => {
					const snippet = this.tidy(v.snippet);
					const titlesnippet = this.tidy(v.titlesnippet);
					if (this.includesArtist(snippet) && RegExp(disambig, 'i').test(snippet)) list.push({artist: this.artist, id: v.title, title: titlesnippet});
					if (!this.wikidataFirst && RegExp(disambig, 'i').test(snippet))  {
						this.wikidataFirst = v.title;
					}
				});
				let i = server.match(this.artist, this.title, list, ['', 'review', 'composition', 'song', 'song'][this.type], true);
				if (i != -1) {
					this.wikidata = list[i].id;
					this.artistValidated = true;
					return this.search(4);
				} else if (this.wikidataFirst) { // check 1st disambigOnly match if no full match
					this.wikidata = this.wikidataFirst;
					return this.search(4);
				}
				this.save();
				break;
			}
			case 8: {			
				const json = $.jsonParse(this.xmlhttp.responseText, {}, 'get', 'query.pages');
				const key = Object.keys(json);
				if (!key.length) {this.save(); break;}
				let source = infobox.cleanText($.getProp(json, `${key[0]}.revisions.0.slots.main.*`, ''), this.site);
				if (!source || /#REDIRECT/i.test(source)) {this.save(); break;}
				this.info = infobox.getValues(this.type, source, this.site);
				this.save();
				break;
			}
		}
	}

	tidy(n) {
		return n.replace(/<span([\s\S]+?)>/g, '').replace(/<\/span>/g, '');
	}

	checkTypeOf() {
		if (this.type > 2) return;
		this.info.genre = $.isArray(this.info.genre) ? this.info.genre.join('\u200b, ') : '';
		this.genres = $.isArray(this.genres) ? this.genres.join('\u200b, ') : '';
	}

	doFallbackSearch() {
		if (this.type && !this.fallBackDone/* && !this.user_mbid*/) { // uncomment to block fallback if user_mbid
			this.fallBackDone = true;
			this.search(7);
			return true;
		}
		return false;
	}

	formatWiki(source) {
		const disambPage = /^.*may refer to:$/.test(source.split('\n')[0]); // disambiguation flag en only
		if (disambPage || source == 'nicks') { // nicks = redirected en only
			this.wiki = '';
			return;
		}
		const disallowed = 'See also|References|Sources|Book sources|External links|Bibliography'; // en only: mostly text return will have these stripped anyway
		const headings = this.getHeadings(source);

		let next = headings[0];
		let content = source // abstract
			.substring(0, next ? next.start : undefined)
			.trim();

		const sections = [{title: '', content}];
		headings.forEach((v, i) => {
			next = headings[i + 1];
			content = source
				.substring(v.end, next ? next.start : undefined)
				.trim();
				if (content.length > 150 && !RegExp(disallowed, 'i').test(v.title)) sections.push({title: v.title + '\r\n\r\n', content});
		});
		
		let text = '';
		sections.forEach(v=> {
			text += (text ? '\r\n\r\n' : '') + v.title + this.tidyWiki(v.content, this.site == 'en'); 
		}) 

		this.wiki = text;
	}

	get(URL, force) {
		this.func = this.analyse;
		if (ppt.multiServer && !force && server.urlDone(md5.hashStr(this.artist + this.title + this.type + this.pth + cfg.partialMatch + URL))) return;
		try{
			this.xmlhttp.open('GET', URL);
			this.xmlhttp.onreadystatechange = this.ready_callback;
			this.xmlhttp.setRequestHeader('User-Agent', 'foobar2000_yttm (https://hydrogenaud.io/index.php/topic,111059.0.html)');
			if (force) this.xmlhttp.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
			if (!this.timer) {
				const a = this.xmlhttp;
				this.timer = setTimeout(() => {
					a.abort();
					this.timer = null;
				}, 60000);
			}
			this.xmlhttp.send();
		}catch(e){}
	}

	getHeadings(text) {
		let match;
		const headingPattern = /==+(?:(?!\n)\s?)(?:(?!==|\n)[^])+(?:(?!\n)\s?)==+/g;
		const matches = [];
		while ((match = headingPattern.exec(text)) !== null) {
			matches.push({
				title: match[0].trim(),
				start: match.index,
				end: match.index + match[0].length
			});
		}
		return matches;
	}

	getRgMbid() {
		if (this.lookUpAlb || this.lookUpComp) {
			this.rg_mbid = '';
			return;
		}
		const type1 = ['', 'releasegroup', 'work', 'releasegroup', 'work'][this.type];
		const type2 = ['', 'releasegroup', 'work', 'release group', 'work'][this.type];
		this.rg_mbid = $.eval(`$trim($if3(%musicbrainz_${type1}id%,%musicBrainz ${type2} id%,))`, this.focus);
		if (!this.rg_mbid || this.rg_mbid.length != 36) this.rg_mbid = '';
		if (this.rg_mbid) this.user_mbid = true;
	}

	includesArtist(text) {
		text = text.replace(/ and /gi, ' & ');
		const altArtist = this.artist.length > 6 && !/^The The$/i.test(this.artist) ? this.artist.replace(/^The /i, '') : '';
		const arr = [...new Set([this.artist, this.related_artist, this.alias, altArtist, $.removeDiacritics(this.artist)].map(v => v.replace(/ and /gi, ' & ')).filter(Boolean))];
		if (this.artist == 'Various Artists') arr.push('compilation');
		return arr.some(v => {
			const w = $.regexEscape(v);
			return w && RegExp(`\\b${w}([\\s.,;:!?'"]|$)`, 'i').test(text);
		}); // handle trailing accented etc
	}

	save() {
		if (!this.wiki) {
			if (this.doFallbackSearch()) return;
		}

		if (this.type == 0) {
			this.wiki = txt.add([this.info.active, this.info.start, this.info.bornIn, this.info.end, this.info.foundedIn], this.wiki);
			const value = $.jsonParse(txt.countryCodes, {}, 'file')[this.artist.toLowerCase()];
			if (!value) {
				let countryCode = '';
				let locale = this.info.bornIn || this.info.foundedIn;
				if (locale) {
					locale = locale.split(',');
					countryCode = countryToCode[$.strip(locale[locale.length - 1])];
					this.saveCountryCode(countryCode);
				}
			}
		}

		this.checkTypeOf();

		if (this.site != 'en' && !cfg.wikipediaEnGenres) this.genres = this.type < 3 ? '' : []; // no fallback to mb genres if !en
		const genres = this.info.genre.length ? this.info.genre : this.genres.length ? this.genres : this.type < 3 ? '' : [];
		if (genres && this.type < 3) this.wiki = txt.add(['Genre: ' + genres], this.wiki);

		if (this.type == 1) {
			this.wiki = txt.add([this.info.released], this.wiki);
		}
		
		if (this.type > 0 && this.type < 3) {
			this.wiki = txt.add([this.info.length], this.wiki);
		}
		this.wiki = this.wiki.trim();

		if (this.type < 3) {
			if (!this.wiki) {
				if (this.type || !$.file(this.pth)) $.trace('维基百科：' + (this.title || this.artist) + '：未找到', true);
				return;
			}
			if (this.fo) {
				$.buildPth(this.fo);
				
				this.wiki = txt.add([`Wikipedia language: ${this.site.toUpperCase()}`], this.wiki);
				$.save(this.pth, this.wiki, true);
				server.res();
			}
		} else {
			const text = $.jsonParse(this.pth, {}, 'file');
			if (this.fo) {
				$.buildPth(this.fo);
				if (this.site == 'en') {
					text[this.title] = {
						composer: this.info.composer,
						date: this.info.released,
						genre: genres,
						length: this.info.length,
						wiki: this.wiki,
						lang: this.site.toUpperCase(),
						update: Date.now()
					};
				} else {
					text[this.title] = {
						genre: genres,
						wiki: this.wiki,
						lang: this.site.toUpperCase(),
						update: Date.now()
					};
				}
				$.save(this.pth, JSON.stringify($.sortKeys(text), null, 3), true);
			}
			if (genres.length || this.info.composer.length || this.info.released || this.info.length || this.wiki) server.res();
			else $.trace('维基百科：' + this.name + '：未找到', true);
		}
	}

	saveCountryCode(code, force) {
		if (!code) return;
		const a = this.artist.toLowerCase();
		const m = $.jsonParse(txt.countryCodes, {}, 'file');
		const value = m[a];
		if (code == value && !force) return;
			m[a] = code;
			$.save(txt.countryCodes, JSON.stringify($.sortKeys(m), null, 3), true);
			server.res();
	}

	tidyWiki(n, en) {
		n = en ? n.replace(/\.\n+/g, '.\r\n\r\n') : n.replace(/\n+/g, '\r\n\r\n');
		n = n.replace(/\(\)/g, '').replace(/\(;\s/g, '(').replace(/^thumb\r\n\r\n/i, '').replace(/\."([^\s"])/g, '. "$1').replace(/[.,]:\s\d+/g, '.').replace(/Ph\.D\./g, 'PhD')
		const tidyFullStop = /([^A-Z.\s])\.([^a-z\s\d.'"\u201d,;/)[\]])/g;
		if (en) n = n.replace(tidyFullStop, '$1.\r\n\r\n$2').replace(/t\.\r\n\r\nA.T.u./g, 't.A.T.u.');
		else n = n.replace(tidyFullStop, '$1. $2');
		return n.trim();		
	}
}

class Infobox {
	constructor() {
		this.date = new Intl.DateTimeFormat('en-GB', {year: 'numeric', month: 'long', day: 'numeric'});
		this.mm_yyyy = new Intl.DateTimeFormat('en-GB', {year: 'numeric', month: 'long'});
		this.months = '(January|February|March|April|May|June|July|August|September|October|November|December)'
		this.yyyy = new Intl.DateTimeFormat('en-GB', {year: 'numeric'});
	}

	checkDateFormat(date) {
			return date.replace(RegExp(`(${this.months})\\s+(\\d+),?\\s+((19|20)\\d{2})`, 'g'), '$3 $1 $4');
	}

	cleanLists(n) {
		return n.replace(/{{Flat\s?list\|/i, '')
		.replace(/{{hlist\|/i, '')
		.replace(/{{plain\s?list\|/i, '')
		.replace(/{{ubl\|/i, '')
		.replace(/{{unbulleted\s?list\|/i, '')
		.replace(/{{flagicon\|([^}]+)}}/gi, '$1, ')
		.replace(/\s*\*\s*/g, ', ')
		.replace(/}}}{{/g, '}}, {{')
		.replace(/{{start\s?date\|/gi, '')
		.replace(/{{end\s?date\|/gi, '')
		.replace(/df=yes\|/i, '')
		.replace(/df=y\|/i, '');
	}
	
	cleanStr(n) {
		n = this.cleanLists(n)
		.replace(/\]\]\s+\[\[/g, ']], [[')
		.replace(/\[\[[^\]]+?\|/g, '')
		.replace(/[[\]]/g, '')
		.replace(/{{-}}/g, '')
		.replace(/{{ref\|a}}/g, '')
		.replace(/{{refn/g, '')
		.replace(/\(see below\)/g, '')
		.replace(/[{}]/g, '');
		return this.tidyPunctuation(n);
	}

	cleanText(text, site) {
		text = text.replace(/<ref[\s\S]+?(<\/ref>|\/>)/g, '').replace(/{{citation needed[^}]+}}/g, '').replace(/\[https:[^\]]+\]/g, '').replace(/'''?/g, '').replace(/\|display=inline/g, '').replace(/<\/?br\s?\/?>/gi, ',').replace(/&minus;/g, '-').replace(/<sup>/g, '^').replace(/{{sfn\|([^}]+)}}/g, '').replace(/{{efn\|([^}]+)}}/g, '').replace(/\u2212/g, '-').replace(/<\/?nowiki\/>/g, '').replace(/<\/?small>/g, '').replace(/<\/sup>/g, '').replace(/{{\s*nowrap\s*\|([^\n}]+)}}/gi, '$1');
		if (site == 'pt') text = text.replace(/\s*(title|t\u00edtulo)[^[]+\[\[/gi, '[[').replace(/\n\|\d\s*=\s*[^[]+\[\[/g, '* [[');
		return text.replace(/<!--([\s\S]*?)-->/g, '').replace(/&nbsp;|{{nbsp}}/g, ' ').replace(/&ndash;|mdash|{{ndash}}/gi, '\u2013').replace("|''See list''", '').replace(/{{small\|([^}]+)}}/gi, '$1');
	}

	durationPattern(n) {
		const duration1 = /{{Duration\|(\d+:)?\d+:\d+}}/i;
		const duration2 = /{{Duration\|(h=)?(\d+)?\|?m=(\d+)\|s=(\d+)}}/i;

		const globalDuration1 = /{{Duration\|((\d+:)?\d+:\d+)}}/gi;
		const globalDuration2 = /{{Duration\|(h=)?(\d+)?\|?m=(\d+)\|s=(\d+)}}/gi;
		
		if (duration1.test(n)) return {
			pattern: globalDuration1,
			replacer: '$1'
		}

		if (duration2.test(n)) return {
			pattern: globalDuration2,
			replacer: '$2:$3:$4'
		}

		return null;
	}

	extractInfoboxes(source) {
		let parsed = this.parse(source);
		const infoboxes = [parsed.data];
		while (parsed.remainder) {
			parsed = this.parse(parsed.remainder);
			infoboxes.push(parsed.data);
		}
		return infoboxes.join('\n');
	}

	find(item, list, site) {
		const keys = this.getKeys(item, site);
		let li = [];
		keys.forEach(v => {
			if (list[v]) li.push(list[v])
		})
		return li.length ? li : null;
	}

	getComposer(item, list, site) {
		let n = [];
		let m = this.find(item, list, site);
		if (!m) return n;
		
		m.forEach(v => {
			const f = [];
			const lc = v.toLowerCase();
			['composer', 'lyricist', 'producer'].forEach(v => {
				const ix = RegExp(`[^\\(]${v}`).test(lc) ? lc.indexOf(v) : -1;
				if (ix != -1) f.push(ix);
			});
			const i = f.length ? Math.min(...f) : -1;
			if (i != -1) v = v.slice(0, i).trim();
			n.push(this.cleanStr(v).split(', '));
		});
		return [...new Set(n.flat().filter(Boolean))];
	}

	getGenre(item, list, site) {
		let n = [];
		let m = this.find(item, list, site);
		if (!m) return n;
		if (site == 'es') m.length = 1;
		if (site == 'it' && m.length > 1) return m.map(v => $.titlecase(v));
			
		const instances = this.instancesPattern(m[0]);

		(m[0].match(instances.global) || []).forEach(v => {
			let w = v.match(instances.pattern)[2].split('|');
			w = w[1] || w[0];
			n.push(item == 'genre' ? $.titlecase(w) : w);
		});
		if (!n.length) n = m[0].split(/\|/); // plain text
		n = n.filter(v => !/[[\]{}]/.test(v)); // disallow unrecognised
		return n;
	}

	getKeys(item, site) {
		switch (item) {
			case 'composer': return ['writer', 'composer', 'lyricist'];
			case 'genre': {
				const genre = {
					en: ['genre', 'genres'],
					de: ['genre', 'genres'],
					es: ['genre', 'genres', 'g\u00e9nero', 'estilo'],
					fr: ['genre', 'genres'],
					it: ['genre', 'genres', 'genere', 'genere2', 'genere3', 'genere4', 'genere5'],
					ja: ['genre', 'genres', '\u30b8\u30e3\u30f3\u30eb'],
					pl: ['genre', 'genres', 'gatunek'],
					pt: ['genre', 'genres', 'g\u00eanero_musical', 'g\u00e9nero', 'g\u00eanero'],
					ru: ['genre', 'genres', '\u0436\u0430\u043d\u0440\u044b'],
					sv: ['genre', 'genres'],
					tr: ['genre', 'genres', 'tarz'],
					zh: ['genre', 'genres', 'music_genre', '\u97f3\u6a02\u985e\u578b']
				}
				return genre[site];
			}
			case 'origin': return ['origin', 'founded'];
			default: return [item];
		}
	}

	getKeyValuePairs(str, sep) {
		const index = str.indexOf(sep);
		if (index < 0 || /Short description/i.test(str)) return null;

		const key = str.slice(0, index).replace('|', '').trim().toLowerCase();
		if (/module/i.test(key) && /embed/i.test(key)) return null;

		let value = str.slice(index + sep.length).trim();

		while (/\|[^=]+=($|\}\})/.test(value)) { // remove empty: | recorded   =
			value = value.replace(/\|[^=|]+=($|\}\})/, '');
		}

		if (/\}\}$/.test(value)) { // handle infobox w/o wrapper
			const leadingCount = value.split('{').length - 1;
			const trailingCount = value.split('}').length - 1;
			if (leadingCount != trailingCount) value = value.replace(/\}\}$/, '');
		}

		return {[key]: value};
	}

	getLength(item, list) {
		let n = '';
		let len = this.find(item, list);
		if (!len) return '';

		const duration = this.durationPattern(len[0]);

		if (duration) {
			n  = 
			this.cleanLists(len[0])
			.replace(duration.pattern, duration.replacer).replace(/^:/g, '').replace(/([^\d]):/g, '$1')
			.replace(/\[\[[^\]]+?\|/g, '').replace(/[[\]]/g, '').replace(/[{}]/g, '')
			.replace(/\|/g, ', ')
			.replace(/^,/, '')
			.replace(/,(?=\S)/g, ', ')
			.replace(/:(\d([^\d]|$))/g, ':0$1').replace(/(^|[^\d])0(\d)(:\d\d$)/g, '$2$3')
			.trim();
			if (this.isValidLength(n)) return this.tidyPunctuation(n);
		}

		n = [];
		if (this.isValidLength(len[0])) {
			let m = len[0].replace(/\[\[[^\]]+?\|/g, '').replace(/[[\]]/g, '').replace(/\s*\*\s*/g, ', ');
			m = /{{([^}]+)}}/i.exec(m);
			if (m) {
				m[1].split('|').forEach(v => {
					if (this.isValidLength(v)) n.push(v);
				});
			}
		}
		if (n.length) return n.join(', ').replace(/^,/, '').trim();
		return this.getStr(item, list);
	}

	getLifespan(list) {
		const millisInYear = 1000 * 60 * 60 * 24 * 365;
		let m = this.find('death_date', list);

		if (m) {
			m = m[0].match(/(\d+)\s*\|(\d+)\s*\|(\d+)\s*\|(\d+)\s*\|?(\d+)?\s*\|?(\d+)?\s*/);
		}

		if (m) {
			let results = m;
			const [, deathYear, deathMonth, deathDay, birthYear, birthMonth = 0, birthDay = 0] = results;
			let end = new Date(deathYear, deathMonth - 1, deathDay);
			let born = new Date(birthYear, birthMonth - 1, birthDay);
			const age = Math.floor((Number(end) - Number(born)) / millisInYear);
			end = this.date.format(end);
			born = this.date.format(born);
			return {
				born: `Born: ${born}`,
				end: `Died: ${end} (aged ${age})`
			}
		} else {
			let m = this.find('birth_date', list);
			const birthDateGlobalPattern = /{{birth\sdate([^}]+)}}/gi;

			if (m) {
				const count = m[0].match(birthDateGlobalPattern);
				if (count && count.length > 1) return {}; // N/A if > 1 artist
				const origin = m[0].replace(birthDateGlobalPattern, '').split('{{')[0].replace(/[[\]]/g, '').replace(/^,/, '').trim();
				m = m[0].match(/(\d+)\s*\|(\d+)\s*\|(\d+)\s*/);
				if (m) {
					let results = m;
					const [, year, month, day] = results;
					let born = new Date(year, month - 1, day);
					const age = Math.floor((Date.now() - +born) / millisInYear);
					born = this.date.format(born);
					return {
						born: `Born: ${born} (age ${age})`,
						origin: origin
					}
				}
			}
		}
		return {};
	}

	getOuterIndex(source) {
		let lastOpen = [];
		for (let i = 0; i < source.length - 1; i++) {
			const nextTwo = source.substr(i, 2);
			if (nextTwo === '{{') {
				lastOpen.push(i);
				i++;
				continue;
			}

			if (nextTwo === '}}') {
				lastOpen.pop();
				if (lastOpen.length === 0) {
					return i + 2;
				}
				i++;
			}    
		}
	}

	getReleased(item, list) {
		let n = this.find(item, list);
		if (!n) return '';

		n = this.getStr(item, list);
		n = this.checkDateFormat(n);
		if (this.isFullDate(n)) return n;

		let m = this.find(item, list) || '';
		let d = '';

		if (/{{start\s?date\|/i.test(m[0])) {
			let dates = m[0].match(/{{start\s?date\|([^}]+?)\}\}/gi);
			if (dates) {
				const map = dates.map(v => {
					const d1 = v.replace(/}/g, '').split('|').filter(v => /\d/.test(v));
					const type = d1.length;
					let date = d1.join('-');
					date = new Date(date);
					let d2 = '';
					if (this.isValidDate(date)) {
						d2 = ['', this.yyyy.format(date), this.mm_yyyy.format(date), this.date.format(date)][type];
					}
					return {date: d1, d: d2}
				});
				d = m[0];
				dates.forEach((v, i) => {
					d = d.replace(/{{start\s?date\|[^}]+\}\}/i, map[i].d)
				});
				d = d.replace(/\s*\*\s*/g, ', ');
				d = this.cleanStr(this.checkDateFormat(d));
			}
		}
		return d || this.tidyPunctuation(n);
	}

	getStr(item, list) {
		let n = this.find(item, list);
		if (!n) return '';
		let str = this.cleanStr(n[0]);
		if (item == 'length' && !this.isValidLength(str)) str = '';
		return str;
	}

	getValues(type, source, site) {
		source = this.extractInfoboxes(source)
		if (!source) return;
		const list = this.keyValue(source);

		const o = {
			active: '',
			bornIn: '',
			composer: [],
			end: '',
			foundedIn: '',
			genre: this.getGenre('genre', list, site),
			length: '',
			released: '',
			start: ''
		}

		if (site != 'en') return o;

		if (type == 0) {
			const bornIn = this.getStr('birth_place', list);
			const date = this.getLifespan(list);
			const prefix = date.born ? 'Born In: ' : 'Founded In: ';
			
			let foundedIn = '';
			if (bornIn) {
				o.bornIn = `Born In: ${bornIn}`;
			} else if (date.origin) {
				o.bornIn = `Born In: ${date.origin}`;
			} else {
				foundedIn = this.getStr('origin', list);
			}
			if (foundedIn) foundedIn = prefix + foundedIn;
			
			o.active = this.getYearsActive('years_active', list);
			o.active = o.active ? `Years Active: ${o.active.replace(/\u2013/g, ' \u2013 ').replace(/\s{2}/g, '')}` : '';
			o.end = date.end ? date.end : '';
			o.foundedIn = foundedIn;
			o.start = date.born ? date.born : '';
		}

		if (type > 0) {
			o.length = this.getLength('length', list).replace(/\(see length variations\)/gi, '').replace(/\u2013/g, ' \u2013 ').replace(/ {2}/g, ' ');
			if (type < 3 && o.length) o.length = `Length: ${o.length}`;
		}

		if (type > 2) o.composer = this.getComposer('composer', list);

		if (type == 1 || type == 3 || type == 4) {
			o.released = this.getReleased('released', list);
			if (type == 1 && o.released) o.released = `Release Date: ${o.released}`;
		}

		return o;
	}

	getYearsActive(item, list) {
		let n = this.find(item, list);
		if (!n) return '';
		n = n[0];
		return this.cleanStr(this.isList(n) ? this.cleanLists(n) : n.split('|')[0]);
	}

	instancesPattern(n) {
		const hlc = /{{hlist-comma\s*/i.test(n);
		return {
			global: !hlc ? /\[\[[^\]]+\]\]/g : /(\[\[|{{)[^\]}]+(}}|\]\])/g,
			pattern: !hlc ? /(\[\[)([^\]]+)\]\]/ : /(\[\[|{{)([^\]}]+)(}}|\]\])/
		}	
	}

	isValidDate(date) {
		return !isNaN(date.getTime());
	}
	
	isFullDate(date) {
		return RegExp(`^\\d+\\s+${this.months}\\s+(19|20)\\d{2}$`, 'i').test(date);
	}

	isList(n) {
		return /{{(hlist|flat\s?list|plain\s?list|unbulleted\s?list)[^|]*\|[^[\]}]+}}/i.test(n) || /start\s?date/i.test(n);
	}

	isValidLength(n) {
		return /\d+:\d+/.test(n) || /\d+\s*min\s*36|s*sec/i.test(n);
	}

	keyValue(source) {
		const list = {}
		const div = source.replace(/\n/g,'').replace(/(\s*\|[^|=]+=[\s*[{])/g,'\n$1').split('\n');
		div.forEach(v => {
			const pair = this.getKeyValuePairs(v, '=');
			if (pair) Object.assign(list, pair)
		});
		return list;
	}

	parse(source) {
		const infoBoxStartPattern = /{{\w*box/;
		const startMatch = source.match(infoBoxStartPattern);
		if (!startMatch) { // use whole source if no infobox wrapper
			return {data: source, remainder: null};
		}
		const start = source.substring(startMatch.index);
		const outerIndex = this.getOuterIndex(start);
		if (!outerIndex) {
			return {data: source, remainder: null};
		}
		const data = start.substring(0, outerIndex);
		const remainder = source.substring(outerIndex);
		const remainderHasMatch = !!remainder.match(infoBoxStartPattern);
		return {
			data,
			remainder: remainderHasMatch ? remainder : null
		};
	}

	tidyPunctuation(n) {
		return n
		.replace(/;/g, ',')
		.replace(/^,/, '')
		.replace(/\|,?/g, ', ')
		.replace(/, ,?/g, ',')
		.replace(/,+/g, ', ')
		.replace(/ , /g, ', ')
		.replace(/ ?,(?=\S)/g, ', ')
		.replace(/([^A-Z])\.$/, '$1')
		.replace(/:,/g, ':')
		.replace(/(\w)\(/g, '$1 (')
		.replace(/\)(?=\w)/g, ') ')
		.replace(/ {2,}/g,' ')
		.trim()
		.replace(/,$/, '') || '';
	}
}