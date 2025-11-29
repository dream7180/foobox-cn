'use strict';

const MF_GRAYED = 0x00000001;
const MF_STRING = 0x00000000;

class MenuManager {
	constructor(name, clearArr, baseMenu) {
		this.baseMenu = baseMenu || 'baseMenu';
		this.clearArr = clearArr;
		this.func = {};
		this.idx = 0;
		this.menu = {};
		this.menuItems = [];
		this.menuNames = [];
		this.name = name;
	}

	// Methods

	addItem(v) {
		if (v.separator && !v.str) {
			const separator = this.get(v.separator);
			if (separator) this.menu[v.menuName].AppendMenuSeparator();
		} else {
			const hide = this.get(v.hide);
			if (hide || !v.str) return;
			this.idx++;
			if (!this.clearArr) this.executeFunctions(v, ['checkItem', 'checkRadio', 'flags', 'menuName', 'separator', 'str']); // if clearArr, functions redundant & not supported
			const a = this.clearArr ? v : this;
			const menu = this.menu[a.menuName];
			menu.AppendMenuItem(a.flags, this.idx, a.str);
			if (a.checkItem) menu.CheckMenuItem(this.idx, a.checkItem);
			if (a.checkRadio) menu.CheckMenuRadioItem(this.idx, this.idx, this.idx);
			if (a.separator) menu.AppendMenuSeparator();
			this.func[this.idx] = v.func;
		}
	}

	addSeparator({menuName = this.baseMenu, separator = true}) {this.menuItems.push({ menuName: menuName || this.baseMenu, separator: separator});}

	appendMenu(v) {
		const a = this.clearArr ? v : this;
		if (!this.clearArr) this.executeFunctions(v, ['hide', 'menuName']);
		if (a.menuName == this.baseMenu || a.hide) return;
		if (!this.clearArr) this.executeFunctions(v, ['appendTo', 'flags', 'separator', 'str']);
		const menu = this.menu[a.appendTo || this.baseMenu];
		this.menu[a.menuName].AppendTo(menu, a.flags, a.str || a.menuName)
		if (a.separator) menu.AppendMenuSeparator();
	}

	clear() {
		this.menu = {}
		this.func = {}
		this.idx = 0;
		if (this.clearArr) {
			this.menuItems = [];
			this.menuNames = [];
		}
	}

	createMenu(menuName = this.baseMenu) {
		menuName = this.get(menuName);
		this.menu[menuName] = window.CreatePopupMenu();
	}

	executeFunctions(v, items) {
		let i = 0;
		let ln = items.length;
		while (i < ln) {
			const w = items[i];
			this[w] = this.get(v[w])
			i++;
		}
	}

	get(v) {
		if (v instanceof Function) return v(); 
		return v;
	}

	load(x, y) {
		if (!this.menuItems.length) men[this.name]();
		let i = 0;
		let ln = this.menuNames.length;
		while (i < ln) {
			this.createMenu(this.menuNames[i])
			i++;
		}

		i = 0;
		ln = this.menuItems.length;
		while (i < ln) {
			const v = this.menuItems[i];
			!v.appendMenu ? this.addItem(v) : this.appendMenu(v)
			i++;
		}
		const idx = this.menu[this.baseMenu].TrackPopupMenu(x, y);
		this.run(idx);

		this.clear();
	}

	newItem({str = null, func = null, menuName = this.baseMenu, flags = MF_STRING, checkItem = false, checkRadio = false, separator = false, hide = false}) {this.menuItems.push({str: str, func: func, menuName: menuName, flags: flags, checkItem: checkItem, checkRadio: checkRadio, separator: separator, hide: hide});}

	newMenu({menuName = this.baseMenu, str = '', appendTo = this.baseMenu, flags = MF_STRING, separator = false, hide = false}) {
		this.menuNames.push(menuName);
		if (menuName != this.baseMenu) this.menuItems.push({menuName: menuName, appendMenu: true, str: str, appendTo: appendTo, flags: flags, separator: separator, hide: hide});
	}

	run(idx) {
		const v = this.func[idx];
		if (v instanceof Function) v(); 
	}
}

const clearArr = true;
const menu = new MenuManager('mainMenu', clearArr);
const bMenu = new MenuManager('buttonMenu', clearArr);

class MenuItems {
	constructor() {
		this.docTxt = '';
		this.handles = new FbMetadbHandleList();
		this.openName = [];
		this.popUpTitle = '缺少数据：';
		this.right_up = false;
		this.shift = false;
		this.sources = [];
		this.tags = false;
		this.types = [];
		this.counter = {
			bio: 0,
			rev: 0
		};
		this.display = {
			check: [],
			str: []
		};
		this.img = {
			artist: '',
			artistClean: '',
			blacklist: [],
			blacklistStr: [],
			covType: [lg['Front'], lg['Back'], lg['Disc'], lg['Icon'], lg['Artist'], lg['Cycle above'], lg['Cycle from folder']],
			isLfm: true,
			list: [],
			name: ''
		};
		this.playlist = {
			menu: [],
			origIndex: 0
		};
		this.path = {
			am: [],
			blackList: '',
			img: false,
			lfm: [],
			open: [],
			tracksAm: [],
			tracksLfm: [],
			tracksWiki: [],
			txt: [],
			wiki: [],
		};
		this.undo = {
			folder: '',
			path: '',
			text: '#!#'
		}

		this.playlists_changed();
	}

	// Methods

	buttonMenu() {
		bMenu.newMenu({});
		const artist = panel.art.list.length ? panel.art.list[0].name : name.artist(panel.id.focus);
		switch (ppt.artistView) {
			case true:
				panel.art.list.forEach((v, i) => bMenu.newItem({
					str: v.name.replace(/&/g, '&&') + v.field.replace(/&/g, '&&'),
					func: () => this.lookUpArtist(i),
					flags: v.type != 'label' ? MF_STRING : MF_GRAYED,
					checkRadio: i == panel.art.ix,
					separator: !i || v.type == 'similarend' || v.type == 'label' || v.type == 'tagend'
				}));
				for (let i = 0; i < 4; i++) bMenu.newItem({
					str: this.getlookUpStr(i, 0),
					func: () => this.lookUpArtist(panel.art.list.length + i),
					flags: !i ? MF_GRAYED : MF_STRING,
					checkItem: i == 1 && ppt.cycItem,
					separator: true
				});

				bMenu.newMenu({
					menuName: lg['More...']
				});
				for (let i = 0; i < 8; i++) bMenu.newItem({
					menuName: lg['More...'],
					str: this.getlookUpStr(i, 1, artist),
					func: () => this.lookUpArtistItems(i),
					checkItem: i < 3 && [ppt.showSimilarArtists, ppt.showMoreTags, ppt.autoLock][i],
					separator: i == 1 || i == 2
				});
				break;
			case false:
				panel.alb.list.forEach((v, i) => bMenu.newItem({
					str: ((!i ? v.artist.replace(/&/g, '&&') + ' - ' + v.album.replace(/&/g, '&&') : v.album.replace(/&/g, '&&')) + (!v.composition ? '' : ' [composition]')).replace(/^\s-\s/, ''),
					func: () => this.lookUpAlbum(i),
					flags: v.type != 'label' ? MF_STRING : MF_GRAYED,
					checkRadio: i == panel.alb.ix,
					separator: !i || v.type == 'albumend' || v.type == 'label'
				}));
				for (let i = 0; i < 4; i++) bMenu.newItem({
					str: this.getlookUpStr(i, 0),
					func: () => this.lookUpAlbum(panel.alb.list.length + i),
					flags: !i ? MF_GRAYED : MF_STRING,
					checkItem: i == 1 && ppt.cycItem,
					separator: true
				});

				bMenu.newMenu({
					menuName: lg['More...']
				});
				for (let i = 0; i < 8; i++) bMenu.newItem({
					menuName: lg['More...'],
					str: this.getlookUpStr(i, 2, artist),
					func: () => this.lookUpAlbumItems(i),
					checkItem: i < 2 && [ppt.showTopAlbums, ppt.autoLock][i],
					separator: i == 0 || i == 1
				});
				break;
		}
	}

	mainMenu() {
		menu.newMenu({});
		menu.newItem({
			str: `${$.titlecase(cfg.cfgBaseName)} server`,
			flags: MF_GRAYED,
			separator: true,
			hide: !$.server || !this.shift || !vk.k('ctrl')
		});

		const b = ppt.artistView ? 'Bio' : 'Rev';
		const loadName = lg['Load'] + (!ppt.sourceAll ? '' : lg[' first']);
		const n = b.toLowerCase();
		const separator = !ppt.artistView && (ppt.showTrackRevOptions || txt.isCompositionLoaded()) || !panel.stndItem();

		menu.newMenu({
			menuName: loadName,
			hide: ppt.img_only
		});

		this.sources.forEach((v, i) => menu.newItem({
			menuName: loadName,
			str: v,
			func: () => this.toggle(i, b, true),
			flags: txt[n][this.types[i]] ? MF_STRING : MF_GRAYED,
			checkRadio: i == txt[n].loaded.ix,
			separator: txt[n].reader ? i == 3 && separator : i == 2 && separator
		}));

		if (ppt.showTrackRevOptions && !ppt.artistView && panel.stndItem() && !txt.isCompositionLoaded()) {
			menu.newItem({
				menuName: loadName,
				str: lg['Type:'],
				flags: MF_GRAYED,
				separator: true
			});
			[lg['Album'], lg['Track'], lg['Prefer both']].forEach((v, i) => menu.newItem({
				menuName: loadName,
				str: v,
				func: () => this.setReviewType(i),
				flags: !txt[n][this.types[0]] && !txt[n][this.types[1]] && !txt[n][this.types[2]] ? MF_STRING : !txt[n].loaded.txt && [this.albAvail, this.trkAvail, this.albAvail || this.trkAvail][i] ? MF_STRING : MF_GRAYED,
				checkRadio: !i && !ppt.inclTrackRev || i == 1 && ppt.inclTrackRev == 2 || i == 2 && ppt.inclTrackRev == 1
			}));
		}

		if (!panel.stndItem() || txt.isCompositionLoaded()) {
			menu.newItem({
				menuName: loadName,
				str: lg['Mode: '] + (ppt.artistView ? lg['artist look-up'] : (txt.isCompositionLoaded() ? lg['composition loaded'] : lg['album look-up'])),
				flags: MF_GRAYED
			});
		}

		menu.addSeparator({separator: !ppt.img_only ? true : false});

		menu.newMenu({
			menuName: lg['Display']
		});

		for (let i = 0; i < 11; i++) menu.newItem({
			menuName: lg['Display'],
			str: this.display.str[i],
			func: () => this.setDisplay(i),
			flags: i == 1 && ppt.autoEnlarge || i == 6 && !ppt.summaryShow || i == 10&& (panel.id.lyricsSource || panel.id.nowplayingSource) ? MF_GRAYED : MF_STRING,
			checkItem: (i > 2 && i < 6) && this.display.check[i],
			checkRadio: (i < 3 || i > 6 && i < 9 || i > 8) && this.display.check[i],
			separator: i == 2 || i == 5 || i == 6 || i == 8
		});

		menu.addSeparator({});

		menu.newMenu({
			menuName: lg['Sources']
		});

		menu.newMenu({
			menuName: lg['Text'],
			appendTo: lg['Sources']
		});

		for (let i = 0; i < 5; i++) menu.newItem({
			menuName: lg['Text'],
			str: [lg['Auto-fallback'], lg['Static'], lg['Amalgamate'], lg['Show track review options on load menu'], lg['Prefer composition reviews (allmusic && wikipedia)']][i],
			func: () => this.setTextType(i, b),
			flags: !i && ppt.sourceAll || i == 1 && ppt.sourceAll ? MF_GRAYED : MF_STRING,
			checkItem: i == 2 && ppt.sourceAll || i == 3 && ppt.showTrackRevOptions || i == 4 && ppt.classicalMusicMode,
			checkRadio: !i && (!ppt.lockBio || ppt.sourceAll) || i == 1 && ppt.lockBio && !ppt.sourceAll,
			separator: i == 1 || i == 2 || i == 3 && cfg.classicalModeEnable,
			hide: i == 4 && !cfg.classicalModeEnable
		});

		menu.addSeparator({menuName: lg['Sources']});

		menu.newMenu({
			menuName: lg['Photo'],
			appendTo: lg['Sources']
		});

		[lg['Cycle from download folder'], lg['Cycle from custom folder [fallback to above]'], lg['Artist (single image [fb2k: display])']].forEach((v, i) => menu.newItem({
			menuName: lg['Photo'],
			str: v,
			func: () => this.setPhotoType(i),
			checkRadio: ppt.cycPhotoLocation == i,
			separator: i == 1
		}));

		menu.newMenu({		
			menuName: lg['Cover'],
			str: lg['Cover'],
			appendTo: lg['Sources'],
			flags: !panel.alb.ix || ppt.artistView ? MF_STRING : MF_GRAYED
		});

		this.img.covType.forEach((v, i) => menu.newItem({
			menuName: lg['Cover'],
			str: v,
			func: () => this.setCover(i),
			flags: ppt.loadCovFolder && !ppt.loadCovAllFb && i < 5 ? MF_GRAYED : MF_STRING,
			checkItem: (ppt.loadCovAllFb || i > 4) && [img.cov.selection[0] != -1, img.cov.selection[1] != -1, img.cov.selection[2] != -1, img.cov.selection[3] != -1, img.cov.selection[4] != -1, ppt.loadCovAllFb, ppt.loadCovFolder][i],
			checkRadio: !ppt.loadCovAllFb && i == ppt.covType,
			separator: i == 4
		}));

		menu.addSeparator({menuName: lg['Sources']});

		menu.newMenu({
			menuName: lg['Open file location'],
			appendTo: lg['Sources'],
			flags: this.getOpenFlag()
		});

		for (let i = 0; i < 8; i++) menu.newItem({
			menuName: lg['Open file location'],
			str:  this.openName[i],
			func: () => $.browser('explorer /select,' + '"' + this.path.open[i] + '"', false),
			flags: this.getOpenFlag(),
			separator: !i && this.openName.length > 1 && this.path.img || this.path.txt[3] && i == this.openName.length - 2 && this.openName.length > 2,
			hide: !this.openName[i]
		});

		menu.addSeparator({menuName: lg['Sources']});

		if (ppt.menuShowPaste == 2 || ppt.menuShowPaste && this.shift) {
			menu.newMenu({
				menuName: lg['Paste text from clipboard'],
				appendTo: lg['Sources'],
				separator: ppt.menuShowPaste == 2 || ppt.menuShowPaste && this.shift
			});
			for (let i = 0; i < 5; i++) menu.newItem({
				menuName: lg['Paste text from clipboard'],
				str: [ppt.artistView ? lg['Biography [allmusic location]'] : lg['Review [allmusic location]'], ppt.artistView ? lg['Biography [last.fm location]'] : lg['Review [last.fm location]'], ppt.artistView ? lg['Biography [wikipedia location]'] : lg['Review [wikipedia location]'], lg['Open last edited'], lg['Undo']][i],
				func: () => this.setPaste(i),
				flags: !i && !this.path.am[2] || i == 1 && !this.path.lfm[2]  || i == 2 && !this.path.wiki[2] || i == 3 && !this.undo.path || i == 4 && this.undo.text == '#!#' ? MF_GRAYED : MF_STRING,
				separator: i == 2 || i == 3
			});
		}

		menu.newItem({
			menuName: lg['Sources'],
			str: lg['Force update'],
			func: () => panel.callServer(1, panel.id.focus, 'bio_forceUpdate', 0)
		});

		const style_arr = panel.style.name.slice();
		menu.newMenu({
			menuName: lg['Layout']
		});

		const style = ppt.sameStyle ? ppt.style : ppt.artistView ? ppt.bioStyle : ppt.revStyle
		style_arr.forEach((v, i) => menu.newItem({
			menuName: lg['Layout'],
			str: v,
			func: () => this.setStyle(i),
			checkRadio: style <= style_arr.length - 1 && i == style,
			separator: i == 3 || style_arr.length > 5 && i == style_arr.length - 1
		}));

		menu.newMenu({
			menuName: lg['Create && manage styles'],
			appendTo: lg['Layout']
		});

		[lg['Create new style...'], lg['Rename custom style...'], lg['Delete custom style...'], lg['Export custom style...'], lg['Reset style...']].forEach((v, i) => menu.newItem({
			menuName: lg['Create && manage styles'],
			str: v,
			func: () => this.setStyles(i),
			flags: !i || ppt.style > 4 || i == 4 ? MF_STRING : MF_GRAYED,
			separator: !i
		}));

		menu.addSeparator({menuName: lg['Layout']});

		menu.newMenu({
			menuName: lg['Filmstrip'],
			appendTo: lg['Layout']
		});

		[lg['Top'], lg['Right'], lg['Bottom'], lg['Left'], lg['Overlay image area'], lg['Reset to default size...']].forEach((v, i) => menu.newItem({
			menuName: lg['Filmstrip'],
			str: v,
			func: () => {
				if (i == 4) ppt.toggle('filmStripOverlay');
				if (i != 4 || ppt.showFilmStrip) filmStrip.set(i == 4 ? ppt.filmStripPos : i);
			},
			flags: i != 4 || ppt.style != 4 ? MF_STRING : MF_GRAYED,
			checkItem: i == 4 && (ppt.filmStripOverlay || (ppt.style == 4 && !ppt.text_only && !ppt.img_only)),
			checkRadio: i < 4 && i == ppt.filmStripPos,
			separator: i == 3 || i == 4
		}));

		menu.addSeparator({menuName: lg['Layout']});

		[lg['Reset zoom'], lg['Reload']].forEach((v, i) => menu.newItem({
			menuName: lg['Layout'],
			str: v,
			func: () => !i ? but.resetZoom() : window.Reload(),
		}));

		menu.newMenu({
			menuName: lg['Image']
		});

		menu.newItem({
			menuName: lg['Image'],
			str: lg['Auto cycle'],
			func: () => ppt.toggle('cycPic'),
			checkItem: ppt.cycPic,
			separator: true
		});

		if (ppt.style < 4) {
			menu.newMenu({
				menuName: lg['Alignment'],
				appendTo: lg['Image']
			});
			for (let i = 0; i < 4; i++) menu.newItem({
				menuName: lg['Alignment'],
				str: ppt.style == 0 || ppt.style == 2 ? [lg['Left'], lg['Centre'], lg['Right'], lg['Align with text']][i] : [lg['Top'], lg['Centre'], lg['Bottom'], lg['Align with text']][i],
				func: () => this.setImageAlignnment(i, 'standard'),
				checkItem: i == 3 && ppt.textAlign,
				checkRadio: i == (ppt.style == 0 || ppt.style == 2 ? ppt.alignH : ppt.alignV),
				separator: i == 2
			});
		}

		if (ppt.style > 3) {
			menu.newMenu({
				menuName: lg['Alignment horizontal'],
				appendTo: lg['Image']
			});
			[lg['Left'], lg['Centre'], lg['Right']].forEach((v, i) => menu.newItem({
				menuName: lg['Alignment horizontal'],
				str: v,
				func: () => this.setImageAlignnment(i, 'horizontal'),
				checkRadio:  i == ppt.alignH
			}));
			menu.newMenu({
				menuName: lg['Alignment vertical'],
				appendTo: lg['Image']
			});
			[lg['Top'], lg['Centre'], lg['Bottom'], lg['Auto']].forEach((v, i) => menu.newItem({
				menuName: lg['Alignment vertical'],
				str: v,
				func: () => this.setImageAlignnment(i, 'vertical'),
				checkRadio: [!ppt.alignV && !ppt.alignAuto, ppt.alignV == 1 && !ppt.alignAuto, ppt.alignV == 2 && !ppt.alignAuto, ppt.alignAuto][i],
				separator: i == 2
			}));
		}

		menu.addSeparator({menuName: lg['Image']});

		menu.newMenu({
			menuName: lg['Black list'],
			appendTo: lg['Image']
		});

		for (let i = 0; i < 3; i++) menu.newItem({
			menuName: lg['Black list'],
			str: this.img.blacklistStr[i],
			func: () => this.setImageBlacklist(i),
			flags: !i && this.img.isLfm || i == 2 ? MF_STRING : MF_GRAYED,
			hide: i == 2 && img.blackList.undo[0] != this.img.artistClean
		});

		this.img.blacklist.forEach((v, i) => menu.newItem({
			menuName: lg['Black list'],
			str: (this.img.artist + '_' + v).replace(/&/g, '&&'),
			func: () => this.setImageBlacklist(i + (img.blackList.undo[0] == this.img.artistClean ? 3 : 2)),
		}));

		menu.addSeparator({});

		if (ppt.menuShowPlaylists == 2 || ppt.menuShowPlaylists && this.shift) {
			const pl_no = Math.ceil(this.playlist.menu.length / 30);
			menu.newMenu({
				menuName: lg['Playlists'],
				separator: ppt.menuShowPlaylists == 2 || ppt.menuShowPlaylists && this.shift
			});
			for (let j = 0; j < pl_no; j++) {
				const n = '# ' + (j * 30 + 1 + ' - ' + Math.min(this.playlist.menu.length, 30 + j * 30) + (30 + j * 30 > plman.ActivePlaylist && ((j * 30) - 1) < plman.ActivePlaylist ? '  >>>' : ''));
				menu.newMenu({
					menuName: n,
					appendTo: lg['Playlists']
				});
				for (let i = j * 30; i < Math.min(this.playlist.menu.length, 30 + j * 30); i++) {
					menu.newItem({
						menuName: n,
						str: this.playlist.menu[i].name,
						func: () => this.setPlaylist(i),
						checkRadio: i == plman.ActivePlaylist
					});
				}
			}
		}

		if (ppt.menuShowTagger == 2 || ppt.menuShowTagger && this.shift) {
			menu.newMenu({
				menuName: lg['Tagger'],
				str: lg['Tagger'] + (this.handles.Count ? '' : lg[': N/A no playlist tracks selected']),
				flags: this.handles.Count ? MF_STRING : MF_GRAYED,
				separator: ppt.menuShowTagger == 2 || ppt.menuShowTagger && this.shift
			});
			for (let i = 0; i < 13 + 4; i++) menu.newItem({
				menuName: lg['Tagger'],
				str: this.getTaggerStr(i),
				func: () => cfg.setTag(i, this.handles),
				flags: !i || i == 13 + 1 && !this.tags ? MF_GRAYED : MF_STRING,
				checkItem: i && i < 13 + 1 && cfg[`tagEnabled${i - 1}`],
				separator: !i || i == 5 || i == 11 || i == 13
			});
		}

		if (ppt.menuShowMissingData == 2 || ppt.menuShowMissingData && this.shift) {
			menu.newMenu({
				menuName: lg['Missing data'],
				separator: ppt.menuShowMissingData == 2 || ppt.menuShowMissingData && this.shift
			});
			[lg['Album review [allmusic]'], lg['Album review [last.fm]'], lg['Album review [wikipedia]'], lg['Biography [allmusic]'], lg['Biography [last.fm]'], lg['Biography [wikipedia]'], lg['Photos [last.fm]']].forEach((v, i) => menu.newItem({
				menuName: lg['Missing data'],
				str: v,
				func: () => this.checkMissingData(i),
				separator: i == 2 || i == 5
			}));
		}

		if (ppt.menuShowInactivate == 2 || ppt.menuShowInactivate && this.shift) {
			menu.newItem({
				str: ppt.panelActive ? lg['Inactivate'] : lg['Activate biography'],
				func: () => panel.inactivate(),
				separator: true
			});
		}

		for (let i = 0; i < 2; i++) menu.newItem({
			str: [popUpBox.ok ? lg['Options...'] : lg['Options: see console'], lg['Configure...']][i],
			func: () => !i ? cfg.open('PanelCfg') : window.EditScript(),
			separator: !i && this.shift,
			hide: i && !this.shift
		});
	}

	checkMissingData(i) {
		switch (i) {
			case 0:
				this.missingRev('foAmRev', 'AllMusic', '专辑评论');
				break;
			case 1:
				this.missingRev('foLfmRev', 'Last.fm', '专辑评论');
				break;
			case 2:
				this.missingRev('foWikiRev', '维基百科', '专辑评论');
				break;
			case 3:
				this.missingBio('foAmBio', 'AllMusic', '简介');
				break;
			case 4:
				this.missingBio('foLfmBio', 'Last.fm', '简介');
				break;
			case 5:
				this.missingBio('foWikiBio', '维基百科', '简介');
				break;
			case 6:
				this.missingArtImg('foImgArt', 'Last.fm', '照片');
				break;
		}
	}

	fresh() {
		if (panel.block() || !ppt.cycItem || panel.zoom() || panel.id.lyricsSource && lyrics.display() && lyrics.scroll) return;
		if (ppt.artistView) {
			this.counter.bio++;
			if (this.counter.bio < ppt.cycTimeItem) return;
			this.counter.bio = 0;
			if (panel.art.list.length < 2) return;
			this.wheel(1, true, false);
		} else {
			this.counter.rev++;
			if (this.counter.rev < ppt.cycTimeItem) return;
			this.counter.rev = 0;
			if (panel.alb.list.length < 2) return;
			this.wheel(1, true, false);
		}
	}

	getBlacklistImageItems() {
		const imgInfo = img.pth();
		this.img.artist = imgInfo.artist;
		this.path.img = imgInfo.imgPth;
		this.img.isLfm = imgInfo.blk && this.path.img;
		this.img.name = this.img.isLfm ? this.path.img.slice(this.path.img.lastIndexOf('_') + 1) : this.path.img.slice(this.path.img.lastIndexOf('\\') + 1); // needed for init
		this.img.blacklist = [];
		this.path.blackList = `${cfg.storageFolder}blacklist_image.json`;

		if (!$.file(this.path.blackList)) $.save(this.path.blackList, JSON.stringify({
			'blacklist': {}
		}), true);

		if ($.file(this.path.blackList)) {
			this.img.artistClean = $.clean(this.img.artist).toLowerCase();
			this.img.list = $.jsonParse(this.path.blackList, false, 'file-utf8'); // Regorxxx <- Force UTF-8 ->
			this.img.blacklist = this.img.list.blacklist[this.img.artistClean] || [];
		}
	
		this.img.blacklistStr = [this.img.isLfm ? lg['+ Add'] + (!panel.style.showFilmStrip ? '' : lg[' main image']) + lg[' to black list: '] + this.img.artist + '_' + this.img.name : lg['+ Add to black list: '] + (this.img.name ? lg['N/A - requires last.fm photo. Selected image: '] + this.img.name : lg['N/A - no'] + (!panel.style.showFilmStrip ? '' : '') + lg[' image file']), this.img.blacklist.length ? lg[' - Remove from black list (click name): '] : lg['No black listed images for current artist'], lg['Undo']];
	}

	getDisplayStr() {
		const m = ppt.artistView ? ppt.bioMode : ppt.revMode;
		this.display.check = [ppt.sameStyle ? !ppt.img_only && !ppt.text_only : m == 0, ppt.sameStyle ? ppt.img_only : m == 1, ppt.sameStyle ? ppt.text_only : m == 2, ppt.showFilmStrip, ppt.heading, ppt.summaryShow, false, ppt.artistView, !ppt.artistView, !panel.id.focus, panel.id.focus];
		const n = [lg['Image+text'], lg['Image'], lg['Text'], lg['Filmstrip'], lg['Heading'], lg['Summary'], ppt.summaryCompact ? lg['Summary expand'] : lg['Summary compact'], lg['Artist view'], lg['Album view'], lg['Prefer nowplaying'], !panel.id.lyricsSource && !panel.id.nowplayingSource ? lg['Follow selected track (playlist)'] : lg['Follow selected track: N/A lyrics or nowplaying enabled']];
		const click = [!this.display.check[0] ? '\t' + lg['Middle click'] : '', !this.display.check[1] && !ppt.text_only && !ppt.img_only ? '\t' + lg['Middle click'] : '', !this.display.check[2] && !ppt.img_only ? '\t' + lg['Middle click'] : '', '\t' + lg['Alt+Middle click'], '', '', !ppt.sourceAll ? '\t' + lg['Click'] : '', !ppt.artistView ? (!ppt.dblClickToggle ? '\t' + lg['Click'] : '\t' + lg['Double click']) : '', ppt.artistView ? (!ppt.dblClickToggle ? '\t' + lg['Click'] : '\t' + lg['Double click']) : '', '', ''];
		this.display.str = n.map((v, i) => v + click[i])
	}

	getlookUpStr(i, j, artist) {
		return [
			[lg['Manual cycle: wheel over button'], lg['Auto cycle items'], popUpBox.ok ? lg['Options...'] : lg['Options: see console'], lg['Reload']][i],
			[lg['Show similar artists'], lg['Show more tags (circle button if present)'], lg['Auto lock'], lg['Last.fm: '] + artist + lg['...'], lg['Last.fm: '] + artist + lg[': similar artists...'], lg['Last.fm: '] + artist + lg[': top albums...'], lg['Allmusic: '] + artist + lg['...']][i],
			[lg['Show top albums'], lg['Auto lock'], lg['Last.fm: '] + artist + lg['...'], lg['Last.fm: '] + artist + lg[': similar artists...'], lg['Last.fm: '] + artist + lg[': top albums...'], lg['Allmusic: '] + artist + lg['...']][i]
		][j];
	}
	
	getOpenFlag() {
		return this.path.img || this.path.am[3] || this.path.lfm[3] || this.path.wiki[3] || this.path.txt[3] || this.path.tracksAm[3] || this.path.tracksLfm[3] || this.path.tracksWiki[3] ? MF_STRING : MF_GRAYED;
	}

	getOpenName() {
		const fo = [this.path.img, this.path.am[3], this.path.lfm[3], this.path.wiki[3], this.path.tracksAm[3], this.path.tracksLfm[3], this.path.tracksWiki[3], this.path.txt[3]];
		this.openName = [lg['Image '] + '\t' + lg['Alt+Click'], ppt.artistView ? lg['Biography [allmusic]'] : lg['Review [allmusic]'], ppt.artistView ? lg['Biography [last.fm]'] : lg['Review [last.fm]'], ppt.artistView ? lg['Biography [wikipedia]'] : lg['Review [wikipedia]'], ppt.artistView ? '' : lg['Tracks [allmusic]'], ppt.artistView ? '' : lg['Tracks [last.fm]'], ppt.artistView ? '' : lg['Tracks [wikipedia]'], ppt.artistView ? txt.bio.subhead.txt[0] : txt.rev.subhead.txt[0]];
		let i = this.openName.length;
		while (i--)
			if (!fo[i]) {
				this.openName.splice(i, 1);
				fo.splice(i, 1);
				this.path.open.splice(i, 1);
			}
	}

	getSourceNames() {
		const b = ppt.artistView ? 'Bio' : 'Rev';
		const n = b.toLowerCase();
		this.types = !txt[n].reader ? $.source.amLfmWiki : $.source.amLfmWikiTxt;
		this.sources = [lg['Allmusic'], lg['Last.fm'], lg['Wikipedia']];
		this.sources = this.sources.map(v => v + (ppt.artistView ? ' 简介' : ' 评论'));
		if (txt[n].reader) this.sources.push(txt[n].subhead.txt[0] || '');
		if (!panel.stndItem() && (txt.reader[n].lyrics || txt.reader[n].props)) this.sources[3] += ' // 当前音轨';
	}

	getTaggerStr(i) {
		return !i ? lg['Write existing file info to tags: '] : i == 13 + 1 ? lg['All tagger settings...'] : i == 13 + 2 ? (cfg.taggerConfirm ? lg['Tag files...'] : `${lg['Tag']} ${this.handles.Count} ${this.handles.Count > 1 ? lg['tracks'] : lg['track']}...`) + (this.tags ? '' : lg[' N/A no tags enabled']) + (cfg.tagEnabled5 || cfg.tagEnabled7 ? tag.genres.length > 700 || !cfg.useWhitelist ? '' : lg[' WARNING: last.fm genre whitelist not found or invalid [try force update - needs internet connection]'] : '') : i == 13 + 3 ? lg['Cancel'] : i == 11 ? cfg[`tagName${i - 1}`] + (cfg[`tagEnabled${i - 1}`] ? ' (' + cfg[`tagEnabled${i + 2}`] + ')' : '') : cfg[`tagName${i - 1}`];
	}

	images(v) {
		return name.isLfmImg(fso.GetFileName(v));
	}

	isRevAvail() {
		const type = ['alb', 'trk'];
		type.forEach(w => {
			this[`${w}Avail`] = $.source.amLfmWiki.some(v => {
				return ppt.lockBio ? txt.rev.loaded.ix == txt.avail[`${v}${w}`] : txt.avail[`${v}${w}`] != -1;
			});
		});
	}

	lookUpAlbum(i) {
		const origArr = JSON.stringify(panel.alb.list);
		switch (true) {
			case i < panel.alb.list.length: {
				if (origArr != JSON.stringify(panel.alb.list) || !i && !panel.alb.ix || panel.alb.ix == i) break;
				filmStrip.logScrollPos();
				panel.alb.ix = i;
				img.get = false;
				txt.get = 0;
				let force = false;
				if (ppt.sourcerev == 3) {
					ppt.sourcerev = 0;
					this.setSource('Rev');
				}
				panel.style.inclTrackRev = ppt.inclTrackRev;
				if (ppt.inclTrackRev) {
					if (i) panel.style.inclTrackRev = 0;
					txt.albumFlush();
					force = true;
				}
				if (panel.alb.list[panel.alb.ix].composition && ppt.sourcerev != 0 && ppt.sourcerev != 2) {
					ppt.sourcerev = txt.rev.am ? 0 : txt.rev.wiki ? 2 : txt.rev.am;
					this.setSource('Rev');
				}
				txt.getItem(false, panel.art.ix, panel.alb.ix, force);
				txt.getScrollPos();
				img.getItem(panel.art.ix, panel.alb.ix);
				panel.callServer(false, panel.id.focus, 'bio_lookUpItem', 0);
				filmStrip.check();
				if (ppt.autoLock) panel.mbtn_up(1, 1, true);
				panel.getList();
				break;
			}
			case i == panel.alb.list.length + 1:
				ppt.toggle('cycItem');
				break;
			case i == panel.alb.list.length + 2:
				cfg.open('PanelCfg');
				break;
			case i == panel.alb.list.length + 3:
				window.Reload();
				break;
		}
		this.counter.rev = 0;
	}

	lookUpAlbumItems(i) {
		switch (i) {
			case 0:
				panel.alb.ix = 0;
				ppt.toggle('showTopAlbums');
				panel.getList(!ppt.showTopAlbums ? true : false, true);
				break;
			case 1:
				ppt.toggle('autoLock');
				break;
			default: {
				const artist = panel.art.list.length ? panel.art.list[0].name : name.artist(panel.id.focus);
				const brArr = ['', '/+similar', '/+albums'];
				if (i < 5) $.browser('https://www.last.fm/' + (cfg.language == 'EN' ? '' : cfg.language.toLowerCase() + '/') + 'music/' + encodeURIComponent(artist) + brArr[i - 4], true);
				else $.browser('https://www.allmusic.com/search/artists/' + encodeURIComponent(artist), true);
				break;
			}
		}
		if (i < 2) {
			img.get = false;
			txt.get = 0;
			if (ppt.sourcerev == 3) {
				ppt.sourcerev = 0;
				this.setSource('Rev');
			}
			panel.style.inclTrackRev = ppt.inclTrackRev;
			if (ppt.inclTrackRev) {
				txt.albumFlush();
			}
			txt.getItem(false, panel.art.ix, panel.alb.ix, true);
			txt.getScrollPos();
			img.getItem(panel.art.ix, panel.alb.ix);
			panel.callServer(false, panel.id.focus, 'bio_lookUpItem', 0);
			filmStrip.check();
		}
	}

	lookUpArtist(i) {
		const origArr = JSON.stringify(panel.art.list);
		switch (true) {
			case i < panel.art.list.length:
				if (origArr != JSON.stringify(panel.art.list) || !i && !panel.art.ix || panel.art.ix == i) break;
				filmStrip.logScrollPos();
				panel.art.ix = i;
				img.get = false;
				txt.get = 0;
				if (ppt.sourcebio == 3) {
					ppt.sourcebio = 1;
					this.setSource('Bio');
				}
				txt.getItem(false, panel.art.ix, panel.alb.ix);
				txt.getScrollPos();
				img.getItem(panel.art.ix, panel.alb.ix);
				panel.callServer(false, panel.id.focus, 'bio_lookUpItem', 0);
				filmStrip.check();
				if (ppt.autoLock) panel.mbtn_up(1, 1, true);
				panel.getList();
				break;
			case i == panel.art.list.length + 1:
				ppt.toggle('cycItem');
				break;
			case i == panel.art.list.length + 2:
				cfg.open('PanelCfg');
				break;
			case i == panel.art.list.length + 3:
				window.Reload();
				break;
		}
		this.counter.bio = 0;
	}

	lookUpArtistItems(i) {
		switch (i) {
			case 0:
				panel.art.ix = 0;
				ppt.toggle('showSimilarArtists');
				panel.getList(!ppt.showSimilarArtists ? true : false);
				break;
			case 1:
				panel.art.ix = 0;
				ppt.toggle('showMoreTags');
				panel.getList(!ppt.showMoreTags ? true : false);
				break;
			case 2:
				ppt.toggle('autoLock');
				break;
			default: {
				const artist = panel.art.list.length ? panel.art.list[0].name : name.artist(panel.id.focus);
				const brArr = ['', '/+similar', '/+albums'];
				if (i < 6) $.browser('https://www.last.fm/' + (cfg.language == 'EN' ? '' : cfg.language.toLowerCase() + '/') + 'music/' + encodeURIComponent(artist) + brArr[i - 5], true);
				else $.browser('https://www.allmusic.com/search/artists/' + encodeURIComponent(artist), true);
				break;
			}
		}
		if (i < 3) {
			filmStrip.logScrollPos();
			if (ppt.sourcebio == 3) {
				ppt.sourcebio = 1;
				this.setSource('Bio');
			}
			img.get = false;
			txt.get = 0;
			txt.getItem(false, panel.art.ix, panel.alb.ix);
			txt.getScrollPos();
			img.getItem(panel.art.ix, panel.alb.ix);
			panel.callServer(false, panel.id.focus, 'bio_lookUpItem', 0);
			filmStrip.check();
		}
	}

	missingArtImg(n1, n2, n3) {
		const continue_confirmation = (status, confirmed) => {
			if (confirmed) {
				const handleList = fb.GetLibraryItems();
				if (!handleList) return;
				const tf_a = FbTitleFormat(cfg.tf.artist);
				const sort = FbTitleFormat(cfg.tf.artist + ' | ' + cfg.tf.album + ' | [[%discnumber%.]%tracknumber%. ][%track artist% - ]' + cfg.tf.title);
				let a = '';
				let cur_a = '####';
				let found = false;
				let m = new FbMetadbHandleList();
				handleList.OrderByFormat(sort, 1);
				const artists = tf_a.EvalWithMetadbs(handleList);
				handleList.Convert().forEach((h, i) => {
					a = artists[i].toLowerCase();
					if (a != cur_a) {
						cur_a = a;
						const pth = panel.cleanPth(cfg.pth[n1], h, 'tag');
						let files = utils.Glob(pth + '*');
						files = files.some(this.images);
						if (a && !files) {
							found = false;
							m.Insert(m.Count, h);
						} else found = true;
					} else if (!found) m.Insert(m.Count, h);
				});
				this.sendToPlaylist(m, n2, n3);
			}
		}
		const caption = this.popUpTitle;
		const prompt = this.popUpText(n2, n3);
		const wsh = popUpBox.isHtmlDialogSupported() ? popUpBox.confirm(caption, prompt, '确定', '取消', '', '', continue_confirmation) : true;
		if (wsh) continue_confirmation('ok', $.wshPopup(prompt, caption));
	}

	missingBio(n1, n2, n3) {
		const continue_confirmation = (status, confirmed) => {
			if (confirmed) {
				const handleList = fb.GetLibraryItems();
				if (!handleList) return;
				const tf_a = FbTitleFormat(cfg.tf.artist);
				const sort = FbTitleFormat(cfg.tf.artist + ' | ' + cfg.tf.album + ' | [[%discnumber%.]%tracknumber%. ][%track artist% - ]' + cfg.tf.title);
				let a = '';
				let cur_a = '####';
				let found = false;
				let m = new FbMetadbHandleList();
				handleList.OrderByFormat(sort, 1);
				const artists = tf_a.EvalWithMetadbs(handleList);
				handleList.Convert().forEach((h, i) => {
					a = artists[i].toLowerCase();
					if (a != cur_a) {
						cur_a = a;
						const pth = panel.cleanPth(cfg.pth[n1], h, 'tag') + $.clean(a) + cfg.suffix[n1] + '.txt';
						if (a && !$.file(pth)) {
							found = false;
							m.Insert(m.Count, h);
						} else found = true;
					} else if (!found) m.Insert(m.Count, h);
				});
				this.sendToPlaylist(m, n2, n3);
			}
		}
		const caption = this.popUpTitle;
		const prompt = this.popUpText(n2, n3);
		const wsh = popUpBox.isHtmlDialogSupported() ? popUpBox.confirm(caption, prompt, '确定', '取消', '', '', continue_confirmation) : true;
		if (wsh) continue_confirmation('ok', $.wshPopup(prompt, caption));
	}

	missingRev(n1, n2, n3) {
		const continue_confirmation = (status, confirmed) => {
			if (confirmed) {
				const handleList = fb.GetLibraryItems();
				if (!handleList) return;
				const tf_albumArtist = FbTitleFormat(cfg.tf.albumArtist);
				const tf_album = FbTitleFormat(cfg.tf.album);
				const sort = FbTitleFormat(cfg.tf.albumArtist + ' | ' + cfg.tf.album + ' | [[%discnumber%.]%tracknumber%. ][%track artist% - ]' + cfg.tf.title);
				let albumArtist = '';
				let cur_albumArtist = '####';
				let cur_album = '####';
				let album = '';
				let found = false;
				let m = new FbMetadbHandleList();
				handleList.OrderByFormat(sort, 1);
				const albumartists = tf_albumArtist.EvalWithMetadbs(handleList);
				const albums = tf_album.EvalWithMetadbs(handleList);
				handleList.Convert().forEach((h, i) => {
					albumArtist = albumartists[i].toLowerCase();
					album = albums[i].toLowerCase();
					album = !cfg.albStrip ? name.albumTidy(album) : name.albumClean(album);
					if (albumArtist + album != cur_albumArtist + cur_album) {
						cur_albumArtist = albumArtist;
						cur_album = album;
						let pth = panel.cleanPth(cfg.pth[n1], h, 'tag') + $.clean(albumArtist) + ' - ' + $.clean(album) + cfg.suffix[n1] + '.txt';
						if (pth.length > 259) {
							album = $.abbreviate(album);
							pth = panel.cleanPth(cfg.pth[n1], h, 'tag') + $.clean(albumArtist) + ' - ' + $.clean(album) + cfg.suffix[n1] + '.txt';
						}
						if (albumArtist && album && !$.file(pth)) {
							found = false;
							m.Insert(m.Count, h);
						} else found = true;
					} else if (!found) m.Insert(m.Count, h);
				});
				this.sendToPlaylist(m, n2, n3);
			}
		}
		const caption = this.popUpTitle;
		const prompt = this.popUpText(n2, n3);
		const wsh = popUpBox.isHtmlDialogSupported() ? popUpBox.confirm(caption, prompt, '确定', '取消', '', '', continue_confirmation) : true;
		if (wsh) continue_confirmation('ok', $.wshPopup(prompt, caption));
	}

	playlists_changed() {
		if (!ppt.menuShowPlaylists) return;
		this.playlist.menu = [];
		for (let i = 0; i < plman.PlaylistCount; i++) this.playlist.menu.push({
			name: plman.GetPlaylistName(i).replace(/&/g, '&&'),
			ix: i
		});
	}

	popUpText(n2, n3) {
		return `检查媒体库并创建播放列表：${n2} ${n3} 丢失\n\n将使用服务器设置。\n\n提示：此操作会分析大量数据。它可能会触发“无响应脚本”弹出窗口。如果发生这种情况，请选择“继续”或“不要再问我”。选择“停止脚本”将触发错误。\n\n继续？`;
	}

	rbtn_up(x, y) {
		this.right_up = true;
		this.shift = vk.k('shift');
		const imgInfo = img.pth();
		this.docTxt = $.getClipboardData() || '';
		if (!tag.genres.length) tag.setGenres();
		this.getDisplayStr();
		this.getSourceNames();
		this.img.artist = imgInfo.artist;
		this.path.img = imgInfo.imgPth;
		this.img.isLfm = imgInfo.blk && this.path.img;
		this.img.name = this.img.isLfm ? this.path.img.slice(this.path.img.lastIndexOf('_') + 1) : this.path.img.slice(this.path.img.lastIndexOf('\\') + 1);
		this.isRevAvail();
		this.path.am = ppt.artistView ? txt.bioPth('Am') : txt.revPth('Am');
		this.path.lfm = ppt.artistView ? txt.bioPth('Lfm') : txt.revPth('Lfm');
		this.path.txt = ppt.artistView ? txt.txtBioPth() : txt.txtRevPth();
		this.path.wiki = ppt.artistView ? txt.bioPth('Wiki') : txt.revPth('Wiki');
		this.path.tracksAm = ppt.artistView ? '' : txt.trackPth('Am');
		this.path.tracksLfm = ppt.artistView ? '' : txt.trackPth('Lfm');
		this.path.tracksWiki = ppt.artistView ? '' : txt.trackPth('Wiki');
		this.path.open = [this.path.img, this.path.am[1], this.path.lfm[1], this.path.wiki[1], this.path.tracksAm[1], this.path.tracksLfm[1], this.path.tracksWiki[1], this.path.txt[1]];
		this.getOpenName();
		this.getBlacklistImageItems();
		if (ppt.menuShowTagger == 2 || ppt.menuShowTagger && this.shift) this.handles = plman.GetPlaylistSelectedItems(plman.ActivePlaylist);
		this.tagsEnabled();

		menu.load(x, y);
		this.right_up = false;
	}

	sendToPlaylist(m, n2, n3) {
		if (m.Count) {
			const pln = plman.FindOrCreatePlaylist(`${n2} ${n3} 丢失`, false);
			plman.ActivePlaylist = pln;
			plman.ClearPlaylist(pln);
			plman.InsertPlaylistItems(pln, 0, m);
		} else fb.ShowPopupMessage(`${n2} ${n3}：未丢失`, '简介');
	}

	setCover(i) {
		switch (true) {
			case i < 5:
				!ppt.loadCovAllFb ? ppt.covType = i : img.cov.selection[i] = img.cov.selection[i] == -1 ? i : -1;
				img.cov.selFiltered = img.cov.selection.filter(v => v != -1);
				if (!img.cov.selFiltered.length) {
					img.cov.selection = [0, -1, -1, -1, -1];
					img.cov.selFiltered = [0];
				}
				ppt.loadCovSelFb = JSON.stringify(img.cov.selection);
				!ppt.loadCovAllFb ? img.getImages() : img.check();
				break;
			case i == 5:
				img.toggle('loadCovAllFb');
				break;
			case i == 6:
				img.toggle('loadCovFolder');
				break;
		}
	}

	setDisplay(i) {
		switch (i) {
			case 0:
			case 1:
			case 2:
				if (ppt.sameStyle) panel.mode(i);
				else {
					ppt.artistView ? ppt.bioMode = i : ppt.revMode = i;
					txt.refresh(0);
				}
				break;
			case 3:
				filmStrip.mbtn_up('onOff');
				break;
			case 4:
				txt.bio.scrollPos = {}; txt.rev.scrollPos = {};
				ppt.heading = !ppt.heading ? 1 : 0;
				panel.style.fullWidthHeading = ppt.heading && ppt.fullWidthHeading;
				txt.refresh(1);
				break;
			case 5:
			case 6:
				txt.bio.scrollPos = {}; txt.rev.scrollPos = {};
				ppt.toggle(i == 5 ? 'summaryShow' : 'summaryCompact');
				panel.setSummary();
				txt.refresh(1);
				break;
			case 7:
			case 8:
				panel.click('', '', true);
				break;
			case 9:
			case 10:
				ppt.toggle('focus');
				panel.id.focus = ppt.focus;
				panel.changed();
				txt.on_playback_new_track();
				img.on_playback_new_track();
				break;
		}
	}

	setImageAlignnment(i, type) {
		switch(type) {
			case 'standard':
				switch (i) {
					case 3:
						ppt.toggle('textAlign');
						panel.setStyle();
						img.clearCache();
						img.getImages();
						break;
					default:
						if (ppt.style == 0 || ppt.style == 2) ppt.alignH = i;
						else ppt.alignV = i;
						img.clearCache();
						img.getImages();
						break;
				}
				break;
			case 'horizontal':
				ppt.alignH = i;
				img.clearCache();
				img.getImages();
				break;
			case 'vertical':
				switch (i) {
					case 3:
						ppt.alignAuto = true;
						panel.setStyle();
						img.clearCache();
						img.getImages();
						break;
					default:
						ppt.alignV = i;
						ppt.alignAuto = false;
						panel.setStyle();
						img.clearCache();
						img.getImages();
						break;
					}
					break;
		}
	}

	setImageBlacklist(i) {
		if (!i) {
			if (!this.img.list.blacklist[this.img.artistClean]) this.img.list.blacklist[this.img.artistClean] = [];
			this.img.list.blacklist[this.img.artistClean].push(this.img.name);
		} else if (img.blackList.undo[0] == this.img.artistClean && i == 2) {
			if (!this.img.list.blacklist[img.blackList.undo[0]]) this.img.list.blacklist[this.img.artistClean] = [];
			if (img.blackList.undo[1].length) this.img.list.blacklist[img.blackList.undo[0]].push(img.blackList.undo[1]);
			img.blackList.undo = [];
		} else {
			const bl_ind = i - (img.blackList.undo[0] == this.img.artistClean ? 3 : 2);
			img.blackList.undo = [this.img.artistClean, this.img.list.blacklist[this.img.artistClean][bl_ind]];
			this.img.list.blacklist[this.img.artistClean].splice(bl_ind, 1);
			$.removeNulls(this.img.list);
		}
		let bl = this.img.list.blacklist[this.img.artistClean];
		if (bl) this.img.list.blacklist[this.img.artistClean] = this.sort([...new Set(bl)]);
		img.blackList.artist = '';
		$.save(this.path.blackList, JSON.stringify({
			'blacklist': $.sortKeys(this.img.list.blacklist)
		}, null, 3), true);
		img.check();
		window.NotifyOthers('bio_blacklist', 'bio_blacklist');
	}

	setPaste(i) {
		switch (i) {
			case 0: case 1: case 2: {
				const n = ppt.artistView ? 'bio' : 'rev';
				const s = $.source.amLfmWiki[i];
				this.undo.folder = this.path[s][0];
				this.undo.path = this.path[s][1];
				this.undo.text = $.open(this.undo.path);
				$.buildPth(this.undo.folder);
				$.save(this.undo.path, this.docTxt + '\r\n\r\n自定义 ' + (ppt.artistView ? '简介' : '评论'), true);
				const b = ppt.artistView ? 'Bio' : 'Rev';
				const pth = txt[`${n}Pth`](['Am', 'Lfm', 'Wiki'][i]);
				if (this.path[s][1] == pth[1]) {
					ppt[`source${b}`] = 0;
					txt[n].source[s] = true;
				}
				window.NotifyOthers('bio_getText', 'bio_getText');
				txt.grab();
				if (ppt.text_only) txt.paint();
				break;
			}
			case 3: {
				const open = (c, w) => {
					if (!$.run(c, w)) fb.ShowPopupMessage('无法启动默认文本编辑器。', '简介');
				};
				open('"' + this.undo.path, 1);
				break;
			}
			case 4:
				if (!this.undo.text.length && $.file(this.undo.path)) {
					fso.DeleteFile(this.undo.path);
					window.NotifyOthers('bio_reload', 'bio_reload');
					if (panel.stndItem()) window.Reload();
					else {
						txt.artistFlush();
						txt.albumFlush();
						txt.grab();
						if (ppt.text_only) txt.paint();
					}
					break;
				}
				$.buildPth(this.undo.folder);
				$.save(this.undo.path, this.undo.text, true);
				this.undo.text = '#!#';
				window.NotifyOthers('bio_getText', 'bio_getText');
				txt.grab();
				if (ppt.text_only) txt.paint();
				break;
		}

	}

	setPhotoType(i) {
		ppt.cycPhoto = i < 2;
		ppt.cycPhotoLocation = i;
		if (i == 1 && !ppt.get('SYSTEM.Photo Folder Checked', false)) {
			fb.ShowPopupMessage('在选项中输入文件夹：服务器设置（所有面板）>照片>自定义加载文件夹。', '简介：用于照片循环的自定义文件夹');
			ppt.set('SYSTEM.Photo Folder Checked', true);
		}
		img.updImages();
	}

	setPlaylist(i) {
		plman.ActivePlaylist = this.playlist.menu[i].ix;
	}

	setReviewType(i) {
		panel.style.inclTrackRev = ppt.inclTrackRev = [0, 2, 1][i];
		if (ppt.inclTrackRev) server.checkTrack({
			focus: panel.id.focus,
			force: false,
			menu: true,
			artist: panel.art.list.length ? panel.art.list[0].name : name.artist(panel.id.focus),
			title: name.title(panel.id.focus)
		});
		txt.refresh(1);
		txt.getScrollPos();
	}

	setSource(b, n) {
		n = n || b.toLowerCase();
		$.source.amLfmWikiTxt.forEach((v, i) => txt[n].source[v] = ppt[`source${n}`] == i);
		$.source.amLfmWiki.forEach(v => {if (txt[n].source[v]) txt.done[`${v}${b}`] = false});
		txt[n].source.ix = ppt[`source${n}`];
	}

	setStyle(i) {
		const prop = ppt.sameStyle ? 'style' : ppt.artistView ? 'bioStyle' : 'revStyle';
		ppt[prop] = i;
		img.mask.reset = true;
		ppt.img_only = false; ppt.text_only = false; 
		txt.refresh(0);
		if (ppt.filmStripOverlay && ppt.showFilmStrip) filmStrip.set(ppt.filmStripPos);
	}

	setStyles(i) {
		switch (i) {
			case 0:
				panel.createStyle();
				break;
			case 1:
				panel.renameStyle(ppt.style);
				break;
			case 2:
				panel.deleteStyle(ppt.style);
				break;
			case 3:
				panel.exportStyle(ppt.style);
				break;
			case 4:
				panel.resetStyle(ppt.style);
				break;
		}
	}

	setTextType(i, b) {
		switch (i) {
			case 0:
			case 1: this.toggle(4, b); break;
			case 2: txt.bio.scrollPos = {}; txt.rev.scrollPos = {}; ppt.toggle('sourceAll'); txt.refresh(1); break;
			case 3:
				ppt.toggle('showTrackRevOptions');
				panel.style.inclTrackRev = ppt.inclTrackRev = 0;
				if (ppt.showTrackRevOptions) server.checkTrack({
					focus: panel.id.focus,
					force: false,
					menu: true,
					artist: panel.art.list.length ? panel.art.list[0].name : name.artist(panel.id.focus),
					title: name.title(panel.id.focus)
				});
				txt.refresh(1);
				txt.getScrollPos();
				break;
			case 4: ppt.toggle('classicalMusicMode'); ppt.classicalAlbFallback = ppt.classicalMusicMode; txt.refresh(1); break;
		}
	}

	sort(data) {
		return data.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
	}

	tagsEnabled() {
		this.tags = false;
		for (let i = 0; i < 13; i++)
			if (cfg[`tagEnabled${i}`]) {
				this.tags = true;
				break;
			}
	}

	toggle(i, b, fix, direction) {
		const n = b.toLowerCase();
		if (i === ppt[`source${n}`]) return;
		if (i == 4) {
			ppt.toggle('lockBio');
		} else {
		if (i === '') i = ppt[`source${n}`];
			if (fix) {
				ppt[`source${n}`] = i;
			} else if (ppt.lockBio && !ppt.sourceAll) {
				const limit = txt[n].reader ? 3 : 2;
				direction == 1 ? ppt[`source${n}`] = i == limit ? 0 : ++i : ppt[`source${n}`] = i == 0 ? limit : --i;
			} else {
				if (txt[n].reader) {
					switch (txt[n].loaded.ix) {
						case 0: ppt[`source${n}`] = direction == 1 ? (txt[n].lfm ? 1 : txt[n].wiki ? 2 : txt[n].txt ? 3 : 0) : (txt[n].txt ? 3 : txt[n].wiki ? 2 : txt[n].lfm ? 1 : 0); break;
						case 1: ppt[`source${n}`] = direction == 1 ? (txt[n].wiki ? 2 : txt[n].txt ? 3 : txt[n].am ? 0 : 1) : (txt[n].am ? 0 : txt[n].txt ? 3 : txt[n].wiki ? 2 : 1); break;
						case 2: ppt[`source${n}`] = direction == 1 ? (txt[n].txt ? 3 : txt[n].am ? 0 : txt[n].lfm ? 1 : 2) : (txt[n].lfm ? 1 : txt[n].am ? 0 : txt[n].txt ? 3 : 2); break;
						case 3: ppt[`source${n}`] = direction == 1 ? (txt[n].am ? 0 : txt[n].lfm ? 1 : txt[n].wiki ? 2 : 3) : (txt[n].wiki ? 2 : txt[n].lfm ? 1 : txt[n].am ? 0 : 3); break;
						}
				} else {
					switch (txt[n].loaded.ix) {
						case 0: ppt[`source${n}`] = direction == 1 ? (txt[n].lfm ? 1 : txt[n].wiki ? 2 : 0) : (txt[n].wiki ? 2 : txt[n].lfm ? 1 : 0); break;
						case 1: ppt[`source${n}`] = direction == 1 ? (txt[n].wiki ? 2 : txt[n].am ? 0 : 1) : (txt[n].am ? 0 : txt[n].wiki ? 2 : 1); break;
						case 2: ppt[`source${n}`] = direction == 1 ? (txt[n].am ? 0 : txt[n].lfm ? 1 : 2) : (txt[n].lfm ? 1 : txt[n].am ? 0 : 2); break;
					}
				}
			}
		}
		this.setSource(b, n);
		txt.getText(false);
		but.src.y = but.src.fontSize < 12 || txt[n].loaded.ix == 2 ? 1 : 0;
		txt.getScrollPos();
		img.getImages();
	}

	wheel(step, resetCounters) {
		let i = 0;
		but.clearTooltip();
		let force = false;
		switch (true) {
			case ppt.artistView:
				if (!panel.art.uniq.length) break;
				for (i = 0; i < panel.art.uniq.length; i++)
					if (!panel.art.ix && name.artist(panel.id.focus) == panel.art.uniq[i].name || panel.art.ix == panel.art.uniq[i].ix) break;
				i += step;
				if (i < 0) i = panel.art.uniq.length - 1;
				else if (i >= panel.art.uniq.length) i = 0;
				filmStrip.logScrollPos();
				if (ppt.sourcebio == 3) {
					ppt.sourcebio = 1;
					this.setSource('Bio');
				}
				panel.art.ix = panel.art.uniq[i].ix;
				panel.getList();
				break;
			case !ppt.artistView:
				if (!panel.alb.uniq.length) break;
				for (i = 0; i < panel.alb.uniq.length; i++)
					if (!panel.alb.ix && name.albumArtist(panel.id.focus) + ' - ' + name.album(panel.id.focus) == panel.alb.uniq[i].artist + ' - ' + panel.alb.uniq[i].album || panel.alb.ix == panel.alb.uniq[i].ix) break;
				i += step;
				if (i < 0) i = panel.alb.uniq.length - 1;
				else if (i >= panel.alb.uniq.length) i = 0;
				filmStrip.logScrollPos();
				if (ppt.sourcerev == 3) {
					ppt.sourcerev = 0;
					this.setSource('Rev');
				}
				panel.alb.ix = panel.alb.uniq[i].ix;
				if (panel.alb.ix) seeker.show = false;
				panel.getList();
				break;
		}
		img.get = false;
		txt.getItem(false, panel.art.ix, panel.alb.ix, force);
		txt.getScrollPos();
		img.getItem(panel.art.ix, panel.alb.ix);
		panel.lookUpServer();
		if (resetCounters) ppt.artistView ? this.counter.bio = 0 : this.counter.rev = 0;
		filmStrip.check();
	}
}