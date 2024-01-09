'use strict';

class Lyrics {
	constructor() {
		this.noLyrics = ['未找到歌词'];
		this.enhancedTimestamps = /(\s*)<(\d{1,2}:|)\d{1,2}:\d{2}(>|\.\d{1,3}>)(\s*)/g;
		this.leadingTimestamps = /^(\s*\[(\d{1,2}:|)\d{1,2}:\d{2}(]|\.\d{1,3}]))+/;
		this.lyr = [];
		this.lyrics = [];
		this.stepTime = 0;
		this.tfLength = fb.TitleFormat('%length_seconds%');
		this.timestamps = /(\s*)\[(\d{1,2}:|)\d{1,2}:\d{2}(]|\.\d{1,3}])(\s*)/g;
	}

	// Methods

	advanceHighLighted() {
		this.newHighlighted = true;
		this.scroll = 0;
		if (this.locus >= 0) {
			this.clearHighlight();
			this.scroll = this.lineHeight;
		}
		this.locus++;
		this.getScrollSpeed();
		this.setHighlight();
		this.repaintRect();
	}

	checkScroll() {
		this.scroll = Math.max(0, this.scroll - this.delta);
		if (this.scroll <= 0) {
			this.newHighlighted = false;
		}
		this.repaintRect();
	}

	clear() {
		this.stop();
		this.lyrics = [];
	}

	clearHighlight() {
		this.lyrics.forEach(v => v.highlight = false);
	}

	display() {
		return this.lyrics.length && this.locus >= 0 && txt.lyricsDisplayed();
	}

	draw(gr) {
		if (!this.display()) return;
		const top = this.locus * this.lineHeight - this.locusOffset;
		const transition_factor = $.clamp((this.lineHeight - this.scroll) / this.lineHeight, 0, 1);
		const transition_factor_in = !this.lyrics[this.locus].multiLine ? transition_factor : 1;
		const transition_factor_out = $.clamp(transition_factor_in * 3, 0, 1);
		const alpha = Math.min(255 * transition_factor * 4 / 3, 255);
		const blendIn = this.type.synced ? ui.getBlend(ui.col.accent, ui.col.text, transition_factor_in) : ui.col.text;
		const blendOut = this.type.synced ? ui.getBlend(ui.col.text, ui.col.accent, transition_factor_out) : ui.col.text;
		const y = this.y + this.scroll;

		let col = ui.col.text;

		let fadeBot = this.transBot[transition_factor];
		if (!fadeBot) {
			fadeBot = $.RGBtoRGBA(col, alpha);
			this.transBot[transition_factor] = fadeBot;
		}

		let fadeTop = this.transTop[transition_factor];
		if (!fadeTop) {
			fadeTop = $.RGBtoRGBA(col, 255 - alpha);
			this.transTop[transition_factor] = fadeTop;
		}

		gr.SetTextRenderingHint(5);
		this.lyrics.forEach((lyric, i) => {
			const lyric_y = this.lineHeight * i;
			const line_y = Math.round(y - top + lyric_y);
			const bottomLine = line_y > this.bot;
			if (this.showlyric(lyric_y, top)) {
				const font = !lyric.highlight ? ui.font.lyrics : this.font.lyrics;
				if (this.shadowEffect && line_y >= this.top && !bottomLine) {
					if (this.dropNegativeShadowLevel) {
						gr.DrawString(lyric.content, font, ui.col.dropShadow, this.x - this.dropNegativeShadowLevel, line_y, this.w + 1, this.lineHeight + 1, this.alignCenter);
						gr.DrawString(lyric.content, font, ui.col.dropShadow, this.x, line_y - this.dropNegativeShadowLevel, this.w + 1, this.lineHeight + 1, this.alignCenter);
					}
					
					gr.DrawString(lyric.content, font, ui.col.dropShadow, this.x + this.dropShadowLevel, line_y + this.dropShadowLevel, this.w + 1, this.lineHeight + 1, this.alignCenter);
				}
				col = line_y >= this.top ? lyric.highlight ? blendIn : i == this.locus - 1 ? blendOut : bottomLine ? fadeBot : ui.col.text : fadeTop;
				gr.DrawString(lyric.content, font, col, this.x, line_y, this.w + 1, this.lineHeight + 1, this.alignCenter);
			}
		});
		if (this.showOffset) {
			const offsetW = gr.CalcTextWidth(`偏移: ${this.userOffset / 1000}s`, ui.font.main) + this.lineHeight;
			gr.FillRoundRect(this.x + this.w - offsetW, this.top, offsetW, this.lineHeight + 1, this.arc1, this.arc1, 0x96000000);
			gr.DrawRoundRect(this.x + this.w - offsetW, this.top, offsetW, this.lineHeight + 1, this.arc1, this.arc1, 1, 0x64000000);
			gr.DrawRoundRect(this.x + this.w - offsetW, this.top + 1, offsetW - 2, this.lineHeight + 1 - 2, this.arc2, this.arc2, 1, 0x28ffffff);
			gr.DrawString(`偏移: ${this.userOffset / 1000}s`, ui.font.main, ui.col.accent, this.x - this.lineHeight / 2, this.top, this.w, this.lineHeight + 1, this.alignRight);
		}
	}

	format(lyrics, isSynced) {
		if (lyrics.length && this.w > 10) {
			if (isSynced && lyrics[0].content && lyrics[0].timestamp > this.durationScroll) lyrics.unshift({timestamp: 0, content: ''});
			$.gr(1, 1, false, g => {
				for (let i = 0; i < lyrics.length; i++) {
					const l = g.EstimateLineWrap(lyrics[i].content, this.font.lyrics, this.w - 10);
					if (l[1] > this.maxLyrWidth) this.maxLyrWidth = l[1];
					if (l.length > 2) {
						const numLines = l.length / 2;
						let maxScrollTime = this.durationScroll * 2;
						if (lyrics[i + 1]) {
							maxScrollTime = Math.min(maxScrollTime * numLines, (lyrics[i + 1].timestamp - lyrics[i].timestamp) / numLines);
						}
						for (let j = 0; j < l.length; j += 2) {
							this.lyrics.push({content: l[j].trim(), timestamp: lyrics[i].timestamp + maxScrollTime * j / 2, id: i, multiLine: j ? true : false});
						}
					} else this.lyrics.push({content: lyrics[i].content.trim(), timestamp: lyrics[i].timestamp, id: i});
				}
			});
		}
		this.maxLyrWidth = Math.min(this.maxLyrWidth + 40, this.w);
		const incr = Math.min(500, this.durationScroll);
		this.lyrics.forEach((v, i) => {
			const t1 = this.getTimestamp(i - 1);
			const t2 = this.getTimestamp(i);
			const t3 = this.getTimestamp(i + 1);
			if (!v.content && t3 && t2 && t1 && t3 - t2 < incr) v.timestamp = Math.max((t2 - t1) / 2 + t1, t2 - incr);
		});
		this.repaintRect();
	}

	getCurPos() {
		return this.lyrics.findIndex(v => v.timestamp >= this.playbackTime());
	}

	getMilliseconds(t) {
		t = t.trim().replace(/[[\]]/,'').split(':');
		return Math.max((t.reduce((acc, time) => (60 * acc) + parseFloat(time))) * 1000, 0);
	}

	getScrollSpeed() {
		let durationScroll = this.durationScroll;
		const t1 = this.getTimestamp(this.locus - 1);
		const t2 = this.getTimestamp(this.locus);
		const t3 = this.getTimestamp(this.locus + 1);
		if (t1 && t2 && t2 - t1 > 0) {
			durationScroll = $.clamp(t2 - t1, this.minDurationScroll, this.durationScroll);
			if (t3 && t3 - t2 > 0 && t3 - t2 < this.durationScroll) durationScroll = $.clamp(t3 - t2, this.minDurationScroll, this.durationScroll);
		}

		const variSpeed = !ppt.lyricsScrollMaxMethod ? 10 * 500 : 0;
		if (variSpeed) {
			let diff1 = 0;
			let diff2 = 0;
			if (t1 && t2) {
				diff1 = t2 - t1;
				diff1 = diff1 > this.durationScroll ? diff1 * this.durationScroll / variSpeed : 0;
			}
			if (t2 && t3) {
				diff2 = t3 - t2;
				diff2 = diff2 > this.durationScroll ? diff2 * this.durationScroll / variSpeed : 0;
			}
			durationScroll += Math.min(diff1, diff2);
		}

		this.delta = this.lineHeight * this.factor / durationScroll;
		this.transitionOffset = durationScroll / 2;
	}

	getTimestamp(v) {
		return this.lyrics[v] && this.lyrics[v].timestamp;
	}

	load(lyr) {
		const newLyrics = !$.equal(lyr, this.lyr);
		if (newLyrics) {
			this.lyr = lyr;	
			this.userOffset = 0;
		}
		this.font = {
			lyrics: !ppt.largerSyncLyricLine ? ui.font.lyrics : gdi.Font(ui.font.main.Name, ui.font.zoomSize * 1.33, ui.font.lyrics.Style)
		}
		this.alignCenter = StringFormat(1, 1);
		this.alignRight = StringFormat(2, 1);
		
		this.init = true;
		this.lineHeight = !ppt.largerSyncLyricLine ? ui.font.lyrics_h + 4 * $.scale : ui.font.lyrics_h * 1.33;
		this.arc1 = Math.max(1, Math.floor((this.lineHeight + 1) / 2));
		this.arc2 = Math.max(1, Math.floor((this.lineHeight + 1 - 2) / 2));
		ppt.lyricsScrollTimeMax = $.clamp(Math.round(ppt.lyricsScrollTimeMax), 0, 3000);
		ppt.lyricsScrollTimeAvg = $.clamp(Math.round(ppt.lyricsScrollTimeAvg), 0, 3000);
		this.durationScroll = ppt.lyricsScrollMaxMethod ? ppt.lyricsScrollTimeMax : Math.round(ppt.lyricsScrollTimeAvg * 2 / 3);
		this.factor = this.durationScroll < 1500 ? 20 : 24;
		this.delta = this.lineHeight * this.factor / this.durationScroll;
		this.locus = -1;
		this.lyrics = [];
		this.lyricsOffset = 0;
		this.maxLyrWidth = 0;
		this.minDurationScroll = Math.min(this.durationScroll, 250); 
		this.newHighlighted = false;
		this.scroll = 0;
		this.shadowEffect = ppt.dropShadowLevel > 0;
		this.dropShadowLevel = ppt.dropShadowLevel;
		this.dropNegativeShadowLevel = this.dropShadowLevel > 1 ? Math.floor(this.dropShadowLevel / 2) : 0;
		this.showOffsetTimer = null;
		this.timer = null;
		this.trackLength = parseInt(this.tfLength.Eval(true));
		this.transitionOffset = this.durationScroll / 2;
		this.transBot = {}
		this.transTop = {}
		ppt.lyricsFadeHeight = $.clamp(ppt.lyricsFadeHeight, -1, 2)
		const fadeHeight = this.lineHeight * ppt.lyricsFadeHeight;
		this.x = panel.text.l;
		this.y = panel.text.t - this.lineHeight + fadeHeight;
		this.w = panel.text.w;
		this.h = panel.lines_drawn * ui.font.main_h + this.lineHeight * 2 - fadeHeight * 2;
		const linesDrawn = Math.floor(this.h / this.lineHeight);
		const oddNumLines = linesDrawn % 2;
		
		this.locusOffset = this.h / 2 - (oddNumLines ? this.lineHeight / 2 : this.lineHeight);
		this.top = this.locusOffset - this.lineHeight * (Math.floor(linesDrawn / 2) - (oddNumLines ? 1 : 2)) + this.y;
		this.bot = Math.round(this.top + this.lineHeight * (linesDrawn - 3));

		this.type = {
			none: false,
			synced: false,
			unsynced: false
		}

		this.parse(lyr);
	}

	on_mouse_wheel(step) {		
		step *= $.clamp(Math.round(1000 / ((Date.now() - this.stepTime) * 5)), 1, 5);
		this.stepTime = Date.now();
		this.userOffset += 1000 * -step;
		if (!this.userOffset) this.repaintRect();
		this.showOffset = this.type.synced && this.userOffset != 0;
		clearTimeout(this.showOffsetTimer);
		this.showOffsetTimer = setTimeout(() => {
			this.repaintRect();
			this.showOffset = false;
		}, 5000);
		this.seek();
	}

	on_playback_pause(isPaused) {
		if (isPaused) this.stop();
		else this.start();
	}

	parse(lyr) {
		if (!lyr.length) {
			this.type.none = true;
			lyr = this.noLyrics;
		}

		if (!this.type.none) {
			if (lyr.some(line => this.leadingTimestamps.test(line))) this.type.synced = true;
			else this.type.unsynced = true;
		}

		switch (true) {
			case this.type.synced: {
				let lyrOffset = null;
				lyr.some(line => lyrOffset = line.match(/^\s*\[offset\s*:(.*)\]\s*$/));
				if (lyrOffset && lyrOffset.length > 0) this.lyricsOffset = parseInt(lyrOffset[1]);
				if (isNaN(this.lyricsOffset)) this.lyricsOffset = 0;
				this.format(this.parseSyncLyrics(lyr, this.type.none), this.type.synced);
				break;
			}
			case this.type.unsynced: {
				this.format(this.parseUnsyncedLyrics(lyr, this.type.none));
				const ratio = !panel.isRadio() ? this.trackLength / this.lyrics.length * 1000 : 2000;
				this.lyrics.forEach((line, i) => line.timestamp = ratio * i);
				break;
			}
		}
		this.seek();
		this.start();
	}

	parseSyncLyrics(lyr, isNone) {
		let lyrics = [];
		if (isNone) lyrics.push({timestamp: 0, content: lyr[0]});
		lyr.forEach(line => {
			const content = this.tidy(line);
			const matches = line.match(this.leadingTimestamps);
			if (matches) {
				const all = matches[0].split('][');
				all.forEach(m => {
					lyrics.push({timestamp: this.getMilliseconds(m), content: content});
				});
			}
		});
		return lyrics.sort((a, b) => a.timestamp - b.timestamp)	
	}

	parseUnsyncedLyrics(lyr, isNone) {
		let lyrics = [];
		if (isNone) lyrics.push({timestamp: 0, content: lyr[0]});
		lyr.forEach(line => {
			lyrics.push({timestamp: 0, content: this.tidy(line)});
		});
		return lyrics;
	}

	playbackTime() {
		const time = !panel.isRadio() ? fb.PlaybackTime : fb.PlaybackTime - txt.reader.trackStartTime;
		return Math.round(time * 1000) + this.lyricsOffset + this.transitionOffset + this.userOffset;
	}

	repaintRect() {
		window.RepaintRect(this.x + (this.w - this.maxLyrWidth) / 2, this.y, this.maxLyrWidth, this.h + this.lineHeight);
		if (this.showOffset) window.RepaintRect(this.x, this.top, this.w + 5, this.lineHeight + 2);
	}

	scrollUpdateNeeded() {
		return this.lyrics.length > this.locus + 1 && this.playbackTime() > this.lyrics[this.locus + 1].timestamp;
	}

	seek() {
		this.clearHighlight();
		const curPos = this.getCurPos();
		this.locus = curPos < 0 ? this.lyrics.length - 1 : Math.max(0, curPos - 1);
		if (this.locus >= 0) {
			this.setHighlight();
			this.repaintRect();
		}
	}

	setHighlight() {
		const id = this.lyrics[this.locus].id;
		if (this.type.synced) this.lyrics.forEach(v => {if (v.id == id) v.highlight = true});
	}
	
	showlyric(y, top) {
		return y >= top && y + this.lineHeight * 2 <= this.h + top;
	}

	smoothScroll() {
		if (this.scrollUpdateNeeded()) {
			this.advanceHighLighted();
		}
		else if (this.newHighlighted) this.checkScroll();
	}

	start() {
		if (this.timer || !fb.IsPlaying || fb.IsPaused) return;
		this.timer = setInterval(() => {
			if (!this.init) this.smoothScroll();
			else this.init = false;
		}, 16);
	}

	stop() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}

	tidy(n) {
		return n.replace(this.timestamps, '$1$4').replace(this.enhancedTimestamps, '$1$4').trim();
	}
}