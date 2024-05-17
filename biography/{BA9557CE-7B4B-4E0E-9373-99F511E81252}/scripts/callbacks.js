'use strict';

function on_colours_changed() {
	ui.getColours();
	alb_scrollbar.setCol();
	art_scrollbar.setCol();
	img.createImages();
	filmStrip.logScrollPos();
	filmStrip.clearCache();
	filmStrip.createBorder();
	but.createImages('all');
	but.refresh(true);
	alb_scrollbar.resetAuto();
	art_scrollbar.resetAuto();
	if (ui.font.heading && ui.font.heading.Size) but.createStars();
	img.clearCache();
	img.getImages();
	if (panel.id.lyricsSource) {
		lyrics.transBot = {}
		lyrics.transTop = {}
	}
	txt.rev.cur = '';
	txt.bio.cur = '';
	txt.albCalc();
	txt.artCalc();
	txt.paint();
}

function on_font_changed() {
	ui.getFont();
	alb_scrollbar.reset();
	art_scrollbar.reset();
	alb_scrollbar.resetAuto();
	art_scrollbar.resetAuto();
	txt.on_size();
	img.on_size();
	window.Repaint();
}

function on_focus(is_focused) {
	resize.focus = is_focused;
}

function on_get_album_art_done(handle, art_id, image, image_path) {
	img.on_get_album_art_done(handle, art_id, image, image_path);
}

function on_item_focus_change() {
	if (!ppt.panelActive) return;
	if (fb.IsPlaying && !panel.id.focus) return;
	txt.notifyTags();
	if (panel.id.lookUp) panel.getList(true, true);
	else if (!panel.updateNeeded()) return;
	if (panel.block() && !$.server) {
		img.get = true;
		txt.get = panel.id.focus ? 2 : 1;
		img.artistReset();
		txt.albumReset();
		txt.artistReset();
	} else {
		if (panel.block() && $.server) {
			img.get = true;
			txt.get = 1;
			img.artistReset();
			txt.albumReset();
			txt.artistReset();
		} else {
			img.get = false;
			txt.get = 0;
		}
		panel.focusLoad();
		panel.focusServer();
	}
}

function on_key_down(vkey) {
	switch (vkey) {
		case 0x10:
		case 0x11:
		case 0x12:
			window.Repaint();
			break;
		case 0x21:
			if (panel.trace.text) {
				if (!txt.lyricsDisplayed()) txt.scrollbar_type().pageThrottle(1);
			} else if (panel.trace.film) filmStrip.scrollerType().pageThrottle(1);
			break;
		case 0x22:
			if (panel.trace.text) {
				if (!txt.lyricsDisplayed()) txt.scrollbar_type().pageThrottle(-1);
			} else if (panel.trace.film) filmStrip.scrollerType().pageThrottle(-1);
			break;
		case 35:
			if (panel.trace.text) {
				if (!txt.lyricsDisplayed()) txt.scrollbar_type().scrollToEnd();
			} else if (panel.trace.film) filmStrip.scrollerType().scrollToEnd();
			break;
		case 36:
			if (panel.trace.text) {
				if (!txt.lyricsDisplayed()) txt.scrollbar_type().checkScroll(0, 'full');
			} else if (panel.trace.film) filmStrip.scrollerType().checkScroll(0, 'full');
			break;
		case 37:
		case 38:
			if (panel.imgBoxTrace(panel.m.x, panel.m.y)) img.wheel(1);
			else if (panel.trace.film) filmStrip.scrollerType().wheel(1);
			break;
		case 39:
		case 40:
			if (panel.imgBoxTrace(panel.m.x, panel.m.y)) img.wheel(-1);
			else if (panel.trace.film) filmStrip.scrollerType().wheel(-1);
			break;
	}
}

function on_key_up(vkey) {
	if (vkey == 0x10 || vkey == 0x11 || vkey == 0x12) window.Repaint();
}

function on_library_items_added() {
	if (!ppt.panelActive) return;
	if (!lib) return;
	lib.update = true;
}

function on_library_items_removed() {
	if (!ppt.panelActive) return;
	if (!lib) return;
	lib.update = true;
}

function on_library_items_changed() {
	if (!ppt.panelActive) return;
	if (!lib) return;
	lib.update = true;
}

function on_load_image_done(task_id, image, image_path) {
	img.on_load_image_done(image, image_path);
	filmStrip.on_load_image_done(image, image_path);
}

function on_metadb_changed() {
	if (!ppt.panelActive) return;
	if (panel.isRadio(panel.id.focus) || panel.block() && !$.server || !panel.updateNeeded() || txt.lyricsDisplayed()) return;
	panel.getList(true, true);
	panel.focusLoad();
	panel.focusServer();
}

function on_mouse_lbtn_dblclk(x, y) {
	if (!ppt.panelActive) return;
	but.lbtn_dn(x, y);
	if (!txt.lyricsDisplayed()) txt.scrollbar_type().lbtn_dblclk(x, y);
	if (!ppt.dblClickToggle) return;
	if (ppt.touchControl) panel.id.last_pressed_coord = {
		x: x,
		y: y
	};
	if (!panel.trace.film) panel.click(x, y);
	else filmStrip.lbtn_dblclk(x, y);
}

function on_mouse_lbtn_down(x, y) {
	if (!ppt.panelActive) return;
	if (ppt.touchControl) panel.id.last_pressed_coord = {
		x: x,
		y: y
	};
	if (panel.trace.image && vk.k('alt')) {
		const imgPth = img.pth().imgPth;
		if (imgPth) $.browser('explorer /select,' + '"' + imgPth + '"', false)
	} else {
		resize.lbtn_dn(x, y);
		but.lbtn_dn(x, y);
		if (!txt.lyricsDisplayed()) txt.scrollbar_type().lbtn_dn(x, y);
		filmStrip.scrollerType().lbtn_dn(x, y);
		seeker.lbtn_dn(x, y);
		img.lbtn_dn(x);
	}
}

function on_mouse_lbtn_up(x, y) {
	if (!ppt.panelActive) {panel.inactivate(); return;}
	alb_scrollbar.lbtn_drag_up();
	art_scrollbar.lbtn_drag_up();
	art_scroller.lbtn_drag_up();
	cov_scroller.lbtn_drag_up();
	if (!ppt.dblClickToggle && !but.Dn && !seeker.dn && !panel.trace.film) panel.click(x, y);
	if (!txt.lyricsDisplayed()) txt.scrollbar_type().lbtn_up();
	panel.clicked = false;
	resize.lbtn_up();
	but.lbtn_up(x, y);
	filmStrip.lbtn_up(x, y);
	img.lbtn_up();
	seeker.lbtn_up();
}

function on_mouse_leave() {
	if (!ppt.panelActive) return;
	panel.leave();
	but.leave();
	alb_scrollbar.leave();
	art_scrollbar.leave();
	art_scroller.leave();
	cov_scroller.leave();
	txt.leave();
	img.leave();
	filmStrip.leave();
	panel.m.y = -1;
}

function on_mouse_mbtn_up(x, y, mask) {
	// hacks at default settings blocks on_mouse_mbtn_up, at least in windows; workaround configure hacks: main window > move with > caption only & ensure pseudo-caption doesn't overlap buttons
	switch (true) {
		case mask == 0x0004:
			panel.inactivate();
			break;
		case utils.IsKeyPressed(0x12):
			filmStrip.mbtn_up('onOff');
			break;
		case panel.trace.film && !but.trace('lookUp', x, y):
			filmStrip.mbtn_up('showCurrent');
			break;
		case ppt.panelActive:
			panel.mbtn_up(x, y);
			break;
	}
}

function on_mouse_move(x, y) {
	if (!ppt.panelActive) return;
	if (panel.m.x == x && panel.m.y == y) return;
	panel.move(x, y);
	but.move(x, y);
	if (!txt.lyricsDisplayed()) txt.scrollbar_type().move(x, y);
	filmStrip.scrollerType().move(x, y);
	resize.imgMove(x, y);
	resize.move(x, y);
	resize.filmMove(x, y);
	seeker.move(x, y);
	txt.move(x, y);
	img.move(x, y);
	filmStrip.move(x, y);
	panel.m.x = x;
	panel.m.y = y;
}

function on_mouse_rbtn_up(x, y) {
	men.rbtn_up(x, y);
	return true;
}

function on_mouse_wheel(step) {
	if (!ppt.panelActive) return;
	txt.deactivateTooltip();
	switch (panel.zoom()) {
		case false:
			switch (true) {
				case but.trace('lookUp', panel.m.x, panel.m.y):
					men.wheel(step, true);
					break;
				case panel.trace.film:
					filmStrip.scrollerType().wheel(step, false);
					break;
				case panel.trace.text:
					if (!txt.lyricsDisplayed()) txt.scrollbar_type().wheel(step, false);
					else if (panel.id.lyricsSource) lyrics.on_mouse_wheel(step);
					break;
				default:
					img.wheel(step);
					break;
			}
			break;
		case true:
			ui.wheel(step);
			if (vk.k('ctrl')) but.wheel(step);
			if (vk.k('shift')) {
				img.wheel(step);
				if (but.trace('lookUp', panel.m.x, panel.m.y)) men.wheel(step, true);
			}
			break;
	}
}

function on_notify_data(name, info) {
	let clone;
	if (ui.id.local && name.startsWith('opt_')) {
		clone = typeof info === 'string' ? String(info) : info;
		on_cui_notify(name, clone);
	}
	switch (name) {
		case 'bio_chkTrackRev':
			if (!$.server && ppt.showTrackRevOptions) {
				clone = JSON.parse(JSON.stringify(info));
				clone.inclTrackRev = true;
				window.NotifyOthers('bio_isTrackRev', clone);
			}
			break;
		case 'bio_isTrackRev':
			if ($.server && info.inclTrackRev == true) {
				clone = JSON.parse(JSON.stringify(info));
				server.getTrack(clone);
			}
			break;
		case 'bio_imgChange':
			img.fresh();
			men.fresh();
			break;
		case 'bio_checkImgArr':
			clone = JSON.parse(JSON.stringify(info));
			img.checkArr(clone);
			break;
		case 'bio_checkNumServers':
			window.NotifyOthers('bio_serverName', ppt.serverName);
			break;
		case 'bio_serverName':
			if (info != ppt.serverName) ppt.multiServer = true;
			break;
		case 'bio_customStyle':
			clone = String(info);
			panel.on_notify(clone);
			break;
		case 'bio_forceUpdate':
			if ($.server) {
				clone = JSON.parse(JSON.stringify(info));
				server.download(1, clone[0], clone[1]);
			}
			break;
		case 'bio_getLookUpList':
			panel.getList('', true);
			break;
		case 'bio_getRevImg':
			if ($.server) {
				clone = JSON.parse(JSON.stringify(info));
				server.getRevImg(clone[0], clone[1], clone[2], clone[3], false);
			}
			break;
		case 'bio_getImg':
			img.grab(info ? true : false);
			break;
		case 'bio_getText':
			txt.grab();
			break;
		case 'bio_lookUpItem':
			if ($.server) {
				clone = JSON.parse(JSON.stringify(info));
				server.download(false, clone[0], clone[1], name);
			}
			break;
		case `bio_newCfg${ppt.serverName}`:
			cfg.updateCfg($.jsonParse(info, {}));
			break;
		case `bio_notServer${ppt.serverName}`: {
			const recTimestamp = info;
			if (recTimestamp >= panel.notifyTimestamp) {
				$.server = false;
				timer.clear(timer.img);
				timer.clear(timer.zSearch);
			}
			break;
		}
		case 'bio_blacklist':
			img.blackList.artist = '';
			img.check();
			break;
		case `bio_scriptUnload${ppt.serverName}`:
			$.server = true;
			panel.notifyTimestamp = Date.now();
			window.NotifyOthers(`bio_notServer${ppt.serverName}`, panel.notifyTimestamp);
			break;
		case 'bio_refresh':
			window.Reload();
			break;
		case 'bio_reload':
			if (panel.stndItem()) window.Reload();
			else {
				txt.artistFlush();
				txt.albumFlush();
				txt.grab();
				if (ppt.text_only) txt.paint();
			}
			break;
		case 'bio_followSelectedTrack':
			if (!panel.id.lyricsSource && !panel.id.nowplayingSource) { // if enabled, panel has to be in prefer nowplaying mode
				if (panel.id.focus !== info) {
					panel.id.focus = ppt.focus = info;
					panel.changed();
					txt.on_playback_new_track();
					img.on_playback_new_track();
				}
			}
			break;
		case 'bio_status':
			ppt.panelActive = info;
			window.Reload();
			break;
		case 'bio_syncTags':
			if ($.server) {
				tag.force = true;
				const focus = info;
				server.call(focus);
			}
			break;
		case 'bio_webRequest':
			clone = String(info);
			server.urlRequested[clone] = Date.now(); // if multiServer enabled, limit URL requests for same item to one
			break;
		case 'newThemeColours':
			if (!ppt.themed) break;
			ppt.theme = info.theme;
			ppt.themeBgImage = info.themeBgImage;
			ppt.themeColour = info.themeColour;
			on_colours_changed();
			break;	
		case 'Sync col': {
			if (!ppt.themed) break;
			const themeLight = ppt.themeLight;
			if (themeLight != info.themeLight) {
				ppt.themeLight = info.themeLight;
				on_colours_changed();
			}
			break;
		}
		case 'Sync image':
			if (!ppt.themed) break;
			sync.img = {image: new GdiBitmap(info.image), id: info.id};
			if (!panel.block()) {
				sync.image(sync.img.image, sync.img.id);
				sync.get = false;
			} else sync.get = true;
			break;
		case "color_scheme_updated":
			let c_ol_tmp = ui.col.txt_h;
			let c_h, c_bg;
			if(info) c_h = RGB(info[0], info[1], info[2]);
			if(c_h != c_ol_tmp){
				if(info && switchbgcolour > 0){
					let c_bg_default = window.GetColourDUI(1);
					if(switchbgcolour == 2){
						if(info.length == 3) c_bg = ui.getBlend(c_bg_default, RGB(info[0], info[1], info[2]), 0.9);
						else c_bg = ui.getBlend(c_bg_default, RGB(info[3], info[4], info[5]), 0.9);
					} else if(c_bg_default != 4294967295) c_bg = ui.getBlend(c_bg_default, RGB(info[0], info[1], info[2]), 0.9);
				}
				ui.getColours(c_h, c_bg);
				txt.rev.cur = '';
				txt.bio.cur = '';
				txt.albCalc();
				txt.artCalc();
				txt.paint();
			}
			break;
		case "bgcolour_to_change":
			switchbgcolour = info;
			break;
	}
}

function on_paint(gr) {
	if (ui.pss.checkOnSize) on_size();
	ui.draw(gr);
	if (!ppt.panelActive) {
		panel.draw(gr);
		return;
	}
	img.draw(gr);
	seeker.draw(gr);
	txt.draw(gr);
	if (panel.id.lyricsSource) lyrics.draw(gr);
	filmStrip.draw(gr);
	but.draw(gr);
	resize.drawEd(gr);
	ui.lines(gr);
}

function on_playback_dynamic_info_track() {
	if (!ppt.panelActive) return;
	txt.rev.amFallback = true;
	txt.rev.wikiFallback = true;
	if ($.server) server.downloadDynamic();
	txt.reader.lyrics3Saved = false;
	txt.reader.ESLyricSaved = false;
	txt.reader.trackStartTime = fb.PlaybackTime;
	txt.on_playback_new_track();
	img.on_playback_new_track();
}

function on_playback_new_track() {
	if (!ppt.panelActive) return;
	if ($.server) server.call();
	if (panel.id.focus) return;
	txt.rev.amFallback = true;
	txt.rev.wikiFallback = true;
	txt.reader.lyrics3Saved = false;
	txt.reader.ESLyricSaved = false;
	txt.reader.trackStartTime = 0;
	txt.on_playback_new_track();
	img.on_playback_new_track();
}

function on_playback_pause(state) {
	if (panel.id.lyricsSource) lyrics.on_playback_pause(state);
}

function on_playback_seek() {
	if (panel.id.lyricsSource) lyrics.seek();
	if (panel.block()) return;
	const n = ppt.artistView ? 'bio' : 'rev';
	if ((txt[n].loaded.txt && txt.reader[n].nowplaying || ppt.sourceAll) && txt.reader[n].perSec) {
		txt.logScrollPos();
		txt.getText();
		txt.paint();
	}
}

function on_playback_time() {
	if (panel.block()) return;
	const n = ppt.artistView ? 'bio' : 'rev';
	if ((txt[n].loaded.txt && txt.reader[n].nowplaying || ppt.sourceAll) && txt.reader[n].perSec) {
		txt.logScrollPos();
		txt.getText('', '', 'playbackTime');
		txt.paint();
	}
}

function on_playback_stop(reason) {
	if (!ppt.panelActive) return;
	const n = ppt.artistView ? 'bio' : 'rev';
    if (reason != 2 && txt[n].loaded.txt && txt.reader[n].lyrics) txt.getText();
	if (panel.id.lyricsSource) lyrics.clear();
	if (reason == 2) return;
	on_item_focus_change();
}

function on_playlist_items_added() {
	if (!ppt.panelActive) return;
	on_item_focus_change();
}

function on_playlist_items_removed() {
	if (!ppt.panelActive) return;
	on_item_focus_change();
}

function on_playlist_switch() {
	if (!ppt.panelActive) return;
	on_item_focus_change();
}

function on_playlists_changed() {
	if (!ppt.panelActive) return;
	men.playlists_changed();
}

function on_script_unload() {
	if ($.server) {
		window.NotifyOthers(`bio_scriptUnload${ppt.serverName}`, 0);
		timer.clear(timer.img);
	}
	but.on_script_unload();
	txt.deactivateTooltip();
}

const windowMetricsPath = `${fb.ProfilePath}settings\\themed\\windowMetrics.json`;
function on_size() {
	txt.repaint = false;
	panel.w = window.Width;
	panel.h = window.Height;
	if (!window.IsVisible && ui.pss.installed && !ppt.themed) {
		ui.pss.checkOnSize = true;
		return;
	}
	ui.pss.checkOnSize = false;
	if (!panel.w || !panel.h) return;
	txt.logScrollPos('bio');
	txt.logScrollPos('rev');
	ui.getParams();

	if (!ppt.panelActive) return;
	txt.deactivateTooltip();
	panel.calcText = true;
	txt.on_size();

	if (ppt.themed && (ppt.theme || ppt.themeBgImage)) {
		const themed_image = `${fb.ProfilePath}settings\\themed\\themed_image.bmp`;	
		if ($.file(themed_image) && !panel.block()) sync.image(gdi.Image(themed_image));
	}
	img.on_size();
	filmStrip.on_size();
	txt.repaint = true;
	img.art.displayedOtherPanel = null;

	if (!ppt.themed) return;
	const windowMetrics = $.jsonParse(windowMetricsPath, {}, 'file');
	windowMetrics[window.Name] = {
		w: panel.w,
		h: panel.h
	}
	$.save(windowMetricsPath, JSON.stringify(windowMetrics, null, 3), true);
}