'use strict';

const ui = new UserInterface;
const vk = new Vkeys;
const panel = new Panel;
const name = new Names;
const alb_scrollbar = new Scrollbar;
const art_scrollbar = new Scrollbar;
const art_scroller = new Scrollbar;
const cov_scroller = new Scrollbar;
const but = new Buttons;
const popUpBox = new PopUpBox;
const txt = new Text;
const tag = new Tagger;
const resize = new ResizeHandler;
const lib = new Library;
const img = new Images;
const seeker = new Seeker;
const filmStrip = new FilmStrip;
const timer = new Timers;
const men = new MenuItems;
const server = new Server;
const infobox = new Infobox;

let lyrics;
if (panel.id.lyricsSource) lyrics = new Lyrics;

alb_scrollbar.type = 'alb';
art_scrollbar.type = 'art';
art_scroller.type = 'film';
cov_scroller.type = 'film';

timer.image();

timer.clear(timer.zSearch);
timer.zSearch.id = setTimeout(() => {
		server.download(false, {ix:0, focus:false}, {ix:0, focus:false}); server.download(false, {ix:0, focus:true}, {ix:0, focus:true});
		timer.zSearch.id = null;
}, 3000);

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
	txt.rev.cur = -1;
	txt.bio.cur = -1;
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
	if (fb.IsPlaying && !panel.id.focus) return;
	panel.getList(true, true);
	if (panel.block()) {
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
	if (!lib) return;
	lib.update = true;
}

function on_library_items_removed() {
	if (!lib) return;
	lib.update = true;
}

function on_library_items_changed() {
	if (!lib) return;
	lib.update = true;
}

function on_load_image_done(task_id, image, image_path) {
	img.on_load_image_done(image, image_path);
	filmStrip.on_load_image_done(image, image_path);
}

function on_metadb_changed(handleList, fromhook) {
	if(fromhook) return;
	if(panel.isRadio(panel.id.focus) || !panel.updateNeeded() || txt.lyricsDisplayed()) return;
	// Regorxxx <- Tag changes affect panel focus
	const [handle,] = fb.IsPlaying && !panel.id.focus
		? [fb.GetNowPlaying(), plman.PlayingPlaylist]
		: [fb.GetFocusItem(true), plman.ActivePlaylist];
	if(!handle || handleList.BSearch(handle) === -1) { return; }
	// Regorxxx ->
	panel.getList(true, true);
	panel.focusLoad();
	panel.focusServer();
}

function on_mouse_lbtn_dblclk(x, y) {
	but.lbtn_dn(x, y);
	if (!txt.lyricsDisplayed()) txt.scrollbar_type().lbtn_dblclk(x, y);
	if (!ppt.dblClickToggle) return;
	if (ppt.touchControl) panel.id.last_pressed_coord = {
		x: x,
		y: y
	};
	if (panel.trace.film) filmStrip.lbtn_dblclk(x, y);
	else panel.click(x, y);
}

function on_mouse_lbtn_down(x, y) {
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
		case utils.IsKeyPressed(0x12):
			filmStrip.mbtn_up('onOff');
			break;
		case panel.trace.film && !but.trace('lookUp', x, y):
			filmStrip.mbtn_up('showCurrent');
			break;
		default:
			panel.mbtn_up(x, y);
			break;
	}
}

function on_mouse_move(x, y) {
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
	/*let clone;
	if (ui.id.local && name.startsWith('opt_')) {
		clone = typeof info === 'string' ? String(info) : info;
		on_cui_notify(name, clone);
	}*/
	switch (name) {
		case "color_scheme_updated":
			let c_h = false, c_bg = false;
			if(info) {
				c_h = RGB(info[0], info[1], info[2]);
				if(info.length > 3) c_bg = RGB(info[3], info[4], info[5]);
			}
			if(!c_h) c_h = ui.dui ? window.GetColourDUI(2) : window.GetColourCUI(2);
			if(!c_bg) c_bg = ui.dui ? window.GetColourDUI(1) : window.GetColourCUI(3);
			ui.getColours(c_h, c_bg);
			txt.rev.cur = -1;
			txt.bio.cur = -1;
			txt.albCalc();
			txt.artCalc();
			txt.paint();
			break;
	}
}

function on_paint(gr) {
	if (ui.pss.checkOnSize) on_size();
	ui.draw(gr);
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
	txt.rev.amFallback = true;
	txt.rev.wikiFallback = true;
	server.downloadDynamic();
	txt.reader.lyrics3Saved = false;
	txt.reader.ESLyricSaved = false;
	txt.reader.trackStartTime = fb.PlaybackTime;
	txt.on_playback_new_track();
	img.on_playback_new_track();
}

function on_playback_new_track() {
	server.call();
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
		txt.getText();
		txt.paint();
	}
}

function on_playback_time() {
	if (panel.block()) return;
	const n = ppt.artistView ? 'bio' : 'rev';
	if ((txt[n].loaded.txt && txt.reader[n].nowplaying || ppt.sourceAll) && txt.reader[n].perSec) {
		txt.getText('', '', 'playbackTime');
		txt.paint();
	}
}

function on_playback_stop(reason) {
	const n = ppt.artistView ? 'bio' : 'rev';
    if (reason != 2 && txt[n].loaded.txt && txt.reader[n].lyrics) txt.getText();
	if (panel.id.lyricsSource) lyrics.clear();
	if (reason == 2) return;
	on_item_focus_change();
}

function on_playlist_items_added() {
	on_item_focus_change();
}

function on_playlist_items_removed() {
	on_item_focus_change();
}

function on_playlist_switch() {
	on_item_focus_change();
}

function on_script_unload() {
	['dl', 'img', 'lyrics', 'sim1', 'sim2', 'size', 'source', 'transition', 'tt', 'zSearch'].forEach(v => timer.clear(timer[v])); // clear all timers to avoid callbacks firing after unload
	[...XMLHttpRequests].forEach((request) => request.abort()); // Regorxxx <- Http Requests when utils.HTTPRequestAsync is available ->
	but.on_script_unload();
	panelCfg.flush(); // 把还没写盘的属性改动落进 panel.cfg
	txt.deactivateTooltip();
}

const SIZE_GAP = 100; // a full re-layout costs 10-60 ms; never run it more often than this while resizing
let sizePassAt = 0;

function on_size() {
	panel.w = window.Width;
	panel.h = window.Height;
	if (!window.IsVisible && ui.pss.installed) {
		ui.pss.checkOnSize = true;
		return;
	}
	ui.pss.checkOnSize = false;
	if (!panel.w || !panel.h) return;
	panel.setStyle(); // geometry only: cheap, so the panel follows the drag frame by frame
	if (!panel.sized) { // first pass: nothing on screen yet, lay out synchronously
		panel.sized = true;
		sizePassAt = Date.now();
		resizePanel();
		return;
	}
	// A window drag fires dozens of WM_SIZE messages. Instead of queueing one heavy pass
	// per message, run the first one at once and the following ones at most every
	// SIZE_GAP ms: the panel stays alive during the drag and the last message is still
	// honoured, because a queued pass reads panel.w/h when it actually runs.
	if (timer.size.id) return;
	const wait = Math.max(0, SIZE_GAP - (Date.now() - sizePassAt));
	timer.size.id = setTimeout(() => {
		timer.size.id = null;
		sizePassAt = Date.now();
		resizePanel();
	}, wait);
}

function resizePanel() {
	timer.clear(timer.size);
	txt.repaint = false; // hold text painting until the new geometry is in place
	ui.getParams();
	txt.deactivateTooltip();
	panel.calcText = true;
	txt.on_size();
	img.on_size();
	filmStrip.on_size();
	img.refreshFilmID(); // film strip geometry is final now, keep the cached image entry valid
	txt.repaint = true;
	img.art.displayedOtherPanel = null;
	window.Repaint();
}

// Regorxxx <- Http Requests when utils.HTTPRequestAsync is available
function on_http_request_done(task_id, success, response_text, status, headers) {
	XMLHttpRequests.forEach((request) => {
		if (request.id === task_id) { 
			request.readyState = 4;
			request.status = status;
			request.responseText = response_text;
			request.onreadystatechange();
			request.abort();
		}
	});
}
// Regorxxx ->

// Regorxxx <- warn about errors downloading files
function on_download_file_done(path, success, error_text) {
	if (!success) { console.log('Biography - 保存图像出错:\n\t', error_text); }
}
// Regorxxx ->