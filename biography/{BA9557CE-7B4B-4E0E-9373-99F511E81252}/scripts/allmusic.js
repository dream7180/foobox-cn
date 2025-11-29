'use strict';

class RequestAllmusic {
	constructor() {
		this.request = null;
		this.timer = null;
		this.checkResponse = null;
		this.lastRequestRetried = null; // Regorxxx <- Force last.fm img downloading for newest SMP methods or server errors. Retry only once per ID ->
	}

	// Regorxxx <- Prevented foobar crash when exiting during AllMusic fetching 
	abortRequest() {
		if (!this.request) return;
		clearTimeout(this.timer);
		clearInterval(this.checkResponse);
		this.request.Abort();
		this.request = null;
		this.timer = null;
		this.checkResponse = null;
	}
	// Regorxxx ->

	// Regorxxx <- Use WinHttp.WinHttpRequest.5.1 ActiveX objects or utils.HTTPRequestAsync, since Allmusic requires headers
	onStateChange(resolve, reject, func = null) {
		if (this.request !== null) {
			if (this.request.Status === 200) {
				return func ? func(this.request.ResponseText, this.request) : resolve(this.request.ResponseText);
			} else if (!func) {
				return reject({ status: this.request.Status, responseText: this.request.ResponseText }); 
			}
		} else if (!func) {
			return reject({ status: 408, responseText: 'Request Timeout' });
		}
		return null;
	}

	send({ method = 'GET', URL, body = void (0), func = null, requestHeader = [], bypassCache = false, timeout = 5000 }) {
		this.abortRequest();
		const setRequest = (onreadystatechange) => {
			// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#bypassing_the_cache
			// Add ('&' + new Date().getTime()) to URLS to avoid caching
			const fullUrl = URL + (bypassCache ? (/\?/.test(URL) ? '&' : '?') + new Date().getTime() : '');
			this.request.Open(method, fullUrl, true);
			requestHeader.forEach(pair => {
				if (!pair[0] || !pair[1]) {
					console.log(`HTTP Headers missing: ${pair}`);
					return;
				}
				this.request.SetRequestHeader(...pair);
			});
			if (bypassCache) {
				this.request.SetRequestHeader('Cache-Control', 'private');
				this.request.SetRequestHeader('Pragma', 'no-cache');
				this.request.SetRequestHeader('Cache', 'no-store');
				this.request.SetRequestHeader('If-Modified-Since', 'Sat, 1 Jan 2000 00:00:00 GMT');
			}
			if (onreadystatechange) { this.request.onreadystatechange = onreadystatechange; }
			this.request.SetTimeouts(timeout, timeout, timeout, timeout);
			this.request.Send(method === 'POST' ? body : void (0));
		};
		const timeoutRequest = (resolve, reject) => {
			try {
				this.request.WaitForResponse(-1);
				this.onStateChange(resolve, reject, func);
			} catch (e) {
				let status = 400;
				if (e.message.indexOf('0x80072ee7') !== -1) {
					status = 400;
				} else if (e.message.indexOf('0x80072ee2') !== -1) {
					status = 408;
				} else if (e.message.indexOf('0x8000000a') !== -1) {
					status = 408;
				}
				this.abortRequest();
				reject({ status, responseText: e.message });
			}
		};
		return new Promise((resolve, reject) => {
			this.request = XMLHttpRequest();
			setRequest(() => this.onStateChange(resolve, reject, func));
			this.timer = setTimeout(() => timeoutRequest(resolve, reject), timeout);
		});
	}
	// Regorxxx ->
}

/**
 * The instance of `RequestAllmusic` class for biography AllMusic request operations.
 * @typedef {RequestAllmusic}
 * @global
 */
const allMusicReq = new RequestAllmusic();

class DldAllmusicBio {
	init(URL, referer, p_title, p_artist, p_fo_bio, p_pth_bio, p_force) {
		this.active = '';
		this.artist = p_artist;
		this.artistLink = '';
		this.biography = '';
		this.biographyAuthor = '';
		this.biographyGenre = [];
		this.end = '';
		this.fo_bio = p_fo_bio;
		this.force = p_force;
		this.groupMembers = [];
		this.pth_bio = p_pth_bio;
		this.start = '';
		this.title = p_title;
		this.userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';

		this.search(!this.title ? 'artist' : 'id', URL, referer);
	}

	search(item, URL, referer) {
		let i = 0;
		let list = [];
		switch (item) {
			case 'id':
				allMusicReq.send({
					method: 'GET',
					bypassCache: this.force,
					requestHeader: [
						['referer', referer],
						['user-agent', this.userAgent]
					],
					URL: URL
				}).then(
					(response) => {
						doc.open();
						const div = doc.createElement('div');
						div.innerHTML = response;
						list = parse.amSearch(div, 'performers', 'song');
						i = server.match(this.artist, this.title, list, 'song');
						if (i != -1) {
							this.artistLink = list[i].artistLink;
							if (this.artistLink) {
								doc.close();
								return this.search('biography', this.artistLink + '/biographyAjax', this.artistLink);
							}
						}
						if (this.artist) this.search('artist', server.url.am + 'artists/' + encodeURIComponent(this.artist), 'https://allmusic.com');
						doc.close();
					},
					(error) => {
						$.trace('allmusic 评论 / 简介: ' + server.album + ' / ' + server.albumArtist + ': 未找到' + ' 错误状态: ' + this.xmlhttp.status, true);
					}
				).catch((error) => {
					server.updateNotFound('Bio ' + cfg.partialMatch + ' ' + this.artist + ' - ' + this.title);
					if (!$.file(this.pth_bio)) $.trace('allmusic 简介: ' + this.artist + ': 未找到', true);
				});
				break;

			case 'artist':
				allMusicReq.send({
					method: 'GET',
					bypassCache: this.force,
					requestHeader: [
						['referer', referer],
						['user-agent', this.userAgent]
					],
					URL: URL
				}).then(
					(response) => {
						doc.open();
						const div = doc.createElement('div');
						div.innerHTML = response;
						const artists = [];
						const artist = $.strip(this.artist);
						$.htmlParse(div.getElementsByTagName('div'), 'className', 'name', v => {
							const a = v.getElementsByTagName('a');
							let name = a.length && a[0].innerText ? a[0].innerText : '';
							name = $.strip(name);
							const href = a.length && a[0].href ? a[0].href : '';
							if (name && href) {
								if (artist == name) artists.push(href);
							}
						});
						doc.close();
						if (artists.length == 1) {
							if (artists[0]) {
								return this.search('biography', artists[0] + '/biographyAjax', artists[0]);
							}
						}
						server.updateNotFound('Bio ' + cfg.partialMatch + ' ' + this.artist + ' - ' + this.title);
						if (!$.file(this.pth_bio)) {
							$.trace('allmusic 简介: ' + this.artist + (artists.length > 1 ? ': 无法区分同名的多个艺术家：鉴别器、专辑名称或音轨标题，要么不匹配，要么不存在（例如，菜单查找）' : ': 未找到'), true);
						}
					},
					(error) => {
						$.trace('allmusic 评论 / 简介: ' + server.album + ' / ' + server.albumArtist + ': 未找到' + ' 错误状态: ' + this.xmlhttp.status, true);
					}
				).catch((error) => {
					server.updateNotFound('Bio ' + cfg.partialMatch + ' ' + this.artist + ' - ' + this.title);
					if (!$.file(this.pth_bio)) $.trace('allmusic 简介: ' + this.artist + ': 未找到', true);
				});
				break;

			case 'biography':
				allMusicReq.send({
					method: 'GET',
					bypassCache: this.force,
					requestHeader: [
						['referer', referer],
						['user-agent', this.userAgent]
					],
					URL: URL
				}).then(
					(response) => {
						parse.amBio(this, response);
						if (this.artistLink) {
							this.search('artistPage', this.artistLink, 'https://allmusic.com');
						}
				},
				(error) => {}
				).catch((error) => {});
				break;

			case 'artistPage':
				allMusicReq.send({
					method: 'GET',
					bypassCache: this.force,
					requestHeader: [
						['referer', referer],
						['user-agent', this.userAgent]
					],
					URL: URL
				}).then(
					(response) => {
						parse.amArtist(this, response, this.artist, '', this.title, this.fo_bio, this.pth_bio, '');
			},
			(error) => {
				$.trace('allmusic 评论 / 简介: ' + this.album + ' / ' + this.albumArtist + ': 未找到' + ' 错误状态: ' + JSON.stringify(error), true)
			}
			).catch((error) => {
				this.album ? server.updateNotFound('Bio ' + cfg.partialMatch + ' ' + this.pth_rev) : server.updateNotFound('Bio ' + cfg.partialMatch + ' ' + this.artist + ' - ' + this.title);
				if (!$.file(this.pth_bio)) $.trace('allmusic 简介: ' + this.artist + ': 未找到', true);
			});
			break;
			}
		}
	}

class DldAllmusicRev {
	init(URL, referer, p_album, p_alb_artist, p_artist, p_va, p_dn_type, p_fo_rev, p_pth_rev, p_fo_bio, p_pth_bio, p_art, p_force) {
		this.album = p_album;
		this.albumArtist = p_alb_artist;
		this.art = p_art;
		this.artist = p_artist;
		this.artistLink = '';
		this.active = '';
		this.biography = '';
		this.biographyAuthor = '';
		this.biographyGenre = [];
		this.composer = [];
		this.dn_type = p_dn_type;
		this.end = '';
		this.fo_bio = p_fo_bio;
		this.fo_rev = p_fo_rev;
		this.force = p_force;
		this.groupMembers = [];
		this.pth_bio = p_pth_bio;
		this.pth_rev = p_pth_rev;
		this.rating = 'x';
		this.releaseDate = '';
		this.review = '';
		this.reviewAuthor = '';
		this.reviewGenre = '';
		this.reviewMood = '';
		this.reviewTheme = '';
		this.songGenre = [];
		this.songMood = [];
		this.songTheme = [];
		this.songReleaseYear = '';
		this.start = '';
		this.userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
		this.va = p_va;
		this.search('id', URL, referer);
}

	search(item, URL, referer) {
		let list = [];
		switch (item) {
			case 'id':
				allMusicReq.send({
					method: 'GET',
					bypassCache: this.force,
					requestHeader: [
						['referer', referer],
						['user-agent', this.userAgent]
					],
					URL: URL
				}).then(
					(response) => {
						doc.open();
						const div = doc.createElement('div');
						div.innerHTML = response;
						const item = {};
						if (this.dn_type.startsWith('review') || this.dn_type == 'biography') {item.art = 'artist'; item.type = 'album';} // this.dn_type choices: 'review+biography'* || 'composition+biography' || 'review' || 'composition' || 'track' || 'biography' // *falls back to trying track / artist based biography if art_upd needed
						else if (this.dn_type == 'track') {item.art = 'performers'; item.type = 'song';}
						else {item.art = 'composer'; item.type = 'composition';}
						list = parse.amSearch(div, item.art, item.type);
						const i = server.match(this.albumArtist, this.album, list, item.type);
						if (i != -1) {
							if (!this.va) this.artistLink = list[i].artistLink;
							if (this.dn_type != 'biography') {
								doc.close();
								this.titleLink = list[i].titleLink;
								if (this.titleLink) {
									return this.search('review', this.titleLink + (item.type != 'composition' ? '/reviewAjax' : '/descriptionAjax'), this.titleLink);
								}
							} else if (!this.va) {
								doc.close();
								if (this.artistLink) {
									return this.search('biography', this.artistLink + '/biographyAjax', this.artistLink);
								}
							}
						}
						server.getBio(this.force, this.art, 1);
						if (this.dn_type.includes('biography')) server.updateNotFound('Bio ' + cfg.partialMatch + ' ' + this.pth_rev);
						server.updateNotFound('Rev ' + cfg.partialMatch + ' ' + this.pth_rev + (this.dn_type != 'track' ? '' : ' ' + this.album + ' ' + this.albumArtist));
						$.trace('allmusic 评论: ' + this.album + ' / ' + this.albumArtist + ': 未找到', true);
						doc.close();
					},
					(error) => {
						$.trace('allmusic 评论 / 简介: ' + this.album + ' / ' + this.albumArtist + ': 未找到' + ' 错误状态: ' + JSON.stringify(error), true)
					}
				).catch((error) => {
					server.getBio(this.force, this.art, 1);
					server.updateNotFound('Bio ' + cfg.partialMatch + ' ' + this.pth_rev);
					server.updateNotFound('Rev ' + cfg.partialMatch + ' ' + this.pth_rev + (this.dn_type != 'track' ? '' : ' ' + this.album + ' ' + this.albumArtist));
					$.trace('allmusic 评论: ' + this.album + ' / ' + this.albumArtist + ': 未找到', true);
				})
				// Regorxxx <- Force last.fm img downloading for newest SMP methods or server errors. Retry only once per ID
				.finally(() => {
					const urlId = item + ' -> ' + URL;
					if (allMusicReq.lastRequestRetried !== urlId) {
						const art = this.art;
						setTimeout(() => {
							if (img.art.allFilesLength === 0 && allMusicReq.lastRequestRetried !== urlId) {
								allMusicReq.lastRequestRetried = urlId;
								server.getBio(true, art, 0);
								setTimeout(() => allMusicReq.lastRequestRetried = null, 30000);
							}
						}, 2000);
					}
				});
				// Regorxxx ->
				break;

			case 'review':
				allMusicReq.send({
					method: 'GET',
					bypassCache: this.force,
					requestHeader: [
						['referer', referer],
						['user-agent', this.userAgent]
					],
					URL: URL
				}).then(
					(response) => {
						doc.open();
						const div = doc.createElement('div');
						div.innerHTML = response;
						const dv = div.getElementsByTagName('div');
						const module = this.dn_type == 'track' ? 'songContentSubModule' : this.dn_type.includes('composition') ? 'compositionContentSubModule' : 'albumContentSubModule';
						$.htmlParse(dv, 'className', module, v => this.review = v.innerHTML);
						this.review = this.dn_type != 'track' && !this.dn_type.includes('composition') ? this.review.split(/<\/h3>/i) : this.review.split(/<\/h2>/i);
						if (this.review.length == 2) {
							this.reviewAuthor = server.format(this.review[0]);
							this.review = server.format(this.review[1]);
						} else this.review = server.format(this.review[0]);
						doc.close();
						if (this.titleLink) {
							if (!this.dn_type.includes('composition')) this.search('moodsThemes', this.titleLink + '/moodsThemesAjax', this.titleLink);
							else this.search('titlePage', this.titleLink, 'https://allmusic.com');
						}
					},
					(error) => {}
				).catch((error) => {});
				break;

			case 'moodsThemes':
				allMusicReq.send({
					method: 'GET',
					bypassCache: this.force,
					requestHeader: [
						['referer', referer],
						['user-agent', this.userAgent]
					],
					URL: URL
				}).then(
					(response) => {
						doc.open();
						const div = doc.createElement('div');
						div.innerHTML = response;
						const a = div.getElementsByTagName('a');
						const reviewMood = [];
						const reviewTheme = [];
						$.htmlParse(a, false, false, v => {
							if (v.href.startsWith('about:/mood/')) {
								const tm = v.innerText.trim();
								if (tm) reviewMood.push(tm.replace(/\(\d+\)/, '').trim());
							}
							if (v.href.startsWith('about:/theme/')) {
								const tth = v.innerText.trim();
								if (tth) reviewTheme.push(tth.replace(/\(\d+\)/, '').trim());
							}
						});
						if (reviewMood.length) {
							if (this.dn_type != 'track') this.reviewMood = 'Album Moods: ' + reviewMood.join('\u200b, ');
							else this.songMood = reviewMood;
						}
						if (reviewTheme.length) {
							if (this.dn_type != 'track') this.reviewTheme = 'Album Themes: ' + reviewTheme.join('\u200b, ')
							else this.songTheme = reviewTheme;
						}
						doc.close();
						if (this.titleLink) this.search('titlePage', this.titleLink, 'https://allmusic.com');
					},
					(error) => {}
				).catch((error) => {});
				break;

			case 'titlePage':
				allMusicReq.send({
					method: 'GET',
					bypassCache: this.force,
					requestHeader: [
						['referer', referer],
						['user-agent', this.userAgent]
					],
					URL: URL
				}).then(
					(response) => {
						doc.open();
						const div = doc.createElement('div')
						div.innerHTML = response;
						const a = div.getElementsByTagName('a');
						const dv = div.getElementsByTagName('div');
						const reviewGenre = [];
						let tg = '';
						if (this.dn_type != 'track') {
							$.htmlParse(dv, 'className', 'release-date', v => this.releaseDate = v.innerText.replace(/Release Date/i, 'Release Date: ').trim());
							$.htmlParse(a, false, false, v => {
								if (v.href.includes('www.allmusic.com/genre') || v.href.includes('www.allmusic.com/style')) {
									tg = v.innerText.trim();
									if (tg) reviewGenre.push(tg);
								}
							});
							if (reviewGenre.length) this.reviewGenre = 'Genre: ' + reviewGenre.join('\u200b, ');
							const match = response.match(/allmusicRating ratingAllmusic(\d)/i);
							if (match && match.length == 2) this.rating = match[1] != 0 ? match[1] / 2 + 0.5 : 0;
							this.saveAlbumReview();
						} else {
							$.htmlParse(div.getElementsByTagName('div'), 'className', 'composer', v => {
								const a = v.getElementsByTagName('a');
								for (let i = 0; i < a.length; i++) {
									if (a[i].innerText) this.composer.push(a[i].innerText);
								}
							});
							$.htmlParse(div.getElementsByTagName('div'), 'className', 'genre', v => {
								const a = v.getElementsByTagName('a');
								for (let i = 0; i < a.length; i++) {
									if (a[i].innerText) this.songGenre.push(a[i].innerText);
								}
							});
							$.htmlParse(div.getElementsByTagName('div'), 'className', 'styles', v => {
								const a = v.getElementsByTagName('a');
								for (let i = 0; i < a.length; i++) {
									if (a[i].innerText) this.songGenre.push(a[i].innerText);
								}
							});
							const m = response.match(/data-releaseyear=\s*"\s*\d+\s*"/i);
							if (m) {
								this.songReleaseYear = m[0].replace(/\D/g, '').trim();
							}
							this.saveTrackReview();
						}
						doc.close();

						if (this.dn_type.includes('+biography')) {
							if (this.artistLink) {
								return this.search('biography', this.artistLink + '/biographyAjax', this.artistLink);
							}
						}
					},
					(error) => {
						if (this.dn_type.includes('+biography')) {
							if (this.artistLink) {
								return this.search('biography', this.artistLink + '/biographyAjax', this.artistLink);
							}
						}
						$.trace('allmusic 评论 / 简介: ' + this.album + ' / ' + this.albumArtist + ': 未找到' + ' 错误状态: ' + JSON.stringify(error), true)
					}
				).catch((error) => {
					if (this.dn_type.includes('+biography')) {
						if (this.artistLink) {
							return this.search('biography', this.artistLink + '/biographyAjax', this.artistLink);
						}
					}
					server.updateNotFound('Bio ' + cfg.partialMatch + ' ' + this.pth_rev);
					server.updateNotFound('Rev ' + cfg.partialMatch + ' ' + this.pth_rev + (this.dn_type != 'track' ? '' : ' ' + this.album + ' ' + this.albumArtist));
					$.trace('allmusic 评论: ' + this.album + ' / ' + this.albumArtist + ': 未找到', true);
				});
				break;

			case 'biography':
				allMusicReq.send({
					method: 'GET',
					bypassCache: this.force,
					requestHeader: [
						['referer', referer],
						['user-agent', this.userAgent]
					],
					URL: URL
				}).then(
					(response) => {
						parse.amBio(this, response);
						if (this.artistLink) this.search('artistPage', this.artistLink, 'https://allmusic.com');
					},
					(error) => {}
				).catch((error) => {});
				break;

			case 'artistPage':
				allMusicReq.send({
					method: 'GET',
					bypassCache: this.force,
					requestHeader: [
						['referer', referer],
						['user-agent', this.userAgent]
					],
					URL: URL
				}).then(
					(response) => {
						parse.amArtist(this, response, this.artist, this.album, '', this.fo_bio, this.pth_bio, this.pth_rev);
				},
					(error) => {
						$.trace('allmusic 评论 / 简介: ' + this.album + ' / ' + this.albumArtist + ': 未找到' + ' 错误状态: ' + JSON.stringify(error), true)
					}
				).catch((error) => {
					this.album ? server.updateNotFound('Bio ' + cfg.partialMatch + ' ' + this.pth_rev) : server.updateNotFound('Bio ' + cfg.partialMatch + ' ' + this.artist + ' - ' + this.title);
					if (!$.file(this.pth_bio)) $.trace('allmusic 简介: ' + this.artist + ': 未找到', true);
				});
				break;
		}
	}

	saveAlbumReview() {
		this.review = '>> Album rating: ' + this.rating + ' <<  ' + this.review;
		this.review = txt.add([this.reviewGenre, this.reviewMood, this.reviewTheme, this.releaseDate, this.reviewAuthor], this.review);
		this.review = this.review.trim();
		if (this.review.length > 22) {
			if (this.fo_rev) {
				$.buildPth(this.fo_rev);
				$.save(this.pth_rev, this.review, true);
				server.res();
			}
		} else {
			server.updateNotFound('Rev ' + cfg.partialMatch + ' ' + this.pth_rev);
			$.trace('allmusic this.review: ' + this.album + ' / ' + this.albumArtist + ': 未找到', true);
		}
	}
	saveTrackReview() {
		const text = $.jsonParse(this.pth_rev, {}, 'file-utf8'); // Regorxxx <- Force UTF-8 ->
		text[this.album] = {
			author: this.reviewAuthor,
			composer: this.composer,
			date: this.songReleaseYear,
			genres: this.songGenre,
			moods: this.songMood,
			themes: this.songTheme,
			wiki: this.review,
			update: Date.now()
		};
		if (this.fo_rev) {
			$.buildPth(this.fo_rev);
			$.save(this.pth_rev, JSON.stringify($.sortKeys(text), null, 3), true);
		}

		if (this.reviewAuthor || this.reviewGenre || this.reviewMood || this.reviewTheme || this.review || this.songReleaseYear || this.composer)	{
			server.res();
		} else {
			server.updateNotFound('Rev ' + cfg.partialMatch + ' ' + this.pth_rev + ' ' + this.album + ' ' + this.albumArtist);
			$.trace('allmusic 评论: ' + this.album + ' / ' + this.albumArtist + ': 未找到', true);
		}
	}
}


class Parse {
	amArtist(that, responseText, artist, album, title, fo_bio, pth_bio, pth_rev) {
		doc.open();
		const div = doc.createElement('div');
		div.innerHTML = responseText;
		const dv = div.getElementsByTagName('div');
		let tg = '';
		$.htmlParse(dv, 'className', 'birth', v => that.start = server.format(v.innerHTML).replace(/Born/i, 'Born:').replace(/Formed/i, 'Formed:'));
		$.htmlParse(dv, 'className', 'death', v => that.end = server.format(v.innerHTML).replace(/Died/i, 'Died:').replace(/Disbanded/i, 'Disbanded:'));
		$.htmlParse(dv, 'className', 'activeDates', v => that.active = v.innerText.replace(/Active/i, 'Active: ').trim());

		$.htmlParse(div.getElementsByTagName('a'), false, false, v => {
			if (v.href.includes('www.allmusic.com/genre') || v.href.includes('www.allmusic.com/style')) {
				tg = v.innerText.trim();
				if (tg) that.biographyGenre.push(tg);
			}
		});

		$.htmlParse(dv, 'className', 'group-members', v => {
			const a = v.getElementsByTagName('a');
			for (let i = 0; i < a.length; i++) {
				if (a[i].innerText) that.groupMembers.push(a[i].innerText.trim());
			}
		});

		that.biographyGenre = that.biographyGenre.length ?  'Genre: ' + that.biographyGenre.join('\u200b, ') : '';
		that.groupMembers = that.groupMembers.length ? 'Group Members: ' + that.groupMembers.join('\u200b, ') : '';

		this.saveBiography(that, artist, album, title, fo_bio, pth_bio, pth_rev);
		doc.close();
	}

	amBio(that, responseText) {
		doc.open();
		const div = doc.createElement('div');
		div.innerHTML = responseText;
		const dv = div.getElementsByTagName('div');
		$.htmlParse(dv, 'className', 'artistContentSubModule', v => that.biography = v.innerHTML);
		that.biography = that.biography.split(/<\/h2>/i);
		if (that.biography.length == 2) {
			that.biographyAuthor = server.format(that.biography[0]);
			that.biography = server.format(that.biography[1]);
		} else that.biography = server.format(that.biography[0]);
		doc.close();
	}

	amSearch(div, artist, item) {
		let j = 0, list = [];
		let items = div.getElementsByTagName('div');
		for (let i = 0; i < items.length; i++) {
			if (items[i]['className'] == item) {
				list[j] = {}
				$.htmlParse(items[i].getElementsByTagName('div'), 'className', 'title', v => {
					const a = v.getElementsByTagName('a');
					list[j].title = a.length && a[0].innerText ? a[0].innerText : 'N/A';
					list[j].titleLink = a.length && a[0].href ? a[0].href : '';
				});
				$.htmlParse(items[i].getElementsByTagName('div'), 'className', artist, v => {
					const a = v.getElementsByTagName('a');
					list[j].artist = a.length && a[0].innerText ? a[0].innerText : v.innerText;
					list[j].artistLink = a.length && a[0].href ? a[0].href : '';
				});
				j++;
			}
		}
		return list;
	}
	saveBiography(that, artist, album, title, fo_bio, pth_bio, pth_rev) {
		that.biography = txt.add([that.active, that.start, that.end, that.biographyGenre, that.groupMembers, that.biographyAuthor], that.biography);
		that.biography = that.biography.trim();

		if (that.biography.length > 19) {
			if (fo_bio) {
				$.buildPth(fo_bio);
				$.save(pth_bio, that.biography, true);
				server.res();
			}
		} else {
			album ? server.updateNotFound('Bio ' + cfg.partialMatch + ' ' + pth_rev) : server.updateNotFound('Bio ' + cfg.partialMatch + ' ' + artist + ' - ' + title);
			if (!$.file(pth_bio)) $.trace('allmusic 简介: ' + artist + ': 未找到', true);
		}
	}
}

const parse = new Parse;