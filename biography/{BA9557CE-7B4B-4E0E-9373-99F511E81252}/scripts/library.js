'use strict';

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